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

## Plan review (round 2)

Reviewed at `7939d8e` (`plan.md` 76 lines; diff `b910f06..7939d8e` touches only `plan.md`: the test-file row, the
form row, Verification lines 1–2, step 3b, the status line). Run here: `pnpm test` → `Tests  138 passed (138)`;
`scripts/next-task.sh --check B2.5` → `[next-task] B2.5: no overlap with any Doing or Review card` (exit 0);
`scripts/ci/check-spec-sections.sh` → `OK: sections cited: 1 … 14 16`; `scripts/ci/check-features-map.sh` → `OK`;
`scripts/ci/check-ac-coverage.sh` → `§16: ✗, no tests expected yet (7 criteria)` then `OK`. Probe (independent clone
under `$TMPDIR`, not the tree): the planned sequence skeleton (`SEARCH_QUERY_MAX_LENGTH: number = TITLE_MAX_LENGTH`) →
`test(todos): B2.5 … (red)` → `feat(todos)` → step 3b guard commit → step 5 `test(ui): B2.5 search on / (red)`
(e2e only), then `scripts/verify-red.sh B2.5 --range <base>..HEAD` after each: after green and after 3b `RESULT: red
for the right reason`; after step 5 `src/lib/todo-search.test.ts: 2 ran (2 new), 1 new failed, 1 new passed -> GREEN
before implementation: the search limit is the title limit, 200` and `::error::B2.5 tests are not red for the right
reason` (reason 1).

Round-1 reasons:

- Reason 1 (red gate unreachable with the guard in the red commit): resolved for phase A. The guard leaves the red
  commit for step 3b `test(todos): B2.5 review pass 1 -- max length guard`, no `(red)`, the subject
  `backlog/CLAUDE.md:34` prescribes; red is 7 new (5 lib: 16.1, 16.2, 16.3 ×2, 16.4; 2 component), 138 + 7 = 145
  after green, 146 after the guard. The move breaks phase B instead (new reason 1 below). My round-1 option (a) and
  its claim that phase-A tests "stay proven at phase B" missed this: `verify-red.sh` copies every red-touched file
  from the **last** `(red)` commit.
- Reason 2 (literal 200 in the form): resolved. The `todo-search-form.tsx` row now reads
  `maxLength={SEARCH_QUERY_MAX_LENGTH}` imported (never a literal 200); the diff review holds the code to it.

| Check                                                                                  | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: unchanged from round 1; the four phase-A files are the paths §16's Function contracts name, F14 lands `✗` in the skeleton; phase-B files declared, not listed                                                                                                                                                                                                                                                                                                                                                         |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: Interfaces block unchanged, copies §16 verbatim; the form now imports the constant from a pure lib module (no Prisma, no `server-only`), allowed in a Server Component                                                                                                                                                                                                                                                                                                                                                |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: Approach A, Way 1, wiring A; the advice's "use `SEARCH_QUERY_MAX_LENGTH` there" is now in the plan; the e2e-in-phase-B departure from `analysis.md` Q8 stays stated                                                                                                                                                                                                                                                                                                                                                   |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 7 criteria, each Then an exact value, id list, address, count or text                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| verification lists exact commands with expected numbers                                | fail: the phase-A numbers hold (verify-red 7 new red / 0 new pass, 145 → 146, e2e 24, mutation ≥ 70 with hot spots), but the phase-B line "e2e/16 red 3 failed → green" omits that `scripts/verify-red.sh B2.5` (and CI's `verify-red.sh --auto`, `.github/workflows/ci.yml:154`) exits 1 once the phase-B red commit exists (reason 1)                                                                                                                                                                                     |
| work breakdown has skeleton → red → green → map → review with convention subjects      | fail: step 3b's subject follows `backlog/CLAUDE.md:34`, but its position (before step 5's `(red)` commit, in a file a `(red)` commit touched) makes the final PR's red gate fail (reason 1); the rest unchanged and conventional                                                                                                                                                                                                                                                                                            |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `spec/contracts/14-search.md:5` `- [ ] Lead approves spec (lead, <date>)`, unticked; plan routes it through the gate's `approve` (D-7)                                                                                                                                                                                                                                                                                                                                                                                |
| no settled D-n contradicted                                                            | pass: D-20 (a), D-5 (one limit, now also kept one in the component), D-7, D-19 none needed                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `scripts/next-task.sh --check B2.5` on the committed plan says no overlap              | pass, and no longer vacuous: `[next-task] B2.5: no overlap with any Doing or Review card`. The brief says B2.4 has no plan; it has one: `feat/B2.4-due-date` `dd1d6cf docs(backlog): B2.4 plan` (19:57, before `7939d8e`), B2.4 is `Doing` on `--list`, and `plan-files.sh --any B2.4 feat/B2.4-due-date` lists 16 files, none of B2.5's four. B2.4's plan does not list `src/app/page.tsx` or `src/lib/todo-schema.ts` ("B2.5 may take the page at once") but does list `src/lib/CLAUDE.md` and `src/components/CLAUDE.md` |

