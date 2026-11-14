# B6.5 advice (§33; §23 as amended by D-34)

## Approaches

**A (recommended): one change in `src/components/overdue-count.tsx`.** Always return
`<span role="status">{label}</span>`, where `label` is `undefined` while `today` or the label is undefined, so the span
has no child node. The server and the first client render emit `<span role="status"></span>` (REQ-33.5). The same node
keeps its identity across N changes because the element type and position never change (REQ-33.4). `useState`,
`useEffect`, the no-timer rule and the `previous ?? todayOf(...)` latch stay as they are.

- Pros: one file, no new file, `page.tsx` untouched, matches §33's function contract.
- Cons: `{undefined}` as the only child gives 0 child nodes, but `{''}` would not. The code must pass `undefined`,
  never `''` (AC-33.2 asserts 0 child nodes).
- Fits rules: yes (invariants 1, 3, 4 and 5 are not touched).

**B (alternative): `page.tsx` renders the empty `<span role="status">` and the client component fills it through a
portal or ref.**

- Cons: changes the `page.tsx` contract (§23 line 56 and §33 "page.tsx keeps its contract"), adds a portal or ref
  mechanism, and needs a hydration-safe target lookup.
- Not recommended. It also drops nothing in A's favor.

## Recommendation

A. Dependencies: none. Migration: none.

## Impact

| File                                                                               | Add/Change | Signature                                                                               | ACs                         |
| ---------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------- | --------------------------- |
| `src/components/overdue-count.tsx`                                                 | Change     | `OverdueCount({ todos }): ReactNode`, unchanged; returns the always-present status span | AC-33.1 to AC-33.4, AC-33.5 |
| `src/components/overdue-count.test.tsx`                                            | Change     | red commit: drop the `role` assertion from the AC-23.3 test (D-34); add AC-33.1 to 33.4 | AC-23.3, AC-33.1 to AC-33.4 |
| `e2e/33-overdue-announce.spec.ts`                                                  | Add        | one test, AC-33.5                                                                       | AC-33.5                     |
| `spec/features-map.md`, `src/components/CLAUDE.md` (a `docs(map)` line, if needed) | Change     | doc only                                                                                | none                        |

The client component `overdue-count.tsx` is the only one the card changes. Its server-rendered markup:

- JS off: today nothing (the component returns `undefined`). After A, `<span role="status"></span>`. The span has no
  text either way, so nothing visible changes.
- Submit before hydration or with JS off: the component has no form or submit, so this does not apply.
- Behavior dropped by A: none. B would drop the "only `overdue-count.tsx` is mounted" property (a con above).

Existing tests that change or stay:

- AC-23.3 (`overdue-count.test.tsx`): `expect(element).not.toHaveAttribute('role')` goes red under A. D-34 has the red
  commit drop only that line. Its title says "has no role or aria-label". Dropping "role or" from the title keeps the
  `AC-23.3:` prefix; that edit sits in the same red commit and is the lead's call (see Questions).
- AC-23.4, AC-23.5, AC-23.6 stay green: an empty span gives text `""`, equal markup, and `not.toContain('overdue')`. The
  AC-23.5 markup `<span role="status"></span>` has no "overdue" in it.
- `e2e/23-overdue-count.spec.ts` AC-23.7 stays green: `getByText` matches only non-empty text, `/^\d+ overdue$/` finds 0
  when F is ticked, and the placement check still sees the span after the `N items left` paragraph.
- `remaining-count.test.tsx` AC-22.2 and AC-22.3: not affected (`role="status"` is not a `paragraph` or `alert`).

## Risks

- Migration: none. Security: none. Performance: one extra empty span.
- Isolation: B6.6 adds another `role="status"` on the page. AC-33.5 must locate ours as the status after the
  `N items left` paragraph (analysis Q4), never "exactly one status on the page".
- Spec drift: §23 line 55 still says "renders nothing while today is undefined". §33's "except" governs (no
  `docs(spec)` edit, per analysis). `/spec-trace` will keep reporting the tension until a D-n edits it.
- AC-23.3's `roleCounts` runs `queryAllByRole('paragraph' ...)`; `role="status"` does not match any of these, so it
  stays green.
- A role query needs the element to be in the accessibility tree; an empty span with `role="status"` is found by
  `getByRole('status')` in Testing Library. Confirm in the red run.

## Test strategy

| Layer     | File                                    | ACs                               | Mocks                                                 |
| --------- | --------------------------------------- | --------------------------------- | ----------------------------------------------------- |
| Component | `src/components/overdue-count.test.tsx` | AC-33.1, 33.2, 33.3, 33.4         | fake `Date` (and timers for AC-33.4); no module mocks |
| Component | same file                               | AC-23.3 (role line dropped, D-34) | as today                                              |
| e2e       | `e2e/33-overdue-announce.spec.ts`       | AC-33.5                           | none (real DB, seeded F to A order as in e2e/23)      |

Red proof: all four AC-33.x fail on an assertion (no `role="status"`, no empty span), not on an import, since the
component already exists. No skeleton change is needed; the `chore(...) skeleton` commit may be empty or skipped per
`dev-lead`.

## Mutation hot spots

`src/components` is outside the mutation scope (`src/lib` + `src/actions`), and neither changes. For the review pass,
the logic worth a targeted look in the component: the `today === undefined ? undefined : …` branch (AC-33.2 and
AC-33.3 kill it), passing `undefined` rather than `''` (AC-33.2's 0 child nodes), and the `previous ??` latch (the
AC-23.6 midnight step).

## Questions settled / escalated

```
Question:    Which source governs the empty span while N is 0: §23's function contract or §33's?
Class:       P4 two sections collide
Sources:     spec/contracts/21-overdue-count.md:55 "renders nothing while today is undefined or overdueLabel(countOverdue(todos, today)) is undefined"
             spec/contracts/31-overdue-announce.md:45 "as §23, except: always one <span role=\"status\">"
Conflict:    §23 says renders nothing / §33 says always one empty span
Verdict:     §33 governs: later section, names the override ("as §23, except"), and D-34 bars editing §23's contract line.
Next action: implement approach A; do not edit §23 line 55.
Must not:    leave `return undefined` for the empty states, or edit §23 to match.
Doc drift:   none (spec-trace will report the textual tension; settled)
Escalate:    none
```

```
Question:    Does the AC-23.3 test title keep "no role" after D-34 drops the role assertion?
Class:       P2 spec silent
Sources:     backlog/work/B6.5/analysis.md:27 "D-34: the card's red commit drops only the `role` assertion from the AC-23.3 test"
Conflict:    none
Verdict:     D-34 names the assertion only, not the title. The title may keep or drop the word; the `AC-23.3:` prefix is what the
             rules require. Recommended: drop "role or" so the title matches its assertions, in the same red commit.
Next action: test-writer edits the title together with the assertion; the plan states it.
Must not:    drop any other AC-23.3 assertion (tag, aria-label, the 0 roles, text content).
Doc drift:   none
Escalate:    none
```
