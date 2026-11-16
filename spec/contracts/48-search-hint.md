# §50 Todos: the search box shows the `/` shortcut as a hint

Tier: full

- [ ] Lead approves spec

## Intent

A person who looks at the search box (§16) learns that a key reaches it. Today the key (§25, §46) is found only by
chance or by reading the docs. After this section an empty search box reads `Press / to search`, in the grey text a
browser shows in an empty field; the text goes away as soon as the person types and comes back when the box is empty
again. The box keeps its name for assistive technology, its value, its limit and its form; no new control, key or
request appears.

## Requirements (EARS)

| ID       | Pattern      | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-50.1 | Ubiquitous   | THE SYSTEM SHALL give the search box labelled "Search todos" (§16) the `placeholder` attribute with exactly the text `Press / to search` (17 characters: capital P, a space on each side of the slash, no full stop).                                                                                                                                                                                                                                                                                                                                       |
| REQ-50.2 | Ubiquitous   | THE SYSTEM SHALL keep the box's accessible name "Search todos" (the `<label>` of §16): the hint is neither its name nor an added description, and no `aria-label`, `aria-labelledby`, `aria-describedby` or `title` is added to the box. The `placeholder` is the one change to the markup of §16, §21, §25, §27, §38 and §46: no element and no text node is added, and the box's value, `id`, `name`, `type`, `maxlength`, `key` and classes, the hidden filter input, the "Search" button, the "Clear search" link and the match count are those of §38. |
| REQ-50.3 | Ubiquitous   | THE SYSTEM SHALL show the same hint under every filter, query and `count` the form can receive (§12, §16, §21, §38): the attribute does not depend on a prop, so a box holding a query carries it too, and the browser shows it only while the box holds no text (REQ-50.5).                                                                                                                                                                                                                                                                                |
| REQ-50.4 | Ubiquitous   | THE SYSTEM SHALL write the hint into the HTML the server sends for `/`, so that it is on the page before the client code has loaded and when JavaScript is off; no effect, state or event sets it, and the form still works without JavaScript as §16 requires (a GET to `/`).                                                                                                                                                                                                                                                                              |
| REQ-50.5 | State-driven | WHILE the box's value is `''` THE SYSTEM SHALL have the browser show the hint (the box matches `:placeholder-shown`), and WHILE it holds any text SHALL NOT; so after Escape empties the box (§27, with or without a search in effect) the hint shows again, and typing hides it.                                                                                                                                                                                                                                                                           |
| REQ-50.6 | Ubiquitous   | THE SYSTEM SHALL leave the keys as they are: `/` (§25, §46) focuses the box and selects its text, Escape in the box (§27) empties it, every other key and every press the earlier sections reject behave as there; the hint is text in the box, not a control: no handler, listener, link or request is added, and a press of `/` does not change the attribute.                                                                                                                                                                                            |

"Search todos" is found by role `searchbox` and name; a `placeholder` takes part in the accessible name only when no
label exists, and the label of §16 always exists, so the name does not change. The hint is an attribute, not text
content: it is in no element's `textContent` and no query by text finds it.

### Edits to other sections (D-45)

Two lifts, nothing else of any contract is edited:

- §25 (`23-search-shortcut.md`), Out of scope: "a visible hint or tooltip for the shortcut" becomes "a tooltip for the
  shortcut". The visible hint is this section's. A tooltip stays out of scope.
- §46 (`44-search-select.md`), Out of scope: "a visible hint for the shortcut, " is removed. The hint is this
  section's.

Lines that stay as written and how they relate to this section:

- REQ-46.4 (`44-search-select.md:22`) says the markup of §16, §21 and §38 is that of §25. It limits what _pressing `/`_
  changes, and that is still nothing but focus and selection (AC-50.6, AC-46.3: `innerHTML` is equal before and after
  the press). The markup §50 gives the box at rendering is one attribute more than §25's; the press does not add it.
  The contract line of §46 (`44-search-select.md:59`, "signature and markup unchanged") holds in the same sense: §46
  adds nothing to the markup, and the signature is unchanged by §50 too.
