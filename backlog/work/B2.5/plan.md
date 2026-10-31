# B2.5 plan — Search todos by title (§16)

Approach: A from `advice.md` — own modules as §16's Function contracts name them (D-20 (a)), two phases like B2.2/B2.3.
Phase A (now) builds the pure search lib and the search form (a Server Component, native GET form), touching no file
B2.4 holds (`src/app/page.tsx`, `src/lib/todos.ts`, `src/lib/todo-schema.ts`, `src/actions/todos.ts`, `prisma/`).
`todo-schema.ts` is only imported (`TITLE_MAX_LENGTH`, read-only, advice Way 1). Phase B mounts the form after B2.4 is
MERGED. Analysis questions as proposed; the e2e moves to phase B (advice, departs from analysis Q8). Approving this plan
ticks §16's `Lead approves spec` box (D-7). No dependency, migration, env key or CI-protected path (no
`config-change-approved`).

## Files

| File                                       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                             | Why (AC-16.n)                            |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `src/lib/todo-search.ts`                   | Add: `SEARCH_QUERY_MAX_LENGTH`, `parseSearchQuery`, `searchTodos`, `searchEmptyMessage` (pure); D-21 length guard (b43ef24)                                                                                                                                                                                                                                                                                                                        | 16.1–16.4                                |
| `src/lib/todo-search.test.ts`              | Add (red): AC-16.1, AC-16.2, AC-16.3 (punctuation; Café), AC-16.4 (no guard test: AC-16.5's `maxlength` 200 pins the constant through the form, review round 2); D-21 review-pass tests; phase B: `'İ'` × 101 title and query match (guard before lowercasing, diff pass 2 R) and title `'İ'` × 200 vs query `'i̇'` × 100 + `'i'` (201 units) → `[]` (amendment review cost 3), comment at line 102 (N3)                                            | 16.1–16.4, REQ-16.5                      |
| `src/components/todo-search-form.tsx`      | Add: `TodoSearchForm` (no `'use client'`), `maxLength={SEARCH_QUERY_MAX_LENGTH}` imported (never a literal 200), label id `search-todos`, hidden `filter` only when not All; phase B: a `key` of filter and query on the input so each change of filter or query (a filter link or a search) shows the current query, not typed text (REQ-16.2, REQ-16.7, amendment review cost 2; `key={query}` alone missed filter links, diff pass 3 finding 1) | 16.5                                     |
| `src/components/todo-search-form.test.tsx` | Add (red): AC-16.5, two renders (`all`/`''`, `active`/`'milk'`)                                                                                                                                                                                                                                                                                                                                                                                    | 16.5                                     |
| `src/app/page.tsx`                         | Phase B: `searchParams` gains `q`; `query = parseSearchQuery(params.q)`; `shown = searchTodos(filterTodos(todos, filter), query)`; `<TodoSearchForm filter={filter} query={query} />` after `<TodoForm />`; empty `<p>` = `searchEmptyMessage(filter, todos.length, query)`; count and both bulk buttons still from `todos`; header names §16                                                                                                      | 16.6, 16.7, REQ-16.1, REQ-16.8, REQ-16.9 |
| `e2e/16-search.spec.ts`                    | Phase B add (red): AC-16.6, AC-16.7; unprefixed REQ-16.8 (`/?q=milk`, empty store → "No todos yet", form present); unprefixed REQ-16.6 (search from `/?filter=completed` keeps `filter=completed`, diff pass 1 #2); unprefixed REQ-16.2 (on `/?q=milk` type `bread` without submitting, click "Active" → box empty, cost 2); seed via `PrismaClient` as `e2e/14`, no due date                                                                      | 16.6, 16.7, REQ-16.6, REQ-16.8           |
| `src/lib/CLAUDE.md`                        | Phase B: module rows `todo-search.ts` (§16, pure) and `todo-due-date.ts` (section 15, left to this card by B2.4's plan)                                                                                                                                                                                                                                                                                                                            | docs                                     |
| `src/components/CLAUDE.md`                 | Phase B: lines `todo-search-form.tsx` (§16, no `'use client'`: native GET form) and `todo-due-date.tsx` (section 15, `'use client'`, left by B2.4)                                                                                                                                                                                                                                                                                                 | docs                                     |

Phase B rows: round-2 amendment after B2.4 merged (315b97e, closing 32b474c). Paperwork (exempt): `spec/features-map.md` F14 row ✗ in the skeleton; §16 index row
stays ✗ until closing (`check-ac-coverage.sh` would demand AC-16.6/16.7 before phase B); `docs/metrics.md` row.

## Sequence (phase B, round 2)

B2.4 merged; `origin/main` merged here (c8a95ae: conflicts only in the F13/F14 map rows and §15/§16 index rows, both
kept; 168 unit, 25 e2e green after `pnpm db:generate` + `db:deploy`). As planned:

When B2.4 is merged: `git merge origin/main` (never rebase), amend this plan with the page row, e2e and two guides,
`scripts/next-task.sh --check B2.5`, amendment review, stop for the lead's round-2 approval
(`docs(backlog): B2.5 plan round 2 approved`). Then red e2e (no script proof: commit body records
`pnpm test:e2e e2e/16-search.spec.ts` → 5 failed), green mount: `shown = searchTodos(filterTodos(todos, filter), query)`,
empty text `searchEmptyMessage(filter, todos.length, query)`, count and both bulk buttons still from `todos`
(REQ-16.9). Earlier only if B2.4's written plan lists neither `page.tsx` nor `todo-schema.ts` and `--check` is clean. B2.4's plan (dd1d6cf) lists
neither, but lists `src/lib/CLAUDE.md` and `src/components/CLAUDE.md`: an early phase B drops those two rows (closing
commit instead) or waits.

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
scripts/verify-red.sh B2.5   # phase A: 7 new tests (5 lib, 2 component) fail on NotImplementedError or an assertion, 0 new pass
pnpm lint && pnpm typecheck && pnpm test   # 138 + 5 (lib) + 2 (component) = 145 green
pnpm test:e2e                # phase A: unchanged, 24 passed
pnpm test:mutation           # ≥ 70; todo-search.ts no survivors (trim, toLowerCase both sides, includes, guard order)
scripts/ci/check-ac-coverage.sh && scripts/ci/check-spec-sections.sh && scripts/ci/check-feat-commits.sh \
  && scripts/ci/check-features-map.sh
# phase A after D-21: 147 unit. After merging B2.4: 168 unit, 25 e2e
# phase B: e2e/16 red 5 failed (no search landmark) → green; pnpm test 168 + 1 (İ × 101 hardening) = 169;
#          pnpm test:e2e 25 + 5 = 30 passed; mutation ≥ 70, todo-search.ts no survivors; check-plan-scope OK
```

## Work breakdown

| Step       | Role / skill                          | Produces                          | Commit                                                        |
| ---------- | ------------------------------------- | --------------------------------- | ------------------------------------------------------------- |
| 1 skeleton | `new-feature-slice`                   | 2 stubs, F14 row (✗)              | `chore(todos): B2.5 skeleton`                                 |
| 2 red      | `test-writer` → red gate (dev-lead)   | lib + component tests             | `test(todos): B2.5 search by title (red)`                     |
| 3 green    | `code-writer` → green gate (dev-lead) | two modules                       | `feat(todos): B2.5 search by title`                           |
| 4 review   | `reviewer` (diff), `/review-loop`     | `review.md` diff section          | `docs(backlog): B2.5 diff review …`                           |
| 4b harden  | `test-writer`                         | `İ` × 101 case, line-102 comment  | `test(todos): B2.5 review pass 2 -- guard before lowercasing` |
| 5 B red    | `test-writer` (after round-2 approve) | `e2e/16`, red on the page         | `test(ui): B2.5 search on / (red)`                            |
| 6 B green  | `code-writer` → green gate            | page mount + 2 CLAUDE.md          | `feat(ui): B2.5 mount search`                                 |
| 7 map      | dev-lead                              | F14 row: tests, page; metrics row | `docs(map): F14 search by title [B2.5]`                       |
| 8 review   | `reviewer` (diff), `/review-loop`     | pass 3 (last of 3), gate clear    | `docs(backlog): B2.5 diff review …`                           |

PR stays draft until phase B is green.

Plan review: round 1 changes requested (2 reasons), round 2 changes requested (1 reason: the guard test, fixed by dropping it, option (c)); cap of 2 rounds reached, round-2 fix unreviewed, accepted by the lead · Plan approved by: lead (session reply "approve"), 2026-10-31 · Rounds: 1

Round 2 (phase B amendment): amendment review approved (29485f2), 0 findings; costs 2–5 applied after it (key={query} + REQ-16.2 e2e, 201-unit case, 4b before the red, subject), as B2.3 added its REQ-14.4 e2e; cost 1: phase B diff review is pass 3 of 3 · Plan approved by: lead (session reply "Approve"), 2026-10-31 · Rounds: 2

Diff pass 3 blocked (finding 1); lead chose option A in session ("Chọn A"), 2026-11-01: a fourth diff pass for the red
e2e case and the one-line key fix (same Files). Diff pass 4: two findings (wording, untested query half of
the key); lead chose option A again ("Chọn A"), 2026-11-01: a fifth pass, wording + one e2e case, no behavior change.
