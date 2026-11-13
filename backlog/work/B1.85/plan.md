# B1.85 plan — the `docs(map)` commit is code-writer's, its own commit after `feat` (tooling, no §)

Approach: give the step to the role whose path guard already holds `spec/features-map.md`. Three prompts disagree
today: `dev-lead.md` lists step 4 `docs(map)` as its own (template line 59, Loop 8 at line 94, after the review);
`code-writer.md` Procedure 5–6 moves the row "same commit" inside `feat` (B5.5's fold came from there); only
`backlog/CLAUDE.md` and `.claude/docs/git-workflow.md` give the order `feat` → `docs(map)` → `/review-loop`. After this
card, code-writer's green dispatch ends in two commits, `feat` then `docs(map)`; dev-lead's green gate checks the
second; dev-lead's path list stays as it is. No advice (tier quick, no section). Risk tier **high** (`.claude/`,
D-28) → the lead's `approve`; the PR carries `config-change-approved` (D-19). Dev-lead writes `.claude/` (interactive,
as B1.79).

## Files

| File                               | Change                                                                                                                                                         | Why          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `.claude/agents/dev-lead.md`       | template step 4 `4 map: code-writer → docs(map): F<n> … [<card>]`; Loop 6 green gate checks that commit; Loop 8 "Card, metrics" says the map is code-writer's  | Acceptance 1 |
| `.claude/agents/code-writer.md`    | description; Procedure 5–6: `feat` = code + metrics (+ a ✗ row a new module needs); new step 7: the status move in its own `docs(map)` commit; MAP report line | Acceptance 1 |
| `.claude/skills/tdd-loop/SKILL.md` | step 3: code-writer commits `feat`, then `docs(map)`; step 4: the gate checks the `docs(map)` commit                                                           | Acceptance 1 |
| `docs/mistake-log.md`              | 2026-11-06 row, "Prevented by": B1.85's prompts; held on the next headless run [unverified until E6]                                                           | mistake-log  |
| `backlog/work/B1.85/*`             | plan, review, pr-body                                                                                                                                          | pipeline     |

## Interfaces touched

Prompt text only; no frontmatter `hooks:`/`tools:` line, hook, script or path list changes. code-writer's commits
on a card whose plan Files hold `spec/features-map.md`:

```
feat(<pkg>): <card> <what the user can now do>   # src/, prisma/, docs/metrics.md; a new ✗ row if a new module needs one
docs(map): F<n> <feature> ✗ → ✅ [<card>]          # spec/features-map.md only, right after feat, before /review-loop
MAP: <rows touched> in docs(map) <sha> | none      # code-writer report line
```

dev-lead green gate adds: `git log --format=%s <feat>..HEAD` holds `docs(map): … [<card>]` and
`git show --stat <that sha>` names only `spec/features-map.md` (a plan without that file: no `docs(map)` commit).

## Verification

The card's test is a `git grep` (no probe file): `scripts/hook-smoke.sh`'s guide row lives in `scripts/CLAUDE.md`,
which B1.89 holds now, so a hook-smoke probe waits for a follow-up card. From the worktree top:

- T1 `git grep -n 'docs(map)' .claude/agents/dev-lead.md` → ≥ 2 lines, each names `code-writer`. Base 2f1ff88:
  lines 59, 94, neither names it → red.
- T2 `git grep -n 'docs(map)' .claude/skills/tdd-loop/SKILL.md` → ≥ 1 line, each names `code-writer`. Base: 0 → red.
- T3 `git grep -n 'docs(map)' .claude/agents/code-writer.md` → ≥ 1 line (its own step). Base: 0 → red.
- T4 `git grep -n 'same commit' .claude/agents/code-writer.md` → 0 lines. Base: line 38 → red.
- T5 `.claude/skills/work-next/SKILL.md`: 0 `docs(map)` lines before and after (it defers to dev-lead's Loop; unchanged).
- T6 dev-lead's path list unchanged: `git diff origin/main -- .claude/agents/dev-lead.md | grep -c '^[-+] .*path-guard'`
  → 0; `scripts/ci/check-agent-frontmatter.sh` OK; `scripts/hook-smoke.sh` 726 OK before and after (HG1–HG13 hold).
- `next-task.sh --check B1.85` no overlap; `check-plan-scope.sh`, `check-backlog.sh` OK; `pnpm lint && pnpm typecheck`
  clean; `pnpm test` unchanged; CI green.
- Pending, not a gate: the next headless card run's log shows no path-guard refusal on `spec/features-map.md` and a
  `docs(map)` commit by code-writer (first E6 batch) → the closing PR is `partial` with that pending.

## Work breakdown

| Step | Role     | Produces                       | Commit                                                                   |
| ---- | -------- | ------------------------------ | ------------------------------------------------------------------------ |
| 1    | dev-lead | three prompts, mistake-log row | `chore(agents): B1.85 the docs(map) commit is code-writer's, after feat` |
| 2    | reviewer | diff review                    | `docs(backlog): B1.85 review pass N`                                     |
| 3    | dev-lead | draft PR, label                | —                                                                        |

Not in scope: dev-lead's path list (acceptance), `backlog/CLAUDE.md` and `git-workflow.md` (already right), the
closing lane's map flip (a different step: section status after merge), `scripts/` (B1.89's files).

Costs: no red commit (the test is the grep; the red is the base output above); nothing in CI keeps the prompts from
drifting back until the hook-smoke follow-up; a card's PR gains one commit.

Plan review: pending · Plan approved by: · Rounds: 1
