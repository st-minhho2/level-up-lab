# B5.5 advice

## Approaches

**A (recommended): `onKeyDown` on the existing box, a second `useRef` on the "Clear search" link, a pure `isSearchEscape`.**

- Change: new `src/lib/escape-search.ts` (`SEARCH_ESCAPE_KEY = 'Escape'`, `EscapeEvent`, `isSearchEscape`: key equals
  the constant and no ctrl, meta, alt or shift; never throws). In `todo-search-form.tsx`: `clearLinkRef =
useRef<HTMLAnchorElement>(null)` on the `<Link>` (next/link forwards `ref` to the anchor), and on the input
  `onKeyDown={(e) => { if (isSearchEscape(e)) { e.preventDefault(); e.currentTarget.value = ''; if (isSearchInEffect(query)) { clearLinkRef.current?.click(); } } }}`.
  `'use client'` is already there (B5.3). `TodoSearchForm` signature and markup unchanged.
- Pros: matches the §27 Function contract word for word; the address keeps one source (`clearSearchHref`, via the
  link's own href); no `next/navigation` hook, so the existing tests (rendered without an app router) stay valid; the
  condition is `isSearchInEffect(query)` on the received prop, as REQ-27.2 requires; no request, no action (REQ-27.4);
  the handler is on the box, so REQ-27.6 holds by construction (Escape elsewhere never reaches it).
- Cons: relies on `Link` forwarding `ref` and on `click()` running Link's own onClick (verify in e2e, AC-27.6).
- Fits rules: pure logic in `src/lib`, no Prisma, no action, no dependency, no env.

**B (alternative): `useRouter().push(clearSearchHref(filter))`.**

- Pros: no ref on the link.
- Cons: adds a `next/navigation` hook the spec forbids ("no `next/navigation` hook is added"); breaks every existing
  render of the component without an app router context (needs a mock added to the test file); a second reading of
  §21's "client-side navigation by script" Out of scope line. Not available without a `docs(spec)` commit under a D-n.

## Recommendation

Approach A. No ruling needed: analysis questions 1 to 6 are consistent with the written spec (REQ-27.2 and the
Function contracts settle questions 1, 2, 3, 4 and 6).

## Impact

| File                                       | Add/Change               | Signature                                                                                            | ACs                |
| ------------------------------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------ |
| `src/lib/escape-search.ts`                 | Add                      | `SEARCH_ESCAPE_KEY: string = 'Escape'`, `EscapeEvent`, `isSearchEscape(event: EscapeEvent): boolean` | AC-27.1            |
| `src/lib/escape-search.test.ts`            | Add (red)                | n/a                                                                                                  | AC-27.1            |
| `src/components/todo-search-form.tsx`      | Change                   | `TodoSearchForm({ filter, query }): ReactNode` unchanged; link ref, `onKeyDown` on the box           | AC-27.2 to AC-27.5 |
| `src/components/todo-search-form.test.tsx` | Change (red commit only) | new `describe` for §27; add keys, remove none; header comment fixed here if stale                    | AC-27.2 to AC-27.5 |
| `e2e/25-escape-search.spec.ts`             | Add (red)                | n/a                                                                                                  | AC-27.6            |

Skeleton commit: `src/lib/escape-search.ts` exporting the constant and `isSearchEscape` throwing `NotImplementedError`
so the lib test is red on an assertion, not an import. The component tests are red because the box has no handler.

Client component `todo-search-form.tsx`, per approach:

- A, server-rendered markup: identical today and after (`onKeyDown` and `ref` leave no attribute in the HTML).
- A, submit with JavaScript off: native GET to `/?q=...`, no handler involved, same today and after. Escape: only the
  browser's native `type="search"` clearing, where it exists; no navigation (dropped behavior: none new, an enhancement).
- A, submit before hydration: native GET submit (no `onSubmit`), same. Escape before hydration: native behavior only;
  the navigation starts working at hydration (dropped behavior, acceptable).
- B, markup: identical. JS off and before hydration: same as A. Dropped behavior: same, plus it needs a router
  context in every render.

Not touched (D-30): `src/app/page.tsx`, `clear-search.ts`, `search-shortcut.ts`, `todo-search.ts`, `src/actions/*`.
Doc drift (same commits): `src/components/CLAUDE.md` still says `todo-search-form.tsx` "stays a Server Component ...
no `'use client'`", stale since B5.3, not fixed by this card; `spec/features-map.md` row F25 is the lead's to add
(`docs(map)` commit after `feat`).

## Risks

- Migration: none. Dependencies: none. Environment: none. Medium tier (D-28).
- Security: no input reaches the server; no request is made by the key (REQ-27.4).
- Performance: one handler on one input; no extra listener.
- Isolation: the §25 document listener ignores Escape; the §27 handler is on the input only, so the two do not interact.
  Escape on body and in "New todo" reach neither.
- Existing tests that could turn red: none expected; markup unchanged. In jsdom, `Link` rendered without an app router
  must not throw on `click()`; if it navigates or warns, the AC-27.2 "0 requests" assertion needs a spy on `fetch` only,
  and the click count is read from the listener on the anchor, as the spec states.
- Behavior to confirm in e2e: after `click()`, the box remounts by `key` (filter and query change), so focus is lost
  (out of scope, "restoring focus"). `maxLength`/value reset: setting `value = ''` on an uncontrolled input is safe.
- Setting the value in the no-search case (`'  '` query): the key is unchanged, so only the direct assignment empties
  the box (AC-27.3).
- Mutation hot spots below.

## Test strategy

| Layer     | File                                       | ACs                | Mocks                                                                                                                                                      |
| --------- | ------------------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| unit      | `src/lib/escape-search.test.ts`            | AC-27.1            | none (pure)                                                                                                                                                |
| component | `src/components/todo-search-form.test.tsx` | AC-27.2 to AC-27.5 | none for the form; `vi.spyOn(globalThis, 'fetch')` for 0 requests; click listener on the anchor; `fireEvent.keyDown` (cancelable) so no character is typed |
| e2e       | `e2e/25-escape-search.spec.ts`             | AC-27.6            | none; seeds D, C, B; counts POST requests with `page.on('request')`                                                                                        |

## Mutation hot spots

- `isSearchEscape`: each of the four modifiers separately (a surviving `&&` to `||` or a dropped `shiftKey`); `'Esc'`,
  `'escape'` and `''` against a loosened comparison.
- `isSearchInEffect(query)` guard in the handler: `'  '` and `''` (no click) versus `'milk'` (one click).
- `preventDefault` and `value = ''` must each be asserted in both the search and no-search cases.
- The `?.` on the link ref: the no-search case asserts 0 links.

## Questions settled / escalated

```
Question:    Does clicking the "Clear search" link through a ref conflict with §21's "client-side navigation by script" Out of scope?
Class:       P0 no conflict
Sources:     spec/contracts/25-escape-search.md:24 "The link is activated, not re-implemented, so"
             spec/contracts/25-escape-search.md:58 "query, environment variable or `next/navigation` hook is added."
Conflict:    none
Verdict:     §27 REQ-27.2 and its Function contract govern (authority 3); D-32 lifted the Escape phrase from §16 and §21.
Next action: Implement approach A.
Must not:    Use `router.push` or add a `next/navigation` hook.
Doc drift:   none
Escalate:    none
```

```
Question:    Escape with Shift held, with no search in effect but text typed: what happens?
Class:       P0 no conflict
Sources:     spec/contracts/25-escape-search.md:21 "or Escape with Ctrl, Meta, Alt or Shift, THEN THE SYSTEM SHALL keep the behavior of §16 and §25"
             spec/contracts/25-escape-search.md:19 "THE SYSTEM SHALL only empty the box: the address, the list and the counts stay as they are and no request is made."
Conflict:    none
Verdict:     REQ-27.5 and REQ-27.3 settle both: a modified Escape is ignored; plain Escape only empties the box.
Next action: Encode both in `isSearchEscape` and the handler.
Must not:    Drop `shiftKey` from `EscapeEvent` or navigate when no search is in effect.
Doc drift:   none
Escalate:    none
```
