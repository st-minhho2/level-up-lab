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
