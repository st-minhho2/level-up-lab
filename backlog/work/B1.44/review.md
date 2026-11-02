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
