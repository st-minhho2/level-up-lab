# B5.3 advice

## Approaches

**A (recommended): `todo-search-form.tsx` gains `'use client'`, a `useRef` on the box and one `useEffect`.**

- Change: new pure `src/lib/search-shortcut.ts` (`SEARCH_SHORTCUT_KEY`, `ShortcutEvent`, `isSearchShortcut`). The form
  adds `'use client'`, `useRef<HTMLInputElement>(null)` on the existing keyed input, and
  `useEffect(() => { const onKeyDown = (e: KeyboardEvent) => { if (isSearchShortcut(e)) { e.preventDefault(); ref.current?.focus(); } }; document.addEventListener('keydown', onKeyDown); return () => document.removeEventListener('keydown', onKeyDown); }, [])`.
  Empty deps are safe: the ref is read when the key is pressed, so it follows the input's `key` remount (§25 Function contracts).
- Pros: matches the §25 Function contract word for word (listener lives in `TodoSearchForm`, signature and markup
  unchanged); D-30 keeps one component for the card; B5.5 (Escape in the box) needs the same client component; REQ-25.6
  (listens only while the form is shown) follows from mount and unmount.
- Cons: the form is no longer a Server Component, so the "no 'use client'" remarks go stale (see Doc drift). The shortcut
  does nothing before hydration (dropped behavior, acceptable: it is an enhancement).
- Fits rules: pure logic in `src/lib`, no Prisma, no action, no new dependency, no env.

**B (alternative): a separate `'use client'` child (e.g. `search-shortcut.tsx`) rendering `null`, focusing `#search-todos`.**

- Pros: the form stays a Server Component.
- Cons: a second component file, so a second place in the batch; contradicts the §25 contract ("`todo-search-form.tsx` ...
  gains 'use client'") and D-30's one-file mapping; couples to the id by string; needs a spec change to adopt. The spec
  wins, so B is not available without a `docs(spec)` commit under a D-n.

## Recommendation

Approach A. No question needs a ruling (analysis open questions 1 to 6 are proposals consistent with the written spec).

## Impact

| File                                       | Add/Change               | Signature                                                                             | ACs                |
| ------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------- | ------------------ |
| `src/lib/search-shortcut.ts`               | Add                      | `isSearchShortcut(event: ShortcutEvent): boolean`, `SEARCH_SHORTCUT_KEY = '/'`        | AC-25.1            |
| `src/lib/search-shortcut.test.ts`          | Add (red)                | n/a                                                                                   | AC-25.1            |
| `src/components/todo-search-form.tsx`      | Change                   | `TodoSearchForm({ filter, query }): ReactNode` unchanged; `'use client'`, ref, effect | AC-25.2 to AC-25.5 |
| `src/components/todo-search-form.test.tsx` | Change (red commit only) | new `describe` for §25; key added, nothing removed; stale header comment fixed here   | AC-25.2 to AC-25.5 |
| `e2e/25-search-shortcut.spec.ts`           | Add (red)                | n/a                                                                                   | AC-25.6            |

Client component `todo-search-form.tsx`, per approach:

- A, server-rendered markup: identical today and after (a GET form to `/`, same input, hidden filter, button, link);
  the client component is still server-rendered, so the HTML is unchanged.
- A, submit with JavaScript off: native GET to `/?q=...`, no handler involved, today and after the same.
- A, submit before hydration: native GET submit (the form has no `onSubmit`), today and after the same. Dropped
  behavior: `/` does not focus the box until hydration finishes (listener attaches in the effect).
- B, markup: identical (child renders `null`). JS off and before hydration: same as A. Dropped behavior: same, plus the
  coupling to `#search-todos`.

Not touched: `src/app/page.tsx`, `todo-search.ts`, `clear-search.ts`, `src/actions/*` (D-30).
`spec/features-map.md` F23 is added by the lead.

## Risks

- Migration: none. Dependencies: none. Environment: none. Medium tier (D-28).
- Security: no input reaches the server; no request is made by the key (REQ-25.5).
- Performance: one `keydown` listener on `document` while mounted; removed on unmount (StrictMode double-mount adds and
  removes it once each, so AC-25.5 "1 focus call" holds).
- Isolation: the spy test must restore `focus`; unmount between tests (Testing Library cleanup does this).
- Existing tests that could turn red: the §16/§21 tests in `todo-search-form.test.tsx` render synchronously and stay
  green under a client component in jsdom (the markup is unchanged). jsdom does not implement `isContentEditable`, so
  the contenteditable case is proven only with plain-object events in AC-25.1, as the spec describes.
- `'use client'` makes `next build` re-check that the file imports no server-only module: `clear-search`,
  `todo-filter`, `todo-search` must be pure. Confirm before coding (`pnpm build`).
- Doc drift lands with the feat commit, tests untouched there: the stale test header comment ("synchronous Server
  Component") must be fixed in the red `test(...)` commit, not the feat commit.

## Test strategy

| Layer | File                                       | ACs                | Mocks                                                                                                                                                                                         |
| ----- | ------------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit  | `src/lib/search-shortcut.test.ts`          | AC-25.1            | none (pure; plain-object events)                                                                                                                                                              |
| Comp  | `src/components/todo-search-form.test.tsx` | AC-25.2 to AC-25.5 | none needed (no action imported); `vi.spyOn(box, 'focus')` for the one-call check; `fireEvent.keyDown(document.body, { key: '/' })` returns `false` when prevented; `next/link` renders as is |
| E2E   | `e2e/25-search-shortcut.spec.ts`           | AC-25.6            | none; real DB, `networkidle` before keys, count POSTs to `/`                                                                                                                                  |

Skeleton: `isSearchShortcut` throws `NotImplementedError` so the red is an assertion failure, not an import failure.

## Mutation hot spots

`src/lib/search-shortcut.ts` (the only `src/lib` change): `key === '/'` (also `'?'`, `''`), each of `ctrlKey`, `metaKey`,
`altKey` (one test each, one at a time), the `null` target branch, case-insensitive tag compare (lowercase `'input'`
case), `isContentEditable === true` versus truthy, `INPUT`/`TEXTAREA`/`SELECT` each separately, and "never throws" (no
`target.tagName` on `{}`). No `src/actions` change.

## Questions settled / escalated

```
Question:    Does the form become a client component or get a child client component?
Class:       P0 no conflict
Sources:     spec/contracts/23-search-shortcut.md:75 "gains 'use client': an effect and a ref"
             backlog/00-decisions.md:55 "B5.3 section 25 (`23-search-shortcut.md`, `src/components/todo-search-form.tsx`)"
Conflict:    none
Verdict:     §25 and D-30 name the form itself; approach A.
Next action: test-writer writes the red tests, then code-writer.
Must not:    add a second client component file.
Doc drift:   §16 and §21 Function contracts "no 'use client'" remarks, `src/components/CLAUDE.md` todo-search-form line,
             test header comment (test commit); fixed in the landing lane, not by this role.
Escalate:    none
```

```
Question:    Shift, checkbox focus, defaultPrevented events, caret, auto-repeat (analysis questions 2 to 6).
Class:       P2 spec silent, closed by the written spec
Sources:     spec/contracts/23-search-shortcut.md:42 "Shift is not a blocking modifier"
             spec/contracts/23-search-shortcut.md:24 "an element whose `isContentEditable` is true"
Conflict:    none
Verdict:     the spec text settles Shift and text-entry; the others are unspecified and stay unspecified (Out of scope).
Next action: implement the Function contract exactly.
Must not:    add `repeat`, `defaultPrevented`, `type` or select-on-focus handling.
Doc drift:   none
Escalate:    none
```
