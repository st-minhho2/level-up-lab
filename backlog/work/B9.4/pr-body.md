<!-- Title: fix(todos): B9.4 a focus move during a pending add is kept -->

## Item

B9.4 — A focus move during a pending add is kept (spec §47)

- spec: §47 — unchanged in this branch (written before the label under D-44, #352)
- test: `src/components/todo-form-focus-pending.test.tsx::AC-47.1 … AC-47.4`, `e2e/47-new-todo-focus-pending.spec.ts::AC-47.5, AC-47.6` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-47.1 … AC-47.6

Repairs B9.1 (defect D1 of the first D-43 sweep); counts in E9's change failure rate (D-44).

Closes #353

## Plan

Copied from `backlog/work/B9.4/plan.md`.

Approach: A from `advice.md`: in `src/components/todo-form.tsx` only, the existing §44 layout effect (falling edge of
`pending` with `state?.ok === true`) reads `document.activeElement` once, at the commit that settles the result, and
calls `box.current?.focus()` only when it is the box, the "Add" button (a new `useRef<HTMLButtonElement>` on it),
`document.body` or `null` (REQ-47.1..47.3). B (`focusin` listener while pending) rejected: it judges at move time, so a
move undone during the save counts as a move (contradicts REQ-47.3, AC-47.4). No new export, so no skeleton (as B9.1).
No migration, dependency, env key or CI-protected path (no `config-change-approved`).

| File                                              | Change                                                                         | Why (AC-n) |
| ------------------------------------------------- | ------------------------------------------------------------------------------ | ---------- |
| `src/components/todo-form.tsx`                    | Change: `addButton` ref; activeElement check in the §44 effect; header §47     | 47.1–47.6  |
| `src/components/todo-form-focus-pending.test.tsx` | Add (red): AC-47.1 to AC-47.4, deferred `createTodoAction` via `vi.hoisted`    | 47.1–47.4  |
| `e2e/47-new-todo-focus-pending.spec.ts`           | Add (red): AC-47.5, AC-47.6, `page.route` holds the `next-action` POST 2000 ms | 47.5, 47.6 |
| `spec/features-map.md`                            | Add the F45 row (§47), ✅, in code-writer's `docs(map)` commit                 | map        |

```ts
// src/components/todo-form.tsx: signature and props unchanged (§47 Function contracts)
export function TodoForm(): ReactNode; // focus() of §44 only if document.activeElement ∈ {box, "Add", body, null}
```

Verification: `scripts/verify-red.sh B9.4` exit 0 · `pnpm test` 356 → 360 · `pnpm test:e2e` 86 → 88 · mutation: CI
only, no src/lib or src/actions change · `pnpm build` ok.

Plan review: approved, round 1 · Plan approved by: reviewer (D-27, tier medium, issue #353) · Rounds: 1

## Map delta

F45 · §47 · (new) → ✅ — `TodoForm` focuses the box only when `document.activeElement` is the box, "Add", body or
null at the settling commit, in `src/components/todo-form.tsx`; evidence: `pnpm test` → 360 passed, `pnpm test:e2e` →
88 passed (`docs(map)` 9c2f403).

## Review

`/review-loop`: passes 1/3, verdict ready for PR, 0 findings (plan review: approved round 1, 0 findings).

| Pass | #   | Finding | Source | Kind | Disposition | Justification |
| ---- | --- | ------- | ------ | ---- | ----------- | ------------- |
| 1    | —   | none    | —      | —    | —           | —             |

Commands (reviewer): lint exit 0 · typecheck exit 0 · `Tests 360 passed (360)` · `88 passed (2.4m)` ·
`mutation: CI only, no src/lib or src/actions change` · check-suppressions, check-config-change, check-feat-commits,
check-ac-coverage, check-spec-sections, check-features-map OK · `scripts/verify-red.sh B9.4`: red for the right reason
(3 new failed, 0 new passed; base 5a9123b).

Probes (one line reverted on a copy): dropping the "Add", body or box clause, or `ref={addButton}`, turns at least one
AC-44/AC-47 test red; dropping `active === null` leaves 43/43 green (equivalent mutant: a rendered document always has
a body; REQ-47.1 names `null`, so it stays). Commit shape: AC-47.3 (green on the old code by design) sits in its own
`test(todos): B9.4 pin …` commit (5a9123b) ahead of the red commit, as B9.2 did.

Riskiest unfalsified: AC-47.3(c) reaches `document.body` in jsdom only through a `document.activeElement` getter spy
(jsdom keeps the disabled "Add" focused); in a real browser the body branch is covered indirectly by AC-44.6/AC-47.5.

## Evidence

- AC met: 6/6
- tier: medium
- plan deviations: none
- trace: n/a

🤖 Generated with [Claude Code](https://claude.com/claude-code)
