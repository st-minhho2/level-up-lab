# B1.98 review

## Plan review (round 1)

Plan at 705dcc3. Tooling card, no section. I ran the prototype (`proto/green/unattended.sh`, `proto/green/no-rework.sh`,
`proto/metrics-smoke.sh`) on two `git clone`s of this branch under `$TMPDIR`, with `/bin/bash` 3.2.57, and live
against GitHub (read-only).

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass, n/a: no section. Three files come from the card's Spec line (`unattended.sh`, its smoke, `docs/metrics.md`). `no-rework.sh` is there because the filter is "kept identical". `scripts/CLAUDE.md` is there for the B1.95 carry. `plan-files.sh --any B1.98 HEAD` lists 5 files plus `backlog/work/B1.98/*`. |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass, n/a: bash only. The interface is the TSV header plus two trailing columns. Columns 1–8 keep their positions. There is no flag, env var or exit code.                                                                                                                                                       |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass, n/a: no `advice.md` (tier quick, no section). B1.95 is the precedent.                                                                                                                                                                                                                                      |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 5 acceptance items, each with a count, a column or a label                                                                                                                                                                                                                                                 |
| verification lists exact commands with expected numbers                           | fail (minor), reason 4. Red is "35 ok, 16 FAIL" and green is "51 ok, 0 FAIL", and I reproduced both. `hook-smoke.sh` "count unchanged" and `pnpm test` "unchanged" give no number.                                                                                                                               |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass for tooling: no skeleton and no map row. The steps are red `test(scripts):`, then green `chore(scripts):` (no smoke file), then review, the same as B1.83 and B1.95.                                                                                                                                        |
| the section has a `Lead approves spec` box, ticked only by a human                | n/a: no section. `Plan approved by:` is empty and I did not touch it.                                                                                                                                                                                                                                            |
| no settled D-n contradicted                                                       | pass. D-29's text says "no lead message". D-37 already says a stopped run "is counted attended (B1.98)", and the card is the lead's own. D-19: the label is planned. D-28: `tier.sh` prints `medium`. Note on D-36 below.                                                                                        |
| `scripts/next-task.sh --check B1.98` on the committed plan says no overlap        | pass: "[next-task] B1.98: no overlap with any Doing or Review card"                                                                                                                                                                                                                                              |

What I ran:

- **Smoke, red** (today's scripts, the prototype smoke): "35 ok, 16 FAIL". The failures are M30, M31, M33, M34, M39,
  M41 and M44–M53. M50, M51 and M52 read `yes`.
- **Smoke, green** (the prototype scripts): "51 ok, 0 FAIL".
- **Live `unattended.sh`**, each batch matches the plan's table:

  | Batch       | Result                    | Rows that change                              |
  | ----------- | ------------------------- | --------------------------------------------- |
  | 275 276 277 | `unattended 1/3 = 33.3 %` | 276 `ended` · 277 `ended,ended` and `1bb65dd` |
  | 207 214 215 | `1/3`                     | 207 `ended` and `e65ffc9` · 215 `ended`       |
  | 223–225     | 3/3                       | none                                          |
  | 261–263     | 3/3                       | none                                          |
  | 292–294     | 3/3                       | none                                          |

- **Second runs.** #275 and #262 each had two runner runs. Both runs ended `**ready**`, so neither run is a stop.
- **Live `no-rework.sh`** on PRs 211 216 221 278 281 282 300 301 302: the old and new output are byte-identical
  (`cmp`), "no-rework 9/9 = 100.0 %".
- **Wrapper commits.** `run.sh`, `worktree.sh`, `next-task.sh --claim` and `pr-step.sh` make no commit, so the trailer
  rule sees no wrapper commit without `Agent-Run:`.
- **Agent merges.** Merges inside a run carry the trailer: bad1d8f and 7465491 on `feat/B5.2-agent` both have
  `Agent-Run: 1`.

### Reasons (changes requested)

1. **The plan describes the `docs/metrics.md` change in two different ways.**
   - The Files row says: "row 28 definition cell names the two cases (appended text only, unaligned, B1.97)".
   - The overlap paragraph says: "this card rewrites `docs/metrics.md` row 28's definition cell to the script's
     current rule, B1.83's window and `touches` included".
   - Row 28's window text ("→ the PR's first `ready_for_review`") is in the last cell, not the definition cell.
     Replacing it is a rewrite, not an append.

   The diff review compares against one of these, so say which cells change and whether each one is appended to or
   rewritten. If the window text stays, B1.87's first grep still matches and its overlap paragraph needs a change.

2. **The cost to B1.87 is not complete.**
   - B1.87's Acceptance requires "`scripts/CLAUDE.md` rows name M1–M49". After this card the row says M1–M53, so that
     clause can no longer be met as written.
   - The plan says B1.87's "Test line (`M1–M43` grep) then passes without it". That is half true. The grep is
     `M1–M43|R1–R15`, and it still matches the `pr-step-smoke.sh` row's R1–R15, so B1.87's Test stays red. That is
     the right result, but say it.
   - Say who re-scopes B1.87's card text, and when: the lead in a filing-lane PR, or this card with
     `backlog/plan/E1-todos.md` added to Files. Otherwise B1.87 is picked later with an Acceptance clause that fails.

3. **M53 pins a stops value that a live run never produces.**
   - `run.sh:252` posts `**${out%%:*}**`. A live error stop therefore bolds `error`, and its `- outcome:` line carries
     `error:max_turns`.
   - The smoke's `runner()` helper (`metrics-smoke.sh:320–322`) bolds the whole argument. So the prototype's M53
     expects `stops` = `error:max_turns`, which no live issue can show.
   - Trigger: any issue whose run ends in `error:<subtype>` or `limit:<subtype>`. Live, the column reads `error` or
     `limit`, so the probe's expected text is not the real interface.
   - Fix it one of two ways, and state the choice in the plan's Interfaces line:
     - (a) The probe's comment uses `run.sh`'s real body (bold the word only), and M53 expects `error`.
     - (b) Column 7 reads the `- outcome:` line, and Interfaces says the column holds full outcomes.

4. **Verification omits two numbers.** Give `hook-smoke.sh`'s probe count and `pnpm test`'s test count at the base
   (be888ff), as B1.95's evidence did ("hook-smoke 726, vitest 280"). "Unchanged" cannot be compared at diff time.

### Notes (no change required)

- **Closing lane.** It "also sets B1.95 Done". The lane's step 6 names one card in its branch and title, so state the
  closing PR's title and branch.
- **D-36.** D-36's consequence cell says no-rework counts 1bb65dd against #281. Live, `no-rework.sh` reads #281 `yes`,
  because 1bb65dd (05:01:19Z) is before ready (05:21:38Z). After this card the commit counts under unattended, which
  is where it falls. The lead may want that on record, since `00-decisions.md` is never rewritten.

Riskiest unfalsified: e65ffc9 is listed as a human commit. It is authored as `level-up-lab runner` with no trailer, at
04:18:39Z, 2 min before the relaunch's first trailered commit (6a75941), and nothing on record says who made it. If a
run can commit without `Agent-Run:` (lefthook skipped, `LEFTHOOK=0`), a fully unattended run would read `no`. No live
issue shows that case: 15 issues read, 2 commits flagged.

Verdict: changes requested
