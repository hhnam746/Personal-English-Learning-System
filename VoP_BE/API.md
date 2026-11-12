# VOP API

.NET 8 controller API, single learner. Base URL: `http://127.0.0.1:5080`.

## Run and verify

```sh
dotnet build
dotnet ef database update --project VoP.Repository --startup-project VoP.Api -- --environment Development
dotnet run --project VoP.Api -- --environment Development
dotnet run --project VoP.ApiChecks
```

Connection comes from `ConnectionStrings:DefaultConnection` (existing local .NET User Secrets or environment). Never put a password in source. Migrations are explicit, not applied automatically on API startup. ApiChecks creates a uniquely named isolated PostgreSQL database, migrates it, starts the API on a free loopback port, exercises HTTP plus database invariants, then stops its own host. Test databases are retained for inspection; no live data is reset. The configured local role needs CREATEDB for this check runner.

No authentication/user model is part of the supplied schema. The API defaults to loopback, with no permissive CORS. Add authentication and per-user ownership before exposing remotely. No third-party pronunciation service or audio storage is provisioned: clients play the stored HTTP(S) `audioUrl`. URLs are metadata, never fetched by the server.

## Contract

JSON camelCase fields; enum values snake_case strings; unknown input properties and numeric enums rejected. Flashcard `rating` and suspension `isSuspended` are required; missing/null ratings and null nested meaning/example items return400 without writing records. Client never supplies correctness, SRS level, timestamps or snapshots. Errors use RFC ProblemDetails (`status`, `title`, `traceId`); model validation includes `errors`. 400 invalid input, 404 missing resource, 409 duplicate or invalid state, 500 generic server error (details in server logs).

Paged responses: `{items, pageNumber, pageSize, totalItems}`. Default `page=1&pageSize=20`, maximum pageSize 100, maximum page 100000. UTC timestamps; dashboard calendar days UTC. Vocabulary responses include additive `level`, `nextReviewAt`, `isSuspended` fields. Vocabulary IDs in learning/flashcard routes refer to vocabulary, not a separate progress-row ID.

| Feature | Method | Route | Input / result |
|---|---|---|---|
| Vocabulary | GET | `/api/vocabularies` | `search`, `level=0..5`, `dueOnly`, `sort=recent|alpha|level`, `page`, `pageSize`; filters/count/sort run before paging |
| Vocabulary | POST | `/api/vocabularies` | VocabularyRequest below; 201 + Location |
| Vocabulary | GET | `/api/vocabularies/{id}` | Word with all ordered meanings/examples |
| Vocabulary | PUT | `/api/vocabularies/{id}` | Full aggregate replacement; IDs retain nested objects |
| Vocabulary | DELETE | `/api/vocabularies/{id}` | Soft-delete; 204, history preserved |
| Pronunciation | PATCH | `/api/vocabularies/{id}/pronunciation` | `{ipa,audioUrl}`; null clears a value |
| Learning | GET | `/api/learning-progress` | `level=0..5`, `dueOnly`, `suspended`, paging |
| Learning | GET | `/api/learning-progress/{id}` | Level, first/last learned/review and next due |
| Learning | PATCH | `/api/learning-progress/{id}/suspension` | `{isSuspended:true}`; active session must close first |
| SRS history | GET | `/api/learning-progress/{id}/evaluations` | Paged per-word evaluation history, including archived words |
| Sessions | POST | `/api/practice-sessions` | `{limit:12,audioEnabled:true}` auto-select; or explicit vocabularyIds |
| Sessions | GET | `/api/practice-sessions` | Paged session summaries |
| Sessions | GET | `/api/practice-sessions/{id}` | Frozen selected words, answered/remaining counts, status |
| Exercise | GET | `/api/practice-sessions/{id}/next-question` | Next public question, or 204 when ready to complete |
| Exercise | POST | `/api/practice-sessions/{id}/answers` | `{questionId,answer}`; result includes isCorrect and correctAnswer |
| Sessions | POST | `/api/practice-sessions/{id}/complete` | Atomically evaluate all words and close; retry returns same closed session |
| Sessions | POST | `/api/practice-sessions/{id}/abandon` | Close without changing SRS; retains attempts |
| Attempts | GET | `/api/practice-sessions/{id}/attempts` | Paged answers, correctness and assessment/reinforcement role |
| Flashcards | GET | `/api/flashcards` | `level=0..5`, paging; front and back fields, flip is client UI |
| Flashcards | POST | `/api/flashcards/{id}/reviews` | `{rating:"remembered"}` or `"forgotten"`, optional owned meaningId |
| Flashcards | GET | `/api/flashcards/reviews` | Optional vocabularyId, paging; independent rating history |
| Dashboard | GET | `/api/dashboard` | `days=1..366` default30; totals, levels, accuracy, daily activity |
| Health | GET | `/health` | PostgreSQL connectivity, 200 or503 |

### Create a vocabulary

