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

## Plan review (round 2)

SCOPE: all (tooling, no §). Plan at `d2d3dcb`. The base is unchanged since round 1: `git diff --stat 7c4300e HEAD`
shows only `backlog/work/B1.84/{plan,review}.md`. The dev-lead's prototype is `reviewer-writes.mjs` (684 lines; 785
after `prettier --stdin-filepath .claude/hooks/reviewer-writes.mjs`, as the plan says) and `try.sh` in the session
scratchpad. I ran copies of both under `$TMPDIR`. Nothing ran on the tree.

Commands run:

- `scripts/next-task.sh --check B1.84` gave `[next-task] B1.84: no overlap with any Doing or Review card` (exit 0).
- `scripts/agent/tier.sh backlog/work/B1.84/plan.md` gave `high`.
- `scripts/ci/plan-files.sh --any B1.84 HEAD` gave the 7 rows of the Files table.
- `try.sh` on the prototype gave `n=83 fail=0`, the Want column of RW1–RW83. RW84–RW85 are guard-bash's
  `agent_type` switch and are not in the prototype.
- Recount: want 2 is 5 + 28 + 18 + 1 = 52 (RW1–RW52). Want 0 is 16 + 15 + 2 = 33. 601 + 85 = 686. Red gives 52 FAIL
  and 634 ok. guard-bash rules 1–5 block none of the 85 commands today (no `rm -rf`, push, prisma, secret path or
  pr-step), so every want-2 row fails red on its exit code, and every want-0 row passes red and green.
- 140 commands of my own through the prototype, listed below.
- `scripts/hook-smoke.sh:765-769`: RP5 greps reviewer.md for `still write with Bash` and RP9 for the forbidden-forms
  line. The reviewer.md change at lines 15 and 22 must keep both strings, or "601 existing verdicts unchanged" breaks.

Round 1 reasons:

| #   | Round 1 reason                      | Now                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | denylist lets worktree writes pass  | fixed. git fails closed outside `GIT_READS` and the list forms. RW34–RW52 add the 18 commands. I tried 70 more writes (`git log --output=`, `git format-patch -o`, `>&`, `&>`, `&>>`, `>\|`, `<>`, `exec 3>`, `cp/mv/install -t`, `pushd`, `cd -`, `cd "$OLDPWD"`, `for TMPDIR in`, `export TMPDIR=`, `env/command/sudo/nice/timeout` prefixes, `sed --in-place`, `sed … -i`, `patch`, `find -exec … +`, brace lists, `git restore`, `git stash drop/clear`, `git branch -D`, `git tag`, `git config --unset`, `git worktree add/prune`, `git remote add`, `git reflog expire`, `--work-tree`, `--git-dir`). Every one was refused. |
| 2   | `[` and `[[` refused                | fixed (RW69–RW71). 29 git read forms pass with TMPDIR unset (`stash show -p`, `tag -l`, `remote -v`, `config user.name`, `worktree list --porcelain`, `reflog -5`, `branch -vv`, `apply --stat`, `--no-pager`, `-P`, `--remerge-diff` and others). Also the diff-review command block, `diff <(…)`, `xargs wc`, and heredocs to stdout.                                                                                                                                                                                                                                                                                             |
| 3   | scratchpad cost unnamed             | fixed: Cost (2) and the reviewer.md row name it. RW52 refuses a write to the scratchpad.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 4   | red count off by one                | fixed: 52 FAIL and 634 ok, then 686 (recount above).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 5   | device targets, TMPDIR source, size | fixed: the Approach states the device and fd rule and the profile assumption. The size is 785 lines after prettier (confirmed), "M in fact".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

