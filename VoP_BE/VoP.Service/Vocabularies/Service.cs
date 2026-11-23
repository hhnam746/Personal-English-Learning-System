using Microsoft.EntityFrameworkCore;
using VoP.Repository;
using VoP.Repository.Entities;
using VoP.Service.Common;

namespace VoP.Service.Vocabularies;

public sealed class Service(AppDbContext db) : IService
{
    private IQueryable<Vocabulary> Query => db.Vocabularies
        .Include(v => v.VocabularyMeanings)
        .ThenInclude(m => m.VocabularyExamples)
        .Include(v => v.VocabularyMeanings).ThenInclude(m => m.Progress)
        .Where(v => v.DeletedAt == null);

    public async Task<Page<VocabularyResponse>> List(string? search, int page, int pageSize, CancellationToken ct, int? level = null, bool dueOnly = false, string sort = "recent", string? exactTerm = null, string? language = null)
    {
        Rules.Paging(page, pageSize);
        Rules.Require(level == null || level is >= 0 and <= 5, "Level must be 0..5.");
        Rules.Require(sort is "recent" or "alpha" or "level", "Sort must be recent, alpha or level.");
        var query = Query.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(language))
        {
            var lang = language.Trim().ToLowerInvariant();
            query = query.Where(v => v.Language == lang);
        }
        if (level != null || dueOnly)
        {
            var now = DateTimeOffset.UtcNow;
            query = query.Where(v => v.VocabularyMeanings.Any(m => m.DeletedAt == null &&
                (level == null || (m.Progress == null ? 0 : m.Progress.Level) == level) &&
                (!dueOnly || (!v.IsSuspended && m.Progress != null && m.Progress.Level > 0 && m.Progress.NextReviewAt <= now))));
        }

