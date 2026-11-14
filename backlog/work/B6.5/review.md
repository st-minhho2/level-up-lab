# B6.5 review

## Plan review (round 1)

Plan: `backlog/work/B6.5/plan.md` at 8e27aa1. Baseline re-run: `pnpm test` → `Tests  269 passed (269)`, 43 files
(matches the plan); e2e `test(` count 57 (matches).

| Check                                                                             | Result                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `overdue-count.tsx` / `.test.tsx` are F21's files (`spec/features-map.md:30`); §33 names the same component; `e2e/33-overdue-announce.spec.ts` is one file per section; F31 is D-33's id for B6.5 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signature unchanged, `readonly` props, explicit `ReactNode`; no action, no Prisma, no query                                                                                                       |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A, `undefined` child never `''` stated                                                                                                                                                   |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 5 ACs, node identity (`toBe`), child-node count, timer count, exact strings                                                                                                                       |
| verification lists exact commands with expected numbers                           | fail: `scripts/verify-red.sh B6.5` "exit 0" is not reachable with the planned red commit (reason 1)                                                                                                     |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton omitted with the reason stated (component exists, red is on assertions); subjects follow `backlog/CLAUDE.md`                                                                             |
| `Lead approves spec` box, ticked only by a human                                  | pass: `spec/contracts/31-overdue-announce.md:5` present, unticked; not touched by me                                                                                                                    |
| no settled D-n contradicted                                                       | fail: D-34 says the red commit "removes only the `role` assertion"; the plan also renames the AC-23.3 title in that commit, which is what breaks the red gate (reason 1)                                |
| `scripts/next-task.sh --check B6.5`                                               | pass: `[next-task] B6.5: no overlap with any Doing or Review card`                                                                                                                                      |

### Reasons

