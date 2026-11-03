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