| Check                                                                | Result                                                                                                                                                              |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                       | pass: as in round 1. The two doc rows are named as outside the card's list, with a "drop docs" opt-out                                                              |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | pass (n/a): no `src/`. guard-bash exits 0/2. The `.mjs` contract is stdin JSON, stdout reason, and a non-zero exit fails closed                                     |
| follows `advice.md` or states the deviation                          | pass: "No advice (tier quick, no section)"                                                                                                                          |
| ≤ 7 criteria, every Then measurable                                  | fail: one Acceptance, measured by RW exit codes and cause text. Its clause "the refusal names the cause" is false for a compound command after `cd X &&` (reason 1) |
| verification lists exact commands with expected numbers              | pass: red 52 FAIL and 634 ok, green "686 probes OK", vitest 241, named CI scripts (recount above)                                                                   |
| work breakdown, convention subjects                                  | pass: red → green → review, the tooling shape. The red subject has no `(red)` marker, as `docs/mistake-log.md:31` (B1.62) requires                                  |
| `Lead approves spec` box, ticked only by a human                     | pass (n/a): no section. `Plan approved by:` is empty. Tier high → the lead's `approve` (D-28)                                                                       |
| no settled D-n contradicted                                          | pass: D-19 label, D-27/D-28 high-tier gate. The runner's TMPDIR goes to a follow-up card, and `run.sh` stays B1.82's                                                |
| `next-task.sh --check` says no overlap                               | pass: `[next-task] B1.84: no overlap with any Doing or Review card`                                                                                                 |

Plan length: 85 lines against "≈ 40". B1.78's plan (82 lines) was accepted at this size, so it is not a reason here.

Verdict: changes requested

1. **After `cd "$TMPDIR/probe" &&`, a loop, an `if` or `{ a; b; }` loses the cwd. The refusal then names the wrong
   cause (confirmed).** With the fixture TMPDIR and cwd = this worktree, the prototype refuses each of these:
   - `cd "$TMPDIR/probe" && for i in 1 2; do sed -i "" "s/a/b/" src/x.ts; done`
   - `cd "$TMPDIR/probe" && while read -r m; do sed -i "" "$m" src/x.ts; done < "$TMPDIR/muts"`
   - `cd "$TMPDIR/probe" && if true; then touch a; fi`
   - `cd "$TMPDIR/probe" && { touch a; touch b; }`

   Each refusal says `'src/x.ts' (sed) is relative to a directory a cd may not have reached (join the cd and the
write with &&)`. The cd is already joined with `&&`, and the compound runs only if the cd succeeded.
   - Cause: `reviewer-writes.mjs:530-540` treats every `;` after the cd as a joiner and makes the cwd unknown. Only
     `(` saves and restores the cwd (`:549-552`). The plan's rule "any other joiner makes it unknown" reads the same
     way, so the plan carries the defect.
   - Why it matters: a loop of mutations in the copy is the very probe #225 ran. The refusal tells the reviewer to
     make a change it has already made. That breaks the Acceptance clause "the refusal names the cause". The cost is
     not named either, so the lead would approve a hook that refuses the main probe pattern under a misleading
     message.
   - Workaround today: absolute `"$TMPDIR/probe/…"` targets inside the loop. The prototype allows them.
   - Fix (a), preferred: a compound command (`for`, `while`, `until`, `if`, `case`, `{`) opened right after
     `cd X &&` keeps that cwd until its closing word, the way `(` already does. Any `cd` inside a loop body makes the
     cwd unknown for the rest of the loop, because the cd repeats on each pass. Add probes:
     - want 0: `cd "$TMPDIR/probe" && for i in 1 2; do sed -i … src/x.ts; done` and
       `cd "$TMPDIR/probe" && { touch a; touch b; }`.
     - want 2: `cd "$TMPDIR/probe"; for i in 1; do touch a; done` and
       `cd "$TMPDIR/probe" && for i in 1 2 3 4 5 6; do cd .. && touch a; done`.
   - Fix (b): keep the rule, and name the cost in Costs. The message must then say what to do: "inside a loop, `if`
     or `{ }`, write `$TMPDIR/…` targets". reviewer.md must say the same.
   - Either way, recount the red and green numbers.

Notes, not blocking (state them or leave them; each is fail-closed or out of reach):

- A `cp -r .` copy keeps the worktree's `.git` file, so git writes in the copy are refused (RW33). This is correct:
  `git checkout -- f` there would write the real worktree's index. So the "revert one line" probe has to restore
  with `cp`, `sed` or `patch`, or work from `git clone . "$TMPDIR/c"`, which the prototype allows. Name this in the
  reviewer.md row, which today says only "git".
