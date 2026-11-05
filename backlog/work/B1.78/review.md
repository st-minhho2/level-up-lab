# B1.78 review

## Plan review (round 1)

SCOPE: all (tooling, no §: `.claude/hooks/`, `.claude/agents/`, `.claude/docs/`, `scripts/`, `backlog/`). Plan at
`bdcb1f2`. Read: card B1.78 (`backlog/plan/E1-todos.md:988`), `probe.md`, `advice.md`, `plan.md`,
`.claude/hooks/path-guard.sh`, `.claude/hooks/plan-scope.sh`, `.claude/hooks/lib.sh` (`json_field`),
`.claude/agents/*.md` frontmatter (six roles, all matchers `Edit|Write|MultiEdit`), `.claude/settings.json`,
`scripts/hook-smoke.sh` (`probe`, `role_patterns`, per-layout loop), `scripts/verify-red.sh` header,
`scripts/ci/plan-files.sh` (`--run` verdict check), `scripts/agent/run.sh` (`--agent dev-lead`, `check_binary`),
B1.74's plan and plan review (precedent for tooling rows), D-7, D-19, D-27, D-28, D-29.

Probes run (none on the tree; a scratch copy of `.claude/` under the session scratchpad, the advice's sketch pasted
into `path-guard.sh` before `FILE=`):

- `scripts/next-task.sh --check B1.78` → `[next-task] B1.78: no overlap with any Doing or Review card`
- `scripts/agent/tier.sh backlog/work/B1.78/plan.md` → `high`; `plan-files.sh --any B1.78 HEAD` → 6 tokens, all in the
  Files table
- Baseline the plan quotes: `scripts/hook-smoke.sh` → `hook-smoke: 522 probes OK` (matches)
- Sketch, list `--role dev-lead 'backlog/*' … '!backlog/work/*/review.md'`: HG1 reviewer/review.md → 0 (want 0);
  HG4 dev-lead/review.md → 2; HG8 no `agent_type`/src → 2; HG11 `../hooks/lib`/src → 2; **HG11 `"reviewer\n"`/src →
  0 (want 2)**; **advisor/review.md → 0, spec-analyst/review.md → 0 (both 2 today)**
- `guard-bash.sh` on `printf %s x > backlog/work/B1.2/review.md` with `agent_type dev-lead` → exit 0 (dev-lead's Bash
  can already write `review.md`; context for reason 2)

