# B1.29 reviews

## Plan review (round 1)

SCOPE: tooling (`scripts/`, no §, no `src/` change). Plan at `6efdbd4`; card Acceptance in `backlog/plan/E1-todos.md`

### B1.29; carried cases from `backlog/work/B1.25/review.md` (plan review round 2 [1]–[3], diff review pass 1 [1]–[3]).

D-25 (on `origin/main` `73c6da2`, not yet on this branch) applied: scope widening is "out of scope → follow-up", not a
reason to change the plan.

I checked every claim on reviewer copies, not on the dev-lead's outputs: `origin/main`'s `scripts/verify-red.sh`
(byte-equal to the scratchpad `verify-red.old.sh`) and the planned script `verify-red.new.sh`, each driven by the
planned smoke `smoke.new.sh` and by a copy of `hist.sh` (copies under `scratchpad/rev/`).

| Check                                  | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card         | pass: `scripts/verify-red.sh`, `scripts/verify-red-smoke.sh`, `scripts/CLAUDE.md` (smoke row) plus the card's `work/` paperwork. No `src/`, `prisma/` or `e2e/` file, so there is no features-map row. None of B1.28's files (`src/lib/CLAUDE.md`, `src/components/CLAUDE.md`) or B1.20's files (`.claude/hooks/plan-scope.sh`, `scripts/ci/check-plan-scope.sh`, `scripts/hook-smoke.sh`) is listed. B1.20's plan (branch `chore/B1.20-plan-scope-literal`, line 10) explicitly leaves `scripts/CLAUDE.md` out of its scope |
| interfaces / layering                  | pass (n/a for TS): CLI arguments, output lines and exit codes are unchanged. The one new artefact is the scratch file `.verify-red-base.json` inside the throwaway worktree                                                                                                                                                                                                                                                                                                                                                  |
| follows advice or states the deviation | pass: "Tooling card: spec-analyst and advisor skipped". This is the same as B1.24 and B1.25                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ≤ 7 criteria, measurable               | pass: the Acceptance has 4 clauses. V7–V14 each name an exit code and an exact summary line; the history check names 22, 19/3 and the line comparison                                                                                                                                                                                                                                                                                                                                                                        |
| verification exact, with numbers       | pass (see note N2): I reproduced every number. Test commit: `[verify-red-smoke] 8 ok, 6 FAIL`, failing V7 V8 V9 V10 V11 V13. Fix: `[verify-red-smoke] 14 ok, 0 FAIL` under `/bin/bash` 3.2.57. History: 22 commits, 19 rc=0 and 3 rc=1 under both scripts, summaries equal. `check-plan-scope.sh` → `OK: … only paperwork`. `check-backlog.sh` → `OK: README matches the cards`                                                                                                                                              |
| work breakdown                         | pass: `test(scripts)` (probes, no `(red)` marker, the same rule as B1.24/B1.25) → `fix(scripts)` → reviewer diff → `pr-step.sh`. There is no skeleton or map step because this is a tooling card with no § (precedent: B1.24, B1.25)                                                                                                                                                                                                                                                                                         |
| `Lead approves spec` box               | n/a: no spec section. `Plan approved by:` is empty, and I did not fill it                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| no settled D-n contradicted            | pass: D-19 (`config-change-approved`, because `scripts/verify-red.sh` is in `check-config-change.sh`'s `PROTECTED`), D-25 for review dispositions, D-7 untouched                                                                                                                                                                                                                                                                                                                                                             |
| `scripts/next-task.sh --check B1.29`   | pass: `[next-task] B1.29: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

### Acceptance against the plan

- **"recognised by running the base's own copy … full name, describe path included, no prefix rule remains":** the
  planned script deletes `baseTitles`, `unescape`, `PLACEHOLDER` and `isOld`. Its key is
  `JSON.stringify([...ancestorTitles, title])`, built from the base run's report. V8 (another `describe`) and V7 (the
  `.each` prefix) pin it.
- **"carried escape and `%%` cases pass or fail closed with a probe each":** V9 covers `\u{110000}` in a comment
  (main: RangeError, rc=1, no file line; plan: rc=0). V10 covers `%%s`, V11 a literal `%s`, and V12 the `\x`, `\u{…}`
  and `\t` decoding. All four are ok under the planned script.
- **"22 historical red commits keep their verdicts":** I reproduced this. The set is
  `git log --all --no-merges` with subjects matching `^test\([^)]*\): B[0-9]+\.[0-9]+ .*\(red\)$`, which gives 22
  commits. Each was run with `--range C^..C` under both scripts. The exit codes are identical (19 × 0; 3 × 1 for
  `8bfc8e4`, `05f5fe6` and `f41aa2a`, the e2e-only `test(ui)` commits). Sorted, the 44 file lines are identical. B4.2
  `b5fc079` gives rc=0 under both.
- **"PR carries `config-change-approved` (D-19)":** this is in the plan's last paragraph.

### Probes I added on the copies (old = `origin/main`, new = planned)

- **Each guard is load-bearing.** I made three one-line mutants of the planned script:
  - status filter removed: `13 ok, 1 FAIL`, and only V14 fails (`2 ran (1 new) … OK`, rc=0).
  - key reduced to `[title]`: only V8 fails.
  - count rule replaced by `old.has(key)`: only V13 fails.
- **R1, an old passing test whose `describe` the red commit renames (`A` → `A2`), plus a new failing test:** old
  rc=0. New rc=1: `2 ran (2 new), 1 new failed, 1 new passed -> GREEN before implementation: AC-0.1: kept`. See C1.
- **R2, an old `it.each([1, 2])('AC-0.2: row %#')` plus a new failing test:** old rc=1, because `%#` is outside
  `%[sdifjo]` and both rows count as new and green. New rc=0. The plan fixes this case, although no probe names it.
