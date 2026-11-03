# B1.62 advice: the runner image carries the Prisma engines, Playwright's browser, and a database for a full run

Tooling, no § (D-26, D-27). Tier **high** (`.devcontainer/` is in `CONFIG_PROTECTED`, `scripts/agent/` too): the lead
approves the plan; the PR gets `config-change-approved` (D-19). Not touched (parallel sessions): `scripts/agent/run.sh`,
`scripts/agent/eligible*.sh`, `scripts/metrics/`. Also not touched: `init-firewall.sh` (Approach A), `worktree.sh`,
`scripts/ci/lib.sh` (already protects `.devcontainer/.*`).

## Spike (what is proven, what is not)

A throwaway copy of `.devcontainer/runner/` with the additions below, built and run as compose project `b162spike`
(own volumes, torn down with `down -v`; the lead's `level-up-lab-runner` containers and volumes were never touched; no
login of any kind; the clone was an unauthenticated clone of the public repo). Docker 29.9.2, linux/arm64.

| Claim                                                                                                             | Result                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image builds with engines, browser, Postgres 17                                                                   | yes, 5 min cold; image 1.49 GB → 2.35 GB with `--only-shell`; full `chromium` is a further 401 MB (measured `du` of `chromium-1248`)                                                        |
| `scripts/worktree.sh chore/spike-b162` inside the firewalled `runner`                                             | exit 0, 184 s cold store, "migrations applied to schema wt_chore_spike_b162"                                                                                                                |
| `pnpm test` inside                                                                                                | 202 passed (33 files), 9 s                                                                                                                                                                  |
| `pnpm test:e2e` inside (Next dev, Chromium headless shell, Postgres on loopback)                                  | 43 passed, 1.9 min, `/dev/shm` stayed 64 MB                                                                                                                                                 |
| `scripts/agent/sandbox-probe.sh` with Postgres running                                                            | 7 probes OK (S1 `host.docker.internal:5433` still refused, S7 no `postgres` host)                                                                                                           |
| Without the two engine variables: `pnpm db:deploy`                                                                | fails in 4.7 s: `request to https://binaries.prisma.sh/all_commits/c2990dca…/linux-arm64-openssl-3.0.x/schema-engine.gz.sha256 failed`                                                      |
| Without them: `scripts/worktree.sh` in a fresh worktree                                                           | **exit 0** in 14 s; `pnpm install` did not fail; only "WARNING: migrations not applied (is Postgres up?)"                                                                                   |
| Superuser `COPY … FROM PROGRAM 'id -un; curl https://example.com'` in the loopback Postgres                       | ran as `node`; `curl: (7) Failed to connect to example.com port 443` (same namespace, same firewall)                                                                                        |
| `prisma version` offline, 1.4 s                                                                                   | Query Engine and Schema Engine both `c2990dca…`, "resolved by PRISMA_QUERY_ENGINE_LIBRARY / PRISMA_SCHEMA_ENGINE_BINARY"; Default Engines Hash `c2990dca…`                                  |
| Query-engine commit without node_modules: `process.dlopen(m, lib); m.exports.version().commit`                    | `c2990dca…`                                                                                                                                                                                 |
| Missing browser dir                                                                                               | `browserType.launch: Executable doesn't exist at /nonexistent/chromium_headless_shell-1248/…` (no network attempt: Playwright downloads only in `install`)                                  |
| Full `chromium` (new headless) as uid node, `--cap-drop ALL`, `no-new-privileges`, in a throwaway container       | launches (156.0.8078.4)                                                                                                                                                                     |
| x64 engine file names                                                                                             | `libquery_engine-debian-openssl-3.0.x.so.node`, `schema-engine-debian-openssl-3.0.x` (engines only, amd64 node container); arm64: `…linux-arm64-openssl-3.0.x…`. x64 Chromium: [unverified] |
| `docker compose -p <name> -f .devcontainer/runner/docker-compose.yml` overrides the file's `name:`                | yes (`config` prints `name: foo`): the implementer can verify without touching the lead's running project                                                                                   |
| Global `npm install -g playwright@…` then `playwright install --with-deps chromium` (used by S9 below) in a build | [unverified]: the spike used `npx --yes playwright@1.64.1 install --with-deps --only-shell chromium`                                                                                        |
| Approach B (internal network, firewall exception)                                                                 | [unverified]: not built                                                                                                                                                                     |

