# B2.5 review

## Plan review (round 1)

Reviewed at `b910f06` (`plan.md` 75 lines, `advice.md`, `analysis.md`, `spec/contracts/14-search.md`). Run here:
`pnpm test` → `Tests  138 passed (138)` (the plan's baseline holds); e2e titles counted in `e2e/*.spec.ts` → 24 (the
plan's phase-A e2e number holds); `scripts/next-task.sh --check B2.5` → `[next-task] B2.5: no overlap with any Doing or
Review card` (exit 0); `scripts/ci/check-spec-sections.sh` → `OK: sections cited: 1 … 14 16`;
`scripts/ci/check-features-map.sh` → `OK`; `scripts/ci/check-ac-coverage.sh` → `§16: ✗, no tests expected yet (7
criteria)` then `OK`. Probe (scratch copy, not the tree): a skeleton shaped as §16's contract plus the planned
unprefixed length-guard test → `Tests  1 failed | 1 passed (2)`, the guard is the one that passed (reason 1).

| Check                                                                                  | Result                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: the two modules and two test files are the paths §16's Function contracts name; F14 matches the card (`backlog/plan/E2-todos-plus.md:53`, "F14 · section 16") and lands `✗` in the skeleton, as F10–F12 did; phase-B files (page, e2e, two guides) are declared, not listed, so `plan-scope.sh` blocks them until round 2                                                                                                 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: signatures copy §16 verbatim (explicit return types, `readonly` props, generic over `{ readonly title }`, `TodoFilter` union); no action, no Zod schema, no Prisma, no `server-only` (pure lib, Server Component); nothing to mutate                                                                                                                                                                                      |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: Approach A, `TITLE_MAX_LENGTH` Way 1, wiring A; the departure from `analysis.md` Q8 (e2e in phase B, not red now) is stated and is the advice's own verdict                                                                                                                                                                                                                                                               |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 7 criteria; each Then is an exact return value, id list, address, `listitem` count or exact text                                                                                                                                                                                                                                                                                                                          |
| verification lists exact commands with expected numbers                                | fail: `verify-red.sh B2.5` → "8 new tests fail …, 0 new pass" is not reachable with the planned unprefixed length-guard test (reason 1). The other numbers hold: 6 lib (16.1, 16.2, 16.3 ×2, 16.4, guard) + 2 component = 8, 138 → 146, e2e 24 unchanged, mutation ≥ 70 with named hot spots                                                                                                                                    |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: `chore(todos)` → `test(todos) … (red)` → `feat(todos)` → phase-A review → (phase B `test(ui) … (red)` → `feat(ui)`) → `docs(map): F14 … [B2.5]` → review; same subjects as B2.2/B2.3; `verify-red.sh` takes the first red commit's parent and the last red commit's files, so the phase-A unit tests stay proven at phase B                                                                                               |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `spec/contracts/14-search.md:5` `- [ ] Lead approves spec (lead, <date>)`, unticked; plan routes it through the gate's `approve` (D-7)                                                                                                                                                                                                                                                                                    |
| no settled D-n contradicted                                                            | pass: D-20 (a) own modules, no held file edited (`todo-schema.ts` imported read-only, which `--check` does not count as a hold); D-5 limit reused, not redefined; D-7 box; D-19 none needed (no protected path); sibling section written "section 15"                                                                                                                                                                           |
| `scripts/next-task.sh --check B2.5` on the committed plan says no overlap              | pass, vacuously against B2.4: `[next-task] B2.5: no overlap with any Doing or Review card`. B2.4 has no `plan.md` on `feat/B2.4-due-date` (head `4159741`), so `plan-files.sh --any` returns nothing for it and the check compared B2.5 against an empty list; it says nothing yet about B2.4. Phase A lists no held file, so the result cannot change when B2.4's plan appears unless B2.4 plans one of B2.5's two new modules |

Verdict: changes requested

1. **The red gate cannot pass as planned: the unprefixed length-guard test is green before implementation.**
   `plan.md` Files row `src/lib/todo-search.test.ts` plans "length guard = real `TITLE_MAX_LENGTH`" (advice: "equals the
   real `TITLE_MAX_LENGTH` and is 200"), and Verification says `verify-red.sh B2.5` → "0 new pass". A `const` cannot
   throw `NotImplementedError`, so the skeleton either writes §16's `SEARCH_QUERY_MAX_LENGTH: number = TITLE_MAX_LENGTH`
   (then the guard passes at the base: probed, `1 failed | 1 passed`, and `verify-red.sh` reports "GREEN before
   implementation" and exits 1 per its `passed.length` branch) or writes a placeholder value (an invented second
   definition of the limit, against §16's "one definition", D-5 and the skill's "never implement behavior here, even
   'obvious' one-liners" in the opposite direction). Trigger: the red commit as planned, run through
   `scripts/verify-red.sh B2.5`. State which way the plan goes, and fix the numbers to match, e.g.: (a) the guard lands
   after green in its own `test(todos): B2.5 …` commit without `(red)` (verify-red counts only `(red)` commits; red
   becomes 7 new, total still 146); or (b) drop the guard and let AC-16.5's `maxlength` `200` pin the value through the
   component (see reason 2). Not (c) a placeholder constant in the skeleton.
2. **Nothing pins that the component reads `SEARCH_QUERY_MAX_LENGTH` rather than a literal 200.** The advice's "Must
   not" ("redefine 200 as a literal … in the component's `maxLength`; use `SEARCH_QUERY_MAX_LENGTH` there") is not in
   the plan, §16's contract comment itself writes `maxLength={200}`, and AC-16.5 asserts `200`, which a literal also
   satisfies. Trigger: a code-writer working from `plan.md` and §16 writes `maxLength={200}`; every planned test passes
   and the limit has two definitions. Add the import to the `todo-search-form.tsx` row so the diff review can hold the
   code to it (`git grep -n "maxLength" src/components/todo-search-form.tsx` → `SEARCH_QUERY_MAX_LENGTH`).

Costs the lead accepts with this approach (not reasons, already in the plan or advice, stated here so approval sees them):

- Two approvals and a held WIP slot. AC-16.6, AC-16.7, REQ-16.1 (form on `/` in every state), REQ-16.7, REQ-16.9 and
  REQ-16.10 have no proof until phase B; the PR stays draft and nothing is user-visible after phase A.
- The wait may be unnecessary. B2.4's advice (`feat/B2.4-due-date`, `4159741`, Approach A) recommends listing
  `src/app/page.tsx` and `src/lib/todo-schema.ts` as not touched "so B2.5 gets `page.tsx` at once". If B2.4's plan
  follows it, the plan's "Earlier only if …" clause lets phase B start before B2.4 merges, after a re-run of
  `--check B2.5` and the round-2 approval; until then the brief's hold governs.
- Phase-B numbers will move. "24 + 3 = 27" e2e and the unit total assume B2.4 has not merged; B2.4 adds `e2e/15` and
  unit tests, so round 2 restates both after `git merge origin/main` (B2.2 did the same in `a1adb62`).
- Paperwork conflicts with B2.4 (F13/F14 map rows, section 15/16 index rows, `docs/metrics.md`, two package guides)
  fall to the second PR to merge, rows kept in numeric order.
