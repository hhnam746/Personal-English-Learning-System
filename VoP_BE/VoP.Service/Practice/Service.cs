using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VoP.Repository;
using VoP.Repository.Entities;
using VoP.Repository.Enums;
using VoP.Service.Common;

namespace VoP.Service.Practice;

public sealed class Service(AppDbContext db) : IService
{
    private IQueryable<PracticeSession> Sessions => db.PracticeSessions
        .Include(s => s.SessionWords)
        .ThenInclude(w => w.ExerciseAttempts)
        .Include(s => s.SessionWords)
        .ThenInclude(w => w.Vocabulary)
        .ThenInclude(v => v.LearningProgress);

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
            w.QuestionPlan == null ? w.Vocabulary.Ipa : Plan(w).Ipa))
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
        Rules.Require(!request.ExtraPractice || request.VocabularyIds?.Count > 0,
            "Extra practice requires explicit vocabularyIds.");
        await using var tx = await LearningMutation.Lock(db, ct);
        var now = DateTimeOffset.UtcNow;
        var query = db.Vocabularies
            .Include(v => v.LearningProgress)
            .Include(v => v.VocabularyMeanings)
            .ThenInclude(m => m.VocabularyExamples)
            .Where(v => v.DeletedAt == null && (v.LearningProgress == null || !v.LearningProgress.IsSuspended));
        List<Vocabulary> selected;
        if (request.VocabularyIds is { Count: > 0 } ids)
        {
            Rules.Require(ids.Count <= 12 && ids.Distinct().Count() == ids.Count, "Provide 1..12 unique vocabulary IDs.");
            selected = await query.Where(v => ids.Contains(v.Id)).ToListAsync(ct);
            Rules.Require(selected.Count == ids.Count, "Vocabulary missing, deleted or suspended.");
            selected = ids.Select(id => selected.Single(v => v.Id == id)).ToList();
            Rules.Require(request.ExtraPractice || selected.All(v => v.LearningProgress == null || v.LearningProgress.FirstLearnedAt == null || v.LearningProgress.NextReviewAt <= now),
                "Not-due words require extraPractice=true.",
                409);
        }
        else
        {
            var due = await query
                .Where(v => v.LearningProgress != null && v.LearningProgress.FirstLearnedAt != null && v.LearningProgress.NextReviewAt <= now)
                .OrderBy(v => v.LearningProgress!.NextReviewAt)
                .ThenBy(v => v.Id)
                .Take(request.Limit)
                .ToListAsync(ct);
            var fresh = await query
                .Where(v => v.LearningProgress == null || v.LearningProgress.FirstLearnedAt == null)
                .OrderBy(v => v.CreatedAt)
                .ThenBy(v => v.Id)
                .Take(request.Limit)
                .ToListAsync(ct);
            var oldCount = Math.Min(due.Count, fresh.Count > 0 ? Math.Min(8, request.Limit) : request.Limit);
            var newcomers = fresh.Take(request.Limit - oldCount).ToList();
            var old = due.Take(oldCount).ToList();
            selected = [];
            while (old.Count > 0 || newcomers.Count > 0)
            {
                for (var n = 0; n < 2 && old.Count > 0; n++)
                {
                    selected.Add(old[0]);
                    old.RemoveAt(0);
                }
                if (newcomers.Count > 0)
                {
                    selected.Add(newcomers[0]);
                    newcomers.RemoveAt(0);
                }
            }
            selected.AddRange(due.Skip(oldCount).Take(request.Limit - selected.Count));
        }
        Rules.Require(selected.Count > 0, "No eligible words available.", 409);
        var selectedIds = selected.Select(v => v.Id).ToArray();
        Rules.Require(!await db.SessionWords.AnyAsync(w => selectedIds.Contains(w.VocabularyId) && w.Session.Status == PracticeSessionStatus.InProgress,
            ct),
            "A selected word is already in an active session; finish or abandon that session.",
            409);
        Rules.Require(selected.All(v => v.VocabularyMeanings.Count > 0), "Each selected word needs a meaning.", 409);
        var distractors = await db.VocabularyMeanings
            .AsNoTracking()
            .Where(m => m.Vocabulary.DeletedAt == null)
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
            StartedAt = now,
            Status = PracticeSessionStatus.InProgress
        };
        for (var i = 0; i < selected.Count; i++)
        {
            var v = selected[i];
            var m = v.VocabularyMeanings.OrderBy(m => m.DisplayOrder).First();
            var example = m.VocabularyExamples
                .OrderBy(e => e.Id).FirstOrDefault(e => !string.IsNullOrWhiteSpace(e.ClozeAnswer) && e.ClozeSentenceEn?.Contains("________") == true);
            var first = (ExerciseType)(i % 4);
            if (!request.AudioEnabled || string.IsNullOrWhiteSpace(v.AudioUrl))
            {
                if (first is ExerciseType.ListenChoose or ExerciseType.ListenType) first = ExerciseType.MeaningMcq;
            }
            if (first == ExerciseType.FillBlank && example == null) first = ExerciseType.MeaningMcq;
            PlannedQuestion Make(ExerciseType type, int order)
            {
                var prompt = type switch
                {
                    ExerciseType.MeaningMcq => v.Term,
                    ExerciseType.FillBlank => example!.ClozeSentenceEn!,
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
                        .Select(d => d.MeaningVi)),
                    ExerciseType.ListenChoose => Options(v.Term, distractors.Where(d => d.Term != v.Term).Select(d => d.Term)),
                    _ => []
                };
                return new PlannedQuestion(Guid.NewGuid(), order, type, AttemptRole.Assessment,
                    m.Id, type == ExerciseType.FillBlank ? example!.Id : null, prompt, expected,
                    type is ExerciseType.ListenChoose or ExerciseType.ListenType ? v.AudioUrl : null, options);
            }
            List<PlannedQuestion> questions = [Make(first, (i + 1) * 10)];
            var fresh = v.LearningProgress == null || v.LearningProgress.FirstLearnedAt == null;
            if (fresh || first is ExerciseType.ListenChoose or ExerciseType.ListenType) questions.Add(Make(first == ExerciseType.MeaningMcq && example != null ? ExerciseType.FillBlank : ExerciseType.MeaningMcq,
                (selected.Count + i + 1) * 10));
            session.SessionWords.Add(new SessionWord
            {
                Id = Guid.NewGuid(),
                Vocabulary = v,
                Source = request.ExtraPractice ? SessionWordSource.ExtraPractice : fresh ? SessionWordSource.NewWord : SessionWordSource.DueReview,
                Position = i + 1,
                LevelAtStart = v.LearningProgress?.Level ?? 0,
                QuestionPlan = JsonSerializer.Serialize(new WordPlan(v.Term, v.Ipa, questions))
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
        return next is { } item
            ? new(item.Question.Id,
            item.Word.Id,
            item.Question.Type,
            item.Question.Role,
            item.Question.Prompt,
            item.Question.AudioUrl,
                item.Question.Options)
            : null;
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
        Rules.Require(word.Vocabulary.DeletedAt == null && word.Vocabulary.LearningProgress?.IsSuspended != true,
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
            MeaningId = q.MeaningId.HasValue && await db.VocabularyMeanings.AnyAsync(m => m.Id == q.MeaningId, ct) ? q.MeaningId : null,
            ExampleId = q.ExampleId.HasValue && await db.VocabularyExamples.AnyAsync(e => e.Id == q.ExampleId, ct) ? q.ExampleId : null
        };
        db.ExerciseAttempts.Add(attempt);
        if (!correct)
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
                Rules.Require(w.Vocabulary.DeletedAt == null && w.Vocabulary.LearningProgress?.IsSuspended != true,
                    "An archived/suspended word requires abandoning this session.",
                    409);
                if (w.Source == SessionWordSource.ExtraPractice) continue;
                var assessments = w.ExerciseAttempts.Where(a => a.Role == AttemptRole.Assessment).ToArray();
                var passed = assessments.Length > 0 && assessments.All(a => a.IsCorrect) && assessments.Any(a => a.ExerciseType is ExerciseType.MeaningMcq or ExerciseType.FillBlank);
                var progress = w.Vocabulary.LearningProgress;
                if (progress == null)
                {
                    progress = new LearningProgress
                    {
                        Vocabulary = w.Vocabulary
                    };
                    db.LearningProgress.Add(progress);
                }
                Rules.Require(progress.Level == w.LevelAtStart,
                    "Progress changed since session start; abandon and restart.",
                    409);
                var before = progress.Level;
                var after = (short)(passed ? Math.Min(5, before + 1) : before == 0 ? 0 : Math.Max(1, before - 1));
                var previous = progress.LastReviewedAt;
                TimeSpan interval = Interval(after);
                if (!passed) interval = TimeSpan.FromMinutes(10);
                if (passed && before == 5)
                {
                    var last = await db.ReviewEvaluations
                        .Where(e => e.SessionWord.VocabularyId == w.VocabularyId)
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
                progress.UpdatedAt = now;
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
