# B1.13 plan — `worktree-prune.sh` drops the schema of every merged or removed worktree (tooling, Tier quick)

Approach: find worktrees from git, not from the current checkout. `MAIN` = first `git worktree list --porcelain`
entry; compose always `-f "$MAIN/docker-compose.yml"`. Candidates = paths matching `"$MAIN"/*.worktrees/<slug>`
(`case`, slash-free slug: worktree.sh's layout, any nesting); never the main checkout, a `.claude/worktrees/<name>`
checkout or the current one. Base: `git fetch origin <base>` (failure → warning), compare with `origin/<base>`. No
commits beyond the base → keep (`--all` asks) unless gh shows a merged PR at that tip; checked before `pr`/`tree`/
`cherry`. Directory gone → `wt_<slug>` dropped whatever the merge state, branch deleted only if merged. Claimed =
every surviving worktree, any layout (`.worktree.env`, else `wt_<dir>`); others listed `[orphan]` by every run,
dropped only by `--schemas --drop`. `drop_schema` refuses names outside `^wt_[a-z0-9_]+$`. Postgres down → exit 0,
worktrees still removed, "left in place" + "orphan list skipped". spec-analyst/advisor skipped (no section).
**Deviations, as B1.12:** the orchestrating session edits `scripts/` under this approval; red = `test(scripts)`
without `(red)` (`verify-red.sh B1.13` exits 1 by design); the green commit and later commits touch no smoke line
unless in their own `test(scripts)` commit (diff review: `git diff <test>..HEAD -- scripts/prune-smoke.sh` empty).
**Smoke isolation:** throwaway repo under `pwd -P` of a mktemp dir, main checkout named like the real one, bare
origin, slugs `ps<pid>-…`, `COMPOSE_*` unset, scripts under `perl -MPOSIX -e 'setsid; exec @ARGV'`. A `docker` shim
first on `PATH` is a **whitelist**: it forwards only `compose -f <throwaway repo>/…/docker-compose.yml ps …` and
`compose -f … exec … postgres psql …` with exactly one selector `-d level_up_lab`, rewritten to `prune_smoke_<pid>`;
anything else (other selector form, none, `-e PG*`, `up`/`down`/other subcommand) exits 99 and the smoke FAILs.
`SMOKE_PG_DOWN=1` → every call reports the server down. Throwaway database dropped on exit.
**Costs for the lead:** (a) without gh, a branch merged by fast-forward/merge commit is kept (repo squash-merges);
(b) the server is found only if `docker compose up -d` ran in the main checkout (true today); (c) a directory gone from
disk loses its schema irreversibly, merged or not; (d) `--schemas --drop` has no prompt.

## Probes (`scripts/prune-smoke.sh`; layouts M = `.worktrees/`, A = `.claude/worktrees/app`, N = A`/.worktrees/`)

P1 M squash-merged on origin, local main stale → removed, schema dropped, branch deleted · P2 same in N · P3 N dir
deleted, unmerged → schema dropped, branch kept, metadata gone · P4 M no commits → kept with schema · P5 M and N
unmerged → kept · P6 main and A checkouts untouched · P7 orphan `[orphan]` in default run and `--schemas`, still there;
`--schemas --drop --dry-run` drops nothing; `--schemas --drop` from main, then a 2nd orphan from A: each time exactly
the orphan gone, P4/P5 schemas (M and N) all still there · P8 run from A drops a merged N worktree's schema · P9
`--dry-run` changes nothing · P10 `SMOKE_PG_DOWN=1`: exit 0, merged worktree removed, both messages, schema remains.

## Files

| File                        | Change                                                        | Why        |
| --------------------------- | ------------------------------------------------------------- | ---------- |
| `scripts/worktree-prune.sh` | rules above                                                   | Acceptance |
| `scripts/prune-smoke.sh`    | new: P1–P10, isolation above                                  | Test       |
| `scripts/CLAUDE.md`         | prune row, smoke row; escape `\|` in the `card-status.sh` row | contract   |
| `backlog/work/B1.13/*.md`   | plan, review (red/green output)                               | —          |

## Interfaces touched

```bash
scripts/worktree-prune.sh [--dry-run] [--base main] [--all] [--no-fetch]  # --base origin/main → main
scripts/worktree-prune.sh --schemas [--drop] [--dry-run]  # lists; --drop drops; --drop --dry-run drops nothing
scripts/prune-smoke.sh [<prune-script>]                   # default scripts/worktree-prune.sh; exit 1 on any FAIL
```

## Verification

```bash
git show 8572cc2:scripts/worktree-prune.sh > "$TMPDIR/prune-main.sh"
/bin/bash scripts/prune-smoke.sh "$TMPDIR/prune-main.sh"  # FAIL P1 P2 P3 P4 P7 P8 P10, ok P5 P6 P9; exit 1
/bin/bash scripts/prune-smoke.sh                         # 10 of 10 ok, 0 FAIL, exit 0
docker exec level-up-lab-postgres-1 psql -At -U postgres -d level_up_lab \
  -c "SELECT nspname FROM pg_namespace WHERE nspname LIKE 'wt\_%' ORDER BY 1"  # wt_fix_b1_13_prune_every_layout, before = after
docker exec level-up-lab-postgres-1 psql -At -U postgres -c "SELECT datname FROM pg_database ORDER BY 1"
#   level_up_lab postgres template0 template1 after both runs (throwaway database gone)
bash -n scripts/worktree-prune.sh scripts/prune-smoke.sh && scripts/hook-smoke.sh && scripts/ci/check-backlog.sh
#   exit 0 · hook-smoke: 221 probes OK · [check-backlog] OK: README matches the cards
```

Steps: 1 red `test(scripts): B1.13 prune smoke` → 2 green `fix(scripts): B1.13 prune every layout's schemas` → 3
`reviewer` diff (≤ 3 passes) → 4 PR by dev-lead; closing PR + prune after the lead merges.

Plan review: changes requested, round 2 (cap); both round-2 reasons applied above, not re-reviewed · Plan approved by: · Rounds: 1
