# B1.109 review

## Plan review (round 1)

Plan at `035ec8f1`. Evidence, all under `$TMPDIR/b1109probe/` (`/bin/bash` 3.2.57):

- `base/` is `.claude/hooks` of the worktree at `035ec8f1` (main `179971b`'s hook). `fix/` is the dev-lead's prototype
  `.claude/hooks`. Its diff against base is the one `UNQUOTE` line: `$` added to the braced token's excluded set, and
  the letterless second expression.
- `cases.txt` is the dev-lead's 22-line probe list. `mine.txt` holds 26 more commands. `run2.sh` is the dev-lead's
  `run.sh` with placeholders (`MRG`, `DLF`, `PP`) expanded at run time, because guard-bash reads my own command text.
- `$TMPDIR/b1109c` is `git clone` of the worktree. `scripts/hook-smoke.sh` runs there with each hook copied in. That
  clone has no `node_modules`, so 14 probes of other hooks fail on every hook variant (js-yaml, frontmatter, Prettier).
  The counts below are guard-bash rows only. Base, prototype and `union/` each give 349 ok and 0 FAIL there, with
  the same 14 failures elsewhere.

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: tooling, no section. The Files table has 4 rows, the same three files the card's Spec line names plus `work/B1.109/*`. `check-plan-scope.sh`: "OK: chore/B1.109-param-split changes only paperwork"                                                                                                                                                  |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | fail: n/a for TypeScript, but the step-2 expression is not pasted exactly. It shows `(\(META\))?` where the hook needs the flag-group class (reason 2)                                                                                                                                                                                                     |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice, stated (tier quick, no section)                                                                                                                                                                                                                                                                                                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | fail: the card has 4 acceptance lines, all measurable. The approach breaks acceptance 2, "nothing main blocks passes": 8 forms main blocks exit 0 on the prototype (reason 1)                                                                                                                                                                              |
| verification lists exact commands with expected numbers                                | pass: reproduced. `cases.txt` on base gives 9 BAD (the card's 6, `--delete-$@branch`, `M$@ERGE`, `${X[${i}]}`); on the prototype 0 BAD. hook-smoke guard-bash rows on the prototype: 349 ok, 0 FAIL. The 300-segment timing is base 2.28 / 2.07 s, prototype 2.25 / 2.00 s. I did not re-run the 139 KB timing. The probe list lacks the forms in reason 1 |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: a probe `test(hooks): …` commit with no `(red)` marker, a stated deviation (B1.106 to B1.108 precedent). Then green `chore(hooks): …` and review. No skeleton or map row (no section)                                                                                                                                                                |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a, no section. The tier is high (`.claude/`), so the lead's `approve` gates the build. D-19's label is named                                                                                                                                                                                                                                       |
| no settled D-n contradicted                                                            | fail: D-9 (agents never merge). `gh pr ${X[$i+n]}merge 7` merges in bash 3.2. Main blocks it and the prototype lets it through (reason 1)                                                                                                                                                                                                                  |
| `scripts/next-task.sh --check B1.109` on the committed plan says no overlap            | pass: `[next-task] B1.109: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                       |

Confirmed on the prototype, beyond the plan's own probes:

- The prototype also blocks these, and main exits 0 on each: `$${X[ m$@erge ]}` (the merge twin of the card's
  `$${X[ -$@d ]}`), `\${(f)X[ m$@erge ]}`, `\${=X[ m$@erge ]}`, `\${X[ m$1erge ]}`, `\${X[ -$@d$@ ]}`,
  `\${10[ -$@d ]}`, `\${@[ -$@d ]}` (each through `bash -c '… $1'`), and `gh pr ${X[$Y[1]]}merge 7`.
- These stay allowed on both hooks: `gh pr view 7 ${X[$i]}`, `gh pr view 7 ${X[i+$j]}` and
  `gh pr list --limit ${X[ $i ]}`.

### Reasons (changes requested)

1. **Step 1 loses more than the 7 forms step 2 recovers. Every subscript token that holds a letter and a parameter
   is lost, so 8 forms main blocks exit 0 on the prototype.**

   Step 1 keeps every braced span whose token holds `$`. Step 2 removes the span again only when, with the
   parameters gone, no letter is left. In a token with a letter, such as an arithmetic subscript that names a
   variable without `$`, step 1 removes only the parameter. The `$x[i+]` that is left stays glued to the next word.
   Main removes the whole span.

   - TRIGGER: `gh pr ${X[$i+n]}merge 7`. `/bin/bash -c 'echo "[${X[$i+n]}]"'` prints `[]`, so gh gets `merge`. Main
     exits 2 and the prototype exits 0. In the copy, `$x[+n]merge` is one word, and the `*_RAW` rules do not match
     `${X…}merge`.
   - The same split, main 2 and prototype 0: `gh pr ${X[i+$j]}merge 7`, `gh pr ${X[ i+$j ]}merge 7`,
     `gh pr ${X[n-$i]}merge 7`, `gh pr ${X[k+$j]}merge 7`, `gh pr merge${X[i+$j]} 7`,
     `gh pr close 7 ${X[i+$j]}-d` and `gh pr close 7 ${X[ n-$i ]}-d`. Prefix any of them with `i=2; j=1;` and bash
     expands the subscript to an empty string.
   - WRONG BEHAVIOUR: acceptance 2 ("nothing main blocks passes") fails, and so does D-9. The plan's step 2 sentence
     ("a span that keeps a letter stays visible") states the gain but not this cost.
   - CONFIDENCE: confirmed (`mine.txt` on base gives 2 on all 8; on `fix/` it gives 0 on all 8).

   One way to close it, measured on the copy (`union/`): keep the prototype's `UNQUOTE`. Also run the same gh-pr
   loop a second time on a copy made with main's `UNQUOTE` as it is today. Then main's copy still blocks what it
   blocks, and the new copy adds the param-split forms. Results:

   - `union/` blocks all 22 of `cases.txt` and the 8 forms above.
   - hook-smoke guard-bash rows: 349 ok, 0 FAIL.
   - 300-segment timing: 2.16 / 2.12 s, against 2.28 / 2.07 s on base.
   - It drops step 2. With step 2 kept, it still blocks the forms that step 2 recovers (no letter in the token),
     because main's copy already blocks them.

   The design is the dev-lead's choice. Whatever the plan picks, its probe list needs a guard of this shape (a letter
   plus a parameter in the token), merge and `-d`, with and without spaces.

2. **Interface not pasted exactly.** The plan pastes step 2 with `(\(META\))?` as a placeholder. The prototype has
   `(\([^][:space:]()`'"\\;&|{},]*\))?`, as in step 1. Paste the exact expression, or the hook line after the change,
so that the diff review can compare it byte for byte (`planning.md`: "Paste the signature, not prose").

Not blocking (named so that the lead sees them before `approve`):

- These exit 0 on main and on the prototype alike (a gap that already exists, not a regression):
  `gh pr ${X[$((1))]}merge 7` (an arithmetic `$((…))` subscript, which holds `(`) and
  `gh pr ${X[${Y[${i}]}]}merge 7` (three levels deep: one sed pass removes one level). Neither is named out of
  reach in the header or `hooks.md`. Name them there, or file a card.
- The plan is 68 lines, against `planning.md`'s ≈ 40. B1.105 had 74 lines, B1.107 75 and B1.108 192.

Verdict: changes requested
