# B5.3 plan — The slash key focuses the search box (§25)

Approach: A from `advice.md`. A pure `src/lib/search-shortcut.ts` (`isSearchShortcut`) and, in `TodoSearchForm` only
(D-30), `'use client'`, a `useRef` on the keyed box and one `useEffect` that adds a `document` `keydown` listener
(`isSearchShortcut` → `preventDefault()` + `ref.current?.focus()`) and removes it on unmount. This is §25's function
block word for word; approach B (a second client file) contradicts §25 and D-30. Analysis Q1–Q6 as proposed (advice:
settled by the written spec). No migration, dependency, env key or CI-protected path (no `config-change-approved`).
Costs: the form stops being a Server Component (markup and no-JS GET submit unchanged); `/` does nothing before
hydration. D-31 (2A) applied in faf26f0 before any test: only text-like `input` types are text-entry, so `/` works
from a row checkbox (AC-25.1, AC-25.3 checkbox case); §16/§21 "no 'use client'" notes updated there. The non-text
type list (checkbox, radio, button, submit, reset, image, file, range, color) is the analyst's reading of D-31.
`src/components/CLAUDE.md:11` goes stale; D-30/D-31 keep it out of this card (its own card, per D-31).

## Files

| File                                       | Change                                                                                | Why (AC-25.n) |
| ------------------------------------------ | ------------------------------------------------------------------------------------- | ------------- |
| `src/lib/search-shortcut.ts`               | Add: `SEARCH_SHORTCUT_KEY`, `ShortcutEvent`, `isSearchShortcut` (skeleton, then real) | 25.1          |
| `src/lib/search-shortcut.test.ts`          | Add (red): AC-25.1                                                                    | 25.1          |
| `src/components/todo-search-form.tsx`      | `'use client'`, ref, effect; header names §25; signature and markup unchanged         | 25.2–25.6     |
| `src/components/todo-search-form.test.tsx` | Add (red): AC-25.2–25.5 (25.3 incl. a checkbox); "Server Component" comment fixed     | 25.2–25.5     |
| `e2e/25-search-shortcut.spec.ts`           | Add (red): AC-25.6, POSTs counted from load to the last key                           | 25.6          |
| `spec/features-map.md`                     | Add F23 (§25): code-writer's feat (✗), ✅ in `docs(map)`                              | map           |

Paperwork (exempt, already landed or closing): `docs(spec)` faf26f0 (§25, §16, §21 under D-31); §25 index row stays ✗
until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/lib/search-shortcut.ts (§25, pure: no Prisma, no server-only, no DOM access)
export const SEARCH_SHORTCUT_KEY: string; // '/'
export interface ShortcutEvent {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly altKey: boolean;
  readonly target: { readonly tagName?: string; readonly type?: string; readonly isContentEditable?: boolean } | null;
}
export function isSearchShortcut(event: ShortcutEvent): boolean;
// src/components/todo-search-form.tsx (§16, §21, §25): 'use client'; props and markup unchanged
export function TodoSearchForm({ filter, query }: { readonly filter: TodoFilter; readonly query: string }): ReactNode;
```

No Server Action, Zod schema, Prisma model, query, route or env var; `page.tsx` untouched.

## Verification

Red: `scripts/verify-red.sh B5.3` exit 0; AC-25.1 fails on the skeleton's `NotImplementedError`, AC-25.2–25.5 on
`activeElement`/`defaultPrevented`, AC-25.6 in `pnpm test:e2e e2e/25-search-shortcut.spec.ts` (recorded in the body).
Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 213 → 218 (1 unit, 4 component; the 4 existing
`todo-search-form.test.tsx` tests unchanged and green) · `pnpm test:e2e` 45 → 46 (`16-search`, `21-clear-search`
unchanged) · `pnpm test:mutation` ≥ 70, `search-shortcut.ts` hot spots per advice · `pnpm build` ok (client boundary
imports only pure `clear-search`, `todo-filter`, `todo-search`) · `scripts/ci/check-plan-scope.sh` OK.
Counts are the test-writer's target; a different count is stated in the red commit.

## Work breakdown

| Step | Role / skill                      | Produces                                          | Commit                         |
| ---- | --------------------------------- | ------------------------------------------------- | ------------------------------ |
| 1    | `new-feature-slice` (code-writer) | `search-shortcut.ts` stub (`NotImplementedError`) | `chore(todos): B5.3 skeleton`  |
| 2    | test-writer                       | 2 test files + `e2e/25-search-shortcut.spec.ts`   | `test(todos): B5.3 … (red)`    |
| 3    | code-writer                       | lib + form, F23 ✗                                 | `feat(todos): B5.3 …`          |
| 4    | dev-lead                          | F23 ✅                                            | `docs(map): F23 … [B5.3]`      |
| 5    | reviewer (diff)                   | `review.md` diff section                          | `docs(backlog): B5.3 review …` |

Plan review: pending, round 2 (round 1: changes requested, settled by D-31) · Plan approved by: · Rounds: 1