Verdict: changes requested

1. **The phase-B red commit makes `verify-red.sh B2.5` fail on the step-3b guard, so the final PR's CI is red.**
   `verify-red.sh` collects the `*.test.ts(x)` files of every `(red)` commit, takes the base as the parent of the
   first one (the skeleton) and copies those files from the last one (lines 66–90). Step 5 `test(ui): B2.5 search on
/ (red)` becomes the last `(red)` commit; at it `src/lib/todo-search.test.ts` already holds the step-3b guard,
   which is new against the base and passes on the skeleton (a constant cannot be red, as round 1 found). Trigger:
   the planned sequence up to step 5, then `scripts/verify-red.sh B2.5` or CI's `verify-red.sh --auto` on the PR.
   Wrong behaviour: `-> GREEN before implementation: <guard title>`, exit 1 (probed above). Pick one and fix
   Verification and the Work breakdown to match: (a) the guard lands after the last `(red)` commit (after step 5, e.g.
   with phase B's review as `test(todos): B2.5 review pass 2 -- max length guard`; phase-A total stays 145); (b) the
   guard goes in a test file no `(red)` commit touches (one more Files row); or (c) drop the guard and let AC-16.5's
   `maxlength` `200`, through the now-imported constant, pin the value. The same trap holds for any hardening test
   that phase A's review (step 4) adds to `todo-search.test.ts` or `todo-search-form.test.tsx`: state that phase-A
   hardening tests follow the same rule.

Costs the lead accepts with this approach (not reasons; restated from round 1 with the round-2 facts):

- Two approvals and a held WIP slot; AC-16.6, AC-16.7, REQ-16.1, REQ-16.7, REQ-16.9, REQ-16.10 have no proof until
  phase B; the PR stays draft and nothing is user-visible after phase A.
- The early start is now half open. B2.4's written plan (`dd1d6cf`, not yet approved) lists neither `page.tsx` nor
  `todo-schema.ts`, which meets the plan's "Earlier only if" clause; but phase B also plans `src/lib/CLAUDE.md` and
  `src/components/CLAUDE.md`, which B2.4 lists and `next-task.sh --check` does not treat as paperwork (`paper()`
  covers only `backlog/`, `spec/`, `docs/metrics.md`, `docs/mistake-log.md`), so the clause's "`--check` is clean"
  fails while phase B keeps the two guide rows. Starting before B2.4 merges means dropping those rows from phase B
  (or B2.4 dropping them), or waiting.
- Phase-B numbers will move once `origin/main` carries B2.4 (`e2e/15`, its unit tests): "24 + 3 = 27" and the unit
  total are restated in the round-2 amendment.
- Paperwork conflicts with B2.4 (F13/F14 map rows, section 15/16 index rows, `docs/metrics.md`, two package guides)
  fall to the second PR to merge, rows kept in numeric order.
