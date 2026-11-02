# B1.58 review

## Plan review (round 1)

SCOPE: tooling (no §; `scripts/agent/`, `.devcontainer/runner/`). Plan at `cc1c862`. Read: card B1.58, B1.44
plan/review (sandbox deferrals), B1.42 spike, B1.47 plan, `run.sh`, `run-smoke.sh`, `.devcontainer/*`,
`docker-compose.yml`, `compose-smoke.sh`, `scripts/ci/lib.sh`, `tier.sh`, D-19, D-25..D-28.

Probes run (none on the tree, none on the live database):

- `scripts/next-task.sh --check B1.58` → `[next-task] B1.58: no overlap with any Doing or Review card` (exit 0)
- `scripts/agent/tier.sh backlog/work/B1.58/plan.md` → `high`; `plan-files.sh --file` → 11 tokens, all in the table
- `npm view @anthropic-ai/claude-code time`: 2.1.303 published 2026-10-18T21:15Z (15 days), 2.1.309 2026-10-22 (11
  days); 2.1.303 ships the native binary as `optionalDependencies` (`claude-code-linux-arm64` etc.) from the registry
- Throwaway `postgres:17-alpine` (not `level-up-lab-postgres-1`): as `postgres` over TCP,
  `COPY o FROM PROGRAM 'wget -q -T 5 -O - https://example.com; id -un'` returned example.com's HTML and `postgres`
- `docker compose config` on a scratch copy with a stand-in runner overlay: dev overlay and runner overlay both
  resolve `pnpm-store` to `level-up-lab_pnpm-store`; `runner` and `postgres` share network `default`
- `tier.sh` on a scratch plan listing only `.devcontainer/runner/init-firewall.sh` and `Dockerfile` → `low`; both
  paths fail `CONFIG_PROTECTED`
- `gh repo view --json visibility` → `PUBLIC`

| Check                                                                | Result                                                                                                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                       | pass. 4 new `.devcontainer/runner/*`, `run.sh`, `run-smoke.sh`, new `sandbox-probe.sh`, `scripts/CLAUDE.md`, 3 work files; none owned by B1.55 or B1.49 |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | n/a (no `src/`); bash 3.2 stated for run-smoke. `--mode` signature and S1–S6 pasted                                                                     |
| follows `advice.md` or states the deviation                          | pass. "Advisor skipped (tier quick)". Deviation from the card's named Linux build (`claude-code-vm`) is not stated (reason 6)                           |
| ≤ 7 criteria, measurable Thens                                       | pass. 4 Acceptance clauses, each mapped to S1–S6 or R15. The cost paragraph understates two exposures (reasons 1, 3)                                    |
| verification: exact commands, expected numbers                       | fail, minor: `pnpm lint && pnpm typecheck && pnpm test` "green" has no count (reason 7). The rest has numbers (15, 9, 6/6, 6/6)                         |
| skeleton → red → green → map → review                                | pass for tooling: red `test(scripts)`, green `chore(scripts)`, review `docs(backlog)`; no skeleton or map row without a §, as B1.44                     |
| `Lead approves spec` box                                             | n/a. No spec section (tooling, D-26, D-27). `Plan approved by:` empty; I write neither                                                                  |
| no settled D-n contradicted                                          | pass. D-19 label named, D-28 tier high matches `tier.sh`. D-28 has no row for `.devcontainer/` (reason 4)                                               |
| `next-task.sh --check B1.58`                                         | pass: "B1.58: no overlap with any Doing or Review card"                                                                                                 |

Verdict: changes requested

1. **The allowed Postgres is a way around the firewall** (confirmed). The plan allows "the compose network (Postgres)"
   and sets `DATABASE_URL` to `postgres:5432` with the compose superuser `postgres`/`postgres`. A
   `bypassPermissions` run in `runner` can send `COPY … FROM PROGRAM '<any shell>'` to it. That runs as the OS user
   `postgres` in `level-up-lab-postgres-1`, a container with no firewall. My probe on a throwaway copy fetched
   example.com that way. The same login can drop every worktree schema in the shared `pgdata`. Allowing the
   compose subnet also lets the run reach every other container in project `level-up-lab` (`app`, when the dev
   container is up). None of the card's Acceptance needs a database: `--check-binary` uses only `git worktree add`.
   Fix: give `runner` no database access in B1.58 (no `DATABASE_URL`, no compose-subnet rule) and leave the DB
   question to B1.59, or use a role without superuser and without `pg_execute_server_program`. Either way, add an
   S-probe proving the database route is closed (refused, or `COPY … PROGRAM` denied).
