# B5.3 analysis

## Completeness

| Check                                | Result | Note                                                                                                                                    |
| ------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | outcome (reach the box with one key, never lose a typed slash); no listener or ref named                                                |
| Every behavior has a REQ             | pass   | focus, preventDefault, text-entry exemption, modifiers, nothing else changes, listener lifetime: REQ-25.1 to 25.6                       |
| One EARS pattern each                | pass   | 2 event-driven, 2 unwanted behavior, 2 ubiquitous                                                                                       |
| At most 7 criteria                   | pass   | 6 (AC-25.1 to 25.6); AC-25.6 is the e2e, file `e2e/25-search-shortcut.spec.ts` (by section, as 24-escape-edit-title)                    |
| Every Then measurable                | pass   | return values, `document.activeElement`, `defaultPrevented`, address, row order, request count                                          |
| No banned adjective without a number | pass   | none used                                                                                                                               |
| Out of scope                         | pass   | other keys, hint, select-on-focus, configurable key, IME, announcements                                                                 |
| Unchanged behavior with proof titles | pass   | titles copied verbatim from grep of `todo-search-form.test.tsx`, `e2e/16-search.spec.ts`, `todo-search.test.ts`, `e2e/05-todos.spec.ts` |
| Dependencies done                    | pass   | D-30 settled; §16, §21 exist and are on main                                                                                            |
| No settled D-n contradicted          | pass   | D-30: one component (`todo-search-form.tsx`), no `page.tsx`; §16 Out of scope now reads "other than the slash key (§25)", the rest kept |

Test line is red on behavior once the test-writer adds a skeleton: `isSearchShortcut` does not exist, so the first red is
the missing module (the card line says so, as B5.1 did); the skeleton's `NotImplementedError` makes it an assertion
failure before the red gate. Registered in the index with status ✗. `spec/features-map.md` is not edited by this role: the
lead adds F23 (§25, `src/lib/search-shortcut.ts`, `src/components/todo-search-form.tsx`, the tests above,
`e2e/25-search-shortcut.spec.ts`).

## Open questions

1. `'use client'` on `todo-search-form.tsx`. Proposed: the file gains it (an effect and a ref are needed); signature and
   markup unchanged. Why: D-30 fixes the component, and B5.5 (Escape in the box) needs it too. Otherwise: a new
   `'use client'` child component rendering null and focusing `#search-todos` keeps the form a Server Component, at the
   cost of a second file and a broken "mounts in todo-search-form.tsx only" reading. Side effect to fix at landing, not
   by this role: the "no 'use client'" remarks in §16 and §21 Function contracts and the line in
   `src/components/CLAUDE.md` become stale (they describe structure, not behavior); the test-file comment "synchronous
   Server Component" too.
2. Shift. Proposed: not blocking (REQ-25.4 lists Ctrl, Meta, Alt). Why: on layouts where `/` needs Shift, `key` is still
   `'/'`. Otherwise: those layouts lose the shortcut.
3. Which elements count as text-entry. Proposed: `input` (every type, a checkbox included), `textarea`, `select`,
   contenteditable. Why: simple and safe; the only checkbox/radio inputs are the row checkboxes, where `/` then does not
   focus the search box. Otherwise: exempt only text-like input types, so `/` works from a focused checkbox (AC-25.3 would
   gain a checkbox case, and `ShortcutEvent.target` a `type` field).
4. An event already `defaultPrevented` by another handler. Proposed: not examined (no such handler exists). Otherwise: one
   more REQ and a field.
5. Caret and selection on focus. Proposed: unspecified (`focus()` default; out of scope: select-on-focus). Otherwise: a REQ
   that the text is selected so typing replaces it.
6. Auto-repeat (held key). Proposed: not examined; repeated focus of the focused box is harmless once focused (then
   REQ-25.3 applies). Otherwise: a `repeat` field.

## Needs a ruling

None.
