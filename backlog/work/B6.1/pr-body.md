<!-- Title: feat(todos): B6.1 Escape clears the new-todo title -->

## Item

B6.1 — Escape clears the new-todo title (spec §29)

- spec: §29 — written in this branch (D-33); lifts nothing
- test: `src/components/todo-form.test.tsx::AC-29.1 … AC-29.6`, `e2e/29-escape-new-todo.spec.ts::AC-29.7` — red before (`scripts/verify-red.sh`; AC-29.3–AC-29.5 pinned green first), green after
- acceptance: AC-29.1 … AC-29.7

Closes #261

## Plan

### B6.1 plan — Escape clears the new-todo title (§29)

Approach: A from `advice.md`. An `onKeyDown` on the "New todo" input only: `pending` or `!isSearchEscape(event.nativeEvent)`
→ return; else `preventDefault()`, `box.current.value = ''`, `setDraft('')`. This matches §29's Function contracts
literally and D-33 (one `src/` file). The input stays uncontrolled, so the server-rendered markup and the reset design
of §10 and §18 stay as they are. It gets the native event, as `todo-search-form.tsx` does, so a legacy `Esc` does
nothing (AC-29.3). No skeleton commit: the card adds no export, so the red tests fail on assertions, not imports (advice).
No migration, dependency, env key or CI-protected path, so no `config-change-approved` label.

#### Files

| File                                | Change                                                                                                     | Why (AC-29.n) |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------- |
| `src/components/todo-form.tsx`      | Add the input's `onKeyDown`, import `isSearchEscape`; header and draft-writer comment name §29             | 29.1–29.7     |
| `src/components/todo-form.test.tsx` | Add a §29 `describe`: AC-29.3–29.5 pinned green first, then AC-29.1, 29.2, 29.6 (red); mock keys unchanged | 29.1–29.6     |
| `e2e/29-escape-new-todo.spec.ts`    | Add (red): AC-29.7                                                                                         | 29.7          |
| `spec/features-map.md`              | Add the F27 row (§29) ✅, code-writer's `docs(map)` after `feat` (B1.85)                                   | map           |

Paperwork (exempt): the §29 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/components/todo-form.tsx (§5, §10, §18, §29): TodoForm(): ReactNode, signature, props and markup unchanged
import { isSearchEscape } from '@/lib/escape-search'; // §27, unchanged
onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>): void => { /* pending guard, native-event Escape, clear */ }}
// No Server Action, Zod schema, Prisma model, query, env key, src/lib file or new export.
```

#### Verification

Baseline: `pnpm test` 241 passed (39 files), e2e 52 tests. Keys: Escape variants go through `fireEvent.keyDown`
(cancelable, `defaultPrevented` from its return value, so `Esc` stays the legacy value). Enter and typing go through
`userEvent`, because jsdom does not submit a form on an untrusted keydown. Pin (`test(todos): B6.1 pin AC-29.3–29.5 …`):
these hold on today's code and each asserts its own Then. AC-29.3 is 8 key rows plus 1 Enter test (`title` `Buy milk`,
1 call), AC-29.4 is 4 target rows (body, "Add", "Other", "Search todos") and AC-29.5 is 1 pending test, so 14 rows,
241 → 255 passed. Red (`test(todos): B6.1 … (red)`): `scripts/verify-red.sh B6.1` exit 0. AC-29.1 (1), AC-29.2
(3 rows: empty, `x` ×201 set by script, `  hi  `) and AC-29.6 (1) fail on assertions (the box still holds the text,
`defaultPrevented` false, counter not `0 / 200`), never on an import. `pnpm test:e2e e2e/29-escape-new-todo.spec.ts`
→ AC-29.7 fails on the box value after Escape (`Buy eggs`, not empty), recorded in the body. Green: `pnpm lint &&
pnpm typecheck` clean · `pnpm test` 255 → 260 passed; a different count is stated in the red commit. The AC-5.2, AC-10.5,
AC-18.3 and AC-18.6 tests stay green · `pnpm test:e2e` 52 → 53 passed, and `e2e/18-title-counter.spec.ts` and
`e2e/27-escape-search.spec.ts` stay green.
`pnpm test:mutation` stays ≥ 70: components are outside Stryker, and AC-29.1/29.3/29.5 kill the guard and
`preventDefault` mutants by assertion. `pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK.

#### Work breakdown

| Step | Role / skill    | Produces                                                    | Commit                                  |
| ---- | --------------- | ----------------------------------------------------------- | --------------------------------------- |
| 1    | test-writer     | AC-29.3–29.5 in `todo-form.test.tsx`, green                 | `test(todos): B6.1 pin AC-29.3 …`       |
| 2    | test-writer     | AC-29.1, 29.2, 29.6 + `e2e/29-escape-new-todo.spec.ts`, red | `test(todos): B6.1 … (red)`             |
| 3    | code-writer     | `onKeyDown` in `todo-form.tsx`                              | `feat(todos): B6.1 …`                   |
| 4    | code-writer     | F27 row ✅                                                  | `docs(map): F27 Escape clears … [B6.1]` |
| 5    | reviewer (diff) | `review.md` diff section                                    | `docs(backlog): B6.1 review …`          |

Plan review: approved, round 2 (round 1: 3 reasons, pin commit, counts, `userEvent` Enter, applied 91013c5) · Plan approved by: reviewer (D-27, tier medium, issue #261) · Rounds: 1

## Map delta

F27 · §29 · new row, ✅ — `onKeyDown` on the "New todo" input in `src/components/todo-form.tsx`; tests `src/components/todo-form.test.tsx` (AC-29.1–29.6), `e2e/29-escape-new-todo.spec.ts` (AC-29.7); evidence: `pnpm test` → 260 passed, `pnpm test:e2e` → 53 passed (docs(map) 7775102, by code-writer after feat 6a60e13).

## Review

`/review-loop`: passes 1/3, verdict ready for PR, 0 findings (`backlog/work/B6.1/review.md` "Diff review (round 1)").

| Pass | #   | Finding                                                                         | Source   | Kind     | Disposition      | Justification                                                                                                                                                                     |
| ---- | --- | ------------------------------------------------------------------------------- | -------- | -------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Q1  | `box.current.value = ''` after a failed save: next submit and §10/§18 reset ok? | dev-lead | question | no change needed | traced: Escape sets box and `draft` to `''`, so `defaultValue` follows; next success resets to `''`, a second failure keeps `Walk the dog`; AC-29.6 asserts 2 calls, 1 → 0 alerts |
| 1    | Q2  | `docs/metrics.md` row inside feat 6a60e13 a plan deviation?                     | dev-lead | question | no change needed | the plan lists it as exempt paperwork; `check-plan-scope.sh` and `check-feat-commits.sh` OK; same as B5.6 (8d61eda)                                                               |

Suites (reviewer): `Tests 260 passed (260)` · e2e `53 passed (1.3m)` · Stryker `Final mutation score of 92.62 is greater than or equal to break threshold 70`. Revert probes traced, not run (TMPDIR unset): dropping `pending ||`, `preventDefault()`, `box.current.value = ''`, `setDraft('')` or `.nativeEvent` each fails at least one AC-29.n test. `pnpm build` not run locally [unverified]; CI builds.

Riskiest unfalsified: AC-29.6 (failed save, then Escape, then the next save resets the form) is proven only in jsdom; e2e AC-29.7 covers Escape without a prior failure.

## Evidence

- AC met: 7/7 (AC-29.1 … AC-29.7)
- tier: medium
- plan deviations: none (step 4's `docs(map)` commit was written by `code-writer`, as planned per B1.85)
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
