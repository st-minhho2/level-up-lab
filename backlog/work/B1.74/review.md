# B1.74 review

## Plan review (round 1)

SCOPE: all (tooling, no §: `.claude/agents/`, `scripts/`, `backlog/`). Plan at `9601555`. Read: card B1.74
(`backlog/plan/E1-todos.md`), `advice.md`, `plan.md`, `.claude/agents/dev-lead.md`, `.claude/hooks/guard-bash.sh`,
`.claude/settings.json`, `scripts/agent/run.sh` (ALLOW, DENY, `mode()`), `scripts/hook-smoke.sh`, `lefthook.yml`,
`.github/workflows/ci.yml` (job `test`), `backlog/work/B1.65/live.md` (run 3), B1.69's plan and plan review (precedent
for tooling rows), D-1 to D-29.

Probes run (none on the tree; scratch git repos under the session scratchpad, the repo's `.prettierrc` and
`.prettierignore`, a `pnpm` shim to this worktree's `node_modules/.bin/prettier` 3.9.10, the block extracted from
`advice.md` with `<card>` = `B9.9`):

- `scripts/next-task.sh --check B1.74` → `[next-task] B1.74: no overlap with any Doing or Review card` (exit 0)
- `scripts/agent/tier.sh backlog/work/B1.74/plan.md` → `high`; `plan-files.sh --file` → 5 tokens, all in the table;
  `scripts/ci/check-plan-scope.sh` → `OK: chore/B1.74-review-format changes only paperwork`
- Baselines the plan quotes: `hook-smoke.sh` → `hook-smoke: 511 probes OK`; `run-smoke.sh` → `17 probes OK`;
  `check-backlog.sh` OK; `check-agent-frontmatter.sh` → `OK: 13 files`. All match.