| Check                                                                          | Result                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                 | pass: no § (tooling); every row traces to the card's Acceptance or to doc drift naming `path-guard.sh`/`hook-smoke.sh`                                                                                                                                                                                                                                                                                          |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass (n/a): no TypeScript, no action, no Prisma; the script signature is pasted                                                                                                                                                                                                                                                                                                                                 |
| plan follows `advice.md`'s recommendation or states the deviation              | pass: Approach A, variant A2 with derivation, as recommended. The advice's "verify-red.sh B1.78 must show HG1-HG3 FAIL" is not adopted (verify-red only finds `(red)` vitest commits); the plan proves red through hook-smoke, as B1.74 did                                                                                                                                                                     |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number      | pass: six Acceptance clauses, each an exit code or a denial count; the live check is marked [unverified]                                                                                                                                                                                                                                                                                                        |
| verification lists exact commands with expected numbers                        | fail: reason 1                                                                                                                                                                                                                                                                                                                                                                                                  |
| work breakdown skeleton → red → green → map → review, convention subjects      | pass: red → green → review → PR; no skeleton and no map row for a tooling card with no § (B1.74 precedent); subjects follow B1.62 (no `(red)` marker). Every step is dev-lead's: works only because the interactive main session plays dev-lead without its frontmatter guard (which allows only `backlog/*`, `docs/metrics.md`, `docs/mistake-log.md`); a headless run of this card would be refused at step 1 |
| `Lead approves spec` box, ticked only by a human                               | pass (n/a): no spec section (D-7 applies to sections); nothing ticked                                                                                                                                                                                                                                                                                                                                           |
| no settled D-n contradicted                                                    | pass: D-19 label named; D-28 tier `high` matches `tier.sh`; D-27 lead gate kept; D-29 untouched                                                                                                                                                                                                                                                                                                                 |
| `scripts/next-task.sh --check B1.78` says no overlap                           | pass: `[next-task] B1.78: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                                                                             |

Verdict: changes requested

1. **The expected numbers are not the plan's own.** "538 probes OK" is 522 + 16, one probe per HG id. But `probe` adds
   1 to `n` per call, and the rows carry several calls each: HG5 has 4 paths, HG7 has 3, HG8 2, HG9 3, HG11 2, HG12 2,
   HG14 3. HG15 is the existing `dev-lead passes` row with a new `role_patterns` value, and HG16 adds nothing. Read as
   written (advice table), that is at least 26 new calls, so about 548, not 538. The red line also gives no FAIL
   count. HG14 fails on its first sub-row only, and HG15 is a changed existing row. State the calls per HG id, the
   green total, and the red FAIL lines, as B1.74 did ("FR1–FR8 FAIL (one `probe` each)").
2. **A cost the plan does not state: in a headless run, advisor and spec-analyst gain `review.md`.** advisor
   (`backlog/work/*`) and spec-analyst (`backlog/*`) do not refuse `backlog/work/*/review.md` on their own. Today, in a
   headless run, dev-lead's hook refuses it for them. Under A2 it defers to both, because both declare path-guard. On
   the prototype both now exit 0, and both are 2 today. `plan-files.sh --run` accepts a D-27 approval from the last
   `## Plan review` verdict in `review.md` and does not check who wrote it. This matches interactive behaviour, and
   dev-lead's own Bash can already redirect into `review.md` (guard-bash exit 0). So this is not a new way in for an
   adversary, but an Edit/Write that is refused today becomes allowed. The plan should say this in one line. The
   lead then accepts it, or asks for `!backlog/work/*/review.md` on advisor and spec-analyst. That change touches two
   more agent files, now listed as out of scope, plus a probe row.
3. **HG11's `reviewer\n` row contradicts the interface as written.** `who="$(json_field agent_type)"` (the advice's
   sketch, and the obvious way to implement the interface) strips the trailing newline. `"reviewer\n"` then becomes
   `reviewer`, passes `^[a-z][a-z0-9-]*$` and the file test, and defers: exit 0 on the prototype, and HG11 wants 2.
   Either the interface must say how the raw value is checked (for example the regex inside `json_field`'s node call,
   or a sentinel appended before the substitution), or HG11 must use a value the stated interface rejects (`Reviewer`,
   `reviewer\nx`, `ns:reviewer`). If this is left as is, the green step fails HG11, or the probe gets edited after
   the red commit (test-weakened).

Not blocking, for the diff review: condition 3 says "frontmatter", but the advice's grep reads the whole file, so a
body line starting with `command: … hooks/path-guard.sh` would match. It also does not check that the role's matcher
covers the current `tool_name`. All six matchers are `Edit|Write|MultiEdit` today, so there is no live hole, but
nothing pins this.

Riskiest unfalsified: that a named role's own frontmatter hook fires for its call in the real `--agent dev-lead`
runner. probe.md shows it for `sub-probe` only, and the deferral for reviewer, test-writer and code-writer depends on it.

## Plan review (round 2)

SCOPE: all (tooling, no §). Plan at `c72dab5`, the only change since round 1 is `plan.md`. Re-read the card, `probe.md`,
`advice.md`, `path-guard.sh`, `lib.sh`, all six agent frontmatters, `hook-smoke.sh` (`probe`, `role_patterns`,
`role_probes`, the frontmatter loop with the fake `path-guard.sh`, `layout_probes`), `check-agent-frontmatter.sh`,
and the `hooks.md` "Role write scopes" table.

Commands run:

- `scripts/next-task.sh --check B1.78` gave `[next-task] B1.78: no overlap with any Doing or Review card`.
- `scripts/agent/tier.sh backlog/work/B1.78/plan.md` gave `high`. `plan-files.sh --any B1.78 HEAD` gave 8 tokens,
  matching the Files table.
