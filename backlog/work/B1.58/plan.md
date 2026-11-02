# B1.58 plan — The runner's devcontainer: allow-list firewall, Linux claude build (tooling, no §)

Approach: a second, runner-only container next to the dev one (`.devcontainer/runner/`), so the human dev container
(root, docker socket, playwright) and `compose-smoke.sh` C5 stay as they are. Advisor skipped (tier quick). Risk tier
**high** (`scripts/agent/`) → lead `approve`; label `config-change-approved` (D-19).

**The lead decides at this gate** (defaults proposed):

1. **Workspace = a clone in a volume, not the host repo.** A bind mount of the host repo lets a run write
   `.git/config` (`core.fsmonitor`, `core.hooksPath`) or `.git/hooks`, which the lead's next host `git` executes: no
   boundary. The runner clones from GitHub into volume `runner-repo`; its work reaches the host only as pushed branches.
2. **Pins:** `@anthropic-ai/claude-code@2.1.303` from npm (published 2026-10-18, 15 days; 2.1.309, the host's verified
   build, is 11 days old). Base image `node:24-bookworm` = `CI_IMAGE` (the existing dependency, same floating tag as CI).
   Debian bookworm packages `iptables ipset iproute2 dnsutils aggregate jq sudo gh` (gh 2.23 from bookworm, no new
   apt source). New dependencies: the npm package and those 8 apt packages.
3. **Allow list:** GitHub (`api.github.com/meta` web, api, git ranges), `registry.npmjs.org`, Anthropic
   (`api.anthropic.com`, `claude.ai`, `platform.claude.com`, `console.anthropic.com`), DNS, loopback, the compose
   network (Postgres). Telemetry and updater off (`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1`, `DISABLE_AUTOUPDATER=1`).

Costs: DNS (udp 53) and GitHub stay open, so a run can still send data out through a gist or the lead's gh token
(lead: log in with a fine-grained token for this repo only). Prisma engines (`binaries.prisma.sh`) and Playwright
browsers are not on the list: a full issue run inside (`pnpm install`, e2e) is B1.59's to settle; this card proves
`--check-binary`. CDN IPs are resolved at start, so a rotated IP is refused until a restart. `bypassPermissions`
still runs every hook and `--disallowedTools`; the firewall, not run.sh, is the boundary.

## Files

| File                                      | Change                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| `.devcontainer/runner/Dockerfile`         | new: base, apt list, claude pin, marker, user `node`, sudo only for firewall |
| `.devcontainer/runner/init-firewall.sh`   | new: ipset allow list, default REJECT, self-check both ways; copied to image |
| `.devcontainer/runner/docker-compose.yml` | new: service `runner`, cap NET_ADMIN/NET_RAW, volumes, env, no docker socket |
| `.devcontainer/runner/devcontainer.json`  | new: the same service for VS Code; remoteUser `node`                         |
| `scripts/agent/run.sh`                    | `--mode`; `sandboxed()` picks `bypassPermissions`, else `dontAsk`            |
| `scripts/agent/run-smoke.sh`              | R6 `dontAsk` on the host; new R15 `--mode` refuses bypass on the host        |
| `scripts/agent/sandbox-probe.sh`          | new: S1–S6, run inside the container                                         |
| `scripts/CLAUDE.md`                       | rows for `agent/sandbox-probe.sh` and `agent/run.sh --mode`                  |
| `backlog/work/B1.58/plan.md`              | this plan                                                                    |
| `backlog/work/B1.58/review.md`            | plan and diff reviews                                                        |
| `backlog/work/B1.58/pr-body.md`           | PR body                                                                      |

## Interfaces touched

```
scripts/agent/run.sh --mode   stdout bypassPermissions|dontAsk, exit 0. sandboxed() = uname Linux ∧ /etc/level-up-lab-runner
  (written by the Dockerfile) ∧ curl https://example.com refused ∧ curl https://api.github.com reachable (5 s each).
  run_issue and check_binary pass --permission-mode "$(mode)"; no env var or flag forces bypass.
scripts/agent/sandbox-probe.sh   exit 0 all ok · 1 any FAIL. S1 example.com, 1.1.1.1:443 refused · S2 github.com,
  registry.npmjs.org, api.anthropic.com reachable · S3 claude --version = 2.1.303 · S4 run.sh --mode = bypassPermissions
  · S5 user node, `iptables -F` refused without sudo · S6 the claude config dir is a volume mount, none under the repo
docker compose -f docker-compose.yml -f .devcontainer/runner/docker-compose.yml up -d --build runner
  entrypoint: sudo init-firewall.sh && exec sleep infinity (firewall fails → container exits). Config dir
  /home/node/.claude (volume runner-claude), DATABASE_URL → postgres:5432; volumes runner-repo, runner-claude, pnpm-store
```

## Verification

- Red `test(scripts): B1.58 sandbox probes`: on the host `sandbox-probe.sh` exit 1 (S1 example.com reachable, S3 no
  claude); run-smoke R15 FAIL (no `--mode`). Green: run-smoke "15 probes OK" (`bash` 3.2), tier-smoke 9, `pnpm lint &&
pnpm typecheck && pnpm test` green, compose-smoke 6/6 (dev overlay unchanged), check-plan-scope, check-backlog OK.
- Lead's hands (exact commands in the PR body): build/up, `gh auth login`, clone into the volume, `claude auth login`,
  then `sandbox-probe.sh` 6/6 and `run.sh --check-binary` pass inside (≤ 2 live runs, 2 turns, USD 1 each).

| Step     | Role / skill    | Produces                     | Commit                                 |
| -------- | --------------- | ---------------------------- | -------------------------------------- |
| 1 red    | dev-lead        | sandbox-probe.sh, R6/R15     | `test(scripts): B1.58 sandbox probes`  |
| 2 green  | dev-lead        | container, run.sh, CLAUDE.md | `chore(scripts): B1.58 runner sandbox` |
| 3 review | reviewer (diff) | `review.md`                  | `docs(backlog): B1.58 review`          |

Not in scope: B1.59 (launchd, a full issue run inside), Prisma/Playwright offline cache, `CONFIG_PROTECTED` for
`.devcontainer/` (follow-up card).

Plan review: pending · Plan approved by: · Rounds: 1
