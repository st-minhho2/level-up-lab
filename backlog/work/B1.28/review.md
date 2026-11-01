# B1.28 review

## Plan review (round 1)

SCOPE: lib, ui (documentation only: `src/lib/CLAUDE.md`, `src/components/CLAUDE.md`; no code, no §)

Plan reviewed at `363ef7b docs(backlog): B1.28 plan`. Contract = card Acceptance (`backlog/plan/E1-todos.md` ### B1.28);
sources checked: `spec/contracts/18-created-date.md` (§20), `19-clear-search.md` (§21), `20-all-done.md` (§22),
`spec/features-map.md` F18–F20, and the 8 `^export` lines of `todo-created.ts`, `clear-search.ts`, `todo-count.ts`
(names in the plan match all 8; `todo-created.ts` and `clear-search.ts` headers say "pure, no Prisma, no server-only").

| Check                                                                             | Result                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: the two guides are the card's only non-paperwork files; module names match F18 (`todo-created.ts`), F19 (`clear-search.ts`), F20 (`todo-count.ts`, `remaining-count.tsx`)                                                                        |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: no interface touched; §20–§22 add no action, schema or model                                                                                                                                                                                     |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; tier quick with no `todos.ts` query, so dev-lead Loop 2 skips the advisor, and the plan says so                                                                                                                                  |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: one Acceptance bullet, each clause checked by a grep or a script line                                                                                                                                                                            |
| verification lists exact commands with expected numbers                           | fail: reason 3 (`git grep -n` prints lines, "4 matches" depends on line layout the plan leaves open)                                                                                                                                                   |
| work breakdown has skeleton → red → green → map → review with convention subjects | fail: reason 1 (step 1's role cannot write the files) and reason 4 (no review-gate step); the missing skeleton/test/map steps are a stated, acceptable deviation for a no-§ docs card (red = the card's Test command before, as B1.27 did for tooling) |
| `Lead approves spec` box, ticked only by a human                                  | pass (n/a): no section, no spec box; `Plan approved by:` is empty                                                                                                                                                                                      |
| no settled D-n contradicted                                                       | pass: D-22/D-24 left guides out of batch plans and the lead accepted the drift; this card is that catch-up PR, as #106 was for §17–§19                                                                                                                 |
| `scripts/next-task.sh --check B1.28` on the committed plan                        | pass: `[next-task] B1.28: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                           |

Baselines run on `363ef7b`: `[check-spec-sections] OK: sections cited: 1 … 22`; `[check-features-map] OK`;
`[check-plan-scope] OK: docs/B1.28-package-guides changes only paperwork (B1.28 has no approved plan)`;
`[check-backlog] OK: README matches the cards`; `git grep -n -e todo-created -e clear-search 33e7f7d -- src/lib/CLAUDE.md`
→ no output, exit 1 (the red holds); prettier → "All matched files use Prettier code style!".

Verdict: changes requested

1. **Step 1's role cannot do its step.** Work breakdown step 1 gives "both guides edited" to `dev-lead`, but
   `dev-lead`'s frontmatter path-guard is `'backlog/*' 'docs/metrics.md' 'docs/mistake-log.md' '!backlog/00-decisions.md'`.
   Probe: `path-guard.sh` with those patterns on `src/lib/CLAUDE.md` → `BLOCKED … outside this role's paths`, exit 2;
   with `code-writer`'s patterns (`'src/*' …`) → exit 0. Name the writer that can: `code-writer` (dispatched with the
   Files table as its brief), or the orchestrating session as in #106 (`c0d4593`); the commit row follows that choice.
2. **The mandated sentence is false for a row with a due date unless qualified.** The plan writes "no text content
   beyond its title" bare. TRIGGER: a todo with `dueDate` `2026-11-05` (and, when open and past due, §17's `Overdue`):
   `todo-due-date.tsx:91` renders the text node `Due 2026-11-05` inside the `<li>`, so the row's text content is
   `B2` + `Due 2026-11-05` (spec AC-20.6 "B2's row text reading `B2` followed by `Due 2026-11-05`"; AC-17.7). AC-5.1
   and AC-20.3 only hold for a row without a due date. Keep the Acceptance phrase (the grep still matches) and qualify
   it in the same line, e.g. "without a due date a row adds no text content beyond its title (AC-5.1, AC-20.3 compare
   whole-row text); §15 `Due <date>` and §17 `Overdue` are the only additions". Same file, same sentence, no new
   criterion, so not a widening under D-25.
3. **Expected count is ambiguous.** `git grep -n -e 'no text content beyond its title' -e '<time>' -e 'Clear search'
-e 'All done' src/components/CLAUDE.md` → "4 matches" counts output lines; if the `<time>` mention shares the line of
   the row sentence (the Files cell joins them with "+"), the output is 3 lines and a correct edit reads as a failure;
   a phrase hard-wrapped across two lines (prettier `proseWrap` is unset, so it does not rejoin) gives 0 for it. State
   one expected count per pattern (e.g. `git grep -c -e '<pattern>' src/components/CLAUDE.md` → 1 each, four commands)
   or state that the four phrases sit on four separate lines, each unwrapped.
4. **No review-gate step.** The edit lands under `src/`, so `require-review.sh` blocks the stop
   (`review_change_exists` diffs `src e2e prisma`, Markdown included) until `.claude/hooks/mark-reviewed.sh` records the
   fingerprint, which re-runs lint, typecheck and tests. Add `/review-loop` → `.claude/hooks/mark-reviewed.sh` after
   step 2 and the expected last lines of `pnpm lint`, `pnpm typecheck`, `pnpm test` (unchanged counts from `main`) to
   Verification.

Non-blocking: commit scope `docs(src)` passes lefthook's subject regex; #106 used `docs(guides)` for the same kind of
change, so either works. The out-of-scope note (root `CLAUDE.md` Map `src/lib/` §3–§6, `src/CLAUDE.md` package table)
is correctly kept as a follow-up under D-25; `src/actions/CLAUDE.md` needs no change (§20–§22 add no action).

Riskiest unfalsified: whether the §21 line keeps `todo-search-form.tsx` described as a Server Component (§21 contract:
"still no 'use client'"); the Acceptance does not ask for it and the plan does not say.

## Plan review (round 2)

SCOPE: lib, ui (documentation only: `src/lib/CLAUDE.md`, `src/components/CLAUDE.md`; no code, no §)

Plan reviewed at `d267183 docs(backlog): B1.28 plan round 2 after plan review round 1`. Round 1 reasons: 1 resolved
(step 1 = orchestrating session, as #106); 3 resolved (`git grep -c` per pattern, "one fact per line, none
hard-wrapped"; `Server Component; §2` → 2 matches L3 + L4 only, the §13 and §16 lines use "is a Server Component"
without a semicolon); 4 resolved (step 3 `mark-reviewed.sh`, lint/tsc/test expected lines); 2 only partly resolved, see
reason 1. Round 1's riskiest unfalsified is closed: L3 keeps `todo-search-form.tsx` a Server Component, matching its
header and §21.

| Check                                                                             | Result                                                                                                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: two guides plus `work/B1.28/` paperwork; module names match F18–F20                                                      |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: no interface touched; the export count is wrong (reason 2)                                                               |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; advisor skipped and stated                                                                               |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | fail: reason 1 (the L1 sentence states a rule that is false in edit mode and with an error message)                            |
| verification lists exact commands with expected numbers                           | pass: one count per pattern; `pnpm test` → `Tests  202 passed (202)` reproduced on `d267183`                                   |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton/test/map steps are a stated deviation for a no-§ docs card; step 1 writer can write `src/`; review gate present |
| `Lead approves spec` box, ticked only by a human                                  | pass (n/a): no section; `Plan approved by:` is empty                                                                           |
| no settled D-n contradicted                                                       | pass: D-22/D-24 catch-up as #106; D-25 out-of-scope note kept                                                                  |
| `scripts/next-task.sh --check B1.28` on the committed plan                        | pass: `[next-task] B1.28: no overlap with any Doing or Review card` (exit 0)                                                   |

Baselines run on `d267183`: `[check-spec-sections] OK: sections cited: 1 2 … 22`; `[check-features-map] OK`;
`[check-plan-scope] OK: docs/B1.28-package-guides changes only paperwork (B1.28 has no approved plan)`;
`[check-backlog] OK: README matches the cards`; `git grep -n -e todo-created -e clear-search src/lib/CLAUDE.md` → no
output, exit 1 (the red holds); `pnpm test` → `Tests  202 passed (202)`; prettier on `plan.md` → clean.

Verdict: changes requested

1. **L1 says the due-date texts are the only additions, but edit mode and error messages add text too.** This wording
   came from my own round 1 suggestion, so the mistake is mine to fix. TRIGGER (a): `toggleTodoAction` resolves
   `{ ok: false, fieldErrors: { form: [MUTATION_FAILED_MESSAGE] } }`. `todo-item.tsx:112-114` renders the `role="alert"`
   `<span>` inside the `<li>`, so the row's text is the title plus that message. The same happens with the alerts at
   `todo-due-date.tsx:111` and `delete-todo-button.tsx:41`. TRIGGER (b): the person clicks "Edit title".
   `todo-item.tsx:62-64` (sr-only `Edit title` label) and `:79` (`Save`) put text into the `<li>`, and so does
   `todo-due-date.tsx:68-69` (`Due date`) in its edit mode. The spec already limits the rule to one state:
   `04-edit-title.md:49` says the row "adds no text content in its idle state", and AC-20.3 asserts the text "in view
   mode" only. A guide that leaves this out tells the next writer that an inline error inside the row breaks AC-5.1.
   Fix: keep the Acceptance phrase and give the state, e.g. "In its idle state (view mode, no error message) a row
   (`<li>`) adds no text content beyond its title (AC-5.1, AC-20.3); §15 `Due <date>` and §17 `Overdue` are the only
   idle additions." This is the same line and the same grep (`no text content beyond its title` → 1), so it does not
   widen the card under D-25.
2. **"the 8 existing `^export` lines" is 9.** `grep -n '^export' src/lib/todo-created.ts src/lib/clear-search.ts src/lib/todo-count.ts`
   prints 9 lines: 3 in `todo-created.ts`, 3 in `clear-search.ts`, and 3 in `todo-count.ts` (`countRemaining`,
   `remainingLabel`, `allDoneMessage`). Round 1 repeated the 8 without checking it. This is a one-word fix in
   "Interfaces touched", and the number goes into the PR body as written.

Non-blocking: the plan is 53 lines against the ≈ 40-line screen in `planning.md` (round 1's was 43). You can delete the
round-2 recap (lines 3–5) because `review.md` already holds it. `pr-body.md` is in Files but no step produces it. It
belongs to the PR step, so name it there or leave it as in earlier cards.

Riskiest unfalsified: whether the final L1–L4 text survives prettier with each fact on one unwrapped line. If a line is
hard-wrapped, the plan's `git grep -c` counts drop to 0 for that phrase, and only the diff review can show it.

## Diff review (pass 1)

SCOPE: lib, ui (documentation only: `src/lib/CLAUDE.md`, `src/components/CLAUDE.md`; no code, no §)

Diff reviewed at `dacbfcd docs(src): B1.28 package guides name sections 20 to 22`, range `33e7f7d..HEAD` (the
merge-base with `origin/main`; local `main` is stale, so `git diff --stat main...HEAD` lists 117 files from earlier
merged PRs). `git diff --stat 33e7f7d..HEAD`: 5 files, 248 insertions, 6 deletions (`src/components/CLAUDE.md` 10,
`src/lib/CLAUDE.md` 6, `work/B1.28/` plan, pr-body, review). `origin/main` is 1 commit ahead (`73c6da2`, D-25 row in
`00-decisions.md` only); `git merge-tree --write-tree origin/main HEAD` is clean.

Command results (last line of each):

| Command                                                            | Result                                                                                                      |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                        | `All matched files use Prettier code style!`                                                                |
| `pnpm typecheck`                                                   | `tsc --noEmit`, exit 0                                                                                      |
| `pnpm test`                                                        | `Tests  202 passed (202)` (33 files), as on `33e7f7d`                                                       |
| `pnpm test:e2e`                                                    | `43 passed (1.1m)`                                                                                          |
| `pnpm test:mutation`                                               | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                              |
| `scripts/ci/check-suppressions.sh`                                 | `OK: no new suppressions`                                                                                   |
| `scripts/ci/check-config-change.sh`                                | `OK: no protected config changed`                                                                           |
| `scripts/ci/check-feat-commits.sh`                                 | `OK: no feat commit touches tests`                                                                          |
| `scripts/ci/check-ac-coverage.sh`                                  | `OK: every criterion of a shipped section has a test`                                                       |
| `scripts/ci/check-spec-sections.sh`                                | `OK: sections cited: 1 2 … 22`                                                                              |
| `scripts/ci/check-features-map.sh`                                 | `OK`                                                                                                        |
| `scripts/ci/check-plan-scope.sh`, `check-backlog.sh`               | `OK: … stays inside the approved plan of B1.28`; `OK: README matches the cards`                             |
| `scripts/verify-red.sh B1.28`                                      | `::error::no 'test(<pkg>): B1.28 … (red)' commit`: expected, no test file by design (plan, "Red/green")     |
| Card Test, before: `git grep -n -e todo-created -e clear-search …` | on `33e7f7d`: no output, exit 1 (red)                                                                       |
| Card Test, after                                                   | 2 lines (`src/lib/CLAUDE.md:22`, `:23`), exit 0 (green)                                                     |
| Plan counts                                                        | `§22` in lib guide → 2; components: 1, 1, 1, 1 and `Server Component; §2` → 2, as the plan states           |
| Revert probe (base `src/components/CLAUDE.md` from `33e7f7d`)      | the four Acceptance phrases count 0 each, so reverting any of L1–L4 drops its count; lib rows drop the Test |
| `prettier --check` on both guides and this file                    | clean; every L1–L4 fact is on one unwrapped line (round 2's riskiest unfalsified is closed)                 |

Checklist:

| Check                                                                                             | Result                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance clause holds                                                                     | pass: lib rows for `todo-created.ts` (§20) and `clear-search.ts` (§21) list the 3 + 3 exports F18/F19 map to; `todo-count.ts` cites §13, §22; components names the §20 `<time>`, §21 link, §22 message; headings §22 |
| export names match source                                                                         | pass: the 9 `^export` lines of the three modules are named exactly, no extra name                                                                                                                                    |
| lib row text matches the function contracts                                                       | pass: `allDoneMessage` "'All done' when count === 0, otherwise undefined" (§22); `clearSearchHref` `/` for All, `/?filter=<f>` else, never `q` (REQ-21.3); `createdDayOf` UTC getters (REQ-20.1)                     |
| components lines match source and contracts                                                       | pass: `remaining-count.tsx` renders `<p>` + sibling `<span>`; `todo-search-form.tsx` has no `'use client'` and a `next/link`; `todo-item.tsx` empty `<time>` after `<TodoDueDate>`, `::after` from `data-created`    |
| L1 qualifier is true                                                                              | pass: idle row without due date = label (title) + icon-only "Edit title", "Edit due date", "Delete todo" (`aria-label`, `svg aria-hidden`) + empty `<time>`; `Due <date>` and `Overdue` are the only idle text nodes |
| no test touched after red (`git log --first-parent --no-merges 33e7f7d..HEAD -- '*.test.*' e2e/`) | pass: empty; no merge commits in range                                                                                                                                                                               |
| every changed file in `plan.md`                                                                   | pass: 5 of 5                                                                                                                                                                                                         |
| interfaces / Zod / Prisma / raw SQL / migration                                                   | n/a: no code                                                                                                                                                                                                         |
| no secret, no suppression                                                                         | pass                                                                                                                                                                                                                 |
| features map row moved                                                                            | n/a: no § (F18–F20 already ✅)                                                                                                                                                                                       |

Findings: none blocking.

Non-blocking (no change asked; not widening the card):

- L4 says the §22 element "is not a `<p>` and has no role"; the §22 function contract says "not a `<p>`, `<li>`,
  `<button>`, `<a>` and has no role". The three omitted tags all carry a role (`listitem`, `button`, `link` with
  `href`), so the guide's wording implies them; only an `<a>` without `href` would slip through, which no writer would
  pick for plain text. Accurate as written.
- "keeps the filter, drops `q`" (lib `clear-search.ts` row) matches REQ-21.3: All's address is the bare `/` (§12
  REQ-12.6), so "keeps" holds for all three filters.
- L2 and L3/L4 carry a few words more than the plan's L1–L4 text (`after todo-due-date.tsx`, `src/lib/…` pointers, the
  `not a <p>` clause) and fold into the existing §13 and §16 lines instead of adding lines; same file, same facts, the
  plan's counts hold, so not a plan mismatch.
- The new lines run past the 120-column wrap of the surrounding prose; this is the plan's "none hard-wrapped" rule
  (round 1 reason 3) and prettier keeps it.
- Out of scope (D-25 follow-up, as the plan states): root `CLAUDE.md` Map `src/lib/` §3–§6 and `src/CLAUDE.md` package
  table (`lib/` §3–§6, `components/` §7) remain stale.

Verdict: ready for PR

Riskiest unfalsified: nothing in CI guards the guides, so a later edit that drops a row passes every gate; only the
card's grep (run by hand) would catch it.
