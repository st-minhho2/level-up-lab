# §46 Todos: the `/` shortcut also selects the text already in the search box

Tier: full

- [ ] Lead approves spec

## Intent

A person who presses `/` to reach the search box (§25) either starts a new query or edits the one on show. Today the
cursor lands in the box and the old text stays unhighlighted, so a new query needs a select-all gesture before the
first useful key. After this section the box is ready on arrival: the cursor is in it and its whole text is
highlighted, so typing replaces the text and an arrow key moves into it. Nothing stored, nothing in the address and no
request changes.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                                                                                                                                                                |
| -------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-46.1 | Event-driven      | WHEN the `/` key moves focus to the search box labelled "Search todos" (§25 REQ-25.1) THE SYSTEM SHALL select all of the box's text: the box is `document.activeElement`, `selectionStart` is 0 and `selectionEnd` equals the box's `value.length`, in UTF-16 code units.                                                                                                  |
| REQ-46.2 | Event-driven      | WHEN REQ-46.1 applies THE SYSTEM SHALL select the text the box holds at that moment, which is the query of §16 or text typed since and not yet submitted, so the selection never depends on an earlier caret or selection.                                                                                                                                                 |
| REQ-46.3 | Unwanted behavior | IF the key does not move focus (a modifier held, §25 REQ-25.4; focus already in a text-entry element, §25 REQ-25.3, the search box itself included) THEN THE SYSTEM SHALL NOT select or change any selection: the box and every other field keep their `selectionStart` and `selectionEnd`.                                                                                |
| REQ-46.4 | Ubiquitous        | THE SYSTEM SHALL change nothing but focus and the box's selection (§25 REQ-25.5 as edited by this section): the box's value, the address, the list, the counts, every stored todo, the markup, labels, names and links of §16, §21 and §38 are those of §25; no request is made; a box holding no text behaves as §25 (value `''`, `selectionStart` and `selectionEnd` 0). |
| REQ-46.5 | Ubiquitous        | THE SYSTEM SHALL select once per accepted press and only while the search form is shown (§25 REQ-25.6): after an unmount the key selects nothing; a key typed while all of the text is selected replaces it as in any browser.                                                                                                                                             |

Edits to other sections that this section makes: REQ-25.5 reads "change nothing but focus and the box's selection (§46)";
§25's Out of scope item "selecting the box's text on focus" is lifted; §25's contract line for
`src/components/todo-search-form.tsx` reads "`.focus()` then `.select()` (§46)". No other line of any contract changes.

`19-clear-search.md:51` and `25-escape-search.md:53` ("signature and markup unchanged") stay true: the signature and
the markup are unchanged. The intent lines `19-clear-search.md:9` and `25-escape-search.md:10` describe §21 and §27 and
stay. §27 is untouched: Escape in the box still empties it.

## Acceptance criteria

| ID      | Covers                                 | Given                                                                                                                                                                                                          | When                                                                                                                                | Then (measurable)                                                                                                                                                                                                                                                                                                                                 |
| ------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-46.1 | REQ-46.1, REQ-46.4                     | `TodoSearchForm` rendered with (`'all'`, `'milk'`), focus on `document.body`                                                                                                                                   | the person presses `/` (a cancelable keydown on `document.body`)                                                                    | "Search todos" is `document.activeElement`, its value is `milk`, `selectionStart` is 0 and `selectionEnd` is 4; the event's `defaultPrevented` is `true`; 0 requests, 0 submits                                                                                                                                                                   |
| AC-46.2 | REQ-46.1, REQ-46.2                     | (a) `TodoSearchForm` with (`'all'`, `'Café 😀'`) (`value.length` 7: the emoji is two code units), body focused; (b) with (`'all'`, `'milk'`), `x` typed at the end of the box, the "Search" button focused     | the person presses `/` in (a) on `document.body` and in (b) on the button                                                           | (a) the box is `document.activeElement`, `selectionStart` is 0 and `selectionEnd` is 7; (b) its value is `milkx`, it is `document.activeElement`, `selectionStart` is 0 and `selectionEnd` is 5                                                                                                                                                   |
| AC-46.3 | REQ-46.1, REQ-46.4                     | `TodoSearchForm` with (`'all'`, `''`), body focused; separately (`'active'`, `'milk'`) with the link "Clear search", a checkbox next to the form and the "Search" button focused in turn                       | the person presses `/` on body (empty box) and on each of the three controls                                                        | with the empty box: it is `document.activeElement`, its value is `''`, `selectionStart` and `selectionEnd` are both 0; on each of the three controls: the box is `document.activeElement`, `selectionStart` is 0 and `selectionEnd` is 4; every `defaultPrevented` is `true`; markup of the form is the same before and after (`innerHTML` equal) |
| AC-46.4 | REQ-46.3                               | `TodoSearchForm` (`'all'`, `'milk'`) next to a text box "New todo" holding `abcd` with its selection set to the range 1 to 3; the box "Search todos" holding `milk` with its selection set to the range 1 to 3 | the person presses `/` in "New todo"; then presses `/` inside "Search todos"; then presses Ctrl+`/`, Meta+`/` and Alt+`/` on body   | each time `defaultPrevented` is `false`; in "New todo" and in "Search todos" the selection is still 1 to 3 and the active element is where it was; for each modifier "Search todos" is not `document.activeElement` and its selection is still 1 to 3; a spy on `select` of the box has 0 calls                                                   |
| AC-46.5 | REQ-46.5                               | `TodoSearchForm` rendered, then unmounted; and a form rendered twice in turn (mount, unmount, mount); each with (`'all'`, `'milk'`), spies on `focus` and `select` of the box                                  | the person presses `/` on `document.body` after the unmount; and once after the second mount                                        | after the unmount `document.activeElement` is `document.body`, `defaultPrevented` is `false` and `select` has 0 calls; after the second mount one press gives `focus` 1 call and `select` 1 call, in that order                                                                                                                                   |
| AC-46.6 | REQ-46.1, REQ-46.2, REQ-46.4, REQ-46.5 | stored todos D "Buy milk" (open) and C "Call mom" (done); the browser on `/?q=milk` (client hydrated), "Search todos" reads `milk`                                                                             | the person presses `/`; reads in the page `document.activeElement`, `selectionStart` and `selectionEnd`; types `mom`; presses Enter | after `/` the active element is "Search todos", `selectionStart` is 0, `selectionEnd` is 4, its value is `milk`, the address is exactly `/?q=milk` and 0 requests with method POST were made; after typing the value is exactly `mom` (no `milk` kept, no `/`); after Enter the address is `/?q=mom` and the rows read `[C]`                      |

