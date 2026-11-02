# B1.31 reviews

## Plan review (round 1)

SCOPE: all (documentation only: root `CLAUDE.md` Map, `src/CLAUDE.md` package table; no code, no §)

I reviewed the plan at `a39ecf0 docs(backlog): B1.31 plan`. The contract is the card's Acceptance (`backlog/plan/E1-todos.md` ### B1.31).
Sources checked: the four package guides (every `§` on every line) and every non-test `.ts(x)` under `src/app`,
`src/actions`, `src/lib`, `src/components` (both the leading comment and the whole file).

Recomputed per package (guide ∪ leading-comment headers):

| Package       | Guide (all lines)                       | Headers                             | Union, as recomputed                   | Plan's Cite |
| ------------- | --------------------------------------- | ----------------------------------- | -------------------------------------- | ----------- |
| `app/`        | §7                                      | §7, §12, §13, §14, §16 (`page.tsx`) | `§7, §12–§14, §16`                     | same        |
| `actions/`    | §5, §6, §7, §9, §10, §11, §14, §15, §19 | §5, §6, §9, §10, §11, §14, §15, §19 | `§5–§7, §9–§11, §14, §15, §19`         | same        |
| `lib/`        | heading `§3–§22`; rows §3–§7, §9–§22    | §4–§7, §9–§22                       | rows: `§3–§7, §9–§22`; heading: §3–§22 | rows        |
| `components/` | §6 (l.13), §7, §10, §12–§22             | §6, §7, §9, §10, §12–§22            | `§6, §7, §9, §10, §12–§22`             | same        |

I tested the plan on a scratch clone. The steps: commit the approval line, apply the four Cites to both tables, run prettier and
commit as `docs(src): …`. Results, each matching the plan's expected value:

- Test grep: before, `CLAUDE.md:65` and `src/CLAUDE.md:7` (exit 0); after, no output (exit 1).
- Both awk lines: the 8 expected lines, in order.
- `[check-spec-sections] OK: sections cited: 1 … 22`
- `[check-features-map] OK`
- `[check-plan-scope] OK: … stays inside the approved plan of B1.31` (origin/main at `a733c7b`)
- `[check-backlog] OK: README matches the cards`
- `[check-config-change] OK: no protected config changed`
- prettier: "All matched files use Prettier code style!"
- `Tests  202 passed (202)`
- tsc: exit 0

