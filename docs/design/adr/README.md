# Architecture decision records

Format: Context → Decision → Rejected options → Consequences → Revisit when. Each ADR names the ruling (D-n in
`backlog/00-decisions.md`) that approved it; an ADR never says something the owner did not rule.

| ADR                                      | Decision                                                 | Status   | Ruling | Door    |
| ---------------------------------------- | -------------------------------------------------------- | -------- | ------ | ------- |
| [ADR-001](ADR-001-single-agent.md)       | Claude Code is the single agent; roles are its subagents | accepted | D-1    | two-way |
| [ADR-002](ADR-002-review-gate.md)        | Review gate on Stop, cleared only by `mark-reviewed.sh`  | accepted | D-4    | two-way |
| [ADR-003](ADR-003-worktree-isolation.md) | One task = one worktree with its own port and schema     | accepted | D-6    | two-way |
