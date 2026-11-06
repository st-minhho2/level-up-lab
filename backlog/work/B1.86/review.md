# B1.86 review

## Plan review (round 1)

SCOPE: all (tooling, no §: `scripts/`, `backlog/`). Plan at `d507b46`. Read: card B1.86
(`backlog/plan/E1-todos.md`), `plan.md`, `filing-pr-body.md`, `scripts/ci/check-ac-coverage.sh`,
`scripts/hook-smoke.sh` (harness and summary), `scripts/CLAUDE.md` (the `hook-smoke.sh` row),
`.github/workflows/ci.yml` (`test` and `guards` jobs), D-19/D-27/D-28 in `00-decisions.md`, and B1.79's plan and
plan review (the precedent this plan follows). The dev-lead's prototype is `proto/new.sh`, `proto/old.sh` and
`proto/fx.sh` in the session scratchpad.

Commands run (nothing on the tree; probes on copies under `$TMPDIR`):

- `scripts/next-task.sh --check B1.86` gave `[next-task] B1.86: no overlap with any Doing or Review card` (exit 0).
- `scripts/agent/tier.sh backlog/work/B1.86/plan.md` gave `high`, as the plan states.
- `scripts/ci/plan-files.sh --any B1.86 HEAD` gave 4 tokens, the Files table exactly.
- `scripts/ci/check-backlog.sh` gave `[check-backlog] OK: README matches the cards`.
- `scripts/hook-smoke.sh` on a copy gave `hook-smoke: 591 probes OK`, the baseline the plan quotes (591 + 6 = 597;
  3 FAIL + 594 ok in the red step).
- `proto/old.sh` is byte-identical to `scripts/ci/check-ac-coverage.sh`. `fx.sh` under `/bin/bash` 3.2.57: old
  gives A1–A6 = 1 0 1 1 1 1, new gives 0 0 0 0 1 1, the plan's Today and Want columns.
- Title ids on this tree: old 145, new 146; the only addition is AC-28.6, none lost. The guard's full output is
  identical, old vs new (exit 0).
- On `git archive origin/docs/B5.6-done`: old prints `§28 criteria=7 covered=6 MISSING: AC-28.6`, new prints
  `§28 criteria=7 covered=7` and `OK`, exit 0. The rest of the output is identical.
- In `node:24-bookworm` (the CI image, run locally): bash 5.2.15, `perl 5.36.0`, `dpkg -S /usr/bin/perl` gives
  `perl-base` (Essential). `fx.sh` with the new guard gives A1–A6 = 0 0 0 0 1 1.
- Run time on this tree (107 files): old 0.92 s, new 0.96 s.
- 15 extra fixtures of my own (F1–F15, old vs new exit codes), used in reasons 1 and 2.

| Check                                                                     | Result                                                                                                                                                                                                             |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file belongs to the card                                            | pass: the guard, its hook-smoke probes and their `scripts/CLAUDE.md` row, and the work artifacts. No section, so no features-map row                                                                               |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib      | pass (n/a): no `src/`. The script keeps its arguments (none), its output lines and its exit codes; verified identical output on this tree                                                                          |
| follows `advice.md` or states the deviation                               | pass: "No advice (tier quick, no section)"; the card is `Tier: quick`                                                                                                                                              |
| ≤ 7 criteria, every Then measurable                                       | pass: one Acceptance, measured by A1–A6 (exit codes), the §28 `covered=7` line and identical output elsewhere. "bash 3.2-safe" is verified by the prototype on `/bin/bash` 3.2.57                                  |
| verification lists exact commands with expected numbers                   | pass: 3 FAIL / 594 ok, then 597 OK; baseline 591 confirmed. Minor: `pnpm test` "unchanged" has no count (reason 3)                                                                                                 |
| work breakdown skeleton → red → green → map → review, convention subjects | pass: red → green → review is the tooling shape (B1.78, B1.79). No skeleton or map (no `src/`, no section). The red subject has no `(red)` marker, as B1.62's mistake-log row requires for hook-smoke-only commits |
| `Lead approves spec` box, ticked only by a human                          | pass (n/a): no spec section. `Plan approved by:` is empty, and the tier is high, so the lead's `approve` is needed (D-28)                                                                                          |
| no settled D-n contradicted                                               | pass: D-19 (`config-change-approved`, since `scripts/ci/` is protected) and D-27/D-28 (high tier → lead) are followed                                                                                              |
| `next-task.sh --check` says no overlap                                    | pass: `[next-task] B1.86: no overlap with any Doing or Review card`                                                                                                                                                |

