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

## Plan review (round 2)

SCOPE: tooling (`scripts/agent/`, `.claude/docs/`; no `src/`, no section)

Round 1's reasons, checked against `4784b54`:

- **1 (a)–(d), resolved.** The snippet checks `mktemp`'s status, a non-empty output, `-d`, the `cd … && pwd -P` status
  and `is_run_tmp` on the resolved path, and assigns `RUN_TMP` only after all of them; `drop_tmp` removes only a value
  `is_run_tmp` accepts. Traced with `/bin/bash` 3.2 on a copy under `$TMPDIR`, the snippet run with `cwd` = a scratch
  dir and a `mktemp` shim first on `PATH`: exits 1, exits 0 printing nothing, prints a victim directory holding `keep`
  → each gives `rc=0 PROBLEM=[no-tmpdir: mktemp -d under /tmp failed] RUN_TMP=[]`, `drop_tmp` removes nothing, `keep`
  is still there. `is_run_tmp` refuses `""`, `/tmp/level-up-lab-run.` (empty suffix), a trailing `/`, `/tmp//…`,
  `/tmp/x/level-up-lab-run.a`, `…/..`, `…/../..`; it accepts `/private/tmp/level-up-lab-run.ab`. The `mktemp` cases
  and the mutants run on a copy of `scripts/` + `backlog/plan/` under the smoke's `$TMP` (d).
- **2, resolved.** "Disk (review r1)" names N × ~855 MB per run, three times that for three E6 runs, the system volume,
  and that the reviewer cannot remove its copy before the call ends.
- **Round 1's note, taken:** the `--poll` TERM case is in R19.

