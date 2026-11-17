using VoP.Service.Common;

namespace VoP.Service.Vocabularies;

public interface IService
{
    Task<Page<VocabularyResponse>> List(string? search, int page, int pageSize, CancellationToken ct, int? level = null, bool dueOnly = false, string sort = "recent", string? exactTerm = null);
    Task<VocabularyResponse> Get(Guid id, CancellationToken ct);
    Task<VocabularyResponse> Save(Guid? id, VocabularyRequest request, CancellationToken ct, bool append = false);
    Task<VocabularyResponse> LinkSource(Guid id, Guid meaningId, DictionarySourceRequest request, CancellationToken ct);
    Task Delete(Guid id, CancellationToken ct);
    Task<VocabularyResponse> Pronunciation(Guid id, PronunciationRequest request, CancellationToken ct);
}
