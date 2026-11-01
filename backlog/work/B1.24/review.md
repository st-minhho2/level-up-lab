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

## Diff review (pass 2)

Range `origin/main...HEAD` (merge base 588d4b4): 6 files, +649 −15 (hooks.md, guard-bash.sh, hook-smoke.sh, plan,
pr-body, review). Pass 1 commits f5c0a55, c5b60f3, 36350ca, 410c51a, 1b4e90c. Hook verdicts below come from the HEAD
hook (a copy) run through its real JSON input. Verdicts are compared with `origin/main` and with 13c0dc3 (the hook
pass 1 reviewed). Bash 3.2 = `/bin/bash`; bash 5.2 = `docker run bash:5.2` on rule 2 extracted. Real git: a scratch
bare remote with `main`=two and `feat/x`=two, and a clone reset to one.

### Command results (last line of each)

| Command                                    | Result                                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                | `All matched files use Prettier code style!` (1 warning, `src/components/todo-form.tsx:23`, not in this diff) |
| `pnpm typecheck`                           | `tsc --noEmit`, exit 0                                                                                        |
| `pnpm test`                                | `Tests  202 passed (202)`                                                                                     |
| `pnpm test:e2e`                            | `43 passed (51.6s)`                                                                                           |
| `pnpm test:mutation`                       | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                                |
| `check-suppressions.sh`                    | `OK: no new suppressions`                                                                                     |
| `check-config-change.sh`                   | exit 1: `.claude/docs/hooks.md`, `.claude/hooks/guard-bash.sh` (expected until the PR has the D-19 label)     |
| `check-feat-commits.sh`                    | `OK: no feat commit touches tests`                                                                            |
| `check-ac-coverage.sh`                     | `OK: every criterion of a shipped section has a test`                                                         |
| `check-spec-sections.sh`                   | `OK: sections cited: 1 … 22`                                                                                  |
| `check-features-map.sh`                    | `OK`                                                                                                          |
| `check-plan-scope.sh` / `check-backlog.sh` | `OK: … stays inside the approved plan of B1.24` / `OK: README matches the cards`                              |
| `verify-red.sh B1.24`                      | `no 'test(<pkg>): B1.24 … (red)' commit` (the plan explains it: verify-red judges only vitest)                |
| `scripts/hook-smoke.sh`                    | `hook-smoke: 393 probes OK`, 0 FAIL                                                                           |
| earlier probe lists at HEAD                | see "Regressions of earlier probes" below                                                                     |
| rule 2, bash 3.2 vs 5.2                    | identical verdicts on 127 commands (pass-1 lists plus the 29 below)                                           |

### Pass 1 dispositions: do they hold?

| #   | Disposition                                  | Holds?                                                                                                  |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | `\` before git                               | yes: `\git push -f origin main` exits 2                                                                 |
| 2   | `$'…'` config value                          | yes: all three triggers exit 2                                                                          |
| 3   | exemption only for a whole plain config read | **no**: a `$( )` or backtick word inside the "plain" read still exempts the segment, see [2]            |
| 4   | `--mirr=push`, `clone --mirror`              | yes                                                                                                     |
| 5   | names git on the whole command               | yes for the pass-1 triggers, but the change creates the regression in [1] and the false positive in [6] |
| 6   | probes for the unprobed routes               | yes (mutants below)                                                                                     |
| 7   | `gh pr close -d`, `git-push` binary          | partly: `-d` passes when it is clustered, quoted, or comes after a flag placed before `pr`, see [5]     |
| 8   | read-only gh api paths pass                  | yes, but narrowing the method match let `-iX DELETE` through, see [4]                                   |
| —   | "Stated costs kept (hooks.md row)"           | **no**: the row states 2 of the 4 costs listed, see [6]                                                 |

**Regressions of earlier probes.** I re-ran round-1/2 lists `adv`, `adv2`, `adv4`, `plan`, `probes.tsv`, `adv3`,
`extra0` and the pass-1 lists `forced`, `plain`, `adv`, `reg`, `adv1` at HEAD. No probe that wanted exit 2 went to
exit 0, apart from the forms the plan states:

- a real newline;
- `curl`, which is out of reach;
- `git commit -m "… git push --force"`, `"v$(date +%Y)"` and `gh pr create --title "… --force"`, stated false
  positives;
- `scripts/pr-step.sh push`, which the runner calls from a non-top-level cwd.

### Checklist

- Card Acceptance: every listed spelling exits 2 with the message. Plain `git push`, `push -u origin feat/x` and
  `scripts/pr-step.sh push` exit 0, and the original probes stay. **pass**, except the regression in [1]: invariant
  6, which the card closes, gets weaker for `;git` forms that origin/main blocks.
- No test weakened: `git diff a9eff38 HEAD -- scripts/hook-smoke.sh` deletes only the 10 B1.23 pr-step lines. f5c0a55
  re-adds them unchanged above the B1.24 block, and its body says so. No `fix(` commit touches hook-smoke.sh, and the
  branch has no merges. **pass**
