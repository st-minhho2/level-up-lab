# Invariants — break these and the lab proves nothing

Each is tied to the thing that enforces it. A task that appears to require bending one stops and says so.

1. **The spec is the contract.** Every function in `src/` implements a numbered section; a behavior without a
   section is a bug. Enforced by `scripts/ci/check-spec-sections.sh` and the `reviewer`.
2. **Tests land red first and are never weakened.** `test(...)` commits precede `feat(...)`; `scripts/verify-red.sh`
   proves the red; `scripts/ci/check-feat-commits.sh` rejects a `feat(` commit touching tests; no `skip`, `only`,
   `todo` left behind, no loosened assertion.
3. **Mutations only through Server Actions**, input parsed by Zod at the boundary, errors returned as
   `ActionResult`. Enforced by `ts-style.md`, the `reviewer`, mutation testing (≥ 70 %).
4. **Prisma only in `src/lib`**, one client, `server-only`; no raw SQL without a card and a reviewer. Enforced by
   `next build` and the `reviewer`.
5. **Nothing stateful is hard-coded.** Port, schema, build dir, storage, cache prefix come from `src/lib/env.ts`.
   Enforced by `scripts/worktree.sh` running two tasks side by side.
6. **The main checkout is never edited; a card's branch is never force-pushed by an agent; hooks are never
   bypassed.** Enforced by `guard-bash.sh`, `settings.json` deny rules, Lefthook.
7. **Secrets are never read or printed.** Enforced by `guard-bash.sh`, `guard-read.sh`, gitleaks, Semgrep.
8. **A change under `src/`, `prisma/`, `e2e/` is reviewed before the turn ends.** Enforced by `require-review.sh`
   and cleared only by `mark-reviewed.sh` after `/review-loop`.