Verdict: changes requested

1. **The plan's reason for the new dependency is false (confirmed).** `plan.md:4` says "perl is already used by
   `scripts/hook-smoke.sh` in CI".
   - `hook-smoke.sh` holds `perl` once, at line 767, as quoted text in a probe (`` `perl -i` ``). Nothing runs it.
   - The only perl call under `scripts/` is `scripts/prune-smoke.sh:134`, and no workflow or `hook-smoke.sh` runs
     that script.
   - No script CI runs today needs perl. `plan.md:57–58` ("Perl joins the guard's dependencies") contradicts line 4.
   - The conclusion still holds: `/usr/bin/perl` comes from `perl-base`, which is Essential on Debian, so it is
     always in `node:24-bookworm` (verified above). It is also on macOS.
   - Fix: replace the parenthesis on line 4 with the true reason, e.g. "(`perl-base` is Essential in
     `node:24-bookworm`; macOS ships perl)". The lead approves a new CI tool here (CLAUDE.md "Ask before", D-19), so
     the plan must not say the tool is already in use.

2. **The Costs and Narrowing lines leave out one silent widening and three narrowings (confirmed by fixtures, old →
   new exit code, 0 = counted).** `plan.md:54–58` name only `fit(`/`xit(`/`foo.it(` and the unbalanced quote. Add:
   - **Fails open (silent).** F2: a block-commented, multi-line test now counts as coverage (1 → 0):
     `/*\nit(\n  'AC-9.1: …',\n  () => {},\n); */`. Today only a single-line `// it('AC-9.1: …')` counts (F1, 0 → 0).
     Reading per file widens this inherited hole to commented-out multi-line tests. This is the one direction in
     which the guard would pass a criterion that has no running test. It is worth one sentence in Costs.
   - **Fails closed (CI red, `MISSING`).**
     - F9: a regex literal with a paren in an `.each` table, `it.each([[/\(/]])('AC-9.1: x', …)`, counts today and
       not after this change (0 → 1), a regression against today's guard.
     - F4: a type argument nested two levels deep, `it.each<Array<Record<string, number>>>(…)('AC-9.1: …')`, still
       does not count (1 → 1). The card's Acceptance says "carries a generic type argument" without a depth.
     - F5: a comment with an apostrophe inside the table (`// don't`) hides the title (1 → 1), the same mechanism as
       the stated unbalanced-quote cost.
   - There are 0 of these shapes in `src/` or `e2e/` today (old vs new id sets are equal except AC-28.6). The
     fails-closed cases are loud, so listing them is enough. No probe is required.

3. **(minor)** Verification: `pnpm lint && pnpm typecheck && pnpm test` "unchanged" has no number. State the
   expected vitest count from `main`, as B1.79 round 2 did. Also, `plan.md:54–55` lost the spaces around three code
   spans (`` `xit(`or`foo.it(`no ``, `` titles in`src/` ``).

Costs the lead should see when approving (not blocking):

- Steps 1–2 have dev-lead write `scripts/`. As B1.79's review recorded, a headless `--agent dev-lead` cannot write
  outside `backlog/` and two `docs/` files. So this card runs only from an interactive session, as B1.78 and B1.79
  did. The plan does not say this.
- The guard becomes a perl regex with a recursive subpattern (`(??{ $par })`). Future edits need someone who reads
  perl regexes. The hook-smoke probes A1–A6 are the safety net.
- B5.6's closing PR #237 goes green only after it merges `origin/main` with this card. On a copy of
  `docs/B5.6-done` with the new guard, §28 shows `covered=7` (verified).

Riskiest unfalsified: that no reachable test shape makes the new regex count an id that is not the first argument of
a running test call, beyond the comment case F2. My 15 fixtures found no such case (F6 id in an `.each` body, F7 id in
the table, F11 `test.step`, F14 nested `it` are all handled as intended), but A1–A6 give only one negative probe
(A5) for the `it(` branch and none for the `.each` branch.