- REQ-25.6 (`23-search-shortcut.md`, "the shortcut adds no visible text"), REQ-27.6 (`25-escape-search.md`, "no visible
  text is added") and §21's sentence "The text `Clear search` is the only visible text added" limit what _that
  section's own change_ adds. They do not apply to the placeholder, which neither the shortcut, Escape nor the link adds.
- The "signature and markup unchanged" notes in the contract lines of §21 (`19-clear-search.md:51`), §27
  (`25-escape-search.md:53`) and §25 (`23-search-shortcut.md:53`) describe those sections' own change; the signature is
  unchanged by §50, the markup gains the `placeholder` attribute and nothing else, so they do not apply to it.
- §16's contract line for `TodoSearchForm` (`14-search.md:64`, the list of the box's attributes) and its sentence "the
  markup above is otherwise unchanged" (`14-search.md:75`) list the box without `placeholder`; the list is §16's own
  and does not apply to this one attribute. REQ-16.1 to REQ-16.10 and AC-16.x are unchanged.
- REQ-38.7 (`36-search-count.md`, "exactly the markup of §16, §21, §25 and §27") compares a render without `count` with
  one that has none of the paragraph; both carry the placeholder, so the equality holds (AC-38.3 passes unchanged).
  §36's Out of scope "a count in the box's placeholder" stays: the placeholder holds only the hint of this section.
- The hint is for `/` only. "a visible hint for the key" in §27's Out of scope (`25-escape-search.md:62`) and
  `27-escape-new-todo.md` stay: no hint for Escape is added.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                                                                                                                    | When                                                                                                                                | Then (measurable)                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-50.1 | REQ-50.1, REQ-50.2           | `TodoSearchForm` rendered with (`'all'`, `''`)                                                                                                                                           | the form is read                                                                                                                    | exactly 1 searchbox named "Search todos"; its `placeholder` attribute is exactly `Press / to search` (length 17); its `id` is `search-todos`, `name` `q`, `type` `search`, `maxlength` `200`, value `''`; it has no `aria-label`, `aria-labelledby`, `aria-describedby` or `title` attribute                                                                                                                                        |