## Approaches

### A (recommended): everything in the image; Postgres 17 as uid node on 127.0.0.1:5433; ARG pins checked by probes

Change:

- `Dockerfile`: `ARG PRISMA_VERSION=6.19.3`, `ARG PLAYWRIGHT_VERSION=1.64.1` (next to `CLAUDE_CODE_VERSION`, parsed the way
  S3 parses it). Postgres 17 from PGDG (`postgresql-common` with `create_main_cluster = false`, then `postgresql-17`).
  Engines: `npm install --prefix /opt/prisma-engines @prisma/engines@${PRISMA_VERSION}` as root, then fail-closed
  symlinks (an unmatched glob makes `ls` fail and the build stop): `libquery_engine.so.node` and `schema-engine` pointing at
  `…/@prisma/engines/libquery_engine-*.so.node` and `schema-engine-*` (one match on arm64 and on x64).
  `ENV PRISMA_QUERY_ENGINE_LIBRARY=/opt/prisma-engines/libquery_engine.so.node PRISMA_SCHEMA_ENGINE_BINARY=/opt/prisma-engines/schema-engine CHECKPOINT_DISABLE=1 PRISMA_HIDE_UPDATE_MESSAGE=1 NEXT_TELEMETRY_DISABLED=1`.
  Browser: `ENV PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers`; as root `npm install -g playwright@${PLAYWRIGHT_VERSION}`
  then `playwright install --with-deps chromium` (the CI line, `ci.yml:89`), `chmod -R a+rX`. A global copy stays so S9 can
  run without a worktree. `COPY runner-postgres.sh`; `CMD ["/usr/local/bin/runner-postgres.sh", "sleep", "infinity"]`.
- `runner-postgres.sh` (new, image-owned in `/usr/local/bin`, so a run cannot edit it): empty the data dir,
  `initdb -D /home/node/pgdata -U postgres --auth=trust`, `pg_ctl -w start -o "-c listen_addresses=127.0.0.1 -c port=5433 -c unix_socket_directories=/tmp -c fsync=off"`,
  `createdb level_up_lab`, `exec "$@"`. Only `runner` starts it: `firewall` overrides entrypoint and command.
- `docker-compose.yml` (`runner`): `tmpfs: ['/home/node/pgdata:uid=1000,gid=1000,mode=0700,size=512m']`. Spiked; the
  short string form is needed because the long form has no `uid`.
- `sandbox-probe.sh`: S8, S9, S10 (see Impact). S1–S7 unchanged.

Pros:

- `allow list unchanged`: zero edits to `init-firewall.sh`; the card's clause holds literally. S1 and S7 pass untouched (spiked).
- B1.58's review finding was that the compose Postgres lets `COPY … FROM PROGRAM` run in a container with no firewall. Here
  the program runs as `node` inside the firewalled namespace: the same uid the run already has a shell as (spiked: `id -un` →
  `node`, example.com refused). The server grants no capability a shell does not.
- The database is gone at every container start (tmpfs, re-`initdb`): no run's data survives into the next, unlike the
  volumes B1.58 already lists as a carry-over channel. Each worktree still gets its own schema, as designed.
- `.env.example` and `worktree.sh` work unchanged: `localhost:5433`, `postgres`/`postgres` (trust auth ignores the password).
- Version pins are in the repo diff, not in the build context: no root context, no `.dockerignore`, no `.env` reaching the daemon.

Cons:

