<!-- Title: feat(todos): B9.3 the / shortcut also selects the text already in the search box -->

## Item

B9.3 — The `/` shortcut also selects the text already in the search box (spec §46)

- spec: §46 — unchanged in this branch (written before the label under D-40; the §25 edits landed on main)
- test: `src/components/todo-search-form-select.test.tsx::AC-46.1 … AC-46.5`, `e2e/46-search-select.spec.ts::AC-46.6` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-46.1 … AC-46.6

Closes #341

## Plan

### B9.3 plan — The `/` shortcut also selects the text already in the search box (§46)

Approach: A from `advice.md`: in the existing §25 document keydown listener of `src/components/todo-search-form.tsx`,
inside the `isSearchShortcut(event)` branch, call `.select()` on the box ref right after `.focus()`. `isSearchShortcut`
already rejects modifiers and text-entry targets (REQ-46.3), `select()` reads the value at call time (REQ-46.2), and the
unmount cleanup already removes the listener (REQ-46.5). B rejected: a new lib function §46 forbids. No new export, so no
skeleton (as B7.6, B8.3). No migration, dependency, env key or CI-protected path (no `config-change-approved`). The
three §25 edits (REQ-25.5, Out of scope, contract line) already landed on main (D-40); no existing test changes.

#### Files

| File                                              | Change                                                                             | Why (AC-n) |
| ------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------- |
| `src/components/todo-search-form.tsx`             | Change: `.select()` after `.focus()` in the shortcut branch; header names §46      | 46.1–46.6  |
| `src/components/todo-search-form-select.test.tsx` | Add (red): AC-46.1 to AC-46.5, Testing Library, spies on the box `focus`/`select`  | 46.1–46.5  |
| `e2e/46-search-select.spec.ts`                    | Add (red): AC-46.6 (file named by section number, as `e2e/43-complete-all-hidden`) | 46.6       |
| `spec/features-map.md`                            | Add the F44 row (§46), ✅, in code-writer's `docs(map)` commit                     | map        |

Paperwork (exempt): §46 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row. Not in scope: the stale
`src/components/CLAUDE.md` line on `todo-search-form.tsx` (advice: doc drift since §25, not this card's).

#### Interfaces touched

```ts
// src/components/todo-search-form.tsx: signature, props and markup unchanged (§46 Function contracts)
export function TodoSearchForm({
  filter,
  query,
  count,
}: {
  readonly filter: TodoFilter;
  readonly query: string;
  readonly count?: number;
}): ReactNode; // shortcut branch: event.preventDefault(); box.focus(); box.select()
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route.
```

#### Verification

Baseline: `pnpm test` 338 tests in 53 files (two runs: 2 and 8 component tests failed on the 5000 ms timeout, a
different set each run, none in `todo-search-form*`: load, not code); `pnpm test:e2e --list` 82 tests in 36 files.
Red (`test(todos): B9.3 … (red)`, no skeleton): `scripts/verify-red.sh B9.3` exit 0; AC-46.1, AC-46.2, AC-46.3 and
AC-46.5 fail on `selectionEnd`/`select` call counts (an assertion, never an import); AC-46.4 may pass on red (it proves
an absence, REQ-46.3), as test-writer reports; e2e AC-46.6 fails on `selectionEnd` 0 ≠ 4 or the value `milkmom`.
Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 338 → 343 (53 → 54 files, 5 new `it`s), AC-25.2–25.5,
AC-27.2, AC-16.5 green · `pnpm test:e2e` 82 → 83 (36 → 37 files), `e2e/25-search-shortcut.spec.ts` green · mutation:
CI only, no `src/lib` or `src/actions` change (B1.100) · `pnpm build` ok · `scripts/ci/check-features-map.sh`,
`scripts/ci/check-plan-scope.sh` OK.

#### Work breakdown

| Step | Role / skill    | Produces                         | Commit                         |
| ---- | --------------- | -------------------------------- | ------------------------------ |
| 1    | none            | no skeleton (no new export)      | —                              |
| 2    | test-writer     | new unit file + new e2e file     | `test(todos): B9.3 … (red)`    |
| 3    | code-writer     | `.select()` call, header comment | `feat(todos): B9.3 …`          |
| 4    | code-writer     | F44 row ✅                       | `docs(map): F44 … [B9.3]`      |
| 5    | reviewer (diff) | `review.md` diff section         | `docs(backlog): B9.3 review …` |

Costs the lead takes: a `/` now discards the old query on the first typed key (intended, §46); click and Tab still do
not select (out of scope).

Plan review: approved, round 1 · Plan approved by: reviewer (D-27, tier medium, issue #341) · Rounds: 1

## Map delta

F44 · §46 · (new) → ✅ — `TodoSearchForm` calls `.select()` after `.focus()` in the §25 shortcut branch, in
`src/components/todo-search-form.tsx` (`docs(map)` 4076684); evidence: `pnpm test` 343 passed (54 files), `pnpm test:e2e`
83 passed (37 files).

## Review

`/review-loop`: passes 1/3, verdict ready for PR (full tables in `backlog/work/B9.3/review.md`, "Diff review (round 1)").

| Pass | #   | Finding (file:line) | Source   | Kind | Disposition | Justification |
| ---- | --- | ------------------- | -------- | ---- | ----------- | ------------- |
| 1    | —   | none                | reviewer | —    | —           | 0 findings    |

Revert probes (clone under `$TMPDIR`): deleting `select()` fails all 5 component tests; `select()` before `focus()` fails
AC-46.5. AC-46.4 carries a positive control (a plain `/` gives 1 `select` call) so it was red on the red commit; the
reviewer accepted it. Unit-suite note: runs 1 and 3 of 3 had 2 unrelated 5000 ms timeouts (`todo-form-warning.test.tsx`
AC-39.4, AC-39.5), the load flake also seen on main's baseline; no `todo-search-form*` test failed.

Riskiest unfalsified: e2e runs only chromium; `select()` on `type="search"` after the `/` keydown is unproven in WebKit
and Firefox.

## Evidence

- AC met: 6/6
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
