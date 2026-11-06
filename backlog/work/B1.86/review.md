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

## Plan review (round 2)

SCOPE: all (tooling, no §: `scripts/`, `backlog/`). Plan at `7ce84e8`. Read: round 1 above, `git diff 0b5020f 7ce84e8`
(plan only), card B1.86, `proto/new.sh` (now with `\\.` in the `.each` group), `proto/fx.sh` (A1–A8),
`.github/workflows/ci.yml` (`guards` job). `scripts/` is unchanged since `origin/main` (80773ee), so round 1's
hook-smoke baseline of 591 still holds.

Commands run (nothing on the tree; fixtures and copies under `$TMPDIR` = `/var/folders/…/T/`):

- `scripts/next-task.sh --check B1.86` gave `[next-task] B1.86: no overlap with any Doing or Review card` (exit 0).
- `scripts/agent/tier.sh backlog/work/B1.86/plan.md` gave `high`; `scripts/ci/plan-files.sh --any B1.86 HEAD` gave the
  4 Files rows; `scripts/ci/check-backlog.sh` gave OK.
- `proto/old.sh` is byte-identical to `scripts/ci/check-ac-coverage.sh`. `fx.sh` under `/bin/bash` 3.2.57: old gives
  A1–A8 = 1 0 1 1 1 1 1 0, new gives 0 0 0 0 1 1 1 0: the Today and Want columns exactly.
- `git archive origin/main`: title ids old 145, new 146, the only difference AC-28.6; guard output identical, exit 0.
- `git archive origin/docs/B5.6-done`: old exits 1 with `§28  criteria=7 covered=6  MISSING: AC-28.6`; new exits 0
  with `§28  criteria=7 covered=7` and the OK line; no other line differs.
- `pnpm test` gave `Test Files 39 passed (39)`, `Tests 241 passed (241)`: the plan's number.
- The `guards` job runs in `container: node:24-bookworm` (`ci.yml:125–126`), where round 1 found `perl-base` 5.36.
- 19 fixtures of my own (old → new exit code, 0 = counted): F2 1 → 0, F4 1 → 1, F5 1 → 1, `/[(]/` in a table
  0 → 1, `/'/` in a table 0 → 1 (all as the Costs state); O1 a `/'/` table then the id in a body call 1 → 1;
  O2 a nested `it.each` with the id 0 → 0; O3 `r.test('AC-9.1: x')` 0 → 1; O4 `expect(test('AC-9.1: x'))` inside a
  test body 0 → 0; O5 `"a'"` in a table 0 → 0; O6 `` `a${')'}` `` in a table 1 → 0; O7 `.each([1])` then the title
  call on the next line 1 → 0; O8 a tagged-template ``it.each`…`('AC-9.1: …')`` 1 → 1; O9 `test.each` 0 → 0;
  O10 `as const` table 0 → 0; O11 `<[string, (a: number) => void]>` 1 → 0; O12 `'AC-9.1' + ': x'` 1 → 1;
  O13 `'a\\'` in a table 0 → 0; O14 a `// a ) paren` comment inside a table 1 → 1.

Round 1 reasons:

1. Fixed: `plan.md:4–5` now says perl is new to the guards, names `prune-smoke.sh:134` as outside CI and gives
   `perl-base` Essential in `node:24-bookworm` as the reason.
2. Fixed: Costs list F2 (fails open), F4 and F5 (fails closed as today), and the regex-literal regressions; F9 is now
   handled (`\\.` in the group) and probed as A8. A7 adds the `.each`-branch negative probe round 1 asked about.
3. Fixed: `pnpm test` → 241 passed (39 files), confirmed above; the code spans in "Narrowing" are spaced.