| Check                                                                          | Result                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the card                                     | pass: unchanged from round 1 (`run.sh`, `run-smoke.sh`, `hooks.md` rule 6 Costs line 47, `work/B1.88/*`). `git grep` finds no other doc saying the runner has no `TMPDIR`; `reviewer.md:27` stays for sessions, as stated                                         |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass (n/a): bash only. Child env, mode 700, per call, outcome `no-tmpdir` (comment, `stopped`, never retried: the loop retries only `error:*`, `run.sh:261`), no new flag, variable or exit code                                                                  |
| plan follows `advice.md` or states the deviation                               | pass: no advice (tier quick, no section), stated                                                                                                                                                                                                                  |
| ≤ 7 criteria, every Then measurable                                            | pass: 6 R19 rows (9 cases), each a count, a path relation, an outcome string or a file that must survive                                                                                                                                                          |
| verification lists exact commands with expected numbers                        | pass: red "1 of 19 probes FAILED" (R19, all 9 cases; each fails today: TMPDIR = the host's `$TMP/host`, which is not removed, and no `mktemp` stops the `-p` call), green "19 probes OK", hook-smoke 726 OK, mutants 6 of 8 killed with the 2 survivors explained |
| work breakdown: skeleton → red → green → map → review, convention subjects     | pass: as round 1 (`test(scripts)` red, `chore(scripts)` green, `docs(backlog)` review; no skeleton or map for a tooling card)                                                                                                                                     |
| `Lead approves spec` box, human-ticked only                                    | pass (n/a): no spec change. `scripts/agent/tier.sh backlog/work/B1.88/plan.md` → `high`, so the lead's `approve` is the gate; `config-change-approved` (D-19) named                                                                                               |
| no settled D-n contradicted                                                    | pass: D-19, D-27, D-28 followed; no TMPDIR ruling in `00-decisions.md`. No hook keeps state under `TMPDIR` (`require-review.sh` does not), so a new directory per call loses nothing between a run and its retry                                                  |
| `next-task.sh --check B1.88`                                                   | pass: `[next-task] B1.88: no overlap with any Doing or Review card`                                                                                                                                                                                               |

Verdict: approved (ready for the lead's gate, not for build)

Not reasons, for the lead to weigh at the gate (each falls under the plan's stated costs or needs no change):

- A TERM in the few lines between `mktemp` and `RUN_TMP="$t"` leaves that empty directory behind (`on_signal` sees
  `RUN_TMP` empty). This is the same class as the stated `kill -9` cost, one empty directory, and it is the price of (b).
- On `no-tmpdir` no `.jsonl` or `.exit` is written, so the comment's `log:` line names a file that does not exist. The
  reason is in `.err` (the `mktemp` stderr goes there). Worth one word in the comment's detail, not a blocker.
- R19 has no `--check-binary` + failing `mktemp` case. That path ends in `die "… no-tmpdir: …; not verified"`
  (`run.sh:294`) and writes no version line, by tracing only.

Riskiest unfalsified: unchanged from round 1. Whether Claude Code gives the process's `TMPDIR` unchanged to the Bash
tool and to a subagent's hook. The plan marks it `[unverified]` until the first E6 batch; nothing offline can show it.

## Diff review (round 1)

SCOPE: tooling (`scripts/agent/run.sh`, `scripts/agent/run-smoke.sh`, `.claude/docs/hooks.md`; no `src/`, `prisma/`,
`e2e/`; no section). Range 296afed..05f681d; red 6708888, green 05f681d.

### Commands (run by the reviewer, last line each)

| Command                                              | Result                                                                                                                                                                                               |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                          | `All matched files use Prettier code style!` (rc 0)                                                                                                                                                  |
| `pnpm typecheck`                                     | `tsc --noEmit` (rc 0)                                                                                                                                                                                |
| `pnpm test`                                          | `Tests  241 passed (241)`                                                                                                                                                                            |
| `pnpm test:e2e`                                      | `52 passed (1.2m)` (the `e2e: insert rejected` server log is the suite's own failure-path probe)                                                                                                     |
| `pnpm test:mutation`                                 | `Final mutation score of 92.62 is greater than or equal to break threshold 70` (`src/` unchanged)                                                                                                    |
| `/bin/bash scripts/agent/run-smoke.sh` at HEAD       | `19 probes OK`; `/tmp/level-up-lab-run.*` count 0 before and after                                                                                                                                   |
| same, at 6708888 (clone under `$TMPDIR`)             | `1 of 19 probes FAILED` (R19 only; every case: "the host's TMPDIR", shared, mktemp cases `calls=1 stopped=gate`)                                                                                     |
| `bash scripts/hook-smoke.sh`                         | `hook-smoke: 726 probes OK`                                                                                                                                                                          |
| `scripts/ci/check-suppressions.sh`                   | `[check-suppressions] OK: no new suppressions`                                                                                                                                                       |
| `scripts/ci/check-config-change.sh`                  | rc 1: `Protected configuration changed without the 'config-change-approved' label` (hooks.md, run-smoke.sh, run.sh): expected locally, the PR carries it                                             |
| `scripts/ci/check-feat-commits.sh`                   | `[check-feat-commits] OK: no feat commit touches tests`                                                                                                                                              |
| `scripts/ci/check-ac-coverage.sh`                    | `[check-ac-coverage] OK: every criterion of a shipped section has a test`                                                                                                                            |
| `scripts/ci/check-spec-sections.sh`                  | `[check-spec-sections] OK: sections cited: 1 … 28`                                                                                                                                                   |
| `scripts/ci/check-features-map.sh`                   | `[check-features-map] OK`                                                                                                                                                                            |
| `scripts/ci/check-backlog.sh`, `check-plan-scope.sh` | `OK: README matches the cards`; `OK: chore/B1.88-runner-tmpdir stays inside the approved plan of B1.88`                                                                                              |
| `scripts/verify-red.sh B1.88`                        | rc 1 "no … (red) commit": n/a, no `*.test.ts` in the card (the red is the smoke run above); `--auto --range 296afed..HEAD` (CI's form) → "nothing to verify", rc 0; same subject form as B1.82/B1.84 |
| `scripts/next-task.sh --check B1.88`                 | `[next-task] B1.88: no overlap with any Doing or Review card`                                                                                                                                        |
| `git diff --stat 296afed..HEAD`                      | 6 files, +417 −5 (hooks.md 4, run-smoke.sh 78, run.sh 24, work/B1.88/* 316)                                                                                                                          |

### Checklist

- Acceptance (card): set, existing absolute directory, outside the worktree and the project, private per run → R19
  "one run", "retry", "two runs at once", "--check-binary"; interactive sessions unchanged (only `run.sh`); run-smoke
  R1–R18 and hook-smoke 726 keep their verdicts; label named for the PR. pass
- No test changed after the red: `git log --first-parent --no-merges 6708888..HEAD -- '*.test.*' e2e/ scripts/agent/run-smoke.sh`
  empty; no merges in the range. pass
- Every changed file is in the plan's Files table; `check-plan-scope.sh` agrees. pass
- Interfaces match the plan: child `TMPDIR=/private/tmp/level-up-lab-run.XXXXXX` (observed in the shim log), mode 700
  (`drwx------`), new per call, outcome `no-tmpdir` with comment and `stopped`, no new flag or exit code. pass
- Zod, Prisma, raw SQL, migration, features-map row: n/a (no `src/`, no section). No secret, no suppression. pass
- `/bin/bash -n` clean on both scripts (shellcheck not installed here).

### Probes (copies under `$TMPDIR`, `/bin/bash` 3.2)

Mutants of `run.sh` at HEAD, full smoke each:

| Mutant                                 | Result                                                                                                                                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| no `drop_tmp` in `on_signal`           | killed, R19: "TERM: left after the run", "TERM during --poll: left …"                                                                                                                                               |
| no `drop_tmp` after `wait`             | killed, R19: one run, retry, two runs, --check-binary "left after the run"                                                                                                                                          |
| no `TMPDIR="$RUN_TMP"` on the env line | killed, R19 (the host's TMPDIR, shared)                                                                                                                                                                             |
| no `is_run_tmp` at creation            | killed, R19: `mktemp <victim>: calls=1 stopped=gate`                                                                                                                                                                |
| no `return` on a failed check          | killed, R19: all three mktemp cases `calls=1 stopped=gate`                                                                                                                                                          |
| `mktemp -d` under the host's TMPDIR    | killed, 14 of 19 (R4–R14, R16, R18, R19)                                                                                                                                                                            |
| one fixed shared directory             | killed, R19: retry and two runs "shared a TMPDIR", entries "2 2"                                                                                                                                                    |
| `is_run_tmp` accepts any parent        | survives: the victim's basename is not `level-up-lab-run.*`; second lock                                                                                                                                            |
| no `cd … && pwd -P` resolve            | survives: macOS `mktemp` prints `/tmp/…`, which `is_run_tmp` accepts; the child then sees `/tmp/…` not `/private/tmp/…`, which `reviewer-writes.mjs:858` resolves itself (`real(tmpRaw)`), so equivalent for rule 6 |

Caller's doubts, each traced:

- R19 "two runs at once" overlap: the shim's log in a HEAD copy reads `START a`, `START b`, `END b 1`, `END a 1`, so
  the two `-p` calls did overlap; and the "shared a TMPDIR" assertion compares names, so it holds without overlap.
- `on_signal` removing the directory without waiting for the child: stated in the plan's Costs. Not probed with a live
  `claude`; the smoke's shim dies on TERM.
- TERM between `mktemp` and `RUN_TMP="$t"`: one empty directory left, stated at plan review round 2.
- `is_run_tmp` in the Linux runner: `node:24…-bookworm`, `/tmp` a real directory, no `read_only` or `/tmp` tmpfs in
  `.devcontainer/runner/docker-compose.yml` (only `/run`, pgdata), so `pwd -P` gives `/tmp/level-up-lab-run.*`.
  Traced, not run in the container.
- R19's `cp -R` of `scripts/` and `backlog/plan/`: under the smoke's `$TMP`, removed by its `EXIT` trap; at the red
  commit the copy ran a full run (`stopped=gate`), so it is a working `run.sh`, and the guard `-f $COPY/scripts/agent/run.sh`
  would catch a `cd ""` removal of its cwd.

### Findings

None blocking.

Not findings (stated costs or second locks): the two surviving mutants above; `no-tmpdir` writes no `.jsonl` while
the comment's `log:` names one (round 2 note); a `--check-binary` + failing `mktemp` case is traced, not probed.

Verdict: ready for PR

Riskiest unfalsified: after a TERM, `on_signal` runs `rm -rf` while the killed `claude`'s tool children (a reviewer's
`cp -r .` or vitest in `$TMPDIR/probe`) may still write there, so a large copy can survive the signal; the smoke's
shim cannot show it, and whether Claude Code passes `TMPDIR` on to the Bash tool and hooks is still `[unverified]`
until the first E6 batch.
