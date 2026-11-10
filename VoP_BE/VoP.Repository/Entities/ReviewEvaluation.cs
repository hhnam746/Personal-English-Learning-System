using VoP.Repository.Enums;

namespace VoP.Repository.Entities;

public class ReviewEvaluation
{
    public Guid Id { get; set; }
    public Guid SessionWordId { get; set; }
    public ReviewOutcome Outcome { get; set; }
    public short LevelBefore { get; set; }
    public short LevelAfter { get; set; }
    public DateTimeOffset? PreviousReviewAt { get; set; }
    public DateTimeOffset? NextReviewAt { get; set; }
    public DateTimeOffset EvaluatedAt { get; set; }
    public SessionWord SessionWord { get; set; } = null!;
}
