# level-up-lab · Technical requirements

Audience: engineers (and agents) building and changing `src/`. This file is the **index**: every function in `src/`
implements exactly one numbered section below, and every behavior change goes through the spec first (§8).

| §   | File                                                                   | Contents                                                               | Status |
| --- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------ |
| §1  | [contracts/01-scope-and-gates.md](contracts/01-scope-and-gates.md)     | What the application is and is not                                     | ✅     |
| §2  | [contracts/01-scope-and-gates.md](contracts/01-scope-and-gates.md)     | Acceptance gates every change passes                                   | ✅     |
| §3  | [contracts/02-schema-and-env.md](contracts/02-schema-and-env.md)       | Database schema                                                        | ✅     |
| §4  | [contracts/02-schema-and-env.md](contracts/02-schema-and-env.md)       | Environment and configuration                                          | ✅     |
| §5  | [contracts/03-todos.md](contracts/03-todos.md)                         | Todos: list, create, toggle                                            | ✅     |
| §6  | [contracts/04-edit-title.md](contracts/04-edit-title.md)               | Todos: edit a title                                                    | ✅     |
| §7  | [contracts/05-ui.md](contracts/05-ui.md)                               | Pages, components, the Server Action boundary, health                  | ✅     |
| §8  | [contracts/06-change-requests.md](contracts/06-change-requests.md)     | How a behavior change enters the spec                                  | ✅     |
| §9  | [contracts/07-clear-completed.md](contracts/07-clear-completed.md)     | Todos: clear completed                                                 | ✅     |
| §10 | [contracts/08-mutation-feedback.md](contracts/08-mutation-feedback.md) | Todos: feedback when a mutation fails                                  | ✅     |
| §11 | [contracts/09-logging.md](contracts/09-logging.md)                     | Logging failures: a swallowed mutation failure is recorded server-side | ✅     |
| §12 | [contracts/10-filter.md](contracts/10-filter.md)                       | Todos: filter the list (All / Active / Completed)                      | ✅     |
| §13 | [contracts/11-remaining-count.md](contracts/11-remaining-count.md)     | Todos: remaining count                                                 | ✅     |
| §14 | [contracts/12-complete-all.md](contracts/12-complete-all.md)           | Todos: mark all complete                                               | ✅     |
| §15 | [contracts/13-due-date.md](contracts/13-due-date.md)                   | Todos: an optional due date                                            | ✅     |
| §16 | [contracts/14-search.md](contracts/14-search.md)                       | Todos: search by title                                                 | ✅     |
| §17 | [contracts/15-overdue.md](contracts/15-overdue.md)                     | Todos: mark overdue                                                    | ✅     |
| §18 | [contracts/16-title-counter.md](contracts/16-title-counter.md)         | Todos: a character counter on the new-todo box                         | ✅     |
| §19 | [contracts/17-delete.md](contracts/17-delete.md)                       | Todos: delete a todo                                                   | ✅     |
| §20 | [contracts/18-created-date.md](contracts/18-created-date.md)           | Todos: show the creation date                                          | ✅     |
| §21 | [contracts/19-clear-search.md](contracts/19-clear-search.md)           | Todos: clear the search                                                | ✗      |
| §22 | [contracts/20-all-done.md](contracts/20-all-done.md)                   | Todos: say "all done"                                                  | ✗      |

Reading order: §1 → §2 → the section your backlog card names → [features-map.md](features-map.md).

Identifiers: `REQ-§.n` requirement, `AC-§.n` acceptance criterion (a test title starts with it), `F<n>` feature,
`B<epic>.<n>` backlog card, `D-n` ruling.
