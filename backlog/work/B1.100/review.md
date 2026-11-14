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
