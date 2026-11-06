<!-- Title: feat(todos): B5.5 Escape clears the search box -->

## Item

B5.5 — Escape clears the search box (spec §27)

- spec: §27 — written in this branch (D-30); Escape in the search box lifted from §16's and §21's Out of scope (D-32)
- test: `src/lib/escape-search.test.ts::AC-27.1`, `src/components/todo-search-form.test.tsx::AC-27.2 … AC-27.5`, `e2e/27-escape-search.spec.ts::AC-27.6` — red before (`scripts/verify-red.sh`; AC-27.4, AC-27.5 pinned green first), green after
- acceptance: AC-27.1 … AC-27.6

Closes #224

## Plan

### B5.5 plan — Escape clears the search box (§27)

Approach: A from `advice.md` — a pure `src/lib/escape-search.ts` (`isSearchEscape`) plus an `onKeyDown` on the
existing "Search todos" box in `src/components/todo-search-form.tsx`, which empties the box, calls `preventDefault`
and, only when `isSearchInEffect(query)`, clicks the "Clear search" link through a second `useRef`, exactly §27's
Function contracts (one address source, `clearSearchHref`; no `next/navigation` hook). Deviation from advice: the
e2e file follows the section number, `e2e/27-escape-search.spec.ts` (`25-` is §25's, as in B5.4's `26-`). No
migration, dependency, env key or CI-protected path (no `config-change-approved`). `src/app/page.tsx`,
`clear-search.ts`, `search-shortcut.ts`, `todo-search.ts`, `src/actions/*` untouched (D-30). The stale
`src/components/CLAUDE.md` line on the search form is B1.80's, not this card's.

#### Files

| File                                       | Change                                                                                                                                                                  | Why (AC-27.n) |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `src/lib/escape-search.ts`                 | Add `SEARCH_ESCAPE_KEY`, `EscapeEvent`, `isSearchEscape` (skeleton throws `NotImplementedError`, then green)                                                            | 27.1          |
| `src/components/todo-search-form.tsx`      | Box `onKeyDown` + `clearLinkRef` on the `<Link>`; header names §27; signature and markup unchanged (green only)                                                         | 27.2–27.6     |
| `src/lib/escape-search.test.ts`            | Add (red): AC-27.1                                                                                                                                                      | 27.1          |
| `src/components/todo-search-form.test.tsx` | Add a §27 `describe`: AC-27.4, AC-27.5 pinned green first (hold today), then AC-27.2, AC-27.3 (red); `fireEvent.keyDown` cancelable, `fetch` spy, anchor click listener | 27.2–27.5     |
| `e2e/27-escape-search.spec.ts`             | Add (red): AC-27.6, seeds D, C, B, counts POST requests with `page.on('request')`                                                                                       | 27.6          |
| `spec/features-map.md`                     | Add the F25 row (§27): skeleton ✗, ✅ in `docs(map)`                                                                                                                    | map           |

Paperwork (exempt): §27 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

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

#### Verification

Pin (`test(todos): B5.5 pin AC-27.4, AC-27.5 …`, as B5.2 did): both hold on today's code (they prove Escape-free keys
and Escape outside the box change nothing), green, 222 → 224, each asserting exactly its own Then, no positive control.
Red (`test(todos): B5.5 … (red)`): `scripts/verify-red.sh B5.5` exit 0 (it judges only the `(red)` commit's new tests);
AC-27.1 fails on the skeleton's `NotImplementedError`, AC-27.2/27.3 on assertions (value not `''`, `defaultPrevented`
false, 0 clicks: no handler yet); `pnpm test:e2e e2e/27-escape-search.spec.ts` → AC-27.6 fails on the address, recorded
in the body. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 222 → 227 passed (5 new AC-27.n: 2 pinned, 3 red),
AC-25.n and AC-21.n tests unchanged and green ·
`pnpm test:e2e` 50 → 51 passed, `e2e/16-search.spec.ts`, `e2e/21-clear-search.spec.ts`, `e2e/25-search-shortcut.spec.ts`
green · `pnpm test:mutation` ≥ 70 with `src/lib/escape-search.ts` in scope · `pnpm build` ok ·
`scripts/ci/check-plan-scope.sh` OK. Counts are the test-writer's target; a different count is stated in the red commit.

#### Work breakdown

| Step | Role / skill        | Produces                                               | Commit                            |
| ---- | ------------------- | ------------------------------------------------------ | --------------------------------- |
| 1    | `new-feature-slice` | `escape-search.ts` stub, F25 ✗                         | `chore(todos): B5.5 skeleton`     |
| 2a   | test-writer         | AC-27.4, AC-27.5 in `todo-search-form.test.tsx`, green | `test(todos): B5.5 pin AC-27.4 …` |
| 2b   | test-writer         | AC-27.1–27.3 + `e2e/27-escape-search.spec.ts`, red     | `test(todos): B5.5 … (red)`       |
| 3    | code-writer         | `isSearchEscape`, the box's `onKeyDown`                | `feat(todos): B5.5 …`             |
| 4    | dev-lead            | F25 ✅                                                 | `docs(map): F25 … [B5.5]`         |
| 5    | reviewer (diff)     | `review.md` diff section                               | `docs(backlog): B5.5 review …`    |

Plan review: approved, round 2 (round 1: 2 reasons, pin AC-27.4/27.5 before the red commit and baseline 222, applied 7e027d9) · Plan approved by: reviewer (D-27, tier medium, issue #224) · Rounds: 1

## Map delta

pending

## Review

pending

## Evidence

- AC met: pending
- tier: medium
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
