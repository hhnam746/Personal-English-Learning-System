# Flashcard / Progress verification scope

## Acceptance

- Server filter/count/paging, no personal DB writes in tests.
- Flashcard flip, meanings/examples, audio control, keyboard, prev/next, rating persistence, failed mutation retains state, pending filter/navigation lock, early/last-card finish and restart.
- Result counts are latest self-rating per vocabulary in current client round, not all-time accuracy; skipped cards remain unrated. Refresh/filter changes restart client round, not stored review history.
- Progress all-time accuracy distinct from selected UTC period; no fake null percentages, weak-word ranking, new-word-per-day or Level timeline.
- Current Level distribution, due words, server-paged real session history and direct links.
- Empty/error/loading states, independent panel errors, responsive and light/dark.

## Sources

- `../demo/VOP_Product_Concept_Brief.md` sections 11, 14.
- `../demo/js/views.js`: flashcards, flashResult, progress.
- `../VoP_BE/VoP.Service/{Flashcards,Dashboard,Learning,Practice}`.
- Read-only researcher brief and independent reviewer: four required findings addressed (pending filter, readable keyboard region, mount-refetch session history, honest early-result title).

## Reproduce

Use README isolated test-host procedure, then:

```sh
VOP_TEST_API_URL='<isolated host URL>' pnpm exec playwright test flashcards-progress.spec.ts
pnpm exec eslint src/features/flashcards src/features/progress src/pages/flashcards.page.tsx src/pages/progress.page.tsx tests/e2e/flashcards-progress.spec.ts
pnpm typecheck
pnpm test
pnpm build
```

Do not run writes against the personal database. Supplied/generated content is not stored as application demo data. Device audio/Safari/physical phone remain unverified. Concurrent unrelated UI work belongs to its own owner; do not change those files to silence checks.

## Observed results — 2026-11-12

- API isolated-host runner: 158 checks passed, .NET build 0 warnings/errors.
- Full Chromium browser suite: 14/14 passed (including four new Flashcard/Progress tests).
- Five unit tests passed; typecheck, production build and feature-scoped ESLint passed.
- Browser matrix: light/dark × 320/375/768/1024/1440; inspected screenshots for desktop Progress and narrow long-content Flashcard.
- All writes used the runner-created isolated test database, not the personal DB.
- Full-repo ESLint observed four errors in concurrent external UI changes (carousel, combobox, sidebar, use-mobile), not modified by this task.
