# B9.3 review

## Plan review (round 1)

Scope: ui (only `src/components/todo-search-form.tsx`, one new component test file, one new e2e file, the features map).
Plan read at `f68e5cc`. `git diff --stat main...HEAD` shows only `backlog/work/B9.3/{advice,plan}.md`.
I re-ran the baselines: `pnpm test` gives `Test Files 53 passed (53)` and `Tests 338 passed (338)`, which matches the plan.
`pnpm exec playwright test --list` gives `Total: 82 tests in 36 files`, which also matches the plan.
Risk tier: `scripts/agent/tier.sh backlog/work/B9.3/plan.md` gives `medium`, as D-40 says.

| Check                                                                                           | Result                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                                  | pass: `todo-search-form.tsx` is the only file §46 names ("The only file of `src/` this section changes"). `todo-search-form-select.test.tsx` is the file §46's "How the criteria observe it" names. `e2e/46-search-select.spec.ts` follows the section-number naming of `e2e/43-complete-all-hidden.spec.ts` (§43, contract `41-…`). D-40 assigns F44 to B9.3.  |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib                  | pass: the `TodoSearchForm` signature matches §46's Function contracts word for word. The plan adds no action, schema, lib, Prisma, `page.tsx` or export. The component already starts with `'use client'` (line 1).                                                                                                                                             |
| plan follows `advice.md`'s recommendation or states the deviation                               | pass: the plan follows approach A. The e2e name `46-` replaces the advice's `44-`. The advice left the name to test-writer, and the plan states the precedent it follows. Both treat the stale `src/components/CLAUDE.md:11` line as out of scope, for the same reason.                                                                                         |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number                       | pass: there are 6 criteria (AC-46.1 to AC-46.6). Each Then states `selectionStart`/`selectionEnd` values, `document.activeElement`, `defaultPrevented`, spy call counts and order, request counts, or exact addresses and rows.                                                                                                                                 |
| verification lists exact commands with expected numbers                                         | pass: `pnpm test` goes from 338 to 343 (53 to 54 files, 5 new `it`s) and `pnpm test:e2e` from 82 to 83 (36 to 37 files). It names the red failures per AC, including that AC-46.4 may pass on red. Mutation is CI only (no `src/lib` or `src/actions` change, B1.100). It also lists `pnpm build`, `check-features-map.sh` and `check-plan-scope.sh`.           |
| work breakdown has skeleton → red → green → map → review with convention subjects               | pass: the skeleton step is listed as "none" with a reason (no new export, as in B7.6 and B8.3). The subjects `test(todos): B9.3 … (red)`, `feat(todos): B9.3 …`, `docs(map): F44 … [B9.3]` and `docs(backlog): B9.3 review …` follow the precedent.                                                                                                             |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by the reviewer | pass: `spec/contracts/44-search-select.md:5` has `- [ ] Lead approves spec`. It is unticked and I did not touch it.                                                                                                                                                                                                                                             |
| no settled D-n contradicted                                                                     | pass: D-40 rules out any change to `page.tsx`, `src/lib` or `src/actions`, and the plan makes none; the feature id is F44. The §25 edits D-40 lists are already on main: REQ-25.5 at `23-search-shortcut.md:21`, the contract line at `:53`, and "selecting the box's text on focus" is gone from Out of scope (`:60-62`). So the plan correctly edits no spec. |
| `scripts/next-task.sh --check B9.3` says no overlap                                             | pass: `[next-task] B9.3: no overlap with any Doing or Review card` (exit 0).                                                                                                                                                                                                                                                                                    |

Other things checked, no finding:

- Existing `/` presses in e2e run on an empty box. `e2e/25-search-shortcut.spec.ts:83,99,113` and
  `e2e/27-escape-search.spec.ts:99` (the box is `''` after Escape) both qualify. On an empty box `select()` changes no value, so
  typing `zzz` there still gives `zzz`. AC-25.5 (`todo-search-form.test.tsx:263`) counts only `focus` calls, so it stays
  green. This matches the card's claim that no existing test needs rewriting.
- The red is real. AC-46.1, AC-46.2, AC-46.3 and AC-46.5 assert `selectionEnd` or a `select` call count, and the current
  component never calls `select()` (`todo-search-form.tsx:55-56`). AC-46.4 proves an absence and may pass on red. The
  plan says so, so `verify-red.sh` still sees at least four behavioral failures.
