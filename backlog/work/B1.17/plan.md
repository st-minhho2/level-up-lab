# B1.17 plan — Plan-scope hook: a card worktree writes only the files of its approved plan (tooling, Tier quick)

Approach: one PreToolUse hook and one CI guard sharing one parser; spec-analyst/advisor skipped (no section). Claude
Code passes `agent_type` (frontmatter `name`) in a subagent's hook input and omits it on the main thread
(code.claude.com/docs/en/hooks.md "Common input fields"; [unverified] live until after merge).

- **Card branch:** `^[a-z]+/B<e>.<n>(-|$)` (also `docs/`: lanes pass through the paperwork rule). Other branches
  (`main`, `claude/<name>`, `hotfix/…`) → hook allows, guard prints "no card id: skipped" (stated gap: such PRs carry
  their plan in the body, `rules/planning.md`).
- **Paperwork, always allowed** (owned by role path-guards, D-7, the lanes): `backlog/*`, `spec/*`,
  `docs/metrics.md`, `docs/mistake-log.md`. **Every other path** must match a backticked token in column 1 of the
  `## Files` table of `backlog/work/<card>/plan.md` **as of its approval commit** (the latest first-parent commit whose subject matches
  `^docs\(backlog\): <card> plan (round [0-9]+ )?approved`, as `scripts/metrics/lead-time.sh`; cost: an agent could
  write that commit itself) (a row added
  after approval does not count); no approval yet → refused. Test files (`*.test.ts(x)`, `e2e/*`) also need
  `agent_type` = `test-writer`. `prisma/migrations/*` is never written by Edit/Write (`pnpm db:migrate` only).
- **Guard** (`scripts/ci/check-plan-scope.sh`, CI `guards`): files of `git diff $(git merge-base origin/<base> HEAD)
HEAD` checked by the same rule (no role check) — catches Bash writes and migrations not in the plan.

Deviation from the card (lead's call, **(a) recommended**): reviewer round 1 applied the card's literal rule to #5–#52:
9 of 14 card PRs fail on spec/backlog/D-n/mistake-log files the pipeline writes by design, 0 build files caught.
(a) paperwork allow-list as above; (b) move spec/D-n work to `docs/` branches (pipeline change, larger); (c) literal.

Pipeline changes the test rule needs: skeleton writes no test stubs; `test-writer` creates every test file in the red
step and writes the review-pass hardening tests (today the main thread writes them in `/review-loop`).

## Files

| File                                                                                                                                                    | Change                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `.claude/hooks/plan-scope.sh`                                                                                                                           | new                                                                      |
| `.claude/hooks/lib.sh`, `.claude/hooks/path-guard.sh`                                                                                                   | resolution moved to `repo_rel` (no behavior change)                      |
| `.claude/settings.json`                                                                                                                                 | PreToolUse `Edit\|Write\|MultiEdit` → `plan-scope.sh`                    |
| `scripts/ci/plan-files.sh`, `scripts/ci/check-plan-scope.sh`                                                                                            | new: parser (approved Files) and guard                                   |
| `.github/workflows/ci.yml`                                                                                                                              | one `guards` step                                                        |
| `scripts/hook-smoke.sh`                                                                                                                                 | probes S1–S15, C1–C5                                                     |
| `.claude/skills/new-feature-slice/SKILL.md`, `.claude/skills/tdd-loop/SKILL.md`, `.claude/skills/review-loop/SKILL.md`, `.claude/agents/test-writer.md` | no stubs; hardening tests via `test-writer`                              |
| `.claude/docs/hooks.md`, `.claude/agents/dev-lead.md`, `scripts/CLAUDE.md`                                                                              | hook row; Files cells are backticked repo paths, one per file, no braces |
| `backlog/work/B1.17/plan.md`, `review.md`                                                                                                               | plan, reviews                                                            |

## Interfaces touched

```bash
.claude/hooks/plan-scope.sh          # stdin: tool_input.file_path, agent_type → exit 0 | 2 (stderr names plan + missing row)
scripts/ci/plan-files.sh <card> [<rev>]   # Files patterns of the plan at its latest approval commit reachable from <rev> (HEAD); exit 3 unapproved
scripts/ci/check-plan-scope.sh       # card from GITHUB_HEAD_REF or the branch; base origin/${GITHUB_BASE_REF:-main}; exit 1 lists offenders
repo_rel <abs-path>                  # lib.sh: worktree-relative path; fails outside the project or on `..` through a new dir
```

Probes per layout (`.`, `.worktrees/s`, `.claude/worktrees/n`, nested) on `feat/B9.1-x`, plan approved with
`src/lib/a.ts`, `src/lib/a.test.ts`: S1 listed → 0; S2 unlisted → 2; S3 `backlog/README.md`, `spec/x.md` → 0; S4 plan
unapproved → 2; S5 no plan → 2; S6 row added after approval → 2; S7 test as `test-writer` → 0; S8 test, main thread
→ 2; S9 test as `code-writer` → 2; S10 migration as anyone → 2; S11 `docs/B9.1-x` + `src/` → 2; S12 `claude/x` → 0;
S13 outside the project → 0; S14 unapproved plan quoting the approval line in prose → 2; S15 row added, then a
`plan round 2 approved` commit → 0. Guard: C1 in plan → 0; C2 extra `src/` file → 1; C3 paperwork only → 0; C4 branch cut
before a squash-merge, then `origin/main` merged → 0; C5 no card id → 0 "skipped".

## Verification (in the card worktree)

```bash
scripts/hook-smoke.sh   # test commit: 221 ok, new probes FAIL with exit 127 (scripts missing) — not the card's "exit 0"; stated
scripts/hook-smoke.sh   # green: 221 + 60 + 5 probes OK (bash 3.2)
scripts/ci/check-plan-scope.sh   # this branch after merging origin/main: OK
scripts/ci/check-agent-frontmatter.sh && scripts/ci/check-backlog.sh && bash -n .claude/hooks/*.sh scripts/ci/*.sh
```

Steps: `test(scripts): B1.17 plan-scope probes` → `feat(hooks): B1.17 plan-scope hook and guard` → `reviewer` diff →
PR (`config-change-approved`). Orchestrating session edits these files under this approval, as B1.12–B1.16. After
merge and a main-checkout update: one live refusal of a `code-writer` write to an unlisted file.

Plan review: changes requested, round 2 (cap); round-1 reasons 1–9 and round-2 reasons 1–2 applied above, round-2 fixes
not re-reviewed. Riskiest: `agent_type` absent for subagents would make S7 fail live and refuse every red step;
fallback = drop the role rule (seam: S7–S9, the skills, `test-writer.md`) in a follow-up card · Plan approved by: <empty until the lead
approves> · Rounds: 1