- `sort a.txt -o /dev/stdout` is refused with TMPDIR unset. The device exemption covers only redirections, not
  writer options.
- `git version`, `git notes show`, `git merge-tree` and `git fsck` are refused with TMPDIR unset. This is the stated
  fail-closed cost.
- `git -c diff.external=… diff` and `git -c core.pager=… log` pass: a `-c` setting runs a program from a read
  subcommand. Add "`git -c` that runs a program" to the out-of-reach list in the hook header and in hooks.md.
- The reviewer.md change must keep RP5's `still write with Bash` and RP9's forbidden-forms line (above).

Riskiest unfalsified: the cwd tracking itself. 140 commands of mine did not break the escape side: every write into
the worktree was refused. The fix for reason 1 changes that same code, though, and the lead approves before it
exists. A cwd that survives into a compound command is where a regression would let a relative write escape. The
two want-2 probes in reason 1 are the guard against that.

## Diff review (round 1)

Range `main...677506f`: red `b1597f2`, green `677506f`. Every probe below ran on a `git clone` under `$TMPDIR`
(`b184probe-62322`), with a fixture TMPDIR `b184fix/t`. Nothing in the worktree was written.

### Command results (last line each)

- `pnpm lint`: `All matched files use Prettier code style!`
- `pnpm typecheck`: `tsc --noEmit` (exit 0)
- `pnpm test`: `Tests  241 passed (241)`
- `pnpm test:e2e`: `52 passed (1.2m)`
- `pnpm test:mutation`: `Final mutation score of 92.62 is greater than or equal to break threshold 70` (no `src/`
  change)
- `scripts/hook-smoke.sh` at `677506f`: `hook-smoke: 695 probes OK`
- `scripts/hook-smoke.sh` at `b1597f2` (clone): `hook-smoke: FAILURES above`, 55 FAIL and 640 ok, as the plan says
- `check-suppressions.sh`: `OK: no new suppressions`
- `check-config-change.sh`: exit 1, because `.claude/agents/reviewer.md`, `.claude/docs/hooks.md`,
  `.claude/hooks/guard-bash.sh` and `.claude/hooks/reviewer-writes.mjs` lack the label. This is expected: the PR
  carries `config-change-approved` (D-19)
- `check-feat-commits.sh`: `OK: no feat commit touches tests`
- `check-ac-coverage.sh`: `OK: every criterion of a shipped section has a test`
- `check-spec-sections.sh`: `OK: sections cited: 1 … 28`
- `check-features-map.sh`: `OK`
- `check-agent-frontmatter.sh` · `check-plan-scope.sh` · `check-backlog.sh`: `OK: 13 files` ·
  `OK: … stays inside the approved plan of B1.84` · `OK: README matches the cards`
- `scripts/verify-red.sh B1.84`: `::error::no 'test(<pkg>): B1.84 … (red)' commit`. Not applicable: verify-red
  judges only `*.test.ts(x)`. The red is in hook-smoke and was proven by hand above, as B1.82, B1.83 and B1.86 did,
  under the subject the plan names
- `git diff --stat main...HEAD`: `9 files changed, 1435 insertions(+), 54 deletions(-)`

### Checklist

- Card Acceptance has a probe whose verdict matches: pass, except "the refusal names the cause" (finding 1).
- No test weakened after red: pass. The `git log --first-parent --no-merges b1597f2..HEAD` over
  `'*.test.*' e2e/ scripts/hook-smoke.sh` is empty, and so is the `--remerge-diff` form. The red commit deletes 0
  lines of hook-smoke.
- Every changed file is in `plan.md`: pass. All 9 files are in the Files table; the lead accepted both doc rows at
  the gate.
- Interfaces match the plan: pass. guard-bash reads `agent_type` and `cwd` and exits 0 or 2. The .mjs takes the
  stdin JSON plus `TMPDIR` and `CLAUDE_PROJECT_DIR` and prints the reason. A node failure refuses.