## Function contracts

```ts
// src/components/todo-search-form.tsx (§16, §21, §25, §27, §38, extended by §46; already 'use client'; no new component, props unchanged)
export function TodoSearchForm({
  filter,
  query,
  count,
}: {
  readonly filter: TodoFilter;
  readonly query: string;
  readonly count?: number;
}): ReactNode; // signature and markup unchanged; in the §25 keydown listener, when isSearchShortcut(event) → event.preventDefault(), the box's ref .focus() then .select() (once per press); every other key, and every press that isSearchShortcut rejects, calls neither
```

The only file of `src/` this section changes is `src/components/todo-search-form.tsx`. No new export, Server Action,
Zod schema, Prisma model, query, environment variable, prop or lib function. `src/lib/search-shortcut.ts`,
`src/lib/clear-search.ts`, `src/lib/escape-search.ts`, `src/app/page.tsx`, `src/actions/todos.ts` and every other
component keep their contracts.

How the criteria observe it: jsdom supports `focus()`, `document.activeElement`, `selectionStart`, `selectionEnd`,
`select()` and `setSelectionRange` on a text-like `input` (the box is `type="search"`), so AC-46.1 to AC-46.5 are
component tests with Testing Library in `src/components/todo-search-form-select.test.tsx`; AC-46.6 is a Playwright test
in `e2e/` that reads `document.activeElement`, `selectionStart` and `selectionEnd` with `page.evaluate`. Tests that
need a selection set it with `setSelectionRange` on the field before the event under test.

## Out of scope

Selecting the text on a click or Tab into the box, restoring or remembering the caret, selecting text in any other
field ("New todo" §5, a title field §6, a due-date field §15), a visible hint for the shortcut, any key other than `/`,
`selectionDirection`, scrolling the box into view beyond what `focus()` does, announcing the selection to assistive
technology, changing Escape in the box (§27).

## Unchanged behavior

| Behavior                                                 | Proof                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/` focuses the box, keeps its value, makes no request   | `src/components/todo-search-form.test.tsx` :: "AC-25.2: on (all, milk) with body focused, / makes "Search todos" the active element, its value stays milk, defaultPrevented is true, 0 requests and 0 navigations"                                                                                                   |
| `/` focuses the box from a button, a link and a checkbox | `src/components/todo-search-form.test.tsx` :: "AC-25.3: / pressed on the focused "Search" button, the focused "Clear search" link and a focused checkbox each time makes "Search todos" the active element with defaultPrevented true"                                                                               |
| `/` is left alone in text boxes and with modifiers       | `src/components/todo-search-form.test.tsx` :: "AC-25.4: / in the "New todo" box leaves focus there with defaultPrevented false; Ctrl+/, Meta+/ and Alt+/ on body leave "Search todos" unfocused with defaultPrevented false; / inside "Search todos" keeps focus there with defaultPrevented false"                  |
| The listener is removed on unmount                       | `src/components/todo-search-form.test.tsx` :: "AC-25.5: after an unmount / focuses nothing (activeElement is body) with defaultPrevented false; after mount, unmount, mount one / calls focus on "Search todos" exactly once"                                                                                        |
| `/`, typing and Enter in the browser                     | `e2e/25-search-shortcut.spec.ts` :: "AC-25.6: the first / focuses an empty "Search todos" on exactly / with 0 POSTs; milk + Enter opens /?q=milk with [D] and the box reads milk; in "New todo" / is typed and focus stays; on /?filter=active Ctrl+/ leaves "Search todos" unfocused and a plain / then focuses it" |
| Escape in the box still empties it                       | `src/components/todo-search-form.test.tsx` :: "AC-27.2: on (active, milk) with milkx typed, Escape in the box leaves the value '', defaultPrevented true, exactly 1 click on the "Clear search" link whose href is /?filter=active, and 0 requests"                                                                  |
| The form markup is §16's                                 | `src/components/todo-search-form.test.tsx` :: "AC-16.5: with filter all and query '' renders one search landmark, a GET form to /, a "Search todos" searchbox (q, maxlength 200, value ''), a submit "Search" button, no list items and no hidden filter input"                                                      |
