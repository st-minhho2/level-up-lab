# B7.1 review

## Plan review (round 1)

Scope: ui (`src/components`, `e2e`). Plan `backlog/work/B7.1/plan.md` at `7576d48`, section §35
`spec/contracts/33-delete-confirm.md`, §19 `spec/contracts/17-delete.md` (edited under D-37 in `c155c3a`, an ancestor of HEAD).

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `delete-todo-button.tsx` is the only `src/` file, in F17 today and named by §35's contract; the three test files are the ones §35 says get rewritten; F33 = §35 matches D-37 ("feature ids F33–F38") and the card heading (`_F33 · section 35_`). `scripts/ci/plan-files.sh --any B7.1` parses exactly the 5 rows |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signature copied verbatim from §35 Function contracts; module-level unexported constant; no action, schema, Prisma or route touched; the mutation still goes through `deleteTodoAction`                                                                                                                           |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A. Plan keeps AC-19.5 (b) and AC-19.7 as rewrites beside new AC-35.3 / AC-35.4 where advice's Impact row said "becomes"; that matches §19, which still carries AC-19.5–19.7 (lines 44–46), so it is not a deviation from the spec                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 5 criteria (AC-35.1–35.5), each Then gives counts, exact message or call order; no banned adjective in plan or section                                                                                                                                                                                            |
| verification lists exact commands with expected numbers                           | pass: baseline 280 / 45 files (I ran `pnpm test`: `Tests  280 passed (280)`, `Test Files  45 passed (45)`); green 283 (+3 unit `it`s), e2e +2; verify-red exit 0; mutation ≥ 70 with `src/lib`, `src/actions` untouched                                                                                                 |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton skipped with reason (no new export; precedent B5.6), `test(todos): B7.1 … (red)`, `feat(todos): B7.1 …`, `docs(map): F33 … [B7.1]`, reviewer diff                                                                                                                                                        |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: `33-delete-confirm.md:5` `- [ ] Lead approves spec` exists and is unticked; plan leaves it for the lead and cites D-27 (label = spec approval), same as §21–§34 (all unticked)                                                                                                                                    |
| no settled D-n contradicted                                                       | pass: D-37 (B7.1 edits §19, `window.confirm`, no markup), D-27/D-28 (`scripts/agent/tier.sh` → `medium`), D-7, D-19 (no protected path)                                                                                                                                                                                 |
| `scripts/next-task.sh --check B7.1` says no overlap                               | pass: `[next-task] B7.1: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                             |

Also run: `scripts/ci/check-plan-scope.sh` → `OK: feat/B7.1-agent changes only paperwork`.

Costs the lead takes (already in the plan, confirmed): `window.confirm` blocks the main thread while open (§35 accepts it);
every future jsdom test that clicks "Delete todo" must stub `window.confirm` or it reads as a cancel; e2e must register
`page.once('dialog', …)` before each click or Playwright dismisses (a cancel). No behavior is dropped.

Non-blocking notes for the build roles (no plan change needed):

1. `src/components/todo-item.test.tsx` has only `beforeEach(vi.resetAllMocks)` (line 37) and no `afterEach`; §35's prose
   names `vi.restoreAllMocks()` in `afterEach` as what removes the confirm stub. test-writer adds it in that planned file.
2. Keep the AC-19.5 (b) title in `todo-item.test.tsx` unchanged: verify-red treats a changed title as a new test, and that
   test stays green on today's code (no confirm assertion in its Then), so a renamed (b) would fail the red gate. AC-19.5 (a)
   must lose "without a confirmation" from its title; it then counts as new and is red (confirm spy 0 calls), which is fine.
3. The card's `Test:` line fixes the AC-35.1 title (`AC-35.1: asks window.confirm once with "Delete this todo? This cannot be
undone." before calling deleteTodoAction once with ("todo-9")`); test-writer uses it verbatim, as with AC-35.3 / AC-35.4.
4. The plan's parenthetical that AC-35.1/35.2 kill the component's mutants is reasoning, not a gate number: `stryker`
   mutates only `src/lib/**` and `src/actions/**`. The diff review will probe it by reverting the guard on a copy.

Verdict: approved

