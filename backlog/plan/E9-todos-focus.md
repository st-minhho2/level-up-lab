# E9 · Todos focus: focus after an add, focus in the date editor, select the search text

Epic E9 is the fourth parallel batch of autonomous delivery, after E7's two and E8. Its three `agent-ready` issues
run at the same time, one `scripts/agent/run.sh <issue>` each in the runner container. They are measured by
`scripts/metrics/unattended.sh` and `no-rework.sh` against D-29's targets, with throughput and change failure rate
held against parallel delivery's batches 6–7.

The batch rule is D-40 (`00-decisions.md`; options and file:line evidence in `work/B9.1/decision-request.md`), which
keeps D-39's **spec first**:

1. `spec-analyst`, in an attended session, writes each section and the lifts or edits D-40 names, in a `docs(spec)`
   PR. The same PR adds the card's `Spec:` and `Test:` lines.
2. The lead labels the issues only after that PR merges and E8 has merged.

The cards were chosen by a read-only pre-check of ten candidates, which looked for spec lines each would contradict
and tests each would break. They have these properties:

- No card changes `src/app/page.tsx`, `src/lib/` or `src/actions/`, so every run skips local mutation testing
  (B1.100).
- The three touch disjoint components, none of them one that E8 changes.
- No card changes `prisma/`, a dependency or the environment, so every plan is medium tier (D-28).

### B9.1 · After a successful add, focus is in the "New todo" box

