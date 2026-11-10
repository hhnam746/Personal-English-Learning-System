using VoP.Repository.Enums;

namespace VoP.Service.Practice;

// Stored only on the server. Public projections deliberately omit Expected and learning snapshots.

public record PlannedQuestion(Guid Id,
    int Order,
    ExerciseType Type,
    AttemptRole Role,
    Guid? MeaningId,
    Guid? ExampleId,
    string Prompt,
    string Expected,
    string? AudioUrl,
    string[] Options);

public record WordPlan(string Term, string? Ipa, List<PlannedQuestion> Questions);