| AC-50.2 | REQ-50.2                     | `TodoSearchForm` rendered with (`'all'`, `''`); then with (`'active'`, `'milk'`) and `count` 1                                                                                           | the form is read by role, by name and by text                                                                                       | each time `getByRole('searchbox', { name: 'Search todos' })` finds 1 element and `getByRole('searchbox', { name: 'Press / to search' })` finds 0; 0 elements have the text `Press / to search`; the form's `textContent` is exactly `Search todosSearch` in the first render and `Search todosSearchClear search1 match` in the second; the form has 0 `[aria-describedby]` and 0 `[title]` elements                                |
| AC-50.3 | REQ-50.1, REQ-50.3           | `TodoSearchForm` rendered in turn with (`'all'`, `''`), (`'completed'`, `''`), (`'active'`, `'milk'`) and (`'all'`, `'Café 😀'`) with `count` 3                                          | each render is read                                                                                                                 | in each of the 4 renders the box's `placeholder` is exactly `Press / to search` and its `value` equals the query given (`''`, `''`, `milk`, `Café 😀`); the hidden `filter` input is present only for `completed` and `active`                                                                                                                                                                                                      |
| AC-50.4 | REQ-50.1, REQ-50.2, REQ-50.4 | `TodoSearchForm` rendered to a string by the server renderer (`renderToStaticMarkup`: no effect runs, no event is attached) with (`'all'`, `''`), and with (`'active'`, `'milk'`)        | the string is parsed as HTML                                                                                                        | in both strings the `<input name="q">` has `placeholder` `Press / to search`, the `<label for="search-todos">` has the text `Search todos`, the `<form>` has `method` `get` and `action` `/`, and the "Search" button is a `type="submit"` button; the first string contains `placeholder="Press / to search"` exactly once                                                                                                         |
| AC-50.5 | REQ-50.5, REQ-50.6           | `TodoSearchForm` rendered with (`'active'`, `'milk'`), `milkx` typed in the box, a click listener on the "Clear search" link; then with (`'all'`, `''`), `zzz` typed in the box          | the person presses Escape (a cancelable keydown) in the box each time                                                               | each time the value is `''`, `defaultPrevented` is `true` and the `placeholder` is still `Press / to search`; the link receives exactly 1 click in the first render, and the second render has 0 links; 0 requests are made                                                                                                                                                                                                         |
| AC-50.6 | REQ-50.1, REQ-50.6           | `TodoSearchForm` rendered with (`'all'`, `'milk'`), focus on `document.body`, and the form's `innerHTML` recorded; then rendered with (`'all'`, `''`), focus on `document.body`          | the person presses `/` (a cancelable keydown on `document.body`) each time; then presses `/` inside the box (milk)                  | with `milk`: the box is `document.activeElement`, `selectionStart` is 0 and `selectionEnd` is 4, value `milk`, `defaultPrevented` is `true`, the `innerHTML` equals the one recorded and the `placeholder` is `Press / to search`; with the empty box: it is `document.activeElement`, value `''`, selection 0 to 0, `defaultPrevented` `true`; the press inside the box leaves `defaultPrevented` `false`                          |
| AC-50.7 | REQ-50.1 to REQ-50.5         | stored todos D "Buy milk" (open), C "Call mom" (done); in a browser context with JavaScript enabled and hydrated, `/` is open; in a second context with JavaScript disabled, `/` is open | the first person presses `/`, types `milk`, presses Enter, then Escape in the box; the second person fills `milk` and presses Enter | in the JavaScript-disabled page the box has `placeholder` `Press / to search` on the first response and matches `:placeholder-shown`; after `fill` and Enter its address is exactly `/?q=milk` and its rows read `[D]`; in the hydrated page the box matches `:placeholder-shown` on `/`, does not after `milk` is typed, does not on `/?q=milk`, and does again after Escape (address exactly `/`, 0 POST requests, rows `[D, C]`) |

## Function contracts

```ts
// src/components/todo-search-form.tsx (§16, §21, §25, §27, §38, §46, extended by §50; already 'use client'; no new component, props unchanged)
export function TodoSearchForm({
  filter,
  query,
  count,
}: {
  readonly filter: TodoFilter;
  readonly query: string;
  readonly count?: number;
}): ReactNode; // signature unchanged; the <input type="search" name="q"> gains placeholder="Press / to search" (a literal attribute, in the markup the server renders: no state, effect or prop sets it); every other attribute, element, handler and the keydown listener unchanged
```

The only file of `src/` this section changes is `src/components/todo-search-form.tsx`. No new export, constant, Server
Action, Zod schema, Prisma model, query, environment variable, prop or lib function (a constant for the text would be a
second export of the file; the literal stays in the one place). `src/lib/search-shortcut.ts`,
`src/lib/escape-search.ts`, `src/lib/clear-search.ts`, `src/app/page.tsx`, `src/actions/todos.ts` and every other
component keep their contracts. No `src/lib` or `src/actions` file changes, so mutation testing does not apply.

How the criteria observe it: AC-50.1 to AC-50.3, AC-50.5 and AC-50.6 are component tests with Testing Library in
`src/components/todo-search-form-hint.test.tsx` (nothing is mocked, as `todo-search-form-select.test.tsx`); AC-50.4 renders
with `react-dom/server` `renderToStaticMarkup` in the same file and parses the string with `DOMParser`; AC-50.7 is a
Playwright test in `e2e/50-search-hint.spec.ts`, the second context made with `browser.newContext({ javaScriptEnabled:
false })`, `:placeholder-shown` read with `locator.evaluate((el) => el.matches(':placeholder-shown'))`. jsdom does not
implement `:placeholder-shown`, which is why that pseudo-class is read only in the browser test.

