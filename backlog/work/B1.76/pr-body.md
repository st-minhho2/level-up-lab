## Item

B1.76 — The PR wrapper keeps the runner container's git credential and identity (tooling, no spec section)

- spec: none — tooling (D-26, D-27); no `src/` change, no section
- test: `scripts/agent/sandbox-probe.sh` S12 (red) and `scripts/pr-step-smoke.sh` R15 (guard) — pending
- acceptance: B1.76's clauses (as amended, ca15cf3) — pending
- risk tier: high (`.devcontainer/`, `scripts/agent/`); label `config-change-approved` (D-19)

## For the lead: rebuild and check (from the host checkout, on this branch)

pending (filled after the green commit)

## Plan

### B1.76 plan — The PR wrapper keeps the runner container's git credential and identity (tooling, no §)

Approach: **A** (`advice.md`) — the image sets GitHub's credential helper at git's **system** scope (`/etc/gitconfig`,
root-owned, read-only to node). The wrapper clears every `GIT_CONFIG_*` variable (the B1.23 threat: an injected config
in the environment) but still reads system scope, so its push gets the helper; `scripts/pr-step.sh` is unchanged.
Measured by the advisor in the runner: the wrapper's environment alone reproduces run 4's error; with the helper at
system scope the credential lookup succeeds. Risk tier **high** (`.devcontainer/`, `scripts/agent/`) → the lead's
`approve`; the PR carries `config-change-approved` (D-19); one image rebuild by the lead.

Round 2 (plan review r1: 4 reasons, "r1 #n"). **The lead decides at this gate** (defaults proposed):

1. **Direction A** over the card's (a) (`git config --global` and `gh auth setup-git` would write `~/.gitconfig`, lost
   on recreate; `--global --get` does not follow includes), (b) and (c) (both change the permission-boundary wrapper,
   and the runner marker cannot be faked honestly in a host smoke test).
2. **Card deviation** (r1 #2): the wrapper never commits (push, draft, ready, open only), so it needs the credential,
   not the identity; the red is S12 in `sandbox-probe.sh`, not a `pr-step-smoke.sh` probe (R15 there is a hardening
   guard, green on arrival). First commit on the branch, before the red, `docs(backlog): B1.76 card lines`, replaces:
   Test → "`scripts/agent/sandbox-probe.sh` S12 — red because: with every `GIT_CONFIG_*` cleared, as the wrapper
   does, git in the runner finds no credential helper for github.com (run 4)"; Acceptance → "inside the runner
   container the wrapper's push reaches GitHub through GitHub's credential helper set at system scope by the image
   (root-owned); `scripts/pr-step.sh` unchanged, still clearing every `GIT_CONFIG_*` (R15); `draft`, `ready`, `open`
   use `gh`'s own login; S12 proves the wrapper's git sees the helper; the wrapper makes no commit, so it needs no
   identity; the PR carries `config-change-approved` (D-19)". Title, README row and node keep their words (ids and
   titles stay as filed).
3. **Run 5** (after merge and rebuild): resume the container worktree `chore/B1.66-agent` at 3b09a57 with
   `RUNNER_MAX_TURNS=25 RUNNER_BUDGET_USD=1`; its stale "Waiting on human" row (3b09a57) is the run's own to drop when
   it resumes, not edited by hand. Merging `origin/main` into it is not needed (no conflict, no step depends on it).

#### Files

| File                                      | Change                                                                                               |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `.devcontainer/runner/Dockerfile`         | one `RUN` before `USER node`: `/usr/bin/gh` exists, `git config --system` helper for github.com      |
| `scripts/agent/sandbox-probe.sh`          | S12 (red first); header S1–S12                                                                       |
| `scripts/pr-step-smoke.sh`                | R15: `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_COUNT/KEY/VALUE`, `GIT_CONFIG_SYSTEM` never reach the push     |
| `.devcontainer/runner/docker-compose.yml` | header only: `gh auth setup-git` line → a comment (helper in the image); "11 probes OK" → "12" twice |
| `scripts/CLAUDE.md`                       | the `pr-step-smoke.sh` row R1–R15 (the sandbox row stays B1.72's)                                    |
| `backlog/plan/E1-todos.md`                | decision 2: B1.76 Test and Acceptance lines                                                          |
| `backlog/work/B1.76/*`                    | advice, plan, review, pr-body                                                                        |

#### Interfaces touched

```
Dockerfile   RUN test -x /usr/bin/gh && git config --system 'credential.https://github.com.helper' '!/usr/bin/gh auth git-credential' \
             && [ "$(git config --system --get 'credential.https://github.com.helper')" = '!/usr/bin/gh auth git-credential' ]  (r1 #4)
S12  with every GIT_CONFIG_* cleared, as the wrapper does: git config --get-urlmatch credential.helper https://github.com
     = '!/usr/bin/gh auth git-credential' · /etc/gitconfig owned by root, not writable by node ·
     only where /etc/level-up-lab-runner exists: GIT_TERMINAL_PROMPT=0 git credential fill exits 0 (stdout to
     /dev/null, never printed); elsewhere it says "credential fill skipped: not the runner" (r1 #3: on the lead's
     Mac it would pull the real keychain credential)
R15  control: GIT_CONFIG_GLOBAL with core.hooksPath → a pre-push hook fires on a plain push; through pr-step.sh push with
     GIT_CONFIG_GLOBAL, then GIT_CONFIG_COUNT/KEY_0/VALUE_0, then GIT_CONFIG_SYSTEM: exit 0, no hook fired, origin updated
```

#### Verification

- Red `test(scripts): B1.76 wrapper credential probes` (no `(red)` marker): host `sandbox-probe.sh` → "11 of 12 probes
  FAILED" (S12 new, its fill skipped); `pr-step-smoke.sh` → "[pr-step-smoke] 15 ok, 0 FAIL" (R15 green on arrival).
- Green `chore(scripts): B1.76 credential helper at system scope` (no probe file): throwaway `-p b176-verify`, public
  clone at the pushed branch, the header's two identity lines first (fresh `runner-runs`, r1 #1), no `gh` login:
  old image → "1 of 12 probes FAILED", S12 naming the missing helper and `/etc/gitconfig`; new image → "1 of 12 probes
  FAILED", S12 naming only the credential fill (no login there). `pnpm lint && pnpm typecheck && pnpm test`;
  `run-smoke` 17, `hook-smoke` 522, `check-plan-scope`, `check-backlog` OK; `down -v` after. Advice's hand mutants: B, D (the wrapper's clearing) by R15, C by R10,
  E–G by the build's read-back and S12, A equivalent (the loop also clears it); H–J as the advice says (r2 note).

Steps: 1 red · 2 green · 3 reviewer (diff) · 4 PR. All dev-lead (no `src/`). Not in scope: `scripts/pr-step.sh`, B1.70,
B1.71, B1.72, B1.73.

Plan review: approved, round 2 (round 1: 4 reasons, addressed; r2 notes folded) · Plan approved by: lead, 2026-11-03 (decisions 1–3 as proposed) · Rounds: 1

## Map delta

none (tooling, no `spec/features-map.md` row)

## Review

pending

## Evidence

- AC met: 0/4
- tier: high
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the green commit; the green `chore(` commit touches no probe.
- [ ] n/a: no `src/` change, no `AC-§.n`, no mutation target.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change carries `config-change-approved`.
- [ ] n/a: no migration.
- [ ] `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