- Image +0.86 GB with the headless shell only (1.49 → 2.35 GB); about +0.4 GB more with full `chromium`. A cold build is 5 min.
- Postgres 17 comes from `apt.postgresql.org` (a third-party apt source and key, build time only). Debian's own is 15 (Q7).
- A Postgres process lives in the runner container: if a run kills it, e2e fails until the container restarts (S10 shows it).
- Superuser with trust auth on a loopback shared with the `firewall` container (root, lead-only): acceptable, stated in Risks.
- Build now reaches `binaries.prisma.sh`, `cdn.playwright.dev`, `apt.postgresql.org` (host network, not the firewalled one).

Fits rules: invariant 5 (nothing stateful hard-coded: 5433 comes from `.env.example`, which `worktree.sh` already rewrites
per worktree); invariant 6 (hooks untouched); `planning.md` (high tier, lead approves); D-19 label.

### B (alternative): a separate `postgres` service on an `internal: true` network, plus a firewall exception

Change: `postgres:17-alpine` service on a network with `internal: true` (no route out); `firewall` joins it;
`init-firewall.sh` adds `iptables -A OUTPUT -d <postgres ip> -p tcp --dport 5432 -j ACCEPT`; `DATABASE_URL` host changes
(Docker DNS name), so `worktree.sh`'s copied `.env.example` is wrong and something must rewrite it; S7 (`postgres` must not
resolve) inverts. Engines and browser as in A.

Pros: `COPY … FROM PROGRAM` runs in a container with no egress at all (only if no second network is attached); the
image stays smaller (no Postgres packages, +0.4 GB with chromium only); the database has the repo's own `postgres:17-alpine`.

