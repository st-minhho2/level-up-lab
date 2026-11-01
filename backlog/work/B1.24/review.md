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

## Diff review (pass 1)

Range `origin/main...HEAD` (merge base 588d4b4; the local `main` ref is stale, so `main...HEAD` lists 103 files):
6 files, +464 −15. Commits a9eff38 `test(scripts)`, 13c0dc3 `fix(scripts)`. Bash 3.2 = `/bin/bash`; bash 5.2 =
`docker run bash:5.2` on rule 2 extracted (lines 12–128 with `block`/`json_field` stubbed).

### Command results (last line of each)

| Command                                    | Result                                                                                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                | `All matched files use Prettier code style!`                                                                                                |
| `pnpm typecheck`                           | `tsc --noEmit`, exit 0                                                                                                                      |
| `pnpm test`                                | `Tests  202 passed (202)`                                                                                                                   |
| `pnpm test:e2e`                            | `43 passed (1.2m)`                                                                                                                          |
| `pnpm test:mutation`                       | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                                                              |
| `check-suppressions.sh`                    | `OK: no new suppressions`                                                                                                                   |
| `check-config-change.sh`                   | exit 1: `.claude/docs/hooks.md`, `.claude/hooks/guard-bash.sh` without the label (expected until the PR has `config-change-approved`, D-19) |
| `check-feat-commits.sh`                    | `OK: no feat commit touches tests`                                                                                                          |
| `check-ac-coverage.sh`                     | `OK: every criterion of a shipped section has a test`                                                                                       |
| `check-spec-sections.sh`                   | `OK: sections cited: 1 … 22`                                                                                                                |
| `check-features-map.sh`                    | `OK`                                                                                                                                        |
| `check-plan-scope.sh` / `check-backlog.sh` | `OK: … stays inside the approved plan of B1.24` / `OK: README matches the cards`                                                            |
| `verify-red.sh B1.24`                      | `no 'test(<pkg>): B1.24 … (red)' commit` (exit 0; the plan explains it: verify-red judges only vitest)                                      |
| `scripts/hook-smoke.sh` at HEAD            | `hook-smoke: 369 probes OK`, 0 FAIL                                                                                                         |
| `scripts/hook-smoke.sh` at a9eff38 (copy)  | 41 FAIL with `want 2, "force pushes"`, matching the plan; 3 more FAIL from the copy having no `node_modules`                                |
| rule 2 on bash 3.2 vs bash 5.2             | identical verdicts on 100 commands (45 FORCED, 12 PLAIN, 2 continuations, 41 reviewer probes)                                               |

The caller's three doubts: (a) `[[ A =~ R1 && "${BASH_REMATCH[3]}" =~ R2 ]]` reads R1's groups on 3.2.57 and 5.2.37
(micro-test plus identical verdicts). (b) `tr` lower-casing and the `${CMD//\\$'\n'/}` join behave the same on both
bashes. Reverting the join to `$CMD` makes both continuation probes exit 0, so the probes cover it. (c) The `{` cost:
`git push -u origin "${BRANCH}"`, `git push origin HEAD@{u}` and `git stash push -m "wip: {x}"` exit 2. The plan
states this class.

### Checklist

- Card Acceptance: every spelling the card lists has an exit-2 `probe_msg` asserting "force pushes". `git push`,
  `git push -u origin feat/x` and `scripts/pr-step.sh push` exit 0. The four original probes (line 24) are unchanged.
  The label is pending the PR. **pass**
- No test weakened after red: `git log --first-parent --no-merges a9eff38..HEAD -- '*.test.*' e2e/ scripts/hook-smoke.sh`
  shows only a9eff38, and the branch has no merges. **pass**
- Every changed file is in `plan.md` (6 of 6; `check-plan-scope` OK). **pass**
- Interfaces: input JSON and exit codes unchanged; one message. **pass**
- Zod, Prisma, raw SQL, migration, features-map row: n/a (no `src/`, `prisma/`, no section). No secret, no suppression. **pass**
- Revert probes: removing these lines leaves all 369 probes green, so nothing tests them: the GIT_CONFIG `.push`
  branch of line 51, `/rename`, `deleteref|updateref`, `patch|force` in `GH_REF_WRITE`, and `-l` in `CONFIG_READ`.
  **fail**, see [6]
- The plan says no option before push can hide it, and the doc gives a complete out-of-reach list. Both are
  contradicted by [1]–[5] and [7]. **fail**

### Findings

