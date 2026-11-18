# B1.108 plan — guard-bash lets `gh pr` merge or delete the branch when `pr`, the subcommand or the flag is quoted in pieces (tooling, no §)

Approach B (normalize, the card's prior art), one `sed` for the **whole command**, not one per segment: the gh pr
rules read an unquoted, lower-case copy of each segment, as the shell hands gh its words. `UNQUOTE` removes `$NAME`,
`${NAME}`, `$1`/`${1}`, `$@`/`${@}`, `$*`/`${*}` (empty when unset), the `$` of `$'…'`/`$"…"`, then every `'` `"`
`\`, and turns `<` `>` into spaces (a redirect ends a word: `merge>/dev/null`); `BRACE_ONE` (flag `g`) takes one item,
with its prefix and suffix, off every brace list on the line (`-{c,d}` → `-c -d`, `{merge,}` → `merge`). It runs a
fixed **four** times, never in a loop, so a list's first five items are expanded and a word with many commas costs at
most four linear passes (round 2's `:b … tb` loop took 9 s to minutes on 3 KB); then the leftover `{` `}` go. A loop over that copy runs `GH_PR_MERGE` and `GH_BRANCH_DELETE`, moved out of the segment
loop; their quote classes (`[\"']?`, `["'\\$]*`, dead on the copy) go. The git push, config and `gh api` rules still
read the original text (removing `$'` would hide `PUSH_FORCE`'s `$'…\…'` signal). No advice (tier quick, no section).
Risk tier **high** (`.claude/`, hooks) → the lead's `approve`; the PR carries `config-change-approved` (D-19).
Dev-lead writes the hook and `scripts/` (interactive, as B1.103, B1.105, B1.107). Round 2 took review round 1's two
reasons (`${@}merge`, `-{d,d}`) and its note (`merge>/dev/null`, exit 0 today, the same lines) into this card; round 3
bounds the brace expansion (review round 2). Round 4 (diff review pass 1, both findings; the lead chose option a):
`BRACE_ONE`'s prefix, item and suffix classes also exclude `;` `&` `|` `(` `)` and the backtick, where the shell ends a
word, so a separator glued to a list (`{7,-d};`, `({gh,pr,merge,7})`) is no longer copied onto every item and then
split off by `tr`; and `${…}` takes `[0-9]+` (`${10}`). Round 5 (plan review round 4; the lead chose option a): the
variable removal also takes a subscript (`$X[1]`, `${X[1]}`, empty when unset in bash and zsh) and zsh's flags before
the name (`${=X}`, `${~X}`, `${^X}`, `${(f)X}`), since the session shell is zsh; round 4's probes use a lower-case
`merge`. Round 6 (plan review round 5, a regression in round 5): a subscript or a zsh flag group is removed only when
it holds no space, `(`, backtick, `;`, `&` or `|` (flags: no space or paren), so `$X[; gh pr merge 7 #]` or
`${X[$(gh pr merge 7)]}`, where the shell runs the hidden command, no longer hides it from the copy; 9 probes guard
it, one per excluded character. Same lines, no other change. Round 7 (diff review pass 2, 3 findings; the lead chose
option a): the two subscript classes split by what ends each one in the shell. After a bare `$NAME` (bash: not a
subscript, a glob) the class refuses a space or `,` (`{$X[,-d,-c,]}` hands gh `-d`, a regression at `5f9884b2`); a
`;` `&` `|` `(` or backtick there needs a space or a brace list to form a visible command, so the narrower class still
blocks round 6's probes. Inside `${X[…]}` the class allows a space (`${X[ 1 ]}merge` merges) and refuses `}`, `(` and a
backtick (`${X[a}; gh pr merge 7; {]}`, `${X[$(…)]}`, ``${X[`…`]}``). `hooks.md` writes `\|` in its table row
(a bare `|` cut the row). Header and `hooks.md` add out of reach: a glob (`gh pr [m]erge 7`, `m?rge`), a brace
sequence (`-{c..d}`), a brace item holding `}` (`{$X[},-d}`). Round 8 (diff review pass 3, a regression: the regex
also matched a `${X[` the shell never expands, inside single quotes or after `\`, and deleted plain command text;
the lead chose option a, a fourth pass). Round 9 (plan review round 8: after `$$` a `${X[` is not an expansion
either, so round 8's narrower token still hid `$${X[;{gh,pr,merge,7};]}`): instead of naming each context where
`${` is not expanded (quotes, `\$`, `$$`, a quoted here-doc), the deleted text itself can hold nothing the shell
treats specially. Inside `${X[…]}` the subscript is one token with optional spaces around it, and the token holds no
space, quote, backslash, `;` `&` the pipe, `(` `)`, backtick, `{` `}` or `,`: a hidden command needs a separator and
a word break (a space or a brace list) together, and the token holds neither, whatever context the `${` sits in.
`${X[ 1 ]}` still reads as empty. No `\$` step. The merge rule's out-of-reach list names a glob too (review note).
Round 10 (plan review round 9: the zsh flag group `${(…)X}` and the bare `$X[…]` subscript still used their own,
wider classes, so `'${(';{gh,pr,merge,7};')X}'` hid a merge, exit 0 on main too): one class, "no shell
metacharacter", serves all three deleted spans (bare subscript, flag group, braced token). Round 11 (plan review
round 10: refusing `(` `)` after a bare `$X` re-opened zsh's `$X[(r)x]merge`, blocked at `2889c4fd`): the bare
subscript alone allows `(` `)`; it still refuses a space and a comma, so `$X[$({gh,pr,merge,7})]` stays visible.
Round 12 (diff review pass 4: the spaces around `${X[ -d ]}`'s token are word breaks where the shell does not expand
the `${`, so `bash -c 'gh pr close 7 $1' \${X[ -d ]}` hands gh `-d`; main blocks it; the sixth regression of this
kind): a structural fix instead of another class. Main's two gh pr rules come back unchanged as `GH_PR_MERGE_RAW` and
`GH_BRANCH_DELETE_RAW` (with `GH_PR_FLAGS_RAW`, all three copied from `4c79bec`) and run on the original lower-case
segment, exactly as on main; the unquoted copy's rules run as well. A command main blocks is therefore blocked here
by construction, whatever the copy deletes; the copy can only add blocks. The header and `hooks.md` drop the claim
that the deleted text "can never hide a command" and say this instead.

Weighed against A' (per-pattern widening: a class `(["'\\{},]|\$NAME|\${NAME})*` around every letter of `gh`, `pr`,
`close`, `merge`, `-d`, `--delete-branch`): longer to read; prototyped (round 1 forms) it missed `g''h pr merge 7`, and
a class cannot expand `-{c,d}`. Prototypes on `4c79bec`, `/bin/bash` 3.2, session scratch (`gen.js`: a 2400-line
`git commit -F -` heredoc naming `gh pr view` and `push`, 139 KB, one segment; 300 `gh pr view` segments joined by
`&&`, 11 KB), each pair side by side; the long segment's time is the other section-2 rules', unchanged by either:

| Hook                                   | 300 segments, 11 KB | one segment, 139 KB |
| -------------------------------------- | ------------------- | ------------------- |
| base `4c79bec`                         | 1.86 / 1.90 s       | 355 s               |
| B, one sed per command (plan, round 3) | 1.94 / 1.96 s       | 356 s               |
| A', per-pattern widening (round 1)     | 2.45 / 2.60 s       | 377 s (base 377 s)  |

B1.107's per-segment `sed` cost ×2 on many segments (3.85 s); one `sed` per command is 3 forks per call. Brace-heavy
inputs (`gen2.js`), base / round 3, two runs each: `gh pr view 7 && echo` + 2000 `a` + `{` + 1000 commas + `}` (3 KB)
0.09–0.10 / 0.10 s; the same with 4000 `a` (5 KB) 0.10–0.11 / 0.12–0.13 s; 2000 `a` + 500 commas 0.09 / 0.10 s; a
heredoc of a 96 KB one-line JSON array 0.44–0.52 / 0.48–0.49 s.

Blocked after (30, all exit 0 today). Merge (`agents never merge`, 13): `gh pr $'merge' 7`, `gh $"pr" merge 7`,
`gh pr \merge 7`, `gh pr m''erge 7`, `gh pr {merge,} 7`, `gh pr {merge,view} 7`, `g''h pr merge 7`,
`gh pr -R o/r m"erg"e 7`, `GH PR $'MERGE' 7`, `gh pr $EMPTY merge 7`, `gh pr ${@}merge 7`, `gh pr ${1}merge 7`,
`gh pr merge>/dev/null 7`. Delete (`force pushes`, 17): `gh pr $'close' 7 -d`, `gh $'pr' close 7 --delete-branch`,
`gh pr \close 7 -d`, `gh pr close 7` + `-'d'`, `"-"d`, `--delete-'branch'`, `{-d,}`, `{,--delete-branch}`,
`-{d,d}`, `-{c,d} x`, `-{c,x,y,z,d}`, `{a,b,c} {e,f,g} -{c,d}`, `--{delete-branch,delete-branch}`, `$X-d`,
`${X}-d`; `gh pr $EMPTY -R o/r close 7 -d`, `gh pr close>/dev/null 7 -d`. Allowed (10): `gh pr close 7`,
`gh pr close 7 -c "superseded"`, `gh pr -R o/r view 7`, `gh pr view 7 --json mergeable`, `git merge origin/main`,
`gh pr view 7 --json number,title,mergeStateStatus`, `gh pr close "$N" -c 'superseded by #8'`,
`gh pr list --json title,headRefName -q '.[].title' > out.txt`, `gh pr {view,diff} 7`,
`gh pr view 7 --json title,body -q '{t: .title, b: .body}'`.

Rounds 4–5, blocked (21, all exit 0 at `bd10055`). Merge (12): `gh {pr,merge,7};`, `(gh {pr,merge,7})`,
`({gh,pr,merge,7})`, `` `{gh,pr,merge,7}` ``, `true;{gh,pr,merge,7}`, `gh pr ${10}merge 7`, `gh pr ${X[1]}merge 7`,
`gh pr $X[1]merge 7`, `gh pr ${=X}merge 7`, `gh pr ${~X}merge 7`, `gh pr ${^X}merge 7`, `gh pr ${(f)X}merge 7`.
Delete (9): `gh pr close {7,-d};`, `gh pr close {7,-d}&&true`, `gh pr close {7,-d}|cat`, `gh pr {close,7,-d}|cat`,
`gh pr close 7` + `${12}-d`, `${X[1]}-d`, `${X[0]}--delete-branch`, `$X[1]-d`, `${=X}-d`. Round 6, blocked (9; the
5 marked \* exit 0 at `bd10055`, the other 4 are blocked there and guard round 5's regression): merge
`bash -c 'echo $X[; gh pr merge 7 #]'`, `echo $X[$({gh,pr,merge,7})]`\*, ``echo ${X[`{gh,pr,merge,7}`]}``\*,
`echo $X[;{gh,pr,merge,7};]`\*, `echo $X[&&{gh,pr,merge,7}&&]`\*, `echo $X[|{gh,pr,merge,7}|]`\*,
`echo ${(;gh pr merge 7)X}`; delete `echo ${(f)X[$(gh pr close 7 -d)]}`, `gh pr close 7 -c $X[ -d -c ] x` (bash runs
the hidden `gh` in each \* form, checked with a stub). The 30 blocked and 10 allowed above keep their exits. 300
segments: 1.89–1.92 s, `bd10055` 1.94–2.01 s.

Costs (header and `hooks.md`): blocked too, a gh pr segment whose unquoted text holds ` -d` or a merge word: a literal
`'$X'-d` or `\$X-d`, `-c "$WHY-d"`, `--comment 'see {a,-d}'`, a commit message quoting `gh pr m''erge`; a command with
both a force push and a gh pr merge or delete may get the other message (the gh pr loop now runs first). Still out of
reach for the gh pr rules: an escape the shell expands (`$'\x2dd'`, `$'m\145rge'`), `${X:--d}`, `${X:-merge}` and
other operator expansions, a brace list's sixth item on (`-{a,b,c,e,f,d}`), nested or adjacent lists (`-{x,{c,d}}`), a zsh subscript flag inside braces (`${X[(r)x]}`; round 7 blocks `$X[(r)x]`) or a flag group with a space
(`${(j: :)X}`) (plan review round 6 note), words joined by `${IFS}`, a word in a set variable,
`$(…)`, an alias; for `gh api` (B1.103) and git push (B1.24), a word quoted in pieces (`pulls/7/m''erge`, `-'f'`).

## Files

| File                          | Change                                                                                          | Why          |
| ----------------------------- | ----------------------------------------------------------------------------------------------- | ------------ |
| `.claude/hooks/guard-bash.sh` | `UNQUOTE`, `BRACE_ONE`, a loop over the copy for the two gh pr rules; quote classes; header     | Acceptance 1 |
| `scripts/hook-smoke.sh`       | section "gh pr words quoted in pieces … (B1.108)": 30 blocked, 10 allowed; rounds 4–12: 60 more | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: the unquoted copy, the costs, what stays out of reach                           | Acceptance 1 |
| `backlog/work/B1.108/*`       | plan, review, pr-body                                                                           | pipeline     |

## Interfaces touched

`guard-bash.sh` (PreToolUse Bash): exit 2 with the existing `MERGE_MSG` / `FORCE_MSG` on the 90 forms, and on every command main's gh pr rules block; exit 0 otherwise as today.

```bash
UNQUOTE='s/\$([a-z_][a-z0-9_]*(\[[^][:space:]`'"'"'"\\;&|{},]*\])?|[0-9@*])|\$\{(\([^][:space:]()`'"'"'"\\;&|{},]*\))?[=~^]*([a-z_][a-z0-9_]*|[0-9]+|[@*])(\[[[:space:]]*[^][:space:]()`'"'"'"\\;&|{},]*[[:space:]]*\])?\}//g; s/\$(["'"'"'])/\1/g; s/["'"'"'\\]//g; s/[<>]/ /g'
BRACE_ONE='s/([^[:space:]{};&|()`]*)\{([^[:space:]{},;&|()`]*),([^[:space:]{};&|()`]*)\}([^[:space:]{};&|()`]*)/\1\2\4 \1{\3}\4/g'
GH_PR_FLAGS='([[:space:]]+-.*)?'
GH_BRANCH_DELETE="${W}gh[[:space:]](.*[[:space:]])?(repo[[:space:]]+sync.*--force|pr${GH_PR_FLAGS}[[:space:]]+(close|merge)([[:space:]].*)?[[:space:]](-[a-z]*d|--delete-branch))"
GH_PR_MERGE="${W}gh[[:space:]](.*[[:space:]])?pr${GH_PR_FLAGS}[[:space:]]+merge${E}"
while IFS= read -r g; do …GH_PR_MERGE → MERGE_MSG; GH_BRANCH_DELETE → FORCE_MSG…
done < <(printf '%s\n' "$joined" | tr '[:upper:]' '[:lower:]' \
  | sed -E -e "$UNQUOTE" -e "$BRACE_ONE" -e "$BRACE_ONE" -e "$BRACE_ONE" -e "$BRACE_ONE" -e 's/[{}]//g' \
  | tr '\n;&|' ' \n\n\n'; echo)
# main's rules, copied from 4c79bec, renamed *_RAW, run in the segment loop on "$low" before the git push rules:
GH_PR_FLAGS_RAW='([[:space:]]+["'"'"'\\$]*-.*)?'
GH_BRANCH_DELETE_RAW / GH_PR_MERGE_RAW = 4c79bec's GH_BRANCH_DELETE / GH_PR_MERGE with ${GH_PR_FLAGS_RAW}
  [[ "$low" =~ $GH_PR_MERGE_RAW ]] && block "$ME" "$MERGE_MSG"
  [[ "$low" =~ $GH_BRANCH_DELETE_RAW ]] && block "$ME" "$FORCE_MSG"
```

## Verification

- Probe commit `test(hooks): B1.108 hook-smoke probes gh pr words quoted in pieces`, no `(red)` marker (no vitest
  file; B1.106). Red: `scripts/hook-smoke.sh` exit 1, 30 FAIL, 848 ok (prototype: same).
- Green `chore(hooks): B1.108 guard-bash reads gh pr words unquoted`: "hook-smoke: 878 probes OK" (838 + 40),
  `/bin/bash` 3.2 locally, bash 5 in CI. Mutants (prototype, 15/15 killed, 0 allow probes broken): no variable
  removal → 6 probes fail; no `${…}` → 3; no positional → 2; no `$'`/`$"` → 5; no `\` → 2; no `'` → 8; no `"` → 3;
  no `<>` → 2; no brace expansion → 6; three passes → 1; no `g` → 1; leftover braces kept → 4; no lower case → 5;
  no `sed` → 30.
- Rounds 4–6: probes `test(hooks): B1.108 review pass 1 -- probe glued brace lists and expansions` (no marker):
  hook-smoke exit 1, 26 FAIL, 882 ok (prototype: same); then `fix(hooks): B1.108 review pass 1 -- brace lists,
numbers, subscripts and zsh flags`: "hook-smoke: 908 probes OK" (878 + 30). Mutants (prototype, 19/19 killed, 0
  allow probes broken): in `BRACE_ONE`, `;` kept → 4 fail, `&` → 2, `|` → 3, `(` → 2, `)` → 3, backtick → 2; one
  digit in `${…}` → 2; no `$X[…]` → 2; no `${X[…]}` → 3; no `=~^` flags → 4; no `(…)` flags → 1; flags group
  `[^)]*` → 1; the subscript class allowing a space → 1, `(` → 1, backtick → 1, `;` → 1, `&` → 1, `|` → 1.
- Round 7: probes `test(hooks): B1.108 review pass 2 -- probe subscripts that end a word` (no marker), 6: merge
  `gh pr ${X[ 1 ]}merge 7`, ``echo ${X[`gh pr merge 7`]}``, `echo ${X[a}; gh pr merge 7; {]}`; delete
  `bash -c 'gh pr close 7 -c {$X[,-d,-c,]}'`, `gh pr close 7 -c {$X[,-d,-c,]}`, `gh pr close 7 ${X[ 1 ]}-d`. Red at
  `5f9884b2`: exit 1, 4 FAIL, 910 ok; then `fix(hooks): B1.108 review pass 2 -- subscript classes, table pipe`:
  "hook-smoke: 914 probes OK". Mutants (prototype, 6/6 killed, 0 allow probes broken): bare class allowing a space → 2
  fail, `,` → 6; braced class allowing `}` → 1, `(` → 1, backtick → 1, refusing a space → 2. Round 6's 30 probes, 9
  round-5 triggers and 10 allowed keep their exits.
- Rounds 9–11: probes `test(hooks): B1.108 review pass 3 -- probe a subscript across a quote or escape` (no marker), 18:
  merge `echo '${X[ '; gh pr merge 7; ' ]}'`, `echo '${X['|gh pr merge 7|']}'`, `echo \${X[ ;gh pr merge 7; ]}`,
  `bash -c 'gh "$@"' '${X[ ' pr merge 7 -b ' ]}'`, `bash -c 'gh "$@"' \${X[ pr merge 7 -b ]}`,
  `echo '${X['&&{gh,pr,merge,7}&&']}'`, `echo \${X[&&{gh,pr,merge,7}&&]}`, `echo $${X[;{gh,pr,merge,7};]}` and the
  same with `&&` and the pipe, `echo '${(';{gh,pr,merge,7};')X}'`, `echo '${(f'&&{gh,pr,merge,7}&&'f)X}'`, the same
  with the pipe; delete `echo '${X[ '&&gh pr close 7 -d&&' ]}'`, `echo $${X[;{gh,pr,close,7,-d};]}`,
  `echo '${(';{gh,pr,close,7,-d};')X}'`; and `gh pr $X[(r)x]merge 7`, `gh pr close 7 $X[(r)x]-d`. Red at
  `2889c4fd`: exit 1, 10 FAIL, 922 ok (the other 8 are blocked there and guard the class); then `fix(hooks): B1.108
review pass 3 -- one class without shell metacharacters`: "hook-smoke: 932 probes OK". Mutants (prototype, 0 allow
  probes broken): the class reduced to "no space" in all three places → 17 fail; separators and brace characters
  allowed in all three → 10; the flag group alone reduced → 4; the bare subscript alone → 6; the bare subscript
  refusing `(` `)` → 2; the braced token allowing a space → 1. One character group at a time survives by
  design: each group alone is covered by another. Diff review pass 4 (the lead's fourth pass).
- Round 12: probes `test(hooks): B1.108 review pass 4 -- probe a token passed to gh as a word` (no marker), 6:
  merge `bash -c 'gh pr -R o/r $1 7' \${X[ merge ]}` and its nested form; delete `bash -c 'gh pr close 7 $1'
\${X[ -d ]}`, the same with `"$1"` and `$${X[ -d ]}`, with `--delete-branch`, and the nested form. Red at
  `3c489387`: exit 1, 6 FAIL, 932 ok; then `fix(hooks): B1.108 review pass 4 -- main's gh pr rules on the original
text`: "hook-smoke: 938 probes OK". Mutant: drop the two `_RAW` checks → 6 fail. Diff review pass 5 (the lead's call).
- 139 KB, 300-segment and brace-heavy timings re-run on the green commit and stated in the PR. `pnpm lint && pnpm typecheck` exit
  0; `pnpm test` 403 before and after; mutation: CI only, no src/lib or src/actions change; `next-task.sh --check
B1.108` no overlap; `check-plan-scope.sh`, `check-backlog.sh` OK; CI green.

## Work breakdown

| Step | Role     | Produces           | Commit                                                                               |
| ---- | -------- | ------------------ | ------------------------------------------------------------------------------------ |
| 1    | dev-lead | probes             | `test(hooks): B1.108 hook-smoke probes gh pr words quoted in pieces`                 |
| 2    | dev-lead | rule, header, docs | `chore(hooks): B1.108 guard-bash reads gh pr words unquoted`                         |
| 3    | reviewer | diff review        | `docs(backlog): B1.108 review pass N`                                                |
| 4    | dev-lead | rounds 4–5 probes  | `test(hooks): B1.108 review pass 1 -- probe glued brace lists and expansions`        |
| 5    | dev-lead | rounds 4–5 fix     | `fix(hooks): B1.108 review pass 1 -- brace lists, numbers, subscripts and zsh flags` |
| 6    | dev-lead | round 7 probes     | `test(hooks): B1.108 review pass 2 -- probe subscripts that end a word`              |
| 7    | dev-lead | round 7 fix, docs  | `fix(hooks): B1.108 review pass 2 -- subscript classes, table pipe`                  |
| 8    | dev-lead | round 10 probes    | `test(hooks): B1.108 review pass 3 -- probe a subscript across a quote or escape`    |
| 9    | dev-lead | round 10 fix, docs | `fix(hooks): B1.108 review pass 3 -- one class without shell metacharacters`         |
| 10   | dev-lead | round 12 probes    | `test(hooks): B1.108 review pass 4 -- probe a token passed to gh as a word`          |
| 11   | dev-lead | round 12 fix, docs | `fix(hooks): B1.108 review pass 4 -- main's gh pr rules on the original text`        |

Plan review: approved, round 12 · Plan approved by: lead, 2026-11-18 (round 11; round 12 pending) · Rounds: 5
