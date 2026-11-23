using System.ComponentModel.DataAnnotations;
using VoP.Repository.Enums;

namespace VoP.Service.Practice;

public sealed class SessionRequest
{
    [Range(1, 12)]
    public int Limit { get; set; } = 12;
    [StringLength(10)]
    public string Language { get; set; } = "en";
    [MaxLength(12)]
    public List<Guid>? VocabularyIds { get; set; }
    [MaxLength(12)]
    public List<Guid>? MeaningIds { get; set; }
    public bool ExtraPractice { get; set; }
    public bool AudioEnabled { get; set; } = true;
}

public record AnswerRequest(Guid QuestionId, [Required, StringLength(5000)] string Answer);
