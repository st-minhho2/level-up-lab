# B1.21 plan — Parallel sessions report status: draft PR, a ping when waiting, branches kept current (tooling)

Approach (round 1, 8 reasons, most about a ping hook): drop the hook; keep the branch current and the PR visible.
spec-analyst/advisor skipped (no section).

**Decision for the lead ((b) recommended):** (a) the `lead-ping.sh` Stop/Notification hook of round 1, with its stated
costs (double ping when `require-review.sh` blocks, matches on a quoted gate line, never fires for a dev-lead run as a
subagent, waits left open when a session closes, up to 3 notifications per gate). (b) no hook: the desktop app already
notifies when a session ends a turn and dev-lead ends a card turn only at its fixed lines; the wait-time metric is read
later from git and gh (plan gate = `<card> plan approved` commit − last `<card> plan review` commit; PR = merge time −
`ready_for_review` time) by the card that adds the metrics rows (step 1d, not filed yet). (b) departs from the card's
"a Notification/Stop hook pings".

- **Current base** (`scripts/worktree.sh`): `git fetch origin` (failure → warning, local `main` used, never aborts);
  default base `origin/main`, created with `--no-track`; an explicit `[base]` wins.
- **Draft PR** (dev-lead Loop 5, after `approve`): push; `gh pr create --draft` with the template filled (Item, Plan =
  plan.md, Map delta and Review "pending"); label per D-19.
- **Ready** (Loop 9, replaces "PR."): `git fetch && git merge origin/main` (no rebase, no force push; a conflict in
  `src/`, `prisma/`, `e2e/` or tests goes to code-writer / test-writer, then the green gate again); anything merged →
  `.claude/hooks/mark-reviewed.sh` again (it re-runs lint, typecheck, tests); push; fill Map delta and Review in the
  body; `gh pr ready`; wait for the checks (desktop: the PR monitor; CLI: `gh pr checks <n> --watch` with a 600 s
  timeout); red → back through the loop; green → print "PR for <card> is ready for the lead: <url>". Later BEHIND →
  merge again only when the lead asks or before the next report.
- `git-workflow.md` "Bringing `main` in" says the same, replacing "`git merge main`".

## Files

| File                                | Change                                                      |
| ----------------------------------- | ----------------------------------------------------------- |
| `scripts/worktree.sh`               | fetch, default base `origin/main`, `--no-track`             |
| `scripts/worktree-smoke.sh`         | new: K1–K4                                                  |
| `.claude/agents/dev-lead.md`        | Loop 5 draft PR; Loop 9 merge, re-mark, ready, checks, line |
| `.claude/skills/work-next/SKILL.md` | gate and exit lines match                                   |
| `.claude/docs/git-workflow.md`      | "Bringing `main` in" replaced                               |
| `scripts/CLAUDE.md`                 | `worktree.sh` base; smoke row                               |
| `backlog/work/B1.21/plan.md`        | plan                                                        |
| `backlog/work/B1.21/review.md`      | reviews                                                     |

## Interfaces touched

```bash
scripts/worktree.sh <branch> [base]   # base defaults to origin/main after `git fetch origin` (warning + local main offline)
scripts/worktree-smoke.sh             # K1–K4 on a throwaway repo with a bare origin; stops after `git worktree add` (WORKTREE_ONLY=1)
PR line (dev-lead, verbatim): "PR for <card> is ready for the lead: <url>"
```

Probes: K1 local `main` behind `origin/main` → the new branch starts at `origin/main`; K2 it has no upstream; K3
explicit `[base]` wins; K4 origin unreachable → warning, branch from local `main`, exit 0 up to the worktree.
`WORKTREE_ONLY=1` (new, test-only) makes `worktree.sh` stop after `git worktree add`, so the smoke needs no pnpm.

## Verification (in the card worktree)

```bash
scripts/worktree-smoke.sh   # test commit: K1 K2 K4 FAIL (base main, tracking, abort offline), K3 ok; green 4 of 4
scripts/hook-smoke.sh && scripts/ci/check-agent-frontmatter.sh && scripts/ci/check-plan-scope.sh && bash -n scripts/*.sh
```

Steps: `test(scripts)` → `fix(scripts)` → `reviewer` diff → PR labeled `config-change-approved` (D-19). This card is
the first to follow the new Loop 9 itself.

Plan review: changes requested, round 1 (8 reasons; the hook ones go away with (b)) · Plan approved by: <empty until
the lead approves> · Rounds: 1
