# D-37 request: E7's batch rule, spec first, and the lines each card lifts or edits

Provisional id D-37 (the next free id on main at 2026-11-14).

## Why

Three runs stopped for a spec ruling in the last two epics:

- B5.3 for D-31;
- B6.5 for D-34 (REQ-23.7 "no role");
- B6.6 for D-35 (§22's Out of scope).

D-29 counts each stop as attended. A read-only pre-check of the six cards proposed for E7 found that every card
contradicts an existing section line: a REQ, an AC's Then, a function contract, or an Out of scope or "markup
unchanged" line. The last epics' answer was a ruling mid-run. This request moves both the ruling and the section
before the label.

## The rule (option A, recommended)

1. **Spec first.** For each E7 card, `spec-analyst`, in an attended session, writes the section and the lifts or edits
   below in a `docs(spec)` PR. The same PR adds the card's `Spec:` and `Test:` lines. The issue is labeled
   `agent-ready` only after that PR merges, so the run starts at the skeleton and the red tests.
2. **Batches.**
   - Batch 1: B7.1, B7.2, B7.3.
   - Batch 2: B7.4, B7.5, B7.6.
   - Each batch's three `run.sh` start together.
   - One `src/app/page.tsx` card per batch (B7.2, B7.4).
   - No two cards of a batch share a component.
   - Batch 2 starts from a `main` that holds batch 1, because B7.1 and a batch-2 card may share
     `src/components/todo-item.test.tsx`.
3. **Sections and files.** Feature ids F33–F38 in card order.

| Card | Section | Contract                              | Component                                 |
| ---- | ------- | ------------------------------------- | ----------------------------------------- |
| B7.1 | 35      | `spec/contracts/33-delete-confirm.md` | `delete-todo-button.tsx`                  |
| B7.2 | 36      | `34-complete-all-count.md`            | `complete-all-button.tsx`, `page.tsx`     |
| B7.3 | 37      | `35-due-date-today.md`                | `todo-due-date.tsx`                       |
| B7.4 | 38      | `36-search-count.md`                  | `todo-search-form.tsx`, `page.tsx`        |
| B7.5 | 39      | `37-title-counter-warning.md`         | `todo-form.tsx`, `src/lib/title-count.ts` |
| B7.6 | 40      | `38-due-date-clear.md`                | `todo-due-date.tsx`                       |

## Lines each card may change (in its own `docs(spec)` commit)

**B7.1, delete asks for confirmation.** Use `window.confirm`, which adds no markup.

- Edit:
  - `17-delete.md`: line 9 (intent), REQ-19.1 (17), REQ-19.5 (21), line 33;
  - AC-19.5 (a) and (b) (44), AC-19.6 (45), AC-19.7 (46);
  - the contract (57).
- Lift the Out of scope line 71, "A confirmation dialog or prompt".
- Re-point `18-created-date.md:80,82` (unchanged-behavior proofs).
- State that REQ-19.3 (19) and REQ-20.7 (`18-created-date.md:24`) hold, since no control is added.
- Tests the red step rewrites from the edited section:
  - `src/components/delete-todo-button.test.tsx:58,70-71`;
  - `src/components/todo-item.test.tsx:189-198`;
  - `e2e/19-delete.spec.ts:64` (Playwright dismisses `confirm` by default).

**B7.2, "Mark all complete (n)".**

- Edit:
  - REQ-14.4 (`12-complete-all.md:20`) and REQ-14.5 (21): the name contains the label, and at 0 it is exactly
    "Mark all complete";
  - the contracts (52, 53): an optional `count` prop.
- State that the Out of scope line 61 ("a message showing how many were changed") does not apply, as §32 did for §9.
- The count comes from the stored todos (`14-search.md:60`, REQ-16.9).
- `complete-all-button.test.tsx` keeps its exact names because the prop is optional.

**B7.3, a "Today" button.**

- Edit:
  - REQ-15.6 (`13-due-date.md:23`);
  - the §15 contract (76): a `type="button"` "Today" fills the draft with `todayOf(new Date())` and does not save.
- State that these do not apply, since each limits its own change or the marker:
  - REQ-28.7 (`26-escape-due-date.md:23`);
  - the "a new control" lines of §31 (`29-due-today.md:68`) and §17 (`15-overdue.md:69`);
  - REQ-31.7 and REQ-17.8 (the marker span, view mode only).
- Escape while "Today" has focus closes the editor without saving.

**B7.4, the match count.**

- Lift "counts of matches" (`14-search.md:75`).
- Edit the contracts (56–58): an optional `count` prop.
- State that these do not apply:
  - REQ-25.6 (`23-search-shortcut.md:22`) and its contract (53);
  - REQ-27.6 (`25-escape-search.md:22`) and its contract (53);
  - §21's prose (`19-clear-search.md:28`), contract (51) and Out of scope "a count of the matches cleared" (68).
- The count is shown only while a search is in effect and at least one todo is shown. It reads "1 match" or "n
  matches", never "No todos match your search" or "n items left". It is not a live region.

**B7.5, the counter warning.**

- Lift only "a warning colour, a threshold" (`16-title-counter.md:63`). "A live region" and "any text announced at a
  threshold" (63–64) stay, and so does REQ-18.8 (24).
- The warning is a separate element. REQ-18.1 (17), AC-18.7 (42) and the `aria-describedby` values in the contract
  (51–54) are unchanged.
- State that REQ-29.7 (`27-escape-new-todo.md:23`) and its contract (44) do not apply.
- The threshold, 180, is defined in `src/lib/title-count.ts`.

**Dropped: double-click a title to edit.** The title is the checkbox's `<label>` (`todo-item.tsx:95`), so each click
toggles the todo before the editor opens, which breaks REQ-6.3. A replacement takes its place as B7.6.

**B7.6, a "Clear due date" button (the replacement).** It was chosen from four candidates by the same pre-check:

- **"Clear completed" asks first:** about 14 edits, 2 lifts, and 4 unit and 7 e2e tests to rewrite.
- **`aria-current` on the filter link:** already exists (REQ-12.7).
- **"Mark all complete" asks first:** about 9 edits, 1 lift, 6 tests, and it stacks on B7.2.
- **"Clear due date" button:** chosen.

§15 already clears a date on an empty submit (REQ-15.3, `13-due-date.md:20`; AC-15.3, AC-15.7), so the button calls
`setTodoDueDateAction(todoId, '')`. It needs no server, action or `src/lib` change.

- Edit REQ-15.6 (`13-due-date.md:23`) and the §15 contract (76), written against the text after B7.3's section 37
  lands. The same component means B7.6's section is written after B7.3's `docs(spec)` PR merges.
- State that these do not apply:
  - REQ-28.7 (`26-escape-due-date.md:23`);
  - §28's Out of scope "a "Cancel" button" (53): Clear saves an empty date, it does not cancel;
  - the "a new control" lines of §17 (`15-overdue.md:69`) and §31 (`29-due-today.md:68`);
  - the "file unchanged" lines of §17, §19, §20, §23, §28 and §31.
- Constraints: `type="button"`; named "Clear due date" (never exactly "Due date", which `getByLabelText` would also
  match, and never plain "Clear"). No existing unit or e2e test breaks.

## Options

| Option                                        | What                                                                    | Cost                                      | Risk                                                                               | Reversible |
| --------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------- | ---------- |
| **A (recommended)** Spec first, rule as above | sections and lifts land in attended `docs(spec)` PRs, then the label    | one attended `spec-analyst` pass per card | low: a run that still meets a conflict stops as before                             | yes        |
| B. D-33 style, sections inside the run        | the run's `spec-analyst` writes the section under the lifts named above | none up front                             | a run that meets a line not named here stops mid-run (as B6.5, B6.6 did): attended | yes        |
| C. Rule each conflict when a run raises it    | no batch ruling                                                         | none up front                             | high: every card is expected to stop                                               | yes        |

Lead, in the orchestrating session: "đồng ý spec trước, D-37 theo đề xuất, bỏ B7.6" (A; the double-click card is
dropped and replaced).
