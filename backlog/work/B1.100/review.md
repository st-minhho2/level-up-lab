# B1.100 review

SCOPE: tooling (no §; `scripts/`, `.claude/agents/`, `.claude/skills/`)

## Plan review (round 1)

Plan at 50e0591 (`docs(backlog): B1.100 plan`). Card `backlog/plan/E1-todos.md` "### B1.100". I read
`stryker.config.mjs`, `vitest.stryker.config.mts`, the four prompt lines the plan edits, `scripts/agent/run.sh:39-44`
and D-13. I also read the prototype (`mutation-gate.sh`, `mutation-gate-smoke.sh`, `skeleton/`) and ran it on copies
under `$TMPDIR`.

Probes (copies and clones under `$TMPDIR`; the worktree was only read, plus `hook-smoke.sh` and `pnpm test`):

- Prototype smoke under `/bin/bash` 3.2: green `[mutation-gate-smoke] 12 ok, 0 FAIL`. Skeleton
  `[mutation-gate-smoke] 1 ok, 11 FAIL` (only MG11 ok). Both match the plan's Verification.
- Baselines at 50e0591 (tree = 4c7d9e4 + plan): `hook-smoke: 749 probes OK` and `Tests  298 passed (298)`. Both
  match the plan.
- Real Stryker 10.1.1 on a clone of this worktree (`node_modules` linked) with one new type-only file
  `src/lib/zz-types.ts` (`export type Zz …; export interface Yy …`). `pnpm exec stryker run --mutate
src/lib/zz-types.ts` → `ERROR Stryker No tests were executed. Stryker will exit prematurely`, exit 1. The prototype
  gate `--base HEAD` → `mutation: ? % on src/lib/zz-types.ts (ran), src 03eeade`, exit 1. The second call →
  `(reused)`, and the stamp holds exit 1 (reason 1).
- The prototype on a throwaway repo with the plan's `pnpm` shim, where the card changes only `src/lib/CLAUDE.md`:
  `mutation: 85.00 % on src/lib + src/actions (ran)`, with the shim called as `exec stryker run`, which is the whole
  layer (reason 2).
- Per-file scores from the plan's own whole-layer run (`proto/full.log`, 92.84 % overall): lowest `todos.ts` 75.00,
  `env.ts` 81.82, `search-shortcut.ts` 82.98, `action-result.ts` 87.50. Small files: `health.ts` 1 mutant,
  `errors.ts` 2, `title-count.ts` 2. These numbers back the cost lines below.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: no section (tooling). `scripts/ci/plan-files.sh --file` lists the 8 Files rows. All of them are in the card's Spec line (`code-writer.md`, `tdd-loop/SKILL.md`, `reviewer.md`, "possibly a `scripts/` helper"), plus `review-loop/SKILL.md:45` and `work-next/SKILL.md:37`. Both of those carry the mutation step or the evidence line, so Acceptance 1 and 3 need them |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no `src/`, `prisma/` or `e2e/` change. The script's interface (`[--base <ref>] [--force]`, exit 0/1/2, one stamp file) is pasted                                                                                                                                                                                                                                  |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass, with a note: there is no `advice.md` (tier quick, no section, so the advisor step may be skipped). Unlike the B1.95 and B1.99 plans, the plan does not say "No advice (tier quick)"                                                                                                                                                                                     |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 5 acceptance bullets. Each is checkable: a run/skip rule, a stated bar, a PR line, a measured batch, a label                                                                                                                                                                                                                                                            |