- Every changed file is in `plan.md` (6 of 6). Interfaces, input JSON and exit codes are unchanged. **pass**
- Zod, Prisma, raw SQL, migration, features-map: n/a. No secret, no suppression. **pass**
- Revert probes: 10 mutants of pass-1 lines were each run through the full `hook-smoke.sh` in a clone, where the
  baseline already has 1 unrelated FAIL (`require-review.sh spoke on a clean tree`, caused by the symlinked
  node_modules). Each mutant either removes one pass-1 change or switches off one gate:

  | Mutant                    | FAIL (baseline 1) |
  | ------------------------- | ----------------- |
  | `\` removed from W        | 2                 |
  | `-push`/`-send-pack` word | 2                 |
  | config `$`                | 3                 |
  | `--mi` prefix             | 2                 |
  | `clone` route             | 2                 |
  | read-only anchor          | 2                 |
  | gh pr close               | 3                 |
  | gh api gate off           | 8                 |
  | names_git gate off        | 1 (survives)      |
  | GIT_CONFIG_VALUE `$`      | 1 (survives)      |

  **fail** on the last two, see [7].

- The comment and hooks.md match the code: **fail**. The comment says "a command that names git anywhere", and
  [1] contradicts it. The comment says "a plain `git config … --get`", and [2] contradicts it. The out-of-reach list
  is still incomplete, [3]. The costs claimed in the dispositions are missing from hooks.md, [6].
- `pr-body.md` still says "369 probes OK" and "47 exit-2 probes". At HEAD the counts are 393 probes, 64 exit-2 (62 listed plus 2 continuations) and 19 exit-0. This is not a
  finding, but dev-lead must update it before the PR.

### Findings

```
[1] KIND: correctness (regression, introduced by c5b60f3)
    WHERE: .claude/hooks/guard-bash.sh:42 (W has no ; & |), :60 (names_git on the joined command), :67
    DEFECT: "names git" now runs before the split, on the whole command. W allows only ^ space " ' ( ` / = \ before
            git, so a git right after ; & or | is not seen. With no other git word in the command, rule 2 skips
            every segment.
    TRIGGER: `true;git push -f origin main`, `cd ..;git push --force origin main`, `true&&git push origin +main`,
             `echo x|git push -f`, `true;git config remote.origin.mirror true`, `true;git remote add --mirror=push m url`
    WRONG BEHAVIOUR: HEAD exits 0 on all six. origin/main exits 2 on the first, second, third and fifth (four
             push forms). 13c0dc3 exits 2 on all six. Real git: `true;git push -f -q origin HEAD:main` reset the
             remote main from two to one. No hook-smoke probe puts a separator directly before git.
    CONFIDENCE: confirmed (three hook versions on the same input; real git on a bare remote)
```

```
[2] KIND: correctness (pass-1 [3] disposition does not hold)
    WHERE: .claude/hooks/guard-bash.sh:48 (CONFIG_READ_ONLY words `[^[:space:]#]+`), :69
    DEFECT: the "whole plain read" accepts any non-space word, including `$(`, `"$(` and backticks. A config write or
            a `-c …mirror=true` push inside a substitution after `git config --get` therefore turns off the config
            check for the whole segment.
    TRIGGER: `git config --get x "$(git -c remote.origin.mirror=true push origin)"`;
             `git config --get x $(git config remote.origin.mirror true)` (also with backticks, `--unset`,
             `$(git remote add --mirror=push m url)`, `$(git config remote.origin.push +refs/heads/*:refs/heads/*)`)
    WRONG BEHAVIOUR: all exit 0, the same as at 13c0dc3. Real git: the first form ran a mirror push in one command,
             which deleted feat/x and reset main to one. The second form left `remote.origin.mirror=true` in the
             clone, so the next plain `git push` (which exits 0 at the hook) mirrors.
    CONFIDENCE: confirmed
```

```
[3] KIND: correctness (route neither blocked nor named out of reach)
    WHERE: .claude/hooks/guard-bash.sh:47 (CONFIG_ROUTE needs a W before `config`; `-` is not in W), comment :32–38, hooks.md row
    DEFECT: `git --config-env=<key>=<ENV>` (git ≥ 2.31) sets inline config the way `-c` does, but nothing matches
            it. The plan lists the config routes as git config, remote, -c and GIT_CONFIG_*, and the out-of-reach
            list does not name --config-env. A related form is plausible: `${IFS}` between words
            (`git${IFS}push${IFS}-f`). It exits 0 here and on origin/main. It is not named, unless "a command built
            at run time" is meant to cover it.
    TRIGGER: `V=true git --config-env=remote.origin.mirror=V push origin` (also `--config-env remote.origin.mirror=V`)
    WRONG BEHAVIOUR: exit 0. Real git 2.39.5: feat/x deleted and main reset to one on the bare remote.
    CONFIDENCE: confirmed (--config-env); plausible (${IFS}: hook verdict run, git not run)
