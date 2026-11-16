# B10.3 plan — The search box shows "Press / to search" (§50)

Approach: A from `advice.md`: one literal `placeholder="Press / to search"` on the `<input type="search" name="q">` in
`src/components/todo-search-form.tsx` (header gains §50); no constant, export, state, effect or prop (§50 Function
contracts). B (a `src/lib` constant) rejected: §50 forbids a new export or lib function. No new export, so no skeleton
(as B9.4). No migration, dependency, env key or CI-protected path (no `config-change-approved`).

## Files

| File                                            | Change                                                                        | Why (AC-n) |
| ----------------------------------------------- | ----------------------------------------------------------------------------- | ---------- |
| `src/components/todo-search-form.tsx`           | Change: `placeholder="Press / to search"` on the box; header names §50        | 50.1–50.7  |
| `src/components/todo-search-form-hint.test.tsx` | Add (red): AC-50.1 to AC-50.6, nothing mocked; AC-50.4 `renderToStaticMarkup` | 50.1–50.6  |
| `e2e/50-search-hint.spec.ts`                    | Add (red): AC-50.7, second context `javaScriptEnabled: false`                 | 50.7       |
| `spec/features-map.md`                          | Add the F48 row (§50), ✅, in code-writer's `docs(map)` commit                | map        |

Paperwork (exempt): §50 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/todo-search-form.tsx: signature and props unchanged (§50 Function contracts)
export function TodoSearchForm({
  filter,
  query,
  count,
}: {
  readonly filter: TodoFilter;
  readonly query: string;
  readonly count?: number;
}): ReactNode;
// <input ... placeholder="Press / to search" />, a literal in the server-rendered markup; no Server Action, Zod
// schema, Prisma model, query, env key, prop, export or route; page.tsx and src/lib untouched.
```

## Verification

Baseline: `pnpm exec vitest list` 360 tests; `pnpm test:e2e --list` 88 tests in 40 files. Pin (B4.3, B9.4 way):
AC-50.2 guards the accessible name and text, green before the change (reviewer's probe), so it lands alone in
`test(todos): B10.3 pin AC-50.2 …` (no `(red)`), `pnpm test` 360 → 361 green. Red (`test(todos): B10.3 … (red)`, no
skeleton: the box has no `placeholder`, so AC-50.1, 50.3, 50.4, 50.5, 50.6 and the e2e fail on the attribute reading
null): `scripts/verify-red.sh B10.3` exit 0, 5 new failing. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test`
361 → 366 (6 new `it`s in total), with `todo-search-form.test.tsx` (AC-16.5, 21.4, 25.2, 27.2, 38.3) and `todo-search-form-select.test.tsx`
(AC-46.3) green · `pnpm test:e2e` 88 → 89 (`e2e/50-search-hint.spec.ts`), with e2e 16, 21, 25, 27, 38, 46 green ·
mutation: CI only, no `src/lib` or `src/actions` change (B1.100) · `pnpm build` ok · `scripts/ci/check-features-map.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                            | Commit                             |
| ---- | --------------- | ----------------------------------- | ---------------------------------- |
| 1    | none            | no skeleton (no new export)         | —                                  |
| 2a   | test-writer     | AC-50.2 alone, green                | `test(todos): B10.3 pin AC-50.2 …` |
| 2b   | test-writer     | AC-50.1, 50.3–50.6 + e2e file       | `test(todos): B10.3 … (red)`       |
| 3    | code-writer     | the `placeholder` attribute, header | `feat(todos): B10.3 …`             |
| 4    | code-writer     | F48 row ✅                          | `docs(map): F48 … [B10.3]`         |
| 5    | reviewer (diff) | `review.md` diff section            | `docs(backlog): B10.3 review …`    |

Costs the lead takes: `spec/contracts/23-search-shortcut.md:26` ("The hint "press / to search" is not shown.")
contradicts REQ-50.1 and is not in §50's edit list; the advisor ruled §50 governs and the run must not edit §25 (D-45),
so the lead lands a `docs(spec)` fix to that line (advice.md, last block). The build does not wait for it (advice
verdict: "It does not stop the build"; no test asserts the line); the run cannot land it (D-45), so it stays on the
PR's "Waiting on you" list, to land before or with the closing PR. jsdom has no `:placeholder-shown`, so REQ-50.5 is
proved only by AC-50.7 (analysis Q1). AC-50.4 stays in the one jsdom file (`renderToStaticMarkup` loads there,
reviewer's probe).

Plan review: approved, round 2 · Plan approved by: reviewer (D-27, tier medium, issue #358) · Rounds: 1
