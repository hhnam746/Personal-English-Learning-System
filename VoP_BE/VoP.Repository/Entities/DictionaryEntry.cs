namespace VoP.Repository.Entities;

public sealed class DictionaryEntry
{
    public long Id { get; set; }
    public string Term { get; set; } = "";
    public string NormalizedTerm { get; set; } = "";
    public List<DictionarySense> Senses { get; set; } = [];
    public List<DictionaryPronunciation> Pronunciations { get; set; } = [];
}

public sealed class DictionarySense
{
    public long EntryId { get; set; }
    public long DefinitionId { get; set; }
    public string MeaningVi { get; set; } = "";
    public string? PartOfSpeech { get; set; }
    public string? SubPartOfSpeech { get; set; }
    public string[] Examples { get; set; } = [];
}

public sealed class DictionaryPronunciation
{
    public long Id { get; set; }
    public long EntryId { get; set; }
    public string Ipa { get; set; } = "";
    public string? Region { get; set; }
}

public sealed class DictionaryImport
{
    public string Checksum { get; set; } = "";
    public DateTimeOffset ImportedAt { get; set; }
    public string Source { get; set; } = "";
    public string License { get; set; } = "";
    public string Statistics { get; set; } = "";
}
