# B1.23 reviews

## Plan review (round 1)

SCOPE: tooling (`.claude/settings.json`, `.claude/hooks/guard-bash.sh` behaviour, `scripts/hook-smoke.sh`,
`.claude/docs/hooks.md`); no `src/`, no spec section. Plan at e740b53.

| Check                                                                | Result                                                                                                                                 |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                       | pass: settings.json, hook-smoke.sh, hooks.md, work folder. Fixes below add `.claude/hooks/guard-bash.sh`                               |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | n/a: no TypeScript                                                                                                                     |
| follows `advice.md` or states the deviation                          | pass: advisor skipped, stated (tooling, no section)                                                                                    |
| ≤ 7 criteria, every Then measurable                                  | pass: card Acceptance is the contract; the "runs under auto mode" item is deferred to the next card PR, stated                         |
| verification: exact commands with expected numbers                   | fail: P2 is stated red but passes on an empty `allow`; `check-plan-scope.sh`, `check-backlog.sh` have no expected output (reason 4, 6) |
| work breakdown, convention subjects                                  | pass: `test(scripts)` red → `chore(config)` green → reviewer → draft PR, labeled; no skeleton/map (no section)                         |
| `Lead approves spec` box                                             | n/a: no section                                                                                                                        |
| no settled D-n contradicted                                          | fail: D-19 and `git-workflow.md:23` keep `hotfix` the lead's; the edit and create rules auto-approve it (reasons 2, 3)                 |
| one screen                                                           | marginal: 52 lines; the fixes must not push it past one screen                                                                         |
| `scripts/next-task.sh --check B1.23`                                 | pass: `[next-task] B1.23: no overlap with any Doing or Review card`                                                                    |

Baseline I ran: `scripts/hook-smoke.sh` → `hook-smoke: 284 probes OK` (plan's 288 = 284 + P1–P4, consistent).

What I know about `Bash(...)` matching (Claude Code permission docs) vs assume:

- Known: a rule is a prefix/glob on the command; `*` may sit anywhere and matches any run of characters,
  spaces included (`Bash(git * main)` matches `git log --oneline main`); `prefix *` (space) enforces a word
  boundary, `prefix*` does not; `&&`, `||`, `;`, `|` split the command and every part must be allowed; deny beats
  allow; a PreToolUse hook exiting 2 blocks even an allowed command; `Read(...)` denies govern the Read tool,
  not files a Bash command opens.
- Assumed (not verifiable here): auto mode keeps these four narrow rules (it drops broad code-execution rules
  such as `Bash(*)`); a command containing `$VAR` or `$(...)` may still be routed to a prompt instead of matched.

So an argument constraint inside `Bash(...)` does not hold; the only thing standing between an auto-approved
prefix and a bad argument is `guard-bash.sh`. I fed it the spellings below on a copy
(`$TMPDIR/probe-b123.*`); exit 0 = passes the hook, so with the plan's rules it runs without any check.

```
exit 0  git push origin '+main'                    exit 0  git push --mirror origin
exit 0  git push origin "+feat/x"                  exit 0  git push --prune origin refs/heads/*:refs/heads/*
exit 0  git push origin +@:feat/x                  exit 0  git push origin --delete feat/B3.2-other
exit 0  git push origin +0a1b2c3:refs/heads/feat/x exit 0  git push origin :feat/B3.2-other
exit 0  git push origin +$BR                       exit 0  gh pr create --draft --body-file .env
exit 0  gh pr create --draft --body-file ~/.ssh/id_rsa
exit 0  gh pr create --draft --label hotfix --title x --body y
exit 0  gh pr create --draft -R someone/else --title x --body y
exit 0  gh pr edit 5 --add-label hotfix --add-label config-change-approved
exit 2  git push --force origin main / -uf / --force-if-includes   (blocked today, stay blocked)
```

The ruleset (`.github/rulesets/main.json`: deletion, non_fast_forward) protects only the default branch; card
branches have no server-side force or deletion protection.

Verdict: changes requested

1. **`Bash(git push*)` auto-approves forced pushes and deletions that `guard-bash.sh` misses** (invariant 6).
   The plan's premise ("guard-bash blocks every forced-push spelling") is false: a quoted refspec (`'+main'`,
   `"+feat/x"`), `+` followed by a non-letter (`+@:x`, `+0a1b2c3:x`, `+$BR`) and `--mirror` (force-updates
   and deletes every ref) all exit 0. Deletion of a sibling's branch (`--delete`, `:branch`, `--prune`) also exits
   0 and closes that card's PR. Fix in this card: add `.claude/hooks/guard-bash.sh` to Files and block, in a
   `git push` segment, `+` after whitespace or a quote with any next character, `--mirror`, `--delete`/`-d`, a
   refspec starting with `:` and `--prune`; add an exit-2 probe per spelling (red before the change) and keep
   `git push`, `git push -u origin feat/x` at exit 0. Optionally narrow the rule to `Bash(git push)` +
   `Bash(git push -u origin feat/*)`, the two forms Loop 5 and Loop 9 use; it does not remove the need for the
   hook, since `*` still spans extra arguments.
