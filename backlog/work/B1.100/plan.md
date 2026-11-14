# B1.100 plan — local mutation runs only when src/lib or src/actions changed, once per src/ tree (tooling, no §)

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
  (B1.101's). `scripts/CLAUDE.md`: B1.98 merged (#306, here at 17ccd2b); B1.101's plan does not list it;
  `--check` no overlap. B1.101 hands its `--sync` row to "the next card that plans scripts/CLAUDE.md" (r3 note):
  added here only if B1.101 merges before this PR is ready; otherwise B1.101's handoff stays open.

Prototype (scratchpad, bash 3.2): smoke 16 ok / 0 FAIL; skeleton (today's rule) 1 ok / 15 FAIL (MG11 holds on
both). Mutants M1–M17 of the script: 17/17 killed. Real Stryker (macOS, load ≈ 2.6): `--base be888ff^` → 7
mutants of `complete-all-label.ts`, 16 s, 100.00 %, again "(reused)" 1 s; whole layer 668 mutants, 222 s, 92.84 %.
On `--shared` clones: untested function → "? %, no test reaches it", exit 1, 14 s; a tested `ZzMode` union function (r3's trigger) → 2 mutants, "score of NaN", then the
whole layer: "92.84 % on src/lib + src/actions, no valid mutant in src/lib/zz-nan.ts", exit 0, 222 s. Type-only (r2 proto,
on the worktree, untracked, deleted after): 0 mutants → whole layer, exit 0, 208 s.

**Expected saving, E7 batch 2** (today ≥ 3 whole-layer runs per run: code-writer, green gate, reviewer):

| Card | Touches                      | After                  | Saved at load 2.6 |
| ---- | ---------------------------- | ---------------------- | ----------------- |
| B7.4 | `src/components`, `page.tsx` | 0 (CI-only line)       | ≈ 11 min          |
| B7.5 | `src/lib/title-count.ts`     | 1 subset run, 2 reuses | ≈ 10.5 min        |
| B7.6 | one component                | 0                      | ≈ 11 min          |

At batch 1's load (29–45 on 8 CPUs) plausibly 30–45 min per run `[unverified]`; batch 2 measures it (Acceptance 4).

Tier: `tier.sh` → **high** (`.claude/`): the lead's `approve`. `config-change-approved` at draft (card).
Dev-lead writes `scripts/` and `.claude/` (interactive tooling card, as B1.95/B1.98).

## Files

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

## Interfaces touched

`scripts/mutation-gate.sh [--base <ref>] [--force]`: exit 0 pass or skip, 1 below the bar or no score, 2 usage or
no merge-base. Writes only `reports/mutation-gate.txt` (git-ignored) and Stryker's reports. No env var or config.

## Verification

`mutation-gate-smoke.sh` is in no CI job; run with `/bin/bash` (3.2).

- Red `test(scripts): B1.100 mutation-gate-smoke probes the local mutation rule (red)` on
  `chore(scripts): B1.100 skeleton` (today's rule): "1 ok, 15 FAIL". Green: "16 ok, 0 FAIL".
- Live, this worktree: CI-only line, exit 0, < 5 s; `--base be888ff^` runs once, then "(reused)". The untested and
  NaN cases again on a `--shared` clone in the scratchpad, never the worktree.
- `hook-smoke.sh` "749 probes OK" (RP1–RP10 read the edited prompts), `pnpm test` "298 passed (298)" at 17ccd2b and
  after; `pnpm lint && pnpm typecheck` 0; `check-plan-scope.sh`, `check-agent-frontmatter.sh` OK; `--check` no
  overlap; CI green.

## Work breakdown

| Step | Role     | Produces        | Commit                                                                                     |
| ---- | -------- | --------------- | ------------------------------------------------------------------------------------------ |
| 1    | dev-lead | skeleton        | `chore(scripts): B1.100 skeleton`                                                          |
| 2    | dev-lead | red probes      | `test(scripts): B1.100 mutation-gate-smoke probes the local mutation rule (red)`           |
| 3    | dev-lead | script, prompts | `chore(scripts): B1.100 local mutation runs once, only on a src/lib or src/actions change` |
| 4    | reviewer | diff review     | `docs(backlog): B1.100 review pass N`                                                      |
| 5    | dev-lead | draft PR, label | —                                                                                          |

Closing: `docs/B1.100-partial` ("pending E7 batch 2 per-run duration and load") until batch 2 reports, then Done.

Plan review: · Plan approved by: · Rounds: 1
