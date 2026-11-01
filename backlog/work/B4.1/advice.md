# B4.1 advice

Card B4.1, section §20 (`spec/contracts/18-created-date.md`), D-22 and D-24. Read: the card, §20, `analysis.md`, the
rules, `src/components/todo-item.tsx`, `todo-due-date.tsx`, `src/lib/todo-overdue.ts` (the §17 sibling of the new
module), the e2e seeds, `stryker.config.mjs`. One probe was run (Chromium 1248 through `@playwright/test`, Tailwind
4.3.3 as installed, scratch script outside the repo, nothing left in the tree); its results are marked `[probed]`.

## Approaches

The three options of analysis question 1, weighed on the six axes the lead asked about.

| Axis                        | A: empty `<time>`, `::after` content from `data-created`                                                                                                                                                               | B: the date is real text in the row                                                                                                                                                            | C: the date only in a `title` tooltip                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Accessibility tree          | `[probed]` Chromium puts the generated text in the tree: `ariaSnapshot` of the `<li>` reads `time: Created 2026-11-01` between the label and the buttons. A screen-reader user in browse mode gets it; no new control. | Same text in the tree, and selectable.                                                                                                                                                         | `title` is a hover description; absent on touch, not announced as row text. Fails "shows". |
| `textContent` / `innerText` | `[probed]` neither contains it (`textContent` `Walkx`, `innerText` `Walk\nx` for a row with title "Walk" and a delete button "x"), so Playwright `toHaveText` and `allTextContents` still read the title only.         | Both contain it; every whole-row assertion fails.                                                                                                                                              | Unchanged.                                                                                 |
| Tailwind support            | `[probed]` `after:content-[attr(data-created)]` compiles on 4.3.3 to `.after\:content-\[attr\(data-created\)\]::after { --tw-content: attr(data-created); content: var(--tw-content); }`. No change to `globals.css`.  | none needed                                                                                                                                                                                    | none needed                                                                                |
| Hydration                   | Pure function of `createdAt`, no clock, no state, no effect (REQ-20.5): server and first client render emit the same attributes under any `TZ`. No new risk.                                                           | Same if it stays UTC; text nodes would add to hydration surface.                                                                                                                               | Same.                                                                                      |
| Test determinism            | jsdom cannot compute `::after`, so unit tests assert attributes only and the single e2e (AC-20.6) asserts the computed `content` (Chromium returns it quoted, `'"Created 2026-11-01"'` `[probed]`).                    | The 7 e2e seeds use `new Date(2026, 0, n)` (runner-local); with the date in the text every one of them would print a runner-`TZ`-dependent string, so the rewrite must also re-seed in UTC.    | Unit-testable; no visibility proof possible.                                               |
| Mutation hot spots          | `src/lib/todo-created.ts` only (see below); `todo-item.tsx` is outside the Stryker scope.                                                                                                                              | same module                                                                                                                                                                                    | same module                                                                                |
| Cost outside the card       | none; no existing test file changes (`TodoItem` imports only `src/lib/todo-created.ts`)                                                                                                                                | a D-n, 3 `docs(spec)` rewrites (§5, §6, §19), 7 e2e files + 2 unit tests rewritten before the card's own red commit, parallel batch-4 branches exposed                                         | none                                                                                       |
| Fits rules                  | yes: D-22 and D-24 (one component, own module, no `page.tsx`, no guide), `testing.md` (nothing weakened)                                                                                                               | only through a D-n first: `testing.md` forbids loosening "whole row text is the title" to "starts with the title" to go green; the compliant path is `docs(spec)` inside an approved D-n first | yes, but does not meet the Intent ("sees, on every item's row")                            |

### Approach A (recommended): generated content from `data-created`

- Change: `src/lib/todo-created.ts` (new, pure: `CREATED_PREFIX`, `createdDayOf`, `createdLabel`, UTC getters, no
  `Intl`); `src/components/todo-item.tsx` renders one
  `<time dateTime={createdDayOf(todo.createdAt)} data-created={createdLabel(todo.createdAt)} className="text-sm text-zinc-500 after:content-[attr(data-created)]" />`
  after `<TodoDueDate>` and before the §10 alert, in both modes, outside the `editing` ternary.
