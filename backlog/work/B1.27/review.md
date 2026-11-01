# B1.27 reviews

## Plan review (round 1)

Scope: tooling (`scripts/`); no § section, the card's Acceptance (`backlog/plan/E1-todos.md` "### B1.27") is the
contract. Plan at `71ae73b`. Probes run on /bin/bash 3.2.57 (the only bash here), on a scratch copy, never the tree.

| Check                                                                             | Result                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: tooling, no map row; the two code files are the ones the card names (`scripts/next-task.sh`, `scripts/next-task-smoke.sh`), the other two are the card's `work/` paperwork; siblings B1.24 / B1.26 own none of them |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): bash only, no `src/`; CLI arguments, output and exit codes unchanged                                                                                                                                          |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: advisor skipped for a tooling card, stated; same shape as B1.18 / B1.25                                                                                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: one Acceptance bullet; each of W22–W26 names an exit code and an exact output line                                                                                                                                  |
| verification lists exact commands with expected numbers                           | pass: `21 ok, 5 FAIL` → `26 ok, 0 FAIL`; `grep -c xargs` → 0; claim line; two CI checks → OK                                                                                                                              |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass for a tooling card: `test(scripts)` (no `(red)`: `verify-red.sh --auto` judges vitest only) → `fix(scripts)` → reviewer; no skeleton (bash, nothing to stub) and no map row, as in B1.25                             |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): no section; nothing ticked by me                                                                                                                                                                              |
| no settled D-n contradicted                                                       | pass: D-19 label named for the protected `scripts/next-task.sh` (`check-config-change.sh` PROTECTED); `next-task-smoke.sh` is not protected                                                                               |
| `scripts/next-task.sh --check B1.27` on the committed plan                        | pass: `[next-task] B1.27: no overlap with any Doing or Review card` (exit 0; B1.24 and B1.26 are Doing)                                                                                                                   |

Evidence I ran:

- HEAD: `scripts/next-task-smoke.sh | tail -1` → `[next-task-smoke] 21 ok, 0 FAIL`; `check-plan-scope.sh` → OK
  (no approved plan yet); `check-backlog.sh` → OK; `--claim B1.27` → `this checkout holds feat/B1.27-next-task-quotes`.
- The plan's `trim()` on bash 3.2, UTF-8 and `LC_ALL=C`: `' say "all done" '` → `say "all done"`, `" todo's date "`
  → `todo's date`, `' back\slash path '` → `back\slash path`, `' a lone " quote '` → `a lone " quote`, `'   '` and `''`
  → empty, `' a  *  [x] ? b '` → unchanged inside (the quoted inner expansion keeps glob characters literal), tabs
  trimmed, `“…” — § …` kept, `-n` kept (where `echo "$x"` printed nothing).
- A copy of `next-task.sh` with the six `$(echo "$x" | xargs)` → `$(trim "$x")`, on a throwaway repo with the plan's
  four titles: HEAD exits 1 `xargs: unterminated quote` in pick, `--list`, `--claim B8.3`, `--check B8.4`; the copy
  exits 0 in all four: `B8.1 backlog/plan/E8-quotes.md`, the four titles printed as written, `B8.3 may start`,
  `B8.4: no overlap`. `echo 'back\slash path' | xargs` → `backslash path`, `echo 'say "all done"' | xargs` →
  `say all done`, so W22 is red at HEAD as the plan claims.

Costs the lead approves with this plan (none blocking):