2. **`Bash(gh pr edit * --add-label config-change-approved)` is not the narrow rule it reads as.** `*` spans
   spaces, so any flags before the suffix are approved: `--add-label hotfix`, `--remove-label …`, `--base …`,
   `--body-file .env`. `hotfix` turns off `e2e`, `mutation`, `semgrep` and `guards` (`.github/workflows/ci.yml`
   jobs with `!contains(…'hotfix')`, which includes `check-config-change.sh`), and D-19 keeps it the lead's.
   Fix: a `guard-bash.sh` rule that blocks any `gh pr edit` segment that is not exactly
   `gh pr edit <digits> --add-label config-change-approved`, with probes for the four spellings above plus the
   allowed form at exit 0 (or a wrapper script that takes only `<n>`, allowed instead of `gh pr edit`).
3. **`Bash(gh pr create*)` does more than open a draft PR.** It auto-approves `--label hotfix` / `-l hotfix`
   (same gate bypass as 2), `-R other/repo`, a non-draft PR (Loop 5 opens drafts), and `--body-file .env` or
   `~/.ssh/id_rsa`, which posts the file into a public repository (D-8; invariant 7). `guard-bash.sh` misses it
   because `gh` is not in its `READER` list, and `Read(./.env)` does not cover Bash. Fix: narrow to
   `Bash(gh pr create --draft *)`; in `guard-bash.sh` block `gh pr create|edit` with `-l`/`--label`
   (other than `config-change-approved` if the plan wants labeling at creation), `-R`/`--repo`, and
   `--body-file`/`-F` naming a `SECRET_PATH`; one probe each.
4. **Probes P1–P4 do not pin what the card says.** P2 ("no other `Bash(gh`/`Bash(git` entry") passes on
   today's empty `allow`, so the planned red line "P1, P2 FAIL" is wrong, and P1 ("exactly these four")
   already implies P2. P3 pins 5 of 16 deny entries; the Acceptance names the `.env*` reads too, and
   `core.hooksPath`, `LEFTHOOK=0`, `~/.ssh`, `~/.aws`, `~/.kube`, `Edit(./.env*)` are unpinned. Pin the whole
   deny list (exactly the current 16). P4 re-runs an existing probe and adds nothing; replace it with the new
   guard-bash probes from 1–3, which are the ones that would be red before the change. Recompute the expected
   count from the 284 baseline.
5. **The hooks.md correction is right but half done.** Right: today `deny` has no `gh api` and no environment
   dump rule (that is `guard-bash.sh`), and `allow` is empty. The same false claim is in
   `.claude/docs/git-workflow.md:23` ("Needs a human (and the hooks say so): … `gh api`"); add the file to
   Files or state it out of scope. The corrected paragraph should also say that the allow rules rely on
   `guard-bash.sh` for argument checks, because `Bash(...)` rules cannot constrain arguments.
6. **Verification detail.** Give the expected last line of `scripts/ci/check-plan-scope.sh` and
   `scripts/ci/check-backlog.sh`. State the auto-mode assumption above, and what the closing PR does if a step is
   still refused on the next card (a refusal means this card is not Done).

