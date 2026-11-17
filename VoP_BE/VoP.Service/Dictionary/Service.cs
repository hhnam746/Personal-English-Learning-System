using Microsoft.EntityFrameworkCore;
using VoP.Repository;
using VoP.Repository.Entities;
using VoP.Service.Common;

namespace VoP.Service.Dictionary;

public sealed class Service(AppDbContext db) : IService
{
    private IQueryable<DictionaryEntry> Entries => db.DictionaryEntries.AsNoTracking()
        .Include(x => x.Pronunciations)
        .Include(x => x.Senses)
        .AsSplitQuery();

    public async Task<Suggestion[]> Search(string query, CancellationToken ct)
    {
        var term = Rules.Normalize(query);
        if (term.Length is 0 or > 255) return [];
        var words = await Entries.Where(x => x.NormalizedTerm.StartsWith(term))
            .OrderByDescending(x => x.NormalizedTerm == term)
            .ThenBy(x => x.NormalizedTerm)
            .ThenBy(x => x.Id)
            .Take(20)
            .ToArrayAsync(ct);
        return words.Select(Summary).ToArray();
    }

    public async Task<Entry> Get(long id, CancellationToken ct)
    {
        var word = await Entries.SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new ApiException(404, "Dictionary entry not found.");
        return new(Summary(word), word.Senses.OrderBy(x => x.DefinitionId)
            .Select(x => new Sense(x.DefinitionId, x.MeaningVi, x.PartOfSpeech, x.SubPartOfSpeech, x.Examples))
            .ToArray());
    }

    private static Suggestion Summary(DictionaryEntry word)
    {
        var pronunciation = word.Pronunciations.Where(p => !string.IsNullOrWhiteSpace(p.Ipa))
            .Select(p => new { Pronunciation = p, Rank = p.Region?.Trim().ToLowerInvariant() switch
            {
                "us" or "name" or "general-american" => 0,
                null or "" => 1,
                "bre" or "uk" or "received-pronunciation" => 2,
                _ => 3
            } })
            .Where(p => p.Rank < 3)
            .OrderBy(p => p.Rank).ThenBy(p => p.Pronunciation.Id)
            .FirstOrDefault()?.Pronunciation;
        return new(word.Id, word.Term, pronunciation?.Ipa, pronunciation?.Region,
            word.Senses.Select(s => s.PartOfSpeech).OfType<string>().Distinct().Order().ToArray(),
            word.Senses.OrderBy(s => s.DefinitionId).FirstOrDefault()?.MeaningVi);
    }
}
