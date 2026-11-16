<!-- Title: feat(todos): B8.2 the filter nav hides a link whose count is 0, except the current filter -->

## Item

B8.2 — The filter nav hides a link whose count is 0, except the current filter (spec §42)

- spec: §42 — unchanged in this branch (written before the label under D-39, #314)
- test: `src/components/todo-filter-nav-hide-empty.test.tsx::AC-42.1 … AC-42.4`, `e2e/42-filter-hide-empty.spec.ts::AC-42.5 … AC-42.7`, AC-30.3, AC-12.7, AC-30.6, AC-30.7 rewritten (D-39) — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-42.1 … AC-42.7

Closes #317

## Plan

### B8.2 plan — The filter nav hides a link whose count is 0, except the current filter (§42)

Approach: A from `advice.md`: in `src/components/todo-filter-nav.tsx` only, filter `FILTER_LINKS` before the `map`
(`counts === undefined` keeps all three; else keep a link when `counts[filter] !== 0 || filter === selected`), so a
dropped link and its span are absent from the document (REQ-42.1). Still an RSC, no new export or prop, so no skeleton
(as B7.6). No migration, dependency, env key or CI-protected path (no `config-change-approved`). The §12/§30 edits are
on main (#314, D-39); the red commit rewrites the four tests D-39 names. e2e file takes the section number: `e2e/42-…`.

#### Files

| File                                                 | Change                                                                     | Why (AC-n) |
| ---------------------------------------------------- | -------------------------------------------------------------------------- | ---------- |
| `src/components/todo-filter-nav.tsx`                 | Change: filter the links before the map; header comment names §42          | 42.1–42.7  |
| `src/components/todo-filter-nav-hide-empty.test.tsx` | Add (red): AC-42.1–42.4, no mocks (pure component), `rerender` for AC-42.4 | 42.1–42.4  |
| `src/components/todo-filter-nav-counts.test.tsx`     | Change (red commit, D-39): AC-30.3 rewritten to its edited text            | 30.3       |
| `e2e/42-filter-hide-empty.spec.ts`                   | Add (red): AC-42.5–42.7, seeded through the UI                             | 42.5–42.7  |
| `e2e/12-filter.spec.ts`                              | Change (red commit, D-39): AC-12.7 rewritten to its edited text            | 12.7       |
| `e2e/30-filter-counts.spec.ts`                       | Change (red commit, D-39): AC-30.6, AC-30.7 rewritten to their edited text | 30.6, 30.7 |
| `spec/features-map.md`                               | Add the F40 row (§42), ✅, in code-writer's `docs(map)` commit             | map        |

Paperwork (exempt): §42 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/components/todo-filter-nav.tsx: signature and props unchanged (§42 Function contracts), no 'use client'
export function TodoFilterNav({
  selected,
  counts,
}: {
  readonly selected: TodoFilter;
  readonly counts?: FilterCounts;
}): ReactNode;
// No Server Action, Zod schema, Prisma model, query, env key, prop, export, lib function or route.
```

#### Verification

Baseline: `pnpm test` 323 passed (50 files); e2e 75 tests (33 spec files). Red (`test(todos): B8.2 … (red)`, no
skeleton: red is the Active link and its "(0)" span still rendered, assertions): `scripts/verify-red.sh B8.2` exit 0;
AC-42.1, AC-42.3, AC-42.4 and rewritten AC-30.3 red (AC-42.2 may pass on today's code: it pins the kept current link);
`pnpm test:e2e` on the three e2e files → AC-42.5, 42.6, 42.7, AC-12.7, AC-30.6, AC-30.7 fail on link counts, recorded
in the body. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 323 → ≥ 327 passed (51 files), AC-12.4, AC-30.2,
AC-30.4 unchanged and green · `pnpm test:e2e` 75 → 78 (34 files), AC-12.5, AC-30.5 and `e2e/16-search`, `21-clear-search`,
`25-search-shortcut` green · mutation: CI only, no src/lib or src/actions change (B1.100) · `pnpm build` ok ·
`scripts/ci/check-features-map.sh`, `scripts/ci/check-plan-scope.sh` OK.

#### Work breakdown

| Step | Role / skill    | Produces                                                    | Commit                         |
| ---- | --------------- | ----------------------------------------------------------- | ------------------------------ |
| 1    | none            | no skeleton (no new function or export)                     | —                              |
| 2    | test-writer     | AC-42.1–42.4, AC-42.5–42.7, AC-30.3/12.7/30.6/30.7 rewrites | `test(todos): B8.2 … (red)`    |
| 3    | code-writer     | the link filter in `TodoFilterNav`                          | `feat(todos): B8.2 …`          |
| 4    | code-writer     | F40 row ✅                                                  | `docs(map): F40 … [B8.2]`      |
| 5    | reviewer (diff) | `review.md` diff section                                    | `docs(backlog): B8.2 review …` |

Costs the lead takes: a keyboard user's focused link can vanish on a count change (out of scope by §42). Four existing
tests change text under D-39, in the red commit only. Another e2e that clicks a link at count 0, if the red run finds
one, stops the build for a re-plan (analysis found none in 16, 21, 25).

Plan review: approved, round 1 · Plan approved by: reviewer (D-27, tier medium, issue #317) · Rounds: 1

## Map delta

pending

## Review

pending

## Evidence

- AC met: pending
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
