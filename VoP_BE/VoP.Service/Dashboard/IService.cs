namespace VoP.Service.Dashboard;

public interface IService
{
    Task<DashboardResponse> Get(int days, CancellationToken ct);
}
