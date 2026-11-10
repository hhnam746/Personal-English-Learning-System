using VoP.Repository.Enums;

namespace VoP.Repository.Entities;

public class LearningProgress
{
    public Guid VocabularyId { get; set; }
    public short Level { get; set; }
    public DateTimeOffset? FirstLearnedAt { get; set; }
    public DateTimeOffset? LastReviewedAt { get; set; }
    public DateTimeOffset? NextReviewAt { get; set; }
    public bool IsSuspended { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Vocabulary Vocabulary { get; set; } = null!;
}
