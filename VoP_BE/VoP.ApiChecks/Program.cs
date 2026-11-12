using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using System.Net.Sockets;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Npgsql;
using VoP.Repository;
using VoP.Repository.Enums;
using VoP.Service.Common;
var config = new ConfigurationBuilder().AddUserSecrets<Program>().AddEnvironmentVariables().Build();
var original = config.GetConnectionString("DefaultConnection") ?? throw new Exception("Configure local connection using user secrets.");
var cs = new NpgsqlConnectionStringBuilder(original);
var database = "vop_api_checks_" + DateTime.UtcNow.ToString("yyyyMMddHHmmss") + "_" + Guid.NewGuid().ToString("N")[..6];
await using (var admin = new NpgsqlConnection(original))
{
    await admin.OpenAsync();
    await using var cmd = new NpgsqlCommand($"CREATE DATABASE \"{database}\"", admin);
    await cmd.ExecuteNonQueryAsync();
}
cs.Database = database;
cs.Timezone = "Asia/Ho_Chi_Minh";
await using var source = DatabaseConfiguration.CreateDataSource(cs.ConnectionString);
await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(source).Options);
await db.Database.MigrateAsync();
var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../"));
var listener = new TcpListener(IPAddress.Loopback, 0);
listener.Start();
var port = ((IPEndPoint)listener.LocalEndpoint).Port;
listener.Stop();
var start = new ProcessStartInfo("dotnet")
{
    WorkingDirectory = root,
    RedirectStandardOutput = true,
    RedirectStandardError = true
};
start.ArgumentList.Add(Path.Combine(root, "VoP.Api/bin/Debug/net8.0/VoP.Api.dll"));
start.ArgumentList.Add("--urls");
start.ArgumentList.Add($"http://127.0.0.1:{port}");
start.Environment["ConnectionStrings__DefaultConnection"] = cs.ConnectionString;
start.Environment["ASPNETCORE_ENVIRONMENT"] = "Development";
using var host = Process.Start(start) ?? throw new Exception("Cannot start API.");
host.OutputDataReceived += (_, e) =>
{
    if (e.Data?.Contains("Exception") == true || e.Data?.Contains("ERROR") == true || e.Data?.Contains("at VoP.") == true) Console.WriteLine("HOST " + e.Data);
};
host.BeginOutputReadLine();
host.BeginErrorReadLine();
using var http = new HttpClient
{
    BaseAddress = new Uri($"http://127.0.0.1:{port}"),
    Timeout = TimeSpan.FromSeconds(20)
};
var checks = 0;
void Check(bool value, string message)
{
    if (!value) throw new Exception(message);
    checks++;
    Console.WriteLine("PASS " + message);
}
async Task<JsonObject> Send(HttpMethod method, string path, object? body = null, int status = 200)
{
    using var req = new HttpRequestMessage(method, path);
    if (body != null) req.Content = JsonContent.Create(body);
    using var response = await http.SendAsync(req);
    var text = await response.Content.ReadAsStringAsync();
    if ((int)response.StatusCode != status) Console.WriteLine("Unexpected response: " + text);
    Check((int)response.StatusCode == status, $"{method} {path} => {status}");
    return string.IsNullOrWhiteSpace(text) ? new JsonObject() : JsonNode.Parse(text)!.AsObject();
}
string Id(JsonObject item) => item["id"]!.GetValue<string>();
object Vocab(string term) => new
{
    term,
    ipa = "/test/",
    audioUrl = "https://example.com/" + term + ".mp3",
    meanings = new[]
{
 new
{
 meaningVi = "nghĩa " + term, examples = new[]
{
 new
{
 sentenceEn = "This is " + term + ".", clozeSentenceEn = "This is ________.", clozeAnswer = term
}
}
}
}
};
async Task<string> Start(string[] ids, bool extra = false) => Id(await Send(HttpMethod.Post, "/api/practice-sessions", new { vocabularyIds = ids, extraPractice = extra }, 201));
async Task<JsonObject> Next(string session) => await Send(HttpMethod.Get, $"/api/practice-sessions/{session}/next-question");
async Task AnswerAll(string session, bool failFirst = false)
{
    var failed = false;
    for (var i = 0; i < 100; i++)
    {
        using var res = await http.GetAsync($"/api/practice-sessions/{session}/next-question");
        if (res.StatusCode == HttpStatusCode.NoContent) return;
        Check(res.IsSuccessStatusCode, "Next question available");
        var q = JsonNode.Parse(await res.Content.ReadAsStringAsync())!.AsObject();
        var qid = q["id"]!.GetValue<Guid>();
        var wordId = q["sessionWordId"]!.GetValue<Guid>();
        db.ChangeTracker.Clear();
        var word = await db.SessionWords.SingleAsync(w => w.Id == wordId);
        var plan = JsonSerializer.Deserialize<VoP.Service.Practice.WordPlan>(word.QuestionPlan!)!;
        var expected = plan.Questions.Single(p => p.Id == qid).Expected;
        var answer = expected;
        if (failFirst && !failed)
        {
            answer = q["options"]!.AsArray().Select(n => n!.GetValue<string>()).FirstOrDefault(x => x != expected) ?? "wrong";
            failed = true;
        }
        await Send(HttpMethod.Post, $"/api/practice-sessions/{session}/answers", new { questionId = qid, answer });
    }
    throw new Exception("Question loop did not end.");
}
try
{
    for (var i = 0; i < 100; i++)
    {
        try
        {
            if ((await http.GetAsync("/health")).IsSuccessStatusCode) break;
        }
        catch (HttpRequestException)
        {
        }
        await Task.Delay(100);
    }
    await Send(HttpMethod.Get, "/health");
    await Send(HttpMethod.Post, "/api/vocabularies", new { term = "", meanings = Array.Empty<object>() }, 400);
    await Send(HttpMethod.Post, "/api/vocabularies", new { term = "invalid", meanings = new object?[] { null } }, 400);
    await Send(HttpMethod.Post, "/api/vocabularies", new { term = "invalid", meanings = new[] { new { meaningVi = "test", examples = new object?[] { null } } } }, 400);
    await Send(HttpMethod.Post, "/api/vocabularies", new { term = "invalid", meanings = new[] { new { meaningVi = "test", examples = (object[]?)null } } }, 400);
    var words = new List<JsonObject>();
    foreach (var term in new[] { "apple", "banana", "cherry", "date" }) words.Add(await Send(HttpMethod.Post, "/api/vocabularies", Vocab(term), 201));
    var ids = words.Select(Id).ToArray();
    await Send(HttpMethod.Post, "/api/vocabularies", Vocab(" APPLE "), 409);
    await Send(HttpMethod.Get, "/api/vocabularies?pageSize=101", null, 400);
    var search = await Send(HttpMethod.Get, "/api/vocabularies?search=ngh%C4%A9a%20apple");
    Check(search["totalItems"]!.GetValue<int>() == 1, "Vietnamese meaning search");
    var noLearned = await Send(HttpMethod.Get, "/api/vocabularies?level=1");
    Check(noLearned["totalItems"]!.GetValue<int>() == 0, "Vocabulary level filter applies before paging");
    var combined = await Send(HttpMethod.Get, "/api/vocabularies?level=0&search=apple&sort=alpha&pageSize=1");
    Check(combined["totalItems"]!.GetValue<int>() == 1 && combined["items"]![0]!["term"]!.GetValue<string>() == "apple", "Combined search and new-word filter");
    var alphaPage = await Send(HttpMethod.Get, "/api/vocabularies?sort=alpha&page=2&pageSize=1");
    Check(alphaPage["items"]![0]!["term"]!.GetValue<string>() == "banana" && alphaPage["totalItems"]!.GetValue<int>() == 4, "Alphabetical sorting precedes paging");
    await Send(HttpMethod.Get, "/api/vocabularies?level=6", null, 400);
    await Send(HttpMethod.Get, "/api/vocabularies?sort=invalid", null, 400);
    await Send(HttpMethod.Patch, $"/api/vocabularies/{ids[0]}/pronunciation", new { ipa = "/æpəl/", audioUrl = "file:///private/audio.mp3" }, 400);
    var session = await Start(ids);
    await Send(HttpMethod.Post, "/api/practice-sessions", new { vocabularyIds = new[] { ids[0] } }, 409);
    await Send(HttpMethod.Patch, $"/api/learning-progress/{ids[0]}/suspension", new { isSuspended = true }, 409);
    await Send(HttpMethod.Post, $"/api/practice-sessions/{session}/complete", null, 409);
    var q = await Next(session);
    Check(!q.ContainsKey("expected") && !q.ToJsonString().Contains("CorrectAnswer"), "Pending question excludes expected answer");
    await Send(HttpMethod.Post, $"/api/practice-sessions/{session}/answers", new { questionId = Guid.NewGuid(), answer = "wrong" }, 409);
    await AnswerAll(session, true);
    await Send(HttpMethod.Post, $"/api/practice-sessions/{session}/complete");
    await Send(HttpMethod.Post, $"/api/practice-sessions/{session}/complete");
    db.ChangeTracker.Clear();
    var evaluations = await db.ReviewEvaluations.ToListAsync();
    Check(evaluations.Count == 4, "Exactly one evaluation per word after duplicate complete");
    Check(evaluations.Count(e => e.Outcome == ReviewOutcome.Failed && e.LevelAfter == 0) == 1, "Failed new word remains level 0 despite reinforcement");
    Check(await db.ExerciseAttempts.AnyAsync(a => a.Role == AttemptRole.Reinforcement), "Wrong assessment creates separate reinforcement");
    Check((await db.ExerciseAttempts.Select(a => a.ExerciseType).Distinct().ToListAsync()).Count == 4, "All four exercise types server graded");
    var learned = await db.LearningProgress.FirstAsync(p => p.Level == 1);
    var learnedId = learned.VocabularyId.ToString();
    var oldNext = learned.NextReviewAt;
    var learnedPage = await Send(HttpMethod.Get, "/api/vocabularies?level=1&sort=level");
    Check(learnedPage["totalItems"]!.GetValue<int>() == 3 && learnedPage["items"]!.AsArray().All(v => v!["level"]!.GetValue<int>() == 1), "Vocabulary response carries accurate learning state");
    var cardPage = await Send(HttpMethod.Get, "/api/flashcards?level=1");
    Check(cardPage["items"]!.AsArray().All(v => v!["level"]!.GetValue<int>() == 1), "Flashcard learning metadata stays consistent");

    learned.NextReviewAt = DateTimeOffset.UtcNow.AddMinutes(-1);
    await db.SaveChangesAsync();
    var dueList = await Send(HttpMethod.Get, "/api/vocabularies?dueOnly=true&level=1&sort=alpha");
    Check(dueList["totalItems"]!.GetValue<int>() == 1 && Id(dueList["items"]![0]!.AsObject()) == learnedId, "Due and level filters combine before count/paging");
    learned.IsSuspended = true;
    await db.SaveChangesAsync();
    var suspendedDue = await Send(HttpMethod.Get, "/api/vocabularies?dueOnly=true");
    Check(suspendedDue["totalItems"]!.GetValue<int>() == 0, "Due filter excludes suspended vocabulary");
    learned.IsSuspended = false;
    learned.NextReviewAt = oldNext;
    await db.SaveChangesAsync();
    await Send(HttpMethod.Post, $"/api/flashcards/{learnedId}/reviews", new { }, 400);
    await Send(HttpMethod.Post, $"/api/flashcards/{learnedId}/reviews", new { rating = (string?)null }, 400);
    await Send(HttpMethod.Post, $"/api/flashcards/{learnedId}/reviews", new { rating = "invalid" }, 400);
    await Send(HttpMethod.Post, $"/api/flashcards/{learnedId}/reviews", new { rating = 0 }, 400);
    Check(await db.FlashcardReviews.CountAsync() == 0, "Rejected ratings create no review records");
    await Send(HttpMethod.Patch, $"/api/learning-progress/{learnedId}/suspension", new { }, 400);
    var card = await Send(HttpMethod.Post, $"/api/flashcards/{learnedId}/reviews", new { rating = "forgotten" }, 201);
    db.ChangeTracker.Clear();
    Check((await db.LearningProgress.SingleAsync(p => p.VocabularyId == learned.VocabularyId)).NextReviewAt == oldNext, "Flashcards do not mutate SRS");
    await Send(HttpMethod.Post, $"/api/flashcards/{learnedId}/reviews", new { meaningId = words.First(w => Id(w) != learnedId)["meanings"]![0]!["id"]!.GetValue<string>(), rating = "remembered" }, 400);
    await Send(HttpMethod.Post, "/api/practice-sessions", new { vocabularyIds = new[] { learnedId } }, 409);
    var extra = await Start(new[] { learnedId }, true);
    await AnswerAll(extra);
    await Send(HttpMethod.Post, $"/api/practice-sessions/{extra}/complete");
    Check(await db.ReviewEvaluations.CountAsync() == 4, "Extra practice never awards levels/evaluations");
    // A non-UTC database session must not shift late-evening UTC activity to the next day.
    var cardReview = await db.FlashcardReviews.SingleAsync();
    var previousUtcDay = DateTime.UtcNow.Date.AddDays(-1);
    cardReview.ReviewedAt = new DateTimeOffset(previousUtcDay.AddHours(23).AddMinutes(30), TimeSpan.Zero);
    await db.SaveChangesAsync();
    var dashboard = await Send(HttpMethod.Get, "/api/dashboard?days=7");
    var assessmentTotal = await db.ExerciseAttempts.CountAsync(a => a.Role == AttemptRole.Assessment);
    var assessmentCorrect = await db.ExerciseAttempts.CountAsync(a => a.Role == AttemptRole.Assessment && a.IsCorrect);
    Check(dashboard["totalWords"]!.GetValue<int>() == 4 && dashboard["learnedWords"]!.GetValue<int>() == 3, "Dashboard vocabulary/level totals derive from learning records");
    Check(dashboard["assessmentAnswers"]!.GetValue<int>() == assessmentTotal && dashboard["correctAssessments"]!.GetValue<int>() == assessmentCorrect, "Dashboard accuracy excludes reinforcement and flashcards");
    Check(Math.Abs(dashboard["accuracyPercent"]!.GetValue<double>() - Math.Round(100d * assessmentCorrect / assessmentTotal, 2)) < 0.001, "Dashboard correct assessment percentage");
    var activity = dashboard["activity"]!.AsArray();
    Check(activity.Count == 7 && activity.Sum(a => a!["assessmentAnswers"]!.GetValue<int>()) == assessmentTotal && activity.Sum(a => a!["flashcardReviews"]!.GetValue<int>()) == 1, "Dashboard zero-filled daily activity agrees with history");
    var previousActivity = activity.Single(a => a!["date"]!.GetValue<string>() == previousUtcDay.ToString("yyyy-MM-dd"))!;
    Check(previousActivity["flashcardReviews"]!.GetValue<int>() == 1, "Dashboard groups by UTC date despite non-UTC database timezone");
    Check(activity.Sum(a => a!["reinforcementAnswers"]!.GetValue<int>()) == await db.ExerciseAttempts.CountAsync(a => a.Role == AttemptRole.Reinforcement)
        && activity.Sum(a => a!["completedSessions"]!.GetValue<int>()) == await db.PracticeSessions.CountAsync(s => s.Status == PracticeSessionStatus.Completed), "Dashboard daily reinforcement/session totals agree with history");
    await Send(HttpMethod.Get, "/api/dashboard?days=367", null, 400);
    await Send(HttpMethod.Get, "/api/flashcards?level=1");
    await Send(HttpMethod.Get, "/api/learning-progress?level=1");
    await Send(HttpMethod.Get, $"/api/learning-progress/{learnedId}");
    await Send(HttpMethod.Get, "/api/practice-sessions");
    await Send(HttpMethod.Get, $"/api/practice-sessions/{session}");
    var attempts = await Send(HttpMethod.Get, $"/api/practice-sessions/{session}/attempts");
    Check(attempts["totalItems"]!.GetValue<int>() == 9, "Session attempts include eight assessments plus one reinforcement");
    await Send(HttpMethod.Get, "/api/flashcards/reviews");
    await Send(HttpMethod.Get, $"/api/learning-progress/{learnedId}/evaluations");
    await Send(HttpMethod.Patch, $"/api/learning-progress/{learnedId}/suspension", new { isSuspended = true });
    await Send(HttpMethod.Post, "/api/practice-sessions", new { vocabularyIds = new[] { learnedId }, extraPractice = true }, 400);
    await Send(HttpMethod.Patch, $"/api/learning-progress/{learnedId}/suspension", new { isSuspended = false });
    var snapshot = await Start(new[] { learnedId }, true);
    var beforeQ = await Next(snapshot);
    var body = JsonSerializer.SerializeToNode(Vocab("edited"))!.AsObject();
    body["meanings"]![0]!["meaningVi"] = "changed meaning";
    await Send(HttpMethod.Put, $"/api/vocabularies/{learnedId}", body);
    var afterQ = await Next(snapshot);
    Check(beforeQ.ToJsonString() == afterQ.ToJsonString(), "Active question stays frozen after vocabulary edits");
    await AnswerAll(snapshot);
    await Send(HttpMethod.Post, $"/api/practice-sessions/{snapshot}/complete");
    var concurrency = await Start(new[] { learnedId }, true);
    var concurrentQ = await Next(concurrency);
    var questionId = concurrentQ["id"]!.GetValue<Guid>();
    db.ChangeTracker.Clear();
    var sw = await db.SessionWords.SingleAsync(w => w.SessionId == Guid.Parse(concurrency));
    var expectedAnswer = JsonSerializer.Deserialize<VoP.Service.Practice.WordPlan>(sw.QuestionPlan!)!.Questions.Single(p => p.Id == questionId).Expected;
    var replies = await Task.WhenAll(Enumerable.Range(0, 2).Select(_ => http.PostAsJsonAsync($"/api/practice-sessions/{concurrency}/answers", new { questionId, answer = expectedAnswer })));
    Check(replies.Count(r => r.IsSuccessStatusCode) == 1 && replies.Count(r => r.StatusCode == HttpStatusCode.Conflict) == 1, "Concurrent duplicate answer applies exactly once");
    foreach (var r in replies) r.Dispose();
    await Send(HttpMethod.Post, $"/api/practice-sessions/{concurrency}/abandon");
    foreach (var scenario in new[] { (Level: (short)2, Fail: true, After: (short)1, Minutes: 10d), (Level: (short)1, Fail: false, After: (short)2, Minutes: 360d), (Level: (short)5, Fail: false, After: (short)5, Minutes: 10080d), (Level: (short)5, Fail: false, After: (short)5, Minutes: 20160d) })
    {
        db.ChangeTracker.Clear();
        var p = await db.LearningProgress.SingleAsync(p => p.VocabularyId == learned.VocabularyId);
        p.Level = scenario.Level;
        p.NextReviewAt = DateTimeOffset.UtcNow.AddMinutes(-1);
        await db.SaveChangesAsync();
        var reviewSession = await Start(new[] { learnedId });
        await AnswerAll(reviewSession, scenario.Fail);
        var done = await Task.WhenAll(Enumerable.Range(0, 2).Select(_ => http.PostAsync($"/api/practice-sessions/{reviewSession}/complete", null)));
        Check(done.All(r => r.IsSuccessStatusCode), "Concurrent complete is idempotent");
        foreach (var r in done) r.Dispose();
        db.ChangeTracker.Clear();
        p = await db.LearningProgress.SingleAsync(p => p.VocabularyId == learned.VocabularyId);
        Check(p.Level == scenario.After && Math.Abs((p.NextReviewAt!.Value - p.LastReviewedAt!.Value).TotalMinutes - scenario.Minutes) < 0.1, $"SRS {scenario.Level} => {scenario.After}, failure={scenario.Fail}, delay={scenario.Minutes}min");
        Check(await db.ReviewEvaluations.CountAsync(e => e.SessionWord.SessionId == Guid.Parse(reviewSession)) == 1, "Concurrent completion has one evaluation");
    }
    await Send(HttpMethod.Delete, $"/api/vocabularies/{learnedId}", null, 204);
    await Send(HttpMethod.Get, $"/api/vocabularies/{learnedId}", null, 404);
    Check(await db.ExerciseAttempts.CountAsync() > 0, "Soft delete preserves practice history");
    var freshIds = new List<string>();
    for (var i = 0; i < 14; i++)
    {
        var freshWord = await Send(HttpMethod.Post, "/api/vocabularies", new {term="fresh-"+i,meanings=new[]{new {meaningVi="nghĩa mới "+i}}},201);
        freshIds.Add(Id(freshWord));
    }
    await Send(HttpMethod.Patch,$"/api/learning-progress/{freshIds[0]}/suspension",new {isSuspended=true});
    var autoSession = await Send(HttpMethod.Post,"/api/practice-sessions",new {audioEnabled=false},201);
    Check(autoSession["words"]!.AsArray().Count==12,"Automatic session capped at12 eligible words");
    Check(!autoSession["words"]!.AsArray().Any(w=>w!["vocabularyId"]!.GetValue<string>()==freshIds[0]),"Automatic session excludes suspended words");
    db.ChangeTracker.Clear();
    var autoSessionId=Guid.Parse(Id(autoSession));
    var autoPlans = await db.SessionWords.Where(w=>w.SessionId==autoSessionId).Select(w=>w.QuestionPlan).ToListAsync();
    Check(autoPlans.SelectMany(p=>JsonSerializer.Deserialize<VoP.Service.Practice.WordPlan>(p!)!.Questions).All(q=>q.Type is not ExerciseType.ListenChoose and not ExerciseType.ListenType),"Audio-disabled questions never require listening");
    await Send(HttpMethod.Post,$"/api/practice-sessions/{Id(autoSession)}/abandon");
    Check(Rules.Normalize("  APPLE’s! ") == "apple's", "Answer normalization NFKC/apostrophe/punctuation");
    Console.WriteLine($"SUCCESS: {checks} checks; isolated database retained: {database}");
    if (args.Contains("--serve"))
    {
        var stopFile = Path.Combine(Path.GetTempPath(), $"vop-e2e-stop-{port}");
        Console.WriteLine($"E2E_API_URL=http://127.0.0.1:{port}");
        Console.WriteLine($"E2E_STOP_FILE={stopFile}");
        Console.Out.Flush();
        while (!File.Exists(stopFile)) await Task.Delay(250);
    }

}
finally
{
    if (!host.HasExited)
    {
        host.Kill(true);
        await host.WaitForExitAsync();
    }
}
