namespace VoP.Service.Dashboard;

public record LevelCount(int Level, int Count);

public record DailyActivity(DateOnly Date,
    int AssessmentAnswers,
    int CorrectAssessments,
    int ReinforcementAnswers,
    int FlashcardReviews,
    int CompletedSessions);

public record DashboardResponse(int TotalWords,
    int TotalMeanings,
    int LearnedMeanings,
    int NewMeanings,
    int AvailableNewMeanings,
    int DueMeanings,
    int MasteredMeanings,
    IReadOnlyList<LevelCount> Levels,
    int ListeningAnswers,
    int CorrectListeningAnswers,
    int AssessmentAnswers,
    int CorrectAssessments,
    double? AccuracyPercent,
    int ReinforcementAnswers,
    int FlashcardReviews,
    IReadOnlyList<DailyActivity> Activity);