(Approved means ready for the lead's gate under D-27/D-28, tier medium; not approval for build by me.)

## Diff review (round 1)

Scope: ui. HEAD `4ff14e9`, red `666e313`, feat `13f1eef`, map `4ff14e9`.

### Command results (last line of each, run by me)

| Command                             | Last line                                                                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!` (exit 0)                                                                        |
| `pnpm typecheck`                    | `tsc --noEmit` (exit 0, no errors)                                                                                           |
| `pnpm test`                         | `Tests  283 passed (283)` (45 files; plan: 280 → 283)                                                                        |
| `pnpm test:e2e`                     | `66 passed (2.1m)`                                                                                                           |
| `pnpm test:mutation`                | `Final mutation score of 92.87 is greater than or equal to break threshold 70` (first run hit the 600 s limit; rerun 43 min) |
| `scripts/ci/check-suppressions.sh`  | `[check-suppressions] OK: no new suppressions`                                                                               |
| `scripts/ci/check-config-change.sh` | `[check-config-change] OK: no protected config changed`                                                                      |
| `scripts/ci/check-feat-commits.sh`  | `[check-feat-commits] OK: no feat commit touches tests`                                                                      |
| `scripts/ci/check-ac-coverage.sh`   | `[check-ac-coverage] OK: every criterion of a shipped section has a test`                                                    |
| `scripts/ci/check-spec-sections.sh` | `[check-spec-sections] OK: sections cited: 1 … 37`                                                                           |
| `scripts/ci/check-features-map.sh`  | `[check-features-map] OK`                                                                                                    |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B7.1-agent stays inside the approved plan of B7.1 (D-27 approval)`                                                 |
| `scripts/verify-red.sh B7.1`        | `RESULT: red for the right reason` (delete-todo-button 3 new failed, todo-item 1 new failed; e2e skipped)                    |
| `git diff --stat main...HEAD`       | `10 files changed, 521 insertions(+), 7 deletions(-)`                                                                        |

### Checklist

| Check                                                     | Result                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-35.n has a test whose assertion matches its Then | pass: 35.1 (times, exact message, `invocationCallOrder`), 35.2 (a)+(b), 35.3 (0/0/1 confirm calls, 1 button view and edit, row text, 0 dialog), 35.4 (type, message, [C, A], empty, reloads), 35.5 (1 dialog, [C, B, A], checked states, 0 alerts)                                                                                                                                     |
| no test weakened after the red commit                     | pass: `git log --first-parent --no-merges 666e313..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` empty (no merges). AC-19.5 (a) drops `confirm` 0 calls for 1 call, as edited §19 (D-37) requires                                                                                                                                                                          |
| every changed file is in `plan.md`                        | pass: 5 planned files + paperwork (`docs/metrics.md`, `backlog/work/B7.1/*`); `check-plan-scope.sh` OK                                                                                                                                                                                                                                                                                 |
| interfaces match the section's contracts                  | pass: signature unchanged; `CONFIRM_MESSAGE` module-level, unexported; guard `if (!window.confirm(CONFIRM_MESSAGE)) return;` before `startTransition`, verbatim §35                                                                                                                                                                                                                    |
| Zod at every action boundary / Prisma only in lib / SQL   | n/a: no action, lib or Prisma change                                                                                                                                                                                                                                                                                                                                                   |
| migration reversible and indexed                          | n/a: no migration                                                                                                                                                                                                                                                                                                                                                                      |
| no secret, no suppression                                 | pass: `check-suppressions` OK; diff read, no key or env read                                                                                                                                                                                                                                                                                                                           |
| features map row moved                                    | pass: F33 §35 ✅ in `docs(map)` commit `4ff14e9`                                                                                                                                                                                                                                                                                                                                       |
| would a test fail if one changed line were reverted       | pass, probed on a clone at `$TMPDIR/c`: guard removed → 4 fail (AC-19.5 a, 35.1, 35.2, 35.3); guard inverted → 5 fail; message's final `.` dropped → AC-35.1 fails. e2e not probed (needs the compose server); the red state is the guard-removed state and the red commit body records AC-35.4/35.5 failing on 0 dialogs, consistent with `expect.poll(() => dialogs.length).toBe(1)` |

### Findings

```
[1] KIND: plan-mismatch
    WHERE: src/components/delete-todo-button.test.tsx:112
    DEFECT: the AC-35.1 test title is not the one the card's `Test:` contract line names, so the card's
            `file::title` pointer resolves to no test.
    TRIGGER: grep the title from backlog/plan/E7-todos-hints.md:39, `AC-35.1: asks window.confirm once with
             "Delete this todo? This cannot be undone." before calling deleteTodoAction once with ("todo-9")`,
             in src/ → 0 matches; the test is titled `AC-35.1: calls window.confirm once with exactly "…", then
             deleteTodoAction once with exactly ("todo-9"), the confirm call first`.
    WRONG BEHAVIOUR: the card's test contract line (backlog/CLAUDE.md card layout) and plan review round 1 note 3
                     ("test-writer uses it verbatim") name a test that does not exist; the closing PR's
                     "tests that went green" cannot cite the card's own pointer. Assertions are correct; only
                     the title diverges.
    CONFIDENCE: confirmed (grep run)
```

Remedy is dev-lead's to pick: a `test(todos): B7.1 review pass 1 -- AC-35.1 title from the card` commit (title only,
no assertion change), or a recorded reason the card line is superseded.

Not a finding (equivalent mutant, recorded): moving the guard inside the `startTransition` callback keeps all 21
component tests green on the clone. In a browser the async callback runs synchronously up to its first `await` and
`window.confirm` blocks the main thread, so no render shows the button disabled while the dialog is open; the
difference from REQ-35.3's placement is not observable by any test the spec defines.

Verdict: back to test-writer

Riskiest unfalsified: e2e AC-35.4/35.5 against a reverted guard were not re-run by me (traced only, server needed);
and the guard-inside-transition variant survives every test (equivalent in the browser as traced above).
