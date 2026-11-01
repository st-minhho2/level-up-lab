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

## Diff review (pass 1)

SCOPE: tooling (`scripts/`, no §, no `src/` change). Range `origin/main...HEAD` = `6efdbd4..eaf0ad9`: test `1ae8fbb`
(smoke V7–V14), fix `eaf0ad9` (`verify-red.sh`, `scripts/CLAUDE.md` row). The committed `verify-red.sh` is the
plan-review copy `rev/new.sh` with only comment changes (header steps 4 and 6, the status-filter wording) and
`require('path').relative` → `path.relative`. I ran every check below on a copy (`scratchpad/dr/probe`), not on the
dev-lead's outputs.

### Command results (last line of each)

| Command                                    | Result                                                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`                                | `All matched files use Prettier code style!`                                                                                               |
| `pnpm typecheck`                           | `tsc --noEmit`, no error                                                                                                                   |
| `pnpm test`                                | `Tests  202 passed (202)`                                                                                                                  |
| `pnpm test:e2e`                            | `43 passed (1.0m)`                                                                                                                         |
| `pnpm test:mutation`                       | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                                                             |
| `check-suppressions.sh`                    | `OK: no new suppressions`                                                                                                                  |
| `check-config-change.sh`                   | `::error::` lists `scripts/verify-red.sh` locally (no label in the env); PR #131 carries `config-change-approved`                          |
| `check-feat-commits.sh`                    | `OK: no feat commit touches tests`                                                                                                         |
| `check-ac-coverage.sh`                     | `OK: every criterion of a shipped section has a test`                                                                                      |
| `check-spec-sections.sh`                   | `OK: sections cited: 1 … 22`                                                                                                               |
| `check-features-map.sh`                    | `OK`                                                                                                                                       |
| `check-plan-scope.sh` / `check-backlog.sh` | `OK: … stays inside the approved plan of B1.29` / `OK: README matches the cards`                                                           |
| `verify-red.sh B1.29`                      | n/a: tooling card, no `(red)` commit (plan, same as B1.24/B1.25); the smoke is the red/green gate                                          |
| smoke, main's script + `1ae8fbb` probes    | `[verify-red-smoke] 8 ok, 6 FAIL` (V7 V8 V9 V10 V11 V13; V9 rc=1 with no file line)                                                        |
| smoke, fix (bash 5.x / `/bin/bash` 3.2)    | `[verify-red-smoke] 14 ok, 0 FAIL` / `[verify-red-smoke] 14 ok, 0 FAIL`                                                                    |
| 22 historical red commits, fix             | rc identical to the plan reviewer's own main-script run (`rev/h-old`): 19 × 0, 3 × 1; 44 file lines equal once sorted; B4.2 `b5fc079` rc=0 |

### Checklist

- Acceptance "base's own copy, full name, no prefix rule": pass. `baseTitles`, `unescape`, `PLACEHOLDER`, `isOld` are
  gone; key `JSON.stringify([...ancestorTitles, title])` from the base report; V7 and V8 pin it.
- Acceptance "escape and `%%` cases pass or fail closed with a probe each": pass, V9–V12.
- Acceptance "22 historical red commits keep their verdicts": pass (above).
- Acceptance "`config-change-approved`": pass, label on PR #131. Its head is still `2e84b96`: the test and fix commits
  are not pushed yet.
- No test weakened after the test commit: `git log --first-parent --no-merges 1ae8fbb..HEAD -- '*.test.*' e2e/
scripts/verify-red-smoke.sh` is empty; no merge commits in the range. V1–V6 bodies unchanged; `kept="${7-$4}"`
  stays colon-less (N1).
- Every changed file is in `plan.md`: pass (6 files, same table). No `src/`, `prisma/`, `e2e/` change, so no
  features-map row, no Zod, Prisma or migration surface.
- No secret, no suppression: pass (the existing `# shellcheck disable=SC2086` is copied for the new base-run line,
  the same word-splitting the red run already uses; `check-suppressions.sh` does not count shell directives).
- Would a test fail if one changed line were reverted: pass. Main's script against the new probes: 6 FAIL (above). The
  plan review's three one-line mutants (status filter, `[title]` key, `has` instead of count) each turned exactly one
  probe (V14, V8, V13) red, and the code they mutate is unchanged since.

### Extra probes on the copy (`scratchpad/dr/adv2.sh`; main = `origin/main`'s script, fix = `eaf0ad9`)

