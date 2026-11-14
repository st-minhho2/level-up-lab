# B6.6 plan — The remaining count is announced to assistive technology (§34)

Approach: A from `advice.md` — `src/components/remaining-count.tsx` wraps its existing `<p>` and `<span>` in one bare,
unconditional `<div role="status">` (no class, no `aria-live`, no key), exactly as §34's Function contracts state. Still
a Server Component; props, exports and `src/lib` unchanged. No migration, dependency, env key or CI-protected path (no
`config-change-approved`); package guides stay out (D-33, as in B6.3). Lifts landed: §13 and §22 Out of scope in
19aa647 (D-33, D-35).

## Files

| File                                      | Change                                                                                                 | Why (AC-34.n) |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------- |
| `src/components/remaining-count.tsx`      | Change: one `<div role="status">` around the `<p>` and the "All done" `<span>`; header names §34       | 34.1–34.6     |
| `src/components/remaining-count.test.tsx` | Change (red): add `describe('<RemainingCount> (§34)')`, 3 `it`s; every existing AC-13.n/22.n `it` kept | 34.1–34.3     |
| `e2e/34-remaining-announce.spec.ts`       | Add (red): AC-34.4–34.6; locator `getByRole('status').filter({ hasText: /items? left/ })`, never bare  | 34.4–34.6     |
| `spec/features-map.md`                    | Add the F32 row (§34), ✅, in code-writer's `docs(map)` commit                                         | map           |

Paperwork (exempt): §34 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/remaining-count.tsx: signature and props unchanged; markup gains the wrapper only
export function RemainingCount({ count }: { readonly count: number }): ReactNode;
// <div role="status"><p>{remainingLabel(count)}</p>{message && <span>{message}</span>}</div>
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route.
```

## Verification

Baseline: `pnpm test` 269 passed (43 files). Red (`test(todos): B6.6 … (red)`, no skeleton: no new export, so red is
the missing `status` role, an assertion): `scripts/verify-red.sh B6.6` exit 0; exactly 3 new unit `it`s (AC-34.1,
AC-34.2 counts 1/2/11 with `unmount`, AC-34.3 `rerender` + `toBe` on the held node), each red at the red commit;
`pnpm test:e2e e2e/34-remaining-announce.spec.ts` → 3 fail on the `status` locator (0 matches), recorded in the body.
AC-34.5's "0 document navigations" counts main-frame document requests, not `framenavigated` (B6.3 lesson,
`e2e/31-due-today.spec.ts:118`). Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 269 → 272 passed (43 files),
all AC-13.n and AC-22.n green · `pnpm test:e2e` +3, `e2e/13-remaining-count.spec.ts`, `e2e/22-all-done.spec.ts` green ·
`pnpm test:mutation` ≥ 70 (`src/lib`, `src/actions` untouched; component mutants listed in `advice.md` killed by
AC-34.1–34.3) · `pnpm build` ok · `scripts/ci/check-features-map.sh` and `scripts/ci/check-plan-scope.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                                   | Commit                         |
| ---- | --------------- | ------------------------------------------ | ------------------------------ |
| 1    | none            | no skeleton (no new function or export)    | —                              |
| 2    | test-writer     | 3 unit `it`s, `e2e/34-remaining-announce…` | `test(todos): B6.6 … (red)`    |
| 3    | code-writer     | the wrapper                                | `feat(todos): B6.6 …`          |
| 4    | code-writer     | F32 row ✅                                 | `docs(map): F32 … [B6.6]`      |
| 5    | reviewer (diff) | `review.md` diff section                   | `docs(backlog): B6.6 review …` |

Costs the lead takes: the page's `flex flex-col gap-6` sees one child instead of two, so the 1.5rem gap between
"N items left" and "All done" goes (no visible text changes; §34 names no class; keeping the gap needs a D-n and a
`docs(spec)` edit, advice question 2). B6.5 adds a second `status` on `/` in this batch; both cards scope by text.

Plan review: approved, round 1 · Plan approved by: · Rounds: 1