| verification lists exact commands with expected numbers                           | pass, with a gap (reason 1): 12 ok / 1 ok + 11 FAIL / 749 / 298 are exact, and I reproduced all four. The smoke's `pnpm` shim always prints a score line, so no MG probe covers a Stryker run that ends without one                                                                                                                                                           |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: a tooling card has no map. Skeleton `chore(scripts)`, red `test(scripts) … (red)`, green `chore(scripts)`, review `docs(backlog)` follow the B1.95/B1.98/B1.99 precedent                                                                                                                                                                                                |
| the section has a `Lead approves spec` box, ticked only by a human                | n/a: no section. `Plan approved by:` is empty and stays empty here. `scripts/agent/tier.sh backlog/work/B1.100/plan.md` → `high` (`.claude/`), so the lead's `approve` is required. The D-19 label is planned                                                                                                                                                                 |
| no settled D-n contradicted                                                       | pass, with a note (reason 3): the plan says the gate "becomes the only local way to run mutation". D-13 asks a hardening card for the mutation report before and after. The gate cannot produce the before report: an unchanged tree prints the CI-only line                                                                                                                  |
| `scripts/next-task.sh --check B1.100` says no overlap                             | pass: `[next-task] B1.100: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                                                                                 |

Verdict: changes requested

1. **A subset that no node test reaches fails the gate, and nothing clears it. Today's whole-layer run passes on the
   same tree.** The rule `mutate = each changed *.ts` has an exit contract, "1 below the bar (or no score line)".
   Stryker's vitest runner runs only the tests related to the `--mutate` files. When that set is empty, Stryker 10.1.1
   throws `No tests were executed` and exits 1 before it scores anything (measured above). One trigger is a card whose
   only `src/lib`/`src/actions` change is a type-only module (a new `src/lib/<x>-types.ts` of interfaces, the shape
   `ts-style.md` asks for). Another is a module that only `.tsx` or e2e tests import. The gate records
   `mutation: ? % … (ran)` with exit 1. Every later call reuses that exit 1. `--force` reruns and fails the same way.
   No test the test-writer could add would kill a mutant that does not exist. The green gate is red with no way out,
   and in a runner that is a stop. Fix: state the rule for a Stryker run that ends without a score line on a subset.
   For example, fall back to the whole layer once, or print a distinct line like
   `mutation: CI only, no mutant in <files>`. Add an MG probe whose shim exits 1 without a score line, and give its
   expected line and exit code.
2. **A change to `src/lib/CLAUDE.md` or `src/actions/CLAUDE.md` alone runs the whole layer.** That is the costliest
   branch, 668 mutants (222 s alone, about 2 h under batch 1's load per the card), for a change with no mutant at all.
   The rule "empty after that → the whole layer" is right for the two cases MG8 names (only `prisma.ts`, or only a
   deleted file). But the prototype's `*) continue` also empties the list when every changed path is non-`.ts`
   (measured above: shim called as `exec stryker run`). Those two guides have been edited in 13 commits so far
   (`git log -- src/lib/CLAUDE.md src/actions/CLAUDE.md`). Fix: say which changed paths count. For example, only
   `*.ts` paths trigger a run, so a docs-only change prints the CI-only line. If the whole-layer run is kept on
   purpose, state it as a cost. Either way, add the case to MG1–MG12.
3. **Minor (wording, D-13):** "becomes the only local way to run mutation" leaves no way to make a D-13 hardening
   card's before report. On the base tree the gate prints the CI-only line. Name the exception, for example "a D-13
   card still runs `pnpm test:mutation` (or `pnpm exec stryker run --mutate <file>`) by hand for its before report",
   or drop "only".

Not blocking. These are costs the lead should see before `approve`:

- **The local bar becomes stricter than CI's.** On the subset, `todos.ts` starts at 75.00 %, 5 points above the bar.
  Today it has 22.84 points of headroom inside the 92.84 % layer. A 1–2 mutant file (`health.ts`, `errors.ts`,
  `title-count.ts`) fails on its first survivor (0–50 %). In both cases the card is red locally and green in CI, and
  each case costs a test-writer hardening round (`code-writer.md:36-37`). The plan says "held to 70 % on its own code"
  but does not give these numbers.
- **The reviewer stops running mutation itself on an unchanged tree.** It repeats a line from
  `reports/mutation-gate.txt`, a git-ignored file written by the code-writer's run. The card asks for this
  (Acceptance 1). The independent mutation check before merge is now CI's `mutation` job alone.
- **The reuse key leaves out `tsconfig.json` (the checker's `tsconfigFile`), `package.json` and `pnpm-lock.yaml`.**
  A change to any of them after a run reuses the old score. All three are protected config, so a card rarely
  changes them.
- **`scripts/CLAUDE.md` gets no rows for the two new scripts.** The plan calls B1.98 "Doing". The board says Open,
  which is why `--check` finds no overlap. In substance the deferral holds: `origin/chore/B1.98-unattended-honest`
  carries B1.98's approved plan and edits `scripts/CLAUDE.md`. Correct the word, or say "branch in flight".
- `dev-lead.md:55`'s plan template still says "mutation ≥ 70". The plan leaves `dev-lead.md` to B1.101, which has no
  plan yet (its branch has no commit of its own), so the template and the new CI-only line disagree until someone
  edits it.
- Checked, no finding: `scripts/agent/run.sh:39` names scripts in `ALLOW`, but the list also holds a bare `Bash`.
  So `scripts/mutation-gate.sh` runs under the host's `dontAsk` without a new entry, and the container runs
  `bypassPermissions`. `guard-bash.sh` has no per-script allow list.

Riskiest unfalsified: that in a real run, code-writer's pre-commit run and the green gate see the same `src/` tree,
so the gate's line says "(reused)". The PostToolUse format hook, an `eslint --fix`, or an untracked scratch file
under `src/` would each change the key. I could not run an agent here. The batch-2 saving rests on this, and the
plan's 30–45 min per run at load is `[unverified]`.

## Plan review (round 2)

Plan at c008cf1 (`docs(backlog): B1.100 plan round 2`), diffed against 50e0591. I re-read the card, D-13, spec §2
(`01-scope-and-gates.md:23`), `stryker.config.mjs`, `vitest.stryker.config.mts`, `lefthook.yml` and the five prompt
lines the plan edits (`code-writer.md:35-37`, `tdd-loop/SKILL.md:26`, `reviewer.md:65,97`, `review-loop/SKILL.md:45`,
`work-next/SKILL.md:37`). I re-read the round-2 prototype (`mutation-gate.sh`, `mutation-gate-smoke.sh`, `skeleton/`).

Probes (copies under `$TMPDIR/b1100r2`; the worktree was only read):

- Prototype smoke under `/bin/bash` 3.2.57: green `[mutation-gate-smoke] 14 ok, 0 FAIL`; skeleton
  `[mutation-gate-smoke] 1 ok, 13 FAIL` (only MG11 ok). Both match the plan's Verification. MG13 covers round 1's
  reason 2 (a `CLAUDE.md`-only change prints the CI-only line, no Stryker call).
- Real Stryker 10.1.1 on a `git clone` of this worktree (`node_modules` linked, load 3.06): one untracked
  `src/lib/zz-untested.ts` with a function and no test (`export function zzBump(a: number): number { return a > 1 ?
a + 1 : 0; }`), prototype `--base HEAD`. Subset: `Instrumented 1 source file(s) with 6 mutant(s)`, then
  `No tests were executed`. Fallback: 674 mutants of 29 files. The file's own row is `zz-untested.ts | 0.00 | … 5
