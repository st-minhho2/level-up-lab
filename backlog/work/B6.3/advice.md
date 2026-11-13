# B6.3 advice

## Approaches

**A (recommended): new pure `src/lib/todo-due-today.ts` + one added span in `todo-due-date.tsx`.**

- Change: `DUE_TODAY_LABEL = 'Due today'` and `isDueToday(dueDate, today, completed)` in a new pure lib file (no
  Prisma, no `server-only`); `TodoDueDate` imports both and `todayOf` from `todo-overdue.ts`, and renders a
  `<span>` after the `Overdue` slot, inside the non-editing fragment, when
  `today !== undefined && isDueToday(dueDate, today, completed)`. Reuses §17's `today` / `completed` state and the
  no-dependency-array layout effect; no new state, no new effect, props unchanged.
- Pros: exactly §31's Function contracts block (path, names, signatures); the card's Test line targets this file;
  `todo-overdue.ts` (§17) keeps its contract; the red unit test needs no React.
- Cons: one more module, so `check-features-map.sh` needs it in an F29 row (the `docs(map)` commit).
- Fits rules: invariants 1 and 4 (pure, no Prisma); `src/lib/CLAUDE.md` pattern of one small pure module per section.

**B (alternative): put both in `todo-overdue.ts`, or inline `dueDate === today && !completed` in the component.**

- Pros: no new file.
- Cons: B1 edits a §17 file, which §31 says keeps its contract; B2 leaves no unit target, so the card's Test line
  (`src/lib/todo-due-today.test.ts`) could not be red on an import-free unit and a mutant on the comparison would
  be caught only by the component test. Both contradict §31's block. Rejected.

## Recommendation

Approach A.

## Impact

| File                                            | Add/Change    | Signature                                                                                                               | ACs                         |
| ----------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `src/lib/todo-due-today.ts`                     | Add           | `DUE_TODAY_LABEL = 'Due today'`; `isDueToday(dueDate: string \| undefined, today: string, completed: boolean): boolean` | AC-31.1                     |
| `src/components/todo-due-date.tsx`              | Change        | `TodoDueDate({ todoId, dueDate }): ReactNode` unchanged; one extra `<span>` after the Overdue slot                      | AC-31.2 to AC-31.5, AC-31.6 |
| `src/lib/todo-due-today.test.ts`                | Add (test)    | unit, no mocks                                                                                                          | AC-31.1                     |
| `src/components/todo-due-date-today.test.tsx`   | Add (test)    | jsdom, `@/actions/todos` mocked via `vi.hoisted`, fake `Date` only                                                      | AC-31.2 to AC-31.5          |
| `e2e/31-due-today.spec.ts`                      | Add (test)    | Playwright                                                                                                              | AC-31.6                     |
| `e2e/17-overdue.spec.ts`                        | Change (test) | `readsAs` / `describeRow` must accept `Due today` for open rows whose day is today                                      | AC-17.7 stays, see Risks    |
| `spec/features-map.md`                          | Change        | new row F29 (`docs(map)`, code-writer)                                                                                  | none                        |
| `src/lib/CLAUDE.md`, `src/components/CLAUDE.md` | Change        | one table row; "§15 and §17 are the only idle additions" gains §31                                                      | doc drift, see below        |

Client component `todo-due-date.tsx`, one line per approach:

