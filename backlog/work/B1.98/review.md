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

## Plan review (round 2)

Plan at b2c30b0. I re-ran the updated prototype on two `git clone`s of this branch under `$TMPDIR` with `/bin/bash`
3.2.57: `red` has today's scripts and the prototype smoke, `green` has the prototype scripts. I also re-ran it live
against GitHub (read-only).

| Check                                                                             | Result                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass, n/a: no section. The Files list is the same as round 1: 5 files plus `backlog/work/B1.98/*`.                                                                                                                 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass, n/a: bash only. Column 7 now holds the first word of `- outcome:`, and Interfaces says so (`ended,error:max_turns`). That is r1 #3 option (b). The smoke's `runner()` bolds `${1%%:*}` as `run.sh:252` does. |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass, n/a: there is no `advice.md`.                                                                                                                                                                                |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 5 acceptance items.                                                                                                                                                                                          |
| verification lists exact commands with expected numbers                           | pass (r1 #4 fixed): hook-smoke "749 probes OK" and vitest "298 passed (298)" at be888ff. Red is "35 ok, 16 FAIL" and green is "51 ok, 0 FAIL", and I reproduced both.                                              |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass for tooling: red `test(scripts):`, then green `chore(scripts):`, then review. This is the same as B1.95.                                                                                                      |
| the section has a `Lead approves spec` box, ticked only by a human                | n/a: no section. `Plan approved by:` is empty and I did not touch it.                                                                                                                                              |
| no settled D-n contradicted                                                       | pass, unchanged from round 1. The D-36 note stands (no change required).                                                                                                                                           |
| `scripts/next-task.sh --check B1.98` on the committed plan says no overlap        | pass: "[next-task] B1.98: no overlap with any Doing or Review card". `scripts/agent/tier.sh` prints `medium`.                                                                                                      |

Round 1 reasons:

1. **`docs/metrics.md` (fixed).** The Files row now names cell 3 (appended text) and cell 7 (rewritten). Row 28 has 7
   cells today, and cell 7 holds the old window text "→ the PR's first `ready_for_review`". The overlap paragraph
   agrees with the Files row.
2. **B1.87 (fixed).** The plan states both costs: "M1–M49" can no longer be met, and the grep stays red on R1–R15. It
   also says who re-scopes the card: the lead, in a filing-lane edit. The plan does not edit B1.87.
   - One wording slip, no change required. After this card, B1.87's row 28 item ("names `touches`") is already met,
     not unmeetable. The planned re-scope ("no row 28 item") covers either reading.
3. **The `stops` value (fixed).** M53 now expects `error:max_turns`, and live comments carry the same value on their
   `- outcome:` line.
4. **The two numbers (fixed).**

What I ran:

- **Smoke, red:** "[metrics-smoke] 35 ok, 16 FAIL".
  - The failures are M30, M31, M33, M34, M39, M41 and M44–M53.
  - M50 and M51 read `yes` on the old 8 columns.
- **Smoke, green:** "[metrics-smoke] 51 ok, 0 FAIL".
- **Live `unattended.sh`**, the prototype green script. Every batch matches the plan's table:

  | Batch       | Result                     | Rows that change                                |
  | ----------- | -------------------------- | ----------------------------------------------- |
  | 275 276 277 | `unattended 1/3 = 33.3 %`  | #276 `ended` · #277 `ended,ended` and `1bb65dd` |
  | 207 214 215 | `unattended 1/3 = 33.3 %`  | #207 `ended` and `e65ffc9` · #215 `ended`       |
  | 223–225     | `unattended 3/3 = 100.0 %` | none                                            |
  | 261–263     | `unattended 3/3 = 100.0 %` | none                                            |
  | 292–294     | `unattended 3/3 = 100.0 %` | none                                            |

- **Live `no-rework.sh`** on PRs 211 216 221 278 281 282 300 301 302: today's output and the green prototype's output
  are byte-identical (`cmp`). Both print "no-rework 9/9 = 100.0 % (pending 0)".
- **Mutants on the green prototype.** Three single-line mutants each leave the smoke at "51 ok, 0 FAIL":
  - (a) `// "?"` changed to `// "X"`: nothing tests the value for a runner comment with no `- outcome:` line.
  - (b) The capture changed from `[^ \n]+` to `[^\n]+`: no probe's outcome carries `run.sh`'s ` (<detail>)` suffix.
    The live trigger is a `PROBLEM` outcome such as `- outcome: no-tmpdir (mktemp -d under /tmp failed)`. Under the
    mutant, that row's `stops` cell reads the whole line instead of `no-tmpdir`.
  - (c) The window's `$2 > l` changed to `$2 >= l`: no probe has a stop at the label's own second.

### Notes (no change required; the diff review checks them)

- **Untested interface.** The plan's Interfaces line defines (a) and (b), and no planned probe pins them. Neither
  changes a live verdict, because both mutants still produce a non-empty `stops`. The diff review re-runs these three
  mutants. A survivor of (a) or (b) will be a coverage finding unless the red commit already covers it, for example
  with a probe whose runner comment carries a detail and one with no outcome line. Adding them changes the planned
  "35 ok, 16 FAIL" / "51 ok, 0 FAIL". If so, state the new numbers in the commit body.
- **Prototype-only seam.** The prototype smoke adds `SRC="${SMOKE_SRC:-…}"`. That is an env var, and the plan says
  "No flag, env var". It must not land, or the Files row must name it.
- **Plan length.** The plan is 92 lines against the ≈ 40-line rule. B1.95's approved plan was 97 lines, and the change
  is one coherent filter. I am not asking for a split.

Riskiest unfalsified: e65ffc9, carried from round 1. It is a commit authored as `level-up-lab runner` with no
`Agent-Run:` trailer, and nothing on record says who made it. If a run can commit without lefthook's trailer, a fully
unattended run reads `no`. The plan now states this as a cost (`[unverified]`) and names the B1.57 dependency. No live
issue I read shows such a run.

Verdict: approved (ready for the lead's gate, not approved for build)

## Diff review (round 1)

Diff `origin/main...HEAD` (merge-base be888ff): red e7a9bb8, green e83061b. It touches 8 files: the 5 files in the
plan plus `backlog/work/B1.98/{plan,pr-body,review}.md`. Scope: scripts and docs only, so no `src/`, `prisma/` or `e2e/` change.

### Commands (last line of each)

| Command                                                                 | Result                                                                                                                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` / `pnpm typecheck`                                          | exit 0 / exit 0                                                                                                                                               |
| `pnpm test`                                                             | `Tests  298 passed (298)`                                                                                                                                     |
| `pnpm test:e2e`                                                         | `70 passed (2.3m)`                                                                                                                                            |
| `pnpm test:mutation`                                                    | `Final mutation score of 92.84 is greater than or equal to break threshold 70` (no `src/` change)                                                             |
| `/bin/bash scripts/metrics-smoke.sh` (3.2.57) at e83061b                | `[metrics-smoke] 51 ok, 0 FAIL`                                                                                                                               |
| the same at e7a9bb8 (a `git clone` under `$TMPDIR`)                     | `35 ok, 16 FAIL`: M30 M31 M33 M34 M39 M41 M44–M53, as the plan says                                                                                           |
| `scripts/hook-smoke.sh`                                                 | `hook-smoke: 749 probes OK`                                                                                                                                   |
| `check-suppressions`, `check-config-change`                             | `OK: no new suppressions` · `OK: no protected config changed`                                                                                                 |
| `check-feat-commits`, `check-ac-coverage`                               | `OK: no feat commit touches tests` · `OK: every criterion of a shipped section has a test`                                                                    |
| `check-spec-sections`, `check-features-map`                             | `OK: sections cited: 1 … 37` · `OK`                                                                                                                           |
| `check-backlog`, `check-plan-scope`                                     | `OK: README matches the cards` · `OK: chore/B1.98-unattended-honest stays inside the approved plan of B1.98`                                                  |
| `scripts/next-task.sh --check B1.98`                                    | `[next-task] B1.98: no overlap with any Doing or Review card`                                                                                                 |
| `scripts/verify-red.sh B1.98`                                           | `::error::no 'test(<pkg>): B1.98 … (red)' commit`. This is expected: see the checklist row "red commit".                                                      |
| live `unattended.sh 275 276 277 207 214 215 223 224 225`                | the rows match the plan's table: #276 `ended` · #277 `ended,ended` and `1bb65dd` · #207 `ended` and `e65ffc9` · #215 `ended` · the 5 others `yes` with `-\t-` |
| live `no-rework.sh 278 281 282 211 216 221`, origin/main copy vs branch | byte-identical (`cmp`). Both print `no-rework 6/6 = 100.0 % (pending 0)`                                                                                      |

### Checklist

| Check                                                  | Result                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance item has a probe that asserts it      | pass. Stop: M50 (`ended`) and M51 (`ended,ended`). Commit: M30 and M51 (sha7). 1/3 on 275–277, plus E5 and E6 b1 stated: live (above). Row 28: cell 3 names both cases, cell 7 defines them. bash 3.2: smoke on `/bin/bash`. Label `config-change-approved` is on #306.                                                                                                                       |
| no test weakened after the red commit                  | pass. `git log --first-parent --no-merges e7a9bb8..HEAD -- '*.test.*' e2e/ scripts/metrics-smoke.sh` is empty, and the merge `--remerge-diff` is empty. e83061b touches 4 files, and none is the smoke.                                                                                                                                                                                       |
| red commit                                             | pass, with the plan's deviation explained. e7a9bb8 drops the plan's `(red)` marker. Its body says why: `verify-red.sh` judges only `*.test.ts(x)`, and a `(red)` subject with none fails CI's `--auto` ("touch no *.test.ts(x) file", verify-red.sh:73). This is the B1.95 precedent (B1.95 review, line 170).                                                                                |
| M30 flipped `yes` → `no`, M34 share 3/6 → 2/6          | pass, and not a weakening. M30 still pins `messages` 0, so the runner comment and the bot comment are still not messages. Its 02:50 trailer-less commit is inside the window, and the new rule says `no` for that. The `yes` path is still pinned in full rows by M33, M44, M46–M49 and M52. Moving the fixture commit instead would have changed M35/M36 (no-rework reads the same PR #601). |
| `runner()` bolds `${1%%:*}`                            | pass. This matches `run.sh:252` (`**${out%%:*}**`). In M42, `error:max_turns` now bolds `error`: still class `runner` (no `**gate**`), so the gate reset M42 tests is unchanged, and M53 reads its column 9 as `error:max_turns`. M43 calls `runner()` only through `GATE_HIGH` (`gate`, which has no colon), so it is unchanged.                                                             |
| every changed file is in the plan                      | pass (check-plan-scope OK). The `SMOKE_SRC` prototype seam from round 2 did not land (`SRC="$PWD/scripts/metrics"`, line 56).                                                                                                                                                                                                                                                                 |
| interfaces match the plan                              | pass. 10 TSV columns, and columns 1–8 are unchanged. The filter is identical in both scripts (column 7 added). No flag, env var or exit code.                                                                                                                                                                                                                                                 |
| `docs/metrics.md` row 28                               | pass. Only cells 3 and 7 differ. They are unaligned and the other cells are byte-identical (B1.97). Cell 3 now reads "…no lead message in between (D-29), no runner stop and no PR commit without `Agent-Run:` (B1.98)". "In between" grammatically covers only the message, but cell 7 bounds all three cases with "inside the window". Not a finding.                                       |
| secrets, suppressions, raw SQL, Prisma, migration, map | n/a or pass. No `src/` or `prisma/` change. Tooling card, so no map row.                                                                                                                                                                                                                                                                                                                      |
| would a test fail if a changed line were reverted      | pass. Five mutants on a `$TMPDIR` clone of e83061b, each killed: stops lower bound `>=` → M52 · human upper bound `<=` → M52 · capture `[^\n]+` → M51 · verdict without `-z "$human"` → M30, M34 · M53 kills `// "?"` (dev-lead's check, which I did not re-run). The round-2 survivors (a), (b) and (c) are all killed now.                                                                  |

### Findings

None blocking.

Notes (no change required):

- `pr-body.md` still reads "Red / green: pending", "acceptance: pending" and "plan deviations: pending". PR #306's
  head is 06c5644, so e7a9bb8 and e83061b are not pushed yet. Before ready, the deviations field should name the
  dropped `(red)` marker, and the Evidence section should quote the live table above.
- High-tier runs. `scripts/ci/plan-files.sh --run` refuses tier high (line 74), so no run can carry a high-tier plan
  past its gate. A lead who finishes one by hand commits without the trailer, and the issue now reads `no` under
  `human_commits`. D-29's exception covers the gate comment and its `approve`, and this card keeps both. The resume
  path is undefined since B1.57 (analysis Q5), and no live issue has reached it.

Riskiest unfalsified: `e65ffc9` on #207 (author `level-up-lab runner`, no `Agent-Run:`). If a run can commit
without lefthook's `prepare-commit-msg` (a checkout without `pnpm install`, B1.57), then an unattended run reads `no`.
E5 batch 1's drop to 1/3 rests partly on that commit. #207 is `no` on its `ended` stop alone, so the batch verdict
does not depend on it, but the `human_commits` cell might. The plan records this as `[unverified]`.

Verdict: ready for PR
