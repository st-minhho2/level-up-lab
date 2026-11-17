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
