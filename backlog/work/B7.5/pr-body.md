<!-- Title: feat(todos): B7.5 the new-todo counter warns near the limit -->

## Item

B7.5 — The new-todo counter warns near the limit (spec §39)

- spec: §39 — unchanged in this branch (written before the label under D-37)
- test: `src/lib/title-count.test.ts::AC-39.1`, `src/components/todo-form-warning.test.tsx::AC-39.2 … AC-39.6`, `e2e/39-title-counter-warning.spec.ts::AC-39.7` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-39.1 … AC-39.7

Closes #309

## Plan

### B7.5 plan — The new-todo counter warns near the limit (§39)

Approach: A from `advice.md`: `TITLE_WARNING_THRESHOLD` and `isTitleNearLimit` in `src/lib/title-count.ts`; one
conditional `<p id="new-todo-warning">` in `src/components/todo-form.tsx` driven by the existing `draft`, between the
counter and the §5 error. It is the contract's Function contracts block line for line; one draft, no hidden element.
No migration, dependency, env key or CI-protected path (no `config-change-approved`).
Deviations from `advice.md`: the e2e file takes the section number (`e2e/37-…` is §37's): `e2e/39-title-counter-warning.spec.ts`;
the component tests go in their own file (B7.3's pattern), so `todo-form.test.tsx` and its AC-18.n/29.n stay untouched.

#### Files

| File                                        | Change                                                                                     | Why (AC-39.n) |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------- |
| `src/lib/title-count.ts`                    | Change: `TITLE_WARNING_THRESHOLD = 180`, `isTitleNearLimit` (stub in skeleton, then real)  | 39.1          |
| `src/components/todo-form.tsx`              | Change: conditional warning `<p>` after the counter, before the §5 error; header names §39 | 39.2–39.7     |
| `src/lib/CLAUDE.md`                         | Change: `title-count.ts` row lists the two new exports and §39 (feat commit)               | docs          |
| `src/components/CLAUDE.md`                  | Change: `todo-form.tsx` line mentions the §39 warning (feat commit)                        | docs          |
| `src/lib/title-count.test.ts`               | Change (red): AC-39.1, all nine values, threshold < `TITLE_MAX_LENGTH`                     | 39.1          |
| `src/components/todo-form-warning.test.tsx` | Add (red): AC-39.2–39.6, `createTodoAction` mocked via `vi.hoisted`                        | 39.2–39.6     |
| `e2e/39-title-counter-warning.spec.ts`      | Add (red): AC-39.7                                                                         | 39.7          |
| `spec/features-map.md`                      | Add the F37 row (§39), ✅, in code-writer's `docs(map)` commit                             | map           |

Paperwork (exempt): §39 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/lib/title-count.ts (pure, no server-only)
export const TITLE_WARNING_THRESHOLD = 180;
export function isTitleNearLimit(value: string): boolean; // titleCharacterCount(value) >= TITLE_WARNING_THRESHOLD
// src/components/todo-form.tsx: TodoForm(): ReactNode unchanged; aria-describedby unchanged.
// No Server Action, Zod schema, Prisma model, query, env key or route.
```

#### Verification

Baseline `pnpm test` 298 passed (48 files). Red: `scripts/verify-red.sh B7.5` exit 0; AC-39.1 red on the stub's
`NotImplementedError`, AC-39.2–39.6 red on the missing `#new-todo-warning` (assertion); each AC is one `it` that first
asserts a present warning: AC-39.4 keeps (a) and (b) in one test, AC-39.5 first asserts exactly 1 `#new-todo-warning`
while the box holds `'x'` ×190, before Escape. `pnpm test:e2e e2e/39-title-counter-warning.spec.ts` → 1 red on the
warning locator. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 298 → 304 passed (49 files), AC-18.n,
AC-29.n, AC-5.7 green · `pnpm test:e2e` 70 → 71 tests, `e2e/18-title-counter` and `e2e/29-escape-new-todo` green ·
`scripts/mutation-gate.sh` → score ≥ 70 on `src/lib/title-count.ts` · `pnpm build` ok.

Plan review: approved, round 2 · Plan approved by: reviewer (D-27, tier medium, issue #309) · Rounds: 1

## Map delta

- `spec/features-map.md`: new row F37 · §39 · Near-limit warning on the new-todo counter · `src/lib/title-count.ts`,
  `src/components/todo-form.tsx` · `src/lib/title-count.test.ts`, `src/components/todo-form-warning.test.tsx`,
  `e2e/39-title-counter-warning.spec.ts` · ✅ (b1ced0e)
- `spec/technical-requirements.md`: §39 index row, ✗ until the closing PR

## Review

`backlog/work/B7.5/review.md`, diff review round 1: **Verdict: ready for PR**, 1 finding (non-blocking).

- Range: skeleton 9c87412, red eaa2ae9, feat c7ec922, map b1ced0e.
- Reviewer's gates: `pnpm test` 304 passed (49 files), `pnpm test:e2e` 71 passed, mutation 100.00 % on
  `src/lib/title-count.ts`, suppressions, config-change, feat-commits, ac-coverage, spec-sections, features-map all OK,
  `verify-red.sh B7.5` red for the right reason (6 of 6 new unit failed; e2e red run by test-writer).
- Finding 1 (coverage, out of scope): REQ-39.3's "before the §5 error" is pinned by no test (moving the warning below the
  error keeps 34 of 34 form tests green). The code is correct; the gap is AC-39.4 (b)'s wording, a spec edit for the lead.
- Riskiest unfalsified: no test reads the server HTML before hydration (REQ-39.2); by trace `draft` starts `''`.

Dev-lead's green gate: `pnpm lint` 0 errors (1 existing `react-hooks/exhaustive-deps` warning on the §18 layout effect),
`pnpm typecheck` clean, `pnpm test` 304 passed, `pnpm test:e2e` 71 passed; no test file changed after red; branch
contains origin/main, `check-spec-sections.sh` OK.

## Evidence

- AC met: AC-39.1 … AC-39.7 (7 of 7; 6 unit, 1 e2e)
- tier: medium
- mutation: 100.00 % on src/lib/title-count.ts (`scripts/mutation-gate.sh`)
- plan deviations: none (`docs/metrics.md` row is listed paperwork; it landed in the feat commit)
- trace: n/a

🤖 Generated with [Claude Code](https://claude.com/claude-code)
