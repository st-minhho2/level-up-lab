# B1.12 review

## Plan review (round 1)

SCOPE: none of lib | actions | ui. The plan touches `scripts/card-status.sh` (tooling, protected) and `backlog/` only;
no `src/`, `prisma/`, `e2e/` path, so no spec section, skeleton or Stryker run applies.

Plan reviewed at `eb52325` (`docs(backlog): B1.12 plan`), card at `24665de`. Probes ran on copies under
`$TMPDIR/b112rev/` (copies of `scripts/card-status.sh` and `backlog/plan/E1-todos.md` taken from `24665de`).

### How the checklist was adapted to a tooling card

| Row in `reviewer.md`                         | Read here as                                                                                         |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| files belong to the section's features (map) | files belong to the card's Acceptance (no § and no map row; `scripts/CLAUDE.md` row is the contract) |
| interfaces follow `ts-style.md`              | the script's CLI (usage, exit codes, message) stays as `scripts/CLAUDE.md` states; bash 3.2-safe     |
| follows `advice.md`                          | no `advice.md` (Tier quick, no `src/lib/todos.ts`): the skip must be stated                          |
| ≤ 7 criteria, measurable Then                | the card's Test and Acceptance lines are measurable                                                  |
| exact commands with expected numbers         | unchanged                                                                                            |
| skeleton → red → green → map → review        | no harness for `scripts/`: red = probe fails on `24665de`, green = probe passes on the fix; no map   |
| `Lead approves spec` box                     | no section: the card's `Spec:`/`Test:` lines exist (merged in #38)                                   |
| no settled D-n contradicted                  | unchanged; also invariant 2 (red first) and the role write scopes                                    |

### Checklist

| Check                                    | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| files belong to the card                 | pass: `scripts/card-status.sh` and `backlog/plan/E1-todos.md` (B1.7–B1.11) are the card's two Acceptance items; `backlog/work/B1.12/` is the card's Work line. The probe the plan relies on is not in the list (reason 3).                                                                                                                                                                                                                                          |
| interface unchanged                      | pass: plan keeps `scripts/card-status.sh <B-id> <Open\|Partial\|Done> "<evidence>"`, usage, exit codes and message.                                                                                                                                                                                                                                                                                                                                                 |
| advice                                   | pass: skip of spec-analyst and advisor stated (Tier quick, no section) in the Approach paragraph.                                                                                                                                                                                                                                                                                                                                                                   |
| criteria measurable                      | pass: card Test ("status paragraph is exactly `**Status: Done** — x`, every other line byte-identical") and Acceptance (probe one-line + multi-line; B1.7–B1.11 cleaned; `check-backlog.sh` OK) are binary. The plan's paragraph end adds `### ` to the card's "blank line or `- **` line": a superset, harmless (a heading ends the card anyway).                                                                                                                  |
| paragraph-end rule vs every card         | pass: all 12 status paragraphs in `E1-todos.md` end at a blank line (B1.1–B1.6 one line, B1.7 +5, B1.8 +3, B1.9 +4, B1.10 +5, B1.11 +6, B1.12 +8 continuation lines); the next non-blank line is `- **Spec:**` in all 12. No card ends its status paragraph at `- **` or `### ` directly (prettier separates blocks with a blank line), so those two branches are never exercised by the real file (reason 1).                                                      |
| cleanup is deletions only                | pass (confirmed): a candidate fix re-run on B1.7–B1.11 with each card's current first-line evidence gives `git diff --numstat` `0 23` (5+3+4+5+6), no added line; none of those five status lines holds a `\` (awk `-v` would rewrite escapes), the only `\` in the file is B1.12's own Open text (line 160).                                                                                                                                                       |
| verification exact with numbers          | fail: the probe has no invocation or path in the plan, the "after" input is not pinned, and "only deletions" has no number (reasons 2, 3, 5).                                                                                                                                                                                                                                                                                                                       |
| work breakdown                           | fail: step 1 is assigned to "dev-lead session", but `dev-lead.md` limits that role to `backlog/*`, `docs/metrics.md`, `docs/mistake-log.md` (frontmatter `path-guard.sh`; "you write only …") (reason 4). Commit subjects pass the `commit-msg` regex (`fix(scripts): …`, `docs(backlog): …`).                                                                                                                                                                      |
| red/green evidence (invariant 2 adapted) | fail as written: red is real (confirmed, below) but recorded only from a script in `$TMPDIR`, and the probe cannot tell the planned rule from a weaker one (reasons 1–3).                                                                                                                                                                                                                                                                                           |
| protected path and label                 | pass: `scripts/card-status\.sh` is in `check-config-change.sh` `PROTECTED`; CI reads the label at `.github/workflows/ci.yml:122` and runs the check at `:144`; `backlog/plan/*.md` and `backlog/work/**` are not protected. Plan step 4 has the lead (human) add `config-change-approved`, never an agent. Expect the `check-config-change` job red on PR open until the label is added; the lead's plan approval is also the CLAUDE.md "ask before a tool change". |
| no settled D-n contradicted              | pass: D-1…D-17 rule §5–§11 and test shapes; none governs `scripts/`. D-13/D-16 (red evidence recorded in `review.md`) is the closest precedent and the plan follows its shape; it should say so (reason 3).                                                                                                                                                                                                                                                         |

