using VoP.Repository.Enums;

namespace VoP.Repository.Entities;

public class PracticeSession
{
    public Guid Id { get; set; }
    public PracticeSessionStatus Status { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? FinishedAt { get; set; }
    public ICollection<SessionWord> SessionWords { get; set; } = new List<SessionWord>();
}
