# B1.107 review

## Plan review (round 1)

Plan at `5d29365`. Evidence: `.claude/hooks/*.sh` copied to `$TMPDIR/b107p/old/` (the hook at `5d29365`, the same
lines as `4e5b42a`). `$TMPDIR/b107p/new/` is the same copy with the plan's pasted `GH_BRANCH_DELETE` line applied
literally; `diff old new` shows only line 60. 42 commands were fed as Bash tool JSON (`$TMPDIR/b107p/cases.txt`, with
`gh` written as a placeholder so this session's own hook would not refuse them) and run with `/bin/bash` 3.2.57.
Baseline `scripts/hook-smoke.sh` on `5d29365`: "hook-smoke: 820 probes OK".

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: tooling, no section. `scripts/ci/plan-files.sh --any B1.107 HEAD` lists 4 rows (`guard-bash.sh`, `hook-smoke.sh`, `hooks.md`, `backlog/work/B1.107/*`). The card's Spec line names the first three                                                        |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: n/a, no TypeScript. The hook interface is stated: exit 2 with the existing `FORCE_MSG`, message unchanged. The pasted regex is one character class on one line, the same class as `PUSH_FORCE` and `GH_PR_FLAGS`                                          |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice, and the plan says so (tier quick, no section; `dev-lead.md:46` lets a quick card skip it). Approach B is shown with its costs and left to the lead                                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: the card has 4 acceptance lines, all measurable (probe exits, counts, label). The forms A leaves open are named (see the notes)                                                                                                                           |
| verification lists exact commands with expected numbers                                | pass: 820 → 838 (820 + 12 + 6). Red "12 FAIL, 826 ok". `pnpm test` 403 before and after. Mutation: CI only. My baseline and probes agree with each number                                                                                                       |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: a probe `test(hooks): …` commit with no `(red)` marker, a stated and justified deviation (`verify-red.sh:73-75` needs a `*.test.ts(x)` file, the same as B1.103 and B1.105). Then green `chore(hooks): …` and review. No skeleton or map row (no section) |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a, no section. `scripts/agent/tier.sh backlog/work/B1.107/plan.md` prints `high`, so the lead's `approve` gates the build. D-19's label is named                                                                                                        |
| no settled D-n contradicted                                                            | pass: D-19, D-28 and D-9 are followed. B1.24's rule is widened; B1.103's and B1.105's rules are untouched                                                                                                                                                       |
| `scripts/next-task.sh --check B1.107` on the committed plan says no overlap            | pass: `[next-task] B1.107: no overlap with any Doing or Review card`                                                                                                                                                                                            |

Confirmed with `old` (the hook as it is) and `new` (the plan's line):

- All 12 of the plan's blocked probes exit 0 on `old`. On `new` they exit 2 with `force pushes`.
- All 6 of the plan's allowed probes exit 0 on both hooks.
- 7 more spellings exit 0 on `old` and 2 on `new`: `close $'-d' 7`, `close \-d 7`, `\"-d\"`, `"$"-d`, `$'\''-d`,
  `\$'-d'`, and `--delete-branch=true` (2 on both).
- These reads exit 0 on both: `-c "$DESC"`, `--comment "$(cat body)"`, `-c 'see $HOME'`, `-c "\"done\""`,
  `-c $'line1\n-done'`, `pr list --state closed …`, and `close 7 -c "x" && cd $'-dir'`. The last passes because the
  `&` splits the segment.
- The plan's 4 mutants match my counts: 12 probes need the class, 7 need `$`, 3 need `\`, and 9 need two characters
  before the `-` (`*`, not `?`).
- These stay open on `new`, exactly as the plan states: `-'d'`, `"-"d`, `gh pr $'close' 7 -d`, `$'\x2dd'` and
  `gh pr $'merge' 7`. The last one is a merge that exits 0 today (B1.103's rule). No card in `backlog/plan/` holds it
  yet.
- The stated false positive is confirmed: `gh pr close 7 -c "see \-d in docs"` goes from 0 to 2.

Notes for the lead (none blocks):

1. Acceptance 1 says every such command is blocked "with the existing branch-delete message". For `merge … $'-d'`,
   `GH_PR_MERGE` (`guard-bash.sh:90`) fires first, so the message is `MERGE_MSG`. The command is still blocked, and
   B1.105 accepted the same behavior. None of the 12 probes is a merge.
2. `-'d'` and `"-"d` put the quote inside the flag, not before it. The plan lists them only among B's extra forms. The
   header and `hooks.md` already list "a word quoted in pieces" as out of reach, which covers them. Naming the two
   forms there too would make the boundary plain.
3. If the lead says `approve`, the follow-up card for `gh pr $'merge' 7` is the plan's only record of an open merge
   path. File it before this card closes.
4. I did not check B's timing figures (929 s and 3.85 s). They bear only on choosing B.

Verdict: approved
