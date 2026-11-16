<!-- Title: feat(todos): B8.1 opening the title editor selects the whole title -->

## Item

B8.1 — Opening the title editor selects the whole title (spec §41)

- spec: §41 — unchanged in this branch (written before the label under D-39)
- test: `src/components/todo-item-select.test.tsx::AC-41.1 … AC-41.5`, `e2e/41-edit-title-select.spec.ts::AC-41.6` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-41.1 … AC-41.6

Closes #316

## Plan

### B8.1 plan — Opening the title editor selects the whole title (§41)

Approach: A from `advice.md`: in `src/components/todo-item.tsx` only, a `useRef<HTMLInputElement>` on the title
`<input>` and one `useEffect` keyed on `[editing]` that, when `editing` is true, calls `focus()` then `select()`. The
dependency list is the spec's single trigger (REQ-41.4); `todo`, `draft`, `error`, `pending` never re-run it (REQ-41.3).
No new export, so no skeleton (as B7.3, B7.6). No migration, dependency, env key or CI-protected path (no
`config-change-approved`). The e2e file takes the section number: `e2e/41-…`.

#### Files

| File                                       | Change                                                                       | Why (AC-n) |
| ------------------------------------------ | ---------------------------------------------------------------------------- | ---------- |
| `src/components/todo-item.tsx`             | Change: ref on the title `<input>`, `useEffect([editing])`; header names §41 | 41.1–41.5  |
| `src/components/todo-item-select.test.tsx` | Add: AC-41.4 pinned green first, then AC-41.1–41.3, 41.5 (red); `vi.hoisted` | 41.1–41.5  |
| `e2e/41-edit-title-select.spec.ts`         | Add (red): AC-41.6, seed [B `Buy mik`, A `Walk the dog`], POST count         | 41.6       |
| `spec/features-map.md`                     | Add the F39 row (§41), ✅, in code-writer's `docs(map)` commit               | map        |

Paperwork (exempt): §41 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/components/todo-item.tsx: signature and props unchanged (§41 Function contracts)
export function TodoItem({ todo }: { readonly todo: Todo }): ReactNode;
// internal only: const fieldRef = useRef<HTMLInputElement>(null)   → ref={fieldRef} on the "Edit title" <input>
// internal only: useEffect(() => { if (editing) { fieldRef.current?.focus(); fieldRef.current?.select(); } }, [editing])
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route.
```

#### Verification

Baseline: `pnpm test` 323 passed (50 files); `pnpm test:e2e` 33 spec files. Rows: AC-41.1 1, AC-41.2 1, AC-41.3 2
(`it.each` (a) Escape, (b) save), AC-41.4 2 (`it.each` (a) rejected, (b) `saveFailed()`), AC-41.5 1 = 7.
Pin (`test(todos): B8.1 pin AC-41.4 …`, new file): AC-41.4 (a), (b) hold on today's code (it never moves focus or
selection) and each asserts its own Then: 323 → 325 passed (51 files). Red (`test(todos): B8.1 … (red)`, no skeleton):
`scripts/verify-red.sh B8.1` exit 0; 5 new rows fail on assertions, never an import: AC-41.1, AC-41.2, AC-41.3 (a),
(b) on `document.activeElement` (body, not the field); AC-41.5 reaches its Given only by the click on "Edit title"
(no test-set focus or selection) and types with `user.keyboard`, so it fails on the value (`Buy mik`, not `Z`). 325
passed, 5 failed. `pnpm test:e2e e2e/41-edit-title-select.spec.ts` → AC-41.6 fails on the active element after the
click (body, not the row's field), recorded in the body. A different count is stated in the red commit.
Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 325 → 330 passed (51 files), every AC-6.n, AC-10.n, AC-24.n,
AC-25.n in `todo-item*.test.tsx` green · `pnpm test:e2e` 33 → 34 files green, `e2e/06-*`, `e2e/24-*` green ·
mutation: CI only, no src/lib or src/actions change (B1.100; ≥ 70 holds) · `pnpm build` ok ·
`scripts/ci/check-features-map.sh`, `scripts/ci/check-plan-scope.sh` OK.

#### Work breakdown

| Step | Role / skill    | Produces                                | Commit                            |
| ---- | --------------- | --------------------------------------- | --------------------------------- |
| 1    | none            | no skeleton (no new function or export) | —                                 |
| 2a   | test-writer     | AC-41.4 (a), (b), green on today's code | `test(todos): B8.1 pin AC-41.4 …` |
| 2b   | test-writer     | AC-41.1–41.3, 41.5, e2e AC-41.6         | `test(todos): B8.1 … (red)`       |
| 3    | code-writer     | ref + `useEffect([editing])`            | `feat(todos): B8.1 …`             |
| 4    | code-writer     | F39 row ✅                              | `docs(map): F39 … [B8.1]`         |
| 5    | reviewer (diff) | `review.md` diff section                | `docs(backlog): B8.1 review …`    |

Costs the lead takes: a post-paint effect, so one frame shows the field unfocused (advice A cons). React dev Strict
Mode runs the effect twice at the switch, before any typing: harmless. `src/components` is outside mutation scope, so
the `[editing]` list and the `if (editing)` guard are guarded by AC-41.3–41.5 only. The spec's "Lead approves spec"
box stays unticked: the issue's `agent-ready` label is the spec approval (D-27), as for §38–§40.

Plan review: approved, round 2 (round 1: 2 reasons, pin commit, exact counts, applied 1bf47cf) · Plan approved by: reviewer (D-27, tier medium, issue #316) · Rounds: 1

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
