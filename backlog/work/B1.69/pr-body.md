## Item

B1.69 — The runner container keeps a git identity, and a probe proves it (tooling, no spec section)

- spec: none — tooling (D-27, D-29); no `src/` change, no section
- test: `scripts/agent/sandbox-probe.sh` S11 and `scripts/agent/run-smoke.sh` R17 (new) — pending
- acceptance: B1.69's five clauses — pending
- identity the runner's commits carry: a named bot, `level-up-lab runner <runner@level-up-lab.invalid>`, not the
  lead's own (plan decision 1)
- risk tier: high (`.devcontainer/`, `scripts/agent/`); label `config-change-approved` (D-19)

## For the lead: rebuild and check (from the host checkout, on this branch)

pending (filled after the green commit)

## Plan

### B1.69 plan — The runner container keeps a git identity, and a probe proves it (tooling, no §)

Approach: **A** (`advice.md`) — the identity lives in the `runner-runs` volume through the `GIT_CONFIG_GLOBAL` the
compose file already sets; one documented setup step writes it, S11 proves it, `run.sh` refuses a run without it. No
image, service, volume or env change. Risk tier **high** (`scripts/agent/`, `.devcontainer/` are CONFIG_PROTECTED) →
the lead's `approve`; the PR carries `config-change-approved` (D-19).

Round 2 (plan review r1: 4 reasons, "r1 #n" below). **The lead decides at this gate** (defaults proposed):

1. **Whose identity** (card: "the lead's own or a named bot", the PR says which): **bot**, name `level-up-lab runner`,
   email `runner@level-up-lab.invalid`. The exact text can sit in the repo (artifacts name roles); `.invalid` never
   maps to a GitHub account; runner commits differ from the lead's in `git log --author`, beside the `Agent-Run:`
   trailer. Nothing keys on author (metrics read the trailer, CODEOWNERS is paths, the ruleset has no author rule).
   Where the bot shows (r1 #2; `main.json:30` allows squash and rebase): **rebase** merge → the bot is the author of
   those commits on `main`; **squash** → the squash commit's author is the PR author (the lead), and GitHub may add a
   `Co-authored-by:` trailer naming the bot [unverified]. Alternative: the lead's own, set by hand, never written in
   the repo. The container's current hand-set identity is replaced by the header step.
2. **B1.72** (its card and README row say "S1–S10"; this card adds S11, r1 #1): **leave B1.72 as filed** here; its
   five "S1–S10" places (title, Status, Acceptance, README row and node) are B1.72's own edit when it is picked after
   B1.69. Alternative: this PR edits all five plus Blocked by (two more Files rows).
3. **Where the step is written** (r1 #3; card: "`.devcontainer/runner/` README or script"): a reading, not a literal
   match: the compose file's header is the runner's only setup document today (it already lists every lead step), so
   the two lines go there. Alternative: a new `.devcontainer/runner/README.md` holding the step (one more file).

#### Files

| File                                      | Change                                                                                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/agent/run-smoke.sh`              | R17 (refusal, red first); `run()` and R5/R13's direct calls export `GIT_CONFIG_GLOBAL=${GITCFG:-$TMP/gitconfig}`, `GIT_CONFIG_NOSYSTEM=1` (r2 C1) |
| `scripts/agent/sandbox-probe.sh`          | S11 (red first); header S1–S11                                                                                                                    |
| `scripts/agent/run.sh`                    | `identity_problem()`; first step of `preflight` unless `binary`; header line                                                                      |
| `.devcontainer/runner/docker-compose.yml` | header only: two `git config --global` lines + one comment line; "10 probes OK" → "11" twice                                                      |
| `backlog/work/B1.69/*`                    | advice, plan, review, pr-body                                                                                                                     |

#### Interfaces touched

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

#### Verification

- Red `test(scripts): B1.69 git identity probes` (no `(red)` marker: no vitest file, B1.62 #185): host
  `run-smoke.sh` → "1 of 17 probes FAILED" (R17); host `sandbox-probe.sh` → "10 of 11 probes FAILED" (today 9 of 10;
  S11 FAIL names the step).
- Green `chore(scripts): B1.69 runner git identity` (no probe file): `run-smoke.sh` "17 probes OK"; `tier-smoke.sh`
  "9 probes OK"; `hook-smoke.sh` "511 probes OK"; `pnpm lint && pnpm typecheck && pnpm test` green;
  `check-plan-scope.sh`, `check-backlog.sh` OK. R17 runs by hand only: `run-smoke.sh` is not in CI until B1.60 (r1 #4).
- Container (dev-lead; `P="docker compose -p b169-verify -f .devcontainer/runner/docker-compose.yml"`, no login):
  `$P up -d --build --wait`; `$P exec runner git clone https://github.com/st-minhho2/level-up-lab.git .`;
  `$P exec runner git fetch origin chore/B1.69-runner-git-identity`; `$P exec runner git checkout FETCH_HEAD`.
  Before the step: `$P exec runner scripts/agent/sandbox-probe.sh` → "1 of 11 probes FAILED" (S11);
  `$P exec runner scripts/agent/run.sh 184` → exit 1, the `[run] no git identity` line, no `runs/184`. The header's two
  lines, then: probe → "11 probes OK"; `run.sh 184` → "[run] claude is not logged in" (past the identity check).
  `$P up -d --build --force-recreate --wait` → probe "11 probes OK" (volume kept). `$P down -v`. Hand mutations
  (advice "Mutation hot spots") each caught.
- Lead's hands (PR body): rebuild `level-up-lab-runner`, the two header lines, `sandbox-probe.sh` → "11 probes OK".

Steps: 1 red · 2 green · 3 reviewer (diff) · 4 PR. All dev-lead (no `src/`). Not in scope: Dockerfile, B1.70
(`init-firewall.sh`), B1.71 (`worktree.sh`), `scripts/CLAUDE.md` (B1.72), signing, the `Agent-Run:` hook.

Plan review: approved, round 2 (round 1: 4 reasons, addressed; r2 C1 folded into the run-smoke row) · Plan approved by: lead, 2026-11-03 (decisions 1–3 as proposed: bot identity, B1.72 left as filed, step in the compose header) · Rounds: 1

## Map delta

none (tooling, no `spec/features-map.md` row)

## Review

pending

## Evidence

- AC met: 0/5
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
