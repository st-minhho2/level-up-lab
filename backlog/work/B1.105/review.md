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

## Plan review (round 2)

Plan at `16461a9`; it took option (a) from round 1 #1. Evidence:

- `$TMPDIR/b105r2/hooks/new.sh` is `old.sh` (`9a37786`'s lines) with the plan's two pasted lines applied literally.
  `diff` shows only line 55 (now `GH_PR_FLAGS='([[:space:]]+-.*)?'` plus the new `GH_BRANCH_DELETE`) and the old
  `GH_PR_FLAGS` line removed.
- 75 commands were fed as `pr_cmd` JSON with `/bin/bash` 3.2: round 1's 58 plus 17 new (`$TMPDIR/b105r2/cases.txt`).
- The full `scripts/hook-smoke.sh` ran on a clone of `16461a9` with only `guard-bash.sh` replaced by `new.sh`
  (`$TMPDIR/b105clone`): exit 0, "hook-smoke: 790 probes OK". All of B1.24's and B1.103's probes, B1.103's merge-state
  reads among them, still pass with the wider `GH_PR_FLAGS`.
- `pnpm test` on `16461a9`: "Tests 403 passed (403)", which matches the plan.

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: same 4 rows as round 1, all named by the card                                                                                                                                                                                                                                           |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: n/a, no TypeScript. The pasted `GH_PR_FLAGS` and `GH_BRANCH_DELETE` are what I built and ran. The approach states that `GH_PR_MERGE` (B1.103) changes through the shared `GH_PR_FLAGS`                                                                                                  |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice, stated                                                                                                                                                                                                                                                                       |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: round 1 #1 is fixed. `gh pr -R "$(gh repo view --json nameWithOwner -q .nameWithOwner)" close 7 -d` and `gh pr -R $(cat r) close 7 --delete-branch` now exit 2 with `force pushes` (0 on `old.sh`). `gh pr -R "$(cat r)" merge 7` now exits 2 with `agents never merge` (0 on `old.sh`) |
| verification lists exact commands with expected numbers                                | pass: 16 blocked + 7 allowed = 23, and 790 + 23 = 813. The red count of 16 FAIL / 797 ok holds: all 16 blocked probes exit 0 on `old.sh` and all 7 allowed exit 0 on both. Round 1 #3 is fixed: `pnpm test` 403 before and after (confirmed)                                                  |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: as round 1. The probe commit carries no `(red)` marker, with the reason stated. `git commit -F` is named for this card's messages                                                                                                                                                       |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a, no section. Tier `high` (round 1, Files unchanged in kind), so the lead's `approve` gates the build                                                                                                                                                                                |
| no settled D-n contradicted                                                            | pass: D-9 and D-19 are kept. B1.103's merge rule widens and does not narrow: every B1.103 probe still passes (hook-smoke above)                                                                                                                                                               |
| `scripts/next-task.sh --check B1.105` on the committed plan says no overlap            | pass: `[next-task] B1.105: no overlap with any Doing or Review card` (round 1; the Files are the same 4 rows)                                                                                                                                                                                 |

Round 1 #2 is fixed. The costs now name the self-quoting cost, and the probe and green commits use `git commit -F`.

Results on the 75 commands, for the forms with a stated expectation (round 1's 58 plus 9 new): 0 mismatches against
the plan's hook. All 32 blocked spellings from round 1 and the 6 new blocked ones exit 2 (4 of the new ones with
`agents never merge`, one of them the stated `comment -b "merge it"`). All 29 reads (26 + 3 new) exit 0, including
`list --state closed`,
`view --json closed,state`, `close 7 --comment "done"`, `view --json mergeable`, `list --state merged` and
`view --json mergeStateStatus,mergedAt`. Mutants:

- Round 1's `new.sh` is exactly the "B1.103's one-word value back" mutant, and both substitution probes exit 0 on it.
- "`GH_PR_FLAGS` dropped" fails `gh pr -R o/r close 7 -d`.
- The two quote mutants were traced in round 1.

Verdict: approved

Costs the lead accepts with this plan (all confirmed on `new.sh`, exit 0 on `old.sh`; none blocks):

1. **The false positive reaches across a newline.** Section 2 joins a segment's lines with spaces, and the segment
   splits only on `;`, `&` and the pipe. So "any later word" in the plan's costs means any later word on any later
   line of the same multi-line command. These exit 2 with `agents never merge`:
   - `gh pr -R o/r view 7` then, on the next line, `git merge origin/main`
   - `gh pr -R o/r checks 7` then `git merge --no-ff -m "x"`
   - `gh pr -R o/r view 7 --json body -q .body` then `echo "will merge later"`

   `gh pr -R o/r close 7` then `git branch -d feat/x` exits 2 with `force pushes`. A local branch delete is safe, and
   today the same thing happens only without the flag: `gh pr close 7` then `git branch -d x`. The workaround is
   `&&` or `;` between the commands, or no flag after `pr`. Naming the newline case in `hooks.md`'s false positives
   would save a confused retry.

2. **More single-line examples of the stated class:**
   - `gh pr -R o/r list --search "merge"`
   - `gh pr -R o/r edit 7 --title "chore: merge guard"`

   Both exit 2. Agents open and title PRs through `scripts/pr-step.sh` (the hook does not see inside it), so the
   second matters only for a direct `gh pr edit`.

3. **B1.103's rule changes in this card.** `GH_PR_MERGE` gets the wider `GH_PR_FLAGS`. The plan says so, and the PR
   body should say so too, so the lead reads a change to the merge rule under a card titled for `close`.

Riskiest unfalsified: bash 5 in CI. Only `/bin/bash` 3.2 is installed here; the regex uses no construct that
differs between the two.
