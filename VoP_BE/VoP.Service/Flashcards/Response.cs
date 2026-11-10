using VoP.Repository.Enums;

namespace VoP.Service.Flashcards;

public record ReviewResponse(Guid Id, Guid VocabularyId, Guid? MeaningId, FlashcardRating Rating, DateTimeOffset ReviewedAt);
