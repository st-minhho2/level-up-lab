Files epic **E7**, cards **B7.1–B7.6**, through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. The lead kept the list in the orchestrating session ("giữ danh sách E7"), then replaced the double-click card ("bỏ B7.6").

E7 is the next pair of D-29 batches: three parallel `run.sh` runs per batch. A read-only pre-check found that every card contradicts an existing section line, the kind of line that stopped B6.5 and B6.6 mid-run. So the cards depend on **D-37**: spec first. Each section and its lifts land in an attended `docs(spec)` PR before the issue is labeled. `work/B7.1/decision-request.md` holds the rule, each card's lines with file:line, and the replacement's comparison. The lead chose A ("D-37 theo đề xuất"); D-37 is recorded in its own PR after this one.

| Card | Batch | Behavior                                  | Component                                  |
| ---- | ----- | ----------------------------------------- | ------------------------------------------ |
| B7.1 | 1     | deleting a todo asks for confirmation     | `delete-todo-button.tsx`                   |
| B7.2 | 1     | "Mark all complete (n)"                   | `complete-all-button.tsx` + `page.tsx`     |
| B7.3 | 1     | a "Today" button in the due-date editor   | `todo-due-date.tsx`                        |
| B7.4 | 2     | the search form says how many match       | `todo-search-form.tsx` + `page.tsx`        |
| B7.5 | 2     | the new-todo counter warns near the limit | `todo-form.tsx` + `src/lib/title-count.ts` |
| B7.6 | 2     | a "Clear due date" button                 | `todo-due-date.tsx` (after B7.3's section) |

Files:

- `backlog/plan/E7-todos-hints.md`: the epic and its six cards, without `Spec:` or `Test:` lines. Those land with each card's `docs(spec)` PR.
- `backlog/README.md`:
  - totals: E7 0/0/6/6, total 82/0/45/127;
  - nodes S122–S127;
  - Remaining rows 122–127, blocked by D-37;
  - the "Waiting on human" row D-37.
- `backlog/work/B7.1/decision-request.md`: D-37's options and evidence.
- `backlog/work/B7.1/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
