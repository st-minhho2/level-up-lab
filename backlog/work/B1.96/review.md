# B1.96 review

## Plan review (round 1)

Scope: all (tooling: `.gitattributes`, `scripts/`, `scripts/ci/`; no `src/`). Plan at 2042e81.

| Check                                                                          | Result                                                                                                                                   |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                 | pass: tooling, no §; the Files match the card's Spec line (`.gitattributes`, the smoke, `check-spec-sections.sh`, the scripts guide)     |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass: n/a (no TypeScript); the one new interface is the error line, pasted verbatim                                                      |
| plan follows `advice.md`'s recommendation or states the deviation              | pass: no advice, stated (tier quick, no section)                                                                                         |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number      | fail: T10's Then ("the guard OK") cannot hold as specified (reason 1); T11's Then does not test the flip it names (reason 3)             |
| verification lists exact commands with expected numbers                        | pass: "4 of 12 probes FAILED" / "12 probes OK", `/bin/bash` 3.2, guards named; but "12 probes OK" depends on reason 1                    |
| work breakdown skeleton → red → green → map → review with convention subjects  | pass: red `test(scripts)`, green `chore(scripts)`, review `docs(backlog)`; no skeleton or map step (no §, as B1.89)                      |
| `Lead approves spec` box, ticked only by a human                               | pass: n/a, the card has no section and no box; `Plan approved by:` is empty                                                              |
| no settled D-n contradicted                                                    | pass: D-19 label stated, D-28 tier high (`scripts/agent/tier.sh backlog/work/B1.96/plan.md` → `high`), D-33's section numbers unaffected |
| `scripts/next-task.sh --check B1.96` says no overlap                           | pass: `[next-task] B1.96: no overlap with any Doing or Review card`                                                                      |

Probe (on `git clone . "$TMPDIR/b196probe1"`, git 2.39.5, `merge=union` added for the index): base §31 last; main
gains sections 32 then 33; a card branch cut at the base appends section 34 and runs Loop 9's `git merge main` →
`merge rc=0`, index rows `§30, §31, (34), (32), (33)`; `check-spec-sections.sh` → `::error::§<34> is cited but has no
heading in spec/contracts/`.

Verdict: changes requested

1. **T10 cannot pass as specified** (confirmed). `check-spec-sections.sh:8` greps every `§n` in
   `spec/technical-requirements.md` and fails on one without a `# §n` heading in `spec/contracts/*.md`; the probe above
   prints that error for an appended row. T10's appended rows need § numbers that have no index row (all of §1–§31
   have one), so "the rows point at an existing contract" does not help: the key is the § number, not the link. As
   written T10 ends with `RC=1` and `kept_once` fails, so green cannot reach "12 probes OK". The plan must say how each
   side's § gets a heading, e.g. side a appends a section 901 heading to one tracked contract file and side b one for 902 to a
   different one (`merge_sides` commits with `commit -qam`, so a new untracked contract file is not committed, and two
   sides appending to the same contract file conflict, since contracts keep git's default merge). T11 and T12 then
   reuse it, so their guard output names only the duplicate.
2. **Unstated cost: rows land in merge order, not § order** (confirmed). Union writes the merging branch's lines
   first, and Loop 9 merges main into the card branch, so a card's row lands above every row main gained since its
   branch point (probe: `§31, (34), (32), (33)`, clean merge, no guard reads order). With D-33 batch 2 (sections 32–34 in
   parallel), any merge order other than ascending misorders the index on main. B1.89's union already did this to the
   map: `spec/features-map.md:35-38` reads `F26, F28, F29, F27` on main today. The plan must either state the cost and
   who restores the order (and when), or add an order check to the guard and state that it turns the misordered case
   into a CI round trip. The lead chooses; this is a cost the approval must see.
3. **T11 does not model the closing flip it names** (traced, not run). The smoke builds its base from the checkout's
   tree, where all 31 index rows are ✅ (`grep -c '✅'` → 31), so there is no ✗ for a sibling to flip. Written with
   the existing helper, `set_last_cell $IX §31 '✅'` still changes the line, only by re-padding the cell (`✅     ` →
   `✅ `), so T11 would pass on a whitespace edit and pin nothing about ✗ → ✅. The plan must name how the base gets a
   ✗ last row (a base commit before `merge_sides` branches, or the sibling writing a status different from the base),
   and pin the § the error names (as T4 pins `$LAST_C`).
4. **The B1.92 acceptance item has no owner** (traced). The card's "If B1.92 lands first, its post-merge guard list
   gains this check" is answered in the plan by "this guard joins B1.92's list when that card lands", but B1.92's card
   (`backlog/plan/E1-todos.md:1192`, `:1198`) names only `check-features-map.sh` and `check-backlog.sh`, and the plan
   puts no backlog card in its Files. When B1.92 lands as written, index duplicates still reach CI. The plan must
   either add `check-spec-sections.sh` to B1.92's card in this PR (a Files row) or state that the gap stays until
   B1.92's own plan picks it up.

Riskiest unfalsified: GitHub's mergeability for a BEHIND runner PR under `merge=union` (`[unverified]` since B1.89; a
bare repository ignores the attribute), which decides whether batch 2 still needs a Loop 9 rerun at all.

