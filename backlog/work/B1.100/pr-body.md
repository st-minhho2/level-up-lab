## Item

B1.100 — Each parallel run mutation-tests all of src/lib up to three times, whatever the card changed (tooling, no
spec section)

- spec: none — tooling (`scripts/mutation-gate.sh`, its smoke, the role prompts that run mutation); no `src/` change
- test: `scripts/mutation-gate-smoke.sh` MG1–MG16 (new). Red: pending. Green: pending
- acceptance: pending — local mutation only on a `src/lib`/`src/actions` change, once per tree, the reviewer reuses
  it; `--mutate` limited to the changed files, the 70 % bar read on that subset; the PR evidence line; batch 2's
  per-run duration and load (closing lane); label `config-change-approved`
- risk tier: high (`scripts/agent/tier.sh`: `.claude/`); label `config-change-approved` per the card (D-19)

## Plan

Copied from `backlog/work/B1.100/plan.md` (approved 9ab7544).

### B1.100 plan — local mutation runs only when src/lib or src/actions changed, once per src/ tree (tooling, no §)

Approach: a new `scripts/mutation-gate.sh` is how a card's build and review run mutation locally. The places that
run `pnpm test:mutation` today (`code-writer.md:35`, `tdd-loop/SKILL.md:26`, `reviewer.md:65`, and
`review-loop/SKILL.md:45`) call it and paste its last line. A D-13 hardening card's before/after report still runs
`pnpm test:mutation` directly (r1 #3). CI's `mutation` job is untouched: every PR still gets the whole layer at 70 %.

```text
base   = merge-base(origin/main | --base <ref>, HEAD); tree = the working tree as a tree object (temp index)
diff   = git diff --name-only base tree -- 'src/lib/*.ts' 'src/actions/*.ts'   (a CLAUDE.md is no hit, r1 #2)
empty  → "mutation: CI only, no src/lib or src/actions change", exit 0, no Stryker
mutate = changed *.ts; <x>.test.ts → <x>.ts; prisma.ts, deleted dropped; nothing left → the whole layer
key    = tree:src + stryker.config.mjs vitest.stryker.config.mts tsconfig.json package.json pnpm-lock.yaml + list
reuse  = reports/mutation-gate.txt holds the key → its line ("(reused)") and exit code; --force runs again
run    = pnpm exec stryker run [--mutate <list>]; then, on the subset only:
         no valid mutant ("with 0 mutant(s)", r1 #1; or score NaN = all compile errors, r3 #1) → whole layer once
         mutants, no score, "No tests were executed" (r2 #1) → "? % on <list>, no test reaches it", exit 1
line   = "mutation: <score> % on <list | src/lib + src/actions[, no valid mutant in <list>]> (ran|reused), src <tree7>"
exit   = Stryker's (break 70); no numeric score after all that → "?", exit 1
```

- **Bar on the subset**: stricter than CI (r1: `todos.ts` alone 75.00 % vs 92.84 % for the layer; a 1–2 mutant
  file fails on its first survivor, and the card hardens its tests).
- **Once per tree**: the key is the working tree, so code-writer's pre-commit run is the one the green gate and
  the reviewer reuse; a fix touching any `src/` file runs again. Locally one run stands behind the score; CI is the
  independent check, `--force` the reviewer's rerun on doubt. The stamp file is trusted as written (r2, r3 note).
- **PR evidence**: the `mutation:` line goes verbatim into the PR body (tdd-loop Report, work-next Exit).
- Not touched: `dev-lead.md` (its ":55 mutation ≥ 70" still holds on the subset), `agent/run.sh`, `run-smoke.sh`
  (B1.101's). `scripts/CLAUDE.md`: B1.98 merged (#306); B1.101's plan does not list it; `--check` no overlap.
  B1.101 hands its `--sync` row to "the next card that plans scripts/CLAUDE.md": added here only if B1.101 merges
  before this PR is ready; otherwise B1.101's handoff stays open.

Prototype (scratchpad, bash 3.2): smoke 16 ok / 0 FAIL; skeleton (today's rule) 1 ok / 15 FAIL. Mutants M1–M17 of
the script: 17/17 killed. Real Stryker (macOS, load ≈ 2.6): `--base be888ff^` → 7 mutants of
`complete-all-label.ts`, 16 s, 100.00 %, again "(reused)" 1 s; whole layer 668 mutants, 222 s, 92.84 %. On
`--shared` clones: untested function → "? %, no test reaches it", exit 1, 14 s; a tested union function (all
mutants compile errors) → "score of NaN", then the whole layer, 92.84 %, exit 0, 222 s.

**Expected saving, E7 batch 2** (today ≥ 3 whole-layer runs per run: code-writer, green gate, reviewer):

| Card | Touches                      | After                  | Saved at load 2.6 |
| ---- | ---------------------------- | ---------------------- | ----------------- |
| B7.4 | `src/components`, `page.tsx` | 0 (CI-only line)       | ≈ 11 min          |
| B7.5 | `src/lib/title-count.ts`     | 1 subset run, 2 reuses | ≈ 10.5 min        |
| B7.6 | one component                | 0                      | ≈ 11 min          |

At batch 1's load (29–45 on 8 CPUs) plausibly 30–45 min per run `[unverified]`; batch 2 measures it (Acceptance 4).

#### Files

| File                                  | Change                                                                              | Why                |
| ------------------------------------- | ----------------------------------------------------------------------------------- | ------------------ |
| `scripts/mutation-gate.sh`            | new: the rule above; header = usage, rule, output                                   | Acceptance 1, 2, 3 |
| `scripts/mutation-gate-smoke.sh`      | new: MG1–MG16 on a throwaway repo with a `pnpm` shim                                | Test line          |
| `.claude/agents/code-writer.md`       | step 4: the script, not `pnpm test:mutation` (D-13 report excepted); Report         | Acceptance 1       |
| `.claude/skills/tdd-loop/SKILL.md`    | step 4 green gate: the script (reuses code-writer's run); Report: its line          | Acceptance 1, 3    |
| `.claude/agents/reviewer.md`          | diff-review gate run: the script (reuses unless `src/` changed); paste line         | Acceptance 1       |
| `.claude/skills/review-loop/SKILL.md` | re-verify after a fix: the script instead of "mutation if … changed"                | Acceptance 1       |
| `.claude/skills/work-next/SKILL.md`   | Exit: the `mutation:` line in the PR evidence                                       | Acceptance 3       |
| `scripts/CLAUDE.md`                   | rows `mutation-gate.sh [--base <ref>] [--force]`, `mutation-gate-smoke.sh` MG1–MG16 | guide              |
| `backlog/work/B1.100/*`               | plan, review, pr-body                                                               | pipeline           |

#### Interfaces touched

`scripts/mutation-gate.sh [--base <ref>] [--force]`: exit 0 pass or skip, 1 below the bar or no score, 2 usage or
no merge-base. Writes only `reports/mutation-gate.txt` (git-ignored) and Stryker's reports. No env var or config.

#### Verification

`mutation-gate-smoke.sh` is in no CI job; run with `/bin/bash` (3.2). Red on the skeleton (today's rule): "1 ok, 15
FAIL"; green "16 ok, 0 FAIL". Live: CI-only line in this worktree; `--base be888ff^` runs once, then "(reused)".
`hook-smoke.sh` 749 OK and `pnpm test` 298 before and after; lint, typecheck 0; plan-scope, agent-frontmatter OK.

#### Work breakdown

skeleton `chore(scripts): B1.100 skeleton` → red `test(scripts): B1.100 mutation-gate-smoke probes the local
mutation rule` → green `chore(scripts): B1.100 local mutation runs once, only on a src/lib or src/actions change` →
reviewer diff review → draft PR and label. Closing: `docs/B1.100-partial` (pending E7 batch 2 per-run duration and
load) until batch 2 reports, then Done.

Plan review: approved, round 4 · Plan approved by: lead, 2026-11-14 · Rounds: 1

## Map delta

None: tooling card, no `spec/features-map.md` row.

## Review

Pending: `/review-loop` after the green commit.

## Evidence

- AC met: pending
- tier: high
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the green commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %. (n/a: no `src/`)
- [x] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change carries label
      `config-change-approved` (`.claude/`, plan approved 9ab7544).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed. (n/a)
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake
      repeated. (n/a: tooling)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
