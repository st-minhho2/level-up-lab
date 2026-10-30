# B1.16 review

## Plan review (round 1)

SCOPE: none of lib | actions | ui. The plan touches `scripts/metrics/*.sh`, `scripts/metrics-smoke.sh`,
`scripts/CLAUDE.md`, `docs/metrics.md` and `backlog/work/B1.16/`. It has no `src/`, `prisma/` or `e2e/` path, so no
spec section, skeleton, map row or Stryker run applies.

Plan reviewed at `1c3ae66` (`docs(backlog): B1.16 plan`), card at `b29bafa`. I ran the probes on a scratch clone with
PR heads `#1 #5 #8 #11 #13 #15 #27 #29 #31 #33 #36 #39 #46 #50 #52` fetched into it, plus `gh pr view|list`
(read-only). I did not edit the worktree.

### How the checklist was adapted to a tooling card (as B1.12–B1.15)

| Row in `reviewer.md`                         | Read here as                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| files belong to the section's features (map) | files belong to the card's Spec/Test/Acceptance lines (no §, no map)                  |
| interfaces follow `ts-style.md`              | CLI, output format and the exact `git`/`gh` calls stated; bash 3.2, `git` + `gh` only |
| follows `advice.md`                          | no `advice.md` (Tier quick, no section): the skip must be stated                      |
| ≤ 7 criteria, measurable Then                | the card's Test and Acceptance, and the plan's M1–M8                                  |
| skeleton → red → green → map → review        | no skeleton, no map; red = smoke fails on a missing script (card: as B1.15 (b))       |
| `Lead approves spec` box                     | n/a: no section                                                                       |

### Checklist

