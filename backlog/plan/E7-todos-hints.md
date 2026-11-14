# E7 · Todos hints: confirm delete, counts on buttons and search, a Today button, a counter warning

Epic E7 runs autonomous delivery in parallel, as E6 did. Each batch's three `agent-ready` issues run at the same
time, one `scripts/agent/run.sh <issue>` each in the runner container. They are measured by
`scripts/metrics/unattended.sh` and `no-rework.sh` against D-29's targets, with throughput and change failure rate held
against parallel delivery's batches 6–7. Batch 1 is B7.1–B7.3, batch 2 is B7.4–B7.6.

Unlike E6, every card's section lands **before** its issue is labeled (D-37). In E5 and E6, three runs stopped mid-run
for a spec ruling (D-31, D-34, D-35), and a pre-check of this epic found that every card contradicts an existing
section line.

The section numbers, contract files, components, the one `src/app/page.tsx` card per batch, and the lines each card
lifts or edits are fixed by D-37 (`00-decisions.md`; options and file:line evidence in `work/B7.1/decision-request.md`).

How a card becomes eligible:

1. `spec-analyst`, in an attended session, writes the section and the lifts or edits D-37 names, in a `docs(spec)` PR.
   The same PR adds the card's `Spec:` and `Test:` lines.
2. The lead merges that PR, then labels the issue.

No card changes `prisma/`, a dependency or the environment, so every plan is medium tier (D-28).

### B7.1 · Deleting a todo asks for confirmation first

