using VoP.Repository.Enums;

namespace VoP.Repository.Entities;

public class ExerciseAttempt
{
    public Guid Id { get; set; }
    public Guid SessionWordId { get; set; }
    public Guid? MeaningId { get; set; }
    public Guid? ExampleId { get; set; }
    public ExerciseType ExerciseType { get; set; }
    public AttemptRole Role { get; set; }
    public string? QuestionSnapshot { get; set; }
    public string? SubmittedAnswer { get; set; }
    public bool IsCorrect { get; set; }
    public DateTimeOffset AnsweredAt { get; set; }
    public SessionWord SessionWord { get; set; } = null!;
    public VocabularyMeaning? Meaning { get; set; }
    public VocabularyExample? Example { get; set; }
}
