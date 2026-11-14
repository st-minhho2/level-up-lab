<!-- Title: feat(todos): B6.6 the remaining count is announced to assistive technology -->

## Item

B6.6 — The remaining count is announced to assistive technology (spec §34)

- spec: §34 — written in this branch (D-33); "live announcement to assistive technology" lifted from §13's Out of scope (D-33) and §22's (D-35)
- test: `src/components/remaining-count.test.tsx::AC-34.1 … AC-34.3`, `e2e/34-remaining-announce.spec.ts::AC-34.4 … AC-34.6` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-34.1 … AC-34.6

Closes #277

## Plan

### B6.6 plan — The remaining count is announced to assistive technology (§34)

Approach: A from `advice.md` — `src/components/remaining-count.tsx` wraps its existing `<p>` and `<span>` in one bare,
unconditional `<div role="status">` (no class, no `aria-live`, no key), exactly as §34's Function contracts state. Still
a Server Component; props, exports and `src/lib` unchanged. No migration, dependency, env key or CI-protected path (no
`config-change-approved`); package guides stay out (D-33, as in B6.3). Lifts landed: §13 and §22 Out of scope in
19aa647 (D-33, D-35).

#### Files

| File                                      | Change                                                                                                 | Why (AC-34.n) |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------- |
| `src/components/remaining-count.tsx`      | Change: one `<div role="status">` around the `<p>` and the "All done" `<span>`; header names §34       | 34.1–34.6     |
| `src/components/remaining-count.test.tsx` | Change (red): add `describe('<RemainingCount> (§34)')`, 3 `it`s; every existing AC-13.n/22.n `it` kept | 34.1–34.3     |
| `e2e/34-remaining-announce.spec.ts`       | Add (red): AC-34.4–34.6; locator `getByRole('status').filter({ hasText: /items? left/ })`, never bare  | 34.4–34.6     |
| `spec/features-map.md`                    | Add the F32 row (§34), ✅, in code-writer's `docs(map)` commit                                         | map           |

Paperwork (exempt): §34 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/components/remaining-count.tsx: signature and props unchanged; markup gains the wrapper only
export function RemainingCount({ count }: { readonly count: number }): ReactNode;
// <div role="status"><p>{remainingLabel(count)}</p>{message && <span>{message}</span>}</div>
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route.
```

#### Verification

Baseline: `pnpm test` 269 passed (43 files). Red: `scripts/verify-red.sh B6.6` exit 0; 3 new unit `it`s and 3 e2e
tests red on the missing `status` role. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 269 → 272 ·
`pnpm test:e2e` +3, `e2e/13-remaining-count.spec.ts`, `e2e/22-all-done.spec.ts` green · `pnpm test:mutation` ≥ 70 ·
`pnpm build` ok. Full text: `backlog/work/B6.6/plan.md`.

Costs the lead takes: the page's `flex flex-col gap-6` sees one child instead of two, so the 1.5rem gap between
"N items left" and "All done" goes (no visible text changes; §34 names no class; keeping the gap needs a D-n and a
`docs(spec)` edit). B6.5 adds a second `status` on `/` in this batch; both cards scope by text.

Plan review: approved, round 1 · Plan approved by: reviewer (D-27, tier medium, issue #277) · Rounds: 1

## Map delta

pending

## Review

pending

## Evidence

- AC met: pending
- tier: medium
- plan deviations: pending
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