| Check                                    | Result                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| files belong to the card                 | pass: the two metrics scripts are Acceptance 1–2, the smoke is the card's Test, the `scripts/CLAUDE.md` rows are the card's Spec line, and `docs/metrics.md` is Acceptance 3. `git diff --stat main...HEAD` shows only the card commit and `plan.md`.                                                                               |
| interfaces stated                        | **fail**: the CLI and output lines are pasted, but the `gh` calls are not (reason 4). The plan does not say how an ISO `mergedAt` becomes minutes on both BSD and GNU (reason 4).                                                                                                                                                   |
| advice                                   | pass: the spec-analyst/advisor skip is stated (no section, Tier quick).                                                                                                                                                                                                                                                             |
| follows the card or states the deviation | **fail**: four unstated deviations from the card's Acceptance (reason 2).                                                                                                                                                                                                                                                           |
| criteria measurable                      | **fail**: M1–M8 are measurable. The change-failure rule contradicts its own worked example, and two probes needed to pin it are missing (reason 3).                                                                                                                                                                                 |
| verification exact with numbers          | **fail**: the expected `median 35.5 min` does not follow from the rule the plan states (reason 1). "(± the prototype)" is not a number.                                                                                                                                                                                             |
| work breakdown                           | pass: `test(scripts)` → `feat(scripts)` → `docs(metrics)` → review → PR. All subjects match the `lefthook.yml:31` regex. `check-feat-commits.sh` matches only `*.test.ts(x)`/`e2e/`, so the rule that green does not touch the smoke is the plan's own; diff review will check `git diff <test>..HEAD -- scripts/metrics-smoke.sh`. |
| who edits `scripts/`                     | pass: the orchestrating session edits under this approval, as B1.12–B1.15 (stated as a deviation).                                                                                                                                                                                                                                  |
| protected path and label                 | pass: no planned path matches `PROTECTED` (`scripts/ci/check-config-change.sh:10`), so no `config-change-approved` is needed. No new dependency.                                                                                                                                                                                    |
| one screen                               | 62 lines, against the ≈ 40 guideline (B1.13's approved plan was 68). Not blocking.                                                                                                                                                                                                                                                  |
| `Lead approves spec` box                 | n/a: no section.                                                                                                                                                                                                                                                                                                                    |
| no settled D-n contradicted              | pass: D-2 places approval at the `Plan approved by:` line, and the plan's subject rule reads the commit that writes that line (reason 2 asks for this to be stated). D-7's tick is the card's second signal. D-13 shape followed.                                                                                                   |

### Probe results (the plan's stated rule, applied to the PR heads)

```
card  PR   plan-approved commit (author)        first tick-line commit on PR head          merge (UTC)            s
B1.1  #1   none                                 none                                       12:20:22  n/a
B1.2  #5   4810825 20:08:10+07                  6cb96a3 20:58:28+07  ← PR #4's squash      14:06:17   469 (7 min; 58 by plan-approved)
B1.3  #8   63686be 06:15:57+07                  63686be                                    00:00:08  2651
B1.4  #11  f5f53fe                              f5f53fe                                    02:13:07  1776
B1.5  #13  ef73bec 09:36:22 (round 1)           ef73bec        (round 2: 9efec0b 09:45:41) 03:31:18  3296
B1.6  #15  43f0da1                              43f0da1                                    04:38:27  2151
B1.7  #27  771c68e                              none                                       08:02:05  2014
B1.8  #29  cd5d1c7                              cd5d1c7                                    08:38:35   964
B1.9  #31  2c45607                              2c45607                                    09:20:02  1244
B1.10 #33  7826bf0                              none                                       14:22:29  1617
B1.11 #36  bcec946                              bcec946                                    23:02:36 23818
B1.12 #39  1c563f7                              none                                       01:13:36  6259
B1.13 #46  ea6eb8f                              none                                       04:24:25  4109
B1.14 #50  ebe9934                              none                                       06:07:05  2102
B1.15 #52  cbaf169 ("…plan approved, option (a)")  none                                    06:54:11   942
sorted s: 469 942 964 1244 1617 1776 [2014 2102] 2151 2651 3296 4109 6259 23818
median of 14 = (2014+2102)/2 s = 34.3 min; whole minutes floored 33,35 → 34; rounded 34,35 → 34.5
same with B1.2 = 3488 s (tick ignored): 7th/8th = 2102, 2151 → floored 35,35 → 35; rounded 35,36 → 35.5  ← the plan's number

change failure: fix/revert PRs #21 #22 #39 #41 #44 #46 #50 #52 vs card PRs merged earlier, non-doc files:
  #50 shares scripts/prune-smoke.sh scripts/worktree-prune.sh with #46 (B1.13) → 1/15, as the plan says
  self-match: #39 #46 #50 #52 each share ≥ 1 non-doc file with themselves → 4/15 if a card's own PR is not excluded
  direction: #46 (04:24Z) shares both files with #50 (06:07Z) → B1.14 also counted, 2/15, if "within" is |Δt|
gh pr list default --limit = 30; merged PRs today = 54
```

### Reasons (changes requested)

1. **The expected median does not follow from the stated rule (confirmed).** The rule is "the later of the
   plan-approved commit and the first commit adding a `Lead approves spec (… <card>)` line on `refs/pull/N/head`".
   For B1.2 that tick commit is `6cb96a3`, the squash of docs PR #4 (merged 13:58:28Z). It came into PR #5's head
   from `main` and adds `[x] Lead approves spec (…, plan gate of B1.2)` 50 min after `4810825`. B1.2 then measures
   7 min, not 58, and the median of 14 is 34.3 min (34 floored, 34.5 rounded), not 35.5. 35.5 comes only from
   ignoring that tick and rounding to the nearest minute. Before approval, the lead must choose and the plan must
   state:
   (a) keep the card's rule as written → B1.2 = 7 min, baseline 34 or 34.5, and the −30 % target becomes ≤ 23.8
   or ≤ 24.15 (not 24.8); or
   (b) count only tick commits that are the card's own (not reachable from the PR's merge base on `main`) →
   B1.2 = 58, baseline 35 or 35.5. This is a deviation from the card and needs saying.
   Also pin "whole minutes" (floor or round) and replace "(± the prototype)" with the exact expected line. The
   Risk paragraph's 24.8 must follow whichever is chosen.
