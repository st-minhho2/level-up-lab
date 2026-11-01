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