- `guard-bash.sh` on the block: exit 0 as the multi-line block, as one line (`;`-joined, the plan's Interfaces form) and
  `cd <wt> && …`-prefixed, under bash 3.2 (host) and bash 5.2 (`level-up-lab-runner-runner` image). `settings.json`
  deny rules and `run.sh` DENY (`git -c*`, `git * -c *`, `git config*`) match none of its subcommands (`git add`,
  `git show`, `git restore`; no `-c`, no `config`).
- Shells: bash 3.2.57 + BSD `tr` (macOS), zsh 5 (macOS, the interactive Bash tool's shell here), bash 5.2.15 + GNU
  `tr` 9.1 + git 2.39.5 (runner image, `--network none`). Same verdict in all three for every case below.
- All 56 real `backlog/work/*/review.md`, unformatted on a copy (separator rows to `|---|`, cell padding collapsed,
  `- ` bullets to `* `): **56 of 56** exit 0, file byte-equal to Prettier's own output, staged, nothing unstaged
  (bash 3.2 and bash 5.2; zsh on B1.69, B1.65, B2.3).
- Mixed input (setext heading, `*`/`+` bullets, `__strong__`, `*em*`, `~~~` fence, aligned table, a `Verdict:` line
  folded into the table): exit 0, formatted, staged. Already formatted: exit 0, byte-identical (FR5 path).
- Round 2 appended unformatted to a committed round 1: exit 0, formatted, staged. Same with a formatter that also turns
  `approved` into `rejected`: exit 1, round 2 back as written and unstaged, nothing staged (the pre-block state).
- Word-changing formatter on an untracked file, and a formatter that exits 2: exit 1, stderr
  `review.md not committed: …`, file byte-identical to the reviewer's, nothing staged (`git restore --staged` on a path
  not in HEAD unstages it, git 2.39.5).
- **False stops on Prettier's own output** (reason 1): an ordered list numbered `1. 2. 4.` (Prettier writes `3.`) and
  one numbered `1. 1. 2.` (Prettier writes `1.`) → exit 1; a ` ```ts ` block with `.5`, `0XFF`, `1E5` (Prettier writes
  `0.5`, `0xff`, `1e5`) and a ` ```json ` block with `1.50` (Prettier writes `1.5`) → exit 1. In each, Prettier changed
  only formatting, and the block restored the file and stopped.

| Check                                                                | Result                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                       | pass. Four Files rows map to the card's Acceptance and Test lines; `scripts/CLAUDE.md` is the doc row for the new probes; `backlog/work/B1.74/*` are the artifacts                                                                                                                    |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | n/a (no `src/`). The block, its exit contract, the stop line and FR1–FR6 are pasted                                                                                                                                                                                                   |
| follows `advice.md` or states the deviation                          | pass on approach A. The deviation from the card's `git diff -w` is stated as decision 1 and the card amendment is a Files row. Decision 1 states one cost of the replacement check and leaves out the other (reason 1)                                                                |
| ≤ 7 criteria, measurable Thens                                       | pass. The card's Acceptance has 5 clauses (Prettier `--write` on that file only, format only or stop, no Write/Edit, ALLOW already holds it, label); FR1–FR6 each name an exit code, a byte comparison or a staged state                                                              |
| verification lists exact commands with expected numbers              | pass. Red: `hook-smoke.sh` FR1–FR6 FAIL, the other 511 ok; green: `hook-smoke: 517 probes OK`, `run-smoke.sh` `17 probes OK`, the named `scripts/ci` checks. 517 holds only if FR1 is one `probe` call (note 4)                                                                       |
| work breakdown, convention subjects                                  | pass for a tooling card (B1.62 and B1.69 precedent: no skeleton, no map): `test(scripts): B1.74 review format probes` without `(red)` (B1.62 #185), `chore(agents): B1.74 …` (`chore(agents): B1.55 …` precedent), reviewer diff, PR. The card amendment's commit is unnamed (note 4) |
| `Lead approves spec` box                                             | n/a: no § (tooling, D-27 card)                                                                                                                                                                                                                                                        |
| no settled D-n contradicted                                          | pass. D-19 label stated; D-28 tier `high` matches `tier.sh`; D-27 does not apply (interactive, no `agent-ready` issue), so the lead's `approve` is the gate; D-25 not engaged                                                                                                         |
| `scripts/next-task.sh --check B1.74`                                 | `[next-task] B1.74: no overlap with any Doing or Review card`                                                                                                                                                                                                                         |

Verdict: changes requested

1. **Decision 1 states one cost of the word-sequence check, not both.** The plan gives the blind side ("a change
   touching no letter or digit") but not the other: the check rejects formatting-only Prettier output in two classes,
   measured above under bash 3.2, zsh and bash 5.2. (a) Ordered-list renumbering: `1. 2. 4.` becomes `1. 2. 3.`, and
   `1. 1. 2.` becomes `1. 1. 1.`. The reviewer's "numbered reasons" are exactly this shape, so a reason deleted or
   misnumbered while drafting is enough. (b) Code fences Prettier formats (`ts`, `js`, `json`, `yaml`): numeric literals
   are normalised (`.5`→`0.5`, `0XFF`→`0xff`, `1E5`→`1e5`, `1.50`→`1.5`). Both are safe stops (no bad commit), but
   in a run each ends at the review commit with no D-27 line, the run-3 outcome this card exists to remove. None of
   the 56 committed reviews hits either class today, but those files are already formatted, so this does not show
   what a reviewer writes before formatting. The plan must (i) name this cost in decision 1 and say what happens after
   such a stop (who acts: the lead, or a reviewer re-dispatch, given that "formatting its `review.md` by hand" is
   ruled out for run 4), or (ii) take a mitigation the lead chooses, for example dropping ordered-list markers
   (`^[[:space:]]*[0-9]+[.)][[:space:]]`) from both sides before the compare. In either case, add one probe that pins
   the chosen behaviour on a misnumbered list, because FR1–FR6 leave it unpinned and a later edit could flip it
   without a red.

Notes (not blocking; for the plan's next round or the build):

1. **Permissions.** Guards pass (above). Container runs use `bypassPermissions`. Host runs (`dontAsk`) rely on the
   bare `Bash` in ALLOW admitting a compound command with `$( )` and a function definition [unverified]. Advice's Risks
   names this, but the plan does not carry it. One clause in the plan, or "live runs are container-only", would make
   it visible to the lead. Interactive: a permission prompt for the compound command is a prompt, not a block
   [unverified].
2. **Decision 4 runs before the gate.** This round's `review.md` is committed in Loop 4, before the lead's `approve`,
   so the block (or a hand run of it) is used before the lead "decides" decision 4. Advice's "Bootstrap" risk names the
   authority (the card's Acceptance, lead's choice A). The plan should cite that, not list it as a gate decision. This
   file was written Prettier-clean (`prettier --check` passes), so round 1's run of the block is the FR5 no-op.
3. **FR4 in CI.** The `test` job's `node:24-bookworm` has no git identity. FR4's round-1 commit needs hook-smoke's
   `gs()` form (`-c user.name=smoke -c user.email=smoke@localhost -c core.hooksPath=/dev/null`).
4. **Counts and commits.** "517 probes OK" assumes FR1 is one `probe`. If FR1's five assertions are separate calls,
   the number changes, so state it per call. Name the commit that amends the card (advice: the `docs(backlog)` commit).
5. **Shell.** The interactive Bash tool here runs zsh, and hook-smoke runs the block under bash only. Measured: same
   results under zsh. Optional: name the function something other than `w` (it shadows `/usr/bin/w`; harmless, because
   a missing definition would make the compare fail and stop).

Riskiest unfalsified: a host `run.sh` run under `dontAsk` denying the compound block (not exercised; container runs
bypass it).

## Plan review (round 2)

SCOPE: all (tooling, no §). Plan at `f968ba4` (diff from `9601555`: decision 1 costs and stop path, the new `w()`,
FR7, FR4 identity, per-call count 518, the host `dontAsk` risk, decision 4 authority). Files table rows unchanged
except FR1–FR7.

Probes run (none on the tree; the round-1 harness re-run in scratch git repos with the repo's `.prettierrc` and
`.prettierignore`, Prettier 3.9.10 through a `pnpm` shim, the plan's block verbatim with `<card>` = `B9.9`):

- `scripts/next-task.sh --check B1.74` → `[next-task] B1.74: no overlap with any Doing or Review card` (exit 0);
  `scripts/agent/tier.sh` → `high`; `check-plan-scope.sh` → `OK: chore/B1.74-review-format changes only paperwork`;
  `prettier --check` on `plan.md` → clean.
- Shells: bash 3.2.57 + BSD `sed` and `tr` (macOS); bash 5.2.15 + GNU `sed` 4.9 + GNU `tr` 9.1 + git 2.39.5 + node
  24 (`level-up-lab-runner-runner` image, `--network none`). Identical result lines in both for every case below.
- All 56 `backlog/work/*/review.md`, unformatted on a copy: **56 of 56** exit 0, byte-equal to Prettier, staged,
  nothing unstaged (both shells).
- Renumbering (the round-1 reason): `1. 2. 4.`, `1. 1. 2.`, nested `1. 3.` under `4.`, `1) 2) 5)`, `10. 11. 13.`,
  and a misnumbered list appended as round 2 to a committed round 1 → exit 0, byte-equal to Prettier, staged.
- Word changes still rejected: a formatter that also turns `approved` into `rejected`, on an untracked file, on a
  round 2 appended to a committed round 1, and inside numbered items (`1. approved first`) → exit 1, file
  byte-identical to the reviewer's, nothing staged. Prettier exit 2 → same. Already formatted → exit 0, unchanged.
- Code fences: ` ```ts ` (`.5`, `0XFF`, `1E5`) and ` ```json ` (`1.50`) → exit 1, as decision 1 now states.
- `guard-bash.sh` on the new block (multi-line, and `cd <wt> && …` on one line): exit 0 under bash 3.2 and 5.2.
- **New false stop the line-start strip introduces** (reason 1). In a paragraph or list-item continuation, a
  hard-wrapped line that starts with `N.` or `N)` (N ≠ 1) cannot open a list, so Prettier joins it onto the line
  above (`proseWrap` is unset, `preserve`). The `sed` strips `N.` from the reviewer's copy (line start) but not from
  Prettier's (now mid-line), so the words differ. Inputs: `…round\n2) as well`, `…(exit\n0) and…`,
  `…in\n2024. it stopped` → exit 1 with the new `w()`, exit 0 with round 1's. Realistic rate: the 56 reviews with
  their plain paragraphs re-wrapped greedily (list continuations left alone, so an undercount) → new `w()` rejects
  1 of 56 at 80 columns, 2 at 90, 3 at 100 (B1.13 `…should say\n13. P13's…`, B1.24, B1.25), 0 at 110 and 120; round
  1's `w()` rejects 0 of 56 at every width. These reviews mention `N.` / `N)` mid-line 514 times.

| Check                                                                | Result                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                       | pass (rows unchanged from round 1; FR7 added to the two probe rows)                                                                                                                                                                       |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | n/a (no `src/`). The new `w()`, the exit contract, the stop line and FR1–FR7 are pasted                                                                                                                                                   |
| follows `advice.md` or states the deviation                          | pass on approach A; the `git diff -w` deviation and the card amendment commit are stated. Decision 1 lists the code-fence cost but not the false stop its own new `sed` adds (reason 1)                                                   |
| ≤ 7 criteria, measurable Thens                                       | pass. 5 Acceptance clauses; FR1–FR7 each name an exit code, a byte comparison or a staged state                                                                                                                                           |
| verification lists exact commands with expected numbers              | pass. Red: FR1–FR7 FAIL, one `probe` each, other 511 ok; green `hook-smoke: 518 probes OK`, `run-smoke.sh` `17 probes OK`, named checks. Round-1 notes 1, 3 and 4 are carried (host `dontAsk` risk, FR4 identity, per-call count, commit) |
| work breakdown, convention subjects                                  | pass (unchanged; card amendment commit now named `docs(backlog): B1.74 Acceptance check clause`)                                                                                                                                          |
| `Lead approves spec` box                                             | n/a: no § (tooling)                                                                                                                                                                                                                       |
| no settled D-n contradicted                                          | pass. D-19, D-28 (`high`), D-27 not engaged; decision 4 now cites the card's Acceptance as its authority (round-1 note 2)                                                                                                                 |
| `scripts/next-task.sh --check B1.74`                                 | `[next-task] B1.74: no overlap with any Doing or Review card`                                                                                                                                                                             |

Verdict: changes requested

1. **The round-1 reason is answered, and the answer adds a false stop the plan does not state.** Renumbered lists
   now pass and word changes are still rejected (above). But the line-start strip rejects Prettier's own output
   whenever the reviewer's hard wrap puts `N.` or `N)` (N ≠ 1) at the start of a continuation line: 1 to 3 of the
   56 reviews at 80–100 columns, against 0 for round 1's `w()`. It is a safe stop (nothing staged), but in a run it
   ends at the review commit with no D-27 line, the outcome this card removes, and the reviewer cannot see why: its
   text has no misnumbered list. The plan must (i) add this cost to decision 1's Costs with the measured rate, or
   (ii) take a variant that drops `N.`/`N)` followed by a space or line end anywhere, not only at line start. One
   measured candidate, both shells' `sed -E`:
   `w() { sed -E 's/[0-9]+[.)]([[:space:]]|$)/ /g' | LC_ALL=C tr -cs '[:alnum:]' ' '; }` → exit 0 on B1.13, B1.24,
   B1.25 at 100 columns, the three join inputs, `1. 2. 4.`, `1. 1. 2.`, nested; exit 1 on a word change inside a
   numbered item (bash 3.2 only; the 56-file run and bash 5.2 not repeated for it). Its cost: blind to a change of
   any number written as `N.` or `N)` before a space, such as `(exit 0) ` becoming `(exit 1) `. Either way, pin the
   choice with one probe (a continuation line starting `2)`), because FR1–FR7 leave it unpinned.

This is the last plan round the cap allows: a third round goes to the lead ("Waiting on human"), who can also take
(i) or (ii) at the gate directly.

Notes (not blocking):

1. Plan length 67 lines (round 1: 57) against `planning.md`'s ≈ 40. B1.13's 61 was let through with a note; this
   is a note too.
2. The current strip is also blind to a change in a line-start number that is not a list marker (`3.14` at line
   start loses `3.`). Decision 1 says "or only a list number"; "or a number at a line start followed by `.` or `)`"
   is exact.

Riskiest unfalsified: a host `run.sh` run under `dontAsk` denying the compound block (still not exercised; container
runs bypass it).

## Diff review (pass 1)

SCOPE: all (tooling, no §: `.claude/agents/dev-lead.md`, `scripts/hook-smoke.sh`, `scripts/CLAUDE.md`,
`backlog/`). Diff `origin/main...e6230d0`: 8 files, 788 insertions, 47 deletions. Red `10aa7db`, green `e6230d0`,
card clause `782f0a1`. No merge commits on the branch.

Command results (run by me in this worktree; last line of each):

| Command                                                            | Result                                                                                                                                                                                                         |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                        | `All matched files use Prettier code style!` (exit 0)                                                                                                                                                          |
| `pnpm typecheck`                                                   | `tsc --noEmit`, no output (exit 0)                                                                                                                                                                             |
| `pnpm test`                                                        | `Tests  202 passed (202)`                                                                                                                                                                                      |
| `pnpm test:e2e`                                                    | `43 passed (1.0m)`                                                                                                                                                                                             |
| `pnpm test:mutation`                                               | `Final mutation score of 93.40 is greater than or equal to break threshold 70` (no `src/` change)                                                                                                              |
| `scripts/hook-smoke.sh`                                            | `hook-smoke: 519 probes OK`, FR1–FR8 ok                                                                                                                                                                        |
| `scripts/agent/run-smoke.sh` · `tier-smoke.sh`                     | `17 probes OK` · `9 probes OK`                                                                                                                                                                                 |
| `check-suppressions` · `check-feat-commits`                        | `OK: no new suppressions` · `OK: no feat commit touches tests`                                                                                                                                                 |
| `check-config-change.sh`                                           | `::error::Protected configuration changed without the 'config-change-approved' label: .claude/agents/dev-lead.md`. Expected before the PR exists; the plan and the card commit to the label (D-19)             |
| `check-ac-coverage` · `check-spec-sections` · `check-features-map` | `OK: every criterion of a shipped section has a test` · `OK: sections cited: 1 … 22` · `OK`                                                                                                                    |
| `check-plan-scope` · `check-backlog` · `check-agent-frontmatter`   | `OK: … stays inside the approved plan of B1.74` · `OK: README matches the cards` · `OK: 13 files`                                                                                                              |
| `scripts/verify-red.sh B1.74`                                      | `::error::no 'test(<pkg>): B1.74 … (red)' commit`. Expected: the plan names the red commit without `(red)` (B1.62 #185: a probe-only `(red)` fails `guards`); CI's `--auto` finds no `(red)` commit and passes |
| red proven by hand                                                 | `10aa7db` exported to a scratch repo: `hook-smoke.sh` → 511 `ok`, `FAIL` FR1–FR8 only (FR2–FR8 rc 99), `hook-smoke: FAILURES above`                                                                            |
| `git diff --stat main...HEAD`                                      | `8 files changed, 788 insertions(+), 47 deletions(-)`                                                                                                                                                          |

Probes (scratch copies under `$TMPDIR/probe74`, the real block extracted from `dev-lead.md` as hook-smoke does, the
repo's `.prettierrc`/`.prettierignore`, Prettier through a `pnpm` shim, bash 3.2 + BSD `sed`/`tr`):

- Hand mutants of the block against an FR1–FR8 harness cut from `hook-smoke.sh`: killed: no squeeze (FR2, FR4),
  no `g` (FR8), no final `git add` (FR2, FR4, FR7, FR8), no worktree restore (FR3), restores swapped (FR3), no
  `false` (FR3, FR6), `cat "$f"` for `git show ":$f"` (FR3), no first `git add` (FR2–FR5, FR7, FR8), strip any digit
  run (FR7). **Survived:** `[:alnum:]` → `[:alpha:]` (finding 2), `[.)]` → `[.]` (finding 3), `([[:space:]]|$)` →
  `[[:space:]]`, `LC_ALL=C` dropped (notes).
- Edge inputs on the real block: no final newline ending in `.` → exit 0; `1) 2) 4)` → exit 0, staged; CRLF, leading
  blank lines, `&amp;`, `snake_case`/`__bold__`, tab code block, YAML front matter → exit 0, staged. **No final
  newline ending in a letter or digit → exit 1** (finding 1).
- `guard-bash.sh` on the block as written and `cd <wt> && …`-prefixed: exit 0. `run.sh` ALLOW line 40 holds
  `Bash(pnpm exec prettier *)` (card clause holds).
- Your concern 2: `.prettierrc` has no `overrides`, so `--stdin-filepath x.md` from the root and the copied config in
  the scratch repo resolve the same options; FR2's comparison is sound.

Checklist:

| Check                                                | Result                                                                                                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance clause has a probe matching it      | partial. "Prettier on that file only" FR1; "format only, else stop" FR2–FR8; but "letters **and digits**" and "`N.` **or `N)`**" are unpinned (findings 2, 3) |
| no test weakened after red                           | pass. `git log --first-parent --no-merges 10aa7db..HEAD -- scripts/hook-smoke.sh '*.test.*' e2e/` empty; no merges, so the `--remerge-diff` check is empty    |
| every changed file in `plan.md`                      | pass. The five Files rows; `scripts/CLAUDE.md` is fully re-padded by Prettier (`git diff -w` shows the one row and the separator)                             |
| interfaces match the plan                            | pass. The block in `dev-lead.md` is byte-identical to the plan's Interfaces block (multi-line form); stop line as planned                                     |
| Zod, Prisma, raw SQL, migration                      | n/a (no `src/`, no `prisma/`)                                                                                                                                 |
| no secret, no suppression                            | pass (`check-suppressions` OK; no env or key paths touched)                                                                                                   |
| features map row moved                               | n/a (tooling, no §; `check-features-map` OK)                                                                                                                  |
| would a probe fail if one changed line were reverted | pass for every line of the block and each pointer (FR1); fails for two tokens inside `w()` (findings 2, 3)                                                    |

Findings:

```
[1] KIND: correctness
    WHERE: .claude/agents/dev-lead.md:112
    DEFECT: w() keeps the final word glued to end-of-input, so a file with no final newline whose last character is a
            letter or digit never equals Prettier's output, which adds the newline.
    TRIGGER: review.md = '# R\n\nVerdict: approved' (no trailing \n; a plan review that approves ends on that line);
             the real block, real Prettier, bash 3.2.
    WRONG BEHAVIOUR: exit 1, "review.md not committed: …", file restored, nothing staged; the card's Acceptance says a
                     formatting-only change is committed (adding a final newline is formatting only), and decision 1's
                     stated costs do not include it. In a run this ends at the review commit with no D-27 line, the
                     run-3 outcome the card removes. Ending in '.' instead: exit 0.
    CONFIDENCE: confirmed (ran it)
```

```
[2] KIND: coverage
    WHERE: scripts/hook-smoke.sh:604-643 (FR1–FR8)
    DEFECT: no probe pins digits in the comparison; the mutant `[:alnum:]` → `[:alpha:]` passes FR1–FR8.
    TRIGGER: dev-lead.md line 112 with `[:alpha:]`, and a formatter that also turns "519 probes" into "518 probes".
    WRONG BEHAVIOUR: mutant block exits 0 and stages the changed count (real block: exit 1, restored); the card's
                     amended Acceptance says "letters and digits in order", so a regression on digits goes unseen.
    CONFIDENCE: confirmed (ran it)
```

```
[3] KIND: coverage
    WHERE: scripts/hook-smoke.sh:635-643 (FR7, FR8)
    DEFECT: no probe pins the `)` list marker; the mutant `[.)]` → `[.]` passes FR1–FR8 (FR8's `2)`/`0)` are kept on
            both sides by that mutant, so its words still match).
    TRIGGER: dev-lead.md line 112 with `[.]`, review.md '# R\n\n1) a\n2) b\n4) c\n' (Prettier writes `3) c`).
    WRONG BEHAVIOUR: mutant block exits 1 (false stop) on a renumbered `N)` list, which the Acceptance ("every `N.` or
                     `N)`") and decision 1 accept; real block: exit 0, staged.
    CONFIDENCE: confirmed (ran it)
```

