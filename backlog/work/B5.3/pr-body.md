<!-- Title: feat(todos): B5.3 the slash key focuses the search box -->

## Item

B5.3 — The slash key focuses the search box (spec §25)

- spec: §25 — written in this branch (D-30), changed by D-31 (text-like `input` types only; §16/§21 notes)
- test: `src/lib/search-shortcut.test.ts::AC-25.1`, `src/components/todo-search-form.test.tsx::AC-25.2 … AC-25.5`, `e2e/25-search-shortcut.spec.ts::AC-25.6` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-25.1 … AC-25.6

Closes #215

## Plan

### B5.3 plan — The slash key focuses the search box (§25)

Approach: A from `advice.md`. A pure `src/lib/search-shortcut.ts` (`isSearchShortcut`) and, in `TodoSearchForm` only
(D-30), `'use client'`, a `useRef` on the keyed box and one `useEffect` that adds a `document` `keydown` listener
(`isSearchShortcut` → `preventDefault()` + `ref.current?.focus()`) and removes it on unmount. This is §25's function
block word for word; approach B (a second client file) contradicts §25 and D-30. Analysis Q1–Q6 as proposed (advice:
settled by the written spec). No migration, dependency, env key or CI-protected path (no `config-change-approved`).
Costs: the form stops being a Server Component (markup and no-JS GET submit unchanged); `/` does nothing before
hydration. D-31 (2A) applied in faf26f0 before any test: only text-like `input` types are text-entry, so `/` works
from a row checkbox (AC-25.1, AC-25.3 checkbox case); §16/§21 "no 'use client'" notes updated there. The non-text
type list (checkbox, radio, button, submit, reset, image, file, range, color) is the analyst's reading of D-31.
`src/components/CLAUDE.md:11` goes stale; D-30/D-31 keep it out of this card (its own card, per D-31).

#### Files

| File                                       | Change                                                                                | Why (AC-25.n) |
| ------------------------------------------ | ------------------------------------------------------------------------------------- | ------------- |
| `src/lib/search-shortcut.ts`               | Add: `SEARCH_SHORTCUT_KEY`, `ShortcutEvent`, `isSearchShortcut` (skeleton, then real) | 25.1          |
| `src/lib/search-shortcut.test.ts`          | Add (red): AC-25.1                                                                    | 25.1          |
| `src/components/todo-search-form.tsx`      | `'use client'`, ref, effect; header names §25; signature and markup unchanged         | 25.2–25.6     |
| `src/components/todo-search-form.test.tsx` | Add (red): AC-25.2–25.5 (25.3 incl. a checkbox); "Server Component" comment fixed     | 25.2–25.5     |
| `e2e/25-search-shortcut.spec.ts`           | Add (red): AC-25.6, POSTs counted from load to the last key                           | 25.6          |
| `spec/features-map.md`                     | Add F23 (§25): code-writer's feat (✗), ✅ in `docs(map)`                              | map           |