- A, server-rendered markup: `today` is `undefined` on the server and in the first client render, so the markup is
  byte-identical to today (no `Due today`). JS off: same as today, no marker (the marker needs the browser's day).
  Submit before hydration: the edit button is inert before and after the change, no form exists in the idle markup;
  same as today. After hydration: the span appears. Dropped behavior: none.
- B (inline or in `todo-overdue.ts`): identical markup in all three states; dropped behavior: none (the cons are
  structural, above).

## Risks

- Migration: none. No dependency, no env, no `prisma/`: medium tier (D-28).
- Security / performance / isolation: none; no action, no query, no timer; one string comparison per render.
- Existing tests that can turn red (read, not run):
  - `e2e/17-overdue.spec.ts` AC-17.7: `readsAs` (lines 89-98) requires the row text to be exactly title, `Due <day>`,
    then `Overdue` only when overdue, nothing else. Rows C (open, due today) and A after "due today" now also read
    `Due today`, so `expectRows` fails. §31 REQ-31.1 forces the new text, so the test must follow: the `test(...)`
    commit extends `RowText` with a `dueToday` part (`Due today` after `Due <day>`, expected exactly for open rows
    whose day is today). This is an extension that still asserts every old value, not a loosening. §31's
    "Unchanged behavior" table does not list this e2e, so `spec-analyst` or the lead should confirm it in the plan
    (it is the one test edit outside the card's three new files).
  - `e2e/23-overdue-count.spec.ts`, `e2e/15`, `e2e/20`, `e2e/28`, `e2e/05`: checked; rows compared by whole text use
    dates 2026-11-05 or none, or do not read row text with a today date. Green expected.
  - `todo-due-date.test.tsx`, `todo-due-date-overdue.test.tsx`: use fixed dates other than the real day; the real
    date today (2026-11-13) appears in none. Green expected. Tests with an unmocked clock and a due date equal to the
    run's real day would flake; the new tests must fake `Date`, as the §17 file does.
- Hydration: the span must be rendered only from the `today` state; reading `new Date()` in render breaks AC-31.4.
- Never together with `Overdue`: guaranteed by `<` versus `===` on one `today`; both read the same state.

## Test strategy

| Layer     | File                                          | ACs                       | Mocks                                                                      |
| --------- | --------------------------------------------- | ------------------------- | -------------------------------------------------------------------------- |
| unit      | `src/lib/todo-due-today.test.ts`              | AC-31.1                   | none                                                                       |
| component | `src/components/todo-due-date-today.test.tsx` | AC-31.2, 31.3, 31.4, 31.5 | `@/actions/todos` (`vi.hoisted`); `vi.useFakeTimers({ toFake: ['Date'] })` |
| e2e       | `e2e/31-due-today.spec.ts`                    | AC-31.6                   | none (compose PostgreSQL, browser's own day)                               |
| e2e       | `e2e/17-overdue.spec.ts` (extend `readsAs`)   | AC-17.7 (unchanged id)    | none                                                                       |

## Mutation hot spots

- `isDueToday`: `!completed`, `dueDate !== undefined`, `===` (mutants `<=`, `>=`, `!==`); AC-31.1's six cases kill each
  (`'0999-12-31'` pins zero-padding is not touched, the completed case pins `!completed`).
- The `DUE_TODAY_LABEL` string literal (AC-31.1 asserts it exactly).
- Component: the `today !== undefined` guard (AC-31.4), span placement after `Due <date>` (AC-31.2 order), the
  `completed` argument (AC-31.3). The component is outside the mutation scope (`src/lib` and `src/actions`), so these
  rest on the component and e2e tests.

## Questions settled / escalated

```
Question:    May B6.3 add src/lib/todo-due-today.ts although D-33 says the card mounts in src/components/todo-due-date.tsx?
Class:       P0 no conflict
Sources:     backlog/00-decisions.md:58 "B6.3 section 31 (`29-due-today.md`, `src/components/todo-due-date.tsx`) in batch 1"
             spec/contracts/29-due-today.md:45 "// src/lib/todo-due-today.ts (§31): pure; no Prisma, no server-only, so a client component may import it"
             spec/contracts/29-due-today.md:58 "No file other than `src/lib/todo-due-today.ts` and"
Conflict:    none (D-33 fixes the component each card mounts in and forbids two cards of a batch sharing one; it does not forbid a lib module. §31 names both files.)
Verdict:     Create it. D-33 governs the component and section numbering; §31's Function contracts govern the lib file; the card's Test line already targets it.
Next action: dev-lead writes plan.md with approach A; state the lib file next to the component in the Files list.
Must not:    Inline the comparison in the component or edit todo-overdue.ts to avoid the new file.
Doc drift:   none to the spec or D-33. `spec/features-map.md` F29 row in the `docs(map)` commit; `src/lib/CLAUDE.md` and `src/components/CLAUDE.md` rows in the same commit (plan must list them).
Escalate:    none
```

```
Question:    Is a new lib file name todo-due-today.ts acceptable to check-spec-sections.sh and the features-map check?
Class:       P0 no conflict
Sources:     scripts/ci/check-features-map.sh:21 "grep -q \"\\`$m\\`\" spec/features-map.md || { echo \"::error::$m is in no features-map row\"; fail=1; }"
Conflict:    none
Verdict:     check-spec-sections.sh only resolves cited §n headings (§31 exists in contracts/29-due-today.md? the check needs a "# §31 " heading, present at line 1). The features-map check fails until an F29 row names the file and the tests; the row is added in the `docs(map)` commit, and the row's status stays ✗ until the closing PR.
Next action: code-writer adds the F29 row naming `src/lib/todo-due-today.ts`, `src/components/todo-due-date.tsx` and the three test files.
Must not:    Edit features-map.md before the feat commit, or leave it out.
Doc drift:   spec/features-map.md in the docs(map) commit
Escalate:    none
```

```
Question:    The existing e2e AC-17.7 reads each row's whole text; does §31 allow changing it?
Class:       P1 code ≠ spec (a test is evidence, §31 REQ-31.1 is the contract)
Sources:     spec/contracts/29-due-today.md:18 "THE SYSTEM SHALL show the text `Due today` in that todo's row"
             e2e/17-overdue.spec.ts:97 "return rest.trim() === '';"
Conflict:    REQ-31.1 adds text to open due-today rows / e2e AC-17.7 allows only title, Due <day>, Overdue.
Verdict:     The spec governs; the e2e is extended in the card's `test(...)` commit (an addition that keeps every old assertion), never in the `feat` commit.
Next action: the plan lists `e2e/17-overdue.spec.ts` as a changed test file; the lead sees it at approval.
Must not:    Touch the e2e in the feat commit, or drop the exact-text check to make it pass.
Doc drift:   none required; §31's Unchanged-behavior table could name this e2e (spec-analyst's choice, outside this card).
Escalate:    none
```
