using System.Text.RegularExpressions;
using VoP.Repository.Entities;

namespace VoP.Service.Common;

public static class Cloze
{
    public const string Blank = "________";

    public static (string Prompt, string Answer)? FromSentence(string term, string sentence)
    {
        term = term.Trim();
        sentence = sentence.Trim();
        if (term.Length == 0 || !Regex.IsMatch(sentence, @"^\p{Lu}[^\r\n]+[.!?]$") ||
            sentence.Contains(Blank, StringComparison.Ordinal) || sentence.Contains('\uFFFD') ||
            sentence.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length < 4) return null;
        var matches = Regex.Matches(sentence, $@"(?<![\p{{L}}\p{{N}}]){Regex.Escape(term)}(?![\p{{L}}\p{{N}}])",
            RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
        if (matches.Count != 1) return null;
        var target = matches[0];
        return (sentence[..target.Index] + Blank + sentence[(target.Index + target.Length)..], target.Value);
    }

    public static bool CanUse(string term, VocabularyExample example)
    {
        var cloze = FromSentence(term, example.SentenceEn);
        return example.ClozeConfirmed && cloze.HasValue &&
            cloze.Value.Prompt == example.ClozeSentenceEn && example.ClozeAnswer is { } answer &&
            Rules.Normalize(cloze.Value.Answer) == Rules.Normalize(answer);
    }
}
