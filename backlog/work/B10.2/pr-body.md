<!-- Title: feat(todos): B10.2 a failed clear's message describes "Clear completed" -->

## Item

B10.2 — A failed clear's message describes "Clear completed" (spec §49)

- spec: §49 — unchanged in this branch (written before the label under D-45, #355)
- test: `src/components/clear-completed-button-description.test.tsx::AC-49.1 … AC-49.6` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-49.1 … AC-49.6

Closes #357

## Plan

Copied from `backlog/work/B10.2/plan.md`.

Approach: A from `advice.md`: in `src/components/clear-completed-button.tsx` only, `const messageId = useId()`; the
failure `<p role="alert">` gets `id={messageId}`, the `<button>` gets
`aria-describedby={error !== undefined ? messageId : undefined}` (the §49 Function contracts line, word for word;
same pattern as `todo-item.tsx`). B (fixed id) rejected: two instances would share it (REQ-49.5, AC-49.6). No new
export, so no skeleton (as B9.4). No e2e criterion (§49 "How the criteria observe it"). No migration, dependency, env
key or CI-protected path (no `config-change-approved`). Spec box: the `agent-ready` label is the spec approval (D-27).

| File                                                         | Change                                                                     | Why (AC-n) |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- | ---------- |
| `src/components/clear-completed-button.tsx`                  | Change: `useId`; `id` on the alert; `aria-describedby` on the button; §49  | 49.1–49.6  |
| `src/components/clear-completed-button-description.test.tsx` | Add: pin AC-49.2, 49.5; then (red) AC-49.1, 49.3, 49.4, 49.6; `vi.hoisted` | 49.1–49.6  |
| `spec/features-map.md`                                       | Add the F47 row (§49), ✅, in code-writer's `docs(map)` commit             | map        |

```ts
// src/components/clear-completed-button.tsx: signature and props unchanged (§49 Function contracts)
export function ClearCompletedButton({
  disabled,
  completedCount,
}: {
  readonly disabled: boolean;
  readonly completedCount?: number;
}): ReactNode; // + useId(); <p role="alert" id={messageId}>; <button aria-describedby={error !== undefined ? messageId : undefined}>
```

Verification: pin commit (AC-49.2, 49.5 green at base) · `scripts/verify-red.sh B10.2` exit 0 · `pnpm test` 360 → 366
· `pnpm test:e2e` 88 → 88 · mutation: CI only, no src/lib or src/actions change · `pnpm build` ok.

Plan review: approved, round 2 · Plan approved by: reviewer (D-27, tier medium, issue #357) · Rounds: 1

## Map delta

F47 · §49 · (new) → ✅ — `ClearCompletedButton` gives the failure alert a `useId` id and points the button's
`aria-describedby` at it while the message shows, in `src/components/clear-completed-button.tsx`; evidence: `pnpm test`
→ 366 passed, `pnpm test:e2e` → 88 passed (`docs(map)` 1780b7e).

## Review

`/review-loop`: passes 1/3, verdict ready for PR, 2 findings (coverage gaps in the §49 criteria, not code defects;
plan review: approved round 2 after 2 changes requested in round 1).

| Pass | #   | Finding                                                                                                          | Source   | Kind     | Disposition  | Justification                                                                                                                                                |
| ---- | --- | ---------------------------------------------------------------------------------------------------------------- | -------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | 1   | No test tells `useId()` from a fixed id (REQ-49.5): AC-49.6 clicks one button only, so "ids distinct" is vacuous | reviewer | coverage | out of scope | The code uses `useId()` as REQ-49.5 says; a test would assert beyond AC-49.6's Then. Follow-up: a §49 criterion change for the lead (`/spec-trace`)          |
| 1    | 2   | No test reads the button during the first pending (REQ-49.2): `pending \|\| error !== undefined` survives 14/14  | reviewer | coverage | out of scope | `error` starts `undefined` and is set only from a result, so the code meets REQ-49.2; a test would assert beyond AC-49.5's Then. Same follow-up as finding 1 |

Commands (reviewer): lint exit 0 · typecheck exit 0 · `Tests 366 passed (366)` · `88 passed (4.7m)` ·
`mutation: CI only, no src/lib or src/actions change` · check-suppressions, check-config-change, check-feat-commits,
check-ac-coverage, check-spec-sections, check-features-map OK · `scripts/verify-red.sh B10.2`: red for the right reason
(4 new failed, 0 new passed; base 3e05a63).

Probes (one line changed on a copy): an always-set `aria-describedby` → 5 tests fail; the alert's `id` dropped → 4
fail. Commit shape: AC-49.2 and AC-49.5 (green on the old code by design) sit in their own `test(todos): B10.2 pin …`
commit (3e05a63) ahead of the red commit, as the plan says.

Riskiest unfalsified: REQ-49.3's "same commit" removal of the alert and the attribute; both derive from the one `error`
state, but no test reads a frame between them.

## Evidence

- AC met: 6/6
- tier: medium
- plan deviations: none
- trace: n/a

🤖 Generated with [Claude Code](https://claude.com/claude-code)
