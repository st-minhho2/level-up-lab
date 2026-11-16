# B11.3 review

## Plan review (round 1)

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: `src/components/delete-todo-button.tsx` is the only `src/` file §53 names ("The only file of `src/` this section changes"); the test file is the one §53 "How the criteria observe it" names; `spec/features-map.md` gets F51 (the card's id, unused in the map today: last rows F45–F48)                                                                                                                                                                                                                                                                      |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: signature `DeleteTodoButton({ todoId }: { readonly todoId: string }): ReactNode` unchanged, copied from the §53 Function contracts line; no action, schema, Prisma or env change                                                                                                                                                                                                                                                                                                                                                                               |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: approach A (`useId`), B rejected with REQ-53.2 as the reason, as in the advice                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 6 criteria (AC-53.1–53.6); every Then is an exact text, a count, an attribute equality or a DOM-node identity                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| verification lists exact commands with expected numbers                                | pass: baselines reproduced here: `pnpm exec vitest list` → 381 lines; `pnpm exec playwright test --list` → "Total: 90 tests in 42 files"; green 381 → 387, e2e 90 → 90, mutation "CI only" (no `src/lib` / `src/actions` change, B1.100), `verify-red.sh B11.3` exit 0, `check-features-map.sh` OK                                                                                                                                                                                                                                                                   |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: skeleton justified as none (no new export, B10.2 precedent); `test(todos): B11.3 … (red)`, `feat(todos): B11.3 …`, `docs(map): F51 … [B11.3]`, `docs(backlog): B11.3 review …`. No pin commit is needed: traced against the current component, every criterion carries an equality between `aria-describedby` and a non-empty alert `id`, or an exact description equal to the message, none of which holds at base (no `id`, no `aria-describedby`; the base description is at most `title` "Delete todo"), so all 6 fail on assertions, unlike B10.2 round 1 |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: §53 line 5 `- [ ] Lead approves spec` exists, unticked; issue #364 carries `agent-ready` (checked with `gh issue list`), so the label is the spec approval (D-27), as the plan states                                                                                                                                                                                                                                                                                                                                                                          |
| no settled D-n contradicted                                                            | pass: D-7 (box untouched), D-27/D-28 (Files rows under `src/` and `spec/` only, none under `prisma/`, dependencies, env or the protected list → tier medium, so a reviewer-approved plan proceeds), D-19 (no config change, no label), D-45 settled (struck in the card)                                                                                                                                                                                                                                                                                             |
| `scripts/next-task.sh --check <card>` run on the committed plan says no overlap        | pass: "[next-task] B11.3: no overlap with any Doing or Review card" (exit 0)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

Notes (not blocking):

1. No existing test asserts the button's `aria-*` attribute set, an `[id]` count or a description (grep of
   `delete-todo-button.test.tsx`, `todo-item*.test.tsx`, `e2e/19-delete.spec.ts`), so the six Unchanged-behavior proofs
   of §53 should stay green. `todo-item.test.tsx` holds two `AC-10.2` titles; the plan's "AC-10.2" covers both.
