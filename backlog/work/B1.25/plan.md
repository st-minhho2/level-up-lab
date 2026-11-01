# B1.25 plan — verify-red reads escaped quotes in existing test titles (tooling)

Round 2 (plan review round 1: 6 reasons). In `scripts/verify-red.sh`'s embedded node: `baseTitles` decodes JS
single-character escapes in each title read from the base (`\'` `\"` `` \` `` `\\` `\n` `\t` `\r` `\b` `\f` `\v`
`\0` `\xHH` `\uHHHH` `\u{H…}`), so it equals the title vitest reports; and `isNew` matches an old title exactly, using a
prefix only for an old title with a `%s`-style placeholder (`.each`), cut at its first placeholder. Exact matching
closes the prefix hole round 1 found (an old `AC-0.1: query` hid a new passing `AC-0.1: query is trimmed`, at HEAD
too). Out of scope: template literals with `${…}` (still counted new, so the gate stays strict). Lead's choice A for
B4.2's red gate. Tooling card: spec-analyst and advisor skipped.

## Files

| File                           | Change                                                                 |
| ------------------------------ | ---------------------------------------------------------------------- |
| `scripts/verify-red.sh`        | `baseTitles` decodes escapes; `isNew` exact match, prefix only for `%` |
| `scripts/verify-red-smoke.sh`  | new: probes V1–V6                                                      |
| `scripts/CLAUDE.md`            | row for the smoke                                                      |
| `backlog/work/B1.25/plan.md`   | plan                                                                   |
| `backlog/work/B1.25/review.md` | reviews                                                                |

## Interfaces touched

None: `scripts/verify-red.sh <card> [--range <base>..<head>]` keeps its arguments, output format and exit codes.

Smoke mechanics: a detached `git worktree add` of HEAD under `$TMPDIR` with `node_modules` linked, removed by `trap EXIT`;
fixture commits made with plumbing (`hash-object`, `update-index`, `write-tree`, `commit-tree`: no hook runs and none is
bypassed; the commits stay unreferenced); the script under test is the working copy (`$ROOT/scripts/verify-red.sh`,
run with the scratch worktree as cwd); the fixture is `src/lib/vr-probe.test.ts`. Each probe asserts the exit code and
the summary line (`N ran (k new), f new failed, p new passed`), and V3/V4 that only the new title is named.
V1 old `'… \'\' …'` + new failing → exit 0 · V2 old `"… \" …"` and `` `… \` …` `` + new failing → exit 0 · V3 old
escaped title + new passing → exit 1, `(1 new), 0 new failed, 1 new passed` · V4 old `'AC-0.1: query'` + new passing
`'AC-0.1: query is trimmed'` → exit 1 · V5 old `'a\nb'` + new failing → exit 0 · V6 old `it.each(...)('AC-0.2: %s')` kept plus a new failing test → exit 0 (the placeholder prefix still matches).

## Verification (in the card worktree)

```bash
scripts/verify-red-smoke.sh   # test commit: "[verify-red-smoke] 1 ok, 5 FAIL" (V6 ok); fix: "6 ok, 0 FAIL" (bash 5, /bin/bash 3.2)
scripts/verify-red.sh B4.2 --range 0118ee5..b5fc079   # HEAD: exit 1 GREEN; fix: "RESULT: red for the right reason"
scripts/verify-red.sh B4.1 --range e91dbd6..a5475db   # stays "red for the right reason" (no regression)
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
```

Steps: `test(scripts): B1.25 …` (no `(red)` marker: CI's `verify-red.sh --auto` judges only vitest files) →
`fix(scripts)` → reviewer diff → draft via `scripts/pr-step.sh`, `config-change-approved` (D-19: `scripts/verify-red.sh`).

Plan review: changes requested, round 1 (6 reasons applied above) · Plan approved by: · Rounds: 1
