# B1.17 plan — Plan-scope hook: a card worktree writes only the files of its approved plan (tooling, Tier quick)

Approach: one PreToolUse hook plus one CI guard sharing one plan parser; spec-analyst/advisor skipped (no section).
Claude Code passes `agent_type` (the agent's frontmatter `name`) in a subagent's hook input and omits it on the main
thread (code.claude.com/docs/en/hooks.md "Common input fields"; [unverified] live until the smoke after merge).

- **Card worktree:** the file's worktree (resolved as `path-guard.sh` does) is on a branch
  `^(feat|fix|test|chore|refactor|perf|ci|build)/B<e>.<n>-`. `docs/*` (filing, closing, D-n lanes), `main` and other
  checkouts → the hook allows everything (path-guard and the lanes' checklists still apply).
- **Rule:** `backlog/work/<card>/*` always allowed. Otherwise the plan must exist and hold `Plan approved by: lead`,
  and the repo-relative path must match a backticked token in the first column of its `## Files` table (bash glob,
  `*` crosses `/`). Test files (`*.test.ts`, `*.test.tsx`, `e2e/*`) also need `agent_type` = `test-writer`;
  `prisma/migrations/*` needs `code-writer`. Refusal: exit 2, message names the plan and the missing row.
- **Bash writes** (`sed`, heredoc, `pnpm db:migrate`) never reach a PreToolUse Edit/Write hook. Net:
  `scripts/ci/check-plan-scope.sh` in CI `guards` fails a card branch whose `git diff BASE...HEAD` names a file
  outside the plan's Files (work folder excepted).

**Decision for the lead (A recommended):** `new-feature-slice` writes `it.todo` test stubs from the main thread, which
the test rule refuses. (A) the skeleton stops writing test stubs; `test-writer` creates every test file in the red
step (AC titles stay visible in the plan). (B) the hook lets the main thread create a test file whose only test
calls are `it.todo` (content check in a hook, weaker, more code).

## Files

| File                                                                       | Change                                                          | Why          |
| -------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------ |
| `.claude/hooks/plan-scope.sh`                                              | new                                                             | Acceptance   |
| `.claude/hooks/lib.sh`, `.claude/hooks/path-guard.sh`                      | move the worktree-relative path resolution into `repo_rel`      | shared, same |
| `.claude/settings.json`                                                    | PreToolUse `Edit\|Write\|MultiEdit` → `plan-scope.sh`           | Acceptance   |
| `scripts/plan-files.sh`                                                    | new: `<plan.md>` → approved flag + Files patterns, one per line | shared       |
| `scripts/ci/check-plan-scope.sh`, `.github/workflows/ci.yml`               | new guard; one `guards` step                                    | Bash net     |
| `scripts/hook-smoke.sh`                                                    | probes S1–S12 per layout; C1–C3 for the guard                   | Test         |
| `.claude/skills/new-feature-slice/SKILL.md`                                | (A) no test stubs                                               | decision     |
| `.claude/docs/hooks.md`, `.claude/agents/dev-lead.md`, `scripts/CLAUDE.md` | hook row; Files cells are backticked repo paths                 | contract     |
| `backlog/work/B1.17/plan.md`, `review.md`                                  | plan, reviews                                                   | —            |

## Interfaces touched

```bash
.claude/hooks/plan-scope.sh            # PreToolUse stdin JSON: tool_input.file_path, agent_type; exit 0 | 2
scripts/plan-files.sh <plan.md>        # line 1 "approved" | "unapproved"; then one Files pattern per line; exit 1 if no Files table
scripts/ci/check-plan-scope.sh         # card branch from GITHUB_HEAD_REF or the current branch; exit 1 lists files outside the plan
repo_rel <abs-path>                    # lib.sh: prints the worktree-relative path or fails (outside project, `..` through a new dir)
```

Probes, in each of `.`, `.worktrees/s`, `.claude/worktrees/n`, `.claude/worktrees/n/.worktrees/b` on branch
`feat/B9.1-x`, plan lists `src/lib/a.ts`, `src/lib/a.test.ts`, `prisma/migrations/*`: S1 listed src → 0; S2 unlisted →
2; S3 work folder, plan unapproved → 0; S4 listed, plan unapproved → 2; S5 no plan → 2; S6 listed test as `test-writer`
→ 0; S7 as main thread → 2; S8 as `code-writer` → 2; S9 migration as `code-writer` → 0; S10 as `test-writer` → 2;
S11 branch `docs/B9.1-x` → 0; S12 outside the project → 0. Guard: C1 diff inside the plan → 0; C2 one extra file → 1;
C3 `docs/` branch → 0 (skipped).

## Verification (in the card worktree)

```bash
scripts/hook-smoke.sh   # test commit: the new S/C probes FAIL (scripts missing; red on a missing script, as B1.16); 221 old probes ok
scripts/hook-smoke.sh   # green: 221 + 48 + 3 probes OK, exit 0 (bash 3.2)
scripts/ci/check-plan-scope.sh   # on this branch: OK (every changed file is in this plan)
bash -n .claude/hooks/*.sh scripts/*.sh scripts/ci/*.sh && scripts/ci/check-agent-frontmatter.sh && scripts/ci/check-backlog.sh
```

Steps: `test(scripts): B1.17 plan-scope probes` → `feat(hooks): B1.17 plan-scope hook and guard` → `reviewer` diff
→ PR (needs `config-change-approved`: `.claude/`, `.github/`, `scripts/ci/`). The orchestrating session edits these
files under this approval, as B1.12–B1.16. Live check after merge and a main-checkout update: a `code-writer`
write to an unlisted file in a card worktree is refused [unverified until then].

Plan review: <pending> · Plan approved by: <empty until the lead approves> · Rounds: 1