- Zod, Prisma, raw SQL, migration: n/a, no `src/` or `prisma/` change.
- No secret, no suppression: pass.
- Features map: n/a, tooling with no section.
- Reverting one changed line fails a probe (on the clone): pass for 7 of 7. No `kept`: 5 FAIL.
  `tmpRebound = false`: 1. No "TMPDIR holds the project" clause: 1. No `[[ ]]` compare skip: 1. No option device
  exemption: 1. No `nohup.out` write: 1. No heredoc-body substitutions: 1.

### Findings

```
[1] KIND: spec-mismatch
    WHERE: .claude/hooks/reviewer-writes.mjs:60 (tmpRebound), with :733-792 (the messages)
    DEFECT: any mention of the word TMPDIR in the command (a grep pattern, a sed script, a quoted message) turns
            every $TMPDIR into "unknown", and the refusal then blames a cause the command does not have.
    TRIGGER: TMPDIR set and valid, cwd the worktree:
             (a) grep -rn TMPDIR .claude/agents > "$TMPDIR/hits.txt"
             (b) cd "$TMPDIR/probe" && sed -i "" "s/TMPDIR/X/" src/a.ts
    WRONG BEHAVIOUR: (a) is refused as "'"$TMPDIR/hits.txt"' (>) is built at run time (a variable other than
            $TMPDIR …)"; (b) as "'src/a.ts' (sed) is relative to a directory a cd may not have reached (join the cd
            and the write with &&…)", though the cd is joined with &&. The card's Acceptance says the refusal names
            the cause; plan Costs (3) name `${TMPDIR:-…}` but not a bare mention. A reviewer of this card, or of the
            runner follow-up that exports TMPDIR, hits it on the first grep into $TMPDIR.
    CONFIDENCE: confirmed (ran both through guard-bash on the clone; exit 2 with the texts above)
    FIX: narrow the rebind test to the forms that set it (`TMPDIR=`, `export|declare|typeset|local|readonly|read|
         unset … TMPDIR`, `${TMPDIR:=…}`, `for TMPDIR in`), or keep it and say "the command names TMPDIR outside
         $TMPDIR/${TMPDIR}, so it may rebind it" in every refusal it causes. Add (a) and (b) as RW probes.

[2] KIND: correctness
    WHERE: .claude/hooks/reviewer-writes.mjs:62-77, :789 (targets resolved against the disk before the command runs)
    DEFECT: a symlink the same command creates under TMPDIR is not followed, so a write through it is placed under
            TMPDIR while it lands in the worktree.
    TRIGGER: ln -s "<worktree>/src" "$TMPDIR/l2" && sed -i "" 's/^/ /' "$TMPDIR/l2/actions/complete-all.test.ts"
    WRONG BEHAVIOUR: exit 0. Run on the clone, `git status` shows ` M src/actions/complete-all.test.ts`. The plan
            says "every target resolves (symlinks followed) under it"; the out-of-reach list names only a hard link.
    CONFIDENCE: confirmed (ran on the clone)
    FIX: refuse a command that both runs `ln -s`/`ln` (or `cp -s`) and writes under the link's path, or add "a
         symlink made earlier in the same command" to the out-of-reach list (header, hooks.md) with a probe pinning
         the verdict.

[3] KIND: correctness
    WHERE: .claude/hooks/reviewer-writes.mjs:242-246 (lexer) and :645-648 (the `)` handler)
    DEFECT: a `case` pattern's `)` is lexed as a subshell close, so inside `( … )` it restores the cwd saved at `(`.
    TRIGGER: cd "$TMPDIR/probe" && ( cd "<worktree>" && case x in x) touch zz-escape;; esac )
    WRONG BEHAVIOUR: exit 0; the hook places `zz-escape` in $TMPDIR/probe. Run on the clone, `zz-escape` appears at
            the clone's root (the stand-in worktree).
    CONFIDENCE: confirmed (ran on the clone)
    FIX: count `case … in` / `esac` and treat a `)` inside an open case as a pattern end, not a stack pop; probe it.

[4] KIND: correctness
    WHERE: .claude/hooks/reviewer-writes.mjs:670 (assignments skipped) vs :502 (--git-dir/--work-tree refused)
    DEFECT: `GIT_DIR=` / `GIT_WORK_TREE=` prefixes are skipped as plain assignments, while the flags with the same
            effect are refused as unplaceable.
    TRIGGER: GIT_DIR="<worktree git dir>" GIT_WORK_TREE="<worktree>" git -C "$TMPDIR/c" checkout -- src/a.ts
    WRONG BEHAVIOUR: exit 0 (the hook asks `git -C $TMPDIR/c rev-parse` without those variables, so it sees only
            TMPDIR); git then checks out into the worktree and writes its index.
    CONFIDENCE: confirmed for the verdict (ran it); the run-time write traced from git's GIT_DIR/GIT_WORK_TREE rules
    FIX: treat an assignment to GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE, GIT_COMMON_DIR or GIT_OBJECT_DIRECTORY before
         a git write as unplaceable (same message as --git-dir); probe it.

[5] KIND: correctness
    WHERE: .claude/hooks/reviewer-writes.mjs:678 (the wrapper list)
    DEFECT: a launcher outside `command builtin nohup exec nice sudo timeout stdbuf env xargs` hides the writer.
    TRIGGER: /usr/bin/time rm src/a.ts · caffeinate -i rm src/a.ts · pnpm exec rm src/a.ts (TMPDIR valid)
    WRONG BEHAVIOUR: exit 0 for all three; `rm src/a.ts` alone is refused. `nohup` and `timeout` are handled, these
            are not, and the out-of-reach list does not name them ("a program's own writes" is a different class:
            the launcher does not write, it runs a listed writer).
    CONFIDENCE: confirmed (ran the verdicts)
    FIX: add `time` (by path), `caffeinate`, `pnpm exec`/`npx`/`pnpm dlx` to the wrapper list, or name "a writer
         started by a launcher not in the wrapper list" in the out-of-reach list; probe whichever is chosen.

[6] KIND: correctness
    WHERE: .claude/hooks/reviewer-writes.mjs:596-598 (git write = its directory and its git dirs only)
    DEFECT: `git push` from a clone under TMPDIR writes the clone's origin, which is the worktree's repository,
            and the check looks only at the clone.
    TRIGGER: git clone -q . "$TMPDIR/c2" && git -C "$TMPDIR/c2" push origin HEAD:refs/heads/x
    WRONG BEHAVIOUR: exit 0; at run time the push writes objects and `refs/heads/x` into the real repository's git
            dir (a branch that is not checked out, `main` included, would be moved). The reviewer.md text sends the
            reviewer to exactly this clone.
    CONFIDENCE: confirmed for the verdict (ran it); the run-time write traced (a clone of `.` has origin = the
            worktree path)
    FIX: refuse `push` (and `remote add`/`fetch` into a local path is already refused) whatever its directory, as
         the reviewer has no reason to push; probe it.
```

