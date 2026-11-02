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

## Plan review (round 2)

SCOPE: tooling (no §). Plan reviewed: `73f67db docs(backlog): B1.55 plan round 2 and plan review round 1`. Contract:
the card's Acceptance, D-27, D-28, D-29, D-19, and the orchestrator's hard requirement (no self-approval of a
high-tier plan, a card without an `agent-ready` issue, or an issue `eligible.sh` rejects; each refusal probed).
`scripts/agent/tier.sh backlog/work/B1.55/plan.md` → `high`. Baselines run here: `scripts/hook-smoke.sh` →
`hook-smoke: 476 probes OK`; `scripts/agent/eligible-smoke.sh` → `9 probes OK`; `scripts/metrics-smoke.sh` →
`[metrics-smoke] 23 ok, 0 FAIL` (the plan's 488 / 10 / 27 start from the right bases).

Round 1 reasons: #1 option (a) taken, and interactive D-27 fields are refused (addressed, but see reason 1). #2 the
field is defined and S25 probes prose (addressed). #3 the path-guard and "unchanged since review" checks were added
(addressed for Edit/Write; see reason 2). #4 wait-time and plan-deviations are handled, M27 and M29 added (addressed).
#5 the apt commands are named; the proof step is partial (reason 5). #6 a follow-up is filed and B1.55 closes Partial
(addressed, but the id is taken, reason 4). #7 the counts are given (addressed).

| Check                                                                          | Result                                                                                                                                                 |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the card                                     | pass: 13 rows, each named by the Acceptance, a probe or a round 1 reason; `run.sh` and `scripts/CLAUDE.md` (held by B1.58) are absent                  |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | n/a: bash only, no `src/`                                                                                                                              |
| plan follows `advice.md` or states the deviation                               | pass: tier quick, no advisor, stated                                                                                                                   |
| ≤ 7 criteria, every Then measurable                                            | fail: "nothing looser" still does not hold (reasons 1, 3)                                                                                              |
| verification lists exact commands with expected numbers                        | pass, with reason 5 (the CI proof leaves out one endpoint) and note b                                                                                  |
| work breakdown red → green → review                                            | pass (skeleton and map are n/a for tooling)                                                                                                            |
| `Lead approves spec` box                                                       | n/a: no §. Tier high, so the lead's `approve` is the gate. `Plan approved by:` is empty, and this review did not write it                              |
| no settled D-n contradicted                                                    | fail: D-27's "a plan the reviewer approved" holds only against Edit/Write, and the plan's cost line says CI covers the rest, which is false (reason 2) |
| `scripts/next-task.sh --check B1.55`                                           | pass: `[next-task] B1.55: no overlap with any Doing or Review card`                                                                                    |

Verdict: changes requested

1. **The run chooses its own branch name, so the Rule can be sidestepped and the hard requirement fails.** The runner
   check applies only on `<prefix>/<card>-agent`. Off that branch, a non-`reviewer` field "keeps today's lead path",
   and `plan-files.sh:27-37` accepts that path from the commit subject alone. `run.sh:33` allows
   `Bash(scripts/worktree.sh *)`, `Bash(git *)` and bare `Bash`. `plan-scope.sh:21-22` and
   `check-plan-scope.sh:12-13` take the card from any `<prefix>/B<e>.<n>…` branch. TRIGGER: a run on issue #n for
   a high-tier card B1.x runs `scripts/worktree.sh chore/B1.x-resume` (or `git switch -c chore/B1.x-b`). It writes
   `Plan approved by: lead, 2026-11-02` into the status line and commits `docs(backlog): B1.x plan approved`. It then
   edits the plan's files with Edit/Write and opens the PR with bare-Bash `gh pr create`. WRONG BEHAVIOUR: the hook
   sees a branch that is not `-agent` and takes the lead path → exit 0. CI's `GITHUB_HEAD_REF` is not `-agent` →
   green. The same steps work for an issue without the label and for one `eligible.sh` refuses. CONFIDENCE:
   confirmed by trace (the plan's own Rule, plus the lines cited). Required, one of these:
   - (a) The hook applies the runner Rule when `RUNNER_CHILD` is set **or** the branch is `-agent`. Hooks inherit
     claude's environment, and a run's Bash cannot change it for them. CI applies the Rule on any card branch whose
     card is named in the "Card id" field of an open `agent-ready` issue. Probe each: `RUNNER_CHILD=1` on a branch
     that is not `-agent`, with a lead field → blocked; in CI, such a branch with a labeled issue naming the card →
     fail. Cost to state: to approve that card interactively, the lead first removes the label (or waits for B1.56).
     CI gains one `gh` call on every card branch.
   - (b) The hook half of (a) only. Then state that a run which moves to a branch that is not `-agent` and writes by
     Bash gets a forged lead approval past CI, so only the lead's PR review catches it (by the head branch). The lead
     restates "nothing looser" to match.

2. **"Bash writes skip the hook (CI catches them)" is false for the reviewer's verdict.** `check-plan-scope.sh:24`
   passes every `backlog/*` path, and a run's bare `Bash` writes `review.md`. TRIGGER 1: the reviewer requests
   changes on a medium-tier plan for an eligible issue. dev-lead runs
   `printf '\n## Plan review (round 3)\n\nVerdict: approved\n' >> backlog/work/B1.x/review.md`, commits it, and
   writes the D-27 field. TRIGGER 2: after the reviewer approves, dev-lead edits plan.md's Files by Bash, appends a
   blank line to review.md in the same commit, and writes the field. WRONG BEHAVIOUR: in both cases tier, last round,
   "unchanged since the last commit touching review.md" and `eligible.sh` all pass, so no reviewer approved this plan
   (D-27). CONFIDENCE: confirmed by trace. Neither trigger is in the hard requirement's list, because tier and issue
   are still checked. Required: correct the cost line, and list "a run can forge the plan review by Bash; until
   B1.58's sandbox, D-27's reviewer condition is held by role text, not a guard" among the costs the lead accepts.

3. **A closed issue still approves.** `eligible.sh:25-47` never reads `.state`. I ran `scripts/agent/eligible.sh 166`
   on the closed issue #166 → exit 0. TRIGGER: the lead closes issue #n to withdraw card B1.x and leaves the label
   on. The run already on `chore/B1.x-agent` (or a later `run.sh n`) writes the D-27 field citing #n. WRONG
   BEHAVIOUR: the field is accepted although no open `agent-ready` issue backs the card. CONFIDENCE: confirmed (ran
   it). Required: in the `<card>` mode, refuse an issue whose state is not open (E10 gains "closed → exit 1"; the
   `--offline` metrics path keeps merged verdicts stable). Or state that only removing the label withdraws an
   approval. If refused, Verification's live `eligible.sh 166 B1.41` exit 0 becomes exit 1: pick an open labeled
   issue or drop that line.

4. **B1.61 is taken.** `backlog/plan/E1-todos.md:823` (also on `origin/main`) is
   `### B1.61 · The runner's deny list spares commit messages, and TERM ends the tools a run started`, and ids are
   never reused (`backlog/CLAUDE.md`). TRIGGER: dev-lead files the follow-up as B1.61 and closes B1.55 as
   `Partial — pending B1.61`. WRONG BEHAVIOUR: either a duplicate id, or a Partial pointer that names an unrelated
   card. CONFIDENCE: confirmed. Required: use the next free id when filing (B1.62 today; `origin/docs/B1.58-card`
   adds none past B1.59), or fold the change into the existing B1.61, which already edits `run.sh`. Also restate the
   follow-up's content. `run.sh:33` holds bare `Bash`, which allows every command, `scripts/pr-step.sh` included, so
   the allow list does not stop a run. Only the prompt sentence at `run.sh:197` does.

5. **The CI proof leaves out the endpoint `eligible.sh` paginates.** The planned step reads
   `collaborators/<actor>/permission` and `issues/<pr>`. `eligible.sh:29` also calls
   `issues/<n>/events --paginate`, and the new `<card>` mode reads `.body`. TRIGGER: the first D-27 PR's `guards`
   job. WRONG BEHAVIOUR: if the job token is refused on events, every D-27 PR fails closed, and this is found only
   after merge. CONFIDENCE: plausible (I did not run it with an Actions token). Required: the step runs
   `scripts/agent/eligible.sh <open labeled issue> <its card>` → exit 0 and the same issue with `B1.55` → exit 1 with
   the job token, both visible in the log.

Notes (not blocking; state them or leave them):

- a. A `gh` call that hangs lets an Edit/Write through. `settings.json:41` sets no timeout on plan-scope, and Claude
  Code treats a timed-out PreToolUse hook as a non-blocking error. CI still refuses the change. "Offline = blocked"
  holds only when `gh` fails fast. CONFIDENCE: plausible.
- b. 488 = 476 + 12 assumes one `ok` line per id. S24 carries three cases and S25 two, and S1–S15 print once per
  layout (54 lines today). State the lines per id, or the count will drift.
- c. The Interfaces do not say how `wait-time.sh` recognises a D-27 approval (plan-files `--run --offline` exit 0,
  or a field prefix).

This was round 2 of at most 2. A further round goes to the lead as "Waiting on human": the lead decides reasons 1–4
at the gate.