- Pros: shows the date on every row with no JavaScript; leaves every settled criterion and test alone; reversible
  (B later is a follow-up card).
- Cons (behavior it drops): the date cannot be selected, copied or found with page search; `getByText` and
  Testing Library `getByText` cannot see it; Firefox and Safari accessibility exposure of generated content is not
  probed here `[unverified]`; the guide sentence "a row adds no visible text beyond its title" is true only of text
  content; UTC can be one day off a person's calendar near local midnight (analysis question 2, in §20).
- Fits rules: yes. The class literal must appear whole in the `.tsx` source so Tailwind's scanner emits it; a
  concatenated class name silently loses the date (caught only by AC-20.6).

### Approach B (alternative): the date as row text

- Change: D-n; `docs(spec)` rewording §5, §6, §19 and `src/components/CLAUDE.md` from "whole row text is the title" to
  "row text starts with the title"; rewrite 7 e2e files and `todo-item.test.tsx`; then the card.
- Pros: selectable, searchable, copyable, in the tree, visible to `getByText`.
- Cons: turns a size-S card into a cross-section change; touches about 9 files the card does not own; breaks D-22's
  "one component per card" intent for batch 4; exposes every parallel batch-4 branch that reads row text.
- Fits rules: only after the D-n and the spec commits; not before.

### Approach C (declined): `title` tooltip

Not visible without hovering, not on touch screens; fails the Intent. Listed only because analysis question 1 names it.

## Recommendation

A. It is the only option that shows the date and changes no settled criterion, which D-24 asks of a batch card.
Cost of being wrong is one follow-up card. It flips to B only if copyable, searchable text matters more than leaving
seven e2e files and two unit tests alone.

## Impact

| File                                        | Add/Change | Signature                                                                                                                                                | ACs                       |
| ------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `src/lib/todo-created.ts`                   | Add        | `export const CREATED_PREFIX: 'Created '`; `createdDayOf(createdAt: Date): string`; `createdLabel(createdAt: Date): string`                              | AC-20.1, AC-20.2          |
| `src/components/todo-item.tsx`              | Change     | `TodoItem({ todo }: { readonly todo: Todo }): ReactNode` unchanged; one empty `<time>` added; one new import (`@/lib/todo-created`); no state, no effect | AC-20.3 to AC-20.6        |
| `src/lib/todo-created.test.ts`              | Add (test) | unit, node, `vi.stubEnv('TZ', …)` as in `todo-overdue.test.ts`                                                                                           | AC-20.1, AC-20.2          |
| `src/components/todo-item-created.test.tsx` | Add (test) | jsdom; `vi.mock('@/actions/todos')`, `vi.mock('@/actions/delete-todo')`                                                                                  | AC-20.3, AC-20.4, AC-20.5 |
| `e2e/20-created-date.spec.ts`               | Add (test) | `test.use({ timezoneId: 'Pacific/Kiritimati' })`, seeds with explicit UTC `createdAt`                                                                    | AC-20.6                   |

`todo-item.tsx` is the only client component the card changes. Server-rendered markup, per approach:

| Approach | Server markup, JS off: today -> after                                                                                                                                                                 | Submit/interaction before hydration: today -> after                                                                                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A        | `<li>` = checkbox, label, Edit-title button, due-date block, Delete button -> the same plus one empty `<time datetime data-created class>` that paints the date by CSS alone, so it shows with JS off | No `<form>` in view mode today and none after; the checkbox and buttons are inert until hydration, then React replays queued clicks; the `<time>` has no handler and no form control, so nothing changes for a submit before or without JavaScript |
| B        | same -> plus a text node; shows with JS off                                                                                                                                                           | same as A; the new text node adds no handler                                                                                                                                                                                                       |
| C        | same -> plus `title` on the label; nothing painted                                                                                                                                                    | same as A                                                                                                                                                                                                                                          |

Edit mode only exists after hydration (it needs `useState`), so edit-mode markup has no server-rendered form today or
after, under any approach. Behavior dropped: A, text selection, copy and page search of the date; B, nothing in the
row, but 9 tests are rewritten; C, visibility. These are listed as cons under Approaches.

## Risks

