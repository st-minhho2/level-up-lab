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

## Diff review (round 2)

Diff `4c79bec...5f9884b2`; pass-1 delta `161dc84..5f9884b2`: probes `2a636039` (`scripts/hook-smoke.sh` only, +36),
fix `5f9884b2` (`guard-bash.sh`, `hooks.md` only). Evidence under `$TMPDIR/b108d/`: the clone `c/` fetched to
`5f9884b2`, `bd/` holds the `bd10055` hook, `shellcases.txt` and `globcases.txt` the new triggers, `bin/gh` a stub
that prints the words it gets, `shrun.sh` and `globrun.sh` run a case under `/bin/bash` and `/bin/zsh -f` with the
stub first on `PATH`, and `fix2/` the prototype named under findings 1 and 2.

### Command results (last lines)

- `pnpm lint`: `All matched files use Prettier code style!`. `pnpm typecheck`: exit 0.
- `pnpm test`: `Tests  403 passed (403)`. `pnpm test:e2e`: not re-run (no `src/`, `e2e/` or config change since
  round 1's `91 passed`).
- `scripts/mutation-gate.sh`: `mutation: CI only, no src/lib or src/actions change`.
- `check-suppressions`, `check-feat-commits`, `check-ac-coverage`, `check-spec-sections`, `check-features-map`,
  `check-plan-scope`, `check-backlog`: OK.
- `check-config-change.sh`: `::error::Protected configuration changed without the 'config-change-approved' label`
  (expected until the PR carries the label, D-19).
- `verify-red.sh B1.108`: no `(red)` commit (the stated deviation, B1.106).
- hook-smoke at `2a636039` (red): exit 1, 26 FAIL, 882 ok. At `5f9884b2`: `hook-smoke: 908 probes OK`, in the
  worktree's clone with `/bin/bash` 3.2. Under bash 5.2.15 and GNU sed 4.9 (docker): 0 guard-bash FAIL, 319
  `ok guard-bash`; the other 14 FAIL are the `node_modules`-less container's, as in round 1.
- `git diff --stat origin/main...HEAD`: 6 files changed, 813 insertions(+), 29 deletions(-). (The local `main` ref
  is stale at `7163825`, so `main...HEAD` lists 18 files; `origin/main` is the base `4c79bec`.)

### Checklist

- Each round 4–6 form has a probe asserting the message: pass. The 21 + 9 probes match the plan's lists.
- No probe weakened: pass. `2a636039` only adds 36 lines; `5f9884b2` does not touch `scripts/hook-smoke.sh`.
- Changed files are in `plan.md`: pass. The interface (`UNQUOTE`, `BRACE_ONE`) is byte-identical to the plan's block.
- Round 1's findings: resolved. All 26 blocked triggers in round 1's `cases.txt` exit 2 at `5f9884b2`, `${10}`
  included; the 8 that exit 0 are the allowed reads and the stated `${X:-}merge`.
- Would a probe fail if one changed line were reverted: pass. 4 of the plan's 19 round 4–6 mutants re-run with
  the full hook-smoke on the clone: a one-digit `${…}` gives 2 FAIL, no `(…)` flag group 1, and a subscript class
  allowing a space 1, all as the plan says. `;` kept in BRACE_ONE's prefix class only gives 2 (the plan's 4 drops
  it from all four classes). The clone was restored (`git status` clean).
- Timing, two runs each: 300 segments base 1.83 / 1.82 s, `bd10055` 1.87 / 1.75 s, `5f9884b2` 1.81 / 1.81 s,
  `fix2/` 1.77 / 1.76 s. The 3 KB brace-heavy merge command takes 0.07 s on all four.
- Header and `hooks.md` state the boundary: fail (findings 2, 3).

### Findings

