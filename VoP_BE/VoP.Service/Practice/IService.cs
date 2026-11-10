using VoP.Service.Common;

namespace VoP.Service.Practice;

public interface IService
{
    Task<SessionResponse> Create(SessionRequest request, CancellationToken ct);
    Task<SessionResponse> Get(Guid id, CancellationToken ct);
    Task<Page<SessionResponse>> List(int page, int pageSize, CancellationToken ct);
    Task<QuestionResponse?> Next(Guid id, CancellationToken ct);
    Task<AnswerResponse> Answer(Guid id, AnswerRequest request, CancellationToken ct);
    Task<SessionResponse> Finish(Guid id, bool abandon, CancellationToken ct);
    Task<Page<AttemptResponse>> Attempts(Guid id, int page, int pageSize, CancellationToken ct);
}
