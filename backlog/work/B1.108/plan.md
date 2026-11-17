# B1.108 plan — guard-bash lets `gh pr` merge or delete the branch when `pr`, the subcommand or the flag is quoted in pieces (tooling, no §)

Approach B (normalize, the card's prior art), one `sed` for the **whole command**, not one per segment: the gh pr
rules read an unquoted, lower-case copy of each segment, as the shell hands gh its words. `UNQUOTE` removes `$NAME`,
`${NAME}`, `$1`, `$@`, `$*` (empty when unset), the `$` of `$'…'`/`$"…"`, then every `'` `"` `\`, and turns `{` `}`
`,` into spaces (a brace list). A loop over that copy runs `GH_PR_MERGE` and `GH_BRANCH_DELETE`, moved out of the
segment loop; their quote classes (`[\"']?`, `["'\\$]*`, dead on the copy) go. The git push, config and `gh api` rules
still read the original text (removing `$'` would hide `PUSH_FORCE`'s `$'…\…'` signal). No advice (tier quick, no
section). Risk tier **high** (`.claude/`, hooks) → the lead's `approve`; the PR carries `config-change-approved`
(D-19). Dev-lead writes the hook and `scripts/` (interactive, as B1.103, B1.105, B1.107).

Weighed against A' (per-pattern widening: a class `(["'\\{},]|\$NAME|\${NAME})*` around every letter of `gh`, `pr`,
`close`, `merge`, `-d`, `--delete-branch`): A' is longer to read and, prototyped, misses `g''h pr merge 7` (18 of 19).
Prototypes on `4c79bec`, `/bin/bash` 3.2, in the session's scratch directory (`gen.js`: a 2400-line `git commit -F -`
heredoc whose lines name `gh pr view` and `push`, 139 KB, one segment; 300 `gh pr view` segments joined by `&&`,
11 KB); each pair ran side by side, so the long segment's time is the other section-2 rules', unchanged by either:

| Hook                          | 300 segments, 11 KB | one segment, 139 KB |
| ----------------------------- | ------------------- | ------------------- |
| base `4c79bec`                | 1.87 / 1.96 s       | 379 s               |
| B, one sed per command (plan) | 1.84 / 1.85 s       | 379 s               |
| A', per-pattern widening      | 2.45 / 2.60 s       | 377 s (base 377 s)  |

B1.107's per-segment `sed` cost ×2 on many segments (3.85 s); one `sed` per command is 3 forks per call. A' costs
+30 % on many segments (its `*` classes backtrack per word).

Blocked after (20, all exit 0 today): merge (`agents never merge`): `gh pr $'merge' 7`, `gh $"pr" merge 7`,
`gh pr \merge 7`, `gh pr m''erge 7`, `gh pr {merge,} 7`, `g''h pr merge 7`, `gh pr -R o/r m"erg"e 7`,
`GH PR $'MERGE' 7`, `gh pr $EMPTY merge 7`; delete (`force pushes`): `gh pr $'close' 7 -d`,
`gh $'pr' close 7 --delete-branch`, `gh pr \close 7 -d`, `gh pr close 7 -'d'`, `gh pr close 7 "-"d`,
`gh pr close 7 --delete-'branch'`, `gh pr close 7 {-d,}`, `gh pr close 7 {,--delete-branch}`, `gh pr close 7 $X-d`,
`gh pr close 7 ${X}-d`, `gh pr $EMPTY -R o/r close 7 -d`. Allowed (8): `gh pr close 7`, `gh pr close 7 -c "superseded"`,
`gh pr -R o/r view 7`, `gh pr view 7 --json mergeable`, `git merge origin/main`,
`gh pr view 7 --json number,title,mergeStateStatus`, `gh pr close "$N" -c 'superseded by #8'`,
`gh pr list --json title,headRefName -q '.[].title'`.

Costs (header and `hooks.md`): blocked too, a gh pr segment whose unquoted text holds ` -d` or a merge word: a literal
`'$X'-d` or `\$X-d`, `-c "$WHY-d"`, `-c 'a,-d'`, a commit message quoting `gh pr m''erge`. Still out of reach for the gh
pr rules: an escape the shell expands (`$'\x2dd'`, `$'m\145rge'`), `${X:--d}` and other operator expansions, words
joined by `${IFS}`, a word in a set variable, `$(…)`, an alias; for `gh api` (B1.103) and git push (B1.24), a word
quoted in pieces (`pulls/7/m''erge`, `-'f'`) as today.

## Files

| File                          | Change                                                                                  | Why          |
| ----------------------------- | --------------------------------------------------------------------------------------- | ------------ |
| `.claude/hooks/guard-bash.sh` | `UNQUOTE` + a loop over the copy for the two gh pr rules; quote classes dropped; header | Acceptance 1 |
| `scripts/hook-smoke.sh`       | section "gh pr words quoted in pieces … (B1.108)": 20 blocked, 8 allowed                | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: the unquoted copy, the costs, what stays out of reach                   | Acceptance 1 |
| `backlog/work/B1.108/*`       | plan, review, pr-body                                                                   | pipeline     |

## Interfaces touched

`guard-bash.sh` (PreToolUse Bash): exit 2 with the existing `MERGE_MSG` / `FORCE_MSG` on the 20 forms; exit 0 otherwise as today.

```bash
UNQUOTE='s/\$([a-z_][a-z0-9_]*|\{[a-z_][a-z0-9_]*\}|[0-9@*])//g; s/\$(["'"'"'])/\1/g; s/["'"'"'\\]//g; s/[{},]/ /g'
GH_PR_FLAGS='([[:space:]]+-.*)?'
GH_BRANCH_DELETE="${W}gh[[:space:]](.*[[:space:]])?(repo[[:space:]]+sync.*--force|pr${GH_PR_FLAGS}[[:space:]]+(close|merge)([[:space:]].*)?[[:space:]](-[a-z]*d|--delete-branch))"
GH_PR_MERGE="${W}gh[[:space:]](.*[[:space:]])?pr${GH_PR_FLAGS}[[:space:]]+merge${E}"
while IFS= read -r g; do …GH_PR_MERGE → MERGE_MSG; GH_BRANCH_DELETE → FORCE_MSG…
done < <(printf '%s\n' "$joined" | tr '[:upper:]' '[:lower:]' | sed -E "$UNQUOTE" | tr '\n;&|' ' \n\n\n'; echo)
```

## Verification

- Probe commit `test(hooks): B1.108 hook-smoke probes gh pr words quoted in pieces`, no `(red)` marker (no vitest
  file; B1.106). Red: `scripts/hook-smoke.sh` exit 1, 20 FAIL, 846 ok (prototype: same).
- Green `chore(hooks): B1.108 guard-bash reads gh pr words unquoted`: "hook-smoke: 866 probes OK" (838 + 28),
  `/bin/bash` 3.2 locally, bash 5 in CI. Mutants (prototype, 9/9 killed): no `$NAME` removal → 2 probes fail; no
  `$'`/`$"` → 5; no `\` → 2; no `'` → 8; no `"` → 3; no brace → 3; no comma → 2; no lower case → 3; no `sed` → 20.
- 139 KB and 300-segment timings re-run on the green commit and stated in the PR. `pnpm lint && pnpm typecheck` exit
  0; `pnpm test` 403 before and after; mutation: CI only, no src/lib or src/actions change; `next-task.sh --check
B1.108` no overlap; `check-plan-scope.sh`, `check-backlog.sh` OK; CI green.

## Work breakdown

| Step | Role     | Produces           | Commit                                                               |
| ---- | -------- | ------------------ | -------------------------------------------------------------------- |
| 1    | dev-lead | probes             | `test(hooks): B1.108 hook-smoke probes gh pr words quoted in pieces` |
| 2    | dev-lead | rule, header, docs | `chore(hooks): B1.108 guard-bash reads gh pr words unquoted`         |
| 3    | reviewer | diff review        | `docs(backlog): B1.108 review pass N`                                |

Plan review: · Plan approved by: · Rounds: 1
