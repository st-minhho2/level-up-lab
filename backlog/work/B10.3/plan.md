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

Baseline: `pnpm exec vitest list` 360 tests; `pnpm test:e2e --list` 88 tests in 40 files. Red
(`test(todos): B10.3 … (red)`, no skeleton: the box has no `placeholder`, so AC-50.1, 50.3, 50.4, 50.5, 50.6 and the e2e
fail on the attribute reading null; AC-50.2 guards the accessible name and text and may already be green, named in the
commit body): `scripts/verify-red.sh B10.3` exit 0. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 360 → 366
(6 new `it`s), with `todo-search-form.test.tsx` (AC-16.5, 21.4, 25.2, 27.2, 38.3) and `todo-search-form-select.test.tsx`
(AC-46.3) green · `pnpm test:e2e` 88 → 89 (`e2e/50-search-hint.spec.ts`), with e2e 16, 21, 25, 27, 38, 46 green ·
mutation: CI only, no `src/lib` or `src/actions` change (B1.100) · `pnpm build` ok · `scripts/ci/check-features-map.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                            | Commit                          |
| ---- | --------------- | ----------------------------------- | ------------------------------- |
| 1    | none            | no skeleton (no new export)         | —                               |
| 2    | test-writer     | component + e2e files               | `test(todos): B10.3 … (red)`    |
| 3    | code-writer     | the `placeholder` attribute, header | `feat(todos): B10.3 …`          |
| 4    | code-writer     | F48 row ✅                          | `docs(map): F48 … [B10.3]`      |
| 5    | reviewer (diff) | `review.md` diff section            | `docs(backlog): B10.3 review …` |

Costs the lead takes: `spec/contracts/23-search-shortcut.md:26` ("The hint "press / to search" is not shown.")
contradicts REQ-50.1 and is not in §50's edit list; the advisor ruled §50 governs and the run must not edit §25 (D-45),
so the lead lands a `docs(spec)` fix to that line (advice.md, last block). jsdom has no `:placeholder-shown`, so
REQ-50.5 is proved only by AC-50.7 (analysis Q1). If `react-dom/server` fails under jsdom, AC-50.4 moves to a second
file with `// @vitest-environment node`, criterion unchanged (Q2; that file would be a Files change, re-planned).

Plan review: <pending> · Plan approved by: · Rounds: 1
