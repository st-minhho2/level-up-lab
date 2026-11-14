# B6.6 review

## Plan review (round 1)

Scope: ui (`src/components/remaining-count.tsx`, its test, `e2e/34-remaining-announce.spec.ts`).

| Check                                                                             | Result                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: the component and test are the §13/§22 module D-33 assigns to B6.6; the e2e file is §34's; `spec/features-map.md` gets the new F32 row (F27–F29 present, F32 absent today)                                 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signature `RemainingCount({ count }: { readonly count: number }): ReactNode` is unchanged and matches §34 Function contracts exactly; stays a Server Component; no action, schema, Prisma or query touched |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A. Deviation stated: advice's `src/components/CLAUDE.md` line is dropped ("package guides stay out", D-33 Notes)                                                                                  |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 ACs; Thens are role counts, exact texts, `toBe` identity, navigation count; "polite" defined by REQ-34.4                                                                                                 |
| verification lists exact commands with expected numbers                           | pass: `pnpm test` 269 → 272 (baseline confirmed: `Tests  269 passed (269)`, 43 files); 3 red unit `it`s, 3 red e2e; e2e +3; mutation ≥ 70 with `src/lib`/`src/actions` untouched; `verify-red.sh B6.6` exit 0    |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton skipped with reason (no new export; red is the missing `status` role, an assertion, `testing.md` allows it); `test(todos)`/`feat(todos)`/`docs(map): F32 … [B6.6]` match B6.1–B6.3 on main        |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `spec/contracts/32-remaining-announce.md:5` `- [ ] Lead approves spec`, unticked                                                                                                                           |
| no settled D-n contradicted                                                       | pass: D-33 (one component, `page.tsx` untouched, F32), D-35 (§22 phrase lifted in 19aa647, nothing else of §22 changed); D-34 belongs to B6.5                                                                    |
| `scripts/next-task.sh --check B6.6`                                               | pass: `[next-task] B6.6: no overlap with any Doing or Review card`                                                                                                                                               |

Also run: `scripts/ci/check-plan-scope.sh B6.6` → `OK: feat/B6.6-agent changes only paperwork`.

Traced, not blocking:

- Existing unit tests AC-13.2, AC-22.2, AC-22.3 query by role/text from `screen`, never `container.firstChild`, so
  the wrapper leaves them green. No e2e uses `main > …` or a bare `getByRole('status')`.
- `/items? left/` matches "1 item left" and "N items left"; B6.5's overdue text contains neither, so the filter
  scopes correctly once both cards merge.
- AC-34.5 navigation counting by main-frame document requests matches `e2e/31-due-today.spec.ts:118-122`
  (the plan corrects advice's `framenavigated`, which would count the App Router's `replaceState`).
- `RemainingCount` sits at a fixed, unconditional position in `page.tsx:54`, so a revalidation re-render reuses the
  `div` (REQ-34.3).

Cost the approval carries (stated in the plan, repeated here because this medium-tier plan proceeds on this review
without the lead, D-27/D-28): the page's `flex flex-col gap-6` sees one child instead of two, so the 1.5rem gap
between "N items left" and "All done" is lost. No visible text changes; keeping the gap needs a D-n and a
`docs(spec)` edit.

Verdict: approved

`approved` means ready for the lead's gate (or, medium tier, the D-27 path), not approved for build by the reviewer.

## Diff review (round 1)

Scope: ui. Range: red 109018b, feat 0999603, map b7d0c92 on base f3b40a2.

### Command results (run by the reviewer, last line of each)

