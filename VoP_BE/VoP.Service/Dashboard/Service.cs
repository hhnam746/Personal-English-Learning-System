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
        var words = await db.Vocabularies.CountAsync(v => v.DeletedAt == null, ct);
        var meanings = await db.VocabularyMeanings
            .Where(m => m.DeletedAt == null && m.Vocabulary.DeletedAt == null)
            .GroupBy(m => m.Progress == null ? (short)0 : m.Progress.Level)
            .Select(g => new { Level = g.Key, Count = g.Count(),
                Available = g.Count(m => !m.Vocabulary.IsSuspended),
                Due = g.Count(m => !m.Vocabulary.IsSuspended && m.Progress != null &&
                    m.Progress.Level > 0 && m.Progress.NextReviewAt <= now) })
            .ToDictionaryAsync(x => (int)x.Level, ct);
        var assessments = db.ExerciseAttempts.Where(a => a.Role == AttemptRole.Assessment);
        var semantic = assessments.Where(a => a.ExerciseType == ExerciseType.MeaningMcq || a.ExerciseType == ExerciseType.FillBlank);
        var listening = assessments.Where(a => a.ExerciseType == ExerciseType.ListenChoose || a.ExerciseType == ExerciseType.ListenType);
        var total = await semantic.CountAsync(ct);
        var correct = await semantic.CountAsync(a => a.IsCorrect, ct);
        // Aggregate in PostgreSQL; DateTime on PostgreSQL UTC-only offsets keeps calendar days independent of session timezone.
        var attemptsByDay = await db.ExerciseAttempts
            .Where(a => a.AnsweredAt >= since)
            .GroupBy(a => a.AnsweredAt.DateTime.Date)
            .Select(g => new
            {
                Date = g.Key,
                Assessments = g.Count(a => a.Role == AttemptRole.Assessment && (a.ExerciseType == ExerciseType.MeaningMcq || a.ExerciseType == ExerciseType.FillBlank)),
                Correct = g.Count(a => a.Role == AttemptRole.Assessment && a.IsCorrect && (a.ExerciseType == ExerciseType.MeaningMcq || a.ExerciseType == ExerciseType.FillBlank)),
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
            words,
            meanings.Values.Sum(m => m.Count),
            meanings.Values.Where(m => m.Level > 0).Sum(m => m.Count),
            meanings.GetValueOrDefault(0)?.Count ?? 0,
            meanings.GetValueOrDefault(0)?.Available ?? 0,
            meanings.Values.Sum(m => m.Due),
            meanings.GetValueOrDefault(5)?.Count ?? 0,
            Enumerable.Range(0, 6)
                .Select(l => new LevelCount(l, meanings.GetValueOrDefault(l)?.Count ?? 0))
                .ToArray(),
            await listening.CountAsync(ct),
            await listening.CountAsync(a => a.IsCorrect, ct),
            total,
            correct,
            total == 0 ? null : Math.Round(100d * correct / total, 2),
            await db.ExerciseAttempts.CountAsync(a => a.Role == AttemptRole.Reinforcement, ct),
            await db.FlashcardReviews.CountAsync(ct),
            activity);
    }
}
