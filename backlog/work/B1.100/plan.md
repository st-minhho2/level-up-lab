# B1.100 plan — local mutation runs only when src/lib or src/actions changed, once per src/ tree (tooling, no §)

Approach: one new script, `scripts/mutation-gate.sh`, becomes the local way a card's build and review run
mutation. The three places that run `pnpm test:mutation` today (`code-writer.md:35`, `tdd-loop/SKILL.md:26`,
`reviewer.md:65`) and `review-loop/SKILL.md:45` call it instead; the script decides, the prompts call it and paste
its last line. **Exception** (review r1 #3): a D-13 hardening card's before/after report still runs
`pnpm test:mutation` directly (its `src/` tree need not change); `code-writer.md` and the script header say so.

```text
base   = merge-base(origin/main | --base <ref>, HEAD)
tree   = the working tree as a tree object (temp GIT_INDEX_FILE; tracked + untracked, ignored left out; index untouched)
diff   = git diff --name-only base tree -- 'src/lib/*.ts' 'src/actions/*.ts'   (a CLAUDE.md there is no hit, r1 #2)
empty  → "mutation: CI only, no src/lib or src/actions change", exit 0, Stryker never starts
mutate = each changed *.ts; <x>.test.ts stands for <x>.ts; src/lib/prisma.ts and deleted files dropped;
         empty after that → the whole layer (stryker.config.mjs `mutate`)
key    = tree:src + tree: stryker.config.mjs vitest.stryker.config.mts tsconfig.json package.json pnpm-lock.yaml
         + mutate list
reports/mutation-gate.txt has the key → repeat its line and exit code, "(reused)"; --force runs again
else   → pnpm exec stryker run [--mutate <list>] | tee; record key, exit, line. No score line on the subset:
         - "with 0 mutant(s)" (type-only, r1 #1) → the whole layer once, same call: "…, no mutant in <list>"
         - mutants, "No tests were executed" (r2 #1) → no fallback: "? % on <list>, no test reaches it", exit 1
line   = "mutation: <score> % on <list | src/lib + src/actions> (ran|reused), src <tree7>"
exit   = Stryker's; no score line (or NaN) → "?" and exit 1, whatever Stryker exited
```

- **The bar** is Stryker's own `break: 70` (unchanged config), read **on the changed-file subset**: the card is
  held to 70 % on its own code, stricter than CI's whole-layer read (r1 cost: `todos.ts` alone scores 75.00 %
  against 92.84 % for the layer; a file of 1–2 mutants fails on its first survivor, and the card then hardens its
  tests). CI's `mutation` job is not touched and still holds every PR to 70 % on the whole layer.
- **Once per tree**: the key is the working tree, not HEAD, so code-writer's run before its commit is the run the
  green gate and the reviewer reuse. A review-pass fix that changes `src/` (any file) runs it once more.
- **Independence** (r1 cost): the reviewer reuses the score code-writer's run recorded, so locally only one run
  stands behind it; CI's whole-layer job is the independent check, and `--force` lets the reviewer rerun on doubt.
- **PR evidence**: the gate's `mutation:` line goes verbatim into the PR body (tdd-loop Report, work-next Exit),
  so a skipping card says "mutation: CI only, no src/lib or src/actions change".
- `dev-lead.md:55` ("mutation ≥ 70" in the plan template) stays: still true on the subset, and the file is B1.101's.

