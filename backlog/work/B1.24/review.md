# B1.24 reviews

## Plan review (round 1)

SCOPE: tooling (`.claude/hooks/guard-bash.sh` rule 2, `scripts/hook-smoke.sh`, `.claude/docs/hooks.md`); no `src/`,
no section. The card's Acceptance (`backlog/plan/E1-todos.md` ### B1.24) is the contract.

Evidence, all run by the reviewer on copies under `$TMPDIR` (bash 3.2.57, macOS):

- `scripts/hook-smoke.sh` at `0b0ce43`: `hook-smoke: 309 probes OK`, 0 FAIL (the plan's baseline holds).
- The current `guard-bash.sh` run on the prototype's `probes.tsv` (30 exit-2, 11 exit-0): `ok=18 bad=23`. The 23 misses
  are exactly the plan's new exit-2 probes minus the three already blocked today (`git status && …`, `… ; … -uf …`,
  `(… -f)`). The plan's "23 FAIL lines" and "309 + 26 + 9 = 344" add up.
- The prototype rule 2 run on the same list: `ok=41 bad=0`.
- The prototype rule 2 run on 61 extra reviewer probes: 14 exit 0 where a forced push or remote delete runs (reasons
  1 to 4), 1 exit 2 on a commit message (the old rule blocks it too; it is not a regression).
