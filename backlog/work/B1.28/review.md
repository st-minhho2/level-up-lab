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
