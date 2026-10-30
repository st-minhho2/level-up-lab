# B1.14 plan — `worktree-prune.sh` keeps a branch whose commits net to no change (tooling, Tier quick)

Approach: in `merged_reason`, after the "no commits beyond the base" check and before `tree`/`cherry`, compare the
branch tip's tree with the tree of `git merge-base "$BASE_REF" "$tip"`. Equal → the branch's commits net to no
change; return 3 (not merged), so `handle` prints `[keep]  <branch>  (commits net to no change vs <base>; <path>)`
and a gone directory prints `branch <branch> kept (commits net to no change vs <base>)`. `--all` still asks. A
squash-merged branch has a tip tree ≠ its merge-base tree (its change), so `tree` still matches it (probed on a
throwaway repo: commit+revert and add+drop → equal trees; squash-merged → not equal, `merge-tree` = base tree). No
merge-base (unrelated history) → the check is skipped, as today. `pr #` (gh) stays first: a merged PR at exactly the
tip still wins. spec-analyst/advisor skipped (no section, Tier quick).
**Deviations, as B1.12/B1.13:** the orchestrating session edits `scripts/` under this approval; red =
`test(scripts): B1.14 …` without `(red)` (`verify-red.sh` covers vitest only); the `fix(scripts)` commit and later
ones touch no smoke line unless in their own `test(scripts)` commit.
**Costs for the lead:** (a) a branch that merged the base into itself _after_ its own squash merge has tip tree =
merge-base tree and is now kept, not pruned (rare; `--all` or `git branch -D` removes it); (b) a net-empty branch's
directory and schema stay until someone removes them by hand or with `--all`.

## Probes (added to `scripts/prune-smoke.sh`, after P13, own prune run from M)

P14 M worktree, branch = "add r" + `git revert HEAD`, never on origin → `[keep]` line with "net to no change", dir,
schema and branch all kept, exit 0 · P15 N worktree, branch = "add s" + "drop s", directory deleted → schema dropped
(existing gone rule), branch kept with "net to no change", worktree metadata gone, exit 0.

## Files

| File                        | Change                                                                 | Why        |
| --------------------------- | ---------------------------------------------------------------------- | ---------- |
| `scripts/worktree-prune.sh` | merge-base tree check in `merged_reason` (rc 3), keep messages, header | Acceptance |
| `scripts/prune-smoke.sh`    | P14, P15 + header lines                                                | Test       |
| `scripts/CLAUDE.md`         | smoke row: "probes P1–P15"                                             | Acceptance |
| `backlog/work/B1.14/*.md`   | plan, review (red/green output)                                        | —          |

## Interfaces touched

```bash
scripts/worktree-prune.sh [--dry-run] [--base main] [--all] [--no-fetch]   # unchanged flags; new [keep] reason
merged_reason <branch>  # 0 merged (prints reason) · 1 not merged · 2 no commits beyond base · 3 net no change
scripts/prune-smoke.sh [<prune-script>]                                     # unchanged; P1–P15
```

## Verification

```bash
git show 557797e:scripts/worktree-prune.sh > "$TMPDIR/prune-main.sh"
/bin/bash scripts/prune-smoke.sh "$TMPDIR/prune-main.sh"  # 13 of 15 ok, FAIL: P14 P15, exit 1
/bin/bash scripts/prune-smoke.sh                         # 15 of 15 ok, 0 FAIL, exit 0; isolation line ok
bash -n scripts/worktree-prune.sh scripts/prune-smoke.sh && scripts/hook-smoke.sh && scripts/ci/check-backlog.sh
#   exit 0 · hook-smoke OK · [check-backlog] OK
```

No `src/`, `prisma/`, `e2e/` change: `pnpm test`/e2e/mutation unaffected (CI runs them). Protected path check: none
of the three files matches `scripts/ci/check-config-change.sh` `PROTECTED`; no `config-change-approved` needed.

Steps: 1 red `test(scripts): B1.14 smoke P14-P15 net-empty branch` → 2 green `fix(scripts): B1.14 keep a branch
whose commits net to no change` → 3 `docs(backlog): B1.14 red and green evidence` → 4 `reviewer` diff (≤ 3 passes)
→ 5 PR by dev-lead; closing PR + prune after the lead merges.

Plan review: pending · Plan approved by: · Rounds: 1
