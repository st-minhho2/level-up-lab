# B1.76 plan — The PR wrapper keeps the runner container's git credential and identity (tooling, no §)

Approach: **A** (`advice.md`) — the image sets GitHub's credential helper at git's **system** scope (`/etc/gitconfig`,
root-owned, read-only to node). The wrapper clears every `GIT_CONFIG_*` variable (the B1.23 threat: an injected config
in the environment) but still reads system scope, so its push gets the helper; `scripts/pr-step.sh` is unchanged.
Measured by the advisor in the runner: the wrapper's environment alone reproduces run 4's error; with the helper at
system scope the credential lookup succeeds. Risk tier **high** (`.devcontainer/`, `scripts/agent/`) → the lead's
`approve`; the PR carries `config-change-approved` (D-19); one image rebuild by the lead.

**The lead decides at this gate** (defaults proposed):

1. **Direction A** over the card's (a) (`git config --global` and `gh auth setup-git` would write `~/.gitconfig`, lost
   on recreate; `--global --get` does not follow includes), (b) and (c) (both change the permission-boundary wrapper,
   and the runner marker cannot be faked honestly in a host smoke test).
2. **Card deviation**: the wrapper never commits (push, draft, ready, open only), so it needs the credential, not the
   identity; and the red probe is S12 in `sandbox-probe.sh` (red on the host and in today's container), not a red
   `pr-step-smoke.sh` probe. R15 there is a hardening guard, green on arrival. This PR amends the card's Test and
   Acceptance lines (commit `docs(backlog): B1.76 card lines`).
3. **Run 5** (after merge and rebuild): resume the container worktree `chore/B1.66-agent` at 3b09a57 with
   `RUNNER_MAX_TURNS=25 RUNNER_BUDGET_USD=1`; its stale "Waiting on human" row (3b09a57) is the run's own to drop when
   it resumes, not edited by hand. Merging `origin/main` into it is not needed (no conflict, no step depends on it).

## Files

| File                                      | Change                                                                                               |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `.devcontainer/runner/Dockerfile`         | one `RUN` before `USER node`: `/usr/bin/gh` exists, `git config --system` helper for github.com      |
| `scripts/agent/sandbox-probe.sh`          | S12 (red first); header S1–S12                                                                       |
| `scripts/pr-step-smoke.sh`                | R15: `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_COUNT/KEY/VALUE`, `GIT_CONFIG_SYSTEM` never reach the push     |
| `.devcontainer/runner/docker-compose.yml` | header only: `gh auth setup-git` line → a comment (helper in the image); "11 probes OK" → "12" twice |
| `scripts/CLAUDE.md`                       | the `pr-step-smoke.sh` row R1–R15 (the sandbox row stays B1.72's)                                    |
| `backlog/plan/E1-todos.md`                | decision 2: B1.76 Test and Acceptance lines                                                          |
| `backlog/work/B1.76/*`                    | advice, plan, review, pr-body                                                                        |

## Interfaces touched

```
Dockerfile   RUN test -x /usr/bin/gh && git config --system 'credential.https://github.com.helper' '!/usr/bin/gh auth git-credential'
S12  with every GIT_CONFIG_* cleared, as the wrapper does: git config --get-urlmatch credential.helper https://github.com
     = '!/usr/bin/gh auth git-credential' · /etc/gitconfig owned by root, not writable by node ·
     GIT_TERMINAL_PROMPT=0 git credential fill exits 0 (stdout to /dev/null, never printed)
R15  control: GIT_CONFIG_GLOBAL with core.hooksPath → a pre-push hook fires on a plain push; through pr-step.sh push with
     GIT_CONFIG_GLOBAL, then GIT_CONFIG_COUNT/KEY_0/VALUE_0, then GIT_CONFIG_SYSTEM: exit 0, no hook fired, origin updated
```

## Verification

- Red `test(scripts): B1.76 wrapper credential probes` (no `(red)` marker): host `sandbox-probe.sh` → "11 of 12 probes
  FAILED" (S12 new); `pr-step-smoke.sh` → "15 probes OK" (R15 green on arrival, hardening).
- Green `chore(scripts): B1.76 credential helper at system scope` (no probe file): throwaway `-p b176-verify`, public
  clone at the pushed branch, no `gh` login: old image → S12 says the helper is missing and `/etc/gitconfig` absent;
  new image → S12 says only "credential fill failed" (no login there), the other 11 ok. `pnpm lint && pnpm typecheck
&& pnpm test`; `pr-step-smoke` 15, `run-smoke` 17, `hook-smoke` 522, `check-plan-scope`, `check-backlog` OK. Hand
  mutants (advice) each caught; `down -v` after.
- Lead's hands (PR body): `up -d --build --force-recreate --wait`, `git pull --ff-only` in the clone,
  `sandbox-probe.sh` → "12 probes OK". Then run 5 is the live proof (A5: draft PR).

Steps: 1 red · 2 green · 3 reviewer (diff) · 4 PR. All dev-lead (no `src/`). Not in scope: `scripts/pr-step.sh`, B1.70,
B1.71, B1.72, B1.73.

Plan review: · Plan approved by: · Rounds: 1
