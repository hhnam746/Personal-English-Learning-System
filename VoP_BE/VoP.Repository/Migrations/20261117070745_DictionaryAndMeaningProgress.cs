using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VoP.Repository.Migrations
{
    /// <inheritdoc />
    public partial class DictionaryAndMeaningProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "vocabulary_meanings_vocabulary_id_display_order_key",
                table: "vocabulary_meanings");

            migrationBuilder.DropIndex(
                name: "session_words_session_id_vocabulary_id_key",
                table: "session_words");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "deleted_at",
                table: "vocabulary_meanings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "dictionary_definition_id",
                table: "vocabulary_meanings",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "dictionary_entry_id",
                table: "vocabulary_meanings",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "cloze_confirmed",
                table: "vocabulary_examples",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_suspended",
                table: "vocabularies",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_legacy",
                table: "session_words",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "meaning_id",
                table: "session_words",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "mapped_meaning_id",
                table: "learning_progress",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "dictionary_entries",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    Term = table.Column<string>(type: "text", nullable: false),
                    NormalizedTerm = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dictionary_entries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "dictionary_imports",
                columns: table => new
                {
                    Checksum = table.Column<string>(type: "text", nullable: false),
                    ImportedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Source = table.Column<string>(type: "text", nullable: false),
                    License = table.Column<string>(type: "text", nullable: false),
                    Statistics = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dictionary_imports", x => x.Checksum);
                });

            migrationBuilder.CreateTable(
                name: "meaning_progress",
                columns: table => new
                {
                    meaning_id = table.Column<Guid>(type: "uuid", nullable: false),
                    level = table.Column<short>(type: "smallint", nullable: false),
                    first_learned_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    last_reviewed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    next_review_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_meaning_progress", x => x.meaning_id);
                    table.CheckConstraint("ck_meaning_progress_level", "level BETWEEN 0 AND 5");
                    table.ForeignKey(
                        name: "FK_meaning_progress_vocabulary_meanings_meaning_id",
                        column: x => x.meaning_id,
                        principalTable: "vocabulary_meanings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "dictionary_pronunciations",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    EntryId = table.Column<long>(type: "bigint", nullable: false),
                    Ipa = table.Column<string>(type: "text", nullable: false),
                    Region = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dictionary_pronunciations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_dictionary_pronunciations_dictionary_entries_EntryId",
                        column: x => x.EntryId,
                        principalTable: "dictionary_entries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "dictionary_senses",
                columns: table => new
                {
                    EntryId = table.Column<long>(type: "bigint", nullable: false),
                    DefinitionId = table.Column<long>(type: "bigint", nullable: false),
                    MeaningVi = table.Column<string>(type: "text", nullable: false),
                    PartOfSpeech = table.Column<string>(type: "text", nullable: true),
                    SubPartOfSpeech = table.Column<string>(type: "text", nullable: true),
                    Examples = table.Column<string[]>(type: "text[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dictionary_senses", x => new { x.EntryId, x.DefinitionId });
                    table.ForeignKey(
                        name: "FK_dictionary_senses_dictionary_entries_EntryId",
                        column: x => x.EntryId,
                        principalTable: "dictionary_entries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_vocabulary_meanings_vocabulary_id_dictionary_entry_id_dicti~",
                table: "vocabulary_meanings",
                columns: new[] { "vocabulary_id", "dictionary_entry_id", "dictionary_definition_id" },
                unique: true,
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "vocabulary_meanings_vocabulary_id_display_order_key",
                table: "vocabulary_meanings",
                columns: new[] { "vocabulary_id", "display_order" },
                unique: true,
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_session_words_meaning_id",
                table: "session_words",
                column: "meaning_id");

            migrationBuilder.CreateIndex(
                name: "IX_session_words_session_id_meaning_id",
                table: "session_words",
                columns: new[] { "session_id", "meaning_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_dictionary_entries_NormalizedTerm",
                table: "dictionary_entries",
                column: "NormalizedTerm")
                .Annotation("Npgsql:IndexOperators", new[] { "text_pattern_ops" });

            migrationBuilder.CreateIndex(
                name: "IX_dictionary_pronunciations_EntryId",
                table: "dictionary_pronunciations",
                column: "EntryId");

            migrationBuilder.CreateIndex(
                name: "IX_meaning_progress_level",
                table: "meaning_progress",
                column: "level");

            migrationBuilder.CreateIndex(
                name: "IX_meaning_progress_next_review_at",
                table: "meaning_progress",
                column: "next_review_at");

            migrationBuilder.AddForeignKey(
                name: "FK_session_words_vocabulary_meanings_meaning_id",
                table: "session_words",
                column: "meaning_id",
                principalTable: "vocabulary_meanings",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_vocabulary_meanings_dictionary_senses_dictionary_entry_id_d~",
                table: "vocabulary_meanings",
                columns: new[] { "dictionary_entry_id", "dictionary_definition_id" },
                principalTable: "dictionary_senses",
                principalColumns: new[] { "EntryId", "DefinitionId" },
                onDelete: ReferentialAction.Restrict);
            migrationBuilder.Sql("""
                UPDATE vocabularies v SET is_suspended = p.is_suspended
                FROM learning_progress p WHERE p.vocabulary_id = v.id;

                UPDATE session_words SET is_legacy = true;

                WITH evidence AS (
                    SELECT s.id, s.vocabulary_id, min(a.meaning_id::text)::uuid AS meaning_id
                    FROM session_words s
                    JOIN review_evaluations r ON r.session_word_id = s.id
                    JOIN exercise_attempts a ON a.session_word_id = s.id
                        AND a.role::text = 'assessment'
                        AND a.exercise_type::text IN ('meaning_mcq', 'fill_blank')
                    LEFT JOIN vocabulary_meanings m ON m.id = a.meaning_id AND m.vocabulary_id = s.vocabulary_id
                    GROUP BY s.id, s.vocabulary_id
                    HAVING count(DISTINCT m.id) = 1 AND count(m.id) = count(*)
                       AND bool_and(a.question_snapshot->>'MeaningId' IS NULL
                           OR a.question_snapshot->>'MeaningId' = a.meaning_id::text)
                )
                UPDATE session_words s SET meaning_id = e.meaning_id
                FROM evidence e WHERE e.id = s.id;

                WITH chain AS (
                    SELECT s.vocabulary_id, s.meaning_id, r.level_after, r.next_review_at, r.evaluated_at,
                        r.level_before, r.previous_review_at,
                        lag(r.level_after, 1, 0::smallint) OVER history AS preceding_level,
                        lag(r.evaluated_at) OVER history AS preceding_review,
                        row_number() OVER (
                            PARTITION BY s.vocabulary_id ORDER BY r.evaluated_at DESC, r.id DESC) AS newest
                    FROM review_evaluations r JOIN session_words s ON s.id = r.session_word_id
                    WINDOW history AS (PARTITION BY s.vocabulary_id ORDER BY r.evaluated_at, r.id)
                ), reliable AS (
                    SELECT vocabulary_id, min(meaning_id::text)::uuid AS meaning_id
                    FROM chain GROUP BY vocabulary_id
                    HAVING count(DISTINCT meaning_id) = 1 AND count(meaning_id) = count(*)
                        AND bool_and(level_before = preceding_level
                            AND previous_review_at IS NOT DISTINCT FROM preceding_review)
                )
                UPDATE learning_progress p SET mapped_meaning_id = m.meaning_id
                FROM reliable m JOIN chain c ON c.vocabulary_id = m.vocabulary_id AND c.newest = 1
                WHERE p.vocabulary_id = m.vocabulary_id AND p.level = c.level_after
                    AND p.last_reviewed_at = c.evaluated_at
                    AND p.next_review_at IS NOT DISTINCT FROM c.next_review_at;

                INSERT INTO meaning_progress (meaning_id, level, first_learned_at, last_reviewed_at, next_review_at)
                SELECT m.id, coalesce(p.level, 0), p.first_learned_at, p.last_reviewed_at, p.next_review_at
                FROM vocabulary_meanings m LEFT JOIN learning_progress p ON p.mapped_meaning_id=m.id;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_session_words_vocabulary_meanings_meaning_id",
                table: "session_words");

            migrationBuilder.DropForeignKey(
                name: "FK_vocabulary_meanings_dictionary_senses_dictionary_entry_id_d~",
                table: "vocabulary_meanings");

            migrationBuilder.DropTable(
                name: "dictionary_imports");

            migrationBuilder.DropTable(
                name: "dictionary_pronunciations");

            migrationBuilder.DropTable(
                name: "dictionary_senses");

            migrationBuilder.DropTable(
                name: "meaning_progress");

            migrationBuilder.DropTable(
                name: "dictionary_entries");

            migrationBuilder.DropIndex(
                name: "IX_vocabulary_meanings_vocabulary_id_dictionary_entry_id_dicti~",
                table: "vocabulary_meanings");

            migrationBuilder.DropIndex(
                name: "vocabulary_meanings_vocabulary_id_display_order_key",
                table: "vocabulary_meanings");

            migrationBuilder.DropIndex(
                name: "IX_session_words_meaning_id",
                table: "session_words");

            migrationBuilder.DropIndex(
                name: "IX_session_words_session_id_meaning_id",
                table: "session_words");

            migrationBuilder.DropColumn(
                name: "deleted_at",
                table: "vocabulary_meanings");

            migrationBuilder.DropColumn(
                name: "dictionary_definition_id",
                table: "vocabulary_meanings");

            migrationBuilder.DropColumn(
                name: "dictionary_entry_id",
                table: "vocabulary_meanings");

            migrationBuilder.DropColumn(
                name: "cloze_confirmed",
                table: "vocabulary_examples");

            migrationBuilder.DropColumn(
                name: "is_suspended",
                table: "vocabularies");

            migrationBuilder.DropColumn(
                name: "is_legacy",
                table: "session_words");

            migrationBuilder.DropColumn(
                name: "meaning_id",
                table: "session_words");

            migrationBuilder.DropColumn(
                name: "mapped_meaning_id",
                table: "learning_progress");

            migrationBuilder.CreateIndex(
                name: "vocabulary_meanings_vocabulary_id_display_order_key",
                table: "vocabulary_meanings",
                columns: new[] { "vocabulary_id", "display_order" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "session_words_session_id_vocabulary_id_key",
                table: "session_words",
                columns: new[] { "session_id", "vocabulary_id" },
                unique: true);
        }
    }
}
