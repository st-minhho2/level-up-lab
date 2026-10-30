# B1.13 plan — `worktree-prune.sh` drops the schema of every merged or removed worktree (tooling, Tier quick)

Approach: find worktrees from git, not from the current checkout. `MAIN` = first entry of `git worktree list
--porcelain`; compose always `-f "$MAIN/docker-compose.yml"`. Candidates = worktrees whose path matches the `case`
pattern `"$MAIN"/*.worktrees/*` with a slash-free slug (worktree.sh's layout, any nesting); never the main checkout, a
`.claude/worktrees/<name>` checkout or the current one. Base: `git fetch origin <base>` (failure → warning, last
fetched ref), compare with `origin/<base>`. No commits beyond the base → keep (`--all` asks) unless gh shows a merged
PR at that tip; checked before `pr` / `tree` / `cherry` (merge-tree of an ancestor returns the base tree). Directory
gone → schema `wt_<slug>` dropped whatever the merge state, branch deleted only if merged, `git worktree prune`.
Claimed schemas = every surviving worktree in any layout (`.worktree.env`, else `wt_<dir name>`); the rest are
`[orphan]`: listed by every run, dropped only by `--schemas --drop`. `drop_schema` refuses names outside
`^wt_[a-z0-9_]+$`. Postgres down → exit 0, merged worktrees still removed, "schema … left in place" and "orphan list
skipped" printed (a later `--schemas --drop` catches them). spec-analyst/advisor skipped (no section). **Deviations, as
B1.12:** the orchestrating session edits `scripts/` (no role scope covers it) under this approval; the smoke lands
first as `test(scripts): B1.13 …` without `(red)` (`verify-red.sh B1.13` exits 1 by design, CI `--auto` exits 0); the
green commit touches no line of the smoke (no CI guard sees it: diff review checks `git diff <test>..HEAD --
scripts/prune-smoke.sh` is empty); a later smoke change is its own `test(scripts)` commit with the reason. No
protected path.

**Smoke isolation** (`scripts/prune-smoke.sh`, P1–P10 listed in its header): throwaway repo under `pwd -P` of a
mktemp dir, main checkout named after the real one (so compose finds the running server), bare origin, run-unique
slugs `ps<pid>-…`; `COMPOSE_PROJECT_NAME`/`COMPOSE_FILE` unset; a `docker` shim first on `PATH` forwards to the real
binary, rewrites `-d level_up_lab` to a throwaway database `prune_smoke_<pid>` and aborts on any other `-d`;
`SMOKE_PG_DOWN=1` makes its `ps` empty (P10); scripts run under `perl -MPOSIX -e 'setsid; exec @ARGV'` (no tty
prompt); database dropped on exit. The production script gets no test seam.

**Costs for the lead:** (a) without gh a branch merged by fast-forward/merge commit is kept forever (repo squash-merges);
(b) the server is found only if `docker compose up -d` ran in the main checkout (true today); (c) a directory gone from
disk loses its schema irreversibly, merged or not; (d) `--schemas --drop` has no prompt.

## Files

| File                        | Change                                                                     | Why        |
| --------------------------- | -------------------------------------------------------------------------- | ---------- |
| `scripts/worktree-prune.sh` | rules above                                                                | Acceptance |
| `scripts/prune-smoke.sh`    | new smoke, isolation above                                                 | Test       |
| `scripts/CLAUDE.md`         | prune row, smoke row; escape `\|` in the `card-status.sh` row (same table) | contract   |
| `backlog/work/B1.13/*.md`   | plan, review (red/green output)                                            | —          |

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
```

## Work breakdown

| Step          | Who                         | Commit                                                       |
| ------------- | --------------------------- | ------------------------------------------------------------ |
| 0 Plan review | `reviewer` (plan)           | `docs(backlog): B1.13 plan review …`                         |
| 1 Red         | orchestrating session       | `test(scripts): B1.13 prune smoke` (red output in review.md) |
| 2 Green       | orchestrating session       | `fix(scripts): B1.13 prune every layout's schemas`           |
| 3 Review      | `reviewer` (diff), ≤ 3 pass | `docs(backlog): B1.13 diff review …`                         |
| 4 PR          | dev-lead                    | —; closing PR + prune after the lead merges                  |

Plan review: <pending> · Plan approved by: · Rounds: 1