Notes (not blocking):

1. Your concern 1: `$FRR` and its eight scratch repos are never removed, while the section before it ends with
   `rm -rf "$LS" "$GS"`. Add `rm -rf "$FRR"` at the section end when the probes are touched for findings 1–3.
2. Your concern 3: two strings (the block's stderr and dev-lead's report line) are fine; the stderr is diagnostic and
   the report line is what "Waiting on human" carries. They share the "not committed: Prettier failed or changed more
   than formatting" tail, so a grep finds both.
3. Surviving low-value mutants: dropping `|$` and dropping `LC_ALL=C` change behaviour only on a line-end `N.` that
   Prettier moves mid-line, or on non-ASCII text (already a stated blind spot). No probe needed unless you want one.

Verdict: back to test-writer

Order: a `test(scripts): B1.74 …` commit with FR9 (no final newline, last character a letter → exit 0, formatted,
staged; red today) and hardening probes for findings 2 and 3 (a digit-changing formatter → refused; `1) 2) 4)` →
accepted), then a `chore(agents)` fix to `w()` for finding 1 (for example, end both sides with a fixed separator),
then pass 2. `hook-smoke` count and `scripts/CLAUDE.md` (FR1–FR8) change with them.

Riskiest unfalsified: a host `run.sh` run under `dontAsk` denying the compound block (not exercised; container runs
use bypassPermissions).

