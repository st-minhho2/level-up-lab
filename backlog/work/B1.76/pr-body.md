## Item

B1.76 — The PR wrapper keeps the runner container's git credential and identity (tooling, no spec section)

- spec: none — tooling (D-26, D-27); no `src/` change, no section
- test: `scripts/agent/sandbox-probe.sh` S12 (new, red) and `scripts/pr-step-smoke.sh` R15 (new, guard). Red `894db58`:
  host "11 of 12 probes FAILED" (S12: no system helper, no `/etc/gitconfig`, fill skipped off-runner); old image: no
  `/etc/gitconfig`, no helper in the wrapper's view. Green `79b22c5`: throwaway `b176-verify` (new image, public clone,
  the header's identity lines, no `gh` login): `/etc/gitconfig` root 644 with the helper; the wrapper's view (every
  `GIT_CONFIG_*` cleared) sees `!/usr/bin/gh auth git-credential` and runs `gh auth git-credential get`; probe "1 of 12
  probes FAILED", S12 naming only the credential fill (no login there). `[pr-step-smoke] 15 ok, 0 FAIL`; hook-smoke
  522; run-smoke 17; `pnpm test` 202; `scripts/pr-step.sh` unchanged (empty diff). Wrapper mutants: loop deleted → R15
  FAIL; GLOBAL/SYSTEM dropped from the unset line alone survives (equivalent: the loop clears them).
- acceptance: B1.76's clauses as amended (`ca15cf3`), all met but the live push: helper at system scope, root-owned;
  wrapper unchanged and clearing every `GIT_CONFIG_*` (R15); S12; no identity needed (the wrapper never commits); the
  label is on this PR. The real push with `gh` logged in is run 5's (riskiest unfalsified)
- risk tier: high (`.devcontainer/`, `scripts/agent/`); label `config-change-approved` (D-19)

## For the lead: rebuild and check (from the host checkout, on this branch)

The Dockerfile gains one layer, so the rebuild is short; volumes (logins, the identity, the clone) survive. The
`gh auth setup-git` step is no longer needed (its old entry in the runner-runs file is harmless). If `firewall` exits
with "cannot read api.github.com/meta", the unauthenticated limit is spent (B1.70): wait and rerun the `up` line.

```bash
docker compose -f .devcontainer/runner/docker-compose.yml up -d --build --force-recreate --wait
docker compose -f .devcontainer/runner/docker-compose.yml exec runner git pull --ff-only
docker compose -f .devcontainer/runner/docker-compose.yml exec runner git config --system --list
docker compose -f .devcontainer/runner/docker-compose.yml exec runner scripts/agent/sandbox-probe.sh
```

Expected: both containers `Healthy`; `git pull` brings the clone's `main` to this merge; `git config --system --list`
prints `credential.https://github.com.helper=!/usr/bin/gh auth git-credential`; the probe ends "ok S12" and
"12 probes OK" (S12's credential fill succeeds with the `gh` login in `runner-gh`; nothing is printed).

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

`/review-loop` pass 1/3 (reviewer: vitest 202, playwright 43, stryker 93.40; every `scripts/ci` guard OK except
`check-config-change` before this PR's label and `verify-red` finding no `(red)` commit, as the plan says).

| Pass | #   | Finding                                                                                           | Kind     | Disposition      | Justification                                                                          |
| ---- | --- | ------------------------------------------------------------------------------------------------- | -------- | ---------------- | -------------------------------------------------------------------------------------- |
| 1    | 1   | R15's `system` case had no control push of its own (a host global `core.hooksPath` could mask it) | coverage | fix now          | `1ac7441`: `GIT_CONFIG_SYSTEM` alone must make a plain push fire the hook first        |
| 1    | d1  | S12 prints "credential fill skipped: not the runner"                                              | doubt    | no change needed | printed only without the marker, where the fill really is skipped                      |
| 1    | d2  | R15's control vs a host global `core.hooksPath`                                                   | doubt    | no change needed | `GIT_CONFIG_GLOBAL` replaces `~/.gitconfig` for that push; the gap was the system case |
| 1    | d3  | old image checked by its two config assertions, not a full probe run                              | doubt    | no change needed | a full run would copy the script into the lead's container                             |

Riskiest unfalsified: a real wrapper push with `gh` logged in (the helper returning the token in the cleared
environment) and `gh pr create --draft --head` in gh 2.23.0 pushing nothing: run 5 on the rebuilt runner is the first
proof of both. The fix after pass 1 is a test-only control (no wrapper, image or probe-logic change), so no pass 2.

## Evidence

- AC met: 5/5 (live push pending run 5)
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
