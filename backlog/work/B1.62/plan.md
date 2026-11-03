# B1.62 plan — The runner's image carries the Prisma engines and Playwright's browser for a full run inside (tooling, no §)

Round 2 (plan review r1: 5 reasons, "r1 #n" below). Approach: **A** (`advice.md`) — engines, browser and a loopback
Postgres 17 all in the image; the runtime allow list (`init-firewall.sh`) is unchanged. Spiked by the advisor as
throwaway project `b162spike`: `worktree.sh` exit 0 with migrations, `pnpm test` 202, `pnpm test:e2e` 43,
`sandbox-probe.sh` 7/7. Risk tier **high** (`.devcontainer/`, `scripts/agent/`) → lead `approve`;
`config-change-approved` on the PR (D-19).

**The lead decides at this gate** (defaults proposed):

1. **Database inside the runner** (the card is silent; B1.58 left it out): **A** Postgres 17 in the runner image, run
   as uid node on `127.0.0.1:5433`, UTF8 (CI's encoding, r1 #1), data on a tmpfs re-created at every container start.
   A superuser's `COPY … FROM PROGRAM` runs as `node` inside the firewall, the uid a run already has a shell as
   (spiked: `id -un` → node, example.com refused). B: a `postgres` service on an internal network = one new allow-list
   rule, S7 inverts. C: no database, e2e out of scope = the card's Acceptance unmet.
2. **New build-time sources** (none in `package.json` or the lockfile): PGDG apt source, key checked against
   fingerprint `B97B 0AFC AA1A 47F0 44F2 44A0 7FCC 7D46 ACCC 4CF8`, package `postgresql-17` (alternative: Debian's
   `postgresql-15`, no new source); `npm install` of `@prisma/engines@6.19.3` (its postinstall pulls the engines from
   `binaries.prisma.sh`) and `playwright@1.64.1` + `install --with-deps chromium` (CI's line, `ci.yml:89`) from
   `cdn.playwright.dev`. Build traffic only (host network); image 1.49 → ~2.75 GB, cold build ~5 min. Cheaper option
   (r1 #4b): `--only-shell` = ~2.35 GB, the headless shell only (all 43 e2e passed on it in the spike; CI keeps full).
3. **Pins are Dockerfile ARGs** (`PRISMA_VERSION`, `PLAYWRIGHT_VERSION`, like `CLAUDE_CODE_VERSION`), not a repo-root
   build context (no `.env`/`.git` to the daemon). A lockfile bump never reaches the network (with `PRISMA_*` set
   Prisma skips its download; Playwright downloads only in `install`), so S8/S9 compare the image's artifacts with
   `pnpm-lock.yaml` and FAIL on a mismatch; the fix is an ARG bump and a rebuild.

Costs: superuser + trust auth on the namespace's loopback (shared only with `firewall`, the lead's). The database lives
per container start, not per run (r1 #3): B1.59's back-to-back runs share it, so schemas and database-wide objects one
run makes (event triggers, `ALTER DATABASE … SET`, functions) reach later runs, and a run that kills Postgres fails
every later run until `docker compose … restart runner` (S10 shows it) — B1.59 decides whether a tick restarts
`runner` first. Same class as the `runner-repo` volume today. Card's Test line is wrong about the red: `@prisma/engines`'
postinstall fails silently, so `pnpm install` and `worktree.sh` exit 0 without engines; the real symptom is `db:deploy`
(corrected by the closing commit). Not fixed here: `worktree.sh` hiding that failure.

## Files

| File                                      | Change                                                                                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.devcontainer/runner/Dockerfile`         | ARG pins; PGDG + `postgresql-common` (`create_main_cluster = false`) + `postgresql-17`; `/opt/prisma-engines`, `/opt/playwright-browsers`; ENV; CMD |
| `.devcontainer/runner/runner-postgres.sh` | new: fresh `initdb -E UTF8 --locale=C.UTF-8`, Postgres on 127.0.0.1:5433 as node, db `level_up_lab`, `exec "$@"`                                    |
| `.devcontainer/runner/docker-compose.yml` | `runner`: tmpfs `/home/node/pgdata`, healthcheck `pg_isready`; header: `up -d --build --wait`, probe count 10                                       |
| `scripts/agent/sandbox-probe.sh`          | S8 Prisma, S9 Playwright, S10 database; header S1–S10                                                                                               |
| `backlog/work/B1.62/*`                    | advice, plan, review, pr-body                                                                                                                       |

## Interfaces touched

```
ENV PRISMA_QUERY_ENGINE_LIBRARY=/opt/prisma-engines/libquery_engine.so.node  PRISMA_SCHEMA_ENGINE_BINARY=/opt/prisma-engines/schema-engine
    PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers  CHECKPOINT_DISABLE=1  PRISMA_HIDE_UPDATE_MESSAGE=1
    NEXT_TELEMETRY_DISABLED=1   (files under /opt root-owned, not writable by node)
runner-postgres.sh <command…>   exit ≠ 0 if Postgres does not start; else exec; runner CMD [runner-postgres.sh, sleep, infinity]
sandbox-probe.sh  exit 0 all ok · 1 any FAIL; every comparison needs both sides non-empty, lockfile lines `sort -u`
  S8  schema-engine --version hash = query-engine dlopen version().commit = lockfile @prisma/engines-version hash;
      /opt/prisma-engines @prisma/engines = lockfile prisma = ARG PRISMA_VERSION
  S9  ARG PLAYWRIGHT_VERSION = lockfile playwright = global playwright --version; every `install --dry-run chromium`
      Install location (same PLAYWRIGHT_BROWSERS_PATH) exists and is under it; headless launch of about:blank < 20 s
  S10 host, port, database, user from .env.example's DATABASE_URL (r1 #2): host localhost|127.0.0.1, that port listens
      on 127.0.0.1 only (ss); every postgres process is node's; psql with that URL → `select 1` = 1 and the database's
      encoding = UTF8 (r1 #1)
```

## Verification

- Red `test(scripts): B1.62 runner image probes (red)`: host → "9 of 10 probes FAILED" (S2 ok as today; S8–S10 FAIL).
  Push the branch; throwaway `docker compose -p b162-verify` on the current image, public clone,
  `git fetch origin chore/B1.62-runner-image && git checkout FETCH_HEAD`, no login (r1 #5a) → "3 of 10 probes FAILED"
  (S8, S9, S10).
- Green `chore(scripts): B1.62 runner image` (no probe edit), pushed and fetched the same way, new image under
  `-p b162-verify`: `sandbox-probe.sh` → "10 probes OK"; `scripts/worktree.sh chore/b162-verify` exit 0 "migrations
  applied"; `pnpm test` 202; `pnpm test:e2e` 43 (recount); a 200 × `é` insert into a `varchar(200)` → `INSERT 0 1`.
  Bump drill (r1 #5c): a scratch copy of the clone with the lockfile's `playwright@` and `@prisma/engines-version@`
  lines edited, probed in `docker run --rm --network none` of the new image → S8 and S9 FAIL with the version pair
  named, so no step needs the network. Host: `pnpm lint && pnpm typecheck && pnpm test` green, `check-plan-scope.sh`,
  `check-backlog.sh` OK. `down -v` after.
- Lead's hands (exact commands and expected output in the PR body): `up -d --build --wait` of `level-up-lab-runner`,
  `sandbox-probe.sh` → "10 probes OK", `worktree.sh` + `pnpm test:e2e` once. dev-lead never touches the lead's
  project or its volumes.

Steps: 1 red · 2 green · 3 reviewer (diff) `docs(backlog): B1.62 review` · 4 PR. All dev-lead (no `src/`). Not in scope:
B1.59, B on any decision above, `worktree.sh`'s silent engine failure (follow-up card if the lead wants it).
`scripts/CLAUDE.md`'s `agent/sandbox-probe.sh` row ("S1–S7") is left as is: B1.57 (Doing) plans that file
(`next-task.sh --check`); a one-line fix after both merge.

Plan review: changes requested, round 1 (5 reasons, addressed in round 2) · Plan approved by: · Rounds: 1
