using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using VoP.Repository;
using VoP.Repository.Entities;
using VoP.Repository.Enums;

var configuration = new ConfigurationBuilder().AddUserSecrets<Program>().AddEnvironmentVariables().Build();
await using var source = DatabaseConfiguration.CreateDataSource(configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Set ConnectionStrings__DefaultConnection or user secrets."));
await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(source).Options);
if ((await db.Database.GetPendingMigrationsAsync()).Any()) throw new Exception("Pending migrations.");
await using var transaction = await db.Database.BeginTransactionAsync();
var vocabulary = new Vocabulary { Term = "smoke", NormalizedTerm = Guid.NewGuid().ToString() };
var meaning = new VocabularyMeaning { Vocabulary = vocabulary, MeaningVi = "kiểm thử" };
var example = new VocabularyExample { Meaning = meaning, SentenceEn = "Smoke test." };
var progress = new LearningProgress { Vocabulary = vocabulary };
var session = new PracticeSession();
var word = new SessionWord { Session = session, Vocabulary = vocabulary, Source = SessionWordSource.DueReview, Position = 1 };
var attempt = new ExerciseAttempt { SessionWord = word, Meaning = meaning, Example = example, ExerciseType = ExerciseType.ListenType,
    Role = AttemptRole.Reinforcement, QuestionSnapshot = "{\"test\":true}", IsCorrect = true };
var evaluation = new ReviewEvaluation { SessionWord = word, Outcome = ReviewOutcome.Passed, LevelAfter = 1 };
var flashcard = new FlashcardReview { Vocabulary = vocabulary, Meaning = meaning, Rating = FlashcardRating.Forgotten };
db.AddRange(vocabulary, meaning, example, progress, session, word, attempt, evaluation, flashcard);
await db.SaveChangesAsync();
db.ChangeTracker.Clear();
var saved = await db.ExerciseAttempts.SingleAsync(x => x.Id == attempt.Id);
if (saved.ExerciseType != ExerciseType.ListenType || saved.Role != AttemptRole.Reinforcement || saved.QuestionSnapshot is null)
    throw new Exception("Enum/JSON round trip failed.");
if ((await db.PracticeSessions.SingleAsync(x => x.Id == session.Id)).Status != PracticeSessionStatus.InProgress
    || (await db.SessionWords.SingleAsync(x => x.Id == word.Id)).Source != SessionWordSource.DueReview
    || (await db.ReviewEvaluations.SingleAsync(x => x.Id == evaluation.Id)).Outcome != ReviewOutcome.Passed
    || (await db.FlashcardReviews.SingleAsync(x => x.Id == flashcard.Id)).Rating != FlashcardRating.Forgotten)
    throw new Exception("Enum round trip failed.");
if (saved.AnsweredAt == default || (await db.VocabularyMeanings.SingleAsync(x => x.Id == meaning.Id)).DisplayOrder != 1)
    throw new Exception("Database defaults failed.");
await transaction.RollbackAsync();
Console.WriteLine("PASS: all nine entities, six native enums, JSON/defaults, migration history; test data rolled back.");