Riskiest unfalsified: whether Claude Code applies the allow rules to commands with `$VAR`/`$(...)` (for
example `git push origin +$BR`) or prompts for them. I could not run the matcher, so reason 1 treats them as
allowed.

## Plan review (round 2)

SCOPE: tooling (`scripts/pr-step.sh`, `.claude/settings.json` allow, dev-lead Loop 5/9, docs); no `src/`, no
section. Plan at 0f7a6c9 (54 lines). Last round: these reasons go to the lead with the plan.

### Round-1 reasons

| #   | Status                                                                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | closed: no raw `git push` rule; `push` builds `HEAD:refs/heads/<current>` itself (no `+`, no delete). guard-bash gaps → out-of-scope note |
| 2   | closed for `hotfix` / other flags (`label <n>` takes nothing else); the D-19 condition is not checked (reason 3 below)                    |
| 3   | closed for `-R`, `--label`, non-draft; `--body-file` secret posting is narrowed but still open (reason 2 below)                           |
| 4   | closed: deny pinned whole (16), settings probe red on empty `allow`; new red-count gap (reason 4 below)                                   |
| 5   | closed: `git-workflow.md`, `hooks.md` in Files                                                                                            |
| 6   | closed: `check-plan-scope.sh` / `check-backlog.sh` print `OK` today (run below); auto-mode assumption and Partial rule stated             |

### Checklist

| Check                                              | Result                                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| every file belongs to the card                     | pass, but reasons 1 and 3 add `.claude/hooks/guard-bash.sh` and `scripts/ci/check-config-change.sh`                |
| ts-style / actions / Prisma                        | n/a: no TypeScript                                                                                                 |
| `advice.md` followed or deviation stated           | pass: advisor skipped (tooling, quick), stated                                                                     |
| ≤ 7 criteria, every Then measurable                | fail: R12 "no shell metacharacter … reaches a second command" names no input and no assertion (reason 4)           |
| verification: exact commands with expected numbers | fail: "12 FAIL (missing)" is false for refusal probes that only assert non-zero (reason 4)                         |
| work breakdown, convention subjects                | pass: `test(scripts)` red → `chore(scripts)` green → reviewer → draft PR + `config-change-approved`                |
| `Lead approves spec` box                           | n/a: no section. The plan has no `Plan review: · Plan approved by: · Rounds:` trailer line (reason 6)              |
| no settled D-n contradicted                        | fail: D-19 makes the label conditional on an approved plan holding a protected path; `label <n>` is not (reason 3) |
| one screen                                         | marginal: 54 lines; fixes must replace prose, not add to it (reason 6)                                             |
| `scripts/next-task.sh --check B1.23`               | pass: `[next-task] B1.23: no overlap with any Doing or Review card`                                                |

Runs: `scripts/hook-smoke.sh` → `hook-smoke: 284 probes OK`; `scripts/ci/check-plan-scope.sh` → `[check-plan-scope] OK:
feat/B1.23-pr-steps changes only paperwork (B1.23 has no approved plan)`; `scripts/ci/check-backlog.sh` →
`[check-backlog] OK: README matches the cards`; `scripts/ci/plan-files.sh --any B1.23 HEAD` → the 11 Files rows, exit 0.

### Matcher: known vs assumed

- Known (Claude Code permission docs): `Bash(scripts/pr-step.sh *)` is a string prefix match, `*` spans spaces;
  `&&`, `||`, `;`, `|` split a command and every part must be allowed; deny beats allow; a PreToolUse hook exiting 2
  blocks even an allowed command. The match is on text: it says nothing about which file `scripts/pr-step.sh` names
  (that depends on the cwd) or whether that file is the reviewed one.
- Assumed (not verifiable here): whether a command whose argument holds `$(…)` or backticks, a redirection
  (`> f`, `< f`), or a leading `VAR=x` assignment is still matched by the prefix or sent to a prompt; that a newline
  splits like `;`; that `cd <dir>` inside an allowed working directory (the worktree, the session scratchpad) runs
  without asking. The plan's safety must not rest on these, and the wrapper cannot see any of them: the shell
  expands `$(…)`, opens redirections and applies `VAR=x` before the wrapper runs. Only `guard-bash.sh`, which reads
  the raw command for every Bash call, can.

