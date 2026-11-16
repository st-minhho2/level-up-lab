<!-- Title: feat(todos): B11.3 a failed delete's message describes "Delete todo" -->

## Item

B11.3 — A failed delete's message describes "Delete todo" (spec §53)

- spec: §53 — unchanged in this branch (written before the label under D-45, #355)
- test: `src/components/delete-todo-button-description.test.tsx::AC-53.1 … AC-53.6` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-53.1 … AC-53.6

Closes #364

## Plan

Copied from `backlog/work/B11.3/plan.md`.

Approach: A from `advice.md`: in `src/components/delete-todo-button.tsx` only, `const messageId = useId()`; the
failure `role="alert"` element gets `id={messageId}`, the `<button>` gets
`aria-describedby={error !== undefined ? messageId : undefined}` (the §53 Function contracts line, word for word; same
pattern as `clear-completed-button.tsx`, §49). B (id from the todo id) rejected: REQ-53.2 forbids it. No new export, so
no skeleton (as B10.2). No e2e criterion (§53 "How the criteria observe it"). No migration, dependency, env key or
CI-protected path (no `config-change-approved`). Spec box: the `agent-ready` label is the spec approval (D-27).

| File                                                     | Change                                                                       | Why (AC-n) |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------- |
| `src/components/delete-todo-button.tsx`                  | Change: `useId`; `id` on the alert; `aria-describedby` on the button; §53    | 53.1–53.6  |
| `src/components/delete-todo-button-description.test.tsx` | Add (red): AC-53.1–53.6; `vi.hoisted` action mocks; `window.confirm` stubbed | 53.1–53.6  |
| `spec/features-map.md`                                   | Add the F51 row (§53), ✅, in code-writer's `docs(map)` commit               | map        |

```ts
// src/components/delete-todo-button.tsx: signature and props unchanged (§53 Function contracts)
export function DeleteTodoButton({ todoId }: { readonly todoId: string }): ReactNode;
// + useId(); <… role="alert" id={messageId}>; <button aria-describedby={error !== undefined ? messageId : undefined}>
```

Verification: `scripts/verify-red.sh B11.3` exit 0 · `pnpm test` 381 → 387 · `pnpm test:e2e` 90 → 90 · mutation: CI
only, no src/lib or src/actions change · `pnpm build` ok.

Plan review: approved, round 1 · Plan approved by: reviewer (D-27, tier medium, issue #364) · Rounds: 1

## Map delta

F51 · §53 · (new) → ✅ — `DeleteTodoButton` gives the failure alert a `useId` id and points the button's
`aria-describedby` at it while the message shows, in `src/components/delete-todo-button.tsx`; evidence: `pnpm test` →
387 passed, `pnpm test:e2e` → 90 passed (`docs(map)` 48bb0ad).

## Review

`/review-loop`: passes 1/3, verdict ready for PR, 0 findings (plan review: approved round 1).

| Pass | #   | Finding | Source | Kind | Disposition | Justification |
| ---- | --- | ------- | ------ | ---- | ----------- | ------------- |
| 1    | —   | none    | —      | —    | —           | —             |

Commands (reviewer, at 48bb0ad): lint exit 0 · typecheck exit 0 · `Tests 387 passed (387)` · `90 passed (4.3m)` ·
`mutation: CI only, no src/lib or src/actions change` · check-suppressions, check-config-change, check-feat-commits,
check-ac-coverage, check-spec-sections, check-features-map OK · `scripts/verify-red.sh B11.3`: red for the right reason
(6 new failed, 0 new passed; base c81df92). `pnpm build` exit 0 (dev-lead).

Probes (one line changed on a copy): `aria-describedby` removed → 6/6 fail; `aria-describedby` set unconditionally →
AC-53.1, AC-53.2 fail; id built as `todo-${todoId}-error` → AC-53.5, AC-53.6 fail.

Riskiest unfalsified: REQ-53.2's "independent of the todo's id": AC-53.5 compares the id only with the four named
§10/§15 ids and the other button's id, so an id such as `delete-${todoId}-error` would pass all six criteria. The
shipped `useId()` meets the requirement; closing the gap needs a §53 criterion change (§8), not a test here.

Note: the dev-lead's first green-gate `pnpm test` run had 1 failure in the untouched
`src/components/todo-form-warning.test.tsx` (AC-39.4, §39). The file then passed 3/3 alone and the suite passed 2/2
(387/387), so it looks like a timing flake under load.

## Evidence

- AC met: 6/6
- tier: medium
- plan deviations: none
- trace: n/a

🤖 Generated with [Claude Code](https://claude.com/claude-code)
