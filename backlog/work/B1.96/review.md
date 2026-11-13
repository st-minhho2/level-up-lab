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
gains §32 then §33; a card branch cut at the base appends §34 and runs Loop 9's `git merge main` → `merge rc=0`, index
rows `§30, §31, §34, §32, §33`; `check-spec-sections.sh` → `::error::§34 is cited but has no heading in spec/contracts/`.

Verdict: changes requested

1. **T10 cannot pass as specified** (confirmed). `check-spec-sections.sh:8` greps every `§n` in
   `spec/technical-requirements.md` and fails on one without a `# §n` heading in `spec/contracts/*.md`; the probe above
   prints that error for an appended row. T10's appended rows need § numbers that have no index row (all of §1–§31
   have one), so "the rows point at an existing contract" does not help: the key is the § number, not the link. As
   written T10 ends with `RC=1` and `kept_once` fails, so green cannot reach "12 probes OK". The plan must say how each
   side's § gets a heading, e.g. side a appends `# §901 …` to one tracked contract file and side b `# §902 …` to a
   different one (`merge_sides` commits with `commit -qam`, so a new untracked contract file is not committed, and two
   sides appending to the same contract file conflict, since contracts keep git's default merge). T11 and T12 then
   reuse it, so their guard output names only the duplicate.
2. **Unstated cost: rows land in merge order, not § order** (confirmed). Union writes the merging branch's lines
   first, and Loop 9 merges main into the card branch, so a card's row lands above every row main gained since its
   branch point (probe: `§31, §34, §32, §33`, clean merge, no guard reads order). With D-33 batch 2 (§32–§34 in
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
