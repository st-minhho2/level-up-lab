# B1.88 review

## Plan review (round 1)

SCOPE: tooling (`scripts/agent/`, `.claude/docs/`; no `src/`, no section)

| Check                                                                          | Result                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the card                                     | pass: `run.sh` (Acceptance), `run-smoke.sh` (the card's Test line), `hooks.md` rule 6 Costs (stale sentence "the runner's container has no `TMPDIR`"), `work/B1.88/*`. No features-map row applies (tooling, no §) |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass (n/a): bash only, no TypeScript, no action, no Prisma. The child environment, the `no-tmpdir` outcome and "no new flag, variable or exit code" are stated                                                     |
| plan follows `advice.md` or states the deviation                               | pass: no advice (tier quick, no section), stated                                                                                                                                                                   |
| ≤ 7 criteria, every Then measurable                                            | pass: 6 R19 cases, each with a count, a path relation or an outcome string                                                                                                                                         |
| verification lists exact commands with expected numbers                        | pass: red "1 of 19 probes FAILED" (R19, all 6 cases), green "19 probes OK", hook-smoke 726 OK (matches B1.84's close, `E1-todos.md:1057`), `/bin/bash` 3.2, no `/tmp/level-up-lab-run.*` left                      |
| work breakdown: skeleton → red → green → map → review, convention subjects     | pass: as B1.82's (0de8773): `test(scripts)` red, `chore(scripts)` green, `docs(backlog)` review; no skeleton or map step for a tooling card                                                                        |
| `Lead approves spec` box, human-ticked only                                    | pass (n/a): no spec change. Tier **high** (`scripts/agent/tier.sh` prints `high`), so the lead's `approve` is the gate; `config-change-approved` (D-19) named                                                      |
| no settled D-n contradicted                                                    | pass: D-19, D-27, D-28 followed; `backlog/00-decisions.md` holds no TMPDIR ruling; `reviewer.md`'s "TMPDIR unset" rule kept for sessions                                                                           |
| `next-task.sh --check B1.88`                                                   | pass: `[next-task] B1.88: no overlap with any Doing or Review card`                                                                                                                                                |

Verdict: changes requested

1. **A failed `mktemp` can become the checkout, and the run then `rm -rf`s it.** The plan says
   `RUN_TMP="$(mktemp -d /tmp/level-up-lab-run.XXXXXX)"`, "resolved with `pwd -P`", without saying what is tested
   before the resolve. The repo's own idiom (`run-smoke.sh:17`, `TMP="$(cd "$(mktemp -d)" && pwd -P)"`) applied here is
   wrong: in bash 3.2 `cd ""` succeeds and stays put. Traced with `/bin/bash`:
   `cd /usr; x="$(cd "$(false)" && pwd -P)"` → `rc=0 x=[/usr]`. `run.sh` runs from `$ROOT` (line 19), so with `/tmp`
   full or unwritable `RUN_TMP` = `$ROOT`, the run starts with `TMPDIR` = the checkout (rule 6 then refuses every probe
   as "overlaps the worktree"), and the `rm -rf "$RUN_TMP"` after `wait` deletes the checkout run.sh lives in (the
   lead's main checkout). In R19's `mktemp`-fails case the same form deletes the developer's worktree during the
   smoke itself, since `run-smoke.sh` runs the real `run.sh` with `ROOT` = that worktree; the mutant list ("no stop on
   `mktemp` failure") is risky to run on the real tree for the same reason. The plan must say:
   (a) `mktemp`'s exit status and a non-empty output are checked before `cd … && pwd -P`, and the resolve's own status
   is checked as well (each failure → `no-tmpdir`);
   (b) `RUN_TMP` is assigned only after (a) succeeds, so `on_signal` never sees a half-made value;
   (c) every `rm -rf "$RUN_TMP"` (after `wait` and in `on_signal`) runs only when the value matches
   `/tmp/level-up-lab-run.*` or `/private/tmp/level-up-lab-run.*`;
   (d) R19's `mktemp`-fails shim exits 1 **with empty output** (the input that takes the `cd ""` path), and mutants run
   on a copy, not on the worktree.
2. **A disk cost is not stated.** The reviewer's documented probe is `cp -r . "$TMPDIR/probe"`. This worktree is 855 MB
   (`du -sh .`; `node_modules` 847 MB), and the directory is removed only when the `claude -p` call ends, not when a
   review pass ends. So a run with N diff passes that each copy the tree holds up to N × ~855 MB in `/tmp`, three parallel
   E6 runs hold three times that, and on the host this is the system volume. Each run's pnpm, vitest, Playwright,
   Prisma and git temp files also move into the directory and go when the run ends. Add this to "Costs, for the lead
   to accept" (or bound it, e.g. by naming the probe path per pass so the reviewer removes it). As written, the lead
   approves without seeing it.

Not a reason, worth one line in R19 if cheap: the TERM case covers `run.sh <issue>` only. The batch path is `--poll`,
where `RUN_TMP` lives in `run_issue`'s subshell and the parent's is empty. The existing `--poll` TERM probe
(`run-smoke.sh:284`) could also assert "its TMPDIR gone".

Riskiest unfalsified: whether Claude Code passes the process's `TMPDIR` unchanged to the Bash tool _and_ to the hook
of a subagent (`reviewer-writes.mjs:6-7` assumes they share it). The plan marks this `[unverified]` until the first
E6 batch, which is right; nothing offline can show it.
