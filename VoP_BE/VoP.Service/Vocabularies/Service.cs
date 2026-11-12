using Microsoft.EntityFrameworkCore;
using VoP.Repository;
using VoP.Repository.Entities;
using VoP.Service.Common;

namespace VoP.Service.Vocabularies;

public sealed class Service(AppDbContext db) : IService
{
    private IQueryable<Vocabulary> Query => db.Vocabularies
        .Include(v => v.LearningProgress)
        .Include(v => v.VocabularyMeanings)
        .ThenInclude(m => m.VocabularyExamples)
        .Where(v => v.DeletedAt == null);

    public async Task<Page<VocabularyResponse>> List(string? search, int page, int pageSize, CancellationToken ct, int? level = null, bool dueOnly = false, string sort = "recent")
    {
        Rules.Paging(page, pageSize);
        Rules.Require(level == null || level is >= 0 and <= 5, "Level must be 0..5.");
        Rules.Require(sort is "recent" or "alpha" or "level", "Sort must be recent, alpha or level.");
        var query = Query.AsNoTracking();
        if (level != null)
        {
            query = query.Where(v => (v.LearningProgress == null ? 0 : v.LearningProgress.Level) == level);
        }
        if (dueOnly)
        {
            var now = DateTimeOffset.UtcNow;
            query = query.Where(v => v.LearningProgress != null
                && !v.LearningProgress.IsSuspended
                && v.LearningProgress.NextReviewAt <= now);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = Rules.Normalize(search);
            query = query
                .Where(v => v.NormalizedTerm.Contains(term) || v.VocabularyMeanings.Any(m => m.MeaningVi.ToLower().Contains(term)));
        }
        var total = await query.CountAsync(ct);
        var ordered = sort switch
        {
            "alpha" => query.OrderBy(v => v.NormalizedTerm).ThenBy(v => v.Id),
            "level" => query.OrderBy(v => v.LearningProgress == null ? 0 : v.LearningProgress.Level).ThenBy(v => v.NormalizedTerm).ThenBy(v => v.Id),
            _ => query.OrderByDescending(v => v.CreatedAt).ThenBy(v => v.Id)
        };
        return new((await ordered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct))
            .Select(VocabularyResponse.From)
            .ToArray(),
             page,
             pageSize,
             total);
    }

    private async Task<Vocabulary> Find(Guid id, CancellationToken ct) => await Query.SingleOrDefaultAsync(v => v.Id == id, ct) ?? throw new ApiException(404,
         "Vocabulary not found.");

    public async Task<VocabularyResponse> Get(Guid id, CancellationToken ct) => VocabularyResponse.From(await Find(id, ct));
    private static void Audio(string? url) => Rules.Require(url == null || (Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme is "http" or "https"),
         "audioUrl must be an absolute HTTP(S) URL.");

    public async Task<VocabularyResponse> Save(Guid? id, VocabularyRequest request, CancellationToken ct)
    {
        Rules.Require(!string.IsNullOrWhiteSpace(request.Term) && request.Meanings.Count > 0,
             "Term and at least one meaning are required.");
        Rules.Require(request.Meanings.All(m => m != null && m.Examples.All(e => e != null)),
             "Meanings and examples cannot contain null items.");
        Audio(request.AudioUrl);
        Rules.Require(request.Meanings
            .Select(m => m.Id)
            .Where(x => x != null)
            .Distinct().Count() == request.Meanings.Count(m => m.Id != null),
             "Duplicate meaning IDs.");
        await using var tx = await LearningMutation.Lock(db, ct);
        var v = id.HasValue ? await Find(id.Value, ct) : new Vocabulary
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow,
            LearningProgress = new LearningProgress()
        };
        var normalized = Rules.Normalize(request.Term);
        Rules.Require(normalized.Length is > 0 and <= 255, "Normalized term must be 1..255 characters.");
        Rules.Require(!await db.Vocabularies.AnyAsync(x => x.NormalizedTerm == normalized && x.Id != v.Id, ct),
             "Term already exists (including archived vocabulary).",
             409);
        if (!id.HasValue) db.Vocabularies.Add(v);
        v.Term = request.Term.Trim();
        v.NormalizedTerm = normalized;
        v.Ipa = request.Ipa;
        v.AudioUrl = request.AudioUrl;
        v.UpdatedAt = DateTimeOffset.UtcNow;
        // Free unique display-order slots before reordering retained meanings.
        foreach (var m in v.VocabularyMeanings) m.DisplayOrder = -m.DisplayOrder;
        await db.SaveChangesAsync(ct);
        var keep = request.Meanings.Where(m => m.Id.HasValue).Select(m => m.Id!.Value).ToHashSet();
        foreach (var m in v.VocabularyMeanings.Where(m => !keep.Contains(m.Id)).ToList())
        {
            db.VocabularyExamples.RemoveRange(m.VocabularyExamples);
            db.VocabularyMeanings.Remove(m);
            v.VocabularyMeanings.Remove(m);
        }
        for (var i = 0; i < request.Meanings.Count; i++)
        {
            var input = request.Meanings[i];
            Rules.Require(!string.IsNullOrWhiteSpace(input.MeaningVi), "Meaning is required.");
            var m = input.Id.HasValue ? v.VocabularyMeanings.SingleOrDefault(m => m.Id == input.Id) ?? throw new ApiException(400,
                 "Meaning does not belong to vocabulary.") : new VocabularyMeaning
                 {
                     Id = Guid.NewGuid(),
                     CreatedAt = DateTimeOffset.UtcNow
                 };
            if (!input.Id.HasValue)
            {
                v.VocabularyMeanings.Add(m);
                db.VocabularyMeanings.Add(m);
            }
            m.MeaningVi = input.MeaningVi.Trim();
            m.PartOfSpeech = input.PartOfSpeech;
            m.IpaOverride = input.IpaOverride;
            m.DisplayOrder = i + 1;
            m.UpdatedAt = DateTimeOffset.UtcNow;
            Rules.Require(input.Examples
                .Where(e => e.Id.HasValue)
                .Select(e => e.Id)
                .Distinct().Count() == input.Examples.Count(e => e.Id.HasValue),
                 "Duplicate example IDs.");
            foreach (var e in m.VocabularyExamples.Where(e => !input.Examples.Any(x => x.Id == e.Id)).ToList())
            {
                db.VocabularyExamples.Remove(e);
                m.VocabularyExamples.Remove(e);
            }
            foreach (var item in input.Examples)
            {
                Rules.Require(!string.IsNullOrWhiteSpace(item.SentenceEn), "Example sentence is required.");
                Rules.Require((string.IsNullOrWhiteSpace(item.ClozeSentenceEn) && string.IsNullOrWhiteSpace(item.ClozeAnswer)) || (!string.IsNullOrWhiteSpace(item.ClozeAnswer) && item.ClozeSentenceEn?.Contains("________") == true),
                     "Cloze requires a sentence with ________ and answer.");
                var e = item.Id.HasValue ? m.VocabularyExamples.SingleOrDefault(e => e.Id == item.Id) ?? throw new ApiException(400,
                     "Example does not belong to meaning.") : new VocabularyExample
                     {
                         Id = Guid.NewGuid(),
                         CreatedAt = DateTimeOffset.UtcNow
                     };
                if (!item.Id.HasValue)
                {
                    m.VocabularyExamples.Add(e);
                    db.VocabularyExamples.Add(e);
                }
                e.SentenceEn = item.SentenceEn.Trim();
                e.SentenceVi = item.SentenceVi;
                e.ClozeSentenceEn = item.ClozeSentenceEn;
                e.ClozeAnswer = item.ClozeAnswer;
            }
        }
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return VocabularyResponse.From(v);
    }

    public async Task Delete(Guid id, CancellationToken ct)
    {
        await using var tx = await LearningMutation.Lock(db, ct);
        var v = await db.Vocabularies.SingleOrDefaultAsync(v => v.Id == id, ct) ?? throw new ApiException(404,
             "Vocabulary not found.");
        v.DeletedAt ??= DateTimeOffset.UtcNow;
        v.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
    }

    public async Task<VocabularyResponse> Pronunciation(Guid id, PronunciationRequest request, CancellationToken ct)
    {
        Audio(request.AudioUrl);
        await using var tx = await LearningMutation.Lock(db, ct);
        var v = await Find(id, ct);
        v.Ipa = request.Ipa;
        v.AudioUrl = request.AudioUrl;
        v.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return VocabularyResponse.From(v);
    }
}
