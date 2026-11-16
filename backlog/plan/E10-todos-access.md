# E10 · Todos access: focus after Escape in the title editor, failure messages as descriptions, a search hint

Epic E10 is a parallel batch of autonomous delivery under D-44 and D-45: E9 missed D-29 on change failure rate (defect
D1, fixed by B9.4), so E10 and E11 must meet every target in a row. Its three `agent-ready` issues run at the same time,
one `scripts/agent/run.sh <issue>` each in the runner container, measured by `scripts/metrics/unattended.sh`,
`no-rework.sh` and `throughput.sh`, and closed by a D-43 sweep for the change failure rate.

The batch rule is D-45 (`00-decisions.md`): spec first as D-40, each new criterion probed against its own requirements,
its siblings and the shipped code (pending and async states included) before the label, every runner PR merged as soon
as it is ready, and a sweep after the cards close. No card changes `src/app/page.tsx`, `src/lib/`, `src/actions/` or
`src/components/todo-form.tsx`; the three touch disjoint components; every plan is medium tier (D-28).

### B10.1 · Escape in the title editor puts focus on "Edit title"

_F46 · section 48_
**Status: Open** — §24 (`spec/contracts/22-escape-edit-title.md`) closes the editor on Escape and §41 REQ-41.4 gives the row no focus on leaving edit mode, so focus falls to the page (`todo-item.tsx`).

- **Acceptance:**
  - When Escape closes the title editor, the row's "Edit title" button is `document.activeElement`.
  - Escape while an action of the row is pending moves no focus; a save, ok or failed, moves no focus.
  - Mounts in `src/components/todo-item.tsx` only; contract `spec/contracts/46-escape-title-focus.md` (section 48).
- **Spec:** §48 — unchanged (contract `spec/contracts/46-escape-title-focus.md`, written before the label under D-45; edits §41 REQ-41.4, its note, its function contract line and Out of scope, and lifts §24's "restoring focus to the 'Edit title' button")
- **Test:** `src/components/todo-item-escape-focus.test.tsx::AC-48.1: the "Edit title" button is document.activeElement with 0 textbox roles after Escape on the draft "Buy milk", and updateTodoTitleAction was called 0 times` — red because: the field is removed on Escape and `document.activeElement` is `document.body`
- **Tier:** full · **Depends on:** ~~D-45~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B10.1/`

### B10.2 · A failed clear's message describes "Clear completed"

_F47 · section 49_
**Status: Open** — §10 shows a failed clear's message as an alert next to the button (`clear-completed-button.tsx:23`), but the button carries no `aria-describedby`.

- **Acceptance:**
  - While the message shows it is the button's accessible description; the next success removes both; a pending retry keeps both.
  - Mounts in `src/components/clear-completed-button.tsx` only; contract `spec/contracts/47-clear-completed-description.md` (section 49).
- **Spec:** §49 — unchanged (contract `spec/contracts/47-clear-completed-description.md`, written before the label under D-45; one clause added to §10's contract block in `spec/contracts/08-mutation-feedback.md`)
- **Test:** `src/components/clear-completed-button-description.test.tsx::AC-49.1: renders the button "Clear completed (2)" with no aria-describedby and an empty description, then after a failed clear its aria-describedby is the id of the 1 alert "Could not save, try again", the description is exactly that text and the name is unchanged` — red because: the component sets no `aria-describedby` and gives the alert no `id`, so the description assertion fails
- **Tier:** full · **Depends on:** ~~D-45~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B10.2/`

### B10.3 · The search box shows "Press / to search"

_F48 · section 50_
**Status: Done** — 1011c58 (#361), 7 AC-50.n criteria green (AC-50.1, AC-50.3–50.7 red in 71d2d8c, the unit ones proven by verify-red.sh on base b258594; AC-50.2 pinned green at the base, b258594); unit 360 → 366; e2e 88 → 89, AC-50.7; mutation n/a (no src/lib or src/actions change, B1.100); no-rework 1/1, unattended 1/1 (D-29); merged third in E10 after two syncs (84bf535, 6358d02)

- **Acceptance:**
  - The box shows the placeholder `Press / to search`, in the server render too; its accessible name stays "Search todos".
  - Mounts in `src/components/todo-search-form.tsx` only; contract `spec/contracts/48-search-hint.md` (section 50).
- **Spec:** §50 — unchanged (contract `spec/contracts/48-search-hint.md`, written before the label under D-45; lifts "a visible hint" from §25's Out of scope and from §46's; states REQ-46.4 holds and the markup notes of §16/§21/§25/§27 do not apply to the one added `placeholder` attribute)
- **Test:** `src/components/todo-search-form-hint.test.tsx::AC-50.1: on (all, '') the "Search todos" searchbox has the placeholder "Press / to search" (17 characters), id search-todos, name q, type search, maxlength 200, value '' and no aria-label, aria-labelledby, aria-describedby or title` — red because: the box renders with no `placeholder` attribute, so it reads null
- **Tier:** full · **Depends on:** ~~D-45~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B10.3/`
