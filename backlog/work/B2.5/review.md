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

## Diff review (pass 1)

Phase A, reviewed at `29a9d4e` (skeleton `edf5727` → red `b70450c` → green `29a9d4e`). Scope: lib, ui (component
only; no `src/app` or `e2e` change in phase A).

Run here (last line of each):

| Command                             | Result                                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`                         | `All matched files use Prettier code style!` (exit 0)                                                                                      |
| `pnpm typecheck`                    | `tsc --noEmit` (exit 0)                                                                                                                    |
| `pnpm test`                         | `Tests  145 passed (145)`                                                                                                                  |
| `pnpm test:e2e`                     | `24 passed (23.6s)`                                                                                                                        |
| `pnpm test:mutation`                | `Final mutation score of 91.39 is greater than or equal to break threshold 70`; `todo-search.ts` 100.00, 16 killed, 0 survived             |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                                                  |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                                                          |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                                                         |
| `scripts/ci/check-ac-coverage.sh`   | `§16: ✗, no tests expected yet (7 criteria)` then `OK`                                                                                     |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 14 16`                                                                                                            |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                                                       |
| `scripts/verify-red.sh B2.5`        | lib `5 ran (5 new), 5 new failed, 0 new passed`; component `2 ran (2 new), 2 new failed, 0 new passed`; `RESULT: red for the right reason` |
| `git diff --stat main...HEAD`       | 12 files, 921 insertions, 1 deletion; `src/`: the 4 planned files only                                                                     |

Probes (scratch copy under `$TMPDIR`, never the tree):

- P1, `searchTodos` on a 202-character query: title `'İ'.repeat(200)` passes `createTodoSchema` (`success true`);
  `parseSearchQuery('i̇'.repeat(101))` has length 202; `searchTodos([{ title }], query)` returns 1 todo
  (finding 1).
- P2, component line mutations against `todo-search-form.test.tsx`: removing `role="search"`, `method="get"` or
  `htmlFor`, `defaultValue=""`, and `{true && <hidden>}` each fail 1–2 tests; `maxLength={200}` and `value="active"`
  each leave `Tests  2 passed (2)`.
- P3, phase B's mount applied to the copy's `page.tsx` (contract wiring), real Chromium: `/` → type `milk` → Search →
  `/?q=milk`, box `milk` → click "Active" (`next/link`) → `/?filter=active`, box `''`; after reload `''`. In jsdom,
  `rerender` with a new `query` keeps the old value (`milk`), so only the e2e can settle this.

### Checklist

| Check                                                                | Result                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every AC-§.n has a test whose assertion matches its Then             | pass for phase A: AC-16.1 (9 cases, never throws, length 201), AC-16.2 (8 queries, input unchanged, `''` gives a new array), AC-16.3 ×2 (5 punctuation queries; composed U+00E9/U+00C9 checked in bytes), AC-16.4 (10 cases), AC-16.5 ×2 (landmark, GET `/`, searchbox `q`/200/value, submit button, 0 listitems, hidden filter). AC-16.6, AC-16.7 are phase B (§16 ✗, `check-ac-coverage` expects none yet) |
| no test weakened after the red commit                                | pass: `git log --first-parent --no-merges b70450c..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` empty (no merge)                                                                                                                                                                                                                                                                                |
| every changed file is in `plan.md`                                   | pass: the 4 `src/` files are the plan's Files rows; `spec/features-map.md` F14 ✗, `backlog/plan/E2-todos-plus.md`, `backlog/work/B2.5/*`, the §16 contract and index row are paperwork                                                                                                                                                                                                                       |
| interfaces match the section's contracts                             | pass: the four lib exports and `TodoSearchForm` are §16's Function contracts verbatim; no `'use client'`; hidden `filter` only when not All; the form imports `SEARCH_QUERY_MAX_LENGTH` (`git grep -n maxLength` → line 17), as round 1 reason 2 required                                                                                                                                                    |
| Zod at every action boundary · Prisma only in `src/lib` · no raw SQL | pass, vacuous: no action, no Prisma, no SQL; both modules are pure and server-only-free                                                                                                                                                                                                                                                                                                                      |
| migration reversible and indexed                                     | n/a: no `prisma/` change                                                                                                                                                                                                                                                                                                                                                                                     |
| no secret, no suppression                                            | pass: `check-suppressions` OK, no `eslint-disable`, `@ts-`, `skip`/`only`/`todo` in the diff                                                                                                                                                                                                                                                                                                                 |
| features map row moved                                               | pass for phase A: F14 lands ✗ in the skeleton; it moves at step 7 after phase B                                                                                                                                                                                                                                                                                                                              |
| would a test fail if one changed line were reverted                  | pass: every changed line reverted to the skeleton body throws `NotImplementedError` (verify-red at `edf5727`); P2 shows two non-revert mutations that survive (see questions 3 and Riskiest)                                                                                                                                                                                                                 |

