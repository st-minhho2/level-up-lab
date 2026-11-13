# B6.3 review

## Plan review (round 1)

Scope: all (`src/lib`, `src/components`, `e2e/`). Plan read at 5ddc6ee against `spec/contracts/29-due-today.md`
(§31), `advice.md`, `analysis.md`, D-33, `src/components/todo-due-date.tsx`, `e2e/17-overdue.spec.ts`.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: the 2 `src/` files are exactly the 2 §31's Function contracts allow ("No file other than `src/lib/todo-due-today.ts` and `src/components/todo-due-date.tsx` changes in `src/`"); 3 new test files are F29's; `e2e/17-overdue.spec.ts` is F15's, listed and justified by advice P1 (REQ-31.1 adds text the AC-17.7 whole-row check rejects). Cost the lead accepts: an F15 e2e is edited in this card's red commit |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: pure lib module, explicit return type, `readonly` props, no action, no Prisma, no server-only                                                                                                                                                                                                                                                                                                                     |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; deviation stated (no `src/lib/CLAUDE.md` / `src/components/CLAUDE.md` rows, D-33 "package guides stay out of card plans"). Cost: `src/components/CLAUDE.md` keeps "§15 `Due <date>` and §17 `Overdue` are the only idle additions", stale once §31 lands                                                                                                                                              |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 criteria (AC-31.1–31.6), every Then is counts, exact strings or order                                                                                                                                                                                                                                                                                                                                           |
| verification lists exact commands with expected numbers                           | fail: `pnpm test` "241 → 241 + N passed (… N ≥ 5)" is a lower bound, not a number (B5.5, B5.6 plans gave "222 → 227", "237 → 241"); the shape of the new tests, which decides whether `verify-red.sh` passes, is not stated (reason 1)                                                                                                                                                                                  |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B6.3 skeleton` → `test(todos): B6.3 … (red)` → `feat(todos): B6.3 …` → `docs(map): F29 … [B6.3]` → `docs(backlog): B6.3 review …`                                                                                                                                                                                                                                                                  |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `spec/contracts/29-due-today.md:5` "- [ ] Lead approves spec", unticked; not touched by me                                                                                                                                                                                                                                                                                                                        |
| no settled D-n contradicted                                                       | pass: D-33 (section 31, file `29-due-today.md`, F29, component `todo-due-date.tsx`, §17 lift in its own `docs(spec)` commit f63bb76, no package guides); risk tier medium (no `prisma/`, dependency, env, CI, hooks, `.claude/`)                                                                                                                                                                                        |
| `scripts/next-task.sh --check B6.3` says no overlap                               | pass: "[next-task] B6.3: no overlap with any Doing or Review card" (exit 0)                                                                                                                                                                                                                                                                                                                                             |

Checked and not a finding: no existing unit or component test reads whole-row text with a due date that can equal the
run's real day (`todo-item-created.test.tsx` AC-20.3 uses no due date; `todo-due-date.test.tsx` counts
`Due 2026-11-05` by `getAllByText`); `e2e/23-overdue-count.spec.ts` seeds a today row but never reads row text; the
F29 row as ✅ in `docs(map)` follows the B5.x precedent (F24–F26 were added ✅ by their feat PRs), not advice's "✗".

Verdict: changes requested

1. Verification and red shape are not pinned. State the exact `pnpm test` total after the red commit (241 + the
   exact number of new `it`s) and how the new tests are cut, so that every new test fails on the skeleton. Trigger:
   the skeleton exports the real `DUE_TODAY_LABEL = 'Due today'` and leaves the component unchanged, so a standalone
   label test, or AC-31.2 split into one `it` per case with (b), (c), (d) separate (each asserts 0 `Due today`, which
   the current component already satisfies), passes at the red commit; `verify-red.sh` then fails ("zero NEW tests
   passed", `scripts/verify-red.sh:16`). Name the count per file (e.g. unit 1: AC-31.1 six cases + label in one
   `it`, as the card's Test line; component 4: AC-31.2 (a)–(d) in one `it`, AC-31.3, AC-31.4, AC-31.5) and the
   resulting total; same for e2e (52 → 53 is already exact).

Note (not blocking): the card's Test line says red because "`isDueToday` is not exported from
`src/lib/todo-due-today.ts` (file does not exist yet)", an import failure that `testing.md` and `verify-red.sh`
reject; the plan's skeleton step supersedes it (red on `NotImplementedError`). Saying so in the plan avoids a
test-writer following the card line.

## Plan review (round 2)

Scope: all. Plan read at 8464fee; round 1's reason 1 and its note checked against the fix diff `5ddc6ee..8464fee`
(`plan.md` Verification and costs, card B6.3 Test line), `spec/contracts/29-due-today.md` AC-31.1–31.5 Thens,
`scripts/verify-red.sh:6-16`, `src/lib/errors.ts`.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged since round 1 (2 `src/` files, the 2 §31 allows; 3 F29 test files; `e2e/17-overdue.spec.ts` justified, now also named under "Costs the lead takes")                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: unchanged since round 1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; the guide deviation and its cost (`src/components/CLAUDE.md` stale "only idle additions" line) are now stated in the plan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| verification lists exact commands with expected numbers                           | pass: `pnpm test` 241 → 246 (39 → 41 files), 5 new `it`s split 1 + 4. Baseline confirmed: `pnpm vitest run` "Tests 241 passed (241)", "Test Files 39 passed (39)". Each `it` traced red on today's code: AC-31.1 calls `isDueToday`, which throws "isDueToday is not implemented" (`src/lib/errors.ts:4`, matches none of `verify-red.sh`'s import-error patterns); AC-31.2 (a) expects 1 `Due today`, AC-31.3 1 after the unchecked render, AC-31.4 1 after the effects, AC-31.5 1 after the `2026-11-01` re-render, each 0 on the unchanged component. No absence-only or label-only `it`, so zero new tests pass at the red commit |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: unchanged since round 1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `spec/contracts/29-due-today.md:5` "- [ ] Lead approves spec", unticked; not touched by me                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| no settled D-n contradicted                                                       | pass: D-33 as round 1; the card's Test line edit (red reason now `NotImplementedError`) changes no Acceptance, Spec or Tier field                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `scripts/next-task.sh --check B6.3` says no overlap                               | pass: "[next-task] B6.3: no overlap with any Doing or Review card" (exit 0, re-run at 8464fee)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

Verdict: approved (ready for the lead's gate; risk tier medium, no `prisma/`, dependency, env, CI, hooks or `.claude/`
path).

Costs the lead takes, as the plan states them: `e2e/17-overdue.spec.ts` (F15) is extended in this card's red commit;
`src/components/CLAUDE.md` keeps naming §15 and §17 as the only idle additions until a guide card updates it.

Riskiest unfalsified: AC-31.4's single `it` asserts identical server markup under 2026-11-01 and 2030-01-01 plus 0
recoverable errors; both hold on today's code, so its red rests only on the final "1 `Due today` after the effects"
assertion; a test-writer who orders or splits it differently turns it green at the red commit.

## Diff review (round 1)

Scope: all (`src/lib`, `src/components`, `e2e`). Reviewed at aebbe63 against origin/main; red c593dd6 + 2ee958c,
feat 8f98c25, map aebbe63.

### Command results (last line of each, run by the reviewer)

| Command                              | Last line                                                                                           |
| ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `pnpm lint`                          | All matched files use Prettier code style! (exit 0)                                                 |
| `pnpm typecheck`                     | `tsc --noEmit`, no output (exit 0)                                                                  |
| `pnpm test`                          | Tests 246 passed (246), Test Files 41 passed (41): plan's 241 → 246, 39 → 41                        |
| `pnpm test:e2e`                      | 53 passed (2.2m): plan's 52 → 53                                                                    |
| `pnpm test:mutation`                 | Final mutation score of 92.57 is greater than or equal to break threshold 70 (todo-due-today 90.91) |
| `scripts/ci/check-suppressions.sh`   | OK: no new suppressions                                                                             |
| `scripts/ci/check-config-change.sh`  | OK: no protected config changed                                                                     |
| `scripts/ci/check-feat-commits.sh`   | OK: no feat commit touches tests                                                                    |
| `scripts/ci/check-ac-coverage.sh`    | OK: every criterion of a shipped section has a test                                                 |
| `scripts/ci/check-spec-sections.sh`  | OK: sections cited: 1 … 28 31                                                                       |
| `scripts/ci/check-features-map.sh`   | OK                                                                                                  |
| `scripts/ci/check-plan-scope.sh`     | OK: feat/B6.3-agent stays inside the approved plan of B6.3 (D-27 approval)                          |
| `scripts/verify-red.sh B6.3`         | RESULT: red for the right reason (lib 1 new failed; component 4 new failed; 0 new passed), exit 0   |
| `git diff --stat origin/main...HEAD` | 17 files changed, 893 insertions(+), 9 deletions(-)                                                 |

### Checklist

| Check                                                       | Result                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-31.n has a test whose assertion matches its Then   | pass: AC-31.1 six cases in order + label; AC-31.2 (a)–(d) counts, order via `compareDocumentPosition`, no role/aria-label/button, (d) text `''`; AC-31.3 `[0, 1, 0]`; AC-31.4 identical strings, 1 `Due 2026-11-01`, 0 `Due today`, 0 `onRecoverableError`, 1 after effects; AC-31.5 every step incl. `[1, 1, 0]` across midnight; AC-31.6 every Then step incl. reload       |
| no test weakened after the red commit                       | pass: `git log --first-parent --no-merges c593dd6..HEAD -- '*.test.*' e2e/` lists only 2ee958c, a `test(...)` commit before feat that swaps the AC-31.6 "no reload" oracle from `framenavigated` (also fires on same-document `history.replaceState`) to main-frame navigation requests; a reload is still counted, explained in body and plan build note. No merges in range |
| every changed file is in `plan.md`                          | pass: 2 `src/` files, 3 test files, `e2e/17-overdue.spec.ts`, map row; `docs/metrics.md`, card lines, `technical-requirements.md` index row (✗) are paperwork the plan names; spec commits f63bb76, 5d56abc precede the plan                                                                                                                                                  |
| interfaces match §31 Function contracts                     | pass: `DUE_TODAY_LABEL = 'Due today'`, `isDueToday(dueDate: string \| undefined, today: string, completed: boolean): boolean` = `!completed && dueDate !== undefined && dueDate === today`; `TodoDueDate` props unchanged                                                                                                                                                     |
| Zod at every action boundary / Prisma only in lib / raw SQL | n/a: no action, query or Prisma change; `todo-due-today.ts` imports nothing                                                                                                                                                                                                                                                                                                   |
| migration reversible and indexed                            | n/a: none                                                                                                                                                                                                                                                                                                                                                                     |
| no secret, no suppression                                   | pass: check-suppressions OK; diff read                                                                                                                                                                                                                                                                                                                                        |
| features map row moved                                      | pass: F29 §31 ✅ in aebbe63, paths resolve                                                                                                                                                                                                                                                                                                                                    |
| would a test fail if one changed line were reverted?        | pass, probed on a copy under `$TMPDIR`: (1) component passes `false` for `completed` → AC-31.3 fails; (2) marker span moved before `Due <date>` → AC-31.2 fails; (3) marker computed at render from `todayOf(new Date())` without the `today` state → AC-31.4 and AC-31.5 fail; removing the span fails all four (verify-red)                                                 |

### Findings

No blocking finding.

Notes (not blocking): the one surviving mutant in `src/lib/todo-due-today.ts` is `dueDate !== undefined` → `true`
(line 7), equivalent because `undefined === today` is false for any string `today`. The `docs/metrics.md` row sits
between B1.76 and B1.78 and holds `feat B6.3` in place of a merge sha, to fill at close. The overall score 92.57 vs
the 93.40 earlier rows quote is not from this diff (one new survivor out of 11 cannot move it 0.8 points; the
drop must lie in files this card does not touch, [unverified]: origin/main's score was not re-run).

Verdict: ready for PR

Riskiest unfalsified: AC-31.6's new oracle counts only main-frame `isNavigationRequest()` requests; a toggle that
re-renders the whole RSC tree through a soft navigation (no document load) would pass it, which is what §31's
"no page reload" allows, but no test pins that the row keeps its client state across the toggle.

## Diff review (round 2)

Scope: merge 3e7d355 (origin/main 3239f19 into 73316bc) only. Run by the reviewer at 3e7d355, 2026-11-13.

### Command results

| Command                                                                                     | Last line                                                                                    |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                                                 | `All matched files use Prettier code style!`                                                 |
| `pnpm typecheck`                                                                            | `tsc --noEmit`, exit 0                                                                       |
| `pnpm test`                                                                                 | `Tests  265 passed (265)`                                                                    |
| `pnpm test:e2e`                                                                             | `54 passed (2.6m)` (the logged `e2e: insert rejected` is a fault-injection test, not a fail) |
| `pnpm test:mutation`                                                                        | `Final mutation score of 92.57 is greater than or equal to break threshold 70`               |
| `scripts/ci/check-suppressions.sh`                                                          | `OK: no new suppressions`                                                                    |
| `scripts/ci/check-config-change.sh`                                                         | `OK: no protected config changed`                                                            |
| `scripts/ci/check-feat-commits.sh`                                                          | `OK: no feat commit touches tests`                                                           |
| `scripts/ci/check-ac-coverage.sh`                                                           | `OK: every criterion of a shipped section has a test`                                        |
| `scripts/ci/check-spec-sections.sh`                                                         | `OK: sections cited: 1 … 29 31`                                                              |
| `scripts/ci/check-features-map.sh`                                                          | `OK`                                                                                         |
| `scripts/verify-red.sh B6.3`                                                                | `RESULT: red for the right reason`                                                           |
| `git diff --stat origin/main...HEAD`                                                        | `17 files changed, 947 insertions(+), 9 deletions(-)` (local `main` 278ee80 is stale)        |
| `git log --first-parent --merges --remerge-diff --format= 73316bc..HEAD -- '*.test.*' e2e/` | empty (0 lines)                                                                              |

### Checklist

| Check                                                   | pass / fail: reason                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| conflict resolution in `spec/technical-requirements.md` | pass: `--remerge-diff` shows the only conflict; both rows kept, §29 (✅, from main) then §31 (✗, this card), in section order; no other line touched. ✗ for §31 is right: the index flips in the closing lane (`backlog/CLAUDE.md` line 61), as §29 did in d9b93f2                                    |
| card's own diff unchanged by the merge                  | pass: `git diff origin/main HEAD -- src e2e spec/contracts` is byte-identical (`cmp`) to `git diff 278ee80 73316bc` for the same paths, so pass 1's line-level review and probes still hold                                                                                                           |
| B6.1 todo-form changes vs this card's files             | pass: B6.1 touches `todo-form.tsx` (onKeyDown, `isSearchEscape`), its test, `e2e/29-escape-new-todo.spec.ts`; none imports `todo-due-date`/`todo-due-today`, and `e2e/31-due-today.spec.ts` drives only row-level controls (Edit due date, checkbox); disjoint files, both e2e files green in one run |
| no test weakened after the red commit                   | pass: no non-merge test commit after 2ee958c; merge remerge-diff on tests empty                                                                                                                                                                                                                       |
| features map                                            | pass: F29 §31 and F27 §29 rows both present, check-features-map OK                                                                                                                                                                                                                                    |

### Findings

No blocking finding.

Verdict: ready for PR

Riskiest unfalsified: unchanged from round 1 (AC-31.6's main-frame navigation oracle does not pin row client state
across a toggle); the merge adds no new risk to this card's files.
