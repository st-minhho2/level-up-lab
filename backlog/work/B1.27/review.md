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
