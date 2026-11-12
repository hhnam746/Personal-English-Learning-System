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
    bool IsSuspended)
{
    public static VocabularyResponse From(Vocabulary v) => new(v.Id,
         v.Term,
         v.Ipa,
         v.AudioUrl,
         v.CreatedAt,
         v.UpdatedAt,
         v.VocabularyMeanings
        .OrderBy(m => m.DisplayOrder)
        .Select(m => new MeaningResponse(m.Id,
         m.MeaningVi,
         m.PartOfSpeech,
         m.IpaOverride,
         m.DisplayOrder,
         m.VocabularyExamples
        .OrderBy(e => e.Id)
        .Select(e => new ExampleResponse(e.Id, e.SentenceEn, e.SentenceVi, e.ClozeSentenceEn, e.ClozeAnswer))
        .ToArray()))
        .ToArray(),
        v.LearningProgress?.Level ?? 0,
        v.LearningProgress?.NextReviewAt,
        v.LearningProgress?.IsSuspended ?? false);
}

public record MeaningResponse(Guid Id,
    string MeaningVi,
    string? PartOfSpeech,
    string? IpaOverride,
    int DisplayOrder,
    IReadOnlyList<ExampleResponse> Examples);

public record ExampleResponse(Guid Id, string SentenceEn, string? SentenceVi, string? ClozeSentenceEn, string? ClozeAnswer);
