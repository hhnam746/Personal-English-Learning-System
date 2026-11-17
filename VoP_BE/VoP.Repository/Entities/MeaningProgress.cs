namespace VoP.Repository.Entities;

public sealed class MeaningProgress
{
    public Guid MeaningId { get; set; }
    public short Level { get; set; }
    public DateTimeOffset? FirstLearnedAt { get; set; }
    public DateTimeOffset? LastReviewedAt { get; set; }
    public DateTimeOffset? NextReviewAt { get; set; }
}
