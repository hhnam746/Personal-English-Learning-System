using VoP.Repository.Enums;

namespace VoP.Repository.Entities;

public class FlashcardReview
{
    public Guid Id { get; set; }
    public Guid VocabularyId { get; set; }
    public Guid? MeaningId { get; set; }
    public FlashcardRating Rating { get; set; }
    public DateTimeOffset ReviewedAt { get; set; }
    public Vocabulary Vocabulary { get; set; } = null!;
    public VocabularyMeaning? Meaning { get; set; }
}
