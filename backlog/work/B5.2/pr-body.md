<!-- Title: feat(todos): B5.2 Escape cancels a title edit -->

## Item

B5.2 — Escape cancels a title edit (spec §24)

- spec: §24 — unchanged (written in this branch from `work/B5.2/analysis.md`, D-30)
- test: `src/components/todo-item.test.tsx::AC-24.1 … AC-24.5`, `e2e/24-escape-edit-title.spec.ts::AC-24.6` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-24.1 … AC-24.6

Closes #207

## Plan

### B5.2 plan — Escape cancels a title edit (§24)

Approach: A from `advice.md` — an `onKeyDown` handler on the title `<input>` in `TodoItem`: on `Escape` and
`!pending` it calls `setEditing(false)`, `setDraft(todo.title)`, `setError(undefined)`; every other key falls through
(REQ-24.6), no `preventDefault`. One file of `src/`, the one D-30 assigns. The guard reuses the shared `pending`
from `useTransition`, so Escape is also ignored during an in-flight toggle (advice: spec silent, superset keeps every
AC true; no second flag). Analysis Q1–Q4 as proposed: ignored while pending, focus restore out of scope, only the
title field cancels, blur stays out of scope. No migration, no dependency, no env key, no CI-protected path (no
`config-change-approved`). No skeleton step: §24 adds no export, so the red is behavioral (field still present).

#### Files

| File                                | Change                                                                        | Why (AC-24.n) |
| ----------------------------------- | ----------------------------------------------------------------------------- | ------------- |
| `src/components/todo-item.tsx`      | Add the Escape `onKeyDown` handler on the title field; header names §24       | 24.1–24.6     |
| `src/components/todo-item.test.tsx` | Add (red): AC-24.1–24.3; AC-24.4, AC-24.5 pinned green first (hold today)     | 24.1–24.5     |
| `e2e/24-escape-edit-title.spec.ts`  | Add (red): AC-24.6, POSTs counted from after the field opens until the reload | 24.6          |
| `spec/features-map.md`              | Add the F22 row (§24): code-writer's feat (✗), ✅ in `docs(map)`              | map           |

Paperwork (exempt): §24 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/components/todo-item.tsx (§7, §6, §10, §19, §20, §24): props unchanged
export function TodoItem({ todo }: { readonly todo: Todo }): ReactNode;
// internal: function onTitleKeyDown(event: KeyboardEvent<HTMLInputElement>): void — Escape && !pending → leave edit,
// draft := todo.title, error := undefined. No new export, Server Action, Zod schema, Prisma model, query or prop.
```

#### Verification

Pin (`test(todos): B5.2 pin AC-24.4, AC-24.5 …`): both green on today's code, 202 → 204. Red (`test(todos): B5.2 … (red)`):
`scripts/verify-red.sh B5.2` exit 0; AC-24.1–24.3 fail on assertions (field still present / alert still shown);
`pnpm test:e2e e2e/24-escape-edit-title.spec.ts` → AC-24.6 failed, recorded in the body. Green:
`pnpm lint && pnpm typecheck` clean · `pnpm test` 202 → 207 passed, the 11 existing `todo-item.test.tsx` tests
unchanged and green · `pnpm test:e2e` 43 → 44 passed (`e2e/06-edit-title.spec.ts` unchanged) · `pnpm test:mutation`
≥ 70 (scope `src/lib` + `src/actions`, untouched by this card) · `pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK.
Counts are the test-writer's target; a different count is stated in the red commit.

#### Work breakdown

| Step | Role / skill    | Produces                                       | Commit                            |
| ---- | --------------- | ---------------------------------------------- | --------------------------------- |
| 1    | test-writer     | AC-24.4, AC-24.5 in `todo-item.test.tsx`       | `test(todos): B5.2 pin AC-24.4 …` |
| 2    | test-writer     | AC-24.1–24.3 + `e2e/24-escape-edit-title`, red | `test(todos): B5.2 … (red)`       |
| 3    | code-writer     | `todo-item.tsx`, F22 row ✗                     | `feat(todos): B5.2 …`             |
| 4    | dev-lead        | F22 ✅                                         | `docs(map): F22 … [B5.2]`         |
| 5    | reviewer (diff) | `review.md` diff section                       | `docs(backlog): B5.2 review …`    |

Plan review: approved, round 2 · Plan approved by: reviewer (D-27, tier medium, issue #207) · Rounds: 1

## Map delta

pending

## Review

pending

## Evidence

- AC met: pending/6
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
