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
