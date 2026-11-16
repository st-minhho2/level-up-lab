Files epic **E9**, cards **B9.1–B9.3**, through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. The lead, in the orchestrating session: "chọn (a), soạn E9 đi".

E9 is the fourth parallel batch for D-29. E7's two batches missed throughput (7.7, then 5.5 against 9.4), both on the time from ready to the last merge, so E8 and this batch must both pass.

A read-only pre-check of ten candidates picked these three:

- they touch disjoint components, none of them one E8 changes;
- they make no change to `page.tsx`, `src/lib` or `src/actions`, so local mutation is skipped (B1.100);
- they break no existing test and need the fewest spec edits.

| Card | Section | Behavior                                                 | Component              | Tests to rewrite |
| ---- | ------- | -------------------------------------------------------- | ---------------------- | ---------------- |
| B9.1 | 44      | after a successful add, focus is in the "New todo" box   | `todo-form.tsx`        | 0                |
| B9.2 | 45      | opening the due-date editor focuses the date field       | `todo-due-date.tsx`    | 0                |
| B9.3 | 46      | the `/` shortcut also selects the text in the search box | `todo-search-form.tsx` | 0                |

The cards depend on **D-40**, spec first, like D-39. `work/B9.1/decision-request.md` holds the rule, each card's lines as file:line, and the verdict on all ten candidates. D-40 is recorded in its own PR, together with the sections.

Nothing here should merge before E8 has merged, so `main` stays still during those runs.

Files:

- `backlog/plan/E9-todos-focus.md`: the epic and its three cards, without `Spec:` or `Test:` lines.
- `backlog/README.md`:
  - totals: E9 0/0/3/3, total 93/1/41/135;
  - nodes S133–S135;
  - Remaining rows 133–135, blocked by D-40;
  - the "Waiting on human" row D-40.
- `backlog/work/B9.1/decision-request.md` and this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
