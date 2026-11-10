using Microsoft.EntityFrameworkCore;
using VoP.Repository;
using VoP.Repository.Enums;
using VoP.Service.Common;

namespace VoP.Service.Dashboard;

public sealed class Service(AppDbContext db) : IService
{

    public async Task<DashboardResponse> Get(int days, CancellationToken ct)
    {
        Rules.Require(days is >= 1 and <= 366, "days must be 1..366.");
        var now = DateTimeOffset.UtcNow;
        var since = new DateTimeOffset(now.UtcDateTime.Date.AddDays(1 - days), TimeSpan.Zero);
        var words = await db.Vocabularies
            .Where(v => v.DeletedAt == null)
            .Select(v => new
            {
                Level = v.LearningProgress == null ? 0 : v.LearningProgress.Level,
                IsSuspended = v.LearningProgress != null && v.LearningProgress.IsSuspended,
                Next = v.LearningProgress == null ? null : v.LearningProgress.NextReviewAt
            })
            .ToListAsync(ct);
        var assessments = db.ExerciseAttempts.Where(a => a.Role == AttemptRole.Assessment);
        var total = await assessments.CountAsync(ct);
        var correct = await assessments.CountAsync(a => a.IsCorrect, ct);
        // Aggregate in PostgreSQL; DateTime on PostgreSQL UTC-only offsets keeps calendar days independent of session timezone.
        var attemptsByDay = await db.ExerciseAttempts
            .Where(a => a.AnsweredAt >= since)
            .GroupBy(a => a.AnsweredAt.DateTime.Date)
            .Select(g => new
            {
                Date = g.Key,
                Assessments = g.Count(a => a.Role == AttemptRole.Assessment),
                Correct = g.Count(a => a.Role == AttemptRole.Assessment && a.IsCorrect),
                Reinforcements = g.Count(a => a.Role == AttemptRole.Reinforcement)
            })
            .ToDictionaryAsync(a => DateOnly.FromDateTime(a.Date), ct);
        var cardsByDay = await db.FlashcardReviews
            .Where(r => r.ReviewedAt >= since)
            .GroupBy(r => r.ReviewedAt.DateTime.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToDictionaryAsync(a => DateOnly.FromDateTime(a.Date), a => a.Count, ct);
        var sessionsByDay = await db.PracticeSessions
            .Where(s => s.Status == PracticeSessionStatus.Completed && s.FinishedAt >= since)
            .GroupBy(s => s.FinishedAt!.Value.DateTime.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToDictionaryAsync(a => DateOnly.FromDateTime(a.Date), a => a.Count, ct);
        var activity = Enumerable.Range(0, days).Select(i =>
        {
            var date = DateOnly.FromDateTime(since.UtcDateTime.Date.AddDays(i));
            attemptsByDay.TryGetValue(date, out var attempts);
            return new DailyActivity(date,
                 attempts?.Assessments ?? 0,
                 attempts?.Correct ?? 0,
                 attempts?.Reinforcements ?? 0,
                 cardsByDay.GetValueOrDefault(date),
                 sessionsByDay.GetValueOrDefault(date));
        }).ToArray();
        return new(
            words.Count,
            words.Count(v => v.Level > 0),
            words.Count(v => v.Level == 0),
            words.Count(v => !v.IsSuspended && v.Next <= now),
            Enumerable.Range(0, 6)
                .Select(l => new LevelCount(l, words.Count(v => v.Level == l)))
                .ToArray(),
            total,
            correct,
            total == 0 ? null : Math.Round(100d * correct / total, 2),
            await db.ExerciseAttempts.CountAsync(a => a.Role == AttemptRole.Reinforcement, ct),
            await db.FlashcardReviews.CountAsync(ct),
            activity);
    }
}