### Probe runs (on copies, `24665de`)

```
$TMPDIR/b112_probe.sh <script> <E1-todos.md at 24665de>
  unfixed (24665de)                         FAIL B1.10: 5 unexpected line(s) left · PASS B1.6     (red reproduced)
  skip until blank | `- **` | `### `        PASS B1.10 · PASS B1.6                                 (planned rule)
  skip until blank only                     PASS B1.10 · PASS B1.6                                 (weaker rule, also passes)
  skip until `### ` only (eats bullets)     FAIL B1.10: 0 unexpected line(s) left · FAIL B1.6: 0 …
  skip until `- **` only (eats blank line)  FAIL B1.10: 0 unexpected line(s) left · FAIL B1.6: 0 …
$TMPDIR/b112_probe.sh <unfixed 24665de script> <E1-todos.md after the B1.7–B1.11 cleanup>
                                            PASS B1.10 · PASS B1.6                                 (unfixed script passes)
```

### Verdict: changes requested

1. **The probe cannot tell the planned rule from a blank-line-only rule.** A fix that ends the paragraph only at a
   blank line passes both cases (run above), because every card in `E1-todos.md` ends its status paragraph at a blank
   line. The card's Test line names "`- **` line" as an end, and the plan adds `### `; neither branch is exercised.
   With a template-shaped card (`backlog/CLAUDE.md` "Card layout": the status line followed directly by `- **Spec:**`)
   a blank-only fix deletes the Spec/Test/Acceptance lines up to the next blank line. Add two synthetic cases to the
   probe's fixture: status + continuation followed directly by `- **Spec:**`, and followed directly by `### `.
   Also make the FAIL message count both directions (`diff | grep -c '^[<>]'`): today an over-deleting fix prints
   "0 unexpected line(s) left".
2. **Pin the "after" input.** Run on the cleaned `E1-todos.md`, the unfixed script passes (B1.10 is then one line).
   The Verification must name the input for both runs: `git show 24665de:backlog/plan/E1-todos.md`, or add B1.12
   (8 continuation lines, still multi-line after the cleanup) as a probe case.
3. **Commit the probe.** It lives only in `$TMPDIR`, so the diff reviewer, the PR reader and the lead cannot rerun the
   red or the green. Add `backlog/work/B1.12/probe.sh` (writable by `dev-lead`, not protected, not wired into CI) to
   Files, and state the invariant-2 adaptation in the Approach: no `test(...)` commit (no harness for `scripts/`); red
   evidence = the committed probe failing on `24665de`'s script, green = passing on the fix, both recorded in
   `review.md`, in D-13/D-16's shape. The lead then approves that deviation knowingly.
