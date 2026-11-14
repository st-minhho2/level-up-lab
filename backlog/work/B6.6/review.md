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
