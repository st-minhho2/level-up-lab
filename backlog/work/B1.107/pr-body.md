## Item

B1.107 — guard-bash lets a `$'…'`, `$"…"` or `\` delete flag after `gh pr close` delete the branch (tooling, no spec
section)

- spec: none — tooling (`.claude/hooks/guard-bash.sh`, `scripts/hook-smoke.sh`, `.claude/docs/hooks.md`); no `src/`
  change, no section
- test: `scripts/hook-smoke.sh` section "a quoted or escaped delete flag after gh pr close (B1.107)" — pending
- acceptance: all four clauses of the card — pending

## Plan

Copied from `backlog/work/B1.107/plan.md` (plan review approved round 1; `Plan approved by: lead, 2026-11-17`;
Rounds: 1).

Approach A (narrow, the card): in `GH_BRANCH_DELETE` the delete flag after `close`/`merge` takes `["'\\$]*` before
its `-`, the class `PUSH_FORCE` (B1.24) and `GH_PR_FLAGS` (B1.105) already use, in place of `[\"']?`. One character
class on one line; messages unchanged. Risk tier **high** (`.claude/`, hooks) → the lead's `approve`; the PR carries
`config-change-approved` (D-19).

Approach B (general normalization of `$'`, `$"`, `'`, `"` and `\-` before the gh rules), weighed and **not** taken
here: same 838 probes OK and no allow probe newly blocked, but bash 3.2's `${//}` takes 929 s against the base's 295 s
on one 138 KB segment, and the `sed` form doubles the time of a many-segment command (3.85 s vs 1.87 s); it also
changes how B1.103's and B1.105's rules read the text. It blocks 7 forms A leaves open, among them a merge
(`gh pr $'merge' 7`, exit 0 today): filed as a follow-up card with B (`sed` form) as its proposed fix.

Costs of A, accepted by the lead (stated in the hook header and `hooks.md`): a `gh pr close` comment holding `\-d`,
`$'-d'` or `""-d` is blocked, as one holding ` -d` already is. Out of reach as before: `$'\x2dd'`, a quoted or escaped
`close`/`pr`, a flag quoted in pieces (`-'d'`, `"-"d`), a flag in a variable, an alias.

| File                          | Change                                                                                      | Why          |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------ |
| `.claude/hooks/guard-bash.sh` | `GH_BRANCH_DELETE`: `["'\\$]*` before the delete flag; header comment                       | Acceptance 1 |
| `scripts/hook-smoke.sh`       | section "a quoted or escaped delete flag after gh pr close (B1.107)": 12 blocked, 6 allowed | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: the delete flag behind quotes, `\` or `$`; the false positive               | Acceptance 1 |
| `backlog/work/B1.107/*`       | plan, review, pr-body                                                                       | pipeline     |

Verification: pending.

## Map delta

None (no `src/`, no section).

## Review

pending
