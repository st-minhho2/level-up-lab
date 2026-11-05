# B5.4 advice: the tab title shows the remaining count (§26)

Sources read: `spec/contracts/24-page-title.md` (§26), `backlog/work/B5.4/analysis.md`, D-30, D-32, `src/app/page.tsx`,
`src/lib/todo-count.ts`, `src/app/layout.tsx`, `vitest.config.ts`, the rules. Reference implementation: B5.1 (§23, the
previous card that changed `page.tsx`) and the pure-lib pattern of `src/lib/title-count.ts`.

## Approaches

### A (recommended): `pageTitle` in `src/lib` plus `generateMetadata` in `page.tsx`, as the contract says

- Change: new pure `src/lib/page-title.ts`; `src/app/page.tsx` gains `export async function generateMetadata()` that
  returns `{ title: pageTitle(countRemaining(await listTodos())) }`. Layout, `todos.ts`, `todo-count.ts` untouched.
- Pros: exactly §26's Function contracts and D-30 (one card edits `page.tsx`, no new component); server-rendered title,
  so it is right with JavaScript off, before hydration and after reload (REQ-26.5); Next re-renders metadata from the
  RSC payload after `revalidatePath('/')`, so no client code (REQ-26.4); title replaces the layout's, the description
  is kept by shallow merge (REQ-26.6); `force-dynamic` already makes it per request.
- Cons: two `listTodos()` reads per request (page and `generateMetadata`), accepted in the contract's last paragraph;
  not deduplicated. A unit test of `generateMetadata` needs `@/lib/todos` mocked.
- Fits rules: yes. Prisma stays in `src/lib`; no mutation; no new dependency; `page-title.ts` has no `server-only`
  and is pure.

### B (alternative): client effect setting `document.title`

- Change: a client component with `useEffect(() => { document.title = ... })` fed the count.
- Pros: one read per request.
- Cons: contradicts D-30 (no other component) and §26's function contract; title is wrong with JavaScript off and
  before hydration; REQ-26.5 weaker; flashes the layout's title; needs a spec change (§8, new D-n).
- Fits rules: not without a D-n. Rejected.

A variant of A with React `cache()` around `listTodos` removes the second read but edits `src/lib/todos.ts` and
contradicts the contract's "no change to `src/lib/todos.ts`"; not recommended.

## Recommendation

Approach A. No migration, no dependency, no environment change: medium tier (D-28), no `prisma/`, no `.claude/`.

## Impact

| File                         | Add/Change | Signature                                                     | ACs                         |
| ---------------------------- | ---------- | ------------------------------------------------------------- | --------------------------- |
| `src/lib/page-title.ts`      | Add        | `export function pageTitle(remaining: number): string`        | AC-26.1                     |
| `src/app/page.tsx`           | Change     | `export async function generateMetadata(): Promise<Metadata>` | AC-26.2, AC-26.3, AC-26.4-7 |
| `src/lib/page-title.test.ts` | Add (red)  | n/a                                                           | AC-26.1                     |
| `src/app/page.test.ts`       | Add (red)  | n/a                                                           | AC-26.2, AC-26.3            |
| `e2e/26-page-title.spec.ts`  | Add (red)  | n/a                                                           | AC-26.4 to AC-26.7          |

