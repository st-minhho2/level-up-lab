# Metrics

One table for every level. Holding L6 means every lower gate stays on target, so all rows are reviewed together
at the end of each sprint. "Current" is the latest measured value; "n/a" means the situation to measure has not
happened yet (for example no second developer has onboarded).

| Level | Type    | Metric                                                  | Target  | Current                                      | Date measured | How collected                                                                                 |
| ----- | ------- | ------------------------------------------------------- | ------- | -------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| L1    | Speed   | First agent-assisted PR for a new dev                   | ≤ 1 day | n/a (one developer so far)                   | 2026-10-28    | First PR timestamp minus clone timestamp, asked of each new contributor                       |
| L1    | Quality | Review comments about conventions per PR                | < 1     | n/a (no reviewed PR yet)                     | 2026-10-28    | Count human review comments tagged `convention`, divided by PRs merged in the sprint          |
| L2    | Speed   | First green build in the sandbox                        | < 1 h   | 4 min (this machine, warm store)             | 2026-10-28    | `scripts/setup-env.sh` + `docker compose up -d` + `pnpm lint && typecheck && test`, wall time |
| L2    | Quality | Repeated mistakes already covered by a rule, per sprint | 0       | 0                                            | 2026-10-28    | `docs/mistake-log.md` rows whose "Seen" grew while a prevention existed                       |
| L3    | Speed   | Multi-file PRs with an approved plan                    | 100%    | n/a (no PR yet)                              | 2026-10-28    | PRs touching > 1 file with a Plan section and an approver line, divided by all such PRs       |
| L3    | Quality | PRs needing a second design round                       | < 10%   | n/a (no PR yet)                              | 2026-10-28    | PRs where review asked to change the approach, divided by all PRs                             |
| L4    | Speed   | Workspace setup                                         | < 2 min | 9 s cold / 5 s warm                          | 2026-10-28    | "ready in Ns" printed by `scripts/worktree.sh`                                                |
| L4    | Quality | Incidents from shared state                             | 0       | 0                                            | 2026-10-28    | `docs/mistake-log.md` rows tagged `shared-state`                                              |
| L5    | Speed   | Mechanical comments in human review                     | 0       | n/a (no reviewed PR yet)                     | 2026-10-28    | Human review comments about format / lint / types / naming per PR                             |
| L5    | Quality | Lint / type / secret findings reaching CI               | 0       | 0 (pre-commit gate 1.7–2.5 s)                | 2026-10-28    | Red `lint`, `typecheck` or Semgrep secret findings on PRs per sprint                          |
| L6    | Speed   | QA round trips per feature                              | ≤ 1     | pending FEAT-001                             | 2026-10-28    | Times a PR returned from review/QA with a behavior defect                                     |
| L6    | Quality | Acceptance criteria covered by tests                    | 100%    | pending FEAT-001                             | 2026-10-28    | `scripts/ci/check-ac-coverage.sh`                                                             |
| L6    | Quality | Mutation score on `src/lib` + `src/actions`             | > 70%   | **MUTATION_BASELINE** (env + health only)    | 2026-10-28    | `pnpm test:mutation` final score                                                              |
| L6    | Speed   | Tasks completed without a second plan round             | ≥ 90%   | n/a (pipeline new; FEAT-003 dry run pending) | 2026-10-28    | `Rounds:` line in each task's `plan.md` and `review.md`, counted per sprint                   |

## Per-feature record (L6)

| Feature  | Spec                                    | Criteria | Covered | Mutation % | QA round trips | Red commit | Green commit |
| -------- | --------------------------------------- | -------- | ------- | ---------- | -------------- | ---------- | ------------ |
| FEAT-001 | `docs/specs/FEAT-001-todo-list/spec.md` |          |         |            |                |            |              |

## How to update

- Every PR updates the rows it affects (L6 rows at least) with the value, today's date, and the command output
  it came from. Sprint review updates the rest.
- A value below target for two consecutive measurements opens a row in `docs/mistake-log.md` and a fix in `.claude/`.