NoCoverage, 1 error`. Last line `mutation: 91.75 % on src/lib + src/actions, no test reaches src/lib/zz-untested.ts
(ran), src 2abd2a8`, exit 0, 3 min 01 s. The stamp records exit 0, so every later call reuses the pass (reason 1).
- `scripts/next-task.sh --check B1.100` → `[next-task] B1.100: no overlap with any Doing or Review card` (exit 0).
  `scripts/agent/tier.sh backlog/work/B1.100/plan.md` → `high`. `scripts/ci/plan-files.sh --file` → the 8 Files rows.

| Check                                                                             | Result                                                                                                                                                                                          |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: no section (tooling). The 8 Files rows are unchanged from round 1. Every one is in the card's Spec line or carries the mutation step or the evidence line                                 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no `src/`, `prisma/` or `e2e/` change. The script's interface (`[--base <ref>] [--force]`, exit 0/1/2, one stamp file) is pasted                                                    |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass, same note as round 1: there is no `advice.md` (tier quick), and the plan still does not say "No advice (tier quick)"                                                                      |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 5 acceptance bullets, each checkable. Acceptance 2 asks the plan to say where the bar is read. It says "on the changed-file subset", but one input reads it on the whole layer (reason 1) |
| verification lists exact commands with expected numbers                           | pass: 14 ok / 1 ok + 13 FAIL / 749 / 298 are exact, and I reproduced the first two. The live type-only probe is named. No probe has a subset that has mutants but no test (reason 1)            |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton `chore(scripts)`, red `test(scripts) … (red)`, green `chore(scripts)`, review `docs(backlog)`; a tooling card has no map. Same as the B1.95/B1.98/B1.99 precedent                |
| the section has a `Lead approves spec` box, ticked only by a human                | n/a: no section. `Plan approved by:` is empty and stays empty here. Tier `high` (`.claude/`), so the lead's `approve` is required. The D-19 label is planned                                    |
| no settled D-n contradicted                                                       | pass: D-13's before/after report is now named as the exception (round 1 reason 3). Spec §2's gate (`pnpm test:mutation` ≥ 70 % before merge) is still met by CI's unchanged `mutation` job      |
| `scripts/next-task.sh --check B1.100` says no overlap                             | pass: `[next-task] B1.100: no overlap with any Doing or Review card`                                                                                                                            |

Round 1 reasons: 1 (no score on the subset) is addressed by the fallback, and the type-only case is measured; 2 (a
`CLAUDE.md`-only change) is addressed by the `*.ts` pathspec and MG13; 3 (D-13) is addressed by the named exception.
Round 1's costs are now stated in the plan: the subset bar with its numbers, independence, the key extended to
`tsconfig.json`, `package.json`, `pnpm-lock.yaml`, B1.98's branch, and `dev-lead.md:55`.

Verdict: changes requested

1. **The fallback lets a changed file that has mutants and no node test pass at the whole layer's score. This
   contradicts the bar the plan states.** The plan says the bar is read "on the changed-file subset: the card is held
   to 70 % on its own code". The fallback fires on any subset that ends without a score line. That includes a file
   whose mutants no node test reaches, not only a file with 0 mutants. Measured above: `src/lib/zz-untested.ts` has 6
   mutants and scores 0.00 % on its own row. The gate still prints `mutation: 91.75 % on src/lib + src/actions, no test
reaches src/lib/zz-untested.ts (ran)`, exit 0, and records it for reuse. Triggers are a new lib helper with no
   `src/**/*.test.ts` importing it, or a lib module only `.tsx` component tests reach (`vitest.stryker.config.mts`
   includes only `*.test.ts`). For this input the bar is CI's whole-layer read, not the subset's. The fallback is also
   the costliest branch (674 mutants, 3 min here at load 3, versus about 2 h a run under batch 1's load per the card),
   spent on a file that should fail at once. The same rule labels any other no-score subset "no test reaches <list>",
   for example a crash or a failed initial test run. Fix, either:
   (a) fall back only when the subset instrumented 0 mutants (Stryker logs `Instrumented N source file(s) with M
