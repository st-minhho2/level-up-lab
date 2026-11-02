# B1.55 review

## Plan review (round 1)

SCOPE: tooling (no §; `scripts/ci/`, `scripts/agent/`, `.claude/`, `.github/`). Plan reviewed: `97d4ca1 docs(backlog):
B1.55 plan wording`. Contract: the card's Acceptance (`backlog/plan/E1-todos.md` ### B1.55), D-27, D-28, D-29, D-19.
The orchestrator's hard requirement: the guards accept the D-27 approval and nothing looser. An agent must not be able
to self-approve a high-tier plan, a card without an `agent-ready` issue, or an issue `eligible.sh` rejects, and each
refusal is probed.

`scripts/agent/tier.sh backlog/work/B1.55/plan.md` → `high` (matches the plan's own claim: the lead's gate,
`config-change-approved`).

| Check                                                                          | Result                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the card                                     | pass: all 10 rows are named by the Acceptance or its probes. `run.sh` and `scripts/CLAUDE.md` are left out because B1.58 holds them                                                                                                                        |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | n/a: bash only, no `src/`                                                                                                                                                                                                                                  |
| plan follows `advice.md` or states the deviation                               | pass: tier quick, advisor skipped, stated in line 3                                                                                                                                                                                                        |
| ≤ 7 criteria, every Then measurable                                            | fail: every probe names an exit code, but "nothing looser" does not hold (reasons 1, 2, 3) and the metrics clause "a probe each" is only partly covered (reason 4)                                                                                         |
| verification lists exact commands with expected numbers                        | fail: reason 7 (and the CI path is unproven, reason 5)                                                                                                                                                                                                     |
| work breakdown skeleton → red → green → map → review                           | pass: red → green → review. Skeleton and map are n/a for tooling. The `test(scripts): …` subject without `(red)` follows the B1.43 precedent (no `*.test.ts`)                                                                                              |
| `Lead approves spec` box                                                       | n/a: no §. Tier high, so the lead's `approve` at the gate is the approval. `Plan approved by:` is empty and the reviewer did not write it                                                                                                                  |
| no settled D-n contradicted                                                    | fail: D-27 says "Cards run interactively … keep the plan gate", but the guards accept a valid D-27 line whoever writes it, including an interactive session (reason 1). D-19 is stated. D-26 is untouched (CI reads the issue but does not run the runner) |
| `scripts/next-task.sh --check B1.55`                                           | pass: `[next-task] B1.55: no overlap with any Doing or Review card`                                                                                                                                                                                        |

Verdict: changes requested

1. **The D-27 check is opt-in, so the hard requirement does not hold.** `plan-files.sh` checks the approval only when
   the plan.md at the approval commit contains the text "Plan approved by: reviewer". Without that text it takes
   "today's lead path", which accepts any `docs(backlog): <card> plan approved` subject. Nothing else in the tree reads
   the line: `grep -rn "Plan approved by\|plan approved" .claude/hooks lefthook.yml scripts/ci .github` finds only
   plan-scope.sh's block message and the PR template. TRIGGER: in a run on a high-tier plan, an issue without the
   label, or an issue `eligible.sh` refuses, dev-lead writes `Plan approved by: lead, 2026-11-02`, writes
   `Plan approved by:reviewer (…)` (no space, so no trigger text), or writes no line at all. In each case it then
   commits `docs(backlog): <card> plan approved`. WRONG BEHAVIOUR: plan-scope.sh, check-plan-scope.sh, plan-files.sh
   and every metric accept it. S17–S23 probe only plans that opt in. "A run never writes the lead's line" is role
   text, and `run.sh`'s ALLOW list includes bare `Bash`, so the run can `git commit` anything. The stated cost "the
   lead's own line stays unverifiable" does not say that every D-27 refusal can be bypassed this way. The lead must
   choose one of these at the gate:
   - (a) On a run's branch (`branch_of` in run.sh always names it `<chore|feat>/<card>-agent`, which the hook sees
     and CI sees through `GITHUB_HEAD_REF`), accept only a valid D-27 line. Probes: a lead line on a `-agent` branch
     → blocked (S24), and the same in CI (C10). Cost: a high-tier agent card cannot continue on its `-agent` branch
     after the lead approves interactively until B1.56 adds a verifiable lead form. The lead finishes it on an
     ordinary branch or waits for B1.56.
   - (b) The lead accepts the bypass as written, in "The lead decides at this gate". Add a probe that pins it as
     known-open (a lead line on a high-tier plan → exit 0, "until B1.56") so that B1.56 has to flip it, and have the
     lead restate the card's "nothing looser" to match.
   - Either way, state that a D-27 line written in an interactive session is accepted (D-27 says such sessions keep
     the gate), or refuse it.

   A `RUNNER_CHILD`-only rule in the hook is weaker: CI cannot see it, and it would block run.sh's documented resume
   after the lead approves interactively.

