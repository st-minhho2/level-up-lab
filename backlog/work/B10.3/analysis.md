# B10.3 analysis

Section: §50 in `spec/contracts/48-search-hint.md` (new). Component: `src/components/todo-search-form.tsx` only.
No card file exists yet in `backlog/plan/` (E10 is not filed); the `Spec:` and `Test:` lines are in the report.

## Completeness

| Check                                | Result | Note                                                                                                                                                      |
| ------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | says what the person sees (grey text in an empty box, gone on typing, back when empty); "placeholder" appears only in the REQs                            |
| Every behavior has a REQ             | pass   | text 50.1, accessible name and markup 50.2, every state 50.3, server render and no-JS 50.4, empty box 50.5 (Escape), keys unchanged 50.6                  |
| One EARS pattern each                | pass   | ubiquitous x5, state-driven x1                                                                                                                            |
| ≤ 7 criteria                         | pass   | 7 (6 component, 1 e2e with two browser contexts)                                                                                                          |
| Every Then measurable                | pass   | attribute strings and length 17, `getByRole` counts, exact `textContent`, selection offsets, click counts, `:placeholder-shown`, addresses, row lists     |
| No banned adjective without a number | pass   | none used                                                                                                                                                 |
| Out of scope                         | pass   | `/` before hydration and on touch (both listed), hint hidden in text fields, tooltip, `aria-*`, `<kbd>`, Escape hint, styling, truncation, other fields   |
| Unchanged behavior with proof titles | pass   | 9 titles copied verbatim from grep of the test files                                                                                                      |
| Dependencies done                    | pass   | §16, §21, §25, §27, §38, §46 on main; D-45 ruled                                                                                                          |
| No settled D-n contradicted          | pass   | the two lifts D-45 allows, no other contract edit; `spec/technical-requirements.md` and `spec/features-map.md` not touched (lead registers §50 ✗ and F48) |
| Function contract exact              | pass   | signature unchanged; one literal attribute; no new export; no `src/lib` or `src/actions` file, so mutation testing is skipped                             |
| Siblings checked                     | pass   | see below                                                                                                                                                 |
| Existing tests broken                | none   | by reading, see below                                                                                                                                     |

Sibling check (each against the shipped component):

- §16: REQ-16.1 names role, label, limit, button; it does not forbid a `placeholder`. Its contract line lists the box's
  attributes without `placeholder`, and "the markup above is otherwise unchanged" (`14-search.md:64,75`): stated not to
  apply to this one attribute; §16 not edited (D-45 allows two lifts only).
- §21 (`19-clear-search.md:51` and its "only visible text added" sentence), §25 (`23:53`, REQ-25.6), §27 (`25-escape-search.md:53`,
  REQ-27.6), §36 (`36-search-count.md`, REQ-38.7, Out of scope "a count in the box's placeholder"), §46 (`44:22` REQ-46.4,
  `44:59`): each named in §50 with how it relates. REQ-46.4 and REQ-25.6 limit what a key press changes: still true,
  AC-50.6 reuses the "innerHTML equal before and after the press" check of AC-46.3.
- Accessible name: the label of §16 wins over a placeholder, so `getByRole('searchbox', { name: 'Search todos' })` in all
  six sibling test/e2e files (`todo-search-form*.test.tsx`, e2e 16/21/25/27/38/46) still finds the box. No test uses
  `getByPlaceholderText`, `getByText` on the form, snapshots or `renderToString`.
- Markup comparisons between renders (AC-38.3 `innerHTML` with and without `count`, AC-46.3 before and after a press):
  both sides carry the attribute, so equal. By reading, none breaks.
- Escape (§27): sets `value = ''`; the attribute is static, so the hint shows again by the browser's own rule; with a
  search in effect the link remounts the box empty (the `key` of §16). Both covered (AC-50.5, AC-50.7).
- Pending or async states: the box is uncontrolled and no Server Action takes part; nothing pending to probe.

## Open questions

1. **`:placeholder-shown` in jsdom.** jsdom does not implement the pseudo-class. Proposed: REQ-50.5 is proved in the
   browser (AC-50.7) and the component tests check the attribute and the value only. Otherwise a component test of
   "the hint is shown" cannot be written.
2. **Server render in a jsdom test file.** AC-50.4 uses `renderToStaticMarkup` from `react-dom/server` in
   `todo-search-form-hint.test.tsx` (jsdom). If the jsdom resolution of `react-dom/server` fails, test-writer may put
   AC-50.4 in a second file with the `// @vitest-environment node` docblock and `DOMParser` replaced by string checks; the
   criterion stays. Proposed: try the single file first.
3. **No-JS e2e needs `javaScriptEnabled: false`.** Proposed: `browser.newContext` in `e2e/50-search-hint.spec.ts`
   (e2e files follow the section number, as `46-search-select.spec.ts`). No config change.
4. **Text in one place.** Proposed: a literal in the component, no exported constant (one export per file,
   `ts-style.md`). Otherwise a constant would sit in `src/lib` and add a function to the contract list.
5. **Hint while `/` cannot work** (before hydration, touch device, focus in a text field). Proposed: out of scope as the
   card says, shown anyway. Otherwise the hint would need a client-side switch, which REQ-50.4 (server-rendered) forbids.
6. **Index and map.** `spec/technical-requirements.md` (§50 row ✗) and `spec/features-map.md` (F48) are left to the
   lead as instructed; the check-spec-sections script will name them until then.

## Needs a ruling

None. The two lifts and the "markup unchanged" notes are inside D-45; no stored rule changes.
