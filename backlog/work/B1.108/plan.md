# B1.108 plan — guard-bash lets `gh pr` merge or delete the branch when `pr`, the subcommand or the flag is quoted in pieces (tooling, no §)

Approach B (normalize, the card's prior art), one `sed` for the **whole command**, not one per segment: the gh pr
rules read an unquoted, lower-case copy of each segment, as the shell hands gh its words. `UNQUOTE` removes `$NAME`,
`${NAME}`, `$1`/`${1}`, `$@`/`${@}`, `$*`/`${*}` (empty when unset), the `$` of `$'…'`/`$"…"`, then every `'` `"`
`\`, and turns `<` `>` into spaces (a redirect ends a word: `merge>/dev/null`); `BRACE_ONE`, looped (`:b … tb`),
expands a brace list one item at a time with its prefix and suffix (`-{c,d}` → `-c -d`, `{merge,}` → `merge`), then
the leftover `{` `}` go. A loop over that copy runs `GH_PR_MERGE` and `GH_BRANCH_DELETE`, moved out of the segment
loop; their quote classes (`[\"']?`, `["'\\$]*`, dead on the copy) go. The git push, config and `gh api` rules still
read the original text (removing `$'` would hide `PUSH_FORCE`'s `$'…\…'` signal). No advice (tier quick, no section).
Risk tier **high** (`.claude/`, hooks) → the lead's `approve`; the PR carries `config-change-approved` (D-19).
Dev-lead writes the hook and `scripts/` (interactive, as B1.103, B1.105, B1.107). Round 2 takes review round 1's two
reasons (`${@}merge`, `-{d,d}`) and its note (`merge>/dev/null`, exit 0 today, the same lines) into this card.

Weighed against A' (per-pattern widening: a class `(["'\\{},]|\$NAME|\${NAME})*` around every letter of `gh`, `pr`,
`close`, `merge`, `-d`, `--delete-branch`): longer to read; prototyped (round 1 forms) it missed `g''h pr merge 7`, and
a class cannot expand `-{c,d}`. Prototypes on `4c79bec`, `/bin/bash` 3.2, session scratch (`gen.js`: a 2400-line
`git commit -F -` heredoc naming `gh pr view` and `push`, 139 KB, one segment; 300 `gh pr view` segments joined by
`&&`, 11 KB), each pair side by side; the long segment's time is the other section-2 rules', unchanged by either:

| Hook                                   | 300 segments, 11 KB | one segment, 139 KB |
| -------------------------------------- | ------------------- | ------------------- |
| base `4c79bec`                         | 1.85 / 2.03 s       | 364 s               |
| B, one sed per command (plan, round 2) | 1.86 / 2.08 s       | 364 s               |
| A', per-pattern widening (round 1)     | 2.45 / 2.60 s       | 377 s (base 377 s)  |

B1.107's per-segment `sed` cost ×2 on many segments (3.85 s); one `sed` per command is 3 forks per call.

Blocked after (29, all exit 0 today). Merge (`agents never merge`, 13): `gh pr $'merge' 7`, `gh $"pr" merge 7`,
`gh pr \merge 7`, `gh pr m''erge 7`, `gh pr {merge,} 7`, `gh pr {merge,view} 7`, `g''h pr merge 7`,
`gh pr -R o/r m"erg"e 7`, `GH PR $'MERGE' 7`, `gh pr $EMPTY merge 7`, `gh pr ${@}merge 7`, `gh pr ${1}merge 7`,
`gh pr merge>/dev/null 7`. Delete (`force pushes`, 16): `gh pr $'close' 7 -d`, `gh $'pr' close 7 --delete-branch`,
`gh pr \close 7 -d`, `gh pr close 7` + `-'d'`, `"-"d`, `--delete-'branch'`, `{-d,}`, `{,--delete-branch}`,
`-{d,d}`, `-{c,d} x`, `-{c,x,d}`, `--{delete-branch,delete-branch}`, `$X-d`, `${X}-d`;
`gh pr $EMPTY -R o/r close 7 -d`, `gh pr close>/dev/null 7 -d`. Allowed (9): `gh pr close 7`,
`gh pr close 7 -c "superseded"`, `gh pr -R o/r view 7`, `gh pr view 7 --json mergeable`, `git merge origin/main`,
`gh pr view 7 --json number,title,mergeStateStatus`, `gh pr close "$N" -c 'superseded by #8'`,
`gh pr list --json title,headRefName -q '.[].title' > out.txt`, `gh pr {view,diff} 7`.

Costs (header and `hooks.md`): blocked too, a gh pr segment whose unquoted text holds ` -d` or a merge word: a literal
`'$X'-d` or `\$X-d`, `-c "$WHY-d"`, `--comment 'see {a,-d}'`, a commit message quoting `gh pr m''erge`; a command with
both a force push and a gh pr merge or delete may get the other message (the gh pr loop now runs first). Still out of
reach for the gh pr rules: an escape the shell expands (`$'\x2dd'`, `$'m\145rge'`), `${X:--d}` and other operator
expansions, nested or adjacent brace lists (`-{x,{c,d}}`), words joined by `${IFS}`, a word in a set variable,
`$(…)`, an alias; for `gh api` (B1.103) and git push (B1.24), a word quoted in pieces (`pulls/7/m''erge`, `-'f'`).

## Files

| File                          | Change                                                                                      | Why          |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------ |
| `.claude/hooks/guard-bash.sh` | `UNQUOTE`, `BRACE_ONE`, a loop over the copy for the two gh pr rules; quote classes; header | Acceptance 1 |
| `scripts/hook-smoke.sh`       | section "gh pr words quoted in pieces … (B1.108)": 29 blocked, 9 allowed                    | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: the unquoted copy, the costs, what stays out of reach                       | Acceptance 1 |
| `backlog/work/B1.108/*`       | plan, review, pr-body                                                                       | pipeline     |

## Interfaces touched

`guard-bash.sh` (PreToolUse Bash): exit 2 with the existing `MERGE_MSG` / `FORCE_MSG` on the 29 forms; exit 0 otherwise as today.

```bash
UNQUOTE='s/\$([a-z_][a-z0-9_]*|[0-9@*])|\$\{([a-z_][a-z0-9_]*|[0-9@*])\}//g; s/\$(["'"'"'])/\1/g; s/["'"'"'\\]//g; s/[<>]/ /g'
BRACE_ONE='s/([^[:space:]{}]*)\{([^[:space:]{},]*),([^[:space:]{}]*)\}([^[:space:]{}]*)/\1\2\4 \1{\3}\4/'
GH_PR_FLAGS='([[:space:]]+-.*)?'
GH_BRANCH_DELETE="${W}gh[[:space:]](.*[[:space:]])?(repo[[:space:]]+sync.*--force|pr${GH_PR_FLAGS}[[:space:]]+(close|merge)([[:space:]].*)?[[:space:]](-[a-z]*d|--delete-branch))"
GH_PR_MERGE="${W}gh[[:space:]](.*[[:space:]])?pr${GH_PR_FLAGS}[[:space:]]+merge${E}"
while IFS= read -r g; do …GH_PR_MERGE → MERGE_MSG; GH_BRANCH_DELETE → FORCE_MSG…
done < <(printf '%s\n' "$joined" | tr '[:upper:]' '[:lower:]' | sed -E -e "$UNQUOTE" -e ':b' -e "$BRACE_ONE" -e 'tb' -e 's/[{}]//g' \
  | tr '\n;&|' ' \n\n\n'; echo)
```

## Verification

- Probe commit `test(hooks): B1.108 hook-smoke probes gh pr words quoted in pieces`, no `(red)` marker (no vitest
  file; B1.106). Red: `scripts/hook-smoke.sh` exit 1, 29 FAIL, 847 ok (prototype: same).
- Green `chore(hooks): B1.108 guard-bash reads gh pr words unquoted`: "hook-smoke: 876 probes OK" (838 + 38),
  `/bin/bash` 3.2 locally, bash 5 in CI. Mutants (prototype, 13/13 killed, 0 allow probes broken): no variable
  removal → 6 probes fail; no `${…}` → 3; no positional → 2; no `$'`/`$"` → 5; no `\` → 2; no `'` → 8; no `"` → 3;
  no `<>` → 2; no brace expansion → 5; one pass, no loop → 1; leftover braces kept → 3; no lower case → 5; no `sed` → 29.
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
