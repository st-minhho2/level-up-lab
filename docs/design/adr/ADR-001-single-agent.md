# ADR-001 · One agent, several roles

**Context.** Two tools with two instruction sets drift apart; a rule fixed in one is forgotten in the other.
**Decision.** Claude Code is the only agent (D-1). Roles (`dev-lead`, `spec-analyst`, `advisor`, `test-writer`,
`code-writer`, `reviewer`) are subagents in `.claude/agents/` with hook-enforced write scopes and fixed report shapes.
**Rejected.** A second reviewer tool (double cost, two prompt dialects); a single do-everything agent (no independent review).
**Consequences.** One place to fix a mistake; the reviewer has no memory of the author's reasoning by construction.
**Revisit when.** A role's model or tools cannot do its job; then change the role, not the number of tools.