1. Behavior dropped: `xargs` also collapsed runs of inner blanks in every cell; `trim` keeps them. A title written
   `a  b` now prints with two spaces (and shifts `--list`'s 30-character cut). No logic depends on the collapse:
   `id` is regex-checked, `owner` must equal `Lead|Dev`, `blocked` is split by `tr ' ,'` with empty tokens dropped
   by `grep -E '^B…$'`, `step` is sorted numerically. This is "the title as written", so it matches the card.
2. Smoke matching must be literal: `echo 'back\slash path' | grep -c 'back\slash'` → `0` here (BSD grep reads `\s`
   as a class), so a W22/W23 written with a plain `grep` stays FAIL after the fix. Use `grep -F` (or `-qF --`) for
   every title assertion; the diff review will check it.
3. W26 proves `--check` no longer exits before the overlap loop; it does not exercise a collision with a quoted-title
   card. Sufficient for the card (the defect is the crash at line 73, before `case`), not more.
4. The smoke's header comment (W1–W21 legend) should gain W22–W26 in the same test commit; `scripts/CLAUDE.md`'s stale
   "W1–W16" stays out of scope as stated.

Verdict: approved (ready for the lead's gate; not approved for build)

## Diff review (pass 1)

Diff `origin/main...HEAD` at `4fd76ce`: 5 files, +218 −3 (`scripts/next-task.sh` +6 −3, `scripts/next-task-smoke.sh` +27,
three `work/B1.27/` files). Probes on /bin/bash 3.2, on `git archive` copies in a scratch directory, never the tree.

Commands I ran (last line each):

| Command                                                            | Result                                                                                       |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                        | exit 0: `All matched files use Prettier code style!` (1 pre-existing hook warning)           |
| `pnpm typecheck`                                                   | exit 0                                                                                       |
| `pnpm test`                                                        | `Tests  202 passed (202)`                                                                    |
| `pnpm test:e2e`                                                    | `43 passed (1.1m)`                                                                           |
| `pnpm test:mutation`                                               | `Final mutation score of 93.40 is greater than or equal to break threshold 70` (542 mutants) |
| `scripts/next-task-smoke.sh` at `969614b` / at `4fd76ce`           | `21 ok, 5 FAIL` (W22 stripped titles; W23–W26 `xargs: unterminated quote`) / `26 ok, 0 FAIL` |
| `check-suppressions` · `check-feat-commits`                        | OK · OK                                                                                      |
| `check-config-change.sh`                                           | error without the label; `CONFIG_CHANGE_APPROVED=true` → allowed; PR #121 carries the label  |
| `check-ac-coverage` · `check-spec-sections` · `check-features-map` | OK · OK · OK                                                                                 |
| `check-plan-scope` · `check-backlog`                               | OK (inside the approved plan) · OK                                                           |
| `verify-red.sh B1.27` / `--auto` (what CI runs)                    | error: no `(red)` commit (stated in the plan: bash smoke, no vitest) / nothing to verify     |
| `grep -c xargs scripts/next-task.sh` · `bash -n`                   | 0 · ok                                                                                       |
| `--claim B1.27` · `--check B1.27` on the real board                | `this checkout holds feat/B1.27-next-task-quotes` · `no overlap`                             |
| `--list` origin/main script vs HEAD script, real board             | byte-identical (7 lines)                                                                     |

Checklist:

- Acceptance (lone `'`, lone `"`, paired `"…"`, `\` in pick, `--claim`, `--check`, `--list`; W1–W21 green): W22–W26,
  each red at `969614b` for the stated reason, green at HEAD. Pass.
- No test touched after the red commit: `git log --first-parent --no-merges 969614b..HEAD -- '*.test.*' e2e/
scripts/next-task-smoke.sh` empty; no merges in range. Fix commit touches `scripts/next-task.sh` only. Pass.
- Every changed file is in `plan.md`; `pr-body.md` is paperwork (check-plan-scope OK). Pass.
- Interfaces: arguments, output, exit codes unchanged; `trim()` is the plan's line verbatim. Pass.
- Plan-review costs: `grep -F` used for every title (2); header legend gained W22–W26 (4). Pass.
- No `src/`, `prisma/`, `e2e/` change; no secret, no suppression; no map row (tooling). Pass (n/a).
- Revert probes on a copy: title line back to `xargs` → W22–W26 fail (the red). Trim mutated to leading-only or
  trailing-only → `4 ok, 22 FAIL`. id/owner/blocked back to `xargs` → 26 ok (titles only carry quotes; the
  `grep -c xargs` → 0 check catches it). Title not trimmed at all → 26 ok (finding 2).

Caller's questions:

- (a) `--list | head -1` → `printf: write error: Broken pipe`: pre-existing. origin/main's script prints the same at
  its line 98 (HEAD: line 101, the same `printf`, shifted 3 lines). Not this diff.
- (b) Downstream of the trim the title only goes through `printf '%s'` into the TSV, `read -r` with `IFS=$'\t'`, and
  `${title:0:30}`; it never reaches `echo`, `awk -v` or an unquoted expansion (`awk -v` gets ids, file paths and branch
  names only). Probed titles ``$(id) `id` %s * [x]``, `-n -e \t \c`, and `x`, two blanks, `y`: printed as written, pick exit 0. The one
  remaining sensitivity is a tab (finding 1).
- (c) Inner repeated spaces: no field logic depends on them (id regex, owner `Lead|Dev`, blocked split by `tr` with
  empty tokens dropped, step numeric). Inner tabs do matter (finding 1).

Findings:

```
[1] KIND: correctness
    WHERE: scripts/next-task.sh:77 (title kept with inner blanks) → :91 (TSV board) → :93-94, :106, :122
    DEFECT: xargs folded an inner tab into a space; trim keeps it, so a tab in any cell adds a TSV column and shifts
            $7 (board state) and $8 (eligibility) for that row.
    TRIGGER: origin/main README row `| 1 | B8.1 | a<TAB>b | §5 | Open | | Dev | S |`, branch feat/B8.1-x, no PR.
    WRONG BEHAVIOUR: pick returns B8.2 instead of the step-1 B8.1 (origin/main: B8.1); `--claim B8.2` says
            `WIP 0/3: Doing ` (origin/main: `WIP 1/3: Doing B8.1`), so the WIP limit and `--check` skip that card;
            `--list` prints the row with shifted columns.
    CONFIDENCE: confirmed (ran both scripts on the same throwaway repo). Not blocking: the trigger cannot reach
            origin/main through the gates. `prettier --check` rewrites the tab inside a table cell to a space and
            fails (ran it: exit 1); it runs in pre-commit on staged `*.md` and in CI's `pnpm lint`, and
            `backlog/README.md` is not in `.prettierignore`. It corrects my plan-review cost 1 ("no logic depends on
            the collapse"): the TSV does, for tabs. Remaining exposure is a lint bypass plus a merge over red CI.
[2] KIND: coverage
    WHERE: scripts/next-task-smoke.sh:144-150 (W22, W23)
    DEFECT: titles are matched with `grep -qF` as substrings, so "as written" does not assert that the title is
            trimmed of the cell's padding.
    TRIGGER: on a copy, line 77 with `title="$(trim "$title")"; ` deleted.
    WRONG BEHAVIOUR: `--list` prints ` say "all done" ` (leading blank, column shifted), and the smoke still reports
            26 ok, 0 FAIL.
    CONFIDENCE: confirmed (ran it). Not blocking: the Acceptance concerns quote and backslash characters, W1–W21 never
            asserted padding either, and the shipped line does trim.
```

Verdict: ready for PR (2 findings, both non-blocking, stated as costs for the lead)

Riskiest unfalsified: a quote character in a non-title cell (Spec §, Blocked by, Owner). The Acceptance names
titles only, and no probe covers those cells; with trim on every cell I traced no failure, but nothing tests it.

### Dispositions (dev-lead, pass 1)

| Pass | #   | Finding (file:line)                                                                     | Source   | Kind        | Disposition      | Justification                                                                                                                                                                                                                                  |
| ---- | --- | --------------------------------------------------------------------------------------- | -------- | ----------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | `scripts/next-task.sh:77` → `:91` a tab inside a cell is kept and adds a TSV column     | reviewer | correctness | no change needed | `next-task.sh` reads only `origin/main`'s README; a table cell `a<TAB>b` fails `prettier --check` (exit 1, run on a scratch `t.md`), which pre-commit runs on staged md and CI `pnpm lint` on every file, so no such row reaches `origin/main` |
| 1    | 2   | `scripts/next-task-smoke.sh` W22/W23 substring match passes with the title trim deleted | reviewer | coverage    | fix now          | 20448af `test(scripts): B1.27 review pass 1` matches `<id>   <title> ` in the `--list` row; title trim deleted on a copy → `24 ok, 2 FAIL`; HEAD → `26 ok, 0 FAIL`                                                                             |
| 1    | —   | broken pipe on `--list \| head -1`                                                      | dev-lead | —           | no change needed | identical at `origin/main` (reviewer, question a)                                                                                                                                                                                              |

Pass 1 of 3: clean after the fix; no behavior change in `scripts/next-task.sh`, so no pass 2.
