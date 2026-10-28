# level-up-lab · Technical requirements

Audience: engineers (and agents) building and changing `src/`. This file is the **index**: every function in `src/`
implements exactly one numbered section below, and every behavior change goes through the spec first (§8).

| §   | File                                                               | Contents                                              | Status |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------- | ------ |
| §1  | [contracts/01-scope-and-gates.md](contracts/01-scope-and-gates.md) | What the application is and is not                    | ✅     |
| §2  | [contracts/01-scope-and-gates.md](contracts/01-scope-and-gates.md) | Acceptance gates every change passes                  | ✅     |
| §3  | [contracts/02-schema-and-env.md](contracts/02-schema-and-env.md)   | Database schema                                       | ✅     |
| §4  | [contracts/02-schema-and-env.md](contracts/02-schema-and-env.md)   | Environment and configuration                         | ✅     |
| §5  | [contracts/03-todos.md](contracts/03-todos.md)                     | Todos: list, create, toggle                           | ✅     |
| §6  | [contracts/04-edit-title.md](contracts/04-edit-title.md)           | Todos: edit a title                                   | ✅     |
| §7  | [contracts/05-ui.md](contracts/05-ui.md)                           | Pages, components, the Server Action boundary, health | ✅     |
| §8  | [contracts/06-change-requests.md](contracts/06-change-requests.md) | How a behavior change enters the spec                 | ✅     |

Reading order: §1 → §2 → the section your backlog card names → [features-map.md](features-map.md).

Identifiers: `REQ-§.n` requirement, `AC-§.n` acceptance criterion (a test title starts with it), `F<n>` feature,
`B<epic>.<n>` backlog card, `D-n` ruling.
