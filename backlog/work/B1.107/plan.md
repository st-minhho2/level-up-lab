# B1.107 plan — guard-bash lets a `$'…'`, `$"…"` or `\` delete flag after `gh pr close` delete the branch (tooling, no §)

Approach A (narrow, the card): in `GH_BRANCH_DELETE` the delete flag after `close`/`merge` takes `["'\\$]*` before
its `-`, the class `PUSH_FORCE` (B1.24) and `GH_PR_FLAGS` (B1.105) already use, in place of `[\"']?`. One character
class on one line; messages unchanged. No advice (tier quick, no section). Risk tier **high** (`.claude/`, hooks) →
the lead's `approve`; the PR carries `config-change-approved` (D-19). Dev-lead writes the hook and `scripts/`
(interactive, as B1.24, B1.103, B1.105).

Approach B (general, asked about, **not** in this plan): in section 2's segment loop, a copy `g` of `low` with `$'`,
`$"`, `'`, `"` and the `\` of `\-` removed, matched by `GH_PR_MERGE` and `GH_BRANCH_DELETE` only. It must stay off
the git push rules (removing `$'` hides `PUSH_FORCE`'s `$'…\…'` signal) and the whole-command API check. Prototype on
`4e5b42a`, `/bin/bash` 3.2, one run each: the same 838 probes OK, 0 of hook-smoke's allow probes newly blocked. Time:

| Hook (prototype)              | 300 segments, 17 KB | one 2400-line segment, 138 KB                          |
| ----------------------------- | ------------------- | ------------------------------------------------------ |
| base `4e5b42a`                | 1.87 s              | 295 s                                                  |
| A (this plan)                 | 1.91 s              | 299 s                                                  |
| B with bash `${//}` (no fork) | 1.92 s              | 929 s (×3.1, bash 3.2's substitution on a long string) |
| B with one `sed` per segment  | 3.85 s (×2)         | 315 s (B runs overlapped with the 929 s one)           |

B also blocks 7 forms A leaves open, two of them a **merge** (B1.103's rule, exit 0 today): `gh pr $'merge' 7`,
`gh $"pr" merge 7`, `gh pr $'close' 7 -d`, `gh $'pr' close …`, `gh pr $'-R' o/r $'close' 7 $'-d'`, `gh pr close 7 -'d'`,
`gh pr close 7 "-"d`. Cost: a fork per segment, and it changes how B1.103's and B1.105's rules read the text, beyond
this card. So A is planned; B is the lead's call: `approve` takes A and dev-lead files the merge gap
(`gh pr $'merge' 7`) as a follow-up card with B (`sed` form) as its proposed fix; "take B" sends this plan back
through review with B and its merge probes.

Costs of A (stated in the hook header and `hooks.md`): a `gh pr close` comment holding `\-d`, `$'-d'` or `""-d` is
blocked (`-c "see \-d in docs"`), as one holding ` -d` already is. Out of reach as before: `$'\x2dd'` (an escape the
shell turns into `-d`), a quoted or escaped `close`/`pr` (B covers it), `\close`, a flag in a variable, an alias.

## Files

| File                          | Change                                                                                      | Why          |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------ |
| `.claude/hooks/guard-bash.sh` | `GH_BRANCH_DELETE`: `["'\\$]*` before the delete flag; header comment                       | Acceptance 1 |
| `scripts/hook-smoke.sh`       | section "a quoted or escaped delete flag after gh pr close (B1.107)": 12 blocked, 6 allowed | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: the delete flag behind quotes, `\` or `$`; the false positive               | Acceptance 1 |
| `backlog/work/B1.107/*`       | plan, review, pr-body                                                                       | pipeline     |

## Interfaces touched

`guard-bash.sh` (PreToolUse Bash): exit 2 with `force pushes` on the forms below; exit 0 otherwise as today.

```bash
GH_BRANCH_DELETE="${W}gh[\"']?[[:space:]](.*[[:space:]])?(repo[[:space:]]+sync.*--force|[\"']?pr[\"']?${GH_PR_FLAGS}[[:space:]]+[\"']?(close|merge)[\"']?([[:space:]].*)?[[:space:]][\"'\\\\$]*(-[a-z]*d|--delete-branch))"
```

- Blocked (12): `gh pr close 7` + `$'-d'`, `\-d`, `$"--delete-branch"`, `""-d`, `$'--delete-branch'`,
  `\--delete-branch`, `''-d`, `$"-d"`, `$'-dc' bye`; `gh pr -R o/r close 7 $'-d'`; `gh pr close --repo o/r 7 \-d`;
  `"gh" "pr" "close" 7 $'-d'`.
- Allowed (6): `gh pr close 7`, `gh pr close 7 -c "superseded"`, `gh pr -R o/r view 7`,
  `gh pr close 7 -c $'superseded by #8'`, `gh pr close "$N" --comment 'superseded'`,
  `gh pr view 7 --json headRefName -q '.headRefName'`.

## Verification

- Probe commit `test(hooks): B1.107 hook-smoke probes a quoted or escaped delete flag after close`, no `(red)` marker
  (no vitest file: `verify-red.sh:73-75` fails a marked one in CI; mistake-log B1.62/B1.103/B1.106). Red shown by
  `scripts/hook-smoke.sh` there: exit 1, 12 FAIL, 826 ok (prototype: 12 FAIL).
- Green `chore(hooks): B1.107 guard-bash blocks a quoted or escaped delete flag after close`: "hook-smoke: 838 probes
  OK" (820 + 18), `/bin/bash` 3.2 locally, bash 5 in CI. Mutants (prototype, 4/4 killed): class back to `[\"']?`
  → 12 probes fail; `$` dropped from it → 7; `\\` dropped → 3; `*` made `?` → 9.
- `pnpm lint && pnpm typecheck` exit 0; `pnpm test` 403 before and after (no `src/`); mutation: CI only, no src/lib or
  src/actions change; `next-task.sh --check B1.107` no overlap; `check-plan-scope.sh`, `check-backlog.sh` OK; CI green.

## Work breakdown

| Step | Role     | Produces           | Commit                                                                               |
| ---- | -------- | ------------------ | ------------------------------------------------------------------------------------ |
| 1    | dev-lead | probes             | `test(hooks): B1.107 hook-smoke probes a quoted or escaped delete flag after close`  |
| 2    | dev-lead | rule, header, docs | `chore(hooks): B1.107 guard-bash blocks a quoted or escaped delete flag after close` |
| 3    | reviewer | diff review        | `docs(backlog): B1.107 review pass N`                                                |

Plan review: pending · Plan approved by: · Rounds: 1
