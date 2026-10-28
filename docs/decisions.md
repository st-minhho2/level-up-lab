# Decisions (D-n)

Rulings only a human can make, recorded once and never rewritten. Agents follow them and never re-ask; a later
D-n supersedes an earlier one. The `advisor` role escalates with a decision request; the human appends the next
D-n here (one commit, `docs(decisions): D-n …`) and the task is unblocked with `scripts/task-status.sh`.

| #   | Date       | Decision                                                                                                                   | Consequence for tasks                                                                                     |
| --- | ---------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| D-1 | 2026-10-28 | Claude Code is the single approved agent; roles are its subagents in `.claude/agents/`.                                    | No second tool; instruction files converted once if that ever changes.                                    |
| D-2 | 2026-10-28 | One human gate per task: plan approval (`Plan approved by:` in `plan.md`).                                                 | Spec approval is delegated to `tech-lead` after the plan is approved.                                     |
| D-3 | 2026-10-28 | Model tiers: `spec-analyst` and `advisor` on `sonnet`; deciding and writing roles inherit.                                 | Change only here.                                                                                         |
| D-4 | 2026-10-28 | Review gate on Stop: a change under `src/`, `prisma/`, `e2e/` is reviewed (`/review-loop`, ≤ 3 passes) before a turn ends. | `mark-reviewed.sh` is the only way to clear it; a deliberate incomplete stop is reported, never silenced. |
| D-5 | 2026-10-28 | Todo titles: 1–200 characters after trimming, duplicates allowed (FEAT-001 §7).                                            | Later todo features reuse the limit unless a new D-n changes it.                                          |

## Open

| Question | Raised by | Blocks |
| -------- | --------- | ------ |
