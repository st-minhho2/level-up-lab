# B1.12 plan — `card-status.sh` replaces the whole status paragraph (tooling, Tier quick)

Approach: in `scripts/card-status.sh`'s awk, after printing the new `**Status: …**` line, skip every following line of
the old status paragraph, up to (not including) the first blank line, `- **` line or `### ` heading; nothing else in
the file changes. Then clean the five affected cards by re-running the fixed script on each with its current Done
evidence (B1.7–B1.11), so the cleanup goes through the same code path. No spec section (tooling); no `src/` change, so
no red/green test commits and no Stryker run; the script has no test harness in the repo, so the red/green evidence is
a probe on a scratch git copy, recorded in `review.md`. Spec-analyst and advisor skipped (card carries its lines; no
section). `scripts/card-status.sh` is a protected path: the PR needs the lead's `config-change-approved` label.

## Files

| File                       | Change                                                                         | Why             |
| -------------------------- | ------------------------------------------------------------------------------ | --------------- |
| `scripts/card-status.sh`   | awk: skip the old paragraph's continuation lines after the new status line     | card Acceptance |
| `backlog/plan/E1-todos.md` | B1.7–B1.11: leftover status lines removed (fixed script re-run, same evidence) | card Acceptance |
| `backlog/work/B1.12/*.md`  | plan, review (probe output before/after)                                       | —               |

Closing commit after merge: card status (via the fixed script), README row, `docs/metrics.md` per-card row.

## Interfaces touched

```bash
scripts/card-status.sh <B-id> <Open|Partial|Done> "<evidence>"   # usage, exit codes and message unchanged
```

## Verification

```bash
# probe (scratch git copy of backlog/plan/E1-todos.md; multi-line B1.10 and one-line B1.6):
#   before: FAIL B1.10 (5 unexpected lines left), PASS B1.6   — run on main 24665de, recorded in review.md
#   after:  PASS B1.10, PASS B1.6
git diff origin/main -- backlog/plan/E1-todos.md   # only deletions, all inside the B1.7–B1.11 status paragraphs
scripts/ci/check-backlog.sh && scripts/ci/check-spec-sections.sh && scripts/ci/check-features-map.sh   # OK
bash -n scripts/card-status.sh && pnpm lint      # syntax OK; prettier clean on the backlog files
```

## Work breakdown

| Step          | Role / skill                               | Produces                               | Commit                                                                |
| ------------- | ------------------------------------------ | -------------------------------------- | --------------------------------------------------------------------- |
| 0 Plan review | `reviewer` (plan)                          | `review.md` plan section               | `docs(backlog): B1.12 plan review …`                                  |
| 1 Fix         | dev-lead session (no role owns `scripts/`) | script change, probe after             | `fix(scripts): B1.12 card-status replaces the whole status paragraph` |
| 2 Cleanup     | dev-lead (fixed script)                    | five cards cleaned                     | `docs(backlog): B1.12 clean B1.7–B1.11 status paragraphs`             |
| 3 Review      | `reviewer` (diff)                          | `review.md` diff section               | `docs(backlog): B1.12 diff review …`                                  |
| 4 PR          | dev-lead                                   | PR; lead adds `config-change-approved` | —                                                                     |

Plan review: · Plan approved by: · Rounds: 1
