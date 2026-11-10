using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VoP.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddSessionQuestionPlans : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "question_plan",
                table: "session_words",
                type: "jsonb",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "question_plan",
                table: "session_words");
        }
    }
}
