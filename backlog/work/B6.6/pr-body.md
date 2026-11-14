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

- `spec/features-map.md`: new row F32 · §34 · Announce the remaining count · `src/components/remaining-count.tsx` ·
  `src/components/remaining-count.test.tsx`, `e2e/34-remaining-announce.spec.ts` · ✅ (b7d0c92)
- `spec/technical-requirements.md`: §34 index row, ✗ until the closing PR (merge repair 1bb65dd by D-36)

## Review

`backlog/work/B6.6/review.md`, diff review round 1: **Verdict: ready for PR**, no blocking finding.

- Range: red 109018b, feat 0999603, map b7d0c92.
- Reviewer's gates: `pnpm test` 272 passed, `pnpm test:e2e` 60 passed, mutation 92.63 (≥ 70), suppressions,
  config-change, feat-commits, ac-coverage, spec-sections, features-map, plan-scope (D-27 approval) all OK,
  `verify-red.sh B6.6` red for the right reason.
- Revert probes: fragment instead of the wrapper, `key={count}`, `aria-live="assertive"`, "All done" outside the
  status: each fails at least one AC-34.n test (AC-34.5 catches the remount in the browser).
- Accepted cost (in the plan): `main`'s `gap-6` now sees one child, so the gap between "N items left" and "All done"
  goes; no visible text changes.
- Riskiest unfalsified: a future conditional above `page.tsx:54` could remount the wrapper on add or delete; no §34
  test drives that.

After merging origin/main (B6.4, B6.5, D-36): `pnpm lint`, `pnpm typecheck` clean, `pnpm test` 280 passed (45 files),
`pnpm test:e2e` 64 passed, `check-spec-sections.sh` and `check-features-map.sh` OK.

## Evidence

- AC met: AC-34.1 … AC-34.6 (6 of 6; 3 unit, 3 e2e)
- tier: medium
- plan deviations: none (`docs/metrics.md` row is listed paperwork); post-merge index repair 1bb65dd by the lead (D-36)
- trace: n/a

## Checklist

- [x] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [x] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [x] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [x] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [x] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed. (n/a: no migration)
- [x] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
