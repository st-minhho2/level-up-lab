# B1.109 plan — guard-bash lets `gh pr` merge or delete the branch through a word split by a parameter inside an unexpanded `${X[ … ]}` (tooling, no §)

Approach: the reviewer's prototype (B1.108 diff review pass 5, `fix6`) plus one step it needs. No advice (tier quick, no
section). Risk tier **high** (`.claude/`, hooks) → the lead's `approve`; the PR carries `config-change-approved` (D-19).
Dev-lead writes the hook and `scripts/` (interactive, as B1.103 to B1.108).

1. In `UNQUOTE`'s variable removal, the braced subscript's token also excludes `$`. A token that holds a parameter
   (`m$@erge`) is no longer deleted whole; the copy keeps the span and removes only the parameter, so a word the
   shell hands on whole where it does not expand the `${` (after `\` or `$$`, then `$1`) is visible (`merge`, `-d`).
2. Step 1 alone loses 7 forms main blocks today (prototype `m1`: `gh pr ${X[$i]}merge 7`, `${X[ $i ]}merge`,
   `${X[$i+$j]}merge`, `${X[$#]}merge`, `${X[$@]}merge`, `close 7 ${X[$i]}-d`, `close 7 ${X[ $i ]}-d`): the kept span
   leaves `$x[]` glued to the word. So a second substitution, right after the first and before the quotes go, removes
   a braced subscript whose token, its parameters now gone, holds **no letter** and no shell metacharacter (it may hold
   `$`: `$#`). Every gh word that matters (`merge`, `close`, `-d`, `--delete-branch`) holds a letter, so a span
   this step deletes can hide none; a span that keeps a letter (`\${x[ merge ]}`) stays visible. It also blocks
   `gh pr ${X[${i}]}merge 7` (exit 0 on main: the inner `${i}` holds `{`).

The bare `$X[…]` and the flag group `${(…)X}` keep their class: they refuse a space and a comma, so an unexpanded one
stays one word (`$X[merge]`), never a bare gh word. Header and `hooks.md`: the out-of-reach entry goes (both lists);
the copy's description names the `$` exclusion and the letterless second step. `*_RAW` rules unchanged.

## Files

| File                          | Change                                                                   | Why          |
| ----------------------------- | ------------------------------------------------------------------------ | ------------ |
| `.claude/hooks/guard-bash.sh` | `UNQUOTE`: `$` out of the braced token; letterless second step; header   | Acceptance 1 |
| `scripts/hook-smoke.sh`       | section "a word split by a parameter in `${X[ … ]}` (B1.109)": 20 probes | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: drop the out-of-reach entry (2 places), name the steps   | Acceptance 1 |
| `backlog/work/B1.109/*`       | plan, review, pr-body                                                    | pipeline     |

## Interfaces touched

`guard-bash.sh` (PreToolUse Bash): exit 2 with `MERGE_MSG` / `FORCE_MSG` on the 17 blocked forms below; exit 0 otherwise as today.

```bash
# braced token class, step 1:   [^]$[:space:]()`'"\\;&|{},]   (was [^][:space:]()`'"\\;&|{},])
# step 2, inserted after step 1 in UNQUOTE (same sed, one more expression, before s/\$(["'])/\1/g):
s/\$\{(\(META\))?[=~^]*([a-z_][a-z0-9_]*|[0-9]+|[@*])\[[[:space:]]*[^][:space:]a-z()`'"\\;&|{},]*[[:space:]]*\]\}//g
```

## Verification

- Probes `test(hooks): B1.109 hook-smoke probes a word split by a parameter in a subscript`, no `(red)` marker
  (B1.106). Blocked, merge (`agents never merge`): the card's `\${X[ m$@erge ]}`, `\${X[ m$EMPTY$@erge ]}`, the nested
  merge form, `\${X[ M$@ERGE ]}`, `gh pr ${X[${i}]}merge 7`, and the guards `${X[$i]}merge`, `${X[ $i ]}merge`,
  `${X[$i+$j]}merge`, `${X[$#]}merge`, `${X[$@]}merge`, `\${X[ m${@}erge ]}` (as `$1`); delete (`force pushes`): `\${X[ -$@d ]}`, `$${X[ -$@d ]}`,
  the nested delete form, `\${X[ --delete-$@branch ]}`, and the guards `close 7 ${X[$i]}-d`, `close 7 ${X[ $i ]}-d`.
  Allowed: `gh pr view 7 --json title -q '.title' ${X[$i]}`, `gh pr close 7 -c "see ${X[ $i ]}"`,
  `echo \${X[ m$@erge ]}`. Red on main `179971b`: exit 1, 9 FAIL, 949 ok (prototype: same 9 fail; the 8 guards and
  3 allowed pass on main).
- Green `chore(hooks): B1.109 guard-bash keeps a subscript token that holds a parameter`: "hook-smoke: 958 probes OK"
  (938 + 20; prototype on 938 probes: OK). Mutants (prototype): no `$` in step 1 → 9 fail; no step 2 → 7 guards +
  `${X[${i}]}` fail (`m1`); step 2 allowing letters → the 8 `$@` triggers + `m${@}erge` fail; step 2 refusing `$` →
  `$#` fails.
- Timings, base `179971b` / prototype, side by side (`gen.js`, session scratch): 300 `gh pr view` segments (9 KB)
  2.37 / 2.09, 2.37 / 2.31 s; one 139 KB heredoc segment: 355.4 / 355.4 s. Re-run on the green commit, stated in the PR.
- `pnpm lint && pnpm typecheck` exit 0; `pnpm test` 403 before and after; mutation: CI only, no src/lib or
  src/actions change; `next-task.sh --check B1.109`, `check-plan-scope.sh`, `check-backlog.sh` OK; CI green.

## Work breakdown

| Step | Role     | Produces           | Commit                                                                             |
| ---- | -------- | ------------------ | ---------------------------------------------------------------------------------- |
| 1    | dev-lead | probes             | `test(hooks): B1.109 hook-smoke probes a word split by a parameter in a subscript` |
| 2    | dev-lead | rule, header, docs | `chore(hooks): B1.109 guard-bash keeps a subscript token that holds a parameter`   |
| 3    | reviewer | diff review (≤ 3)  | `docs(backlog): B1.109 review pass N`                                              |

Plan review: · Plan approved by: · Rounds: 1