2. `advice.md` says the lead's plan approval ticks the spec box (D-7); the plan correctly takes the D-27 path instead
   (issue #364 is `agent-ready`). The plan governs.
3. The plan states no risk tier; derived here from its Files table: medium (D-28).

Cost the lead takes (from the plan, confirmed): the idle description is not asserted, because `title="Delete todo"`
may supply one; REQ-53.3 is checked only as the absence of `aria-describedby`.

Verdict: approved (ready for the lead's gate; tier medium, so under D-27 the reviewed plan of `agent-ready` issue #364
proceeds without the lead; `Plan approved by:` is not written by the reviewer)

## Diff review (round 1)

Scope: ui (`src/components/delete-todo-button.tsx`, its new test file).

### Command results (last line each, run by the reviewer at 48bb0ad)

| Command                             | Last line                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `pnpm lint`                         | "All matched files use Prettier code style!" (exit 0)                          |
| `pnpm typecheck`                    | `tsc --noEmit`, no output (exit 0)                                             |
| `pnpm test`                         | "Tests 387 passed (387)" (61 files; plan said 381 → 387)                       |
| `pnpm test:e2e`                     | "90 passed (4.3m)" (plan said 90 → 90)                                         |
| `scripts/mutation-gate.sh`          | "mutation: CI only, no src/lib or src/actions change"                          |
| `scripts/ci/check-suppressions.sh`  | "[check-suppressions] OK: no new suppressions"                                 |
| `scripts/ci/check-config-change.sh` | "[check-config-change] OK: no protected config changed"                        |
| `scripts/ci/check-feat-commits.sh`  | "[check-feat-commits] OK: no feat commit touches tests"                        |
| `scripts/ci/check-ac-coverage.sh`   | "[check-ac-coverage] OK: every criterion of a shipped section has a test"      |
| `scripts/ci/check-spec-sections.sh` | "[check-spec-sections] OK: sections cited: 1 … 53"                             |
| `scripts/ci/check-features-map.sh`  | "[check-features-map] OK"                                                      |
| `scripts/verify-red.sh B11.3`       | "6 ran (6 new), 6 new failed, 0 new passed … RESULT: red for the right reason" |
| `git diff --stat main...HEAD`       | "8 files changed, 495 insertions(+), 3 deletions(-)"                           |

`pnpm build` (in the plan's verification) was not run by the reviewer [unverified].

### Checklist

| Check                                                       | Result                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-53.n has a test whose assertion matches its Then   | pass: AC-53.1–53.6 each one `it`, titles start with the id; every Then clause traced to an assertion (absence before click, alert count and text, non-empty `id`, `aria-describedby` equality, `toHaveAccessibleDescription`, name, aria-name set, `title`, same DOM node, id uniqueness, idle row text)                                                          |
| no test weakened after the red commit                       | pass: `git log --first-parent --no-merges b8ad386..HEAD -- '*.test.*' e2e/` empty; no merge commits on the branch (remerge-diff empty)                                                                                                                                                                                                                            |
| every changed file is in `plan.md`                          | pass: the 2 `src/` files and `spec/features-map.md` are the Files table; `docs/metrics.md` and `backlog/work/B11.3/*` are the plan's stated paperwork                                                                                                                                                                                                             |
| interfaces match the section's contracts                    | pass: signature unchanged; `useId()` once, `id={messageId}` on the alert, `aria-describedby={error !== undefined ? messageId : undefined}`, identical to the §53 Function contracts line; no other prop, state or element                                                                                                                                         |
| Zod at every action boundary / Prisma only in lib / raw SQL | n/a: no action, lib or Prisma change                                                                                                                                                                                                                                                                                                                              |
| migration reversible and indexed                            | n/a: no migration                                                                                                                                                                                                                                                                                                                                                 |
| no secret, no suppression                                   | pass: `check-suppressions` OK; diff holds no key or env value                                                                                                                                                                                                                                                                                                     |
| features map row moved                                      | pass: F51 §53 ✅ added in `docs(map)` commit 48bb0ad; `check-features-map` OK                                                                                                                                                                                                                                                                                     |
| would a test fail if one changed line were reverted?        | pass, probed on a clone under `$TMPDIR` (`src/components/delete-todo-button-description.test.tsx` only): (1) `aria-describedby` line removed → 6/6 fail; (2) `aria-describedby={messageId}` unconditionally → AC-53.1, AC-53.2 fail; (3) `messageId = \`todo-${todoId}-error\``→ AC-53.5, AC-53.6 fail. Removing`id={messageId}` breaks the same equality as (1). |

### Findings

None blocking.

Note (not blocking): REQ-53.2 says the id is "independent of the todo's id"; AC-53.5 checks it only against the four
named §10/§15 ids and against the other button's id, so an id such as `delete-${todoId}-error` would pass every
criterion. The Then is met as written; closing the gap would need a criterion change (§8), not a test change here.

Verdict: ready for PR

Riskiest unfalsified: an id derived from `todoId` under a name other than the four listed ids (REQ-53.2's
"independent of the todo's id") passes all six criteria; the shipped `useId()` meets the requirement, so no
defect exists today, only a regression the suite would not catch.
