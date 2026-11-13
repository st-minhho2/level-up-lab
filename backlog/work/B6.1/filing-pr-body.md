## Item

Filing lane (`backlog/CLAUDE.md` "Filing a card"): epic **E6**, six cards B6.1–B6.6, autonomous delivery run three
issues at a time (D-29 targets, throughput and change failure rate held against parallel delivery's batches 6–7).
Every card moves a `spec/features-map.md` row, so each run also checks B1.85's pending item (code-writer's own
`docs(map)` commit, no path-guard refusal). The lead agreed to file E6 in the B1.85 session on 2026-11-13. Filing
decides nothing. The batch rule waits on **D-33** (`work/B6.1/decision-request.md`, option A recommended); every card
is blocked by D-33 until the lead rules.

| Card | Title                                                    | Section | Mounts in                                 | Batch |
| ---- | -------------------------------------------------------- | ------- | ----------------------------------------- | ----- |
| B6.1 | Escape clears the new-todo title                         | 29      | `todo-form.tsx`                           | 1     |
| B6.2 | The filter links show how many todos each one lists      | 30      | `todo-filter-nav.tsx` + `page.tsx`        | 1     |
| B6.3 | An open todo due today says so                           | 31      | `todo-due-date.tsx`                       | 1     |
| B6.4 | The clear-completed button says how many it will clear   | 32      | `clear-completed-button.tsx` + `page.tsx` | 2     |
| B6.5 | The overdue count is announced to assistive technology   | 33      | `overdue-count.tsx`                       | 2     |
| B6.6 | The remaining count is announced to assistive technology | 34      | `remaining-count.tsx`                     | 2     |

Files:

- `backlog/plan/E6-todos-cues.md`: the new epic with six cards
- `backlog/README.md`: E6 row and totals (E6 0/0/6 of 6; total 74/1/41 of 116), nodes S111–S116, Remaining rows
  111–116, "Waiting on human" row D-33
- `backlog/work/B6.1/decision-request.md`: D-33's options
- `backlog/work/B6.1/filing-pr-body.md`: this body

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
