using VoP.Repository.Enums;

namespace VoP.Repository.Entities;

public class PracticeSession
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string Language { get; set; } = "en";
    public PracticeSessionStatus Status { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? FinishedAt { get; set; }
    public ICollection<SessionWord> SessionWords { get; set; } = new List<SessionWord>();
}
