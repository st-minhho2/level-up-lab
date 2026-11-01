# B1.28 plan — package guides name the batch 4 modules (no §)

Approach: documentation only, two package guides; source = `spec/contracts/18-created-date.md` (§20),
`19-clear-search.md` (§21), `20-all-done.md` (§22) function contracts and `spec/features-map.md` F18–F20. No `src/`
code, no test file, no section change. Documentation card: spec-analyst and advisor skipped.

## Files

| File                            | Change                                                                                                                                                                                                                                           | Why (Acceptance)                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| `src/lib/CLAUDE.md`             | heading `§3–§22`; rows `todo-created.ts` §20 (`CREATED_PREFIX`, `createdDayOf`, `createdLabel`; pure) and `clear-search.ts` §21 (`CLEAR_SEARCH_LABEL`, `isSearchInEffect`, `clearSearchHref`; pure); `todo-count.ts` §13, §22 + `allDoneMessage` | lib rows, heading                 |
| `src/components/CLAUDE.md`      | heading `§7, §10, §12–§22`; "no text content beyond its title" + the §20 empty `<time>` (`::after`, `data-created`) in `todo-item.tsx`; §21 "Clear search" link in `todo-search-form.tsx`; §22 "All done" in `remaining-count.tsx`               | row wording, three names, heading |
| `backlog/work/B1.28/plan.md`    | plan                                                                                                                                                                                                                                             | —                                 |
| `backlog/work/B1.28/review.md`  | plan and diff reviews                                                                                                                                                                                                                            | —                                 |
| `backlog/work/B1.28/pr-body.md` | PR body                                                                                                                                                                                                                                          | —                                 |

## Interfaces touched

None. The guides quote existing exports verbatim (`git grep -n '^export' src/lib/todo-created.ts src/lib/clear-search.ts src/lib/todo-count.ts` = 8 lines).

## Verification (card worktree)

```bash
git grep -n -e todo-created -e clear-search src/lib/CLAUDE.md          # before: no output, exit 1 (recorded on 33e7f7d); after: 2 lines, exit 0
git grep -c -e '§22' src/lib/CLAUDE.md src/components/CLAUDE.md          # after: each file ≥ 2 (heading + row/line)
git grep -n -e 'no text content beyond its title' -e '<time>' -e 'Clear search' -e 'All done' src/components/CLAUDE.md   # after: 4 matches
scripts/ci/check-spec-sections.sh; scripts/ci/check-features-map.sh      # "[check-spec-sections] OK: sections cited: 1 … 22"; "[check-features-map] OK"
pnpm exec prettier --check src/lib/CLAUDE.md src/components/CLAUDE.md     # "All matched files use Prettier code style!"
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
```

## Work breakdown

| Step | Role / skill | Produces                   | Commit                                                   |
| ---- | ------------ | -------------------------- | -------------------------------------------------------- |
| 1    | dev-lead     | both guides edited         | `docs(src): B1.28 package guides name sections 20 to 22` |
| 2    | reviewer     | diff review in `review.md` | `docs(backlog): B1.28 review`                            |

Red/green: the Test command's "before" above is the red; no `test(...)` commit (no test file). No protected path → no
`config-change-approved` label. Out of scope (follow-up, not this card): stale § ranges in `CLAUDE.md` Map
(`src/lib/` §3–§6) and `src/CLAUDE.md` package table (`lib/` §3–§6, `components/` §7).

Plan review: pending · Plan approved by: · Rounds: 1