- Migration: none. `Todo.createdAt` and its `select` already exist in `src/lib/todos.ts`; no schema, env or dependency
  change. No new dependency (Tailwind arbitrary value only).
- Security: the attribute values come from a `Date`, never from user text; React escapes attributes. `data-created`
  is output by CSS only, which cannot inject markup.
- Performance: one extra element per row, no effect, no state.
- Isolation: nothing stateful; the e2e uses the existing per-worktree database through `src/lib/env.ts`.
- Existing tests that could turn red: the 7 e2e files and `todo-item.test.tsx` AC-19.5 (b) read the row's
  `textContent`; A leaves them green `[probed: textContent excludes ::after]`. No test uses `ariaSnapshot` or
  `toHaveAccessibleName` on a row (`grep`: no match), so the tree change is invisible to them. `todo-due-date.tsx`
  reads `closest('li').querySelector('input[type="checkbox"]')`; a `<time>` is not a checkbox, order unaffected.
- A Chromium update could change the quoting of computed `content`; AC-20.6 strips the quotes, and the test-writer
  reports a different format rather than loosening the assertion (analysis question 6).
- RSC passes `todo.createdAt` as a `Date` to the client component today already; no new serialization.
- The jsdom suite cannot see the class: deleting `className` is killed only by AC-20.6 (e2e), so the e2e must run in
  the green gate, not only `pnpm test`.

## Test strategy

| Layer     | File                                        | ACs                       | Mocks                                                                                |
| --------- | ------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------ |
| Unit      | `src/lib/todo-created.test.ts`              | AC-20.1, AC-20.2          | none (pure); `vi.stubEnv('TZ', …)` per zone                                          |
| Component | `src/components/todo-item-created.test.tsx` | AC-20.3, AC-20.4, AC-20.5 | `@/actions/todos`, `@/actions/delete-todo` via `vi.hoisted`; fake timers + `TZ` stub |
| e2e       | `e2e/20-created-date.spec.ts`               | AC-20.6                   | none; real database seeded through Prisma with explicit UTC `createdAt`              |

Put AC-20.3 and AC-20.5 in the new component file too, not in `todo-item.test.tsx`: §20's test note says no existing
test file changes, and the card's `feat(...)` commit may touch none. AC-20.4 needs `renderToString` and `hydrateRoot`
under two `TZ` settings, as `todo-due-date-overdue.test.tsx` does for §17.

## Mutation hot spots

Stryker mutates `src/lib/**` and `src/actions/**` only, so only `src/lib/todo-created.ts` is scored (≥ 70 %).

| Mutant                                                            | Killed by                                                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `getUTCDate()` -> `getDate()`                                     | `23:59:59.999Z` under Kiritimati (local Nov 2) and `Nov 2 00:00Z` under Los Angeles (local Nov 1) |
| `getUTCFullYear()` -> `getFullYear()`                             | `Dec 31 12:00Z` under Kiritimati (local Jan 1 2027)                                               |
| `getUTCMonth() + 1` -> `- 1` or no `+ 1`                          | the Jan, Nov and Dec inputs                                                                       |
| `padStart(4, '0')` or `padStart(2, '0')` removed or width changed | `0005-01-01` for the year; `2026-01-05` for month and day                                         |
| `CREATED_PREFIX` `'Created '` -> `''` or `'Created'`              | exact equality on `'Created 2026-11-01'` and on the constant                                      |
| `createdLabel` template emptied or reordered                      | the three exact results of AC-20.2                                                                |
| `-` separator or `String(...)` removed                            | any exact day string                                                                              |

Both zones are needed: Kiritimati alone leaves the Los Angeles-direction mutant of `getUTCDate`, and the reverse.

## Questions settled / escalated

