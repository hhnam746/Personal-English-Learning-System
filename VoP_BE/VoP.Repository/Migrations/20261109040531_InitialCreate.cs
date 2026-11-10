using System;
using Microsoft.EntityFrameworkCore.Migrations;
using VoP.Repository.Enums;

#nullable disable

namespace VoP.Repository.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:attempt_role", "assessment,reinforcement")
                .Annotation("Npgsql:Enum:exercise_type", "meaning_mcq,listen_choose,listen_type,fill_blank")
                .Annotation("Npgsql:Enum:flashcard_rating", "remembered,forgotten")
                .Annotation("Npgsql:Enum:practice_session_status", "in_progress,completed,abandoned")
                .Annotation("Npgsql:Enum:review_outcome", "passed,failed")
                .Annotation("Npgsql:Enum:session_word_source", "new_word,due_review,extra_practice");

            migrationBuilder.CreateTable(
                name: "practice_sessions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    status = table.Column<PracticeSessionStatus>(type: "practice_session_status", nullable: false, defaultValue: PracticeSessionStatus.InProgress),
                    started_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()"),
                    finished_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_practice_sessions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "vocabularies",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    term = table.Column<string>(type: "varchar(255)", nullable: false),
                    normalized_term = table.Column<string>(type: "varchar(255)", nullable: false),
                    ipa = table.Column<string>(type: "varchar(160)", nullable: true),
                    audio_url = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()"),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vocabularies", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "learning_progress",
                columns: table => new
                {
                    vocabulary_id = table.Column<Guid>(type: "uuid", nullable: false),
                    level = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    first_learned_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    last_reviewed_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    next_review_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    is_suspended = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_learning_progress", x => x.vocabulary_id);
                    table.CheckConstraint("ck_learning_progress_0", "level BETWEEN 0 AND 5");
                    table.ForeignKey(
                        name: "FK_learning_progress_vocabularies_vocabulary_id",
                        column: x => x.vocabulary_id,
                        principalTable: "vocabularies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "session_words",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    vocabulary_id = table.Column<Guid>(type: "uuid", nullable: false),
                    source = table.Column<SessionWordSource>(type: "session_word_source", nullable: false),
                    position = table.Column<int>(type: "int", nullable: false),
                    level_at_start = table.Column<short>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_session_words", x => x.id);
                    table.CheckConstraint("ck_session_words_0", "level_at_start BETWEEN 0 AND 5");
                    table.ForeignKey(
                        name: "FK_session_words_practice_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "practice_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_session_words_vocabularies_vocabulary_id",
                        column: x => x.vocabulary_id,
                        principalTable: "vocabularies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "vocabulary_meanings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    vocabulary_id = table.Column<Guid>(type: "uuid", nullable: false),
                    meaning_vi = table.Column<string>(type: "text", nullable: false),
                    part_of_speech = table.Column<string>(type: "varchar(40)", nullable: true),
                    ipa_override = table.Column<string>(type: "varchar(160)", nullable: true),
                    display_order = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    created_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vocabulary_meanings", x => x.id);
                    table.ForeignKey(
                        name: "FK_vocabulary_meanings_vocabularies_vocabulary_id",
                        column: x => x.vocabulary_id,
                        principalTable: "vocabularies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "review_evaluations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    session_word_id = table.Column<Guid>(type: "uuid", nullable: false),
                    outcome = table.Column<ReviewOutcome>(type: "review_outcome", nullable: false),
                    level_before = table.Column<short>(type: "smallint", nullable: false),
                    level_after = table.Column<short>(type: "smallint", nullable: false),
                    previous_review_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    next_review_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    evaluated_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_review_evaluations", x => x.id);
                    table.CheckConstraint("ck_review_evaluations_0", "level_before BETWEEN 0 AND 5");
                    table.CheckConstraint("ck_review_evaluations_1", "level_after BETWEEN 0 AND 5");
                    table.ForeignKey(
                        name: "FK_review_evaluations_session_words_session_word_id",
                        column: x => x.session_word_id,
                        principalTable: "session_words",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "flashcard_reviews",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    vocabulary_id = table.Column<Guid>(type: "uuid", nullable: false),
                    meaning_id = table.Column<Guid>(type: "uuid", nullable: true),
                    rating = table.Column<FlashcardRating>(type: "flashcard_rating", nullable: false),
                    reviewed_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_flashcard_reviews", x => x.id);
                    table.ForeignKey(
                        name: "FK_flashcard_reviews_vocabularies_vocabulary_id",
                        column: x => x.vocabulary_id,
                        principalTable: "vocabularies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_flashcard_reviews_vocabulary_meanings_meaning_id",
                        column: x => x.meaning_id,
                        principalTable: "vocabulary_meanings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "vocabulary_examples",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    meaning_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sentence_en = table.Column<string>(type: "text", nullable: false),
                    sentence_vi = table.Column<string>(type: "text", nullable: true),
                    cloze_sentence_en = table.Column<string>(type: "text", nullable: true),
                    cloze_answer = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vocabulary_examples", x => x.id);
                    table.ForeignKey(
                        name: "FK_vocabulary_examples_vocabulary_meanings_meaning_id",
                        column: x => x.meaning_id,
                        principalTable: "vocabulary_meanings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exercise_attempts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    session_word_id = table.Column<Guid>(type: "uuid", nullable: false),
                    meaning_id = table.Column<Guid>(type: "uuid", nullable: true),
                    example_id = table.Column<Guid>(type: "uuid", nullable: true),
                    exercise_type = table.Column<ExerciseType>(type: "exercise_type", nullable: false),
                    role = table.Column<AttemptRole>(type: "attempt_role", nullable: false, defaultValue: AttemptRole.Assessment),
                    question_snapshot = table.Column<string>(type: "jsonb", nullable: true),
                    submitted_answer = table.Column<string>(type: "text", nullable: true),
                    is_correct = table.Column<bool>(type: "boolean", nullable: false),
                    answered_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_exercise_attempts", x => x.id);
                    table.ForeignKey(
                        name: "FK_exercise_attempts_session_words_session_word_id",
                        column: x => x.session_word_id,
                        principalTable: "session_words",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_exercise_attempts_vocabulary_examples_example_id",
                        column: x => x.example_id,
                        principalTable: "vocabulary_examples",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_exercise_attempts_vocabulary_meanings_meaning_id",
                        column: x => x.meaning_id,
                        principalTable: "vocabulary_meanings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "exercise_attempts_exercise_type_answered_at_idx",
                table: "exercise_attempts",
                columns: new[] { "exercise_type", "answered_at" });

            migrationBuilder.CreateIndex(
                name: "exercise_attempts_session_word_id_answered_at_idx",
                table: "exercise_attempts",
                columns: new[] { "session_word_id", "answered_at" });

            migrationBuilder.CreateIndex(
                name: "flashcard_reviews_reviewed_at_idx",
                table: "flashcard_reviews",
                column: "reviewed_at");

            migrationBuilder.CreateIndex(
                name: "flashcard_reviews_vocabulary_id_reviewed_at_idx",
                table: "flashcard_reviews",
                columns: new[] { "vocabulary_id", "reviewed_at" });

            migrationBuilder.CreateIndex(
                name: "learning_progress_is_suspended_next_review_at_idx",
                table: "learning_progress",
                columns: new[] { "is_suspended", "next_review_at" });

            migrationBuilder.CreateIndex(
                name: "learning_progress_level_idx",
                table: "learning_progress",
                column: "level");

            migrationBuilder.CreateIndex(
                name: "practice_sessions_started_at_idx",
                table: "practice_sessions",
                column: "started_at");

            migrationBuilder.CreateIndex(
                name: "practice_sessions_status_started_at_idx",
                table: "practice_sessions",
                columns: new[] { "status", "started_at" });

            migrationBuilder.CreateIndex(
                name: "IX_review_evaluations_session_word_id",
                table: "review_evaluations",
                column: "session_word_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "review_evaluations_evaluated_at_idx",
                table: "review_evaluations",
                column: "evaluated_at");

            migrationBuilder.CreateIndex(
                name: "review_evaluations_level_after_evaluated_at_idx",
                table: "review_evaluations",
                columns: new[] { "level_after", "evaluated_at" });

            migrationBuilder.CreateIndex(
                name: "session_words_session_id_position_key",
                table: "session_words",
                columns: new[] { "session_id", "position" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "session_words_session_id_vocabulary_id_key",
                table: "session_words",
                columns: new[] { "session_id", "vocabulary_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "session_words_vocabulary_id_idx",
                table: "session_words",
                column: "vocabulary_id");

            migrationBuilder.CreateIndex(
                name: "IX_vocabularies_normalized_term",
                table: "vocabularies",
                column: "normalized_term",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "vocabularies_created_at_idx",
                table: "vocabularies",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "vocabularies_deleted_at_idx",
                table: "vocabularies",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "vocabulary_examples_meaning_id_idx",
                table: "vocabulary_examples",
                column: "meaning_id");

            migrationBuilder.CreateIndex(
                name: "vocabulary_meanings_vocabulary_id_display_order_key",
                table: "vocabulary_meanings",
                columns: new[] { "vocabulary_id", "display_order" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "exercise_attempts");

            migrationBuilder.DropTable(
                name: "flashcard_reviews");

            migrationBuilder.DropTable(
                name: "learning_progress");

            migrationBuilder.DropTable(
                name: "review_evaluations");

            migrationBuilder.DropTable(
                name: "vocabulary_examples");

            migrationBuilder.DropTable(
                name: "session_words");

            migrationBuilder.DropTable(
                name: "vocabulary_meanings");

            migrationBuilder.DropTable(
                name: "practice_sessions");

            migrationBuilder.DropTable(
                name: "vocabularies");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:Enum:attempt_role", "assessment,reinforcement")
                .OldAnnotation("Npgsql:Enum:exercise_type", "meaning_mcq,listen_choose,listen_type,fill_blank")
                .OldAnnotation("Npgsql:Enum:flashcard_rating", "remembered,forgotten")
                .OldAnnotation("Npgsql:Enum:practice_session_status", "in_progress,completed,abandoned")
                .OldAnnotation("Npgsql:Enum:review_outcome", "passed,failed")
                .OldAnnotation("Npgsql:Enum:session_word_source", "new_word,due_review,extra_practice");
        }
    }
}
