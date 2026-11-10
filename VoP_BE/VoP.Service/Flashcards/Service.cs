using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using VoP.Repository;
using VoP.Repository.Entities;
using VoP.Repository.Enums;
using VoP.Service.Common;
using VoP.Service.Vocabularies;

namespace VoP.Service.Flashcards;

public sealed class Service(AppDbContext db) : IService
{

    public async Task<Page<VocabularyResponse>> List(int? level, int page, int pageSize, CancellationToken ct)
    {
        Rules.Paging(page, pageSize);
        Rules.Require(level == null || level is >= 0 and <= 5, "Level must be 0..5.");
        var query = db.Vocabularies
            .AsNoTracking()
            .Include(v => v.VocabularyMeanings)
            .ThenInclude(m => m.VocabularyExamples)
            .Where(v => v.DeletedAt == null && (v.LearningProgress == null || !v.LearningProgress.IsSuspended));
        if (level != null) query = query.Where(v => (v.LearningProgress == null ? 0 : v.LearningProgress.Level) == level);
        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(v => v.NormalizedTerm)
            .ThenBy(v => v.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        return new(items.Select(VocabularyResponse.From).ToArray(), page, pageSize, total);
    }

    public async Task<ReviewResponse> Rate(Guid id, RatingRequest request, CancellationToken ct)
    {
        Rules.Require(Enum.IsDefined(request.Rating), "Invalid flashcard rating.");
        await using var tx = await LearningMutation.Lock(db, ct);
        Rules.Require(await db.Vocabularies.AnyAsync(v => v.Id == id && v.DeletedAt == null && (v.LearningProgress == null || !v.LearningProgress.IsSuspended),
             ct),
             "Vocabulary unavailable.",
             404);
        Rules.Require(request.MeaningId == null || await db.VocabularyMeanings.AnyAsync(m => m.Id == request.MeaningId && m.VocabularyId == id, ct),
             "Meaning does not belong to vocabulary.");
        var review = new FlashcardReview
        {
            Id = Guid.NewGuid(),
            VocabularyId = id,
            MeaningId = request.MeaningId,
            Rating = request.Rating,
            ReviewedAt = DateTimeOffset.UtcNow
        };
        db.FlashcardReviews.Add(review);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return new(review.Id, id, review.MeaningId, review.Rating, review.ReviewedAt);
    }

    public async Task<Page<ReviewResponse>> History(Guid? vocabularyId, int page, int pageSize, CancellationToken ct)
    {
        Rules.Paging(page, pageSize);
        if (vocabularyId != null) Rules.Require(await db.Vocabularies.AnyAsync(v => v.Id == vocabularyId, ct),
             "Vocabulary not found.",
             404);
        var query = db.FlashcardReviews.AsNoTracking().AsQueryable();
        if (vocabularyId != null) query = query.Where(r => r.VocabularyId == vocabularyId);
        return new(await query
            .OrderByDescending(r => r.ReviewedAt)
            .ThenBy(r => r.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReviewResponse(r.Id, r.VocabularyId, r.MeaningId, r.Rating, r.ReviewedAt))
            .ToArrayAsync(ct),
             page,
             pageSize,
             await query.CountAsync(ct));
    }
}
