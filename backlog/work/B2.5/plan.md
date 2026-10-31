# B2.5 plan — Search todos by title (§16)

Approach: A from `advice.md` — own modules as §16's Function contracts name them (D-20 (a)), two phases like B2.2/B2.3.
Phase A (now) builds the pure search lib and the search form (a Server Component, native GET form), touching no file
B2.4 holds (`src/app/page.tsx`, `src/lib/todos.ts`, `src/lib/todo-schema.ts`, `src/actions/todos.ts`, `prisma/`).
`todo-schema.ts` is only imported (`TITLE_MAX_LENGTH`, read-only, advice Way 1). Phase B mounts the form after B2.4 is
MERGED. Analysis questions as proposed; the e2e moves to phase B (advice, departs from analysis Q8). Approving this plan
ticks §16's `Lead approves spec` box (D-7). No dependency, migration, env key or CI-protected path (no
`config-change-approved`).

## Files

| File                                       | Change                                                                                                    | Why (AC-16.n)    |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ---------------- |
| `src/lib/todo-search.ts`                   | Add: `SEARCH_QUERY_MAX_LENGTH`, `parseSearchQuery`, `searchTodos`, `searchEmptyMessage` (pure)            | 16.1–16.4        |
| `src/lib/todo-search.test.ts`              | Add (red): AC-16.1, AC-16.2, AC-16.3 (punctuation; Café), AC-16.4; length guard = real `TITLE_MAX_LENGTH` | 16.1–16.4, 16.5R |
| `src/components/todo-search-form.tsx`      | Add: `TodoSearchForm` (no `'use client'`), label id `search-todos`, hidden `filter` only when not All     | 16.5             |
| `src/components/todo-search-form.test.tsx` | Add (red): AC-16.5, two renders (`all`/`''`, `active`/`'milk'`)                                           | 16.5             |

Phase B (after B2.4 merges; added by the round-2 amendment, not approved now): `src/app/page.tsx` mount,
`e2e/16-search.spec.ts` (AC-16.6, AC-16.7, one unprefixed REQ-16.8 empty-store test), `src/lib/CLAUDE.md`,
`src/components/CLAUDE.md` rows. Paperwork (exempt): `spec/features-map.md` F14 row ✗ in the skeleton; §16 index row
stays ✗ until closing (`check-ac-coverage.sh` would demand AC-16.6/16.7 before phase B); `docs/metrics.md` row.

## Sequence (phase B)

When B2.4 is merged: `git merge origin/main` (never rebase), amend this plan with the page row, e2e and two guides,
`scripts/next-task.sh --check B2.5`, amendment review, stop for the lead's round-2 approval
(`docs(backlog): B2.5 plan round 2 approved`). Then red e2e (no script proof: commit body records
`pnpm test:e2e e2e/16-search.spec.ts` → 3 failed), green mount: `shown = searchTodos(filterTodos(todos, filter), query)`,
empty text `searchEmptyMessage(filter, todos.length, query)`, count and both bulk buttons still from `todos`
(REQ-16.9). Earlier only if B2.4's written plan lists neither `page.tsx` nor `todo-schema.ts` and `--check` is clean.

## Interfaces touched

```ts
// src/lib/todo-search.ts (§16) — pure, no Prisma, no server-only
export const SEARCH_QUERY_MAX_LENGTH: number; // = TITLE_MAX_LENGTH from '@/lib/todo-schema'
export function parseSearchQuery(value: string | string[] | undefined): string;
export function searchTodos<T extends { readonly title: string }>(todos: readonly T[], query: string): T[];
export function searchEmptyMessage(filter: TodoFilter, totalCount: number, query: string): string;
// src/components/todo-search-form.tsx (§16) — Server Component
export function TodoSearchForm({ filter, query }: { readonly filter: TodoFilter; readonly query: string }): ReactNode;
```

No route, action, Zod schema, Prisma model or env var changes. Query param `q` (GET `/`).

## Verification

```bash
scripts/verify-red.sh B2.5   # phase A: 8 new tests fail on NotImplementedError or an assertion, 0 new pass
pnpm lint && pnpm typecheck && pnpm test   # 138 + 6 (lib) + 2 (component) = 146 green
pnpm test:e2e                # phase A: unchanged, 24 passed
pnpm test:mutation           # ≥ 70; todo-search.ts no survivors (trim, toLowerCase both sides, includes, guard order)
scripts/ci/check-ac-coverage.sh && scripts/ci/check-spec-sections.sh && scripts/ci/check-feat-commits.sh \
  && scripts/ci/check-features-map.sh
# phase B: e2e/16 red 3 failed → green; pnpm test:e2e 24 + 3 = 27 passed
```

## Work breakdown

| Step       | Role / skill                          | Produces                          | Commit                                    |
| ---------- | ------------------------------------- | --------------------------------- | ----------------------------------------- |
| 1 skeleton | `new-feature-slice`                   | 2 stubs, F14 row (✗)              | `chore(todos): B2.5 skeleton`             |
| 2 red      | `test-writer` → red gate (dev-lead)   | lib + component tests             | `test(todos): B2.5 search by title (red)` |
| 3 green    | `code-writer` → green gate (dev-lead) | two modules                       | `feat(todos): B2.5 search by title`       |
| 4 review   | `reviewer` (diff), `/review-loop`     | `review.md` diff section          | `docs(backlog): B2.5 diff review …`       |
| 5 B red    | `test-writer` (after round-2 approve) | `e2e/16`, red on the page         | `test(ui): B2.5 search on / (red)`        |
| 6 B green  | `code-writer` → green gate            | page mount + 2 CLAUDE.md          | `feat(ui): B2.5 mount search`             |
| 7 map      | dev-lead                              | F14 row: tests, page; metrics row | `docs(map): F14 search by title [B2.5]`   |
| 8 review   | `reviewer` (diff), `/review-loop`     | pass 2, gate clear                | `docs(backlog): B2.5 diff review …`       |

PR stays draft until phase B is green.

Plan review: pending · Plan approved by: · Rounds: 1
