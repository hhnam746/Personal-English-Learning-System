using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using VoP.Repository.Enums;

namespace VoP.Service.Flashcards;

public record RatingRequest(Guid? MeaningId,
    [property: JsonRequired][EnumDataType(typeof(FlashcardRating))] FlashcardRating Rating);
