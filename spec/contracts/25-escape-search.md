# §27 Todos: Escape clears the search box

Tier: full

- [ ] Lead approves spec

## Intent

A person who is typing in the search box (§16), or who is looking at the result of a search, gets back to an empty box
and to the full list of the chosen view (§21) with one key, without the mouse and without selecting the text. A key
pressed anywhere else does nothing new. Nothing stored changes.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                                                                                                            |
| -------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-27.1 | Event-driven      | WHEN Escape (`KeyboardEvent.key` equal to `'Escape'`, no Ctrl, Meta, Alt or Shift held) is pressed while the "Search todos" box (§16) has focus THE SYSTEM SHALL empty the box and cancel the key's default action (`preventDefault`).                                                                                 |
| REQ-27.2 | Event-driven      | WHEN REQ-27.1 applies while a search is in effect (§21 REQ-21.1, judged from the `query` the form received, not from the typed text) THE SYSTEM SHALL activate the "Clear search" link, so that the page shown is the one the link opens (§21 REQ-21.3, REQ-21.4): the same address, the selected filter kept, no `q`. |
| REQ-27.3 | Event-driven      | WHEN REQ-27.1 applies while no search is in effect THE SYSTEM SHALL only empty the box: the address, the list and the counts stay as they are and no request is made.                                                                                                                                                  |
| REQ-27.4 | Ubiquitous        | THE SYSTEM SHALL change nothing stored by Escape: no Server Action is called and no todo, order (§5), count (§13, §23) or filter (§12) changes.                                                                                                                                                                        |
| REQ-27.5 | Unwanted behavior | IF a key other than Escape is pressed in the box, or Escape with Ctrl, Meta, Alt or Shift, THEN THE SYSTEM SHALL keep the behavior of §16 and §25: Enter submits, any other key edits or moves within the box, no `preventDefault`, no click on the link.                                                              |
| REQ-27.6 | Ubiquitous        | THE SYSTEM SHALL react to Escape only when the key is pressed in the "Search todos" box: Escape on `document.body`, in the "New todo" box (§5), in a title field (§6, §24) or on a button does nothing here, and the markup, labels, names and links of §16, §21 and §25 do not change (no visible text is added).     |

"Search in effect" has one definition, §21's (`isSearchInEffect(query)`). The link is activated, not re-implemented, so
that the address of §21 has one source (`clearSearchHref`). The browser's own clearing of a `type="search"` box on
Escape is cancelled by REQ-27.1 so that one behavior applies in every browser.

## Acceptance criteria

| ID      | Covers                         | Given                                                                                                                                        | When                                                                                                        | Then (measurable)                                                                                                                                                                                                                                                                                       |
| ------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-27.1 | REQ-27.1, REQ-27.5             | key events described as `{ key, ctrlKey, metaKey, altKey, shiftKey }`                                                                        | `isSearchEscape(event)` runs                                                                                | `'Escape'` with no modifier gives `true`; `'Escape'` with ctrlKey, with metaKey, with altKey, with shiftKey each gives `false`; `'Enter'`, `'/'`, `'Esc'`, `'escape'` and `''` give `false`; `SEARCH_ESCAPE_KEY` is `'Escape'`; no call throws                                                          |
| AC-27.2 | REQ-27.1, REQ-27.2, REQ-27.4   | `TodoSearchForm` rendered with (`'active'`, `'milk'`), "Search todos" focused and `milkx` typed, a click listener on the "Clear search" link | the person presses Escape (a cancelable keydown) in the box                                                 | the box's value is `''`, the event's `defaultPrevented` is `true`, the link receives exactly 1 click, its `href` is `/?filter=active`, and 0 requests are made                                                                                                                                          |
| AC-27.3 | REQ-27.1, REQ-27.3             | `TodoSearchForm` rendered with (`'all'`, `''`), then (`'completed'`, `'  '`), `zzz` typed in the box each time                               | the person presses Escape in the box                                                                        | each time the value is `''`, `defaultPrevented` is `true`, there are 0 links in the document and 0 navigations                                                                                                                                                                                          |
| AC-27.4 | REQ-27.5                       | `TodoSearchForm` rendered with (`'all'`, `'milk'`), `milk` in the box, a click listener on the "Clear search" link                           | the person presses Enter, `a`, `/`, `Esc`, Ctrl+Escape, Meta+Escape, Alt+Escape and Shift+Escape in the box | for each key `defaultPrevented` is `false`, the value is still `milk` (the test types no character) and the link receives 0 clicks                                                                                                                                                                      |
| AC-27.5 | REQ-27.6                       | `TodoSearchForm` rendered next to a text box named "New todo" and a button; `milk` in "Search todos"                                         | the person presses Escape on `document.body`, in "New todo" and on the button                               | each time `defaultPrevented` is `false`, the "Search todos" value is still `milk` and the link receives 0 clicks                                                                                                                                                                                        |
| AC-27.6 | REQ-27.1 to REQ-27.4, REQ-27.6 | stored todos D "Buy milk" (open), C "Call mom" (done), B "Walk the dog" (open); the browser on `/?filter=active&q=milk` (client hydrated)    | the person clicks "Search todos" and presses Escape; then presses `/`, types `zzz` and presses Escape again | after the first Escape the address is exactly `/?filter=active`, the box is empty, rows read `[D, B]` (before the key `[D]`), there is no "Clear search" link and 0 POST requests were made; with no search in effect the second Escape leaves the address unchanged, the box empty and 0 requests made |

