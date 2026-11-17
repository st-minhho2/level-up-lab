## Item

B1.104 round 3 — `scripts/CLAUDE.md` gains an `agent/run-smoke.sh` row (tooling, no spec section). Pending item of
B1.104's Partial closing (#384); the feature itself merged in #380 (bed5bd7), whose body stays in that PR and in
`git show bed5bd7:backlog/work/B1.104/pr-body.md`.

- spec: none — tooling docs; no `src/`, script or behaviour change
- test: none needed (one table row); `run-smoke.sh` "23 probes OK", `hook-smoke.sh` "790 probes OK"
- acceptance: clause 5's other half ("`scripts/CLAUDE.md` for the probe")

## Plan

Copied from `backlog/work/B1.104/plan.md` "Round 3" (approved eca74a0, lead, 2026-11-17; not re-reviewed: plan review
cap 2, as B1.101 round 4).

B1.103 has merged (#381, #383) and no Doing card plans `scripts/CLAUDE.md` now, so B1.104 carries the row itself, one
`docs(scripts)` commit. A new row after `agent/run.sh <issue> …`: `agent/run-smoke.sh` | "probes R1–R23 of
`agent/run.sh` offline with `claude` and `gh` shims, among them R16 the exact run prompt and R23 the untrusted-text
rule and its `CLAUDE.md` row (B1.104); in no CI job yet (B1.60), run with `/bin/bash`" | `jq`. The guide had no
`run-smoke.sh` row since B1.44; B1.60 later only changes its Needs cell when CI runs it. No other file but the plan and
this body.

| File                    | Change                                      | Why          |
| ----------------------- | ------------------------------------------- | ------------ |
| `scripts/CLAUDE.md`     | round 3: row `agent/run-smoke.sh` (R1–R23)  | Acceptance 5 |
| `backlog/work/B1.104/*` | plan round 3 and its approval, this PR body | pipeline     |

## Map delta

None (no `src/`, no section).

## Review

Not re-reviewed (plan review cap 2; a one-row doc change, as #328). Prettier added the one row and re-padded nothing:
`git show --stat 1613419` → `scripts/CLAUDE.md | 1 +`. No untrusted text tried to steer this round.

## Evidence

- `scripts/ci/check-plan-scope.sh` → "stays inside the approved plan of B1.104"
- `prettier --check scripts/CLAUDE.md` OK; `run-smoke.sh` (/bin/bash 3.2) "23 probes OK"; `hook-smoke.sh` "790 probes
  OK"
- tier: low for this diff (`scripts/CLAUDE.md` is not in `CONFIG_PROTECTED`; no `config-change-approved` label)
- plan deviations: none
- mutation: CI only, no src/lib or src/actions change

## Checklist

- [x] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [x] Red commit precedes the change commit (n/a: docs only, no test).
- [x] Every `AC-§.n` of the section is a test title (n/a: no section); mutation (n/a: no `src/`).
- [x] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change.
- [x] Migrations reviewed as SQL (n/a).
- [x] `spec/features-map.md` (n/a); `docs/metrics.md` (n/a: tooling); mistake-log: no repeat.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