2. **Unstated deviations from the card's Acceptance (confirmed).** Each needs a line so the lead approves it knowingly:
   (a) the card says "the hours between", the plan prints minutes;
   (b) the card's approval signal is "the commit adding `Plan approved by: lead` to `work/<card>/plan.md`", the
   plan's is the commit subject `docs(backlog): <card> plan approved`. The subject rule is the sounder one, and the
   reason belongs in the plan. Taken literally, the card's rule gives: B1.2 → n/a (its line names a person's handle, not `lead`);
   B1.3 → `df3ec5c` 06:43, 27 min after the real approval (a later rename to `lead`); B1.15 → no match (the line
   wraps, `Plan\napproved by: lead`);
   (c) the card counts PRs ÷ cards, the plan counts cards with ≥ 1 repair ÷ cards (same today, 1, but not in general);
   (d) "first" plan-approved commit picks B1.5's round-1 approval (`ef73bec` 09:36:22). Round 2
   (`9efec0b` "plan round 2 approved", 09:45:41) is the one that gated the build. B1.5 reads 54 min instead of 45. State which one counts.
3. **The change-failure rule contradicts its own example, and two probes are missing (confirmed).** The text says
   "not a card's own feature PR", but the one counted repair, #50, is B1.14's own feature PR. The rule must say
   "not card C's own feature PR". B1.12–B1.15's feature PRs are all titled `fix(…)` and each shares its files with
   itself. If an implementation does not exclude self, the rate becomes 4/15. If it reads "within 14 days" as
   |Δt|, #46 counts as repairing B1.14 and the rate becomes 2/15. M1–M8 catch neither. Add
   **M9:** a card whose own feature PR is titled `fix` is not its own repair, yet that PR still counts against an
   earlier card. Add **M10:** a `fix` PR merged _before_ card C's PR and sharing a file is not counted for C.
4. **The `gh` calls and the time conversion are not pinned (plausible).** The interface names
   `gh pr view|list` but not the flags. `gh pr list` returns 30 items by default, and 54 PRs are merged today. A
   call without `--limit` (or `--search`) silently drops older fix PRs once the repo grows, and the smoke's handful
   of fixture PRs would never show it. The plan also does not say how `mergedAt` (ISO 8601) becomes epoch seconds.
   `date -j -f` is BSD-only and `date -d` is GNU-only, while `scripts/CLAUDE.md` promises the dev container and CI
   run every script unchanged. `gh … --jq '.mergedAt | fromdateiso8601'` keeps the card's "git + gh only". Paste
   the exact calls, since the shim whitelists them anyway, and name the conversion.

### Notes (not blocking)

- "Read-only scripts" still fetch `refs/pull/N/head`. Name the target, `FETCH_HEAD` or a scratch ref, so the
  shared `.git` of every worktree does not gain refs.
- The approval time is when dev-lead commits the plan-approved line, not when the lead replies. Under batched lead
  review that lag may grow, and it is invisible here.
- Shell globbing on the card id: `B1.1` must match neither `B1.10`/`B1.11` nor `B1x1`. Anchor it with an escaped
  `.` and a following space or `)`. M-probes with B1.1 and B1.10 together would pin this.

Verdict: changes requested

## Plan review (round 2)

SCOPE: none of lib | actions | ui (unchanged from round 1: `scripts/`, `docs/metrics.md`, `backlog/work/B1.16/`).