Prototype (scratchpad, bash 3.2): smoke 15 ok / 0 FAIL; against a skeleton that keeps today's rule (whole layer,
every call) 1 ok / 14 FAIL (MG11 holds on both: a config change runs again either way). Mutants M1–M15 of the
script (no reuse, key without configs, no test→source, diff vs HEAD, base not merge-base, reuse exit 0, prisma kept,
`--force` ignored, deleted kept, any path a hit, no fallback, no-score passes, tsconfig out of the key, fallback on
any no-score, untested not named): 15/15 killed. r2 #1 live, on a `--shared` clone in the scratchpad: an untracked
`src/lib/zz-untested.ts` (one function, no test) → 7 mutants, "No tests were executed", "mutation: ? % on
src/lib/zz-untested.ts, no test reaches it (ran)", exit 1, 14 s, no fallback. Real Stryker on this worktree
(macOS, 1 run, load ≈ 2.6), the proto
with `--base be888ff^`: 7 mutants of `src/lib/complete-all-label.ts` in 16 s (100.00 %), the same call again
"(reused)" in 1 s; `pnpm test:mutation` on the whole layer: 668 mutants of 28 files in 222 s (92.84 %). r1 #1
live: an untracked type-only `src/lib/zz-types.ts` (`export type ZzProbe = string;`, deleted right after, never
staged; r2's proto, whose line then said "no test reaches") → 0 mutants, "No tests were executed", then the whole
layer in the same call: 92.84 %, exit 0, 208 s (r3 names it "no mutant in src/lib/zz-types.ts").

**Expected saving, E7 batch 2** (today a run does ≥ 3 whole-layer runs: code-writer, green gate, reviewer):

| Card | Touches                      | Today        | After                  | Saved at load 2.6 |
| ---- | ---------------------------- | ------------ | ---------------------- | ----------------- |
| B7.4 | `src/components`, `page.tsx` | 3 × 668 muts | 0 (CI-only line)       | ≈ 11 min          |
| B7.5 | `src/lib/title-count.ts`     | 3 × 668 muts | 1 subset run, 2 reuses | ≈ 10.5 min        |
| B7.6 | one component                | 3 × 668 muts | 0                      | ≈ 11 min          |

At batch 1's load (29–45 on 8 CPUs, 3 runs × 4 Stryker workers each) a whole-layer run is slower by an
unmeasured factor, so the saving per run is ≥ 11 min and plausibly 30–45 min `[unverified]`; with no Stryker in
B7.4/B7.6 the container load should also drop. Batch 2 measures it (Acceptance 4).

**`scripts/CLAUDE.md` is in** (round 3): B1.98, which held it, merged (#306, 6da952c) and is merged here (17ccd2b);
B1.101's plan (local branch `chore/B1.101-sync-ready-pr`, round 2) does not list it; `next-task.sh --check B1.100`
after the merge: no overlap. Two rows, appended after `pr-step-smoke.sh`, unchanged neighbours. `dev-lead.md`,
`agent/run.sh`, `agent/run-smoke.sh` are B1.101's: not touched.

Tier: `scripts/agent/tier.sh` → **high** (`.claude/`); interactive, so the lead's `approve` gate holds. `config-change-approved`
added at draft (card acceptance; `.claude/` is protected). Dev-lead writes `scripts/` and `.claude/` here
(interactive tooling card, as B1.95/B1.98).

## Files

| File                                  | Change                                                                              | Why                |
| ------------------------------------- | ----------------------------------------------------------------------------------- | ------------------ |
| `scripts/mutation-gate.sh`            | new: the rule above; header = usage, rule, output                                   | Acceptance 1, 2, 3 |
| `scripts/mutation-gate-smoke.sh`      | new: MG1–MG15 on a throwaway repo with a `pnpm` shim                                | Test line          |
| `.claude/agents/code-writer.md`       | step 4: the script, not `pnpm test:mutation` (D-13 report excepted); Report         | Acceptance 1       |
| `.claude/skills/tdd-loop/SKILL.md`    | step 4 green gate: the script (reuses code-writer's run); Report: its line          | Acceptance 1, 3    |
| `.claude/agents/reviewer.md`          | diff-review gate run: the script (reuses unless `src/` changed); paste line         | Acceptance 1       |
| `.claude/skills/review-loop/SKILL.md` | re-verify after a fix: the script instead of "mutation if … changed"                | Acceptance 1       |
| `.claude/skills/work-next/SKILL.md`   | Exit: the `mutation:` line in the PR evidence                                       | Acceptance 3       |
| `scripts/CLAUDE.md`                   | rows `mutation-gate.sh [--base <ref>] [--force]`, `mutation-gate-smoke.sh` MG1–MG15 | guide              |
| `backlog/work/B1.100/*`               | plan, review, pr-body                                                               | pipeline           |

## Interfaces touched

`scripts/mutation-gate.sh [--base <ref>] [--force]` — exit 0 pass or skip, 1 below the bar or no score line,
2 usage / no merge-base. Writes only `reports/mutation-gate.txt` (git-ignored `/reports`) and Stryker's own reports.
No env var, no config change; `stryker.config.mjs`, `package.json`, `.github/workflows/ci.yml` unchanged.

## Verification

`mutation-gate-smoke.sh` is in no CI job (CI's `mutation` job runs Stryker itself): run with `/bin/bash` (3.2).

- Red `test(scripts): B1.100 mutation-gate-smoke probes the local mutation rule (red)` on a skeleton commit
  `chore(scripts): B1.100 skeleton` (today's rule): "1 ok, 14 FAIL".
- Green `chore(scripts): B1.100 local mutation runs once, only on a src/lib or src/actions change`: "15 ok, 0 FAIL".
- Live, this worktree: the script → CI-only line, exit 0, < 5 s; `--base be888ff^` → runs on
  `src/lib/complete-all-label.ts` once, then "(reused)" in < 5 s. On a `--shared` clone in the scratchpad (never
  the worktree): a type-only `src/lib/*.ts` → "no mutant in …", whole layer, exit 0; an untested function → "no test
  reaches it", exit 1.
- `hook-smoke.sh` "749 probes OK" (RP1–RP10 still read the edited prompts) and `pnpm test` "298 passed (298)" at
  17ccd2b (origin/main 6da952c merged), the same after; `pnpm lint && pnpm typecheck` 0; `check-plan-scope.sh`, `check-agent-frontmatter.sh` OK;
  `next-task.sh --check B1.100` no overlap; CI green (its `mutation` job unchanged).

## Work breakdown

| Step | Role     | Produces        | Commit                                                                                     |
| ---- | -------- | --------------- | ------------------------------------------------------------------------------------------ |
| 1    | dev-lead | skeleton        | `chore(scripts): B1.100 skeleton`                                                          |
| 2    | dev-lead | red probes      | `test(scripts): B1.100 mutation-gate-smoke probes the local mutation rule (red)`           |
| 3    | dev-lead | script, prompts | `chore(scripts): B1.100 local mutation runs once, only on a src/lib or src/actions change` |
| 4    | reviewer | diff review     | `docs(backlog): B1.100 review pass N`                                                      |
| 5    | dev-lead | draft PR, label | —                                                                                          |

Closing: `docs/B1.100-done` once batch 2's per-run duration and load are reported; before that,
`docs/B1.100-partial` ("pending E7 batch 2 per-run duration and load", Acceptance 4).

Plan review: · Plan approved by: · Rounds: 1