Diff: `CLAUDE.md` 12/12, `src/CLAUDE.md` 6/6 lines (prettier re-pads the whole table).

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: no §, no map row; the plan changes 2 files outside paperwork (`CLAUDE.md`, `src/CLAUDE.md`), both owned by this card in the batch. `plan-files.sh B1.31` prints exactly the 5 Files rows                                                                                                                                                   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no interface, no code                                                                                                                                                                                                                                                                                                                |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no `advice.md`. The plan states that the advisor is skipped (tier quick, docs), as B1.28 did                                                                                                                                                                                                                                      |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: one Acceptance bullet. A grep, the awk lines or a script line checks each clause                                                                                                                                                                                                                                                           |
| verification lists exact commands with expected numbers                           | pass: every expected value was reproduced on the probe (see above)                                                                                                                                                                                                                                                                               |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: there are no skeleton, test or map steps, a deviation stated for a no-§ docs card (red = the Test command before, accepted for B1.28). Step 1 goes to the orchestrating session (`dev-lead`'s path guard blocks `src/` and root `CLAUDE.md`). Steps 2–3 put `/review-loop` and `mark-reviewed.sh` in order. Subjects pass lefthook's regex |
| `Lead approves spec` box, ticked only by a human                                  | pass (n/a): no section, so no spec box. `Plan approved by:` is empty                                                                                                                                                                                                                                                                             |
| no settled D-n contradicted                                                       | fail: reason 1. Under the Acceptance as written, the `lib/` Cite is open to a D-25 "broken Acceptance line" finding at diff review. No D-n is contradicted outright. D-25 is applied to the other follow-ups                                                                                                                                     |
| `scripts/next-task.sh --check B1.31` on the committed plan                        | pass: `[next-task] B1.31: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                                                     |

Verdict: changes requested

1. **The `lib/` Cite breaks the plan's own rule, and its stated reason is false.** The plan defines Cite as
   "union of the § its guide names (heading, rows)". `src/lib/CLAUDE.md:1` reads
   `# src/lib — … (§3–§22)`, a heading range that spans §8. Applied as written, the rule gives `§3–§22`. The plan
   cites `§3–§7, §9–§22` instead, because "nothing names §8".
   TRIGGER: at diff review, compare the Acceptance ("the sections its package guide … name") with
   `src/lib/CLAUDE.md:1` → §8 is in the guide's heading and missing from the `lib/` Cite in both tables.
   After merge, the overview tables and the lib guide heading still disagree, which is the drift this card exists to remove.
   Dropping §8 is right on the merits. §8 is `contracts/06-change-requests.md`, the process by which a behavior change
   enters the spec. No `src/lib` module implements it, and no row or header names it (`grep -rn '§8' src/` → no match).
   Fix in the plan, no new file and no wider scope:
   - (a) State the reading: a guide heading range counts only the sections that a row or a header names. §8 (the
     change process) is not implemented by `lib/`.
   - (b) Add `src/lib/CLAUDE.md` heading `§3–§22` → `§3–§7, §9–§22` to the out-of-scope (D-25 follow-up) list.

   Option (c), citing `§3–§22` literally, would claim that `lib/` implements §8 and is not recommended.

Non-blocking (out of scope → follow-up, D-25; suggest adding to the plan's out-of-scope line):

- `src/app/page.tsx:36` carries the inline comment `{/* §9: outside the list … (REQ-9.5). */}`, so `page.tsx`
  places the §9 button. Its leading comment (lines 1–2) names §7, §12, §13, §14, §16 and omits §9. Under the plan's
  header-only reading, the `app/` Cite correctly omits §9. The header itself is stale (proof: `grep -n '§9'
src/app/page.tsx` → line 36 only).
- Other non-test files also cite sections outside their leading comment, for example §5/§6 in `todo-due-date.tsx`,
  `todo-item.tsx`, `delete-todo-button.tsx` and §12 in `clear-search.ts`, `todo-search.ts`. These are references to
  rules that other modules own, not implementations. The plan's header-only reading excludes them, which is correct
  for the Acceptance's "module headers".
- The plan's existing out-of-scope items are accurate as stated: the `src/components/CLAUDE.md` heading omits
  §6 (named at l.13) and §9; the `src/app/CLAUDE.md` heading names only §7; and the Map's "client components" omits
  the Server Components `remaining-count.tsx` and `todo-search-form.tsx`.

Riskiest unfalsified: does `.claude/hooks/plan-scope.sh`, rewritten by B1.32 in parallel, still read the bare
token `CLAUDE.md` as only the root file? If B1.32 lands first and globs bare tokens, the token could match nested
`CLAUDE.md` files. That is harmless here, since none of them is edited, but it is not probed against B1.32's branch.

## Plan review (round 2)

SCOPE: all (documentation only: root `CLAUDE.md` Map, `src/CLAUDE.md` package table; no code, no §)

Reviewed the plan at `813aab9`. `git diff a39ecf0 813aab9 -- backlog/work/B1.31/plan.md` shows only two changes,
the two parts of round 1 reason 1: (a) the rule line now says a heading range counts only the § that a row or a
header names, so `lib/` skips §8, with the grep proof; (b) `src/lib/CLAUDE.md` heading `§3–§22` → `§3–§7, §9–§22`
is added to the D-25 out-of-scope list. The Cite table, Files, Verification and Work breakdown are unchanged.

Re-checked at `813aab9`:

- Module headers (`//` lines 1–4 of each non-test `.ts(x)`): app 7 12 13 14 16 · actions 5 6 9 10 11 14 15 19 ·
  lib 4–7 9–22 · components 6 7 9 10 12–22. These match the plan's "Module headers name" column.
- The new rule applied to every guide heading: only two headings contain a range, `lib` `§3–§22` and `components`
  `§12–§22`. Rows or headers name every § in `§12–§22`, so §8 in `lib` is the only § the rule removes. The rule
  is consistent across all four packages.
- `grep -rn '§8' src/` → no output (exit 1), as the plan states.
- Probe (git archive of HEAD into scratch, the four Cites applied to both tables):
  - Test grep, before: `CLAUDE.md:65`, `src/CLAUDE.md:7` (exit 0). After: no output (exit 1).
  - Both awk lines print the 8 expected lines in order.
  - `[check-spec-sections] OK: sections cited: 1 … 22` · `[check-features-map] OK`
- `npx prettier --check backlog/work/B1.31/plan.md` → "All matched files use Prettier code style!"
- `[check-plan-scope] OK: docs/B1.31-guide-ranges changes only paperwork (B1.31 has no approved plan)`
  (origin/main still at `a733c7b`, the merge-base)

| Check                                                                             | Result                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1. No §, no map row, 2 non-paperwork files (`CLAUDE.md`, `src/CLAUDE.md`)                                                                                                         |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no interface, no code                                                                                                                                                                            |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`. The skip (tier quick, docs) is stated                                                                                                                                                  |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: one Acceptance bullet, each clause checked by the grep, the awk lines or a script line                                                                                                                 |
| verification lists exact commands with expected numbers                           | pass: grep, awk and both check scripts reproduced on the probe. Lint, tsc and test were not re-run: no code changed since round 1 (202 tests)                                                                |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: unchanged. The deviation for a no-§ docs card is stated (red = Test command before)                                                                                                                    |
| `Lead approves spec` box, ticked only by a human                                  | pass (n/a): no section. `Plan approved by:` is empty                                                                                                                                                         |
| no settled D-n contradicted                                                       | pass: round 1 reason 1 is resolved. The `lib/` Cite now follows the plan's stated rule, and the lead approves that reading explicitly. D-25 is applied: the four heading/Map drifts are listed as follow-ups |
| `scripts/next-task.sh --check B1.31` on the committed plan                        | pass: `[next-task] B1.31: no overlap with any Doing or Review card` (exit 0)                                                                                                                                 |

Verdict: approved (ready for the lead's gate, not approved for build)

Cost the lead accepts by approving: the plan reads "the sections its package guide … name" as the sections named
by rows and headers, not by heading ranges. After merge, `src/lib/CLAUDE.md:1` still reads `§3–§22` while both
overview tables read `§3–§7, §9–§22`. This drift is a recorded follow-up, not part of this card.

Non-blocking:

- `plan.md` is 52 lines against planning.md's ≈ 40. The two tables account for the overage, and round 1 accepted it.
- The footer still reads `Rounds: 1`. This copies the `dev-lead.md:52` template literal; no script reads it.
- Round 1's non-blocking items (the `page.tsx:36` inline §9; references to sections outside leading comments)
  are still out of scope and still correctly excluded by the header-only reading. The plan's out-of-scope line
  does not list the stale `page.tsx` header. Suggest filing it with the other follow-ups (proof:
  `grep -n '§9' src/app/page.tsx` → line 36 only).

Riskiest unfalsified: B1.32's parallel rewrite of `plan-scope.sh`/`check-plan-scope.sh` could change how the bare
Files token `CLAUDE.md` matches (root only vs every nested `CLAUDE.md`). If it lands before this PR, Step 1 is not
probed against it. It is harmless while no nested `CLAUDE.md` is edited.