| Command                                | Last line                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| `pnpm lint`                            | `All matched files use Prettier code style!`                                               |
| `pnpm typecheck`                       | `> tsc --noEmit` (exit 0, no error)                                                        |
| `pnpm test`                            | `Tests  272 passed (272)` (43 files; plan said 269 → 272)                                  |
| `pnpm test:e2e`                        | `60 passed (1.8m)` (AC-34.4, AC-34.5, AC-34.6 among them)                                  |
| `pnpm test:mutation`                   | `Final mutation score of 92.63 is greater than or equal to break threshold 70`             |
| `scripts/ci/check-suppressions.sh`     | `OK: no new suppressions`                                                                  |
| `scripts/ci/check-config-change.sh`    | `OK: no protected config changed`                                                          |
| `scripts/ci/check-feat-commits.sh`     | `OK: no feat commit touches tests`                                                         |
| `scripts/ci/check-ac-coverage.sh`      | `OK: every criterion of a shipped section has a test`                                      |
| `scripts/ci/check-spec-sections.sh`    | `OK: sections cited: 1 … 31 34`                                                            |
| `scripts/ci/check-features-map.sh`     | `OK`                                                                                       |
| `scripts/ci/check-plan-scope.sh B6.6`  | `OK: feat/B6.6-agent stays inside the approved plan of B6.6 (D-27 approval)`               |
| `scripts/verify-red.sh B6.6`           | `RESULT: red for the right reason` (3 new unit `it`s, 3 failed; e2e skipped by the script) |
| `git diff --stat f3b40a2..HEAD` (code) | 5 files: `remaining-count.tsx` +4/−3, its test +65/−1, e2e +121, map +1, metrics +1        |

### Checklist

| Check                                                     | Result                                                                                                                                                                                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every AC-34.n has a test whose assertion matches its Then | pass: 34.1–34.3 unit (role count 1, `within` paragraphs/"All done", assertive 0, alert 0, `toBe` held node); 34.4–34.6 e2e (text-scoped `status` count 1, "All done" count, listitem 0, data-attribute identity, main-frame document requests 0) |
| no test weakened after the red commit                     | pass: `git log --first-parent --no-merges 109018b..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` over the same range empty (no merge after red)                                                                                      |
| every changed file is in `plan.md`                        | pass: the four Files rows; `docs/metrics.md` is listed as exempt paperwork and `check-plan-scope.sh` treats it as paperwork (line 22)                                                                                                            |
| `docs/metrics.md` row inside the feat commit              | pass: `.claude/agents/code-writer.md` step 6 requires "implementation + metrics" in the feat commit; `check-feat-commits.sh` rejects only test files; same shape as B6.3 on main                                                                 |
| interfaces match §34 Function contracts                   | pass: signature unchanged; one unconditional `<div role="status">` around the `<p>` and the `<span>`; no class, no `aria-live`, no key; still a Server Component                                                                                 |
| Zod at action boundary · Prisma only in lib · no raw SQL  | n/a: no action, lib, schema or query touched                                                                                                                                                                                                     |
| migration reversible and indexed                          | n/a: none                                                                                                                                                                                                                                        |
| no secret, no suppression                                 | pass: `check-suppressions.sh` OK; diff read line by line                                                                                                                                                                                         |
| features map row moved                                    | pass: F32 §34 ✅ in b7d0c92, files and tests named                                                                                                                                                                                               |
| `page.tsx` untouched, one `status` on `/` today           | pass: `src/app/page.tsx:54` renders `<RemainingCount>` unconditionally; the wrapper is the only `role="status"` under `src/`                                                                                                                     |

### Revert probes (copy at `$TMPDIR/probe`, never the worktree)

| Mutation of `remaining-count.tsx`                         | Result                                                                                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| wrapper back to a fragment (the red commit's tree)        | AC-34.1, 34.2, 34.3 fail (`verify-red.sh`: 3 new failed)                                                                                    |
| `<div role="status" key={count}>` (remount on each count) | unit: AC-34.3 fails (`toBe`). e2e: AC-34.5 fails at line 92, `toHaveAttribute(HELD, 'held')` Expected "held", Received "" ; 34.4, 34.6 pass |
| `aria-live="assertive"` added to the wrapper              | AC-34.1 fails                                                                                                                               |
| "All done" `<span>` moved outside the `status` element    | AC-34.1 and AC-34.3 fail                                                                                                                    |

The dispatcher's question on AC-34.5 is answered: a remount of the wrapper loses the test's data attribute and the
same-node assertion fails in the browser (confirmed above), so AC-34.5 checks REQ-34.3 end to end, not only in jsdom.

### Findings

None blocking.

Not a finding (accepted cost, stated in the plan): `main`'s `flex flex-col gap-6` now sees one child, so the 1.5rem
gap between "N items left" and "All done" is gone; no visible text changes and §34 names no class.

Verdict: ready for PR

Riskiest unfalsified: AC-34.5 at the page level only exercises count changes from a checkbox toggle; a revalidation
that changes the tree above `<RemainingCount>` (for example a future conditional before `page.tsx:54`) could remount
the wrapper on add or delete, which no §34 test drives (AC-13.5 covers the text, not the node).
