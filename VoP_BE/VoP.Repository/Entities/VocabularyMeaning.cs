using VoP.Repository.Enums;

namespace VoP.Repository.Entities;

public class VocabularyMeaning
{
    public Guid Id { get; set; }
    public Guid VocabularyId { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public long? DictionaryEntryId { get; set; }
    public long? DictionaryDefinitionId { get; set; }
    public MeaningProgress? Progress { get; set; }
    public string MeaningVi { get; set; } = null!;
    public string? PartOfSpeech { get; set; }
    public string? IpaOverride { get; set; }
    public int DisplayOrder { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Vocabulary Vocabulary { get; set; } = null!;
    public ICollection<VocabularyExample> VocabularyExamples { get; set; } = new List<VocabularyExample>();
    public ICollection<ExerciseAttempt> ExerciseAttempts { get; set; } = new List<ExerciseAttempt>();
    public ICollection<FlashcardReview> FlashcardReviews { get; set; } = new List<FlashcardReview>();
}
