# E11 · Todos access two: focus after Escape in the due-date editor, failure messages as descriptions

Epic E11 is a parallel batch of autonomous delivery under D-44 and D-45: E9 missed D-29 on change failure rate (defect
D1, fixed by B9.4), so E10 and E11 must meet every target in a row. Its three `agent-ready` issues run at the same time,
one `scripts/agent/run.sh <issue>` each in the runner container, measured by `scripts/metrics/unattended.sh`,
`no-rework.sh` and `throughput.sh`, and closed by a D-43 sweep for the change failure rate.

The batch rule is D-45 (`00-decisions.md`): spec first as D-40, each new criterion probed against its own requirements,
its siblings and the shipped code (pending and async states included) before the label, every runner PR merged as soon
as it is ready, and a sweep after the cards close. No card changes `src/app/page.tsx`, `src/lib/`, `src/actions/` or
`src/components/todo-form.tsx`; the three touch disjoint components; every plan is medium tier (D-28).
E11 is labeled only after E10 has merged: its due-date and delete components render inside `todo-item.tsx`, which E10
changes.

### B11.1 · Escape in the due-date editor puts focus on "Edit due date"

_F49 · section 51_
**Status: Open** — §28 (`spec/contracts/26-escape-due-date.md`) closes the editor on Escape and §45 REQ-45.4 restores no focus, so focus falls to the page (`todo-due-date.tsx`).

- **Acceptance:**
  - When Escape closes the editor (from the field, "Today" or "Clear due date"), "Edit due date" is `document.activeElement`.
  - Escape while a save is pending moves no focus; a save or clear moves no focus.
  - Mounts in `src/components/todo-due-date.tsx` only; contract `spec/contracts/49-escape-due-date-focus.md` (section 51).
- **Spec:** §51 — unchanged (contract `spec/contracts/49-escape-due-date-focus.md`, written before the label under D-45; edits REQ-45.4, AC-45.3(a), AC-45.5, the note `43:36-38` and §45's function contract line; lifts `26-escape-due-date.md:54`, `35-due-date-today.md:67`, the "after Escape" half of `38-due-date-clear.md:74` and of `43-due-date-focus.md:75`; the red commit rewrites `todo-due-date-focus.test.tsx:79` and `:110`)
- **Test:** `src/components/todo-due-date-escape-focus.test.tsx::AC-51.1: Escape in the field holding 2026-12-01 leaves 0 "Due date" fields and the button "Edit due date" is document.activeElement with exactly 1 focus() call, still 1 after a re-render with dueDate 2026-11-06, and Enter then focuses the field holding 2026-11-06; setTodoDueDateAction called 0 times` — red because: `todo-due-date.tsx` never focuses "Edit due date" on Escape, so `document.activeElement` is `document.body`
- **Tier:** full · **Depends on:** ~~D-45~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B11.1/`

### B11.2 · A failed mark-all's message describes "Mark all complete"

_F50 · section 52_
**Status: Open** — §10 shows a failed mark-all's message as an alert next to the button (`complete-all-button.tsx`), but the button carries no `aria-describedby`.

- **Acceptance:**
  - While the message shows it is the button's accessible description; the next success removes both; a button that reappears (§43) has none.
  - Mounts in `src/components/complete-all-button.tsx` only; contract `spec/contracts/50-complete-all-description.md` (section 52).
- **Spec:** §52 — unchanged (contract `spec/contracts/50-complete-all-description.md`, written before the label under D-45; one clause added to §14's contract line in `spec/contracts/12-complete-all.md:58`)
- **Test:** `src/components/complete-all-button-description.test.tsx::AC-52.1: after a click resolving the form failure there is 1 alert "Could not save, try again" and the button "Mark all complete (1)" is enabled with aria-describedby equal to the alert's id and that accessible description` — red because: the button has no `aria-describedby` today, so the accessible description is ''
- **Tier:** full · **Depends on:** ~~D-45~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B11.2/`

### B11.3 · A failed delete's message describes "Delete todo"

_F51 · section 53_
**Status: Done** — a0b1e00 (#366), 6 AC-53.n criteria green (AC-53.1–53.6 red in b8ad386, proven by verify-red.sh on base c81df92); unit 381 → 387; e2e 90 → 90; mutation n/a (no src/lib or src/actions change, B1.100); no-rework 1/1, unattended 1/1 (D-29); merged third in E11 after one sync (f65437b)

- **Acceptance:**
  - While the message shows it is the button's accessible description; the name stays "Delete todo"; a cancelled confirmation keeps it.
  - Mounts in `src/components/delete-todo-button.tsx` only; contract `spec/contracts/51-delete-description.md` (section 53).
- **Spec:** §53 — unchanged (contract `spec/contracts/51-delete-description.md`, written before the label under D-45; one clause added to REQ-35.5 in `spec/contracts/33-delete-confirm.md`)
- **Test:** `src/components/delete-todo-button-description.test.tsx::AC-53.1: the button has no aria-describedby before a failure; after a form failure it points to the one alert's id, whose text is Could not save, try again, the description is exactly that text and the name stays Delete todo` — red because: the component sets no `aria-describedby` and no id on the message, so the attribute and description assertions fail
- **Tier:** full · **Depends on:** ~~D-45~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B11.3/`
