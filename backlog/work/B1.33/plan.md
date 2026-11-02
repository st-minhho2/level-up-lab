# B1.33 plan — CI runs hook-smoke and its guide row names every probe group (tooling)

Round 1. A new last step of the push-safe group in the required `guards` job runs `scripts/hook-smoke.sh`; its exit 1
fails the step, the job and the merge (the ruleset requires `guards`; a new job would not be required). The step runs
`env -u HEAD_SHA -u BASE_SHA scripts/hook-smoke.sh`: `guards` exports both for its own checks, and `cps` in
`hook-smoke.sh` unsets only `GITHUB_HEAD_REF`/`GITHUB_BASE_REF`, so `check-plan-scope.sh` reads the PR's `HEAD_SHA`
inside the fixture repos (prototype in `node:24-bookworm` with `guards`' env: exit 1, 18 FAIL — C1–C4, C6, C7, L4–L6 ×
4 layouts, all exit 128; with the two unset: 440 OK). `hook-smoke.sh` is B1.32's file, so the unset lives in the step
and `cps` itself is a follow-up candidate (D-25). `scripts/CLAUDE.md` row names S1–S15, C1–C8, L1–L6 and needs
`node_modules (js-yaml)` (`check-agent-frontmatter.sh` runs inside). Tooling card: spec-analyst and advisor skipped.

Pre-plan runs on origin/main a733c7b: /bin/bash 3.2 (macOS) 440 OK, 55 s · bash 5.2.15 in `node:24-bookworm`, root,
shallow clone, after `.github/actions/setup`'s install: 440 OK, 19 s, tree and `git worktree list` clean afterwards ·
a hook made non-executable: exit 1, 6 FAIL. No probe fails only under bash 5.

Costs: `guards` 38 s (run 41371867185) → ≈ 57 s [unverified on CI's x86 until the PR run]; still one billed minute,
run wall clock unchanged (`mutation` ≈ 5 min is the longest job). A `hotfix` PR skips `guards`, so hook-smoke too (the
hotfix lane runs lint, typecheck, unit only). Siblings' new probes (B1.32) gate every later PR on bash 5.

## Files

| File                            | Change                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`      | `guards`: hook-smoke step after the frontmatter step (block below)              |
| `scripts/CLAUDE.md`             | hook-smoke row: S1–S15, C1–C8, L1–L6; Needs `node_modules (js-yaml)`, CI guards |
| `backlog/work/B1.33/plan.md`    | plan                                                                            |
| `backlog/work/B1.33/review.md`  | reviews                                                                         |
| `backlog/work/B1.33/pr-body.md` | PR body                                                                         |

## Interfaces touched

```yaml
- name: Every hook probe passes under CI's bash (hook-smoke.sh)
  # guards' HEAD_SHA/BASE_SHA would reach check-plan-scope.sh inside hook-smoke's fixture repos (exit 128)
  run: env -u HEAD_SHA -u BASE_SHA scripts/hook-smoke.sh
```

No script changes; `scripts/hook-smoke.sh` arguments, output and exit codes unchanged.

## Verification (in the card worktree)

```bash
grep -l hook-smoke .github/workflows/*      # before: no output, exit 1 · after: .github/workflows/ci.yml
scripts/hook-smoke.sh | tail -1             # "hook-smoke: 440 probes OK" (more if B1.32 merged first); /bin/bash too
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
# PR CI: guards → step "Every hook probe passes under CI's bash (hook-smoke.sh)" green, log ends "hook-smoke: N probes OK"
```

## Work breakdown

| Step | Role / skill | Produces                                            | Commit                                  |
| ---- | ------------ | --------------------------------------------------- | --------------------------------------- |
| 1    | dev-lead     | `guards` step + guide row                           | `ci(scripts): B1.33 CI runs hook-smoke` |
| 2    | reviewer     | diff review (D-25: scope widening → follow-up card) | `docs(backlog): B1.33 review …`         |

No test commit: the card's Test is the grep (red today) and the PR's own `guards` run; no vitest file changes.
PR: `scripts/pr-step.sh`, `config-change-approved` (D-19: `.github/`).

Plan review: · Plan approved by: · Rounds: 1
