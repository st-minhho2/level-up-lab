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
