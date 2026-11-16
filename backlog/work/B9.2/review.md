# B9.2 review

## Plan review (round 1)

Scope: ui (`src/components/todo-due-date.tsx`, a component test, one e2e file). Plan at `8b075a9`.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: `todo-due-date.tsx` is the file §45's function contract names ("The only file of `src/` this section changes"); the unit test is the card's `Test:` file; `e2e/45-due-date-focus.spec.ts` follows the section-number naming of `e2e/` (§37 → `37-due-date-today`, §40 → `40-due-date-clear`, §43 → `43-complete-all-hidden`); F43 is D-40's id for §45 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signature and props unchanged, no export, action, schema, Prisma or env change; a `useRef<HTMLInputElement>` + `useEffect` in a client component that already holds state and events                                                                                                                                                                   |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A. One deviation, stated: the e2e file is `45-…` (section number) where advice wrote `43-…` (contract file number); the plan's name is the right one per `e2e/`                                                                                                                                                                               |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: AC-45.1 to AC-45.7, each Then names `document.activeElement`, values, call or request counts                                                                                                                                                                                                                                                           |
| verification lists exact commands with expected numbers                           | pass: baselines re-run by me, `pnpm test` "Tests 338 passed (338)", 53 files; `playwright test --list` "Total: 82 tests in 36 files". Expected 344 / 54 and 83 / 37; mutation "CI only" (no `src/lib` or `src/actions` change)                                                                                                                               |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton skipped with reason (no new export); `test(todos): B9.2 … (red)`, `feat(todos): B9.2 …`, `docs(map): F43 … [B9.2]`, `docs(backlog): B9.2 review …`                                                                                                                                                                                            |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `spec/contracts/43-due-date-focus.md:5` `- [ ] Lead approves spec`, unticked; not ticked by me                                                                                                                                                                                                                                                         |
| no settled D-n contradicted                                                       | pass: D-40 (one file, §40 clause already on main at `38-due-date-clear.md:64`, sibling "unchanged" notes excluded by §45 itself), D-7 (box left to the lead or the gate's `approve`), D-28 (`scripts/agent/tier.sh` → `medium`)                                                                                                                              |
| `scripts/next-task.sh --check B9.2` says no overlap                               | pass: "[next-task] B9.2: no overlap with any Doing or Review card" (exit 0); `scripts/ci/check-plan-scope.sh`: "OK: feat/B9.2-agent changes only paperwork"                                                                                                                                                                                                  |

Probe: none (plan mode). Also checked: no sibling test or e2e sends a key to the active element after "Edit due date"
(`todo-due-date.test.tsx:240` clicks the field first; `e2e/28…:73` and `e2e/37…:104` press on a located element),
so moving focus into the field breaks no existing test.

Notes for the lead (not blocking):

1. The stated StrictMode cost is overstated: React's StrictMode replays effects on mount only, when `editing` is
   `false`, so the guarded effect calls `focus()` once per switch in `next dev` too. No behavior to accept there.
2. `pnpm test` 338 → 344 assumes one `it` per criterion; AC-45.3 and AC-45.4 each have (a) and (b). If the
   test-writer splits them, the expected total is 345 to 346; the diff review accepts that count when every title
   starts with its `AC-45.n`.
3. AC-45.4 expects "Update due date" to keep focus after a pending save disables it. That holds in jsdom (no focus
   fixup) and AC-45.4 is unit-only; in a browser a disabled focused button loses focus. No e2e asserts it, so no
   conflict for this card.

Verdict: approved (ready for the lead's gate, not approved for build)
