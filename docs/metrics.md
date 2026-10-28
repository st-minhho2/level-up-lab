# Metrics

The numbers that say whether the practice holds. Every card updates the rows it affects (at least the three
"per card" rows) with the value, the date and the command it came from; the rest is reviewed per sprint. "n/a"
means the situation to measure has not happened yet.

| Practice    | Type    | Metric                                                     | Target  | Current                                      | Date       | How collected                                                         |
| ----------- | ------- | ---------------------------------------------------------- | ------- | -------------------------------------------- | ---------- | --------------------------------------------------------------------- |
| Onboarding  | Speed   | Time from clone to a first agent-assisted PR for a new dev | ≤ 1 day | n/a (one developer)                          | 2026-10-28 | First PR timestamp minus clone timestamp                              |
| Onboarding  | Quality | Review comments about conventions per PR                   | < 1     | 0 (2 PRs)                                    | 2026-10-28 | Human review comments tagged `convention` ÷ PRs                       |
| Environment | Speed   | First green build in the sandbox                           | < 1 h   | 4 min (warm store)                           | 2026-10-28 | `scripts/setup-env.sh` + compose + lint/typecheck/test wall time      |
| Environment | Quality | Repeated mistakes already covered by a rule, per sprint    | 0       | 0                                            | 2026-10-28 | `docs/mistake-log.md` rows whose Seen grew while a prevention existed |
| Planning    | Speed   | Multi-file PRs with an approved plan                       | 100 %   | 2/2                                          | 2026-10-28 | PR body Plan section with an approver line                            |
| Planning    | Quality | PRs needing a second design round                          | < 10 %  | 0/2                                          | 2026-10-28 | Review asked to change the approach, not a line                       |
| Isolation   | Speed   | Workspace setup                                            | < 2 min | 5–9 s                                        | 2026-10-28 | "ready in Ns" from `scripts/worktree.sh`                              |
| Isolation   | Quality | Incidents from shared state                                | 0       | 0                                            | 2026-10-28 | mistake-log rows tagged `shared-state`                                |
| Enforcement | Speed   | Mechanical comments in human review                        | 0       | 0                                            | 2026-10-28 | Human comments about format/lint/types/naming                         |
| Enforcement | Quality | Lint / type / secret findings reaching CI                  | 0       | 1 (lint job lacked `prisma generate`, fixed) | 2026-10-28 | Red `lint`/`typecheck`/Semgrep secret jobs per sprint                 |
| Spec + TDD  | Speed   | QA round trips per card                                    | ≤ 1     | 0 (B1.1)                                     | 2026-10-28 | PR returned from review/QA with a behavior defect                     |
| Spec + TDD  | Quality | Acceptance criteria covered by tests                       | 100 %   | 100 % (§5: 7/7)                              | 2026-10-28 | `scripts/ci/check-ac-coverage.sh`                                     |
| Spec + TDD  | Quality | Mutation score on `src/lib` + `src/actions`                | > 70 %  | 78.87 %                                      | 2026-10-28 | `pnpm test:mutation`                                                  |
| Spec + TDD  | Speed   | Cards completed without a second plan round                | ≥ 90 %  | n/a (B1.2 pending)                           | 2026-10-28 | `Rounds:` in `work/<card>/plan.md` and `review.md`                    |

## Per card

| Card | §   | Criteria | Covered   | Mutation %                     | QA round trips | Red              | Green   |
| ---- | --- | -------- | --------- | ------------------------------ | -------------- | ---------------- | ------- |
| B1.1 | §5  | 7        | 7 (100 %) | 78.87 (actions 71.4, lib 80.7) | 0              | 61cb3f4, 7af9887 | c7153b2 |
| B1.2 | §6  | 7        | 7 (100 %) | 79.07 (actions 76.2, lib 80.0) | 0              | fa7a3dd          | this PR |

A value below target for two consecutive measurements opens a row in `docs/mistake-log.md` and a fix in `.claude/`.
