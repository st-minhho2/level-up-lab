# B9.2 review

## Plan review (round 1)

Scope: ui (`src/components/todo-due-date.tsx`, a component test, one e2e file). Plan at `8b075a9`.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: `todo-due-date.tsx` is the file §45's function contract names ("The only file of `src/` this section changes"); the unit test is the card's `Test:` file; `e2e/45-due-date-focus.spec.ts` follows the section-number naming of `e2e/` (§37 → `37-due-date-today`, §40 → `40-due-date-clear`, §43 → `43-complete-all-hidden`); F43 is D-40's id for §45 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signature and props unchanged, no export, action, schema, Prisma or env change; a `useRef<HTMLInputElement>` + `useEffect` in a client component that already holds state and events                                                                                                                                                                   |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A. One deviation, stated: the e2e file is `45-…` (section number) where advice wrote `43-…` (contract file number); the plan's name is the right one per `e2e/`                                                                                                                                                                               |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: AC-45.1 to AC-45.7, each Then names `document.activeElement`, values, call or request counts                                                                                                                                                                                                                                                           |
| verification lists exact commands with expected numbers                           | pass: baselines re-run by me, `pnpm test` "Tests 338 passed (338)", 53 files; `playwright test --list` "Total: 82 tests in 36 files". Expected 344 / 54 and 83 / 37; mutation "CI only" (no `src/lib` or `src/actions` change)                                                                                                                               |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton skipped with reason (no new export); `test(todos): B9.2 … (red)`, `feat(todos): B9.2 …`, `docs(map): F43 … [B9.2]`, `docs(backlog): B9.2 review …`                                                                                                                                                                                            |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `spec/contracts/43-due-date-focus.md:5` `- [ ] Lead approves spec`, unticked; not ticked by me                                                                                                                                                                                                                                                         |
| no settled D-n contradicted                                                       | pass: D-40 (one file, §40 clause already on main at `38-due-date-clear.md:64`, sibling "unchanged" notes excluded by §45 itself), D-7 (box left to the lead or the gate's `approve`), D-28 (`scripts/agent/tier.sh` → `medium`)                                                                                                                              |
| `scripts/next-task.sh --check B9.2` says no overlap                               | pass: "[next-task] B9.2: no overlap with any Doing or Review card" (exit 0); `scripts/ci/check-plan-scope.sh`: "OK: feat/B9.2-agent changes only paperwork"                                                                                                                                                                                                  |

Probe: none (plan mode). Also checked: no sibling test or e2e sends a key to the active element after "Edit due date"
(`todo-due-date.test.tsx:240` clicks the field first; `e2e/28…:73` and `e2e/37…:104` press on a located element),
so moving focus into the field breaks no existing test.

Notes for the lead (not blocking):

1. The stated StrictMode cost is overstated: React's StrictMode replays effects on mount only, when `editing` is
   `false`, so the guarded effect calls `focus()` once per switch in `next dev` too. No behavior to accept there.
2. `pnpm test` 338 → 344 assumes one `it` per criterion; AC-45.3 and AC-45.4 each have (a) and (b). If the
   test-writer splits them, the expected total is 345 to 346; the diff review accepts that count when every title
   starts with its `AC-45.n`.
3. AC-45.4 expects "Update due date" to keep focus after a pending save disables it. That holds in jsdom (no focus
   fixup) and AC-45.4 is unit-only; in a browser a disabled focused button loses focus. No e2e asserts it, so no
   conflict for this card.

Verdict: approved (ready for the lead's gate, not approved for build)

## Diff review (round 1)

Scope: ui. Range `main...HEAD` at `ce17db4` (pin `0a93ba1`, red `f42f37d`, feat `385e10e`, map `ce17db4`).

### Command results (last line of each, run by me)

| Command                             | Last line                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | All matched files use Prettier code style!                                                         |
| `pnpm typecheck`                    | `tsc --noEmit` exit 0                                                                              |
| `pnpm test`                         | Tests 346 passed (346), Test Files 54 passed (54)                                                  |
| `pnpm test:e2e`                     | 83 passed (2.9m), incl. `e2e/45-due-date-focus.spec.ts:58` AC-45.7                                 |
| `scripts/mutation-gate.sh`          | mutation: CI only, no src/lib or src/actions change                                                |
| `scripts/ci/check-suppressions.sh`  | [check-suppressions] OK: no new suppressions                                                       |
| `scripts/ci/check-config-change.sh` | [check-config-change] OK: no protected config changed                                              |
| `scripts/ci/check-feat-commits.sh`  | [check-feat-commits] OK: no feat commit touches tests                                              |
| `scripts/ci/check-ac-coverage.sh`   | [check-ac-coverage] OK: every criterion of a shipped section has a test                            |
| `scripts/ci/check-spec-sections.sh` | [check-spec-sections] OK: sections cited: 1 … 46                                                   |
| `scripts/ci/check-features-map.sh`  | [check-features-map] OK                                                                            |
| `scripts/ci/check-plan-scope.sh`    | OK: feat/B9.2-agent stays inside the approved plan of B9.2 (D-27 approval)                         |
| `scripts/verify-red.sh B9.2`        | RESULT: red for the right reason (8 ran, 6 new, 6 new failed; e2e skipped, needs a server); exit 0 |
| `git diff --stat main...HEAD`       | 9 files changed, 614 insertions(+), 1 deletion(-)                                                  |

Counts against the plan: unit 338 → 346 (plan 344; round 1 note 2 accepted 345–346 for the (a)/(b) splits: AC-45.3
and AC-45.4 are two `it`s each), files 53 → 54; e2e 82 → 83, 36 → 37 files.

### Checklist

| Check                                                                | Result                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-45.n has a test matching its Then                           | pass: AC-45.1, 45.2, 45.3 (a)(b), 45.4 (a)(b), 45.5, 45.6 in `todo-due-date-focus.test.tsx`; AC-45.7 in `e2e/45-due-date-focus.spec.ts`; each assertion read against its Then (activeElement, value, call counts, attributes, 5 children, POST count, reload order) |
| no test weakened after the red commit                                | pass: `git log --first-parent --no-merges f42f37d..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` empty. The pin `0a93ba1` precedes red, is green by design (plan: "AC-45.4 may pass red") and was not edited after                                      |
| every changed file is in `plan.md`                                   | pass: the four Files rows plus the plan's exempt paperwork (`docs/metrics.md`, `backlog/work/B9.2/*`); `check-plan-scope.sh` OK                                                                                                                                     |
| interfaces match §45 Function contracts                              | pass: `TodoDueDate` signature and props unchanged; no new export; effect on `[editing]` only, no `select()`                                                                                                                                                         |
| Zod at action boundary · Prisma only in lib · no raw SQL · migration | n/a: no action, lib, Prisma or migration change                                                                                                                                                                                                                     |
| no secret, no suppression                                            | pass (`check-suppressions.sh`; diff read)                                                                                                                                                                                                                           |
| features map row moved                                               | pass: F43 §45 ✅ in `ce17db4`                                                                                                                                                                                                                                       |
| revert probes (copy at `$TMPDIR/probe`)                              | (1) effect without deps → 3 fail (AC-45.5, AC-45.4 (a)(b)); (2) deps `[editing, dueDate]` → 1 fails (AC-45.5); (3) removing the focus line is the red commit (6 fail, verify-red). Every changed line is held by a test                                             |

### Findings

None blocking.

Probe outside the revert set: adding `fieldRef.current?.select()` after `focus()` leaves all 61 due-date unit tests
green. REQ-45.5 forbids the selection, but no AC-45.n Then measures selection (AC-45.5 counts `focus()` calls and
attributes), so the tests match the criteria as written; this is a spec-coverage gap, not a defect in this diff.

Verdict: ready for PR

Riskiest unfalsified: REQ-45.5 "the field's text is not selected" has no criterion that measures it; a later
`select()` on the date field would pass every gate.
