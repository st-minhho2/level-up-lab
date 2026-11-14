<!-- Title: feat(todos): B7.4 the search form says how many todos match -->

## Item

B7.4 — The search form says how many todos match (spec §38)

- spec: §38 — unchanged in this branch (written before the label under D-37, 80c8129; §16's Out of scope lift and `TodoSearchForm` contract edited there)
- test: `src/components/todo-search-form.test.tsx::AC-38.1 … AC-38.4`, `e2e/38-search-count.spec.ts::AC-38.5 … AC-38.7` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-38.1 … AC-38.7

Closes #308

## Plan

### B7.4 plan — The search form says how many todos match (§38)

Approach: A from `advice.md` — `TodoSearchForm` gains the optional `count` prop and decides inline (as the form's last
child, `<p>` "1 match" / "n matches" when `isSearchInEffect(query)`, `Number.isInteger(count)`, `count >= 1`);
`page.tsx` always passes `count={shown.length}`. B rejected: AC-38.3 renders (query `''`, count 3) and wants no `p`.
No migration, dependency, env key, `src/lib` or `src/actions` change, no CI-protected path (no `config-change-approved`).
§16 edits landed under D-37 in 80c8129; the §38 approval box stays for the lead (D-27: the issue label is the spec
approval, as §35–§37). The stale `src/components/CLAUDE.md` line (advice, P1 doc drift) is out of this card.

#### Files

| File                                       | Change                                                                                                 | Why (AC-38.n) |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------- |
| `src/components/todo-search-form.tsx`      | Change: skeleton adds the ignored `count?: number`; green renders the `<p>` last; header names §38     | 38.1–38.4     |
| `src/app/page.tsx`                         | Change: `<TodoSearchForm … count={shown.length} />`; header names §38                                  | 38.5–38.7     |
| `src/components/todo-search-form.test.tsx` | Change: pin AC-38.3, AC-38.4 (green on the skeleton); red AC-38.1, AC-38.2 (titles verbatim from card) | 38.1–38.4     |
| `e2e/38-search-count.spec.ts`              | Add: pin AC-38.7; red AC-38.5, AC-38.6                                                                 | 38.5–38.7     |
| `spec/features-map.md`                     | Add the F36 row (§38), ✅, in code-writer's `docs(map)` commit                                         | map           |

Paperwork (exempt): §38 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/components/todo-search-form.tsx ('use client'): one optional prop added (§38 Function contracts)
export function TodoSearchForm({
  filter,
  query,
  count,
}: {
  readonly filter: TodoFilter;
  readonly query: string;
  readonly count?: number;
}): ReactNode; // <p>{count === 1 ? '1 match' : `${count} matches`}</p>, no id, role, aria-*, title
// src/app/page.tsx: <TodoSearchForm filter={filter} query={query} count={shown.length} />
// No Server Action, Zod schema, Prisma model, query, src/lib function, env key or route.
```

#### Verification

Baseline: `pnpm test` 298 passed (48 files). Pin (`test(todos): B7.4 pin AC-38.3, AC-38.4, AC-38.7`) green on the
skeleton. Red (`test(todos): B7.4 … (red)`): `scripts/verify-red.sh B7.4` exit 0 (AC-38.1/38.2 fail on the absent `p`);
`git diff --stat <skeleton>..HEAD` only the two test files; `pnpm test:e2e e2e/38-search-count.spec.ts` → AC-38.5,
AC-38.6 fail on the absent count text, recorded in the commit body. Green: `pnpm lint && pnpm typecheck` clean ·
`pnpm test` 298 → 302 passed, every AC-16/21/25/27 unit test unchanged and green · `pnpm test:e2e` +3, all green ·
`pnpm test:mutation` ≥ 70 (`src/lib`, `src/actions` untouched; the component's `=== 1`, `>= 1`, `isInteger`,
`isSearchInEffect` and order are killed by AC-38.1–38.3) · `pnpm build` ok · `scripts/ci/check-features-map.sh` and
`scripts/ci/check-plan-scope.sh` OK.

#### Work breakdown

| Step | Role / skill                              | Produces                                   | Commit                                            |
| ---- | ----------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| 1    | skeleton: new-feature-slice (code-writer) | the ignored optional `count` prop          | `chore(todos): B7.4 skeleton`                     |
| 2    | test-writer                               | AC-38.3, 38.4 (unit), AC-38.7 (e2e), green | `test(todos): B7.4 pin AC-38.3, AC-38.4, AC-38.7` |
| 3    | test-writer                               | AC-38.1, 38.2 (unit), AC-38.5, 38.6 (e2e)  | `test(todos): B7.4 … (red)`                       |
| 4    | code-writer                               | the paragraph, the page's `count`          | `feat(todos): B7.4 …`                             |
| 5    | code-writer                               | F36 row ✅                                 | `docs(map): F36 … [B7.4]`                         |
| 6    | reviewer (diff)                           | `review.md` diff section                   | `docs(backlog): B7.4 review …`                    |

Costs the lead takes: the count is not announced (REQ-38.4), so a screen-reader user learns it only by reading the
form. B7.5 and B7.6 (same batch) touch other components; neither touches `todo-search-form.tsx` or `page.tsx`.

Plan review: approved, round 1 · Plan approved by: reviewer (D-27, tier medium, issue #308) · Rounds: 1

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