2. **The trigger and the "exactly, once" rule fail on B1.55's own plan.** The plan detects a D-27 approval by "a
   'Plan approved by: reviewer' text". `grep -n "Plan approved by: reviewer" backlog/work/B1.55/plan.md` → lines 6, 32, 33. TRIGGER: the lead approves B1.55, which appends `Plan approved by: lead, <date>` to line 63. After the green
   edit to plan-files.sh lands in the worktree, plan-files.sh B1.55 sees the text three times. WRONG BEHAVIOUR: it
   exits 5, so plan-scope.sh blocks every further non-paperwork edit on this branch, and check-plan-scope.sh fails
   B1.55's own PR with every changed script listed "outside (plan-files exit 5)". B1.56 and B1.57, whose plans will
   quote the line, trip the same way. A second problem: the approval sits inside the status line `Plan review: … ·
Plan approved by: … · Rounds: n` (line 63), so "a line that reads exactly …" never matches where Loop 4/5 write
   it. Required: define the field (for example, the `Plan approved by:` field of the last line that starts with
   `Plan review:`, compared as a whole field). Add a probe where a plan quotes the D-27 line in prose and carries a
   lead field → exit 0.

3. **The review check proves text, not a reviewer, and not this plan.** dev-lead's path-guard allows `backlog/*`
   (`.claude/agents/dev-lead.md:11`), which includes `backlog/work/<card>/review.md`. dev-lead never needs to write
   that file (Loop 4 fills only plan.md). TRIGGER 1: dev-lead appends `## Plan review (round 3)` and
   `Verdict: approved` itself. TRIGGER 2: the reviewer approves round 1, then dev-lead adds a medium-tier file to the
   Files table and commits the approval. WRONG BEHAVIOUR: both pass. D-27's "a plan the reviewer approved" is not what
   gets checked. Required: add `'!backlog/work/*/review.md'` to dev-lead's path-guard (dev-lead.md is already in
   Files). Require the plan.md at the approval commit to equal the plan.md at the commit that added the last
   `## Plan review` section, status line excepted. Or state both as costs, and also state that bare `Bash` in a run
   still writes review.md.

4. **Metrics: the card asks for "a probe each" and the plan probes two of four.** M26 (lead-time) already passes and
   does not test "nothing looser". `wait-time.sh` (line 34) and `throughput.sh` (line 27) match the approval subject
   only and get no probe. `wait-time.sh` reports the plan gate as the lead's wait (approval commit − its first
   parent). TRIGGER: a D-27 card whose approval commit follows the "plan review approved" commit by about 30 s.
   WRONG BEHAVIOUR: about 0 min is counted as lead wait, which lowers the median plan-gate wait that D-29 compares
   against batches 6–7. Required: say what a D-27 approval contributes to wait-time (excluding it is recommended) and
   to throughput, add a probe each (M28, M29), and add `scripts/metrics/wait-time.sh` to Files if it changes. Also:
   plan-deviations now reaches `eligible.sh` live through plan-files for every D-27 card at `FETCH_HEAD`. A label
   removed or a collaborator downgraded after the merge turns an already-merged PR into "outside" retroactively.
   State this, or give that path a mode without the live check.

5. **The CI path is unproven before the first D-27 PR depends on it.** In CI, `eligible.sh` calls
   `repos/{owner}/{repo}/collaborators/<login>/permission` and the issue events endpoint with the job's
   `GITHUB_TOKEN` (`contents: read` + `issues: read`). B1.55's own PR is not a D-27 card, so its CI never runs
   `eligible.sh`, and the "Live, read-only" checks use the lead's token. TRIGGER: the first agent PR with a reviewer
   line. WRONG BEHAVIOUR (plausible): if an installation token without push access is refused there, every D-27 PR's
   `guards` fails closed, and that is found only after merge. Also, `apt-get install gh` in `node:24-bookworm` needs
   `apt-get update` first, and bookworm ships gh 2.23. Required: Verification adds a CI-side proof in this PR's run,
   for example a step that runs `scripts/agent/eligible.sh 166 B1.41` with the job token → exit 0, visible in the
   log. Name the exact apt commands.

6. **Acceptance clause 1 ("in a run … continues") is not reached, and no card owns the rest.** `run.sh:195–198` tells
   every run "At the plan gate print the gate line and stop", and its ALLOW list lacks `scripts/pr-step.sh`. The plan
   leaves both to "follow-ups after B1.58", but the B1.58 and B1.59 cards (`origin/docs/B1.58-card`) mention neither,
   and Verification has no headless run. TRIGGER: `run.sh <n>` on a low-tier agent-ready card after this merges.
   WRONG BEHAVIOUR: the prompt and the new dev-lead text disagree about the gate. Nothing tested decides which one
   wins, and no PR can be pushed. Required: name the card that changes the prompt and the allow list (file it, or
   have the lead add it to B1.58). State that B1.55 closes on role text and probes with clause 1 unproven in a run,
   or keep B1.55 Partial until that card lands.

7. **Verification numbers.** Required: spell out each command (`scripts/hook-smoke.sh`,
   `/bin/bash scripts/hook-smoke.sh`, `scripts/agent/eligible-smoke.sh`, `scripts/metrics-smoke.sh`) and give its
   expected count. "Full hook-smoke" has no count. Give the green count for
   `grep -c agent-ready .claude/agents/dev-lead.md .claude/skills/work-next/SKILL.md` (the red count, 0, is the
   only one stated).
