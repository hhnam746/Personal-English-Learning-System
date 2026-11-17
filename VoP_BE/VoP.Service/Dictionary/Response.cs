namespace VoP.Service.Dictionary;

public record Suggestion(long Id, string Term, string? Ipa, string? Region, string[] PartsOfSpeech, string? MeaningPreview);
public record Sense(long DefinitionId, string MeaningVi, string? PartOfSpeech, string? SubPartOfSpeech, string[] Examples);
public record Entry(Suggestion Word, Sense[] Meanings);