## Plan review (round 2)

Plan at d0351b3. Round 1's text above was reworded in this round (a § sign followed by an unheaded number became
"section N" or `(N)`, meaning unchanged), because those citations fail `check-spec-sections.sh` (reason 1 below).

Probes (`git clone . "$TMPDIR/b196r3"`, git 2.39.5, `merge=union` added for the index, `/bin/bash` 3.2):

- T10 as planned (`add_section` 901 / 902: new contract file staged, row appended after the last): `merge rc=0`, each
  row once, contract files merged without conflict. `check-spec-sections.sh` → rc 1, three errors for sections 32, 33
  and 34, cited by this branch's `backlog/work/B1.96/plan.md:24` and `review.md`. With `backlog/work/B1.96` removed
  from the copy: `[check-spec-sections] OK: sections cited: 1 … 31 901 902`, rc 0.
- T11 as planned (base commit sets the last row to ✗; side a appends section 903; side b flips the row to ✅; b merged
  into a): `merge rc=0`, the last row twice, the stale ✗ copy first, then the 903 row, then the ✅ copy.
- T12 as planned (re-padded index against an appended row): `merge rc=0`, `grep -cE '^\| §1 '` → 2.
- Readers of row order: `check-ac-coverage.sh:15-26` reads each row by its § key (a ✗/✅ duplicate still demands
  coverage for the ✅ copy); `spec-analyst.md:24` takes the "next free §", not the last row. The plan's "nothing
  reads row order" holds.

| Check                                                                          | Result                                                                                                                |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                 | pass: tooling, no §; the new row `backlog/plan/E1-todos.md` answers the card's B1.92 acceptance item                  |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass: n/a (no TypeScript); error line verbatim; `add_section <n>` named with its three steps                          |
| plan follows `advice.md`'s recommendation or states the deviation              | pass: no advice, stated (tier quick, no section)                                                                      |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number      | pass: T10–T12 each pin a count or a string; T11 pins `$LAST_S` and the keep rule; mechanisms probed above             |
| verification lists exact commands with expected numbers                        | fail: "`check-spec-sections.sh` OK on the tree" and "12 probes OK" cannot hold on this branch as committed (reason 1) |
| work breakdown skeleton → red → green → map → review with convention subjects  | pass: red `test(scripts)`, green `chore(scripts)`, review `docs(backlog)`; no skeleton or map step (no §, as B1.89)   |
| `Lead approves spec` box, ticked only by a human                               | pass: n/a, no section and no box; `Plan approved by:` empty                                                           |
| no settled D-n contradicted                                                    | pass: D-19 label, D-28 tier (`scripts/agent/tier.sh backlog/work/B1.96/plan.md` → `high`), D-33 unaffected            |
| `scripts/next-task.sh --check B1.96` says no overlap                           | pass: `[next-task] B1.96: no overlap with any Doing or Review card`                                                   |