| Check                                                                     | Result                                                                                                                                        |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                            | pass: guard, its hook-smoke probes, their `scripts/CLAUDE.md` row, work artifacts; no section, no map row                                     |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib      | pass (n/a): no `src/`; no arguments, same output lines and exit codes (identical output on `origin/main`)                                     |
| follows `advice.md` or states the deviation                               | pass: "No advice (tier quick, no section)"                                                                                                    |
| ≤ 7 criteria, every Then measurable                                       | pass: one Acceptance, measured by A1–A8 exit codes, the §28 line, identical output elsewhere, bash 3.2.57                                     |
| verification lists exact commands with expected numbers                   | pass: 3 FAIL / 596 ok, then 599 OK (591 + 8); 241 vitest; §28 `covered=7`. Minor wording (note a)                                             |
| work breakdown skeleton → red → green → map → review, convention subjects | pass: red → green → review, the tooling shape (B1.78, B1.79); red subject without `(red)` (hook-smoke only, B1.62); A2/A5–A8 are green guards |
| `Lead approves spec` box, ticked only by a human                          | pass (n/a): no section. `Plan approved by:` empty; tier high → lead's `approve` (D-28)                                                        |
| no settled D-n contradicted                                               | pass: D-19 label stated, D-27/D-28 followed                                                                                                   |
| `next-task.sh --check` says no overlap                                    | pass: `[next-task] B1.86: no overlap with any Doing or Review card`                                                                           |

Verdict: approved

Notes for the lead (not blocking; none of these shapes is in `src/` or `e2e/` today):

a. The guard prints `§28  criteria=7 covered=7` (two spaces, `printf '§%-3s'`); the plan and card write one space.
Checking by eye is fine; a literal `grep` for the plan's string would miss.
b. Fails closed, as today, beyond the stated F5: a comment holding an unbalanced `)` inside an `.each` table (O14),
and a tagged-template table ``it.each`…`(…)`` (O8). The plan's rule ("one balanced `(…)` group") already
excludes O8. Both are loud (`MISSING`).
c. One more narrowing in the good direction: `r.test('AC-…')` (a RegExp method) counted before and no longer does
(O3), the same left-boundary change as `foo.it(`.
d. Inherited fail-open, unchanged: a `test('AC-…')` call nested inside another test's body counts (O4, 0 → 0).
e. The plan is about 70 lines against `planning.md`'s ≈ 40; the excess is the probe table and the Costs that round 1
asked for. It is one task, not two.
f. Steps 1–2 have dev-lead write `scripts/`, so the card runs from an interactive session (now stated). The guard
becomes a perl regex with a recursive subpattern; A1–A8 are the safety net for later edits.

Riskiest unfalsified: that no real test shape makes the `.each` group, mis-parsed across an unbalanced quote (a regex
literal or a comment in the table), close right before a `('AC-…` that is not a title, so the id counts. O1 is the
closest I built, and it does not count (1 → 1). I found no such case, but I did not prove that none exists.

## Diff review (round 1)

SCOPE: all (tooling, no §: `scripts/`, `backlog/`). Range `origin/main` (80773ee) `..2f05f54`: red `22429b9`, green
`2f05f54`. The local `main` ref is stale (8d61eda), so `git diff --stat main...HEAD` also lists #236/#238's files;
against `origin/main` the diff is the 6 files below. Nothing on the tree was edited; probes ran on `git archive`
snapshots under `$TMPDIR/b186-rev1/`.

Command results (last line of each):

