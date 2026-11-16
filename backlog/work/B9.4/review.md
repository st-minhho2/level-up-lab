# B9.4 review

## Plan review (round 1)

Plan: `backlog/work/B9.4/plan.md` at 8e97e44. Spec: `spec/contracts/45-new-todo-focus-pending.md` (§47).

| Check                                                                             | Result                                                                                                                                                                                         |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `todo-form.tsx` is the only `src/` file §47 allows (contract lines 50-52); test paths match the contract's own (lines 54-59); F45 is the next free map id after F44 (§46)                |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: `TodoForm(): ReactNode` unchanged, one `useRef<HTMLButtonElement>`; no action, schema, Prisma or lib change                                                                              |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A, B rejected with the REQ-47.3 reason                                                                                                                                          |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 criteria (AC-47.1..47.6); Thens are activeElement identities, values, call counts, POST counts; hold-back 2000 ms                                                                      |
| verification lists exact commands with expected numbers                           | pass: baselines confirmed by me: `pnpm exec vitest list` 356 lines; `playwright test --list` "Total: 86 tests in 39 files"; targets 360 and 88                                                 |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton step present and justified as none (no new export, as B9.1); `test(todos): … (red)`, `feat(todos): …`, `docs(map): F45 … [B9.4]` match `code-writer.md:45` and `dev-lead.md:59` |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: line 5 `- [ ] Lead approves spec`, unticked; not touched by this review                                                                                                                  |
| no settled D-n contradicted                                                       | pass: D-44 (new §47, `fix(todos)` PR title) honoured; D-7 respected; green commit keeps `feat(` for `check-feat-commits.sh` while the PR title is `fix(`, stated                               |
| `scripts/next-task.sh --check B9.4` says no overlap                               | pass: "[next-task] B9.4: no overlap with any Doing or Review card" (exit 0)                                                                                                                    |

Costs the lead takes on approval (all stated in the plan; repeated so none surfaces after the gate):

1. `<html>` as `document.activeElement` counts as "elsewhere", so the box is not focused (spec lists body and null
   only; advice question 2 forbids adding it in code).
2. A focused element that the save itself removes reads as body, so the box is focused (analysis Q3).
3. AC-47.6 depends on `todo-item.tsx` keeping the open title editor focused when the new row is inserted above it; if
   it does not, the card stops with a `todo-item.tsx` defect report and §47 is not widened (analysis Q6).
4. AC-47.3 is a guard and may be green in the red commit; the red proof rests on AC-47.1 (card `Test:` line), AC-47.2,
   AC-47.4 first save and both e2e, all of which fail today on the focus spy / `toBeFocused`, traced against
   `todo-form.tsx:45-50` (unconditional `focus()`).
5. No mutation score for this card: only `src/components` changes, outside Stryker's `src/lib` + `src/actions` scope;
   the kill list in `advice.md` "Mutation hot spots" is carried by the component tests alone.

Verdict: approved (ready for the lead's gate, not approved for build).
