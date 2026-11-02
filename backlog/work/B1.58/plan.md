# B1.58 plan — The runner's devcontainer: allow-list firewall, Linux claude build (tooling, no §)

Round 2 (plan review r1: 7 reasons, "r1 #n" below). Approach: a runner-only compose project of its own
(`.devcontainer/runner/`, `name: level-up-lab-runner`): no Postgres, no shared volume, no docker socket, so the dev
container and `compose-smoke.sh` stay as they are (r1 #1, #2). Advisor skipped (tier quick). Risk tier **high**
(`scripts/agent/`, `scripts/ci/`) → lead `approve`; label `config-change-approved` (D-19).

**The lead decides at this gate** (defaults proposed):

1. **Workspace = a clone in a volume, not the host repo.** A bind mount lets a run write `.git/config`
   (`core.fsmonitor`, `core.hooksPath`) or `.git/hooks`, which the lead's next host `git` executes. The runner clones
   from GitHub into volume `runner-repo`; its work reaches the host only as pushed branches.
2. **Pins (r1 #6):** `@anthropic-ai/claude-code@2.1.303` (npm, 2026-10-18; its `-linux-arm64` optional package is the
   Linux build). Deviation: the card names the desktop's `claude-code-vm` binary; it is app-internal, not fetchable
   by a build, and 2.1.309 is 11 days old. Base `node:24.22.0-bookworm` (Node 2026-10-14; `CI_IMAGE` keeps the floating
   `node:24-bookworm`). Deviation: the 8 Debian bookworm packages `iptables ipset iproute2 dnsutils aggregate jq sudo
gh` are not version-pinned (bookworm security updates drop old versions from the mirror); gh is bookworm's 2.23.
3. **Allow list:** GitHub (`api.github.com/meta` web, api, git ranges), `registry.npmjs.org`, Anthropic
   (`api.anthropic.com`, `claude.ai`, `platform.claude.com`, `console.anthropic.com`), DNS, loopback; nothing else,
   not the host gateway, IPv6 off and DROP (r1 #5). Telemetry and updater off.
4. **Protect `.devcontainer/` now (r1 #4):** add `\.devcontainer/.*` to `CONFIG_PROTECTED`, so a plan that widens
   the firewall rates high and needs the label once B1.55 lets low/medium plans pass without the lead.

Costs (r1 #3, read before approving): the repo is **public**. A run can read the Claude login and the gh token in its
own container (the claude and gh it uses need them) and push them to a branch or a gist: the firewall bounds where
data goes, not what goes to GitHub or Anthropic. Mitigation is revocation: a fine-grained gh token for this repo with
a short expiry, the Claude session revoked after a leak. DNS stays open. Under `bypassPermissions`, `--disallowedTools`
is unverified in 2.1.303 [unverified]; hooks are proven by `--check-binary`, `RUNNER_CHILD` is env, not permissions.
Prisma engines and Playwright browsers are off the list: a full issue run inside is B1.59's; this card proves
`--check-binary`. CDN IPs resolve at start; a rotated one is refused until a restart. Inside, a run can edit the
clone's `run.sh` or `verified-versions` (r1 #7): it gains nothing the firewall does not still bound, and the binary is
root-owned in the image. Volumes persist login, gh, runs (`verified-versions`, stop marks) across rebuilds (r1 #7).

## Files

| File                                      | Change                                                                           |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| `.devcontainer/runner/Dockerfile`         | new: base, apt, claude pin, `/etc/level-up-lab-runner`, user node, sudoers 1 cmd |
| `.devcontainer/runner/init-firewall.sh`   | new: ipset allow list, default REJECT, ip6tables DROP, self-check both ways      |
| `.devcontainer/runner/docker-compose.yml` | new: project `level-up-lab-runner`, cap NET_ADMIN/NET_RAW, IPv6 off, volumes     |
| `.devcontainer/runner/devcontainer.json`  | new: the same service for VS Code; remoteUser node                               |
| `scripts/agent/run.sh`                    | `--mode`; `sandboxed()` picks `bypassPermissions`, else `dontAsk`                |
| `scripts/agent/run-smoke.sh`              | R6 `dontAsk` on the host; new R15 `--mode` on the host                           |
| `scripts/agent/sandbox-probe.sh`          | new: S1–S7, run inside the container                                             |
| `scripts/ci/lib.sh`                       | `CONFIG_PROTECTED` adds `\.devcontainer/.*`                                      |
| `scripts/agent/tier-smoke.sh`             | T3 adds `.devcontainer/runner/init-firewall.sh` → high                           |
| `scripts/CLAUDE.md`                       | rows for `agent/sandbox-probe.sh` and `agent/run.sh --mode`                      |
| `backlog/work/B1.58/*`                    | plan, review, pr-body                                                            |

## Interfaces touched

```
scripts/agent/run.sh --mode   stdout bypassPermissions|dontAsk, exit 0. sandboxed() = uname Linux ∧ /etc/level-up-lab-runner
  ∧ curl https://example.com refused ∧ curl https://api.github.com reachable (5 s each). run_issue and check_binary pass
  --permission-mode "$(mode)"; no env var or flag forces bypass.
scripts/agent/sandbox-probe.sh   exit 0 all ok · 1 any FAIL. S1 example.com, 1.1.1.1:443, -6, host.docker.internal:5433
  refused · S2 github.com, registry.npmjs.org, api.anthropic.com reachable · S3 claude --version = 2.1.303 · S4 --mode
  bypassPermissions; with a curl shim that reaches all, or none: dontAsk · S5 user node; `sudo -n iptables -F`,
  `sudo -n true` refused · S6 the claude config dir is a mount, no `.credentials.json` in the repo · S7 no `postgres` host
docker compose -f .devcontainer/runner/docker-compose.yml up -d --build   (sudo init-firewall.sh && exec sleep infinity;
  firewall fails → container exits) volumes runner-repo, runner-claude, runner-gh, runner-runs, runner-pnpm-store
```

## Verification

- Red `test(scripts): B1.58 sandbox probes`: host `sandbox-probe.sh` exit 1 (S1 example.com reachable, S3 no claude);
  run-smoke R15 FAIL (no `--mode`); tier-smoke T3 FAIL (`.devcontainer/` low). Green (`bash` 3.2): run-smoke 15/15
  (R15: real uname, and a `uname` shim saying Linux with a firewall-like curl shim → `dontAsk`: no marker), tier-smoke
  9/9, `pnpm lint && pnpm typecheck && pnpm test` 202 green, compose-smoke 6/6, check-plan-scope, check-backlog OK.
- Lead's hands (exact commands in the PR body): up, `gh auth login`, clone, `claude auth login`, then inside
  `sandbox-probe.sh` 7/7 and `run.sh --check-binary` pass (≤ 2 live runs, 2 turns, USD 1 each).

Steps: 1 red `test(scripts): B1.58 sandbox probes` · 2 green `chore(scripts): B1.58 runner sandbox` · 3 reviewer (diff)
`docs(backlog): B1.58 review`. All by dev-lead (no `src/`). Not in scope: B1.59 (launchd, full issue run inside),
Prisma/Playwright offline cache, a GitHub-side secret push guard.

Plan review: changes requested, round 1 (7 reasons, all addressed in round 2) · Plan approved by: · Rounds: 1
