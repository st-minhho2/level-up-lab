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
