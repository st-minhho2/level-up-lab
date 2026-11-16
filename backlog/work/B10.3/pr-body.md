<!-- Title: feat(todos): B10.3 the search box shows "Press / to search" -->

## Item

B10.3 — The search box shows "Press / to search" (spec §50)

- spec: §50 — unchanged in this branch (written before the label under D-45, #355)
- test: `src/components/todo-search-form-hint.test.tsx::AC-50.1 … AC-50.6`, `e2e/50-search-hint.spec.ts::AC-50.7` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-50.1 … AC-50.7

Closes #358

## Plan

Copied from `backlog/work/B10.3/plan.md`.

Approach: A from `advice.md`: one literal `placeholder="Press / to search"` on the `<input type="search" name="q">` in
`src/components/todo-search-form.tsx` (header gains §50); no constant, export, state, effect or prop (§50 Function
contracts). B (a `src/lib` constant) rejected: §50 forbids a new export or lib function. No new export, so no skeleton
(as B9.4). No migration, dependency, env key or CI-protected path (no `config-change-approved`).

| File                                            | Change                                                                        | Why (AC-n) |
| ----------------------------------------------- | ----------------------------------------------------------------------------- | ---------- |
| `src/components/todo-search-form.tsx`           | Change: `placeholder="Press / to search"` on the box; header names §50        | 50.1–50.7  |
| `src/components/todo-search-form-hint.test.tsx` | Add (red): AC-50.1 to AC-50.6, nothing mocked; AC-50.4 `renderToStaticMarkup` | 50.1–50.6  |
| `e2e/50-search-hint.spec.ts`                    | Add (red): AC-50.7, second context `javaScriptEnabled: false`                 | 50.7       |
| `spec/features-map.md`                          | Add the F48 row (§50), ✅, in code-writer's `docs(map)` commit                | map        |

```ts
// src/components/todo-search-form.tsx: signature and props unchanged (§50 Function contracts)
export function TodoSearchForm({ filter, query, count }: { … }): ReactNode; // <input … placeholder="Press / to search" />
```

Verification: AC-50.2 pinned green first · `scripts/verify-red.sh B10.3` exit 0 · `pnpm test` 360 → 366 ·
`pnpm test:e2e` 88 → 89 · mutation: CI only, no src/lib or src/actions change · `pnpm build` ok.

Plan review: approved, round 2 · Plan approved by: reviewer (D-27, tier medium, issue #358) · Rounds: 1

## Map delta

pending

## Review

pending

## Evidence

- AC met: pending
- tier: medium
- plan deviations: pending
- trace: n/a

🤖 Generated with [Claude Code](https://claude.com/claude-code)