```
[1] KIND: correctness (regression from bd10055)
    WHERE: .claude/hooks/guard-bash.sh:99 (UNQUOTE, the unbraced subscript class `\[[^][:space:](`;&|]*\]`)
    DEFECT: the subscript removed after an unbraced `$NAME` may hold `{` `,` `}`, but bash brace-expands the word
            before it expands `$X`, and in bash `$X[` is not a subscript at all, so the removal deletes words bash
            hands gh.
    TRIGGER: `gh pr close 7 -c {$X[,-d,-c,]}` and `gh pr close 7 -c {$X[,--delete-branch,-c,]}`, run by bash
             (`bash -c '…'`, which round 6's own probe uses as a vector).
    WRONG BEHAVIOUR: exit 0 at 5f9884b2 on both sed builds; exit 2 at bd10055. bash 3.2 and 5.2 hand the stub
            `[pr] [close] [7] [-c] [[] [-d] [-c] []]`: two comments ("[" then "]") and `-d`, so the remote branch is
            deleted. The copy reads `-c {}`. zsh rejects the word (`bad math expression`), so it is bash-only.
            Prototype (`fix2/`): add `{},` to that class (`[^][:space:](`;&|{},]`); the copy then keeps
            `{[,-d,-c,]}`, BRACE_ONE turns it into `[ -d -c ]`, exit 2.
    CONFIDENCE: confirmed (hook on both sed builds; the stub under bash 3.2, bash 5.2 and zsh)

[2] KIND: spec-mismatch (stated boundary)
    WHERE: .claude/hooks/guard-bash.sh:99 (the braced subscript class), header :93, hooks.md:11
    DEFECT: a braced subscript holding a space is kept, and the out-of-reach lists do not name what that lets
            through. The header says only "A subscript holding a space … stays". The space exclusion is needed
            only for the unbraced `$X[` (where bash splits the word there, the round 5 regression); inside `${…}`
            neither shell splits words or runs `;`.
    TRIGGER: `gh pr ${X[ 1 ]}MERGE 7`; `gh pr close 7 ${X[ 1 ]}-d` (MERGE = the merge subcommand)
    WRONG BEHAVIOUR: exit 0 at 5f9884b2 (and at bd10055 and 4c79bec); bash and zsh both hand the stub
            `[pr] [MERGE] [7]` / `[pr] [close] [7] [-d]`, while `${X[1]}MERGE` without the spaces is blocked.
            Either cover it (prototype: braced class `[^]{}(`;&|]`, still refusing `(` and the backtick so
            `${X[$(…)]}` stays visible, and `{` `}` so `${X[a}; … {]}` cannot swallow a command), or name
            "a braced subscript with a space (`${X[ 1 ]}`)" out of reach in the header and `hooks.md`.
    CONFIDENCE: confirmed (hook on both sed builds; the stub under bash and zsh)

[3] KIND: spec-mismatch (documentation)
    WHERE: .claude/docs/hooks.md:11 (the guard-bash row)
    DEFECT: the new text puts a bare `|` inside code spans in a table cell ("`;`, `&` or `|`" and "`;` `&` `|`"); in
            a GFM table that pipe ends the cell, so the row has 5 cells under a 3-cell header.
    TRIGGER: render or parse `.claude/docs/hooks.md` at 5f9884b2: the row counts 5 cells (161dc84: 3), and prettier
             padded it as a column break ("`&` or `" + 74 spaces + "| `(it may hide …").
    WRONG BEHAVIOUR: GFM drops cells past the header's count, so the rendered row stops at "unless the subscript
            holds a space, `(`, a backtick, `;`, `&` or". Everything after it disappears from the page: the
            brace stop characters, every false positive, both out-of-reach lists, the merge rule, Prisma, secret
            reads, pr-step and rule 6. Prettier's re-pairing of the code spans also glued words to them
            ("`)`and a backtick, so`-'d'`, … `close>/dev/null 7 -d`count"). Fix: write `\|` inside the table (or
            "the pipe", as the row's B1.24 text does), then re-run prettier.
    CONFIDENCE: confirmed (cell count by script on both revisions; the raw line quoted above)
```

Notes for the lead (not blocking):

4. **Globs are missing from both out-of-reach lists.** Pre-existing: base exits 0 too, and the card does not cover
   them. In a directory holding a file named after the merge subcommand, or a file `-d` (`: > ./-d` is enough),
   `gh pr [m]erge 7`, `gh pr m?rge 7` and `gh pr close 7 [-]d` exit 0 on the hook. bash and zsh hand the stub
   `pr MERGE 7` and `pr close 7 -d`. This takes two steps, like "a script file the agent wrote", but the lists
   should name "a glob that matches a file" (or a card should take it).
5. Not exec'd by either shell, so not findings: zsh flag groups holding a backtick or `;`
   (`${(`…`)X}`, `${(;…;)X}`) and a braced subscript holding `}` or `;`. Both shells error without running the
   inner command, which the stub confirms.
6. With `fix2/` (findings 1 and 2), the full hook-smoke still gives "hook-smoke: 908 probes OK", and every case of
   mine keeps its exit code except the 4 triggers, which go to 2.

Answers to the brief's doubts:

- The header comments now match the code, except finding 2's missing out-of-reach line. They cover what is removed
  (subscripts, zsh flags), the characters that keep a subscript or a flag group, the brace stop characters, and the
  new out-of-reach entries (`${X:-merge}`, `$X[(r)x]`, `${(j: :)X}`). The `hooks.md` row has the same text but is
  broken by finding 3.
- Prettier's re-padding: whitespace only for the other rows. `git diff -w 161dc84..HEAD` leaves 2 lines, the
  guard-bash row and the separator. The guard-bash row's own spacing changes are finding 3.

Verdict: back to code-writer

Riskiest unfalsified: other bash-only orderings, where bash expands a word in an order zsh does not (brace before
parameter expansion, as in finding 1). I tested brace lists around the unbraced subscript, but not tilde or
process substitution next to a removed `$NAME`. Not re-run: the 139 KB one-segment timing and 15 of the 19
mutants.

## Plan review (round 7)

Plan at `af53eb8d`, diffed against `3514f8a2`. Round 7 changes only the two subscript classes in `UNQUOTE`:

- After a bare `$NAME`: `[^][:space:],]`.
- Inside `${…[…]}`: `[^]}(\`]`.

It also writes `\|` in the `hooks.md` row and adds 3 out-of-reach forms (a glob, a brace sequence, a brace item holding
`}`). There are 6 more probes.

The prototype `fix9/guard-bash.sh` (copied to `$TMPDIR/b108/r7/fix9/`) differs from `5f9884b2` (`head/`, byte-identical
to the worktree's `HEAD` hook) in the `UNQUOTE` line, which matches the plan, and in older header comments. The comments
do not change behavior (note 3). Probes: `probes9.sh`, inserted into `scripts/hook-smoke.sh` in a fresh clone
`$TMPDIR/b108/r7/c/` at `af53eb8d`.

| Check                                                                                  | pass / fail: reason                                                                                                                     |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: the same 4 rows                                                                                                                   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: n/a for TypeScript. The pasted `UNQUOTE` matches the prototype                                                                    |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice. The lead's option a is recorded                                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass                                                                                                                                    |
| verification lists exact commands with expected numbers                                | pass, reproduced with `/bin/bash` 3.2.57. On the `5f9884b2` hook: exit 1, 4 FAIL, 910 ok. On the prototype: "hook-smoke: 914 probes OK" |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: steps 6 and 7, a probe `test(hooks): … review pass 2 -- …` and a `fix(hooks): …`                                                  |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a. `tier.sh` gives `high`. The plan's last line reads "round 7 pending"                                                         |
| no settled D-n contradicted                                                            | pass: D-9, D-19 and D-28 are followed                                                                                                   |
| `scripts/next-task.sh --check B1.108` on the committed plan says no overlap            | pass: `[next-task] B1.108: no overlap with any Doing or Review card` (at `af53eb8d`)                                                    |

Diff review pass 2 is resolved, with the same results under BSD `sed` / bash 3.2 and under GNU `sed` 4.9 / bash 5.2.15.

| Input                                                           | Exit on the prototype                                                             |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `p9.txt` (6)                                                    | 6 of 6 exit 2. On `5f9884b2`, 4 exit 0                                            |
| `all9.txt` (66: the 60 earlier blocked forms + 6)               | all exit 2                                                                        |
| `trig5.txt` (9)                                                 | all exit 2                                                                        |
| `sub.txt`                                                       | as before: all 2 except `${X:-merge}` (0, named out of reach)                     |
| `edge9.txt`                                                     | as the plan states: `{$X[},-d}`, `{x,$X[},-d}`, `-{c..d}` and `{a,b}{,-d}` exit 0 |
| my 105 commands from rounds 1 to 7 (`$TMPDIR/b108/r7/mine.txt`) | 6 change exit, listed below                                                       |

The 6 changes:

- **0 → 2:**
  - `gh pr $X[(r)x]merge 7` (two copies in the file)
  - `gh pr close 7 $X[(r)x]-d`
  - `gh pr close 7 -c x {${X[ 1 ]},-d}`. bash hands `[-c][x][-d]`, because brace expansion skips `${…}`.
- **2 → 0:**
  - `echo ${X[; gh pr merge 7 #]}`
  - `echo ${X[a; gh pr merge 7; b]}`

  Neither shell runs the inner command. bash stops with "syntax error: operand expected". zsh stops with "bad math
  expression" or prints an empty line, and `RAN` never prints, also when wrapped in `bash -c "…"`. So these were false
  positives, not a closed hole.

Timing is unchanged:

| Input                             | `5f9884b2`    | Prototype     |
| --------------------------------- | ------------- | ------------- |
| 300 segments                      | 1.91 / 1.99 s | 2.09 / 1.91 s |
| round 3's 105 KB brace worst case | 0.77 s        | 0.83 s        |

I tried 9 more forms against the new classes (`cases7.txt`):

- A bare subscript can no longer hide a command. Building `gh pr merge 7` needs a space, a tab, a newline (one `sed`
  line), a comma in a brace list, or `${IFS}`. The first four are refused or cannot occur, and `${IFS}` is already out
  of reach. For example, `echo $X[$({gh,pr,merge,7})]` exits 2.
- `gh pr close 7 -c {$X[;,-d,-c,]}` exits 0 on both hooks. bash ends the word at the `;`, so gh gets no `-d`.
- `${X[a,-d,b]}` inside a brace list does not split in bash, since brace expansion skips `${…}`. zsh rejects it with
  "bad substitution".

No blocking reason.

Notes for the lead (not blocking):

1. **The zsh subscript-flag example in the out-of-reach list goes stale.** The current header (`guard-bash.sh:50`) and
   `hooks.md` give `$X[(r)x]` as out of reach. On the prototype that form now exits 2, because the bare class allows
   `(`. The braced form `gh pr ${X[(r)x]}merge 7` still exits 0, since the braced class refuses `(`, and zsh hands gh
   `merge`. When the fix lands, the example should become `${X[(r)x]}`.
2. `{$X[},-d}` hands gh `-d` in bash (`printf` prints `[-c][[}][-d]` after `-c`). It exits 0 at `bd10055`,
   `5f9884b2` and on the prototype, and the plan names it out of reach ("a brace item holding `}`"). This is a stated
   cost, not a regression.
3. The prototype's header comments are from before `5f9884b2`, but its code lines match the plan. The diff review has
   to check the header and `hooks.md` text: the `\|` rendering, note 1, and the 3 new out-of-reach forms.
4. Not checked here: the 6 round-7 mutant counts, the 139 KB timing, and the `hooks.md` cell count. All belong to diff
   review pass 3.
5. This is round 7, past the three-round limit, so it goes to the lead. The lead's `approve` is the gate.

Verdict: approved

## Diff review (round 3)

Diff `4c79bec...2889c4fd`; pass-2 delta `70bdc6f5..2889c4fd`: probes `4c8f20a3` (`scripts/hook-smoke.sh` only, +12),
fix `2889c4fd` (`guard-bash.sh`, `hooks.md` only). Evidence under `$TMPDIR/b108d/`: the clone `c/` fetched to
`2889c4fd`, `r3cases.txt` and `r3b.txt` the new triggers, `all3.txt` all 58 of my commands from rounds 1–3, `bin/gh`
the stub, `fix3/` and `fix4/` the two prototypes named under finding 1.

### Command results (last lines)

- `pnpm lint`: `All matched files use Prettier code style!`. `pnpm typecheck`: exit 0. `pnpm test`:
  `Tests  403 passed (403)`. `pnpm test:e2e`: not re-run (no `src/`, `e2e/` or config change since round 1's
  `91 passed`).
- `scripts/mutation-gate.sh`: `mutation: CI only, no src/lib or src/actions change`.
- `check-suppressions`, `check-feat-commits`, `check-ac-coverage`, `check-spec-sections`, `check-features-map`,
  `check-plan-scope`, `check-backlog`: OK.
- `check-config-change.sh`: `::error::Protected configuration changed without the 'config-change-approved' label`
  (expected until the PR carries the label, D-19). `verify-red.sh B1.108`: no `(red)` commit (stated deviation,
  B1.106).
- hook-smoke at `4c8f20a3` (red): exit 1, 4 FAIL, 910 ok. At `2889c4fd`: `hook-smoke: 914 probes OK`
  (`/bin/bash` 3.2). Under bash 5.2.15 and GNU sed 4.9 (docker): 0 guard-bash FAIL, 325 `ok guard-bash`, and the
  same 14 `node_modules` FAILs as before.
- `git diff --stat origin/main...HEAD`: 6 files changed, 1046 insertions(+), 29 deletions(-). No merge commits.

### Checklist

- Each pass-2 finding has a probe asserting the message: pass (6 probes, as the plan lists).
- No probe weakened: pass. `4c8f20a3` only adds 12 lines; `2889c4fd` does not touch `scripts/hook-smoke.sh`.
- Changed files and the `UNQUOTE` line match plan round 7: pass.
- Pass 2's findings 1–3: resolved. `{$X[,-d,-c,]}` and `${X[ 1 ]}` exit 2.
- `hooks.md`: all 10 rows of the table now have 3 cells (5f9884b2: the guard-bash row had 5). Nothing B1.108 added is
  lost. A word diff of the guard-bash row against `5f9884b2` shows only these changes:
  - the subscript wording;
  - "the pipe" for `|`;
  - the added `${X[ 1 ]}-d`;
  - the four new out-of-reach forms;
  - `.*` and `.env*` restored (prettier had turned the `*` into `_` while the row was broken).

  Against `bd10055`, `git diff -w` changes only the guard-bash row and the separator.

- Header comments (`guard-bash.sh:94-97`, `:49-51`): they describe the code as written, but the braced class they
  describe is the defect in finding 1.
- Mutants: I re-ran 2 of the plan's 6 round-7 mutants with the full hook-smoke on the clone. A bare class allowing
  `,` gives 6 FAIL and a braced class refusing a space gives 2, both as the plan says. The clone was restored
  (`git status` clean).

### Findings

```
[1] KIND: correctness (regression from 4c79bec, bd10055 and 5f9884b2)
    WHERE: .claude/hooks/guard-bash.sh:102 (UNQUOTE, the braced subscript class `[^]}(`]`)
    DEFECT: round 7 lets the class inside ${X[…]} hold a space, ; & | and quotes, but the regex also matches
            `${X[` where the shell does not expand it: inside single quotes, after a backslash (`\${`), or across
            a quote boundary. The removal then deletes plain command text the shell runs.
    TRIGGER (MERGE = the merge subcommand; each exits 2 on the base hook):
      echo '${X[ '; gh pr MERGE 7; ' ]}'                (bash and zsh)
      echo '${X[ '&&gh pr close 7 -d&&' ]}'             (bash and zsh)
      echo '${X['|gh pr MERGE 7|']}'                    (bash and zsh; gh runs inside the pipeline)
      echo \${X[ ;gh pr MERGE 7; ]}                     (bash)
      bash -c 'gh "$@"' '${X[ ' pr MERGE 7 -b ' ]}'     (bash and zsh; no separator at all, a space is enough)
      bash -c 'gh "$@"' \${X[ pr MERGE 7 -b ]}          (bash)
    WRONG BEHAVIOUR: exit 0 at 2889c4fd under BSD sed / bash 3.2 and GNU sed 4.9 / bash 5.2. The stub gets
            `[pr] [MERGE] [7]` (or `[pr] [close] [7] [-d]`, or `[pr] [MERGE] [7] [-b] [ ]}]`), so the PR is
            merged (D-9) or the branch deleted. A plain, unquoted `gh pr MERGE 7` that main blocks today now passes
            when it is wrapped this way. The plan review of round 7 checked hiding through a bare subscript, not a
            quoted or escaped braced one.
            Refusing `;&|` too (prototype `fix3/`, `[^]}(`;&|]`) is not enough: the two space-only `bash -c`
            triggers still exit 0. Prototype `fix4/` closes all 6 and keeps the pass-2 probes:
              - braced class `[^]}(`;&|'"\\]`, so the subscript may not cross a quote or hold a separator;
              - a first sed expression `s/\\\$/\\_/g`, so an escaped `\$` is never read as an expansion.
            With fix4, all 9 base-blocked commands that pass at HEAD exit 2 on both sed builds, the rest of my 58
            keep their exits, and the full hook-smoke gives "hook-smoke: 914 probes OK" (second clone `c2/`).
            The other way out, a braced class that refuses a space again, re-opens `${X[ 1 ]}` and would mean
            deleting pass 2's probes. That is not allowed.
    CONFIDENCE: confirmed (hook on both sed builds; the stub under bash 3.2, bash 5.2 and zsh)
```

Notes for the lead (not blocking):

2. The glob is named out of reach only in the delete rule's list (header `:50`, and the matching `hooks.md` list),
   with a merge example (`gh pr [m]erge 7`). The merge rule's own out-of-reach list (header `:76-79`, and the
   `hooks.md` merge part) does not name it.
3. This is pass 3 of 3. Finding 1 is a regression against `main`, so I do not see "merge as is" as an option. The
   choice is the lead's: take fix4 (or an equal fix) as a fourth pass with its probes, or drop round 7's braced class
   change and name `${X[ 1 ]}` out of reach. The second option would take 2 of pass 2's probes back out, which needs
   the lead's ruling, since tests are never weakened.

Verdict: back to code-writer

Riskiest unfalsified: other places where the regex reads `$…` that the shell does not expand: a here-doc with a
quoted delimiter, `$` inside `$'…'`, and `\\$` (an escaped backslash before a real expansion). I tested single
quotes, double quotes and `\$` only. Not re-run: the 139 KB timing.

## Plan review (round 8)

Plan at `7dd6cf5e`, diffed against `7e7c49cc`. Round 8 changes only `UNQUOTE`:

- A first step, `s/\\\$/\\_/g`, makes an escaped `\$` plain text.
- The braced subscript becomes optional spaces, then one token holding no space, `(`, backtick or `'`, then optional
  spaces.

The merge rule's out-of-reach list adds a glob. There are 8 more probes.

The prototype `fix11/guard-bash.sh` (copied to `$TMPDIR/b108/r8/fix11/`) differs from `2889c4fd` (`final/`,
byte-identical to the worktree's `HEAD` hook) in the `UNQUOTE` line only, which matches the plan. Probes:
`probes11.sh`, inserted into `scripts/hook-smoke.sh` in a fresh clone `$TMPDIR/b108/r8/c/` at `7dd6cf5e`.

I built a harness, `$TMPDIR/b108/r8/judge.sh`:

- It runs each command through the base hook (`4c79bec`), `final`, `fix11` and one mutant.
- It also runs each command in `/bin/bash` 3.2 and in `zsh -f`, with a `gh` stub on `PATH` that logs the words it
  receives. Each verdict below is checked against what the shell really hands gh.

The working tree also holds two uncommitted edits that are not mine: `pr-body.md`, and a mutant line in the pass-3
section of this file. I left them as they are.

| Check                                                                                  | pass / fail: reason                                                                                                                     |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: the same 4 rows                                                                                                                   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | fail: the token class still deletes text the shell runs after `$$` (reason 1)                                                           |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: the plan states how it differs from the pass-3 `fix4` (no `;&                                                                     | "\` exclusions in the token), and reason 1 is exactly the cost of that difference |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass                                                                                                                                    |
| verification lists exact commands with expected numbers                                | pass, reproduced with `/bin/bash` 3.2.57. On the `2889c4fd` hook: exit 1, 6 FAIL, 916 ok. On the prototype: "hook-smoke: 922 probes OK" |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass on content. Rows 8 and 9 sit after a blank line, outside the table, so they render as a separate table with no header (note 3)     |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a. `tier.sh` gives `high`. The plan's last line reads "round 8 pending"                                                         |
| no settled D-n contradicted                                                            | fail: D-9. The reason 1 triggers merge in bash, and `2889c4fd` blocks them                                                              |
| `scripts/next-task.sh --check B1.108` on the committed plan says no overlap            | pass: `[next-task] B1.108: no overlap with any Doing or Review card` (at `7dd6cf5e`)                                                    |

Pass 3's finding is resolved. Results under BSD `sed` / bash 3.2, and the same under GNU `sed` 4.9 / bash 5.2.15:

| Input                              | Exit on the prototype                  |
| ---------------------------------- | -------------------------------------- |
| `p11.txt`                          | 8 of 8 exit 2. On `2889c4fd`, 6 exit 0 |
| `all11.txt`                        | 74 of 74 exit 2                        |
| my 105 commands from rounds 1 to 7 | 103 keep their exit                    |

The other 2 of my commands go from 0 to 2: `echo ${X[; gh pr merge 7 #]}` and `echo ${X[a; gh pr merge 7; b]}`. Round
7's notes showed that neither shell runs those, so they are false positives coming back.

Timing is unchanged:

| Input                             | `2889c4fd`    | Prototype     |
| --------------------------------- | ------------- | ------------- |
| 300 segments                      | 2.03 / 1.86 s | 1.92 / 1.86 s |
| round 3's 105 KB brace worst case | 0.82 s        | 0.81 s        |

My pass-3 "riskiest unfalsified" list, run through the harness:

- **A here-doc with a quoted delimiter:**
  - As data, it is harmless: in `cat <<'HD'` the body is never run.
  - Fed to bash (`bash <<'HD'`), the body is parsed like a top-level command:
    - The single-quote trigger inside it exits 2.
    - The `$$` form of reason 1 exits 0, and bash and zsh both hand the stub `[pr] [merge] [7]`.
- **`$` inside `$'…'`:** `echo $'${X[\';{gh,pr,merge,7};]}'` exits 2. The token cannot hold `'`, and the shell
  runs nothing.
- **`\\$`:**
  - `echo \\${X[;{gh,pr,merge,7};]}` exits 2. It is a false positive: the expansion fails in arithmetic, and nothing
    runs.
  - `echo \\\${X[;…]}` exits 2 because the `\$` step catches it. bash runs the merge there, so this case is needed.
  - `echo $\{X[;…]}` exits 2.
- **Double quotes:** `"${X[ "&&{gh,pr,merge,7}&&" ]}"` and `"${X[";{…};"]}"` exit 0, but bash keeps parsing `${…}`
  across the inner quotes and runs nothing. These are not findings.
- **The plan's equivalent mutant (token allowing `(`) holds up.** My copy `mutparen/` exits 0 on
  `echo ${X[$({gh,pr,merge,7})]}`, but bash does not brace-expand inside a subscript, so the stub is never called. Its
  claim stands.

### Reasons (changes requested)

1. **After `$$`, a `${X[…]}` is not an expansion, and the token deletes the brace-list command behind it.**
   - This regresses from `2889c4fd`: its braced class refused `}`, so the text stayed visible. On base `4c79bec` these
     also exit 0, because main expands no brace lists. So the card's own coverage regresses, not main's.
   - In bash, `$$` is the PID and takes the second `$`, so `{X[` is literal, the `;` `&&` or `|` ends the command, and
     the brace list after it runs. The round-8 token holds `{` `,` `}` `;` `&` `|`, so `UNQUOTE` deletes the whole
     `${X[;{gh,pr,merge,7};]}`. Round 8 handles only `\$`, the plan's other "`$` the shell does not expand".
   - Triggers, each with the exits base / `2889c4fd` / prototype:

     | Command                                        | Exits     | The bash stub gets                |
     | ---------------------------------------------- | --------- | --------------------------------- |
     | `echo $${X[;{gh,pr,merge,7};]}`                | 0 / 2 / 0 | `[pr][merge][7]`                  |
     | `echo $${X[&&{gh,pr,merge,7}&&]}`              | 0 / 2 / 0 | `[pr][merge][7]`                  |
     | `echo $${X[\|{gh,pr,merge,7}\|]}`              | 0 / 2 / 0 | `[pr][merge][7]`                  |
     | `echo $${X[;{gh,pr,close,7,-d};]}`             | 0 / 2 / 0 | `[pr][close][7][-d]`              |
     | `bash <<'HD'⏎echo $${X[;{gh,pr,merge,7};]}⏎HD` | 0 / 2 / 0 | `[pr][merge][7]`, in bash and zsh |

   - zsh run directly does not call the stub, but the session's Bash tool reaches bash through `bash -c` or a
     here-doc. bash 5.2.15 in `node:24-bookworm` hands the stub `pr merge 7` too.
   - The prototype gives the same exits under GNU `sed`.
   - Fix: a second step, `s/\$\$/__/g`, right after `s/\\\$/\\_/g`, so a `$$` is text before any removal (`$$$X`
     still reads as `__` plus a removed `$X`). Add probes for the `$$` forms.
     - I tried it on a copy (`$TMPDIR/b108/r8/fix12/`).
     - The 4 `$$` triggers go to exit 2.
     - `p11.txt` stays 8 of 8 at exit 2, and `all11.txt` 74 of 74.
     - My 105 earlier commands keep the prototype's exits.
     - I did not run the full hook-smoke on that copy.
   - Taking pass 3's `fix4` exclusions (`;&|` in the token) instead would also close it.

Notes for the lead (not blocking):

2. The 2 → 0 → 2 swing of the two "operand expected" commands across rounds 7 and 8 changes no real behavior. Both are
   false positives.
3. The work-breakdown table in `plan.md` is broken: rows 8 and 9 come after a blank line and have no header row.
4. Not checked here: the `hooks.md` text (the glob in the merge list) and the 139 KB timing. Both belong to diff
   review pass 4.
5. This is round 8, past the three-round limit, so it goes to the lead. The verdict is input, not a gate.

Verdict: changes requested

## Plan review (round 9)

Plan at `b242aae2`, diffed against `7dd6cf5e`. Round 9 replaces round 8's `\$` step with one rule: inside `${X[…]}`
the subscript token may hold no shell metacharacter (no space, quote, backslash, `;` `&` `|`, `(` `)`, backtick,
`{` `}` or `,`).

The prototype `fix12/guard-bash.sh` (copied to `$TMPDIR/b108/r9/fix12/`) differs from `2889c4fd` (`final/`) in the
`UNQUOTE` line only, which matches the plan. Probes: `probes12.sh`, inserted into `scripts/hook-smoke.sh` in a fresh
clone `$TMPDIR/b108/r9/c/` at `b242aae2`. Every case below also went through round 8's stub harness (`judge.sh`): the
base hook `4c79bec`, `final` and `fix12`, plus a logging `gh` stub under `/bin/bash` 3.2 and `zsh -f`.

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: the same 4 rows                                                                                                                                                                                                       |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | fail: the zsh flag group in the same expression still deletes text the shell runs (reason 1). The rule the plan states ("the deleted text itself can hold nothing the shell treats specially") is applied to the token only |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass                                                                                                                                                                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass                                                                                                                                                                                                                        |
| verification lists exact commands with expected numbers                                | pass, reproduced with `/bin/bash` 3.2.57. On the `2889c4fd` hook: exit 1, 6 FAIL, 920 ok. On the prototype: "hook-smoke: 926 probes OK"                                                                                     |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: the table is whole again (round 8 note 3 fixed)                                                                                                                                                                       |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a. `tier.sh` gives `high`. The plan's last line reads "round 9 pending"                                                                                                                                             |
| no settled D-n contradicted                                                            | fail: D-9. The reason 1 triggers merge in bash                                                                                                                                                                              |
| `scripts/next-task.sh --check B1.108` on the committed plan says no overlap            | pass: `[next-task] B1.108: no overlap with any Doing or Review card` (at `b242aae2`)                                                                                                                                        |

Round 8's reason is resolved:

- Every case in round 8's `cases8.txt` where bash or zsh hands the stub a merge or `-d` now exits 2 on the prototype,
  under BSD `sed` / bash 3.2 and under GNU `sed` 4.9 / bash 5.2.15. That covers the four `$$` forms, the `$$` form
  inside `bash <<'HD'`, `\\\$`, `$\{`, `${X[ 1 ]}merge` and `true;{gh,pr,merge,7}`. The rest of `cases8` exits 2
  as well.
- `all12.txt` gives 78 of 78 at exit 2 on both builds. On `final`, 6 of them exit 0.
- My 105 commands from rounds 1 to 7 give the same exits as on round 8's prototype.

Timing is unchanged:

| Input                       | `2889c4fd`    | Prototype     |
| --------------------------- | ------------- | ------------- |
| 300 segments                | 1.97 / 2.06 s | 1.87 / 2.20 s |
| round 3's 105 KB worst case | 0.74 s        | 0.74 s        |

### Reasons (changes requested)

1. **The zsh flag group `\([^()[:space:]]*\)` sits in the same deleted span as the token, and it may still hold a
   quote, `;` `&` `|`, `{` `}` and `,`.** So a quote can close inside it, and a brace-list command after it disappears
   from the copy. This is not a regression: the exit is 0 on base `4c79bec`, on `2889c4fd` and on the prototype. But
   it is the same defect as round 8 in the same expression, and it breaks the rule round 9 states as its reason.
   - Triggers. Each exits 0 on the prototype and under both `sed` builds:

     | Command                                | bash 3.2 hands the stub                  |
     | -------------------------------------- | ---------------------------------------- |
     | `echo '${(';{gh,pr,merge,7};')X}'`     | `[pr][merge][7]`                         |
     | `echo '${(f'&&{gh,pr,merge,7}&&'f)X}'` | `[pr][merge][7]`                         |
     | `echo '${('\|{gh,pr,merge,7}\|')X}'`   | `[pr][merge][7]`                         |
     | `echo '${(';{gh,pr,close,7,-d};')X}'`  | `[pr][close][7][-d]`                     |
     | the first, fed through `bash <<'HD'`   | `[pr][merge][7]`, from bash and from zsh |

   - zsh run directly does not call the stub.
   - These forms do not run anything (no stub call): `$${(;…;)X}`, `\${(;…;)X}` and `"${(";…;")X}"`. Each is a syntax
     error or a bad substitution.
   - Fix: give the flag group the token's exclusions, `\([^][:space:]()`'"\\;&|{},]*\)`, and add probes for these
forms. I tried exactly that on a copy (`$TMPDIR/b108/r9/fix13/`):
     - All 8 commands in my `cases9.txt` that the flag group touches exit 2 on BSD and on GNU.
     - `${(f)X}merge` and `${(j:x:)X}merge` stay blocked.
     - `all12.txt` stays 78 of 78 at exit 2.
     - `cases8` and my 105 earlier commands keep their exits.
     - The full hook-smoke gives "hook-smoke: 926 probes OK".

Notes for the lead (not blocking):

2. The bare `$X[…]` class (`[^][:space:],]`) and a plain `$NAME` still allow quotes and separators. `echo '$X[';{gh,pr,merge,7};']'`
   and `echo '${X';{gh,pr,merge,7};'}'` are blocked, because the class refuses `,` or the name stops early. A hidden
   command needs a space or a comma brace list, and that class has neither. So the narrower rule is enough there.
3. Not checked here: the round-9 group mutants (`pairs.py`), the header and `hooks.md` text, and the 139 KB timing.
   All belong to diff review pass 4.
4. This is round 9, past the three-round limit, so it goes to the lead. The verdict is input; the lead's `approve` is
   the gate.

Verdict: changes requested

## Plan review (round 10)

Plan at `c6c8acb9`, diffed against `b242aae2`. Round 10 uses one class, "no shell metacharacter"
(`[^][:space:]()`'"\\;&|{},]`), for all three spans `UNQUOTE`deletes: the bare`$X[…]` subscript, the zsh flag group
and the braced token.

The dev-lead's prototype `fix13/guard-bash.sh` (copied to `$TMPDIR/b108/r10/dev13/`) differs from `2889c4fd` (`final/`)
in the `UNQUOTE` line only, which matches the plan. Probes: `probes13.sh`, inserted into `scripts/hook-smoke.sh` in a
fresh clone `$TMPDIR/b108/r10/c/` at `c6c8acb9`. Every case went through the stub harness (`judge.sh`): the base hook
`4c79bec`, `final` and `dev13`, plus a logging `gh` stub under `/bin/bash` 3.2 and `zsh -f`.

| Check                                                                                  | pass / fail: reason                                                                                                                      |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: the same 4 rows                                                                                                                    |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | fail: the shared class drops `(` `)` from the bare subscript, so `$X[(r)x]` is no longer removed (reason 1)                              |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass                                                                                                                                     |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass                                                                                                                                     |
| verification lists exact commands with expected numbers                                | pass, reproduced with `/bin/bash` 3.2.57. On the `2889c4fd` hook: exit 1, 10 FAIL, 920 ok. On the prototype: "hook-smoke: 930 probes OK" |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass                                                                                                                                     |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a. `tier.sh` gives `high`. The plan's last line reads "round 10 pending"                                                         |
| no settled D-n contradicted                                                            | fail: D-9. The reason 1 trigger merges in zsh, the session shell                                                                         |
| `scripts/next-task.sh --check B1.108` on the committed plan says no overlap            | pass: `[next-task] B1.108: no overlap with any Doing or Review card` (at `c6c8acb9`)                                                     |

Round 9's reason is resolved. Results are identical under BSD `sed` / bash 3.2 and under GNU `sed` 4.9 / bash 5.2.15:

- Every case in `cases8` and `cases9` where bash or zsh hands the stub a merge or `-d` now exits 2. That covers the
  `$$` forms, the flag-group forms, both quoted here-docs (`bash <<'HD'`), `\\\$`, `$\{`, `${X[ 1 ]}merge`,
  `${(f)X}merge`, `${(j:x:)X}merge` and `true;{gh,pr,merge,7}`.
- `all13.txt` is 82 of 82 at exit 2. On `final`, 10 of them exit 0.

Timing is unchanged:

| Input                                                      | `2889c4fd`    | Prototype            |
| ---------------------------------------------------------- | ------------- | -------------------- |
| 300 segments (one run under load reads 3.12 s for `final`) | 1.91 / 2.03 s | 1.98 / 1.93 / 1.95 s |
| round 3's 105 KB worst case                                | 0.93 s        | 0.82 s               |

### Reasons (changes requested)

1. **A regression from `2889c4fd`: a zsh subscript flag after a bare `$X` merges again.** Round 7 let the bare class
   hold `(`, so `$X[(r)x]` was removed. The plan's out-of-reach line still says "round 7 blocks `$X[(r)x]`". The shared
   class now refuses `(` and `)` in the bare subscript as well.
   - Triggers. Each exits 2 on `final`, 0 on the prototype and 0 on base, under both `sed` builds:

     | Command                    | zsh hands the stub   |
     | -------------------------- | -------------------- |
     | `gh pr $X[(r)x]merge 7`    | `[pr][merge][7]`     |
     | `gh pr $X[(i)x]merge 7`    | `[pr][merge][7]`     |
     | `gh pr close 7 $X[(r)x]-d` | `[pr][close][7][-d]` |

   - In my 105 commands from rounds 1 to 7, these are the only 3 that change against round 9 (lines 86, 89 and 101 of
     `mine.txt`).
   - Fix: keep `(` `)` allowed in the bare subscript only (`\[[^][:space:]`'"\\;&|{},]*\]`), and add a
`$X[(r)x]merge` probe. I tried exactly that on a copy (`$TMPDIR/b108/r10/fix14/`):
     - The three triggers exit 2. `${X[(r)x]}` stays at 0, as the plan names it out of reach.
     - `all13.txt` stays 82 of 82 at exit 2.
     - `cases8` and `cases9` keep the prototype's exits on both builds.
     - My 105 commands give exactly round 9's exits.
     - The full hook-smoke gives "hook-smoke: 930 probes OK".
   - Parentheses are safe in the bare subscript. A hidden command still needs a space or a comma brace list, and that
     class refuses both. `echo $X[$({gh,pr,merge,7})]` and `echo '$X[(';{gh,pr,merge,7};')]'` exit 2 on the copy,
     and `echo $X[$(gh)]` runs gh with no arguments. Bash does not split a word at `(` inside `$X[…]`.
   - Alternatively, the out-of-reach line could say `$X[(r)x]` too. That reopens a zsh merge that round 7 had shut.

Notes for the lead (not blocking):

2. The plan text says one class "serves all three deleted spans". With the fix above, the bare subscript keeps one
   difference, `(` `)` allowed, and the plan and header should say so.
3. Not checked here: the round-10 mutants (`mut13.py`), the header and `hooks.md` text, and the 139 KB timing. All
   belong to diff review pass 4.
4. This is round 10, past the three-round limit, so it goes to the lead. The verdict is input; the lead's `approve` is
   the gate.

Verdict: changes requested