mutant(s)` before the dry run). A subset with M > 0 and "No tests were executed" is then 0 % on its own code:
   exit 1 and a line such as `mutation: 0.00 % on <list>, no test reaches it (ran)`. Any other no-score run is `?`,
   exit 1, with no fallback. Add an MG probe whose shim prints `with 3 mutant(s)` and no score, expecting exit 1 and
   one Stryker call. Or
   (b) keep the fallback and state the cost in "The bar": a changed file with mutants that no node test reaches is
   held to the whole layer (today's rule), not to 70 % on its own code. The evidence line then names it.

Not blocking, for the lead:

- **The plan is 114 lines.** `planning.md` asks for one screen (about 40 lines). Recent tooling plans run 85–100
  (B1.95 97, B1.96 100, B1.99 85), so this follows local practice, but it is the longest of them.
- **The reviewer's reuse trusts a git-ignored file that any role in the worktree can write.**
  `reports/mutation-gate.txt` holds the key, the exit code and the line, and the gate repeats them. A stamp written
  by hand with the current key passes the green gate and the reviewer without a Stryker run. CI's `mutation` job still
  catches the score before merge. The plan's `--force` on doubt is the only local check. `[plausible]`: I did not test
  whether a path hook refuses a Write to `reports/`.
- **`NaN` counts as a score.** The prototype's regex accepts `Final mutation score of NaN`. A subset whose mutants are
  all compile errors (no valid mutant) would print `mutation: NaN % on <list> (ran)` with Stryker's exit code.
  `[unverified]`: not run. If it is kept, the PR evidence line would read "NaN %".

Riskiest unfalsified: as in round 1, that code-writer's run and the green gate see the same `src/` tree in a real
agent run, so the gate says "(reused)". Lefthook's pre-commit only checks (`prettier --check`, no `stage_fixed`), so it
does not change the tree. The PostToolUse `eslint --fix` after a late edit, or an untracked scratch file under `src/`,
would change it. I could not run an agent, and the batch-2 saving rests on this.

## Plan review (round 3)

Plan at e1fe7aa (`docs(backlog): B1.100 plan round 3 -- scripts/CLAUDE.md rows`), diffed against c008cf1. The lead
allowed a third round past the two-round limit. I re-read the card, `stryker.config.mjs` (`thresholds.break: 70`,
`checkers: ['typescript']`), `vitest.stryker.config.mts`, and the round-3 prototype (`mutation-gate.sh`,
`mutation-gate-smoke.sh`, `skeleton/`). I read Stryker 10.1.1's `determineExitCode`
(`core/dist/src/reporters/mutation-test-report-helper.js:133-150`): the check is `mutationScore < breaking`, so a
`NaN` score logs `Final mutation score of NaN is greater than or equal to break threshold 70` and exits 0.

Probes (copies and a `git clone --shared` under `$TMPDIR/b1100r3`, `node_modules` linked; the worktree was only read,
plus `hook-smoke.sh` and `pnpm test`):

- Prototype smoke under `/bin/bash` 3.2.57: green `[mutation-gate-smoke] 15 ok, 0 FAIL`; skeleton
  `[mutation-gate-smoke] 1 ok, 14 FAIL` (only MG11 ok). Both match the plan's Verification.
- Baselines at e1fe7aa (only `plan.md` differs from 17ccd2b): `hook-smoke: 749 probes OK`, `Tests  298 passed (298)`.
  Both match the plan.
- Real Stryker on the clone (load 2.4). I added an untracked `src/lib/zz-nan.ts`
  (`export type ZzMode = 'on' | 'off'; export function zzDefault(): ZzMode { return 'on'; }`) and a test,
  `zz-nan.test.ts`, that asserts `zzDefault()` is `'on'`. Prototype `--base HEAD`: `Instrumented 1 source file(s) with
