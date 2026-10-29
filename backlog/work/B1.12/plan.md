# B1.12 plan — `card-status.sh` replaces the whole status paragraph (tooling, Tier quick)

Approach: in `scripts/card-status.sh`'s awk, after printing the new `**Status: …**` line, skip every following line of
the old status paragraph, up to (not including) the first blank line, `- **` line or `### ` heading; nothing else in
the file changes. Then clean the five affected cards by re-running the fixed script on each with its current Done
evidence (B1.7–B1.11), so the cleanup goes through the same code path. Tooling card, no spec section: spec-analyst
and advisor skipped (the card carries its lines). **Deviation from invariant 2, stated for the lead:** the script has
no test harness, so there is no `test(...)` commit; red/green evidence is `backlog/work/B1.12/probe.sh`, committed and
rerunnable, with its output before and after recorded in `review.md` (as D-13/D-16 recorded evidence for tests-only
cards). **Who edits `scripts/`:** no role's write scope covers it (dev-lead: `backlog/*`, `docs/metrics.md`,
`docs/mistake-log.md`); the orchestrating session makes the one-file edit, and the lead's approval of this plan is
the approval CLAUDE.md requires before a tool change. `scripts/card-status.sh` is protected: the PR's
`check-config-change` job stays red until the lead adds `config-change-approved`. The branch is `fix/B1.12-…`; its
push is covered by this approval.

## Files

| File                          | Change                                                                         | Why             |
| ----------------------------- | ------------------------------------------------------------------------------ | --------------- |
| `scripts/card-status.sh`      | awk: skip the old paragraph's continuation lines after the new status line     | card Acceptance |
| `backlog/plan/E1-todos.md`    | B1.7–B1.11: leftover status lines removed (fixed script re-run, same evidence) | card Acceptance |
| `backlog/work/B1.12/probe.sh` | the probe (2 synthetic cards: status ends at a `- **` line, at a `### ` line)  | evidence        |
| `backlog/work/B1.12/*.md`     | plan, review (probe output before/after)                                       | —               |

Closing commit after merge: card status (via the fixed script), README row, `docs/metrics.md` per-card row.

## Interfaces touched

```bash
scripts/card-status.sh <B-id> <Open|Partial|Done> "<evidence>"   # usage, exit codes and message unchanged
```

## Verification

```bash
bash backlog/work/B1.12/probe.sh scripts/card-status.sh <(git show 24665de:backlog/plan/E1-todos.md)
#   before (main's script): FAIL B1.10 5 left over · PASS B1.6 · FAIL B9.1 1 left over · FAIL B9.2 1 left over (exit 1)
#   after  (fixed script):  PASS B1.10 · PASS B1.6 · PASS B9.1 · PASS B9.2 (exit 0); 0 lines lost in every case
git diff --numstat origin/main -- backlog/plan/E1-todos.md   # 0	23 (5+3+4+5+6 deletions, all in B1.7–B1.11 status paragraphs)
scripts/ci/check-backlog.sh && scripts/ci/check-spec-sections.sh && scripts/ci/check-features-map.sh
#   [check-backlog] OK … · [check-spec-sections] OK … · [check-features-map] OK
bash -n scripts/card-status.sh && pnpm lint   # syntax OK; lint green
```

## Work breakdown

| Step          | Who                                   | Produces                               | Commit                                                                |
| ------------- | ------------------------------------- | -------------------------------------- | --------------------------------------------------------------------- |
| 0 Plan review | `reviewer` (plan)                     | `review.md` plan section               | `docs(backlog): B1.12 plan review …`                                  |
| 1 Fix         | orchestrating session (lead-approved) | script change, probe after             | `fix(scripts): B1.12 card-status replaces the whole status paragraph` |
| 2 Cleanup     | dev-lead (fixed script)               | five cards cleaned                     | `docs(backlog): B1.12 clean B1.7–B1.11 status paragraphs`             |
| 3 Review      | `reviewer` (diff)                     | `review.md` diff section               | `docs(backlog): B1.12 diff review …`                                  |
| 4 PR          | dev-lead                              | PR; lead adds `config-change-approved` | —                                                                     |

Plan review: approved, round 2 · Plan approved by: · Rounds: 1
