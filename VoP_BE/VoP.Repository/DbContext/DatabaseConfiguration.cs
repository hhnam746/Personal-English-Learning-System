using Microsoft.EntityFrameworkCore;
using Npgsql;
using VoP.Repository.Enums;

namespace VoP.Repository;

public static class DatabaseConfiguration
{
    public static NpgsqlDataSource CreateDataSource(string connectionString)
    {
        var builder = new NpgsqlDataSourceBuilder(connectionString);
        builder.MapEnum<PracticeSessionStatus>("practice_session_status");
        builder.MapEnum<SessionWordSource>("session_word_source");
        builder.MapEnum<ExerciseType>("exercise_type");
        builder.MapEnum<AttemptRole>("attempt_role");
        builder.MapEnum<ReviewOutcome>("review_outcome");
        builder.MapEnum<FlashcardRating>("flashcard_rating");
        return builder.Build();
    }
}