Paperwork (exempt, already landed or closing): `docs(spec)` faf26f0 (§25, §16, §21 under D-31); §25 index row stays ✗
until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/lib/search-shortcut.ts (§25, pure: no Prisma, no server-only, no DOM access)
export const SEARCH_SHORTCUT_KEY: string; // '/'
export interface ShortcutEvent {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly altKey: boolean;
  readonly target: { readonly tagName?: string; readonly type?: string; readonly isContentEditable?: boolean } | null;
}
export function isSearchShortcut(event: ShortcutEvent): boolean;
// src/components/todo-search-form.tsx (§16, §21, §25): 'use client'; props and markup unchanged
export function TodoSearchForm({ filter, query }: { readonly filter: TodoFilter; readonly query: string }): ReactNode;
```

No Server Action, Zod schema, Prisma model, query, route or env var; `page.tsx` untouched.

#### Verification

Red: `scripts/verify-red.sh B5.3` exit 0; AC-25.1 fails on the skeleton's `NotImplementedError`, AC-25.2–25.5 on
`activeElement`/`defaultPrevented`, AC-25.6 in `pnpm test:e2e e2e/25-search-shortcut.spec.ts` (recorded in the body).
Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 213 → 218 (1 unit, 4 component; the 4 existing
`todo-search-form.test.tsx` tests unchanged and green) · `pnpm test:e2e` 45 → 46 (`16-search`, `21-clear-search`
unchanged) · `pnpm test:mutation` ≥ 70, `search-shortcut.ts` hot spots per advice · `pnpm build` ok (client boundary
imports only pure `clear-search`, `todo-filter`, `todo-search`) · `scripts/ci/check-plan-scope.sh` OK.
Counts are the test-writer's target; a different count is stated in the red commit.

#### Work breakdown

| Step | Role / skill                      | Produces                                          | Commit                         |
| ---- | --------------------------------- | ------------------------------------------------- | ------------------------------ |
| 1    | `new-feature-slice` (code-writer) | `search-shortcut.ts` stub (`NotImplementedError`) | `chore(todos): B5.3 skeleton`  |
| 2    | test-writer                       | 2 test files + `e2e/25-search-shortcut.spec.ts`   | `test(todos): B5.3 … (red)`    |
| 3    | code-writer                       | lib + form, F23 ✗                                 | `feat(todos): B5.3 …`          |
| 4    | dev-lead                          | F23 ✅                                            | `docs(map): F23 … [B5.3]`      |
| 5    | reviewer (diff)                   | `review.md` diff section                          | `docs(backlog): B5.3 review …` |

Plan review: approved, round 2 (round 1: changes requested, settled by D-31) · Plan approved by: reviewer (D-27, tier medium, issue #215) · Rounds: 1

## Map delta

F23 · §25 · (new) → ✅ — `isSearchShortcut` in `src/lib/search-shortcut.ts`, the `document` keydown effect in `src/components/todo-search-form.tsx`; evidence: `pnpm test` → 218 passed, `pnpm test:e2e` → 46 passed, mutation 92.18 (`docs(map)` 63d6f2f)

## Review

`/review-loop`: passes 1/3, verdict ready for PR, 0 findings.

| Pass | #   | Finding (file:line)                                                                     | Source         | Kind        | Disposition      | Justification                                                                                                                                               |
| ---- | --- | --------------------------------------------------------------------------------------- | -------------- | ----------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | `e2e/25-search-shortcut.spec.ts` hydration wait reads React's `__reactFiber` key        | lead           | brittleness | no change needed | a renamed key times out the wait and AC-25.6 goes red; it cannot pass falsely                                                                               |
| 1    | 2   | `src/lib/search-shortcut.ts:19-25,33` 7 non-text types and `?? ''` unpinned (survivors) | lead, reviewer | test gap    | out of scope     | AC-25.1's Then samples checkbox and radio only; pinning the other 7 needs a `docs(spec)` widening of AC-25.1 under a D-n (lead's call); mutation 92.18 ≥ 70 |
| 1    | 3   | `src/components/todo-search-form.tsx` SVG / document target → `null` → fires            | lead           | behavior    | no change needed | AC-25.1: `null` target → `true`; inside an editing host the target is the host, so no typed `/` is lost                                                     |
| 1    | 4   | `src/components/CLAUDE.md:11` stale ("stays a Server Component")                        | reviewer       | docs        | out of scope     | D-31 / D-30: own card, filed as B1.80                                                                                                                       |

### Diff review (pass 1)

Base `origin/main` 3aff4b2 (the local `main` ref, 50d38ec, is stale and lists B5.1 files that are already merged).
Card commits: skeleton 81637e7, red 499c07e, green ff1802b. Scope: lib + ui.

#### Command results (run by the reviewer, 2026-11-05)

| Command                              | Last line                                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                          | `✖ 1 problem (0 errors, 1 warning)` (the warning was already there: `todo-form.tsx:23`)                                                           |
| `pnpm typecheck`                     | `tsc --noEmit`, no output                                                                                                                         |
| `pnpm test`                          | `Tests 218 passed (218)`                                                                                                                          |
| `pnpm test:e2e`                      | `46 passed (2.5m)` (local run, `pnpm dev` server)                                                                                                 |
| `pnpm test:mutation`                 | `Final mutation score of 92.18 is greater than or equal to break threshold 70`; `search-shortcut.ts` 82.98 (39 killed, 7 survived, 1 no coverage) |
| `pnpm build`                         | ok (route table printed)                                                                                                                          |
| `check-suppressions.sh`              | `OK: no new suppressions`                                                                                                                         |
| `check-config-change.sh`             | `OK: no protected config changed`                                                                                                                 |
| `check-feat-commits.sh`              | `OK: no feat commit touches tests`                                                                                                                |
| `check-ac-coverage.sh`               | `OK: every criterion of a shipped section has a test`                                                                                             |
| `check-spec-sections.sh`             | `OK: sections cited: 1 … 25`                                                                                                                      |
| `check-features-map.sh`              | `OK`                                                                                                                                              |
| `check-plan-scope.sh`                | `OK: feat/B5.3-agent stays inside the approved plan of B5.3 (D-27 approval)`                                                                      |
| `verify-red.sh B5.3`                 | `RESULT: red for the right reason` (exit 0)                                                                                                       |
| `git diff --stat origin/main...HEAD` | `17 files changed, 929 insertions(+), 32 deletions(-)`                                                                                            |

#### Checklist

| Check                                                                               | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-25.n has a test whose assertion matches its Then                           | pass: AC-25.1 has 19 cases matching the Then one for one, and a not-throw loop. AC-25.2 checks activeElement, value `milk`, `defaultPrevented`, 0 `fetch`, 0 `submit` and an unchanged href. AC-25.3 covers button, link and checkbox. AC-25.4 covers New todo, 3 modifiers and the box itself, with a positive control. AC-25.5 covers unmount and remount with a `focus` spy called exactly 1 time. AC-25.6 (e2e) asserts every clause, including 0 POSTs from load to the last key |
| no test weakened after the red commit                                               | pass: `git log --first-parent --no-merges 499c07e..HEAD -- '*.test.*' e2e/` is empty, and there are no merges after the red commit. The 4 existing §16/§21 tests only had a header comment changed                                                                                                                                                                                                                                                                                    |
| every changed file is in `plan.md`                                                  | pass: all 6 rows of the Files table, nothing else under `src/`/`e2e/`. `page.tsx` is untouched (D-30)                                                                                                                                                                                                                                                                                                                                                                                 |
| interfaces match §25's Function contracts                                           | pass: `SEARCH_SHORTCUT_KEY`, `ShortcutEvent` and `isSearchShortcut` match character for character. `TodoSearchForm` keeps its signature and markup, has one `document` keydown listener and removes it in the effect cleanup. The ref is on the keyed input                                                                                                                                                                                                                           |
| Zod at action boundary · Prisma only in lib · no raw SQL · migration                | n/a: no action, query or migration. `search-shortcut.ts` imports nothing                                                                                                                                                                                                                                                                                                                                                                                                              |
| no secret, no suppression                                                           | pass (gitleaks not re-run; the diff has no literals except type names)                                                                                                                                                                                                                                                                                                                                                                                                                |
| features map row moved                                                              | pass: F23 (§25) added as ✗; the `docs(map)` ✅ step is still to come. The other 22 rows only had their column width changed by Prettier (I compared them cell by cell)                                                                                                                                                                                                                                                                                                                |
| would a test fail if one changed line were reverted? (probe on a copy in `$TMPDIR`) | Removing `preventDefault` → 4 tests fail. Removing `removeEventListener` → AC-25.5 fails. Replacing the `instanceof` target with `null` → AC-25.4 fails. Removing `type.toLowerCase()` → AC-25.1 fails. Removing the `isContentEditable` check → AC-25.1 fails. **Survive:** removing `'button'` from the non-text set (P4) and removing `tagName.toUpperCase()` (P6); Stryker also reports survivors at lines 19–25 and `?? ''` at 33:38                                             |

#### Findings

None blocking. The lead's three doubts, each traced:

- (1) `__reactFiber` hydration wait: this can only fail loudly. If React renames the key, `waitForFunction` times out
  and AC-25.6 goes red; it cannot go green by mistake. The test is brittle when React is upgraded, but no assertion
  is weakened. Not a finding.
- (2) Survivors on `button`/`submit`/`reset`/`image`/`file`/`range`/`color`, on `tagName` case-insensitivity (P6),
  and on the `?? ''` fallback: the tests match AC-25.1's Then exactly. These survivors come from a gap between
  REQ-25.3 (all 9 types, tagName case-insensitive) and AC-25.1, which samples 2 types and only uppercase tags. I traced
  the implementation against REQ-25.3 and it is correct for all 9 types, in either case. In a browser, HTML `tagName`
  is always uppercase and `input.type` is always a lowercase string, so P6 and `?? ''` cannot be reached from the
  component. This is not a test-writer defect: pinning the other 7 types needs AC-25.1 widened by a
  `docs(spec)` commit under a D-n, so it is the lead's call. It is listed under Riskiest unfalsified.
- (3) SVG or document target → `null` → the shortcut fires. This is correct per spec. REQ-25.3's text-entry set is
  input/textarea/select/`isContentEditable`, and AC-25.1 requires `true` for a `null` target. `SVGElement` has no
  `isContentEditable`. Inside an editing host, the keydown target is the host (an `HTMLElement` with
  `isContentEditable` true), never a nested SVG, so no `/` typed into an editor is ever lost. `document` is never a
  keydown target while `body`/`html` exist. Not a finding.

Not caused by this diff, but still open: `src/components/CLAUDE.md:11` still says `todo-search-form.tsx` "stays a Server
Component … no `'use client'`", which the feat now contradicts. D-31 requires its own card, and no card for it is filed
on `origin/main` or this branch (plan-review cost 3).

Verdict: ready for PR

Riskiest unfalsified: REQ-25.3 for the 7 unpinned input types (`button` … `color`). Removing any of them from
`NON_TEXT_INPUT_TYPES` keeps all 218 unit tests and 46 e2e tests green (probe P4), so a regression there would ship
silently unless AC-25.1 is widened.

## Evidence

- AC met: 6/6
- tier: medium
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
