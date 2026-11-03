# B1.62 plan — The runner's image carries the Prisma engines and Playwright's browser for a full run inside (tooling, no §)

Approach: **A** (`advice.md`) — engines, browser and a loopback Postgres 17 all in the image; the runtime allow list
(`init-firewall.sh`) is unchanged. Spiked by the advisor as throwaway project `b162spike`: `worktree.sh` exit 0 with
migrations, `pnpm test` 202, `pnpm test:e2e` 43, `sandbox-probe.sh` 7/7. Risk tier **high** (`.devcontainer/`,
`scripts/agent/`) → lead `approve`; `config-change-approved` on the PR (D-19).

**The lead decides at this gate** (defaults proposed):

1. **Database inside the runner** (the card is silent; B1.58 left it out): **A** Postgres 17 in the runner image, run
   as uid node on `127.0.0.1:5433`, data on a tmpfs re-created at every container start. A superuser's
   `COPY … FROM PROGRAM` runs as `node` inside the firewall, the uid a run already has a shell as (spiked: `id -un` →
   node, example.com refused). B: a `postgres` service on an internal network = one new allow-list rule, S7 inverts.
   C: no database, e2e out of scope = the card's Acceptance unmet.
2. **New build-time sources** (none in `package.json` or the lockfile): PGDG apt source, key checked against
   fingerprint `B97B 0AFC AA1A 47F0 44F2 44A0 7FCC 7D46 ACCC 4CF8`, package `postgresql-17` (alternative: Debian's
   `postgresql-15`, no new source); `npm install` of `@prisma/engines@6.19.3` (its postinstall pulls the engines from
   `binaries.prisma.sh`) and `playwright@1.64.1` + `install --with-deps chromium` (CI's line, `ci.yml:89`) from
   `cdn.playwright.dev`. Build traffic only (host network); image 1.49 → ~2.75 GB, cold build ~5 min.
3. **Pins are Dockerfile ARGs** (`PRISMA_VERSION`, `PLAYWRIGHT_VERSION`, like `CLAUDE_CODE_VERSION`), not a repo-root
   build context (no `.env`/`.git` to the daemon). A lockfile bump never reaches the network (with `PRISMA_*` set
   Prisma skips its download; Playwright downloads only in `install`), so S8/S9 compare the image's artifacts with
   `pnpm-lock.yaml` and FAIL on a mismatch; the fix is an ARG bump and a rebuild.

Costs: superuser + trust auth on the namespace's loopback (shared only with `firewall`, the lead's). Postgres killed by
a run → e2e fails until the container restarts (S10 shows it). Card's Test line is wrong about the red: `@prisma/engines`'
postinstall fails silently, so `pnpm install` and `worktree.sh` exit 0 without engines; the real symptom is `db:deploy`
(corrected by the closing commit). Not fixed here: `worktree.sh` hiding that failure.

## Files

| File                                      | Change                                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| `.devcontainer/runner/Dockerfile`         | ARG pins; PGDG + `postgresql-17`; `/opt/prisma-engines`, `/opt/playwright-browsers`; ENV; CMD |
| `.devcontainer/runner/runner-postgres.sh` | new: fresh `initdb`, Postgres on 127.0.0.1:5433 as node, db `level_up_lab`, `exec "$@"`       |
| `.devcontainer/runner/docker-compose.yml` | `runner`: tmpfs `/home/node/pgdata`, healthcheck `pg_isready`; header: `up -d --build --wait` |
| `scripts/agent/sandbox-probe.sh`          | S8 Prisma, S9 Playwright, S10 database; header S1–S10                                         |
| `backlog/work/B1.62/*`                    | advice, plan, review, pr-body                                                                 |

## Interfaces touched

```
ENV PRISMA_QUERY_ENGINE_LIBRARY=/opt/prisma-engines/libquery_engine.so.node  PRISMA_SCHEMA_ENGINE_BINARY=/opt/prisma-engines/schema-engine
    PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers  CHECKPOINT_DISABLE=1   (root-owned, not writable by node)
runner-postgres.sh <command…>   exit ≠ 0 if Postgres does not start; else exec; runner CMD [runner-postgres.sh, sleep, infinity]
sandbox-probe.sh  exit 0 all ok · 1 any FAIL; every comparison needs both sides non-empty, lockfile lines `sort -u`
  S8  schema-engine --version hash = query-engine dlopen version().commit = lockfile @prisma/engines-version hash;
      /opt/prisma-engines @prisma/engines = lockfile prisma = ARG PRISMA_VERSION
  S9  ARG PLAYWRIGHT_VERSION = lockfile playwright = global playwright --version; every dry-run Install location exists;
      headless launch of about:blank < 20 s
  S10 5433 listens on 127.0.0.1 only (ss); every postgres process is node's; psql … -Atc 'select 1' → 1
```

## Verification

- Red `test(scripts): B1.62 runner image probes (red)`: host S8, S9, S10 FAIL (S1–S7 as today); inside the current image
  (throwaway `docker compose -p b162-verify`, public clone, no login) S8–S10 FAIL, S1–S7 OK.
- Green `chore(scripts): B1.62 runner image` (no probe edit): inside `-p b162-verify` on the new image `sandbox-probe.sh`
  10/10; `scripts/worktree.sh chore/b162-verify` exit 0 "migrations applied"; `pnpm test` 202; `pnpm test:e2e` 43 (recount);
  bump drill in a scratch clone (lockfile `playwright` / `@prisma/engines-version` edited) → S8, S9 FAIL, no network.
  Host: `pnpm lint && pnpm typecheck && pnpm test` green, `check-plan-scope.sh`, `check-backlog.sh` OK. `down -v` after.
- Lead's hands (exact commands and expected output in the PR body): `up -d --build --wait` of `level-up-lab-runner`,
  `sandbox-probe.sh` → "10 probes OK", `worktree.sh` + `pnpm test:e2e` once. dev-lead never touches the lead's project or its volumes.

Steps: 1 red · 2 green · 3 reviewer (diff) `docs(backlog): B1.62 review` · 4 PR. All dev-lead (no `src/`). Not in scope:
B1.59, B on any decision above, `worktree.sh`'s silent engine failure (follow-up card if the lead wants it).
`scripts/CLAUDE.md`'s `agent/sandbox-probe.sh` row ("S1–S7") is left as is: B1.57 (Doing) plans that file
(`next-task.sh --check`); a one-line fix after both merge.

Plan review: pending · Plan approved by: · Rounds: 1
