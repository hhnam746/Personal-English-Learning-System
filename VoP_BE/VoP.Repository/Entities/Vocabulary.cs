using VoP.Repository.Enums;

namespace VoP.Repository.Entities;

public class Vocabulary
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string Language { get; set; } = "en";
    public string? PhoneticReading { get; set; }
    public string? ScriptType { get; set; }
    public string Term { get; set; } = null!;
    public string NormalizedTerm { get; set; } = null!;
    public bool IsSuspended { get; set; }
    public string? Ipa { get; set; }
    public string? AudioUrl { get; set; }
    public string? ImageUrl { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public ICollection<VocabularyMeaning> VocabularyMeanings { get; set; } = new List<VocabularyMeaning>();
    public LearningProgress? LearningProgress { get; set; }
    public ICollection<SessionWord> SessionWords { get; set; } = new List<SessionWord>();
    public ICollection<FlashcardReview> FlashcardReviews { get; set; } = new List<FlashcardReview>();
}
