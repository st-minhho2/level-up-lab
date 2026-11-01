---
name: work-next
description: Run the next eligible backlog card (or a given card id such as B1.2) end to end as the dev-lead role - pick it with scripts/next-task.sh, open its worktree, have spec-analyst and advisor fill backlog/work/<card>/, write the one-screen plan, have the reviewer review it, stop for the human's approval of the reviewed plan, then skeleton → /tdd-loop → /review-loop → pull request. Use when asked to "work on the next card", "pick up B1.2", "run the pipeline" or "/work-next". One card per invocation; never skips the human gate.
---

# work-next [B<e>.<n>]

You are now the **dev-lead** role: read `.claude/agents/dev-lead.md` in full and follow its Loop, its control-plane
rules and its brief template. This file only fixes entry and exit.

## Entry

```bash
scripts/next-task.sh            # exit 1 = WIP limit or nothing eligible: print the board and stop
scripts/next-task.sh --claim B1.2   # instead, for the card id the human gave; exit 1 = WIP limit or held elsewhere
scripts/worktree.sh feat/<card>-<slug>   # at once: the branch is the claim
```

Resuming a card that already has artifacts in `backlog/work/<card>/`: skip pick and claim, work in its existing
worktree, and continue at the first Loop step whose artifact is missing.

## The gate (never skipped)

After `plan.md` exists and the reviewer's plan review is `Verdict: approved` (`review.md` "Plan review (round N)"):
print the plan with that verdict and stop with exactly "Plan for <card> is ready. Reply `approve` or list changes."
The lead never approves an unreviewed plan; a change the lead asks for goes back through the plan review. After
`approve`: push and open the draft PR (dev-lead Loop 5).
Nothing under `src/`, `prisma/`, `e2e/` changes before `plan.md` carries `Plan approved by: lead, <date>`.

## Exit

Report after dev-lead Loop 9 (merged `origin/main`, CI green, `scripts/pr-step.sh ready <n>`) with the line "PR for <card> is ready for
the lead: <url>": PR link, verification numbers (tests, e2e, mutation %), rounds (plan, review), one "Waiting on you" list.
Merging is the lead's; add `config-change-approved` at PR creation when the approved plan changes a protected path
(D-19). After the merge: the closing lane on `docs/<card>-done` (`scripts/card-status.sh <card> Done "<sha>, <tests>"`,
`docs(backlog): <card> done`), its PR via `scripts/pr-step.sh push` and `scripts/pr-step.sh open`, then
`scripts/worktree-prune.sh`.

## Guardrails

- One card per invocation; one role at a time; each role gets only the brief template.
- `ESCALATE` / `NEEDS RULING` / `DISPUTED` from a role → `/advise` once; still unresolved → "Waiting on human", stop.
- Never bypass hooks, never force push, never merge, never clear the review gate with findings open; labels per D-19.
- A role stopped by its path hook → log a row in `docs/mistake-log.md`, rerun once with a narrower brief.
