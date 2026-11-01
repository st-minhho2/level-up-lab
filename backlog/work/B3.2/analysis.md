# B3.2 analysis

Section: §18 Todos: a character counter on the new-todo box, `spec/contracts/16-title-counter.md` (new, D-21). 9 REQ,
7 AC. Written by `spec-analyst`; saved by `dev-lead` because the role's Write tool refused this one file.

## Completeness

| Check                                | Result | Note                                                                                                                                                            |
| ------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | one person-level paragraph                                                                                                                                      |
| Every behavior has a REQ             | pass   | presence and text, what is counted, zero state, typing, no clamping, reset after a save, typing while pending, accessibility, nothing else changes              |
| One EARS pattern each                | pass   | ubiquitous 18.1, 18.2, 18.5, 18.8, 18.9; state-driven 18.3, 18.7; event-driven 18.4, 18.6                                                                       |
| At most 7 criteria                   | pass   | 7: 2 lib, 4 component, 1 e2e                                                                                                                                    |
| Every Then measurable                | pass   | exact numbers, texts, role counts, accessible descriptions, box values                                                                                          |
| No banned adjective without a number | pass   | none used                                                                                                                                                       |
| Out of scope stated                  | pass   | graphemes, normalization, a "left" figure, colours, thresholds, live region, truncation, other boxes, values that arrive with no event, schema/actions/messages |
| Unchanged behavior with proof titles | pass   | 12 rows, titles from `grep` in this worktree                                                                                                                    |
| Dependencies done                    | pass   | none; §5 and §10 are on this branch                                                                                                                             |
| No settled D-n contradicted          | pass   | D-5 is the counted value and limit; D-21 followed: UI in `src/components/todo-form.tsx` only, logic in `src/lib/title-count.ts`                                 |

What is counted: `value.trim().length`, UTF-16 code units, the number the §5 schema (`z.string().trim()`, max 200)
judges. Emoji 2, `'İ'` 1, `'e'` + U+0301 2; no grapheme grouping, no normalization. Text `<used> / 200`, 200 imported
as `TITLE_MAX_LENGTH`. `0 / 200` for `''`, whitespace only and the server HTML; `200 / 200` at the limit; above 200
(script only) shown as is, never clamped; leading and trailing whitespace not counted.

Box life cycle: the box is uncontrolled. `draft` follows `onChange`, and `onSubmit` seeds it from the submitted form.
`defaultValue={kept}` is `draft` after a `form` failure and `''` otherwise; React resets the box to that after every
action settles, with no change event. So `draft` alone is wrong after a success, after a title error, and after a
success when text was typed during the pending save. REQ-18.6 and REQ-18.7 pin the observable result; AC-18.4 to
AC-18.6 are the three cases.

Accessibility: the counter is a plain `<p id="new-todo-count">` linked by `aria-describedby`, not a live region (a live
region would announce up to 200 updates while typing). The component test asserts the accessible description, 0
`alert`, 0 `status`, 0 `aria-live`. AC-10.5's 1-alert assertions stay valid because the counter has no role.

## Open questions

1. **Trimmed count while the box is full of padding.** With 5 leading spaces and 195 letters the counter reads
   `195 / 200`, yet the box refuses another key. Proposed: count trimmed, and say so in the section's prose (done).
   Why: D-5 limits the trimmed title, and the card says "after trimming". Otherwise: count raw, so the counter matches
   the box but not the save, and AC-18.1/18.2 change their padded values.
2. **A value that reaches the box with no input event or submit** (typed before hydration, browser restore,
   extension). Proposed: out of scope; the counter shows `0 / 200` until the next input event or form reset. Why:
   reading the box on mount adds an effect and a test jsdom cannot reach honestly. Otherwise: one more REQ plus a
   mount-time read, and two of the seven ACs would have to merge.
3. **Over-limit presentation.** Proposed: number only (`201 / 200`), no colour, extra text or `aria-invalid`. Why: it
   is reachable by script only, and the §5 error already reports it on submit. Otherwise: a REQ and a class assertion.
4. **"Used" rather than "left"** (the card says "used or left"). Proposed: used (`<used> / 200`). Otherwise:
   `200 left` / `-1 left` text and a different AC-18.2.
5. **The reset mechanism is not specified.** A layout effect, an `onReset` handler (the event fires before values
   change) or a key on the box could each read the post-reset value; the code-writer chooses. AC-18.4 to AC-18.6 are
   the oracle. If none works in jsdom, the lead hears at the green step.
6. **Index, map, e2e name.** E2e file `e2e/18-title-counter.spec.ts`. The lead adds F16 to `spec/features-map.md`
   (`src/lib/title-count.ts`, `src/components/todo-form.tsx`) in the `docs(map)` commit. Package `CLAUDE.md` rows wait
   for the orchestrator's docs PR (D-21). Expect a trivial merge conflict in `spec/technical-requirements.md` with the
   §17 and §19 rows from the sibling cards.
7. **Approval box** left unticked; a human ticks it.
8. **Where the tests go.** AC-18.1 and AC-18.2 in `src/lib/title-count.test.ts`; AC-18.3 to AC-18.6 in the existing
   `src/components/todo-form.test.tsx` (add keys to `vi.hoisted`, never remove one); AC-18.7 in
   `e2e/18-title-counter.spec.ts`. AC-18.1 is the Test: line; the skeleton must throw `NotImplementedError` so the red
   is on behavior.

## Needs a ruling

None. Question 1 is the nearest: it picks between two readings of "after trimming", and no D-n is rewritten either way.
