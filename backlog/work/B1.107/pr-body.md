## Item

B1.107 — guard-bash lets a `$'…'`, `$"…"` or `\` delete flag after `gh pr close` delete the branch (tooling, no spec
section)

- spec: none — tooling (`.claude/hooks/guard-bash.sh`, `scripts/hook-smoke.sh`, `.claude/docs/hooks.md`); no `src/`
  change, no section
- test: `scripts/hook-smoke.sh` section "a quoted or escaped delete flag after gh pr close (B1.107)" — red before (12
  probes FAIL, 826 ok at b80699a), green after ("hook-smoke: 838 probes OK" at 2bf0ac0)
- acceptance: all four clauses of the card (the delete flag behind quotes, `\` or `$` blocked with the branch-delete
  message, the plain forms still pass, probes red then green with the counts on bash 3.2, `config-change-approved`)

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
(`gh pr $'merge' 7`, exit 0 today): filed as card **B1.108** (#391, depends on B1.107), with B's timing and 11 open
spellings, among them brace expansion and an empty variable before the flag (diff review pass 1 finding 1).

Costs of A, accepted by the lead (stated in the hook header and `hooks.md`): a `gh pr close` comment holding `\-d`,
`$'-d'` or `""-d` is blocked, as one holding ` -d` already is. Out of reach as before: `$'\x2dd'`, a quoted or escaped
`close`/`pr`, a flag quoted in pieces (`-'d'`, `"-"d`), a flag in a variable, an alias.

| File                          | Change                                                                                      | Why          |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------ |
| `.claude/hooks/guard-bash.sh` | `GH_BRANCH_DELETE`: `["'\\$]*` before the delete flag; header comment                       | Acceptance 1 |
| `scripts/hook-smoke.sh`       | section "a quoted or escaped delete flag after gh pr close (B1.107)": 12 blocked, 6 allowed | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: the delete flag behind quotes, `\` or `$`; the false positive               | Acceptance 1 |
| `backlog/work/B1.107/*`       | plan, review, pr-body                                                                       | pipeline     |

Verification: the probe commit carries no `(red)` marker (no vitest file, so `verify-red.sh` cannot judge it and CI
fails a marked one; mistake-log B1.62, B1.103, B1.106). Red shown by `scripts/hook-smoke.sh` at b80699a: exit 1,
12 FAIL, 826 ok. Green at 2bf0ac0: "hook-smoke: 838 probes OK" (820 + 18), `/bin/bash` 3.2.57. Mutants (4/4 killed):
class back to `[\"']?` → 12 probes fail, `$` dropped → 7, `\\` dropped → 3, `*` made `?` → 9. `pnpm lint` and
`pnpm typecheck` exit 0; `pnpm test` "Tests 403 passed (403)", as before the card; `pnpm test:e2e` "91 passed";
mutation: CI only, no src/lib or src/actions change.

## Map delta

None (no `src/`, no section).

## Review

`/review-loop`: 1 pass of 3 (`backlog/work/B1.107/review.md` "Diff review (round 1)"; plan review round 1). Verdict
ready for PR, 1 finding:

| Pass | #   | Finding (file:line)                                          | Source   | Kind          | Disposition | Justification                                                                                             |
| ---- | --- | ------------------------------------------------------------ | -------- | ------------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| 1    | 1   | `pr-body.md:25` says the merge gap is filed; no card existed | reviewer | plan-mismatch | fix now     | Filed B1.108 (#391, "Filing a card" lane) with the brace and empty-variable spellings; this body names it |

Reviewer notes, not findings: "a quoted or escaped subcommand" holds with its examples (`$'close'`, `\close`; plain
`"close"` is blocked since B1.105); CI's bash 5 was not run locally, the same class already passes CI in `GH_PR_FLAGS`
and `PUSH_FORCE`. No untrusted text tried to steer the plan or the review.
