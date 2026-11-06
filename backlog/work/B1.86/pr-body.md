## Item

B1.86 — check-ac-coverage misses a test title written on the line after `it.each(…)(` (tooling, no spec section)

- spec: none — tooling (CI guard for invariant 2 and `.claude/rules/testing.md`); no `src/` change, no section
- test: `scripts/hook-smoke.sh` A1–A8 (new). Red `22429b9` (no `(red)` marker, plan): 3 FAIL (A1, A3, A4), 596 ok. Green `2f05f54`: "hook-smoke: 599 probes OK". Review pass 1 `73a53a9` adds A9 (a call whose name ends in `it` is not a test call; the old guard counted it) and A10 (a nested type argument): "hook-smoke: 601 probes OK". Old vs new guard on `origin/main`: identical output; on `docs/B5.6-done`: `§28 criteria=7 covered=6 MISSING: AC-28.6` → `covered=7`, exit 0. `pnpm test` 241, e2e 52, mutation 92.62 (no `src/` change; reviewer). A1–A8 also pass in `node:24-bookworm` (bash 5.2, perl 5.36; reviewer).
- acceptance: 7 of 8 met — multi-line table, type argument, next-line title (A1, A3, A10); not a first argument still not counted (A5–A7, A9); §28 `covered=7` and every other section's count unchanged; bash 3.2-safe; label `config-change-approved`; #237 green after merging `origin/main` [after merge]
- risk tier: high (CI script); label `config-change-approved` (D-19)
- unblocks: B5.6's closing PR #237 (`guards` fails with `§28 criteria=7 covered=6 MISSING: AC-28.6`)

## Plan

### B1.86 plan — check-ac-coverage reads multi-line it.each titles (tooling, no §)

Approach: replace the line-based `grep -rhoE` of `scripts/ci/check-ac-coverage.sh:6` with one `perl -0777` pass per
file. Perl is new to the guards: no CI step calls it today (`prune-smoke.sh:134` does, outside CI), but `perl-base` is
Essential in `node:24-bookworm` (5.36) and ships with macOS. A title counts when `AC-n.m:` opens the first argument
of `it(`/`test(`, or of the call that follows `it.each…(…)`/`test.each…(…)`; the `.each` table is one balanced `(…)`
group (quoted strings and backslash escapes inside may hold parens), and an optional type argument `<…>` may hold
`=>` and one nested `<…>`. Prototype on `origin/main` (80773ee): 146 ids against today's 145, the only new one
AC-28.6. No advice (tier quick, no section). Risk tier **high** (CI script, D-28) → the lead's `approve`; the PR
carries `config-change-approved` (D-19). Steps 1–2 have dev-lead write `scripts/`, so the card runs from an
interactive session (as B1.78, B1.79).

#### Files

| File                              | Change                                                                        | Why        |
| --------------------------------- | ----------------------------------------------------------------------------- | ---------- |
| `scripts/ci/check-ac-coverage.sh` | `titles=` from the per-file perl pass; header comment names the rule          | Acceptance |
| `scripts/hook-smoke.sh`           | section "check-ac-coverage (B1.86)": probes A1–A8 on a throwaway fixture repo | Test line  |
| `scripts/CLAUDE.md`               | the `hook-smoke.sh` row names A1–A8                                           | doc drift  |
| `backlog/work/B1.86/*`            | plan, review, pr-body                                                         | pipeline   |

#### Interfaces touched

None: `scripts/ci/check-ac-coverage.sh` keeps no arguments, its output lines and exit codes (0, 1). Fixture per probe:
a git repo with `spec/technical-requirements.md` (one row `| §9 | … | ✅ |`), `spec/contracts/09-x.md` (`| AC-9.1 |`)
and one `src/x.test.tsx`; the probe runs the script there and compares the exit code:

| Probe | Test file holds                                                                        | Want | Today |
| ----- | -------------------------------------------------------------------------------------- | ---- | ----- |
| A1    | `it.each<{ t: () => Element }>([` table over lines `])(` title `'AC-9.1: …'` next line | 0    | 1     |
| A2    | `test.each([1, 2])('AC-9.1: …', …)` on one line                                        | 0    | 0     |
| A3    | `it(` then the title `'AC-9.1: …',` on the next line                                   | 0    | 1     |
| A4    | `it.each([['a)']])('AC-9.1: …', …)`: a paren inside a table string                     | 0    | 1     |
| A5    | `it('adds', () => { f('AC-9.1: x') })`: the id only as a non-first argument            | 1    | 1     |
| A6    | `describe('AC-9.1: …', …)`: not a test call                                            | 1    | 1     |
| A7    | `it.each([1])('runs', () => { f('AC-9.1: x') })`: the id inside an `.each` body        | 1    | 1     |
| A8    | `it.each([[/\(/]])('AC-9.1: …', …)`: an escaped paren in a regex literal (review F9)   | 0    | 0     |