2 mutant(s)`, `Initial test run succeeded. Ran 1 tests`, table row `zz-nan.ts | n/a | n/a | 0 | 0 | 0 | 0 | 2`
  (both mutants are compile errors), `Final mutation score of NaN is greater than or equal to break threshold 70`.
  The gate's last line was `mutation: ? % on src/lib/zz-nan.ts (ran), src 0319527`, exit 1, 7 s. The same tree under
  today's rule (`pnpm exec stryker run`): 670 mutants, `All files | 92.84`, `zz-nan.ts | n/a`, exit 0, 187 s
  (reason 1).
- `scripts/next-task.sh --check B1.100` → `[next-task] B1.100: no overlap with any Doing or Review card` (exit 0).
  `scripts/agent/tier.sh` → `high`. `scripts/ci/plan-files.sh --file` → the 9 Files rows, `scripts/CLAUDE.md`
  included. The B1.101 plan (`chore/B1.101-sync-ready-pr`, Files at lines 55-60) does not list `scripts/CLAUDE.md`.

| Check                                                                             | Result                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: no section (tooling). 9 Files rows. The new row, `scripts/CLAUDE.md`, is the guide for the two new scripts. B1.98, which held it, is merged (6da952c, merged here in 17ccd2b). B1.101's plan does not list it |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no `src/`, `prisma/` or `e2e/` change. The interface (`[--base <ref>] [--force]`, exit 0/1/2, one stamp file) is pasted                                                                                 |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass, same note as rounds 1 and 2: there is no `advice.md` (tier quick)                                                                                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 5 acceptance bullets. Acceptance 2 is met by "on the changed-file subset", except for a subset with 0 valid mutants (reason 1)                                                                                |
| verification lists exact commands with expected numbers                           | pass, with a gap: 15 ok / 1 ok + 14 FAIL / 749 / 298 are exact, and I reproduced all four. No MG probe has a shim that prints `Final mutation score of NaN` (reason 1)                                              |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton `chore(scripts)`, red `test(scripts) … (red)`, green `chore(scripts)`, review `docs(backlog)`. A tooling card has no map                                                                             |
| the section has a `Lead approves spec` box, ticked only by a human                | n/a: no section. `Plan approved by:` is empty and stays empty here. Tier `high` (`.claude/`), so the lead's `approve` is required. The D-19 label is planned                                                        |
| no settled D-n contradicted                                                       | pass: D-13's before/after report is still the named exception. Spec §2's gate is still met by CI's unchanged `mutation` job                                                                                         |
| `scripts/next-task.sh --check B1.100` says no overlap                             | pass: `[next-task] B1.100: no overlap with any Doing or Review card`                                                                                                                                                |

Round 2 reason 1 is addressed by option (a). The fallback now fires only on `with 0 mutant(s)` (MG14). A subset that
has mutants but no test that reaches it gives `? % on <list>, no test reaches it`, exit 1, with no fallback (MG15,
measured live in the plan). The `scripts/CLAUDE.md` deferral from round 1 is resolved.

Verdict: changes requested. This is round 3, so the plan is **waiting on human**: the lead decides whether a fourth
round runs.

1. **A subset whose mutants are all compile errors fails the gate, and nothing clears it. Today's whole-layer run
   passes on the same tree.** Round 3 added `exit = … no score line (or NaN) → "?" and exit 1`. That was a reply to
   round 2's non-blocking note, which asked only what the evidence line would read. Stryker scores a file with 0
   valid mutants as `NaN` and exits 0 (the `determineExitCode` check above). The prototype's regex does not take
   `NaN` as a score. The log has neither `with 0 mutant(s)` nor `No tests were executed`. So the gate prints
   `? %`, exits 1, and records exit 1 for reuse; `--force` fails the same way. No test the test-writer adds can kill a
   mutant that never compiles. In a runner the green gate is then red with no way out, which is the same dead end as
   round 1's reason 1. It is not a rare input. In the plan's own whole-layer run, 249 of the 668 mutants are compile
   errors: `health.ts` has 3 of its 4, `complete-all.ts` 7 of 9. A new helper that returns a string-literal union (the
   shape `ts-style.md` asks for) has only compile-error mutants (measured above). A subset that mixes such a file with
   a type-only file also lands here, because its instrumented count is not 0. Fix: treat a `NaN` score (0 valid
   mutants) like 0 instrumented mutants. One option is the whole-layer fallback with a line such as `…, no valid
mutant in <list>`. Another is a passing line such as `mutation: n/a on <list>, no valid mutant (ran)`, exit 0.
   Either way, say which in the rule block and add an MG probe whose shim prints `with 2 mutant(s)` and `Final
mutation score of NaN is greater than or equal to break threshold 70`, exit 0, with the expected line, exit code
   and Stryker call count. The red/green counts in Verification move by one.

Not blocking, for the lead:

- **The plan is 122 lines** (round 2: 114). `planning.md` asks for about 40. It is now longer than every recent
  tooling plan (B1.95 97, B1.96 100, B1.99 85).
- **B1.101's deferred `scripts/CLAUDE.md` edit now points at this card.** B1.101's plan (lines 39-42 on its branch)
  leaves the `--sync` mention in the `agent/run.sh` row to "the next card that plans `scripts/CLAUDE.md`". B1.100 is
  that card, and it plans only its two new rows. That is correct, because `--sync` is not on main. But B1.101's
  hand-off now names no card.
- **A change to a test file that has no same-named source runs the whole layer.** `src/lib/todo-due-date-store.test.ts`
  has no `todo-due-date-store.ts`. The prototype maps it to a path that is not in the tree and drops it (lines 58-60),
  so `files` is empty and Stryker runs on all 668 mutants. This is today's cost, not a regression, but the plan's
  rule names only `prisma.ts` and deleted files as the inputs that empty the list.
- Round 2's note on the stamp still holds. `reports/mutation-gate.txt` is git-ignored and any role can write it, and
  the gate repeats whatever it holds. CI's `mutation` job remains the check before merge.

Riskiest unfalsified: as in rounds 1 and 2, that code-writer's run and the green gate see the same `src/` tree in a
real agent run, so the gate says "(reused)". An `eslint --fix` from the PostToolUse hook after a late edit, or an
untracked scratch file under `src/`, would change the key. I could not run an agent, and the batch-2 saving rests on
this.

## Plan review (round 4)

Plan at 1771bc0 (`docs(backlog): B1.100 plan round 4`), diffed against e1fe7aa. HEAD a5e81d7 merges origin/main
5e75d2d (backlog and spec only, D-39 added; `plan.md` unchanged by the merge). The lead allowed a fourth round past
the limit. I re-read the card, D-13, D-39, `stryker.config.mjs`, `vitest.stryker.config.mts`, `package.json`
(`test:mutation` is `stryker run`, the same call as the gate's `pnpm exec stryker run`), and the round-4 prototype
(`mutation-gate.sh`, `mutation-gate-smoke.sh`, `skeleton/`, `nan.log`, `full.log`).

Probes (copies and a `git clone --shared` under `$TMPDIR/b1100r4`, `node_modules` linked; the worktree was only read,
plus `hook-smoke.sh` and `pnpm test`):

- Prototype smoke under `/bin/bash` 3.2.57: green `[mutation-gate-smoke] 16 ok, 0 FAIL`; skeleton
  `[mutation-gate-smoke] 1 ok, 15 FAIL` (only MG11 ok). Both match the plan's Verification.
- Baselines at a5e81d7: `hook-smoke: 749 probes OK`, `Tests  298 passed (298)`. Both match the plan.
- Prototype on the clone at a5e81d7, `--base 5e75d2d` (origin/main): `mutation: CI only, no src/lib or src/actions
change`, exit 0, 0.38 s. `--base be888ff^` (the diff is still only `complete-all-label.ts` and its test after the
  merge): `Instrumented 1 source file(s) with 7 mutant(s)`, `mutation: 100.00 % on src/lib/complete-all-label.ts