```json
{
  "term": "resilient",
  "ipa": "/rɪˈzɪliənt/",
  "audioUrl": "https://your-audio-host/resilient.mp3",
  "meanings": [{
    "meaningVi": "kiên cường",
    "partOfSpeech": "adjective",
    "ipaOverride": null,
    "examples": [{
      "sentenceEn": "She remained resilient.",
      "sentenceVi": "Cô ấy vẫn kiên cường.",
      "clozeSentenceEn": "She remained ________.",
      "clozeAnswer": "resilient"
    }]
  }]
}
```

PUT uses the same shape: include existing meaning/example `id` to retain it; omit ID to add; omitted children are removed. Minimum one nonblank meaning; bounded strings/collections. Cloze fields are both empty or both supplied, with `________` in the sentence. Deleted nested children have nullable historical FK references set null; answered snapshots and frozen session plans retain original content. Term normalization prevents duplicates, including archived terms. Archived vocabulary cannot be recreated under the same normalized term; no restore/hard-delete API is included.

### Practice flow

1. POST a session. `{}` selects eligible words automatically. `{ "vocabularyIds":["..."], "audioEnabled":true }` selects explicit new/due words. `{ "vocabularyIds":["..."], "extraPractice":true }` permits not-due practice without SRS changes.
2. GET session details for the learning introduction (new-word IDs and term/IPA); GET vocab details if the UI needs full meaning/examples before starting.
3. GET next-question. `meaning_mcq`: prompt is English term, choose exact Vietnamese option. `listen_choose`: play audio, choose English option. `listen_type`: play audio, type English term. `fill_blank`: type the cloze answer.
4. POST questionId plus answer. Grading is server-side; `correctAnswer` is returned only after consuming the pending question. The question response has no expected answer. Repeat until GET next-question returns204.
5. POST complete. An incomplete session returns409. POST abandon to exit without awarding SRS progress.

Questions are issued in sequence, with immutable server-generated IDs. Duplicate/out-of-order or cross-session question IDs return409. Concurrent duplicate answers cannot apply twice; selected words cannot overlap another active session. Completion and progress changes share a PostgreSQL advisory transaction lock. GET question can be repeated/resumed after restart; no in-memory queue or client-supplied grading state is trusted.

## Learning rules and explicit defaults

Rules follow the existing `../demo/js/learning.js` and `data.js`, which label these schedules/limits as proposed trial defaults, not a finalized learning-science specification. All schedule code is centralized in Practice/Service.

- Level0 = not learned; Levels1..5 delays: 10minutes,6hours,1day,3days,7days. Level5 consecutive maintenance succeeds: subsequent maintenance after one prior passed 5→5 review uses14days.
- Auto session max12. Prefer up to8 due words when new words exist, fill remaining with oldest new, interleave2due/1new, fill unused capacity with more due. Suspended/archived excluded. Explicit extra practice is the only way to select not-due words.
- First assessment rotates across four types. Missing audio/audio disabled falls back to meaning; missing explicit cloze falls back to meaning. New words and audio-only first assessments get a separated second semantic assessment. New words need two correct assessments; learned words need at least one, with semantic evidence.
- Any wrong assessment blocks promotion even if repair is correct. Learned failure decreases one level, floor1; new failure stays0. Successful assessment promotes one level, cap5. Failed learned words retry in10minutes. Level0 has no due date and remains new.
- First wrong assessment queues one semantic reinforcement about six positions later, or at queue end. **Backend completion rule:** a wrong reinforcement queues another reinforcement until correct, so completing cannot silently discard unresolved practice. Reinforcement never awards levels or changes the failed assessment verdict.
- Explicit extra practice records attempts but does not create SRS evaluations or change progress/schedule.
- Comparison uses NFKC, lowercase, trimmed/collapsed whitespace, curly-apostrophe normalization and trailing punctuation removal. Multiple choice must send an exact displayed option, not an index. Distractors come from up to300 existing meanings; when only one choice exists, an explicit never-correct "none" distractor keeps one-word libraries usable. No generated definitions/audio service is used.
- Pending plans are stored in additive nullable `session_words.question_plan` JSONB; old pre-plan sessions can be read/abandoned but not resumed. Vocabulary updates cannot change already planned questions. Never expose question_plan or raw entities to clients.
- Flashcard flipping is presentation only; server returns card data. Rating history is separate and does not mutate SRS.
- Dashboard live-vocabulary totals exclude archived words; historical attempts/session/rating counts include archived data. Accuracy denominator is assessments only (not repairs/flashcards), includes answered assessments in abandoned sessions; null accuracy for no assessments. Activity is zero-filled UTC days.

## Maintainability / intentional omissions

`VoP.Api/Controllers` handles HTTP, `VoP.Service/<Feature>` owns validation/business DTOs and rules, `VoP.Repository` owns EF mappings/migrations. Like the AutoWashPro sample, feature services query AppDbContext directly; there is no redundant generic repository, unit-of-work wrapper, mapper package or event bus. Interfaces permit replacement/tests without hiding EF behind pass-through methods. Cancellation flows through to database queries.

Not included: authentication/multiuser, TTS/audio upload, frontend rewiring, public deployment, restore/hard-delete, automatic migrations, spaced repetition cron jobs (due dates are queried on demand). No extra services/dependencies are necessary for these features.
