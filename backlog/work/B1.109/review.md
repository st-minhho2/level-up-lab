# B1.109 review

## Plan review (round 1)

Plan at `035ec8f1`. Evidence, all under `$TMPDIR/b1109probe/` (`/bin/bash` 3.2.57):

- `base/` is `.claude/hooks` of the worktree at `035ec8f1` (main `179971b`'s hook). `fix/` is the dev-lead's prototype
  `.claude/hooks`. Its diff against base is the one `UNQUOTE` line: `$` added to the braced token's excluded set, and
  the letterless second expression.
- `cases.txt` is the dev-lead's 22-line probe list. `mine.txt` holds 26 more commands. `run2.sh` is the dev-lead's
  `run.sh` with placeholders (`MRG`, `DLF`, `PP`) expanded at run time, because guard-bash reads my own command text.
- `$TMPDIR/b1109c` is `git clone` of the worktree. `scripts/hook-smoke.sh` runs there with each hook copied in. That
  clone has no `node_modules`, so 14 probes of other hooks fail on every hook variant (js-yaml, frontmatter, Prettier).
  The counts below are guard-bash rows only. Base, prototype and `union/` each give 349 ok and 0 FAIL there, with
  the same 14 failures elsewhere.

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: tooling, no section. The Files table has 4 rows, the same three files the card's Spec line names plus `work/B1.109/*`. `check-plan-scope.sh`: "OK: chore/B1.109-param-split changes only paperwork"                                                                                                                                                  |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | fail: n/a for TypeScript, but the step-2 expression is not pasted exactly. It shows `(\(META\))?` where the hook needs the flag-group class (reason 2)                                                                                                                                                                                                     |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice, stated (tier quick, no section)                                                                                                                                                                                                                                                                                                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | fail: the card has 4 acceptance lines, all measurable. The approach breaks acceptance 2, "nothing main blocks passes": 8 forms main blocks exit 0 on the prototype (reason 1)                                                                                                                                                                              |
| verification lists exact commands with expected numbers                                | pass: reproduced. `cases.txt` on base gives 9 BAD (the card's 6, `--delete-$@branch`, `M$@ERGE`, `${X[${i}]}`); on the prototype 0 BAD. hook-smoke guard-bash rows on the prototype: 349 ok, 0 FAIL. The 300-segment timing is base 2.28 / 2.07 s, prototype 2.25 / 2.00 s. I did not re-run the 139 KB timing. The probe list lacks the forms in reason 1 |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: a probe `test(hooks): …` commit with no `(red)` marker, a stated deviation (B1.106 to B1.108 precedent). Then green `chore(hooks): …` and review. No skeleton or map row (no section)                                                                                                                                                                |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a, no section. The tier is high (`.claude/`), so the lead's `approve` gates the build. D-19's label is named                                                                                                                                                                                                                                       |
| no settled D-n contradicted                                                            | fail: D-9 (agents never merge). `gh pr ${X[$i+n]}merge 7` merges in bash 3.2. Main blocks it and the prototype lets it through (reason 1)                                                                                                                                                                                                                  |
| `scripts/next-task.sh --check B1.109` on the committed plan says no overlap            | pass: `[next-task] B1.109: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                       |

Confirmed on the prototype, beyond the plan's own probes:

- The prototype also blocks these, and main exits 0 on each: `$${X[ m$@erge ]}` (the merge twin of the card's
  `$${X[ -$@d ]}`), `\${(f)X[ m$@erge ]}`, `\${=X[ m$@erge ]}`, `\${X[ m$1erge ]}`, `\${X[ -$@d$@ ]}`,
  `\${10[ -$@d ]}`, `\${@[ -$@d ]}` (each through `bash -c '… $1'`), and `gh pr ${X[$Y[1]]}merge 7`.
- These stay allowed on both hooks: `gh pr view 7 ${X[$i]}`, `gh pr view 7 ${X[i+$j]}` and
  `gh pr list --limit ${X[ $i ]}`.

### Reasons (changes requested)

1. **Step 1 loses more than the 7 forms step 2 recovers. Every subscript token that holds a letter and a parameter
   is lost, so 8 forms main blocks exit 0 on the prototype.**

   Step 1 keeps every braced span whose token holds `$`. Step 2 removes the span again only when, with the
   parameters gone, no letter is left. In a token with a letter, such as an arithmetic subscript that names a
   variable without `$`, step 1 removes only the parameter. The `$x[i+]` that is left stays glued to the next word.
   Main removes the whole span.

   - TRIGGER: `gh pr ${X[$i+n]}merge 7`. `/bin/bash -c 'echo "[${X[$i+n]}]"'` prints `[]`, so gh gets `merge`. Main
     exits 2 and the prototype exits 0. In the copy, `$x[+n]merge` is one word, and the `*_RAW` rules do not match
     `${X…}merge`.
   - The same split, main 2 and prototype 0: `gh pr ${X[i+$j]}merge 7`, `gh pr ${X[ i+$j ]}merge 7`,
     `gh pr ${X[n-$i]}merge 7`, `gh pr ${X[k+$j]}merge 7`, `gh pr merge${X[i+$j]} 7`,
     `gh pr close 7 ${X[i+$j]}-d` and `gh pr close 7 ${X[ n-$i ]}-d`. Prefix any of them with `i=2; j=1;` and bash
     expands the subscript to an empty string.
   - WRONG BEHAVIOUR: acceptance 2 ("nothing main blocks passes") fails, and so does D-9. The plan's step 2 sentence
     ("a span that keeps a letter stays visible") states the gain but not this cost.
   - CONFIDENCE: confirmed (`mine.txt` on base gives 2 on all 8; on `fix/` it gives 0 on all 8).

   One way to close it, measured on the copy (`union/`): keep the prototype's `UNQUOTE`. Also run the same gh-pr
   loop a second time on a copy made with main's `UNQUOTE` as it is today. Then main's copy still blocks what it
   blocks, and the new copy adds the param-split forms. Results:

   - `union/` blocks all 22 of `cases.txt` and the 8 forms above.
   - hook-smoke guard-bash rows: 349 ok, 0 FAIL.
   - 300-segment timing: 2.16 / 2.12 s, against 2.28 / 2.07 s on base.
   - It drops step 2. With step 2 kept, it still blocks the forms that step 2 recovers (no letter in the token),
     because main's copy already blocks them.

   The design is the dev-lead's choice. Whatever the plan picks, its probe list needs a guard of this shape (a letter
   plus a parameter in the token), merge and `-d`, with and without spaces.

2. **Interface not pasted exactly.** The plan pastes step 2 with `(\(META\))?` as a placeholder. The prototype has
   `(\([^][:space:]()`'"\\;&|{},]*\))?`, as in step 1. Paste the exact expression, or the hook line after the change,
so that the diff review can compare it byte for byte (`planning.md`: "Paste the signature, not prose").

Not blocking (named so that the lead sees them before `approve`):

- These exit 0 on main and on the prototype alike (a gap that already exists, not a regression):
  `gh pr ${X[$((1))]}merge 7` (an arithmetic `$((…))` subscript, which holds `(`) and
  `gh pr ${X[${Y[${i}]}]}merge 7` (three levels deep: one sed pass removes one level). Neither is named out of
  reach in the header or `hooks.md`. Name them there, or file a card.
- The plan is 68 lines, against `planning.md`'s ≈ 40. B1.105 had 74 lines, B1.107 75 and B1.108 192.

Verdict: changes requested

## Plan review (round 2)

Plan at `78416257`. Evidence, all under `$TMPDIR/b1109probe/` (`/bin/bash` 3.2.57):

- `v2/` is the dev-lead's round-2 prototype `.claude/hooks`. Its diff against main `179971b` is lines 112–122 only:
  `TOKEN`, `TOKEN_NO_PARAM`, `UNQUOTE_KEEP`, and the gh pr loop reading both copies. The header is not changed yet.
- I computed `UNQUOTE_KEEP` (`keep.sh`). It is main's `UNQUOTE` with one change: `$` added to the braced subscript's
  token class. The bare `$X[…]` class and the flag-group class keep their `[^][:space:]`, because `TOKEN`'s leading
  `[[:space:]]*` matches only the braced subscript.
- `final.txt` is the dev-lead's 27-probe list. `mk/` and `mu/` are the plan's two mutants (the loop over
  `UNQUOTE_KEEP` only, and over `UNQUOTE` only). `fp.txt` holds 7 gh pr commands that main allows and that put a
  `$` in a subscript (jq filters, a search, `-q`).

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: tooling, no section. The same 4 rows as round 1. `check-plan-scope.sh`: "OK: chore/B1.109-param-split changes only paperwork"                                                                                                                                                                                                                                                                                                                                                                                                                       |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: n/a for TypeScript. The plan pastes the exact lines. `TOKEN`/`TOKEN_NO_PARAM`, `UNQUOTE_KEEP` and the loop match the prototype byte for byte (the prototype has no trailing comment). Round 1's reason 2 is closed                                                                                                                                                                                                                                                                                                                                  |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice, stated                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: the card's 4 acceptance lines. Acceptance 2 now holds by construction: main's `UNQUOTE` copy and both `*_RAW` rules are unchanged and still run, and the new copy can only add a block. Round 1's reason 1 is closed                                                                                                                                                                                                                                                                                                                                |
| verification lists exact commands with expected numbers                                | pass: reproduced. `final.txt`: base 12 BAD, `v2/` 0 BAD. Mutants: `mk/` 11 BAD, `mu/` 12 BAD, as the plan states. Round 1's `cases.txt`: `v2/` 1 BAD (`${X[${i}]}merge`, stated out of reach). `mine.txt`: `v2/` 3 BAD (the three nested forms the plan names, exit 0 on main too). The 300-segment timing is base 2.20 / 2.59 s, `v2/` 2.29 / 2.18 s. I did not re-run the 139 KB timing. hook-smoke on the `$TMPDIR/b1109c` clone with `v2/`: guard-bash rows 349 ok, 0 FAIL (the clone has no `node_modules`, so other hooks' rows fail as in round 1) |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: probes `test(hooks): …`, no `(red)` marker (B1.106 to B1.108). Then green `chore(hooks): …` and review. No skeleton or map row (no section)                                                                                                                                                                                                                                                                                                                                                                                                         |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a, no section. The tier is high (`.claude/`), so the lead's `approve` gates the build. D-19's label is named                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| no settled D-n contradicted                                                            | pass: D-9 holds. All 8 of round 1's regressions are blocked on `v2/`, and 4 of them are among the plan's guards (`$i+n`, `i+$j`, `merge${X[i+$j]}`, `n-$i` with `-d`)                                                                                                                                                                                                                                                                                                                                                                                     |
| `scripts/next-task.sh --check B1.109` on the committed plan says no overlap            | pass: `[next-task] B1.109: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

Confirmed beyond the plan's own probes:

- No new false positive: the 7 commands in `fp.txt` exit 0 on both base and `v2/`. Examples:
  `--jq '.files[${X[ $n ]}].path'`, `--search "author:${X[ $u ]} is:open"` and `echo "${X[ $a-d ]}"` after a gh pr
  view.
- The two copies cannot run into each other. Each copy goes through its own `tr` and then `echo`, so the second
  copy always starts on a new line. A "later close or merge word" in one copy cannot reach the other copy's `pr`.
- These are blocked on `v2/` and exit 0 on main, without being in the plan's list: `\${=X[ m$@erge ]}`,
  `\${X[ -$@d$@ ]}` and `\${@[ -$@d ]}` (each through `bash -c '… $1'`).

### Reasons

None blocking.

Not blocking (for the lead before `approve`):

- The out-of-reach wording, "a subscript holding a nested expansion", also reads as covering `${X[$i]}merge`, and
  that form is blocked (one of the guards). Name the class more narrowly in the header and `hooks.md`: a braced
  (`${i}`), subscripted (`$Y[1]`) or arithmetic (`$((…))`) expansion inside the subscript.
- The cost this approach carries over the round-1 prototype: `gh pr ${X[${i}]}merge 7` and
  `gh pr ${X[$Y[1]]}merge 7` were blocked there and are not now, and main does not block them either. The plan
  states this. No form main blocks is lost.
- The cost per command is two more `sed` pipelines. On 300 segments the time is the same as base within the run's
  spread. The 139 KB figure (334 s on both) is the dev-lead's and not reproduced.

Verdict: approved

## Diff review (pass 1)

Head `603603a0`, base `179971b` (= `origin/main`). Probe commit `2651553a`, fix `603603a0`.

### Commands (last line of each)

| Command                              | Last line                                                                                                                                          |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                          | `All matched files use Prettier code style!` (exit 0)                                                                                              |
| `pnpm typecheck`                     | `> tsc --noEmit` (exit 0)                                                                                                                          |
| `pnpm test`                          | `Tests  403 passed (403)`                                                                                                                          |
| `pnpm test:e2e`                      | `91 passed (2.2m)`                                                                                                                                 |
| `scripts/mutation-gate.sh`           | `mutation: CI only, no src/lib or src/actions change`                                                                                              |
| `scripts/hook-smoke.sh` (HEAD)       | `hook-smoke: 965 probes OK`                                                                                                                        |
| `scripts/ci/check-suppressions.sh`   | `[check-suppressions] OK: no new suppressions`                                                                                                     |
| `scripts/ci/check-config-change.sh`  | exit 1, `.claude/docs/hooks.md`, `.claude/hooks/guard-bash.sh` without `config-change-approved`: expected, the label goes on at PR creation (D-19) |
| `scripts/ci/check-feat-commits.sh`   | `[check-feat-commits] OK: no feat commit touches tests`                                                                                            |
| `scripts/ci/check-ac-coverage.sh`    | `[check-ac-coverage] OK: every criterion of a shipped section has a test`                                                                          |
| `scripts/ci/check-spec-sections.sh`  | `[check-spec-sections] OK: sections cited: 1 … 53`                                                                                                 |
| `scripts/ci/check-features-map.sh`   | `[check-features-map] OK`                                                                                                                          |
| `scripts/verify-red.sh B1.109`       | `::error::no 'test(<pkg>): B1.109 … (red)' commit`: expected, no vitest file, no `(red)` marker (B1.106)                                           |
| `git diff --stat origin/main...HEAD` | `6 files changed, 311 insertions(+), 16 deletions(-)`                                                                                              |

Red proved by hand instead of `verify-red.sh`. I ran `hook-smoke.sh` on a clone at `2651553a`, and exactly the 12
trigger probes FAIL with exit 0. The merge forms are `m$@erge` ×2 nested/plain, `m$EMPTY$@erge`, `M$@ERGE`,
`$${X[ m$@erge ]}`, `m$1erge` and `${(f)X[…]}`. The delete forms are `-$@d` plain/`$$`/nested, `--delete-$@branch`
and `${10[ -$@d ]}`. All 11 guards and 3 allowed probes pass on main. The clone has no `node_modules`, so 14 other
FAILs came from `js-yaml` / prettier / frontmatter checks. Those are unrelated to the card and pass in the worktree.

### Checklist

| Check                                                   | Result                                                                                                                                                                                                     |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every acceptance clause has a probe matching it         | pass: each card form exits 2 with `agents never merge` / `force pushes`. The out-of-reach entry is gone from the header and from `hooks.md` (both lists). Count 938 → 965 is stated                        |
| no test weakened after the probe commit                 | pass: `git log --first-parent --no-merges 2651553a..HEAD -- '*.test.*' e2e/ scripts/hook-smoke.sh` is empty. There are no merges on the branch                                                             |
| every changed file in `plan.md`                         | pass: `guard-bash.sh`, `hook-smoke.sh`, `hooks.md`, `work/B1.109/*`. Commit subjects match the work breakdown                                                                                              |
| interface as planned                                    | pass: `TOKEN`, `TOKEN_NO_PARAM`, `UNQUOTE_KEEP` and the two-copy loop match the plan's block character for character                                                                                       |
| bash 3.2-safe                                           | pass: under `/bin/bash` 3.2.57, `UNQUOTE_KEEP` differs from `UNQUOTE` by exactly one inserted `$` (char 156, `[^]$[:space:]()`)                                                                            |
| main's blocks kept                                      | pass by construction: main's `UNQUOTE` copy runs first and unchanged, and `*_RAW` is untouched. Mutant B below equals main                                                                                 |
| no `src/`, `prisma/`, `e2e/`; no secret, no suppression | pass                                                                                                                                                                                                       |
| features map                                            | n/a, tooling, no section                                                                                                                                                                                   |
| would a test fail if one changed line were reverted?    | pass, on hook copies under `$TMPDIR` against the 27 B1.109 probes (HEAD: 0 deviations): A, loop over `UNQUOTE_KEEP` only → 11 deviations; B, over `UNQUOTE` only → 12; C, the per-copy `echo` dropped → 24 |

### Probes beyond the plan (29 commands, HEAD vs main)

These are newly blocked on HEAD and exit 0 on main:

- `$*` instead of `$@`
- tab separators
- `m$@e$@r$@g$@e`
- `$@merge` and `merge$@`
- a second `${Y[ $i ]}` after the subscript
- two adjacent subscripts
- `m$_x$@erge`
- a trailing `;`

The remaining forms behave the same on both. `m$@er\ge`, `m$@er''ge`, `m$@er{g,}e` and `${(f)@}` are blocked. The
forms that exit 0 on both fall into two groups:

- These are not attacks: `\${X[ m$@erge]}` and `\${X[m$@erge ]}` hand gh `merge]}` or `]}` rather than `merge`, and
  `m$@erge,` hands it `merge,`.
- These are the pre-existing gap below.

### Findings

No blocking finding.

Pre-existing gap, not introduced by this diff and outside this card. Recommend a new card:

```
[-] KIND: security (pre-existing, main too, non-blocking)
    WHERE: .claude/hooks/guard-bash.sh:118 (UNQUOTE, first alternative `\$([a-z_]…|[0-9@*])`)
    DEFECT: an unbraced parameter whose name is `!` or that carries a zsh flag (`$~@`, `$=@`) is not removed from either copy, so a word split by it stays split for the gh pr rules
    TRIGGER: `gh pr m$~@erge 7` from zsh (zsh expands `m$~@erge` to `merge`, checked), `gh pr m$!erge 7` from bash (`$!` empty, checked); the same inside `\${X[ m$~@erge ]}` / `\${X[ m$!erge ]}` through `bash -c '… $1'`
    WRONG BEHAVIOUR: guard-bash exits 0 on HEAD and on main 179971b; neither the header nor hooks.md names these forms out of reach
    CONFIDENCE: confirmed (ran each through both hooks; ran the expansions in zsh 5 and bash 3.2)
```

Verdict: ready for PR

Riskiest unfalsified: the second copy adds false positives. A `gh pr` command whose subscript holds `$` next to the
text `merge` or `-d` is now read as a subcommand or flag. I found no benign command that trips it: 3 allowed probes,
plus round 2's 7 `fp.txt` commands. The cost per command was not timed on the green commit, and PR Evidence is still
"pending".