| Probe | Input (base → red commit)                                                                     | main          | fix              |
| ----- | --------------------------------------------------------------------------------------------- | ------------- | ---------------- |
| A1    | base `it('AC-0.1: x')` passing + `it.todo('AC-0.1: x')`; red keeps both + new failing         | rc=0          | rc=1, GREEN on x |
| A2    | old title `` `AC-0.2: max ${200}` `` passing + new failing                                    | rc=1 (GREEN)  | rc=0             |
| A3    | old title `` `AC-0.3: ${Math.random()}` `` passing + new failing                              | rc=1          | rc=1             |
| A4    | old passing `'AC-0.4: same'` replaced by a new passing body under the same name + new failing | rc=0          | rc=0             |
| A5    | old passing `'AC-0.5: s'` turned into `it.skip`, + a new passing `'AC-0.5: s'` + new failing  | rc=0 (hidden) | rc=1, GREEN on s |
| A6    | old `describe('B')` whose `beforeAll` throws, kept + new failing                              | rc=0          | rc=0             |

A2, A5: the fix closes cases main got wrong. A3: the plan review's riskiest spot (an unstable title) fails closed
under both scripts, so it is not a regression. A4: a body rewritten under an old name is old by name under both
(inherent to any name rule, unchanged).

### Answers to the dev-lead's three doubts

- **(a) `seen` counts todo/skipped occurrences, `old` does not.** Confirmed by A1: a name that occurs once as a
  passing test and once as `it.todo` at the base is new in the red run, so the kept passing test reads GREEN (main
  rc=0 → fix rc=1). It fails closed and is the plan's stated rule "a repeated name is new in every occurrence". The
  symmetric alternative (count `seen` over passed/failed only) reopens A5: the skipped copy drops out of `seen`, the
  new passing test matches the old count and is hidden. Keep the asymmetry; no finding.
- **(b) vitest's positional args are substring filters.** Pre-existing for the red run. The base run reports per
  `file.name` and is looked up per relative path, so an extra file in the base report only costs time. No `src/`
  stem has both a `.test.ts` and a `.test.tsx` today (`git ls-files` check), so nothing is picked up. No finding.
- **(c) header steps 4–6.** Steps 4 and 5 match the code. Step 6 omits the count rule, see [1]. The `-h` range
  `2,18p` stops before line 19 (`Exit 0 = …`), as main's `2,16p` stopped before its line 17: unchanged, not a finding.

### Findings

```
[1] KIND: correctness (comment)
    WHERE: scripts/verify-red.sh:16-17
    DEFECT: step 6 says a test is new "when the base's run did not run its describe path and title in that file", but
            the code (line 137) also marks every occurrence of a name new when the red run reports it more often than
            the base ran it.
    TRIGGER: V13 (base ran 'AC-0.7: dup' once; the red commit keeps it and adds a second 'AC-0.7: dup'): the base did
             run that name, yet the script prints "3 ran (3 new), …, 2 new passed" and exits 1.
    WRONG BEHAVIOUR: a reader of the header (or `verify-red.sh -h`) expects the kept 'AC-0.7: dup' to be old and the
                     run to exit 0; the script, correctly per the plan, exits 1.
    CONFIDENCE: confirmed (smoke V13 output on the copy)
    DISPOSITION (D-25): out of scope → follow-up. It is not a regression, an Acceptance line or a failing probe; the
                        follow-up adds ", or more often than the base ran it" to step 6.
```

Verdict: ready for PR

Riskiest unfalsified: the base run uses the current checkout's `node_modules` against an older base commit. A base
test file that fails to load there (dependency drift) makes every old test new, so a legitimate red commit exits 1
(fails closed). The red run already depends on the same `node_modules`, and none of the 22 historical commits hits
this.

### Dispositions (dev-lead, pass 1)

| Pass | #   | Finding (file:line)                          | Source   | Kind               | Disposition | Justification                                                                                                                                                                     |
| ---- | --- | -------------------------------------------- | -------- | ------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | `scripts/verify-red.sh:16-17` step 6 comment | reviewer | correctness (text) | fix now     | the card's own new header text, not a widening: step 6 now names the count rule. Comment only (no verdict can change); `-h` still prints lines 2–18. Not re-reviewed (passes 1/3) |

Own pass: V1–V6 probe lines unchanged (`git diff origin/main...HEAD -- scripts/verify-red-smoke.sh`: only the header,
the `probe` helper and V7–V14); diff inside the plan's Files (`check-plan-scope.sh` OK); no `src/`, `prisma/`, `e2e/`.
Each rule is pinned by one probe (plan review: status filter → V14, describe path → V8, count → V13).
