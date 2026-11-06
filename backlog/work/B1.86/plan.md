# B1.86 plan — check-ac-coverage reads multi-line it.each titles (tooling, no §)

Approach: replace the line-based `grep -rhoE` of `scripts/ci/check-ac-coverage.sh:6` with one `perl -0777` pass per
file. Perl is new to the guards: no CI step calls it today (`prune-smoke.sh:134` does, outside CI), but `perl-base` is
Essential in `node:24-bookworm` (5.36) and ships with macOS. A title counts when `AC-n.m:` opens the first argument
of `it(`/`test(`, or of the call that follows `it.each…(…)`/`test.each…(…)`; the `.each` table is one balanced `(…)`
group (quoted strings and backslash escapes inside may hold parens), and an optional type argument `<…>` may hold
`=>` and one nested `<…>`. Prototype on `origin/main` (80773ee): 146 ids against today's 145, the only new one
AC-28.6. No advice (tier quick, no section). Risk tier **high** (CI script, D-28) → the lead's `approve`; the PR
carries `config-change-approved` (D-19). Steps 1–2 have dev-lead write `scripts/`, so the card runs from an
interactive session (as B1.78, B1.79).

## Files

| File                              | Change                                                                        | Why        |
| --------------------------------- | ----------------------------------------------------------------------------- | ---------- |
| `scripts/ci/check-ac-coverage.sh` | `titles=` from the per-file perl pass; header comment names the rule          | Acceptance |
| `scripts/hook-smoke.sh`           | section "check-ac-coverage (B1.86)": probes A1–A8 on a throwaway fixture repo | Test line  |
| `scripts/CLAUDE.md`               | the `hook-smoke.sh` row names A1–A8                                           | doc drift  |
| `backlog/work/B1.86/*`            | plan, review, pr-body                                                         | pipeline   |

## Interfaces touched

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

## Verification

- Red `test(scripts): B1.86 check-ac-coverage probes for multi-line titles` (no `(red)` marker: hook-smoke only, as
  B1.79; body "Red because the guard reads titles line by line"): 3 FAIL (A1, A3, A4), 596 ok.
- Green `chore(ci): B1.86 check-ac-coverage reads titles per file`: "hook-smoke: 599 probes OK" (591 existing verdicts
  unchanged); `scripts/ci/check-ac-coverage.sh` on `origin/main` → output identical to today's, exit 0; run from a
  checkout of `docs/B5.6-done` → `§28 criteria=7 covered=7`, exit 0 (prototype: both hold, and A1–A8 give the Want
  and Today columns above on bash 3.2); bash 5 in CI; `check-plan-scope.sh`, `check-backlog.sh` OK;
  `pnpm lint && pnpm typecheck` clean, `pnpm test` → 241 passed (39 files, unchanged); CI green.

## Work breakdown

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

Plan review: approved, round 2 · Plan approved by: · Rounds: 1