## Diff review (pass 2)

SCOPE: all (tooling, no §). Diff `origin/main...34555ed`: 8 files, 921 insertions, 47 deletions. Since pass 1
(`e6230d0..34555ed`): `324fcc7` test FR9–FR11, `0b6a49d` fix `w()` and the `scripts/CLAUDE.md` row, `ba5b1b5` and
`34555ed` plan "Changed after approval" and its re-approval line. No merge commits on the branch.

Command results (run by me in this worktree; last line of each):

| Command                                                            | Result                                                                                                                                          |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                        | `All matched files use Prettier code style!`                                                                                                    |
| `pnpm typecheck`                                                   | exit 0, no output                                                                                                                               |
| `pnpm test`                                                        | `Tests  202 passed (202)`                                                                                                                       |
| `pnpm test:e2e`                                                    | `43 passed (54.8s)`                                                                                                                             |
| `pnpm test:mutation`                                               | `Final mutation score of 93.40 is greater than or equal to break threshold 70` (no `src/` change)                                               |
| `scripts/hook-smoke.sh`                                            | `hook-smoke: 522 probes OK`, FR1–FR11 ok                                                                                                        |
| `scripts/agent/run-smoke.sh` · `tier-smoke.sh`                     | `17 probes OK` · `9 probes OK`                                                                                                                  |
| `check-suppressions` · `check-feat-commits`                        | `OK: no new suppressions` · `OK: no feat commit touches tests`                                                                                  |
| `check-config-change.sh`                                           | `::error::Protected configuration changed without the 'config-change-approved' label: .claude/agents/dev-lead.md`. Expected until the PR has it |
| `check-ac-coverage` · `check-spec-sections` · `check-features-map` | `OK: every criterion of a shipped section has a test` · `OK: sections cited: 1 … 22` · `OK`                                                     |
| `check-plan-scope` · `check-backlog` · `check-agent-frontmatter`   | `OK: … stays inside the approved plan of B1.74` · `OK: README matches the cards` · `OK: 13 files`                                               |
| `scripts/verify-red.sh B1.74`                                      | `::error::no 'test(<pkg>): B1.74 … (red)' commit …`. Expected, as in pass 1 (no `(red)` marker by plan, B1.62 #185)                             |
| red of `324fcc7` proven by hand                                    | tree exported to a scratch repo: `hook-smoke.sh` → 521 `ok`, `FAIL FR9` only, `hook-smoke: FAILURES above`                                      |
| `git diff --stat main...HEAD`                                      | `8 files changed, 921 insertions(+), 47 deletions(-)`                                                                                           |

Probes (scratch copies only; the block extracted from `dev-lead.md` as hook-smoke does; real Prettier via a `pnpm`
shim; bash 3.2 + BSD `sed`/`tr` unless named):

- Pass-1 findings re-checked. [1] `'## Plan review (round 1)\n\nVerdict: approved'` (no final newline) → exit 0,
  staged, final `\n` (bash 3.2 and zsh). [2] mutant `[:alnum:]` → `[:alpha:]` on a copy of HEAD: `FAIL FR10`. [3]
  mutant `[.)]` → `[.]`: `FAIL FR11`. `1) 2) 4)` under zsh → exit 0, staged.
- Mutants of the new `{ cat; echo; }`: dropped → `FAIL FR9`; `{ echo; cat; }` → `FAIL FR9`; `tr -cs` → `tr -c` →
  `FAIL FR2 FR4 FR9`. Survivors: `([[:space:]]|$)` → `[[:space:]]` and `LC_ALL=C` dropped (pass-1 note 3, unchanged),
  `[0-9]+` → `[0-9]*` (equivalent: it only drops `.`/`)` that `tr` drops anyway).
- Edge inputs on the real block, all exit 0 and staged: a join at end of file with no final newline (`…exit\n0)`), an
  unclosed ` ```bash ` fence (Prettier closes it), CRLF with no final LF, trailing spaces with no final newline,
  `- b 12` at end of file, `next is\n10. done`.
- `guard-bash.sh` on the new block, as written and `cd <wt> && …`-prefixed: exit 0.
- No test weakened: `git log --first-parent --no-merges 10aa7db..HEAD -- scripts/hook-smoke.sh '*.test.*' e2e/` →
  `324fcc7` only, a `test(scripts)` commit; its one removed line is the `chmod +x` line, re-added with `"$FRR/digit/pnpm"`.
  FR1–FR8 untouched. `0b6a49d` touches no probe. Pass-1 note 1 done: `rm -rf "$FRR"` closes the section.

Checklist:

| Check                                                | Result                                                                                                                                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance clause has a probe matching it      | pass. "letters and digits" FR3, FR10; "every `N.` or `N)`" FR7, FR8, FR11; final newline FR9; "that file only" FR1; stop path FR3, FR6, FR10                            |
| no test weakened after red                           | pass (above); no merges, so `--remerge-diff` is empty                                                                                                                   |
| every changed file in `plan.md`                      | pass. Same five Files rows; `check-plan-scope` OK. `scripts/CLAUDE.md` again fully re-padded by Prettier: `git diff -w` is the one row, FR1–FR8 → FR1–FR11              |
| interfaces match the plan                            | pass. `dev-lead.md`'s `w()` is byte-identical to the plan's Interfaces line 44 as changed after approval; the block shape and stop line are unchanged                   |
| Zod, Prisma, raw SQL, migration                      | n/a (no `src/`, no `prisma/`)                                                                                                                                           |
| no secret, no suppression                            | pass                                                                                                                                                                    |
| features map row moved                               | n/a (tooling, no §)                                                                                                                                                     |
| would a probe fail if one changed line were reverted | pass. Each pass-1 change reverted alone (no echo, `[:alpha:]`, `[.]`) turns exactly one FR red; the three survivors above change behaviour on no realistic review input |

Findings: none blocking.

Notes (not blocking; for the PR step):

1. `pr-body.md` is the pre-pass-1 draft. Line 55 still shows the old `w()` (no `{ cat; echo; }`), lines 6, 45, 46 and
   69 say FR1–FR8, and line 71 says 519. Copy `plan.md` into it again, with 522 and FR1–FR11, before
   `pr-step.sh open`. Otherwise the lead reads an interface the branch no longer has.
2. `plan.md` Files rows (lines 34–35) and Verification (lines 58–60) still say FR1–FR8 and 519. The "Changed after
   approval" paragraph overrides them, so this does not block. The plan is 75 lines (round-2 note 1).
3. `dev-lead.md` line 118 is now 171 columns: the sentence was extended without re-wrapping. Prettier leaves it
   (`proseWrap` preserve). Cosmetic.

Verdict: ready for PR

Riskiest unfalsified: a host `run.sh` run under `dontAsk` denying the compound block (still not exercised; container
runs use bypassPermissions).
