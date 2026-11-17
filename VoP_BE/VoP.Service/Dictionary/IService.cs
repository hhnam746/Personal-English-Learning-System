namespace VoP.Service.Dictionary;

public interface IService
{
    Task<Suggestion[]> Search(string query, CancellationToken ct);
    Task<Entry> Get(long id, CancellationToken ct);
}