2. **The pnpm store is shared with the unsandboxed dev container** (confirmed via compose config). `pnpm-store`
   without a `runner-` prefix resolves to the same `level-up-lab_pnpm-store` volume that `.devcontainer/` mounts.
   The dev container runs as root and has the docker socket (`docker-outside-of-docker`). Once a run in the sandbox
   can write to that store, the store is a write channel to the next `pnpm install` in that container. The ownership
   also differs (root writes, `node` reads), so the runner's `pnpm install` can hit EACCES. Fix: a separate
   `runner-pnpm-store` volume, and S6 extended so that no volume is shared with `app`.
3. **The stated exfiltration cost understates the exposure** (confirmed: the repo is PUBLIC). The Claude login lives
   in volume `runner-claude`, and the gh token is in the same user's home. Both are readable by a
   `bypassPermissions` run as `node`. Pushing either one to a branch of this repository publishes it. The proposed
   mitigation, "a fine-grained token for this repo only", does not prevent that: pushing branches to this repo is
   exactly what the token is for. The lead must see this before approving. Either state it in Costs (the lead's
   Claude credential and gh token are readable by a run and can be published through this public repo), or reduce it
   in the plan: no push scope until B1.59, or credentials the run cannot read. The second option is likely B1.59's.
4. **Deferring `.devcontainer/` protection opens a window with B1.55** (confirmed). `tier.sh` rates a plan that
   changes only `.devcontainer/runner/init-firewall.sh` or the `Dockerfile` (the sudoers line) as `low`, and
   `check-config-change.sh` asks for no label. After B1.55, a reviewed low-tier `agent-ready` plan passes without
   the lead. So an agent could widen its own firewall with no human in the loop. Fix: add `\.devcontainer/.*` to
   `CONFIG_PROTECTED` in `scripts/ci/lib.sh` here (lib.sh is not in B1.55's set; add a T-probe), or state the window
   and make the follow-up card block B1.55's merge.
5. **The probes do not falsify two of the plan's own claims.** (a) S5 "`iptables -F` refused without sudo" passes
   for any non-root user, including one with `NOPASSWD: ALL`. The claim is "sudo only for firewall", so the probe
   must be `sudo -n iptables -F` and `sudo -n true` refused, with `sudo -n init-firewall.sh` the only allowed entry.
   It must also show the script takes no arguments or environment that change its rules. (b) R15 runs only where
   the marker is absent, so the two `curl` conjuncts of `sandboxed()` are never shown to matter. A mutant that drops
   them survives every probe. Add an in-container probe: with a `curl` that reports example.com reachable, or
   api.github.com unreachable, `run.sh --mode` prints `dontAsk`. If `run.sh` calls curl by absolute path, a PATH
   shim cannot reach it; then say how the negative case is shown. (c) Plausible: the plan names only
   `iptables`/`ipset`. If the compose network ever has IPv6, egress over v6 is unfiltered and S1 tests only v4.
   Set `ip6tables` default DROP, or have S1 assert there is no global v6 route.
6. **Pins and the named build are deviations the plan does not call deviations.** The orchestrator's constraint is
   "versions pinned and at least two weeks old". `node:24-bookworm` is a floating tag, so its age cannot be shown,
   and the 8 apt packages take whatever bookworm serves at build time. Only `claude@2.1.303` is pinned (15 days,
   verified above). Either pin the base by digest (CI keeps its tag, or record why the two may differ) or put "base
   and apt are not pinned" in the lead's decision 2 as a deviation. Separately, the card (via B1.47) names the Linux
   build `claude-code-vm`, the desktop app's aarch64 ELF (B1.42 spike). The plan installs the npm package instead.
   That is a defensible choice (pinned, no host path bound in), but it must be stated as a deviation from the card.
7. **What persists, and what the run can rewrite, is not stated** (plausible). Volumes are `runner-repo`,
   `runner-claude` and `pnpm-store`. `~/.config/gh` and `RUNS` (`~/.level-up-lab/runs`, including
   `verified-versions`) are not on a volume. So every `up --build` loses the gh login and the verified version, which
   means a new paid `--check-binary`, and B1.59's `stopped` marks would not survive. B1.44's review (pass 3, finding 1
   disposition) deferred "keeping `runs/verified-versions` out of a run's reach" to this card. The plan does not
   mention it. In the container, `run.sh`, `verified-versions` and the clone stay writable by the run, so only the
   image (root-owned binary, marker, firewall script, sudoers) is fixed. State that, or move `RUNS` out of the run's
   reach. Also give `pnpm test`'s expected count in Verification.

Not blocking, for the lead: the plan is 73 lines against planning.md's ≈ 40 (B1.44 was longer). `runner`
joins project `level-up-lab`, so a `docker compose up -d --remove-orphans` from the base file alone would delete it,
and a `shutdownAction: stopCompose` in the new `devcontainer.json` would stop the shared Postgres. Settle both in the
diff. The plan's claim that `--disallowedTools` still holds under `bypassPermissions` has no probe. The init check
and `--check-binary` (run under the chosen mode) cover hooks only.
