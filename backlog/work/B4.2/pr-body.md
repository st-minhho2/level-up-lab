## Item

B4.2 — Clear the search with one link (spec §21)

- spec: §21 — new, D-24 (lifts "a 'clear search' link" from §16's Out of scope in the same `docs(spec)` commit)
- test: `src/lib/clear-search.test.ts::AC-21.1` … `e2e/21-clear-search.spec.ts::AC-21.7` — red before (`scripts/verify-red.sh B4.2`), green after
- acceptance: AC-21.1 … AC-21.7 (all)

Claim order on record: `scripts/next-task.sh --claim B4.2` failed on main 208bc74 (`xargs: unterminated quote`, quote
characters in the E4 titles); the claim was first checked with a sed-trim copy of the script (WIP 0/3) before #107
merged, then confirmed after it merged ("this checkout holds feat/B4.2-clear-search").

## Plan

### B4.2 plan — Clear the search with one link (§21)

Approach: A from `advice.md` — `next/link` as the last child of the `<form>`, gated by `isSearchInEffect(query)`, `href`
from `clearSearchHref(filter)`: the §21 Function contracts block word for word; B (bare `<a>`) contradicts it. One
phase, one lead approval (D-22, D-24): UI only in `todo-search-form.tsx`, logic in the new `src/lib/clear-search.ts`;
no `src/app/page.tsx`, `todo-item.tsx`, `remaining-count.tsx`, `todo-count.ts`, `todo-search.ts`, no `src/*/CLAUDE.md`.
Analysis Q1–Q5, Q7–Q9 as proposed; Q6 as corrected by advice (F19 row in `docs(map)` after feat). Approving ticks §21's
`Lead approves spec` box. No migration, no dependency, no env key, no CI-protected path (no `config-change-approved`).
Claim order on record: `next-task.sh --claim` failed on main (`xargs: unterminated quote`, E4 titles); the claim was
first checked with a sed-trim copy of the script (WIP 0/3) before #107 merged, then confirmed after it ("this checkout holds").

#### Files

| File                                       | Change                                                                                                    | Why (AC-21.n) |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------- |
| `src/lib/clear-search.ts`                  | Add: `CLEAR_SEARCH_LABEL`, `isSearchInEffect`, `clearSearchHref` (pure, no server-only)                   | 21.1, 21.2    |
| `src/lib/clear-search.test.ts`             | Add (red): AC-21.1 (3 hrefs + label), AC-21.2 (6 queries incl. `'x'`×201, `'\t\n'`)                       | 21.1, 21.2    |
| `src/components/todo-search-form.tsx`      | `<Link href={clearSearchHref(filter)}>` after the submit button, only when `isSearchInEffect(query)`      | 21.3, 21.4    |
| `src/components/todo-search-form.test.tsx` | Add (red): AC-21.3, AC-21.4 (each also asserts `isSearchInEffect`, so red on the stub); AC-16.5 untouched | 21.3, 21.4    |
| `e2e/21-clear-search.spec.ts`              | Add (red): AC-21.5, AC-21.6, AC-21.7 (nested describe, `test.use({ javaScriptEnabled: false })`)          | 21.5–21.7     |

Paperwork (exempt): `spec/features-map.md` F19 row ✗ in the skeleton, ✅ in `docs(map)`; §21 index row stays ✗ until
the closing PR; `docs/metrics.md` per-card row. Expected order-only conflicts on index rows 20/22 and F18/F20 at merge.

Skeleton: `clear-search.ts` stubs throw `NotImplementedError`; `todo-search-form.tsx` unchanged (wiring a throwing stub
would turn the 2 AC-16.5 tests red), so AC-21.3 fails on an assertion (no link) and AC-21.4 on the stub.

#### Interfaces touched

```ts
// src/lib/clear-search.ts (§21) — pure, no Prisma, no server-only; importable from a Server Component
export const CLEAR_SEARCH_LABEL: string; // 'Clear search'
export function isSearchInEffect(query: string): boolean; // query.trim() !== ''; never throws
export function clearSearchHref(filter: TodoFilter): string; // filter === 'all' ? '/' : `/?filter=${filter}`
// src/components/todo-search-form.tsx: TodoSearchForm({ filter, query }): ReactNode — signature, §16 markup, key and
// hidden filter input unchanged; still no 'use client'
```

#### Verification

Red (`test(todos): B4.2 … (red)`): `scripts/verify-red.sh B4.2` exit 0, 4 new unit/component tests failing on an
assertion or `NotImplementedError` (`clear-search.test.ts` 2, `todo-search-form.test.tsx` +2);
`pnpm test:e2e e2e/21-clear-search.spec.ts` → 3 failed, recorded in the red commit body. Green: `pnpm lint &&
pnpm typecheck` clean · `pnpm test` 190 → 194 passed, the 2 AC-16.5 tests byte-identical (`git diff` shows only added
lines in `todo-search-form.test.tsx`) · `pnpm test:e2e` 35 → 38 passed (`12`, `16` unchanged) · `pnpm test:mutation`
≥ 70, `clear-search.ts` 100 (hot spots in `advice.md`) · `pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK. Counts
are the test-writer's target; a different count is stated in the red commit.

#### Work breakdown

| Step | Role / skill        | Produces                                  | Commit                         |
| ---- | ------------------- | ----------------------------------------- | ------------------------------ |
| 1    | `new-feature-slice` | `clear-search.ts` stubs, F19 ✗            | `chore(todos): B4.2 skeleton`  |
| 2    | test-writer         | 2 unit/component files + `e2e/21`, red    | `test(todos): B4.2 … (red)`    |
| 3    | code-writer         | `clear-search.ts`, `todo-search-form.tsx` | `feat(todos): B4.2 …`          |
| 4    | dev-lead            | F19 ✅                                    | `docs(map): F19 … [B4.2]`      |
| 5    | reviewer (diff)     | `review.md` diff section                  | `docs(backlog): B4.2 review …` |

Plan review: approved, round 1 (b62fb0f; 0 findings, 5 costs listed for the lead) · Plan approved by: · Rounds: 1

Plan review costs for the lead (review.md round 1): F19 row is ✗ in the skeleton (plan line 7 wording says after
feat; the table and work breakdown are right); AC-21.4 is red only via its `isSearchInEffect` assertion; `next/link`
navigates client-side once hydrated (the Function contract governs over "client-side navigation by script"); the
card's red reason will read `NotImplementedError`, not a missing module; plan is 59 lines.

## Map delta

pending

## Review

pending

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
