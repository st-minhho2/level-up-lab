Files epic **E8**, cards **B8.1–B8.3**, through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. The lead, in the orchestrating session: "giữ B8.1–B8.3, D-39 theo đề xuất".

E8 is the third parallel batch for D-29, after E7's two. E7 batch 1 missed throughput, so E7 batch 2 and this batch must both pass.

A read-only pre-check of eight candidates picked these three:

- they touch disjoint components;
- they make no change to `page.tsx`, `src/lib` or `src/actions`, so local mutation is skipped (B1.100);
- they need the fewest spec edits.

| Card | Section | Behavior                                                       | Component                 | Tests to rewrite |
| ---- | ------- | -------------------------------------------------------------- | ------------------------- | ---------------- |
| B8.1 | 41      | opening the title editor selects the whole title               | `todo-item.tsx`           | 0                |
| B8.2 | 42      | filter links with a 0 count are hidden, except the current one | `todo-filter-nav.tsx`     | 1 unit, 3 e2e    |
| B8.3 | 43      | "Mark all complete" is hidden when there is nothing to mark    | `complete-all-button.tsx` | 2 unit, 4 e2e    |

The cards depend on **D-39**, spec first, like D-37. `work/B8.1/decision-request.md` holds the rule, each card's lines as file:line, and the verdict on all eight candidates. D-39 is recorded in its own PR, together with the sections.

Nothing here should merge before E7 batch 2 has merged, so `main` stays still during those runs.

Files:

- `backlog/plan/E8-todos-polish-two.md`: the epic and its three cards, without `Spec:` or `Test:` lines.
- `backlog/README.md`:
  - totals: E8 0/0/3/3, total 87/1/44/132;
  - nodes S130–S132;
  - Remaining rows 130–132, blocked by D-39;
  - the "Waiting on human" row D-39.
- `backlog/work/B8.1/decision-request.md` and this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
