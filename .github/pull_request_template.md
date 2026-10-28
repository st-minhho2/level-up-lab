<!-- Title: <type>(<pkg>): <card> <summary>   e.g. feat(todos): B1.2 edit a todo title -->

## Item

B<epic>.<n> — <title> (spec §<n>)

- spec: §<n> — unchanged | changed by D-<n>
- test: `<file>::<AC-§.n title>` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-§.1 … AC-§.n (all, or say which are deferred and why)

## Plan

> Copied from `backlog/work/<card>/plan.md`, approved before the skeleton commit. Files table, interfaces touched,
> verification, work breakdown, `Plan approved by: <human>, <date>`, rounds.

## Map delta

<!-- spec/features-map.md rows moved, e.g. "F6 · §6 · ✗ → ✅ — updateTodoTitle in src/lib/todos.ts; evidence: pnpm test → 41 passed" -->

## Review

`/review-loop`: passes N/3, the disposition table (every finding: fix now / no change needed + proving input / out of
scope), riskiest unfalsified spot. Paste `backlog/work/<card>/review.md` "Diff review".

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.