_F33 · section 35_
**Status: Done** — 76bdb83 (#302), 5 AC-35.n criteria green (unit 280 → 283: AC-35.1–35.3, red proven by verify-red.sh; e2e 64 → 66, AC-35.4–35.5), mutation 92.74 (lib, actions unchanged); unattended and no-rework 1/1 (D-29), two runner runs: the second merged `origin/main` after GitHub showed the PR conflicting once B7.3 merged (B1.101)

- **Acceptance:**
  - Activating "Delete todo" asks `window.confirm` first. Confirming deletes as today; cancelling calls no Server Action.
  - The row's markup is unchanged, so REQ-19.3 holds.
  - §19's REQ-19.1, REQ-19.5, AC-19.5–19.7, its function contract and its Out of scope line are edited or lifted in
    the card's `docs(spec)` commit (D-37).
  - The e2e accepts the dialog.
  - Mounts in `src/components/delete-todo-button.tsx`; contract `spec/contracts/33-delete-confirm.md` (section 35).
  - Batch 1.
- **Spec:** §35 — unchanged (contract `spec/contracts/33-delete-confirm.md`, written before the label under D-37; edits §19's REQ-19.1, REQ-19.5, AC-19.5–19.7 and contract, lifts "A confirmation dialog or prompt", re-points §20's proofs)
- **Test:** `src/components/delete-todo-button.test.tsx::AC-35.1: asks window.confirm once with "Delete this todo? This cannot be undone." before calling deleteTodoAction once with ("todo-9")` — red because: `DeleteTodoButton` never calls `window.confirm`, so the confirm spy has 0 calls
- **Tier:** full · **Depends on:** ~~D-37~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B7.1/`

### B7.2 · The "Mark all complete" button says how many it will mark

_F34 · section 36_
**Status: Open** — `spec/contracts/12-complete-all.md:20,21` (REQ-14.4, REQ-14.5) name the button exactly "Mark all
complete", and its contract (line 52) has no count prop. §14's Out of scope (line 61) lists "a message showing how
many were changed". §32 (B6.4) did the same thing for "Clear completed".

- **Acceptance:**
  - With n open todos (n > 0) the button reads "Mark all complete (n)"; with none it keeps the plain disabled label.
  - The count comes from the stored todos, before any filter or search (REQ-14.1, REQ-16.9).
  - `count` is an optional prop, so §14's tests that render without it keep their exact name.
  - The card's `docs(spec)` commit states that §14's Out of scope line does not apply (a count before the click, not a
    result message) and edits REQ-14.4, REQ-14.5 and the contract (D-37).
  - Mounts in `src/components/complete-all-button.tsx`, with the count passed from `src/app/page.tsx` (the batch's one
    `page.tsx` card); contract `spec/contracts/34-complete-all-count.md` (section 36).
  - Batch 1.
- **Spec:** §36 — unchanged (contract `spec/contracts/34-complete-all-count.md`, written before the label under D-37; edits REQ-14.4, REQ-14.5 and §14's contracts; states §14's "message showing how many were changed" does not apply)
- **Test:** `src/lib/complete-all-label.test.ts::AC-36.1: writes "Mark all complete" for 0, "Mark all complete (1)" for 1 and "Mark all complete (12)" for 12` — red because: `completeAllLabel` does not exist yet (the skeleton's stub throws `NotImplementedError`)
- **Tier:** full · **Depends on:** ~~D-37~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B7.2/`

### B7.3 · The due-date editor has a "Today" button

_F35 · section 37_
**Status: Done** — 14defd1 (#301), 6 AC-37.n criteria green (unit 280 → 291: AC-37.1–37.5 as 11 cases, red proven by verify-red.sh; e2e 64 → 65, AC-37.6), mutation 93.22 (lib, actions unchanged); unattended and no-rework 1/1 (D-29), one runner run

- **Acceptance:**
  - In edit mode a `type="button"` "Today" fills the date field with `todayOf(new Date())` read on click. It does not
    save: "Update due date" still saves.
  - Escape while "Today" has focus closes the editor without saving, as in the field (§28).
  - REQ-15.6 and the §15 contract are edited. REQ-28.7 and the "a new control" lines of §17 and §31 are stated not to
    apply: they limit their own sections and the marker. All in the card's `docs(spec)` commit (D-37).
  - Mounts in `src/components/todo-due-date.tsx`; contract `spec/contracts/35-due-date-today.md` (section 37).
  - Batch 1.
- **Spec:** §37 — unchanged (contract `spec/contracts/35-due-date-today.md`, written before the label under D-37; edits REQ-15.6 and §15's contract; states REQ-28.7, the "a new control" lines of §17 and §31, REQ-17.8 and REQ-31.7 do not apply)
- **Test:** `src/components/todo-due-date-today-button.test.tsx::AC-37.2: with the system time at 2026-11-01 12:00, clicking "Today" sets the field to 2026-11-01 for dueDate 2026-10-20 and for no dueDate, shows 0 alerts and makes 0 setTodoDueDateAction calls; "Update due date" then calls it once with (todo-9, 2026-11-01)` — red because: `TodoDueDate` has no button named "Today"
- **Tier:** full · **Depends on:** ~~D-37~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B7.3/`

### B7.4 · The search form says how many todos match

_F36 · section 38_
**Status: Open** — `spec/contracts/14-search.md:75` (§16's Out of scope) lists "counts of matches", and its contract
(lines 56–58) has no count prop. `23-search-shortcut.md:22` (REQ-25.6) and `25-escape-search.md:22` (REQ-27.6) say
§16's markup does not change.

- **Acceptance:**
  - While a search is in effect and at least one todo is shown, the form shows "1 match" or "n matches". The count is
    the todos shown under the current filter and search.
  - At 0 the existing "No todos match your search" message stands alone. The count text never equals that message or
    "n items left". It is not a live region.
  - `count` is an optional prop, so §16, §21, §25 and §27's tests that render without it are unchanged.
  - "Counts of matches" is lifted from §16's Out of scope. REQ-25.6 and REQ-27.6 are stated to limit only their own
    change. §21's "a count of the matches cleared" is stated not to apply. All in the card's `docs(spec)` commit (D-37).
  - Mounts in `src/components/todo-search-form.tsx`, with the count passed from `src/app/page.tsx` (the batch's one
    `page.tsx` card); contract `spec/contracts/36-search-count.md` (section 38).
  - Batch 2.
- **Tier:** full · **Depends on:** ~~D-37~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B7.4/`

### B7.5 · The new-todo counter warns near the limit

_F37 · section 39_
**Status: Open** — `spec/contracts/16-title-counter.md:63` (§18's Out of scope) lists "a warning colour, a threshold
… or any text announced at a threshold". REQ-18.1 (line 17) fixes the counter's text as `<used> / 200`.
`e2e/18-title-counter.spec.ts:20-31` matches the counter with `/^\d+ \/ 200$/` and expects `aria-describedby` to be
`new-todo-count` at 195 and 200 characters.

- **Acceptance:**
  - From 180 used characters a separate element (`id="new-todo-warning"`) shows a short warning text with a warning
    style. The counter's own text and `aria-describedby` are unchanged.
  - The warning is not a live region (REQ-18.8 holds) and is not announced.
  - The threshold is defined once in `src/lib/title-count.ts`, next to the 200 limit.
  - Only "a warning colour, a threshold" is lifted from §18's Out of scope; "a live region" and "any text announced at
    a threshold" stay. REQ-29.7 is stated to limit only the Escape change. All in the card's `docs(spec)` commit (D-37).
  - Mounts in `src/components/todo-form.tsx`; contract `spec/contracts/37-title-counter-warning.md` (section 39).
  - Batch 2.
- **Tier:** full · **Depends on:** ~~D-37~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B7.5/`

### B7.6 · The due-date editor has a "Clear due date" button

_F38 · section 40_
**Status: Open** — §15 already removes a date when the field is submitted empty (`spec/contracts/13-due-date.md:20`,
REQ-15.3; AC-15.3 and AC-15.7). Removing one today means emptying the date field by hand, then pressing "Update due
date". REQ-15.6 (line 23) and the §15 contract (line 76) list the edit form's children as one field and one button.

- **Acceptance:**
  - In edit mode, a `type="button"` named "Clear due date" calls `setTodoDueDateAction(todoId, '')`. It closes the
    editor on `ok` and shows §10's error on failure, as "Update due date" does.
  - No server, action or `src/lib` change.
  - REQ-15.6 and the §15 contract are edited against the text after B7.3's section 37. REQ-28.7, §28's "a "Cancel"
    button", and the "a new control" lines of §17 and §31 are stated not to apply. All in the card's `docs(spec)`
    commit (D-37).
  - Mounts in `src/components/todo-due-date.tsx`; contract `spec/contracts/38-due-date-clear.md` (section 40).
  - Batch 2.
- **Tier:** full · **Depends on:** ~~D-37~~, B7.3 · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B7.6/`
