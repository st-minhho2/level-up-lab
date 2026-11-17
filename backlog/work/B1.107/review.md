# B1.107 review

## Plan review (round 1)

Plan at `5d29365`. Evidence: `.claude/hooks/*.sh` copied to `$TMPDIR/b107p/old/` (the hook at `5d29365`, the same
lines as `4e5b42a`). `$TMPDIR/b107p/new/` is the same copy with the plan's pasted `GH_BRANCH_DELETE` line applied
literally; `diff old new` shows only line 60. 42 commands were fed as Bash tool JSON (`$TMPDIR/b107p/cases.txt`, with
`gh` written as a placeholder so this session's own hook would not refuse them) and run with `/bin/bash` 3.2.57.
Baseline `scripts/hook-smoke.sh` on `5d29365`: "hook-smoke: 820 probes OK".

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: tooling, no section. `scripts/ci/plan-files.sh --any B1.107 HEAD` lists 4 rows (`guard-bash.sh`, `hook-smoke.sh`, `hooks.md`, `backlog/work/B1.107/*`). The card's Spec line names the first three                                                        |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: n/a, no TypeScript. The hook interface is stated: exit 2 with the existing `FORCE_MSG`, message unchanged. The pasted regex is one character class on one line, the same class as `PUSH_FORCE` and `GH_PR_FLAGS`                                          |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice, and the plan says so (tier quick, no section; `dev-lead.md:46` lets a quick card skip it). Approach B is shown with its costs and left to the lead                                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: the card has 4 acceptance lines, all measurable (probe exits, counts, label). The forms A leaves open are named (see the notes)                                                                                                                           |
| verification lists exact commands with expected numbers                                | pass: 820 → 838 (820 + 12 + 6). Red "12 FAIL, 826 ok". `pnpm test` 403 before and after. Mutation: CI only. My baseline and probes agree with each number                                                                                                       |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: a probe `test(hooks): …` commit with no `(red)` marker, a stated and justified deviation (`verify-red.sh:73-75` needs a `*.test.ts(x)` file, the same as B1.103 and B1.105). Then green `chore(hooks): …` and review. No skeleton or map row (no section) |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a, no section. `scripts/agent/tier.sh backlog/work/B1.107/plan.md` prints `high`, so the lead's `approve` gates the build. D-19's label is named                                                                                                        |
| no settled D-n contradicted                                                            | pass: D-19, D-28 and D-9 are followed. B1.24's rule is widened; B1.103's and B1.105's rules are untouched                                                                                                                                                       |
| `scripts/next-task.sh --check B1.107` on the committed plan says no overlap            | pass: `[next-task] B1.107: no overlap with any Doing or Review card`                                                                                                                                                                                            |

Confirmed with `old` (the hook as it is) and `new` (the plan's line):

- All 12 of the plan's blocked probes exit 0 on `old`. On `new` they exit 2 with `force pushes`.
- All 6 of the plan's allowed probes exit 0 on both hooks.
- 7 more spellings exit 0 on `old` and 2 on `new`: `close $'-d' 7`, `close \-d 7`, `\"-d\"`, `"$"-d`, `$'\''-d`,
  `\$'-d'`, and `--delete-branch=true` (2 on both).
- These reads exit 0 on both: `-c "$DESC"`, `--comment "$(cat body)"`, `-c 'see $HOME'`, `-c "\"done\""`,
  `-c $'line1\n-done'`, `pr list --state closed …`, and `close 7 -c "x" && cd $'-dir'`. The last passes because the
  `&` splits the segment.
- The plan's 4 mutants match my counts: 12 probes need the class, 7 need `$`, 3 need `\`, and 9 need two characters
  before the `-` (`*`, not `?`).
- These stay open on `new`, exactly as the plan states: `-'d'`, `"-"d`, `gh pr $'close' 7 -d`, `$'\x2dd'` and
  `gh pr $'merge' 7`. The last one is a merge that exits 0 today (B1.103's rule). No card in `backlog/plan/` holds it
  yet.
- The stated false positive is confirmed: `gh pr close 7 -c "see \-d in docs"` goes from 0 to 2.

Notes for the lead (none blocks):

1. Acceptance 1 says every such command is blocked "with the existing branch-delete message". For `merge … $'-d'`,
   `GH_PR_MERGE` (`guard-bash.sh:90`) fires first, so the message is `MERGE_MSG`. The command is still blocked, and
   B1.105 accepted the same behavior. None of the 12 probes is a merge.
2. `-'d'` and `"-"d` put the quote inside the flag, not before it. The plan lists them only among B's extra forms. The
   header and `hooks.md` already list "a word quoted in pieces" as out of reach, which covers them. Naming the two
   forms there too would make the boundary plain.
3. If the lead says `approve`, the follow-up card for `gh pr $'merge' 7` is the plan's only record of an open merge
   path. File it before this card closes.
4. I did not check B's timing figures (929 s and 3.85 s). They bear only on choosing B.

Verdict: approved

## Diff review (round 1)

Diff `origin/main` (`4e5b42a`) `...2bf0ac0`: 6 files, 211 insertions, 13 deletions. PR #390 is a draft whose head
is still `2feb79e`, so the probe and fix commits are not pushed yet. Tooling card, no section, no `src/` change.

### Commands (last line of each)

| Command                                  | Result                                                                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                              | exit 0; "All matched files use Prettier code style!"                                                                                |
| `pnpm typecheck`                         | exit 0                                                                                                                              |
| `pnpm test`                              | "Tests 403 passed (403)", the same count as before the card                                                                         |
| `pnpm test:e2e`                          | "91 passed (2.2m)"                                                                                                                  |
| `scripts/mutation-gate.sh`               | "mutation: CI only, no src/lib or src/actions change"                                                                               |
| `scripts/hook-smoke.sh` (worktree, HEAD) | "hook-smoke: 838 probes OK", `/bin/bash` 3.2.57                                                                                     |
| `scripts/ci/check-suppressions.sh`       | "OK: no new suppressions"                                                                                                           |
| `scripts/ci/check-config-change.sh`      | exit 1 locally, as expected: it lists `hooks.md` and `guard-bash.sh` without the label. PR #390 has `config-change-approved`        |
| `scripts/ci/check-feat-commits.sh`       | "OK: no feat commit touches tests"                                                                                                  |
| `scripts/ci/check-ac-coverage.sh`        | "OK: every criterion of a shipped section has a test"                                                                               |
| `scripts/ci/check-spec-sections.sh`      | "OK: sections cited: 1 … 53"                                                                                                        |
| `scripts/ci/check-features-map.sh`       | "OK"                                                                                                                                |
| `scripts/ci/check-plan-scope.sh`         | "OK: chore/B1.107-quoted-delete stays inside the approved plan of B1.107"                                                           |
| `scripts/ci/check-backlog.sh`            | "OK: README matches the cards"                                                                                                      |
| `scripts/verify-red.sh B1.107`           | "no 'test(<pkg>): B1.107 … (red)' commit". This is the deviation the plan states: no `(red)` marker on a commit with no vitest file |
| `scripts/next-task.sh --check B1.107`    | "no overlap with any Doing or Review card"                                                                                          |

The red was shown by hand instead. I ran `scripts/hook-smoke.sh` in `git clone . $TMPDIR/b107d1` at `b80699a`: exit 1,
with exactly the 12 new `force pushes` probes failing. The clone also had 14 more FAILs because it has no
`node_modules` (js-yaml, the dev-lead frontmatter checks and the FR review-format checks). The same 14 appear at HEAD
in that clone, so they come from the environment, not from the card.

### Checklist

- Probes match the card: all 12 blocked probes and 6 allowed probes are the plan's lists, verbatim. Acceptance 2's
  three commands are among the allowed ones. Acceptance 3: the red is above, the green is 838 = 820 + 18, and the
  hook is bash 3.2.
- Tests not weakened: `git log --first-parent --no-merges b80699a..HEAD -- scripts/hook-smoke.sh '*.test.*' e2e/` is
  empty, and the branch has no merge commits. The fix commit touches only `guard-bash.sh` and `hooks.md`.
- Every changed file is in the plan. The `GH_BRANCH_DELETE` line is the plan's pasted line, character for character.
  The messages are unchanged.
- `hooks.md` re-pad: `git diff -w` shows only 2 lines changed, the table's separator row and the guard-bash row. The
  other 8 lines differ only in the padding Prettier adds after the guard-bash cell widened the column. The lint hook
  formats every edit, and the file is in the plan, so this is the plan's change, not scope creep.
- No secret, no suppression, no `src/`, no `prisma/`.
- Mutants, run on the clone at `2bf0ac0` against the full `hook-smoke.sh`. "FAILs" counts the `force pushes` probes
  that fail. Putting the class back to `[\"']?` gives 12 FAILs. Removing `$` from the class gives 7, removing `\\` gives 3, and changing `*` to `?`
  gives 9. All four are killed, and the counts match the plan. With no mutant, HEAD in the clone has 0 `force pushes`
  FAILs and the same 14 environment FAILs.
- Header and `hooks.md` wording, checked against a copy of the base hook (`old`) and of HEAD (`new`) with
  28 adversarial commands:
  - The forms the docs name as blocked now go 0 → 2: `$''-d`, `''$'-d'`, `"gh" "pr" "close" 7 $'-d'`, a tab before
    the flag, and `-c "fixed" \--delete-branch`.
  - The forms named as out of reach stay at 0 on `new`: `\close`, `$'close'`, `$'pr' close`, `-'d'`, `"-"d`, and
    `$'\x2dd'` (from the plan round). The stated false positive `-c "see \-d in docs"` goes 0 → 2.
  - `"close"` and `'close'` with `$'-d'` / `\-d` are blocked (exit 2). So the phrase "a quoted or escaped
    subcommand" is correct only together with its examples (`$'close'`, `\close`). The same header already says
    plain quotes around the subcommand are covered (B1.105). Not blocking.
  - The docs list as out of reach "a flag or refspec held in a variable" and "words joined by ${IFS} or another
    expansion". Two spellings exit 0 on both hooks and do not clearly fit either phrase:
    - `{-d,}` and `{,--delete-branch}`: brace expansion yields a bare `-d`.
    - `$X-d` and `"$X"-d`: an empty variable before a literal flag.
  - These gaps are older than this card and outside its acceptance, which covers quotes, `\` and `$'…'`/`$"…"`. They
    belong in the follow-up card below, not here.
- Merge path: `gh pr merge 7 $'-d'` and `\-d` exit 2 with the merge message on both hooks (B1.103), as plan-review
  note 1 says.

### Findings

```
[1] KIND: plan-mismatch
    WHERE: backlog/work/B1.107/pr-body.md:25 (Plan section, "filed as a follow-up card with B (`sed` form) as its proposed fix")
    DEFECT: the PR body says the `gh pr $'merge' 7` merge gap is filed as a follow-up card, but no such card exists.
    TRIGGER: `grep -rl "\$'merge'" backlog/` at 2bf0ac0 lists only backlog/work/B1.107/{plan,review,pr-body}.md; `gh pr list --state all` shows no filing PR after #390.
    WRONG BEHAVIOUR: the plan says that on `approve` the dev-lead files the merge gap, an open path for an agent to merge (exit 0 today, D-9), as a card. Until that card exists, nothing on main tracks the gap, yet the lead reading PR #390 is told it is filed.
    CONFIDENCE: confirmed
```

The fix does not touch the diff. File the card in the "Filing a card" lane (its own PR), and add brace expansion
(`{-d,}`) and an empty variable before the flag (`$X-d`) to it, or change the PR body to "to be filed". Do this before
PR #390 leaves draft.

Verdict: ready for PR. The code and probes are ready. Finding 1 is in the PR body, not the code; the dev-lead resolves
it when filling the body's pending Verification and Review sections.

Riskiest unfalsified: CI runs bash 5, and I ran only `/bin/bash` 3.2 locally. The new class `[\"'\\\\$]*` inside a
double-quoted assignment could expand differently under bash 5's `=~`. The same class already works in `GH_PR_FLAGS`
and `PUSH_FORCE` in CI, so I could not falsify it, but I did not run it there.