        if (exactTerm != null)
        {
            var normalized = Rules.Normalize(exactTerm);
            query = query.Where(v => v.NormalizedTerm == normalized);
        }
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = Rules.Normalize(search);
            query = query
                .Where(v => v.NormalizedTerm.Contains(term) || v.VocabularyMeanings.Any(m => m.DeletedAt == null && m.MeaningVi.ToLower().Contains(term)));
        }
        var total = await query.CountAsync(ct);
        var ordered = sort switch
        {
            "alpha" => query.OrderBy(v => v.NormalizedTerm).ThenBy(v => v.Id),
            "level" => query.OrderBy(v => v.VocabularyMeanings.Where(m => m.DeletedAt == null).Min(m => (short?)(m.Progress == null ? 0 : m.Progress.Level)) ?? 0).ThenBy(v => v.NormalizedTerm).ThenBy(v => v.Id),
            _ => query.OrderByDescending(v => v.CreatedAt).ThenBy(v => v.Id)
        };
        return new((await ordered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct))
            .Select(v => VocabularyResponse.From(v))
            .ToArray(),
             page,
             pageSize,
             total);
    }

    private async Task<Vocabulary> Find(Guid id, CancellationToken ct) => await Query.SingleOrDefaultAsync(v => v.Id == id, ct) ?? throw new ApiException(404,
         "Vocabulary not found.");

    public async Task<VocabularyResponse> Get(Guid id, CancellationToken ct) => VocabularyResponse.From(await Find(id, ct));
    private static void Audio(string? url) => Rules.Require(url == null || OfflineAudio.IsLocalPath(url) || (Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme is "http" or "https"),
         "audioUrl must be an absolute HTTP(S) URL.");

    public async Task<VocabularyResponse> Save(Guid? id, VocabularyRequest request, CancellationToken ct, bool append = false)
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
        var normalized = Rules.Normalize(request.Term);
        Rules.Require(!append || request.Meanings.All(m => m.Id == null), "Use the edit form to link an existing meaning.");
        var existing = id.HasValue ? await Find(id.Value, ct)
            : append ? await Query.SingleOrDefaultAsync(v => v.NormalizedTerm == normalized, ct) : null;
        var v = existing ?? new Vocabulary
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow
        };
        Rules.Require(normalized.Length is > 0 and <= 255, "Normalized term must be 1..255 characters.");
        Rules.Require(!await db.Vocabularies.AnyAsync(x => x.NormalizedTerm == normalized && x.Id != v.Id, ct),
             "Term already exists (including archived vocabulary).",
             409);
        if (existing == null) db.Vocabularies.Add(v);
        if (!append || existing == null)
        {
            v.Term = request.Term.Trim();
            v.NormalizedTerm = normalized;
            v.Language = string.IsNullOrWhiteSpace(request.Language) ? "en" : request.Language.Trim().ToLowerInvariant();
            v.PhoneticReading = request.PhoneticReading;
            v.ScriptType = request.ScriptType;
            v.Ipa = request.Ipa;
            v.AudioUrl = request.AudioUrl;
            v.ImageUrl = request.ImageUrl;
        }
        else if (string.IsNullOrWhiteSpace(v.Ipa) && !string.IsNullOrWhiteSpace(request.Ipa))
        {
            v.Ipa = request.Ipa;
            v.UpdatedAt = DateTimeOffset.UtcNow;
        }
        if (append && string.IsNullOrWhiteSpace(v.ImageUrl) && !string.IsNullOrWhiteSpace(request.ImageUrl))
        {
            v.ImageUrl = request.ImageUrl;
            v.UpdatedAt = DateTimeOffset.UtcNow;
        }
        if (!append) v.UpdatedAt = DateTimeOffset.UtcNow;
        var active = v.VocabularyMeanings.Where(m => m.DeletedAt == null).ToArray();
        var position = append ? active.Select(m => m.DisplayOrder).DefaultIfEmpty().Max() : 0;
        if (!append)
        {
            var keep = request.Meanings.Where(m => m.Id.HasValue).Select(m => m.Id!.Value).ToHashSet();
            var removed = active.Where(m => !keep.Contains(m.Id)).Select(m => m.Id).ToArray();
            Rules.Require(!await db.SessionWords.AnyAsync(w => w.Session.Status == VoP.Repository.Enums.PracticeSessionStatus.InProgress &&
                w.VocabularyId == v.Id && (w.IsLegacy ? removed.Length > 0 : w.MeaningId != null && removed.Contains(w.MeaningId.Value)), ct),
                "Finish or abandon active practice before removing a meaning.", 409);
            foreach (var m in active)
            {
                if (!keep.Contains(m.Id)) m.DeletedAt = DateTimeOffset.UtcNow;
                else m.DisplayOrder = -m.DisplayOrder;
            }
            await db.SaveChangesAsync(ct);
        }
        foreach (var input in request.Meanings)
        {
            Rules.Require(!string.IsNullOrWhiteSpace(input.MeaningVi), "Meaning is required.");
            Rules.Require(input.DictionaryEntryId.HasValue == input.DictionaryDefinitionId.HasValue, "Both dictionary IDs are required.");
            var m = input.Id.HasValue ? active.SingleOrDefault(m => m.Id == input.Id)
                ?? throw new ApiException(400, "Meaning does not belong to vocabulary.") : new VocabularyMeaning
                {
                    Id = Guid.NewGuid(),
                    CreatedAt = DateTimeOffset.UtcNow,
                    Progress = new MeaningProgress()
                };
            if (input.DictionaryEntryId is { } entryId && input.DictionaryDefinitionId is { } definitionId)
            {
                if (append && v.VocabularyMeanings.Any(x => x.DeletedAt == null &&
                    x.DictionaryEntryId == entryId && x.DictionaryDefinitionId == definitionId)) continue;
                Rules.Require(await MatchesSource(normalized, entryId, definitionId, ct),
                    "Dictionary meaning does not match this term.");
                Rules.Require(m.DictionaryEntryId == null || (m.DictionaryEntryId == entryId && m.DictionaryDefinitionId == definitionId),
                    "An existing dictionary association cannot be changed.", 409);
                m.DictionaryEntryId = entryId;
                m.DictionaryDefinitionId = definitionId;
            }
            if (!input.Id.HasValue)
            {
                v.VocabularyMeanings.Add(m);
                db.VocabularyMeanings.Add(m);
                v.UpdatedAt = DateTimeOffset.UtcNow;
            }
            var meaningChanged = input.Id.HasValue &&
                (m.MeaningVi != input.MeaningVi.Trim() || m.PartOfSpeech != input.PartOfSpeech);
            m.MeaningVi = input.MeaningVi.Trim();
            m.PartOfSpeech = input.PartOfSpeech;
            m.IpaOverride = input.IpaOverride;
            m.DisplayOrder = ++position;
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
                var clozeChanged = item.Id.HasValue && (e.SentenceEn != item.SentenceEn.Trim() ||
                    e.ClozeAnswer != item.ClozeAnswer || e.ClozeSentenceEn != item.ClozeSentenceEn);
                var generated = item.ClozeConfirmed ? Cloze.FromSentence(v.Term, item.SentenceEn) : null;
                e.SentenceEn = item.SentenceEn.Trim();
                e.SentenceVi = item.SentenceVi;
                e.ClozeSentenceEn = generated?.Prompt ?? item.ClozeSentenceEn;
                e.ClozeAnswer = generated?.Answer ?? item.ClozeAnswer;
                e.ClozeConfirmed = generated.HasValue && !meaningChanged && !clozeChanged;
            }
        }
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return VocabularyResponse.From(v);
    }

    public async Task<VocabularyResponse> LinkSource(Guid id, Guid meaningId, DictionarySourceRequest request, CancellationToken ct)
    {
        await using var tx = await LearningMutation.Lock(db, ct);
        var word = await Find(id, ct);
        var meaning = word.VocabularyMeanings.SingleOrDefault(m => m.Id == meaningId && m.DeletedAt == null)
            ?? throw new ApiException(404, "Meaning not found.");
        Rules.Require(meaning.DictionaryEntryId == null ||
            (meaning.DictionaryEntryId == request.EntryId && meaning.DictionaryDefinitionId == request.DefinitionId),
            "Meaning already has a source.", 409);
        Rules.Require(!word.VocabularyMeanings.Any(m => m.Id != meaningId && m.DeletedAt == null &&
            m.DictionaryEntryId == request.EntryId && m.DictionaryDefinitionId == request.DefinitionId),
            "Dictionary meaning already saved.", 409);
        Rules.Require(await MatchesSource(word.NormalizedTerm, request.EntryId, request.DefinitionId, ct),
            "Dictionary meaning does not match this term.");
        meaning.DictionaryEntryId = request.EntryId;
        meaning.DictionaryDefinitionId = request.DefinitionId;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return VocabularyResponse.From(word);
    }

    private Task<bool> MatchesSource(string term, long entryId, long definitionId, CancellationToken ct) =>
        db.DictionarySenses.AnyAsync(s => s.EntryId == entryId && s.DefinitionId == definitionId &&
            db.DictionaryEntries.Any(e => e.Id == s.EntryId && e.NormalizedTerm == term), ct);

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
