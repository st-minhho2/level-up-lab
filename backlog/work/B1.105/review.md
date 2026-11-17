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

## Diff review (round 1)

Diff `origin/main...5328b8a`: 6 files, +311 −14. Code: `.claude/hooks/guard-bash.sh` (12 lines changed: 37–43 header,
58–59 rule, 62–64 merge header, old `GH_PR_FLAGS` line removed), `scripts/hook-smoke.sh` (+29), `.claude/docs/hooks.md`
(20 lines, but the word diff holds two insertions only; the rest is Prettier re-padding the table column). Probes ran
on `git clone` copies under `$TMPDIR/b105d` with `/bin/bash` 3.2.57; no bash 5 on this machine.

### Command results (last line of each)

| Command                               | Result                                                                                                                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                           | exit 0, "All matched files use Prettier code style!"                                                                                                                                                                                              |
| `pnpm typecheck`                      | exit 0                                                                                                                                                                                                                                            |
| `pnpm test`                           | "Tests 403 passed (403)", as the plan says                                                                                                                                                                                                        |
| `pnpm test:e2e`                       | "91 passed (2.2m)"                                                                                                                                                                                                                                |
| `scripts/mutation-gate.sh`            | "mutation: CI only, no src/lib or src/actions change"                                                                                                                                                                                             |
| `scripts/ci/check-suppressions.sh`    | "OK: no new suppressions"                                                                                                                                                                                                                         |
| `scripts/ci/check-config-change.sh`   | error: `guard-bash.sh` and `hooks.md` changed without the `config-change-approved` label. This is expected before the PR exists (D-19, acceptance 4); the PR must carry the label                                                                 |
| `scripts/ci/check-feat-commits.sh`    | "OK: no feat commit touches tests"                                                                                                                                                                                                                |
| `scripts/ci/check-ac-coverage.sh`     | "OK: every criterion of a shipped section has a test"                                                                                                                                                                                             |
| `scripts/ci/check-spec-sections.sh`   | "OK: sections cited: 1 … 53"                                                                                                                                                                                                                      |
| `scripts/ci/check-features-map.sh`    | "OK"                                                                                                                                                                                                                                              |
| `scripts/verify-red.sh B1.105`        | "no 'test(<pkg>): B1.105 … (red)' commit": expected, the plan states the probe commit carries no marker (no vitest file)                                                                                                                          |
| `scripts/next-task.sh --check B1.105` | "B1.105: no overlap with any Doing or Review card"                                                                                                                                                                                                |
| `scripts/hook-smoke.sh` on `5328b8a`  | "hook-smoke: 813 probes OK" (790 + 23, as planned)                                                                                                                                                                                                |
| `scripts/hook-smoke.sh` on `7d753df`  | exit 1. All 16 of the card's blocked probes FAIL with exit 0. The clone also had 15 FAILs from missing `node_modules` (js-yaml, path-guard, review formatter); those are not the card's. With the worktree's `node_modules`, the copy runs 813 OK |

### Checklist

