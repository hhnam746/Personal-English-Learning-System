using VoP.Repository.Enums;

namespace VoP.Service.Practice;

public record QuestionResponse(Guid Id,
    Guid SessionWordId,
    ExerciseType Type,
    AttemptRole Role,
    string Prompt,
    string? AudioUrl,
    IReadOnlyList<string> Options);

public record SessionResponse(Guid Id,
    PracticeSessionStatus Status,
    DateTimeOffset StartedAt,
    DateTimeOffset? FinishedAt,
    IReadOnlyList<SessionWordResponse> Words,
    int AnsweredCount,
    int RemainingCount);

public record SessionWordResponse(Guid Id,
    Guid VocabularyId,
    SessionWordSource Source,
    short LevelAtStart,
    string Term,
    string? Ipa);

public record AnswerResponse(Guid AttemptId, bool IsCorrect, string CorrectAnswer, AttemptRole Role);

public record AttemptResponse(Guid Id,
    Guid SessionWordId,
    ExerciseType Type,
    AttemptRole Role,
    string? SubmittedAnswer,
    bool IsCorrect,
    DateTimeOffset AnsweredAt);
