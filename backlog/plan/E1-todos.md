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
**Status: Done** — fc812e3 (#5); 55 unit/component + 9 e2e green, mutation 81.40 % (actions 85.7, lib 80.0); red fa7a3dd, green 78f73f4, hardening 8ac5f37

- **Spec:** §6 — unchanged (section written from `work/B1.2/analysis.md` + `advice.md`)
- **Test:** `src/actions/todos.test.ts::AC-6.2: updates the trimmed title and revalidates / once` — red because: `updateTodoTitleAction` is not exported from `src/actions/todos.ts`
- **Acceptance:** AC-6.1 … AC-6.7
- **Tier:** full · **Depends on:** ~~B1.1~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.2/` — analysis.md (spec-analyst), advice.md (advisor, approach A: schema `createTodoSchema.extend(toggleTodoSchema.shape)`, `findUnique` then `update` with `data: { title }`, icon-only edit button so AC-5.1's row text stays unchanged); plan.md approved 2026-10-28 (rounds 1/1), review.md (plan + diff review, passes 1/3) · squash `fc812e3` (#5)

### B1.3 · Clear completed todos

_F7 (new) · §9_
**Status: Done** — 1ec6cb0 (#8); 63 unit/component + 12 e2e green, mutation 82.22 % (actions 86.4, lib 80.9); red 74c5a3d, green db784ad

- **Spec:** §9 — unchanged (section written from `work/B1.3/analysis.md`)
- **Test:** `src/actions/todos.test.ts::AC-9.1: deletes every completed todo, returns the count and revalidates / once` — red because: `clearCompletedTodosAction` is not exported from `src/actions/todos.ts`
- **Acceptance:** AC-9.1 … AC-9.3
- **Work:** `work/B1.3/` — analysis, advice, plan (rounds 1/1), review (plan + diff, passes 1/3); squash `1ec6cb0` (#8)
- **Tier:** quick · **Depends on:** ~~B1.1~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.3/` (analysis.md)
- **Ruled:** D-10 — button always rendered, disabled while nothing is completed.

### B1.4 · Feedback when a mutation fails

_F8 (new) · §10_
**Status: Done** — b605e3f (#11); 67 unit/component + 12 e2e green, mutation 82.80 % (actions 88.0, lib 80.3); red 025938b, green 0c8db17

- **Spec:** §10 — unchanged (section written from `work/B1.4/analysis.md`)
- **Test:** `src/actions/todos.test.ts::AC-10.1: resolves fieldErrors.form ["Could not save, try again"] when the lib rejects with another error and does not revalidate` — red because: `toggleTodoAction` rethrows a non-`TodoNotFoundError` (`todos.ts` `throw error`), so the awaited promise rejects instead of resolving to `{ ok: false, fieldErrors: { form: [...] } }`
- **Acceptance:** AC-10.1 … AC-10.3
- **Tier:** quick · **Depends on:** ~~B1.1~~ ~~B1.2~~ ~~B1.3~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.4/` — analysis, plan (rounds 1/1), review (plan + diff, passes 1/3); squash `b605e3f` (#11)
- **Ruled:** D-11 — Server Actions never reject for an expected failure; `fieldErrors.form` carries the message.

### B1.5 · Feedback when creating a todo fails

_F8 · §10_
**Status: Open** — `createTodoAction` awaits `createTodo(parsed.data.title)` with no try/catch (`src/actions/todos.ts:26`), so a database failure rejects the form action and reaches Next's error boundary; `TodoForm` reads only `fieldErrors.title?.[0]` (`src/components/todo-form.tsx:9`). D-11 names B1.5 as the card that covers it.

- **Spec:** §10 — unchanged (amended within D-11 from `work/B1.5/analysis.md`)
- **Test:** `src/actions/todos.test.ts::AC-10.4: resolves fieldErrors.form ["Could not save, try again"] when createTodo rejects and does not revalidate` — red because: `createTodoAction` awaits `createTodo` with no try/catch (`src/actions/todos.ts:26`), so the awaited promise rejects instead of resolving to `{ ok: false, fieldErrors: { form: [...] } }`
- **Acceptance:** AC-10.4 … AC-10.5
- **Tier:** full · **Depends on:** ~~B1.4~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.5/` (analysis.md, plan.md, review.md as the roles produce them)
