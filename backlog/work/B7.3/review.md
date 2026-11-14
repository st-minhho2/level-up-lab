# B7.3 review

## Plan review (round 1)

Scope: ui (`src/components/todo-due-date.tsx`, a component test, one e2e file). Read: `plan.md`, `advice.md`,
`spec/contracts/35-due-date-today.md` (§37), card B7.3 in `backlog/plan/E7-todos-hints.md`, D-37,
`src/components/todo-due-date.tsx`, `e2e/` file names, `.claude/docs/git-workflow.md` commit subjects.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `todo-due-date.tsx` is the only `src/` file §37 allows ("The only file of `src/` this section changes"); the test file is the card's `Test:` line; F35 is the feature id D-37 gives B7.3                                                                                                                  |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: props and signature unchanged, copied from §37 Function contracts; no action, schema, Prisma or lib change; `'use client'` component already                                                                                                                                                              |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; the one deviation (e2e file `37-…`, not advice's `35-…`) is stated. It is correct: `e2e/28-escape-due-date.spec.ts` (contract `26-…`) and `31-due-today.spec.ts` (contract `29-…`) are named by section, and `35-` is B7.1's section (D-37), so advice's name would collide in the same batch |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 criteria (AC-37.1–37.6), each Then counts elements, exact values, call counts or `defaultPrevented`                                                                                                                                                                                                     |
| verification lists exact commands with expected numbers                           | pass: `pnpm test` 280 → 285 (45 → 46 files), `pnpm test:e2e` +1, named regression files, `verify-red.sh B7.3` exit 0, mutation ≥ 70 (lib/actions untouched), `check-features-map.sh`, `check-plan-scope.sh`                                                                                                     |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton step present and justified empty (no new export); `test(todos): … (red)`, `feat(todos): …`, `docs(map): F35 … [B7.3]`, `docs(backlog): B7.3 review …` match `git-workflow.md` and the B6 `feat(todos)` history                                                                                   |
| the section has a `Lead approves spec` box, ticked only by a human, never by you  | pass: `- [ ] Lead approves spec` present in `35-due-date-today.md`, unticked; not touched by this review                                                                                                                                                                                                        |
| no settled D-n contradicted                                                       | pass: D-37 (section 37, contract `35-due-date-today.md`, `todo-due-date.tsx`, F35, medium tier, no `page.tsx`) matched; REQ-28.7 / §17 / §31 "new control" lines are the ones D-37 states do not apply                                                                                                          |
| `scripts/next-task.sh --check B7.3` says no overlap                               | pass: `[next-task] B7.3: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                     |

Also checked: `scripts/ci/check-plan-scope.sh` → `[check-plan-scope] OK: feat/B7.3-agent changes only paperwork`.
Existing tests that could break on a fourth form child: none found. `todo-due-date.test.tsx:27` counts the wrapper's
children (1), not the form's; every existing "Today"/"Due today" query in `src/` and `e2e/` uses `exact: true`
(`e2e/31-due-today.spec.ts:70,82,128`), so a button named "Today" adds no ambiguous match.

Costs the lead takes on approval (all stated in the plan, repeated here so nothing is found after the gate):

1. Enter or Space on a focused "Today" activates it (native button) and only fills the field; it never saves.
2. "Today" keeps an existing row error message (REQ-37.3); only Escape or a later successful save clears it.
3. While a save is pending, "Today" is disabled, so if it had focus, focus drops to the body (no spec line restores it;
   "moving focus" is §37 Out of scope).
4. B7.6 later edits the same form and the same component (D-37 orders it after B7.3).

Non-blocking note: advice's con for approach A says to rename `onDueDateKeyDown` or comment why it covers a button;
the plan keeps the name and widens the type without saying which. Either is fine; the diff review will expect the
existing REQ-28.5/28.6 comment to name REQ-37.4/37.5 as well.

Verdict: approved (ready for the lead's gate, not approved for build)