```

```
[4] KIND: correctness (regression of pass-1 [8]'s narrowing, against 13c0dc3)
    WHERE: .claude/hooks/guard-bash.sh:51 (GH_WRITE_METHOD `(-x|--method)` needs `-` directly before x)
    DEFECT: gh (pflag) accepts a bool shorthand clustered before -X, so the method flag does not start with `-x`.
    TRIGGER: `gh api -iX DELETE repos/o/r/git/refs/heads/feat/x`, `gh api -iXDELETE repos/o/r/git/refs/heads/feat/x`
    WRONG BEHAVIOUR: exit 0 (13c0dc3: exit 2). gh 2.103.2 with GH_DEBUG=api against an unresolvable host prints
             `> DELETE /api/v3/repos/o/r/git/refs/heads/feat/x`, so the request is a branch delete. `-zX` is
             rejected as an unknown flag.
    CONFIDENCE: confirmed (hook verdict; gh parse; not sent to GitHub)
```

```
[5] KIND: correctness (pass-1 [7] disposition holds only for the exact spelling)
    WHERE: .claude/hooks/guard-bash.sh:53 (GH_BRANCH_DELETE: `gh[[:space:]]+pr` and an unquoted `[[:space:]](-d|--delete-branch)`)
    DEFECT: a clustered `-d`, a quoted `-d`, or a flag placed before `pr` slips past the regex. gh parses all three.
    TRIGGER: `gh pr close 7 -dc bye`; `gh pr close 7 "-d"` (also `'--delete-branch'`); `gh -R o/r pr close 7 -d`
    WRONG BEHAVIOUR: exit 0. Against an unreachable host, gh accepted every form and failed only at the network step.
             The control `-zc` / `-z` is rejected with "unknown shorthand flag". `gh pr close --help`: -d deletes
             the local and remote branch.
    CONFIDENCE: confirmed (hook verdict, gh parse); remote delete not run against GitHub
```

```
[6] KIND: plan-mismatch (stated costs)
    WHERE: .claude/docs/hooks.md:11 guard-bash row; review.md "Stated costs kept (hooks.md row)"; guard-bash.sh:60, :53
    DEFECT: the dispositions say the row states four costs, but it names only `{` and a remote named mirror. Three
            other costs appear nowhere: a push word followed by +/: for another reason, quoted command text after
            git … push, and a stash message with braces. Pass 1 also added false positives that no doc states.
    TRIGGER: `git status && docker push -d img` (exit 2; 13c0dc3: 0, because names_git now spans segments);
             `git stash push -- ':(exclude)x'` (exit 2); `gh pr close 7 -c "fix -d later"` and
             `gh pr merge 7 --squash --delete-branch=false` (exit 2; 13c0dc3: 0);
             `git log -1 && echo "push -f"` (exit 2; 13c0dc3: 0)
    WRONG BEHAVIOUR: these commands are blocked with the force-push message, and nothing a session reads explains why.
    CONFIDENCE: confirmed (grep of hooks.md; hook verdicts run)
```

```
[7] KIND: coverage
    WHERE: scripts/hook-smoke.sh FORCED/PLAIN lists against guard-bash.sh:58 (GIT_CONFIG value class `$`) and :67 (names_git gate)
    DEFECT: two pass-1 behaviours have no probe. Pass-1 disposition [2] says `$` was added for GIT_CONFIG_VALUE too,
            but no probe uses a `$'…'` GIT_CONFIG value. No exit-0 probe needs the "names git" gate either.
    TRIGGER: delete `\$` from `=[\"\'\\$]*[+:]` on :58, or replace `[[ $names_git -eq 1 ]] || continue` with `true` (on a copy)
    WRONG BEHAVIOUR: hook-smoke stays at its baseline (1 unrelated FAIL in the clone) for both mutants. The first
             mutant passes `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=remote.origin.push GIT_CONFIG_VALUE_0=$'+refs/heads/*:refs/heads/*' git push origin`
             (HEAD: exit 2, mutant: exit 0).
    CONFIDENCE: confirmed
```

Answers to the caller's three doubts:

- Anchored CONFIG_READ_ONLY: the anchor fixes the `# config --get` and push-segment forms. Its word class lets
  substitutions in, [2].
- names_git on the whole command: it closes pass-1 [5], but it has two costs. The regex has no `;&|` boundary, which
  causes the regression in [1]. Unrelated segments now trigger the push check, [6] (`docker push -d`,
  `echo "push -f"`).
- GH_BRANCH_DELETE `-d`: it blocks comments and `--delete-branch=false`, [6], and misses clustered, quoted or
  flag-first spellings, [5]. `gh pr merge` is also in `permissions.deny`, so the `merge` half mostly protects nothing
  new.

Verdict: back to test-writer. [1]–[5] each need an exit-2 probe that is red first, or dev-lead names the form in the
out-of-reach list. [1] and [4] are regressions, so naming them out of reach needs the lead. [6] needs the costs in
the row, or narrower matches with exit-0 probes. [7] needs two probes: an exit-2 probe for a `$'…'` GIT_CONFIG value,
and an exit-0 probe for a non-git push word in a command that names no git. Then code-writer. Pass 3 is the last
pass.

Riskiest unfalsified: other characters that can come right before a command word and are missing from W, the same
class as [1]. These are covered: `{ `, `( `, `$(`, backticks, `! `, `time `, `while `, `sudo`, `env`, tabs and
newlines. `true &git push -f` exits 0, which is [1] again. I did not enumerate every bash grammar position.

### Pass 2 dispositions (dev-lead)

| Pass | #   | Finding                                          | Source   | Kind     | Disposition            | Justification                                                                                                                                                                                                                |
| ---- | --- | ------------------------------------------------ | -------- | -------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2    | 1   | no `; & \|` before git (regression)              | reviewer | bypass   | fix now                | `; & \|` in the word-start class; probes `true;git …`, `echo x\|git …`, `true &git …` (05157cf red, 0e631e7 green)                                                                                                           |
| 2    | 2   | plain-read exemption accepts `$( )`/backticks    | reviewer | bypass   | fix now                | exemption words exclude `$`, backtick and `(`; 2 probes                                                                                                                                                                      |
| 2    | 3   | `--config-env`; `${IFS}`-joined words            | reviewer | bypass   | fix now / out of scope | `--config-env` is a config route (probe); `${IFS}` named out of reach in the rule comment and hooks.md (a text check cannot expand it)                                                                                       |
| 2    | 4   | `gh api -iX DELETE` (regression)                 | reviewer | bypass   | fix now                | method flag may sit in a short cluster; probe                                                                                                                                                                                |
| 2    | 5   | `gh pr close -dc`, `"-d"`, `gh -R … pr close -d` | reviewer | bypass   | fix now                | gh global flags may come first; `-d` in a cluster or quoted; 3 probes                                                                                                                                                        |
| 2    | 6   | stated costs incomplete in hooks.md              | reviewer | doc      | fix now                | hooks.md row lists every false positive found (braces, `+`/`:`/`-d` after any push word once git is named, quoted command text, remote named mirror, `git config get/unset`, gh comment with ` -d`, `--delete-branch=false`) |
| 2    | 7   | 2 surviving mutants                              | reviewer | test gap | fix now                | probes: `$'…'` GIT_CONFIG_VALUE (exit 2), `docker push -d …` with no git (exit 0)                                                                                                                                            |

Reviewer pass-2 list (`p2/new.txt`): sections A–D all exit 2; E (`${IFS}`) exit 0, out of reach; F false positives, stated.
Earlier lists: only the stated misses remain. pr-body counts are refreshed at Loop 9. hook-smoke: 405 probes OK.

## Diff review (pass 3)

Range `origin/main...HEAD` (merge base 588d4b4): 6 files, +878 −15. Pass 2 commits 05157cf (`test`, +12 lines in
hook-smoke.sh, 0 removed), 0e631e7 (`fix`), 41ad3c7 (dispositions). Hook verdicts come from copies of three hook
versions run through their real JSON input: HEAD, 410c51a (the hook pass 2 reviewed) and origin/main. Real git: a
scratch bare remote with `main`=two and `feat/x`=two, and a clone reset to one (git 2.39.5). gh 2.103.2 was pointed at
an unreachable host, so it only parsed the commands and nothing was sent. `⏎` stands for a real newline.

### Command results (last line of each)

| Command                                    | Result                                                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                | `All matched files use Prettier code style!`                                                              |
| `pnpm typecheck`                           | `tsc --noEmit`, exit 0                                                                                    |
| `pnpm test`                                | `Tests  202 passed (202)`                                                                                 |
| `pnpm test:e2e`                            | `43 passed (49.8s)`                                                                                       |
| `pnpm test:mutation`                       | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                            |
| `check-suppressions.sh`                    | `OK: no new suppressions`                                                                                 |
| `check-config-change.sh`                   | exit 1: `.claude/docs/hooks.md`, `.claude/hooks/guard-bash.sh` (expected until the PR has the D-19 label) |
| `check-feat-commits.sh`                    | `OK: no feat commit touches tests`                                                                        |
| `check-ac-coverage.sh`                     | `OK: every criterion of a shipped section has a test`                                                     |
| `check-spec-sections.sh`                   | `OK: sections cited: 1 … 22`                                                                              |
| `check-features-map.sh`                    | `OK`                                                                                                      |
| `check-plan-scope.sh` / `check-backlog.sh` | `OK: … stays inside the approved plan of B1.24` / `OK: README matches the cards`                          |
| `verify-red.sh B1.24`                      | `no 'test(<pkg>): B1.24 … (red)' commit` (the plan explains it: verify-red judges only vitest)            |
| `next-task.sh --check B1.24`               | `B1.24: no overlap with any Doing or Review card`                                                         |
| `scripts/hook-smoke.sh`                    | `hook-smoke: 405 probes OK`                                                                               |
| rule 2, bash 3.2 vs bash 5.2               | identical verdicts on 354 commands (smoke lists, every earlier reviewer list, the pass-3 probes)          |

### Pass 2 dispositions: do they hold?

| #   | Disposition                                       | Holds?                                                                                                                                             |
| --- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `; & \|` before git                               | yes. All 7 triggers exit 2, including `true \|\| git push origin :feat/x` and `true;git remote add --mirror=push m url`                            |
| 2   | plain-read exemption refuses `$`, backtick, `(`   | yes. All 5 triggers exit 2. The backtick and `(` exclusions have no probe, see [4]                                                                 |
| 3   | `--config-env` route; `${IFS}` named out of reach | yes. Both `--config-env` forms exit 2. `${IFS}` is named in the comment and in hooks.md. The `config-env…\.push` alternative has no probe, see [4] |
| 4   | `gh api -iX DELETE`                               | yes, `-iX DELETE` and `-iXDELETE` both exit 2                                                                                                      |
| 5   | `gh pr close -dc`, `"-d"`, `gh -R … pr close -d`  | yes for those 4 spellings. **no** for `-d` or `--delete-branch` placed before the PR number, see [2]                                               |
| 6   | every stated false positive in hooks.md           | yes. All 7 pass-2 F commands exit 2 and each is named in the row. The pass-2 fix adds one false positive the row does not state, see [5]           |
| 7   | probes kill the two surviving mutants             | yes. With `$` removed from the GIT_CONFIG value class, or with the names_git gate switched off, a smoke probe now fails                            |

**Earlier probe lists at HEAD.** I re-ran 233 distinct commands: rounds 1–2 (`$TMPDIR/b124probe` adv, adv2, adv3,
adv4, plan, probes, extra0) and passes 1–2 (scratchpad adv1, reg, final, b5/*, p2/a, d, new, m, r) on all three hooks.
Only 2 commands exit 0 at HEAD where an earlier hook exited 2. Both are expected: `xgit push -f` is not git (origin/main
had no left boundary), and `git push origin⏎+main` is the plan's stated "two commands". All 5 commands that passed
at 410c51a and that origin/main blocks now exit 2. The 63 commands that exit 0 on all three hooks are plain pushes or
reads, plus the forms the docs name out of reach (`${IFS}`, `curl`).

### Checklist

- Card Acceptance: every listed spelling exits 2 with the message. `git push`, `git push -u origin feat/x` and
  `scripts/pr-step.sh push` exit 0, and the four original probes are unchanged. **pass**, but invariant 6 is weaker
  than on origin/main for the form in [1].
- No test weakened. `git log --first-parent --no-merges a9eff38..HEAD -- '*.test.*' e2e/ scripts/hook-smoke.sh` lists
  only the three `test(scripts)` commits, which add lines and remove none (05157cf: +12 −0). The branch has no merges. **pass**
- Every changed file is in `plan.md` (6 of 6). The input JSON and the exit codes are unchanged. **pass**
- Zod, Prisma, raw SQL, migration, features-map: n/a. No secret, no suppression. **pass**
- Revert probes. 19 mutants were run against the smoke FORCED (73) and PLAIN (20) lists. Each mutant reverts one
  pass-2 change or drops one character from a class. 15 are killed: removing `;`, `&` or `|` from W, the read-only
  word class, the `--config-env` route or its `=`, the clustered `-iX`, gh global flags before `pr`, and the quoted
  `-d`. 4 survive, and each one changes a real verdict: **fail**, see [4]. A fifth survivor, `-[a-z]*d` → `-d`, is
  equivalent, because `-d` with no terminator already matches `-dc`.
- The comment and hooks.md match the code: **fail**. Both claim `gh pr close` with `-d` is blocked, but [2] passes.
  Neither names [1] or [3] out of reach.
- pr-body.md and the plan's Verification still say "369 probes OK", "41 FAIL", 47 exit-2 and 13 exit-0. At HEAD the
  counts are 405 probes, 73 FORCED + 2 continuation probes, and 20 PLAIN + 1 pr-step. This is not a finding, but
  dev-lead refreshes them before the PR (already planned at Loop 9).

### Findings: regressions against origin/main (the lead must see these)

```
[1] KIND: correctness (regression against origin/main)
    WHERE: .claude/hooks/guard-bash.sh:71 (segments split on every newline), :69 (PUSH_TAIL read per segment)
    DEFECT: a newline inside a `$( )` or a heredoc does not end the push command, but the hook splits there, so a
            flag or refspec on a later line is checked in a segment that has no push word.
    TRIGGER: `git push origin "$(cat <<'X'⏎+main⏎X⏎)"`; `git push origin main $(cat <<'X'⏎-f⏎X⏎)`;
             also, not a regression because origin/main misses it too: `git push origin "$(cat <<'X'⏎:feat/x⏎X⏎)"`
    WRONG BEHAVIOUR: HEAD and 410c51a exit 0. origin/main exits 2 on the first two, because its `[^;&|]*` spans
             newlines. Real git: the first two forced main from two to one ("forced update"), and the third deleted
             feat/x. The plan accepts only "a real newline (`git push origin⏎+main` is two commands)". These forms are
             one command, and no doc names them out of reach.
    CONFIDENCE: confirmed (three hook versions; real git on a bare remote)
```

### Findings: new gaps in coverage the card adds (none is a regression)

```
[2] KIND: plan-mismatch (doc claims coverage the code lacks)
    WHERE: .claude/hooks/guard-bash.sh:54 (GH_BRANCH_DELETE `close[[:space:]].*[[:space:]]…` needs a word between
           `close` and the flag); comment :39–40; hooks.md guard-bash row "gh pr close/merge with -d or --delete-branch"
    DEFECT: the regex needs two separate spaces between `close` and the flag, so a flag written right after `close` is
            never seen.
    TRIGGER: `gh pr close -d 7`; `gh pr close --delete-branch 7` (also `gh pr merge -d 7`, which `permissions.deny` stops)
    WRONG BEHAVIOUR: exit 0 on all three hooks. gh parsed both close forms and failed only at the network step (the
             control `-z` gets "unknown shorthand flag"). `gh pr close --help`: -d deletes the local and remote branch.
    CONFIDENCE: confirmed (hook verdict, gh parse); remote delete not run against GitHub
```

```
[3] KIND: correctness (gap not named out of reach)
    WHERE: .claude/hooks/guard-bash.sh:71 (tr ';&|' splits inside quotes), :63–69 (gh and push checks per segment)
    DEFECT: a `;`, `|`, `&` inside a quoted argument after `push` or `gh api` moves the following words into a
            segment with no push or gh word. Pass 1 [5] fixed this for options before push, not after.
    TRIGGER: `git push -o "a;b" -f origin main`; `git push -o 'a|b' origin +main`;
             `gh api repos/o/r/git/refs/heads/feat/x --jq '.a | .b' -X DELETE`; `gh pr close 7 -c "a;b" -d`
    WRONG BEHAVIOUR: exit 0 on all three hooks. origin/main also passes the git forms and has no gh rule. Real git
             (remote with receive.advertisePushOptions=true) forced main to one on both git forms. With GH_DEBUG=api,
             gh printed `> DELETE /api/v3/repos/o/r/git/refs/heads/feat/x`. The comment says "Git options before push
             are not parsed, so none hides it", and nothing names options after push.
    CONFIDENCE: confirmed (hook verdicts, local git, gh parse); plausible for the git forms on GitHub (I did not check
             whether GitHub accepts push options)
```

```
[4] KIND: coverage
    WHERE: guard-bash.sh:49 (CONFIG_READ_ONLY: `` ` `` and `(` in the word class), :50 (CONFIG_FORCE
           `config-env[= ][^[:space:]]*\.push`), :51 (GH_API `(.*[[:space:]])?`), against scripts/hook-smoke.sh FORCED
    DEFECT: four pass-2 behaviours have no probe that fails when they are removed.
    TRIGGER: delete one of: the backtick from the read-only class, the `(` from that class, the `|config-env…\.push`
             alternative, or `(.*[[:space:]])?` in GH_API (on a copy)
    WRONG BEHAVIOUR: the smoke lists stay green (0 FORCED misses, 0 PLAIN misses), yet each mutant flips a real
             verdict from 2 to 0: ``git config --get x `git config remote.origin.mirror true` ``,
             `git config --get x <(git config remote.origin.mirror true)`,
             `V='+refs/heads/*:refs/heads/*' git --config-env=remote.origin.push=V push origin` (real git: main forced
             to one), `gh --hostname github.com api -X DELETE repos/o/r/git/refs/heads/feat/x`.
    CONFIDENCE: confirmed (mutants run against both smoke lists)
```

```
[5] KIND: plan-mismatch (unstated false positive, new in 0e631e7)
    WHERE: guard-bash.sh:49 (`$` excluded from the read-only words); hooks.md row "(a plain `git config --get` passes)"
    DEFECT: a read whose pattern ends in a regex `$` anchor is no longer "plain", so it is blocked when the key names
            mirror.
    TRIGGER: `git config --get-regexp '^remote\..*\.mirror$'`
    WRONG BEHAVIOUR: exit 2 with the force-push message (410c51a and origin/main: 0). The row does not list it.
    CONFIDENCE: confirmed
```

Not findings, checked: `git config --get --add remote.origin.mirror true`, the `--unset` and `-l` variants, and
`git push -o "a⏎b" -f` exit 0 at the hook, but real git refuses all of them (exit 129, "only one action";
"push options must not have new line characters"). `{,git} push -f` and `hub push -f` exit 0 on all three hooks. They
fall under "a command built at run time" or are another tool, so they are not filed.

### Ranking for the lead (last pass)

1. **Blocks the PR unless the lead accepts it in writing:** [1]. It is the only verdict where HEAD is weaker than
   origin/main, and real git confirms it. Either fix it with a red probe first, or name it out of reach in the
   comment and the hooks.md row ("a flag or refspec on a later line of a heredoc or a multi-line `$( )`") with the
   lead's sign-off, because it gives up today's coverage.
2. **Fix the doc before the PR, the code can be a follow-up card:** [2]. The row and the comment claim a block the
   code does not make. The smallest honest change is to state the gap. The code fix is one regex group plus a red
   probe.
3. **Follow-up card (B1.24 does not get worse without it):** [3] (name it out of reach now, one doc line), [4] (four
   probes), [5] (one false-positive line in the row).

Verdict: back to test-writer for [1] (a red probe, then code-writer), with [2] corrected in the docs. If the lead
instead accepts [1] as out of reach in writing, then dev-lead makes the doc edits for [1]–[3] and [5] and files
[3]–[4] as a follow-up card, and the PR is ready. The cap is reached, so this waits on the lead.

Riskiest unfalsified: the session shell here is zsh. zsh expansions with no literal `+`, `:` or `{` after a space
could still produce a refspec. `git push origin HEAD(e:'reply=(+main)':)` exits 0 on all three hooks. I did not run
it in zsh against a remote. It is covered only by the general "a command built at run time" wording.

### Pass 3 dispositions (dev-lead) — review cap reached, not re-reviewed

| Pass | #   | Finding                                                 | Source   | Kind       | Disposition  | Justification                                                                                                                        |
| ---- | --- | ------------------------------------------------------- | -------- | ---------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 3    | 1   | newline in `$( )`/heredoc ends the segment (regression) | reviewer | bypass     | fix now      | split on `; & \|` only, newlines read as spaces (the removed rule crossed newlines too); 2 probes (3030d1c red, b23234e green)       |
| 3    | 2   | `gh pr close -d 7`, `--delete-branch 7`                 | reviewer | bypass     | fix now      | flag may follow `close` directly; 2 probes                                                                                           |
| 3    | 3   | `; & \|` inside a quoted argument after push / gh api   | reviewer | bypass     | out of scope | named out of reach in the rule comment and hooks.md; not a regression (origin/main also passes); follow-up card proposed to the lead |
| 3    | 4   | 4 surviving mutants                                     | reviewer | test gap   | fix now      | probes: backtick and `=( )` in a config read, `--config-env` on a push key, `gh -R` before api (all exit 2)                          |
| 3    | 5   | `--get-regexp '…\.mirror$'` blocked                     | reviewer | false pos. | fix now      | stated in hooks.md (a config read holding `$`, a backtick or `(`)                                                                    |

hook-smoke: 413 probes OK. Earlier reviewer lists re-run: only the stated misses remain (curl, `${IFS}`, stated false
positives); the real-newline case now blocks. These fixes are not re-reviewed (3/3 passes used); the lead decides.

## Diff review (pass 4, granted by the lead for the three pass-3 fixes only)

Scope: 3030d1c (`test`, +11 −0 in hook-smoke.sh), b23234e (`fix`: guard-bash.sh, hooks.md), the merge 7f983bd of
origin/main 88bd951, and the PR-body commits up to 1840fc7. No other area was opened. Hook verdicts come from copies of
three hook versions run through their real JSON input: HEAD (1840fc7, byte-identical to the tree), p3 (41ad3c7, the
hook pass 3 reviewed) and origin/main (88bd951, the same hook as the merge base). Real git 2.39.5 used a scratch bare
remote with `main`=two and `feat/x`=two, and a clone reset to one. `⏎` is a real newline.

### Command results (last line of each)

| Command                       | Result                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm lint`                   | `All matched files use Prettier code style!`                                                |
| `pnpm typecheck`              | `tsc --noEmit`, exit 0                                                                      |
| `pnpm test`                   | `Tests  202 passed (202)`                                                                   |
| `pnpm test:e2e`               | `43 passed (50.2s)`                                                                         |
| `pnpm test:mutation`          | `Final mutation score of 93.40 is greater than or equal to break threshold 70`              |
| `check-suppressions.sh`       | `OK: no new suppressions`                                                                   |
| `check-config-change.sh`      | lists `.claude/hooks/guard-bash.sh`: expected until the PR carries the D-19 label           |
| `check-feat-commits.sh`       | `OK: no feat commit touches tests`                                                          |
| `check-ac-coverage.sh`        | `OK: every criterion of a shipped section has a test`                                       |
| `check-spec-sections.sh`      | `OK: sections cited: 1 … 22`                                                                |
| `check-features-map.sh`       | `OK`                                                                                        |
| `check-plan-scope.sh`         | `OK: feat/B1.24-force-push-spellings stays inside the approved plan of B1.24`               |
| `check-backlog.sh`            | `OK: README matches the cards`                                                              |
| `verify-red.sh B1.24`         | `no 'test(<pkg>): B1.24 … (red)' commit` (as before; the plan explains it)                  |
| `next-task.sh --check B1.24`  | `B1.24: no overlap with any Doing or Review card`                                           |
| `scripts/hook-smoke.sh`       | `hook-smoke: 413 probes OK` (0 FAIL)                                                        |
| `git diff --stat origin/main` | 6 files: hooks.md, guard-bash.sh, hook-smoke.sh, B1.24 plan.md, pr-body.md, review.md       |
| bash 5 vs bash 3.2            | not run this pass: no bash 5 on session's PATH (`which -a bash` → `/bin/bash`) [unverified] |

### Do the three pass-3 fixes close their findings?

| Pass-3 # | Re-run                                                                                                                                                                                                                                                  | Closed?                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 1        | 3 heredoc triggers + `git push origin⏎+main`, ``git push origin `cat <<X⏎+main⏎X⏎` ``, `$(printf '%s'⏎'-f')`: HEAD 2 on all 6 (p3 0 on all 6). Real git: all 3 triggers still force main / delete feat/x when run, so the block matters                 | yes                        |
| 2        | `gh pr close -d 7`, `--delete-branch 7`, `merge -d 7`, `"-d" 7`, `-cd 7`, tab, newline before `-d`: HEAD 2 on all 7 (p3 and origin/main 0). Controls `gh pr close 7`, `… 7 -c bye`, `gh pr closed -d 7`, `gh pr view 7 --json closed`: 0                | yes                        |
| 4        | the four pass-3 mutant verdicts: HEAD 2 on all 4. Mutants on a copy: removing the backtick, the `(`, the `config-env…\.push` alternative or `(.*[[:space:]])?` in GH_API now fails 1 smoke probe each; reverting fix 1 fails 2, reverting fix 2 fails 2 | yes, 6 of 6 mutants killed |
| 3 / 5    | `-o "a;b" -f` and `--jq '.a \| .b' -X DELETE` exit 0 (stated out of reach); `--get-regexp '^remote\..*\.mirror$'` exits 2 (stated false positive). The code matches the comment; the hooks.md row does not render, see [2]                              | code yes, doc no           |

**Regression lists.** 258 distinct earlier commands (`p3/all.jsonl` = rounds 1–2 `$TMPDIR/b124probe`, passes 1–2
scratchpad lists incl. `p2/`, plus `p3/new.jsonl`, `p3/z.jsonl`) on HEAD / p3 / origin/main. HEAD differs from p3 on
9 commands, all 0 → 2 (the heredoc, real-newline, quoted-newline `-o` and gh flag-first forms). No command goes 2 → 0
against p3. Against origin/main the only 0-where-2 is `xgit push -f` (stated, not git). The earlier lists hold no
multi-line config command, so they could not see [1].

### Checklist

- Every changed file in `plan.md` (6 of 6); input JSON and exit codes unchanged: **pass**.
- No test weakened: `git log --first-parent --no-merges 3030d1c^..HEAD -- '*.test.*' e2e/ scripts/hook-smoke.sh` lists
  only 3030d1c (+11 −0). The `--remerge-diff` of 7f983bd touches no test or smoke file: **pass**.
- No secret, no suppression; Zod, Prisma, SQL, migration, features map: n/a: **pass**.
- Revert probes: 6 of 6 mutants killed: **pass**.
- The fix keeps every config-route block the plan lists: **fail**, see [1].
- The comment and hooks.md match the code: **fail** for hooks.md, see [2]. The rule comment matches.
- pr-body.md counts: 104 new probes (413 − 309) match the smoke. Line 64 still copies the plan's "369 probes OK",
  which is the approved plan text, not a finding.

### Findings

```
[1] KIND: correctness (regression introduced by b23234e; the pass-3 hook blocked it, origin/main has no config rule)
    WHERE: .claude/hooks/guard-bash.sh:72 (`"${joined//$'\n'/ }"` joins every line into one segment) with :49
           (CONFIG_READ_ONLY anchored ^…$ over the whole segment) and :71 (`! "$low" =~ $CONFIG_READ_ONLY`)
    DEFECT: a plain config read on one line now exempts every later line of the same Bash call from the config check,
            because the joined segment still reads as "git config --get" followed by plain words.
    TRIGGER: `git config --get user.name⏎git config remote.origin.mirror true⏎git push origin`;
             `git config --get user.name⏎git -c remote.origin.mirror=true push origin`;
             `git config --get user.name⏎git config remote.origin.push +refs/heads/*:refs/heads/*⏎git push origin`;
             also `git config --get user.name⏎git config remote.origin.mirror true` and
             `git config --list⏎git remote add --mirror=push m ../r.git`
    WRONG BEHAVIOUR: HEAD exits 0 on all 5; p3 (41ad3c7) exits 2 on all 5; origin/main exits 0. Real git on the scratch
             remote: the first two mirror-pushed (main two → one, feat/x gone from refs/heads), the third forced main
             two → one ("forced update"). The approved plan says a config that sets a mirror or a +/: push refspec
             blocks "unless it only reads"; the comment says "unless the whole segment is a plain git config … --get";
             neither names a multi-line call as out of reach. The same lines joined by `;` or `&&` still block.
             Controls exit 0 on all three hooks: `git config --get user.name⏎git push -u origin feat/x`, a two-line
             pair of `--get` reads, `git add -A⏎git commit -m x⏎git push -u origin feat/x`.
    CONFIDENCE: confirmed (three hook versions; real git on a bare remote)
```

```
[2] KIND: plan-mismatch (doc corrupted by the pass-3 doc edit)
    WHERE: .claude/docs/hooks.md:11 (guard-bash row), written in b23234e
    DEFECT: the new text "`;` `&` `|`" and "`;`/`&`/`|`", "`.a | .b`" put unescaped `|` inside the table cell, so the
            row has 6 cells under a 3-column header; prettier (PostToolUse) re-parsed it that way and rewrote the text.
    TRIGGER: render or parse hooks.md as GFM. Prettier's own parse: cell 3 is 568 characters and ends at
             "segments split on `;` `&` `"; the header's third column is exactly 568 wide; cells 4–6 (1,631 characters)
             fall outside the header. In the raw text, `GIT_CONFIG_*` became `GIT_CONFIG__`, the example
             `'^remote\..*\.mirror$'` became `'^remote\.._\.mirror$'`, and spaces around about 20 code spans were removed
             ("naming git,`-f`/`-d`", "`--prune`or").
    WRONG BEHAVIOUR: GFM drops cells beyond the header count, so the rendered row stops after "split on ; &". Every
             rule after it disappears from the doc: all of B1.24's blocks, its false positives and out-of-reach list
             (incl. the pass-3 [3] and [5] lines this fix added), and the older Prisma, secret-read and pr-step rules
             that origin/main's row shows. The raw source misstates two names. Pass 3 asked for these doc lines; as
             rendered, they are not there.
    CONFIDENCE: confirmed (prettier parse of the committed file; 7 pipes in the row against 4 at 41ad3c7). GitHub's
             render was not viewed.
```

Not findings, checked: newlines joined into one segment add false positives where a later line holds a `-d`/`-f`/`+`/`:`
word after a push (`git push -u origin x⏎gh pr create -d`). origin/main's `[^;&|]*` crossed newlines too, and the row's
false-positive line ("a `+`/`:`/`-d` word after any push word") covers them.

Verdict: back to test-writer for [1] (a red smoke probe: a `--get` line followed by a line that sets the mirror), then
code-writer (for example: evaluate CONFIG_READ_ONLY per original line, or refuse the exemption when the segment held a
newline). [2] goes to dev-lead: escape each `|` in the row as `\|` and restore `GIT_CONFIG_*`, `.*` and the spaces. The
pass cap is already extended, so the lead decides whether to fix or to accept [1] in writing as out of reach.

Riskiest unfalsified: bash 5 verdicts for the newline join (`${joined//$'\n'/ }`) were not re-run this pass. No bash 5
is on PATH, and pass 3's 354-command parity check predates b23234e.
