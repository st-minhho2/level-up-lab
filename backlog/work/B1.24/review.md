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