### Probes I ran

`guard-bash.sh` copy in the session scratchpad, exit 0 = passes the hook (so, under the new rule, runs if the matcher matches):

```
exit 0  scripts/pr-step.sh draft "$(< .env)" backlog/work/B1.23/plan.md      title = the file, posted to a public repo
exit 0  scripts/pr-step.sh draft "`< ~/.ssh/id_rsa`" backlog/work/B1.23/plan.md
exit 2  scripts/pr-step.sh draft "$(cat .env)" …                             (READER word present; `$(<` has none)
exit 0  scripts/pr-step.sh ready 7 > .claude/settings.json                    truncates the file, no Edit/Write hook sees it
exit 0  GH_REPO=someone/else scripts/pr-step.sh draft 'feat(x): y' …           gh honors GH_REPO
exit 0  cd /tmp/x && scripts/pr-step.sh push                                  runs /tmp/x/scripts/pr-step.sh
exit 0  ln .env backlog/work/B1.23/body.md · dd if=.env of=… · ln -s ~/.ssh backlog/work/B1.23/d
exit 0  scripts/pr-step.sh body 7 backlog/work/../../.env.md
```

`/bin/bash` 3.2.57 on this machine, dummy files: a hard link `work/h.md` to `sec/s.md` passes `-f` and `! -L`;
`work/d/s.md` through a symlinked directory passes `-f` and `! -L` (only `cd -P … && pwd -P` exposes `sec/`);
`find f -links 1` prints nothing for the hard link (portable nlink check); `TMPDIR` is
`/var/folders/…/T/` (trailing slash) and resolves to `/private/var/folders/…/T`, so comparing a resolved path to raw
`$TMPDIR` refuses every valid file; with `TMPDIR=""` the prefix `"$TMPDIR"/*` accepts `/etc/x.md`; `$(< f)` works in 3.2.
`/bin/realpath` exists (macOS 15) but takes no `-e`/`-m`; `cd -P "$(dirname f)" && pwd -P` is the portable form.
`lefthook.yml` has no `pre-push`, so `push` skips no local hook.

Verdict: changes requested — Waiting on human (round cap reached). Blocking = the plan must change before the lead
approves (Files or the safety claim change); carryable = may be fixed in the build without re-approval, or filed.

1. **Blocking. The allow rule trusts a relative path and a command shape that only guard-bash can check.**
   Text matched by `Bash(scripts/pr-step.sh *)` can (if the matcher matches it, assumed above) truncate any file
   (`… > .claude/hooks/guard-bash.sh` empties a hook, which disables it), post a secret as the title (`"$(< .env)"`),
   redirect `gh` (`GH_REPO=…`), or run a different `scripts/pr-step.sh` (`cd <scratchpad> && …` after a Write
   there, which `plan-scope.sh` lets through as outside the project; or a `sed -i` edit in the worktree, which no
   Edit/Write hook sees). Each runs without auto mode's judgement, which is more than the five steps. Fix: add
   `.claude/hooks/guard-bash.sh` to Files with one rule: a command that mentions `pr-step.sh` must be a single
   segment matching `^scripts/pr-step\.sh( |$)` (no leading `cd` or `VAR=`), contain none of `$`, backtick, `<`,
   `>`, `;`, `&`, `|`, `\`, newline, run with the hook payload's `cwd` equal to `git rev-parse --show-toplevel`, and
   `scripts/pr-step.sh` tracked and clean (`git diff --quiet HEAD -- scripts/pr-step.sh`). One exit-2 probe in
   `hook-smoke.sh` per spelling in "Probes I ran" plus `scripts/pr-step.sh ready 7` and a quoted conventional title
   at exit 0; all red before the change (they exit 0 today).
2. **Blocking. The body-file and title rules as written let a secret through.** `..` (`backlog/work/../../x.md`),
   a symlinked directory component, a hard link to `.env` (`ln`, `dd if=` pass guard-bash) and `TMPDIR=""` all pass
   "regular `.md` under `backlog/work/` or `$TMPDIR`, not a symlink"; comparing to raw `$TMPDIR` on macOS refuses
   every valid temp file. Fix, in the Interfaces block: resolve with `cd -P "$(dirname f)" && pwd -P` and compare to
   the resolved `$(git rev-parse --show-toplevel)/backlog/work/` and resolved `${TMPDIR:?}` (non-empty, not `/`);
   require `find f -links 1`; the title one line matching the PR title convention
   (`^(feat|fix|chore|docs|test|refactor)\([^)]+\): ` plus a length cap), so a `KEY=value` file cannot be a title.
   Extend R5 with `..`, symlinked directory, hard link, `TMPDIR=` empty, and a resolved `$TMPDIR` file accepted.
3. **Blocking. `label` drops D-19's condition, and the wrapper itself is unprotected.** D-19: the agent labels
   "when the lead-approved plan changes a CI-protected path … a protected change outside an approved plan is never
   labeled by an agent". `label <n>` checks only digits and head branch, so any session on any card branch can
   auto-apply `config-change-approved`, which turns `check-config-change.sh` green for every protected file. Fix:
   `label` refuses unless `scripts/ci/plan-files.sh <card>` exits 0 (approval commit exists) and one of its Files
   matches `check-config-change.sh`'s `PROTECTED`. Separately, `scripts/pr-step.sh` is now the permission
   boundary but is not in `PROTECTED` (only `scripts/ci/`, `verify-red.sh`, `next-task.sh`, `card-status.sh`
   are), so a later plan can widen it with no label; add `scripts/pr-step.sh` to `PROTECTED`
   (`scripts/ci/check-config-change.sh` into Files). The head check should also require
   `isCrossRepository == false`: a fork PR with the same branch name (public repository) passes `headRefName` alone.
   Probes: label refused without approval commit / without a protected path; fork-head PR refused.
4. **Blocking. Red count and R12 are not measurable as written.** Seven probes (R2, R3, R5, R7, R9, R10, R11)
   test a refusal; if they assert only a non-zero exit, a missing script (exit 127) passes them and the test
   commit shows 5 FAIL, not 12. State that every refusal probe asserts the wrapper's own exit code and refusal
   message and an empty `gh`/`git` shim log, so a missing script fails all of them. R12: name the inputs
   (`'x; touch P'`, `'$(touch P)'`, ``'`touch P`'``) and the assertion (`P` absent, shim received the title
   byte for byte). Recompute both expected lines after 1–3 (`pr-step-smoke.sh` N ok; `hook-smoke.sh` 284 + 2 + the
   guard-bash probes).
5. **Carryable.** Done criterion: add `body` (Loop 9 fills Map delta / Review through it); `label` is exercised
   only on a card whose plan holds a protected path, so say "label, or not exercised" or the card can never close.
   `draft` must print the PR number (Loop 5's `label <n>` needs it). Loop 9's `git fetch`/`git merge` and
   `gh pr checks --watch` stay outside the wrapper: the closing PR records whether any of them was refused. Scrub
   `GH_REPO`, `GH_HOST`, `GIT_DIR`, `GIT_WORK_TREE`, `GIT_CONFIG_*` inside the wrapper as defence in depth behind 1.
6. **Carryable.** Add the `Plan review: … · Plan approved by: … · Rounds: 1` trailer the gate writes into; trim the
   7-line round-1 preamble to one line to stay near one screen. The out-of-scope note is acceptable (no raw push is
   auto-approved, so this card does not widen the guard-bash gaps), provided the card is filed with an id in this
   PR's backlog change, not "after".

Dev-lead coverage: Loop 5 (push, draft, label) and Loop 9 (push, body, ready, `ready --undo`, ready) map onto the
five subcommands once `draft` returns the number (reason 5); no PR step is left needing a raw `gh pr` call except
the read-only `gh pr checks`/`view`.

Riskiest unfalsified: whether Claude Code's matcher auto-approves `scripts/pr-step.sh …` when the argument holds
`$(…)`, a redirection or a `VAR=` prefix. I could not run it; reason 1 makes the answer irrelevant by blocking those
shapes in `guard-bash.sh` before the matcher is consulted.