- Acceptance 1, flag spellings blocked with the branch-delete message: **partly**. All 15 `force pushes` probes pass,
  and 7 more spellings I tried exit 2: `--delete-branch=true`, tab separators, a PR URL, a `GH_REPO=` prefix,
  `x=$(…)`, `-c "bye" -d`, and a `\`-newline before `-d`. A flag quoted whole between `pr` and `close` passes
  (finding 1). The old regex's language is a subset of the new one (every added group is optional), so every form
  blocked before is still blocked.
- Acceptance 2, plain forms pass: yes. The 7 KEEP probes pass, and so do `close 7 --comment "done"`,
  `list --state closed`, `view --json closed,state,mergeable,mergeStateStatus` and `list -s merged`.
- Acceptance 3, red then green with counts: yes. Red is 16 FAIL on `7d753df`, green is 813 OK, and bash 3.2 was run.
  Bash 5 was not run here.
- Acceptance 4, the label: pending, because no PR exists yet. `check-config-change.sh` will fail until the label is on.
- No probe weakened after the probe commit: `git log --first-parent --no-merges 7d753df..HEAD -- scripts/hook-smoke.sh`
  is empty, and the `--remerge-diff` of merge `5328b8a` shows no conflict in `hook-smoke.sh` or `guard-bash.sh`.
- Every changed file is in `plan.md`: yes, the 4 Files rows. The pasted `GH_PR_FLAGS` and `GH_BRANCH_DELETE` match the
  hook byte for byte.
- Reverting a changed line fails a probe: yes, in 4 mutants run on the copy, one changed line each. Without the quote
  after `gh`, 1 probe passes. Without the quotes around `close|merge`, 1 passes. Without the quotes around `pr`, 1
  passes. Without `${GH_PR_FLAGS}` in `GH_BRANCH_DELETE`, 13 pass. Plan review round 2 covers the one-word-value
  mutant: both `$(…)` probes pass on it.
- Header and `hooks.md` wording: accurate for what the regex does. "Once pr is followed by a flag, a later close or
  merge word counts, on a later line too" matches the regex. For `close` the regex also needs a later `-d` /
  `--delete-branch`, and the `hooks.md` row says so. The Prettier re-padding of the table is formatter output and
  changes no text.
- No secret, no suppression, no `src/`, `prisma/` or `e2e/` change; no migration.

### Findings

```
[1] KIND: spec-mismatch
    WHERE: .claude/hooks/guard-bash.sh:58 (GH_PR_FLAGS, shared by GH_BRANCH_DELETE:59 and GH_PR_MERGE)
    DEFECT: GH_PR_FLAGS needs a bare `-` right after the whitespace that follows `pr`, so a first flag quoted whole
            (or backslash-escaped) is not seen as a flag, and the rule then needs `close`/`merge` directly after `pr`.
    TRIGGER: gh pr "-R" o/r close 7 -d ; gh pr '--repo' o/r close 7 --delete-branch ; gh pr "--repo=o/r" close 7 -d ;
             gh pr \-R o/r close 7 -d ; gh pr "-R" o/r merge 7   (each exits 0 on 5328b8a; on main too)
    WRONG BEHAVIOUR: the shell removes the quotes, so gh gets `-R o/r close 7 -d` and deletes the remote branch (or
            merges). Card acceptance 1 says "every … spelling with flags (and their values) between pr and close" is
            blocked. The header and hooks.md say quotes are handled around gh, pr, the subcommand and -d, and their
            out-of-reach list names only "a word quoted in pieces", not a flag quoted whole.
    CONFIDENCE: confirmed (ran on the $TMPDIR copy with /bin/bash 3.2: all 5 exit 0)
