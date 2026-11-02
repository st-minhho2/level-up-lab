# B1.44 review

## Plan review (round 1)

SCOPE: tooling (no §; `scripts/agent/`, `scripts/ci/`). Plan reviewed: `7f4bfb4 docs(backlog): B1.44 plan`. Contract:
B1.44's Acceptance as amended by B1.47 (`origin/docs/B1.47-runner-acceptance`, PR #162, open and not merged), the
B1.42 spike's "What the runner (B1.44) must do differently", D-19 and D-26 to D-29. I checked these facts without
editing anything:

- `scripts/next-task.sh --check B1.44` → `[next-task] B1.44: no overlap with any Doing or Review card` (exit 0).
- `pnpm test` → `Tests  202 passed (202)`, which matches the plan's expected count.
- `.claude/settings.json` defines hooks on `PostToolUse PreToolUse SessionStart Stop SubagentStop`. Every agent's
  frontmatter defines only `PreToolUse`.
- `dev-lead.md` step 5 opens the draft PR only after `approve`. Its gate line ("Plan for <card> is ready") and its
  ready line ("PR for <card> is ready for the lead") match the plan's outcome strings.
- `next-task.sh --claim` counts any branch without a PR as Doing (WIP 3). It does not check the card's eligibility.
- I traced the plan's tier rule under bash with `plan_lists` from `scripts/ci/lib.sh` and the current `PROTECTED`
  regex. The results are in reason 1.

| Check                                                                             | Result                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: tooling, so there is no map row. `tier.sh` and `run.sh` and their smokes are what the Acceptance names. The `lib.sh`, `check-config-change.sh` and `plan-files.sh` changes support `tier.sh`. No file overlaps with B1.51 or B1.55–B1.57 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no TypeScript, no action, no Prisma. The scripts are bash 3.2 and use the system `jq`, so nothing new is installed                                                                                                                 |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no `advice.md`. The plan says the quick tier skips the advisor (`dev-lead.md` step 2)                                                                                                                                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | fail: one Acceptance clause has no step and no deferral (reason 3). Two clauses are split out without saying how B1.44 closes (reason 5)                                                                                                       |
| verification lists exact commands with expected numbers                           | fail: there is no command for "feature-map-smoke OK with the real tier.sh" (reason 8). Every other line has a number: T1–T8, R1–R12, 202 tests, ≤ 2 live runs at USD 1                                                                         |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: there is no §, so there is no skeleton, map or mutation step. `test(scripts): B1.44 runner and tier probes` without `(red)` follows B1.43 (`ba64613`). The approval commit must be titled `docs(backlog): B1.44 plan approved`           |
| `Lead approves spec` box ticked only by a human                                   | pass (n/a): there is no section. `Plan approved by:` is empty                                                                                                                                                                                  |
| no settled D-n contradicted                                                       | fail: D-28 says a tier is "never chosen by an agent", but globs can make `tier.sh` print low or medium for high paths (reason 1). The scripts that decide the gate are also not protected (reason 2). D-19, D-26 and D-27 are met              |
| `scripts/next-task.sh --check B1.44` says no overlap                              | pass: `[next-task] B1.44: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                   |

### Findings

```
[1] KIND: correctness
    WHERE: backlog/work/B1.44/plan.md:31-34 (tier.sh rule)
    DEFECT: two rules let a glob token come out below high. Only the protected-list rule expands tracked files; the
            prisma/, package.json, pnpm-lock.yaml, .env.example and src/lib/env.ts rules do not. Replacing `*` with
            `x` does not catch a `*` in a middle segment that stands for a protected directory.
    TRIGGER: Files rows `.claude/*/evil.md`, `*/ci/new.sh`, `package*`, `.env*`, `src/lib/*` (traced in bash):
             `.claude/x/evil.md` and `x/ci/new.sh` match no protected pattern, and neither token covers a tracked
             protected file, so both are low. `package*` and `.env*` cover package.json and .env.example only
             through tracked-file expansion, which the plan does not apply to those rules, so both are low.
             `src/lib/*` is medium.
    WRONG BEHAVIOUR: plan_lists lets these rows write `.claude/agents/evil.md`, `scripts/ci/new.sh`, `package.json`
             and `src/lib/env.ts`, which are all D-28 high. Once B1.55 lands, such a plan goes ahead without the
             lead.
    CONFIDENCE: confirmed (traced with plan_lists and the current PROTECTED regex)
```

The fix is the plan's to choose. Two options:

- Apply tracked-file expansion to every high rule.
- Treat a token as high when it could cover a high path. Examples: a `*` in a segment above a protected directory, or
  a `*` at the top level.

Add one T-probe for each trigger above.

```
[2] KIND: security
    WHERE: plan.md Files (scripts/ci/lib.sh row) and scripts/ci/check-config-change.sh:10
    DEFECT: the protected list leaves out scripts/agent/, so the runner's own gate scripts are medium tier.
            These are tier.sh (the D-28 derivation), run.sh (--permission-mode, --allowedTools, the bypass check)
            and eligible.sh (who may label).
    TRIGGER: an agent-ready card whose Files list `scripts/agent/tier.sh`, for example "tier.sh prints low for
             docs/". grep -E PROTECTED on scripts/agent/{tier,run,eligible}.sh → no match.
    WRONG BEHAVIOUR: tier.sh says medium and check-config-change.sh passes without the label. After B1.55 an agent
             can change the rule that decides whether the lead sees its plan, so the tier ends up chosen by an
             agent, which D-28 forbids.
    CONFIDENCE: confirmed (regex run)
```

This card already moves the regex. The lead should decide at this gate between two options:

- Add `scripts/agent/.*` to the regex here.
- Name a card that does it before B1.55.

```
[3] KIND: spec-mismatch
    WHERE: plan.md:36 (RUNNER_CLAUDE default) and the plan as a whole
    DEFECT: one Acceptance clause is missing: "before a new claude version is trusted, one smoke run shows
            dev-lead's frontmatter hooks fire under -p --agent dev-lead". `grep frontmatter plan.md` finds nothing.
            The plan also defaults to the newest app build rather than a fixed one.
    TRIGGER: the desktop app updates itself to a new claude-code/<version>/ directory between two polls.
    WRONG BEHAVIOUR: the next run uses the untested binary. Nothing checks that path-guard.sh (the frontmatter hook
             that confines dev-lead to backlog/) still fires. The log records the version, but nothing compares it.
    CONFIDENCE: confirmed (plan text vs Acceptance)
