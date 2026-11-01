## Item

B1.29 — verify-red tells new tests from old ones by running the base (tooling, no spec section)

- spec: none — tooling (`scripts/verify-red.sh`, `scripts/verify-red-smoke.sh`, `scripts/CLAUDE.md` smoke row)
- test: `scripts/verify-red-smoke.sh` V7–V14 — red before (`8 ok, 6 FAIL`), green after (`14 ok, 0 FAIL`)
- acceptance: existing tests recognised by running the base's copy and comparing full names (no prefix rule); carried escape and `%%` cases probed; the 22 historical red commits keep their verdicts; `config-change-approved` (D-19)

## Plan

### B1.29 plan — verify-red tells new tests from old ones by running the base (tooling)

Round 1. `scripts/verify-red.sh` stops reading test titles out of the base's source. Before it copies the red commit's
test files into the scratch worktree (checked out at the base), it runs the base's own copy of every touched test file
the base has, with the JSON reporter, into `.verify-red-base.json`. A test is named by its describe path and title
(`JSON.stringify([...ancestorTitles, title])`), counted per file over the base tests that ran (`passed` or `failed`:
a skeleton's `it.todo` placeholder or a skipped test is not old — prototype without this turned B1.2 and B1.3 to exit 1);
a test in the red run is old only while its name occurs no more often than in the base run, so a repeated name is new
in every occurrence. No base copy, or a base run that wrote no report: nothing is old (strict, as for a new file
today). `baseTitles`, `unescape`, `PLACEHOLDER` and `isOld` are deleted, so no prefix or escape rule remains and the carried B1.25 cases (`.each` prefix, another
`describe`, `\u{110000}`, `%%`, a literal `%s`) are decided by what vitest reports. Cost: one more vitest run per card
(the base's files only, CI's `--auto` too). Costs (plan review round 1): a red commit that renames or wraps an existing
`describe` counts its old passing tests as new → exit 1 (fails closed; restructure in a commit without `(red)`); an
`.each` with `%#` now matches. Bash 3.2-safe (no arrays added, no `mapfile`). Tooling card: spec-analyst and advisor skipped.

#### Files

| File                            | Change                                                                      |
| ------------------------------- | --------------------------------------------------------------------------- |
| `scripts/verify-red.sh`         | base run before the copy; node compares names from both reports; header 4–6 |
| `scripts/verify-red-smoke.sh`   | probes V7–V14; `probe` optional 7th arg; header; V1–V6 unchanged            |
| `scripts/CLAUDE.md`             | smoke row: V1–V14, "base run" instead of "escapes, exact match, prefix"     |
| `backlog/work/B1.29/plan.md`    | plan                                                                        |
| `backlog/work/B1.29/review.md`  | reviews                                                                     |
| `backlog/work/B1.29/pr-body.md` | PR body                                                                     |

#### Interfaces touched

None: `scripts/verify-red.sh <card> [--range <base>..<head>] [--keep] | --auto` keeps its arguments, output lines
(`<file>: N ran (k new), f new failed, p new passed`) and exit codes. New scratch file `.verify-red-base.json`.

Probes (same plumbing as V1–V6; exit, summary line): V7 old `it.each(['abc','0','70000'])('rejects PORT=%s')` + new
passing `'rejects PORT=-1 (negative)'` + new failing → 1, `5 ran (2 new), 1 new failed, 1 new passed` · V8 old
`describe('A') › 'AC-0.6: same'` + new passing `describe('B') › 'AC-0.6: same'` + new failing → 1, `3 ran (2 new), 1 new
failed, 1 new passed` · V9 old comment `// it('AC-0.1: x \u{110000}')` + old passing + new failing → 0, `2 ran (1 new),
1 new failed, 0 new passed` · V10 old `.each(['x'])('AC-0.3: 50%%s done %s')` + new passing `'AC-0.3: 50% extra'` + new
failing → 1, `3 ran (2 new), 1 new failed, 1 new passed` · V11 old `'AC-0.4: literal %s here'` + new passing `'AC-0.4:
literal extra'` + new failing → 1, same line · V12 old `'AC-0.5: café \x41 \u{1F600} tab\there'` + new failing → 0,
`2 ran (1 new), …, 0 new passed` (pins decoding; ok before and after) · V13 old `'AC-0.7: dup'` + a second passing
`'AC-0.7: dup'` + new failing → 1, `3 ran (3 new), 1 new failed, 2 new passed` · V14 old `it.todo('AC-0.8: later')`
replaced by a passing `'AC-0.8: later'` + new failing → 1, `2 ran (2 new), 1 new failed, 1 new passed` (prototype
without the passed/failed filter: exit 0). `probe` gains an optional 7th argument, the base tests kept in the red commit.

#### Verification (in the card worktree)

```bash
scripts/verify-red-smoke.sh                  # test commit: "[verify-red-smoke] 8 ok, 6 FAIL" (V7 V8 V9 V10 V11 V13)
scripts/verify-red-smoke.sh                  # fix: "[verify-red-smoke] 14 ok, 0 FAIL"; same under /bin/bash (3.2)
# 22 historical red commits (`git log --all`, subject test(…): B<e>.<n> … (red)), each `verify-red.sh <id> --range C^..C`
# with origin/main's script and the fix's: same exit code for all 22 (19 exit 0, 3 e2e-only test(ui) exit 1) and
# identical file lines once sorted (vitest's file order varies: 8293598, fae3314); B4.2 b5fc079 stays red
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
```

#### Work breakdown

| Step | Role / skill | Produces                                            | Commit                                                 |
| ---- | ------------ | --------------------------------------------------- | ------------------------------------------------------ |
| 1    | dev-lead     | probes V7–V14 (red: 6 FAIL)                         | `test(scripts): B1.29 verify-red base-run probes`      |
| 2    | dev-lead     | base run, name compare, CLAUDE.md row               | `fix(scripts): B1.29 verify-red runs the base's tests` |
| 3    | reviewer     | diff review (D-25: scope widening → follow-up card) | `docs(backlog): B1.29 review …`                        |

No `(red)` marker on step 1 (tooling: `verify-red.sh --auto` judges vitest files only). PR: `scripts/pr-step.sh`,
`config-change-approved` (D-19: `scripts/verify-red.sh`).

Plan review: approved, round 1 · Plan approved by: · Rounds: 1

## Map delta

None (tooling, no feature row).

## Review

pending

🤖 Generated with [Claude Code](https://claude.com/claude-code)
