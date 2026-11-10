using System.ComponentModel.DataAnnotations;

namespace VoP.Service.Vocabularies;

public sealed class VocabularyRequest
{
    [Required, StringLength(255)]
    public string Term { get; set; } = "";
    [StringLength(160)]
    public string? Ipa { get; set; }
    [StringLength(2048)]
    public string? AudioUrl { get; set; }
    [Required, MinLength(1), MaxLength(30)]
    public List<MeaningRequest> Meanings { get; set; } = [];
}

public sealed class MeaningRequest
{
    public Guid? Id { get; set; }
    [Required, StringLength(3000)]
    public string MeaningVi { get; set; } = "";
    [StringLength(40)]
    public string? PartOfSpeech { get; set; }
    [StringLength(160)]
    public string? IpaOverride { get; set; }
    [Required, MaxLength(30)]
    public List<ExampleRequest> Examples { get; set; } = [];
}

public sealed class ExampleRequest
{
    public Guid? Id { get; set; }
    [Required, StringLength(5000)]
    public string SentenceEn { get; set; } = "";
    [StringLength(5000)]
    public string? SentenceVi { get; set; }
    [StringLength(5000)]
    public string? ClozeSentenceEn { get; set; }
    [StringLength(255)]
    public string? ClozeAnswer { get; set; }
}

public sealed record PronunciationRequest([StringLength(160)] string? Ipa, [StringLength(2048)] string? AudioUrl);
