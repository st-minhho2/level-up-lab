# B6.4 review

## Plan review (round 1)

Reviewed: `backlog/work/B6.4/plan.md` at `0efbf65`, against §32 (`spec/contracts/30-clear-completed-count.md`),
`advice.md`, `analysis.md`, D-7, D-27, D-28, D-33.

| Check                                                                             | Result                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: all 7 rows are §32 / F30 (three src paths named by §32's Function contracts, their three tests, the F30 map row); `src/lib/todos.ts`, `filter-counts.ts`, `src/actions/*` untouched as §32 requires                                   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signatures copied verbatim from §32 (explicit return types, `readonly` props, optional `completedCount?: number`); no action, schema, Prisma or query; the lib file is pure (no `server-only`), so the client import is legal         |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: Approach A; the deviation (advice's two package `CLAUDE.md` lines dropped) is stated: "package guides stay out (D-33)"                                                                                                                |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 criteria, every Then is an exact name, role count, enabled/disabled state or navigation count                                                                                                                                       |
| verification lists exact commands with expected numbers                           | pass: baseline confirmed by me, `pnpm test` → 269 passed (43 files); e2e `test(` count 57 in 25 files; 269 → 270 → 273, e2e 57 → 60, mutation ≥ 70                                                                                          |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B6.4 skeleton` → `test(todos): B6.4 pin …` → `test(todos): B6.4 … (red)` → `feat(todos): B6.4 …` → `docs(map): F30 … [B6.4]` → `docs(backlog): B6.4 review …` (same shape as B6.2's approved plan)                     |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: `30-clear-completed-count.md:5` `- [ ] Lead approves spec`, unticked; not ticked by me                                                                                                                                                |
| no settled D-n contradicted                                                       | pass: D-33 (section 32, contract file, component, count passed from `page.tsx`, the one `page.tsx` card of batch 2, F30, label count is not §9's deleted-count message); D-28 tier medium (no `prisma/`, dependency, env or protected path) |
| `scripts/next-task.sh --check B6.4` says no overlap                               | pass: `[next-task] B6.4: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                 |

Costs the lead should know before approving (none blocks):

1. Existing e2e lookups of the button (`e2e/09:27`, `12:35`, `13:141`, `16:138`, `22:120`, `26:100`, `30:112`) rely on
   Playwright's default substring name match; any later `exact: true` on them breaks once a count shows. No unit or
   e2e test asserts the exact text "Clear completed" with completed todos present (grep).
2. The component module header (`clear-completed-button.tsx:3`, "§9 …; §10 …") should also name §32 per
   `spec-fidelity.md`; the plan says so only for `page.tsx`. Check at diff time.
3. 270 → 273 assumes AC-32.1 is one `it` asserting 0, 1 and 12; an `it.each` gives 275. Either is fine; the diff
   review checks the count against the shape actually written.

Verdict: approved

(Approved means ready for the lead's gate under D-27/D-28: tier medium, so it proceeds on this approval for the
`agent-ready` issue; not approval for build in an interactive session.)

## Diff review (round 1)

SCOPE: all (`src/lib`, `src/components`, `src/app`, `e2e`). Range `origin/main..HEAD` at `a881ff6`, against §32,
`plan.md` (reviewer-approved, D-27, tier medium, issue #275).

### Command results (last line, run by me)

| Command                             | Last line                                                                                                       |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!` (exit 0)                                                           |
| `pnpm typecheck`                    | `tsc --noEmit` (exit 0, no output)                                                                              |
| `pnpm test`                         | `Tests  273 passed (273)` (45 files; plan: 270 → 273)                                                           |
| `pnpm test:e2e`                     | `60 passed (1.4m)` (plan: 57 → 60)                                                                              |
| `pnpm test:mutation`                | `Final mutation score of 92.74 is greater than or equal to break threshold 70`; `clear-completed-label.ts` 100  |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                       |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                               |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                              |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test`                                                           |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 32`                                                                                    |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                            |
| `scripts/verify-red.sh B6.4`        | `RESULT: red for the right reason` (label 1 new failed; component 2 new failed, 0 new passed)                   |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B6.4-agent stays inside the approved plan of B6.4 (D-27 approval)`                                    |
| `scripts/next-task.sh --check B6.4` | `[next-task] B6.4: no overlap with any Doing or Review card`                                                    |
| `git diff --stat main...HEAD`       | `16 files changed, 725 insertions(+), 69 deletions(-)` (spec index / map deltas are 1 row each plus re-padding) |
| `pnpm build`                        | [unverified]: not run (writes `.next` in the worktree)                                                          |

### Checklist

| Check                                                          | Result                                                                                                                                                                                                      |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-32.n has a test whose assertion matches its Then      | pass: 32.1 lib (0, 1, 12 exact strings); 32.2–32.4 component (exact names, role counts, 0 args, same element, no "deleted"); 32.5–32.7 e2e with `exact: true`, four addresses, navigation counter           |
| no test weakened after the red commit                          | pass: `git log --first-parent --no-merges 2ed6373..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` empty                                                                                          |
| every changed file is in `plan.md`                             | pass: 7 plan files; the rest is paperwork the plan names (`docs/metrics.md`, index row) or backlog artifacts; `check-plan-scope.sh` OK                                                                      |
| interfaces match §32's contracts                               | pass: `clearCompletedLabel(completed: number): string`; `ClearCompletedButton({ disabled, completedCount? })` verbatim; `page.tsx` passes `filterCounts(todos).completed` from unfiltered `todos` (line 51) |
| Zod at every action boundary / Prisma only in lib / no raw SQL | n/a: no action, schema, Prisma or query changed; `clear-completed-label.ts` imports nothing                                                                                                                 |
| migration reversible and indexed                               | n/a: no migration                                                                                                                                                                                           |
| no secret, no suppression                                      | pass: `check-suppressions.sh` OK; no key or env read in the diff                                                                                                                                            |
| features map row moved                                         | pass: F30 row added in `a881ff6` (`docs(map)`), ✅ as precedent rows; §32 index row stays ✗ as the plan says                                                                                                |
| plan-review costs                                              | (2) header now names §32 (`clear-completed-button.tsx:3`); (3) AC-32.1 is one `it`, so 273 matches                                                                                                          |
| revert probe                                                   | confirmed on a clone in `$TMPDIR`: `clearCompletedLabel(completedCount ?? 0)` → `clearCompletedLabel(0)` fails AC-32.2 and AC-32.4 (2 failed, 6 passed); `>= 1` mutants killed (label 100 %)                |

### Findings

None blocking.

Verdict: ready for PR

Riskiest unfalsified: `src/app/page.tsx:51` (`completedCount={filterCounts(todos).completed}`) is covered only by e2e
AC-32.5/32.6; I traced, not ran, its revert (dropping the prop gives "Clear completed", `filterCounts(shown)` gives
"Clear completed" on `/?filter=active` and `/?q=zzz`, both fail the exact-name `toHaveCount(1)`), because the probe
clone has no environment file for Playwright.
