## Item

B1.58 — The runner's devcontainer: a firewall that allows only GitHub, npm and Anthropic, and the Linux claude build
(tooling, no spec section)

- spec: none — tooling (D-26, D-27); no `src/` change, no section
- test: `scripts/agent/sandbox-probe.sh` S1–S7 (inside the container), `scripts/agent/run-smoke.sh` R6/R15 and
  `scripts/agent/tier-smoke.sh` T3 (offline, host). Red `69ce71a` (run-smoke 13/15, tier-smoke 8/9, sandbox-probe on
  the host 1/7), `0258b7f`, review pass 1 `23e7f63`; green on the host: run-smoke 15/15, tier-smoke 9/9 (bash 3.2).
  Inside the container: [unverified] until the lead's steps below.
- acceptance: B1.58's four clauses (firewall both ways, pinned Linux build with `--check-binary` inside, the lead's own
  login inside with no credential baked, `bypassPermissions` only in the firewalled container, refused on the host):
  host side proven (R6, R15); container side pending the lead's steps
- risk tier: high (`scripts/agent/`, `scripts/ci/`, `.devcontainer/`); label `config-change-approved` (D-19)
- follow-up: B1.62 (#174), the image carries the Prisma engines and Playwright's browser

## For the lead: build, log in, probe (from the host checkout, on this branch)

```bash
docker compose -f .devcontainer/runner/docker-compose.yml up -d --build
docker compose -f .devcontainer/runner/docker-compose.yml exec runner gh auth login
docker compose -f .devcontainer/runner/docker-compose.yml exec runner gh auth setup-git
docker compose -f .devcontainer/runner/docker-compose.yml exec runner git clone https://github.com/st-minhho2/level-up-lab.git .
docker compose -f .devcontainer/runner/docker-compose.yml exec runner git checkout chore/B1.58-sandbox
docker compose -f .devcontainer/runner/docker-compose.yml exec runner claude auth login
docker compose -f .devcontainer/runner/docker-compose.yml exec runner scripts/agent/sandbox-probe.sh
docker compose -f .devcontainer/runner/docker-compose.yml exec -e RUNNER_BUDGET_USD=1 runner scripts/agent/run.sh --check-binary
docker compose -f .devcontainer/runner/docker-compose.yml stop
docker compose -f .devcontainer/runner/docker-compose.yml up -d
docker compose -f .devcontainer/runner/docker-compose.yml exec runner scripts/agent/sandbox-probe.sh
```

Expected: `up` prints the firewall's "allow list applied: N entries" in `docker compose … logs firewall` and starts
`runner` once `firewall` is healthy; `sandbox-probe.sh` → "7 probes OK"; `--check-binary` → "claude '2.1.303 (Claude
Code)' verified" (2 turns, under USD 1); after stop and `up -d`, the probe again → "7 probes OK". gh: a fine-grained token for this repo with a short expiry. After a suspect
run: `docker compose -f .devcontainer/runner/docker-compose.yml down -v`.

## Plan

Approved by the lead 2026-11-02 (decisions 1–5 as proposed); the "Changed after approval" block waits for the lead's
`approve` again.

### B1.58 plan — The runner's devcontainer: allow-list firewall, Linux claude build (tooling, no §)

