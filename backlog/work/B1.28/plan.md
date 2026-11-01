# B1.28 plan — package guides name the batch 4 modules (no §)

Documentation only, two guides (review rounds in `review.md`); source =
`spec/contracts/18-created-date.md` (§20), `19-clear-search.md` (§21), `20-all-done.md` (§22) and
`spec/features-map.md` F18–F20. No code, no test file, no section change; spec-analyst and advisor skipped.

## Files

| File                            | Change                                                                                                                                                                                                                                       | Why (Acceptance)  |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `src/lib/CLAUDE.md`             | heading `§3–§22`; rows `todo-created.ts` §20 (`CREATED_PREFIX`, `createdDayOf`, `createdLabel`), `clear-search.ts` §21 (`CLEAR_SEARCH_LABEL`, `isSearchInEffect`, `clearSearchHref`), both pure; `todo-count.ts` §13, §22 + `allDoneMessage` | lib rows, heading |
| `src/components/CLAUDE.md`      | heading `§7, §10, §12–§22`; lines L1–L4 below                                                                                                                                                                                                | row text, 3 names |
| `backlog/work/B1.28/plan.md`    | plan                                                                                                                                                                                                                                         | —                 |
| `backlog/work/B1.28/review.md`  | plan and diff reviews                                                                                                                                                                                                                        | —                 |
| `backlog/work/B1.28/pr-body.md` | PR body                                                                                                                                                                                                                                      | —                 |

`src/components/CLAUDE.md`, one fact per line, none hard-wrapped: L1 "In its idle state (view mode, no error message)
a row (`<li>`) without a due date adds no text content beyond its title (AC-5.1, AC-20.3 compare whole-row text);
§15 `Due <date>` and §17 `Overdue` are the only idle additions." L2 `todo-item.tsx` (§20) renders one empty `<time>`; `Created YYYY-MM-DD` is its `::after` content
(`data-created`), visible but not text content. L3 `todo-search-form.tsx` stays a Server Component; §21 adds the
"Clear search" link (`next/link`) while a search is in effect. L4 `remaining-count.tsx` stays a Server Component; §22
adds "All done" (`allDoneMessage`) beside the count `<p>`.

## Interfaces touched

None. The guides quote the 9 existing `^export` lines (3 per file) of `todo-created.ts`, `clear-search.ts`, `todo-count.ts`.

## Verification (card worktree)

```bash
git grep -n -e todo-created -e clear-search src/lib/CLAUDE.md   # before (33e7f7d): no output, exit 1; after: 2 lines, exit 0
git grep -c '§22' src/lib/CLAUDE.md                             # after: src/lib/CLAUDE.md:2 (heading, todo-count row)
for p in 'no text content beyond its title' '<time>' 'Clear search' 'All done' 'Server Component; §2'; do git grep -c -e "$p" src/components/CLAUDE.md; done
                                                                # after: :1 :1 :1 :1 :2 (L1, L2, L3, L4, L3+L4)
scripts/ci/check-spec-sections.sh; scripts/ci/check-features-map.sh   # "OK: sections cited: 1 … 22"; "[check-features-map] OK"
pnpm lint | tail -1; pnpm typecheck; pnpm test | grep Tests     # prettier "All matched files use Prettier code style!"; tsc exit 0; "Tests  202 passed (202)" (as on 33e7f7d)
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
```

## Work breakdown

| Step | Role / skill                                                    | Produces                            | Commit                                                   |
| ---- | --------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------- |
| 0    | dev-lead at the gate (Loop 5)                                   | `pr-body.md`, draft PR              | `docs(backlog): B1.28 plan approved`                     |
| 1    | orchestrating session (dev-lead's guide blocks `src/`, as #106) | both guides edited                  | `docs(src): B1.28 package guides name sections 20 to 22` |
| 2    | `/review-loop`: reviewer (diff), ≤ 3 passes                     | diff review in `review.md`          | `docs(backlog): B1.28 review`                            |
| 3    | `.claude/hooks/mark-reviewed.sh`                                | Stop gate cleared (lint, tsc, test) | —                                                        |

Red/green: the Test command's "before" is the red; no `test(...)` commit (no test file). No protected path → no
`config-change-approved` label. Out of scope (D-25 follow-up): stale § ranges in root `CLAUDE.md` Map (`src/lib/`
§3–§6) and `src/CLAUDE.md` package table (`lib/` §3–§6, `components/` §7).

Plan review: round 2 changes requested (2 reasons, both applied as worded; ≤ 2 rounds reached → lead decides) · Plan approved by: lead (session reply "approve"), 2026-11-01 · Rounds: 1