No client component changes, so there is no server-rendered-markup line to give per approach for JavaScript off or
before hydration: approach A changes only `<title>` in the server HTML (works with JavaScript off and before
hydration, today the layout's `level-up-lab`, after `(N) Todos`); the form submits and every body markup are
unchanged (REQ-26.6). Approach B would add a client component whose title is correct only after hydration; listed as
a con above.

Implementation notes for the code card:

- `pageTitle`: `remaining >= 1 ? \`(${String(remaining)}) Todos\` : 'Todos'`(the literal is the heading's word; keep
it module-private, §26 adds one export). Header comment`// §26`.
- Import `type Metadata` from `next` in `page.tsx`; extend the file header comment with `§26 the tab title`.
- `generateMetadata` takes no argument (the contract's signature has none): it must not read `searchParams`
  (REQ-26.3).
- Correction to analysis.md: the e2e file is `e2e/26-page-title.spec.ts`, not `24-`. E2E files follow the section
  number (`24-escape-edit-title` is §24, `25-search-shortcut` is §25, `23-overdue-count` is §23), while the contract
  file number (`24-page-title.md`) differs; `24-` is already taken. Doc drift: analysis.md line "e2e numbering follows
  the section's file `24-`" (lead/spec-analyst may fix in the card's docs commit; it is not authority over the spec,
  which names no e2e file).

## Risks

- Migration: none. Security: none (no input, no mutation, read-only; title text is a number plus a constant, React
  escapes metadata). Performance: one extra `findMany` per `/` request (accepted, §26); no new index.
- Isolation: nothing stateful hard-coded.
- Open question 2 of analysis.md (title refresh after a Server Action without reload) cannot be proven by reading;
  AC-26.5/26.6 in the browser are the proof. If AC-26.5 is red after green code, stop: the fallback (client effect)
  needs a D-n. Escalation condition only, not now.
- `page.test.ts` in `src/app`: Next treats only `page.ts|tsx|js|jsx` as routes, so `page.test.ts` is not a route;
  vitest `unit` project includes `src/**/*.test.ts`. Importing `@/app/page` pulls client components and
  `@/lib/todos`: mock `@/lib/todos` (boundary, `server-only`/Prisma) and nothing else; confirm the import of
  `page.tsx` under node does not fail on `'use client'` modules (they are plain modules in vitest). If it does, that is
  a test-writer problem to fix in the test, not by changing `page.tsx`.
- Existing tests that could go red: `e2e/smoke.spec.ts` "home page renders the lab title" if it asserts
  `toHaveTitle('level-up-lab')` (check; it must be unchanged per §26's Unchanged table, which cites only the heading).
  `src/app/api/health/route.test.ts` unaffected.
- Mutation: `page-title.ts` is small; the `>= 1` boundary and both strings need the 0, 1 cases (AC-26.1 has them).
  Stryker covers `src/lib` + `src/actions`; `page.tsx` is outside it.

## Test strategy

| Layer | File                         | ACs                | Mocks                                                                                                                                                                  |
| ----- | ---------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| unit  | `src/lib/page-title.test.ts` | AC-26.1            | none (pure)                                                                                                                                                            |
| unit  | `src/app/page.test.ts`       | AC-26.2, AC-26.3   | `vi.mock('@/lib/todos')` (`listTodos`); assert `title` with `toEqual`/exact string, not truthiness; also assert description untouched is not required (layout owns it) |
| e2e   | `e2e/26-page-title.spec.ts`  | AC-26.4 to AC-26.7 | none; real DB, `document.title` via `expect(page).toHaveTitle`; AC-26.7 also requests `/api/health` and compares with the existing route test's expectation            |

Red proof: AC-26.1 fails on `pageTitle` not existing, which is an import failure; the rule says red on assertion or
`NotImplementedError`, so the test-writer commits a skeleton `src/lib/page-title.ts` that throws
`NotImplementedError`, and a `generateMetadata` skeleton in `page.tsx` that throws likewise. Skeleton files ride in
the `test(...)` commit (as prior cards), not the `feat(...)` commit.

## Mutation hot spots

- `page-title.ts`: `remaining >= 1` vs `> 1` (killed by 1), vs `> 0` (killed by non-integers only; unspecified,
  equivalent for integers), the two strings, the parentheses and space.
- `generateMetadata`: `countRemaining` over all todos vs a filtered list is outside Stryker; covered by AC-26.2
  (open, done, open, done, open gives 3) and AC-26.4.

## Questions settled / escalated

```
Question:    Two `listTodos()` reads per request (page and generateMetadata), against §13's "no second query"?
Class:       P4 two sections collide (resolved in the spec itself)
Sources:     spec/contracts/24-page-title.md:"The page component and `generateMetadata` each read the list."
             backlog/00-decisions.md:"D-30" "`generateMetadata` in `src/app/page.tsx`, no other component"
Conflict:    none live; §26 states two reads, D-30 confines the card to page.tsx
Verdict:     §26 governs (spec wins on behavior; D-30 above it forbids moving the read into src/lib/todos.ts). Two reads.
Next action: implement without `cache()`.
Must not:    wrap `listTodos` in React `cache()` or edit `src/lib/todos.ts`.
Doc drift:   none
Escalate:    none
```

```
Question:    Which e2e file name: `24-page-title.spec.ts` (analysis.md) or `26-page-title.spec.ts`?
Class:       P2 spec silent
Sources:     CLAUDE.md:"one file per section (`05-todos.spec.ts`)"
             backlog/work/B5.4/analysis.md:"e2e/24-page-title.spec.ts (e2e numbering follows the section's file `24-`)"
Conflict:    analysis.md says 24-; existing `e2e/24-escape-edit-title.spec.ts` is §24 and `e2e/23-overdue-count.spec.ts` is §23, so the convention is the section number
Verdict:     analysis.md is not authority; the convention in `e2e/` (section number) governs: `e2e/26-page-title.spec.ts`.
Next action: test-writer uses `e2e/26-page-title.spec.ts`; lead notes it in the plan.
Must not:    create a second `24-` e2e file.
Doc drift:   analysis.md line on e2e numbering, in the card's next docs(backlog) commit (optional, not authority).
Escalate:    none
```

```
Question:    Does the title refresh after a Server Action without a reload (REQ-26.4)?
Class:       P0 no conflict (unverifiable by reading)
Sources:     spec/contracts/24-page-title.md:"show the new title in the same tab without a full reload"
Conflict:    none
Verdict:     spec governs; AC-26.5/26.6 in the browser are the proof. Escalate to human only if they fail after green code.
Next action: write the e2e as specified, run it.
Must not:    add a client `document.title` effect pre-emptively.
Doc drift:   none
Escalate:    none
```
