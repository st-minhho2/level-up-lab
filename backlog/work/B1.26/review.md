# B1.26 review

## Plan review (round 1)

Scope: tooling (`scripts/pr-step.sh`, `scripts/pr-step-smoke.sh`, `.claude/` docs, `backlog/CLAUDE.md`), no §. Plan at
`6622ef9`.

| Check                                                                | Result                                                                                                                                                                 |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                       | pass: all ten rows serve the card's Acceptance; none is B1.24's (`guard-bash.sh`, `hook-smoke.sh`) or B1.27's (`next-task.sh`)                                         |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | pass: n/a (no `src/`); the `open` signature is pasted, not prose                                                                                                       |
| follows `advice.md` or states the deviation                          | pass: tooling card, advisor skipped and said so                                                                                                                        |
| ≤ 7 criteria, every Then measurable                                  | pass: one Acceptance, measured by R11–R14 and R1–R10 with exact gh log lines                                                                                           |
| verification: exact commands, expected numbers                       | fail: reason 2                                                                                                                                                         |
| work breakdown, convention subjects                                  | pass: `test(scripts)` → `fix(scripts)` → reviewer → label, the B1.23/B1.25 tooling precedent; no map row (no feature)                                                  |
| `Lead approves spec` box                                             | pass: n/a (no section); `Plan approved by:` empty, left for the lead                                                                                                   |
| no settled D-n contradicted                                          | pass: D-19 label named with its protected paths (`scripts/pr-step.sh`, `.claude/agents`, `skills`, `docs`); `backlog/CLAUDE.md`, `scripts/CLAUDE.md` are not protected |
| `next-task.sh --check`                                               | pass: `[next-task] B1.26: no overlap with any Doing or Review card`                                                                                                    |
| lane covers every closing PR                                         | fail: reason 1                                                                                                                                                         |

Checked and true: `guard-bash.sh` rule 5 (lines 69–96) allows any step name, so `open` needs no hook change; lane PRs
#113, #115, #117, #118, #119 have `isDraft: false`; `check-plan-scope.sh` treats `backlog/*` as paperwork; baseline
`scripts/pr-step-smoke.sh` → `[pr-step-smoke] 10 ok, 0 FAIL`, `scripts/hook-smoke.sh` → `hook-smoke: 309 probes OK`.
The red count "11 ok, 3 FAIL" holds: R13 passes at the test commit because `open` is an unknown step there (the plan
says so).

Reasons:

1. **Partial closing PRs are left with no route and still hit the bug.** `backlog/CLAUDE.md` "Closing a card" step 4
   is the `Partial — merged <sha>, pending <what>` close, and it has happened: #105, branch `docs/B1.23-partial`, title
   `docs(backlog): B1.23 partial -- merged, live check pending`. The plan's `open` accepts only `docs/<card>-done` and
   `docs/<card>-card`, and `draft` is refused only on those two. On `docs/<card>-partial` the branch still matches
   `pr-step.sh:17`, so `draft` opens the PR with the feature body. Probed on a throwaway repo with today's wrapper:
   `draft 'docs(backlog): B9.1 partial -- merged, live check pending'` on `docs/B9.1-partial` → rc 0, gh log
   `pr create --draft … --body-file backlog/work/B9.1/pr-body.md`. Nothing in the plan changes that line. This matters
   for this card too: B1.23's plan made a failed live check mean Partial, and this plan's own live check can fail the
   same way. Either add `docs/<card>-partial` to `open` (with its title rule, the closing body file, a refused `draft`,
   and an R11/R14 probe), or write down that a Partial close stays a hand `gh pr create`, so the lead accepts that
   cost at the gate.
2. **Verification lines are not exact.** `scripts/hook-smoke.sh | tail -1 # unchanged, 0 FAIL`: the real last line is
   `hook-smoke: 309 probes OK`, and the script never prints "0 FAIL". Name the expected line. Because B1.24 changes
   `hook-smoke.sh` in parallel, say "309 probes OK, or B1.24's count once it merges". "(bash 5 and /bin/bash 3.2)" names
   no command. `pr-step-smoke.sh` runs the wrapper through its `#!/usr/bin/env bash` shebang, so `/bin/bash
scripts/pr-step-smoke.sh` runs the probes under 3.2 but the wrapper under whatever `bash` is first on `PATH`. Give
   the command that runs `pr-step.sh` itself under 3.2, or drop the claim.