_F42 · section 44_
**Status: Done** — 5d8ef18 (#346), 7 AC-44.n criteria green (AC-44.1, AC-44.4–44.6 red proven by verify-red.sh, 947055c; AC-44.7 red in 62a54cd, its Then corrected by D-42 in 8b79096; AC-44.2, AC-44.3 no-focus guards green at the base, 9e20190; AC-44.4 rewritten by D-41); unit 338 → 343; e2e 82 → 84, AC-44.6, AC-44.7; mutation n/a (no src/lib or src/actions change, B1.100); no-rework 1/1, unattended 0/1 (D-29): two runner stops for rulings D-41 (#345) and D-42 (#347); merged third in E9 (batch 4) after one sibling sync (1309733)

- **Acceptance:**
  - When `createTodoAction` resolves `ok`, focus moves to the "New todo" box, which is empty.
  - Focus does not move on first load or after a failed save. Focusing the box on load would make `/` type into it
    (AC-25.6, `e2e/25-search-shortcut.spec.ts:83`).
  - The card's `docs(spec)` commit states once that the sibling sections' "`todo-form.tsx` unchanged" notes do not
    apply (D-40).
  - Mounts in `src/components/todo-form.tsx` only; contract `spec/contracts/42-new-todo-focus.md` (section 44).
- **Spec:** §44 — unchanged (contract `spec/contracts/42-new-todo-focus.md`, written before the label under D-40; lifts and edits no other contract; states that the "`todo-form.tsx` unchanged" notes of `27-escape-new-todo.md:44`, `37-title-counter-warning.md:66` and `17-delete.md:59` do not apply; a failed save does not move focus)
- **Test:** `src/components/todo-form-focus.test.tsx::AC-44.1: after typing Buy milk and clicking "Add" with createTodoAction resolving ok, the "New todo" box is document.activeElement and its value is ''` — red because: `todo-form.tsx` never calls `focus()` on the box, so `document.activeElement` is not the box after the save settles
- **Tier:** full · **Depends on:** ~~D-40~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B9.1/`

### B9.2 · Opening the due-date editor puts focus in the date field

_F43 · section 45_
**Status: Done** — 93e8ed1 (#344), 7 AC-45.n criteria green (AC-45.4 pinned green first, 0a93ba1; the rest red proven by verify-red.sh, f42f37d); unit 338 → 346; e2e 82 → 83, AC-45.7; mutation n/a (no src/lib or src/actions change, B1.100); unattended and no-rework 1/1 (D-29), one runner run, merged second in E9 (batch 4) after one sibling sync (c9d57d0)

- **Acceptance:**
  - Activating "Edit due date" focuses the "Due date" field, which shows the current date.
  - This happens only on the switch into edit mode. A failed save that keeps the editor open does not move focus again.
  - §28's Out of scope "restoring focus" after Escape (`26-escape-due-date.md:54`) and §37's "moving focus after the
    click" (`35-due-date-today.md:66`) still hold.
  - The card's `docs(spec)` commit adds one clause to §40's contract (`38-due-date-clear.md:64`) and states that the
    sibling sections' "`todo-due-date.tsx` unchanged" notes do not apply (D-40).
  - Mounts in `src/components/todo-due-date.tsx` only; contract `spec/contracts/43-due-date-focus.md` (section 45).
- **Spec:** §45 — unchanged (contract `spec/contracts/43-due-date-focus.md`, written before the label under D-40; adds one clause to §40's contract line `38-due-date-clear.md:64`; states that the notes `17-delete.md:59`, `21-overdue-count.md:63`, `35-due-date-today.md:60` and `38-due-date-clear.md:67` do not apply)
- **Test:** `src/components/todo-due-date-focus.test.tsx::AC-45.1: after the render document.activeElement is document.body and 0 elements are labelled "Due date"; after clicking "Edit due date" on dueDate 2026-11-05 the field labelled "Due date" is document.activeElement and holds 2026-11-05, and setTodoDueDateAction is called 0 times` — red because: `onEdit` only sets state and the clicked button is removed, so `document.activeElement` stays `document.body`
- **Tier:** full · **Depends on:** ~~D-40~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B9.2/`

### B9.3 · The `/` shortcut also selects the text already in the search box

_F44 · section 46_
**Status: Done** — 66d6926 (#343), 6 AC-46.n criteria green (red proven by verify-red.sh, d163d9a); unit 338 → 343; e2e 82 → 83, AC-46.6; mutation n/a (no src/lib or src/actions change, B1.100); unattended and no-rework 1/1 (D-29), one runner run, merged first in E9 (batch 4) with no sibling sync

- **Acceptance:**
  - When `/` moves focus to "Search todos", the box's whole current text is selected. The value, the address and the
    requests are unchanged.
  - These edits are in the card's `docs(spec)` commit (D-40):
    - REQ-25.5 reads "change nothing but focus and the box's selection";
    - "selecting the box's text on focus" is lifted;
    - §25's contract (line 53) reads "`.focus()` then `.select()`".
  - No existing test is rewritten: AC-25.2, AC-25.3 and AC-25.5 check only the focused element, the value and
    `defaultPrevented`, and every e2e `/` press happens on an empty box.
  - Mounts in `src/components/todo-search-form.tsx` only; contract `spec/contracts/44-search-select.md` (section 46).
- **Spec:** §46 — unchanged (contract `spec/contracts/44-search-select.md`, written before the label under D-40; edits REQ-25.5 and §25's contract line; lifts §25's "selecting the box's text on focus")
- **Test:** `src/components/todo-search-form-select.test.tsx::AC-46.1: on (all, milk) with body focused, / makes "Search todos" the active element with value milk, selectionStart 0, selectionEnd 4, defaultPrevented true and 0 requests` — red because: the component calls `.focus()` but never `.select()`, so the selection does not span 0..4
- **Tier:** full · **Depends on:** ~~D-40~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B9.3/`

### B9.4 · A focus move during a pending add is kept

_F45 · section 47_
**Status: Open** — defect D1 of the first D-43 sweep (2026-11-16): `src/components/todo-form.tsx` focuses the "New todo"
box on every successful result, even when the person moved focus elsewhere while the save was pending, so typed text
splits between two fields (type `Fresh`, click "Add", press `/`, type `milk`: "Search todos" holds `m`, the box `ilk`).

- **Acceptance:**
  - On a successful result the box is focused only if the active element is the box, the "Add" button, or none.
  - A focus move made during the pending save is kept, and nothing typed elsewhere is split.
  - The feature PR is titled `fix(todos): B9.4 …`: it repairs B9.1 and counts in E9's change failure rate (D-44).
  - Mounts in `src/components/todo-form.tsx` only; contract `spec/contracts/45-new-todo-focus-pending.md` (section 47).
- **Spec:** §47 — unchanged (contract `spec/contracts/45-new-todo-focus-pending.md`, written before the label under D-44; edits REQ-44.1, REQ-44.4 and §44's contract line to point to §47; lifts nothing)
- **Test:** `src/components/todo-form-focus-pending.test.tsx::AC-47.1: with focus moved to "Search todos" during the pending save and typed milk there, after the result "Search todos" is the active element with value milk, the box value is "", its focus has 0 calls, the counter reads 0 / 200, 0 alerts and createTodoAction was called once with title Fresh` — red because: `TodoForm` calls `box.current?.focus()` on every ok result without reading `document.activeElement`, so the box, not "Search todos", is active and the `focus` spy has 1 call
- **Tier:** full · **Depends on:** ~~D-44~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B9.4/`