- **R3, an old `it.skip` un-skipped and passing in the red commit:** rc=1 under both scripts. There is no change.

### Costs the lead approves with this plan (not reasons to change it)

- **C1. A red commit that renames or wraps an existing `describe` now fails verify-red.** Every old passing test in
  it counts as new and green (R1: main rc=0 → plan rc=1). This follows from the Acceptance's "describe path
  included", and it fails closed. The plan does not state it. Escape: move the restructuring into a separate
  non-`(red)` commit before the red one. The same applies to an old test whose name another test repeats (V13), and
  to a base test that was skipped or todo (V14), as the plan already states.
- **C2. One more vitest run per card (the base's copies only), in CI's `verify-red.sh --auto` as well.** The plan
  states this cost.
- **C3. "Nothing is old" covers a missing base report, but not an unparsable one.** If the base run writes a
  truncated `.verify-red-base.json`, `require(basePath)` throws, and the card exits 1. That fails closed. I could not
  produce a truncated report, so this is plausible and out of scope → follow-up if it is ever seen.

### Notes for the diff review (no change to the plan required)

- **N1.** `kept="${7-$4}"` (no colon) is what lets V14 pass an empty 7th argument. The diff must keep the
  colon-less form.
- **N2.** "identical file lines" holds only as a set. Vitest orders files differently between runs: unsorted, 2/22
  outputs differ (`8293598`, `fae3314`), only in order. Compare `grep 'ran (' | sort`. The 22-commit set also depends
  on this clone's refs: none of the 22 is on `origin/main` (squash merges), and they are reached through
  `refs/remotes/pr/*` and `refs/remotes/origin/feat/*`. The diff review should use the same 22 SHAs listed in
  `scratchpad/rev/h-old/summary`.

Verdict: approved

Riskiest unfalsified: a test whose reported name is not stable between two runs of the same source, such as an
`.each` over `%o` objects with unordered keys, or a time or random value in a title. It would count as new and fail
closed (exit 1) on a legitimate red commit. No title in `src/` today is dynamic: there is one `.each` in
`src/lib/env.test.ts:55` and no `${…}` title.
