# B8.2 review

## Plan review (round 1)

Plan: `backlog/work/B8.2/plan.md` at 60711e5. Section: §42, `spec/contracts/40-filter-hide-empty.md`. Scope: ui.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `todo-filter-nav.tsx` is F10/F28's component and the only `src/` file §42 lets change ("The only file of `src/` this section changes"); the two new test files follow the section numbering; the three rewritten tests are the four D-39 names (`todo-filter-nav-counts.test.tsx:80`, `e2e/12-filter.spec.ts:131`, `e2e/30-filter-counts.spec.ts:89`, `:118`, all confirmed by grep); F40 is B8.2's id under D-39 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signature pasted equals §42's Function contracts byte for byte; stays an RSC (no `'use client'`); no action, schema, Prisma or lib change                                                                                                                                                                                                                                                                         |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A, the same filter expression (`counts === undefined` keeps all; else `counts[filter] !== 0 \|\| filter === selected`)                                                                                                                                                                                                                                                                                   |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: AC-42.1 to AC-42.7, each Then counts links/spans, names, hrefs, `aria-current`, text content or address                                                                                                                                                                                                                                                                                                           |
| verification lists exact commands with expected numbers                           | pass: baseline confirmed by me, `pnpm test` → "Test Files 50 passed (50) / Tests 323 passed (323)"; e2e `test(` count in `e2e/*.spec.ts` = 75 over 33 files; targets ≥ 327 / 51 files and 78 / 34 files; `verify-red.sh B8.2` exit 0; mutation correctly "CI only" (no `src/lib`/`src/actions` change)                                                                                                                  |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton step stated as none with reason (no new export, as B7.6); `test(todos): B8.2 … (red)`, `feat(todos): B8.2 …`, `docs(map): F40 … [B8.2]`, `docs(backlog): B8.2 review …`; `todos` matches precedent f2a571e (B6.2) and 1ec402e (B7.6)                                                                                                                                                                     |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `- [ ] Lead approves spec` present at `40-filter-hide-empty.md:5`, unticked; spec approval for this `agent-ready` card is the label (D-27); not ticked by me                                                                                                                                                                                                                                                      |
| no settled D-n contradicted                                                       | pass: D-39 ("no card changes `src/app/page.tsx`, `src/lib/` or `src/actions/`", edits REQ-12.1, AC-12.7, REQ-30.1, REQ-30.5, AC-30.3, AC-30.6, AC-30.7 already on main: `10-filter.md:17`, `:42`, `28-filter-counts.md:32`, `:35`, `:36`); D-28 medium tier (one `src/components` row, no prisma/deps/env/CI)                                                                                                           |
| `scripts/next-task.sh --check B8.2` on the committed plan                         | pass: "[next-task] B8.2: no overlap with any Doing or Review card" (exit 0)                                                                                                                                                                                                                                                                                                                                             |

Costs the lead takes on approval (all stated in the plan, restated so none is found later):

1. A non-selected link whose count is 0 is not in the document, so a person cannot reach `/?filter=active` or
   `/?filter=completed` from the nav while that view is empty; the address still works (AC-42.6). This is §42's intent.
2. A keyboard user whose focus sits on a link that unmounts after a count change loses focus to `body`; §42 Out of scope.
3. Four existing tests change text under D-39, only in the red commit (`check-feat-commits.sh` enforces).
4. AC-42.2 may already pass on today's code (it pins the kept current link); red is carried by AC-42.1, 42.3, 42.4,
   rewritten AC-30.3 and the six e2e criteria.

Probed: other e2e that follow a filter link (`16-search` :104, :197, :211, :227; `21-clear-search` :106, :114;
`25-search-shortcut` :105) all click "Active" with open todos seeded or "All" with four todos seeded, so none meets a
hidden link. No other unit test renders `TodoFilterNav` (grep: only the two existing nav test files and `page.tsx`).

