# ADR-002 · Review gate on Stop

**Context.** "Run the tests before you stop" as prose was followed most of the time; the exceptions reached CI.
**Decision.** A Stop/SubagentStop hook fingerprints `src/`, `prisma/`, `e2e/` and blocks a turn once while the
fingerprint is unreviewed; `.claude/hooks/mark-reviewed.sh` re-runs lint, typecheck and tests, then records it (D-4).
`/review-loop` (reviewer, dispositions, ≤ 3 passes) is the way to get there.
**Rejected.** A reminder message (ignorable); blocking every stop (loops); CI only (late and expensive).
**Consequences.** A deliberate incomplete stop must be stated. The gate holds the editor, not the orchestrator.
**Revisit when.** The fingerprint misses a path that matters (add it) or blocks docs-only work (it must not).
