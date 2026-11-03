# B1.69 plan — The runner container keeps a git identity, and a probe proves it (tooling, no §)

Approach: **A** (`advice.md`) — the identity lives in the `runner-runs` volume through the `GIT_CONFIG_GLOBAL` the
compose file already sets; one documented setup step writes it, S11 proves it, `run.sh` refuses a run without it. No
image, service, volume or env change. Risk tier **high** (`scripts/agent/`, `.devcontainer/` are CONFIG_PROTECTED) →
the lead's `approve`; the PR carries `config-change-approved` (D-19).

**The lead decides at this gate** (defaults proposed):

1. **Whose identity** (card: "the lead's own or a named bot", the PR says which): **bot** `level-up-lab runner
<runner@level-up-lab.invalid>` — exact text fits in the repo (artifacts name roles), `.invalid` never maps to a GitHub
   account, and runner commits differ from the lead's in `git log --author` beside the `Agent-Run:` trailer. Nothing
   keys on author (metrics read the trailer; CODEOWNERS is paths; ruleset has no author rule). On squash merge `main`
   shows the PR author (the lead); the bot stays on the branch. Alternative: the lead's own, set by hand, never written
   in the repo. The container's current hand-set identity is replaced by the header step.
2. **B1.72 order** (its Acceptance says the guide row "reads S1–S10"; this card adds S11): this PR edits B1.72's
   Acceptance to S1–S11 and adds B1.69 to its Depends on / Blocked by. Alternative: leave B1.72 as filed.

## Files

| File                                      | Change                                                                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `scripts/agent/run-smoke.sh`              | R17 (refusal, red first); `run()` exports `GIT_CONFIG_GLOBAL=${GITCFG:-$TMP/gitconfig}`, `GIT_CONFIG_NOSYSTEM=1` |
| `scripts/agent/sandbox-probe.sh`          | S11 (red first); header S1–S11                                                                                   |
| `scripts/agent/run.sh`                    | `identity_problem()`; first step of `preflight` unless `binary`; header line                                     |
| `.devcontainer/runner/docker-compose.yml` | header only: two `git config --global` lines + one comment line; "10 probes OK" → "11" twice                     |
| `backlog/plan/E1-todos.md`                | decision 2 only: B1.72 Acceptance S1–S11, Depends on B1.69                                                       |
| `backlog/README.md`                       | decision 2 only: B1.72 row Blocked by B1.69                                                                      |
| `backlog/work/B1.69/*`                    | advice, plan, review, pr-body                                                                                    |

## Interfaces touched

```
run.sh <issue> | --poll   no non-blank user.name or user.email (git config --get, from $ROOT) → exit 1, before auth,
  eligible.sh, --claim, worktree.sh, any claude -p:
  [run] no git identity: user.name or user.email is empty; set them once with the runner setup step 'git config --global user.name …' and 'user.email …' (header of .devcontainer/runner/docker-compose.yml, B1.69)
run.sh --check-binary | --mode   unchanged (no commit; S4 calls --mode)
sandbox-probe.sh S11  ok only if: GIT_CONFIG_GLOBAL set · its dir is a mount (S6's mountinfo test) · the file exists ·
  user.name and user.email non-blank in that file (--file, so .git/config cannot stand in) · git var GIT_AUTHOR_IDENT
  and GIT_COMMITTER_IDENT start with "name <email> "; FAIL names the header step and its command
compose header   exec runner git config --global user.name "level-up-lab runner"
                 exec runner git config --global user.email "runner@level-up-lab.invalid"
```

## Verification

- Red `test(scripts): B1.69 git identity probes` (no `(red)` marker: no vitest file, B1.62 #185): host
  `run-smoke.sh` → "1 of 17 probes FAILED" (R17); host `sandbox-probe.sh` → S11 FAIL with the step named.
- Green `chore(scripts): B1.69 runner git identity` (no probe file): `run-smoke.sh` "17 probes OK"; `tier-smoke.sh`,
  `hook-smoke.sh`, `pnpm lint && pnpm typecheck && pnpm test` green; `check-plan-scope.sh`, `check-backlog.sh` OK.
- Container (dev-lead, throwaway `-p b169-verify`, public clone at the pushed branch, no login, `down -v` after):
  before the step S11 FAIL + `run.sh 184` exit 1 with the line above, no `runs/184` log; after the step "11 probes OK";
  `up -d --build --force-recreate` → S11 still ok. Hand mutations (advice "Mutation hot spots") each caught.
- Lead's hands (PR body): rebuild of `level-up-lab-runner`, the two header lines, `sandbox-probe.sh` → "11 probes OK".

Steps: 1 red · 2 green · 3 reviewer (diff) · 4 PR. All dev-lead (no `src/`). Not in scope: Dockerfile, B1.70
(`init-firewall.sh`), B1.71 (`worktree.sh`), `scripts/CLAUDE.md` (B1.72), signing, the `Agent-Run:` hook.

Plan review: · Plan approved by: · Rounds: 1
