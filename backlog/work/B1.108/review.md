# B1.108 review

SCOPE: all (tooling: `.claude/hooks/guard-bash.sh`, `scripts/hook-smoke.sh`, `.claude/docs/hooks.md`; no `src/`)

## Plan review (round 1)

Plan at `45111dd`. Evidence, all under `$TMPDIR/b108/`:

- `c/` is `git clone` of the worktree at `45111dd`, with `node_modules` linked in.
- `hook-smoke-probed.sh` is `scripts/hook-smoke.sh` with the plan's probe section (`probes.sh` from the dev-lead's
  scratch directory) inserted before "== settings.json permissions".
- The plan-B hook is the dev-lead's prototype `new/guard-bash.sh`. Its diff against `4c79bec` is exactly the plan's
  pasted `UNQUOTE`, `GH_PR_FLAGS`, `GH_BRANCH_DELETE`, `GH_PR_MERGE` and the loop, plus the two lines removed from the
  segment loop.
- `adv/cases*.txt` holds 42 adversarial commands, run through `adv/run.sh` with `/bin/bash` 3.2.57 against the base
  hook (`4c79bec`) and the prototype. `gh` and the merge word are written as placeholders and expanded at run time.

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: tooling, no section. `scripts/ci/plan-files.sh --any B1.108 HEAD` lists 4 rows (`guard-bash.sh`, `hook-smoke.sh`, `hooks.md`, `backlog/work/B1.108/*`), the same three files the card's Spec line names                                                                                                                                       |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | fail: n/a for TypeScript, but the pasted `UNQUOTE` interface misses a form its own design claims to cover (reason 1)                                                                                                                                                                                                                                |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice, stated (tier quick, no section). A' is weighed with numbers                                                                                                                                                                                                                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 4 acceptance lines on the card, all measurable. All 11 of the card's forms are among the plan's 20 blocked probes. Acceptance 2's 5 allowed commands are among the plan's 8                                                                                                                                                                   |
| verification lists exact commands with expected numbers                                | pass: reproduced. Baseline `scripts/hook-smoke.sh` on the clone gives "hook-smoke: 838 probes OK". With the probes and the base hook: exit 1, 20 FAIL, 846 ok. With the probes and the prototype: "hook-smoke: 866 probes OK". The 300-segment timing is base 1.93 / 1.86 s and prototype 1.88 / 1.84 s. I did not re-run the 139 KB timing (379 s) |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: a probe `test(hooks): …` commit with no `(red)` marker, a stated deviation (no vitest file, as in B1.106 and B1.107). Then green `chore(hooks): …` and review. No skeleton or map row (no section)                                                                                                                                            |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a, no section. `scripts/agent/tier.sh backlog/work/B1.108/plan.md` prints `high`, so the lead's `approve` gates the build. D-19's label is named                                                                                                                                                                                            |
| no settled D-n contradicted                                                            | pass: D-9 (agents never merge), D-19 and D-28 are followed. B1.103, B1.105 and B1.107 forms stay blocked, because the full hook-smoke passes on the prototype                                                                                                                                                                                       |
| `scripts/next-task.sh --check B1.108` on the committed plan says no overlap            | pass: `[next-task] B1.108: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                |

Confirmed on the prototype, beyond the plan's own probes:

- Commands blocked on base stay blocked: the plain merge, quoted `"gh" "pr" "merge"`, `-R o/r merge`, `/usr/bin/gh`,
  a backtick, `$( )` and `bash -c '…'`.
- These stay allowed on both hooks: `--json number,title,state,isDraft,mergeable`, `--state merged`, `checks`,
  `edit --add-label config-change-approved`, `create --draft --title … --body-file`, `-R o/r view --json
