# B1.74 advice — dev-lead formats a reviewer's review.md (tooling, no §)

Direction is the lead's (card Acceptance, "choice A", 2026-11-03): dev-lead runs Prettier on the card's `review.md`,
format only, never Writes or Edits it. This file settles the open mechanics: where the text goes, which check proves
"format only", the red-first probe, the tier, and run 4. Three facts were measured, not assumed (scratch repos under the
session scratchpad, the repo's `.prettierrc` and its own `node_modules/.bin/prettier`):

- `git diff -w` is **not** a valid format-only check. On a review with a table and bullets, Prettier's output made
  `git diff -w` exit 1: the table separator row `|---|---|` becomes `| ------ | ------ |` (the dash run is
  re-lengthened to the column width, which is not whitespace), `* item` becomes `- item`, `*em*` becomes `_em_`, and a
  blank line is inserted between two list kinds. A `git diff -w` stop would fire on exactly the files the step exists for.
- `.prettierrc` has no `proseWrap`, so Prettier keeps line breaks (`preserve`): nothing is re-wrapped.
- Run from the parent checkout, Prettier skips a file under `.worktrees/` silently (exit 0, file untouched, because
  `.prettierignore` holds `.worktrees`); run from inside the worktree it formats it. This is the interactive cause (Q3).

## Approaches

### A (recommended): one fenced block in dev-lead.md, word-sequence check, probe in `hook-smoke.sh`

- **Change:** a new section `## Committing a review` in `.claude/agents/dev-lead.md` (between the Loop and
  `## Role brief template`), plus three one-clause edits: the preamble (line 16: never Write or Edit a card's
  `review.md`; the only change you make to it is Prettier's, below), Loop 4 (line 61: every commit that holds a
  `review.md` follows the section) and Loop 7 (line 84: each pass's `review.md` the same way). The section text:

````markdown
## Committing a review

The reviewer writes `work/<card>/review.md`; you commit it and never write or edit it. Lefthook runs
`prettier --check` on it, and `format-after-edit.sh` skips a file under `.worktrees/` when the session opened in the
parent checkout (`.prettierignore`), so the file can fail the commit. Before every commit that holds a `review.md`
(Loop 4 each round, Loop 7 each pass; Loop 5's D-27 line waits for that commit), from the worktree's top level:

```bash
f=backlog/work/<card>/review.md
w() { LC_ALL=C tr -cs '[:alnum:]' ' '; }
git add "$f" && pnpm exec prettier --write "$f" && [ "$(git show ":$f" | w)" = "$(w < "$f")" ] && git add "$f" \
  || { git restore -- "$f"; git restore --staged -- "$f"; echo "review.md not committed: Prettier failed or changed more than formatting" >&2; false; }
```

Exit 0: the file is formatted, its letters and digits in order are what the reviewer wrote, and the formatted copy is
staged; commit it as the step says. Not 0: the reviewer's text is back as it was; do not commit it and do not fix it by
hand. Stop and report "Review for <card> not committed: Prettier failed or changed more than formatting."
````

- **Why this check:** `git add` first makes the index hold the reviewer's version whether the file is new (run 3) or
  already tracked (round 2 appended to a committed round 1), so "before" needs no scratch copy. `tr -cs '[:alnum:]' ' '`
  keeps letters and digits in order and drops everything else, so every Prettier normalisation (padding, separator
  dashes, bullets, emphasis, escapes, blank lines) passes and any added, removed, reordered or changed word fails.
  Measured: Prettier output accepted; `Verdict: approved` to `rejected` rejected; a deleted bullet rejected. POSIX
  `[ ]` and `$( )` only, no process substitution, bash 3.2 and 5 alike; `LC_ALL=C` makes both sides use the same bytes.
- **Pros:** one place, literally what the card's Acceptance asks (Prettier `--write` on that file only, stop and report
  otherwise); `Bash(git *)` and `Bash(pnpm exec prettier *)` already cover the calls (`run.sh` ALLOW, pinned by
  `run-smoke.sh` lines 174-180: no `run.sh` change); the probe extracts this very block from `dev-lead.md` and runs it, so the text
  cannot drift from what is tested; idempotent where the hook already formatted the file.
- **Cons:** the check is blind to a change that touches no letter or digit (`<` to `>`, an emoji, `!`) and to a change
  that moves text across lines without changing words; the card's literal `git diff -w` is replaced (Doc drift below);
  the block is a compound command (see Risks, permissions); relies on the model pasting a block (a probe pins the
  text, not the model's behavior).
- **Fits rules:** yes: no Write or Edit of `review.md` (the path-guard line `'!backlog/work/*/review.md'` stays and
  is pinned by hook-smoke's role probes); no hook bypass; no new dependency; no `src/` change.

### B (alternative): the same logic as `scripts/ci/format-review.sh <card>`

- **Change:** an executable that does the block's work and prints the stop message; `dev-lead.md` gets one line per
  commit point (`scripts/ci/format-review.sh <card>`); `hook-smoke.sh` runs the script directly (no extraction from
  markdown). `Bash(scripts/ci/*)` is already in ALLOW.
- **Pros:** shorter prompt text; the probe calls a file, no `awk` over markdown; one place to fix the check.
- **Cons:** a new file under `scripts/ci/` (CONFIG_PROTECTED) whose other residents are CI guards, so it also needs a
  `scripts/CLAUDE.md` row; the Acceptance's "dev-lead runs `pnpm exec prettier --write`" becomes indirect and
  `grep -ci prettier .claude/agents/dev-lead.md` stays 0, so the card's own red evidence no longer applies; one more
  file to keep in step with the prompt; a probe must still prove dev-lead calls it (a text grep).
- **Fits rules:** yes, nothing forbidden. Not recommended: the lead chose the inline form and A satisfies it exactly.

Rejected variants: `git diff -w` as written in the card (false stops, measured above); `prettier --check` alone
(proves nothing about words); letting the reviewer run Prettier on its own file (`reviewer.md`: "Bash is for reading,
running the gates, and probing a copy, never for editing the tree", and it would not cover a verdict that arrives
unformatted from another path).

## Recommendation

**A.** Settled by the card's direction and the measurements above. The plan must state the one deviation from the card
text (the check is the word sequence, not `git diff -w`) so the lead's `approve` covers it; if the lead insists on the
literal `git diff -w`, the step stops on every table and the live run 4 would stop again.

## Impact

| File                                                 | Add/Change                                                                                                                              | Signature                                                                                      | ACs                                 |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------- |
| `.claude/agents/dev-lead.md`                         | Change: preamble clause, Loop 4 and Loop 7 pointers, new `## Committing a review` section with the fenced block (frontmatter untouched) | `bash block, exit 0 = formatted + staged; else restored + stderr "review.md not committed: …"` | Acceptance 1-4 (card has no AC ids) |
| `scripts/hook-smoke.sh`                              | Add: section `== dev-lead formats a reviewer's review.md (B1.74)`, probes FR1-FR6                                                       | `run_block <repo> <pnpm-shim-dir>` helper; empty block returns 99                              | Acceptance 1-3                      |
| `scripts/CLAUDE.md`                                  | Change: the `hook-smoke.sh` row names FR1-FR6                                                                                           | table cell                                                                                     | doc drift                           |
| `backlog/plan/E1-todos.md`                           | Change: B1.74 Acceptance, the check clause only (lead's card; the plan states it)                                                       | text                                                                                           | Acceptance 2                        |
| `backlog/work/B1.74/{advice,plan,review,pr-body}.md` | Add                                                                                                                                     | n/a                                                                                            | n/a                                 |

No client component, `src/`, `prisma/`, `e2e/` or `run.sh` change. `.claude/docs/hooks.md` needs no change in A (no hook
changes; the `format-after-edit.sh` row stays true). Existing probes touched: none edited; `run-smoke.sh` R16 pins the
prompt text, which A does not change.

## Risks

- **Migration:** none.
- **Security:** the step runs Prettier by Bash on a file path dev-lead's path-guard forbids it to Write; the word check
  is the only control on that rewrite (the hook does not see Bash). A Prettier bug or a hostile reviewer file cannot
  smuggle a word change; it can alter symbols. Residual: documented under Cons.
- **Permissions:** ALLOW holds bare `Bash` plus patterns; the block is one compound command (`&&`, `||`, `$( )`, `tr`,
  `[`). Under the container's `bypassPermissions` this is moot; on the host (`dontAsk`) it relies on bare `Bash`
  allowing it. [unverified under a pattern-only reading of ALLOW] Run 4's `permission_denials` (the issue comment's
  line) is the check; do not edit ALLOW (run-smoke pins it exactly).
- **cwd:** from the parent checkout with `.worktrees/...` relative paths Prettier skips the file silently, the word
  check passes (nothing changed), and lefthook then rejects the commit: a stop as today, never a bad commit. The text
  says "from the worktree's top level".
- **Prettier restructuring:** Prettier can fold a line into a table (measured: a `Verdict:` line directly under a table
  became a row). No word changes, so the check passes; that is the reviewer's markdown, not a stop.
- **Bootstrap:** this card's own `review.md` (plan review, diff review) is written before the step exists on main, in
  a nested worktree where the hook skips it. The lead's card Acceptance (2026-11-03) is the authorization to run the same
  block by hand for B1.74's own reviews; say so in the plan. Otherwise B1.74 stops on the defect it fixes.
- **Performance, isolation:** one Prettier call on one file; the block touches only the card's `review.md` and its index entry.
- **Existing tests that could turn red:** `hook-smoke.sh` frontmatter and role probes (frontmatter untouched: no);
  `check-agent-frontmatter.sh` (reads only the frontmatter: no); `tier-smoke.sh` T3 (names the path only: no);
  `run-smoke.sh` R16 (prompt, not `dev-lead.md`: no). `prettier --check` on `dev-lead.md` and `scripts/CLAUDE.md` (lefthook)
  must pass: run `pnpm exec prettier --write` on them (the hook formats them in a non-nested session).
- **New dependency:** none.

## Test strategy

Host: `scripts/hook-smoke.sh` (bash 3.2 and 5; CI job `test` runs it, `run-smoke.sh` is local only, so it would not
guard this). It already needs `node_modules`. Probes run in a scratch git repo (`mktemp -d`, `git init`, the repo's
`.prettierrc` copied) with a `pnpm` shim on PATH that drops `exec` and `prettier` and calls
`$PWD_ROOT/node_modules/.bin/prettier` (the pattern `worktree-smoke.sh` uses). The block is extracted from `dev-lead.md`
(`awk` from the `## Committing a review` heading to the first closing fence, `<card>` replaced by `B9.9`).

| Layer    | File                                                                                                                                                                                                                                                                                                    | ACs             | Mocks                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | -------------------------------- |
| text     | `scripts/hook-smoke.sh` FR1: exactly one `## Committing a review` heading; extracted block non-empty; it holds `pnpm exec prettier --write "$f"` and no `prettier --write .`; Loop 4, Loop 7 and the preamble each name the section; the `!backlog/work/*/review.md` path-guard argument is still there | Acceptance 1, 4 | none                             |
| behavior | FR2: untracked review with `\|---\|` table, `*` bullets, `*em*` → exit 0, file byte-equal to Prettier's own output of a copy, nothing left unstaged (`git diff --quiet`), words equal                                                                                                                   | Acceptance 1, 2 | `pnpm` shim to the real Prettier |
| behavior | FR3: a rogue formatter that also turns `approved` into `rejected` → exit non-zero, stderr holds `not committed`, file byte-identical to the reviewer's original, `git diff --cached --quiet`                                                                                                            | Acceptance 2    | shim that appends a word change  |
| behavior | FR4: round 1 committed formatted, round 2 appended unformatted → exit 0, staged diff is round 2 only, formatted, HEAD untouched                                                                                                                                                                         | Acceptance 1    | real Prettier                    |
| behavior | FR5: already formatted → exit 0, file byte-identical (idempotent)                                                                                                                                                                                                                                       | Acceptance 1    | real Prettier                    |
| behavior | FR6: Prettier exits 2 → exit non-zero, reviewer's text restored, nothing staged                                                                                                                                                                                                                         | Acceptance 2    | shim exits 2                     |

Red today: `run_block` returns 99 when the extracted block is empty, so FR1 fails on its assertion and FR2-FR6 each fail
on their own assertion (FR5 would otherwise pass vacuously: an empty script exits 0). The red commit is the
`hook-smoke.sh` edit alone: `scripts/hook-smoke.sh` → FR1-FR6 FAIL, every older probe `ok` (this is the tooling-card
red; `verify-red.sh` is for vitest files). Green: the `dev-lead.md` commit touches no probe. Manual one-time check of the
card's own red evidence: `grep -ci prettier .claude/agents/dev-lead.md` → 0 before, at least 1 after.

Probe ids: `FR1`-`FR6` (hook-smoke's other ids are S, C, L; `F` is taken by feature-map-smoke, so `FR`).

## Mutation hot spots

Hand mutations to run against the probes (each must turn a named probe red):

1. `--write` to `--check` in the block: FR2 (file unformatted), FR4.
2. Drop the first `git add "$f"`: `git show ":$f"` fails on an untracked file, FR2 exit non-zero.
3. Drop the final `&& git add "$f"`: FR2 and FR4 (formatted copy not staged).
4. Replace `[:alnum:]` with `[:space:]` (compare everything but whitespace): FR2 (separator dashes, bullets).
5. Replace the compare with `true`: FR3 (word change accepted).
6. `&&` before the compare to `;`: FR3 and FR6 (exit status).
7. Drop `git restore -- "$f"`: FR3 and FR6 (original not restored). Drop `git restore --staged`: FR3 (`--cached` not empty).
8. Rename the heading or fence: FR1 and the empty-block guard (FR2-FR6 return 99).
9. Remove the Loop 4 or Loop 7 pointer: FR1.
10. A `prettier --write .` or `backlog/work/*/review.md` glob in the block: FR1's "no broader than the one file" assertion.

## Questions settled / escalated

```
Question:    Where does the step go and what is its exact text and check (is `git diff -w` right)?
Class:       P3 section contradicts itself
Sources:     backlog/plan/E1-todos.md:962 "the commit is formatting only (`git diff -w` of the file before and after shows no word changed)"
             .prettierrc:5 "printWidth": 120
             lefthook.yml:23 "run: pnpm exec prettier --check {staged_files}"
             .claude/agents/dev-lead.md:61 "Approved → fill `Plan review: approved, round N`, commit."
             .claude/agents/dev-lead.md:84 "`/review-loop` (reviewer diff mode, dispositions, ≤ 3 passes, `mark-reviewed.sh`)"
Conflict:    The card says the intent is "no word changed" and names `git diff -w` as the proof. Measured: `git diff -w`
             exits 1 on Prettier's own table, bullet and emphasis output, so the mechanism contradicts the intent.
             .prettierrc has no proseWrap (default preserve): no re-wrap, so line breaks are not the problem; separator
             dashes, `*` to `-`, `*` to `_` and blank lines are.
Verdict:     The card's intent governs (authority 4/5: a card is a plan input, a probe is evidence); the mechanism is an
             implementation choice recorded in plan.md. Step in dev-lead.md only: a new `## Committing a review`
             section, pointers from Loop 4 (line 61) and Loop 7 (line 84), preamble clause (line 16). Not in the
             review-loop skill: it states no commit of `review.md`, runs inside dev-lead's Loop 7, and a second copy
             would drift. Check: the block above (`git add`, Prettier `--write`, letters-and-digits sequence equal,
             `git add`; else restore, message, exit non-zero). Stop message: "review.md not committed: Prettier failed
             or changed more than formatting" (stderr) and the report line "Review for <card> not committed: Prettier
             failed or changed more than formatting."
Next action: plan.md Files lists the dev-lead.md section and the card Acceptance amendment, states the deviation from
             `git diff -w`; the lead's `approve` covers it.
Must not:    Paste `git diff -w` as the check (it stops on every table), or add the step to the review-loop skill and
             dev-lead.md both.
Doc drift:   backlog/plan/E1-todos.md B1.74 Acceptance: replace "(`git diff -w` of the file before and after shows no
             word changed)" with "(the letters and digits of the file, in order, are the same before and after)"; in
             the docs(backlog) commit of this PR, with the lead's approval of the plan.
Escalate:    none
```

```
Question:    Which red-first probe, hosted where, with which id?
Class:       P2 spec silent
Sources:     backlog/plan/E1-todos.md:961 "a probe that gives dev-lead's commit step an unformatted `review.md`"
             .github/workflows/ci.yml:58 "run: scripts/hook-smoke.sh"
             scripts/CLAUDE.md:13 "every hook probe (guards; per worktree layout each role's path-guard and plan-scope S1–S15"
             scripts/agent/run-smoke.sh:10 "R16 the exact prompt: Loop 5's D-27 path at the plan gate"
Conflict:    none (the card names a probe, not its host)
Verdict:     `scripts/hook-smoke.sh`, section "dev-lead formats a reviewer's review.md (B1.74)", probes FR1-FR6: it is the
             only smoke script CI runs (job `test`), it already owns agent-file probes, and `run-smoke.sh` is local
             only. FR1 is the text probe (red today: no section); FR2-FR6 are behavioral: they extract the block from
             `dev-lead.md` and run it on scratch review files, proving Prettier's change accepted (FR2, FR4, FR5) and a
             word change or a Prettier failure rejected with the original restored (FR3, FR6). An empty extracted block
             fails each probe, so none passes vacuously.
Next action: test-writer commit: `hook-smoke.sh` alone, red; then the dev-lead.md commit.
Must not:    A bare `grep -c prettier dev-lead.md` as the only probe (passes with a comment), or a probe in
             `run-smoke.sh` (not in CI).
Doc drift:   scripts/CLAUDE.md row for hook-smoke.sh names FR1-FR6, in the green commit.
Escalate:    none
```

```
Question:    Root cause: why is the reviewer's Write not formatted by format-after-edit.sh; should B1.74 fix the hook?
Class:       P1 code ≠ spec (hook behavior vs its stated purpose "so the agent never commits something lefthook would reject")
Sources:     .claude/hooks/format-after-edit.sh:8 "ROOT=\"${CLAUDE_PROJECT_DIR:-$PWD}\""
             .claude/hooks/format-after-edit.sh:10 "cd \"$ROOT\" || exit 0"
             .prettierignore:9 ".worktrees"
             backlog/plan/E1-todos.md:958 "[cause in the container unverified: a subagent's tool calls are not in the run's stream]"
Conflict:    Interactive: CLAUDE_PROJECT_DIR is the parent checkout, so Prettier runs from there on a path under
             `.worktrees/<slug>/`, and `.prettierignore` skips it with exit 0 (reproduced: file unchanged, no message).
             Lefthook runs inside the worktree on `backlog/...` and checks it. Container: cwd and CLAUDE_PROJECT_DIR are
             the worktree itself, where the same call formats the file (reproduced with the repo's ignore file), so the
             ignore is not the container's cause. Run 3's dev-lead-written `plan.md` passed lefthook there, which
             suggests the hook fires for the main agent; whether it fires for the reviewer subagent is unknown.
Verdict:     Interactive cause confirmed; container cause unverified (likely the subagent's calls, or the reviewer wrote
             through Bash). B1.74 does not fix the hook: the card names only dev-lead, the step works in both
             environments whatever the cause, and a hook change touches every role's every write in every session.
             Recommend a separate tooling card: `format-after-edit.sh` calls `repo_rel` (already in `lib.sh`), `cd`s to
             `$TOP` and passes `$REL`, plus hook-smoke probes for the nested layouts (none exist for this hook today).
             Cost: one hook edit (protected, high tier, `config-change-approved`), about 6 probes, S size; risk: eslint
             `--fix` now runs in the nested worktree's own node_modules (a worktree without them stays a silent no-op,
             `|| true`). Cheap check for the lead in the container, outside any card: pipe
             `{"tool_input":{"file_path":"<wt>/backlog/work/B1.66/review.md"}}` into the hook with
             `CLAUDE_PROJECT_DIR=<wt>` on a copy of an unformatted review; formatted means the script works there and
             the subagent's call is what is missing.
Next action: file the hook card after B1.74 merges (lead's call); B1.74's plan notes the cause in one line.
Must not:    Fold a hook fix into B1.74's Files, or write "container cause: the ignore file" (it is not, as measured).
Doc drift:   none (the hook's header says "Never fails the tool call"; the new card would add its nested-worktree rule).
Escalate:    none
```

```
Question:    Tier of the likely Files, and is `config-change-approved` needed?
Class:       P0 no conflict
Sources:     scripts/agent/tier.sh:3 "Each token (scripts/ci/plan-files.sh --file) is rated and the highest wins."
             scripts/ci/lib.sh:4 "scripts/agent/.*|scripts/verify-red\.sh|scripts/next-task\.sh|scripts/card-status\.sh|scripts/pr-step\.sh|\.claude/.*|\.devcontainer/.*"
             scripts/ci/check-config-change.sh:3 "Fail when lint / format / type / test / CI / hook configuration or agent instructions (.claude agents, skills,"
Conflict:    none
Verdict:     Ran `scripts/agent/tier.sh` on scratch plans: Files {`.claude/agents/dev-lead.md`, `scripts/hook-smoke.sh`,
             `backlog/work/B1.74/*`} → high (`.claude/.*` is CONFIG_PROTECTED); {`scripts/hook-smoke.sh`,
             `scripts/CLAUDE.md`, `backlog/work/B1.74/*`} → medium; a plan with the hook file → high. B1.74 is high.
             Interactive session, no `agent-ready` issue: the D-27 path does not apply, the lead's `approve` is the gate.
             `config-change-approved` is required (`.claude/agents/dev-lead.md` matches CONFIG_PROTECTED; the
             `check-config-change.sh` job fails without the label, D-19): dev-lead adds it with `gh pr edit` right after
             the draft PR opens.
             The card's "Tier: quick" is the flow tier; the plan tier above is what `tier.sh` derives.
Next action: plan.md Files as listed; label at PR creation.
Must not:    Skip the label because the card is "quick", or list `backlog/work/B1.74/*` expecting it to lower the tier.
Doc drift:   none
Escalate:    none
```

```
Question:    What lets live run 4 (resume `chore/B1.66-agent` at 291724d, untracked unformatted review.md) proceed?
Class:       P2 spec silent
Sources:     scripts/agent/run.sh:132 "printf '%s\n' \"$prompt\" | (cd \"$wt\" && exec env -u CLAUDECODE"
             scripts/agent/run.sh:232 "resume from the first Loop step whose artifact is missing"
             scripts/agent/run.sh:241 "--setting-sources project --strict-mcp-config"
             .claude/agents/dev-lead.md:87 "`git fetch origin && git merge origin/main` (never rebase, never force push)"
             backlog/work/B1.65/live.md:56 "- State left for run 4: worktree `chore/B1.66-agent` at 291724d (plan committed, not pushed) with"
Conflict:    none
Verdict:     The resumed run reads `dev-lead.md` from its own worktree, not from the clone's main: `claude_run` starts
             `claude -p --agent dev-lead` with `cd "$wt"`, the prompt names `.claude/agents/dev-lead.md` relative, project
             settings load from that cwd, and the frontmatter hook uses `$CLAUDE_PROJECT_DIR`. That worktree is at
             291724d on base 5b30ca2, before B1.74, so it holds the old text. The prompt's "first Loop step whose artifact
             is missing" does not get there first: `plan.md` is committed and `review.md` exists (untracked), so it
             resumes at the review commit, with the old dev-lead.md, and stops as in run 3. Loop 9's merge of origin/main
             comes after the build, never reached. Recommend: after B1.74 merges, the lead runs, in the container, from
             the worktree: `git fetch origin && git merge origin/main` (the same merge Loop 9 makes, no hook bypassed,
             the untracked `review.md` untouched), records it in `live.md`'s run 4 setup, then `run.sh 184`: run 4 then
             exercises the new step on the real reviewer file, which is the evidence B1.74 needs. The merge commit has no
             `Agent-Run:` trailer (made outside `RUNNER_CHILD`); `no-rework.sh` counts commits only after ready, so no
             metric moves. Rejected: the lead formatting `review.md` by hand (run 4 would pass without testing B1.74);
             a fresh start as in run 3 (re-pays the plan and review, about USD 0.5); teaching `run.sh` to merge on
             resume (a `scripts/agent/` change, high tier, its own card, not B1.74's).
Next action: after the B1.74 PR merges, the lead's merge step above, then run 4; B1.74's plan lists it under
             "Waiting on you", not in Files.
Must not:    Assume the resumed run picks up main's dev-lead.md, or edit the container worktree's `dev-lead.md` or
             `review.md` by hand to get past the stop.
Doc drift:   backlog/work/B1.65/live.md: run 4's setup row names the merge (in the closing or live-record commit, lead's).
Escalate:    none
```
