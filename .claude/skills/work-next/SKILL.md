---
name: work-next
description: Run the agent pipeline on the next backlog task (or a given FEAT-id) - pick it with scripts/next-task.sh, open its worktree, run spec-analyst → advisor → dev-lead, stop for the human's plan approval, then tech-lead review → skeleton → test-writer → implementer → tech-lead diff review → pull request. Use when asked to "work on the next task", "pick up a task", "run the pipeline" or "/work-next". One task per invocation; never skips the human gate.
---

# work-next [FEAT-xxx]

The main session is the orchestrator: it runs scripts, spawns one subagent at a time with the Agent tool, and
commits each artifact. Roles are defined in `.claude/agents/`; the flow is documented in `docs/pipeline.md`.

## 0. Pick and isolate

```bash
scripts/next-task.sh            # or use the id the human gave; exit 1 = nothing ready, stop and say so
scripts/worktree.sh feat/FEAT-xxx-<slug>
```

Everything below runs inside that worktree. Commit after every artifact: `docs(FEAT-xxx): <artifact>`.
If the task already has artifacts (resuming), skip to the first step whose artifact is missing or whose status says so.

## 1. Understand (no human needed)

| Status before | Agent          | Prompt                                                              | Artifact → commit                             |
| ------------- | -------------- | ------------------------------------------------------------------- | --------------------------------------------- |
| `backlog`     | `spec-analyst` | "Task folder: docs/specs/FEAT-xxx-<slug>/. Write analysis.md."      | `analysis.md` → `docs(FEAT-xxx): analysis`    |
| `analyzed`    | `advisor`      | "Task folder: ... Write advice.md."                                 | `advice.md` → `docs(FEAT-xxx): advice`        |
| `advised`     | `dev-lead`     | "Task folder: ... Apply the analysis to spec.md and write plan.md." | `spec.md`, `plan.md` → `docs(FEAT-xxx): plan` |

If any role reports it needs a decision only a human can make: `scripts/task-status.sh FEAT-xxx blocked "<q>"`,
commit, report the question, stop.

## 2. Gate: human approves the plan (never skipped)

Print `plan.md` and stop with exactly: "Plan for FEAT-xxx is ready. Reply `approve` or list changes."

- Changes → `dev-lead` again with the list ("Change request round N: ..."), commit, back to this gate.
- `approve` → write `Plan approved by: <human>, <date>` into `plan.md`, commit `docs(FEAT-xxx): plan approved`.

Nothing under `src/`, `prisma/`, `e2e/` changes before this line exists.

## 3. Build (no human needed)

1. `tech-lead` mode 1 → `review.md` plan review. Changes requested → `dev-lead` (≤ 2 rounds, then the human).
   Approved → status `approved`, commit `docs(FEAT-xxx): plan review`.
2. `scripts/task-status.sh FEAT-xxx in-progress`; skill `new-feature-slice` (and `add-migration` when the plan
   lists a schema change) → `chore(FEAT-xxx): ...`.
3. `test-writer` → `test(FEAT-xxx): ...`; `scripts/verify-red.sh FEAT-xxx` must exit 0.
4. `implementer` → `feat(FEAT-xxx): ...` (docs/metrics.md row and spec §6 included).
5. `tech-lead` mode 2 → `review.md` diff review. Back to implementer / test-writer at most twice; then the human.
   Ready → status `review`, commit `docs(FEAT-xxx): diff review`.

## 4. Pull request

```bash
git push -u origin feat/FEAT-xxx-<slug>
gh pr create --base main --title "feat(FEAT-xxx): <title>" --body-file <filled template; Plan section = plan.md>
```

Report the PR link, the verification numbers, and the rounds used. Stop. (Labels and merging are human actions.)

## After the human merges (run when asked, or at the start of the next `/work-next`)

```bash
scripts/task-status.sh FEAT-xxx done    # on main, commit docs(FEAT-xxx): done
scripts/worktree-prune.sh
```

## Guardrails

- One task per invocation. One subagent at a time; each gets only the task folder path and its mode.
- Never bypass hooks (`LEFTHOOK=0`), never force push, never add labels, never merge.
- A role that edits outside its allowed paths → discard its change (`git checkout -- <path>`), log a row in
  `docs/mistake-log.md`, rerun once.