```
Question:    Where does the date appear: generated content (A), row text (B) or a tooltip (C)?
Class:       P6 needs a ruling only the human can give (soft: §20 is already written for A)
Sources:     backlog/work/B4.1/analysis.md "Soft, at the plan gate: confirm question 1, option A (no existing section or test changes)."
             spec/contracts/18-created-date.md "- [ ] Lead approves spec (plan gate of B4.1; D-22, D-24)"
             src/components/CLAUDE.md "A row (`<li>`) adds no visible text beyond its title (AC-5.1 compares whole-row text)."
             backlog/00-decisions.md "B4.1 shows each todo's creation date in `src/components/todo-item.tsx`"
Conflict:    D-24 says the date shows in todo-item.tsx / the guide says a row adds no visible text beyond its title and seven e2e files read whole-row text as the title
Verdict:     The spec (level 3) outranks the guide (level 4) and D-24 mandates the date and the single mount point; §20 reconciles them with A. Until the lead ticks the §20 approval box, A is a proposal, not a ruling.
Next action: Lead confirms A at the plan gate (ticking the §20 box is the ruling); plan.md states A.
Must not:    Edit §5, §6 or §19, any existing test, or the guide to make room for text in the row; put the class in globals.css or anywhere outside the two files of §20.
Doc drift:   `src/components/CLAUDE.md` sentence "adds no visible text beyond its title" should read "no text content beyond its title" and name `<time>` generated content; `spec/features-map.md` needs the F18 row; `src/lib/CLAUDE.md` needs the `todo-created.ts` row. All three belong to the orchestrating session's docs PR after batch 4 (D-24), not to this card.
Escalate:    human
```

**Decision request: B4.1 where the creation date appears**

- Context: §20 asks for a date on every row. Seven e2e files and two unit tests read each row's whole text as the
  title, and the components guide says a row adds no visible text beyond it. A chromium probe shows generated content
  is visible, in the accessibility tree and absent from `textContent`.
- Options:

| #   | Behavior                                                         | Cost                                                           | Risk                                                           | Reversible |
| --- | ---------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | ---------- |
| A   | `<time>` with `::after` content from `data-created`; not in text | none outside 2 `src/` files + 3 new test files                 | date not selectable or searchable; guide wording stretched     | yes        |
| B   | date is row text; §5, §6, §19 and the guide reworded             | a D-n, 3 `docs(spec)` edits, about 9 test edits before the red | parallel batch-4 branches reading row text; TZ-dependent seeds | yes        |
| C   | `title` tooltip                                                  | none                                                           | not visible on touch; fails "shows"                            | yes        |

- Recommended: A, flips to B if copyable, searchable text matters more than leaving seven e2e files and two unit
  tests alone.
- Affects: §20 REQ-20.3, REQ-20.4, AC-20.3, AC-20.6 (under B also §5, §6, §19 and the 9 tests); card B4.1.

What the lead must say at the plan gate, in order:

1. Option for question 1: A, B or C (A recommended). A needs no D-n; B needs the next D-n and a rewrite of REQ-20.3 and
   REQ-20.4 before any test.
2. Approval of §20 as written, which also fixes two points the analysis only proposes: the day is UTC (a row added
   within hours of local midnight can show a neighbouring day, and §17's browser-local "today" is a different rule),
   and the wording is `Created YYYY-MM-DD` with no time of day. Say "approved with a different zone" or "with a time"
   to change either; both would add a client effect and a hydration criterion and re-open §20.

```
Question:    UTC or the browser's zone for the creation day?
Class:       P0 no conflict (REQ-20.1 answers it)
Sources:     spec/contracts/18-created-date.md "in UTC; the server's time zone, the browser's time zone and the locale are never used"
Conflict:    none
Verdict:     §20 REQ-20.1 governs (level 3); B3.1's §17 uses the browser's day for "today", a separate rule the section leaves alone.
Next action: Test-writer implements AC-20.1 under two zones; the lead's §20 approval covers it.
Must not:    Use `toLocaleDateString`, `Intl` or the local getters.
Doc drift:   none
Escalate:    none
```

```
Question:    Which test file holds AC-20.3 and AC-20.5?
Class:       P2 spec silent (the contract names a new file only for the hydration criterion)
Sources:     spec/contracts/18-created-date.md "no existing test file changes, because `TodoItem` imports no new action"
Conflict:    none
Verdict:     The same sentence governs: the three component criteria go in the new `todo-item-created.test.tsx`; an edit of `todo-item.test.tsx` would also collide with the "unchanged behavior" proofs that cite it.
Next action: Test-writer creates the one new file.
Must not:    Append the new cases to `todo-item.test.tsx`.
Doc drift:   none
Escalate:    none
```
