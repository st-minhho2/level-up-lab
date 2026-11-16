# B10.3 advice: the search box shows "Press / to search" (§50)

Governing sources: `spec/contracts/48-search-hint.md` (§50, the only file of `src/` it changes is
`src/components/todo-search-form.tsx`), D-45 (the two lifts), invariants 1 and 2.

## Approaches

### A (recommended): a literal JSX attribute on the existing `<input>`

- Change: add `placeholder="Press / to search"` to the `<input type="search" name="q">` in `todo-search-form.tsx`
  (between `name` and `maxLength`). Nothing else in the component moves.
- Pros: exactly the Function contract of §50 ("a literal attribute ... no state, effect or prop sets it"; one export
  per file, no constant). Server-rendered (REQ-50.4) because a client component is still rendered to HTML on the
  server. One line of `src/`; no `src/lib` or `src/actions` change, so mutation testing does not apply.
- Cons: the text exists as a literal that the tests also repeat; it cannot be reused elsewhere (§50 wants that).
- Fits rules: spec-fidelity (literal from the section), ts-style (no new export), invariants 1-4 untouched.

### B (alternative): a constant `SEARCH_HINT` in `src/lib/search-hint.ts`

- Change: new lib module exporting the string; the component imports it.
- Pros: the string has one named home; matches the "constants are named module-level values" line of
  `src/CLAUDE.md`.
- Cons: contradicts §50 ("No new export, constant ... or lib function"; "the literal stays in the one place") and
  adds a file the spec says does not change; would need a `docs(spec)` edit under a new D-n first; adds a module to
  mutation testing scope. Not compliant without a ruling.
- Fits rules: breaks invariant 1 as written (a lib function with no section).

## Recommendation

Approach A. `src/CLAUDE.md` asks for named constants for spec constants, but §50 explicitly rules the literal and
is the more specific source (authority 3 over a package guide); the Function contract names the exception.

## Impact

| File                                                          | Add/Change | Signature                                                                                                       | ACs                |
| ------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------- | ------------------ |
| `src/components/todo-search-form.tsx`                         | Change     | `TodoSearchForm({ filter, query, count? }): ReactNode` unchanged; input gains `placeholder="Press / to search"` | AC-50.1 to AC-50.7 |
| `src/components/todo-search-form-hint.test.tsx` (test commit) | Add        | AC-50.1, 50.2, 50.3, 50.4 (`renderToStaticMarkup`), 50.5, 50.6; nothing mocked                                  | AC-50.1 to AC-50.6 |
| `e2e/50-search-hint.spec.ts` (test commit)                    | Add        | two contexts, one with `javaScriptEnabled: false`; `el.matches(':placeholder-shown')`                           | AC-50.7            |
| `spec/features-map.md`, `spec/technical-requirements.md`      | Change     | F48 and the §50 row flip on the `docs(map)` / closing commit                                                    | n/a                |

Client component `todo-search-form.tsx` (a `'use client'` file; a native GET form):

- Approach A, server-rendered markup: today the `<input>` has no `placeholder`; after, `placeholder="Press / to search"`
  appears in the HTML the server sends (exactly once, AC-50.4).
- Approach A, submit with JavaScript off: today GET `/?q=...` works; after, identical, the hint shows on the first
  response (AC-50.7). No behavior dropped.
- Approach A, submit before hydration: today the native form submits; after, identical; the attribute is already in
  the HTML so the hint is there too. `/` itself still does nothing before hydration (§50 Out of scope).
- Approach B, the three lines are identical in markup (the import is resolved at build). Dropped behavior: none, but
  it drops spec compliance (con above).

Doc drift for the caller, not a blocker: `src/components/CLAUDE.md` says `todo-search-form.tsx` "stays a Server
Component ... no state or events, so no `'use client'`", but the file is `'use client'` since §25/§27. Stale, so the
lead may fix it in the same `docs(map)` commit; B10.3 does not depend on it.

## Risks