#### Verification

- Red `test(scripts): B1.86 check-ac-coverage probes for multi-line titles` (no `(red)` marker: hook-smoke only, as
  B1.79; body "Red because the guard reads titles line by line"): 3 FAIL (A1, A3, A4), 596 ok.
- Green `chore(ci): B1.86 check-ac-coverage reads titles per file`: "hook-smoke: 599 probes OK" (591 existing verdicts
  unchanged); `scripts/ci/check-ac-coverage.sh` on `origin/main` → output identical to today's, exit 0; run from a
  checkout of `docs/B5.6-done` → `§28 criteria=7 covered=7`, exit 0 (prototype: both hold, and A1–A8 give the Want
  and Today columns above on bash 3.2); bash 5 in CI; `check-plan-scope.sh`, `check-backlog.sh` OK;
  `pnpm lint && pnpm typecheck` clean, `pnpm test` → 241 passed (39 files, unchanged); CI green.

#### Work breakdown

| Step | Role     | Produces            | Commit                                                                |
| ---- | -------- | ------------------- | --------------------------------------------------------------------- |
| 1    | dev-lead | red probes A1–A8    | `test(scripts): B1.86 check-ac-coverage probes for multi-line titles` |
| 2    | dev-lead | guard + scripts doc | `chore(ci): B1.86 check-ac-coverage reads titles per file`            |
| 3    | reviewer | diff review         | `docs(backlog): B1.86 review pass N`                                  |
| 4    | dev-lead | draft PR, label     | —                                                                     |

Not in scope: the 7-criteria cap and the index parsing (unchanged); `describe` titles; titles built at runtime from a
template literal. Narrowing: `fit(`, `xit(` and `foo.it(` no longer count (the old regex had no left boundary); 0
such titles in `src/` or `e2e/` today, so no section's count moves.

Costs (review round 1, fixtures old → new; none of these shapes is in `src/` or `e2e/` today):

- Fails open: a block-commented multi-line test (`/*` then `it(` with its title on the next line) now counts (F2);
  a one-line `// it('AC-…')` counted already (F1).
- Fails closed, as today: a type argument nested two levels deep (F4); a comment holding an apostrophe inside an
  `.each` table (F5).
- Fails closed where today counts (regression): a regex literal inside an `.each` table holding an unescaped paren
  (`/[(]/`) or a quote (`/'/`); an escaped paren (`/\(/`, F9) is fixed and probed (A8).

Plan review: approved, round 2 · Plan approved by: lead, 2026-11-06 · Rounds: 1

## Map delta

None: tooling card, no `spec/features-map.md` row.

## Review

`/review-loop`: 2 passes of 3 (`backlog/work/B1.86/review.md`, "Diff review (round 1)" and "(round 2)"). Round 2
verdict: ready for PR. Mutants of the guard's pattern: 6 of 10 killed at round 1, 8 of 10 at round 2; the 2
survivors only make the guard fail closed.

| Round | Finding                                                                                                   | Disposition                   |
| ----- | --------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 1     | [1] coverage: no probe pins the left boundary `(?<![\w.\$])` (`emit('AC-9.1: x')` counted by old)         | fix now: probe A9, `73a53a9`  |
| 1     | [2] coverage: no probe pins one nested `<…>` in a type argument                                           | fix now: probe A10, `73a53a9` |
| 1     | [3] plan-mismatch: an apostrophe outside a string (JSX text) in a one-line `.each` table now fails closed | no code change: Costs below   |
| 2     | [1] plan-mismatch: the same mechanism can fail open (a curried call after such a table)                   | no code change: Costs below   |

Costs added after the plan (none of these shapes is in `src/` or `e2e/` today; `'AC-n.m:` after `)(` appears only at
`todo-due-date.test.tsx:251` and `:271`, both real `.each` titles):

- Fails closed (regression): an apostrophe outside a string literal in a one-line `.each` table, e.g.
  `it.each([[<p>don't</p>]])('AC-9.1: …')`, counted before and is missed now (round 1 [3]).
- Fails open: the same apostrophe can close the table early, so a later call on an expression's result whose first
  argument is `'AC-n.m:` counts, e.g. `render(<p>It's</p>)('AC-9.1: x')` inside a test after such a table (round 2 [1]).

Riskiest unfalsified (round 2): an odd apostrophe in a comment or JSX text inside a multi-line `.each` table closing
the group before a `)(…'AC-` that is not a title; only the curried-call shape above was built.

Outside the plan's words, inside its files: `scripts/CLAUDE.md`'s `hook-smoke.sh` row also says RP1–RP10 (it still
said RP1–RP6 after B1.79's review pass).

## Evidence

- AC met: 7/8 (the eighth, #237 green, follows this merge)
- tier: high
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
