# ADR-003 · One task, one worktree, one schema

**Context.** Two tasks in one checkout shared `.next`, port 3000 and the `public` schema; failures were "flaky".
**Decision.** `scripts/worktree.sh` creates `.worktrees/<slug>` with its own branch, hashed port, PostgreSQL schema
(`?schema=wt_<slug>`), build, cache and storage directories and a rewritten `.env`; `worktree-prune.sh` removes all of it (D-6).
**Rejected.** One database per worktree (slow to create, no benefit); containers per task (heavier, same isolation).
**Consequences.** Nothing stateful may be hard-coded; every knob is read through `src/lib/env.ts` or the config files.
**Revisit when.** A shared resource appears that a schema cannot isolate (a queue, object storage); add a prefix knob.
