# B1.25 plan — verify-red reads escaped quotes in existing test titles (tooling)

Approach: `baseTitles` in `scripts/verify-red.sh` unescapes each title it reads from the base's source
(`m[2].replace(/\\(.)/g, '$1')`), so a title written with escaped quotes matches the title vitest reports. Lead's
choice A for B4.2's red gate (b5fc079: two AC-16.5 titles counted as new and passing). Tooling card: spec-analyst and
advisor skipped (no section; the card's Acceptance is the contract).

## Files

| File                           | Change                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `scripts/verify-red.sh`        | `baseTitles`: unescape `\x` → `x` in each title read from the base               |
| `scripts/verify-red-smoke.sh`  | new: probes V1–V3 on a throwaway detached worktree of HEAD (node_modules linked) |
| `scripts/CLAUDE.md`            | row for the smoke                                                                |
| `backlog/work/B1.25/plan.md`   | plan                                                                             |
| `backlog/work/B1.25/review.md` | reviews                                                                          |

## Interfaces touched

None. `scripts/verify-red.sh <card> [--range <base>..<head>]` keeps its arguments, output and exit codes.

Probes (each a base commit with an existing passing test, then a `test(todos): B9.9 probe (red)` commit, then
`scripts/verify-red.sh B9.9 --range <base>..<red>`):
V1 the existing title in single quotes with `\'\'` + one new failing test → exit 0 "red for the right reason";
V2 the same with `\"` in double quotes and `` \` `` in a template literal → exit 0;
V3 the existing escaped title + one new passing test → exit 1 "GREEN before implementation" (the gate still bites).

## Verification (in the card worktree)

```bash
scripts/verify-red-smoke.sh   # test commit: V1, V2 FAIL (exit 1), V3 ok; green: 3 ok, 0 FAIL (bash 5 and /bin/bash 3.2)
scripts/verify-red.sh B4.2 --range <B4.2 base>..b5fc079   # on B4.2's branch after merge: red for the right reason
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
```

Steps: `test(scripts)` → `fix(scripts)` → reviewer diff → draft PR via `scripts/pr-step.sh`, `config-change-approved`
(D-19: `scripts/verify-red.sh`).