- `scripts/hook-smoke.sh` gave `hook-smoke: 522 probes OK`, the baseline the plan quotes.
- Prototype on a scratch copy (outside the tree): I pasted the stated interface into `path-guard.sh` (regex on the
  `json_field` value, file test, `awk` limited to the first `---` block). With dev-lead's list:
  - 0 for reviewer/review.md, test-writer/`*.test.ts` and code-writer/src.
  - For dev-lead: review.md 2, src 2, plan.md 0.
  - 2 for no `agent_type`, `general-purpose`, `Reviewer`, `ns:reviewer` and `../hooks/lib`.
  - 2 for a fixture agent with path-guard only in its body.
  - `--role` alone gave 2.
    The HG rows match the interface.

Round 1 reasons:

1. Counts: resolved. The calls per id add up to 29 (1+2+1+5+1+3+2+3+1+3+2+2+3). The 18 from existing rows are 2
   frontmatter rows plus 16 (4 layouts × 2 modes × 2 roles). 522 + 29 + 18 = 569. Red has 10 FAIL lines: HG1 1,
   HG2 2, HG3 1, HG13 1, `role_patterns` 3, `role_probes` 2. I traced this against the unchanged hook. The old guard
   treats `--role` and `dev-lead` as globs that never match, so the layout loop and HG4–HG12 already pass.
2. The advisor/spec-analyst `review.md` cost: resolved. The plan states it, proposes the default and names the
   alternative for the lead to pick.
3. HG11 input contradicting the interface: resolved. HG10 now uses `Reviewer`, `ns:reviewer` and `../hooks/lib`,
   which the stated regex rejects. Round 1's non-blocking note is also covered: the interface now limits the lookup
   to the frontmatter block, and HG11 pins the body-only case.

| Check                                                                          | Result                                                                                                                |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                 | pass: no §. Every row traces to the card's Acceptance, to r1 reason 2, or to doc drift                                |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass (n/a): no TypeScript, actions or Prisma. The script signature and the three frontmatter command lines are pasted |
| plan follows `advice.md`'s recommendation or states the deviation              | pass: A/A2 as recommended. Red is proved by hook-smoke, not `verify-red.sh`, and the plan states it                   |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number      | pass: six Acceptance clauses, each an exit code or a denial count. The live check is `[unverified]`                   |
| verification lists exact commands with expected numbers                        | pass: 569 green, 10 red FAIL lines named. The live check expects 0 denials (run 1 had 4). The commands are named      |
| work breakdown skeleton → red → green → map → review, convention subjects      | pass: red → green → review → PR. No skeleton or map for a tooling card (B1.74 precedent)                              |
| `Lead approves spec` box, ticked only by a human                               | pass (n/a): no spec section, nothing ticked                                                                           |
| no settled D-n contradicted                                                    | pass: D-19 label named. D-28 tier `high` matches `tier.sh`, so the lead's `approve` is kept (D-27). D-29 untouched    |
| `scripts/next-task.sh --check B1.78` says no overlap                           | pass: `[next-task] B1.78: no overlap with any Doing or Review card`                                                   |

