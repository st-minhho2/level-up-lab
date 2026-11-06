# B1.88 plan — the runner gives each run a private TMPDIR (tooling, no §)

Approach: `claude_run` (the one place `run.sh` starts `claude -p`, for a run and for `--check-binary`) makes a
directory and passes `TMPDIR="$RUN_TMP"` on the existing `env -u …` line, beside `RUNNER_CHILD=1`. Each step is checked,
because in bash 3.2 `cd ""` succeeds where it stands (`run.sh` stands in the checkout; review r1):

```bash
t="$(mktemp -d /tmp/level-up-lab-run.XXXXXX 2>> "$base.err")" && [[ -n "$t" && -d "$t" ]] \
  && t="$(cd "$t" && pwd -P)" && is_run_tmp "$t" \
  || { PROBLEM="no-tmpdir: mktemp -d under /tmp failed"; return; }
RUN_TMP="$t"   # assigned only after every check
is_run_tmp() { [[ "${1##*/}" == level-up-lab-run.?* && ( "${1%/*}" == /tmp || "${1%/*}" == /private/tmp ) ]]; }
drop_tmp() { ! is_run_tmp "$RUN_TMP" || rm -rf "$RUN_TMP"; RUN_TMP=""; }
```

`drop_tmp` runs after `wait` and in `on_signal`, the same pattern as `--check-binary`'s `$PROBE` (script lines, not
agent commands, so guard-bash never sees them); it removes only a path `is_run_tmp` accepts. A fixed `/tmp`, not the host's `${TMPDIR}` and not `$RUNNER_RUNS`: either can be set to a path inside the project,
and `/tmp` exists on the host and in the image, so the Dockerfile stays as it is. `mktemp -d` fails → no `claude -p`
starts: `PROBLEM="no-tmpdir: …"`, so the run ends as outcome `no-tmpdir` with its comment and `stopped` mark
(`--check-binary` dies with it); a retry gets a new directory. `--version` and `auth status` (via `child`) are not
`-p` runs and keep the host's environment. Interactive sessions: nothing changes (`run.sh` only).

Costs, for the lead to accept:

- **Disk (review r1):** the directory lives as long as its `claude -p` call, not one review pass. A reviewer probe
  `cp -r .` of a worktree is ~855 MB (847 MB `node_modules`), so a run holds N × ~855 MB in `/tmp` for N copies, three
  parallel E6 runs three times that, on the host's system volume; the run's pnpm, vitest, Playwright and Prisma temp
  files land there too. The reviewer cannot remove its copy (`rm -rf` is refused); the space returns when the call ends.
- A `kill -9` of `run.sh` leaves `/tmp/level-up-lab-run.*` behind (no trap runs); the OS's `/tmp` cleanup takes it.
- After a TERM, `on_signal` removes the directory right after it sends TERM to the child, without waiting for it: a
  child still writing could recreate files there. Same race as `$PROBE` today.
- Live proof is `[unverified]`: no paid `claude -p` run here. The first E6 batch shows it: a `review.md` without
  "probe not run: TMPDIR unset".

No advice (tier quick, no section). Risk tier **high** (`scripts/agent/`, `.claude/`, D-28) → the lead's `approve`;
the PR carries `config-change-approved` (D-19). Dev-lead writes `scripts/` and `.claude/docs/` (interactive, as B1.82).

## Files

| File                         | Change                                                                                                                                                                    | Why        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `scripts/agent/run.sh`       | `claude_run` makes and passes `RUN_TMP` as above; `is_run_tmp`, `drop_tmp`; `on_signal` calls `drop_tmp`; `RUN_TMP=""` beside `CHILD_PID`; header line 16                 | Acceptance |
| `scripts/agent/run-smoke.sh` | `claude` shim logs `START <TMPDIR> <y/n>` (leaving a file there) and `END <TMPDIR> <entries>` to `$SMOKE_FIX/tmpdirs`; stream word `NAP` (sleep 2); R19; header names R19 | Test line  |
| `.claude/docs/hooks.md`      | rule 6 "Costs": "the runner's container has no `TMPDIR`" → a session without `TMPDIR`; a `run.sh` run has its own (B1.88)                                                 | stale doc  |
| `backlog/work/B1.88/*`       | plan, review, pr-body                                                                                                                                                     | pipeline   |

