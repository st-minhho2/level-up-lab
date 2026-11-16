# B11.3 analysis

Section §53, `spec/contracts/51-delete-description.md`, feature F51, `src/components/delete-todo-button.tsx` only (D-45).

## Completeness

| Check                                | Result | Note                                                                                                                                                         |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Intent without solution words        | pass   | No attribute or hook named in the Intent.                                                                                                                    |
| Every behavior has a REQ             | pass   | description while a message shows (53.1), unique id (53.2), none otherwise (53.3), success (53.4), pending retry (53.5), cancel (53.6), nothing else (53.7). |
| One EARS pattern each                | pass   | state-driven 53.1, 53.3, 53.5; ubiquitous 53.2, 53.7; event-driven 53.4; unwanted 53.6.                                                                      |
| At most 7 criteria                   | pass   | 6 (AC-53.1 to AC-53.6).                                                                                                                                      |
| Every Then measurable                | pass   | exact ids, texts, counts, attribute presence, `toHaveAccessibleDescription`.                                                                                 |
| No banned adjective without a number | pass   |                                                                                                                                                              |
| Out of scope                         | pass   |                                                                                                                                                              |
| Unchanged behavior with proof titles | pass   | titles copied from grep of the test files (AC-19.5, AC-19.6, AC-35.2, AC-35.3, AC-10.2, e2e AC-35.5).                                                        |
| Dependencies done                    | pass   | §19, §35, §10 shipped; D-45 says E11 is labeled only after E10 merged (it renders inside `todo-item.tsx`), no code dependency on B11.1/B11.2.                |
| No settled D-n contradicted          | pass   | D-45: one file, no `src/lib`, `src/actions`, `page.tsx`, `todo-form.tsx`; REQ-35.5 clause allowed by D-45.                                                   |

Probe against siblings and shipped code (D-45 (1)):

- Shipped component sets `error` only when the transition settles, so the message and attribute persist while a retry
  is pending (AC-53.3) and a cancel returns before the transition (AC-53.4). No new state is needed.
- The shipped button has `aria-label` and `title` both "Delete todo". With `aria-describedby` set the description is the
  message; idle, `title` may supply a description, so no criterion asserts an idle description, only the missing
  attribute (REQ-53.3). Without this, a test asserting `toHaveAccessibleDescription('')` would be wrong.
- REQ-35.5 ("no `aria-*` attribute … for the confirmation") and the §35 contract comment would read as contradicting
  §53; the REQ-35.5 clause and §53's "Edits" paragraph resolve it. REQ-20.7 forbids an added `aria-label`, not
  `aria-describedby`; REQ-19.3 (no text added) holds, nothing visible changes.
- AC-19.6 and AC-35.2 count alerts and check the sibling position only, so the added `id` and attribute break neither.
  AC-10.2 counts alerts in a `TodoItem` with a failed toggle only (no failed delete there).
- Id collisions: `todo-<id>-error` (`todo-item.tsx:20`) and `todo-<id>-due-date-error` (`todo-due-date.tsx:47`) are
  derived from the todo id; `useId` gives values such as `:r1:` that cannot equal them (AC-53.5, AC-53.6).
- `TodoItem` can show a toggle alert and a delete alert at once (separate elements), so AC-53.6 expects 2 alerts in
  that case; no existing criterion asserts exactly 1 alert for a row with both failures.
- The red test fails on an assertion (`aria-describedby` missing), not on an import: the component exists.

## Open questions

1. Q: Should a successful delete also be covered end to end? Proposed: no; a failing delete cannot be provoked in the
   browser without touching `src/`, and a success removes the row (REQ-19.4, covered by AC-19.7). Otherwise: a
   `page.route` fault injection e2e, not in D-45's file list.
2. Q: Should the idle button get an explicit empty description (drop `title`)? Proposed: no, out of scope (REQ-19.3
   names the button by `aria-label`/`title`; removing `title` changes the tooltip). Otherwise: a §19 edit needing a D-n.

## Needs a ruling

None.