Not blocking. The plan is 61 lines, against the ≈ 40-line one-screen limit in `planning.md`. The lead accepted 57 for
B1.23; the length is the lead's call again.

Verdict: changes requested

## Plan review (round 2)

Scope: tooling, no §. Plan at `7aba784` (64 lines).

| Check                                                                | Result                                                                                                                                                                                      |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                       | pass: same ten rows; none is B1.24's (`guard-bash.sh`, `hook-smoke.sh`) or B1.27's (`next-task.sh`)                                                                                         |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | pass: n/a (no `src/`); `open` signature, per-branch title rule and body path pasted                                                                                                         |
| follows `advice.md` or states the deviation                          | pass: tooling card, advisor skipped and said so                                                                                                                                             |
| ≤ 7 criteria, every Then measurable                                  | pass: one Acceptance, measured by R11–R14 (exact gh log lines, exit 3 + `pr-step:` + no gh call) and R1–R10                                                                                 |
| verification: exact commands, expected numbers                       | pass: round 1 reason 2 resolved (see below)                                                                                                                                                 |
| work breakdown, convention subjects                                  | pass: `test(scripts)` → `fix(scripts)` → reviewer → label; no map row (no feature)                                                                                                          |
| `Lead approves spec` box                                             | pass: n/a (no section); `Plan approved by:` empty, left for the lead                                                                                                                        |
| no settled D-n contradicted                                          | pass: D-19 label named; `scripts/ci/check-config-change.sh` PROTECTED covers `scripts/pr-step.sh` and `.claude/(agents\|skills\|docs)/`; `pr-step-smoke.sh` and the two `CLAUDE.md` are not |
| `next-task.sh --check`                                               | pass: `[next-task] B1.26: no overlap with any Doing or Review card`                                                                                                                         |
| lane covers every closing PR                                         | pass: round 1 reason 1 resolved (see below)                                                                                                                                                 |

Round 1 reasons:

1. Resolved. `docs/<card>-partial` is in `open` with its own title rule, the closing body, a refused `draft` (R14) and an
   R11 probe. The rule `^docs\(backlog\): <card> partial -- [ -~]+$` accepts #105's real title
   `docs(backlog): B1.23 partial -- merged, live check pending`.
2. Resolved. `hook-smoke.sh` names `hook-smoke: 309 probes OK` (ran: matches). `PATH="/bin:$PATH" /bin/bash
scripts/pr-step-smoke.sh` does run the wrapper under 3.2: `run()` prepends only the shim dir, so `#!/usr/bin/env bash`
   resolves to `/bin/bash` (probed: `PATH="/bin:$PATH" /usr/bin/env bash` → `3.2.57(1)-release`; baseline run → `[pr-step-smoke]
10 ok, 0 FAIL`).

Checked and true: `guard-bash.sh` rule 5 (`PR_STEP_PLAIN`) accepts any step word and a double-quoted title without
`$`, backtick, backslash or `!`, so `open` needs no hook change; every lane PR #42–#119 has `isDraft: false`, so `open` without `--draft`
matches practice; `check-plan-scope.sh` last line today `[check-plan-scope] OK: … changes only paperwork …`,
`check-backlog.sh` → `[check-backlog] OK: README matches the cards`. Red count "11 ok, 3 FAIL" holds: R13's refusals
pass at the test commit only because `open` is an unknown step there (stated in the plan).

Costs the lead accepts at the gate (not blocking):

