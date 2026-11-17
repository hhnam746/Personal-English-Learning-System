using VoP.Repository.Entities;

namespace VoP.Service.Vocabularies;

public record VocabularyResponse(Guid Id,
    string Term,
    string? Ipa,
    string? AudioUrl,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    IReadOnlyList<MeaningResponse> Meanings,
    short Level,
    DateTimeOffset? NextReviewAt,
    bool IsSuspended,
    bool MixedLevels = false)
{
    public static VocabularyResponse From(Vocabulary v, Guid? meaningId = null)
    {
        var meanings = v.VocabularyMeanings.Where(m => m.DeletedAt == null && (meaningId == null || meaningId == m.Id))
            .OrderBy(m => m.DisplayOrder).ToArray();
        return new(v.Id,
         v.Term,
         v.Ipa,
         v.AudioUrl,
         v.CreatedAt,
         v.UpdatedAt,
         meanings
        .Select(m => new MeaningResponse(m.Id,
         m.MeaningVi,
         m.PartOfSpeech,
         m.IpaOverride,
         m.DisplayOrder,
         m.DictionaryEntryId,
         m.DictionaryDefinitionId,
         m.Progress?.Level ?? 0,
         m.Progress?.NextReviewAt,
         m.VocabularyExamples
        .OrderBy(e => e.Id)
        .Select(e => new ExampleResponse(e.Id, e.SentenceEn, e.SentenceVi, e.ClozeSentenceEn, e.ClozeAnswer, e.ClozeConfirmed))
        .ToArray()))
        .ToArray(),
        meanings.Select(m => m.Progress?.Level ?? (short)0).DefaultIfEmpty().Min(),
        meanings.Select(m => m.Progress?.NextReviewAt).Min(),
        v.IsSuspended,
        meanings.Select(m => m.Progress?.Level ?? (short)0).Distinct().Skip(1).Any());
    }
}

public record MeaningResponse(Guid Id,
    string MeaningVi,
    string? PartOfSpeech,
    string? IpaOverride,
    int DisplayOrder,
    long? DictionaryEntryId,
    long? DictionaryDefinitionId,
    short Level,
    DateTimeOffset? NextReviewAt,
    IReadOnlyList<ExampleResponse> Examples);

public record ExampleResponse(Guid Id, string SentenceEn, string? SentenceVi, string? ClozeSentenceEn, string? ClozeAnswer, bool ClozeConfirmed);