## Interfaces touched

Child environment of every `claude -p` that `claude_run` starts: `TMPDIR=/private/tmp/level-up-lab-run.XXXXXX` on
macOS (`/tmp/…` in Linux), mode 700, new per call, removed when the call ends. New outcome `no-tmpdir` (comment,
`stopped`), never retried. No new flag, variable or exit code. R19 (host `TMPDIR` = `$TMP/host` in each case):

| Case                                                                                                       | Want                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| one run (issue 7)                                                                                          | 1 `-p`; its TMPDIR absolute, a directory, not the host's, outside `$WT`, ROOT, home checkout                            |
| retry (error, then gate)                                                                                   | 2 `-p`, 2 different TMPDIRs, each holding only its run's file at the end, both gone                                     |
| two runs at once (issues 7, 8; `NAP`)                                                                      | 2 different TMPDIRs, each holding only its run's file, both gone                                                        |
| `--check-binary`                                                                                           | rc 0; its TMPDIR as in "one run"                                                                                        |
| TERM during a run, during `--poll` (`SLEEP`)                                                               | its TMPDIR gone                                                                                                         |
| `mktemp` shim on `PATH`: exits 1; exits 0 printing nothing; prints `$TMP/victim` (a directory with a file) | rc 0, 0 `-p` calls, `stopped` = `no-tmpdir`, the comment names `no-tmpdir`; the copy and `$TMP/victim/keep` still there |

The `mktemp` cases run a copy of `scripts/` and `backlog/plan/` under the smoke's `$TMP` (`SRC`, `DIR`), so a `run.sh`
that turned an empty answer into its cwd removes only the copy, never the worktree; mutants run on a scratch copy too.

## Verification

`run-smoke.sh` is in no CI job: run locally with `/bin/bash` (3.2) at each step and again in the diff review.

- Red `test(scripts): B1.88 run-smoke probes the run's own TMPDIR` (body "Red because claude_run passes the host's
  TMPDIR"): R1–R18 ok, R19 FAIL (all 9 cases), "1 of 19 probes FAILED".
- Green `chore(scripts): B1.88 run.sh gives each claude -p run its own TMPDIR`: "19 probes OK", no
  `/tmp/level-up-lab-run.*` left. `hook-smoke.sh` 726 OK before and after (CI `test`).
- Prototype on 296afed (round 2): both hold. 6 of 8 mutants fail R19 only: no `on_signal` removal, no removal after
  `wait`, one shared directory, no `TMPDIR=` on the env line, no stop on a failed check, no `is_run_tmp` at creation.
  2 survive as equivalent layers: without the `-n`/`-d` check `is_run_tmp` still refuses the resolved cwd; without
  `drop_tmp`'s guard `RUN_TMP` only ever holds a path `is_run_tmp` accepted. Both stay as the second lock (review r1).
- `next-task.sh --check B1.88` no overlap; `check-plan-scope.sh`, `check-backlog.sh` OK; `pnpm lint && pnpm
typecheck` clean; `pnpm test` unchanged; CI green.

## Work breakdown

| Step | Role     | Produces         | Commit                                                                 |
| ---- | -------- | ---------------- | ---------------------------------------------------------------------- |
| 1    | dev-lead | red probe R19    | `test(scripts): B1.88 run-smoke probes the run's own TMPDIR`           |
| 2    | dev-lead | `claude_run` fix | `chore(scripts): B1.88 run.sh gives each claude -p run its own TMPDIR` |
| 3    | reviewer | diff review      | `docs(backlog): B1.88 review pass N`                                   |
| 4    | dev-lead | draft PR, label  | —                                                                      |

Not in scope: the runner image or container, `reviewer.md` (its "TMPDIR unset" rule stays for sessions), guard-bash.

Plan review: approved, round 2 · Plan approved by: lead, 2026-11-06 · Rounds: 1
