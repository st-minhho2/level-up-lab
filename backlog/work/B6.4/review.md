# B6.4 review

## Plan review (round 1)

Reviewed: `backlog/work/B6.4/plan.md` at `0efbf65`, against §32 (`spec/contracts/30-clear-completed-count.md`),
`advice.md`, `analysis.md`, D-7, D-27, D-28, D-33.

| Check                                                                             | Result                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: all 7 rows are §32 / F30 (three src paths named by §32's Function contracts, their three tests, the F30 map row); `src/lib/todos.ts`, `filter-counts.ts`, `src/actions/*` untouched as §32 requires                                   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signatures copied verbatim from §32 (explicit return types, `readonly` props, optional `completedCount?: number`); no action, schema, Prisma or query; the lib file is pure (no `server-only`), so the client import is legal         |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: Approach A; the deviation (advice's two package `CLAUDE.md` lines dropped) is stated: "package guides stay out (D-33)"                                                                                                                |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 criteria, every Then is an exact name, role count, enabled/disabled state or navigation count                                                                                                                                       |
| verification lists exact commands with expected numbers                           | pass: baseline confirmed by me, `pnpm test` → 269 passed (43 files); e2e `test(` count 57 in 25 files; 269 → 270 → 273, e2e 57 → 60, mutation ≥ 70                                                                                          |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B6.4 skeleton` → `test(todos): B6.4 pin …` → `test(todos): B6.4 … (red)` → `feat(todos): B6.4 …` → `docs(map): F30 … [B6.4]` → `docs(backlog): B6.4 review …` (same shape as B6.2's approved plan)                     |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: `30-clear-completed-count.md:5` `- [ ] Lead approves spec`, unticked; not ticked by me                                                                                                                                                |
| no settled D-n contradicted                                                       | pass: D-33 (section 32, contract file, component, count passed from `page.tsx`, the one `page.tsx` card of batch 2, F30, label count is not §9's deleted-count message); D-28 tier medium (no `prisma/`, dependency, env or protected path) |
| `scripts/next-task.sh --check B6.4` says no overlap                               | pass: `[next-task] B6.4: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                 |

Costs the lead should know before approving (none blocks):

1. Existing e2e lookups of the button (`e2e/09:27`, `12:35`, `13:141`, `16:138`, `22:120`, `26:100`, `30:112`) rely on
   Playwright's default substring name match; any later `exact: true` on them breaks once a count shows. No unit or
   e2e test asserts the exact text "Clear completed" with completed todos present (grep).
2. The component module header (`clear-completed-button.tsx:3`, "§9 …; §10 …") should also name §32 per
   `spec-fidelity.md`; the plan says so only for `page.tsx`. Check at diff time.
3. 270 → 273 assumes AC-32.1 is one `it` asserting 0, 1 and 12; an `it.each` gives 275. Either is fine; the diff
   review checks the count against the shape actually written.

Verdict: approved

(Approved means ready for the lead's gate under D-27/D-28: tier medium, so it proceeds on this approval for the
`agent-ready` issue; not approval for build in an interactive session.)
