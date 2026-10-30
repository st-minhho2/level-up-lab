# B1.13 plan — `worktree-prune.sh` drops the schema of every merged or removed worktree (tooling, Tier quick)

Approach: find worktrees from git, not from the current checkout. `MAIN` = first entry of `git worktree list
--porcelain`; compose always via `-f "$MAIN/docker-compose.yml"` (project = the main checkout's directory, the one
`docker compose up -d` started). Candidates = every worktree at `$MAIN/**/.worktrees/<slug>` (worktree.sh's layout at
any nesting); never the main checkout, a `.claude/worktrees/<name>` checkout or the current one. Base:
`git fetch origin <base>` (failure → warning, last fetched ref), compare with `origin/<base>`. A branch with no commits
beyond the base is kept (`--all` asks) unless gh shows a merged PR at that tip; then `pr` / `tree` / `cherry` as now.
Directory gone → schema `wt_<slug>` (worktree.sh's rule) dropped whatever the merge state, branch deleted only if
merged, `git worktree prune` clears the metadata. After the loop, `wt_*` schemas no surviving worktree claims are
listed `[orphan]`; `--schemas` lists only, `--schemas --drop` drops (the `/dev/tty` prompt goes: agents have no tty).
`drop_schema` refuses names outside `^wt_[a-z0-9_]+$`. Test seam `WORKTREE_PRUNE_DB` (default `level_up_lab`) so the
smoke uses a throwaway database. spec-analyst/advisor skipped (no section, card carries its lines). **Deviations, as
B1.12:** no role's write scope covers `scripts/`, so the orchestrating session edits both scripts under this approval;
the smoke lands first as `test(scripts): B1.13 …` without `(red)` (`verify-red.sh` runs vitest only), its red run
against `origin/main`'s script recorded in `review.md`. No protected path: no `config-change-approved` needed.

## Files

| File                        | Change                                                                  | Why             |
| --------------------------- | ----------------------------------------------------------------------- | --------------- |
| `scripts/worktree-prune.sh` | discovery, compose project, fetched base, empty/gone/orphan rules above | card Acceptance |
| `scripts/prune-smoke.sh`    | new: throwaway repo (bare origin, 3 layouts) + throwaway DB, P1–P9      | card Test       |
| `scripts/CLAUDE.md`         | prune row (`--schemas [--drop]`, `--no-fetch`), smoke row               | contract row    |
| `backlog/work/B1.13/*.md`   | plan, review (red/green smoke output)                                   | —               |

## Interfaces touched

```bash
scripts/worktree-prune.sh [--dry-run] [--base main] [--all] [--no-fetch]   # --base origin/main accepted (prefix stripped)
scripts/worktree-prune.sh --schemas [--drop]                               # was: --schemas [--dry-run] + [y/N] prompt
WORKTREE_PRUNE_DB=<db>   # default level_up_lab; only scripts/prune-smoke.sh sets it
scripts/prune-smoke.sh [<prune-script>]   # default scripts/worktree-prune.sh; exit 1 on any FAIL; needs compose Postgres
```

## Verification

```bash
docker compose -f "$MAIN/docker-compose.yml" up -d postgres      # already up: level-up-lab-postgres-1
/bin/bash scripts/prune-smoke.sh "$TMPDIR/prune-main.sh"   # origin/main's copy → FAIL P1 P2 P3 P4 P7 P8, exit 1
/bin/bash scripts/prune-smoke.sh                          # fix → every probe ok, exit 0, from both checkouts (P8)
#  P1 .worktrees/ squash-merged on origin, local main stale → removed+schema+branch  P2 same, nested under app checkout
#  P3 dir deleted, unmerged → schema dropped, branch kept   P4 no commits → kept   P5 unmerged → kept
#  P6 main + app checkouts untouched   P7 orphan: listed by default run and --schemas, dropped only by --schemas --drop
#  P8 run from the app checkout → schema dropped (compose project resolved)   P9 --dry-run changes nothing
#  probes that need WORKTREE_PRUNE_DB report FAIL on a script without it instead of touching level_up_lab
psql level_up_lab: wt_* schemas before = after (only the throwaway DB changed; it is dropped on exit)
bash -n scripts/*.sh && scripts/hook-smoke.sh && scripts/ci/check-backlog.sh   # OK
```

## Work breakdown

| Step          | Who                         | Commit                                                         |
| ------------- | --------------------------- | -------------------------------------------------------------- |
| 0 Plan review | `reviewer` (plan)           | `docs(backlog): B1.13 plan review …`                           |
| 1 Red         | orchestrating session       | `test(scripts): B1.13 prune smoke` (red evidence in review.md) |
| 2 Green       | orchestrating session       | `fix(scripts): B1.13 prune every layout's schemas`             |
| 3 Review      | `reviewer` (diff), ≤ 3 pass | `docs(backlog): B1.13 diff review …`                           |
| 4 PR          | dev-lead                    | —; closing PR + prune after the lead merges                    |

Plan review: <pending> · Plan approved by: · Rounds: 1
