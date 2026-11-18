# B1.109 plan — guard-bash lets `gh pr` merge or delete the branch through a word split by a parameter inside an unexpanded `${X[ … ]}` (tooling, no §)

Approach: a second unquoted copy, added beside main's, never in place of it. No advice (tier quick, no section). Risk
tier **high** (`.claude/`, hooks) → the lead's `approve`; the PR carries `config-change-approved` (D-19). Dev-lead
writes the hook and `scripts/` (interactive, as B1.103 to B1.108).

`UNQUOTE_KEEP` is main's `UNQUOTE` with `$` added to the braced subscript token's excluded set, so a token that holds
a parameter (`m$@erge`) is kept and only the parameter goes: the word the shell hands on whole where it does not
expand the `${` (after `\` or `$$`, then `$1`) is visible (`merge`, `-d`). The gh pr loop reads both copies, main's
`UNQUOTE` first; `*_RAW` still read the original text. Main's copy and rules are unchanged, so every command main
blocks stays blocked by construction; the new copy only adds blocks. Round 1 replaced main's class in place and lost
`gh pr ${X[$i+n]}merge 7` and 10 more forms main blocks (review round 1, finding 1; guarded below). Out of reach,
main too (header, `hooks.md`): a subscript holding a braced, subscripted or arithmetic expansion (review round 2 note; `${X[$i]}merge` is
blocked) (`${X[${i}]}merge`, `${X[$Y[1]]}merge`,
`${X[$((1))]}merge`). The card's out-of-reach entry goes from both lists.

## Files

| File                          | Change                                                                   | Why          |
| ----------------------------- | ------------------------------------------------------------------------ | ------------ |
| `.claude/hooks/guard-bash.sh` | `UNQUOTE_KEEP`; the gh pr loop reads both copies; header                 | Acceptance 1 |
| `scripts/hook-smoke.sh`       | section "a word split by a parameter in `${X[ … ]}` (B1.109)": 27 probes | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: the second copy; out-of-reach entries                    | Acceptance 1 |
| `backlog/work/B1.109/*`       | plan, review, pr-body                                                    | pipeline     |

## Interfaces touched

`guard-bash.sh` (PreToolUse Bash): exit 2 with `MERGE_MSG` / `FORCE_MSG` on the 12 triggers below; otherwise as today.

```bash
TOKEN='[[:space:]]*[^][:space:]()' TOKEN_NO_PARAM='[[:space:]]*[^]$[:space:]()'
UNQUOTE_KEEP="${UNQUOTE/"$TOKEN"/$TOKEN_NO_PARAM}" # one match: the braced token; bash 3.2 checked
done < <(for u in "$UNQUOTE" "$UNQUOTE_KEEP"; do
  printf '%s\n' "$joined" | tr '[:upper:]' '[:lower:]' \
    | sed -E -e "$u" -e "$BRACE_ONE" -e "$BRACE_ONE" -e "$BRACE_ONE" -e "$BRACE_ONE" -e 's/[{}]//g' \
    | tr '\n;&|' ' \n\n\n'; echo
done)
```

## Verification

- Probes `test(hooks): B1.109 hook-smoke probes a parameter-split subscript word`, no `(red)` marker
  (B1.106). Triggers (exit 0 on main): merge `bash -c 'gh pr -R o/r $1 7'` + `\${X[ m$@erge ]}`,
  `\${X[ m$EMPTY$@erge ]}`, `\${X[ M$@ERGE ]}`, `$${X[ m$@erge ]}`, `\${X[ m$1erge ]}`, `\${(f)X[ m$@erge ]}`, the
  nested form; delete `bash -c 'gh pr close 7 $1'` + `\${X[ -$@d ]}`, `$${X[ -$@d ]}`, `\${X[ --delete-$@branch ]}`,
  `\${10[ -$@d ]}`, the nested form. Guards (exit 2 on main): `\${X[ m${@}erge ]}` as `$1`; `gh pr` + `${X[$i]}merge`,
  `${X[ $i ]}merge`, `${X[$i+$j]}merge`, `${X[$#]}merge`, `${X[$@]}merge`, `${X[$i+n]}merge`, `${X[ i+$j ]}merge`,
  `merge${X[i+$j]}`; `gh pr close 7` + `${X[$i]}-d`, `${X[ $i ]}-d`, `${X[ n-$i ]}-d`. Allowed:
  `gh pr view 7 --json title -q '.title' ${X[$i]}`, `gh pr close 7 -c "see ${X[ $i ]}"`, `echo \${X[ m$@erge ]}`.
  Red on main `179971b`: exit 1, 12 FAIL, 953 ok (prototype list: base 12 BAD, union 0).
- Green `chore(hooks): B1.109 guard-bash adds a copy keeping parameter tokens`: "hook-smoke: 965 probes
  OK" (938 + 27). Mutants (prototype): loop over `UNQUOTE_KEEP` only → 11 guards fail; over `UNQUOTE` only → 12
  triggers fail. Review round 1's 25 commands: 19 blocked, its 3 allowed pass, 3 nested forms
  (`${X[${Y[${i}]}]}merge`, `${X[$Y[1]]}merge`, `${X[$((1))]}merge`) exit 0, as on main.
- Timings, base `179971b` / prototype, side by side (`gen.js`, session scratch): 300 `gh pr view` segments (9 KB)
  1.87 / 1.89, 1.84 / 1.96 s (two `sed` forks more per command); one 139 KB heredoc segment 334.3 / 334.3 s. Re-run on the green commit, stated in the PR.
- `pnpm lint && pnpm typecheck` exit 0; `pnpm test` 403 before and after; mutation: CI only, no src/lib or
  src/actions change; `next-task.sh --check B1.109`, `check-plan-scope.sh`, `check-backlog.sh` OK; CI green.

## Work breakdown

| Step | Role     | Produces           | Commit                                                                   |
| ---- | -------- | ------------------ | ------------------------------------------------------------------------ |
| 1    | dev-lead | probes             | `test(hooks): B1.109 hook-smoke probes a parameter-split subscript word` |
| 2    | dev-lead | rule, header, docs | `chore(hooks): B1.109 guard-bash adds a copy keeping parameter tokens`   |
| 3    | reviewer | diff review (≤ 3)  | `docs(backlog): B1.109 review pass N`                                    |

Plan review: approved, round 2 · Plan approved by: · Rounds: 1 (plan round 2: review round 1, both findings)