- Migration: none. Dependencies: none new.
- Security / isolation / performance: none; a static attribute, no request, no handler.
- Existing tests that could go red (by reading): none. Sibling tests find the box by role and name (a label beats a
  placeholder); AC-38.3 and AC-46.3 compare `innerHTML` between two renders that both carry the attribute. Re-run
  `todo-search-form.test.tsx`, `todo-search-form-select.test.tsx` and e2e 16/21/25/27/38/46 to confirm.
- Test-writer risks: `react-dom/server` under jsdom may fail to resolve (analysis Q2; fall back to
  `// @vitest-environment node` and string checks, criterion unchanged). jsdom has no `:placeholder-shown`, so
  REQ-50.5 is proved only in the e2e (Q1).
- Red proof: the AC-50.1 title fails on an assertion (`placeholder` reads null), not an import; the skeleton commit
  has nothing to stub (no new export), so it may be empty or skipped per `backlog/CLAUDE.md`.
- `feat(...)` commit touches no test file (CI check); mutation not applicable (no `src/lib`/`src/actions` change).

## Test strategy

| Layer     | File                                            | ACs                             | Mocks                                        |
| --------- | ----------------------------------------------- | ------------------------------- | -------------------------------------------- |
| Component | `src/components/todo-search-form-hint.test.tsx` | AC-50.1, 50.2, 50.3, 50.5, 50.6 | none (as `todo-search-form-select.test.tsx`) |
| Component | same file, `renderToStaticMarkup` + `DOMParser` | AC-50.4                         | none                                         |
| e2e       | `e2e/50-search-hint.spec.ts`                    | AC-50.7                         | none (real DB via compose, as e2e 46)        |

## Mutation hot spots

None: no `src/lib` or `src/actions` file changes. The one regression a reviewer should probe is a placeholder made
conditional on a prop (AC-50.3 covers four filter/query pairs) or set from an effect (AC-50.4 covers it).

## Questions settled / escalated

```
Question:    Literal attribute or a named constant for the hint text?
Class:       P4 two sections collide (src/CLAUDE.md "named constants" vs §50 "the literal stays in the one place")
Sources:     spec/contracts/48-search-hint.md:88 "No new export, constant, Server"
             spec/contracts/48-search-hint.md:90 "second export of the file; the literal"
             src/CLAUDE.md:17 "Spec constants are named module-level values taken from the section"
Conflict:    §50 says the literal, no constant / src/CLAUDE.md says named constants for spec constants
Verdict:     §50 governs (authority 3, specific to this function) over a package guide (authority 4 and below).
Next action: use the literal attribute in todo-search-form.tsx.
Must not:    add src/lib/search-hint.ts or an exported constant.
Doc drift:   none
Escalate:    none
```

```
Question:    Is jsdom-only proof of the hint acceptable for REQ-50.5?
Class:       P0 no conflict (the spec states it)
Sources:     spec/contracts/48-search-hint.md:98 "implement `:placeholder-shown`, which is why that pseudo-class is read only in the browser test."
Conflict:    none
Verdict:     AC-50.7 (Playwright) proves :placeholder-shown; component tests check attribute and value.
Next action: test-writer follows the "How the criteria observe it" block.
Must not:    stub :placeholder-shown in jsdom or loosen AC-50.7.
Doc drift:   none
Escalate:    none
```

```
Question:    Do the "markup unchanged" notes of §16/§21/§25/§27 and REQ-46.4 block the new attribute?
Class:       P4 two sections collide, already settled in §50
Sources:     spec/contracts/48-search-hint.md:54 "and does not apply to this one attribute. REQ-16.1 to REQ-16.10 and AC-16.x are unchanged."
             spec/contracts/48-search-hint.md:43 "the press does not add it."
Conflict:    older sections list the box without placeholder / §50 adds exactly one attribute
Verdict:     §50 governs inside D-45; the older sections are not edited (only the two lifts of §25 and §46 Out of scope).
Next action: do not edit §16/§21/§25/§27; the two Out-of-scope lifts belong to the lead's docs(spec) commit, if not already landed.
Must not:    edit any older contract to remove the notes, or add the attribute from an effect to dodge REQ-46.4.
Doc drift:   §25 and §46 Out of scope lifts (D-45) must land as `docs(spec)` before the test commit if not yet on main.
Escalate:    none
```
