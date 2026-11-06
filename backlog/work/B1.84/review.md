# B1.84 review

## Plan review (round 1)

SCOPE: all (tooling, no §: `.claude/hooks/`, `.claude/agents/`, `.claude/docs/`, `scripts/`, `backlog/`). Plan at
`1e70647`. Read: card B1.84 (`backlog/plan/E1-todos.md`), `plan.md`, `filing-pr-body.md`, `.claude/hooks/guard-bash.sh`
(rules 1–5, `json_field`), `.claude/agents/reviewer.md`, `.claude/agents/dev-lead.md` ("Committing a review"),
`eslint.config.mjs`, `.prettierignore`, D-19/D-27/D-28/D-29, and B1.86's plan review (the precedent). The dev-lead's
prototype is `reviewer-writes.mjs` (491 lines) and `try.sh` in the session scratchpad; I ran a copy of it under
`$TMPDIR`.

Commands run (nothing on the tree; probes on copies under `$TMPDIR`):

- `scripts/next-task.sh --check B1.84` gave `[next-task] B1.84: no overlap with any Doing or Review card` (exit 0).
- `scripts/agent/tier.sh backlog/work/B1.84/plan.md` gave `high`, as the plan states.
- `scripts/ci/plan-files.sh --any B1.84 HEAD` gave 7 tokens, the Files table exactly.
- `scripts/hook-smoke.sh` on a copy gave `hook-smoke: 601 probes OK`, the baseline the plan quotes.
- `agent_type` already reaches PreToolUse hooks (`path-guard.sh:42`, `plan-scope.sh:45`, B1.78), so rule 6's input exists.
- `eslint.config.mjs` and `.prettierignore` do not exclude `.claude/`, so `pnpm lint` does cover the new `.mjs`
  (the prototype passes eslint; `prettier --check` still flags it, which the green step's formatting fixes).
- `dev-lead` commits `review.md` ("Committing a review"), so no reviewer step needs a Bash git write; rule 6 costs the
  reviewer no step of its own pipeline.
- 70 more commands of my own through the prototype (reasons 1–3).

| Check                                                                     | Result                                                                                                                                                                                        |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                            | pass: the hook, its guard-bash rule, its probes, the reviewer text, and two doc rows the plan names as outside the card's list with a "drop docs" opt-out. No section, so no features-map row |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib      | pass (n/a): no `src/`. guard-bash exit codes stay 0/2; the `.mjs` contract (stdin JSON, stdout reason, non-zero exit fails closed) is stated                                                  |
| follows `advice.md` or states the deviation                               | pass: "No advice (tier quick, no section)"; the card is `Tier: quick`                                                                                                                         |
| ≤ 7 criteria, every Then measurable                                       | pass: one Acceptance, measured by RW1–RW51 exit codes. Its first clause ("a Bash write by the reviewer role is refused") is not met by the planned writer list (reason 1)                     |
| verification lists exact commands with expected numbers                   | fail: baseline 601 confirmed, but the red count is off by one (reason 4)                                                                                                                      |
| work breakdown skeleton → red → green → map → review, convention subjects | pass: red → green → review is the tooling shape (B1.78, B1.86). The red subject has no `(red)` marker, as B1.62's mistake-log row requires for hook-smoke-only commits                        |
| `Lead approves spec` box, ticked only by a human                          | pass (n/a): no spec section. `Plan approved by:` is empty; tier high, so the lead's `approve` is needed (D-28)                                                                                |
| no settled D-n contradicted                                               | pass: D-19 (`config-change-approved`, `.claude/` is protected), D-27/D-28 (high tier → lead) followed; the runner's TMPDIR is left to a follow-up card, not edited here (B1.82 owns `run.sh`) |
| `next-task.sh --check` says no overlap                                    | pass: `[next-task] B1.84: no overlap with any Doing or Review card`                                                                                                                           |

Plan length: 70 lines against "≈ 40"; B1.78 (82) and B1.86 were accepted at this size, so not a reason here.

Verdict: changes requested

1. **The writer list is a denylist, so 20 worktree writes pass (confirmed).** The plan says "fails closed" for
   targets, but a command not on the list is never examined. With the fixture TMPDIR and cwd = this worktree, the
   prototype allowed every one of these (each writes or deletes inside the worktree):
   - git: `git read-tree -u --reset HEAD` and `git checkout-index -a -f` (overwrite the work tree, the same damage as
     #225's `sed -i`), `git worktree remove --force .` (deletes the worktree), `git config core.hooksPath /x`,
     `git update-index --assume-unchanged src/a.ts`, `git branch -f main HEAD~1`, `git fetch origin`.
   - others: `gzip src/a.ts`, `sort -o src/a.ts src/a.ts`, `curl -so src/a.ts …`, `tar -xf "$TMPDIR/a.tar" -C src`,
     `unzip -o "$TMPDIR/a.zip"`, `ditto "$TMPDIR/a" src`, `awk -i inplace 1 src/a.ts`, `ex -sc "%d|x" src/a.ts`,
     `split -l1 src/a.ts src/p`, `mktemp src/x.XXX`.
   - The plan's out-of-reach list names none of them, so the lead would approve a gap they have not seen.
   - Fix: make git fail closed: an allowlist of read subcommands (`log show diff status rev-parse ls-files ls-tree
cat-file blame grep merge-base rev-list for-each-ref describe shortlog name-rev`, plus the list forms of
     `branch`/`tag`/`stash`/`worktree` and `config --get`), any other subcommand treated as a write to the directory
     and its git dirs. Add the common file writers above (compressors, `sort -o`, `curl -o/-O/--output`,
     `wget -O/-P`, `tar -x`/`-C`, `unzip`, `ditto`, `cpio`, `awk -i inplace`, `ex`/`ed`, `split`, `mktemp`) to the
     list. Name whatever stays out of reach in the Costs line and the hook header. Add probes, want 2:
     `git read-tree -u --reset HEAD`, `git checkout-index -a -f`, `git worktree remove --force .`, `gzip src/a.ts`.

2. **`[` and `[[` are refused as "a command whose name is built at run time", even for pure reads (confirmed).**
   With TMPDIR unset, the prototype refused `[[ -f plan.md ]] && echo y` and `if [ -f plan.md ]; then cat plan.md; fi`.
   With TMPDIR set, it still refused `[ -n "$TMPDIR" ] && echo set || echo unset`. `test -f plan.md && echo y` passes.
   - This breaks the card's Acceptance ("the reviewer's reads … keep working") and the plan's line "Commands without
     a write … pass with TMPDIR unset".
   - It also blocks the check the new `reviewer.md` text asks for: is TMPDIR set before probing?
   - Fix: treat `[`, `[[` and `]]` as builtins or keywords. Add read probes to RW42–RW49, want 0 with TMPDIR unset:
     `[[ -f x ]] && echo y` and `if [ -n "$TMPDIR" ]; then echo set; fi`.

3. **One cost is unnamed: the session scratchpad is refused (confirmed).** Claude Code's harness tells every
   subagent, the reviewer included, to "always use [the scratchpad] for temporary files". Here that is
   `/private/tmp/claude-502/…/scratchpad`, while `TMPDIR` is `/var/folders/3j/…/T/`; the two are disjoint.
   - The prototype refuses `echo x > <scratchpad>/x.txt`.
   - So a reviewer that follows its harness prompt is refused on its first scratch write. This plan review is an
     example: B1.86's review ran the dev-lead's prototype from the scratchpad.
   - No environment variable names the scratchpad, so the hook cannot allow it.
   - Fix: name the cost in the Costs line, and have the `reviewer.md` change say "under `$TMPDIR`, not the session
     scratchpad". Do this in the plan, so the lead approves knowing about it.

4. **The red count is off by one (confirmed).** The baseline is 601 (`hook-smoke: 601 probes OK` on a copy). RW34–RW51
   are 18 probes that want 0 and already pass before the hook. So the red step gives 33 FAIL + 619 ok
   (601 + 18), not 618; the green step's 652 = 601 + 51 is right. Probes added for reasons 1–2 change all three
   numbers; recount them.

5. **Minor, state what the rule assumes (not blocking alone).**
   - The rule says "a command with a write is refused unless TMPDIR is set". But RW41 and RW45 (`>/dev/null`, `2>&1`
     with TMPDIR unset → 0) depend on device targets (`/dev/null|stdout|stderr|tty|fd/N`) and fd duplications not
     counting as writes. Say so in the Approach.
   - The hook expands `$TMPDIR` from its own environment, and the Bash tool's shell starts from the user's profile.
     A profile that exports another TMPDIR makes the hook judge a different path from the one written. State this
     as an assumption, or put it out of reach.
   - The prototype is 491 lines, not "≈ 330". That changes the size estimate the lead reads.

Riskiest unfalsified: the cwd tracking across `cd X && … ; …` combined with `$( )` recursion. The 28 refusal rows
and my 70 commands did not break it, but the lexer is ~490 lines of hand-written shell grammar. Its edge cases
(nested quotes inside `$( )` inside a heredoc) have only the plan's probes as evidence.