4. **Name who edits `scripts/card-status.sh`.** "dev-lead session (no role owns `scripts/`)" does not fit the role:
   `dev-lead.md` writes only `backlog/*`, `docs/metrics.md`, `docs/mistake-log.md`. State who makes the step 1 edit
   (the orchestrating main session, on the lead's approval of this plan as the CLAUDE.md "ask before any tool change"
   approval; or the lead) so the gate prompt shows the lead the scope they are granting.
5. **Numbers in Verification.** `git diff --numstat origin/main -- backlog/plan/E1-todos.md` → `0	23` (confirmed by
   simulation); the committed probe on the `24665de` fixture → `FAIL` at `24665de`, `PASS` on all cases after the fix;
   `scripts/ci/check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` → the `OK` lines (all three OK at
   `eb52325`); `bash -n scripts/card-status.sh` → exit 0.

Notes (no change requested):

- `scripts/card-status.sh`'s last check (`grep -qE "^\*\*Status: $NEW\*\* — " "$FILE"`) reads the whole file, not the
  card, so "card has no status line" goes unreported whenever another card already has that status; and `awk -v`
  rewrites backslash escapes in the evidence. Both predate B1.12 and are outside its Acceptance; a later card.
- The branch is `fix/B1.12-card-status-paragraph`; `git-workflow.md` "Runs without asking" covers pushes of
  `feat/*` and `dev-lead.md` names `feat/<card>-<slug>`. Not blocked by a hook; the lead may want it noted in the PR.
- B1.12's own closing commit will run the fixed script over its 8-line Open paragraph: a second real multi-line case.

Riskiest unfalsified: a status paragraph that ends at `- **` or `### ` with no blank line (only reachable in a file
prettier has not checked); untested until reason 1's fixture exists.

## Plan review (round 2)

SCOPE: none of lib | actions | ui (tooling: `scripts/card-status.sh`, `backlog/`). Plan and probe reviewed at
`1fa2bbc`; `origin/main` = `24665de`. Probes ran on copies under `$TMPDIR/b112r2/` (`24665de`'s script and
`E1-todos.md`, plus six hand-made fix variants of the script; the worktree was not edited).

### Round 1 reasons

| #   | Reason                                     | Result                                                                                                                                                                                                                                                                                                          |
| --- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | probe cannot tell planned rule from weaker | resolved (confirmed): fixture adds B9.1 (status + continuation, then `- **Spec:**`) and B9.2 (then `### B9.3`); FAIL now counts both directions. Every weaker or over-deleting variant fails, only the planned rule passes (table below).                                                                       |
| 2   | pin the "after" input                      | resolved: Verification runs both scripts on `<(git show 24665de:backlog/plan/E1-todos.md)`; process substitution works with the probe's `cp` (ran it). B9.1/B9.2 keep a multi-line case even on a cleaned file.                                                                                                 |
| 3   | commit the probe, state the deviation      | resolved: `backlog/work/B1.12/probe.sh` committed (`bash -n` OK) and in Files; Approach states the invariant-2 deviation (no `test(...)` commit, red/green = probe output recorded in `review.md`, D-13/D-16 shape) for the lead to approve knowingly.                                                          |
| 4   | name who edits `scripts/card-status.sh`    | resolved: Approach and step 1 name the orchestrating session on the lead's plan approval (also the CLAUDE.md "ask before a tool change"); dev-lead's write scope stated; label and red `check-config-change` job stated.                                                                                        |
| 5   | numbers in Verification                    | resolved (confirmed): probe before = `FAIL B1.10 5 · PASS B1.6 · FAIL B9.1 1 · FAIL B9.2 1`, exit 1 (ran, exact match); after = 4 PASS, exit 0, 0 lost (ran with the planned rule); cleanup simulation on a copy = 23 deleted, 0 added (`0	23`); the three `check-*` OK lines and `bash -n` exit 0 at `1fa2bbc`. |

### Probe runs (committed `probe.sh`, input `24665de:backlog/plan/E1-todos.md`)

