using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using VoP.Repository;
using VoP.Repository.Entities;
using VoP.Repository.Enums;
using VoP.Service.Common;

namespace VoP.Service.Learning;

public sealed class Service(AppDbContext db) : IService
{
    private IQueryable<VocabularyMeaning> Query => db.VocabularyMeanings
        .Include(m => m.Progress)
        .Include(m => m.Vocabulary).ThenInclude(v => v.LearningProgress)
        .Where(m => m.DeletedAt == null && m.Vocabulary.DeletedAt == null);

    private static ProgressResponse Response(VocabularyMeaning m) => new(m.VocabularyId,
        m.Vocabulary.Term, m.Progress?.Level ?? 0, m.Vocabulary.IsSuspended,
        m.Progress?.FirstLearnedAt, m.Progress?.LastReviewedAt, m.Progress?.NextReviewAt,
        m.Id, m.MeaningVi);

    public async Task<Page<ProgressResponse>> List(int? level, bool dueOnly, bool? suspended, int page, int pageSize, CancellationToken ct)
    {
        Rules.Paging(page, pageSize);
        Rules.Require(level == null || level is >= 0 and <= 5, "Level must be 0..5.");
        var query = Query.AsNoTracking();
        var now = DateTimeOffset.UtcNow;
        if (level != null) query = query.Where(m => (m.Progress == null ? 0 : m.Progress.Level) == level);
        if (dueOnly) query = query.Where(m => !m.Vocabulary.IsSuspended &&
            m.Progress != null && m.Progress.Level > 0 && m.Progress.NextReviewAt <= now);
        if (suspended != null) query = query.Where(m => m.Vocabulary.IsSuspended == suspended);
        var total = await query.CountAsync(ct);
        var items = await query.OrderBy(m => m.Progress == null ? null : m.Progress.NextReviewAt)
            .ThenBy(m => m.Id).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new(items.Select(Response).ToArray(), page, pageSize, total);
    }

    public async Task<WordProgressResponse> Get(Guid id, CancellationToken ct)
    {
        var v = await db.Vocabularies.AsNoTracking()
            .Include(v => v.LearningProgress)
            .Include(v => v.VocabularyMeanings).ThenInclude(m => m.Progress)
            .SingleOrDefaultAsync(v => v.Id == id, ct)
            ?? throw new ApiException(404, "Vocabulary not found.");
        var meanings = v.VocabularyMeanings.Where(m => m.DeletedAt == null)
            .OrderBy(m => m.DisplayOrder).ToArray();
        var legacy = v.LearningProgress;
        return new(v.Id, v.Term, v.IsSuspended, meanings.Select(Response).ToArray(),
            legacy == null ? null : new LegacyProgressResponse(legacy.Level, legacy.FirstLearnedAt,
                legacy.LastReviewedAt, legacy.NextReviewAt, legacy.MappedMeaningId));
    }

    public async Task<WordProgressResponse> Suspend(Guid id, bool suspended, CancellationToken ct)
    {
        await using var tx = await LearningMutation.Lock(db, ct);
        var v = await db.Vocabularies.SingleOrDefaultAsync(v => v.Id == id && v.DeletedAt == null, ct)
            ?? throw new ApiException(404, "Vocabulary not found.");
        Rules.Require(!await db.SessionWords.AnyAsync(w => w.VocabularyId == id && w.Session.Status == PracticeSessionStatus.InProgress, ct),
            "Finish or abandon active session before changing suspension.", 409);
        v.IsSuspended = suspended;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return await Get(id, ct);
    }

    public async Task<Page<EvaluationResponse>> History(Guid id, int page, int pageSize, CancellationToken ct)
    {
        Rules.Paging(page, pageSize);
        Rules.Require(await db.Vocabularies.AnyAsync(v => v.Id == id, ct), "Vocabulary not found.", 404);
        var query = db.ReviewEvaluations.AsNoTracking().Where(e => e.SessionWord.VocabularyId == id);
        return new(await query
            .OrderByDescending(e => e.EvaluatedAt)
            .ThenBy(e => e.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new EvaluationResponse(e.Id,
            e.SessionWordId,
            e.Outcome,
            e.LevelBefore,
            e.LevelAfter,
            e.NextReviewAt,
            e.EvaluatedAt,
            e.SessionWord.MeaningId,
            e.SessionWord.IsLegacy))
            .ToArrayAsync(ct),
            page,
            pageSize,
            await query.CountAsync(ct));
    }
}