1. **The red gate fails as planned (confirmed by tracing `scripts/verify-red.sh`).** `verify-red.sh` names a test by
   describe path + title (line 116) and calls a test "new" when that name did not run at the base (the parent of the
   first `(red)` commit, line 66); PASS requires "zero NEW tests passed" (line 16). The plan puts the AC-23.3 title
   edit ("role or" dropped) in the `(red)` commit. At the base the old title ran; the renamed title did not, so
   `["<OverdueCount> (§23)", "AC-23.3: … has no aria-label; …"]` is new, and it passes against the current component
   (a bare `<span>` with no role or aria-label satisfies every remaining assertion). Result: `GREEN before
implementation: AC-23.3: …`, exit 1, contradicting the plan's "`verify-red.sh B6.5` exit 0" and "the AC-23.3 edit
   is a pre-existing test and stays green". Choose one and write it in the plan:
   (a) keep the AC-23.3 title verbatim in the red commit (D-34's literal "only the `role` assertion"); the title then
   still says "no role" while asserting none, and its rename needs its own commit later, or
   (b) land the AC-23.3 edit (assertion and title) in a separate, non-`(red)` commit before the red commit, e.g.
   `test(todos): B6.5 AC-23.3 drops the role assertion (D-34)`, so the base already has the new title; state in the
   plan that this commit precedes `(red)` and that D-34 is satisfied by it.
   Either way the Verification line must name which commit carries the AC-23.3 change.
2. **AC-33.5's locator must be stated as document order, not sibling order.** B6.6's approved plan
   (`feat/B6.6-agent:backlog/work/B6.6/plan.md`) wraps the `N items left` `<p>` in a `<div role="status">`. After that
   merges, our `<span role="status">` is no longer a sibling of the `<p>`, so a locator written as `p + span`,
   `p ~ [role=status]` or XPath `following-sibling::` finds 0 elements and AC-33.5 goes red on `main`; a locator that
   takes "the first `status`" finds B6.6's div. The plan says only "the one after the `N items left` paragraph". Name
   the mechanism: `getByRole('status')` filtered by `paragraph.compareDocumentPosition(node) &
DOCUMENT_POSITION_FOLLOWING` and not `DOCUMENT_POSITION_CONTAINS` (as `e2e/23-overdue-count.spec.ts:124-127`
   does), which excludes B6.6's ancestor div and holds in both merge orders.

Not blocking, noted for the lead: the card's `Spec:` line reads "§33 — unchanged" although f9d3f3a changed §23
(D-34); §23's contract line 55 ("renders nothing") stays in textual tension with §33, as the plan's "Costs" states.

Verdict: changes requested

## Plan review (round 2)

Plan: `backlog/work/B6.5/plan.md` at 6e8aa63 (only `plan.md` changed since 8e27aa1, besides this file).

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1 (F21's component and test, one e2e file per section, F31 row)                                                                                                                                                                                                                    |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signature identical to §33's function contract; no action, Prisma or query                                                                                                                                                                                                                              |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A                                                                                                                                                                                                                                                                                              |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 5 ACs, all with counts, exact strings or `toBe` identity                                                                                                                                                                                                                                                |
| verification lists exact commands with expected numbers                           | pass: round-1 reason 1 resolved by option (a). AC-23.3's title stays verbatim (`overdue-count.test.tsx:45`), so `verify-red.sh` sees it as a pre-existing test; only line 54 (`not.toHaveAttribute('role')`) goes. The 4 new `it`s fail on the current component (`overdue-count.tsx:22` renders no `status`) |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton omitted with the reason; subjects follow `backlog/CLAUDE.md`                                                                                                                                                                                                                                   |
| `Lead approves spec` box, ticked only by a human                                  | pass: `spec/contracts/31-overdue-announce.md:5` unticked; not touched by me                                                                                                                                                                                                                                   |
| no settled D-n contradicted                                                       | pass: D-34 "removes only the `role` assertion" now matches the plan literally; no other section changes                                                                                                                                                                                                       |
| `scripts/next-task.sh --check B6.5`                                               | pass: `[next-task] B6.5: no overlap with any Doing or Review card`                                                                                                                                                                                                                                            |

Round-1 reason 2 resolved: AC-33.5's locator is `getByRole('status')` filtered by `compareDocumentPosition`
FOLLOWING and not CONTAINS, the same mechanism as `e2e/23-overdue-count.spec.ts:124-127`; it excludes a B6.6
`<div role="status">` that wraps the paragraph and does not depend on sibling adjacency.

Traced, holds after the change: AC-23.3's remaining assertions (`queryAllByText('2 overdue')` finds the span, not
`P`, no `aria-label`, 0 of the five roles since `status` is not counted, text `2 overdue`), AC-23.4 (empty span →
`textContent` `""`), AC-23.5 (no `overdue` in the empty span's markup), AC-23.7 (`getByText` on exact text; the empty
span matches no `N overdue`).

Costs for the lead (stated in the plan, not blocking): (1) AC-23.3's test title keeps "no role" while §23's AC-23.3
Then (`21-overdue-count.md:35`) no longer says it and the test no longer asserts it, until a later non-`(red)` commit
renames it; (2) §23's function-contract "renders nothing" line stays in tension with §33 until a D-n tidies it; (3) the
card's `Spec:` line says "unchanged" although f9d3f3a changed §23.

Verdict: approved (ready for the lead's gate; not approved for build)

## Diff review (round 1)

Scope: ui. Diff `origin/main...HEAD`; red 6caad18, feat ef5bf29, map ec5a7dd, metrics f28ab17. Run by the reviewer
at f28ab17.

| Command                              | Last line                                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| `pnpm lint`                          | `All matched files use Prettier code style!`                                                  |
| `pnpm typecheck`                     | `tsc --noEmit` (exit 0, no output)                                                            |
| `pnpm test`                          | `Tests  273 passed (273)` (43 files)                                                          |
| `pnpm test:e2e`                      | `58 passed (2.3m)`                                                                            |
| `pnpm test:mutation`                 | `Final mutation score of 92.63 is greater than or equal to break threshold 70`                |
| `scripts/ci/check-suppressions.sh`   | `OK: no new suppressions`                                                                     |
| `scripts/ci/check-config-change.sh`  | `OK: no protected config changed`                                                             |
| `scripts/ci/check-feat-commits.sh`   | `OK: no feat commit touches tests`                                                            |
| `scripts/ci/check-ac-coverage.sh`    | `OK: every criterion of a shipped section has a test`                                         |
| `scripts/ci/check-spec-sections.sh`  | `OK: sections cited: 1 … 31 33`                                                               |
| `scripts/ci/check-features-map.sh`   | `OK`                                                                                          |
| `scripts/ci/check-plan-scope.sh`     | `OK: feat/B6.5-agent stays inside the approved plan of B6.5 (D-27 approval)`                  |
| `scripts/verify-red.sh B6.5`         | `RESULT: red for the right reason` (4 new, 4 failed; e2e skipped by the script, needs server) |
| `git diff --stat origin/main...HEAD` | 15 files, 779 insertions, 15 deletions; `src/`: `overdue-count.tsx` +6/-2, its test +124/-1   |

Checklist

| Check                                                    | Result                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-§.n has a test whose assertion matches its Then | pass: AC-33.1–33.4 in `overdue-count.test.tsx` assert each Then item (SPAN, role, 3 absent attributes, 5 role counts, exact text; 5 cases with 0 child nodes; identical `<span role="status"></span>`, 0 stderr writes, `toBe` node; 3 steps + 0 timers); AC-33.5 in `e2e/33-overdue-announce.spec.ts` (one handle, attached, texts and child counts, 0 navigations) |
| no test weakened after the red commit                    | pass: `git log --first-parent --no-merges 6caad18..HEAD -- '*.test.*' e2e/` empty; remerge-diff empty. In the red commit only AC-23.3's `not.toHaveAttribute('role')` line goes, as D-34 and the plan state                                                                                                                                                          |
| every changed file in `plan.md`                          | pass: `overdue-count.tsx`, its test, `e2e/33-…`, `features-map.md`; `docs/metrics.md` is plan-named paperwork; `page.tsx`, `src/lib` untouched                                                                                                                                                                                                                       |
| interfaces match §33 contracts                           | pass: signature and props unchanged; `overdue-count.tsx:23` `return <span role="status">{label}</span>;` with no aria-label/live/atomic                                                                                                                                                                                                                              |
| Zod at action boundary / Prisma only in lib / no raw SQL | n/a: no action, query or schema changed                                                                                                                                                                                                                                                                                                                              |
| migration                                                | n/a                                                                                                                                                                                                                                                                                                                                                                  |
| no secret, no suppression                                | pass (check-suppressions OK; diff read)                                                                                                                                                                                                                                                                                                                              |
| features map row moved                                   | pass: F31 §33 ✅ in ec5a7dd; §33 index row stays ✗ until the closing PR, per plan                                                                                                                                                                                                                                                                                    |
| revert probes (on a clone under `$TMPDIR`)               | see below                                                                                                                                                                                                                                                                                                                                                            |

Revert probes on `overdue-count.tsx:23`, `vitest run src/components/overdue-count.test.tsx`:

- back to `label === undefined ? undefined : <span role="status">…` → AC-33.2, 33.3, 33.4 fail (3 failed / 8).
- `key={label ?? 'none'}` (remount per change) → AC-33.3, 33.4 fail.
- `aria-live="polite"` added → AC-33.1, 33.3 fail.
- `{label ?? ''}` → 8 passed: equivalent (React renders `''` as no text node; SSR markup identical), not a finding.

Findings: none blocking.

Notes (not blocking, no behavior trigger): `docs/metrics.md` B6.5 row's last column still reads `pending (feat)`
although the feat commit is ef5bf29; the dev-lead may fill it before the PR. The plan-review costs (AC-23.3 title
still says "no role", §23 "renders nothing" contract line) stand as stated.

Verdict: ready for PR

Riskiest unfalsified: that a real screen reader announces the first text insertion into a region that was empty
since server render (jsdom and Playwright prove node identity and text, not the announcement itself).
