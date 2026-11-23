using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VoP.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiUserAndMultiLanguage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "vocabularies",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "language",
                table: "vocabularies",
                type: "varchar(10)",
                nullable: false,
                defaultValue: "en");

            migrationBuilder.AddColumn<string>(
                name: "phonetic_reading",
                table: "vocabularies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "script_type",
                table: "vocabularies",
                type: "varchar(50)",
                nullable: true);

            migrationBuilder.DropIndex(
                name: "IX_vocabularies_normalized_term",
                table: "vocabularies");

            migrationBuilder.CreateIndex(
                name: "ix_vocabularies_user_term_lang",
                table: "vocabularies",
                columns: new[] { "user_id", "normalized_term", "language" });

            migrationBuilder.CreateIndex(
                name: "ix_vocabularies_user_lang",
                table: "vocabularies",
                columns: new[] { "user_id", "language" });

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "learning_progress",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_learning_progress_user_id_next_review_at",
                table: "learning_progress",
                columns: new[] { "user_id", "next_review_at" });

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "practice_sessions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "language",
                table: "practice_sessions",
                type: "varchar(10)",
                nullable: false,
                defaultValue: "en");

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "flashcard_reviews",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_vocabularies_user_term_lang",
                table: "vocabularies");

            migrationBuilder.DropIndex(
                name: "ix_vocabularies_user_lang",
                table: "vocabularies");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "vocabularies");

            migrationBuilder.DropColumn(
                name: "language",
                table: "vocabularies");

            migrationBuilder.DropColumn(
                name: "phonetic_reading",
                table: "vocabularies");

            migrationBuilder.DropColumn(
                name: "script_type",
                table: "vocabularies");

            migrationBuilder.CreateIndex(
                name: "IX_vocabularies_normalized_term",
                table: "vocabularies",
                column: "normalized_term",
                unique: true);

            migrationBuilder.DropIndex(
                name: "IX_learning_progress_user_id_next_review_at",
                table: "learning_progress");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "learning_progress");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "practice_sessions");

            migrationBuilder.DropColumn(
                name: "language",
                table: "practice_sessions");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "flashcard_reviews");
        }
    }
}
