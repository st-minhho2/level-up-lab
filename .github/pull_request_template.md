<!-- Title: <type>(<scope>): <summary>   e.g. feat(FEAT-001): list, create and toggle todos -->

## Spec

Link: `specs/FEAT-xxx-<name>.md` (or `n/a: chore/docs only`)
Criteria in this PR: AC-1, AC-2, ... (every AC in the spec, or say which are deferred and why)

## Plan

> **Mandatory for any PR that touches more than one file.** Written and approved before the code (see
> `.claude/rules/planning.md`). If the code diverged, the plan was updated and re-approved; say so below.

### Files

| File                 | Change            | Why (AC / REQ id) |
| -------------------- | ----------------- | ----------------- |
| `src/lib/<slice>.ts` | add `listTodos()` | AC-1              |

### Interfaces touched

Routes, Server Action signatures, Zod schemas, Prisma models, env vars. Signatures, not prose.

```ts
createTodoAction(formData: FormData): Promise<ActionResult<Todo>>
```

### Verification

Exact commands and expected results. The reviewer re-runs them.

```bash
pnpm test            # N tests green, including every AC-n title
pnpm test:e2e        # e2e/FEAT-xxx-<name>.spec.ts green
pnpm test:mutation   # score >= 70 on src/lib + src/actions
```

Plan approved by: <name>, <date> · Re-approved after change: <yes/no, what changed>

## Out of scope

What this PR deliberately does not do, so nobody asks in review.

## Unchanged behavior

Existing pages, actions or jobs this touches but must not alter, and the test that proves it.

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Spec status is `approved` with the lead box ticked; every AC-n appears as a test title.
- [ ] Tests were committed red first (`test(FEAT-xxx):` precedes `feat(FEAT-xxx):`); `scripts/verify-red.sh` passed.
- [ ] No `feat(...)` commit touches `*.test.*` or `e2e/**`.
- [ ] Mutation score for `src/lib` + `src/actions` ≥ 70%.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no lint/tsconfig/CI/hook changes (or label
      `config-change-approved` with the reason in this PR).
- [ ] Migrations reviewed as SQL; none edits an applied migration; `prisma/seed.ts` updated if needed.
- [ ] `docs/metrics.md` row updated; `docs/mistake-log.md` updated if an agent repeated a known mistake.