mergedAt,mergeStateStatus`, `-R o/r list --search "is:merged"`, and `-R o/r view -q '{t: .title, m: .mergeable}'`.
- The stated false positives are real (0 → 2): `-c "$WHY-d"`, `-c 'cost: $X-d'` and `--comment 'see {a,-d}'`.
- The stated out-of-reach forms stay at 0: `m$'\145'rge`, `${X:-merge}` and `-c "a;b" -d`.

### Reasons (changes requested)

1. **A positional parameter in braces still merges.** The plan's `UNQUOTE` removes `$1`, `$@` and `$*`, but not
   `${1}`, `${@}` or `${*}`. Its `\{…\}` alternative takes only a name, so the `$` stays, the braces become spaces and
   `merge` stays split off.
   - Trigger: `gh pr ${1}merge 7`, `gh pr ${@}merge 7`, `gh pr ${*}merge 7`.
   - Outcome: exit 0 on the prototype. bash and zsh with no arguments both expand each to `merge`
     (`printf "[%s]" ${@}merge` prints `[merge]`), so the PR is merged. That breaks D-9.
   - The plan's out-of-reach list does not name it. "Operator expansions" does not cover a plain `${1}`. The
     close form `${1}-d` is blocked (exit 2) only by chance: the brace becomes a space before `-d`.
   - Either cover it (for example `\{([a-z_][a-z0-9_]*|[0-9@*])\}`) and add a probe, or name it out of reach with the
     reason.
2. **A brace list whose words share a prefix still deletes the branch.** The plan turns `{ } ,` into spaces and the
   header says `{-d,}` "reads as the plain word". That holds only when the whole word is the list. A prefix outside
   the braces is cut off from each word.
   - Trigger: `gh pr close 7 -{d,d}`, `gh pr close 7 -{d,c} x`,
     `gh pr close 7 --{delete-branch,delete-branch}`.
   - Outcome: exit 0 on the prototype. The unquoted copy reads `- d d`. The shell expands them to `-d -d`,
     `-d -c x` and `--delete-branch --delete-branch` (checked with `printf` in bash and zsh), so the remote branch is
     deleted.
   - Either match these too (one way: also test a copy with `{ } ,` removed, not turned into spaces, where `-dd` and
     `--delete-branchdelete-branch` match the existing rule) and add probes with the cost re-measured, or name "a
     brace list with a prefix outside the braces" out of reach in the header and `hooks.md`.

Notes for the lead (not blocking):

3. **A pre-existing merge path, outside this card's quoting scope.** A redirect stuck to the subcommand passes on
   base `4c79bec` and on the prototype: `gh pr merge>/dev/null 7` (also `merge<x`) and
   `gh pr close>/dev/null 7 -d`. They pass because `E` has no `<` or `>`, and `close` must be followed by a space.
   The shell runs gh with `pr merge 7`. This is a D-9 bypass on main today. Either widen it in this card (a plan
   change) or file a card before this one closes.
4. The rules now run before the segment loop. A command that also holds a forced push therefore reports `MERGE_MSG`
   or `FORCE_MSG` from the gh pr rule first. It is still blocked. No probe checks the order.
5. I did not check the plan's 9 mutant counts or the 139 KB timing. Both belong to the diff review.

Verdict: changes requested

## Plan review (round 2)

Plan at `d64a0c3`. The prototype `new/guard-bash.sh` (copied to `$TMPDIR/b108/new2/`) differs from `4c79bec` by
exactly the plan's pasted `UNQUOTE`, `BRACE_ONE`, `GH_PR_FLAGS`, `GH_BRANCH_DELETE`, `GH_PR_MERGE` and loop, plus a
header block. The probe section is the dev-lead's round-2 `probes.sh`, inserted into `scripts/hook-smoke.sh` in the
clone `$TMPDIR/b108/c/`.

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                         | pass: same 4 rows as round 1, tooling, no section                                                                                                                                                                                                            |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | fail: n/a for TypeScript, but the pasted `BRACE_ONE` loop adds a cost the plan does not state (reason 1)                                                                                                                                                     |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice, stated                                                                                                                                                                                                                                      |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: the card's 11 forms are among the 29 blocked probes, and acceptance 2's 5 commands are among the 9 allowed                                                                                                                                             |
| verification lists exact commands with expected numbers                                | pass for the counts, which I reproduced with `/bin/bash` 3.2.57. Base hook with the probes: exit 1, 29 FAIL, 847 ok. Prototype with the probes: "hook-smoke: 876 probes OK". The timing table measures only inputs with no brace, so it cannot show reason 1 |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: unchanged from round 1, the deviation is stated                                                                                                                                                                                                        |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a. `tier.sh` gives `high`, so the lead's `approve` gates the build. D-19 label named                                                                                                                                                                 |
| no settled D-n contradicted                                                            | pass: D-9, D-19 and D-28 are followed. All 838 existing probes pass on the prototype                                                                                                                                                                         |
| `scripts/next-task.sh --check B1.108` on the committed plan says no overlap            | pass: `[next-task] B1.108: no overlap with any Doing or Review card` (re-run at `d64a0c3`)                                                                                                                                                                   |

Round 1 is resolved. On the prototype these now exit 2:

- From reasons 1 and 2: `${1}merge`, `${@}merge`, `${*}merge`, `-{d,d}`, `-{d,c} x` and
  `--{delete-branch,delete-branch}`.
- From note 3: `merge>/dev/null`, `merge<x` and `close>/dev/null 7 -d`.

Results of my 42 round-1 adversarial commands:

- Base-blocked forms stay blocked.
- These stay at 0: the 10 allowed reads, `-c "a;b" -d`, `m$'\145'rge` and `${X:-merge}`. Each is named out of reach
  or allowed.
- The same 42 commands give identical exit codes under bash 5.2.15 and GNU sed 4.9 (`node:24-bookworm`, read-only
  mount), so the BSD and GNU `sed` forms agree.

### Reasons (changes requested)

1. **The brace loop grows the command by prefix × commas, so a short command makes the hook run for minutes.**
   `BRACE_ONE` copies the whole prefix and suffix of a word once per comma inside its braces. The prefix and suffix
   can be any length (`[^[:space:]{}]*`). Each pass of `:b … tb` rescans the grown line from the start.
   - Trigger: `echo` followed by 2000 `a` characters, then `{` and 500 commas and `}`. The command is 2.5 KB.
   - Result: the `sed` alone writes 1,002,506 bytes in 7.5 s, and the hook takes 9.2 s. Base takes 0.11 s.
   - Under GNU sed 4.9 / bash 5.2 the same input had not finished after about 6 minutes. I stopped the container.
   - A gh pr merge segment followed by the same brace word in one command gets these BSD timings:

     | Command                  | Size | Base   | Prototype |
     | ------------------------ | ---- | ------ | --------- |
     | 2000 `a` and 1000 commas | 3 KB | 0.08 s | 32 s      |
     | 4000 `a` and 1000 commas | 5 KB | 0.08 s | 73 s      |

   - A plausible input hits it too. A heredoc of a 96 KB one-line minified JSON array (`cat > f.json <<'EOF'`,
     2000 objects) takes 6.2 s against 0.36 s, which is 17× slower.
   - `settings.json` sets no timeout for `guard-bash.sh`. If Claude Code lets a command run when its hook times out
     (plausible, I did not check), then a merge in the same command as such a word gets through.
   - Either way, the plan's cost section says "one `sed` per command is 3 forks per call" and does not name this
     cost.
   - Fix options: bound the expansion and add a probe. The prefix and suffix could be limited (`{0,N}`), the
     iterations or line growth capped, or the loop run only on lines naming `gh` and `pr`, which does not help a
     merge sharing the line. Re-measure the brace inputs above on both `sed` builds and state the numbers in the
     plan. Or drop the expansion and name these forms out of reach.

Notes for the lead (not blocking):

2. Nested and adjacent brace lists (`-{x,{c,d}}`, `-{d,x}{,}`) are named out of reach in the plan and the header,
   which matches what the prototype does (`edge.txt`).
3. I did not re-check the 13 mutant counts or the 139 KB timing (364 s on both). Both belong to the diff review.

Verdict: changes requested

## Plan review (round 3)

This is a third round. The coordinator's brief says the lead typed `review r3` in the session. I did not see that
message. The plan is high tier, so it waits for the lead's `approve` whatever this verdict says.

Plan at `1a35692`. In the prototype `new/guard-bash.sh` (copied to `$TMPDIR/b108/r3/new/`), `BRACE_ONE` carries the
`g` flag and runs a fixed four times, with no `:b … tb` loop. Its diff against `4c79bec` is the plan's pasted
interface plus the header block. The probe section is the round-3 `probes.sh`, inserted into `scripts/hook-smoke.sh`
in the clone `$TMPDIR/b108/c/`.

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: same 4 rows, tooling, no section                                                                                                                                                                                              |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: n/a for TypeScript. The brace cost is now bounded and stated (below)                                                                                                                                                          |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice, stated                                                                                                                                                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: the card's 11 forms are among the 30 blocked probes, and acceptance 2's 5 commands are among the 10 allowed                                                                                                                   |
| verification lists exact commands with expected numbers                                | pass: reproduced with `/bin/bash` 3.2.57. Base hook with the probes: exit 1, 30 FAIL, 848 ok. Prototype with the probes: "hook-smoke: 878 probes OK" (838 + 40). The brace-heavy timings are now stated and will be re-run on green |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: unchanged, deviation stated                                                                                                                                                                                                   |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a. `tier.sh` gives `high`, so the lead's `approve` gates the build. D-19 label named                                                                                                                                        |
| no settled D-n contradicted                                                            | pass: D-9, D-19 and D-28 are followed. All 838 existing probes pass on the prototype                                                                                                                                                |
| `scripts/next-task.sh --check B1.108` on the committed plan says no overlap            | pass: `[next-task] B1.108: no overlap with any Doing or Review card` (at `1a35692`)                                                                                                                                                 |

Round 2's reason is resolved. The round-2 trigger inputs, base against the round-3 prototype:

| Input                                          | BSD `sed`, `/bin/bash` 3.2 | GNU `sed` 4.9, bash 5.2.15                 |
| ---------------------------------------------- | -------------------------- | ------------------------------------------ |
| `echo` + 2000 `a` + 500 commas                 | 0.09 / 0.10 s (plan)       | 65 / 105 ms (round 2: more than 6 minutes) |
| a gh pr merge segment + 2000 `a` + 1000 commas | 0.09 / 0.10 s (plan)       | 32 / 77 ms, exit 2                         |
| the same with 4000 `a`                         | 0.10 / 0.12 s (plan)       | 32 / 212 ms, exit 2                        |
| 96 KB JSON heredoc                             | 0.44 / 0.48 s (plan)       | 152 / 170 ms                               |

A worst case that is not in the plan, timed with BSD `sed` and `/bin/bash` 3.2:

- One 105 KB word of 500 runs, each 200 `y` followed by `{a,b,c,d,e}`.
- With `g`, each pass at most doubles the line, so four passes grow it at most 16×.

| Command around the word              | Base   | Prototype | Exit |
| ------------------------------------ | ------ | --------- | ---- |
| `echo`                               | 0.34 s | 0.72 s    | 0    |
| a gh pr `-R o/r view 7 … -q` segment | 0.31 s | 0.79 s    | 0    |
| a gh pr merge segment                | 0.13 s | 0.26 s    | 2    |

Bypass checks on the round-3 prototype:

- My 42 adversarial commands give the same exit codes as on round 2 under both BSD and GNU. Everything blocked in
  round 2 is still blocked, and the 10 allowed reads still pass.
- `edge.txt` behaves exactly as the plan's out-of-reach list says:
  - These exit 0: `-{a,b,c,e,f,d}`, `-{x,{c,d}}`, `{-x,-{c,d}}`, `${X:--d}` and `$'\x2dd'`.
  - `-{a,b,c,e,d}` exits 2.
  - The stated false positives exit 2: `-c 'see {a,-d}'` and `-c "$WHY-d"`.

No blocking reason.

Notes for the lead (not blocking):

1. **The sixth-item gap is real, not only theoretical.** The trigger is
   `gh pr close 7 --{comment=a,comment=b,comment=c,comment=e,comment=f,delete-branch}`. The shell hands gh five
   `--comment=…` flags and `--delete-branch`. After four passes the copy reads `--comment=f,delete-branch`, so the
   hook exits 0 (I ran it). With five items, ending in `delete-branch`, it exits 2. The plan names this as "a brace list's sixth item on", so it is a stated cost. Taking a sixth item
   would cost one more pass.
2. I did not re-check the 15 mutant counts or the 139 KB timing (355 / 356 s). Both belong to the diff review.

Verdict: approved

## Diff review (round 1)

Diff `4c79bec...bd10055`: probe commit `f51f28c` (`scripts/hook-smoke.sh` only), green `bd10055` (`guard-bash.sh`,
`hooks.md` only). Evidence under `$TMPDIR/b108d/`: `c/` is a `git clone` of the worktree, `base/` holds the
`4c79bec` hook, `run.sh` runs `cases.txt` through both hooks (`gh` and the merge word are placeholders expanded at
run time), `fix/` holds the one-line prototype named under finding 1.

### Command results (last lines)

| Command                                        | Result                                                                                                                                   |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                    | `All matched files use Prettier code style!` (exit 0)                                                                                    |
| `pnpm typecheck`                               | `> tsc --noEmit` (exit 0)                                                                                                                |
| `pnpm test`                                    | `Tests  403 passed (403)`                                                                                                                |
| `pnpm test:e2e`                                | `91 passed (2.2m)`                                                                                                                       |
| `scripts/mutation-gate.sh`                     | `mutation: CI only, no src/lib or src/actions change`                                                                                    |
| `scripts/ci/check-suppressions.sh`             | `[check-suppressions] OK: no new suppressions`                                                                                           |
| `scripts/ci/check-config-change.sh`            | `::error::Protected configuration changed without the 'config-change-approved' label:` (expected: the label is added on the PR, D-19)    |
| `scripts/ci/check-feat-commits.sh`             | `[check-feat-commits] OK: no feat commit touches tests`                                                                                  |
| `scripts/ci/check-ac-coverage.sh`              | `[check-ac-coverage] OK: every criterion of a shipped section has a test`                                                                |
| `scripts/ci/check-spec-sections.sh`            | `[check-spec-sections] OK: sections cited: 1 … 53`                                                                                       |
| `scripts/ci/check-features-map.sh`             | `[check-features-map] OK`                                                                                                                |
| `scripts/verify-red.sh B1.108`                 | `::error::no 'test(<pkg>): B1.108 … (red)' commit` (expected: probe commit without the marker, stated deviation, B1.106)                 |
| `scripts/hook-smoke.sh` at `bd10055`           | `hook-smoke: 878 probes OK` (worktree and clone, `/bin/bash` 3.2, BSD `sed`)                                                             |
| `scripts/hook-smoke.sh` at `f51f28c` (red)     | exit 1, 30 `FAIL` (all 30 new blocked probes, exit 0 on the base hook), `hook-smoke: FAILURES above`                                     |
| hook-smoke, bash 5.2.15 + GNU sed 4.9 (docker) | 0 `guard-bash` FAIL (289 `ok guard-bash` lines); 14 FAIL elsewhere, all from `node_modules` missing in the container (js-yaml, prettier) |
| `git diff --stat main...HEAD`                  | 6 files changed, 441 insertions(+), 29 deletions(-)                                                                                      |

### Checklist

| Check                                                 | Result                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every acceptance clause has a probe matching its Then | pass: 13 merge probes assert `agents never merge`, 17 delete probes assert `force pushes`, 10 allowed probes assert exit 0; the card's 11 forms are among them                                                                                                                    |
| no test weakened after the probe commit               | pass: `git log --first-parent --no-merges f51f28c..HEAD -- '*.test.*' e2e/ scripts/hook-smoke.sh` is empty; no merge commits in the range                                                                                                                                         |
| every changed file is in `plan.md`                    | pass: the 4 Files rows, nothing else                                                                                                                                                                                                                                              |
| interfaces match the plan                             | pass: `UNQUOTE`, `BRACE_ONE`, `GH_PR_FLAGS`, `GH_BRANCH_DELETE`, `GH_PR_MERGE` and the loop are byte-identical to the plan's pasted block                                                                                                                                         |
| `src/` invariants (Zod, Prisma, raw SQL, migration)   | n/a: no `src/`, `prisma/` or `e2e/` change                                                                                                                                                                                                                                        |
| no secret, no suppression                             | pass                                                                                                                                                                                                                                                                              |
| features map row                                      | n/a: no section                                                                                                                                                                                                                                                                   |
| bash 5 + GNU sed on the committed hook                | pass: same exit codes as BSD for all 36 of my cases and all guard-bash probes                                                                                                                                                                                                     |
| would a probe fail if one changed line were reverted  | pass: 5 of the plan's 15 mutants re-run on the clone with the full hook-smoke: no `<>` → 2 FAIL, three passes → 1, no `g` → 1, leftover braces kept → 4, no lower case → 6 (plan 5; the sixth is the B1.105 probe `GH PR -R O/R CLOSE 7 -D`). Clone restored (`git status` clean) |
| header comments and `hooks.md` state the boundary     | fail: the brace claim is unconditional, and two forms are missing from the out-of-reach lists (findings 1, 2)                                                                                                                                                                     |

### Findings

```
[1] KIND: correctness
    WHERE: .claude/hooks/guard-bash.sh:95 (BRACE_ONE), with :100-101 (split after the expansion)
    DEFECT: BRACE_ONE's prefix and suffix classes `[^[:space:]{}]*` take in `;` `&` `|` `(` `)` and the backtick,
            which end a word for the shell, so the prefix or suffix is copied onto every item and the later
            `tr ';&|'` split (or the glued `(`/`)`) cuts gh from its own subcommand or flag.
    TRIGGER: `gh pr close {7,-d};`, `gh pr close {7,-d}&&true`, `gh pr close {7,-d}|cat`,
             `gh pr {close,7,-d}|cat`, `gh {pr,MERGE,7};`, `(gh {pr,MERGE,7})`, `` `{gh,pr,MERGE,7}` ``
             (MERGE = the merge subcommand); bash-only (brace list in command position, zsh does not expand it
             there): `true;{gh,pr,MERGE,7}`, `({gh,pr,MERGE,7})`
    WRONG BEHAVIOUR: exit 0 on bd10055 under BSD sed / bash 3.2 and GNU sed 4.9 / bash 5.2. bash and zsh both expand
            the argument-position forms to `gh pr close 7 -d` / `gh pr MERGE 7` (`printf "[%s]" {7,-d};` prints
            `[7][-d]` in both), so the remote branch is deleted or the PR merged (D-9). The copy reads, e.g.,
            `gh pr close 7; -d;`. The header (":40-44 … in a brace list") and the hooks.md row ("each brace list's
            first five items expanded with its prefix and suffix") claim these are caught, and neither out-of-reach
            list names them. Control: the same lists with a space before the separator exit 2. Base 4c79bec also
            exits 0 on all of them, so this is not a regression, but it is a hole in the boundary this card states.
            A prototype (`$TMPDIR/b108d/fix/guard-bash.sh`) that adds `;&|()` and the backtick to the four excluded
            sets (`[^[:space:]{};&|()\`]`) turns all 11 triggers to exit 2 and leaves my 10 allowed reads at exit 0.
            With that one line changed, the full `scripts/hook-smoke.sh` still gives "hook-smoke: 878 probes OK"
            (second clone `$TMPDIR/b108d/c2/`), and the 300-segment timing is unchanged (base 2.10 s, HEAD
            2.00 s, prototype 2.04 s, one run each under load). The fix needs probes for these forms first.
    CONFIDENCE: confirmed (ran every trigger on both sed builds; checked the expansion with printf in bash and zsh)

[2] KIND: spec-mismatch (stated boundary)
    WHERE: .claude/hooks/guard-bash.sh:94 (UNQUOTE `\$\{([a-z_][a-z0-9_]*|[0-9@*])\}`), header :87-89, hooks.md guard-bash row
    DEFECT: a multi-digit positional in braces (`${10}`) is neither removed nor named out of reach; the header says
            "$1, ${1} … removed (empty when unset)" and lists only operator expansions as out of reach.
    TRIGGER: `gh pr ${10}MERGE 7` (and `${10}` before `-d` in a close)
    WRONG BEHAVIOUR: exit 0; with fewer than 10 arguments (an agent's `bash -c` has none) the shell hands gh
            `pr MERGE 7`. Either widen the class (`[0-9]+` inside braces) with a probe, or name it out of reach.
            Low weight: it is the same family as plan round 1 reason 1, not a new mechanism.
    CONFIDENCE: confirmed (ran it on both sed builds; `printf "[%s]" ${10}m` prints `[m]` in bash and zsh)
```

Answers to the brief's three doubts:

- Header and `hooks.md` boundary: accurate for quotes, `\`, `$'…'`, `$"…"`, variables, redirects, the sixth list item,
  nested lists, operator expansions, the new false positives (`'$X'-d`, `-c "$WHY-d"`, `-c 'see {a,-d}'`, a commit
  message quoting the merge subcommand in pieces, the message order) and the gh api / git push split. Wrong only on
  findings 1 and 2.
- The prettier re-padding of the 10 `hooks.md` rows is whitespace only: `git diff -w` on `hooks.md` leaves 2 lines,
  the guard-bash row and the table's separator row (its dashes grew with the column).
- bash 5 + GNU sed on the committed hook: run (table above), no guard-bash difference from BSD.

Verdict: back to code-writer

Riskiest unfalsified: word forms only zsh expands (the session shell is zsh): `${=X}`, `${~X}`, `$X[1]` and glob
qualifiers are not modelled by `UNQUOTE`, and I did not search them for a merge or `-d` the copy misses. Not re-run
either: the 139 KB one-segment timing (355 s on base too) and the other 10 of the 15 mutants.

## Plan review (round 4)

Plan at `d1b9c7a`, diffed against the approved round 3 (`86bec99`). Round 4 changes only the two pasted lines,
`UNQUOTE` (`${…}` takes `[0-9]+`) and `BRACE_ONE` (the four classes also exclude `;` `&` `|` `(` `)` and the backtick).
It adds 11 probes and two commits.

The prototype `fix/guard-bash.sh` (copied to `$TMPDIR/b108/r4/fix/`) differs from `bd10055`'s hook (`green/`,
byte-identical to the worktree's `HEAD` hook) by exactly those two lines, and both match the plan's block. Probes:
`probes4.sh`, inserted into `scripts/hook-smoke.sh` in a fresh clone `$TMPDIR/b108/r4/c/` at `d1b9c7a`.

| Check                                                                                  | pass / fail: reason                                                                                                                                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: the same 4 rows. Round 4 adds no file                                                                                                                         |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | fail: n/a for TypeScript, but the `${…}` widening still misses the subscript and zsh-flag forms of the same family (reason 1)                                       |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice. The lead's option a is recorded                                                                                                                    |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 11 more blocked forms, each with its message                                                                                                                  |
| verification lists exact commands with expected numbers                                | pass, reproduced with `/bin/bash` 3.2.57. On the `bd10055` hook: exit 1, 11 FAIL (exactly the 11 new probes), 878 ok. On the prototype: "hook-smoke: 889 probes OK" |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: steps 4 and 5 are a probe `test(hooks): … review pass 1 -- …` and a `fix(hooks): …`, as review-pass hardening is filed                                        |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a. `tier.sh` gives `high`. The plan's last line reads "round 4 pending", with no new approval written                                                       |
| no settled D-n contradicted                                                            | pass: D-9, D-19 and D-28 are followed                                                                                                                               |
| `scripts/next-task.sh --check B1.108` on the committed plan says no overlap            | pass: `[next-task] B1.108: no overlap with any Doing or Review card` (at `d1b9c7a`)                                                                                 |

Diff review pass 1 is resolved:

- All 11 triggers exit 2 on the prototype under BSD `sed` / bash 3.2 and under GNU `sed` 4.9 / bash 5.2.15
  (`node:24-bookworm`, read-only mount), with identical exits on both builds.
- I ran 72 commands: the 11 probes, 19 new adversarial ones and my 42 from rounds 1 to 3. Only 13 change exit code
  from `bd10055` to the prototype: the 11 probes, `${10}merge`, and `$({echo,-d})`, which a glued `(` used to hide.
- No allowed read changes: `{view,diff} 7;true`, `-q '{t: .title, b: .body}'|cat`, `-q '.[]|{n:.number}'&&true`,
  `(gh pr view {7,8})` and `${12}x` all exit 0.
- Timing is unchanged:

  | Input                              | `bd10055`     | Prototype     |
  | ---------------------------------- | ------------- | ------------- |
  | 300 segments                       | 1.84 / 1.89 s | 1.92 / 1.86 s |
  | round 3's 105 KB worst case, view  | 0.78 s        | 0.75 s        |
  | round 3's 105 KB worst case, merge | 0.15 s        | 0.17 s        |

### Reasons (changes requested)

1. **A `${…}` that is not a bare name or number still merges or deletes, in bash as well as zsh.** This answers the
   pass-1 "riskiest unfalsified" (zsh word forms). Round 4 widens `\$\{…\}` to `[0-9]+` only. A subscript or a zsh
   flag leaves the copy holding `$ x[1] merge` or `${=x}merge`, while the shell hands gh the plain word.
   - Merge trigger: `gh pr ${X[1]}merge 7`. `printf "[%s]" ${X[1]}merge` prints `[merge]` in both bash and zsh.
   - Delete triggers: `gh pr close 7 ${X[1]}-d` and `gh pr close 7 ${X[0]}--delete-branch`. In bash these print
     `[-d]` and `[--delete-branch]`.
   - zsh only, and the session shell is zsh: `gh pr $X[1]merge 7`, `gh pr ${=X}merge 7`, `${~X}merge`,
     `${^X}merge`, `gh pr close 7 $X[1]-d` and `${=X}-d`. zsh prints `[merge]` or `[-d]` for each.
   - All of them exit 0 on `bd10055` and on the prototype.
   - The plan's out-of-reach list names "`${X:--d}` and other operator expansions". It does not name a subscript or a
     zsh flag. The header claims `${NAME}` is removed.
   - This is the third time this family has been found (plan round 1 reason 1, pass 1 finding 2). Either remove
     every `${…}` with no `:`/`-`/`=`/`+`/`?` operator as a whole word part, and `$NAME[…]`, then probe one bash
     and one zsh form, or name "a subscripted or flagged expansion (`${X[1]}`, `$X[1]`, `${=X}`)" out of reach in
     the header and `hooks.md`.

Notes for the lead (not blocking):

2. The round-4 probes spell the merge subcommand in upper case (`MERGE`), so they also lean on the lower-casing.
   The lower-case mutant already has its own probes, so the probes still catch a reverted lower-casing. Upper case is
   not what an agent would type, but the hook lower-cases the command before matching, so it gives the same result.
3. I did not re-check the 7 round-4 mutant counts or the 139 KB timing. Both belong to diff review pass 2.
4. This is round 4, past the three-round limit. My role rule sends it to the lead ("Waiting on human"). The verdict
   below is input to the lead's choice, not a gate.

Verdict: changes requested

## Plan review (round 5)

Plan at `e79e0c5`, diffed against `d1b9c7a`. Round 5 changes only the `UNQUOTE` line. It adds `$NAME[…]`, `${…[…]}`
and zsh flags before the name (`(…)`, `=`, `~`, `^`), switches round 4's probes to a lower-case `merge`, and brings the
probe total to 21.

The prototype `fix5/guard-bash.sh` (copied to `$TMPDIR/b108/r5/fix5/`) differs from `bd10055` in only the two pasted
lines, and both match the plan. Probes: `probes5.sh`, inserted into `scripts/hook-smoke.sh` in a fresh clone
`$TMPDIR/b108/r5/c/` at `e79e0c5`.

| Check                                                                                  | pass / fail: reason                                                                                                                     |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: the same 4 rows                                                                                                                   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | fail: the new subscript class `\[[^]]*\]` removes a whole command (reason 1)                                                            |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice. The lead's option a is recorded                                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass                                                                                                                                    |
| verification lists exact commands with expected numbers                                | pass, reproduced with `/bin/bash` 3.2.57. On the `bd10055` hook: exit 1, 21 FAIL, 878 ok. On the prototype: "hook-smoke: 899 probes OK" |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: steps 4 and 5 as in round 4, with the subjects renamed                                                                            |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a. `tier.sh` gives `high`. The plan's last line reads "round 5 pending"                                                         |
| no settled D-n contradicted                                                            | fail: D-9. The reason 1 triggers merge a PR that `bd10055` and base `4c79bec` block                                                     |
| `scripts/next-task.sh --check B1.108` on the committed plan says no overlap            | pass: `[next-task] B1.108: no overlap with any Doing or Review card` (at `e79e0c5`)                                                     |

Round 4's reason is resolved. Every round-4 subscript and zsh-flag trigger exits 2 on the prototype (the 21 probes in
`p5.txt` all exit 2), and my 72 earlier commands keep their round-4 exits.

### Reasons (changes requested)

1. **The subscript class reaches across spaces, `;`, `$(` and backticks, so it removes a whole gh pr merge or delete
   from the copy.** This is a regression: `bd10055` blocks every trigger below, and the prototype lets them through.
   `\[[^]]*\]` (both copies, in `$NAME[…]` and `${…[…]}`) runs from the first `[` after a variable to the next `]`,
   whatever lies between.
   - Triggers (`gh`, the merge word, `$X` unset):
     - `bash -c 'echo $X[; gh pr merge 7 #]'`
     - `bash -c 'echo ok' && bash -c 'true $X[; gh pr close 7 -d #]'`
     - `echo ${X[$(gh pr merge 7)]}`
     - `echo $X[$(gh pr merge 7)]`
     - ``echo ${X[`gh pr merge 7`]}``
     - `echo ${(f)X[$(gh pr close 7 -d)]}`
     - `gh pr close 7 -c $X[ -d -c ] x`
   - `$TMPDIR/b108/r5/new-trig.txt` holds 12 triggers plus the plain merge as a control. On `bd10055` all 13 exit 2.
     On the prototype the 12 triggers exit 0 and the control exits 2. The result is the same under BSD `sed` /
     bash 3.2 and under GNU `sed` 4.9 / bash 5.2.15.
   - The shell runs the hidden command:
     - In bash, `$X[` is a literal `[`, the `;` ends the word and `#]` is a comment. `bash -c 'echo $X[; echo RAN #]'`
       prints `RAN` when started from zsh too.
     - In bash and zsh, a `$(…)` inside a subscript runs: `echo ${X[$(echo RAN >&2)]}` prints `RAN` in both.
     - In bash, `-c $X[ -d -c ]` hands gh `-c [ -d -c ]`, so the `-d` is a real flag.
   - Fix: narrow both subscript classes so a subscript cannot hold a space, `$`, a backtick, `(`, `)`, `;`, `&` or
     `|`: `\[[^][:space:]$\`();&|]*\]`. Then add probes for these forms.
     - I tried exactly that replacement on a copy (`$TMPDIR/b108/r5/tight/`).
     - All 12 triggers and the control exit 2 on BSD and on GNU.
     - The 21 `p5.txt` probes still exit 2.
     - My 72 earlier commands keep their exits.
     - I did not run the full hook-smoke on that copy.

Notes for the lead (not blocking):

2. `${X:-merge}` and `${X:--d}` are named out of reach, as the plan says, and still exit 0.
3. I did not re-check the 11 round-5 mutant counts or the timings. Both belong to diff review pass 2.
4. This is round 5, past the three-round limit, so it goes to the lead. The verdict is input, not a gate.

Verdict: changes requested

## Plan review (round 6)

This round is past the three-round limit. The coordinator's brief says the lead typed `review r6`; I did not see that
message. The plan is high tier, so the lead's `approve` is the gate either way.

Plan at `48aded2`, diffed against `e79e0c5`. Round 6 changes only the `UNQUOTE` line. A subscript is removed only when
it holds no space, `(`, backtick, `;`, `&` or `|`. A zsh flag group is removed only when it holds no space and no
parenthesis. The round adds 9 probes, 30 in total for rounds 4 to 6.

The prototype `fix7/guard-bash.sh` (copied to `$TMPDIR/b108/r6/fix7/`) differs from `bd10055` in only the two pasted
lines, and both match the plan. Probes: `probes7.sh`, inserted into `scripts/hook-smoke.sh` in a fresh clone
`$TMPDIR/b108/r6/c/` at `48aded2`.

| Check                                                                                  | pass / fail: reason                                                                                                                     |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: the same 4 rows                                                                                                                   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: n/a for TypeScript. The two lines match the prototype                                                                             |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice                                                                                                                         |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass                                                                                                                                    |
| verification lists exact commands with expected numbers                                | pass, reproduced with `/bin/bash` 3.2.57. On the `bd10055` hook: exit 1, 26 FAIL, 882 ok. On the prototype: "hook-smoke: 908 probes OK" |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: unchanged from round 5                                                                                                            |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a. `tier.sh` gives `high`. The plan's last line reads "round 6 pending"                                                         |
| no settled D-n contradicted                                                            | pass: D-9, D-19 and D-28 are followed. Round 5's regression is closed (below)                                                           |
| `scripts/next-task.sh --check B1.108` on the committed plan says no overlap            | pass: `[next-task] B1.108: no overlap with any Doing or Review card` (at `48aded2`)                                                     |

Round 5's reason is resolved. The results on the prototype are the same under BSD `sed` / bash 3.2 and under GNU `sed`
4.9 / bash 5.2.15:

- My 13 round-5 commands (`$TMPDIR/b108/r5/new-trig.txt`) all exit 2.
- The dev-lead's `trig5.txt` (9) and `p7.txt` (30) all exit 2.
- My 72 commands from rounds 1 to 4 give the same exits as on the round-5 prototype.

These forms try to get past the narrowed class. All exit 2 on both `bd10055` and the prototype:

- `echo $X[\;gh pr merge 7 #]`
- `echo $X['; gh pr merge 7 #']`
- `echo $X[>(gh pr merge 7)]`

These exit 0 on both hooks. The shell does not run a command or hand gh a flag in any of them:

- `echo $X[$'\n'gh pr merge 7]`: the newline is quoted, so it stays inside one word.
- `gh pr close 7 $X[-d]`: in bash, `[-d]` is a glob, not a flag.
- `echo ${X[{a,b}]}`.

Timing is unchanged:

| Input                             | `bd10055`     | Prototype     |
| --------------------------------- | ------------- | ------------- |
| 300 segments                      | 1.87 / 1.87 s | 1.89 / 1.78 s |
| round 3's 105 KB brace worst case | 0.81 s        | 0.80 s        |

No blocking reason.

Notes for the lead (not blocking):

1. **A zsh subscript flag or a join flag with a space still merges. This is not a regression: it exits 0 on
   `bd10055` too.** These exit 0 on both hooks:
   - `gh pr $X[(r)x]merge 7`
   - `gh pr ${X[(r)x]}merge 7`
   - `gh pr ${(j: :)X}merge 7`
   - `gh pr close 7 $X[(r)x]-d`

   In zsh, the session shell, `printf "[%s]" $X[(r)x]merge ${X[(r)x]}merge ${(j: :)X}merge` prints
   `[merge][merge][merge]`. The plan's rule excludes `(` and spaces from the classes on purpose, to keep round 5's
   `$(…)` hole shut, so these follow from a stated choice. Still, the out-of-reach list (header and `hooks.md`) does
   not name them. At the least, add "a zsh subscript flag (`$X[(r)x]`) or a flag group with a space (`${(j: :)X}`)" to
   it.

   A narrower widening is possible but untested here: allow one leading `\([a-z]+\)` inside the subscript, letters
   only, with no `$` before the `(`. It would cover `(r)`, `(i)` and `(w)` without letting `$(` back in.

2. I did not re-check the 19 mutant counts or the 139 KB timing. Both belong to diff review pass 2.

Verdict: approved
