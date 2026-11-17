using VoP.Service.Common;

namespace VoP.Service.Learning;

public interface IService
{
    Task<Page<ProgressResponse>> List(int? level, bool dueOnly, bool? suspended, int page, int pageSize, CancellationToken ct);
    Task<WordProgressResponse> Get(Guid id, CancellationToken ct);
    Task<WordProgressResponse> Suspend(Guid id, bool suspended, CancellationToken ct);
    Task<Page<EvaluationResponse>> History(Guid id, int page, int pageSize, CancellationToken ct);
}
