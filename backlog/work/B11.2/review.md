# B11.2 review

## Plan review (round 1)

SCOPE: ui (`src/components/complete-all-button.tsx`, its component test; `spec/features-map.md`)

| Check                                                                             | Result                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `complete-all-button.tsx` is the one `src/` file §52 names (contract line 248); the new test file follows the section's naming; F50 is the card's feature id (card line 31, D-45 F46–F51)                   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signature and props unchanged, explicit `ReactNode` return kept; no action, schema, lib or Prisma touch                                                                                                     |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A, B rejected with reasons matching advice                                                                                                                                                         |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 criteria (AC-52.1–52.6), each Then states counts, exact text, attribute presence or equality                                                                                                              |
| verification lists exact commands with expected numbers                           | pass: baseline 381 vitest (I ran `pnpm exec vitest list`: 381) and 42 e2e files (`ls e2e/*.spec.ts`: 42); 381 → 387, 90 → 90; mutation "CI only" is right, no `src/lib`/`src/actions` change (B1.100)             |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton step explicitly empty (no new export), pin + `(red)` test commits, `feat(todos)`, `docs(map)`, `docs(backlog)`; identical shape to B10.2, which merged (#359)                                      |
| the section has a `Lead approves spec` box, ticked only by a human, never by you  | pass: box present, unticked; issue #363 carries `agent-ready` (checked with `gh issue list`), the spec approval under D-27; not ticked by me                                                                      |
| no settled D-n contradicted                                                       | pass: D-45 (B11.2 → §52, `complete-all-button.tsx` only, F50; E10 merged before E11 — B10.1–10.3 are on main); D-27/D-28 tier medium (`src/`, `spec/` rows only; no `prisma/`, dependency, env or protected path) |
| `scripts/next-task.sh --check B11.2` says no overlap                              | pass: `[next-task] B11.2: no overlap with any Doing or Review card`                                                                                                                                               |

Pin claims traced against the current component: with no `id` and no `aria-describedby` in the source today, AC-52.2
(no id, no attribute before a click), AC-52.5 (the §43 early return unmounts `CompleteAllButtonShown`, dropping `error`)
and AC-52.6 (`fieldErrors.form?.[0]` is `undefined`, so no `<p>`) hold at the base; AC-52.1, 52.3 and 52.4 each assert
`aria-describedby` equal to the alert id, which fails today on an assertion, not an import. `useId` placed in
`CompleteAllButtonShown` keeps the outer early return hook-free and gives an unmounted-then-remounted button a fresh
state with no message, as REQ-52.5 asks.

Costs the lead takes (stated in the plan, repeated here): tests compare `aria-describedby` to the alert's runtime `id`
rather than a literal; AC-52.4 relies on jsdom computing the description on a disabled button. No behavior is dropped
(the server-rendered markup is unchanged while no failure is shown).

Non-blocking note: AC-52.4's Given has two settlements ("in one render … in another"); if the test-writer splits them
into two `it`s, the expected `pnpm test` count becomes 388, not 387. The diff review will accept either if every
AC-52.n title is present.

Verdict: approved (ready for the lead's gate under D-27; tier medium, so the reviewer's approval stands in for it)

## Diff review (round 1)

SCOPE: ui (`src/components/complete-all-button.tsx`, `src/components/complete-all-button-description.test.tsx`)

### Command results (last line of each, run by the reviewer on 278a159)

| Command                             | Last line                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!` (exit 0)                         |
| `pnpm typecheck`                    | `> tsc --noEmit` (exit 0)                                                     |
| `pnpm test`                         | `Tests  387 passed (387)` (61 files; plan said 381 → 387)                     |
| `pnpm test:e2e`                     | `90 passed (4.2m)` (plan said 90 → 90)                                        |
| `scripts/mutation-gate.sh`          | `mutation: CI only, no src/lib or src/actions change`                         |
| `scripts/ci/check-suppressions.sh`  | `[check-suppressions] OK: no new suppressions`                                |
| `scripts/ci/check-config-change.sh` | `[check-config-change] OK: no protected config changed`                       |
| `scripts/ci/check-feat-commits.sh`  | `[check-feat-commits] OK: no feat commit touches tests`                       |
| `scripts/ci/check-ac-coverage.sh`   | `[check-ac-coverage] OK: every criterion of a shipped section has a test`     |
| `scripts/ci/check-spec-sections.sh` | `[check-spec-sections] OK: sections cited: 1 … 53`                            |
| `scripts/ci/check-features-map.sh`  | `[check-features-map] OK`                                                     |
| `scripts/verify-red.sh B11.2`       | `RESULT: red for the right reason` (6 ran, 3 new, 3 new failed, 0 new passed) |
| `git diff --stat main...HEAD`       | `8 files changed, 526 insertions(+), 3 deletions(-)`                          |

### Checklist

| Check                                                       | Result                                                                                                                                                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-52.n has a test whose assertion matches its Then   | pass: AC-52.1–52.6 each read against the full Then column; every count, exact text, `hasAttribute`, `toHaveAccessibleDescription`, next-sibling and call-count clause is asserted           |
| no test weakened after the red commit                       | pass: `git log --first-parent --no-merges 10fc315..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` empty (no merges)                                                              |
| every changed file is in `plan.md`                          | pass: component, test file, `spec/features-map.md` in Files; `docs/metrics.md` and `backlog/work/B11.2/*` are the plan's stated paperwork                                                   |
| interfaces match §52 Function contracts                     | pass: signature and props unchanged; `useId()` in `CompleteAllButtonShown`; `<p id={messageId} role="alert">`; `aria-describedby` only while `error !== undefined`; no ref, focus, tabindex |
| Zod at every action boundary / Prisma only in lib / raw SQL | n/a: no action, lib or Prisma change                                                                                                                                                        |
| migration reversible and indexed                            | n/a: no migration                                                                                                                                                                           |
| no secret, no suppression                                   | pass: check-suppressions OK; no secret in diff                                                                                                                                              |
| features map row moved                                      | pass: F50 §52 ✅ added in `docs(map)` commit 278a159                                                                                                                                        |
| would a test fail if a changed line were reverted (probes)  | pass, on a clone under `$TMPDIR`: see below                                                                                                                                                 |

Probes (on `git clone` copies, `pnpm exec vitest run src/components/complete-all-button-description.test.tsx`):

1. `aria-describedby={messageId}` unconditionally: 5 failed (AC-52.2, 52.3, 52.4, 52.5, 52.6).
2. `setError(undefined)` at the start of a retry (forbidden by REQ-52.4): 1 failed (AC-52.4).
3. `id={messageId}` removed from the alert: 3 failed (AC-52.1, 52.3, 52.4).
4. `const messageId = "complete-all-error"` (a hard-coded id, forbidden by REQ-52.1): 6 passed. No criterion's Then
   measures the id's source, and the page renders one `CompleteAllButton`, so no observable behavior differs; the
   code under review does use `useId` (line 28). Not a finding against this diff; named below as the riskiest spot.

### Findings

None blocking.

Verdict: ready for PR

Riskiest unfalsified: REQ-52.1's "generated with React's `useId` (no hard-coded id)" has no test that tells the two
apart (probe 4 passes with a literal id); it holds today only by reading line 28, so a later refactor to a literal
would pass the suite.
