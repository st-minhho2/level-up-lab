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

## Diff review (round 1)

Head: 9c2f403. Scope: ui (`src/components/todo-form.tsx`, its component test, `e2e/47-…`).

### Commands (last line of each, run by me)

| Command                             | Last line                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm lint`                         | All matched files use Prettier code style! (exit 0)                                              |
| `pnpm typecheck`                    | `tsc --noEmit` (exit 0, no output)                                                               |
| `pnpm test`                         | Tests 360 passed (360) (plan: 356 → 360)                                                         |
| `pnpm test:e2e`                     | 88 passed (2.4m) (plan: 86 → 88)                                                                 |
| `scripts/mutation-gate.sh`          | mutation: CI only, no src/lib or src/actions change                                              |
| `scripts/ci/check-suppressions.sh`  | [check-suppressions] OK: no new suppressions                                                     |
| `scripts/ci/check-config-change.sh` | [check-config-change] OK: no protected config changed                                            |
| `scripts/ci/check-feat-commits.sh`  | [check-feat-commits] OK: no feat commit touches tests                                            |
| `scripts/ci/check-ac-coverage.sh`   | [check-ac-coverage] OK: every criterion of a shipped section has a test                          |
| `scripts/ci/check-spec-sections.sh` | [check-spec-sections] OK: sections cited: 1 … 47                                                 |
| `scripts/ci/check-features-map.sh`  | [check-features-map] OK                                                                          |
| `scripts/verify-red.sh B9.4`        | RESULT: red for the right reason (3 new failed, 0 new passed; base 5a9123b; e2e listed, skipped) |
| `git diff --stat main...HEAD`       | 9 files changed, 679 insertions(+), 2 deletions(-)                                               |

### Checklist

| Check                                                     | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-47.n has a test whose assertion matches its Then | pass: AC-47.1–47.4 in `todo-form-focus-pending.test.tsx`, AC-47.5/47.6 in `e2e/47-…`; each Then clause asserted (activeElement, values, counter, alerts, call counts, titles, POST count, address). AC-47.2 counts box `focus` calls after each "Add" click only, because user-event's own click on the box calls `focus()` while typing; noted in the test, not a weakening                                                                                                                                                                                  |
| no test weakened after the red commit                     | pass: `git log --first-parent --no-merges 5c7dade..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` empty                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| every changed file is in `plan.md`                        | pass: 4 Files-table entries plus the stated exempt paperwork (`docs/metrics.md`, `backlog/work/B9.4/*`). Commit shape: AC-47.3 landed in a separate `test(todos): … pin` commit before the red one instead of inside it; plan allowed it to be green and named, B9.2 precedent; not blocking                                                                                                                                                                                                                                                                  |
| interfaces match §47 Function contracts                   | pass: `TodoForm(): ReactNode` unchanged; condition is box / "Add" / body / null, read in the existing layout effect at the settling commit                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Zod at action boundary · Prisma only in lib · no raw SQL  | n/a: no action, lib or Prisma change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| migration                                                 | n/a                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| no secret, no suppression                                 | pass (gate above; no `eslint-disable`, `ts-ignore` or `TODO` in the diff)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| features map row                                          | pass: F45 §47 ✅ in its own `docs(map)` commit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Server/Client boundary, accessible names                  | pass: still `'use client'`; no name, role or attribute changed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| would a test fail if one line were reverted (probe)       | probed on `git clone` under `$TMPDIR`, `vitest run src/components/todo-form`: dropping `active === addButton.current` → 4 fail (AC-44.1, 44.4, 44.5, 47.3); dropping `active === document.body` → AC-47.3 fails; dropping `active === box.current` → AC-44.4 fails; removing `ref={addButton}` → 4 fail; the unconditional `focus()` (pre-change) → AC-47.1, 47.2, 47.4 fail (verify-red). Dropping `active === null` → 43/43 pass: an equivalent mutant (a rendered document with a body never reports `null`); REQ-47.1 names `null`, so the disjunct stays |

### Findings

None blocking.

Verdict: ready for PR

Riskiest unfalsified: AC-47.3(c) reaches `document.body` only through a `document.activeElement` getter spy (jsdom keeps the
disabled "Add" focused), so the body branch is proven in jsdom by a stub and in a real browser only indirectly by
AC-44.6/AC-47.5 (click "Add" → disabled button drops focus to body → box focused); no e2e blurs to body during a
pending save on purpose.