(ran), src b28a606`, exit 0, 13 s; again → `(reused)`, exit 0, 1 s (load 3.8).
- `nan.log` (the plan's r3 trigger): subset `with 2 mutant(s)`, `Final mutation score of NaN`, 7 s; then 670 mutants,
  `Final mutation score of 92.84`, 3 min 30 s; last line `mutation: 92.84 % on src/lib + src/actions, no valid mutant
in src/lib/zz-nan.ts (ran)`. Stryker 10.1.1's `determineExitCode` prints both `of <score>` and `<score> under
breaking threshold`; the prototype's regex reads both.
- B7.5's row: `title-count.ts` is `100.00 | … 2 killed … 2 errors` in `full.log`, so it has valid mutants and B7.5's
  subset is scored, not a NaN fallback. The table's "1 subset run" holds.
- `scripts/next-task.sh --check B1.100` → `[next-task] B1.100: no overlap with any Doing or Review card` (exit 0).
  `scripts/agent/tier.sh` → `high`. `scripts/ci/plan-files.sh --file` → the 9 Files rows.

| Check                                                                             | Result                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: no section (tooling). The 9 Files rows are unchanged from round 3. Every one is in the card's Spec line, carries the mutation step or the evidence line, or is the guide for the two new scripts                       |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no `src/`, `prisma/` or `e2e/` change. The interface (`[--base <ref>] [--force]`, exit 0/1/2, one stamp file) is pasted                                                                                          |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass, same note as rounds 1–3: there is no `advice.md` (tier quick)                                                                                                                                                          |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 5 acceptance bullets. Acceptance 2 is answered: the bar is read on the subset, except a subset with no valid mutant, which the line names ("no valid mutant in <list>") and holds to the whole layer                   |
| verification lists exact commands with expected numbers                           | pass: 16 ok / 1 ok + 15 FAIL / 749 / 298 are exact, and I reproduced all four. The live CI-only and `--base be888ff^` runs reproduce (above). MG16 covers round 3's NaN input with its line, exit code and two Stryker calls |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton `chore(scripts)`, red `test(scripts) … (red)`, green `chore(scripts)`, review `docs(backlog)`. A tooling card has no map                                                                                      |
| the section has a `Lead approves spec` box, ticked only by a human                | n/a: no section. `Plan approved by:` is empty and stays empty here. Tier `high` (`.claude/`), so the lead's `approve` is required. The D-19 label is planned                                                                 |
| no settled D-n contradicted                                                       | pass: D-13's before/after report is still the named exception. Spec §2's gate is still met by CI's unchanged `mutation` job. D-39 (new) adds E8, whose cards change no `src/lib` or `src/actions` file                       |
| `scripts/next-task.sh --check B1.100` says no overlap                             | pass: `[next-task] B1.100: no overlap with any Doing or Review card`                                                                                                                                                         |

Round 3 reason 1 is addressed: a subset scored `NaN` (every mutant a compile error) now falls back to the whole layer
once, like a subset of 0 mutants. MG16 probes it in the smoke, and the plan measured it live (`nan.log` above).

Verdict: approved (ready for the lead's `approve`; not approved for build)

Not blocking, costs for the lead to see before `approve`:

- **A changed file with no valid mutant is held to the whole layer, not to its own code.** It costs one whole-layer
  run (7 s + 3 min 30 s here at load ≈ 2.6–3.8; batch 1's load is unmeasured) where a pass line would cost 7 s. The
  layer's score says nothing about that file. Round 3 offered both options; the plan chose this one and names it in
  the evidence line.
- **A changed test whose same-named source does not exist still runs the whole layer** (round 3 note, e.g.
  `src/lib/todo-due-date-store.test.ts`). The rule says "deleted dropped"; the prototype drops any mapped path not
  in the tree. This is today's cost, not a regression.
- **The reuse key leaves out `prisma/schema.prisma`.** The generated client's types (in `node_modules`) feed the
  TypeScript checker, so a schema edit after a run, with `src/` unchanged, reuses the old score. `[plausible]`, not
  probed. A `prisma/` card is high tier, and CI still runs mutation on the PR.
- **Which batch measures Acceptance 4.** B7.4–B7.6 are "To do, eligible" today. If E7 batch 2 is labeled before this
  PR merges, the next batch is E8, and D-39 says no E8 card changes `src/lib/` or `src/actions/`. That batch would
  measure only the CI-only branch, and the closing line's "E7 batch 2" would change.
- **The plan is 96 lines** (round 3: 122). `planning.md` asks for about 40; recent tooling plans run 85–100.
- Round 2's note still holds: the stamp in the git-ignored `reports/` is trusted as written. The plan now says so.

Riskiest unfalsified: as in rounds 1–3, that code-writer's run and the green gate see the same `src/` tree in a real
agent run, so the gate says "(reused)". If they do not, the gate runs again, which costs time but is not a wrong
result. I could not run an agent, and the batch-2 saving rests on this.

## Diff review (round 1)

Range `origin/main` (5e75d2d) `...HEAD` (14b690b): skeleton 5168a25, red 4df9203, green 14b690b. Local `main`
(d975c38) is stale, so the diff is read against `origin/main`. It has 11 files, 785 insertions and 9 deletions:
the 8 Files rows plus `backlog/work/B1.100/{plan,pr-body,review}.md`.

### Command results (last line of each)

| Command                                                      | Result                                                                                                                                              |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                  | `All matched files use Prettier code style!`                                                                                                        |
| `pnpm typecheck`                                             | `tsc --noEmit`, no output, exit 0                                                                                                                   |
| `pnpm test`                                                  | `Tests  298 passed (298)` (plan: 298)                                                                                                               |
| `pnpm test:e2e`                                              | `70 passed (1.5m)`                                                                                                                                  |
| `pnpm test:mutation` (whole layer, my role's gate)           | `Final mutation score of 92.84 is greater than or equal to break threshold 70`, exit 0, 5 min 13 s                                                  |
| `scripts/mutation-gate.sh` (this card's gate)                | `mutation: CI only, no src/lib or src/actions change`, exit 0, 0.41 s                                                                               |
| `scripts/mutation-gate.sh --base 'be888ff^'`                 | `mutation: 100.00 % on src/lib/complete-all-label.ts (reused), src b28a606`, exit 0 (the stamp of the plan's live run)                              |
| `/bin/bash scripts/mutation-gate-smoke.sh` at 14b690b        | `[mutation-gate-smoke] 16 ok, 0 FAIL`                                                                                                               |
| same smoke at 4df9203 (skeleton), on a clone under `$TMPDIR` | `[mutation-gate-smoke] 1 ok, 15 FAIL` (MG11 holds, as planned)                                                                                      |
| `/bin/bash scripts/hook-smoke.sh`                            | `hook-smoke: 749 probes OK` (plan: 749)                                                                                                             |
| `scripts/ci/check-suppressions.sh`                           | `OK: no new suppressions`                                                                                                                           |
| `scripts/ci/check-config-change.sh`                          | exit 1: the 5 `.claude/` files lack `config-change-approved`. This is expected before the draft; the plan adds the label at draft (D-19)            |
| `scripts/ci/check-feat-commits.sh`                           | `OK: no feat commit touches tests`                                                                                                                  |
| `scripts/ci/check-ac-coverage.sh`                            | `OK: every criterion of a shipped section has a test`                                                                                               |
| `scripts/ci/check-spec-sections.sh`                          | `OK: sections cited: 1 … 43`                                                                                                                        |
| `scripts/ci/check-features-map.sh`                           | `OK`                                                                                                                                                |
| `scripts/ci/check-plan-scope.sh`                             | `OK: chore/B1.100-mutation-once stays inside the approved plan of B1.100`                                                                           |
| `scripts/ci/check-agent-frontmatter.sh`, `check-backlog.sh`  | `OK: 13 files`, `OK: README matches the cards`                                                                                                      |
| `scripts/next-task.sh --check B1.100`                        | `[next-task] B1.100: no overlap with any Doing or Review card`                                                                                      |
| `scripts/verify-red.sh B1.100`                               | `::error::no 'test(<pkg>): B1.100 … (red)' commit`. This is expected for a smoke-only red (see the checklist). My skeleton run above proves the red |
| `git status --short` after all runs                          | empty                                                                                                                                               |

### Checklist

| Check                                        | Result                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every criterion has a test matching its Then | n/a (no §). Card Acceptance 1–3 map to MG1–MG16. Acceptance 4 (batch-2 load) is the closing lane's. Acceptance 5 (label) is applied at the draft                                                                                                                                                                                                 |
| no test weakened after the red commit        | pass: `git log --first-parent --no-merges 4df9203..HEAD -- '*.test.*' e2e/ scripts/mutation-gate-smoke.sh` is empty, and the range has no merges                                                                                                                                                                                                 |
| red commit                                   | pass, with a stated deviation. 4df9203 drops the plan's `(red)` marker, and its body says why: smoke only, which `--auto` cannot judge. This is the B1.95/B1.98/B1.99 precedent. The red was reproduced: 1 ok / 15 FAIL                                                                                                                          |
| every changed file is in `plan.md`           | pass: the 8 Files rows plus `backlog/work/B1.100/*`. `check-plan-scope.sh` OK                                                                                                                                                                                                                                                                    |
| interfaces match the plan                    | pass with one exception, finding [3]. `[--base <ref>] [--force]`, the one stamp file and the line formats match. `--bogus` → 2, bad ref → 2, `--base` with no value → 1                                                                                                                                                                          |
| Zod / Prisma / raw SQL / migration           | n/a: no `src/`, `prisma/` or `e2e/` change                                                                                                                                                                                                                                                                                                       |
| no secret, no suppression                    | pass                                                                                                                                                                                                                                                                                                                                             |
| features map row moved                       | n/a: tooling card, no map row                                                                                                                                                                                                                                                                                                                    |
| prompts                                      | pass: code-writer step 4 and Report, tdd-loop green gate and Report, reviewer gate run, review-loop re-verify, and work-next Exit all name the script. D-13's before/after is kept on `pnpm test:mutation`. CI `ci.yml:107` is untouched. `dev-lead.md:55` is unchanged, as planned                                                              |
| real Stryker text the script parses          | pass: `mutation-test-report-helper.js:139,144` (core 10.1.1) prints both `Final mutation score <s> under breaking threshold` and `Final mutation score of <s> is greater…`. `instrumenter.js:53` prints `with %d mutant(s)`. `3-dry-run-executor.js:47` prints `No tests were executed`. The regex reads `50.00` from the colored below-bar line |
| reuse assumption                             | pass: `lefthook.yml` pre-commit only checks and never rewrites a staged file. Code-writer's commit leaves the working tree's `src/` hash unchanged, so the green gate and the reviewer get "(reused)"                                                                                                                                            |
| revert/mutant probe (copy under `$TMPDIR`)   | 16 sed mutants of `mutation-gate.sh` against the smoke: 11 killed. 5 survived. `sort -u`→`sort` and dropping `--no-renames` are equivalent (cosmetic duplicate, or the old path is dropped by `cat-file` anyway). Three are real gaps: findings [1] and [2]                                                                                      |

### Findings (none blocking)

```
[1] KIND: coverage
    WHERE: scripts/mutation-gate.sh:79 (regex), scripts/mutation-gate-smoke.sh:34 (shim)
    DEFECT: the shim always prints "Final mutation score of <s> is greater than or equal…", even for FAKE_SCORE=50.00 FAKE_RC=1, so Stryker's real below-bar line "Final mutation score 50.00 under breaking threshold 70" is never probed.
    TRIGGER: mutant `(of )?` → `(of )` on line 79: smoke still "16 ok, 0 FAIL"; on real Stryker below 70 that mutant prints "mutation: ? % on …" instead of "mutation: 50.00 % on …".
    WRONG BEHAVIOUR: none today (the shipped regex reads 50.00, checked); a later edit could lose the below-bar score from the PR evidence line with no probe failing. Exit code stays 1 either way.
    CONFIDENCE: confirmed (mutant run; regex run on the real line)
[2] KIND: coverage
    WHERE: scripts/mutation-gate.sh:67-68 (reuse key)
    DEFECT: the smoke does not probe the mutate list in the key, nor vitest.stryker.config.mts / package.json / pnpm-lock.yaml as key parts (MG11 covers stryker.config.mjs and tsconfig.json only).
    TRIGGER: mutant line 68 → `key="$key"`, and mutant line 67 → `for p in stryker.config.mjs tsconfig.json`: both "16 ok, 0 FAIL".
    WRONG BEHAVIOUR: none today; such an edit would let a run with another --base, or after a vitest.stryker.config.mts / lockfile change, reuse a stale line, unnoticed by the smoke.
    CONFIDENCE: confirmed (mutants run)
[3] KIND: plan-mismatch
    WHERE: scripts/mutation-gate.sh:29
    DEFECT: `${2:?--base needs a ref}` exits 1, while the plan's Interfaces say usage errors exit 2 and 1 means "below the bar or no score".
    TRIGGER: `scripts/mutation-gate.sh --base` (no value) → stderr "line 29: 2: --base needs a ref", exit 1.
    WRONG BEHAVIOUR: a usage error reads as a failed mutation gate (exit 1), with no `mutation:` line; `--bogus` correctly exits 2.
    CONFIDENCE: confirmed (ran it on the clone)
```

None of these changes a pass/fail result on input that any prompt produces. Every prompt calls the script with no
argument, or with `--force`. Fixing [1] and [2] means a `test(scripts): B1.100 review pass 1 -- …` commit, and
fixing [3] a one-line `fix`. That is the dev-lead's call. If they stay open, the PR body should say so.

Not blocking either: `pr-body.md` line 7 still reads "Red: pending. Green: pending". Fill it with 1 ok / 15 FAIL and
16 ok / 0 FAIL before the draft.

Verdict: ready for PR

Riskiest unfalsified: the real-Stryker branches that the shim imitates (0 mutants, then "No tests were executed";
NaN, then the fallback; mutants with no test reached). I verified the messages in Stryker 10.1.1's source and the
plan's live runs, but I did not re-run them. A Stryker upgrade that rewords any of them would turn a pass into
"? %", exit 1. That fails closed, but no probe would catch the rewording.
