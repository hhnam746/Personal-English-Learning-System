using VoP.Repository.Enums;

namespace VoP.Repository.Entities;

public class SessionWord
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public Guid VocabularyId { get; set; }
    public SessionWordSource Source { get; set; }
    public string? QuestionPlan { get; set; }
    public int Position { get; set; }
    public short LevelAtStart { get; set; }
    public PracticeSession Session { get; set; } = null!;
    public Vocabulary Vocabulary { get; set; } = null!;
    public ICollection<ExerciseAttempt> ExerciseAttempts { get; set; } = new List<ExerciseAttempt>();
    public ReviewEvaluation? ReviewEvaluation { get; set; }
}