Verdict: approved (ready for the lead's gate; tier high, so not approved for build until `Plan approved by:` is filled)

What the lead's approval costs (none blocking):

1. **The alternative changes the numbers.** If the lead keeps advisor.md and spec-analyst.md as they are, the plan
   loses 2 Files rows. The totals become 551 probes and 6 red FAIL lines. Under the default, a headless advisor or
   spec-analyst is refused `review.md`, as today. Under the alternative it is allowed. Choosing the alternative means
   revising `plan.md` before the build.
2. **Doc drift the hooks.md row does not name.** Under the default, the `advisor` and `spec-analyst` rows of
   "Role write scopes" (`.claude/docs/hooks.md:39-40`) need "not `backlog/work/*/review.md`". The file is in the
   Files table already.
3. **For the diff review, two probe inputs can pass without testing anything:**
   - HG11 sets `CLAUDE_PROJECT_DIR` to a fixture. The written path must be inside that fixture. A path outside it
     exits 2 from `repo_rel` (old guard and new both gave 2 on the prototype), so it never reaches the deferral.
   - HG12 needs a `file_path`. With `{"tool_input":{}}` the old guard exits 0 (prototype), which would make red
     12 FAIL lines, not 10.
4. **Carried from round 1:** the deferral does not check that the role's hook is under `PreToolUse` with a matcher
   covering the current tool. All six matchers are `Edit|Write|MultiEdit` today.

Riskiest unfalsified: that in the real `--agent dev-lead` runner, the frontmatter hooks of reviewer, test-writer and
code-writer fire for their own calls. `probe.md` shows this only for `sub-probe`. The deferral hands those writes to
those hooks, so if one does not fire, that role writes unguarded. The post-merge live rerun of #207 covers the
reviewer only.

## Plan review (round 3)

SCOPE: all (tooling, no §). Plan at `0492051`, the lead's change at the gate: A3 replaces A2's deferral. dev-lead's
hook applies the calling role's own list, read from that role's frontmatter, and a read failure blocks. advisor and
spec-analyst gain `'!backlog/work/*/review.md'`. Read: `plan.md` and its diff from round 2, `probe.md`, `advice.md`,
`path-guard.sh`, `lib.sh`, the six agent frontmatters, `hook-smoke.sh` (`probe`, `role_patterns`, `role_probes`,
`layout_probes`), `check-agent-frontmatter.sh` (it enforces `name` == file name, so a lookup by `agent_type` finds
the right file), `run.sh` `check_binary` (its probe write comes from the main session, `agent_type` `dev-lead`, so
it gets the owner's list and is still blocked), `.claude/docs/hooks.md:35-48`.

Commands (on the tree, read-only; probes on a scratch copy of the hook under the session scratchpad):

- `scripts/next-task.sh --check B1.78` → `[next-task] B1.78: no overlap with any Doing or Review card`
- `scripts/agent/tier.sh backlog/work/B1.78/plan.md` → `high`. `plan-files.sh --any B1.78 HEAD` → 8 rows, the same
  as the Files table.
- `scripts/hook-smoke.sh` → `hook-smoke: 522 probes OK` (the baseline matches)
- `prettier --check .claude/agents/*.md` → all formatted. The frontmatter commands are single-quoted scalars with
  `''`, as the interface's parser expects.
- Today's hook with dev-lead's real list (`--role dev-lead …`), on a fixture project (`CLAUDE_PROJECT_DIR` = fixture,
  no git), `agent_type` `reviewer`: `backlog/work/B9.1/review.md` → **2**, `backlog/work/B9.1/plan.md` → **0**
  (reason 1)

Counts, traced against the unchanged hook. The old hook reads `--role` and `dev-lead` as globs that never match, so
every caller gets dev-lead's list.

- HG calls: 2+3+2+5+1+3+3+3+2+3+4+2+4 = 37.
- Existing rows: 2 frontmatter rows, plus 16 (4 layouts × 2 modes × 2 roles).
- Green total: 522 + 37 + 18 = 577.
- Red: HG1 2, HG2 2, HG3 1, HG8 3, HG10 3, HG13 2, `role_patterns` 3, `role_probes` 2 = 18 FAIL lines, as the
  plan states.

| Check                                                                          | Result                                                                                                                        |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                 | pass: no §. Each row traces to the card's Acceptance, to the lead's gate change (advisor, spec-analyst) or to doc drift       |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass (n/a): no TypeScript, actions or Prisma. The script interface and three frontmatter commands are pasted                  |
| plan follows `advice.md`'s recommendation or states the deviation              | pass: A3 is stated as the lead's change to `advice.md` A/A2. Red is proved through hook-smoke, as in rounds 1–2               |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number      | pass: the card's Acceptance clauses are exit codes or denial counts. The live check is `[unverified]`                         |
| verification lists exact commands with expected numbers                        | fail: reason 1. The numbers add up (577 green, 18 red), but the HG11 rows chosen cannot fail for the behaviour the lead added |
| work breakdown skeleton → red → green → map → review, convention subjects      | pass: red → green → review → PR. No skeleton or map for a tooling card (B1.74 precedent)                                      |
| `Lead approves spec` box, ticked only by a human                               | pass (n/a): no spec section, nothing ticked                                                                                   |
| no settled D-n contradicted                                                    | pass: D-19 label named. D-28 tier `high` matches `tier.sh`, so the lead's `approve` is kept (D-27). D-29 untouched            |
| `scripts/next-task.sh --check B1.78` says no overlap                           | pass: `[next-task] B1.78: no overlap with any Doing or Review card`                                                           |

Verdict: changes requested

1. **HG11 does not pin "a read failure blocks" for a malformed frontmatter.** This is the rule the lead added at
   the gate. All four HG11 rows write the fixture's `review.md`, and dev-lead's own list already refuses that path
   (`!backlog/work/*/review.md`). Suppose an implementation falls back to `<owner>`'s globs when the role's
   frontmatter is malformed. That is A2's "else <owner>'s globs", the behaviour the lead replaced. It returns 2 on
   all four rows: body-only, the bad token, two lines, and file missing. I confirmed this on the scratch copy:
   dev-lead's list on the fixture's `review.md` gives 2. The missing-file case is still pinned, by HG8 on
   `plan.md`. The three malformed cases are not, and once the red commit lands they cannot be strengthened
   without a new `test(...)` commit.
   Fix in the plan, with the same 4 calls: write the fixture role's globs as `''backlog/*''` and have each HG11 row
   write the fixture's `backlog/work/B9.1/plan.md`. On that path dev-lead's list gives 0, a lax parse that reads the
   body, takes the first of two lines or skips the bad token gives 0, and only a block gives 2. Each row then fails
   on today's hook, so the red line becomes **22 FAIL lines (HG11 ×4 added)**. The green total stays 577.

Not blocking (for the build and the diff review):

1. **The `$(…)` row is ambiguous, and checking only its exit code cannot detect an `eval`.** "an unquoted or `$(…)`
   token" is one call, so the build may pick the unquoted case and leave the eval case untested. The interface
   promises "read without eval". A `''$(touch <marker>)''` token is single-quoted, so the parser takes it as a
   literal glob and exit code 2 says nothing about eval. An unquoted `$(touch <marker>)` token should exit 2 _and_
   leave the marker absent. If the lead wants this pinned, name the token and the marker check in HG11. That is
   still one call, or +1 if both tokens are kept (578 green, 23 red).
2. **What A3 costs, and what it gains (none blocking, stated so the lead approves them knowingly).**
   - A headless subagent with no agent file (general-purpose, a plugin `ns:role`) is refused every write, including
     `backlog/*`, which dev-lead's list allows today (HG8). dev-lead's body dispatches no such agent today (grep:
     no `general-purpose` or `Explore`).
   - advisor and spec-analyst lose `backlog/work/*/review.md` in interactive sessions too. That is the lead's
     intent.
   - A role whose own hook did not fire is still held by its own list. This closes round 2's riskiest point.
3. **Carried:** the parser accepts only the single-quoted `''` form. Prettier keeps that form today (checked).
   Whatever reformat changes it makes every dispatched role fail closed. That is safe, but it would block a whole
   headless run. The hooks.md row should say so.

Waiting on human: this is round 3. The lead either takes the HG11 change (one plan line, red 18 → 22) or approves
as is with reason 1 recorded as an accepted cost.

Riskiest unfalsified: that `agent_type` in a real headless run is always exactly the dispatched role's file name.
`probe.md` shows it for `sub-probe` only, not for reviewer, test-writer or code-writer under `--agent dev-lead`. A
different value fails closed, and the whole run stops. The post-merge rerun of #207 covers the reviewer only.

## Diff review (round 1)

SCOPE: all (tooling, no §). Range `origin/main...HEAD`: red `d09fe9c` (`scripts/hook-smoke.sh`), green `92425b2`.
Read: `plan.md`, the full diff, `lib.sh`, the six agent frontmatters, `check-agent-frontmatter.sh --commands`.
Probes ran on a clone of the branch in the session scratchpad. The tree was not edited; only this section was added.

### Commands (last line of each)

| Command                                                    | Result                                                                                                      |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                | `All matched files use Prettier code style!`                                                                |
| `pnpm typecheck`                                           | `tsc --noEmit`, no errors                                                                                   |
| `pnpm test`                                                | `Tests  202 passed (202)`                                                                                   |
| `pnpm test:e2e`                                            | `43 passed (1.1m)`                                                                                          |
| `pnpm test:mutation`                                       | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                              |
| `scripts/ci/check-suppressions.sh`                         | `OK: no new suppressions`                                                                                   |
| `scripts/ci/check-config-change.sh`                        | exit 1: 5 protected files, no `config-change-approved` label. Expected before the PR; D-19 label at PR time |
| `scripts/ci/check-feat-commits.sh`                         | `OK: no feat commit touches tests`                                                                          |
| `scripts/ci/check-ac-coverage.sh`                          | `OK: every criterion of a shipped section has a test`                                                       |
| `scripts/ci/check-spec-sections.sh`                        | `OK: sections cited: 1 … 22`                                                                                |
| `scripts/ci/check-features-map.sh`                         | `OK`                                                                                                        |
| `scripts/ci/check-agent-frontmatter.sh`                    | `OK: 13 files`                                                                                              |
| `scripts/ci/check-plan-scope.sh`                           | `OK: chore/B1.78-headless-guard stays inside the approved plan of B1.78`                                    |
| `scripts/ci/check-backlog.sh`                              | `OK: README matches the cards`                                                                              |
| `scripts/verify-red.sh B1.78`                              | `no 'test(<pkg>): B1.78 … (red)' commit`: n/a. The plan proves red with hook-smoke (B1.74 precedent)        |
| `scripts/hook-smoke.sh` at `d09fe9c` (red)                 | `hook-smoke: FAILURES above`: **22 FAIL**, the 22 the plan names                                            |
| `scripts/hook-smoke.sh` at `92425b2`, bash 3.2 (macOS)     | `hook-smoke: 578 probes OK`                                                                                 |
| `scripts/hook-smoke.sh` at `92425b2`, bash 5.2.15 (runner) | `hook-smoke: 578 probes OK` (the `level-up-lab-runner-runner` image)                                        |

`git diff --stat origin/main...HEAD`: 12 files, +916 −69. Code: `path-guard.sh` +37, `hook-smoke.sh` +64/−5, three
agent frontmatter lines, `hooks.md`, `scripts/CLAUDE.md`. `git diff -w` on `scripts/CLAUDE.md` shows one real change,
the `hook-smoke.sh` row (`dev-lead's --role HG1–HG13`). The other 85 lines only change column width.

### Checklist

| Check                                                     | Result                                                                                                                                                                                                                                                   |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance clause has a probe whose verdict matches | pass: HG1–HG3 (dispatched role uses its own list), HG4–HG7 (dev-lead and no `agent_type` unchanged), HG8/HG11 (read failure blocks), HG13 (the real frontmatter). The live #207 rerun is `[unverified]` until after the merge, per the plan              |
| no test weakened after the red commit                     | pass: `git log --first-parent --no-merges d09fe9c..HEAD -- '*.test.*' e2e/ scripts/hook-smoke.sh` is empty, and so is `--merges --remerge-diff`                                                                                                          |
| every changed file is in `plan.md`                        | pass: 7 code/doc files plus `backlog/work/B1.78/*` = the Files table. `check-plan-scope.sh` OK                                                                                                                                                           |
| interfaces match the plan                                 | pass: `--role <owner>` with `$# -ge 3`, the owner's globs for an absent, empty or owner `agent_type`, otherwise the role's list read without eval. The three frontmatter commands match the plan character for character                                 |
| Zod / Prisma / raw SQL / migration                        | n/a: no `src/`, `prisma/`                                                                                                                                                                                                                                |
| no secret, no suppression                                 | pass: `check-suppressions.sh` OK. No env read                                                                                                                                                                                                            |
| features map row moved                                    | n/a: tooling, no F-row                                                                                                                                                                                                                                   |
| parser = YAML for the real roles                          | pass: for the 5 non-owner roles, `role_globs` returns the same argv as `check-agent-frontmatter.sh --commands` evaluated by the shell. For `dev-lead` it returns 1 (`--role`), which is never reached because the agent is the owner                     |
| scalar forms (caller's question)                          | pass, fail closed, the same under bash 3.2 and 5.2: a trailing `# comment`, a double-quoted scalar, `>-` block, two spaces after `command:` or between tokens, CRLF, a `"…"` token → 1. Trailing blanks and a glob with a space → parsed                 |
| odd `agent_type` (caller's question)                      | pass: `"reviewer "`, `5`, `{…}`, `null`, `"$(touch m)"` → 2 on review.md and src (marker not created). `"reviewer\n"` and `["reviewer"]` reduce to `reviewer` (`$(…)` strips the newline, `String([x])`), so they get reviewer's list, never a wider one |
| would a test fail if one changed line were reverted?      | **fail (findings 1, 2)**. Each line of `path-guard.sh` was removed alone on the copy, and hook-smoke was counted: L21 (name regex) 0 FAIL, L23 0, L26 0, L29 0, L33 (`--role` reject) 0, L36 0, awk frontmatter→whole file 1, L40 (argc) 1               |

### Findings

```
[1] KIND: coverage
    WHERE: scripts/hook-smoke.sh (HG10) / .claude/hooks/path-guard.sh:21
    DEFECT: HG10 says "a type that is not a plain agent name is never looked up", but its three probes write
            plan.md, which every list it could resolve to also refuses, so deleting the name regex keeps 578 OK.
    TRIGGER: path-guard.sh:21 replaced by `:`; agent_type `../agents/reviewer` (or `Reviewer` on the
            case-insensitive macOS FS) writing backlog/work/B1.2/review.md with dev-lead's --role list.
    WRONG BEHAVIOUR: exit 0 (the name resolves to .claude/agents/reviewer.md); at HEAD exit 2. hook-smoke stays
            green, so the plan's "exit 2 if agent_type !~ ^[a-z][a-z0-9-]*$" rule has no probe that pins it.
    CONFIDENCE: confirmed (ran both on the copy)

[2] KIND: coverage
    WHERE: .claude/hooks/path-guard.sh:33 / scripts/hook-smoke.sh (HG11)
    DEFECT: the plan's "exit 2 if … the role's own command carries --role" has no probe; deleting L33 keeps 578 OK.
    TRIGGER: path-guard.sh:33 replaced by `:`; a role file `fx-role.md` whose command is
            `… ''--role'' ''fx-role'' ''backlog/*''`; agent_type fx-role writes backlog/work/B1.2/plan.md.
    WRONG BEHAVIOUR: exit 0 (`--role`, `fx-role`, `backlog/*` are applied as globs); at HEAD exit 2.
    CONFIDENCE: confirmed (ran both on the copy)
```

Fix for both: a `test(scripts): B1.78 review pass 1 -- …` hardening commit (no `(red)`), because the rows pass at
HEAD. HG10 should add `../agents/reviewer` on `review.md`, which resolves on both macOS and Linux. HG11 should add
an `fx-role` fixture carrying `''--role''`. That is +2 probes (578 → 580), so the plan's Verification line and the PR
body numbers change.

Not blocking:

1. L23, L26, L29 and L36 are redundant behind the tokenizer. Removing one alone changes no verdict I could build:
   `fx-two` is still refused because the newline between the two lines breaks the `^ '…'` match. HG11 `fx-two`
   therefore does not pin L26 specifically. That is acceptable, since the behaviour holds.
2. The role file is read live from `$CLAUDE_PROJECT_DIR` at hook time, while the role's own hook comes from the
   frontmatter loaded at launch. A mid-run edit to `.claude/agents/*.md` changes only dev-lead's copy of the
   check. No role's Edit/Write list covers `.claude/`, and Bash writes were never under path-guard, so this opens
   no new path.
3. `check-config-change.sh` stays red until the PR carries `config-change-approved` (D-19, plan).

Verdict: back to test-writer

Riskiest unfalsified: that `agent_type` in a real `claude -p --agent dev-lead` run equals the dispatched role's file
name for test-writer, code-writer and reviewer. `probe.md` shows only `sub-probe`, and any other value blocks every
write of the run. This stays `[unverified]` until the post-merge rerun of #207.
