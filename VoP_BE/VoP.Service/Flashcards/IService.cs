using VoP.Service.Common;
using VoP.Service.Vocabularies;

namespace VoP.Service.Flashcards;

public interface IService
{
    Task<Page<VocabularyResponse>> List(int? level, int page, int pageSize, CancellationToken ct);
    Task<ReviewResponse> Rate(Guid id, RatingRequest request, CancellationToken ct);
    Task<Page<ReviewResponse>> History(Guid? vocabularyId, int page, int pageSize, CancellationToken ct);
}
