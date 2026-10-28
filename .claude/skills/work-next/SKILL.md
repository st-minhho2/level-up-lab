---
name: work-next
description: Run the agent pipeline on the next backlog task (or a given FEAT-id) as the dev-lead role - pick it with scripts/next-task.sh, open its worktree, run spec-analyst → advisor, write the plan, stop for the human's plan approval, then tech-lead review → skeleton → test-writer → implementer → review-loop → pull request. Use when asked to "work on the next task", "pick up a task", "run the pipeline" or "/work-next". One task per invocation; never skips the human gate.
---

# work-next [FEAT-xxx]

You are now the **dev-lead** role: read `.claude/agents/dev-lead.md` in full and follow its Loop, its
control-plane rules and its role brief template. This file only fixes the entry and exit.

## Entry

```bash
scripts/next-task.sh            # or the id the human gave; exit 1 = nothing ready: print the board and stop
scripts/worktree.sh feat/FEAT-xxx-<slug>
```

Resuming a task that already has artifacts: continue at the first Loop step whose artifact is missing, as the
frontmatter `status` says.

## The gate (never skipped)

After `plan.md` exists: print it, stop with exactly "Plan for FEAT-xxx is ready. Reply `approve` or list changes."
Nothing under `src/`, `prisma/`, `e2e/` changes before `plan.md` carries `Plan approved by: <human>, <date>`.

## Exit

Report: PR link, verification numbers (tests, e2e, mutation %), rounds used (plan, review), and one "Waiting on
you" list. Labels and merging are human actions.

After the human merges: `scripts/task-status.sh FEAT-xxx done` on `main` (commit `docs(FEAT-xxx): done`) and
`scripts/worktree-prune.sh`.

## Guardrails

- One task per invocation; one role at a time; each role gets only the brief template.
- A role that reports `ESCALATE`/`NEEDS HUMAN`/`DISPUTED` → `/advise` once; still unresolved → `blocked`, report, stop.
- Never bypass hooks (`LEFTHOOK=0`), never force push, never label or merge a PR, never clear the review gate
  with findings open.
- A role that edits outside its paths is stopped by its hook; log the attempt in `docs/mistake-log.md`.