### Questions from the dev-lead

1. **The literal `'No todos match your search'` in `searchEmptyMessage`.** Not a finding. `src/CLAUDE.md:16` asks for
   named module-level spec constants; the text is verbatim REQ-16.8 and AC-16.4 pins it exactly (a drift fails a
   test). Precedent is mixed: `todo-filter.ts:6` names its texts in a record, `todo-count.ts:8` and
   `todo-schema.ts:8` inline theirs. A named constant would match `todo-filter.ts`; nothing requires it before PR.
2. **`defaultValue={query}` after a soft navigation.** Not a finding, and it belongs to phase B's e2e. P3, with phase
   B's wiring on a copy in real Chromium, gives an empty box after the "Active" link from `/?q=milk`, which is the
   path AC-16.6 pins ("after Active … the box is empty"). jsdom keeps the stale value on `rerender`, so a component
   test cannot prove it either way. If phase B's AC-16.6 goes red on that step, the fix touches
   `todo-search-form.tsx` (for example a `key` on the input), so the round-2 amendment must list that file. Not
   covered by §16: text typed but not submitted, then a filter link. The spec is silent; that goes to
   `analysis.md`, not a finding.
3. **AC-16.5 and `maxLength` from the constant.** Confirmed as the plan accepted: P2's `maxLength={200}` leaves both
   tests green. The value 200 is pinned by the test, the single definition only by this review: line 17 reads
   `maxLength={SEARCH_QUERY_MAX_LENGTH}`.

### Findings

```
[1] KIND: spec-mismatch
    WHERE: src/lib/todo-search.ts:16-17 (and spec/contracts/14-search.md, REQ-16.5 vs the searchTodos contract line)
    DEFECT: a query longer than 200 characters can match a todo, because `toLowerCase()` turns U+0130 into two code
            units, so a lowercased 200-character title can contain a lowercased query of more than 200.
    TRIGGER: a stored todo titled 'İ'.repeat(200) (accepted by §5's createTodoSchema, length 200) and the
             address /?q= followed by 'i̇' 101 times, percent-encoded (parseSearchQuery → length 202; the form's
             maxLength stops it being typed, the address does not)
    WRONG BEHAVIOUR: searchTodos returns that todo (P1: 1 result); REQ-16.5 says "a query longer than 200
             characters matches no todo"
    CONFIDENCE: confirmed (P1)
```

The code is §16's `searchTodos` contract line as written (`title.toLowerCase().includes(query.toLowerCase())`), so
this is a conflict between two parts of §16 (spec ≠ spec), not a code-writer error. Per `spec-fidelity.md` it goes to
`/advise` and the lead, not to a role: either REQ-16.5 governs (a `docs(spec): §16 …` commit under a D-n, a red
test with the trigger above, then a length guard in `searchTodos`), or the contract governs (REQ-16.5's sentence is
narrowed to say what "characters" counts). Real-world reach: only titles holding U+0130 (Turkish dotted capital I)
and only via a hand-built address. It changes no stored todo and no count. Phase A's code needs no change unless the
ruling picks REQ-16.5, so this does not block the draft PR. It must be ruled before phase B's round-2 approval.

Verdict: ready for PR (draft, phase A; finding 1 waits on a lead ruling via `/advise`, not on a role)

Riskiest unfalsified: the hidden `filter` input under Completed. `value="active"` survives both AC-16.5 renders
(P2), and phase B's AC-16.6 submits the search only under Active, so no planned test proves that a search from
`/?filter=completed` keeps `filter=completed` (REQ-16.6). The code (`value={filter}`) is correct as I read it. Nothing
falsifies a regression there.

### Dispositions (pass 1, dev-lead)