| Command                                                  | Result                                                                                                     |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                              | `All matched files use Prettier code style!` (exit 0)                                                      |
| `pnpm typecheck`                                         | `tsc --noEmit`, exit 0                                                                                     |
| `pnpm test`                                              | `Tests  241 passed (241)` (39 files), the plan's number                                                    |
| `pnpm test:e2e`                                          | `52 passed (1.2m)`                                                                                         |
| `pnpm test:mutation`                                     | `Final mutation score of 92.62 is greater than or equal to break threshold 70` (no `src/` change)          |
| `scripts/ci/check-suppressions.sh`                       | `[check-suppressions] OK: no new suppressions`                                                             |
| `scripts/ci/check-config-change.sh`                      | without the label: `::error::` on `scripts/ci/check-ac-coverage.sh` (expected); with                       |
|                                                          | `CONFIG_CHANGE_APPROVED=true`: allowed. PR #239 carries `config-change-approved`                           |
| `scripts/ci/check-feat-commits.sh`                       | `[check-feat-commits] OK: no feat commit touches tests`                                                    |
| `scripts/ci/check-ac-coverage.sh`                        | `[check-ac-coverage] OK: every criterion of a shipped section has a test`, exit 0                          |
| `scripts/ci/check-spec-sections.sh`                      | `OK: sections cited: 1 … 28`                                                                               |
| `scripts/ci/check-features-map.sh`                       | `[check-features-map] OK`                                                                                  |
| `scripts/ci/check-plan-scope.sh`, `check-backlog.sh`     | `OK: … stays inside the approved plan of B1.86`; `OK: README matches the cards`                            |
| `scripts/verify-red.sh B1.86`                            | `::error::no 'test(<pkg>): B1.86 … (red)' commit` — expected: hook-smoke-only red has no marker (B1.62)    |
| `hook-smoke.sh` at `22429b9` (snapshot, `/bin/bash` 3.2) | 3 FAIL: A1, A3, A4 (`exit 1 (want 0)`); A2, A5–A8 ok; `hook-smoke: FAILURES above` — the red is real       |
| `hook-smoke.sh` at `2f05f54` (snapshot, `/bin/bash` 3.2) | `hook-smoke: 599 probes OK`                                                                                |
| A1–A8 in `node:24-bookworm` (bash 5.2.15, perl 5.36.0)   | `fail=0 n=8`                                                                                               |
| old vs new guard on this tree                            | output identical, exit 0                                                                                   |
| old vs new on `git archive origin/docs/B5.6-done`        | old exit 1 `§28  criteria=7 covered=6  MISSING: AC-28.6`; new exit 0 `§28  criteria=7 covered=7` + OK line |
| `git diff --stat origin/main...HEAD`                     | 6 files changed, 418 insertions(+), 45 deletions(-)                                                        |

Checklist:

| Check                                                     | Result                                                                                                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every Acceptance clause has a probe whose verdict matches | partial: multi-line table, type argument, next-line title (A1, A3), id not first argument (A5–A7), §28 `covered=7`, bash 3.2 all hold; see finding 1   |
| no test weakened after the red commit                     | pass: `git log --first-parent --no-merges 22429b9..HEAD -- '*.test.*' e2e/ scripts/hook-smoke.sh` empty; no merge commits in the range                 |
| every changed file is in `plan.md`                        | pass: `check-plan-scope.sh` OK; the `scripts/CLAUDE.md` diff is the one row (A1–A8, plus RP1–RP10 drift fixed) and Prettier's re-padding of that table |
| interfaces match                                          | pass: no arguments, same output lines, same exit codes (identical output on this tree)                                                                 |
| Zod / Prisma / raw SQL / migration                        | n/a: no `src/`, `prisma/`                                                                                                                              |
| no secret, no suppression                                 | pass                                                                                                                                                   |
| features map row moved                                    | n/a: no section                                                                                                                                        |
| would a probe fail if one changed line were reverted?     | yes for the whole `print` line (A1, A3, A4 go red). Sub-rule mutants on a copy: 6 of 10 killed; 4 survive, findings 1 and 2                            |
| `config-change-approved` on the PR (D-19)                 | pass: label present on #239 (PR head is still `dae699a`; the red and green commits are not pushed yet)                                                 |

Mutants of `check-ac-coverage.sh` (copy, A1–A8 re-run): killed — `=>` in `$gen` (A1), `\\.` in `$par` (A8), `$str`
in `$par` (A4), the recursion `(??{ $par })` (A1), `\s*` after the title's `(` (A1, A3), the whole `.each` group
(A1, A2, A4, A8). Survived — the left boundary `(?<![\w.\$])`, the nested `<[^<>]*>` alternative in `$gen`, the
`\s*` between the `.each` group and the title's `(`, the backtick in the title's quote class. None of the four
changes the id set on `origin/docs/B5.6-done` (146 ids, 0 differ).

