# D-39 request: E8's batch rule, spec first, and the lines each card lifts or edits

Provisional id D-39, the next free id on main on 2026-11-14.

## Why

D-29 needs two consecutive batches that meet all four targets. E7 batch 1 met unattended and no-rework (3/3 each)
but not throughput (7.7). So E7 batch 2 and a third batch must both pass.

E8 is that third batch. It follows D-37's spec-first rule, which ran E7 batch 1 with no mid-run stop. It also picks
cards that touch no `src/lib` or `src/actions` file, so every run skips local mutation testing (B1.100), the main cost
in E7 batch 1.

## Pre-check

A read-only pass assessed eight candidates against every section (§1–§40 on main): each conflicting line as file:line,
the tests that would break, and the files touched.

| Candidate                                           | Verdict  | Why                                                                                          |
| --------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| A. select the title on opening the editor           | **B8.1** | no conflict (§6, §24 silent); 0 tests break                                                  |
| B. "Save" disabled for an empty or unchanged draft  | drop     | blocks Enter submit (REQ-24.6), edits AC-6.4, REQ-6.5, AC-24.3; 3 unit tests; same file as A |
| C. strike-through on completed titles               | drop     | already in code (`todo-item.tsx:95`) with no section: a `/spec-trace` drift item             |
| D. hide 0-count filter links except the current one | **B8.2** | edits listed below; 1 unit, 3 e2e                                                            |
| E. hide "Mark all complete" when nothing to mark    | **B8.3** | edits listed below; 2 unit, 4 e2e                                                            |
| F. "No items left" at 0                             | drop     | ~20 lines across §13, §22, §34; 5 unit, 10 e2e; changes `src/lib/todo-count.ts`              |
| G. overdue count as a filter link                   | drop     | REQ-23.7 forbids `<a>`; `TodoFilter` type, `src/lib`, `page.tsx`                             |
| H. delete confirm names the todo                    | reserve  | edits §35 and §19; 1 e2e; also edits `todo-item.tsx`, so it can only replace B8.1            |

## The rule (option A, recommended)

1. **Spec first**, as in D-37:
   - Each card's section and its lifts or edits land in an attended `docs(spec)` PR with the card's `Spec:` and `Test:`
     lines.
   - Issues are labeled after that PR merges **and** after E7 batch 2 has merged.
2. **Batch.**
   - B8.1, B8.2 and B8.3 run together.
   - No card changes `src/app/page.tsx`, `src/lib/` or `src/actions/`.
   - No two cards share a component.
3. **Sections, contracts and features:**

| Card | Section | Contract                                 | Feature | Component                 |
| ---- | ------- | ---------------------------------------- | ------- | ------------------------- |
| B8.1 | 41      | `spec/contracts/39-edit-title-select.md` | F39     | `todo-item.tsx`           |
| B8.2 | 42      | `40-filter-hide-empty.md`                | F40     | `todo-filter-nav.tsx`     |
| B8.3 | 43      | `41-complete-all-hidden.md`              | F41     | `complete-all-button.tsx` |

## Lines each card may change, in its own `docs(spec)` commit

**B8.1** lifts and edits nothing. It states that these "`todo-item.tsx` unchanged" notes do not apply, because each
limits its own section:

- `22-escape-edit-title.md:44`
- `13-due-date.md:77`
- `17-delete.md:58`
- `18-created-date.md:56`
- `15-overdue.md:61-62`
- `19-clear-search.md:57`
- `20-all-done.md:51`
- `21-overdue-count.md:63`
- `26-escape-due-date.md:48-49`
- `33-delete-confirm.md:55`
- `35-due-date-today.md:62`
- `38-due-date-clear.md:69`

§24's Out of scope "restoring focus to the 'Edit title' button" (`22:50`) holds.

**B8.2**:

- **Edit:**
  - REQ-12.1 (`10-filter.md:17`) and AC-12.7 (`10:42`);
  - REQ-30.1 (`28-filter-counts.md:16`), REQ-30.5 (`28:20`), AC-30.3 (`28:32`), AC-30.6 (`28:35`) and AC-30.7
    (`28:36`).
- **Lift:** "hiding a zero count" (`28:64`).
- **State do not apply:** `14-search.md:72` and `19-clear-search.md:57`.
- **Unchanged:** REQ-30.6 and AC-12.4 (rendering without counts).
- **Tests to rewrite:**
  - `todo-filter-nav-counts.test.tsx:80`;
  - `e2e/12-filter.spec.ts:131`;
  - `e2e/30-filter-counts.spec.ts:89, 118`.

**B8.3**:

- **Edit:**
  - REQ-14.5 (`12-complete-all.md:21`, "it is never hidden"), AC-14.4 (a) (`12:39`), AC-14.6 (`12:41`) and the page
    contract (`12:59`);
  - REQ-36.2 (`34-complete-all-count.md:18`), AC-36.3 (`34:36`), AC-36.6 (`34:39`) and AC-36.7 (`34:40`).
- **Lift:** "hiding the button at 0" (`34:64`).
- **Re-point:** unchanged rows `34:71, 74, 75`.
- **Focus:** the section states where focus goes when the button unmounts after a successful mark-all.
- **Tests to rewrite:**
  - `complete-all-button.test.tsx:37`;
  - `complete-all-button-count.test.tsx:41`;
  - `e2e/14-complete-all.spec.ts:51, 59`;
  - `e2e/36-complete-all-count.spec.ts:64, 94`.

## Options

| Option                                        | What                                                              | Cost                                      | Risk                                                         | Reversible |
| --------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------ | ---------- |
| **A (recommended)** Spec first, rule as above | sections and lifts in an attended `docs(spec)` PR, then the label | one attended `spec-analyst` pass per card | low: a line not named here still stops a run, and is counted | yes        |
| B. Swap B8.1 for H (named delete confirm)     | same rule, H instead of A                                         | 1 e2e rewrite and §35 edits               | low                                                          | yes        |
| C. Sections inside the run (D-33 style)       | the run's `spec-analyst` writes the section under the lifts above | none up front                             | a run that meets an unnamed line stops mid-run (attended)    | yes        |

Lead, in the orchestrating session: "giữ B8.1–B8.3, D-39 theo đề xuất" (A).