- Shell expansion checked with `printf '<%s>'` in bash 3.2 and zsh: `{main,--force}` gives `<main><--force>`,
  `{HEAD:a,+main}` gives `<HEAD:a><+main>`, `$'\x2bmain'` gives `<+main>`, `$'\55\55force'` gives `<--force>`,
  `a \`+newline+`+main` gives `<a><+main>`.

| Check                                                                          | Result                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card's scope                                         | pass: the three files the card names, plus the card's `work/` paperwork                                                                                                                                                                  |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | n/a: no TypeScript; the hook keeps its input (PreToolUse JSON) and exit codes                                                                                                                                                            |
| follows `advice.md` or states the deviation                                    | pass: advisor and spec-analyst skipped (tooling, quick), stated                                                                                                                                                                          |
| ≤ 7 criteria, every Then measurable                                            | pass: 4 Acceptance clauses; each one is an exit code, a message substring or a label                                                                                                                                                     |
| verification lists exact commands with expected numbers                        | pass: 309 → 344 probes, 23 → 0 FAIL, reproduced above                                                                                                                                                                                    |
| work breakdown with convention subjects                                        | pass: `test(scripts)` → `fix(scripts)` → review → PR. No skeleton (bash rule) and no map row (no §). Leaving out `(red)` is explained: `verify-red.sh` only runs vitest on `(red)` commits (line 43). See reason 6 on the `fix(` subject |
| `Lead approves spec` box                                                       | n/a: no section                                                                                                                                                                                                                          |
| no settled D-n contradicted                                                    | pass: D-19 (label named for `.claude/hooks/`, `.claude/docs/`), D-8, D-7 untouched                                                                                                                                                       |
| `scripts/next-task.sh --check B1.24`                                           | pass: `[next-task] B1.24: no overlap with any Doing or Review card`; B1.26 and B1.27 files are not in the Files table                                                                                                                    |

Verdict: changes requested

1. **Line continuation gets past the rule. It can be closed with a text check and is not in the out-of-reach list.**
   Rule 2 splits on newlines before matching, so `\` followed by a newline breaks one command into segments that each
   look harmless. The prototype exits 0 on `git push origin \⏎+main`, `git push \⏎--force origin feat/x` and
   `git \⏎push -f`, and bash runs each one as a single forced push. Agents often write a long push across lines in
   this form. Either remove `\`+newline from the command before splitting and add these three as exit-2 probes, or
   name continuation in the out-of-reach list and in the rule's comment.
2. **Brace expansion and ANSI-C escapes get past the rule. Both can be closed with a text check, and neither is
   named.** `git push origin {main,--force}`, `git push origin {HEAD:refs/heads/tmp,+main}` and
   `git push origin {x,:feat/y}` exit 0, because the `{` allowance in `Q` only covers a brace placed right before the
   `+`/`:`/`-`. `git push origin $'\x2bmain'` and `git push origin $'\55\55force' feat/x` exit 0, because `Q` allows
   `$'` but not an escape that decodes to `+` or `-`. The current out-of-reach list ("a word quoted in pieces") does
   not cover either case. Block a brace group in a push segment that holds `,+`, `,:` or `,-`, and a `$'…\…'` word
   in a push segment, or list both forms as out of reach.
3. **An escaped space in a git option argument gets past the rule.** `git -C a\ b push -f` exits 0: `QARG` reads
   `a\` as the argument, `b` is then neither an option nor `push`, and `GIT_PUSH` fails. The plan only probes the
   quoted form `-C "a b"`. Allow `\`-escaped characters in the unquoted `QARG` branch and add the probe, or state it.
4. **The out-of-reach list and the hooks.md row claim more than the rule covers.** These need no forced spelling at
   push time, and all exit 0 under the prototype:
   - persisted config: `git config remote.origin.mirror true && git push origin`, `git config remote.origin.push
+refs/heads/*:refs/heads/* && git push`, and `git remote add --mirror=push m url && git push m`. The plan blocks
     the same thing passed as `-c`, so this gap sits next to a covered case.
   - other commands that rewrite or delete a remote ref: `git send-pack --force origin refs/heads/main` and
     `gh api -X DELETE repos/o/r/git/refs/heads/feat/x`. `.claude/settings.json` has no deny rule for either.

   The plan has to name these in the out-of-reach list and in the rule's comment, or cover them: `git config` /
   `git remote add` writing `remote.*.mirror`, `remote.*.push` with `+`/`:`, or `--mirror`; `send-pack`; `gh api`
   with `DELETE`/`PATCH` on `git/refs`. Once that is decided, change the planned hooks.md wording "any spelling" to
   say what is covered. The card title ("every … spelling") is otherwise read as a guarantee the hook does not give.

5. **The plan should state a cost for the card's own paperwork.** Any segment holding `git … push` followed later by
   ` +`, ` :`, ` -d`, `--prune`, `--del` or `--mir` is blocked, quoted commit messages included (`git commit -m "guard:
block git push --force"` exits 2 today and with the prototype). Commit and PR text for this card that quotes the
   spellings must go through a file (`git commit -F`, `pr-body.md`), not `-m`. Say so in Steps so the commit step
   does not stall.
6. **The `fix(` PR subject will be counted as a change failure for another card. State it or pick another subject.**
   `scripts/metrics/change-failure-rate.sh` counts a merged `fix(…)` PR as a repair of any Done card whose PR it
   shares a non-doc file with and that merged within 14 days. B1.17 (#60, Done, merged 2026-10-30) changed
   `scripts/hook-smoke.sh`, so a `fix(scripts): B1.24 …` PR merged before 2026-11-13 counts as a repair of B1.17.
   That is a false positive, because rule 2 dates from `b462595`. Either use the `chore(scripts)` subject B1.23 used
   for the same files, or keep `fix(` and note the false positive for `docs/metrics.md`, as the script's header asks.

Riskiest spot, not disproved: the `--`-prefix alternation (`fo?r?c?e?`, `de?l?e?t?e?`, `pr?u?n?e?`) under POSIX
leftmost-longest matching. It matches non-adjacent letter subsets (`--fe`, `--dt`, `--pe`) that git does not accept as
prefixes. That only causes false positives, and none of the 25 legitimate push forms probed (`--porcelain`,
`--progress`, `--push-option`, `--dry-run`, `--follow-tags`, `-4`, `-n`, `-q`, `-v`) hit one.

## Plan review (round 2)

SCOPE: tooling (`.claude/hooks/guard-bash.sh` rule 2, `scripts/hook-smoke.sh`, `.claude/docs/hooks.md`); no `src/`,
no section. The card's Acceptance (`backlog/plan/E1-todos.md` ### B1.24) is the contract.

Evidence. The reviewer ran everything on copies under `$TMPDIR/b124probe/` with bash 3.2.57 on macOS. The revised
prototype is `r2/guard-bash.sh` and the HEAD hook is `cur/guard-bash.sh`.

- `scripts/hook-smoke.sh` at `9f4c50c`: `hook-smoke: 309 probes OK`, 0 FAIL. The baseline holds.
- The plan's own list (38 exit-2, 12 exit-0) run on HEAD: 34 exit-2 misses. HEAD blocks 4 of them already
  (`git status && …`, `… ; … -uf …`, `(… -f)`, continuation `+main`). That gives the plan's 34 FAIL lines on the
  test commit, and 309 + 38 + 12 = 359. On the prototype: 0 misses. `scripts/pr-step.sh push` needs the `cwd` that
  hook-smoke's `pr_cmd` supplies.
- Round-1 lists on the prototype: `probes.tsv` gives `ok=41 bad=0`, and `extra0.tsv` gives `ok=5 bad=0`. On the 61
  round-1 probes, 59 come out as expected. The other 2 are the ones the plan now names: a real newline before
  `+main` passes, and a `-m` message is blocked.
- Round-1 reasons: 1 applied (continuations joined, all 3 probes block). 2 partly applied (see reason 1 below).
  3 applied (`-C a\ b`). 4 partly applied (see reasons 3 to 5). 5 applied (`git commit -F`, `pr-body.md`).
  6 applied (`chore(scripts)` subject).
- 47 new round-2 probes (`adv2.js`, `adv3.tsv`, `adv4.js`). 31 should block and 28 of them exit 0. 16 should pass
  and 5 of them exit 2; HEAD also blocks 1 of those 5 (a `gh pr create --title` that names a force push). The reviewer
  also ran a local bare remote (`$TMPDIR/b124probe/realgit.sh`, no network) to confirm that git really forces or
  deletes on the forms in reasons 2 to 4.
- Speed: a 20,000-character command, 60 `-c` options and 40 `-C a\ b` options each finish in under 1 s.

| Check                                                                          | Result                                                                                                                                               |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card's scope                                         | pass: the three files the card names, plus `work/B1.24/` paperwork                                                                                   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | n/a: no TypeScript; PreToolUse JSON in, exit 0/2 out, unchanged                                                                                      |
| follows `advice.md` or states the deviation                                    | pass: advisor and spec-analyst skipped (tooling, quick), stated                                                                                      |
| ≤ 7 criteria, every Then measurable                                            | pass: 4 Acceptance clauses, each an exit code, a stderr substring or a label                                                                         |
| verification lists exact commands with expected numbers                        | pass: 359 probes; 34 then 0 FAIL lines; reproduced above                                                                                             |
| work breakdown with convention subjects                                        | pass: `test(scripts)` → `fix(scripts)` → reviewer diff → PR `chore(scripts)`. No skeleton or map row (no §). The missing `(red)` marker is explained |
| `Lead approves spec` box                                                       | n/a: no section                                                                                                                                      |
| no settled D-n contradicted                                                    | pass: D-19 label named for `.claude/hooks/` and `.claude/docs/`; D-7 and D-8 untouched                                                               |
| `scripts/next-task.sh --check B1.24`                                           | pass: `[next-task] B1.24: no overlap with any Doing or Review card`; the B1.26 and B1.27 files are not in the Files table                            |

Verdict: changes requested

1. **A brace list next to a dash, or a `${…}` default, still gets past the rule. The plan claims brace lists are
   covered, and neither form is in the out-of-reach list.** The prototype exits 0 on `git push origin
--{force,verbose} feat/x`, `git push origin --{force,} feat/x`, `git push origin -{f,q} feat/x`,
   `--{delete,verbose}`, `--{mirror,verbose}`, `git push origin ${X:-+main}` and `${X:---force}`. In bash 3.2,
   `printf '<%s>'` shows they become `<--force><-->`, `<-f><-q>` and `<--force>`. On the bare remote,
   `--{force,verbose} main` and `${X:-+main}` each replaced a diverged `main`. The cause is that `PUSH_FORCE` needs
   `-`, `+` or `:` right after a space, `{` or `,` (plus `Q`). A brace list placed after the dash, or a `${X:-`
   operator in front of the value, never fits that shape. Fix: in a push segment, block any `{…,…}` group and any
   `${…:-|:+|-|+…}` whose word starts with `+`, `:` or `-`. Add 3 probes. Or name both forms in the out-of-reach list.
2. **Saved-config routes match case-sensitively, and git config keys are case-insensitive. The env form of `-c` is
   not covered either.** These exit 0: `git config remote.origin.MIRROR true`, `git config remote.origin.Push
+refs/heads/*:refs/heads/*`, `git -c remote.origin.Mirror=true push origin`,
   `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=remote.origin.mirror GIT_CONFIG_VALUE_0=true git push origin`, the same with
   `KEY_0=remote.origin.push VALUE_0=+refs/heads/*:refs/heads/*`, and `GIT_CONFIG_PARAMETERS="'remote.origin.mirror'='true'" git push origin`.
   On the bare remote, `git config --get remote.origin.mirror` printed `true` after the `MIRROR` write. The plain
   `git push origin` that followed deleted `feat/x` on the remote. The `GIT_CONFIG_COUNT` push-refspec form replaced
   a diverged `main`. `scripts/pr-step.sh` line 11 already unsets `GIT_CONFIG_*` for this reason. Fix: match
   `CONFIG_FORCE` case-insensitively (`shopt -s nocasematch` exists in bash 3.2), check `GIT_CONFIG_*` and
   `GIT_CONFIG_PARAMETERS` prefixes in a push segment, and add 3 probes. Or name both gaps.
3. **The prototype stops blocking 4 forms that the hook blocks today, and the plan does not state it.** The prototype
   checks only the leftmost `git … push|send-pack|config|remote` in a segment. When that match is `config` or
   `remote`, its `.*$` swallows the rest of the segment, and the push check is skipped (the `if … config|remote …
else` branch). HEAD exits 2 and the prototype exits 0 on `URL=$(git remote get-url origin) git push --force
origin main`, `b=$(git config --get branch.main.remote) git push -f`, `echo "$(git config user.name)" "$(git push
--force)"` and ``git remote show origin `git push origin +main` ``. The first two shapes come up in real agent
   commands. Fix: run the push check on every `git … push|send-pack` in the segment, independent of the config
   check, or also split on `(` and a backtick as rule 5 does. Add the first two as exit-2 probes so the old
   coverage is pinned.
4. **Some quoted or substituted words before `push` still get past the rule.** These exit 0: `"git" push -f`,
   `'git' push -f`, `git -C $(git rev-parse --show-toplevel) push -f` (an unquoted substitution with a space as the
   `-C` argument) and `git -C $'a b' push -f`. On the bare remote, `"git" push origin --delete feat/y` deleted the
   branch. The plan covers `git "push" -f`, so a quoted `git` sits right next to a covered case. It is not "a word
   quoted in pieces". Allow `["']?git["']?` in `GIT_REF_WRITE`, and accept `$(…)` and `$'…'` in `QARG`, or name these
   forms.
5. **The out-of-reach list should name the remaining routes, so the hooks.md row and the rule's comment do not claim
   more than the rule covers.** All of these exit 0 under the prototype, and none appears in the plan:
   - `gh repo sync <repo> --branch <b> --force`. gh documents it as a hard reset of the destination branch.
   - `gh api -X POST repos/o/r/branches/<b>/rename -f new_name=…`. It moves another card's branch name away.
   - `gh api -X delete …/git/refs/…` (lower-case method).
   - `curl -X DELETE …/git/refs/…`.
   - A write to `.git/config`, by `printf … >> .git/config` or the Edit tool, followed by a plain `git push`.

   Naming them in one line is enough. Covering them is the plan's choice. The `gh` items are plausible: they were
   traced, not run against GitHub.

6. **New false positives are a cost, and the plan does not state them.** HEAD exits 0 and the prototype exits 2 on
   `git config --get remote.origin.mirror`, `git config --unset remote.origin.mirror` (the agent cannot inspect or
   undo a mirror setting), `git push origin "v$(date +%Y)"` (a `+` after a space inside a substitution) and
   `git config user.name "a=:b"`. Either limit `CONFIG_FORCE` to writes (not `--get`, `--get-regexp`, `--unset`,
   `--list`) or list these next to "Still blocked as before this card".

Riskiest spot, not disproved: `GIT_REF_WRITE`'s option parse can read `push` as the argument of an earlier option.
`git -P push remote --force` exits 0, because `-P push` is read as an option with its value and `remote` as the
subcommand. A force needs a remote literally named `remote` or `config`, so no realistic input was found.

## Round 2 dispositions (dev-lead)

Plan round 3 applies them; prototype re-run on every reviewer probe list (adv, adv2, adv3, adv4, plan) and the plan's 60
probes: 0 misses except the ones stated below. Not re-reviewed: the 2-round cap is reached, the lead decides.

1. Fix now: any `{` after the push word blocks (brace lists anywhere in a word, `${X:-…}`).
2. Fix now: saved-config checks run on the lower-cased text; a `GIT_CONFIG_*` variable anywhere in the command that
   sets a mirror or a `.push` key with a `+`/`:` value blocks.
3. Fix now: no option parsing and no leftmost-subcommand branch; the tail after the segment's first push word is
   checked whenever the segment names git, and the config check runs independently.
4. Fix now: a quoted or path git word counts; options are not parsed, so `-C $(…)` and `-C $'a b'` cannot hide push.
5. Partly: lower-case `gh api -X delete`, `…/rename` and `gh repo sync --force` are covered; `curl` on the GitHub API
   and writing `.git/config` directly are named out of reach (plan and hooks.md).
6. Stated in the plan: `git config --get/--unset` pass again; `git config user.name "a=:b"` passes (the generic `=+`/`=:`
   check is gone); `git push origin "v$(date +%Y)"` and quoted command text after `git … push` stay blocked.
