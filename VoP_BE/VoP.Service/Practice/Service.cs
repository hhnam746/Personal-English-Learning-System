using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VoP.Repository;
using VoP.Repository.Entities;
using VoP.Repository.Enums;
using VoP.Service.Common;

namespace VoP.Service.Practice;

public sealed class Service(AppDbContext db, OfflineAudio audio) : IService
{
    internal static bool Semantic(ExerciseType type) =>
        type is ExerciseType.MeaningMcq or ExerciseType.FillBlank;

    private IQueryable<PracticeSession> Sessions => db.PracticeSessions
        .Include(s => s.SessionWords)
        .ThenInclude(w => w.ExerciseAttempts)
        .Include(s => s.SessionWords)
        .ThenInclude(w => w.Vocabulary)
        .ThenInclude(v => v.LearningProgress)
        .Include(s => s.SessionWords)
        .ThenInclude(w => w.Meaning)
        .ThenInclude(m => m!.Progress);

    private async Task<PracticeSession> Find(Guid id, CancellationToken ct) =>
        await Sessions.SingleOrDefaultAsync(s => s.Id == id, ct)
        ?? throw new ApiException(404, "Session not found.");

    private static WordPlan Plan(SessionWord w) => w.QuestionPlan is { } json
        ? JsonSerializer.Deserialize<WordPlan>(json)
            ?? throw new ApiException(409, "Session has no question plan; abandon it and start again.")
        : throw new ApiException(409, "Legacy session has no question plan; abandon it and start again.");

    private static HashSet<Guid> Answered(PracticeSession s) => s.SessionWords
        .SelectMany(w => w.ExerciseAttempts)
        .Where(a => a.QuestionSnapshot != null)
        .Select(a => JsonSerializer.Deserialize<PlannedQuestion>(a.QuestionSnapshot!)!.Id)
        .ToHashSet();
    private static (SessionWord Word, PlannedQuestion Question)? Pending(PracticeSession s)
    {
        var answered = Answered(s);
        return s.SessionWords
            .SelectMany(w => Plan(w).Questions
                .Select(q => (Word: w, Question: q)))
            .Where(x => !answered.Contains(x.Question.Id))
            .OrderBy(x => x.Question.Order)
            .ThenBy(x => x.Question.Id)
            .Select(x => ((SessionWord, PlannedQuestion)?)x)
            .FirstOrDefault();
    }
    private static SessionResponse Response(PracticeSession s)
    {
        var words = s.SessionWords
            .OrderBy(w => w.Position)
            .Select(w => new SessionWordResponse(w.Id,
            w.VocabularyId,
            w.Source,
            w.LevelAtStart,
            w.QuestionPlan == null ? w.Vocabulary.Term : Plan(w).Term,
            w.QuestionPlan == null ? w.Vocabulary.Ipa : Plan(w).Ipa,
            w.MeaningId,
            s.Status == PracticeSessionStatus.InProgress ? null :
                (w.QuestionPlan == null ? null : Plan(w).MeaningVi) ?? w.Meaning?.MeaningVi,
            w.IsLegacy))
            .ToArray();
        var count = s.SessionWords.Sum(w => w.ExerciseAttempts.Count);
        var planned = s.SessionWords.Where(w => w.QuestionPlan != null).Sum(w => Plan(w).Questions.Count);
        return new(s.Id, s.Status, s.StartedAt, s.FinishedAt, words, count, Math.Max(0, planned - count));
    }

    public async Task<SessionResponse> Get(Guid id, CancellationToken ct) => Response(await Find(id, ct));

