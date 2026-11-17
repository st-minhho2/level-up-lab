# B1.105 review

## Plan review (round 1)

Plan at `3e87ebb`. Evidence: `guard-bash.sh` and `lib.sh` copied to `$TMPDIR/b105probe/hooks/`. `old.sh` is the hook
as of `3e87ebb` (= `9a37786` for these lines). `new.sh` is the plan's two lines, applied literally: `GH_PR_FLAGS` moved
above line 55 and the plan's `GH_BRANCH_DELETE`. `diff old.sh new.sh` shows only those lines. 58 commands were fed as
`pr_cmd` JSON (`$TMPDIR/b105probe/cases.txt`, with placeholders so this session's own hook would not refuse them), run
with `/bin/bash` 3.2. Baseline `scripts/hook-smoke.sh` on `3e87ebb`: "hook-smoke: 790 probes OK".

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: tooling, no §. `scripts/ci/plan-files.sh --any B1.105 HEAD` lists 4 rows (`guard-bash.sh`, `hook-smoke.sh`, `hooks.md`, `backlog/work/B1.105/*`), all named by the card. `scripts/CLAUDE.md`'s hook-smoke row names B1.103's merge probes and will not name these; optional |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: n/a, no TypeScript. Hook interface stated: exit 2 + `FORCE_MSG`, message unchanged. The pasted regex matches what I built                                                                                                                                                   |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice, stated (tier quick, no section)                                                                                                                                                                                                                                  |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | fail: the card has 4 acceptance lines, all measurable. Acceptance 1 says "every … spelling with flags (and their values) between `pr` and `close`". The plan leaves out a value holding a space and does not state that it does (reason 1)                                        |
| verification lists exact commands with expected numbers                                | pass, with a gap: 790 → 810 (= 790 + 13 + 7) and red "13 FAIL, 797 ok" agree with the baseline and my probes. `pnpm test` says "unchanged" with no count (reason 3)                                                                                                               |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: probe `test(hooks): …` commit with no `(red)` marker. This deviation is stated and justified (`verify-red.sh:73-75` needs a `*.test.ts(x)`; mistake-log row B1.62/B1.103). Then green `chore(hooks): …`, review, PR. No skeleton or map row (no §), as B1.103               |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a, no section. `scripts/agent/tier.sh backlog/work/B1.105/plan.md` prints `high`, so the lead's `approve` gates the build. D-19 label named                                                                                                                               |
| no settled D-n contradicted                                                            | pass: D-19 and D-28 are followed. B1.24's rule is widened, not changed                                                                                                                                                                                                            |
| `scripts/next-task.sh --check B1.105` on the committed plan says no overlap            | pass: `[next-task] B1.105: no overlap with any Doing or Review card`                                                                                                                                                                                                              |

Confirmed on `new.sh`:

- All 13 of the plan's blocked probes exit 0 on `old.sh` and exit 2 with `force pushes` on `new.sh`. That includes
  `"gh" pr close 7 -d` and `gh "pr" "close" 7 --delete-branch`, which pass today, as the plan says.
- All 7 of the plan's allowed probes exit 0 on both.
- 13 further blocked spellings exit 2 on `new.sh` (12 pass `old.sh`): `--delete-branch=true`, `-R` given twice,
  `-R 'o/r'`, `-R "$R"`, `--repo "$OWNER/$REPO"`, `'close' … '-d'`, tabs, `-c "bye" -d`, `GH_REPO=` prefix, `--`,
  a PR URL, a `\`-newline before `-d`, and `x=$(gh pr -R o/r close 7 -d)`.
- 14 further reads exit 0, for example `list -s closed`, `view --json closed,state`, `close 7 --comment "done"`,
  `closes 7 -d` and `list --state open -d`.
- A flags form of `merge` with `-d` still stops at `GH_PR_MERGE` first (line 85, `MERGE_MSG`), so the `merge` branch
  of the new `GH_BRANCH_DELETE` cannot be reached for those forms. This is harmless.
- I traced the four mutants rather than running them: each removes the only path for at least one blocked probe.

Verdict: changes requested

1. **A flag value holding a space passes, and the plan does not say so.** `gh pr -R "$(gh repo view --json
nameWithOwner -q .nameWithOwner)" close 7 -d` and `gh pr -R $(cat r) close 7 -d` exit 0 on `new.sh`. Both delete
   the branch. `GH_PR_FLAGS` takes one value word only (`[^-[:space:]][^[:space:]]*`), so the word after the space is
   not a flag and the match fails. This is not "a command built at run time" (the command is literal; only `-R`'s
   value is computed), and it is not "a flag in a variable" (`-R "$R"` is blocked). The same root lets
   `gh pr -R "$(cat r)" merge 7` through `GH_PR_MERGE` today (exit 0, B1.103), because the two rules share
   `GH_PR_FLAGS`. Pick one, and write the choice and its cost into the plan:
   (a) Widen `GH_BRANCH_DELETE` only: `[\"']?pr[\"']?([[:space:]]+-.*)?[[:space:]]+[\"']?(close|merge)…` (any text
   after a first flag). Prototype `alt.sh`: 0 mismatches on the 58 cases, and both substitution forms exit 2. New
   false positive: a segment of the form `gh pr -<flag> …` with a later `close` word and ` -d` (for example
   `gh pr -R o/r comment 7 -b "will close 7 -d"`) exits 2. `GH_PR_MERGE` would then be the only rule with the
   gap; say whether it moves too or goes to a follow-up.
   (b) Keep the plan's regex and add "a flag value holding a space (`-R "$(…)"`)" to out of reach in the plan, the
   hook header and `hooks.md`. Acceptance 1 then reads narrower than the card, and the lead accepts that at the gate.
2. **The cost of naming a blocked form is not stated.** After the green commit, any command whose text holds a
   newly blocked spelling exits 2: a `git commit -m`, `scripts/card-status.sh` evidence, a `grep` of the
   probes, a PR title. B1.103's plan stated this and used `git commit -F` for every message. This card's probe and
   green commit bodies, closing evidence and PR body will quote these forms. Add the same line: `git commit -F`,
   `--body-file`, and evidence that describes the forms rather than quoting them.
3. **`pnpm test` has no number.** "unchanged (no `src/`)" should give the count before and after, as B1.103 gave 298.

Note (does not block): the plan is 61 lines, against planning.md's one screen (about 40). B1.103 was longer and was
approved.