```

Candidate fix (checked on the copy, not applied): `GH_PR_FLAGS='([[:space:]]+["'"'"'\\]?-.*)?'`. With it, all 5
triggers exit 2, all 20 of my extra cases match their expectation, and `scripts/hook-smoke.sh` gives "813 probes OK".
The fix changes the plan's pasted interface line, so per `planning.md` the lead decides at re-approval between:

- (a) the fix, with a probe for each trigger landed first in a probe commit;
- (b) "a flag quoted whole or escaped" added to out of reach in the header, `hooks.md` and the PR body, with
  acceptance 1 then read narrower than the card.

Not findings, noted for the lead:

- `gh pr -R o/r create -t "close the gap" -d` exits 2. Here `-d` is `--draft`. This is one more case of the stated
  "later close word and -d" cost. Agents open PRs through `scripts/pr-step.sh`, so it rarely bites.
- The `scripts/CLAUDE.md` hook-smoke row still names only B1.103's probes. Plan review round 1 marked this optional.

Verdict: back to test-writer. Finding 1 needs a probe before a fix, and the plan line has to be re-approved if the
lead takes (a). If the lead takes (b), it goes back to the code-writer for the wording only.

Riskiest unfalsified: bash 5 in CI. Only `/bin/bash` 3.2 ran here. The new regex adds no construct that the two
versions treat differently, but CI's run of `hook-smoke.sh` is the first under bash 5.

## Plan review (round 3)

Plan at `b1c3ddb`. It answers diff review round 1 #1 with option (a). Evidence:

- `$TMPDIR/b105r3/hooks/new.sh` is the branch's hook (`d92ea48`, unchanged at `b1c3ddb`) with only the plan's pasted
  `GH_PR_FLAGS='([[:space:]]+["'"'"'\\]?-.*)?'` swapped in, byte for byte as in the plan.
- `alt.sh` is the same with `["'"'"'\\$]*` in place of `["'"'"'\\]?` (reason 1).
- 89 commands were fed as `pr_cmd` JSON with `/bin/bash` 3.2 through `cur.sh` (the branch hook), `new.sh` and
  `alt.sh`. They are round 2's 75 plus 14 new (`$TMPDIR/b105r3/cases.txt`).
- The full `scripts/hook-smoke.sh` ran on two `git clone`s of `b1c3ddb`, one with each hook installed:
  both exit 0, "hook-smoke: 813 probes OK" (round 2's probes are not committed yet, so 813 is the expected count).

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: the same 4 Files rows. `check-plan-scope.sh`: "stays inside the approved plan of B1.105"                                                                                                                                                                            |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: n/a, no TypeScript. The changed `GH_PR_FLAGS` line is pasted, and it parses to the class `["'\]` before `-`                                                                                                                                                         |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice, stated. The lead's choice of option (a) is cited                                                                                                                                                                                                         |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | fail: the 5 triggers from diff review round 1 #1 exit 0 on `cur.sh` and 2 on `new.sh`, with the right message (4 `force pushes`, 1 `agents never merge`). A flag quoted whole with `$'…'` or `$"…"` still passes, and the plan neither covers it nor states it (reason 1) |
| verification lists exact commands with expected numbers                                | pass: 16 + 5 = 21 blocked, + 7 allowed = 28, and 790 + 28 = 818. The red is 5 FAIL / 813 ok. On the round 2 mutant (`cur.sh`) the 5 exit 0, so it is killed                                                                                                               |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: the round 2 commits are `test(hooks): B1.105 review pass 1 -- …` with no marker (`backlog/CLAUDE.md`'s hardening form) and `fix(hooks): …` (12 `fix(` subjects on main). They are listed under Verification, not in the Work breakdown table (note)                 |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a, no section. `scripts/agent/tier.sh` gives `high`. The approval line is cleared (`Plan approved by:` empty), so the lead re-approves                                                                                                                            |
| no settled D-n contradicted                                                            | pass: D-9 and D-19 are kept                                                                                                                                                                                                                                               |
| `scripts/next-task.sh --check B1.105` on the committed plan says no overlap            | pass: `[next-task] B1.105: no overlap with any Doing or Review card`                                                                                                                                                                                                      |

Results on the 89 commands: 0 mismatches on `new.sh` for the 70 that have a stated expectation. The 19 marked
for information (no stated expectation):

| Command (`pr`/`close` spelled out)                                     | `cur.sh` | `new.sh` | `alt.sh` | Reading                                               |
| ---------------------------------------------------------------------- | -------- | -------- | -------- | ----------------------------------------------------- |
| `gh pr $'-R' o/r close 7 -d`                                           | 0        | 0        | 2        | flag quoted whole (ANSI-C); gh gets `-R`              |
| `gh pr $"-R" o/r close 7 -d`                                           | 0        | 0        | 2        | flag quoted whole (locale); gh gets `-R`              |
| `gh pr $'--repo' o/r merge 7`                                          | 0        | 0        | 2        | same, merge half                                      |
| `gh pr ""-R o/r close 7 -d`                                            | 0        | 0        | 2        | a word quoted in pieces (stated out of reach)         |
| `gh pr $EMPTY -R o/r close 7 -d`                                       | 0        | 0        | 0        | an empty expansion before the flag; built at run time |
| `gh pr '-R' 'o/r' 'close' '7' '-d'`                                    | 0        | 2        | 2        | every word quoted                                     |
| round 2's 8 newline / `--search "merge"` / `--title "… merge …"` costs | 2        | 2        | 2        | unchanged, accepted in round 2                        |
| `gh pr -R o/r view 7 --json title` then `git log`                      | 0        | 0        | 0        | read, unchanged                                       |

Verdict: changes requested — Waiting on human (round 3)

1. **A first flag quoted whole as `$'…'` or `$"…"` passes, and the plan does not say so.** The approach says "the first
   flag may sit behind a quote or `\` … the shell strips them". But `["'\\]?` allows one character, and `$'-R'` puts
   a `$` before the quote. On `new.sh`, all three of these exit 0:
   - `gh pr $'-R' o/r close 7 -d`
   - `gh pr $"-R" o/r close 7 -d`
   - `gh pr $'--repo' o/r merge 7`

   bash hands gh `-R`, so the branch is deleted, or the PR merged. They are not on the plan's out-of-reach list
   ("a flag in a variable, an alias, a word quoted in pieces, a command built at run time"). The same section
   already handles this spelling for push refspecs: B1.24's `PUSH_FORCE` uses `["'\\$]*` for `$'+main'`.
   This is the lead's choice at the gate:
   - (a) Take `["'"'"'\\$]*` (`alt.sh`). All 3 exit 2, and `""-R` does too. All 70 cases with a stated expectation
     match, and the full hook-smoke gives "813 probes OK". Add a probe for `$'-R'` and one for `$"-R"`, making 23
     blocked and 820 in total.
   - (b) Keep `["'\\]?` and add "a flag quoted as `$'…'` or `$"…"`" to out of reach in the plan, the hook header,
     `hooks.md` and the PR body.

Notes (do not block):

- `gh pr $EMPTY -R o/r close 7 -d` passes all three hooks. An unquoted empty expansion disappears before gh runs.
  This falls under "a command built at run time"; naming it would cost one phrase.
- The Work breakdown table has 3 rows and does not list the round 2 probe and fix commits (they appear only under
  Verification).
- The plan is 70 lines, against the one screen (about 40) in `planning.md`.

Riskiest unfalsified: bash 5 in CI, as in every round here. The added class uses no construct that 3.2 and 5 treat
differently.

## Plan review (round 4)

Plan at `c46ba7c`. The lead chose option (a) of round 3 reason 1; this is the only change since `0d4fb54`, and it
touches only `plan.md`. Evidence:

- The pasted `GH_PR_FLAGS='([[:space:]]+["'"'"'\\$]*-.*)?'` is byte for byte the line of `$TMPDIR/b105r3/hooks/alt.sh`
  (round 3's prototype).
- Round 3 ran that prototype through the full `scripts/hook-smoke.sh` on a clone of `b1c3ddb`: "813 probes OK". It
  also had 0 mismatches on the 70 commands with a stated expectation.
- Here, the plan's 7 round 2 probes were run with `/bin/bash` 3.2 against three hooks: `cur.sh` (the branch hook),
  `nodollar.sh` (the plan's `$`-dropped mutant, `["'"'"'\\]*`) and `alt.sh`. Results below.

| Probe                                        | `cur.sh` | `nodollar.sh` | plan (`alt.sh`) | message              |
| -------------------------------------------- | -------- | ------------- | --------------- | -------------------- |
| `gh pr "-R" o/r close 7 -d`                  | 0        | 2             | 2               | `force pushes`       |
| `gh pr '--repo' o/r close 7 --delete-branch` | 0        | 2             | 2               | `force pushes`       |
| `gh pr "--repo=o/r" close 7 -d`              | 0        | 2             | 2               | `force pushes`       |
| `gh pr \-R o/r close 7 -d`                   | 0        | 2             | 2               | `force pushes`       |
| `gh pr $'-R' o/r close 7 -d`                 | 0        | 0             | 2               | `force pushes`       |
| `gh pr "-R" o/r merge 7`                     | 0        | 2             | 2               | `agents never merge` |
| `gh pr $"--repo" o/r merge 7`                | 0        | 0             | 2               | `agents never merge` |

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                         | pass: the same 4 Files rows. `check-plan-scope.sh`: "stays inside the approved plan of B1.105"                                                                                                                                                                                       |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: n/a, no TypeScript. The pasted line is what I ran                                                                                                                                                                                                                              |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice, stated. The lead's choices are cited (diff review r1 option a, plan review r3 option a)                                                                                                                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: round 3 reason 1 is fixed. `$'-R'` and `$"--repo"` exit 2 with the right message (table). `$EMPTY` is now named under "a command built at run time"                                                                                                                            |
| verification lists exact commands with expected numbers                                | pass: 16 + 7 = 23 blocked, + 7 allowed = 30, and 790 + 30 = 820. The red is 7 FAIL / 813 ok, which matches `cur.sh` (all 7 exit 0). Mutants: dropping the class kills all 7 (`cur.sh` is that mutant); dropping `$` from it kills the 2 `$` probes (`nodollar.sh`), as the plan says |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: rows 4–5 add the round 2 commits. `test(hooks): … review pass 1 -- …` carries no marker (`backlog/CLAUDE.md` hardening form), and the fix row is `fix(hooks): …`                                                                                                               |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a, no section. `scripts/agent/tier.sh` gives `high`. `Plan approved by:` is empty, so the lead's `approve` is needed                                                                                                                                                         |
| no settled D-n contradicted                                                            | pass: D-9 and D-19 are kept                                                                                                                                                                                                                                                          |
| `scripts/next-task.sh --check B1.105` on the committed plan says no overlap            | pass: `[next-task] B1.105: no overlap with any Doing or Review card`                                                                                                                                                                                                                 |

Verdict: approved

The costs the lead accepts are unchanged from rounds 2–3:

- Once `pr` is followed by a flag, any later `close`/`merge` word in the segment counts, on a later line of a
  multi-line command too (`gh pr -R o/r view 7` then `git merge origin/main`).
- A command that quotes a blocked spelling is itself blocked.
- An empty unquoted variable before the flag passes (now stated).
- B1.103's merge rule widens through the shared `GH_PR_FLAGS`, so the PR body should say so.

Note: the plan is 74 lines, against about 40 for one screen.

Riskiest unfalsified: bash 5 in CI. Only `/bin/bash` 3.2 ran here; `["'"'"'\\$]*` behaves the same in both.

## Diff review (round 2)

Diff since pass 1 (`fe3c200..68fae57`): probe commit `18f92e0`, which adds 7 lines to `scripts/hook-smoke.sh`, and
fix commit `68fae57`, which changes `guard-bash.sh` (`GH_PR_FLAGS` line 59 and header lines 41–42) and `hooks.md` (one
phrase in the gh clause, one phrase in out of reach; the rest of the 20 lines is Prettier padding). The plan was
re-approved at `1cb12f1` (round 4, `Plan approved by: lead, 2026-11-17`), and its pasted `GH_PR_FLAGS` matches the
hook. The copies ran from `$TMPDIR/b105d`, a `git clone` with `node_modules` linked, under `/bin/bash` 3.2.57.

### Command results (last line of each)

| Command                               | Result                                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` / `pnpm typecheck`        | exit 0 / exit 0                                                                                                 |
| `pnpm test`                           | "Tests 403 passed (403)"                                                                                        |
| `pnpm test:e2e`                       | "91 passed (2.1m)"                                                                                              |
| `scripts/mutation-gate.sh`            | "mutation: CI only, no src/lib or src/actions change"                                                           |
| `scripts/ci/check-suppressions.sh`    | "OK: no new suppressions"                                                                                       |
| `scripts/ci/check-config-change.sh`   | error, label missing (`guard-bash.sh`, `hooks.md`). Expected before the PR; it needs `config-change-approved`   |
| `scripts/ci/check-feat-commits.sh`    | "OK: no feat commit touches tests"                                                                              |
| `scripts/ci/check-ac-coverage.sh`     | "OK: every criterion of a shipped section has a test"                                                           |
| `scripts/ci/check-spec-sections.sh`   | "OK: sections cited: 1 … 53"                                                                                    |
| `scripts/ci/check-features-map.sh`    | "OK"                                                                                                            |
| `scripts/verify-red.sh B1.105`        | "no … (red) commit": expected, since the plan states the probe commits carry no marker                          |
| `scripts/next-task.sh --check B1.105` | "B1.105: no overlap with any Doing or Review card"                                                              |
| `scripts/hook-smoke.sh` at `68fae57`  | "hook-smoke: 820 probes OK" (813 + 7)                                                                           |
| `scripts/hook-smoke.sh` at `18f92e0`  | exit 1, exactly 7 FAIL, all 7 of them the new probes (5 `force pushes`, 2 `agents never merge`), each exiting 0 |

### Checklist

- Pass 1 #1 is fixed. All 5 of its triggers exit 2 at `68fae57`. Four more spellings also exit 2: `''-R`, `"-"R`,
  `$'--repo=o/r'` and `"\-R"`. The 7 new probes cover `"-R"`, `'--repo'`, `"--repo=o/r"`, `\-R`, `$'-R'`, and for
  merge `"-R"` and `$"--repo"`.
- My 20 cases from pass 1 and 9 new ones give 28 of 29 as expected. The one miss is finding 2 below, which predates
  this card. The `$` in the class adds no false positive I could find. These all exit 0: `gh pr view $N --json state`,
  `gh pr $SUB $N -R o/r`, `gh pr checks $N --watch`, and the stated out-of-reach case `gh pr $EMPTY -R o/r close 7 -d`.
- Reverting part of the class fails probes. I ran 4 mutants of line 59 on the copy:
  - class dropped: 7 of 23 blocked probes pass
  - `$` dropped: 2 pass (matches the dev-lead's run)
  - `\` dropped: 1 passes
  - quotes dropped: 6 pass
- No probe weakened. `git log --first-parent --no-merges 18f92e0..HEAD -- scripts/hook-smoke.sh` is empty, and there
  is no merge after `18f92e0`.
- Every changed file is in `plan.md`: yes, the same 4 rows. The commit subjects match the plan's work breakdown (step 5
  `fix(hooks): …`).
- `hooks.md` wording for "an empty unquoted variable before a `gh pr` flag" is accurate. `gh pr $EMPTY -R o/r close 7
-d` exits 0 as stated, and filing it under "a command built at run time" is fair: the shell drops the empty word, so
  the hook cannot know it is empty.

### Findings

```
[2] KIND: correctness (predates this card; B1.24's delete-flag clause, a line this card does not change in that part)
    WHERE: .claude/hooks/guard-bash.sh:60 (GH_BRANCH_DELETE, the tail `[[:space:]][\"']?(-[a-z]*d|--delete-branch)`)
    DEFECT: the delete flag after close/merge is matched only bare or behind one quote, so a delete flag behind `\` or
            `$'…'` / `$"…"` is missed, the same escape class this card now accepts for the first flag.
    TRIGGER: gh pr close 7 $'-d' ; gh pr close 7 \-d ; gh pr close 7 $"--delete-branch" ;
             gh pr -R o/r close 7 $'-d' ; gh pr -R o/r close 7 \--delete-branch   (each exits 0 at 68fae57 and on main)
    WRONG BEHAVIOUR: gh receives -d / --delete-branch and deletes the remote branch; the header says -d "quoted" is
            blocked, and its out-of-reach list does not name `\` or `$'…'` before the delete flag.
    CONFIDENCE: confirmed (ran the 5 on the $TMPDIR copy of 68fae57 and of origin/main's hook, /bin/bash 3.2: all exit 0)
```

Finding 2 does not block this PR. It is in B1.24's part of the rule, the flagless form fails the same way on main,
and the card's acceptance names the flags between `pr` and `close`. It is a candidate for a new card filed alone
(filing lane). The fix would mirror `68fae57` by widening `[\"']?` before the delete flag to `["'\\$]*`, plus probes.
If the lead prefers to fold it into B1.105, that is a plan round 5 with re-approval.

Verdict: ready for PR. Before opening it:

- `backlog/work/B1.105/pr-body.md` is stale and must be updated from `plan.md`. Line 14 still says "approved round 2",
  line 40 still pastes `GH_PR_FLAGS='([[:space:]]+-.*)?'`, and line 45 still gives 813 probes. It needs round 4, the
  `["'\\$]*` line, 820 probes, the second red (7 FAIL at `18f92e0`) and the mutants.
- The PR carries `config-change-approved` (D-19).

Riskiest unfalsified: bash 5 in CI. Only `/bin/bash` 3.2 ran here. `["'\\$]*` inside a bracket expression is literal
in both POSIX ERE implementations, but CI is the first run under bash 5.
