using System.Diagnostics;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using VoP.Repository;
using VoP.Service.Common;

namespace VoP.Service.Dictionary;

public static class Import
{
    public const string Source = "https://github.com/skypediacode/english-vietnamese-dictionary";
    public const string License = "CC BY-SA 4.0";
    private const int BatchSize = 1000;

    public static async Task Run(NpgsqlDataSource source, string path, CancellationToken ct = default)
    {
        path = Path.GetFullPath(path);
        if (File.Exists(path + "-wal") && new FileInfo(path + "-wal").Length > 0)
            throw new InvalidOperationException("Import requires a self-contained SQLite snapshot with its WAL checkpointed.");
        await using var file = File.OpenRead(path);
        var checksum = Convert.ToHexString(await SHA256.HashDataAsync(file, ct)).ToLowerInvariant();
        await using var connection = await source.OpenConnectionAsync(ct);
        await using var transaction = await connection.BeginTransactionAsync(ct);
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(connection).Options);
        await db.Database.UseTransactionAsync(transaction, ct);
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(27261117)", ct);
        var stats = new Dictionary<string, long[]>();
        try
        {
            await Load("entries", """
                SELECT json_object('Id',id,'Term',trim(word)) FROM words
                WHERE lang_code='en' ORDER BY id
                """, """
                INSERT INTO dictionary_entries ("Id","Term","NormalizedTerm")
                SELECT "Id","Term","NormalizedTerm" FROM jsonb_to_recordset(@rows::jsonb)
                    AS r("Id" bigint,"Term" text,"NormalizedTerm" text)
                ON CONFLICT ("Id") DO UPDATE SET "Term"=excluded."Term","NormalizedTerm"=excluded."NormalizedTerm"
                WHERE dictionary_entries."Term" IS DISTINCT FROM excluded."Term"
                    OR dictionary_entries."NormalizedTerm" IS DISTINCT FROM excluded."NormalizedTerm"
                """, entry: true);
            await Load("senses", """
                SELECT json_object('EntryId',w.id,'DefinitionId',d.id,'MeaningVi',trim(d.definition),
                       'PartOfSpeech',d.pos,'SubPartOfSpeech',d.sub_pos,
                       'Examples',json_group_array(DISTINCT trim(wd.example))
                           FILTER (WHERE trim(wd.example) <> ''))
                FROM word_definitions wd JOIN words w ON w.id=wd.word_id
                JOIN definitions d ON d.id=wd.definition_id
                WHERE w.lang_code='en' AND d.definition_lang='vi' AND trim(w.word)<>''
                GROUP BY w.id,d.id ORDER BY w.id,d.id
                """, """
                INSERT INTO dictionary_senses ("EntryId","DefinitionId","MeaningVi","PartOfSpeech","SubPartOfSpeech","Examples")
                SELECT "EntryId","DefinitionId","MeaningVi","PartOfSpeech","SubPartOfSpeech","Examples"
                FROM jsonb_to_recordset(@rows::jsonb)
                    AS r("EntryId" bigint,"DefinitionId" bigint,"MeaningVi" text,"PartOfSpeech" text,"SubPartOfSpeech" text,"Examples" text[])
                ON CONFLICT ("EntryId","DefinitionId") DO UPDATE
                SET "MeaningVi"=excluded."MeaningVi","PartOfSpeech"=excluded."PartOfSpeech",
                    "SubPartOfSpeech"=excluded."SubPartOfSpeech","Examples"=excluded."Examples"
                WHERE (dictionary_senses."MeaningVi",dictionary_senses."PartOfSpeech",dictionary_senses."SubPartOfSpeech",dictionary_senses."Examples")
                    IS DISTINCT FROM (excluded."MeaningVi",excluded."PartOfSpeech",excluded."SubPartOfSpeech",excluded."Examples")
                """);
            await Load("pronunciations", """
                SELECT json_object('Id',p.id,'EntryId',w.id,'Ipa',trim(p.ipa),'Region',p.region)
                FROM pronunciations p JOIN words w ON w.id=p.word_id
                WHERE w.lang_code='en' AND trim(w.word)<>'' ORDER BY p.id
                """, """
                INSERT INTO dictionary_pronunciations ("Id","EntryId","Ipa","Region")
                SELECT "Id","EntryId","Ipa","Region" FROM jsonb_to_recordset(@rows::jsonb)
                    AS r("Id" bigint,"EntryId" bigint,"Ipa" text,"Region" text)
                ON CONFLICT ("Id") DO UPDATE SET "EntryId"=excluded."EntryId","Ipa"=excluded."Ipa","Region"=excluded."Region"
                WHERE (dictionary_pronunciations."EntryId",dictionary_pronunciations."Ipa",dictionary_pronunciations."Region")
                    IS DISTINCT FROM (excluded."EntryId",excluded."Ipa",excluded."Region")
                """);
            await Load("unlinkedDefinitions", """
                SELECT '{}' FROM definitions d
                WHERE NOT EXISTS (SELECT 1 FROM word_definitions wd WHERE wd.definition_id=d.id)
                """, null);
            await Load("extraSenseLinks", """
                SELECT '{}' FROM word_definitions wd WHERE EXISTS (
                    SELECT 1 FROM word_definitions other WHERE other.word_id=wd.word_id
                        AND other.definition_id=wd.definition_id AND other.id<wd.id)
                """, null);
            var statistics = Report();
            await db.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO dictionary_imports ("Checksum","ImportedAt","Source","License","Statistics")
                VALUES ({checksum},{DateTimeOffset.UtcNow},{Source},{License},{statistics})
                ON CONFLICT ("Checksum") DO UPDATE SET "ImportedAt"=excluded."ImportedAt","Statistics"=excluded."Statistics"
                """, ct);
            await transaction.CommitAsync(ct);
            Console.WriteLine(statistics);
        }
        catch
        {
            Console.Error.WriteLine($"Import rolled back: {Report()}");
            throw;
        }

        string Report() => JsonSerializer.Serialize(new
        {
            checksum,
            tables = stats.ToDictionary(pair => pair.Key, pair => new
            {
                processed = pair.Value[0],
                inserted = pair.Value[1],
                updated = pair.Value[2],
                skipped = pair.Value[3],
                failed = pair.Value[4]
            })
        });

        async Task Load(string name, string query, string? upsert, bool entry = false)
        {
            var counts = new long[5];
            stats.Add(name, counts);
            var start = new ProcessStartInfo("sqlite3") { RedirectStandardOutput = true, RedirectStandardError = true };
            start.ArgumentList.Add("-batch");
            start.ArgumentList.Add("-bail");
            start.ArgumentList.Add(new Uri(path).AbsoluteUri + "?mode=ro&immutable=1");
            start.ArgumentList.Add(query);
            using var process = Process.Start(start) ?? throw new InvalidOperationException("Cannot launch sqlite3.");
            var stderr = process.StandardError.ReadToEndAsync(ct);
            try
            {
                var rows = new List<string>(BatchSize);
                while (await process.StandardOutput.ReadLineAsync(ct) is { } line)
                {
                    counts[0]++;
                    using var document = JsonDocument.Parse(line);
                    var row = document.RootElement;
                    var key = name switch { "entries" => "Term", "senses" => "MeaningVi", _ => "Ipa" };
                    if (upsert == null || string.IsNullOrWhiteSpace(row.GetProperty(key).GetString()))
                    {
                        counts[3]++;
                        continue;
                    }
                    if (entry)
                    {
                        var term = row.GetProperty("Term").GetString()!;
                        var normalized = Rules.Normalize(term);
                        if (normalized.Length == 0)
                        {
                            counts[3]++;
                            continue;
                        }
                        line = JsonSerializer.Serialize(new { Id = row.GetProperty("Id").GetInt64(), Term = term, NormalizedTerm = normalized });
                    }
                    rows.Add(line);
                    if (rows.Count == BatchSize) await Flush();
                }
                await Flush();
                await process.WaitForExitAsync(ct);
                if (process.ExitCode != 0) throw new InvalidOperationException(await stderr);

                async Task Flush()
                {
                    if (rows.Count == 0) return;
                    await using var command = new NpgsqlCommand($"""
                        WITH changes AS ({upsert} RETURNING xmax = 0 AS inserted)
                        SELECT count(*) FILTER (WHERE inserted), count(*) FILTER (WHERE NOT inserted) FROM changes
                        """, connection, transaction);
                    command.Parameters.AddWithValue("rows", "[" + string.Join(',', rows) + "]");
                    await using var reader = await command.ExecuteReaderAsync(ct);
                    await reader.ReadAsync(ct);
                    var inserted = reader.GetInt64(0);
                    var updated = reader.GetInt64(1);
                    counts[1] += inserted;
                    counts[2] += updated;
                    counts[3] += rows.Count - inserted - updated;
                    rows.Clear();
                }
            }
            catch
            {
                counts[4]++;
                if (!process.HasExited) process.Kill();
                throw;
            }
        }
    }
}
