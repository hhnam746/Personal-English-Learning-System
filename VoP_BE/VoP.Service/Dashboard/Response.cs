namespace VoP.Service.Dashboard;

public record LevelCount(int Level, int Count);

public record DailyActivity(DateOnly Date,
    int AssessmentAnswers,
    int CorrectAssessments,
    int ReinforcementAnswers,
    int FlashcardReviews,
    int CompletedSessions);

public record DashboardResponse(int TotalWords,
    int LearnedWords,
    int NewWords,
    int DueWords,
    IReadOnlyList<LevelCount> Levels,
    int AssessmentAnswers,
    int CorrectAssessments,
    double? AccuracyPercent,
    int ReinforcementAnswers,
    int FlashcardReviews,
    IReadOnlyList<DailyActivity> Activity);
