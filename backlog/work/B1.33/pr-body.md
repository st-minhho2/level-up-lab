## Item

B1.33 — CI runs hook-smoke and its guide row names every probe group (tooling, no spec section)

- spec: none — tooling (`.github/workflows/ci.yml` `test` job, `scripts/CLAUDE.md` hook-smoke row)
- test: `grep -l hook-smoke .github/workflows/*` — no match before, `.github/workflows/ci.yml` after; this PR's `test` job runs the step green
- acceptance: a required CI job (`test`) runs `scripts/hook-smoke.sh` on every non-hotfix PR and fails on its exit 1; the `scripts/CLAUDE.md` row names C1–C8 and L1–L6; `config-change-approved` (D-19: `.github/`)

## Plan

### B1.33 plan — CI runs hook-smoke and its guide row names every probe group (tooling)

Round 2 (plan review r1: 5 reasons). A step in the required `test` job runs `scripts/hook-smoke.sh`; exit 1 fails the
job and blocks the merge (the ruleset requires `test`; a new job would not be required). Not `guards`: its
`fetch-depth: 0` gives `origin/main`, so on any PR with a committed `src/` change the review-gate probe (its "clean
tree" is `git diff HEAD`, `require-review.sh`'s is `merge-base origin/main`) fails, and its `HEAD_SHA` reaches
`check-plan-scope.sh` in the C/L fixture repos (18 FAIL, exit 128). `test` checks out one ref at depth 1: no
`origin/main` (base = HEAD), no `HEAD_SHA`. `if: !cancelled() && env.HOTFIX != 'true'`: it reports even after a unit
failure, and the hotfix lane stays lint, typecheck, unit. Both probe defects are in B1.32's `hook-smoke.sh` → follow-up
cards in the closing PR (D-25). Tooling: spec-analyst and advisor skipped.

Pre-plan runs (a733c7b): /bin/bash 3.2 440 OK, 55 s · `node:24-bookworm` bash 5.2.15, root: 440 OK, 19 s, tree clean
after · simulated PR merge ref with a `src/lib/todos.ts` change: depth 1 → 440 OK; `guards`' checkout → exit 1,
`FAIL require-review.sh spoke on a clean tree` · a non-executable hook → exit 1, 6 FAIL.

Costs: `test` 49 s (run 41371867185) → ≈ 68 s, billed 1 → 2 min per run [unverified on CI's x86 until the PR run];
run wall clock unchanged (`mutation` ≈ 5 min). A hotfix PR skips it. Every later PR runs B1.32's new probes on bash 5.

#### Files

| File                            | Change                                                            |
| ------------------------------- | ----------------------------------------------------------------- |
| `.github/workflows/ci.yml`      | `test`: hook-smoke step after the unit step (block below)         |
| `scripts/CLAUDE.md`             | hook-smoke row: S1–S15, C1–C8, L1–L6; Needs node_modules, CI test |
| `backlog/work/B1.33/plan.md`    | plan                                                              |
| `backlog/work/B1.33/review.md`  | reviews                                                           |
| `backlog/work/B1.33/pr-body.md` | PR body                                                           |

#### Interfaces touched

```yaml
- name: Every hook probe passes under CI's bash (hook-smoke.sh)
  # Here, not in guards: guards' fetch-depth 0 and HEAD_SHA leak into the review-gate and check-plan-scope probes.
  if: ${{ !cancelled() && env.HOTFIX != 'true' }}
  run: scripts/hook-smoke.sh
```

No script changes; `hook-smoke.sh` arguments, output and exit codes unchanged.

#### Verification (in the card worktree)

```bash
grep -l hook-smoke .github/workflows/*      # before: no output, exit 1 · after: .github/workflows/ci.yml
scripts/hook-smoke.sh | tail -1             # "hook-smoke: 440 probes OK" (more if B1.32 merged first); /bin/bash too
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
# node:24-bookworm, PR merge ref with a committed src/ change fetched at depth 1 (test's checkout): 440 probes OK
# PR CI: test → step "Every hook probe passes under CI's bash (hook-smoke.sh)" green, "hook-smoke: N probes OK"
```

#### Work breakdown

| Step | Role / skill        | Produces                                            | Commit                                  |
| ---- | ------------------- | --------------------------------------------------- | --------------------------------------- |
| 1    | lead's main session | `test` step + guide row (dev-lead's guard refuses)  | `ci(scripts): B1.33 CI runs hook-smoke` |
| 2    | reviewer            | diff review (D-25: scope widening → follow-up card) | `docs(backlog): B1.33 review …`         |

No skeleton (no § function), no map step (no `features-map.md` row), no test commit (the card's Test is the grep and
the PR's own `test` run). Row vs B1.32: merged first → Loop 9's merge brings its ids and the row follows here; merged
after → its new ids are a follow-up. PR: `scripts/pr-step.sh`, `config-change-approved` (D-19: `.github/`).

Plan review: approved, round 2 · Plan approved by: lead (session reply "approve"), 2026-11-02 · Rounds: 1

## Map delta

None (tooling: no `spec/features-map.md` row).

## Review

Plan review: approved in round 2 (round 1: 5 reasons, all answered in the plan). Diff review: **pass 1/3, ready for
PR, 0 findings** (full section in `backlog/work/B1.33/review.md` "Diff review (pass 1)").

- Suites (reviewer): vitest 202 passed · playwright 43 passed · stryker 93.40 % (break 70) · every `scripts/ci/*`
  guard OK · `check-config-change.sh` rc 0 with the label, `::error::` without.
- PR run 41374485183: `test` 68 s, step "Every hook probe passes under CI's bash (hook-smoke.sh)" green, log ends
  `hook-smoke: 440 probes OK`; its checkout fetched only `refs/remotes/pull/138/merge` (no `origin/*`).
- Negative probe on a CI-shaped copy: one hook made non-executable → rc 1, 6 FAIL.
- Out of scope → follow-up (D-25), filed in the closing PR: hook-smoke's review-gate probe tests `git diff HEAD`
  while `require-review.sh` uses `merge-base origin/main` (FAILs under `guards`' depth-0 checkout with a committed
  `src/` change); `cps` does not unset `HEAD_SHA`/`BASE_SHA` (18 FAIL under `guards`' env); the PR wrapper refuses
  a `ci(` title that `lefthook.yml` accepts (so this PR is titled `chore(scripts)`).
- Riskiest unfalsified: the review-gate probe on a real feature PR with a committed `src/` change under the `test`
  job; simulated (440 OK), first real proof is the next feature PR.

| Disposition              | Count |
| ------------------------ | ----- |
| fix now                  | 0     |
| no change needed         | 0     |
| out of scope (follow-up) | 3     |

## Checklist

- [x] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [x] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**` (n/a: no test or feat commit).
- [x] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 % (93.40, unchanged).
- [x] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change carries `config-change-approved` (`.github/workflows/ci.yml`).
- [x] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed (n/a).
- [x] `spec/features-map.md` row moved (n/a); `docs/metrics.md`: batch measurement by the lead; mistake-log: none repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