Plan reviewed at `6786a45`; `origin/main` at `58cee7c`, the plan's prototype base. I re-derived both numbers on a
scratch clone (outside this worktree's `.git`) with `refs/pull/N/head` for the 15 card PRs fetched into it, plus
read-only `gh pr view` and `gh pr list`. I edited nothing in the worktree except this section. Checklist adapted
to a tooling card as in round 1.

### Round-1 reasons

| #   | Round-1 reason                              | Now                                                                                                                                                                                                                                                                                                                             |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | median does not follow from the rule        | resolved: option (b) chosen (`--first-parent --no-merges` drops ticks merged in from `main`), floor pinned (⌊s/60⌋), exact expected line, Risk −30 % = ≤ 24.5 min follows from 35. The deviation sentence states B1.2's consequence backwards (new reason 2).                                                                   |
| 2   | unstated deviations (a)–(d)                 | resolved: (a) the output now has `minutes` and `hours` columns, so the card's "hours" is printed, not a deviation; (b) the subject rule is stated with B1.3's rename and B1.15's wrap as the reasons; (c) "distinct repair PRs ÷ cards (card's wording)"; (d) "latest plan-approved commit" is stated, with B1.5 at 45, not 54. |
| 3   | change-failure rule contradicts its example | resolved: "other than card C's own feature PR (another card's feature PR may count)", the window is (merge, merge + 14 d], M9 (own `fix` PR not its own repair) and M10 (fix merged before the card) added.                                                                                                                     |
| 4   | `gh` calls and time conversion not pinned   | partly resolved: the `view` call is pinned with `fromdateiso8601` and the `list` call with `--limit 1000`. The `list` call has no conversion and no `--jq`, and the shim rejects any other call (new reason 1).                                                                                                                 |

### Re-derivation (the plan's own rules, on the PR heads)

```
card  PR   latest plan-approved   first-parent tick   s       ⌊min⌋
B1.1  #1   none                   none                n/a
B1.2  #5   4810825                none (6cb96a3 is off the first-parent chain)  3487  58
B1.3  #8   63686be                63686be             2651    44
B1.4  #11  f5f53fe                f5f53fe             1776    29
B1.5  #13  9efec0b (round 2)      ef73bec (earlier)   2737    45
B1.6  #15  43f0da1                43f0da1             2151    35
B1.7  #27  771c68e                none                2014    33
B1.8  #29  cd5d1c7                cd5d1c7              964    16
B1.9  #31  2c45607                2c45607             1244    20
B1.10 #33  7826bf0                none                1617    26
B1.11 #36  bcec946                bcec946            23818   396
B1.12 #39  1c563f7                none                6259   104
B1.13 #46  ea6eb8f                none                4109    68
B1.14 #50  ebe9934                none                2102    35
B1.15 #52  cbaf169                none                 942    15
sorted: 15 16 20 26 29 33 [35 35] 44 45 58 68 104 396 → median 35 min, 35/60 = 0.6 h, over 14; n/a: B1.1   ✔ plan

gh pr list --state merged --limit 1000 --json number,title,mergedAt,files → 55 PRs, exit 0
fix/revert titles: #21 #22 #39 #41 #44 #46 #50 #52; rule (self excluded, (m, m+14d], non-doc overlap):
  #46 (B1.13) repaired_by [50]; every other card [] → 1/15 = 6.7 %   ✔ plan
max files per PR in that output: 100 (#3, the bootstrap chore PR; gh returns at most 100 files per PR)
```

Both expected lines in the Verification block follow from the stated rules. Each card's `**Status: Done**` line
carries exactly one `(#N)`. B1.12's card body also quotes `**Status: Done** — x` (E1-todos.md:143, indented, no
`(#N)`); "15 rows" catches a parser that matches it.

### Checklist

