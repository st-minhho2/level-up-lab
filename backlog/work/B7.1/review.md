# B7.1 review

## Plan review (round 1)

Scope: ui (`src/components`, `e2e`). Plan `backlog/work/B7.1/plan.md` at `7576d48`, section §35
`spec/contracts/33-delete-confirm.md`, §19 `spec/contracts/17-delete.md` (edited under D-37 in `c155c3a`, an ancestor of HEAD).

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `delete-todo-button.tsx` is the only `src/` file, in F17 today and named by §35's contract; the three test files are the ones §35 says get rewritten; F33 = §35 matches D-37 ("feature ids F33–F38") and the card heading (`_F33 · section 35_`). `scripts/ci/plan-files.sh --any B7.1` parses exactly the 5 rows |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signature copied verbatim from §35 Function contracts; module-level unexported constant; no action, schema, Prisma or route touched; the mutation still goes through `deleteTodoAction`                                                                                                                           |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A. Plan keeps AC-19.5 (b) and AC-19.7 as rewrites beside new AC-35.3 / AC-35.4 where advice's Impact row said "becomes"; that matches §19, which still carries AC-19.5–19.7 (lines 44–46), so it is not a deviation from the spec                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 5 criteria (AC-35.1–35.5), each Then gives counts, exact message or call order; no banned adjective in plan or section                                                                                                                                                                                            |
| verification lists exact commands with expected numbers                           | pass: baseline 280 / 45 files (I ran `pnpm test`: `Tests  280 passed (280)`, `Test Files  45 passed (45)`); green 283 (+3 unit `it`s), e2e +2; verify-red exit 0; mutation ≥ 70 with `src/lib`, `src/actions` untouched                                                                                                 |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton skipped with reason (no new export; precedent B5.6), `test(todos): B7.1 … (red)`, `feat(todos): B7.1 …`, `docs(map): F33 … [B7.1]`, reviewer diff                                                                                                                                                        |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: `33-delete-confirm.md:5` `- [ ] Lead approves spec` exists and is unticked; plan leaves it for the lead and cites D-27 (label = spec approval), same as §21–§34 (all unticked)                                                                                                                                    |
| no settled D-n contradicted                                                       | pass: D-37 (B7.1 edits §19, `window.confirm`, no markup), D-27/D-28 (`scripts/agent/tier.sh` → `medium`), D-7, D-19 (no protected path)                                                                                                                                                                                 |
| `scripts/next-task.sh --check B7.1` says no overlap                               | pass: `[next-task] B7.1: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                             |

Also run: `scripts/ci/check-plan-scope.sh` → `OK: feat/B7.1-agent changes only paperwork`.

Costs the lead takes (already in the plan, confirmed): `window.confirm` blocks the main thread while open (§35 accepts it);
every future jsdom test that clicks "Delete todo" must stub `window.confirm` or it reads as a cancel; e2e must register
`page.once('dialog', …)` before each click or Playwright dismisses (a cancel). No behavior is dropped.

Non-blocking notes for the build roles (no plan change needed):

1. `src/components/todo-item.test.tsx` has only `beforeEach(vi.resetAllMocks)` (line 37) and no `afterEach`; §35's prose
   names `vi.restoreAllMocks()` in `afterEach` as what removes the confirm stub. test-writer adds it in that planned file.
2. Keep the AC-19.5 (b) title in `todo-item.test.tsx` unchanged: verify-red treats a changed title as a new test, and that
   test stays green on today's code (no confirm assertion in its Then), so a renamed (b) would fail the red gate. AC-19.5 (a)
   must lose "without a confirmation" from its title; it then counts as new and is red (confirm spy 0 calls), which is fine.
3. The card's `Test:` line fixes the AC-35.1 title (`AC-35.1: asks window.confirm once with "Delete this todo? This cannot be
undone." before calling deleteTodoAction once with ("todo-9")`); test-writer uses it verbatim, as with AC-35.3 / AC-35.4.
4. The plan's parenthetical that AC-35.1/35.2 kill the component's mutants is reasoning, not a gate number: `stryker`
   mutates only `src/lib/**` and `src/actions/**`. The diff review will probe it by reverting the guard on a copy.

Verdict: approved

(Approved means ready for the lead's gate under D-27/D-28, tier medium; not approval for build by me.)
