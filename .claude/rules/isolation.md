---
paths:
  - '**'
---

# Isolation: one task = one worktree = one branch = one session

**Mistake this prevents:** two tasks (or an agent and a human) editing the same checkout, so a half-finished
change from task A ends up in task B's commit, `.next` caches from one build poison the other, and both hit the
same Postgres schema and the same port, producing failures nobody can reproduce.

## Rules

1. Every task starts with `scripts/worktree.sh <task-name>` and works only inside the printed directory
   (`.worktrees/<slug>/`). The main checkout is for `main` and for pruning, never for feature work.
2. One worktree holds one branch, and one session works in one worktree. Do not `cd` into another worktree, do
   not read its files to "check how they did it"; read `main` instead.
3. Never share a checkout: no second session in a directory that already has one, no editing a worktree a human
   has open.
4. Everything stateful is per worktree and comes from its `.env`: `PORT`, `DATABASE_URL?schema=wt_<slug>`,
   `NEXT_DIST_DIR`, `UPLOAD_DIR`, `CACHE_PREFIX`, `VITEST_CACHE_DIR`, `STRYKER_TEMP_DIR`. Code must read these
   through `src/lib/env.ts` (or the config files), never hard-code `3000`, `public`, `.next` or `storage/`.
5. When the branch is merged, `scripts/worktree-prune.sh` removes the worktree, the branch and the schema. Do not
   reuse a worktree for the next task.