Not a finding: `git worktree add "$TMPDIR/wt" HEAD~1` is refused (it writes the real git dir's `worktrees/`); this
is the stated fail-closed git cost, and `git clone . "$TMPDIR/c"` is allowed in its place. The reviewer's own gate
commands (`pnpm lint && … test:mutation`, `verify-red.sh`, both `git log` test-weakening forms, `git show … >
"$TMPDIR/…"`, `diff <(git show …)`) all pass with a valid TMPDIR.

Finding 1 is the only one an honest probe trips by accident. Findings 2 to 6 each need a command built for it. Each
one, though, breaks a promise the plan or hooks.md makes ("symlinks followed", "--git-dir refused", the
out-of-reach list as the complete list of gaps). Fix them in code, or name them in the out-of-reach list, and pin
each with an RW probe. Either way it is a small change.

Verdict: back to code-writer (dev-lead writes `.claude/` here). Finding 1 needs a code or message fix. For findings
2 to 6, a code fix or an out-of-reach entry both clear them; each needs an RW probe that pins the verdict, landed
as `test(scripts): B1.84 review pass 1 -- …` before the fix.

Riskiest unfalsified: the lexer's `closing()` paren matching for `$( … )` that holds a `case` pattern, a `#`
comment or a heredoc containing `)`. I did not build an input where the early close lets a write escape rather than
refuse. The other unfalsified spot is the plan's stated assumption that the hook's TMPDIR is the Bash tool's
TMPDIR, which no probe here can test.