Cons: **the allow list grows by one host:port**, which the card says stays unchanged and the lead must approve; an
`init-firewall.sh` edit is a bigger review (it is the control B1.58's whole design rests on); S7's meaning flips and
B1.58's review reason 1 reappears if the network is ever not `internal`; an env rewrite is new code in a place the clone
(untrusted writes) controls; a superuser can still drop every schema on that server; two more failure modes (network,
DNS). Not spiked [unverified].

Fits rules: allowed with the lead's approval of the allow-list change; not compatible with "allow list unchanged".

### C: e2e out of scope; follow-up card

Change: engines and browser only; `worktree.sh` still prints "migrations not applied" and `pnpm test:e2e` cannot run.

Pros: smallest diff, no Postgres in the image, B1.58's "no database" stands.

Cons: the card's Acceptance ("`scripts/worktree.sh <branch>` and `pnpm test:e2e` succeed inside") is not met; B1.59's poll
would stop at the first e2e of any card; the lead must edit the card first. Not recommended.

## Recommendation

**A**, with Postgres 17 from PGDG, full `chromium`, tmpfs data dir, CMD-started image script, ARG pins, and probes S8–S10.
The DB placement is the one decision the card's Acceptance does not settle; the lead takes it at the plan gate, so put it
first in `plan.md` ("The lead decides at this gate": A / B / C, default A).

## Impact

| File                                      | Add/Change | Signature                                                                                                                                                                       | ACs (card Acceptance clauses) |
| ----------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `.devcontainer/runner/Dockerfile`         | Change     | `ARG PRISMA_VERSION`, `ARG PLAYWRIGHT_VERSION`, PGDG `postgresql-17`, `/opt/prisma-engines`, `/opt/playwright-browsers`, ENV above, `CMD [runner-postgres.sh, sleep, infinity]` | clause 1, 2                   |
| `.devcontainer/runner/runner-postgres.sh` | Add        | `runner-postgres.sh <command…>`: fresh `initdb`, Postgres on 127.0.0.1:5433 as uid node, db `level_up_lab`, `exec "$@"`; exit ≠ 0 if it cannot start                            | clause 2                      |
| `.devcontainer/runner/docker-compose.yml` | Change     | `runner.tmpfs: ['/home/node/pgdata:uid=1000,gid=1000,mode=0700,size=512m']`; header: lead's commands unchanged except the probe count and a 5-minute first build                | clause 2                      |
| `scripts/agent/sandbox-probe.sh`          | Change     | S8 Prisma, S9 Playwright, S10 database (below); header comment lists S1–S10; exit 0 all ok / 1 any FAIL                                                                         | clause 3 (and 1, 2 evidence)  |
| `scripts/CLAUDE.md`                       | Change     | row `agent/sandbox-probe.sh`: "probes S1–S10 … + engines, browser, loopback database"                                                                                           | doc drift                     |
| `backlog/work/B1.62/{plan,pr-body}.md`    | Add        | the plan, the PR body (label line: `config-change-approved`, D-19)                                                                                                              | clause 4                      |

Client components: none. This card changes no `src/` file, so no server-rendered markup, no JavaScript-off or pre-hydration
submit exists to compare, and no approach drops one.

Probe contracts (all offline, run inside as uid node from the clone, which has `pnpm-lock.yaml` and the Dockerfile; the clone
root has **no** `node_modules`, so nothing below uses `pnpm exec`). Every comparison requires both sides non-empty.

- **S8 Prisma**: lockfile hash = `grep -oE '@prisma/engines-version@[0-9.]+-[0-9]+\.[0-9a-f]{40}' pnpm-lock.yaml | sed 's/.*\.//' | sort -u`
  (exactly one line); lockfile `prisma` = `sed -n 's/^  prisma@\([0-9][0-9.]*\):$/\1/p'`. FAIL unless: both env vars set and
  their files exist and are not writable by node; `"$PRISMA_SCHEMA_ENGINE_BINARY" --version` second field = hash; the query-engine
  library's `process.dlopen(m, lib); m.exports.version().commit` = hash; `/opt/prisma-engines/node_modules/@prisma/engines`
  version = lockfile `prisma` = Dockerfile `ARG PRISMA_VERSION`.
- **S9 Playwright**: lockfile version = `sed -n 's/^  playwright@\([0-9][0-9.]*\):$/\1/p' pnpm-lock.yaml | sort -u` (`sort -u`
  is needed: the line appears twice). FAIL unless: = Dockerfile `ARG PLAYWRIGHT_VERSION` = global `playwright --version`;
  `PLAYWRIGHT_BROWSERS_PATH` set; every `Install location:` of `playwright install --dry-run chromium` exists; a headless
  launch of `about:blank` succeeds within 20 s.
- **S10 database**: FAIL unless: a listener on `127.0.0.1:5433` and none on any other address for 5433 (`ss -ltnH`); every
  `postgres` process (`ps -o user= -C postgres`) belongs to `node`; `psql -h 127.0.0.1 -p 5433 -U postgres level_up_lab -Atc 'select 1'` prints 1.
  On the host (macOS: no `ss`, no such process) it is red, which is the red this card starts from; the host's own compose
  Postgres on 5433 does not make it green because of the process-owner check.

## Risks

- **Migration: none** (no Prisma schema or migration change; `prisma/` untouched).
- **Security**
  - Superuser Postgres, trust auth, loopback of the namespace shared with `firewall` (root, NET_ADMIN, lead-only). A run's
    `COPY … FROM PROGRAM` is a `node` shell, no more than it has. S10 asserts loopback-only and uid node.
  - New build-time network sources, none firewalled: `binaries.prisma.sh` (sha256 fetched from the same host, so it proves
    integrity of transfer, not provenance), `cdn.playwright.dev` and its fallback, `apt.postgresql.org` and
    `www.postgresql.org` (the PGDG key; add a fingerprint check for `ACCC4CF8` in the Dockerfile, the plan should say so).
    No new npm dependency in `package.json` or the lockfile; `@prisma/engines` and `playwright` in the image are installs
    outside the repo, with no integrity hash, as B1.58 did for `claude-code`. **List for the lead: a new apt source, a new
    package set (postgresql-17), an image-level `playwright` and `@prisma/engines`.**
  - npm 11 printed "install-scripts … approve" in the node 24.22.1 image while still running `@prisma/engines`' postinstall.
    If a later base disables dependency scripts, the build fails closed (the symlink `ls` finds nothing), never silently.
- **Silent failures to know**: `@prisma/engines`' postinstall wraps its download in `.catch(debug)` (`postinstall.js`, `failSilent: true`),
  so `pnpm install` exits 0 with no engine; and with `PRISMA_*` set to an existing file `fetch-engine` never downloads
  (`shouldDownload = isSupported && !job.envVarPath && …`, `chunk-CCMBPDR2.js:2332`), so **a bumped lockfile does not reach the
  network, it runs the old engine**. S8 is therefore the only guard: that is why it compares the artifact with the lockfile.
  A `PRISMA_*` path that does not exist throws (`getBinaryEnvVarPath`), loud in the CLI.
- **Performance**: cold `worktree.sh` 184 s (the store volume and the clone volume are different filesystems, so pnpm copies);
  later ones 14 s with a warm store. tmpfs 512 MB counts against the VM's memory; `/dev/shm` 64 MB sufficed for 43 e2e
  (add `shm_size: 1gb` only if a test crashes the browser). Postgres start adds about 2 s to `up -d`: a `runner` healthcheck
  (`pg_isready -h 127.0.0.1 -p 5433`) and `up -d --wait` avoid an `exec` racing it.
- **Isolation**: every container start re-creates the database, so no schema survives (`worktree-prune.sh --schemas` is
  not needed here). Two worktrees in one container still share the server and use their own schemas (`wt_<slug>`).
- **Existing checks that could turn red**: `sandbox-probe.sh` S1–S7 held 7/7 in the spike with Postgres running. `run-smoke.sh`,
  `tier-smoke.sh`, `compose-smoke.sh` do not read this directory's Dockerfile or compose (compose-smoke runs the root and
  dev-container compose: not re-run [unverified]). CI's `check-config-change.sh` needs the label. `check-plan-scope.sh`
  rejects any file outside the approved Files table: list `runner-postgres.sh` and `scripts/CLAUDE.md` in `plan.md`.