Verdict: approved (ready for the lead's gate; medium tier under D-27/D-28)

## Diff review (round 1)

Diff `main...abd617e` (12 files, +590 −12). Scope: ui. Commits: 0fad3d5 pin, 84979d2 red, 4ed5d8e feat, abd617e map.

### Commands (last line of each, run by the reviewer)

| Command                             | Last line                                                                                                      |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | "All matched files use Prettier code style!" (exit 0)                                                          |
| `pnpm typecheck`                    | `tsc --noEmit`, exit 0, no output                                                                              |
| `pnpm test`                         | "Tests 327 passed (327)", Test Files 51 passed (51) (plan: ≥ 327 / 51)                                         |
| `pnpm test:e2e`                     | "78 passed (3.5m)" (plan: 75 → 78)                                                                             |
| `scripts/mutation-gate.sh`          | "mutation: CI only, no src/lib or src/actions change"                                                          |
| `scripts/ci/check-suppressions.sh`  | "OK: no new suppressions"                                                                                      |
| `scripts/ci/check-config-change.sh` | "OK: no protected config changed"                                                                              |
| `scripts/ci/check-feat-commits.sh`  | "OK: no feat commit touches tests"                                                                             |
| `scripts/ci/check-ac-coverage.sh`   | "OK: every criterion of a shipped section has a test"                                                          |
| `scripts/ci/check-spec-sections.sh` | "OK: sections cited: 1 … 43"                                                                                   |
| `scripts/ci/check-features-map.sh`  | "OK"                                                                                                           |
| `scripts/ci/check-plan-scope.sh`    | "OK: feat/B8.2-agent stays inside the approved plan of B8.2 (D-27 approval)"                                   |
| `scripts/ci/check-layers.sh`        | "no dependency violations found" (exit 0)                                                                      |
| `scripts/verify-red.sh B8.2`        | "RESULT: red for the right reason" (exit 0; unit: 1 + 3 new failed, 0 new passed; e2e skipped, needs a server) |
| `git diff --stat main...HEAD`       | "12 files changed, 590 insertions(+), 12 deletions(-)"                                                         |

### Checklist

| Check                                                    | Result                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-§.n has a test whose assertion matches its Then | pass: AC-42.1–42.4 in `todo-filter-nav-hide-empty.test.tsx` (names, hrefs, `aria-current`, following `SPAN` text, span count, text content, 0 `[hidden], [aria-hidden]`); AC-42.5–42.7 in `e2e/42-…`; rewritten AC-12.7, AC-30.3, AC-30.6, AC-30.7 match `10-filter.md:42`, `28-filter-counts.md:32,35,36` |
| no test weakened after the red commit                    | pass: `git log --first-parent --no-merges 84979d2..HEAD -- '*.test.*' e2e/` empty; no merge commits on the branch; the pin 0fad3d5 is not modified by 84979d2 (0 removed lines in that file)                                                                                                               |
| every changed file is in `plan.md`                       | pass: the six code/test files and the map are in Files; `docs/metrics.md` and `backlog/work/B8.2/*` are the plan's declared paperwork; `check-plan-scope.sh` OK                                                                                                                                            |
| interfaces match the section's contracts                 | pass: `TodoFilterNav` signature unchanged, no `'use client'`, no new export or prop; only `src/` file is `todo-filter-nav.tsx` as §42 requires                                                                                                                                                             |
| Zod at action boundary / Prisma only in lib / raw SQL    | n/a: no action, lib or Prisma change                                                                                                                                                                                                                                                                       |
| migration                                                | n/a                                                                                                                                                                                                                                                                                                        |
| no secret, no suppression                                | pass (check-suppressions OK; diff read in full)                                                                                                                                                                                                                                                            |
| features map row moved                                   | pass: F40 §42 ✅ added in `docs(map)` abd617e                                                                                                                                                                                                                                                              |
| would a test fail if one changed line were reverted      | pass, probed on a clone in `$TMPDIR` (unit nav tests, 8): drop `\|\| link.filter === selected` → 4 fail; `!== 0` → `> 1` → 1 fails (AC-42.4); `counts === undefined ? []` → 3 fail; `!== 0 && link.filter !== selected` → 6 fail                                                                           |

### Findings

None blocking.

Notes on the points the dev-lead raised (no TRIGGER that breaks §42, so none is a finding):

1. Pin commit 0fad3d5 (AC-42.2 green by design) is not a Work breakdown step. The plan's Verification already says
   AC-42.2 "may pass on today's code"; the pin precedes the red commit, touches only a planned file, and follows the
   B7.4 precedent ("pin 7488f47" in `docs/metrics.md`). Plan deviation in procedure only; state it in the PR body.
2. `docs/metrics.md` in the feat commit: declared paperwork in the plan, and `check-feat-commits.sh` passes. The row's
   Green cell reads "this feat commit", which is not a sha and will not match the squash sha; earlier rows (B7.6
   `1ec402e`) carry the squash sha, set when the card closes. Fix in the closing PR.
3. `spec/contracts/20-all-done.md:75` (§22 Unchanged behavior) still quotes the old AC-12.7 title, which no longer
   exists after 84979d2, and its sentence "keeps the three filter links" is no longer true for an empty store. Spec
   drift outside this card's lane (a `docs(spec)` change needs a D-n); file it via `/spec-trace` or a card. No CI
   check reads these proof titles. Grep found no other stale quote of the four renamed titles.
4. `src/components/todo-form-warning.test.tsx` timeouts under machine load: untouched by this diff; my `pnpm test` run
   was 327/327. Not attributable to B8.2.

Verdict: ready for PR

Riskiest unfalsified: the e2e red of AC-42.5–42.7, AC-12.7, AC-30.6, AC-30.7 on pre-feat code; `verify-red.sh`
skipped e2e and I did not rerun them against 84979d2 (red claimed in the commit body only; traced: pre-feat code
renders all three links, so each `toHaveText` link list would fail).
