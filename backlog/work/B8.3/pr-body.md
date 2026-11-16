<!-- Title: feat(todos): B8.3 "Mark all complete" is hidden when there is nothing to mark -->

## Item

B8.3 — "Mark all complete" is hidden when there is nothing to mark (spec §43)

- spec: §43 — unchanged in this branch (written before the label under D-39)
- test: `src/components/complete-all-button-hidden.test.tsx::AC-43.1 … AC-43.4`, `e2e/43-complete-all-hidden.spec.ts::AC-43.5 … AC-43.7`, AC-14.4 (a), AC-14.6, AC-36.3, AC-36.6, AC-36.7 rewritten (D-39) — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-43.1 … AC-43.7

Closes #318

## Plan

### B8.3 plan — "Mark all complete" is hidden when there is nothing to mark (§43)

Approach: A from `advice.md`: in `src/components/complete-all-button.tsx` only, the exported `CompleteAllButton` (same
name, props, export) returns `null` when `disabled` is true, else renders a private, unexported `CompleteAllButtonShown`
that holds today's transition, error state and markup with `disabled={pending}`. Unmounting drops the failure message,
so it cannot return on re-show (REQ-43.4), with no effect, ref, timer or `focus()` (REQ-43.5). B rejected: a failure
arriving while hidden would bring the message back. No new export, so no skeleton (as B7.6). No migration, dependency,
env key or CI-protected path (no `config-change-approved`). §14, §36 and §22 edits already landed on main (D-39).

#### Files

| File                                                 | Change                                                                                 | Why (AC-n) |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| `src/components/complete-all-button.tsx`             | Change: `null` when `disabled`; private `CompleteAllButtonShown`; header names §43     | 43.1–43.7  |
| `src/components/complete-all-button-hidden.test.tsx` | Add (red): AC-43.1 (a, b) to AC-43.4, `completeAllTodosAction` mocked via `vi.hoisted` | 43.1–43.4  |
| `e2e/43-complete-all-hidden.spec.ts`                 | Add (red): AC-43.5 to AC-43.7                                                          | 43.5–43.7  |
| `src/components/complete-all-button.test.tsx`        | Change (red commit): AC-14.4 (a) rewritten, title verbatim from §43                    | 14.4       |
| `src/components/complete-all-button-count.test.tsx`  | Change (red commit): AC-36.3 rewritten, title verbatim from §43                        | 36.3       |
| `e2e/14-complete-all.spec.ts`                        | Change (red commit): AC-14.6 (a), (b) rewritten, titles verbatim from §43              | 14.6       |
| `e2e/36-complete-all-count.spec.ts`                  | Change (red commit): AC-36.6, AC-36.7 rewritten, titles verbatim from §43              | 36.6, 36.7 |
| `spec/features-map.md`                               | Add the F41 row (§43), ✅, in code-writer's `docs(map)` commit                         | map        |

Paperwork (exempt): §43 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row. Not in scope:
`src/components/CLAUDE.md` (advice lists it as optional; §43 names one `src/` file).

#### Interfaces touched

```ts
// src/components/complete-all-button.tsx: signature and props unchanged (§43 Function contracts)
export function CompleteAllButton({
  disabled,
  count,
}: {
  readonly disabled: boolean;
  readonly count?: number;
}): ReactNode; // null when disabled
// internal only: function CompleteAllButtonShown({ count }: { readonly count?: number }): ReactNode
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route; page.tsx untouched (D-39).
```

#### Verification

Baseline: `pnpm test` 323 passed (50 files); `pnpm test:e2e --list` 75 tests in 33 files. Red: `scripts/verify-red.sh B8.3`
exit 0. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 323 → 327 passed (50 → 51 files) · `pnpm test:e2e`
75 → 78 passed (33 → 34 files) · mutation: CI only, no `src/lib` or `src/actions` change (B1.100) · `pnpm build` ok ·
`scripts/ci/check-features-map.sh`, `scripts/ci/check-plan-scope.sh` OK.

#### Work breakdown

| Step | Role / skill    | Produces                                            | Commit                         |
| ---- | --------------- | --------------------------------------------------- | ------------------------------ |
| 1    | none            | no skeleton (no new export)                         | —                              |
| 2    | test-writer     | new unit + e2e files, four rewrites with §43 titles | `test(todos): B8.3 … (red)`    |
| 3    | code-writer     | `null` guard, `CompleteAllButtonShown`              | `feat(todos): B8.3 …`          |
| 4    | code-writer     | F41 row ✅                                          | `docs(map): F41 … [B8.3]`      |
| 5    | reviewer (diff) | `review.md` diff section                            | `docs(backlog): B8.3 review …` |

Costs the lead takes: after a successful mark-all, focus falls to `body` (REQ-43.5, not managed); two functions in one
file (one exported). Six existing tests change, in the red commit only (D-39).

Plan review: approved, round 2 · Plan approved by: reviewer (D-27, tier medium, issue #318) · Rounds: 1

## Map delta

pending

## Review

pending

## Evidence

- AC met: pending
- tier: medium
- plan deviations: pending
- trace: pending

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
