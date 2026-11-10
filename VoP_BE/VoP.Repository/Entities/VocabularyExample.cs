using VoP.Repository.Enums;

namespace VoP.Repository.Entities;

public class VocabularyExample
{
    public Guid Id { get; set; }
    public Guid MeaningId { get; set; }
    public string SentenceEn { get; set; } = null!;
    public string? SentenceVi { get; set; }
    public string? ClozeSentenceEn { get; set; }
    public string? ClozeAnswer { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public VocabularyMeaning Meaning { get; set; } = null!;
    public ICollection<ExerciseAttempt> ExerciseAttempts { get; set; } = new List<ExerciseAttempt>();
}