| Pass | #   | Finding (file:line)                                        | Source   | Kind          | Disposition                                       | Justification                                                                                                                                                                                                      |
| ---- | --- | ---------------------------------------------------------- | -------- | ------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | 1   | `src/lib/todo-search.ts:16-17` (REQ-16.5 vs contract line) | reviewer | spec-mismatch | out of scope for phase A: waits on the lead's D-n | `/advise` verdict: spec ≠ spec inside section 16, escalate human (`decision-request.md`, README "Waiting on human"); code matches the contract line; ruling before phase B round 2, option A adds red test + guard |
| 1    | 2   | hidden `filter` under Completed untested (riskiest)        | reviewer | test gap      | out of scope for phase A: phase B e2e             | phase B amendment adds a search from `/?filter=completed` keeping `filter=completed` (REQ-16.6) to `e2e/16-search.spec.ts`                                                                                         |
| 1    | 3   | dev-lead own pass: invariants 1–8, plan Files, map row     | dev-lead | —             | no change needed                                  | no Zod/action/Prisma (pure lib + Server Component); diff = plan Files + paperwork; F14 row ✗ as planned; reverting any line of `searchTodos` fails AC-16.2/16.3 (mutation 16/16 killed)                            |

## Diff review (pass 2)

Phase A after D-21, reviewed at `9467b13` (since pass 1 `3beb57b`: dispositions `cf32104`, D-21 `214cc6d`,
`docs(spec)` `af4f5dc`, review-pass test `3a3348a`, fix `b43ef24`, hardening test `9467b13`). Scope: lib (the only
`src/` change since pass 1 is `src/lib/todo-search.ts` and its test).

Run here (last line of each):

| Command                             | Result                                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`                         | `All matched files use Prettier code style!` (exit 0)                                                                                      |
| `pnpm typecheck`                    | `tsc --noEmit` (exit 0)                                                                                                                    |
| `pnpm test`                         | `Tests  147 passed (147)`                                                                                                                  |
| `pnpm test:e2e`                     | `24 passed (21.7s)`                                                                                                                        |
| `pnpm test:mutation`                | `Final mutation score of 91.59 is greater than or equal to break threshold 70`; `todo-search.ts` 100.00, 21 killed, 0 survived             |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                                                  |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                                                          |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests` (`b43ef24` is `fix(todos)`, 1 file, `src/lib/todo-search.ts`)                                           |
| `scripts/ci/check-ac-coverage.sh`   | `§16: ✗, no tests expected yet (7 criteria)` then `OK`                                                                                     |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 14 16`                                                                                                            |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                                                       |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B2.5-search stays inside the approved plan of B2.5`                                                                              |
| `scripts/verify-red.sh B2.5`        | lib `5 ran (5 new), 5 new failed, 0 new passed`; component `2 ran (2 new), 2 new failed, 0 new passed`; `RESULT: red for the right reason` |
| `git diff --stat main...HEAD`       | 14 files, 1082 insertions, 1 deletion; `src/`: the 4 planned files only                                                                    |

Probes (scratch clone under `$TMPDIR`, never the tree):