    public async Task<Page<SessionResponse>> List(int page, int pageSize, CancellationToken ct)
    {
        Rules.Paging(page, pageSize);
        var total = await db.PracticeSessions.CountAsync(ct);
        var items = await Sessions
            .AsNoTracking()
            .OrderByDescending(s => s.StartedAt)
            .ThenBy(s => s.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        return new(items.Select(Response).ToArray(), page, pageSize, total);
    }

    public async Task<SessionResponse> Create(SessionRequest request, CancellationToken ct)
    {
        Rules.Require(request.Limit is >= 1 and <= 12, "Limit must be 1..12.");
        Rules.Require(!request.ExtraPractice || request.VocabularyIds?.Count > 0 || request.MeaningIds?.Count > 0,
            "Extra practice requires explicit vocabularyIds.");
        await using var tx = await LearningMutation.Lock(db, ct);
        var now = DateTimeOffset.UtcNow;
        var lang = string.IsNullOrWhiteSpace(request.Language) ? "en" : request.Language.Trim().ToLowerInvariant();
        var query = db.VocabularyMeanings
            .Include(m => m.Vocabulary)
            .Include(m => m.Progress)
            .Include(m => m.VocabularyExamples)
            .Where(m => m.DeletedAt == null && m.Vocabulary.DeletedAt == null && !m.Vocabulary.IsSuspended && m.Vocabulary.Language == lang);
        var eligible = query.Where(m => m.Progress == null || m.Progress.Level == 0 || m.Progress.NextReviewAt <= now);
        List<VocabularyMeaning> selected;
        if (request.MeaningIds is { Count: > 0 } meanings)
        {
            Rules.Require(meanings.Distinct().Count() == meanings.Count && request.VocabularyIds is not { Count: > 0 },
                "Provide unique meaning IDs or vocabulary IDs.");
            var candidates = request.ExtraPractice ? query : eligible;
            selected = await candidates.Where(m => meanings.Contains(m.Id)).ToListAsync(ct);
            Rules.Require(selected.Count == meanings.Count, "Meaning is missing, suspended or not due.", 409);
            selected = meanings.Select(id => selected.Single(m => m.Id == id)).ToList();
        }
        else if (request.VocabularyIds is { Count: > 0 } ids)
        {
            Rules.Require(ids.Distinct().Count() == ids.Count, "Provide unique vocabulary IDs.");
            var candidates = request.ExtraPractice ? query : eligible;
            selected = await candidates.Where(m => ids.Contains(m.VocabularyId))
                .OrderBy(m => m.DisplayOrder).ThenBy(m => m.Id).ToListAsync(ct);
            Rules.Require(ids.All(id => selected.Any(m => m.VocabularyId == id)), "Vocabulary is missing, suspended or not due.", 409);
            selected = ids.SelectMany(id => selected.Where(m => m.VocabularyId == id)).Take(request.Limit).ToList();
        }
        else
        {
            var due = await eligible.Where(m => m.Progress != null && m.Progress.Level > 0)
                .OrderBy(m => m.Progress!.NextReviewAt).ThenBy(m => m.Id).Take(request.Limit).ToListAsync(ct);
            var fresh = await eligible.Where(m => m.Progress == null || m.Progress.Level == 0)
                .OrderBy(m => m.CreatedAt).ThenBy(m => m.Id).Take(request.Limit).ToListAsync(ct);
            var oldCount = Math.Min(due.Count, fresh.Count > 0 ? Math.Min(8, request.Limit) : request.Limit);
            selected = due.Take(oldCount).Concat(fresh).Concat(due.Skip(oldCount)).Take(request.Limit).ToList();
        }
        Rules.Require(selected.Count > 0, "No eligible meanings available.", 409);
        var selectedIds = selected.Select(m => m.Id).ToArray();
        var vocabularyIds = selected.Select(m => m.VocabularyId).ToArray();
        Rules.Require(!await db.SessionWords.AnyAsync(w => w.Session.Status == PracticeSessionStatus.InProgress &&
            (w.IsLegacy ? vocabularyIds.Contains(w.VocabularyId) : w.MeaningId != null && selectedIds.Contains(w.MeaningId.Value)), ct),
            "A selected meaning is already in an active session; finish or abandon that session.", 409);
        var terms = selected.Select(m => m.Vocabulary.NormalizedTerm).Distinct().ToArray();
        var referenceTranslations = await db.DictionaryEntries.Where(e => terms.Contains(e.NormalizedTerm))
            .SelectMany(e => e.Senses.Select(m => new { e.NormalizedTerm, m.MeaningVi })).ToListAsync(ct);
        var personalTranslations = await db.VocabularyMeanings.Where(m => vocabularyIds.Contains(m.VocabularyId) && m.DeletedAt == null)
            .Select(m => new { m.Vocabulary.NormalizedTerm, m.MeaningVi }).ToListAsync(ct);
        var known = personalTranslations.Concat(referenceTranslations).ToLookup(m => m.NormalizedTerm, m => Rules.Normalize(m.MeaningVi));
        var distractors = await db.VocabularyMeanings
            .AsNoTracking()
            .Where(m => m.Vocabulary.DeletedAt == null && m.DeletedAt == null)
            .OrderBy(m => m.Id)
            .Take(300)
            .Select(m => new
            {
                m.MeaningVi,
                m.Vocabulary.Term
            })
            .ToListAsync(ct);
        var session = new PracticeSession
        {
            Id = Guid.NewGuid(),
            Language = lang,
            StartedAt = now,
            Status = PracticeSessionStatus.InProgress
        };
        for (var i = 0; i < selected.Count; i++)
        {
            var m = selected[i];
            var v = m.Vocabulary;
            var example = m.VocabularyExamples
                .OrderBy(e => e.Id).FirstOrDefault(e => Cloze.CanUse(v.Term, e));
            var first = (ExerciseType)(i % 4);
            if (!request.AudioEnabled || (!OfflineAudio.IsLocalPath(v.AudioUrl) && !audio.CanSpeak))
            {
                if (first is ExerciseType.ListenChoose or ExerciseType.ListenType) first = ExerciseType.MeaningMcq;
            }
            if (first == ExerciseType.FillBlank && example == null) first = ExerciseType.MeaningMcq;
            PlannedQuestion Make(ExerciseType type, int order)
            {
                var prompt = type switch
                {
                    ExerciseType.MeaningMcq => v.Term,
                    ExerciseType.FillBlank => example!.ClozeSentenceEn! + "\nNghĩa: " + m.MeaningVi,
                    _ => "Listen to the audio."
                };
                var expected = type switch
                {
                    ExerciseType.MeaningMcq => m.MeaningVi,
                    ExerciseType.FillBlank => example!.ClozeAnswer!,
                    _ => v.Term
                };
                var options = type switch
                {
                    ExerciseType.MeaningMcq => Options(m.MeaningVi,
                        distractors
                        .Where(d => d.Term != v.Term)
                        .Select(d => d.MeaningVi)
                        .Where(value => !known[v.NormalizedTerm].Contains(Rules.Normalize(value)))),
                    ExerciseType.ListenChoose => Options(v.Term, distractors.Where(d => d.Term != v.Term).Select(d => d.Term)),
                    _ => []
                };
                return new PlannedQuestion(Guid.NewGuid(), order, type, AttemptRole.Assessment,
                    Semantic(type) ? m.Id : null, type == ExerciseType.FillBlank ? example!.Id : null, prompt, expected,
                    type is ExerciseType.ListenChoose or ExerciseType.ListenType ? v.AudioUrl : null, options);
            }
            List<PlannedQuestion> questions = [Make(first, (i + 1) * 10)];
            var fresh = m.Progress == null || m.Progress.Level == 0;
            if (fresh || first is ExerciseType.ListenChoose or ExerciseType.ListenType) questions.Add(Make(first == ExerciseType.MeaningMcq && example != null ? ExerciseType.FillBlank : ExerciseType.MeaningMcq,
                (selected.Count + i + 1) * 10));
            session.SessionWords.Add(new SessionWord
            {
                Id = Guid.NewGuid(),
                Vocabulary = v,
                Meaning = m,
                Source = request.ExtraPractice ? SessionWordSource.ExtraPractice : fresh ? SessionWordSource.NewWord : SessionWordSource.DueReview,
                Position = i + 1,
                LevelAtStart = m.Progress?.Level ?? 0,
                QuestionPlan = JsonSerializer.Serialize(new WordPlan(v.Term, m.IpaOverride ?? v.Ipa, questions, m.MeaningVi))
            });
        }
        db.PracticeSessions.Add(session);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Response(session);
    }
    private static string[] Options(string expected, IEnumerable<string> candidates)
    {
        var options = candidates
            .Where(x => Rules.Normalize(x) != Rules.Normalize(expected))
            .DistinctBy(Rules.Normalize)
            .Take(3)
            .Append(expected)
            .ToArray();
        // A one-word library still works; the explicit 'none' option is never correct.
        if (options.Length == 1) options = [expected, "(Không có đáp án phù hợp)"];
        Random.Shared.Shuffle(options);
        return options;
    }

    public async Task<QuestionResponse?> Next(Guid id, CancellationToken ct)
    {
        var session = await Find(id, ct);
        Rules.Require(session.Status == PracticeSessionStatus.InProgress, "Session is closed.", 409);
        var next = Pending(session);
        if (next is not { } item) return null;
        var audioUrl = OfflineAudio.IsLocalPath(item.Question.AudioUrl) ? item.Question.AudioUrl
            : !Semantic(item.Question.Type) && audio.CanSpeak
                ? $"/api/practice-sessions/{id}/questions/{item.Question.Id}/audio" : null;
        return new(item.Question.Id,
            item.Word.Id,
            item.Question.Type,
            item.Question.Role,
            item.Question.Prompt,
            audioUrl,
            item.Question.Options);
    }

    public async Task<byte[]?> QuestionAudio(Guid id, Guid questionId, CancellationToken ct)
    {
        var session = await Find(id, ct);
        if (session.Status != PracticeSessionStatus.InProgress || Pending(session) is not { } item ||
            item.Question.Id != questionId || Semantic(item.Question.Type)) return null;
        return await audio.Speak(Plan(item.Word).Term, ct);
    }

    public async Task SkipAudio(Guid id, Guid questionId, CancellationToken ct)
    {
        await using var tx = await LearningMutation.Lock(db, ct);
        var session = await Find(id, ct);
        Rules.Require(session.Status == PracticeSessionStatus.InProgress, "Session is closed.", 409);
        var (word, question) = Pending(session) ?? throw new ApiException(409, "No unanswered question remains.");
        Rules.Require(question.Id == questionId && !Semantic(question.Type), "Only the current listening question can be skipped.", 409);
        var plan = Plan(word);
        plan.Questions.RemoveAll(q => q.Id == questionId);
        word.QuestionPlan = JsonSerializer.Serialize(plan);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
    }

    public async Task<AnswerResponse> Answer(Guid id, AnswerRequest request, CancellationToken ct)
    {
        Rules.Require(!string.IsNullOrWhiteSpace(request.Answer) && request.Answer.Length <= 5000,
            "Answer is required (max 5000 characters).");
        await using var tx = await LearningMutation.Lock(db, ct);
        var session = await Find(id, ct);
        Rules.Require(session.Status == PracticeSessionStatus.InProgress, "Session is closed.", 409);
        var next = Pending(session) ?? throw new ApiException(409, "No unanswered question remains.");
        var (word, q) = next;
        Rules.Require(q.Id == request.QuestionId, "Question already answered or out of sequence.", 409);
        Rules.Require(word.Vocabulary.DeletedAt == null && !word.Vocabulary.IsSuspended && word.Meaning?.DeletedAt == null,
            "Word was archived or suspended; abandon this session.",
            409);
        var correct = Rules.Normalize(request.Answer) == Rules.Normalize(q.Expected);
        if (q.Options.Length > 0) Rules.Require(q.Options.Contains(request.Answer), "Choose an exact option from this question.");
        var attempt = new ExerciseAttempt
        {
            Id = Guid.NewGuid(),
            SessionWord = word,
            ExerciseType = q.Type,
            Role = q.Role,
            QuestionSnapshot = JsonSerializer.Serialize(q),
            SubmittedAnswer = request.Answer,
            IsCorrect = correct,
            AnsweredAt = DateTimeOffset.UtcNow,
            MeaningId = Semantic(q.Type) && q.MeaningId.HasValue && await db.VocabularyMeanings.AnyAsync(m => m.Id == q.MeaningId, ct) ? q.MeaningId : null,
            ExampleId = q.ExampleId.HasValue && await db.VocabularyExamples.AnyAsync(e => e.Id == q.ExampleId, ct) ? q.ExampleId : null
        };
        db.ExerciseAttempts.Add(attempt);
        if (!correct && Semantic(q.Type))
        {
            var plan = Plan(word);
            if (q.Role == AttemptRole.Reinforcement || !plan.Questions.Any(p => p.Role == AttemptRole.Reinforcement))
            {
                var semantic = plan.Questions.First(p => p.Type is ExerciseType.MeaningMcq or ExerciseType.FillBlank);
                var maxOrder = session.SessionWords.SelectMany(w => Plan(w).Questions).Max(p => p.Order);
                var repair = semantic with
                {
                    Id = Guid.NewGuid(),
                    Order = Math.Min(q.Order + 55, maxOrder + 10),
                    Role = AttemptRole.Reinforcement
                };
                plan.Questions.Add(repair);
                word.QuestionPlan = JsonSerializer.Serialize(plan);
            }
        }
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return new(attempt.Id, correct, q.Expected, q.Role);
    }

    public async Task<SessionResponse> Finish(Guid id, bool abandon, CancellationToken ct)
    {
        await using var tx = await LearningMutation.Lock(db, ct);
        var session = await Find(id, ct);
        if (session.Status == (abandon ? PracticeSessionStatus.Abandoned : PracticeSessionStatus.Completed)) return Response(session);
        Rules.Require(session.Status == PracticeSessionStatus.InProgress, "Session is already closed.", 409);
        var now = DateTimeOffset.UtcNow;
        if (!abandon)
        {
            Rules.Require(Pending(session) == null, "Answer all assessment and reinforcement questions first.", 409);
            foreach (var w in session.SessionWords)
            {
                Rules.Require(w.Vocabulary.DeletedAt == null && !w.Vocabulary.IsSuspended && w.Meaning?.DeletedAt == null,
                    "An archived/suspended meaning requires abandoning this session.", 409);
                if (w.Source == SessionWordSource.ExtraPractice) continue;
                var target = w.Meaning;
                if (w.IsLegacy)
                {
                    var ids = Plan(w).Questions.Where(q => q.Role == AttemptRole.Assessment && Semantic(q.Type))
                        .Select(q => q.MeaningId).Distinct().ToArray();
                    if (ids.Length != 1 || ids[0] == null) continue;
                    target = await db.VocabularyMeanings.Include(m => m.Progress)
                        .SingleOrDefaultAsync(m => m.Id == ids[0] && m.VocabularyId == w.VocabularyId && m.DeletedAt == null, ct);
                    var legacy = w.Vocabulary.LearningProgress;
                    if (legacy?.LastReviewedAt != null && legacy.MappedMeaningId != target?.Id) continue;
                    if (target?.Progress?.LastReviewedAt != legacy?.LastReviewedAt) continue;
                }
                if (target == null) continue;
                var assessments = w.ExerciseAttempts.Where(a => a.Role == AttemptRole.Assessment &&
                    Semantic(a.ExerciseType) && a.MeaningId == target.Id).ToArray();
                if (assessments.Length == 0) continue;
                var passed = assessments.All(a => a.IsCorrect);
                var progress = target.Progress ??= new MeaningProgress { MeaningId = target.Id };
                Rules.Require(progress.Level == w.LevelAtStart,
                    "Progress changed since session start; abandon and restart.", 409);
                w.MeaningId = target.Id;
                var before = progress.Level;
                var after = (short)(passed ? Math.Min(5, before + 1) : before == 0 ? 0 : Math.Max(1, before - 1));
                var previous = progress.LastReviewedAt;
                TimeSpan interval = Interval(after);
                if (!passed) interval = TimeSpan.FromMinutes(10);
                if (passed && before == 5)
                {
                    var last = await db.ReviewEvaluations
                        .Where(e => e.SessionWord.MeaningId == target.Id)
                        .OrderByDescending(e => e.EvaluatedAt)
                        .Select(e => new
                        {
                            e.LevelBefore,
                            e.LevelAfter,
                            e.Outcome
                        }).FirstOrDefaultAsync(ct);
                    if (last is
                        {
                            LevelBefore: 5,
                            LevelAfter: 5,
                            Outcome: ReviewOutcome.Passed
                        }) interval = TimeSpan.FromDays(14);
                }
                progress.Level = after;
                if (after > 0) progress.FirstLearnedAt ??= now;
                progress.LastReviewedAt = now;
                progress.NextReviewAt = after > 0 ? now + interval : null;
                db.ReviewEvaluations.Add(new ReviewEvaluation
                {
                    SessionWord = w,
                    Outcome = passed ? ReviewOutcome.Passed : ReviewOutcome.Failed,
                    LevelBefore = before,
                    LevelAfter = after,
                    PreviousReviewAt = previous,
                    NextReviewAt = progress.NextReviewAt,
                    EvaluatedAt = now
                });
            }
        }
        session.Status = abandon ? PracticeSessionStatus.Abandoned : PracticeSessionStatus.Completed;
        session.FinishedAt = now;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Response(session);
    }
    public static TimeSpan Interval(int level) => level switch
    {
        1 => TimeSpan.FromMinutes(10),
        2 => TimeSpan.FromHours(6),
        3 => TimeSpan.FromDays(1),
        4 => TimeSpan.FromDays(3),
        5 => TimeSpan.FromDays(7),
        _ => TimeSpan.Zero
    };

    public async Task<Page<AttemptResponse>> Attempts(Guid id, int page, int pageSize, CancellationToken ct)
    {
        Rules.Paging(page, pageSize);
        Rules.Require(await db.PracticeSessions.AnyAsync(s => s.Id == id, ct), "Session not found.", 404);
        var query = db.ExerciseAttempts.AsNoTracking().Where(a => a.SessionWord.SessionId == id);
        return new(await query
            .OrderBy(a => a.AnsweredAt)
            .ThenBy(a => a.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AttemptResponse(a.Id,
            a.SessionWordId,
            a.ExerciseType,
            a.Role,
            a.SubmittedAnswer,
            a.IsCorrect,
            a.AnsweredAt))
            .ToArrayAsync(ct),
            page,
            pageSize,
            await query.CountAsync(ct));
    }
}