```
[1] KIND: correctness (regression)
    WHERE: .claude/hooks/guard-bash.sh:39 (W), used by GIT_WORD at :41
    DEFECT: W has no `\`, so a backslash-escaped `\git` is not seen as git. The removed regex had no left boundary and blocked it.
    TRIGGER: `\git push -f origin main` (also `\git push --force`, `\git push origin +main`)
    WRONG BEHAVIOUR: origin/main's hook exits 2 and HEAD exits 0. On a bare remote, `\git push -f -q origin HEAD:main` reset main from "two" to "one".
    CONFIDENCE: confirmed (old and new hook run on the same probe; real git on a bare remote)
```

```
[2] KIND: correctness
    WHERE: .claude/hooks/guard-bash.sh:46 (CONFIG_FORCE), :51 (GIT_CONFIG value)
    DEFECT: the config routes allow only quotes or `\` before the `+`/`:` of a push refspec, not `$'…'`. The push tail allows `$` (`git push origin $'+main'` is a probe).
    TRIGGER: `git config remote.origin.push $'+refs/heads/*:refs/heads/*'`; `git -c remote.origin.push=$'+refs/heads/*:refs/heads/*' push origin`; `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=remote.origin.push GIT_CONFIG_VALUE_0=$'+refs/heads/*:refs/heads/*' git push origin`
    WRONG BEHAVIOUR: all three exit 0. On a bare remote, `git config --get` printed `+refs/heads/*:refs/heads/*` and the following plain `git push` reset main.
    CONFIDENCE: confirmed
```

```
[3] KIND: correctness
    WHERE: .claude/hooks/guard-bash.sh:45, :58 (CONFIG_READ applies to the whole segment)
    DEFECT: a `config --get|--unset|--list|-l` anywhere in the segment, including in a `$( )` or a comment, turns off the config check for the whole segment, including a `-c …mirror=true` on a push.
    TRIGGER: `git -c remote.origin.mirror=true push "$(git config --get branch.main.remote)"`; `git config remote.origin.mirror true # config --get`
    WRONG BEHAVIOUR: both exit 0. On a bare remote the first form ran a mirror push: feat/x deleted, main reset.
    CONFIDENCE: confirmed
```

```
[4] KIND: correctness
    WHERE: .claude/hooks/guard-bash.sh:46 (CONFIG_FORCE matches the literal `mirror`)
    DEFECT: `git remote add` accepts option prefixes, the same as push. The plan covers prefixes for push (`--mir`) but not for `remote add`.
    TRIGGER: `git remote add --mirr=push m <origin-url>` (also `--mi=push`), then a plain `git push m`
    WRONG BEHAVIOUR: exit 0. On a bare remote, `remote.m.mirror=true` was set and the plain push to m deleted feat/x and reset main. Related, plausible (hook exit 0 run, git chain not run): `git clone --mirror <url> /tmp/m`, then a plain `git -C /tmp/m push` after other cards have pushed, deletes their new branches.
    CONFIDENCE: confirmed (abbreviation); plausible (clone --mirror)
```

```
[5] KIND: plan-mismatch
    WHERE: .claude/hooks/guard-bash.sh:59 (tr ';&|' splits before quotes or $( ) are known); comment :33–34; plan "Git options before push are not parsed, so none hides it"
    DEFECT: a `;`, `&` or `|` inside a quoted or substituted option before push puts git and push in different segments, so no check runs.
    TRIGGER: `git -C "$(cd ../repo && pwd)" push -f origin main`; `git -c user.name='a;b' push -f origin main`
    WRONG BEHAVIOUR: exit 0. On a bare remote the `-C "$(cd … && pwd)"` form reset main. Not a regression (origin/main also exits 0), but the comment and plan claim the opposite.
    CONFIDENCE: confirmed
```

```
[6] KIND: coverage
    WHERE: scripts/hook-smoke.sh:59–105 against guard-bash.sh:47, :45, :51
    DEFECT: the plan says the probes cover every route it names, but routes it names have no probe: `…/rename`, `deleteRef`, `updateRef`, a PATCH or force on git/refs, the GIT_CONFIG `.push` refspec form (round 2 item 2) and the `-l` read.
    TRIGGER: delete `|/rename`, `|deleteref|updateref`, `patch|force`, the `|| ( … \.push … )` of line 51, or `|-l` (one at a time, on a copy)
    WRONG BEHAVIOUR: every mutant leaves 0 FORCED misses and 0 PLAIN misses, so `hook-smoke.sh` stays "369 probes OK".
    CONFIDENCE: confirmed (5 sed mutants run against the FORCED and PLAIN lists)
```

```
[7] KIND: correctness (out-of-reach list incomplete)
    WHERE: .claude/hooks/guard-bash.sh:37–38, .claude/docs/hooks.md guard-bash row
    DEFECT: some remote-branch deletes and forced pushes are neither blocked nor named out of reach.
    TRIGGER: `gh pr close 12 --delete-branch` / `gh pr close 12 -d` (`gh pr close --help`: "Delete the local and remote branch after close"); `"$(git --exec-path)/git-push" -f origin main`
    WRONG BEHAVIOUR: exit 0. The doc row reads as if the list of what passes is complete.
    CONFIDENCE: confirmed for the hook verdict; gh's behaviour taken from its help (not run against GitHub)
```

```
[8] KIND: plan-mismatch (unstated false positive)
    WHERE: .claude/hooks/guard-bash.sh:47 (GH_REF_WRITE matches delete|patch|force anywhere after git/refs, and /rename anywhere)
    DEFECT: a read-only `gh api` GET is blocked when the ref or path contains one of those words. The plan's false-positive list names only push-tail cases.
    TRIGGER: `gh api repos/o/r/git/refs/heads/feat/B3.3-delete` (origin has this branch); `gh api repos/o/r/git/refs/heads/feat/B1.24-force-push-spellings`; `gh api repos/o/r/contents/docs/rename.md`
    WRONG BEHAVIOUR: exit 2. origin/main's hook exits 0.
    CONFIDENCE: confirmed
```

Dispositions open to dev-lead: [1]–[5] and [7]: block the form, or name it in the out-of-reach list (comment and hooks.md).
[1] is a regression of today's coverage, so naming it needs the lead. Every form that gets blocked needs a red probe
first. [6] needs probes. [8] needs one line in the plan's cost list, or a narrower match.

Verdict: back to test-writer (red probes for [1]–[6] that dev-lead decides to block, then code-writer)

Riskiest unfalsified: how often blocking any `{` after a push word hits real agent pushes (`git push -u origin
"${BRANCH}"` exits 2, a stated cost). I could not measure its frequency, so it may cost more than the plan assumes.

### Pass 1 dispositions (dev-lead)

| Pass | #   | Finding                                                  | Source   | Kind       | Disposition | Justification                                                                                                                                                                 |
| ---- | --- | -------------------------------------------------------- | -------- | ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | backslash before the git word (regression)               | reviewer | bypass     | fix now     | `\` in the word-start class; probe `\git push -f origin main` (f5c0a55 red, c5b60f3 green)                                                                                    |
| 1    | 2   | `$'…'` config value                                      | reviewer | bypass     | fix now     | `$` in the refspec quote class (config, -c, GIT_CONFIG_VALUE); 2 probes                                                                                                       |
| 1    | 3   | read exemption covers the whole segment                  | reviewer | bypass     | fix now     | exemption only for a whole plain `git config … --get/--unset/--list/-l` (36350ca red, 410c51a green); also closes `… # config --get` from adv1 and lets `--global --get` pass |
| 1    | 4   | `remote add --mirr=push`                                 | reviewer | bypass     | fix now     | `--mi?r?r?o?r?` prefix in the config check, `clone` in the route; probes `--mirr=push`, `clone --mirror`                                                                      |
| 1    | 5   | split ignores quotes and `$( )`                          | reviewer | bypass     | fix now     | "names git" is decided on the whole command, the push tail per segment; probe added                                                                                           |
| 1    | 6   | routes without probes                                    | reviewer | test gap   | fix now     | probes for PATCH/force on git/refs, `--method patch`, branch rename, deleteRef, updateRef, GIT_CONFIG `.push`, `-l`, `--unset`                                                |
| 1    | 7   | `gh pr close --delete-branch`/`-d`, `git-push` binary    | reviewer | bypass     | fix now     | gh pr close/merge with `-d`/`--delete-branch`; `git-push`/`git-send-pack` count as git and push words; probes                                                                 |
| 1    | 8   | read-only gh api paths holding "delete"/"rename" blocked | reviewer | false pos. | fix now     | gh matched on a DELETE/PATCH method or force=true on git/refs, or `branches/…/rename`; exit-0 probes for both paths                                                           |

Stated costs kept (hooks.md row): any `{` after push (`"${BRANCH}"`, `HEAD@{u}`, a stash message with braces), a
remote named `mirror`, a push word followed by `+`/`:` for another reason, quoted command text after `git … push`. Out
of reach kept: curl on the GitHub API, git config files written with an editor tool, variables, aliases.
hook-smoke: 393 probes OK (14 red at the two pass-1 test commits, 12 + 2).