## Function contracts

```ts
// src/lib/escape-search.ts (§27; pure: no Prisma, no server-only, no DOM access; importable from a client component)
export const SEARCH_ESCAPE_KEY: string; // 'Escape'
export interface EscapeEvent {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly altKey: boolean;
  readonly shiftKey: boolean;
}
export function isSearchEscape(event: EscapeEvent): boolean; // key === SEARCH_ESCAPE_KEY and no ctrlKey, metaKey, altKey or shiftKey; never throws
// src/components/todo-search-form.tsx (§16, §21, §25, extended by §27; already 'use client')
export function TodoSearchForm({ filter, query }: { readonly filter: TodoFilter; readonly query: string }): ReactNode; // signature and markup unchanged; the box gains an onKeyDown: when isSearchEscape(event) → event.preventDefault(), set the box's value to '', and, only when isSearchInEffect(query), click the "Clear search" link through a ref
```

`src/app/page.tsx`, `src/lib/clear-search.ts`, `src/lib/search-shortcut.ts`, `src/lib/todo-search.ts`,
`src/actions/todos.ts` and every other component do not change (D-30). No Server Action, Zod schema, Prisma model,
query, environment variable or `next/navigation` hook is added.

## Out of scope

Any key other than Escape in the box (the slash key is §25), Escape outside the box, a visible hint for the key,
clearing the filter as well, remembering the cleared text, an animation, restoring focus after the page changes,
IME composition handling, Escape while a dialog is shown, clearing a search that is in the address but not in the
box by any other means than the link of §21.

## Unchanged behavior

| Behavior                                                            | Proof                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The slash key still focuses the box and leaves typing alone         | `src/components/todo-search-form.test.tsx` :: "AC-25.4: / in the "New todo" box leaves focus there with defaultPrevented false; Ctrl+/, Meta+/ and Alt+/ on body leave "Search todos" unfocused with defaultPrevented false; / inside "Search todos" keeps focus there with defaultPrevented false"                |
| The slash key still focuses the box without a request               | `src/components/todo-search-form.test.tsx` :: "AC-25.2: on (all, milk) with body focused, / makes "Search todos" the active element, its value stays milk, defaultPrevented is true, 0 requests and 0 navigations"                                                                                                 |
| The "Clear search" link still opens the address without `q`         | `e2e/21-clear-search.spec.ts` :: "AC-21.5: on /?q=milk one link and [D, C]; the click opens exactly / with [D, C, B, A], an empty box and no link; /?filter=active&q=milk shows [D]; the click opens exactly /?filter=active with [D, B], an empty box, no link and "Active" current, and the same after a reload" |
| Search, filter links and a blank `q` still work through the address | `e2e/16-search.spec.ts` :: "AC-16.6: search narrows to [D, C], Active drops the search and shows [D, B] with an empty box, MILK under Active shows [D] and survives a reload, zzz shows exactly one "No todos match your search", and a blank q shows [D, C, B, A]"                                                |
