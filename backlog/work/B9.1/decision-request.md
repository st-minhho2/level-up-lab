# D-40 request: E9's batch rule, spec first, and the lines each card lifts or edits

Provisional id D-40, the next free id on main on 2026-11-16.

## Why

D-29 needs two consecutive batches that meet all four targets. E7's two batches met unattended and no-rework (3/3
each) but not throughput: 7.7, then 5.5 cards per 8 h against 9.4. In E7 batch 2 each run took 34–36 min from label to
ready (B1.100 worked); the miss was 3 h 52 min from the first ready to the last merge.

So E8 and a fourth batch must both pass, with merges inside about 2 h of ready. E9 is that fourth batch. It follows
D-39's spec-first rule and picks cards that touch no `src/lib` or `src/actions` file, so every run skips local mutation
testing (B1.100).

## Pre-check

A read-only pass assessed ten candidates against every section (§1–§43 on main): each conflicting line as file:line,
the tests that would break, and the files touched. Components E8 changes (`todo-item.tsx`, `todo-filter-nav.tsx`,
`complete-all-button.tsx`) were excluded.

| Candidate                                        | Verdict  | Why                                                                                             |
| ------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------- |
| A. "Clear completed" hidden at 0                 | reserve  | 9 spec lines in §9 and §32; 6 tests; wait for §43's pattern                                     |
| B. delete dialog names the todo                  | drop     | the button gets only `todoId` (`delete-todo-button.tsx:11`), so it also edits `todo-item.tsx`   |
| C. "Tomorrow" button in the date editor          | reserve  | 6 spec edits (§15, §37, §40 "exactly 5"); 2 unit tests; replaces B9.2 if it fails               |
| D. focus in "New todo" after a successful add    | **B9.1** | no conflict; 0 tests break                                                                      |
| E. "Add" disabled while the title is empty       | drop     | the UI could no longer reach AC-5.3's error; 4 unit tests                                       |
| F. singular "1 overdue todo"                     | drop     | the label comes from `overdueLabel` in `src/lib/overdue-count.ts:13`                            |
| G. "Search" disabled while the box is empty      | drop     | the form must work without JavaScript (REQ-16.2); blocks Enter; needs state the guide rules out |
| H. "Today" disabled when the field holds today   | drop     | contradicts REQ-37.5; breaks AC-37.3 and AC-37.6                                                |
| I. focus in the date field when the editor opens | **B9.2** | no conflict; 0 tests break; one clause added to §40's contract                                  |
| J. `/` also selects the search box's text        | **B9.3** | edits REQ-25.5, lifts one Out of scope item, one contract line; 0 tests break                   |

Checked by reading: no e2e test presses a key after an add that expects focus elsewhere (`e2e/29-escape-new-todo.spec.ts:96-104`
reloads), and every e2e `/` press is on an empty box (`e2e/25-search-shortcut.spec.ts:83, 99, 113`,
`e2e/27-escape-search.spec.ts:99`).

## The rule (option A, recommended)

1. **Spec first**, as in D-39:
   - Each card's section and its lifts or edits land in an attended `docs(spec)` PR with the card's `Spec:` and `Test:`
     lines.
   - Issues are labeled after that PR merges **and** after E8 has merged.
2. **Batch.**
   - B9.1, B9.2 and B9.3 run together.
   - No card changes `src/app/page.tsx`, `src/lib/` or `src/actions/`.
   - No two cards share a component, and none uses one E8 changes.
3. **Sections, contracts and features:**

| Card | Section | Contract                              | Feature | Component              |
| ---- | ------- | ------------------------------------- | ------- | ---------------------- |
| B9.1 | 44      | `spec/contracts/42-new-todo-focus.md` | F42     | `todo-form.tsx`        |
| B9.2 | 45      | `43-due-date-focus.md`                | F43     | `todo-due-date.tsx`    |
| B9.3 | 46      | `44-search-select.md`                 | F44     | `todo-search-form.tsx` |

## Lines each card may change, in its own `docs(spec)` commit

**B9.1** lifts and edits nothing. It states that these notes do not apply, because each limits its own section:

- `27-escape-new-todo.md:44` ("signature and markup unchanged");
- `37-title-counter-warning.md:66` ("files of §5, §18 and §29 … do not change");
- `17-delete.md:59` ("`todo-form.tsx`: unchanged").

`16-title-counter.md:51` ("signature unchanged") stays true. §29's Out of scope "restoring focus" (`27:58`) is about
Escape and holds. Proposed answer to the open question: a failed save does not move focus.

**B9.2**:

- **Edit:** one clause in §40's contract (`38-due-date-clear.md:64`): entering edit mode focuses the date field.
- **State do not apply:** `17-delete.md:59`, `21-overdue-count.md:63`, `35-due-date-today.md:60` and
  `38-due-date-clear.md:67`.
- **Unchanged:** the "props unchanged" lines `15-overdue.md:51`, `29-due-today.md:48`, `35:50`, `38:57`;
  `26-escape-due-date.md:54` and `35:66`, which name other moments.

**B9.3**:

- **Edit:** REQ-25.5 (`23-search-shortcut.md:21`) and the contract line (`23:53`).
- **Lift:** "selecting the box's text on focus" (`23:62`).
- **Unchanged:** `19-clear-search.md:51` and `25-escape-search.md:53` ("signature and markup unchanged", still true);
  the intent lines `19:9` and `25:10` describe §21 and §27.

## Options

| Option                                        | What                                                              | Cost                                      | Risk                                                         | Reversible |
| --------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------ | ---------- |
| **A (recommended)** Spec first, rule as above | sections and lifts in an attended `docs(spec)` PR, then the label | one attended `spec-analyst` pass per card | low: a line not named here still stops a run, and is counted | yes        |
| B. Swap B9.2 for C ("Tomorrow" button)        | same rule, C instead of I                                         | 2 unit rewrites and 6 spec edits          | low                                                          | yes        |
| C. Sections inside the run (D-33 style)       | the run's `spec-analyst` writes the section under the lifts above | none up front                             | a run that meets an unnamed line stops mid-run (attended)    | yes        |

Lead, in the orchestrating session: "giữ B9.1–B9.3, D-40 theo đề xuất" (A).
