# E1 · Todos

### B1.1 · Todo list: list, create, toggle

_F3 F4 F5 · §5_
**Status: Done** — `c7153b2` (#1); 34 unit/component tests, 5 e2e, mutation 78.87 % (actions 71.4, lib 80.7).

- **Spec:** §5 — unchanged
- **Test:** `src/actions/todos.test.ts::AC-5.2: creates the trimmed title as a not-completed todo and revalidates / once` — red because: `createTodoAction` rejected with `NotImplementedError`
- **Acceptance:** AC-5.1 … AC-5.7
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** M [estimate]
- **Work:** red `61cb3f4`, `7af9887` (mock fix) · green `d99c241` · squash `c7153b2`

### B1.2 · Edit a todo title

_F6 · §6_
**Status: Open** — `grep -n updateTodoTitle src/` returns nothing; `TodoItem` has no edit mode (`src/components/todo-item.tsx`).

- **Spec:** §6 — unchanged (section written from `work/B1.2/analysis.md` + `advice.md`)
- **Test:** `src/actions/todos.test.ts::AC-6.2: updates the trimmed title and revalidates / once` — red because: `updateTodoTitleAction` is not exported from `src/actions/todos.ts`
- **Acceptance:** AC-6.1 … AC-6.7
- **Tier:** full · **Depends on:** ~~B1.1~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.2/` — analysis.md (spec-analyst), advice.md (advisor, approach A: schema `createTodoSchema.extend(toggleTodoSchema.shape)`, `findUnique` then `update` with `data: { title }`, icon-only edit button so AC-5.1's row text stays unchanged); plan.md pending human approval

### B1.3 · Clear completed todos

_F7 (new) · § to be written_
**Status: Open** — no section, no code.

- **Spec:** change: new section "Clear completed" (one action removes every `completed: true` row; open rows keep their order)
- **Test:** — (written with the section)
- **Acceptance:** to be defined (≤ 7)
- **Tier:** quick · **Depends on:** ~~B1.1~~ · **Owner:** Lead · **Size:** S [estimate]
- **Open:** hide or disable the button when nothing is completed? (needs a D-n)