Round 1 reasons: 1 resolved in mechanism (T10's merge probed clean, but see reason 1 below); 2 resolved (the cost
is stated, "nobody is assigned" is the lead's to accept); 3 resolved (✗ base commit, `$LAST_S` read and pinned); 4
resolved (Files row amends B1.92's Test and Acceptance lines).

Verdict: changes requested

1. **This branch fails `check-spec-sections.sh`, and so would T10** (confirmed: run on the worktree and on the probe
   copy). The guard greps every § sign followed by digits in `backlog/` (`check-spec-sections.sh:8`) and demands a
   heading. `plan.md:24` cites sections 32–34 (no contract yet) and `plan.md:64` cites 901 and 902 with the § sign;
   round 1 of `review.md` did the same (reworded in this round). Run on the worktree at d0351b3:
   `::error::§<32>/§<33>/§<34>/§<901>/§<902> is cited but has no heading`, rc 1. Effects: CI's "check-spec-sections"
   step (`.github/workflows/ci.yml:146`) fails on the PR; the Verification line "`check-spec-sections.sh` OK on the
   tree" is false; and the smoke copies the tracked tree, so T10's `kept_once` (which needs guard rc 0) fails on this
   branch even with the green change. The plan as written ends at "1 of 12 probes FAILED", not "12 probes OK". (T11
   and T12 still pass, since `named` only needs rc ≠ 0 and the string.) Fix: write unheaded numbers as "section 32"
   (the repo's form, `backlog/plan/E1-todos.md:1017`) in `plan.md` and in the `pr-body.md` copied from it, and note
   in Verification that no `backlog/work/B1.96/*` file cites a § sign with an unheaded number, since the smoke reads
   them.

Riskiest unfalsified: GitHub's mergeability for a BEHIND runner PR under `merge=union` (still `[unverified]`, a bare
repository ignores the attribute), which decides whether batch 2 still needs a Loop 9 rerun.

## Plan review (round 3)

Plan at 92072a0 (round 2's reason applied; round 3 allowed by the lead in the session). Runs, on the worktree:

- `scripts/ci/check-spec-sections.sh` → `[check-spec-sections] OK: sections cited: 1 … 31`, rc 0 (round 2: rc 1).
  The smoke copies this tracked tree, so T10's `kept_once` no longer inherits a stray citation.
- `scripts/next-task.sh --check B1.96` → `[next-task] B1.96: no overlap with any Doing or Review card`.
- `scripts/agent/tier.sh backlog/work/B1.96/plan.md` → `high`; `scripts/ci/check-plan-scope.sh` → OK (paperwork).
- Index keys today: 31 rows match `^\| §[0-9]+ `, `uniq -d` empty, so the new duplicate check is OK on the tree.
- Red count traced against `table-merge-smoke.sh` as it stands: T9 fails on its expected string; T10, T11, T12 conflict
  under git's default merge (`merge_sides` aborts, `MERGED` ≠ 0, so `kept_once` / `named` fail); T1–T8 untouched →
  "4 of 12 probes FAILED" holds. T11's base commit on main precedes `merge_sides`, which branches from main, so the
  ✗ base reaches both sides; T12 branches from that main and is unaffected by the ✗.
- Batch 1 history confirms the scenario: `git show 9337123 --remerge-diff` conflicts on the two appended rows (the
  sections 30 and 31 rows) alone; B6.2's `pr-body.md:75-76` records two such conflicts, both resolved by `dev-lead`.

| Check                                                                          | Result                                                                                                      |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                 | pass: tooling, no §; Files match the card's Spec line plus the B1.92 card row (round 1 reason 4)            |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass: n/a (no TypeScript); error line verbatim; `add_section <n>` named with its three steps                |
| plan follows `advice.md`'s recommendation or states the deviation              | pass: no advice, stated (tier quick, no section)                                                            |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number      | pass: T9–T12 each pin a string or a count; T11 pins `$LAST_S` and the keep rule                             |
| verification lists exact commands with expected numbers                        | pass: "4 of 12 probes FAILED" / "12 probes OK" now reachable; guard OK on the tree (run above); every check |
| work breakdown skeleton → red → green → map → review with convention subjects  | pass: red `test(scripts)`, green `chore(scripts)`, review `docs(backlog)`; no skeleton or map (as B1.89)    |
| `Lead approves spec` box, ticked only by a human                               | pass: n/a, no section and no box; `Plan approved by:` empty                                                 |
| no settled D-n contradicted                                                    | pass: D-19 label, D-28 tier `high` (lead's `approve` needed), D-33 numbering unaffected                     |
| `scripts/next-task.sh --check B1.96` says no overlap                           | pass: `[next-task] B1.96: no overlap with any Doing or Review card`                                         |

Round 2 reason 1: resolved (no unheaded section number after a § sign in `backlog/work/B1.96/*`; guard rc 0).

Note for the lead, not a reason (plausible, not falsified): no runner role's path-guard lists
`spec/technical-requirements.md` (spec-analyst's guard refuses it, probed: `'spec/technical-requirements.md' is
outside this role's paths`; code-writer, dev-lead, test-writer, advisor, reviewer lists read). Yet `dev-lead` resolved
both batch 1 index conflicts on the runner. The new error line says which copy to keep but not who deletes it, and
the plan's B1.92 amendment adds the guard to the post-merge list without adding the index row to B1.92's owner routing
("a map row → `code-writer`, a metrics row → `dev-lead`"). B1.92's own plan has to name that owner.

Verdict: approved (ready for the lead's gate, not approved for build; tier high, so the lead's `approve` is required)

Riskiest unfalsified: GitHub's mergeability for a BEHIND runner PR under `merge=union` (still `[unverified]`, a bare
repository ignores the attribute), which decides whether batch 2 still needs a Loop 9 rerun.

## Diff review (round 1)

Scope: all (tooling). HEAD 6948df1, base `origin/main` dcad84c (the local `main` ref is stale; every range below is
`dcad84c..HEAD`). Red 1b82a46, green 073668a, B1.92 card 6948df1.

### Commands (run by the reviewer, last line each)

| Command                                                | Result                                                                                                                                                               |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                            | `All matched files use Prettier code style!`                                                                                                                         |
| `pnpm typecheck`                                       | `tsc --noEmit`, no error                                                                                                                                             |
| `pnpm test`                                            | `Tests  269 passed (269)`, 43 files                                                                                                                                  |
| `pnpm test:e2e`                                        | `57 passed (1.3m)`                                                                                                                                                   |
| `pnpm test:mutation`                                   | `Final mutation score of 92.63 is greater than or equal to break threshold 70` (no `src/` change)                                                                    |
| `/bin/bash scripts/table-merge-smoke.sh` (3.2.57)      | `12 probes OK`                                                                                                                                                       |
| same, at 1b82a46 (clone under `$TMPDIR`)               | `4 of 12 probes FAILED` (T9–T12; T1–T8 ok), matching the red commit's body                                                                                           |
| `scripts/ci/check-suppressions.sh`                     | `OK: no new suppressions`                                                                                                                                            |
| `scripts/ci/check-config-change.sh`                    | locally `::error::` for `.gitattributes`, `scripts/ci/check-spec-sections.sh` (no label locally); PR #273 carries `config-change-approved` (`gh pr view`, read only) |
| `scripts/ci/check-feat-commits.sh`                     | `OK: no feat commit touches tests`                                                                                                                                   |
| `scripts/ci/check-ac-coverage.sh`                      | `OK: every criterion of a shipped section has a test`                                                                                                                |
| `scripts/ci/check-spec-sections.sh`                    | `OK: sections cited: 1 … 31`                                                                                                                                         |
| `scripts/ci/check-features-map.sh`                     | `OK`                                                                                                                                                                 |
| `scripts/ci/check-backlog.sh`                          | `OK: README matches the cards`                                                                                                                                       |
| `scripts/ci/check-plan-scope.sh`                       | `OK: chore/B1.96-index-union stays inside the approved plan of B1.96`                                                                                                |
| `scripts/verify-red.sh B1.96`                          | `no 'test(<pkg>): B1.96 … (red)' commit`: expected, smoke-only red without the marker (B1.82, B1.88, B1.89); `--auto` → `nothing to verify`                          |
| `scripts/hook-smoke.sh`, `scripts/agent/tier-smoke.sh` | `726 probes OK`, `9 probes OK`                                                                                                                                       |
| `git diff --stat origin/main...HEAD`                   | 8 files, 453 insertions, 15 deletions; all in the plan's Files                                                                                                       |

### Checklist

| Check                                                                   | Result                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every criterion has a test whose assertion matches its Then             | pass: T9 `union union union`; T10 `kept_once` (clean merge, guard rc 0, each row once); T11 the full error prefix with `$LAST_S` and the keep rule; T12 "§1 has 2 rows"                                                               |
| no test weakened after the red commit                                   | pass: `git log --first-parent --no-merges 1b82a46..HEAD -- '*.test.*' e2e/ scripts/table-merge-smoke.sh` empty; no merge commit in the range. T9's old expectation (`unspecified`) changed in the red commit itself, as the plan says |
| every changed file is in `plan.md`                                      | pass: `.gitattributes`, the guard, the smoke, `scripts/CLAUDE.md`, `backlog/plan/E1-todos.md`, `backlog/work/B1.96/*`                                                                                                                 |
| interfaces match the plan                                               | pass: the error line in `check-spec-sections.sh:14` is the plan's line verbatim; no flag, variable or exit code added                                                                                                                 |
| Zod at action boundary · Prisma only in lib · no raw SQL · migration    | n/a: no `src/`, `prisma/` change                                                                                                                                                                                                      |
| no secret, no suppression                                               | pass (guard above; diff read)                                                                                                                                                                                                         |
| features map row moved                                                  | n/a: tooling, no feature                                                                                                                                                                                                              |
| would a test fail if one changed line were reverted (probed on a clone) | pass: see probes                                                                                                                                                                                                                      |

### Probes (clone of 6948df1 under `$TMPDIR`, each restored before the next)

1. Duplicate loop removed from `check-spec-sections.sh` (lines 13–15): T10 ok, **T11 and T12 FAIL** (merge rc 0,
   guard rc 0, `2 of 12 probes FAILED`). Both depend on the new loop; T12's "§1 has 2 rows" is printed by nothing else.
2. Only the `spec/technical-requirements.md merge=union` line removed from `.gitattributes`: T9–T12 FAIL (`4 of 12`).
3. T11's "open" commit on main (smoke lines 125–126) removed: **all 12 still OK**, T12 included. So the open commit
   does not change T12's verdict (T12 branches from a main whose last row is ✗ or ✅; the re-pad doubles every row
   either way). It also does not decide T11's verdict: `set_last_cell` rewrites the cell as `| ✅ |`, which differs
   from the tree's padded `| ✅     |`, so side b is a whitespace edit of that row even without the ✗, and the union
   still keeps it twice. The open commit makes T11 a true ✗ → ✅ flip as the plan says, but no probe fails without it.
   Not a finding: the guard and the attribute are both pinned (probes 1, 2); the scenario T11 runs is the realistic one.
4. Header and separator rows: a re-padded header `| §    |` duplicated next to `| §   |`, and the separator doubled →
   guard OK. `^\| *§[0-9]+ ` needs a digit, so the header is never a key (answer to the dev-lead's question). A table
   whose header alone is doubled is not caught; it needs both sides to edit the header, and no card does.
5. Row key spacing: `|  §5  |` duplicated next to `| §5  |` → `::error::§5 has 2 rows …` (the ` *` absorbs extra
   leading spaces; `§3` and the row of section 31 never collide, the regex needs the trailing space).

Keep rule traced both directions: card branch merging main (T11: card's ✗ copy first, keep main's ✅) and a closing
branch merging main whose sibling appended below the flipped row (keep main's ✗ "plus this branch's own change" → ✅).
Both end with the right row.

### Findings

None blocking. Non-blocking note for `dev-lead`: `pr-body.md:9-10` still reads "pending" for test and acceptance, and
PR #273's head is a9a8a93 (the red, green and B1.92 commits are not pushed yet); fill both before `ready`.

Verdict: ready for PR

Riskiest unfalsified: GitHub's own merge of a BEHIND card PR under `merge=union` (still `[unverified]`; #273 reports
`MERGEABLE`, but it has no sibling edit to union), which decides whether batch 2 still needs a Loop 9 rerun, and, until
B1.92 lands, a duplicate index row from a clean Loop 9 merge is found only by CI after the push.
