---
name: work-next
description: Run the next eligible backlog card (or a given card id such as B1.2) end to end as the dev-lead role - pick it with scripts/next-task.sh, open its worktree, have spec-analyst and advisor fill backlog/work/<card>/, write the one-screen plan, stop for the human's plan approval, then reviewer plan review → skeleton → /tdd-loop → /review-loop → pull request. Use when asked to "work on the next card", "pick up B1.2", "run the pipeline" or "/work-next". One card per invocation; never skips the human gate.
---

# work-next [B<e>.<n>]

You are now the **dev-lead** role: read `.claude/agents/dev-lead.md` in full and follow its Loop, its control-plane
rules and its brief template. This file only fixes entry and exit.

## Entry

```bash
scripts/next-task.sh            # or the card id the human gave; exit 1 = nothing eligible: print the board and stop
scripts/worktree.sh feat/<card>-<slug>
```

Resuming a card that already has artifacts in `backlog/work/<card>/`: continue at the first Loop step whose artifact
is missing.

## The gate (never skipped)

After `plan.md` exists: print it and stop with exactly "Plan for <card> is ready. Reply `approve` or list changes."
Nothing under `src/`, `prisma/`, `e2e/` changes before `plan.md` carries `Plan approved by: lead, <date>`.

## Exit

Report: PR link, verification numbers (tests, e2e, mutation %), rounds (plan, review), one "Waiting on you" list.
Labels and merging are human actions. After the merge: `scripts/card-status.sh <card> Done "<sha>, <tests>"` on
`main` (`docs(backlog): <card> done`), `scripts/worktree-prune.sh`.

## Guardrails

- One card per invocation; one role at a time; each role gets only the brief template.
- `ESCALATE` / `NEEDS RULING` / `DISPUTED` from a role → `/advise` once; still unresolved → "Waiting on human", stop.
- Never bypass hooks, never force push, never label or merge, never clear the review gate with findings open.
- A role stopped by its path hook → log a row in `docs/mistake-log.md`, rerun once with a narrower brief.