| Check                                    | Result                                                                                                                                                                                                                                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| files belong to the card                 | pass: unchanged from round 1. `git diff --stat origin/main...HEAD` shows `plan.md` and `review.md` only.                                                                                                                                                                         |
| interfaces stated                        | **fail**: the `list` call is pinned in a form whose output (raw JSON, ISO `mergedAt`) the script cannot use under "git + gh only" (reason 1).                                                                                                                                    |
| advice                                   | pass: the skip is stated (no section, Tier quick).                                                                                                                                                                                                                               |
| follows the card or states the deviation | **fail**: all four deviations are now stated, but the B1.2 one gives the wrong consequence (reason 2).                                                                                                                                                                           |
| criteria measurable                      | pass: M1–M10 each name an input and an outcome. M5 pins an even-count median. The way it rounds (mean of the two middle ⌊min⌋, or of seconds) is not stated; today both give 35. The test-writer's expected number in M5 will settle it.                                         |
| verification exact with numbers          | pass: "10 of 10 ok", "15 rows", the median line and the `1/15 = 6.7 %` line are exact, and both re-derive (above).                                                                                                                                                               |
| work breakdown                           | pass: `test(scripts)` → `feat(scripts)` → `docs(metrics)` → reviewer diff → PR. No `(red)`, as B1.12–B1.15.                                                                                                                                                                      |
| protected path and label                 | pass: no planned path matches `PROTECTED` (`scripts/ci/check-config-change.sh:10`). No new dependency.                                                                                                                                                                           |
| one screen                               | 65 lines against ≈ 40. Not blocking (B1.13's approved plan was 68).                                                                                                                                                                                                              |
| `Lead approves spec` box                 | n/a: no section.                                                                                                                                                                                                                                                                 |
| no settled D-n contradicted              | pass: the subject rule reads the commit that writes D-2's `Plan approved by:` line. D-7's tick is the second signal. Ignoring a tick merged in from `main` is a stated measurement choice, not a change to D-7's gate. The merged-in B1.2 tick came from docs PR #4 (`6cb96a3`). |

### Reasons (changes requested)

1. **The pinned `gh pr list` call cannot be consumed under the plan's own constraints (confirmed).** The plan pins
   `gh pr list --state merged --limit 1000 --json number,title,mergedAt,files` with no `--jq`. Its output is a
   single JSON array: nested `files[].path` and ISO `mergedAt` (`2026-10-30T06:07:05Z`). M6, M7 and M10 need
   `mergedAt` as epoch to test (m, m + 14 d], but the plan names no conversion for this call ("no `date` flavour"
   covers only `view`). The card allows `git` + `gh` only, and no script here uses `jq`; the one precedent,
   `scripts/worktree-prune.sh:149`, uses `gh … --jq`. That leaves the code-writer two paths, both costly. One is a
   JSON parser plus a civil-date → epoch routine in bash 3.2/awk. The other is adding `--jq`, which changes the call
   the shim whitelists ("any other exits 99 and FAILs"), fails M6–M10 and forces a mid-build re-approval
   (`planning.md`). Pin the call with its `--jq`, for example
   `--jq '.[] | [.number, (.mergedAt | fromdateiso8601), ([.files[].path] | join(" ")), .title] | @tsv'`
   (title last, since it may contain anything). The shim then whitelists that string.
2. **The B1.2 deviation states its consequence backwards (confirmed).** The plan says "spec ticks merged in from
   `main` ignored (B1.2's tick arrives in #4's squash: 7 min, not 58)". The sibling "(B1.5 round 2: 45 min, not 54)"
   reads as "result, not alternative". By that pattern the rule gives B1.2 = 7, but it gives 58. `6cb96a3` is off
   `refs/pull/5/head`'s first-parent chain, so B1.2 is 3487 s = 58 min, and 58 is what makes the median 35. The lead
   approves this deviation from that sentence, so it must read "58 min, not 7". With B1.2 at 7 the median would be
   34 and the target ≤ 23.8.

### Notes (not blocking, carried from round 1 where still open)

- The fetch target is still unnamed ("on `refs/pull/N/head`, fetched"). `git fetch origin refs/pull/N/head`
  (→ `FETCH_HEAD`) or a ref under a scratch namespace that the script deletes keeps "read-only" true for the `.git`
  that every worktree shares.
- Card-id matching: the subject regex is anchored by the following space (`<card> plan`) and the tick by `)`, so
  B1.1 ≠ B1.10. The `.` must still be escaped (B1x1). No M-probe has B1.1 and B1.10 side by side.
- `gh` returns at most 100 `files` per PR (PR #3 hits it). A card PR with more than 100 files would under-count
  overlaps. None does today, and the rate is an upper bound anyway. Say so in the `docs/metrics.md` row.
- This is round 2. If the lead wants the plan revised, round 3 goes to the human per the cap ("Waiting on human").
  Both reasons are one-line plan edits.

Verdict: changes requested

## Diff review (pass 1)

SCOPE: none of lib | actions | ui (tooling). Diff `origin/main..56cebc7`: `scripts/metrics/lead-time.sh` (new, 51),
`scripts/metrics/change-failure-rate.sh` (new, 55), `scripts/metrics-smoke.sh` (new, 130), `docs/metrics.md` (two rows,
table re-padded), `scripts/CLAUDE.md` (three rows, table re-padded), `backlog/work/B1.16/{plan,review}.md`. `/bin/bash`
3.2.57, git 2.39.5 (Apple). Probes ran on a copy (`$TMPDIR/b116copy/probe`) and in `$TMPDIR` scratch repos; the
worktree was not edited (`git status` clean after every run).

### Command results (last line, exit)

```text
pnpm lint                               All matched files use Prettier code style!                                  0
pnpm typecheck                          tsc --noEmit                                                                0
pnpm test                               Tests  115 passed (115)                                                     0
pnpm test:e2e                           13 passed (19.4s)                                                           0
pnpm test:mutation                      Final mutation score of 89.02 is greater than or equal to break threshold 70  0
scripts/ci/check-suppressions.sh        [check-suppressions] OK: no new suppressions
scripts/ci/check-config-change.sh       [check-config-change] OK: no protected config changed
scripts/ci/check-feat-commits.sh        [check-feat-commits] OK: no feat commit touches tests
scripts/ci/check-ac-coverage.sh         [check-ac-coverage] OK: every criterion of a shipped section has a test
scripts/ci/check-spec-sections.sh       [check-spec-sections] OK: sections cited: 1 2 3 4 5 6 7 8 9 10 11
scripts/ci/check-features-map.sh        [check-features-map] OK
scripts/ci/check-backlog.sh             [check-backlog] OK: README matches the cards
scripts/hook-smoke.sh                   hook-smoke: 221 probes OK
bash -n scripts/*.sh scripts/metrics/*  exit 0
scripts/verify-red.sh B1.16             ::error::no 'test(<pkg>): B1.16 … (red)' commit  (expected: plan says no marker, as B1.12–B1.15)
red  (25f66fe smoke, no scripts/metrics) [metrics-smoke] 0 ok, 10 FAIL
green (HEAD smoke)                      [metrics-smoke] 10 ok, 0 FAIL                                               0
25f66fe smoke vs HEAD scripts           [metrics-smoke] 9 ok, 1 FAIL (M5: BSD grep usage error; printed line was the expected one)
scripts/metrics/lead-time.sh            median 35 min (0.6 h) over 14 cards; n/a: B1.1   (15 rows; range 15–396)    0
scripts/metrics/change-failure-rate.sh  change failure rate 1/15 = 6.7 %   (B1.13 #46 repaired_by #50)              0
gh pr view 46/50 files, intersection    scripts/CLAUDE.md scripts/prune-smoke.sh scripts/worktree-prune.sh (docs row accurate)
git diff --stat main...HEAD             7 files changed, 564 insertions(+), 36 deletions(-)
```

### Checklist

| Check                                         | Result                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance item has a probe matching it | pass with a gap: M1–M10 match the plan's rules; [2] and [3] below are rules the plan states that no probe pins                                                                                                                                                                                                                                                                                        |
| no test weakened after red                    | pass: `git diff 25f66fe..HEAD -- scripts/metrics-smoke.sh` is one line (`grep -qx` → `grep -qx --`), in its own `test(scripts)` commit before `feat`. Confirmed necessary: the 25f66fe smoke against the HEAD scripts fails M5 on grep usage while printing the expected line verbatim. Expected strings unchanged; it makes M5 passable, not looser. Acceptable deviation, stated in the commit body |
| every changed file is in `plan.md`            | pass: the seven files are the plan's Files table                                                                                                                                                                                                                                                                                                                                                      |
| interfaces match the plan                     | pass: both usage lines, TSV headers and last-line formats are the pinned ones; the shim whitelists the exact `gh` strings and denied nothing                                                                                                                                                                                                                                                          |
| Zod / Prisma / raw SQL / migration            | n/a: no `src/`, no `prisma/`                                                                                                                                                                                                                                                                                                                                                                          |
| no secret, no suppression, no new dependency  | pass: `git` + `gh` (`--jq`) only, as `worktree-prune.sh:149`                                                                                                                                                                                                                                                                                                                                          |
| features map row                              | n/a: tooling, no section; `scripts/CLAUDE.md` rows added                                                                                                                                                                                                                                                                                                                                              |
| docs numbers re-derive                        | pass: median 35 (sorted middle pair 35, 35), range 15–396, 1/15 = 6.7 %, #50 shares 3 files with #46                                                                                                                                                                                                                                                                                                  |
| would a reverted line fail a probe            | partly: 19 single-line mutants on the copy. Killed: plan `tail -1`→`head -1`, tick `--first-parent` dropped (M4), `--no-merges` dropped, tick-wins comparison flipped, median lower-middle, round group dropped, `Revert "` dropped, `*.md` filter dropped, window +1 day. Survived: listed under [2], [3] and Notes                                                                                  |

### Findings

```
[1] KIND: correctness
    WHERE: scripts/metrics/lead-time.sh:29-33
    DEFECT: `git log -G` compiles its pattern as an extended regex, so the parens in
            "Lead approves spec ([^)]*$esc)" are a group, not literals; the pattern matches any
            "Lead approves spec " line containing the card id as a prefix (B9.2 matches "B9.20)") or
            with no parens at all, and the comment on line 29 states the opposite.
    TRIGGER: in the smoke fixture (copy), one extra commit on main before the branches are cut:
            spec/t.md "- [x] Lead approves spec (lead, d, B9.20)" at T0-500. B9.2's own tick (T0+600)
            is then not the oldest match; the foreign tick is, it loses to the plan commit (T0), and
            the own tick is ignored. Also confirmed in a scratch repo: pattern for 'B1\.2' lists the
            commits adding "(lead, d, B1.20)" and "— B1.2 later"; a literal `spec (lead` aborts with
            "parentheses not balanced" (ERE).
    WRONG BEHAVIOUR: B9.2 → 30 min instead of 20; the smoke goes 8 ok, 2 FAIL (M2, M5 median).
            Plan: "the tick by `)`, so B1.1 ≠ B1.10". Today's numbers are unaffected (with `\(…\)`
            the 15 real rows are byte-identical), but the row says "re-measure after each batch":
            any epic reaching card 10 (B2.1 vs B2.10–B2.19) in parallel delivery, the regime this
            metric exists for, over-states the lower card's lead time or turns its n/a into a value.
    CONFIDENCE: confirmed (ran)

[2] KIND: coverage
    WHERE: scripts/metrics-smoke.sh:75,82 (M8) vs scripts/metrics/change-failure-rate.sh:35
    DEFECT: every fixture path under backlog/ and docs/ ends in .md, so the directory half of the
            "outside *.md, backlog/, docs/, spec/" filter is never exercised.
    TRIGGER: mutants `(backlog|docs|spec)` → `(backlog|spec)` and → `(docs|spec)` on the copy.
    WRONG BEHAVIOUR: both mutants pass 10 ok, 0 FAIL; a fix PR sharing only a non-md file under
            backlog/ (one exists: backlog/work/B1.12/probe.sh) would count as a repair without any
            probe noticing. M8's header claims "sharing only *.md/backlog/docs → not".
    CONFIDENCE: confirmed (ran)

[3] KIND: coverage
    WHERE: scripts/metrics-smoke.sh:80-85 vs scripts/metrics/change-failure-rate.sh:48,53
    DEFECT: no fixture PR repairs two cards, so "k = distinct repair PRs" is unpinned.
    TRIGGER: mutant `repair[r]` → `repair[r card]` (counts card/PR pairs) on the copy.
    WRONG BEHAVIOUR: passes 10 ok, 0 FAIL; one fix PR sharing files with two cards would give
            2/n instead of the plan's 1/n.
    CONFIDENCE: confirmed (ran)
```

### Notes (not blocking)

- Surviving mutants judged acceptable: `r == pr ||` removed (equivalent: the own PR has `merged[r] == merged[pr]`
  and the window's `<=` already excludes it, so M9 is carried by the window); window `<=`→`<` and `>`→`>=` (no
  fixture on an exact boundary); tick `head -1`→`tail -1` (one tick per card in the fixture; the plan's "oldest" is
  unpinned); `-- spec/` dropped; plan-subject `--first-parent` dropped. A probe for the tick's "oldest" would be cheap
  alongside [1].
- Card vs plan: the card's Acceptance asks the script to print the approval time and the squash-merge time; the
  pinned interface prints `approval_sha` and minutes/hours, not timestamps. The lead approved that interface, but
  the plan's "Deviations" paragraph does not name it. State it in the PR body.
- `m=$(( (merged - approval) / 60 ))` truncates toward zero, so an approval authored after the merge (amended or
  rebased commit) gives 0 for −59 s, not ⌊⌋ = −1. Not reachable with today's data.
- `gh pr list --limit 1000` truncates silently above 1000 merged PRs (55 today); `files` caps at 100 per PR (round 2
  note); file paths with spaces split. The row already calls the rate an upper bound.

Verdict: back to test-writer (a probe for [1], a foreign `B9.20` tick before branching, then probes for [2] and [3]
in the same `test(scripts)` commit), then code-writer (escape the parens: `-G"Lead approves spec \([^)]*$esc\)"`
and fix the line-29 comment).

Riskiest unfalsified: the first-parent walk includes `main`'s history before the branch point, so an older tick or
`plan approved` subject for the same card reaching `main` before branching (a docs PR, a re-filed card) is taken as
that card's approval; no probe or real card exercises it, and I could not construct a non-contrived case from today's
history.

### Dispositions (pass 1, dev-lead)

| #   | Finding                              | Disposition | Evidence                                                                                                         |
| --- | ------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | `-G` parens group, B9.20 ≠ B9.2      | fix now     | probe M11 red at cb42e66 (2a3f95e: 8 ok, 3 FAIL); `1b4d382` escapes the parens: 11 ok; real rows byte-identical  |
| 2   | non-.md `backlog/`/`docs/` untested  | fix now     | M12 in 2a3f95e: PRs #207–#209 share only `backlog/…/probe.sh`, `docs/d.sh`, `spec/t.txt` with B9.4 → not counted |
| 3   | distinct repair PRs not pinned       | fix now     | M13 in 2a3f95e: #210 repairs B9.1 and B9.2, rate 3/5 = 60.0 %                                                    |
| N1  | timestamps vs `approval_sha`/minutes | PR body     | stated as a deviation in the PR body; the approved interface stands                                              |
| N2  | negative minutes truncate toward 0   | no change   | a merge before its approval cannot happen on a card's own PR head; no real row is negative                       |
| N3  | `--limit 1000`, 100 files, spaces    | PR body     | 56 merged PRs today; noted as limits                                                                             |