- **Operational**: the lead's containers are running now. `up -d --build` replaces them (volumes survive; the database is new
  anyway). Verification by the implementer uses `-p b162-verify`, never the lead's project, and no login.
- **Known warts, out of scope**: `worktree.sh` exits 0 and prints "is Postgres up?" when engines are the problem (its
  `db:generate … || true` and `--silent` install hide it; not edited here); `install-hooks.sh` warns inside the clone that the
  main checkout has no lefthook (B1.58 behavior).

## Test strategy

No vitest layer applies (no `src/`). `scripts/verify-red.sh` reads `*.test.ts` only, so the red is shown the way B1.58
showed it: by running the probe.

| Layer                                                              | File                                                                                                   | ACs                                                                                                      | Mocks                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Probe, red commit `test(scripts): B1.62 runner image probes (red)` | `scripts/agent/sandbox-probe.sh` S8–S10                                                                | clauses 1–3                                                                                              | none; on the host S8, S9, S10 FAIL, S1–S7 unchanged |
| Probe, red inside the OLD image                                    | same file, `docker compose -p b162-verify` on the current Dockerfile                                   | clause 3: S8 (no `PRISMA_*`), S9 (no playwright), S10 (no postgres) FAIL                                 | none                                                |
| Probe, green inside the NEW image                                  | same file, `chore(scripts): B1.62 runner image` commit (no test file touched)                          | clauses 1–3: 10 probes OK                                                                                | none                                                |
| Flow proof (evidence in the PR)                                    | `scripts/worktree.sh <branch>`, `pnpm test`, `pnpm test:e2e` inside the new image                      | clause 2: exit 0 with "migrations applied", 202 tests, 43 e2e (the spike's numbers; recount at the time) | none (real network firewall, real database)         |
| Bump drill (evidence in the PR)                                    | edit the lockfile's `playwright` and `@prisma/engines-version` lines in a scratch clone, run the probe | clause 3: S8 and S9 FAIL, no network contact                                                             | none                                                |

The green commit must touch no test file (`check-feat-commits.sh`); keep the probe edit in the red commit and use `chore(…)`
for the rest, as B1.58 did. The flow proof is the lead's or the implementer's hands under `-p`; CI cannot run it.

## Mutation hot spots

There is no Stryker target; these are the places a probe can pass while wrong.

- Empty equals empty: any `[[ "$a" == "$b" ]]` with both sides blank (lockfile line not found and tool absent). Guard with `-n`
  on both, as S3 does with `PIN`.
- `playwright@…` appears twice in the lockfile (`packages` and `snapshots`), and `@prisma/engines-version@…` too: without
  `sort -u` the comparison is against a two-line string and fails for the wrong reason, or with `head -1` hides a second version.
- S8 must check the **artifact** (engine `--version`, `dlopen` commit) and not the env var's value or the Dockerfile ARG alone:
  the ARG can be bumped with the image stale, and a stale engine stays "resolved" by the env var without any network error.
- The symlink glob in the Dockerfile: `ls` must fail on no match or on two matches (arm64 has one `schema-engine-*`, but
  a future `.sha256` or a second target would add more).
- S10's owner check: the host's compose Postgres on 5433 must not make S10 green; the loopback-only check must read
  addresses, not just "something listens on 5433".
- `S9` dry-run must run with the same `PLAYWRIGHT_BROWSERS_PATH` the runs use, or it reports the default `~/.cache` and passes by creating nothing.

## Questions settled / escalated

```
Question:    Where does the database for worktree.sh's db:deploy and pnpm test:e2e live, given B1.58 gave the runner none?
Class:       P2 spec silent
Sources:     backlog/plan/E1-todos.md:874 "so `scripts/worktree.sh <branch>` and `pnpm test:e2e` succeed inside with the allow list unchanged"
             backlog/work/B1.58/review.md:44 "Fix: give `runner` no database access in B1.58 (no `DATABASE_URL`, no compose-subnet rule) and leave the DB"
             scripts/agent/sandbox-probe.sh:92 "for h in postgres level-up-lab-postgres-1; do getent hosts \"$h\" >/dev/null && { say \"$h resolves\"; r=1; }; done"
             docker-compose.yml:8 "image: postgres:17-alpine"
Conflict:    none between sources: the card requires a database and an unchanged allow list; B1.58's finding forbids the shared
             compose Postgres (COPY FROM PROGRAM in an unfirewalled container) and deferred "the DB question" to a later card.
             Nothing records an answer.
Verdict:     Approach A. No D-n or spec governs; the card's Acceptance (clause 2 and "allow list unchanged") and B1.58's finding both
             hold only if the server is inside the firewalled namespace, which is A. Spiked: 43 e2e green, S1-S7 7/7, COPY PROGRAM
             runs as node and example.com is refused. B needs an allow-list edit; C leaves clause 2 unmet.
Next action: put "database placement: A / B / C" first in plan.md under "The lead decides at this gate" (default A).
Must not:    reuse the root compose Postgres or add a `postgres` host to the runner project (reopens B1.58's finding, flips S7).
Doc drift:   none
Escalate:    none (the high-tier plan approval by the lead is the gate; no D-n needed for a plan-level choice B1.58 also made in its plan)
```

```
Question:    The card's red ("`pnpm install --frozen-lockfile` fails on the engine download") is not what happens; what is the red?
Class:       P1 code != spec (card text vs measured behavior)
Sources:     backlog/plan/E1-todos.md:873 "inside the container `pnpm install --frozen-lockfile` in a fresh worktree fails on the engine download"
             node_modules/.pnpm/@prisma+engines@6.19.3/node_modules/@prisma/engines/dist/scripts/postinstall.js:94 "failSilent: true,"
             scripts/worktree.sh:102 "(cd \"$DIR\" && pnpm db:generate >/dev/null 2>&1) || true"
Conflict:    card says install fails / postinstall swallows the download error (source) and a fresh worktree.sh exited 0 in the spike;
             the first hard failure is `pnpm db:deploy` (binaries.prisma.sh request failed, 4.7 s), which worktree.sh turns into a WARNING.
Verdict:     The card's Acceptance (outcomes) governs; its Test line is a prediction and the rules ask only for a red before green
             (invariant 2). Use the real red: S8/S9/S10 FAIL on the host and inside the old image. State the deviation in plan.md.
Next action: write the plan's Test line from the table in Test strategy; do not edit the card.
Must not:    make a probe assert "pnpm install fails" (it exits 0), or edit worktree.sh to make it fail.
Doc drift:   backlog/plan/E1-todos.md "### B1.62" Test line (the lead's closing-lane commit, `docs(backlog): B1.62 done`) should
             name `pnpm db:deploy` as the failing step.
Escalate:    none
```

```
Question:    How does the image get the lockfile's versions, and how does a bump fail a probe?
Class:       P2 spec silent
Sources:     scripts/agent/sandbox-probe.sh:22 "PIN=\"$(sed -n 's/^ARG CLAUDE_CODE_VERSION=//p' \"$ROOT/.devcontainer/runner/Dockerfile\" 2>/dev/null)\""
             .claude/rules/invariants.md:18 "7. **Secrets are never read or printed.** Enforced by `guard-bash.sh`, `guard-read.sh`, gitleaks, Semgrep."
             backlog/plan/E1-todos.md:874 "a Prisma or Playwright bump that the image does not match fails a probe instead of reaching the network"
Conflict:    none
Verdict:     ARGs in the Dockerfile (S3's precedent), checked by S8/S9 against pnpm-lock.yaml in the clone and against the artifacts in
             the image. A repo-root build context would copy `.env*`, `.git` and `node_modules` to the daemon (needs a new
             `.dockerignore` and a reviewer to trust it) and still pins nothing the probe could not read. Because the engine
             variables suppress every download, a bump never reaches the network anyway; only the probe detects staleness.
Next action: add the two ARGs and the S8/S9 contracts under Impact.
Must not:    widen `build:` to the repo root, or let a probe compare the Dockerfile ARG alone (the image can be stale).
Doc drift:   none
Escalate:    none
```

```
Question:    Which Prisma engine variables and binary target; does @prisma/engines' postinstall then skip the download?
Class:       P0 no conflict
Sources:     node_modules/.pnpm/@prisma+fetch-engine@6.19.3/node_modules/@prisma/fetch-engine/dist/chunk-CCMBPDR2.js:2332 "const shouldDownload = isSupported && !job.envVarPath && // this is for custom binaries"
             node_modules/.pnpm/@prisma+fetch-engine@6.19.3/node_modules/@prisma/fetch-engine/dist/chunk-QFA3XBMW.js:97 "]: \"PRISMA_QUERY_ENGINE_LIBRARY\","
Conflict:    none
Verdict:     `PRISMA_QUERY_ENGINE_LIBRARY` and `PRISMA_SCHEMA_ENGINE_BINARY` (the two the CLI and the postinstall look up; the postinstall's
             binaries are the library engine and the schema engine, not the query-engine binary). Native target on bookworm
             is `linux-arm64-openssl-3.0.x` (arm64) and `debian-openssl-3.0.x` (x64); the symlinks make the values arch-independent.
             Yes, the postinstall then skips: with the variable set to an existing file the job is not downloaded (spiked: a
             worktree.sh with both variables ran with the firewall up and never contacted binaries.prisma.sh; unset, db:deploy
             failed on it). Docs: the variables are Prisma's "custom engine" overrides [unverified against the docs site: read from the
             6.19.3 source above].
Next action: put both variables and `CHECKPOINT_DISABLE=1` in the Dockerfile `ENV`.
Must not:    set `PRISMA_ENGINES_MIRROR` or `PRISMA_CLI_BINARY_TARGETS` (a mirror is a new host; the target is detected correctly).
Doc drift:   none
Escalate:    none
```

```
Question:    chromium or --only-shell, where do browsers live, and how does a Playwright bump fail a probe?
Class:       P2 spec silent
Sources:     backlog/plan/E1-todos.md:874 "Playwright's chromium with its system libraries, wired through the engine and browser path variables"
             .github/workflows/ci.yml:89 "- run: pnpm exec playwright install --with-deps chromium"
Conflict:    none
Verdict:     `PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers`, root-owned, read-only for node. `install --with-deps chromium` (CI
             parity, literal reading of the card): installs chromium, headless shell and ffmpeg, about +0.4 GB over `--only-shell`, which
             also passed all 43 e2e. A bump cannot reach the network at run time (Playwright downloads only in `install`; a missing
             revision errors "Executable doesn't exist"); S9 turns that late error into an early FAIL by comparing the lockfile version
             with the image's and by checking every dry-run `Install location`.
Next action: use `chromium` in the Dockerfile and S9's dry-run; mention `--only-shell` as the size fallback in plan.md.
Must not:    run `playwright install` from `worktree.sh` or a probe (the firewall refuses the CDN).
Doc drift:   none
Escalate:    none
```

```
Question:    Which Postgres major and source, given Debian bookworm ships 15 and CI, compose and the card's evidence use 17?
Class:       P2 spec silent
Sources:     docker-compose.yml:8 "image: postgres:17-alpine"
             .github/workflows/ci.yml:72 "image: postgres:17-alpine"
Conflict:    none
Verdict:     17 from PGDG (spiked) so e2e inside runs against the engine CI uses; the two migrations contain nothing 16/17-specific
             (no `uuidv7`, `MERGE`, `jsonb_` found), so 15 from Debian would also pass today. 15 removes a third-party apt source
             and key; 17 removes a skew nobody would notice until a feature needs it. The lead decides: it is the "new dependency"
             gate of CLAUDE.md.
Next action: list "PGDG apt source + key fingerprint, postgresql-17" under plan.md costs; default 17; fallback `apt-get install postgresql` (15).
Must not:    install Postgres from a script of the clone, or pin an apt version string (old versions leave the mirror, B1.58 decision 2).
Doc drift:   none
Escalate:    none
```

```
Question:    Who starts Postgres in the runner container and where is its data?
Class:       P2 spec silent
Sources:     .devcontainer/runner/Dockerfile:29 "CMD [\"sleep\", \"infinity\"]"
             .devcontainer/runner/docker-compose.yml:27 "entrypoint: ['/usr/local/bin/init-firewall.sh']"
Conflict:    none
Verdict:     The image's CMD, via a root-owned `/usr/local/bin/runner-postgres.sh` that ends in `exec "$@"` (spiked): `firewall` overrides
             entrypoint and command so it never starts a server; the script cannot be edited by a run (unlike one in the clone); a
             `stop`/`up -d` re-initialises. Data on `tmpfs` (spiked, `uid=1000`): nothing persists, no volume to carry a run's writes.
             Rejected: starting it from `run.sh` (off-limits file, and an interactive `exec` would find no database), a named volume
             (persists schemas and a run's writes), an entrypoint (the `firewall` service already owns that slot).
Next action: add the script, the CMD and the `tmpfs` line.
Must not:    add a process manager or a second long-running container.
Doc drift:   none
Escalate:    none
```

```
Question:    Does pnpm via corepack need anything baked?
Class:       P0 no conflict
Sources:     .devcontainer/runner/docker-compose.yml:59 "COREPACK_ENABLE_DOWNLOAD_PROMPT: '0'"
             package.json:5 "\"packageManager\": \"pnpm@10.24.0\""
Conflict:    none
Verdict:     No. `corepack enable` is already in the image; the first `pnpm` call fetches 10.24.0 from `registry.npmjs.org` (allowed; spiked:
             `pnpm --version` → 10.24.0, cached under `~/.cache/node/corepack`). Baking it adds a third pin that drifts from `package.json`.
Next action: none.
Must not:    run `corepack prepare` in the Dockerfile with a hard-coded pnpm version.
Doc drift:   none
Escalate:    none
```