- Costs the lead takes, as the plan states them: after `/`, the first typed key replaces the old query (this is §46's purpose).
  Click and Tab into the box still do not select (Out of scope). No behavior is dropped and no role is blocked from its step.
- The plan is 63 lines, in line with B7.6 (60), B8.2 (62) and B8.3 (66).

Verdict: approved (ready for the lead's gate; not approval to build).

## Diff review (round 1)

Scope: ui. Reviewed at `4076684`. Commits: `d163d9a` test (red) → `89d50cc` feat → `4076684` docs(map).

### Command results (last line each)

| Command                       | Result                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`                   | `All matched files use Prettier code style!` (exit 0)                                                                                                                                                                                                                                                                                                        |
| `pnpm typecheck`              | `tsc --noEmit` clean                                                                                                                                                                                                                                                                                                                                         |
| `pnpm test` (3 runs)          | run 2: `Tests 343 passed (343)`. Runs 1 and 3: `Tests 2 failed / 341 passed (343)`. Run 3's failures were AC-39.4 and AC-39.5 in `todo-form-warning.test.tsx`, both `Test timed out in 5000ms`. That is the load flake the plan's baseline records; no `todo-search-form*` test failed. `vitest run src/components/todo-search-form`: `Tests 21 passed (21)` |
| `pnpm test:e2e`               | `83 passed (4.1m)` (AC-46.6 green, 1.7s)                                                                                                                                                                                                                                                                                                                     |
| `scripts/mutation-gate.sh`    | `mutation: CI only, no src/lib or src/actions change`                                                                                                                                                                                                                                                                                                        |
| `check-suppressions.sh`       | `OK: no new suppressions`                                                                                                                                                                                                                                                                                                                                    |
| `check-config-change.sh`      | `OK: no protected config changed`                                                                                                                                                                                                                                                                                                                            |
| `check-feat-commits.sh`       | `OK: no feat commit touches tests`                                                                                                                                                                                                                                                                                                                           |
| `check-ac-coverage.sh`        | `OK: every criterion of a shipped section has a test`                                                                                                                                                                                                                                                                                                        |
| `check-spec-sections.sh`      | `OK: sections cited: 1 … 46`                                                                                                                                                                                                                                                                                                                                 |
| `check-features-map.sh`       | `OK`                                                                                                                                                                                                                                                                                                                                                         |
| `check-plan-scope.sh`         | `OK: feat/B9.3-agent stays inside the approved plan of B9.3 (D-27 approval)`                                                                                                                                                                                                                                                                                 |
| `scripts/verify-red.sh B9.3`  | `5 ran (5 new), 5 new failed, 0 new passed OK (red on behavior)` / `RESULT: red for the right reason` (e2e skipped by the script, needs a server)                                                                                                                                                                                                            |
| `git diff --stat main...HEAD` | 9 files, +645 −3: `src/components/todo-search-form.tsx` (+5 −3), the 2 new test files, `spec/features-map.md`, `docs/metrics.md`, and 4 `backlog/work/B9.3/` files                                                                                                                                                                                           |

Counts match the plan: 338 → 343 unit tests, 53 → 54 files; 82 → 83 e2e tests.

### Checklist

- AC-46.1 to AC-46.6 each have a test whose title starts with the id. Every assertion matches its Then: `selectionStart`/`selectionEnd`
  values, `activeElement`, `defaultPrevented`, fetch/submit counts, `innerHTML` equality, `select` spy 0/1 calls,
  `invocationCallOrder` focus < select, and the e2e address `/?q=milk` → `/?q=mom` with rows `[Call mom]`. AC-46.4 adds a positive control
  (a plain `/` gives 1 `select` call), so it was red on the red commit too.
- No test was weakened: `git log --first-parent --no-merges d163d9a..HEAD -- '*.test.*' e2e/` and the `--merges --remerge-diff` form are both empty.
- Every changed file is in `plan.md`. `docs/metrics.md` is the paperwork the plan names as exempt.
- The interface matches §46's Function contracts: the signature, props and markup are unchanged, and the call order is `.focus()` then `.select()`, only inside
  the `isSearchShortcut` branch.
- No action, Zod, Prisma, raw SQL, migration, secret or suppression is involved. The features map has F44 ✅ in code-writer's `docs(map)` commit.
- Revert probes, run on a `git clone` under `$TMPDIR`:
  - Deleting `searchBoxRef.current?.select();` makes all 5 component tests fail (`Tests 5 failed | 16 passed (21)`).
  - Moving `select()` before `focus()` makes AC-46.5 fail (`1 failed | 4 passed`).
  - So every changed line is pinned by a test.

### Findings

None blocking.

Verdict: ready for PR

Riskiest unfalsified: the e2e suite runs only chromium. `select()` on an `<input type="search">` after a keydown was not proven
in WebKit or Firefox. The stale `src/components/CLAUDE.md` line on `todo-search-form.tsx` stays out of scope, as the plan says.
