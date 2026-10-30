# B1.15 plan — `docker compose` reaches the one compose server from every checkout (tooling, Tier quick)

Approach: **lead picks (a) or (b); dev-lead recommends (a).** Probed with `docker compose --dry-run up -d` (creates
nothing; `docker volume ls`/`network ls` unchanged after): from this card worktree today → would create volume
`fix-b1-15-compose-one-project_pgdata`, network and container; with `-f <main>/docker-compose.yml`, `-p level-up-lab`,
or a copy of the file with `name: level-up-lab` under `x/.worktrees/slug/` → `level-up-lab-postgres-1 Running` only.

- **(a) `name: level-up-lab` at the top of `docker-compose.yml`.** Every bare `docker compose` from any checkout
  (the advice in `CLAUDE.md:57`, `README.md:32`, `setup-env.sh:31`, `worktree.sh:101`, the `add-migration` skill)
  reaches the same project unchanged; no `.claude/` edit. Costs: (1) devcontainer: the CLI takes the compose
  `name:` as its project [unverified, not run], so it joins `level-up-lab`: reuses the running Postgres and
  `level-up-lab_pgdata`, adds `level-up-lab-app-1` + volume `level-up-lab_pnpm-store` (dry-run of both files), and
  `shutdownAction: stopCompose` stops the shared Postgres when the devcontainer closes; (2) a clone whose directory is
  not `level-up-lab` moves to a new, empty `level-up-lab_pgdata`; its old `<dir>_pgdata` stays (never dropped) and its
  old container keeps 5433 until stopped. Here the main checkout is `level-up-lab`: no volume changes name.
  (3) needs `config-change-approved` (compose config; not in the CI `PROTECTED` regex, labelled by rule).
- **(b) keep the file; new `scripts/compose.sh` = `docker compose -f "$MAIN/docker-compose.yml" "$@"`** (`MAIN` =
  first `git worktree list` entry, as `worktree-prune.sh`); the five advice sites say `scripts/compose.sh up -d` /
  `ps`. Costs: (1) a bare `docker compose` from a worktree still reaches a new project (habit, editor plugins);
  (2) `.claude/skills/add-migration/SKILL.md` is `PROTECTED` → `config-change-approved`; (3) the project still
  follows the main checkout's directory name. Devcontainer unchanged.
  Both: no volume renamed or dropped; leftover `feat-b1-4-mutation-feedback_pgdata` untouched.

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

Probes (read-only: `config`, `ps -q`, `--dry-run up -d`), the file copied into throwaway dirs laid out as the main
checkout (`level-up-lab/`), M (`level-up-lab/.worktrees/s`), A (`level-up-lab/.claude/worktrees/app`), N
(`A/.worktrees/s`), plus the real checkout it runs in: C1–C5 each `ps -q postgres` = the id of
`level-up-lab-postgres-1` and dry-run prints no `Creat`/`Recreat`; C6 (a) devcontainer overlay dry-run: no `pgdata`
volume, postgres not created; C7 `docker volume ls`, `network ls`, `ps -aq` equal before/after. (b): the probes call
`scripts/compose.sh` in a throwaway git repo (as `prune-smoke.sh`), C6 dropped.

## Verification

```bash
git show 6663614:docker-compose.yml > "$TMPDIR/compose-main.yml"
scripts/compose-smoke.sh "$TMPDIR/compose-main.yml"   # (a) FAIL C2 C3 C4 C5 (+C6), ok C1 C7; exit 1
scripts/compose-smoke.sh                              # all ok, 0 FAIL, exit 0
bash -n scripts/*.sh && scripts/hook-smoke.sh && scripts/ci/check-backlog.sh   # exit 0 · 221 probes OK · OK
```

Steps: 1 red `test(scripts): B1.15 compose smoke` → 2 green `fix(compose): B1.15 one compose project from every
checkout` → 3 evidence → 4 `reviewer` diff → 5 PR (body names the label); closing PR + prune after merge.
Deviation as B1.13/B1.14: the orchestrating session edits these files under this approval; no `(red)` marker.

Plan review: pending · Plan approved by: · Rounds: 1