## Out of scope

`/` does nothing before the client code has loaded (§25 listens from an effect), and does nothing on a touch device
without a keyboard; the hint is shown there all the same (a person with JavaScript off submits the form by hand, a
person on a touch device taps the box). A hint that depends on hydration, on a pointer or on a keyboard being present,
a hint hidden while focus is in a text-entry element (where `/` types, §25 REQ-25.3), a different text per platform or
language, a visible label, a tooltip (`title`), `aria-describedby`, `aria-keyshortcuts`, a `<kbd>` element, a hint for
Escape (§27) or for any other key, styling of the placeholder beyond the browser's own, truncation or wrapping of the
text in a narrow box, announcing the hint to assistive technology, a hint in another field ("New todo" §5, a title
field §6, a due-date field §15), a change to what `/` or Escape does (§25, §27, §46).

## Unchanged behavior

| Behavior                                                       | Proof                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The form's landmark, name, limit, value and button are §16's   | `src/components/todo-search-form.test.tsx` :: "AC-16.5: with filter all and query '' renders one search landmark, a GET form to /, a "Search todos" searchbox (q, maxlength 200, value ''), a submit "Search" button, no list items and no hidden filter input"                                                      |
| The hidden filter input stays                                  | `src/components/todo-search-form.test.tsx` :: "AC-16.5: with filter active and query 'milk' renders one search landmark, a GET form to /, a "Search todos" searchbox (q, maxlength 200, value 'milk'), a submit "Search" button, no list items and one hidden filter input with value active"                        |
| No link without a search                                       | `src/components/todo-search-form.test.tsx` :: "AC-21.4: with (all, ''), (active, ''), (completed, ' ') each render has 0 links inside or outside the search landmark, 0 elements with the text "Clear search", exactly 1 search landmark, 1 "Search todos" searchbox and exactly 1 submit "Search" button"           |
| `/` focuses the box, keeps its value, makes no request         | `src/components/todo-search-form.test.tsx` :: "AC-25.2: on (all, milk) with body focused, / makes "Search todos" the active element, its value stays milk, defaultPrevented is true, 0 requests and 0 navigations"                                                                                                   |
| `/` selects the box's text and leaves the markup as it was     | `src/components/todo-search-form-select.test.tsx` :: "AC-46.3: with an empty box / on body leaves value '' and selection 0 to 0; on (active, milk) / on "Clear search", a checkbox and "Search" each selects 0 to 4; every defaultPrevented is true and the form's innerHTML is unchanged"                           |
| Escape in the box still empties it and activates the link      | `src/components/todo-search-form.test.tsx` :: "AC-27.2: on (active, milk) with milkx typed, Escape in the box leaves the value '', defaultPrevented true, exactly 1 click on the "Clear search" link whose href is /?filter=active, and 0 requests"                                                                  |
| A render without `count` is the render with a non-shown count  | `src/components/todo-search-form.test.tsx` :: "AC-38.3: with (milk, 0), (milk, no count), ('', 3), (' ', 3), (milk, -1) and (milk, 1.5) each render has 0 p elements in the document and the same innerHTML as the render with the same filter and query and no count prop"                                          |
| Search, filter links and a blank `q` still work in the browser | `e2e/16-search.spec.ts` :: "AC-16.6: search narrows to [D, C], Active drops the search and shows [D, B] with an empty box, MILK under Active shows [D] and survives a reload, zzz shows exactly one "No todos match your search", and a blank q shows [D, C, B, A]"                                                  |
| `/`, typing and Enter in the browser                           | `e2e/25-search-shortcut.spec.ts` :: "AC-25.6: the first / focuses an empty "Search todos" on exactly / with 0 POSTs; milk + Enter opens /?q=milk with [D] and the box reads milk; in "New todo" / is typed and focus stays; on /?filter=active Ctrl+/ leaves "Search todos" unfocused and a plain / then focuses it" |
