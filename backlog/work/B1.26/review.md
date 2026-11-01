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