```
variant (skip after the new status line until …)  B1.10            B1.6             B9.1             B9.2             exit
unfixed (24665de)                                  FAIL 5 over      PASS             FAIL 1 over      FAIL 1 over      1
planned: blank | `- **` | `### `                   PASS             PASS             PASS             PASS             0
blank only (round 1's weaker rule)                 PASS             PASS             FAIL 2 lost      FAIL 1 lost      1
`### ` only                                        FAIL 8 lost      FAIL 8 lost      FAIL 3 lost      PASS             1
`- **` only                                        FAIL 1 lost      FAIL 1 lost      PASS             FAIL 3 lost      1
blank | `- **`                                     PASS             PASS             PASS             FAIL 1 lost      1
blank | `### `                                     PASS             PASS             FAIL 2 lost      PASS             1
always drop exactly one following line             FAIL 4 over      FAIL 1 lost      PASS             PASS             1
```

### Checklist (rows unchanged from round 1 are not repeated)

| Check                           | Result                                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| files belong to the card        | pass: probe now listed; no file outside the card's Acceptance and Work line.                               |
| verification exact with numbers | pass (reason 5).                                                                                           |
| work breakdown                  | pass: fix (orchestrating session) → cleanup (dev-lead, fixed script) → diff review → PR; subjects conform. |
| red/green evidence              | pass: red reproduced from the committed probe; green only for the planned rule.                            |
| nothing new broke               | pass: interface, protected-path/label handling and D-n rows as in round 1; `origin/main` still `24665de`.  |

### Verdict: approved

Ready for the lead's gate (not approved for build). The lead approves knowingly: no `test(...)` commit (probe
evidence instead), a `scripts/` edit by the orchestrating session, and the `config-change-approved` label on the PR.

Notes (no change requested):

- `plan.md` is 55 lines against `planning.md`'s ≈ 40; the excess is the Approach paragraph carrying the deviations
  round 1 asked for, not extra scope.
- `probe.sh` commits its scratch repo with `--no-verify`. It is a throwaway `mktemp -d` repo with no hooks, not the
  project's, and `settings.json` denies only a direct `git commit --no-verify`; the diff reviewer may still ask for
  a one-line why comment so it is not read as a hook bypass. The probe also leaves its `mktemp -d` dir behind.
- Round 1's notes on `card-status.sh` (whole-file final `grep`, `awk -v` escape rewriting) still stand, out of scope.

Riskiest unfalsified: the fixed awk's rule order (skip rules after `incard && /^### /`) on a status paragraph that is
the file's last card with no trailing blank line; the planned rule ends at EOF, so only a lost-line case is
conceivable, and none was found in the variants run.

## Red and green evidence (dev-lead)

Probe `bash backlog/work/B1.12/probe.sh <script> <(git show 24665de:backlog/plan/E1-todos.md)`:

```
# before: scripts/card-status.sh at 24665de
FAIL B1.10: 5 line(s) left over, 0 line(s) lost
PASS B1.6
FAIL B9.1: 1 line(s) left over, 0 line(s) lost
FAIL B9.2: 1 line(s) left over, 0 line(s) lost
# after: scripts/card-status.sh at 9dac5b4
PASS B1.10
PASS B1.6
PASS B9.1
PASS B9.2
```

Cleanup: `git diff --numstat origin/main -- backlog/plan/E1-todos.md` → `0 23`; `check-backlog`, `check-spec-sections`, `check-features-map` OK; `bash -n scripts/card-status.sh` OK.

## Diff review (round 1)

SCOPE: none of lib | actions | ui (tooling: `scripts/card-status.sh`, `backlog/`). Diff `origin/main...HEAD`,
`origin/main` = merge base = `24665de`, `HEAD` = `49611d7`. Probes ran on copies under `$TMPDIR/b112diff/`
(`24665de`'s and `HEAD`'s script, `24665de`'s and `HEAD`'s `E1-todos.md`, six one-line reverts of the fix); the
worktree was not edited. Every run used `/bin/bash` 3.2.57 and `/usr/bin/awk` (BSD awk 20200816), the only `awk` on
`PATH`.

### Commands

```
pnpm lint                                   All matched files use Prettier code style! (exit 0)
pnpm typecheck · test · test:e2e · mutation not run: `git diff --name-only origin/main...HEAD -- src prisma e2e` = 0 files
scripts/ci/check-suppressions.sh            [check-suppressions] OK: no new suppressions
scripts/ci/check-config-change.sh           ::error::Protected configuration changed without the 'config-change-approved' label: scripts/card-status.sh (exit 1, expected until the lead adds the label)
scripts/ci/check-feat-commits.sh            [check-feat-commits] OK: no feat commit touches tests
scripts/ci/check-ac-coverage.sh             [check-ac-coverage] OK: every criterion of a shipped section has a test
scripts/ci/check-spec-sections.sh           [check-spec-sections] OK: sections cited: 1 2 3 4 5 6 7 8 9 10 11
scripts/ci/check-features-map.sh            [check-features-map] OK
scripts/ci/check-backlog.sh                 [check-backlog] OK: README matches the cards
scripts/verify-red.sh B1.12                 not applicable: no `test(...)` commit (approved deviation); probe below instead
bash -n scripts/card-status.sh              exit 0
git diff --stat origin/main...HEAD          5 files changed, 289 insertions(+), 25 deletions(-)
git diff --numstat origin/main -- backlog/plan/E1-todos.md   0	23
```

(`BASE_SHA=24665de… HEAD_SHA=49611d7…` for the three range guards.)

### How the checklist was adapted to a tooling card

| Row in `reviewer.md`                      | Read here as                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| every AC has a test matching its Then     | the card's Test/Acceptance lines have probe evidence: committed `probe.sh` + this review's edges |
| no test weakened after the red commit     | `probe.sh` unchanged since the approved plan (`1fa2bbc`); no test file in the range              |
| every changed file in `plan.md`           | unchanged                                                                                        |
| interfaces match the section's contracts  | CLI matches `scripts/CLAUDE.md` and the plan's Interfaces block (usage, exit codes, messages)    |
| Zod / Prisma / raw SQL / migration        | not applicable (no `src/`, `prisma/`)                                                            |
| no secret, no suppression                 | unchanged                                                                                        |
| features map row moved                    | not applicable (no feature, no §)                                                                |
| revert one changed line, does a test fail | revert each changed awk line on a copy; run the committed probe and the edge probe               |

### Checklist

| Check                       | Result                                                                                                                                                                                                                                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| card Test / Acceptance      | pass (confirmed): committed probe on `24665de`'s `E1-todos.md`: `24665de` script `FAIL B1.10 5 over · PASS B1.6 · FAIL B9.1 1 · FAIL B9.2 1` exit 1; `HEAD` script 4 PASS exit 0 (matches "Red and green evidence"). `check-backlog` OK.                                                              |
| cleanup through the fix     | pass (confirmed): the `HEAD` script run on `24665de`'s file for B1.7–B1.11, each with its own current evidence, gives a file `cmp`-identical to `HEAD`'s `E1-todos.md`. 0 added, 23 deleted (5+3+4+5+6).                                                                                              |
| first status lines kept     | pass (confirmed): `grep '^\*\*Status: '` on `24665de` and `HEAD` files is byte-identical (12 lines); in all five cleaned cards the line after the status line is now the blank line before `- **Spec:**`.                                                                                             |
| every changed file in plan  | pass: `scripts/card-status.sh`, `backlog/plan/E1-todos.md`, `backlog/work/B1.12/{plan,review}.md`, `probe.sh`; nothing else. Commits per plan: `9dac5b4` (script only), `ae9a87e` (E1 only, 0/23), `49611d7` (review.md only). `scripts/CLAUDE.md` still says "rewrites a card's status line" (note). |
| interface unchanged         | pass: lines 8–13 and 23–24 of the script (args, usage, `case`, file lookup, final `grep`, messages, exit codes) are untouched by the diff.                                                                                                                                                            |
| `incard` → `incard == 1`    | pass (confirmed correct): before, `incard = 2` was still truthy, so every later `^**Status: ` line in the card was rewritten too; now only the first. Edge cases 5 and 6 below pass on `HEAD` and fail on `24665de`. Not exercised by the committed probe (finding 1).                                |
| status paragraph ends EOF   | pass (confirmed): round 2's riskiest-unfalsified; cases 1–4 below (last in file, with and without trailing newline, one-line status as last line without newline, after another card) give the hand-written expected file. A missing final newline gains one (prettier-conformant).                   |
| bash 3.2 / BSD awk          | pass (confirmed): all runs above on bash 3.2.57 and BSD awk 20200816; the added awk uses only POSIX patterns (`==`, `/^$/`, `/^- \*\*/`, `/^### /`, `                                                                                                                                                 |     | `, `next`, a `#`comment with no`'` inside the single-quoted program). Linux awk (dev container) [unverified]: no gawk/mawk locally. |
| would a revert fail a probe | partial (table below): 5 of 6 reverts fail the committed probe; the `== 1` revert fails only this review's edge probe (finding 1).                                                                                                                                                                    |
| no secret, no suppression   | pass: `check-suppressions` OK; diff holds no credential.                                                                                                                                                                                                                                              |
| protected path              | pass: `check-config-change` exit 1 on `scripts/card-status.sh`, as the plan states; the label is the lead's.                                                                                                                                                                                          |

### Edge probe (hand-written expected files, independent of the fix's awk)

`probe.sh`'s `expected()` is the same awk as the fix, so it proves the planned rule only through round 2's variant
table. These seven cases compare against literal files (`$TMPDIR/b112diff/edge.sh <script>`):

```
case                                                     HEAD (9dac5b4)   24665de
1 status paragraph last in file, trailing newline        PASS             FAIL (b, c left over)
2 same, no trailing newline                              PASS             FAIL (b, c left over)
3 one-line status is the last line, no newline           PASS             PASS
4 multi-line status of the last card, after another card PASS             FAIL (b left over)
5 a later `**Status:` line after a blank stays           PASS             FAIL (later line rewritten too)
6 a continuation line that starts with `**Status: `      PASS             FAIL (second new status line + c)
7 the next card's multi-line status is untouched         PASS             PASS
```

### One-line reverts of `9dac5b4` (on copies)

```
revert                                       probe.sh (4 cases)                 edge.sh (7 cases)
m1 `incard == 1` → `incard`                  4 PASS (survives)                  FAIL 5, 6
m2 drop `skip = 1`                           FAIL B1.10, B9.1, B9.2             FAIL 1, 2, 4, 5, 6
m3 drop `/^$/ ||`                            FAIL B1.10, B1.6 (1 lost each)     FAIL 5, 6, 7
m4 drop `/^- \*\*/ ||`                       FAIL B9.1 (2 lost)                 all PASS
m5 drop `|| /^### /`                         FAIL B9.2 (1 lost)                 all PASS
m6 drop `skip { next }`                      FAIL B1.10, B9.1, B9.2             FAIL 1, 2, 4, 5, 6
```

### Findings

```
[1] KIND: coverage
    WHERE: scripts/card-status.sh:17 (`incard == 1 &&`); backlog/work/B1.12/probe.sh:50 (case list)
    DEFECT: the committed probe does not exercise the `incard` → `incard == 1` change; reverting it leaves probe.sh 4/4 PASS.
    TRIGGER: a card whose status paragraph has a continuation line starting with `**Status: `, or a second
             `**Status: ` line later in the card (edge cases 5 and 6), run with the m1 revert.
    WRONG BEHAVIOUR: with the revert, case 6 prints two `**Status: Done** — x` lines and keeps `c`; case 5 rewrites
             the later line too; the card's "every other line of the file is byte-identical" breaks, and the committed
             evidence would not show it. HEAD's behavior is correct (cases 5, 6 PASS); only the rerunnable evidence is
             missing. No card in `backlog/plan/` has either shape today (12 status lines, one per card).
    CONFIDENCE: confirmed (ran the revert against both probes)
```

Not blocking: the change is correct and its evidence is now recorded above. Disposition options for `/review-loop`:
add a `B9.4` fixture case (status, then a continuation line starting with `**Status: `) to `probe.sh` (dev-lead's
write scope, no plan change: `probe.sh` is in Files), or "no change needed" citing edge cases 5 and 6 here.

Notes (no change requested):

- CRLF input (confirmed on a copy, outside every supported environment): a line `\r` does not match `/^$/`, so on a
  CRLF file the skip runs to the next `- **` line and drops the paragraphs between (`b\r`, `\r`, `keep me\r` lost),
  where `24665de` dropped nothing. The repo has 0 `\r` in `E1-todos.md`, `prettier --check` (`pnpm lint`, which covers
  `backlog/`) enforces LF, and `scripts/CLAUDE.md` names macOS, the dev container and CI only.
- A status paragraph followed directly (no blank line) by a plain `- ` bullet, `* ` item or a `## `/`#### ` heading
  is swallowed up to the next end marker; this is the approved rule (blank, `- **`, `### `), and prettier inserts the
  blank line before any of them, so only an unformatted file reaches it.
- `scripts/CLAUDE.md` row still reads "rewrites a card's status line" (and its `|` inside the code span breaks the
  table); the script header now says "status paragraph". Not in the plan's Files; a follow-up doc touch.
- Round 2's note stands: `probe.sh:36` commits its throwaway scratch repo with `--no-verify` and no why comment, and
  each run leaves its `mktemp -d` directory behind.
- Round 1's notes on the final whole-file `grep` and `awk -v` escape rewriting still stand, out of scope.

Verdict: ready for PR

Riskiest unfalsified: the script on the dev container's / CI's awk (gawk or mawk): every construct is POSIX and the
same as `24665de`'s, but no non-BSD awk was available to run the probes.

### Dispositions (dev-lead, pass 1 of 3)

| Pass | #   | Finding (file:line)                                                                                             | Source                          | Kind        | Disposition      | Justification                                                                                                                                                                                                 |
| ---- | --- | --------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | `probe.sh` never exercises `incard == 1` (`card-status.sh:17`); reverting it still passes 4/4                   | reviewer                        | coverage    | fix now          | fixture B9.4 (a continuation line starting with `**Status: `) added to `probe.sh`; HEAD script 5/5 PASS; `24665de` script and the `incard &&` revert both `FAIL B9.4: 1 line(s) left over`                    |
| 1    | —   | gawk/mawk in the dev container or CI not tried                                                                  | reviewer (riskiest unfalsified) | portability | no change needed | every construct is POSIX awk and was already used by `24665de` (`-v`, regex match, `==`, `next`); BSD awk 20200816 and bash 3.2.57 ran it                                                                     |
| 1    | —   | CRLF file drops whole paragraphs; `scripts/CLAUDE.md` row still says "status line"; probe leaves its mktemp dir | reviewer (notes)                | docs        | out of scope     | prettier enforces LF (0 `\r` in the file); the `scripts/CLAUDE.md` wording and the pre-existing whole-file `grep` / `awk -v` escape notes are outside the plan's Files list; the probe dir is under `$TMPDIR` |

Probe after the fix (5 cases), `bash backlog/work/B1.12/probe.sh scripts/card-status.sh <(git show 24665de:backlog/plan/E1-todos.md)`:
`PASS B1.10 · PASS B1.6 · PASS B9.1 · PASS B9.2 · PASS B9.4` (exit 0); with `24665de`'s script: `FAIL B1.10` (5 left over),
`PASS B1.6`, `FAIL B9.1`, `FAIL B9.2`, `FAIL B9.4` (1 left over each).
