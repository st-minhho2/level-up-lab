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
