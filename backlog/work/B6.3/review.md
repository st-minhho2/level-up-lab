# B6.3 review

## Plan review (round 1)

Scope: all (`src/lib`, `src/components`, `e2e/`). Plan read at 5ddc6ee against `spec/contracts/29-due-today.md`
(§31), `advice.md`, `analysis.md`, D-33, `src/components/todo-due-date.tsx`, `e2e/17-overdue.spec.ts`.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: the 2 `src/` files are exactly the 2 §31's Function contracts allow ("No file other than `src/lib/todo-due-today.ts` and `src/components/todo-due-date.tsx` changes in `src/`"); 3 new test files are F29's; `e2e/17-overdue.spec.ts` is F15's, listed and justified by advice P1 (REQ-31.1 adds text the AC-17.7 whole-row check rejects). Cost the lead accepts: an F15 e2e is edited in this card's red commit |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: pure lib module, explicit return type, `readonly` props, no action, no Prisma, no server-only                                                                                                                                                                                                                                                                                                                     |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; deviation stated (no `src/lib/CLAUDE.md` / `src/components/CLAUDE.md` rows, D-33 "package guides stay out of card plans"). Cost: `src/components/CLAUDE.md` keeps "§15 `Due <date>` and §17 `Overdue` are the only idle additions", stale once §31 lands                                                                                                                                              |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 criteria (AC-31.1–31.6), every Then is counts, exact strings or order                                                                                                                                                                                                                                                                                                                                           |
| verification lists exact commands with expected numbers                           | fail: `pnpm test` "241 → 241 + N passed (… N ≥ 5)" is a lower bound, not a number (B5.5, B5.6 plans gave "222 → 227", "237 → 241"); the shape of the new tests, which decides whether `verify-red.sh` passes, is not stated (reason 1)                                                                                                                                                                                  |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B6.3 skeleton` → `test(todos): B6.3 … (red)` → `feat(todos): B6.3 …` → `docs(map): F29 … [B6.3]` → `docs(backlog): B6.3 review …`                                                                                                                                                                                                                                                                  |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `spec/contracts/29-due-today.md:5` "- [ ] Lead approves spec", unticked; not touched by me                                                                                                                                                                                                                                                                                                                        |
| no settled D-n contradicted                                                       | pass: D-33 (section 31, file `29-due-today.md`, F29, component `todo-due-date.tsx`, §17 lift in its own `docs(spec)` commit f63bb76, no package guides); risk tier medium (no `prisma/`, dependency, env, CI, hooks, `.claude/`)                                                                                                                                                                                        |
| `scripts/next-task.sh --check B6.3` says no overlap                               | pass: "[next-task] B6.3: no overlap with any Doing or Review card" (exit 0)                                                                                                                                                                                                                                                                                                                                             |

Checked and not a finding: no existing unit or component test reads whole-row text with a due date that can equal the
run's real day (`todo-item-created.test.tsx` AC-20.3 uses no due date; `todo-due-date.test.tsx` counts
`Due 2026-11-05` by `getAllByText`); `e2e/23-overdue-count.spec.ts` seeds a today row but never reads row text; the
F29 row as ✅ in `docs(map)` follows the B5.x precedent (F24–F26 were added ✅ by their feat PRs), not advice's "✗".

Verdict: changes requested

1. Verification and red shape are not pinned. State the exact `pnpm test` total after the red commit (241 + the
   exact number of new `it`s) and how the new tests are cut, so that every new test fails on the skeleton. Trigger:
   the skeleton exports the real `DUE_TODAY_LABEL = 'Due today'` and leaves the component unchanged, so a standalone
   label test, or AC-31.2 split into one `it` per case with (b), (c), (d) separate (each asserts 0 `Due today`, which
   the current component already satisfies), passes at the red commit; `verify-red.sh` then fails ("zero NEW tests
   passed", `scripts/verify-red.sh:16`). Name the count per file (e.g. unit 1: AC-31.1 six cases + label in one
   `it`, as the card's Test line; component 4: AC-31.2 (a)–(d) in one `it`, AC-31.3, AC-31.4, AC-31.5) and the
   resulting total; same for e2e (52 → 53 is already exact).

Note (not blocking): the card's Test line says red because "`isDueToday` is not exported from
`src/lib/todo-due-today.ts` (file does not exist yet)", an import failure that `testing.md` and `verify-red.sh`
reject; the plan's skeleton step supersedes it (red on `NotImplementedError`). Saying so in the plan avoids a
test-writer following the card line.
