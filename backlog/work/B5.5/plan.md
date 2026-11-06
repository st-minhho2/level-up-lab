# B5.5 plan — Escape clears the search box (§27)

Approach: A from `advice.md` — a pure `src/lib/escape-search.ts` (`isSearchEscape`) plus an `onKeyDown` on the
existing "Search todos" box in `src/components/todo-search-form.tsx`, which empties the box, calls `preventDefault`
and, only when `isSearchInEffect(query)`, clicks the "Clear search" link through a second `useRef`, exactly §27's
Function contracts (one address source, `clearSearchHref`; no `next/navigation` hook). Deviation from advice: the
e2e file follows the section number, `e2e/27-escape-search.spec.ts` (`25-` is §25's, as in B5.4's `26-`). No
migration, dependency, env key or CI-protected path (no `config-change-approved`). `src/app/page.tsx`,
`clear-search.ts`, `search-shortcut.ts`, `todo-search.ts`, `src/actions/*` untouched (D-30). The stale
`src/components/CLAUDE.md` line on the search form is B1.80's, not this card's.

## Files

| File                                       | Change                                                                                                          | Why (AC-27.n) |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------- |
| `src/lib/escape-search.ts`                 | Add `SEARCH_ESCAPE_KEY`, `EscapeEvent`, `isSearchEscape` (skeleton throws `NotImplementedError`, then green)    | 27.1          |
| `src/components/todo-search-form.tsx`      | Box `onKeyDown` + `clearLinkRef` on the `<Link>`; header names §27; signature and markup unchanged (green only) | 27.2–27.6     |
| `src/lib/escape-search.test.ts`            | Add (red): AC-27.1                                                                                              | 27.1          |
| `src/components/todo-search-form.test.tsx` | Add a §27 `describe` (red): AC-27.2–AC-27.5; `fireEvent.keyDown` cancelable, `fetch` spy, anchor click listener | 27.2–27.5     |
| `e2e/27-escape-search.spec.ts`             | Add (red): AC-27.6, seeds D, C, B, counts POST requests with `page.on('request')`                               | 27.6          |
| `spec/features-map.md`                     | Add the F25 row (§27): skeleton ✗, ✅ in `docs(map)`                                                            | map           |

Paperwork (exempt): §27 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/lib/escape-search.ts (§27): pure, no Prisma, no server-only, no DOM access
export const SEARCH_ESCAPE_KEY: string; // 'Escape'
export interface EscapeEvent {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly altKey: boolean;
  readonly shiftKey: boolean;
}
export function isSearchEscape(event: EscapeEvent): boolean; // key === SEARCH_ESCAPE_KEY, no modifier; never throws
// src/components/todo-search-form.tsx: unchanged signature
export function TodoSearchForm({ filter, query }: { readonly filter: TodoFilter; readonly query: string }): ReactNode;
// No Server Action, Zod schema, Prisma model, query, env key or next/navigation hook.
```

## Verification

Red (`test(todos): B5.5 … (red)`): `scripts/verify-red.sh B5.5` exit 0; AC-27.1 fails on the skeleton's
`NotImplementedError`, AC-27.2/27.3 on assertions (value not `''`, `defaultPrevented` false, 0 clicks: no handler yet);
AC-27.4/27.5 may pass on the skeleton (they prove nothing changes) and are stated so in the body;
`pnpm test:e2e e2e/27-escape-search.spec.ts` → AC-27.6 fails on the address. Green: `pnpm lint && pnpm typecheck`
clean · `pnpm test` 221 → 226 passed (5 new AC-27.n), AC-25.n and AC-21.n tests unchanged and green ·
`pnpm test:e2e` 50 → 51 passed, `e2e/16-search.spec.ts`, `e2e/21-clear-search.spec.ts`, `e2e/25-search-shortcut.spec.ts`
green · `pnpm test:mutation` ≥ 70 with `src/lib/escape-search.ts` in scope · `pnpm build` ok ·
`scripts/ci/check-plan-scope.sh` OK. Counts are the test-writer's target; a different count is stated in the red commit.

## Work breakdown

| Step | Role / skill        | Produces                                      | Commit                         |
| ---- | ------------------- | --------------------------------------------- | ------------------------------ |
| 1    | `new-feature-slice` | `escape-search.ts` stub, F25 ✗                | `chore(todos): B5.5 skeleton`  |
| 2    | test-writer         | 2 unit files + `e2e/27-escape-search.spec.ts` | `test(todos): B5.5 … (red)`    |
| 3    | code-writer         | `isSearchEscape`, the box's `onKeyDown`       | `feat(todos): B5.5 …`          |
| 4    | dev-lead            | F25 ✅                                        | `docs(map): F25 … [B5.5]`      |
| 5    | reviewer (diff)     | `review.md` diff section                      | `docs(backlog): B5.5 review …` |

Plan review: pending · Plan approved by: · Rounds: 1
