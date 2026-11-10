using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using VoP.Repository;
using VoP.Repository.Entities;
using VoP.Repository.Enums;
using VoP.Service.Common;

namespace VoP.Service.Learning;

public sealed class Service(AppDbContext db) : IService
{
    private IQueryable<Vocabulary> Query => db.Vocabularies.Include(v => v.LearningProgress).Where(v => v.DeletedAt == null);
    private static ProgressResponse Response(Vocabulary v) => new(v.Id,
        v.Term,
        v.LearningProgress?.Level ?? 0,
        v.LearningProgress?.IsSuspended ?? false,
        v.LearningProgress?.FirstLearnedAt,
        v.LearningProgress?.LastReviewedAt,
        v.LearningProgress?.NextReviewAt);

    public async Task<Page<ProgressResponse>> List(int? level, bool dueOnly, bool? suspended, int page, int pageSize, CancellationToken ct)
    {
        Rules.Paging(page, pageSize);
        Rules.Require(level == null || level is >= 0 and <= 5, "Level must be 0..5.");
        var query = Query.AsNoTracking();
        var now = DateTimeOffset.UtcNow;
        if (level != null) query = query.Where(v => (v.LearningProgress == null ? 0 : v.LearningProgress.Level) == level);
        if (dueOnly) query = query
            .Where(v => v.LearningProgress != null && !v.LearningProgress.IsSuspended && v.LearningProgress.NextReviewAt <= now);
        if (suspended != null) query = query
            .Where(v => (v.LearningProgress != null && v.LearningProgress.IsSuspended) == suspended);
        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(v => v.LearningProgress == null ? null : v.LearningProgress.NextReviewAt)
            .ThenBy(v => v.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        return new(items.Select(Response).ToArray(), page, pageSize, total);
    }

    public async Task<ProgressResponse> Get(Guid id, CancellationToken ct) =>
        Response(await Query.SingleOrDefaultAsync(v => v.Id == id, ct)
            ?? throw new ApiException(404, "Vocabulary not found."));

    public async Task<ProgressResponse> Suspend(Guid id, bool suspended, CancellationToken ct)
    {
        await using var tx = await LearningMutation.Lock(db, ct);
        var v = await Query.SingleOrDefaultAsync(v => v.Id == id, ct) ?? throw new ApiException(404, "Vocabulary not found.");
        Rules.Require(!await db.SessionWords.AnyAsync(w => w.VocabularyId == id && w.Session.Status == PracticeSessionStatus.InProgress, ct),
            "Finish or abandon active session before changing suspension.",
            409);
        v.LearningProgress ??= new LearningProgress
        {
            Vocabulary = v
        };
        v.LearningProgress.IsSuspended = suspended;
        v.LearningProgress.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Response(v);
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
            e.EvaluatedAt))
            .ToArrayAsync(ct),
            page,
            pageSize,
            await query.CountAsync(ct));
    }
}