```

The plan has two ways to fix this:

- Implement it. For example, run.sh refuses a `--version` that is not in a trusted list. Entries are added by a
  smoke mode that asserts a `PreToolUse` hook_response from `path-guard.sh` on an out-of-scope Write. Add an R-probe.
- Defer it to a named card and default to a fixed version until that card lands.

```
[4] KIND: correctness
    WHERE: plan.md:49-50 ("a hook_event the worktree's .claude/settings.json does not define → user-settings")
    DEFECT: the check goes by event name only. The project defines PreToolUse, PostToolUse, SessionStart, Stop and
            SubagentStop, so a user-level hook on any of these five events is never flagged.
    TRIGGER: ~/.claude/settings.json, or a user plugin, with a SessionStart hook. The spike saw exactly this: "two
             SessionStart hooks (a user plugin and a silent one)". The run comes up with
             `--setting-sources project,local` not taking effect, which the spike marked [unverified].
    WRONG BEHAVIOUR: the run continues with the user's hooks. The Acceptance's evidence ("shown by no user-level
             hook event in the stream") is claimed but not shown. The `plugins` check covers plugins only, not hooks
             in the user's settings.json.
    CONFIDENCE: confirmed (settings.json keys vs the rule; spike.md line 52)
```

Possible fixes:

- Compare the hook_started count for each event and tool with what the project and frontmatter define.
- Match on hook names or commands, if the stream carries them.

R8 must probe a user hook on SessionStart, not only on an event the project lacks.

```
[5] KIND: plan-mismatch
    WHERE: plan.md:8-12 (split to B1.58, B1.59)
    DEFECT: the Acceptance names the devcontainer firewall, the Linux build "verified there" and the launchd job.
            The plan moves them out but does not say how B1.44 closes or what runs before the sandbox exists.
    TRIGGER: B1.59 (launchd) is filed without a dependency on B1.58, and it merges first.
    WRONG BEHAVIOUR: polls run every 15 minutes with no one watching, on the host, with no network limit. They have
             the lead's gh token, keychain login and ssh agent. Whatever the agent writes runs through
             Bash(pnpm *): tests, package scripts, `pnpm dlx`. The project hooks (guard-bash, guard-read) are the
             only barrier. Separately, B1.44 cannot close Done against Acceptance text that still names the
             devcontainer and launchd.
    CONFIDENCE: confirmed (card text); the ordering risk is plausible (B1.58 and B1.59 are not filed yet)
```

The plan must state three things:

- B1.44 closes Partial, or its Acceptance is amended (card text, as B1.47 did).
- B1.59 is blocked by B1.58, or the lead explicitly accepts unattended runs on the host without a sandbox.
- The live runs in Verification also happen on the host without a sandbox.

```
[6] KIND: correctness
    WHERE: plan.md:42-46 (run argv), R5
    DEFECT: the spike ran the child as `env -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT -u CLAUDE_CODE_SESSION_ID`.
            The plan's argv, and R5's "exact argv", do not unset or check these variables.
    TRIGGER: run.sh started from inside a Claude Code session. Examples: the live verification run by an agent, or
             an orchestrator calling `scripts/agent/run.sh` through Bash(scripts/*).
    WRONG BEHAVIOUR: the child inherits the parent's session variables, as the spike's own runs had to avoid. The
             child might refuse to nest, or run with the wrong session id. That id is the one require-hooks.sh reads
             in the child's git commits.
    CONFIDENCE: plausible (the spike's command; I did not run a nested child)
```

The fix is to unset these variables, or to refuse with exit 1 when `CLAUDECODE` is set, and to probe either in R5.

```
[7] KIND: correctness
    WHERE: plan.md:39-40 (lock), 53 (stopped)
    DEFECT: the plan says "lock removed on every exit", but a trap cannot run on SIGKILL, a power loss, or launchd
            stopping the job. The plan does not say what happens when the lock already exists.
    TRIGGER: the laptop sleeps or reboots during a run, or someone runs `kill -9`. runs/<n>/lock is left behind.
    WRONG BEHAVIOUR: every later run.sh <n> or --poll treats the issue as busy. If that counts as "skipped" (exit 0),
             nothing ever reports it. In the same way, `stopped` after an error or a limit makes --poll skip the
             issue for good, and the issue comment does not say how to retry.
    CONFIDENCE: plausible (the interface is unstated)
```

Fixes:

- Write the pid in the lock and check whether it is still alive, or report a lock older than one run's limit on
  stderr with exit 1.
- The comment states the retry step (`rm runs/<n>/stopped`).

```
[8] KIND: coverage
    WHERE: plan.md:64 ("feature-map-smoke OK with the real tier.sh")
    DEFECT: no command does this. feature-map-smoke.sh's run() passes either $TMP/tier-stub or nothing (its throwaway
            $REPO has no tier.sh, so F15 expects "unknown").
    TRIGGER: running `scripts/agent/feature-map-smoke.sh` after green.
    WRONG BEHAVIOUR: it passes on the stub alone. Whether the real tier.sh reads feature-map's $TMP/plan, a file
             outside any checkout, is never tested.
    CONFIDENCE: confirmed (feature-map-smoke.sh:161-169, 203-205)
```

The plan needs to name the command and its expected output. One way is a T-probe that runs `tier.sh` on a plan file
outside the repository, with the working directory at the repo root, as `feature-map.sh` does.

```
[9] KIND: plan-mismatch
    WHERE: plan.md:39 (cap) and the Verification live-run line
    DEFECT: the PR cap cannot hold back a run that stops at the gate. dev-lead opens the draft only after `approve`
            (dev-lead.md step 5), so until B1.55 and B1.56 no headless run opens a PR. The only real limit is
            next-task's WIP 3, which interactive cards share.
    TRIGGER: one --poll with 3 eligible agent-ready issues.
    WRONG BEHAVIOUR: three `-agent` branches take all 3 Doing slots, and the lead's `--claim` exits 1 with the WIP
             limit until they are cleaned up. The gate branches are never pushed, so feature-map.sh's tier_of
             fetch fails and shows "unknown". The lead can read the plan only in the host's worktree.
    CONFIDENCE: confirmed (dev-lead.md:61-67, next-task.sh header "Doing … with no PR")
```

The plan must state these costs, or limit --poll to one run while a gate stop is pending.

```
[10] KIND: plan-mismatch
     WHERE: plan.md:3 ("as amended by B1.47 (#162)"); backlog/README.md:122
     DEFECT: the contract is text that is not on main. B1.44's row does not list B1.47 under "Blocked by", and the
             plan does not say that #162 merges first.
     TRIGGER: #162 changes during its review, or it is still open when this PR is checked against the card.
     WRONG BEHAVIOUR: the diff review and the closing lane read main's shorter Acceptance, so the runner's spike
             clauses are not checked against any merged text.
     CONFIDENCE: confirmed (gh pr view 162: OPEN)
```

The plan should state "B1.47 merges before this PR is ready". The guide is also out of scope with no card id:
`scripts/CLAUDE.md` gets no rows for tier.sh, run.sh or their smokes. Name the follow-up, as #160 was for B1.43 and
B1.45.

Riskiest unfalsified: whether `--setting-sources project,local` keeps the keychain login (`auth status`) and keeps
the project's SessionStart `session-mark.sh`. `require-hooks.sh` needs that hook for the child's commits. Both are
first exercised in the live run.

Verdict: changes requested

## Plan review (round 2)

SCOPE: tooling (no §; `scripts/agent/`, `scripts/ci/`). Plan reviewed: `71d0883 docs(backlog): B1.44 plan round 2`.
Same contract as round 1. PR #162 (B1.47) is still OPEN (`gh pr view 162` → `"state":"OPEN"`). I checked these facts
without editing anything:

- `scripts/next-task.sh --check B1.44` → `[next-task] B1.44: no overlap with any Doing or Review card` (exit 0).
- Every round 1 reason (r1 #1 to #10) is mapped in the plan. #2, #3, #6, #8, #9 and #10 are resolved as asked.
  #1 is not consistent with its own probe (reason 1). #4, #5 and #7 are resolved in part (reason 3).
- I ran `plan_lists` from `scripts/ci/lib.sh` under `/bin/bash` 3.2 against the plan's T4 tokens.
- I ran the current `PROTECTED` regex against `.claude/` paths that are not covered.
- `.claude/settings.json` defines 1 SessionStart hook. `dev-lead.md` frontmatter defines only PreToolUse.
  `worktree.sh` copies only `.env*` files into a new worktree.

| Check                                                                             | Result                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: tooling, no map row. Each file traces to an Acceptance clause or to decision 1 or 2. No overlap with B1.51, B1.55–B1.57                                                       |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): bash 3.2, system `jq`, no TypeScript or Prisma                                                                                                                          |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`. The quick tier skips the advisor, and the plan says so                                                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | fail: probe T4 contradicts the tier rule it tests (reason 1). The plan says "nothing runs unattended outside the sandbox", which a hand-started 150-turn run contradicts (reason 3) |
| verification lists exact commands with expected numbers                           | pass: "9 probes OK", "14 probes OK", 202 tests, ≤ 2 live runs at USD 1 / 15 turns. The T4 expectation is wrong (reason 1)                                                           |
| work breakdown has skeleton → red → green → map → review with convention subjects | fail: the Files row `backlog/plan/E1-todos.md` (the Acceptance amendment, decision 1) has no step and no commit subject (reason 4)                                                  |
| `Lead approves spec` box ticked only by a human                                   | pass (n/a): there is no section. `Plan approved by:` is empty                                                                                                                       |
| no settled D-n contradicted                                                       | fail: D-28 says "`.claude/` … make it high", but `.claude/settings.local.json` comes out low, and the run loads that file through `--setting-sources project,local` (reason 2)      |
| `scripts/next-task.sh --check B1.44` says no overlap                              | pass: `[next-task] B1.44: no overlap with any Doing or Review card` (exit 0)                                                                                                        |

### Findings

```
[1] KIND: correctness
    WHERE: backlog/work/B1.44/plan.md:33-34 (glob rule) vs :67-68 (T4 "`src/*` medium")
    DEFECT: by the plan's own rule `src/*` is high, but T4 asserts medium. plan_lists lets a last-segment `*` cover
            the whole directory below it, so `src/*` covers src/lib/env.ts, as `src/lib/*` does.
    TRIGGER: /bin/bash 3.2, `. scripts/ci/lib.sh; plan_lists src/lib/env.ts 'src/*'` → exit 0 ("src/* covers
             src/lib/env.ts").
    WRONG BEHAVIOUR: two outcomes, both bad. If the implementer follows the rule, T4 cannot go green. If the
             implementer makes T4 pass, `src/*` prints medium while plan-scope.sh lets that row write src/lib/env.ts,
             a D-28 high path. That reopens r1 #1 for the most natural glob, and after B1.55 the plan proceeds
             without the lead.
    CONFIDENCE: confirmed (ran plan_lists)
```

The fix is to change T4 to `src/*` high and keep a medium glob probe such as `src/components/*`, `e2e/*` or
`src/*/x.ts`.

```
[2] KIND: security
    WHERE: plan.md:17-19 (decision 2), :26 (lib.sh row), :43 (`--setting-sources project,local`)
    DEFECT: the run loads the worktree's `.claude/settings.local.json`. CONFIG_PROTECTED does not match that file,
            so tier.sh rates a plan that writes it low, and check-config-change.sh passes without the label.
            `.mcp.json` (tracked, at the root) and `.claude/commands/*` are also unmatched.
    TRIGGER: an agent-ready card whose Files list `.claude/settings.local.json`. `grep -E "$PROTECTED"` on
             `.claude/settings.local.json` → NOT (I ran it). By the plan's literal rule that token is not under
             src/ e2e/ spec/ scripts/, so it is low. The file is not gitignored (`git check-ignore` exit 1).
    WRONG BEHAVIOUR: after B1.55 a reviewer-approved low plan lets the code-writer commit a local settings file
             with hooks or `permissions.allow: ["Bash(*)"]`. B1.56 resumes "in the same worktree" with
             `--setting-sources project,local`, so the next session loads it. After merge, every checkout loads it.
             D-28 (and planning.md: "`.claude/` make it high") wants this high. This card already edits the regex.
    CONFIDENCE: confirmed (regex run); the exploit path is plausible (needs B1.55/B1.56)
```

The lead can decide this as part of decision 2. Two options:

- Add `\.claude/settings\.local\.json` and `\.mcp\.json` to CONFIG_PROTECTED, or match `\.claude/.*` whole.
- Run with `--setting-sources project` and give a probe that a local file is ignored.

Add a T3 case either way.

```
[3] KIND: plan-mismatch
    WHERE: plan.md:12-13 ("nothing runs unattended outside the sandbox"), :43-46 (allow list), :49-50 (canary)
    DEFECT: three costs that the approach carries are not stated, or are stated wrongly.
    TRIGGER: (a) the lead starts `run.sh <n>` by hand before B1.58 exists. (b) A host whose user settings have no
             SessionStart hook, for example the devcontainer of B1.58, or the lead removes the plugin. (c) B1.56
             resumes past the gate.
    WRONG BEHAVIOUR:
      (a) A hand-started run is a headless run of up to 150 turns on the host with no network limit, using the
          lead's gh token and keychain. `Bash(pnpm *)` permits `pnpm add` / `pnpm dlx`, so package install
          scripts run on the host. check-plan-scope.sh catches the package.json change only later, in CI.
          `Bash(scripts/*)` also permits `scripts/agent/run.sh`, so a child can start further runs. r1 #5's third
          point ("the live runs … happen on the host without a sandbox") is not stated, and the plan's sentence
          claims the opposite.
      (b) The user-settings check counts SessionStart hooks only. It detects leaked user settings only when that
          host's user settings define a SessionStart hook. A user hook on PreToolUse, PostToolUse or Stop alone is
          never flagged, so the Acceptance's evidence ("no user-level hook event in the stream") holds only on the
          lead's current host.
      (c) Under `--permission-mode dontAsk` the following are denied. The reviewer's probe copy (`cp -r . …`,
          reviewer.md:15). `docker compose up -d`, which `pnpm test:e2e` needs when the database is down
          (add-migration step 2). `gh pr view`. Until B1.55/B1.56 no run gets past the gate, but those cards
          inherit roles that cannot do their step.
    CONFIDENCE: (a) and (b) confirmed (plan text vs Acceptance, settings.json count); (c) plausible (not run headless)
```

The fix is to state all three under "Costs". Two things are cheap to add:

- For (a), keep `scripts/agent/*` out of the allow list.
- For (b), add a `--check-binary` assertion that a planted user-level SessionStart hook does not fire.

r1 #7 ("the comment states the retry step") is also only half done: the comment fields at :53 still do not say
`run.sh <n>` re-runs it.

```
[4] KIND: plan-mismatch
    WHERE: plan.md:31 (Files row backlog/plan/E1-todos.md) vs :76-80 (work breakdown)
    DEFECT: the edit to B1.44's Acceptance (decision 1) appears in no step and has no commit subject. The filing of
            B1.58 and B1.59, which must merge before "this PR is ready", has no step either.
    TRIGGER: the lead approves. The steps run: red, then green (`chore(scripts)`), then review.
    WRONG BEHAVIOUR: the contract change either goes into `chore(scripts): B1.44 agent runner`, mixing code with
             its own contract, or is left out, so B1.44 cannot close Done against text that still names the
             devcontainer and launchd. #162 edits the same card block, so the step must also come after #162
             merges in.
    CONFIDENCE: confirmed (plan text)
```

The fix is a step such as `docs(backlog): B1.44 acceptance -- devcontainer and launchd moved to B1.58/B1.59`,
committed after #162 is merged in and before the review step.

Not blocking: the plan is 92 lines against planning.md's ≈ 40, in line with B1.42–B1.46 (72–84). The lock compares a
pid that may be reused after a reboot, so a stale lock can look live. Say whether a held lock exits 1 with a reason or
0 as "skipped".

Riskiest unfalsified: whether `--setting-sources project,local` still runs the project's SessionStart
`session-mark.sh`, which `require-hooks.sh` needs for the child's commits, and still keeps the keychain login. Neither
is probed offline; the first evidence is the single live run.

Verdict: changes requested (round 2 of 2: the next step is "Waiting on human". The lead can settle reasons 1–4 at the
gate, because each has a one-line fix named above.)

## Diff review (pass 1)

SCOPE: tooling (no §; `scripts/agent/`, `scripts/ci/`). Diff `origin/main...HEAD` at `88d8552`: 10 files, +1254 −9.
Contract: B1.44's Acceptance (as amended by B1.47) minus the devcontainer and launchd clauses (decision 1). The
`backlog/plan/E1-todos.md` edit (step 3) is not in this diff yet. Nothing was run against the real `claude` binary or
the real `gh`. Live evidence was read only from `~/.level-up-lab/runs/check-binary/`. There are three logs:

- run 1: exit 143, killed at init by 4 `cc-plugin-*@builtin`.
- run 2: 1 turn, no tool call.
- run 3 (`20261102T092255Z-42033`): 2 turns, USD 0.080. One PreToolUse `hook_response` has exit 2 and stderr
  `BLOCKED by .claude/hooks/path-guard.sh: 'spec/agent-probe.md' is outside this role's paths`.
  `verified-versions` now holds `2.1.309 (Claude Code)`.

So the `--check-binary` live step is done. The `run.sh <n>` live step is not.

### Commands (last line each)

| Command                                            | Result                                                                                                          |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                        | `All matched files use Prettier code style!`                                                                    |
| `pnpm typecheck`                                   | `tsc --noEmit` exit 0                                                                                           |
| `pnpm test`                                        | `Tests  202 passed (202)`                                                                                       |
| `pnpm test:e2e`                                    | `43 passed (1.1m)`                                                                                              |
| `pnpm test:mutation`                               | `Final mutation score of 93.40 is greater than or equal to break threshold 70` (unchanged, no `src/`)           |
| `scripts/agent/tier-smoke.sh` (`/bin/bash` 3.2)    | `9 probes OK` (no bash 5 on this host: `which -a bash` → `/bin/bash` only)                                      |
| `scripts/agent/run-smoke.sh` (`/bin/bash` 3.2)     | `14 probes OK`                                                                                                  |
| `scripts/ci/check-suppressions.sh`                 | `OK: no new suppressions`                                                                                       |
| `scripts/ci/check-config-change.sh`                | exit 1 without the label (lists `scripts/agent/run-smoke.sh` …), exit 0 with `CONFIG_CHANGE_APPROVED=true`      |
| `scripts/ci/check-feat-commits.sh`                 | `OK: no feat commit touches tests`                                                                              |
| `scripts/ci/check-ac-coverage.sh`                  | `OK: every criterion of a shipped section has a test`                                                           |
| `scripts/ci/check-spec-sections.sh`                | `OK: sections cited: 1 … 22`                                                                                    |
| `scripts/ci/check-features-map.sh`                 | `OK`                                                                                                            |
| `scripts/ci/check-backlog.sh`                      | `OK: README matches the cards`                                                                                  |
| `scripts/ci/check-plan-scope.sh`                   | `OK: chore/B1.44-runner stays inside the approved plan of B1.44`                                                |
| `scripts/verify-red.sh B1.44`                      | `no 'test(<pkg>): B1.44 … (red)' commit` (expected: the plan has no `(red)` marker, as B1.43; red proven below) |
| `scripts/next-task.sh --check B1.44`               | `no overlap with any Doing or Review card`                                                                      |
| `scripts/agent/tier.sh backlog/work/B1.44/plan.md` | `high`                                                                                                          |
| `git diff --stat main...HEAD`                      | `10 files changed, 1254 insertions(+), 9 deletions(-)`                                                          |

Red, proven by hand on `git archive` copies of each test commit:

- `b1b20db`: `9 of 9 probes FAILED`, `14 of 14 probes FAILED`. `run.sh` and `tier.sh` are missing, which is the card's
  "red because".
- `bf8e612`: `FAIL R9`, `FAIL R14` (2 of 14).
- `b25c8ac`: `FAIL R14` (1 of 14).
- HEAD: 9 and 14 OK.

### Checklist

| Check                                               | Result                                                                                                                                                                                                                                             |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance clause has a probe                 | pass. auth R1, verified version R2/R14, eligibility R3, cap R4, lock R5, argv/env/stdin/no bypass R6, logs R7, init kill R8/R9, retry R10, limits R11, comment and tier R12, poll R13, tier T1–T9                                                  |
| no test weakened after red                          | pass. `git log --first-parent --no-merges b1b20db..HEAD` on the smokes: `9b7cda1` (only the TMP path), `bf8e612` (R9 fixture gains `path`; a plugin with no `path` still fails), `b25c8ac` (adds a check). No merge after red (remerge-diff empty) |
| every changed file is in `plan.md`                  | pass. All 10 are in Files. `E1-todos.md` is pending (step 3)                                                                                                                                                                                       |
| interfaces match the plan                           | fail (minor): `--check-binary` checks init tools against the main set, not `Write ∪ {Grep, Glob}` (finding 3)                                                                                                                                      |
| costs stated to the lead hold in the code           | fail: "may not start `run.sh` itself … or add packages" does not hold (finding 1)                                                                                                                                                                  |
| Zod / Prisma / raw SQL / migration                  | n/a (no `src/`, no `prisma/`)                                                                                                                                                                                                                      |
| no secret, no suppression                           | pass. `check-suppressions` OK. The comment carries fixed fields only (R12 asserts no agent text)                                                                                                                                                   |
| features map row                                    | n/a (tooling)                                                                                                                                                                                                                                      |
| would a test fail if one changed line were reverted | fail for 4 lines (finding 2). On copies, I removed each of: `and .exit_code == 2`; the `startswith("BLOCKED by .claude/hooks/path-guard.sh")` condition; the card-id regex guard; the `trap … EXIT`. Each time, 9 + 14 probes OK                   |

### Findings

```
[1] KIND: security
    WHERE: scripts/agent/run.sh:28-32 (ALLOW, DENY); plan.md:20-21 and pr-body.md:33-35 ("Costs")
    DEFECT: the allow list composes into arbitrary command execution, so the two limits the lead approved
            ("the run may not start run.sh itself (--disallowedTools) or add packages (only named pnpm scripts are
            allowed)") do not hold.
    TRIGGER: a headless run issues `cp /bin/sh scripts/sh` (matches `Bash(cp *)`), then
             `scripts/sh -c 'pnpm add left-pad'` or `scripts/sh -c 'scripts/agent/run.sh 8'` (matches
             `Bash(scripts/*)`, not the `Bash(scripts/agent/run.sh*)` deny). Other single-call routes:
             `git -c alias.r='!pnpm add left-pad' r` (matches `Bash(git *)`), and `scripts/../scripts/agent/run.sh 8`.
             I fed each of these commands to `.claude/hooks/guard-bash.sh` on a copy, and each returned exit 0.
    WRONG BEHAVIOUR: a hand-started run on the host (no sandbox until B1.58) can install packages, whose install
             scripts run with the lead's gh token and keychain. It can also start nested runs that the per-issue lock
             and the branch cap do not account for. The lead approved the plan on the stated limit. Either narrow
             the list, or restate the cost and get it re-approved before the live `run.sh <n>`. To narrow it:
             drop `Bash(cp *)` or confine it to the reviewer's copy form; name scripts instead of `scripts/*`; name
             git subcommands instead of `git *`, and deny `git -c`/`--config-env`.
    CONFIDENCE: plausible. guard-bash passing them is confirmed. Claude Code's prefix matcher accepting them under
             dontAsk is traced from the rules, not run: running the real binary is out of bounds for this review.
```

```
[2] KIND: coverage
    WHERE: scripts/agent/run.sh:211-212 (check_binary's hook test); also :169 (card-id guard), :173 (lock trap)
    DEFECT: no probe pins what makes a version "verified". R14 has no fixture in which a PreToolUse hook other
            than path-guard answers, so dropping `.exit_code == 2` or the path-guard stderr test leaves 14/14
            green.
    TRIGGER: on a copy, remove the stderr condition; then a stream whose only PreToolUse hook_response is
             `exit_code 2, stderr "BLOCKED by .claude/hooks/plan-scope.sh: x"` and that writes no file is
             verified. With HEAD's code the same stream is refused (my extra probe X2: rc=1, nothing recorded),
             so the code is right today and only the test is missing. This is the case B1.42 finding 8 is about:
             a project-level hook fires, dev-lead's frontmatter hook does not.
    WRONG BEHAVIOUR: a later edit can weaken the version gate with every probe green. Live run 3 already shows a
             second PreToolUse hook_response (exit 0) in the same stream, so "any PreToolUse response" is a real
             false pass. Add to R14: another hook's exit-2 response → refused; path-guard's response with exit 0 →
             refused. Smaller gaps: an issue whose Card id is `_No response_` (the guard is correct, X3: skipped,
             no claim), and an interrupted run removing its lock.
    CONFIDENCE: confirmed (4 mutants survive on copies; X2/X3 run on a copy)
```

```
[3] KIND: plan-mismatch
    WHERE: scripts/agent/run.sh:74-76 (init_problem uses $TOOLS) as called from check_binary :206-210
    DEFECT: the plan's kill rule is "init tools ⊄ --tools ∪ {Grep, Glob}". In --check-binary, --tools is Write,
            but the check compares against the main run's eight tools.
    TRIGGER: a --check-binary stream whose init lists ["Write","Grep","Glob","Bash"] and that contains path-guard's
             exit-2 response (my extra probe X1 on a copy): rc=0, `2.1.309 (Claude Code)` is appended to
             verified-versions.
    WRONG BEHAVIOUR: a claude version that no longer honours --tools is verified. The main run's own init check
             still catches tools outside its eight, so the exposure is small. Pass the run's tool set to
             init_problem.
    CONFIDENCE: confirmed (ran X1 on a copy)
```

Not blocking, for the lead:

- plan.md:24 and pr-body.md:37 still say "the live run shows plugins `[]`". Run 3 shows 4 `cc-plugin-*@builtin`.
- The PR body's `Plan approved by:` is empty while plan.md has the approval.
- A lock directory whose `pid` is not yet written reads as stale, so two starts within microseconds can both run.
- If `run.sh` is killed, its EXIT trap frees the lock while the backgrounded `claude` keeps running.
- If init arrives after `RUNNER_INIT_WAIT` (120 s), the init check is skipped, not failed.

Verdict: back to code-writer. Finding 1 needs the allow list narrowed, or the lead re-approving the restated cost.
Finding 3 is one argument. Finding 2's probes go to the test-writer first, red before the change.

Riskiest unfalsified: whether Claude Code 2.1.309 under `--permission-mode dontAsk` accepts
`scripts/sh -c '…'` and `git -c alias.r='!…' r` through the prefix rules. I traced it and did not run it. The first
live `run.sh <n>` (or a sandboxed probe) settles finding 1's confidence.

## Live runs (dev-lead, 2.1.309 macOS app build, lead's own claude.ai login)

The lead allowed 2 runs, then 2 more (check-binary and one issue run); attempts that ended at the init check made no
API turn. Logs under `~/.level-up-lab/runs/` on the lead's machine.

| #   | Run                                        | Turns | USD   | Outcome                                                                                                  | Change it led to                                                      |
| --- | ------------------------------------------ | ----- | ----- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | `--check-binary`                           | 0     | 0     | killed at init: 4 `cc-plugin-*@builtin` (path `builtin`) counted as user settings; no user plugin loaded | `bf8e612` → `a1bc002`: builtin plugins pass                           |
| 2   | `--check-binary`                           | 1     | 0.073 | dev-lead declined the spec/ write before any tool call: no hook evidence                                 | `b25c8ac` → `731d06f`, `88d8552`: the prompt asks for the Write call  |
| 3   | `--check-binary`                           | 2     | 0.080 | verified: PreToolUse:Write path-guard exit 2 on `spec/agent-probe.md`, no file; plugins builtin only     | `verified-versions` holds `2.1.309 (Claude Code)`                     |
| 4a  | `run.sh 166` (card B1.41, 15 turns, USD 1) | 0     | 0     | no claude call: worktree.sh refused under `.worktrees/`, message hidden, EXIT trap unbound               | `896c8c1` → `0a9b54d` (with review pass 1)                            |
| 4b  | `run.sh 166`                               | 0     | 0     | killed at init: tools `…,Bash,Task` (2.1.309 names Agent `Task`, lists no Skill); comment posted         | `25b824e`, `3a35ecc` → `f351eeb`: Task = Agent, prompt names SKILL.md |
| 4c  | `run.sh 166`                               | 9     | 0.496 | **gate**: `is_error false`, `subtype success`; tier high; 0 permission denials; comment on #166          | —                                                                     |

Run 4c: init tools `Read,Grep,Glob,Write,Edit,Bash,Task`, plugins builtin only, 0 MCP servers, 1 SessionStart hook
(the project's), PreToolUse hooks on Bash, Read and Write. dev-lead wrote `backlog/work/B1.41/plan.md`, had the
`reviewer` approve it in round 1 and stopped at the gate; its two commits (`f880de1`, `b1a7727`) passed the pre-commit
hooks inside the run, `require-hooks.sh` included. Lock removed, `runs/166/stopped` = `gate`. Total measured: USD 0.649.

## Diff review (pass 2)

SCOPE: tooling (no §; `scripts/agent/`, `scripts/ci/`). Diff `origin/main...HEAD` at `bb4a21e`: 11 files, +1461 −10
(`git diff --stat main...HEAD` shows 18 files only because the local `main` is behind `origin/main`, which already
holds #162, #164 and #165). Reviewed with the same rigour as pass 1: the commits after `e8ef3ea` (`896c8c1`, `fc78ae6`,
`0a9b54d`, `7f28d96`, `25b824e`, `3a35ecc`, `f351eeb`, `102cabb`, `bb4a21e`). Nothing was run against the real
`claude` binary or with real `gh` writes. Live evidence was read only from `~/.level-up-lab/runs/166/`.

### Commands (last line each)

| Command                                            | Result                                                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                        | `All matched files use Prettier code style!`                                                                  |
| `pnpm typecheck`                                   | `tsc --noEmit` exit 0                                                                                         |
| `pnpm test`                                        | `Tests  202 passed (202)`                                                                                     |
| `pnpm test:e2e`                                    | `43 passed (55.7s)`                                                                                           |
| `pnpm test:mutation`                               | `Final mutation score of 93.40 is greater than or equal to break threshold 70` (no `src/` change)             |
| `scripts/agent/run-smoke.sh` (`/bin/bash` 3.2)     | `14 probes OK`                                                                                                |
| `scripts/agent/tier-smoke.sh` (`/bin/bash` 3.2)    | `9 probes OK`                                                                                                 |
| `scripts/ci/check-suppressions.sh`                 | `OK: no new suppressions`                                                                                     |
| `scripts/ci/check-config-change.sh`                | exit 1 without the label; exit 0 with `CONFIG_CHANGE_APPROVED=true`. PR #163 carries `config-change-approved` |
| `scripts/ci/check-feat-commits.sh`                 | `OK: no feat commit touches tests`                                                                            |
| `scripts/ci/check-ac-coverage.sh`                  | `OK: every criterion of a shipped section has a test`                                                         |
| `scripts/ci/check-spec-sections.sh`                | `OK: sections cited: 1 … 22`                                                                                  |
| `scripts/ci/check-features-map.sh`                 | `OK`                                                                                                          |
| `scripts/ci/check-backlog.sh`                      | `OK: README matches the cards`                                                                                |
| `scripts/ci/check-plan-scope.sh`                   | `OK: chore/B1.44-runner stays inside the approved plan of B1.44`                                              |
| `scripts/verify-red.sh B1.44`                      | `no 'test(<pkg>): B1.44 … (red)' commit` (expected: no `(red)` marker, as B1.43; red proven by hand below)    |
| `scripts/next-task.sh --check B1.44`               | `no overlap with any Doing or Review card`                                                                    |
| `scripts/agent/tier.sh backlog/work/B1.44/plan.md` | `high`                                                                                                        |

Red, proven in a scratch `git clone` checked out at each commit (an `git archive` copy has no `.git`, so R14's
`git worktree add` fails there for every commit before `3a35ecc`; I did not count those runs):

- `896c8c1`: `3 of 14 probes FAILED` (R5: "TERM left the lock", worktree.sh failure hit "dir: unbound variable"; R6:
  old allow list, `CHILD=unset`, the nested run ran; R14: "Bash in a Write-only check: rc=0"). `fc78ae6`: the same 3.
- `0a9b54d`, `7f28d96`: `14 probes OK`.
- `25b824e`, `3a35ecc`: `2 of 14 probes FAILED` (R6: the prompt does not name `SKILL.md`; R8: `Task` stopped the run).
- `f351eeb` (HEAD's code): `14 probes OK`.

Live run 4c, checked in its log (`runs/166/20261102T094634Z-24595.jsonl`): init tools
`Read,Grep,Glob,Write,Edit,Bash,Task`, 4 plugins all `path: builtin`, 0 MCP servers, `permissionMode dontAsk`; result
`is_error false`, `subtype success`, `num_turns 9`, `total_cost_usd 0.495851`, 0 permission denials; hook_started
counts: 1 SessionStart, 8 PreToolUse:Bash, 5 PreToolUse:Write, 1 PreToolUse:Read, 1 SubagentStop. `stopped` = `gate`.
No `*-agent` branch or worktree is left on the host. The review.md "Live runs" table matches the logs.

### Pass 1 findings

| Pass 1 finding                                       | Status now                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [1] allow list composes into exec                    | **open** (finding 1 below). `cp *` and `scripts/*` are gone; `git -c`, `git * -c *` and `git config` are denied; `RUNNER_CHILD=1` makes a nested `run.sh` refuse by any path (mutants of the guard and of the env each fail R6). That closes the pass 1 triggers as written. `Bash(git *)` still runs arbitrary commands through other git subcommands, and `scripts/ci/*` admits `..`. The run.sh comment states the residual honestly ("it is no sandbox (a test the run writes still runs under pnpm test): that is B1.58"). The plan and the PR body, which the lead reads, still state the limit that does not hold. |
| [2] 4 mutants survive                                | **closed.** On a scratch clone each of these mutants now fails a probe: `and .exit_code == 2` → R14; the path-guard `startswith` → R14; the card-id guard → R3; the lock `trap … EXIT` → R5. Also killed: the TERM trap → R5, `RUNNER_CHILD=1` → R6, the `RUNNER_CHILD` guard → R6, `EXPECT=Write` → R14, the `Task`→`Agent` mapping → R8                                                                                                                                                                                                                                                                                 |
| [3] `--check-binary` tool set                        | **closed.** `EXPECT=Write`; R14's `["Write","Grep","Glob","Bash"]` fixture is refused with `tools-mismatch` and nothing recorded (red at `896c8c1`, green at `0a9b54d`)                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| not blocking: plugins `[]`                           | still in plan.md:24 and pr-body.md:37. Runs 3, 4b and 4c show 4 `cc-plugin-*@builtin`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| not blocking: `Plan approved by:`                    | still empty in pr-body.md:117, and pr-body.md:12 still says "waiting for the lead's `approve`"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| not blocking: killed run.sh orphan                   | fixed for `run.sh <n>` (R5). Still open for `--poll` (finding 3)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| not blocking: lock pid race, `RUNNER_INIT_WAIT` skip | unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

### Checklist

| Check                                               | Result                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance clause has a probe                 | pass. As in pass 1. `102cabb` moves the devcontainer, the Linux build "verified there" and launchd to B1.58 and B1.59 (both on `origin/main`, B1.59 blocked by B1.44 and B1.58); the remaining text matches the code                                                                                                                                                                           |
| no test weakened after red                          | pass. Every smoke change after `b1b20db` is in a `test(scripts)` commit. Changed assertions are tighter: the R6 argv loses `Bash(scripts/*)` and `Bash(cp *)` and gains the deny list; the stdin check adds `SKILL.md`. `fc78ae6` changes only which pid gets the signal. `3a35ecc` points run.sh's git at a scratch repo and adds an R4 case. `--remerge-diff` on the smokes after red: empty |
| every changed file is in `plan.md`                  | pass. 11 files, all in Files                                                                                                                                                                                                                                                                                                                                                                   |
| interfaces match the plan                           | fail. The argv, the env and the kill rule changed shape after approval, and the plan and PR body were not updated (finding 2)                                                                                                                                                                                                                                                                  |
| costs stated to the lead hold in the code           | fail (finding 1)                                                                                                                                                                                                                                                                                                                                                                               |
| Zod / Prisma / raw SQL / migration                  | n/a (no `src/`, no `prisma/`)                                                                                                                                                                                                                                                                                                                                                                  |
| no secret, no suppression                           | pass                                                                                                                                                                                                                                                                                                                                                                                           |
| features map row                                    | n/a (tooling)                                                                                                                                                                                                                                                                                                                                                                                  |
| would a test fail if one changed line were reverted | pass with one gap. 10 mutants of the new lines were run on a scratch clone; 9 fail a probe at once. `cd "$HOME_CHECKOUT" &&` survives when the smoke runs from a checkout that has no `/.worktrees/` in its path. From a copy under `…/.worktrees/c` the same mutant fails R6. CI does not run run-smoke, so the probe only means something from a worktree; not blocking                      |

### Findings

```
[1] KIND: security
    WHERE: plan.md:20-21 and pr-body.md:33-35 ("Costs"); scripts/agent/run.sh:33-38 (ALLOW, DENY)
    DEFECT: the cost the lead approved, "the run may not start run.sh itself … or add packages (only named pnpm
            scripts are allowed)", still does not hold, and neither document says so. The run.sh comment admits it
            ("it is no sandbox").
    TRIGGER: under `Bash(git *)`, which none of the four deny rules matches: `git rebase -x 'pnpm add left-pad' HEAD~1`,
             `git difftool -y --extcmd='pnpm add left-pad;:' HEAD~1`, `git grep -O'pnpm add left-pad' x`. Under
             `Bash(scripts/ci/*)`: `scripts/ci/../../node_modules/.bin/tsx -e '…execSync("pnpm add left-pad")'` (tsx
             is in node_modules/.bin). `git rebase -x 'env -u RUNNER_CHILD scripts/agent/run.sh 8' HEAD~1` gets past
             the new RUNNER_CHILD guard as well. I fed each command to `.claude/hooks/guard-bash.sh` on a scratch
             clone: each returned exit 0. Separately, `Bash(pnpm test*)` runs any test file the run writes, as
             run.sh:32 says.
    WRONG BEHAVIOUR: a hand-started run on the host (no sandbox until B1.58) can install packages, whose install
             scripts run with the lead's gh token and keychain, and can start an unlocked nested run. The PR body
             that the lead reads at merge says it cannot. Narrowing cannot make the sentence true while the run
             writes and runs its own tests. The fix is text plus one approval: restate the cost in plan.md and
             pr-body.md (arbitrary code execution on the host is possible until B1.58; the allow list limits
             accidents, not intent), and record the lead's re-approval of that sentence. Optionally narrow
             `git *` to named subcommands as well.
    CONFIDENCE: plausible. guard-bash passing them is confirmed. That Claude Code 2.1.309 under dontAsk matches
             `git rebase -x …` to `Bash(git *)`, and does not normalise `..` in `scripts/ci/../…`, is traced from
             the rule text, not run (the real binary is out of bounds). The `pnpm test` route needs no
             matcher assumption.
```

```
[2] KIND: plan-mismatch
    WHERE: plan.md:62-71 (run argv, kill rule) and pr-body.md:75-84 vs scripts/agent/run.sh:17, 33-38, 82, 99-100, 189
    DEFECT: four interface changes made after approval are in neither the plan nor the PR body: the allow and deny
            lists (no `Bash(scripts/*)`, no `Bash(cp *)`, 7 named scripts, 3 new git denies), the `RUNNER_CHILD=1` env
            and the refusal it causes, init `Task` accepted as `Agent` (the Acceptance's literal rule says "a tool
            outside the set given plus Grep and Glob"), and the prompt naming `SKILL.md`. Skill is in --tools but
            2.1.309's init does not list it.
    TRIGGER: the lead compares PR #163's diff with its Plan section, as planning.md requires.
    WRONG BEHAVIOUR: the Plan section shows an argv that the code no longer passes. The PR body is also stale in
             other places: "Status: waiting for the lead's `approve`" (:12), "if the lead approves the split" (:7),
             `Plan approved by:` empty (:117), Review and Evidence "pending". planning.md: "an interface changes
             shape → stop, update the plan, get it re-approved." Each change is a narrowing, or a rename the live log
             proves (run 4c: `Task` dispatched the reviewer, `SubagentStop` fired, 0 denials). So this needs one
             re-approval together with finding 1, not a redesign.
    CONFIDENCE: confirmed (plan text vs code; R6's own `want` string)
```

```
[3] KIND: correctness
    WHERE: scripts/agent/run.sh:232 (TERM trap) with :245 (`(run_issue "$n")` in a subshell)
    DEFECT: in --poll the claude pid is set only in the subshell, so the parent's TERM trap has nothing to kill. bash
            also defers that trap until the foreground subshell exits.
    TRIGGER: `run.sh --poll` with one issue whose claude run sleeps; `kill -TERM <run.sh pid>` (my probe X-poll on
             a scratch clone, built from run-smoke's own shims).
    WRONG BEHAVIOUR: 2 s after the TERM, run.sh, the claude shim and the lock are all still alive. The run then ends
             `error:no-result`, is retried once, comments on the issue and writes `stopped`. Only then does run.sh
             exit 143, 60 s later (two 30 s shim runs). With a real run that is up to 2 × 150 turns after the lead
             asked it to stop. Commit 0a9b54d says "TERM/INT stop the child run", and R5 checks only
             `run.sh <n>`. Ctrl-C still works, because it signals the whole group. Not blocking on its own, but B1.59
             (launchd's --poll) inherits it: forward the signal to the subshell, or run run_issue in the parent, and
             add the --poll case to R5.
    CONFIDENCE: confirmed (ran X-poll)
```

Not blocking, for the lead:

- `Bash(git * -c *)` also denies a commit message that contains `-c` (`git commit -m "pass -c to x"`). The denial
  shows up in the comment's count.
- The card title "… headless in a sandbox" (E1-todos.md, README row 56) still names the sandbox that moved to B1.58.

Verdict: back to code-writer. Findings 1 and 2 are text in plan.md and pr-body.md: dev-lead restates them and the
lead re-approves them in one line. Finding 3 needs an R5 `--poll` probe from the test-writer, red first, or a named
deferral to B1.59.

Riskiest unfalsified: whether 2.1.309 under `--permission-mode dontAsk` lets `git rebase -x '…'` or
`git difftool --extcmd=…` through `Bash(git *)`. A sandboxed probe in B1.58 settles it. Until then, finding 1's
restated cost should assume that it does.