- P4, the dev-lead's question (`verify-red.sh` once phase B adds a later `(red)` commit): on a clone at `9467b13` plus
  a dummy `test(ui): B2.5 search on / (red)` adding `e2e/16-search.spec.ts`, both `scripts/verify-red.sh B2.5` and
  `--auto` print `test commits : b70450cfd4 91f4d7b828`, base `edf5727c66` (skeleton), `src/lib/todo-search.test.ts:
7 ran (7 new), 7 new failed, 0 new passed`, component `2 ran … 2 new failed`, `RESULT: red for the right reason`
  (exit 0). The script copies the test files from the LAST `(red)` commit onto the parent of the FIRST, so the two
  review-pass tests are judged too; at the skeleton both fail with `NotImplementedError: searchTodos(1, …) is not
implemented` (vitest at `edf5727`'s `todo-search.ts`), not on an assertion that could pass. Safe as long as phase
  B's red commit adds no test that passes against the skeleton, which a page/e2e-only red commit cannot.
- P5, variants of the guard against `todo-search.test.ts` (7 tests): guard removed → `1 failed | 6 passed`; guard
  on the untrimmed `query` → `1 failed`; `>` → `>=` → `1 failed`; guard moved after `toLowerCase` (on `needle`) →
  `7 passed`; threshold `> 201` → `7 passed`. Neither survivor is a Stryker operator, so 100 % does not see them.

### Checklist

| Check                                                                | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-21 as recorded matches the lead's ruling                           | pass: option A's Behavior ("any trimmed query with `length > 200` (JS `.length`, the unit of §5's `max(200)`) returns `[]`") is D-21's Decision and the new contract line; the request's AC-16.8 case (title `'İ'` × 200, query `'i̇'` × 101 → `[]`) is now in AC-16.3's Given/When/Then with the same input and outcome. Only the id differs; `check-ac-coverage.sh:13` (`[[ $total -gt 7 ]]`) confirms the 7-criteria cap. No behavior of the ruling is lost |
| every AC-§.n has a test whose assertion matches its Then             | pass for phase A: AC-16.3's new case is `src/lib/todo-search.test.ts:101`: asserts title length 200, query length 202, that the lowercased title does contain the query (so the case is live), and `[]`; at `3a3348a` it failed (1 failed, 145 passed), at HEAD it passes. AC-16.1, 16.2, 16.4, 16.5 unchanged since pass 1. AC-16.6, 16.7 are phase B                                                                                                        |
| no test weakened after the red commit                                | pass: `git log --first-parent --no-merges b70450c..HEAD -- '*.test.*' e2e/` → `3a3348a`, `9467b13`, both `test(todos): B2.5 review pass 1 -- …` commits, additions only (13 and 14 lines, 0 deletions); `--merges --remerge-diff` → empty (no merge)                                                                                                                                                                                                          |
| every changed file is in `plan.md`                                   | pass: `src/lib/todo-search.ts` and its test are Files rows; `00-decisions.md`, `README.md`, `decision-request.md`, the §16 contract are paperwork under D-21; `check-plan-scope.sh` OK                                                                                                                                                                                                                                                                        |
| interfaces match the section's contracts                             | pass: `searchTodos` signature unchanged; body follows the new contract line: trims, `trimmed.length > SEARCH_QUERY_MAX_LENGTH` → `[]` before any `toLowerCase`/`includes`, then the old comparison; `filter` still returns a new array in input order                                                                                                                                                                                                         |
| Zod at every action boundary · Prisma only in `src/lib` · no raw SQL | pass, vacuous: no action, no Prisma, no SQL                                                                                                                                                                                                                                                                                                                                                                                                                   |
| migration reversible and indexed                                     | n/a: no `prisma/` change                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| no secret, no suppression                                            | pass: `check-suppressions` OK; no `skip`/`only`/`todo` added                                                                                                                                                                                                                                                                                                                                                                                                  |
| features map row moved                                               | pass for phase A: F14 ✗ since the skeleton; moves at step 7                                                                                                                                                                                                                                                                                                                                                                                                   |
| would a test fail if one changed line were reverted                  | pass: removing the guard, or measuring the untrimmed query, fails 1 test (P5); `>` → `>=` fails the hardening test (P5, and Stryker 21/21). Two non-revert variants survive (P5): the guard after lowercasing, and a threshold of 201. Not findings: HEAD is correct by trace, and AC-16.3's Then names the 202 query, so the tests copy the spec. The first is the riskiest spot below                                                                       |

### Notes (non-blocking, for the lead)

- N1. D-21's Consequence says "REQ-16.5 unchanged", but `af4f5dc` adds "(UTF-16 code units, as §5 counts titles)" to
  REQ-16.5. That unit is the one option A's Behavior column and D-21's Decision name, so the edit is inside the
  ruling and changes no outcome the code produces; only the record's wording is off. `00-decisions.md` is never
  rewritten, so if it matters, a later D-n or the closing note says so.
- N2. `af4f5dc` (agent-authored) re-labels §16's ticked box `(lead, 2026-10-31, plan gate of B2.5; D-21)`. The lead's
  "action A" ruled the behavior, not the exact text of REQ-16.5 and AC-16.3; reading `af4f5dc` (12 lines) before
  the phase-B round-2 approval makes the box's claim true.
- N3. `src/lib/todo-search.test.ts:102` says "Escapes, not literals" but lines 103–104 hold literal `İ` (bytes
  `304 260`) and `i̇` (`i` + `314 207`); it has been literals since `3a3348a`. The code units are right, and an NFD
  rewrite of the file would fail the `toHaveLength(200)` assertion instead of passing silently, so this is only
  a false comment. Fixing it is a `test(todos)` commit by `test-writer`.

### Findings

None blocking.

Verdict: ready for PR (draft, phase A; pass-1 finding 1 resolved by D-21 + `3a3348a`/`b43ef24`)

Riskiest unfalsified: where the guard measures. HEAD checks `trimmed.length` before `toLowerCase`, as D-21 requires
(traced), but no test tells it apart from a check on the lowercased needle (P5: `7 passed`). Under that refactor a
query of 101 `İ` (length 101, lowercased 202) would match nothing, even though the title `'İ'` × 101 contains it
and REQ-16.5 allows it. No AC's Then pins it, so nothing fails if someone moves the line.
