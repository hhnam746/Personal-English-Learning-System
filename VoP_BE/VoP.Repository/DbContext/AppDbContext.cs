using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using VoP.Repository.Entities;
using VoP.Repository.Enums;

namespace VoP.Repository;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Vocabulary> Vocabularies => Set<Vocabulary>();
    public DbSet<VocabularyMeaning> VocabularyMeanings => Set<VocabularyMeaning>();
    public DbSet<VocabularyExample> VocabularyExamples => Set<VocabularyExample>();
    public DbSet<LearningProgress> LearningProgress => Set<LearningProgress>();
    public DbSet<PracticeSession> PracticeSessions => Set<PracticeSession>();
    public DbSet<SessionWord> SessionWords => Set<SessionWord>();
    public DbSet<ExerciseAttempt> ExerciseAttempts => Set<ExerciseAttempt>();
    public DbSet<ReviewEvaluation> ReviewEvaluations => Set<ReviewEvaluation>();
    public DbSet<FlashcardReview> FlashcardReviews => Set<FlashcardReview>();

    public DbSet<DictionaryEntry> DictionaryEntries => Set<DictionaryEntry>();
    public DbSet<DictionarySense> DictionarySenses => Set<DictionarySense>();
    public DbSet<DictionaryPronunciation> DictionaryPronunciations => Set<DictionaryPronunciation>();
    public DbSet<DictionaryImport> DictionaryImports => Set<DictionaryImport>();
    public DbSet<MeaningProgress> MeaningProgress => Set<MeaningProgress>();

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Conventions.Remove(typeof(ForeignKeyIndexConvention));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresEnum<PracticeSessionStatus>(name: "practice_session_status");
        modelBuilder.HasPostgresEnum<SessionWordSource>(name: "session_word_source");
        modelBuilder.HasPostgresEnum<ExerciseType>(name: "exercise_type");
        modelBuilder.HasPostgresEnum<AttemptRole>(name: "attempt_role");
        modelBuilder.HasPostgresEnum<ReviewOutcome>(name: "review_outcome");
        modelBuilder.HasPostgresEnum<FlashcardRating>(name: "flashcard_rating");

        modelBuilder.Entity<DictionaryEntry>(builder =>
        {
            builder.ToTable("dictionary_entries");
            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.HasIndex(x => x.NormalizedTerm).HasOperators("text_pattern_ops");
        });
        modelBuilder.Entity<DictionarySense>(builder =>
        {
            builder.ToTable("dictionary_senses");
            builder.HasKey(x => new { x.EntryId, x.DefinitionId });
            builder.HasOne<DictionaryEntry>().WithMany(x => x.Senses).HasForeignKey(x => x.EntryId);
        });
        modelBuilder.Entity<DictionaryPronunciation>(builder =>
        {
            builder.ToTable("dictionary_pronunciations");
            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.HasOne<DictionaryEntry>().WithMany(x => x.Pronunciations).HasForeignKey(x => x.EntryId);
            builder.HasIndex(x => x.EntryId);
        });
        modelBuilder.Entity<DictionaryImport>().ToTable("dictionary_imports").HasKey(x => x.Checksum);
        modelBuilder.Entity<MeaningProgress>(builder =>
        {
            builder.ToTable("meaning_progress", table => table.HasCheckConstraint("ck_meaning_progress_level", "level BETWEEN 0 AND 5"));
            builder.HasKey(x => x.MeaningId);
            builder.Property(x => x.MeaningId).HasColumnName("meaning_id");
            builder.Property(x => x.Level).HasColumnName("level");
            builder.Property(x => x.FirstLearnedAt).HasColumnName("first_learned_at");
            builder.Property(x => x.LastReviewedAt).HasColumnName("last_reviewed_at");
            builder.Property(x => x.NextReviewAt).HasColumnName("next_review_at");
            builder.HasOne<VocabularyMeaning>().WithOne(x => x.Progress).HasForeignKey<MeaningProgress>(x => x.MeaningId).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(x => x.Level);
            builder.HasIndex(x => x.NextReviewAt);
        });

        modelBuilder.Entity<Vocabulary>(builder =>
        {
            builder.ToTable("vocabularies");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id").HasColumnType("uuid").IsRequired().HasDefaultValueSql("gen_random_uuid()");
            builder.Property(x => x.UserId).HasColumnName("user_id").HasColumnType("uuid");
            builder.Property(x => x.Language).HasColumnName("language").HasColumnType("varchar(10)").IsRequired().HasDefaultValue("en");
            builder.Property(x => x.PhoneticReading).HasColumnName("phonetic_reading").HasColumnType("text");
            builder.Property(x => x.ScriptType).HasColumnName("script_type").HasColumnType("varchar(50)");
            builder.Property(x => x.IsSuspended).HasColumnName("is_suspended");
            builder.Property(x => x.Term).HasColumnName("term").HasColumnType("varchar(255)").IsRequired();
            builder.Property(x => x.NormalizedTerm).HasColumnName("normalized_term").HasColumnType("varchar(255)").IsRequired();
            builder.HasIndex(x => new { x.UserId, x.NormalizedTerm, x.Language }).HasDatabaseName("ix_vocabularies_user_term_lang");
            builder.HasIndex(x => new { x.UserId, x.Language }).HasDatabaseName("ix_vocabularies_user_lang");
            builder.Property(x => x.Ipa).HasColumnName("ipa").HasColumnType("varchar(160)");
            builder.Property(x => x.AudioUrl).HasColumnName("audio_url").HasColumnType("text");
            builder.Property(x => x.ImageUrl).HasColumnName("image_url").HasColumnType("text");
            builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz").IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz").IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.DeletedAt).HasColumnName("deleted_at").HasColumnType("timestamptz");
            builder.HasIndex(x => x.CreatedAt).HasDatabaseName("vocabularies_created_at_idx");
            builder.HasIndex(x => x.DeletedAt).HasDatabaseName("vocabularies_deleted_at_idx");
        });

        modelBuilder.Entity<VocabularyMeaning>(builder =>
        {
            builder.ToTable("vocabulary_meanings");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id").HasColumnType("uuid").IsRequired().HasDefaultValueSql("gen_random_uuid()");
            builder.Property(x => x.VocabularyId).HasColumnName("vocabulary_id").HasColumnType("uuid").IsRequired();
            builder.Property(x => x.DeletedAt).HasColumnName("deleted_at");
            builder.Property(x => x.DictionaryEntryId).HasColumnName("dictionary_entry_id");
            builder.Property(x => x.DictionaryDefinitionId).HasColumnName("dictionary_definition_id");
            builder.HasOne<DictionarySense>().WithMany()
                .HasForeignKey(x => new { x.DictionaryEntryId, x.DictionaryDefinitionId }).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(x => new { x.VocabularyId, x.DictionaryEntryId, x.DictionaryDefinitionId })
                .HasFilter("deleted_at IS NULL").IsUnique();
            builder.Property(x => x.MeaningVi).HasColumnName("meaning_vi").HasColumnType("text").IsRequired();
            builder.Property(x => x.PartOfSpeech).HasColumnName("part_of_speech").HasColumnType("varchar(40)");
            builder.Property(x => x.IpaOverride).HasColumnName("ipa_override").HasColumnType("varchar(160)");
            builder.Property(x => x.DisplayOrder).HasColumnName("display_order").HasColumnType("int").IsRequired().HasDefaultValue(1);
            builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz").IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz").IsRequired().HasDefaultValueSql("now()");
            builder.HasOne(x => x.Vocabulary).WithMany(x => x.VocabularyMeanings).HasForeignKey(x => x.VocabularyId).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(x => new { x.VocabularyId, x.DisplayOrder }).HasDatabaseName("vocabulary_meanings_vocabulary_id_display_order_key").HasFilter("deleted_at IS NULL").IsUnique();
        });

        modelBuilder.Entity<VocabularyExample>(builder =>
        {
            builder.ToTable("vocabulary_examples");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id").HasColumnType("uuid").IsRequired().HasDefaultValueSql("gen_random_uuid()");
            builder.Property(x => x.MeaningId).HasColumnName("meaning_id").HasColumnType("uuid").IsRequired();
            builder.Property(x => x.SentenceEn).HasColumnName("sentence_en").HasColumnType("text").IsRequired();
            builder.Property(x => x.SentenceVi).HasColumnName("sentence_vi").HasColumnType("text");
            builder.Property(x => x.ClozeSentenceEn).HasColumnName("cloze_sentence_en").HasColumnType("text");
            builder.Property(x => x.ClozeConfirmed).HasColumnName("cloze_confirmed");
            builder.Property(x => x.ClozeAnswer).HasColumnName("cloze_answer").HasColumnType("text");
            builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz").IsRequired().HasDefaultValueSql("now()");
            builder.HasOne(x => x.Meaning).WithMany(x => x.VocabularyExamples).HasForeignKey(x => x.MeaningId).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(x => x.MeaningId).HasDatabaseName("vocabulary_examples_meaning_id_idx");
        });

        modelBuilder.Entity<LearningProgress>(builder =>
        {
            builder.ToTable("learning_progress", table =>
            {
                table.HasCheckConstraint("ck_learning_progress_0", "level BETWEEN 0 AND 5");
            });
            builder.HasKey(x => x.VocabularyId);
            builder.Property(x => x.UserId).HasColumnName("user_id").HasColumnType("uuid");
            builder.Property(x => x.MappedMeaningId).HasColumnName("mapped_meaning_id");
            builder.Property(x => x.VocabularyId).HasColumnName("vocabulary_id").HasColumnType("uuid").IsRequired();
            builder.Property(x => x.Level).HasColumnName("level").HasColumnType("smallint").IsRequired().HasDefaultValue((short)0);
            builder.Property(x => x.FirstLearnedAt).HasColumnName("first_learned_at").HasColumnType("timestamptz");
            builder.Property(x => x.LastReviewedAt).HasColumnName("last_reviewed_at").HasColumnType("timestamptz");
            builder.Property(x => x.NextReviewAt).HasColumnName("next_review_at").HasColumnType("timestamptz");
            builder.Property(x => x.IsSuspended).HasColumnName("is_suspended").HasColumnType("boolean").IsRequired().HasDefaultValue(false);
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz").IsRequired().HasDefaultValueSql("now()");
            builder.HasOne(x => x.Vocabulary).WithOne(x => x.LearningProgress).HasForeignKey<LearningProgress>(x => x.VocabularyId).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(x => new { x.IsSuspended, x.NextReviewAt }).HasDatabaseName("learning_progress_is_suspended_next_review_at_idx");
            builder.HasIndex(x => x.Level).HasDatabaseName("learning_progress_level_idx");
        });

        modelBuilder.Entity<PracticeSession>(builder =>
        {
            builder.ToTable("practice_sessions");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id").HasColumnType("uuid").IsRequired().HasDefaultValueSql("gen_random_uuid()");
            builder.Property(x => x.UserId).HasColumnName("user_id").HasColumnType("uuid");
            builder.Property(x => x.Language).HasColumnName("language").HasColumnType("varchar(10)").IsRequired().HasDefaultValue("en");
            builder.Property(x => x.Status).HasColumnName("status").HasColumnType("practice_session_status").IsRequired().HasDefaultValue(PracticeSessionStatus.InProgress);
            builder.Property(x => x.StartedAt).HasColumnName("started_at").HasColumnType("timestamptz").IsRequired().HasDefaultValueSql("now()");
            builder.Property(x => x.FinishedAt).HasColumnName("finished_at").HasColumnType("timestamptz");
            builder.HasIndex(x => x.StartedAt).HasDatabaseName("practice_sessions_started_at_idx");
            builder.HasIndex(x => new { x.Status, x.StartedAt }).HasDatabaseName("practice_sessions_status_started_at_idx");
        });

        modelBuilder.Entity<SessionWord>(builder =>
        {
            builder.ToTable("session_words", table =>
            {
                table.HasCheckConstraint("ck_session_words_0", "level_at_start BETWEEN 0 AND 5");
            });
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id").HasColumnType("uuid").IsRequired().HasDefaultValueSql("gen_random_uuid()");
            builder.Property(x => x.SessionId).HasColumnName("session_id").HasColumnType("uuid").IsRequired();
            builder.Property(x => x.VocabularyId).HasColumnName("vocabulary_id").HasColumnType("uuid").IsRequired();
            builder.Property(x => x.Source).HasColumnName("source").HasColumnType("session_word_source").IsRequired();
            builder.Property(x => x.QuestionPlan).HasColumnName("question_plan").HasColumnType("jsonb");
            builder.Property(x => x.Position).HasColumnName("position").HasColumnType("int").IsRequired();
            builder.Property(x => x.LevelAtStart).HasColumnName("level_at_start").HasColumnType("smallint").IsRequired();
            builder.HasOne(x => x.Session).WithMany(x => x.SessionWords).HasForeignKey(x => x.SessionId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Vocabulary).WithMany(x => x.SessionWords).HasForeignKey(x => x.VocabularyId).OnDelete(DeleteBehavior.Restrict);
            builder.Property(x => x.MeaningId).HasColumnName("meaning_id");
            builder.Property(x => x.IsLegacy).HasColumnName("is_legacy");
            builder.HasOne(x => x.Meaning).WithMany().HasForeignKey(x => x.MeaningId).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(x => new { x.SessionId, x.MeaningId }).IsUnique();
            builder.HasIndex(x => x.MeaningId);
            builder.HasIndex(x => new { x.SessionId, x.Position }).HasDatabaseName("session_words_session_id_position_key").IsUnique();
            builder.HasIndex(x => x.VocabularyId).HasDatabaseName("session_words_vocabulary_id_idx");
        });

        modelBuilder.Entity<ExerciseAttempt>(builder =>
        {
            builder.ToTable("exercise_attempts");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id").HasColumnType("uuid").IsRequired().HasDefaultValueSql("gen_random_uuid()");
            builder.Property(x => x.SessionWordId).HasColumnName("session_word_id").HasColumnType("uuid").IsRequired();
            builder.Property(x => x.MeaningId).HasColumnName("meaning_id").HasColumnType("uuid");
            builder.Property(x => x.ExampleId).HasColumnName("example_id").HasColumnType("uuid");
            builder.Property(x => x.ExerciseType).HasColumnName("exercise_type").HasColumnType("exercise_type").IsRequired();
            builder.Property(x => x.Role).HasColumnName("role").HasColumnType("attempt_role").IsRequired().HasDefaultValue(AttemptRole.Assessment);
            builder.Property(x => x.QuestionSnapshot).HasColumnName("question_snapshot").HasColumnType("jsonb");
            builder.Property(x => x.SubmittedAnswer).HasColumnName("submitted_answer").HasColumnType("text");
            builder.Property(x => x.IsCorrect).HasColumnName("is_correct").HasColumnType("boolean").IsRequired();
            builder.Property(x => x.AnsweredAt).HasColumnName("answered_at").HasColumnType("timestamptz").IsRequired().HasDefaultValueSql("now()");
            builder.HasOne(x => x.SessionWord).WithMany(x => x.ExerciseAttempts).HasForeignKey(x => x.SessionWordId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Meaning).WithMany(x => x.ExerciseAttempts).HasForeignKey(x => x.MeaningId).OnDelete(DeleteBehavior.SetNull);
            builder.HasOne(x => x.Example).WithMany(x => x.ExerciseAttempts).HasForeignKey(x => x.ExampleId).OnDelete(DeleteBehavior.SetNull);
            builder.HasIndex(x => new { x.SessionWordId, x.AnsweredAt }).HasDatabaseName("exercise_attempts_session_word_id_answered_at_idx");
            builder.HasIndex(x => new { x.ExerciseType, x.AnsweredAt }).HasDatabaseName("exercise_attempts_exercise_type_answered_at_idx");
        });

        modelBuilder.Entity<ReviewEvaluation>(builder =>
        {
            builder.ToTable("review_evaluations", table =>
            {
                table.HasCheckConstraint("ck_review_evaluations_0", "level_before BETWEEN 0 AND 5");
                table.HasCheckConstraint("ck_review_evaluations_1", "level_after BETWEEN 0 AND 5");
            });
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id").HasColumnType("uuid").IsRequired().HasDefaultValueSql("gen_random_uuid()");
            builder.Property(x => x.SessionWordId).HasColumnName("session_word_id").HasColumnType("uuid").IsRequired();
            builder.HasIndex(x => x.SessionWordId).IsUnique();
            builder.Property(x => x.Outcome).HasColumnName("outcome").HasColumnType("review_outcome").IsRequired();
            builder.Property(x => x.LevelBefore).HasColumnName("level_before").HasColumnType("smallint").IsRequired();
            builder.Property(x => x.LevelAfter).HasColumnName("level_after").HasColumnType("smallint").IsRequired();
            builder.Property(x => x.PreviousReviewAt).HasColumnName("previous_review_at").HasColumnType("timestamptz");
            builder.Property(x => x.NextReviewAt).HasColumnName("next_review_at").HasColumnType("timestamptz");
            builder.Property(x => x.EvaluatedAt).HasColumnName("evaluated_at").HasColumnType("timestamptz").IsRequired().HasDefaultValueSql("now()");
            builder.HasOne(x => x.SessionWord).WithOne(x => x.ReviewEvaluation).HasForeignKey<ReviewEvaluation>(x => x.SessionWordId).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(x => x.EvaluatedAt).HasDatabaseName("review_evaluations_evaluated_at_idx");
            builder.HasIndex(x => new { x.LevelAfter, x.EvaluatedAt }).HasDatabaseName("review_evaluations_level_after_evaluated_at_idx");
        });

        modelBuilder.Entity<FlashcardReview>(builder =>
        {
            builder.ToTable("flashcard_reviews");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id").HasColumnType("uuid").IsRequired().HasDefaultValueSql("gen_random_uuid()");
            builder.Property(x => x.UserId).HasColumnName("user_id").HasColumnType("uuid");
            builder.Property(x => x.VocabularyId).HasColumnName("vocabulary_id").HasColumnType("uuid").IsRequired();
            builder.Property(x => x.MeaningId).HasColumnName("meaning_id").HasColumnType("uuid");
            builder.Property(x => x.Rating).HasColumnName("rating").HasColumnType("flashcard_rating").IsRequired();
            builder.Property(x => x.ReviewedAt).HasColumnName("reviewed_at").HasColumnType("timestamptz").IsRequired().HasDefaultValueSql("now()");
            builder.HasOne(x => x.Vocabulary).WithMany(x => x.FlashcardReviews).HasForeignKey(x => x.VocabularyId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Meaning).WithMany(x => x.FlashcardReviews).HasForeignKey(x => x.MeaningId).OnDelete(DeleteBehavior.SetNull);
            builder.HasIndex(x => new { x.VocabularyId, x.ReviewedAt }).HasDatabaseName("flashcard_reviews_vocabulary_id_reviewed_at_idx");
            builder.HasIndex(x => x.ReviewedAt).HasDatabaseName("flashcard_reviews_reviewed_at_idx");
        });
    }
}