Findings:

```
[1] KIND: coverage
    WHERE: scripts/ci/check-ac-coverage.sh:12 (`(?<![\w.\$])`); scripts/hook-smoke.sh:795 (A5)
    DEFECT: the left boundary is the only thing that makes a call whose name ends in "it"/"test" not count, and no
            probe pins it; deleting it leaves A1–A8 green.
    TRIGGER: src/x.test.tsx = it('emits', () => { emit('AC-9.1: x'); });   (also submit(, xit(, r.test()
    WRONG BEHAVIOUR: with the lookbehind removed the guard exits 0 (AC-9.1 counted from a non-title argument),
            against the Acceptance "a string 'AC-n.m:' that is not the first argument of it/test/… still does not
            count". Old guard 0, new guard 1, no-lookbehind mutant 0: this is a fail-open the change fixes, and it
            would be red at 22429b9, but A5 uses `f(`, whose name cannot end in "it", so the probe set cannot see
            it regress.
    CONFIDENCE: confirmed (fixture run against old, new and the mutant)
```

Fix (test-writer, a `test(scripts): B1.86 review pass 1 -- …` commit, no `(red)` marker): add one `acx 1` probe with
the trigger above (A9). It is a probe row, not a file or interface change; record it in the plan's probe table and the
PR body. The guard needs no change.

```
[2] KIND: coverage
    WHERE: scripts/ci/check-ac-coverage.sh:11 (`<[^<>]*>` in $gen)
    DEFECT: the plan's rule "an optional type argument may hold one nested <…>" has no probe; deleting the
            alternative leaves A1–A8 green.
    TRIGGER: it.each<Array<number>>([1])('AC-9.1: g', () => {});
    WRONG BEHAVIOUR: with the alternative removed the guard exits 1 (MISSING: AC-9.1) and no probe notices;
            fails closed, loud. Old guard 1, new guard 0, mutant 1.
    CONFIDENCE: confirmed (fixture against old, new and the mutant; A1–A8 stay ok under the mutant)
```

Not blocking: fails closed, and no `.each` with a nested type argument exists today. Folding it into the A9 commit
costs one line.

```
[3] KIND: plan-mismatch
    WHERE: backlog/work/B1.86/plan.md "Costs" (regressions list); scripts/ci/check-ac-coverage.sh:9–10
    DEFECT: a one-line .each table holding an apostrophe outside a string literal (JSX text, a /* … */ comment)
            counts today and not after this change; the Costs name only regex literals.
    TRIGGER: it.each([[<p>don't</p>]])('AC-9.1: j', () => {});
    WRONG BEHAVIOUR: old guard exit 0, new guard exit 1 (MISSING: AC-9.1); the lead approved a cost list
            without this case.
    CONFIDENCE: confirmed (fixture, old vs new)
```

Not blocking: fails closed (CI red, `MISSING`), and `src/` and `e2e/` hold 3 `.each` calls, none with JSX in the table.
One sentence in the PR body's Costs is enough.

Other fixtures (old → new exit code, 0 = counted), all as the plan intends or states: `xit('AC-9.1: …')` 0 → 1;
tagged-template `it.each` 1 → 1; `])` newline `('AC-9.1: …'` 1 → 0; `'it\'s )'` in a table 1 → 0; a two-level type
argument 1 → 1; `it(/* c */ 'AC-9.1: …')` 1 → 1; `it.concurrent` 1 → 1; `describe.each` 1 → 1; `// don't` in a
multi-line table 1 → 1; `` `a)${f()}` `` in a table 1 → 0; a CRLF file with the title on the next line 1 → 0.

Verdict: back to test-writer (finding 1; findings 2 and 3 travel with it, neither blocks on its own)

Riskiest unfalsified: that no real test shape makes the `.each` group, mis-parsed across an apostrophe outside a
string (finding 3's JSX text or a comment), close right before a `('AC-…` that is not a title, so the id counts. I
did not build one that does; I did not prove none exists.