Round 3 (plan review r1: 7 reasons, r2: 6 reasons, all addressed, "r2 #n" below; round 3 not re-reviewed: 2-round
cap). Approach: a runner-only compose project of its own (`.devcontainer/runner/`, `name: level-up-lab-runner`): no
Postgres, no shared volume, no docker socket; the dev container and `compose-smoke.sh` stay as they are. No
`devcontainer.json`: VS Code needs hosts the allow list refuses (r2 #6); the lead uses `docker compose`. Advisor
skipped (tier quick). Risk tier **high** (`scripts/agent/`, `scripts/ci/`) → lead `approve`; label (D-19).

**The lead decides at this gate** (defaults proposed):

1. **Workspace = a clone in a volume, not the host repo.** A bind mount lets a run write `.git/config` or
   `.git/hooks`, which the lead's next host `git` executes. The runner clones from GitHub into volume `runner-repo`.
2. **Pins:** `@anthropic-ai/claude-code@2.1.303` (npm, 2026-10-18, 15 days; its `-linux-arm64` package is the Linux
   build). Deviation: the card names the desktop's `claude-code-vm` binary, app-internal and not fetchable by a build.
   Base `node:24.22.1-bookworm@sha256:d862bb5d…08ea` (r2 #3). Deviation: Node 24.22.1 is a security release of
   2026-10-20 (13 days; 14 on 2026-11-03) and the digest was pushed 2026-10-28; the alternative that meets 14 days,
   `24.21.0-bookworm@sha256:3d27e5c1…add0` (2026-10-06), lacks two security releases. Debian bookworm packages
   `iptables ipset iproute2 dnsutils aggregate jq gh` are not version-pinned (old versions leave the mirror).
3. **Allow list:** GitHub (`api.github.com/meta` web, api, git), `registry.npmjs.org`, Anthropic (`api.anthropic.com`,
   `claude.ai`, `platform.claude.com`, `console.anthropic.com`), DNS only to Docker's `127.0.0.11` (r2 #2), loopback;
   not the host gateway; IPv6 off and DROP. Telemetry and updater off.
4. **Protect `.devcontainer/` now:** `\.devcontainer/.*` joins `CONFIG_PROTECTED` (plans that touch it rate high).
5. **Follow-up B1.62** (filing lane, own PR, before this PR is ready; B1.59 depends on it, r2 #4): the image carries
   the Prisma engines and Playwright browsers, so `worktree.sh`'s `pnpm install` and e2e run inside without
   `binaries.prisma.sh` or the Playwright CDN.

Costs: the repo is **public**; a run can read the Claude login and gh token its own tools need and push them to a
branch or gist; the firewall bounds where data goes, not what goes to GitHub or Anthropic (and DNS lookups through
127.0.0.11 still reach any name server). Mitigation: a fine-grained gh token for this repo, short expiry; revoke on a
leak. No sudo in the image (r2 #1); root runs only in the `firewall` service (below); `run.sh --mode` also needs
uid ≠ 0. Volumes carry one run's writes (clone
`.git/hooks`, `.git/config`, `runner-claude`) into later runs, inside the firewall; after a suspect run the lead
removes the volumes (r2 #5). Host and container keep separate locks and stop marks, so after this card the lead runs
`run.sh` only inside (the branch cap still counts open PRs on both). `--disallowedTools` under `bypassPermissions` is
[unverified] in 2.1.303; hooks are proven by `--check-binary`. CDN IPs resolve at start; restart on a rotated IP.

**Changed after approval** (needs the lead's `approve` again; Files unchanged):

- **Firewall sidecar** (diff review 1 #1): an exec gets the container's bounding set, not PID 1's, so with the
  entrypoint-plus-setpriv design a plain (root) `exec runner` kept NET_ADMIN and could flush the rules. Now one image,
  two services: `firewall` (root, `cap_add` NET_ADMIN, NET_RAW only, IPv6 sysctls, healthy after its check both ways)
  and `runner` (`network_mode: service:firewall`, `user` node, `cap_drop: [ALL]`, no `cap_add`, `no-new-privileges`,
  starts only once `firewall` is healthy). Every exec into `runner`, root included, has `CapBnd` 0: S5 as approved,
  plus `NoNewPrivs` 1 (`0258b7f` → `23e7f63`, fix `5057810`). No setpriv, no entrypoint in the image.
- S4 also expects `dontAsk` with an `id` shim printing 0 and a `uname` shim printing Darwin (diff review 1 #2).
- The lead's commands check out `chore/B1.58-sandbox` after the clone until this merges (diff review 1 #3); git's
  global config lives in `runner-runs` (`GIT_CONFIG_GLOBAL`); `init: true` on both services.
- The ready mark lives on a tmpfs `/run` and is removed at every start, so a stop and `up -d` waits for the check
  again (diff review 2 #1, `50bfcc7`); the lead's commands end with stop, `up -d` and `sandbox-probe.sh` again.
- New cost: `runner-runs` holds git's global config and `verified-versions`, and a run under `bypassPermissions` can
  write both (an alias or hook path for later runs, a version line); like the clone, they stay inside the firewall,
  and `down -v` clears them.
- New cost: an allowed CDN address (npm, claude.ai) also serves other sites behind the same edge; IPs stay pinned
  until a restart. A root exec into `firewall` can still change the rules: only the lead uses that service.

#### Files

| File                                      | Change                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| `.devcontainer/runner/Dockerfile`         | new: base, apt, claude pin, `/etc/level-up-lab-runner`, user node, no sudo   |
| `.devcontainer/runner/init-firewall.sh`   | new: ipset allow list, REJECT, ip6tables DROP, self-check, ready mark        |
| `.devcontainer/runner/docker-compose.yml` | new: project `level-up-lab-runner`: `firewall` + `runner` (no caps), volumes |
| `scripts/agent/run.sh`                    | `--mode`; `sandboxed()` picks `bypassPermissions`, else `dontAsk`            |
| `scripts/agent/run-smoke.sh`              | R6 `dontAsk` on the host; new R15 `--mode` on the host                       |
| `scripts/agent/sandbox-probe.sh`          | new: S1–S7, run inside the container                                         |
| `scripts/ci/lib.sh`                       | `CONFIG_PROTECTED` adds `\.devcontainer/.*`                                  |
| `scripts/agent/tier-smoke.sh`             | T3 adds `.devcontainer/runner/init-firewall.sh` → high                       |
| `scripts/CLAUDE.md`                       | rows for `agent/sandbox-probe.sh` and `agent/run.sh --mode`                  |
| `backlog/work/B1.58/*`                    | plan, review, pr-body                                                        |

#### Interfaces touched

```
scripts/agent/run.sh --mode   stdout bypassPermissions|dontAsk, exit 0. sandboxed() = uname Linux ∧ uid ≠ 0 ∧
  /etc/level-up-lab-runner ∧ curl https://example.com refused ∧ curl https://api.github.com reachable (5 s each).
  run_issue and check_binary pass --permission-mode "$(mode)"; no env var or flag forces bypass.
scripts/agent/sandbox-probe.sh   exit 0 all ok · 1 any FAIL. S1 example.com, 1.1.1.1:443, -6, host.docker.internal:5433,
  dig @1.1.1.1 refused · S2 github.com, registry.npmjs.org, api.anthropic.com reachable · S3 claude --version 2.1.303
  · S4 --mode bypassPermissions; curl shim reaching all, or none → dontAsk · S5 uid node, no sudo, CapBnd 0,
  `iptables -F` and `init-firewall.sh` refused, rules unchanged after · S6 claude config dir a mount, no
  `.credentials.json` in the repo · S7 no `postgres` host
docker compose -f .devcontainer/runner/docker-compose.yml up -d --build   (firewall fails → runner never starts)
  volumes runner-repo, runner-claude, runner-gh, runner-runs, runner-pnpm-store
```

#### Verification

- Red `test(scripts): B1.58 sandbox probes`: host `sandbox-probe.sh` exit 1 (S1 example.com reachable, S3 no claude);
  run-smoke R15 FAIL (no `--mode`); tier-smoke T3 FAIL. Green (`bash` 3.2): run-smoke 15/15 (R15: real uname, and a
  Linux `uname` shim with a firewall-like curl shim → `dontAsk`: no marker), tier-smoke 9/9, `pnpm lint && pnpm
typecheck && pnpm test` 202 green, compose-smoke 6/6, check-plan-scope, check-backlog OK.
- Lead's hands (exact commands in the PR body): up, `gh auth login`, clone, `claude auth login`, then inside
  `sandbox-probe.sh` 7/7 and `run.sh --check-binary` pass (≤ 2 live runs, 2 turns, USD 1 each).

Steps: 1 red `test(scripts): B1.58 sandbox probes` · 2 green `chore(scripts): B1.58 runner sandbox` · 3 reviewer (diff)
`docs(backlog): B1.58 review`; B1.62 filing PR. All dev-lead (no `src/`). Not in scope: B1.59, a GitHub secret guard.

Plan review: changes requested, round 2 (6 reasons carried into round 3, not re-reviewed: 2-round cap) · Plan approved
by: lead, 2026-11-02 (decisions 1–5 as proposed) · Rounds: 2 (re-approval pending for "Changed after approval")

## Map delta

None: tooling, no `spec/features-map.md` row.

## Review

Plan review: r1 7 reasons, r2 6 reasons, round 3 not re-reviewed (2-round cap). Diff review (`backlog/work/B1.58/review.md`):

| Pass | #   | Finding                                                                          | Disposition  | Commit               |
| ---- | --- | -------------------------------------------------------------------------------- | ------------ | -------------------- |
| 1    | 1   | a root `exec runner` kept NET_ADMIN; S5 loosened before re-approval              | fix now      | `23e7f63`, `5057810` |
| 1    | 2   | deleting sandboxed()'s uid check left every probe green                          | fix now      | `23e7f63`            |
| 1    | 3   | the lead's commands cloned main (old `--check-binary` mode); PR body lacked them | fix now      | `5057810`, this body |
| 1    | n1  | PID 1 `sleep` without init; `~/.gitconfig` not persisted                         | fix now      | `5057810`            |
| 1    | n2  | no git identity in the image, so `run.sh <issue>` cannot commit inside yet       | out of scope | B1.59 / B1.62 plan   |

| 2 | 1 | the ready mark survived a stop, so runner started before the new namespace had rules | fix now | `50bfcc7` |
| 2 | n | two image tags from two `build: .`; Evidence "plan deviations: none" | no change needed | same Dockerfile and cache; no file outside Files |

Pass 3: pending.

## Evidence

- AC met: 0/4 (host side of clause 4 proven; container side pending the lead's steps)
- tier: pending
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [x] Red commit precedes the change commit.
- [x] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change carries `config-change-approved`.
- [ ] `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
