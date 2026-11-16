# B10.1 analysis

Section: §48 in `spec/contracts/46-escape-title-focus.md` (new). Component: `src/components/todo-item.tsx` only.

## Completeness

| Check                                                       | Result            | Note                                                                                                                                           |
| ----------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words                               | pass              | says where the next key goes; no ref, effect or hook                                                                                           |
| Every behavior has a REQ                                    | pass              | 48.1 Escape focuses the button, 48.2 Escape ignored while pending, 48.3 a save moves no focus, 48.4 once per Escape, 48.5 nothing else changes |
| One EARS pattern each                                       | pass              | event-driven, state-driven, unwanted, ubiquitous x2                                                                                            |
| ≤ 7 criteria                                                | pass              | 7 (6 component, 1 e2e)                                                                                                                         |
| Every Then measurable                                       | pass              | activeElement, roles, call counts, values, row lists                                                                                           |
| No banned adjective without a number                        | pass              | none used                                                                                                                                      |
| Out of scope                                                | pass              | saves, blur, other fields' Escape, scroll, style, announcements                                                                                |
| Unchanged behavior with proof titles                        | pass              | 12 titles copied verbatim from grep: AC-24.1 to 24.5, e2e AC-24.6, AC-41.3 (a) and (b), AC-10.2, AC-6.4, AC-25.3, AC-5.1                       |
| Dependencies done                                           | pass              | §6, §10, §24, §25, §41 on main; E11 waits for E10 (D-45)                                                                                       |
| No settled D-n contradicted                                 | pass              | only the edits D-45 allows; §25 untouched (a button is not text entry, REQ-25.3)                                                               |
| Function contract exact                                     | pass              | signature unchanged; only `todo-item.tsx`; no `src/lib` or `src/actions` file, so mutation testing is skipped                                  |
| Each AC checked against its REQs, siblings and shipped code | pass              | findings below                                                                                                                                 |
| Existing tests broken                                       | none (by reading) | AC-41.3(a) clicks Edit after Escape and the click still enters edit mode; AC-24.x assert roles and values, not `activeElement`                 |

Findings from the cross-check:

- The button is `disabled={pending}` (`todo-item.tsx:113`) and a disabled button cannot take focus. Escape is ignored
  while pending (`:46`), so the button is enabled whenever REQ-48.1 applies. `pending` also covers a toggle (the
  checkbox stays enabled in edit mode), which §24 REQ-24.5 does not name; this is AC-48.3(b).
- The button is re-created on leaving edit mode, so focus can only be set after the commit, not in the keydown handler.
- Focus stealing (D1, §47): a save settles later, possibly after the person moved. The focus move is tied to the Escape
  alone (REQ-48.4), never to a result or an `editing` change. AC-48.4 to AC-48.6 each fail a design that focuses the
  button whenever edit mode ends.
- §41 REQ-41.3: a rejected or failed save stays in edit mode and focuses nothing (AC-48.5).
- §25: `isSearchShortcut` is true for a `BUTTON` target (AC-25.1), so `/` works from the new focus (AC-48.7).
- jsdom leaves `activeElement` at `body` when the focused element is removed; AC-48.3(a) and AC-48.4(b) rely on it, as
  AC-41.1 does.

## Open questions

1. **Toggle in flight during edit.** Shipped code ignores Escape while any action of the row is pending; §24 REQ-24.5
   names only a save. Proposed: REQ-48.2 names both and the code does not change.
2. **§41's function contract line (`39:52`) said the exit from edit mode calls no `focus()`.** Resolved by the
   orchestrator in the same `docs(spec)` commit: the line now says "by a save" and names §48 for Escape, so the two
   sections do not contradict (D-45: each section's edits are those its contract names; §48 names it).
3. **Mechanism, left to code-writer.** Proposed: a one-shot marker set by the Escape handler and consumed by an effect
   after the commit (a ref, not state keyed on `editing`). Otherwise AC-48.4 to AC-48.6 turn red.
4. **Section vs file numbering.** §48 lives in `46-escape-title-focus.md`; e2e is `e2e/48-escape-title-focus.spec.ts`.
5. **The §24 Out of scope lift left a long unwrapped line.** Proposed: leave.

## Needs a ruling

None.

Written by the orchestrator from `spec-analyst`'s report: the role's Write was refused for a report file.
