<!-- Title: feat(todos): B5.4 the browser tab title shows the remaining count -->

## Item

B5.4 — The browser tab title shows the remaining count (spec §26)

- spec: §26 — written in this branch (D-30); "a count in the page title" lifted from §13's Out of scope (D-32)
- test: `src/lib/page-title.test.ts::AC-26.1`, `src/app/page.test.ts::AC-26.2, AC-26.3`, `e2e/26-page-title.spec.ts::AC-26.4 … AC-26.7` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-26.1 … AC-26.7

Closes #223

## Plan

### B5.4 plan — The browser tab title shows the remaining count (§26)

Approach: A from `advice.md` — a pure `src/lib/page-title.ts` plus `generateMetadata` in `src/app/page.tsx`, exactly
§26's Function contracts and D-30 (the batch's one `page.tsx` card, no new component); the title is server-rendered,
so it is right with JavaScript off and after a reload, and `revalidatePath('/')` refreshes it (REQ-26.4, proven by
AC-26.5/26.6). Two `listTodos()` reads per request, as §26 states (no `cache()`, `src/lib/todos.ts` untouched). The e2e
file follows the section number: `e2e/26-page-title.spec.ts` (advice Q2). No migration, dependency, env key or
CI-protected path (no `config-change-approved`). Deviation from advice: the skeleton is its own `chore` commit
(dev-lead Loop 6), not part of `test(...)`.

#### Files

| File                         | Change                                                                                                                                                                  | Why (AC-26.n) |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `src/lib/page-title.ts`      | Add `pageTitle` (skeleton throws `NotImplementedError`, then green)                                                                                                     | 26.1          |
| `src/app/page.tsx`           | Add `generateMetadata` (skeleton returns `{}`, so `/` still renders); header §26                                                                                        | 26.2–26.7     |
| `src/lib/page-title.test.ts` | Add (red): AC-26.1                                                                                                                                                      | 26.1          |
| `src/app/page.test.ts`       | Add (red): AC-26.2, AC-26.3; mocks `@/lib/todos` and `@/lib/prisma` with a factory (`{ prisma: {} }`: `server-only` via the client components' actions, review round 1) | 26.2, 26.3    |
| `e2e/26-page-title.spec.ts`  | Add (red): AC-26.4–AC-26.7 with `expect(page).toHaveTitle`                                                                                                              | 26.4–26.7     |
| `spec/features-map.md`       | Add the F24 row (§26): skeleton ✗, ✅ in `docs(map)`                                                                                                                    | map           |

Paperwork (exempt): §26 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/lib/page-title.ts (§26): pure, no Prisma, no server-only
export function pageTitle(remaining: number): string; // `(${remaining}) Todos` when remaining >= 1, else `Todos`
// src/app/page.tsx (§26): no argument, never reads searchParams (REQ-26.3); title only, layout description kept
export async function generateMetadata(): Promise<Metadata>; // { title: pageTitle(countRemaining(await listTodos())) }
// No Server Action, Zod schema, Prisma model, query, env key; layout.tsx, todos.ts, todo-count.ts unchanged.
```

#### Verification

Red (`test(todos): B5.4 … (red)`): `scripts/verify-red.sh B5.4` exit 0; AC-26.1 fails on the skeleton's
`NotImplementedError`, AC-26.2/26.3 on assertions (`title` undefined from the `{}` skeleton);
`pnpm test:e2e e2e/26-page-title.spec.ts` → AC-26.4–26.7 failed on the title (`level-up-lab`, the layout's), the
other 46 e2e stay green between the commits, recorded in the body. Green: `pnpm lint && pnpm typecheck` clean ·
`pnpm test` 218 → 221 passed (3 new AC-26.n) · `pnpm test:e2e` 46 → 50 passed, `e2e/13-remaining-count.spec.ts` and
`e2e/smoke.spec.ts` unchanged and green · `pnpm test:mutation` ≥ 70 with `src/lib/page-title.ts` in scope (`page.tsx`
is outside Stryker; AC-26.2–26.7 cover it) · `pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK. AC-26.5 red after
green code → stop (a client fallback needs a D-n).

#### Work breakdown

| Step | Role / skill        | Produces                                        | Commit                         |
| ---- | ------------------- | ----------------------------------------------- | ------------------------------ |
| 1    | `new-feature-slice` | `pageTitle` + `generateMetadata` stubs, F24 ✗   | `chore(todos): B5.4 skeleton`  |
| 2    | test-writer         | 2 unit files + `e2e/26-page-title.spec.ts`, red | `test(todos): B5.4 … (red)`    |
| 3    | code-writer         | `page-title.ts`, `generateMetadata`             | `feat(todos): B5.4 …`          |
| 4    | dev-lead            | F24 ✅                                          | `docs(map): F24 … [B5.4]`      |
| 5    | reviewer (diff)     | `review.md` diff section                        | `docs(backlog): B5.4 review …` |

Plan review: approved, round 2 (round 1: 1 reason, `@/lib/prisma` factory mock in `page.test.ts`, applied e0de8d4) · Plan approved by: reviewer (D-27, tier medium, issue #223) · Rounds: 1

## Map delta

F24 · §26 · ✗ → ✅ — `pageTitle` in `src/lib/page-title.ts`, `generateMetadata` in `src/app/page.tsx` (skeleton 0986406
added the row ✗, `8007d5f docs(map)` moved it); evidence: `pnpm test` → 222 passed, `pnpm test:e2e` → 50 passed.
Role note: `8007d5f` was made by code-writer, not dev-lead as plan step 4 says, because dev-lead's path hook refuses
`spec/features-map.md`; the diff is exactly what step 4 names.

## Review

`/review-loop`: passes 1/3, verdict ready for PR, 0 findings (dispositions: none needed). Red `019ecc7` → feat
`cef2905`: no test touched after red.

| Command                          | Last line                                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| `pnpm lint`                      | `All matched files use Prettier code style!` (exit 0)                                              |
| `pnpm typecheck`                 | `tsc --noEmit` (exit 0, no error)                                                                  |
| `pnpm test`                      | `Tests  222 passed (222)` (38 files)                                                               |
| `pnpm test:e2e`                  | `50 passed (1.2m)`                                                                                 |
| `pnpm test:mutation`             | `Final mutation score of 92.31 is greater than or equal to break threshold 70` (page-title.ts 100) |
| `scripts/ci/check-plan-scope.sh` | `OK: feat/B5.4-agent stays inside the approved plan of B5.4 (D-27 approval)`                       |
| `scripts/verify-red.sh B5.4`     | `RESULT: red for the right reason` (4 unit tests new and failing; e2e skipped by the script)       |

Unit count 222, not the plan's 221: AC-26.3 (a) and (b) are two tests (stated in the red commit body).

Probes (reviewer, on a copy): a `page.reload()` added to AC-26.5 fails it (`Expected: 0 Received: 1`), and a
memoised `generateMetadata` fails it (`Expected: "(1) Todos" Received: "Todos"`), so AC-26.5 proves the title
refreshes through the Server Action's re-render with zero navigations (REQ-26.4). A count over the filtered or
searched list fails AC-26.4. `page-title.ts`: 6 of 6 mutants killed.

Riskiest unfalsified: Next 15.5.28 streams metadata for dynamic pages, so with JavaScript off the `<title>` may arrive
after the shell; no AC asserts the title without JavaScript.

## Evidence

- AC met: 7/7
- tier: medium
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
