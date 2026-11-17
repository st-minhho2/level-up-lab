## Item

B1.108 — guard-bash lets `gh pr` merge or delete the branch when `pr`, the subcommand or the flag is quoted in pieces
(tooling, no spec section)

- spec: none — tooling (`.claude/hooks/guard-bash.sh`, `scripts/hook-smoke.sh`, `.claude/docs/hooks.md`); no `src/`
  change, no section
- test: `scripts/hook-smoke.sh` section "gh pr words quoted in pieces, escaped, in a brace list, behind an empty
  variable or a redirect (B1.108)" — red before, green after (pending)
- acceptance: all four clauses of the card (pending)

## Plan

Copied from `backlog/work/B1.108/plan.md` (plan review approved round 3, the lead allowing a third round;
`Plan approved by: lead, 2026-11-17`; Rounds: 1). See that file for the full text; summary:

Approach B (normalize), one `sed` for the whole command: the gh pr rules read an unquoted, lower-case copy of each
segment. `UNQUOTE` removes `$NAME`, `${NAME}`, `$1`/`${1}`, `$@`/`${@}`, `$*`/`${*}`, the `$` of `$'…'`/`$"…"`, every
`'` `"` `\`, and turns `<` `>` into spaces; `BRACE_ONE` (flag `g`) runs a fixed four times (a list's first five items,
with prefix and suffix), then leftover `{` `}` go. `GH_PR_MERGE` and `GH_BRANCH_DELETE` match that copy in their own
loop; their quote classes go. The git push, config and `gh api` rules still read the original text.

| File                          | Change                                                                                      | Why          |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------ |
| `.claude/hooks/guard-bash.sh` | `UNQUOTE`, `BRACE_ONE`, a loop over the copy for the two gh pr rules; quote classes; header | Acceptance 1 |
| `scripts/hook-smoke.sh`       | section "gh pr words quoted in pieces … (B1.108)": 30 blocked, 10 allowed                   | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: the unquoted copy, the costs, what stays out of reach                       | Acceptance 1 |
| `backlog/work/B1.108/*`       | plan, review, pr-body                                                                       | pipeline     |

## Map delta

None (no `src/`, no section).

## Review

pending

## Evidence

- AC met: pending
- tier: high
- plan deviations: none
- trace: n/a
