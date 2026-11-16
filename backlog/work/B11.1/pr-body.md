<!-- Title: feat(todos): B11.1 Escape in the due-date editor puts focus on "Edit due date" -->

## Item

B11.1 — Escape in the due-date editor puts focus on "Edit due date" (spec §51)

- spec: §51 — unchanged in this branch (written before the label under D-45)
- test: `src/components/todo-due-date-escape-focus.test.tsx::AC-51.1 … AC-51.6`, `e2e/51-escape-due-date-focus.spec.ts::AC-51.7` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-51.1 … AC-51.7

Closes #362

## Plan

Copied from `backlog/work/B11.1/plan.md`.

Approach: A from `advice.md`: in `src/components/todo-due-date.tsx` only, a one-shot `escapedRef` set by the Escape
branch of `onDueDateKeyDown` (after the `modified || pending` guard) and an `editButtonRef` on "Edit due date"; the
`[editing]` effect keeps §45's entry focus and, when `!editing` and the marker is set, clears it and calls `focus()` on
the button (REQ-51.1, 51.5). `save`, `onSave`, `onClear` never touch the marker (REQ-51.3). No new export, so no
skeleton. No migration, dependency, env key or CI-protected path (no `config-change-approved`).

| File                                                 | Change                                                                                     | Why (AC-n)          |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------- |
| `src/components/todo-due-date.tsx`                   | Change: Escape marker ref, "Edit due date" button ref, effect consumes; §51 in the header  | 51.1–51.7           |
| `src/components/todo-due-date-escape-focus.test.tsx` | Add: AC-51.1 to AC-51.6, action mocked via `vi.hoisted`, focus spy read by `mock.contexts` | 51.1–51.6           |
| `src/components/todo-due-date-focus.test.tsx`        | Change (red commit): `:86`, `:133` `document.body` → the button; titles `:79`, `:110`      | AC-45.3(a), AC-45.5 |
| `e2e/51-escape-due-date-focus.spec.ts`               | Add (red): AC-51.7, `page.evaluate` for activeElement, POST counter                        | 51.7                |
| `spec/features-map.md`                               | Add the F49 row (§51), ✅, in code-writer's `docs(map)` commit                             | map                 |

```ts
// src/components/todo-due-date.tsx: signature and props unchanged (§51 Function contracts)
export function TodoDueDate({
  todoId,
  dueDate,
}: {
  readonly todoId: string;
  readonly dueDate: string | undefined;
}): ReactNode;
```

Verification: pin commit AC-51.3–51.5 (381 → 385, green) · `scripts/verify-red.sh B11.1` exit 0 · `pnpm test` 385 →
389 · `pnpm test:e2e` 90 → 91 · mutation: CI only, no src/lib or src/actions change · `pnpm build` ok.

Plan review: approved, round 1 · Plan approved by: reviewer (D-27, tier medium, issue #362) · Rounds: 1

## Map delta

F49 · §51 · (new) → ✅ — `TodoDueDate` focuses "Edit due date" once after an Escape that leaves edit mode (one-shot
`escapedRef` consumed in the `[editing]` effect), in `src/components/todo-due-date.tsx`; evidence: `pnpm test` → 391
passed, `pnpm test:e2e` → 91 passed (`docs(map)` 025490c).

## Review

`/review-loop`: passes 2/3, verdict ready for PR (plan review: approved round 1, 0 findings).

| Pass | #   | Finding                                                                                                    | Source   | Kind     | Disposition | Justification                                                                                                                             |
| ---- | --- | ---------------------------------------------------------------------------------------------------------- | -------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | deleting the one-shot reset `escapedRef.current = false` (`todo-due-date.tsx:74`) failed no test (389/389) | reviewer | coverage | fix now     | afe12a2 `test(todos): B11.1 review pass 1 -- …`: `AC-51.3` `it.each` (a) save, (b) clear after an earlier Escape; both fail on the mutant |
| 2    | —   | none                                                                                                       | —        | —        | —           | —                                                                                                                                         |

Commands (reviewer, pass 2): lint clean · typecheck clean · `Tests 391 passed (391)` · `91 passed (2.8m)` ·
`mutation: CI only, no src/lib or src/actions change` · check-suppressions, check-config-change, check-feat-commits,
check-ac-coverage, check-spec-sections, check-features-map OK · `scripts/verify-red.sh B11.1`: red for the right reason
(6 new failed, 0 new passed; base 218f7b0, the pin commit).

Probes (one line changed on a copy): reset deleted → the two pass-1 rows fail ("expected 1 to be +0"); `if (true)` for
the marker check → 6 tests fail; marker set before the pending guard → AC-51.3 fails.

Riskiest unfalsified: AC-51.7 relies on Playwright's Enter on the focused "Edit due date" reaching React's click handler
in dev mode; passed in two full runs (2.0 s, 1.4 s), not run with `--repeat-each`.

## Evidence

- AC met: 7/7
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