1. **A stale closing body is still possible after a Partial close.** `closing-pr-body.md` is committed and stays on
   `main`. A card closed Partial (this card's own live check names that route) and later Done reuses the path: if the
   Done branch does not rewrite it, `open "docs(backlog): <card> done"` on `docs/<card>-done` passes all three body
   checks and opens with the Partial PR's body, the same stale-body class the card's Test line describes. Nothing in
   the plan's checks sees freshness. A one-line refusal when the file is unchanged against `origin/main`
   (`git diff --quiet origin/main...HEAD -- "$rel"`) would close it, with one R13 probe; the lead decides.
2. **"(bash 5)" is not run on this machine.** `command -v bash` → `/bin/bash` 3.2.57, no `/opt/homebrew/bin/bash` or
   `/usr/local/bin/bash`; neither smoke runs in `.github/workflows/`. Both verification lines therefore run 3.2; the
   bash 5 claim stays `[unverified]` unless the diff review names a bash 5 binary.
3. **Branch names are enforced but not written down.** `open` accepts only `docs/<card>-done|-partial|-card`;
   `backlog/CLAUDE.md` names no branch for either lane, and older filings used `docs/<card>-file-card` (#45–#73),
   where `open` refuses. The planned Filing step 5 / Closing step 6 rows should name the branch. Likewise #116's
   title `docs(backlog): B1.27 card …` would be refused by the filing rule (the lane's step 5 format governs).
4. **Out of the wrapper still:** epic filings (`docs/E4-cards`), D-n, metrics and guide PRs (no card id in the branch)
   stay hand `gh pr create`; the card's Acceptance does not cover them.
5. R13 lists refused titles without naming the branch each runs on; a cross-lane probe (`open 'docs(backlog): B9.1
done'` on `docs/B9.1-partial`) would pin the per-branch rule. Length 64 lines against ≈ 40 (`planning.md`), up
   from 61; the lead's call, as for B1.23.

Verdict: approved

## Diff review (round 1)

Range `origin/main...HEAD` (test `cbaa667`, fix `7eae2bb`), 10 files, all in the plan's Files table.

### Commands (last line each)

| Command                                                | Result                                                                                                                                                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`                                            | `All matched files use Prettier code style!` (0 errors)                                                                                                                                                |
| `pnpm typecheck`                                       | `tsc --noEmit`, no output (0 errors)                                                                                                                                                                   |
| `pnpm test`                                            | `Tests  202 passed (202)`                                                                                                                                                                              |
| `pnpm test:e2e`                                        | `43 passed (1.0m)`                                                                                                                                                                                     |
| `pnpm test:mutation`                                   | `Final mutation score of 93.40 is greater than or equal to break threshold 70` (no `src/` change)                                                                                                      |
| `scripts/pr-step-smoke.sh`                             | `[pr-step-smoke] 14 ok, 0 FAIL`                                                                                                                                                                        |
| `PATH="/bin:$PATH" /bin/bash scripts/pr-step-smoke.sh` | `[pr-step-smoke] 14 ok, 0 FAIL` (bash 3.2.57; no bash 5 on this machine, as round 2 noted)                                                                                                             |
| smoke at `cbaa667` (test commit tree)                  | `[pr-step-smoke] 11 ok, 3 FAIL` (R11 R12 R14), as planned                                                                                                                                              |
| `scripts/hook-smoke.sh`                                | `hook-smoke: 309 probes OK`                                                                                                                                                                            |
| `check-suppressions.sh`                                | `OK: no new suppressions`                                                                                                                                                                              |
| `check-config-change.sh`                               | exit 1: `.claude/agents/dev-lead.md`, `.claude/docs/git-workflow.md`, `.claude/skills/work-next/SKILL.md`, `scripts/pr-step.sh` without `config-change-approved` (expected: D-19 label at PR creation) |
| `check-feat-commits.sh`                                | `OK: no feat commit touches tests`                                                                                                                                                                     |
| `check-ac-coverage.sh`                                 | `OK: every criterion of a shipped section has a test`                                                                                                                                                  |
| `check-spec-sections.sh`                               | `OK: sections cited: 1 … 22`                                                                                                                                                                           |
| `check-features-map.sh`                                | `OK`                                                                                                                                                                                                   |
| `check-plan-scope.sh`                                  | `OK: feat/B1.26-pr-step-closing stays inside the approved plan of B1.26`                                                                                                                               |
| `check-backlog.sh`                                     | `OK: README matches the cards`                                                                                                                                                                         |
| `verify-red.sh B1.26`                                  | `no 'test(<pkg>): B1.26 … (red)' commit` (explained: the plan's Steps state "no `(red)` marker: tooling"; red shown by the smoke run at `cbaa667` above)                                               |

### Checklist

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Acceptance: closing and filing PRs open through the wrapper from a lane body file | pass: R11 (`-done`, `-partial`), R12 (`-card`) exact gh lines                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Acceptance: `push`, `draft`, `ready` on a feature branch unchanged                | pass: R1–R10 green; `draft`'s body checks moved into `body_file` verbatim                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| No test weakened after the test commit                                            | pass: `git log --first-parent --no-merges cbaa667..HEAD -- '*.test.*' e2e/ scripts/pr-step-smoke.sh` empty; no merges                                                                                                                                                                                                                                                                                                                                                                                              |
| Every changed file in `plan.md`                                                   | pass: 10 of 10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Interfaces match the plan                                                         | pass: `open "<title>"`, per-lane titles, body path, `git diff --quiet origin/main...HEAD -- <rel>` exit 1, `draft` refused on lanes                                                                                                                                                                                                                                                                                                                                                                                |
| Each R13 refusal fails for its own reason                                         | pass: instrumented copy prints the message per probe; each of the 13 hits its intended check (lane, title, length, newline, regular file, link, dir, freshness)                                                                                                                                                                                                                                                                                                                                                    |
| Revert probes (copy, smoke re-run)                                                | freshness check removed → R13 FAIL · `draft` lane refusal removed → R14 FAIL · length check removed or `-le 81` → R13 FAIL · `open` lane guard removed → R13 FAIL · `body_file` removed from `open` → R13 FAIL · `-card` body swapped to closing → R12 FAIL. Survivors: `changed -eq 1` → `-ne 0` (no missing-`origin/main` probe), `c="$card"` unescaped dot (no `B9x1` title probe), lane regex without `$` (no `docs/B9.1-done-x` probe), `open`'s newline check removed (the anchored regex refuses it anyway) |
| No secret, no suppression, no `src/`/`prisma/` change                             | pass                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Lane docs vs `backlog/CLAUDE.md` Filing step 4 "nothing else"                     | pass: step 4 forbids `spec/`, `src/`, tests, `00-decisions.md`, `docs/`, `.claude/`; step 5 adds `work/<card>/filing-pr-body.md` to the checklist itself, `check-plan-scope.sh` treats `backlog/*` as paperwork                                                                                                                                                                                                                                                                                                    |
| Title length under a non-UTF-8 locale                                             | pass: titles are printable ASCII by regex or exact match; `[[ "é✓" =~ ^[\ -~]+$ ]]` → no match under `en_US.UTF-8` and `C` (bash 3.2, macOS libc); glibc range behaviour `[unverified]`                                                                                                                                                                                                                                                                                                                            |

### Findings

```
[1] KIND: correctness
    WHERE: .claude/agents/dev-lead.md:86-87
    DEFECT: the after-merge instruction names `docs/<card>-done` "(or `-partial`)" but gives only the title
            `docs(backlog): <card> done`, which `open` refuses on a `-partial` branch.
    TRIGGER: dev-lead closes a merged-but-unmeasured card on `docs/B9.1-partial` and runs, as written,
             `scripts/pr-step.sh open "docs(backlog): B9.1 done"`.
    WRONG BEHAVIOUR: exit 3 "title must read 'docs(backlog): B9.1 partial -- <what is pending>'"; by the same
             paragraph a refusal is reported, never worked around, so the Partial closing PR stalls for the lead
             instead of opening (backlog/CLAUDE.md Closing step 6 has the right title; the agent brief does not).
    CONFIDENCE: confirmed (ran it on a throwaway repo: rc=3 with that message)

[2] KIND: correctness (non-blocking: matches the approved interface)
    WHERE: scripts/pr-step.sh:76-77
    DEFECT: the freshness check compares commits only, so a body edited in the worktree after the lane commit is
            sent as the PR body while the committed body the reviewer read stays different.
    TRIGGER: on `docs/B9.1-partial` with `closing-pr-body.md` committed, overwrite it uncommitted, run
             `open 'docs(backlog): B9.1 partial -- x'`.
    WRONG BEHAVIOUR: exit 0, PR opened with the uncommitted text; the plan's "the body lands in the lane's one
             commit: the reviewer sees it" no longer holds. `git diff --quiet HEAD -- "$rel"` (exit 0 required)
             would close it; `draft` has the same gap today.
    CONFIDENCE: confirmed (ran it: rc=0, PR number printed)
```

Also observed, not findings: with `refs/remotes/origin/main` missing, `open` refuses (rc 3, fail-closed) but says
"unchanged since origin/main", which misnames the cause. The four survivors above are unpinned edges, none
reachable by a lane title the docs prescribe.

Verdict: back to code-writer ([1]: give the `-partial` title in `dev-lead.md`, or point at Closing step 6 for it;
[2] is the lead's call, not required for this round).

Riskiest unfalsified: `[ -~]` as a bracket range under a glibc UTF-8 locale (a Linux session host) could admit non-ASCII
into `-partial`/`-card` titles, where `${#title}` then counts characters; not runnable on this machine.
