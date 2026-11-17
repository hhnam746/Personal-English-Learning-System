using VoP.Repository.Enums;

namespace VoP.Service.Learning;

public record ProgressResponse(Guid VocabularyId,
    string Term,
    short Level,
    bool IsSuspended,
    DateTimeOffset? FirstLearnedAt,
    DateTimeOffset? LastReviewedAt,
    DateTimeOffset? NextReviewAt,
    Guid MeaningId,
    string MeaningVi);

public record WordProgressResponse(Guid VocabularyId, string Term, bool IsSuspended,
    IReadOnlyList<ProgressResponse> Meanings, LegacyProgressResponse? Legacy);
public record LegacyProgressResponse(short Level, DateTimeOffset? FirstLearnedAt,
    DateTimeOffset? LastReviewedAt, DateTimeOffset? NextReviewAt, Guid? MappedMeaningId);

public record EvaluationResponse(Guid Id,
    Guid SessionWordId,
    ReviewOutcome Outcome,
    short LevelBefore,
    short LevelAfter,
    DateTimeOffset? NextReviewAt,
    DateTimeOffset EvaluatedAt,
    Guid? MeaningId,
    bool IsLegacy);
