using VoP.Repository.Enums;

namespace VoP.Service.Learning;

public record ProgressResponse(Guid VocabularyId,
    string Term,
    short Level,
    bool IsSuspended,
    DateTimeOffset? FirstLearnedAt,
    DateTimeOffset? LastReviewedAt,
    DateTimeOffset? NextReviewAt);

public record EvaluationResponse(Guid Id,
    Guid SessionWordId,
    ReviewOutcome Outcome,
    short LevelBefore,
    short LevelAfter,
    DateTimeOffset? NextReviewAt,
    DateTimeOffset EvaluatedAt);
