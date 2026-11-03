# B1.62 review

## Plan review (round 1)

SCOPE: all (tooling, no §: `.devcontainer/runner/`, `scripts/agent/`). Plan at `971dee3`. Read: card B1.62, B1.59,
`advice.md`, B1.58 plan review (precedent for tooling rows), `Dockerfile`, runner `docker-compose.yml`,
`init-firewall.sh`, `sandbox-probe.sh`, `worktree.sh`, `.env.example`, `prisma/schema.prisma`, `ci.yml`, `lib.sh`,
D-19, D-26–D-29.

Probes run (none on the tree, none on the lead's `level-up-lab-runner` project or volumes):

- `scripts/next-task.sh --check B1.62` → `[next-task] B1.62: no overlap with any Doing or Review card` (exit 0)
- `scripts/agent/tier.sh backlog/work/B1.62/plan.md` → `high`; `plan-files.sh --any B1.62` → 5 tokens, all in the table
- `scripts/ci/check-plan-scope.sh` → `OK: chore/B1.62-runner-image changes only paperwork`
- `pnpm test` (host) → `Tests  202 passed (202)`; e2e `test(` count across `e2e/*.ts` → 43. The plan's numbers hold
- lockfile: `@prisma/engines-version` hash `sort -u` → 1 line (`c2990dca…`); `prisma@` → `6.19.3`; `playwright@` → `1.64.1`
- `docker image inspect level-up-lab-runner-runner` Env → PATH, NODE_VERSION, YARN_VERSION: **no `LANG`**; a throwaway
  `--rm --network none` container of that image: `ps`, `ss`, `getent` present, locale `C.utf8` available
- throwaway `postgres:17-bookworm`, `--network none`, `env -u LANG -u LC_ALL initdb … --auth=trust` (the advice's line)
  → `initialized with locale "C"`, `encoding … "SQL_ASCII"`; `create table t(title varchar(200))` and an insert of
  200 × `é` (UTF-8) → `ERROR: value too long for type character varying(200)`. The same insert on a UTF8 database
  (`postgres:17-alpine`) → `INSERT 0 1`, `char_length` 200

| Check                                                                | Result                                                                                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file belongs to the card                                       | pass. 3 `.devcontainer/runner/*`, `sandbox-probe.sh`, work files. `scripts/CLAUDE.md` dropped with its reason (B1.57)                            |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | n/a (no `src/`). ENV, script and S8–S10 contracts pasted; two ENV keys of the advice missing (reason 4)                                          |
| follows `advice.md` or states the deviation                          | pass on approach A. Unstated drops: ENV pair, `--only-shell` fallback (reason 4). The advice's `initdb` line carries the encoding bug (reason 1) |
| ≤ 7 criteria, measurable Thens                                       | pass. The card's 4 Acceptance clauses map to S8–S10 plus the flow proof. No banned adjectives                                                    |
| verification: exact commands, expected numbers                       | fail, minor (reason 5). The numbers are there (10/10, 202, 43): the clone's ref, the host red count and "no network" are not                     |
| skeleton → red → green → map → review                                | pass for tooling, as B1.44 and B1.58: red `test(scripts)`, green `chore(scripts)`, review `docs(backlog)`. No skeleton or map row without a §    |
| `Lead approves spec` box                                             | n/a. No spec section (D-26, D-27). `Plan approved by:` empty; I write neither                                                                    |
| no settled D-n contradicted                                          | pass. D-19 label named; D-28 tier `high` matches `tier.sh`; D-27: interactive card, lead's gate kept                                             |
| `next-task.sh --check B1.62`                                         | pass: "B1.62: no overlap with any Doing or Review card"                                                                                          |

Not a reason: the plan is 70 lines against `planning.md`'s ≈ 40. B1.58's approved plan was 113, so I am not blocking
on length.

Verdict: changes requested

1. **The runner's database is SQL_ASCII, CI's is UTF8, so a 200-character title is rejected inside and accepted in
   CI** (confirmed). The image sets no `LANG`, and the plan pins no encoding. On Debian, `initdb` without a locale
   uses `C` / `SQL_ASCII`. `title` is `VARCHAR(200)`, which under SQL_ASCII counts bytes. D-5 and §5 count 200
   characters. Trigger: a title of 200 × `é` (or any 101+ non-ASCII characters near the limit). Inside the runner
   the insert fails, the action returns "Could not save, try again" (D-11), and the e2e fails. On CI's
   `postgres:17-alpine` (UTF8) the same title saves. Today's 43 e2e use `'x'.repeat(200)`, so the spike passed.
   The first card whose e2e uses a multibyte title at the limit would fail only in the sandbox. Fix: the
   `runner-postgres.sh` interface states `initdb -E UTF8 --locale=C.UTF-8` (`C.utf8` exists in the image), and S10
   adds `select pg_encoding_to_char(encoding) from pg_database where datname = current_database()` → `UTF8`.
2. **S10 hard-codes `127.0.0.1:5433/level_up_lab` instead of comparing with `.env.example`** (confirmed by reading).
   `worktree.sh` copies `.env.example`. If its `DATABASE_URL` port or database changes (the root compose already
   takes `POSTGRES_PORT`), `worktree.sh:106-109` prints a WARNING and exits 0, and S10 stays green. Clause 2
   ("`worktree.sh` succeeds") would then fail with no probe noticing. That breaks the parity design S8 and S9 use
   for Prisma and Playwright. The advice's "invariant 5: 5433 comes from `.env.example`" is not what the script
   does: the port is baked into an image-owned script. Fix: S10 reads host, port and database from `.env.example`'s
   `DATABASE_URL` and FAILs when they differ from what listens. Or state the gap under Costs.
3. **The Costs leave out what B1.59 inherits** (confirmed: compose has no per-run restart; runs execute inside
   the container, which has no docker socket). B1.59 runs `run.sh --poll` back to back in one container. The
   database is re-created at container start, not per run. Every schema and every database-wide object a run
   creates survives into the next run until the lead restarts the container. As superuser, that includes an event
   trigger on `ddl_command_end`, `ALTER DATABASE level_up_lab SET …` and functions in `public`. That is no new
   class: the `runner-repo` volume already lets one run edit another's worktree. But the advice's Pro "no run's data
   survives into the next" holds only with a restart between runs. One more case belongs there: a run that kills
   Postgres fails every later unattended run until a restart, not just its own. Fix: one line in Costs.
4. **Advice items dropped without a word** (confirmed by diffing the two texts).
   - (a) The advice's ENV has `PRISMA_HIDE_UPDATE_MESSAGE=1 NEXT_TELEMETRY_DISABLED=1`; the plan's Interfaces do
     not. Under `planning.md` the diff review must send back an ENV line that is not in the plan, so either list
     them or say they are dropped.
   - (b) The advice's next action asks for `--only-shell` as the size fallback in decision 2: −0.4 GB, and all
     43 e2e passed in the spike. That is the lead's cheaper option, and the plan does not offer it.
   - (c) `postgresql-common` with `create_main_cluster = false` (advice) is not in the Dockerfile row.
5. **Verification is missing three exact steps** (minor).
   - (a) "Public clone, no login" inside `-p b162-verify` only sees the red and green probes if the branch is pushed
     first. Name the step: push, then `git fetch origin chore/B1.62-runner-image && git checkout FETCH_HEAD` in the
     clone.
   - (b) The host red is "S1–S7 as today", but the expected final line is not named (e.g. `n of 10 probes
FAILED`).
   - (c) The bump drill claims "no network" with no measurement. Name one, e.g. the probe's output and timing, or
     the firewall's REJECT counter (`iptables -L OUTPUT -v` in `firewall`) unchanged across the drill.

Waiting on: dev-lead (reasons 1–5, plan round 2). Then the lead's gate: decisions 1–3 plus the costs above.

## Plan review (round 2)

SCOPE: all (tooling, no §: `.devcontainer/runner/`, `scripts/agent/`). Plan at `63c1281`. Read: round 1, the
`bd3a4ab..63c1281` diff of `plan.md`, `advice.md`, card B1.62, `sandbox-probe.sh`, runner `Dockerfile` and
`docker-compose.yml`, `run.sh`, `.env.example`, `ci.yml:70-92`, root `docker-compose.yml`.

Probes run (none on the tree, none on the lead's `level-up-lab-runner` project or volumes):

- `scripts/next-task.sh --check B1.62` → `[next-task] B1.62: no overlap with any Doing or Review card` (exit 0)
- `scripts/agent/tier.sh backlog/work/B1.62/plan.md` → `high`; `scripts/ci/check-plan-scope.sh` →
  `OK: chore/B1.62-runner-image changes only paperwork`
- today's `sandbox-probe.sh` on a `git archive` copy on the host → `6 of 7 probes FAILED` (S2 ok). S8–S10 cannot pass
  on the host (no `/opt/prisma-engines`, no `ss`, no node-owned postgres), so the plan's host red "9 of 10 probes
  FAILED" holds
- `ci.yml:89` is `pnpm exec playwright install --with-deps chromium`, as the plan quotes. CI and the root compose
  both run `postgres:17-alpine` with user `postgres` and db `level_up_lab`
- `run.sh` unsets only `CLAUDECODE`, `CLAUDE_CODE_ENTRYPOINT`, `CLAUDE_CODE_SESSION_ID` (lines 47, 117), so the
  image's engine and browser path variables reach a run's child
- `playwright install --dry-run chromium` with `PLAYWRIGHT_BROWSERS_PATH=/opt/x` → `chromium-1248`, `ffmpeg-1013`;
  with `--only-shell` → `chromium_headless_shell-1248`, `ffmpeg-1013` (gate note 1)
- `psql` given `.env.example`'s `DATABASE_URL` verbatim (throwaway `postgres:17-alpine`, `--network none`) →
  `psql: error: invalid URI query parameter: "schema"` (gate note 3)

Round 1 reasons:

| r1  | Round 2                                                                                                                                                            | Result   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 1   | `initdb -E UTF8 --locale=C.UTF-8` in the script row; S10 asserts encoding `UTF8`; the green step inserts 200 × `é` → `INSERT 0 1`                                  | resolved |
| 2   | S10 takes host, port, database and user from `.env.example`'s `DATABASE_URL`                                                                                       | resolved |
| 3   | Costs name: lifetime per container start, database-wide objects reaching later runs, a killed Postgres failing every later run, B1.59's choice                     | resolved |
| 4   | The ENV pair is listed. `--only-shell` is decision 2's cheaper option, with its size. `postgresql-common` + `create_main_cluster = false` is in the Dockerfile row | resolved |
| 5   | Push, then `git fetch origin chore/B1.62-runner-image && git checkout FETCH_HEAD`. Host red "9 of 10". The bump drill runs under `docker run --rm --network none`  | resolved |

| Check                                                                | Result                                                                                                                                                                     |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                       | pass. 3 `.devcontainer/runner/*`, `sandbox-probe.sh`, work files; `scripts/CLAUDE.md` is left out with its reason (B1.57)                                                  |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | n/a (no `src/`). The ENV (7 keys), the script and the S8–S10 contracts are pasted. The "ARG" sides are read from the clone's Dockerfile, as S3 reads `CLAUDE_CODE_VERSION` |
| follows `advice.md` or states the deviation                          | pass. Approach A: PGDG 17, full `chromium`, tmpfs, CMD script, ARG pins, S8–S10. The advice's `initdb` encoding bug is fixed and stated (r1 #1)                            |
| ≤ 7 criteria, measurable Thens                                       | pass. The card's 4 Acceptance clauses map to S8–S10, `worktree.sh` exit 0, e2e 43 and the bump drill. No banned adjective                                                  |
| verification: exact commands, expected numbers                       | pass. Host "9 of 10 probes FAILED" (measured base: 6 of 7), image red "3 of 10", green "10 probes OK", 202, 43, `INSERT 0 1`                                               |
| skeleton → red → green → map → review                                | pass for tooling (B1.44, B1.58 precedent): red `test(scripts)`, green `chore(scripts)`, review `docs(backlog)`. No skeleton or map row without a §                         |
| `Lead approves spec` box                                             | n/a. No spec section (D-26, D-27). `Plan approved by:` is empty; I write neither                                                                                           |
| no settled D-n contradicted                                          | pass. D-19 label named; D-28 tier `high` = `tier.sh`; D-27: interactive card, so the lead's gate stays                                                                     |
| `next-task.sh --check B1.62`                                         | pass: "[next-task] B1.62: no overlap with any Doing or Review card"                                                                                                        |

Not a reason: the plan is 84 lines, against `planning.md`'s ≈ 40 (round 1: 70; B1.58's approved plan: 113).

Verdict: approved (ready for the lead's gate; not approved for build)

Notes for the lead's gate (costs; none blocks the default plan):

1. **Picking decision 2's `--only-shell` changes S9** (confirmed by the dry-run above). S9 as written requires every
   `install --dry-run chromium` location to exist. That list includes `chromium-1248`, which an `--only-shell` image
   lacks. S9 would FAIL on every run. Choosing `--only-shell` therefore also puts `--only-shell` in S9's dry-run.
   That is an interface change, so write it into `plan.md` when approving.
2. **The default is not the configuration the spike ran.** The header's "`pnpm test:e2e` 43" was measured with
   `npx playwright@1.64.1 install --with-deps --only-shell chromium` (`advice.md:30`). The global
   `npm install -g playwright@…` + full `chromium` install is `[unverified]` there. The green step's 43 is its first
   measurement.
3. **For the diff:** "psql with that URL" cannot run verbatim, because libpq rejects `.env.example`'s
   `?schema=public` (above). S10 has to strip the query string. The `runner-postgres.sh` row also does not name the
   superuser `-U postgres` (`advice.md:49` does). S10 catches either mistake at the green step.

Riskiest unfalsified: the Acceptance clause "a bump … fails a probe instead of reaching the network". The bump drill
runs only the probe under `--network none`. It never runs `pnpm install` or `worktree.sh` against the bumped
lockfile. So the claim that the engine path variables stop `@prisma/engines`' postinstall from contacting
`binaries.prisma.sh` rests on Prisma's code, not on a measurement.

Waiting on: the lead's gate (decisions 1–3, the Costs paragraph, notes 1–2 above).
