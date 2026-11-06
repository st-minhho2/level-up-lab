# B1.88 plan — the runner gives each run a private TMPDIR (tooling, no §)

Approach: `claude_run` (the one place `run.sh` starts `claude -p`, for a run and for `--check-binary`) makes
`RUN_TMP="$(mktemp -d /tmp/level-up-lab-run.XXXXXX)"`, resolved with `pwd -P`, and passes `TMPDIR="$RUN_TMP"` on the
existing `env -u …` line, beside `RUNNER_CHILD=1`. After `wait` it runs `rm -rf "$RUN_TMP"`; `on_signal` removes it too,
the same pattern as `--check-binary`'s `$PROBE` (both are script lines, not agent commands, so guard-bash never sees
them). A fixed `/tmp`, not the host's `${TMPDIR}` and not `$RUNNER_RUNS`: either can be set to a path inside the project,
and `/tmp` exists on the host and in the image, so the Dockerfile stays as it is. `mktemp -d` fails → no `claude -p`
starts: `PROBLEM="no-tmpdir: …"`, so the run ends as outcome `no-tmpdir` with its comment and `stopped` mark
(`--check-binary` dies with it); a retry gets a new directory. `--version` and `auth status` (via `child`) are not
`-p` runs and keep the host's environment. Interactive sessions: nothing changes (`run.sh` only).

Costs, for the lead to accept:

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
| `scripts/agent/run.sh`       | `claude_run` makes, passes and removes `RUN_TMP`; `on_signal` removes it; `RUN_TMP=""` beside `CHILD_PID`; header line 16                                                 | Acceptance |
| `scripts/agent/run-smoke.sh` | `claude` shim logs `START <TMPDIR> <y/n>` (leaving a file there) and `END <TMPDIR> <entries>` to `$SMOKE_FIX/tmpdirs`; stream word `NAP` (sleep 2); R19; header names R19 | Test line  |
| `.claude/docs/hooks.md`      | rule 6 "Costs": "the runner's container has no `TMPDIR`" → a session without `TMPDIR`; a `run.sh` run has its own (B1.88)                                                 | stale doc  |
| `backlog/work/B1.88/*`       | plan, review, pr-body                                                                                                                                                     | pipeline   |

## Interfaces touched

Child environment of every `claude -p` that `claude_run` starts: `TMPDIR=/private/tmp/level-up-lab-run.XXXXXX` on
macOS (`/tmp/…` in Linux), mode 700, new per call, removed when the call ends. New outcome `no-tmpdir` (comment,
`stopped`), never retried. No new flag, variable or exit code. R19 (host `TMPDIR` = `$TMP/host` in each case):

| Case                                      | Want                                                                                         |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| one run (issue 7)                         | 1 `-p`; its TMPDIR absolute, a directory, not the host's, outside `$WT`, ROOT, home checkout |
| retry (error, then gate)                  | 2 `-p`, 2 different TMPDIRs, each holding only its run's file at the end, both gone          |
| two runs at once (issues 7, 8; `NAP`)     | 2 different TMPDIRs, each holding only its run's file, both gone                             |
| `--check-binary`                          | rc 0; its TMPDIR as in "one run"                                                             |
| TERM during a run (`SLEEP`)               | its TMPDIR gone                                                                              |
| `mktemp` fails (a shim earlier on `PATH`) | rc 0, 0 `-p` calls, `stopped` = `no-tmpdir`, the comment names `no-tmpdir`                   |

## Verification

`run-smoke.sh` is in no CI job: run locally with `/bin/bash` (3.2) at each step and again in the diff review.

- Red `test(scripts): B1.88 run-smoke probes the run's own TMPDIR` (body "Red because claude_run passes the host's
  TMPDIR"): R1–R18 ok, R19 FAIL (all 6 cases), "1 of 19 probes FAILED".
- Green `chore(scripts): B1.88 run.sh gives each claude -p run its own TMPDIR`: "19 probes OK", no
  `/tmp/level-up-lab-run.*` left. `hook-smoke.sh` 726 OK before and after (CI `test`).
- Prototype on 296afed: both hold; 5 mutants of the fix (no `on_signal` removal, no removal after `wait`, one shared
  directory, no `TMPDIR=` on the env line, no stop on `mktemp` failure) each fail R19 only.
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

Plan review: pending · Plan approved by: · Rounds: 1
