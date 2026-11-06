# B1.86 plan — check-ac-coverage reads multi-line it.each titles (tooling, no §)

Approach: replace the line-based `grep -rhoE` of `scripts/ci/check-ac-coverage.sh:6` with one `perl -0777` pass per
file (perl is already used by `scripts/hook-smoke.sh` in CI). A title counts when `AC-n.m:` opens the first argument
of `it(`/`test(`, or of the call that follows `it.each…(…)`/`test.each…(…)`; the `.each` table is one balanced `(…)`
group (quoted strings inside may hold parens), and an optional type argument `<…>` may hold `=>` and one nested `<…>`.
Prototype on `origin/main` (80773ee): 146 ids against today's 145, the only new one AC-28.6. No advice (tier quick, no
section). Risk tier **high** (CI script, D-28) → the lead's `approve`; the PR carries `config-change-approved` (D-19).

## Files

| File                              | Change                                                                        | Why        |
| --------------------------------- | ----------------------------------------------------------------------------- | ---------- |
| `scripts/ci/check-ac-coverage.sh` | `titles=` from the per-file perl pass; header comment names the rule          | Acceptance |
| `scripts/hook-smoke.sh`           | section "check-ac-coverage (B1.86)": probes A1–A6 on a throwaway fixture repo | Test line  |
| `scripts/CLAUDE.md`               | the `hook-smoke.sh` row names A1–A6                                           | doc drift  |
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

## Verification

- Red `test(scripts): B1.86 check-ac-coverage probes for multi-line titles` (no `(red)` marker: hook-smoke only, as
  B1.79; body "Red because the guard reads titles line by line"): 3 FAIL (A1, A3, A4), 594 ok.
- Green `chore(ci): B1.86 check-ac-coverage reads titles per file`: "hook-smoke: 597 probes OK" (591 existing verdicts
  unchanged); `scripts/ci/check-ac-coverage.sh` on `origin/main` → output identical to today's, exit 0; run from a
  checkout of `docs/B5.6-done` → `§28 criteria=7 covered=7`, exit 0 (prototype: both hold, and A1–A6 give the Want and
  Today columns above on bash 3.2); bash 5 in CI;
  `check-plan-scope.sh`, `check-backlog.sh` OK; `pnpm lint && pnpm typecheck && pnpm test` unchanged; CI green.

## Work breakdown

| Step | Role     | Produces            | Commit                                                                |
| ---- | -------- | ------------------- | --------------------------------------------------------------------- |
| 1    | dev-lead | red probes A1–A6    | `test(scripts): B1.86 check-ac-coverage probes for multi-line titles` |
| 2    | dev-lead | guard + scripts doc | `chore(ci): B1.86 check-ac-coverage reads titles per file`            |
| 3    | reviewer | diff review         | `docs(backlog): B1.86 review pass N`                                  |
| 4    | dev-lead | draft PR, label     | —                                                                     |

Not in scope: the 7-criteria cap and the index parsing (unchanged); `describe` titles; titles built at runtime
(`it(\`${id}: …\`)`). Narrowing: `fit(`, `xit(`or`foo.it(`no longer count (the old regex had no left boundary);
0 titles in`src/`, `e2e/` today, so no section's count moves.

Costs: a string literal holding an unbalanced quote or backtick inside an `.each` table could hide the title that
follows; today's tests have none (prototype diff above). Perl joins the guard's dependencies (present in
`node:24-bookworm` and macOS).

Plan review: · Plan approved by: · Rounds: 1
