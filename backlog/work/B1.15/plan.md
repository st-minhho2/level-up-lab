# B1.15 plan — `docker compose` reaches the one compose server from every checkout (tooling, Tier quick)

Approach: **lead picks (a) or (b); dev-lead recommends (a).** Probed with read-only `docker compose --dry-run up -d`:
from this card worktree today → would create `fix-b1-15-compose-one-project_pgdata`, a network and a container; with
`-f <main>/docker-compose.yml`, or a copy carrying `name: level-up-lab` under `x/.worktrees/slug/` →
`level-up-lab-postgres-1 Running` only. spec-analyst/advisor skipped (no section, Tier quick).

- **(a) `name: level-up-lab` at the top of `docker-compose.yml`.** Every bare `docker compose` from any checkout
  (advice in `CLAUDE.md:57`, `README.md:32`, `setup-env.sh:31`, `worktree.sh:101`, the `add-migration` skill)
  reaches the same project unchanged; no `.claude/` edit. Costs: (1) every clone and copy of the repo on a machine,
  whatever its folder name, joins that one project: `down -v` from any of them deletes the one
  `level-up-lab_pgdata` (today only from a folder named `level-up-lab`); (2) a clone in a folder not named
  `level-up-lab` leaves its `<dir>_pgdata` (stays, never dropped; its old container holds 5433 until stopped) and joins
  the existing `level-up-lab_pgdata` when that project exists (here: yes), else starts a new, empty one; (3) `up` follows the caller's environment: a shell (or that checkout's `.env`
  [unverified]) with another `POSTGRES_PORT` recreates the shared container (dry-run: `Recreate`), where today it
  starts a second project; (4) needs `config-change-approved` (compose config: CLAUDE.md rule; not in CI `PROTECTED`).
- **(b) keep the file; new `scripts/compose.sh` = `docker compose -f "$MAIN/docker-compose.yml" "$@"`** (`MAIN` =
  first `git worktree list` entry, as `worktree-prune.sh`); the five advice sites say `scripts/compose.sh up -d`/`ps`.
  Costs: (1) a bare `docker compose` from a worktree still starts a new project (habit, editor plugins); (2)
  `.claude/skills/add-migration/SKILL.md` is CI-`PROTECTED` → `config-change-approved`; (3) the project still follows
  the main checkout's folder name; (4) the shell's `POSTGRES_PORT` still applies (the `.env` read is main's).
- **Both, unchanged by this card:** the devcontainer project is already `level-up-lab` (its first compose file is
  `../docker-compose.yml`; `docker compose -f <main>/docker-compose.yml -f <main>/.devcontainer/docker-compose.yml
config` → `name: level-up-lab`), so it already shares `level-up-lab_pgdata` and `shutdownAction: stopCompose` already
  stops the shared Postgres when it closes. No volume renamed or dropped; leftover `feat-b1-4-mutation-feedback_pgdata`
  untouched.

## Files

| File                                                                                                     | (a)           | (b)           | Why        |
| -------------------------------------------------------------------------------------------------------- | ------------- | ------------- | ---------- |
| `docker-compose.yml`                                                                                     | `name:` + why | —             | Acceptance |
| `scripts/compose.sh`                                                                                     | —             | new (6 lines) | Acceptance |
| `CLAUDE.md`, `README.md`, `scripts/setup-env.sh`, `scripts/worktree.sh`, `.claude/skills/add-migration/` | —             | advice line   | Acceptance |
| `scripts/compose-smoke.sh`                                                                               | new           | new           | Test       |
| `scripts/CLAUDE.md`                                                                                      | smoke row     | 2 rows        | contract   |
| `backlog/work/B1.15/*.md`                                                                                | plan, review  | same          | —          |

## Interfaces touched

```bash
scripts/compose-smoke.sh [<compose-file>]   # default ./docker-compose.yml; needs level-up-lab-postgres-1 up; exit 1 on FAIL
scripts/compose.sh <compose args…>          # (b) only
```

Smoke (a): copies `<compose-file>` (and `.devcontainer/docker-compose.yml`) into a mktemp tree laid out as main
(`level-up-lab/`), M (`level-up-lab/.worktrees/s`), A (`level-up-lab/.claude/worktrees/app`), N (`A/.worktrees/s`); no
`.env` there; `POSTGRES_PORT COMPOSE_PROJECT_NAME COMPOSE_FILE` unset. The smoke resolves the real `docker` first
for its own reads (container id, C6 lists), as `prune-smoke.sh`; the probed calls run with a `docker` shim first on
`PATH` that forwards only `compose -f <tmp>/… config|ps …` and `compose -f <tmp>/… --dry-run up -d`; anything else
exits 99 and FAILs. C1–C4 (main, M, A, N): `ps -q postgres` = id of `level-up-lab-postgres-1` and dry-run prints no
`Creat`/`Recreat`; C5 devcontainer overlay from N, scoped to postgres: `level-up-lab-postgres-1` line shows
`Running`/`Healthy`, no `pgdata` or `postgres-1` line shows `Creat`/`Recreat` (the overlay's own `app-1` and
`pnpm-store` show `Creating` in dry-run by design); C6 `docker volume ls`, `network ls`, `ps -aq` equal before/after,
no shim denial. (b): C1–C4 call `scripts/compose.sh` from each layout of a throwaway git repo (as `prune-smoke.sh`),
no file argument, C5 dropped.

## Verification (run in the card worktree)

```bash
git show 6663614:docker-compose.yml > "$TMPDIR/compose-main.yml"
scripts/compose-smoke.sh "$TMPDIR/compose-main.yml"   # (a) 2 of 6 ok, FAIL: C2 C3 C4 C5; exit 1
scripts/compose-smoke.sh                              # (a) 6 of 6 ok, 0 FAIL, exit 0
# (b) red at the test commit (no scripts/compose.sh yet): 1 of 5 ok, FAIL: C1 C2 C3 C4, exit 1; red because the
#     advised command does not exist (deviation: red on a missing script, not on behavior); green 5 of 5 ok
bash -n scripts/*.sh && scripts/hook-smoke.sh && scripts/ci/check-backlog.sh   # exit 0 · 221 probes OK · OK
```

Steps: 1 red `test(scripts): B1.15 compose smoke` → 2 green `fix(compose): B1.15 one compose project from every
checkout` → 3 evidence → 4 `reviewer` diff → 5 PR (body names the label); closing PR + prune after merge.
Deviation as B1.13/B1.14: the orchestrating session edits these files under this approval; no `(red)` marker.

CODEOWNERS: `/docker-compose.yml` (a) and `/.claude/skills/` (b) are owned paths; the owner reviews either PR.

Plan review: changes requested, round 2 (cap); round-2 reasons 1–3 and notes applied above, not re-reviewed · Plan
approved by: · Rounds: 1
