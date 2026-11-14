# B1.100 plan — local mutation runs only when src/lib or src/actions changed, once per src/ tree (tooling, no §)

Approach: one new script, `scripts/mutation-gate.sh`, becomes the only local way to run mutation. The three places
that run `pnpm test:mutation` today (`code-writer.md:35`, `tdd-loop/SKILL.md:26`, `reviewer.md:65`) and
`review-loop/SKILL.md:45` call it instead. The script decides; the prompts only call it and paste its last line.

```text
base   = merge-base(origin/main | --base <ref>, HEAD)
tree   = the working tree as a tree object (temp GIT_INDEX_FILE; tracked + untracked, ignored left out; index untouched)
diff   = git diff --name-only base tree -- src/lib src/actions
empty  → "mutation: CI only, no src/lib or src/actions change", exit 0, Stryker never starts
mutate = each changed *.ts; <x>.test.ts stands for <x>.ts; src/lib/prisma.ts and deleted files dropped;
         empty after that → the whole layer (stryker.config.mjs `mutate`)
key    = tree:src + tree:stryker.config.mjs + tree:vitest.stryker.config.mts + mutate list
reports/mutation-gate.txt has the key → repeat its line and exit code, "(reused)"; --force runs again
else   → pnpm exec stryker run [--mutate <list>] | tee; record key, exit, line
line   = "mutation: <score> % on <list | src/lib + src/actions> (ran|reused), src <tree7>"; exit = Stryker's
```

- **The bar** is Stryker's own `break: 70` (unchanged config), read **on the changed-file subset**: the card is
  held to 70 % on its own code. CI's `mutation` job is not touched and still holds every PR to 70 % on the whole layer.
- **Once per tree**: the key is the working tree, not HEAD, so code-writer's run before its commit is the run the
  green gate and the reviewer reuse. A review-pass fix that changes `src/` (any file) runs it once more.
- **PR evidence**: the gate's `mutation:` line goes verbatim into the PR body (tdd-loop Report, work-next Exit),
  so a skipping card says "mutation: CI only, no src/lib or src/actions change".

Prototype (scratchpad, bash 3.2): smoke 12 ok / 0 FAIL; against a skeleton that keeps today's rule (whole layer,
every call) 1 ok / 11 FAIL (MG11 holds on both: a config change runs again either way). Mutants M1–M9 of the script
(no reuse, key without configs, no test→source, diff vs HEAD, base not merge-base, reuse exit 0, prisma kept,
`--force` ignored, deleted kept): 9/9 killed. Real Stryker on this worktree (macOS, 1 run, load ≈ 2.6), the proto
with `--base be888ff^`: 7 mutants of `src/lib/complete-all-label.ts` in 16 s (100.00 %), the same call again
"(reused)" in 1 s; `pnpm test:mutation` on the whole layer: 668 mutants of 28 files in 222 s (92.84 %).

**Expected saving, E7 batch 2** (today a run does ≥ 3 whole-layer runs: code-writer, green gate, reviewer):

| Card | Touches                      | Today        | After                  | Saved at load 2.6 |
| ---- | ---------------------------- | ------------ | ---------------------- | ----------------- |
| B7.4 | `src/components`, `page.tsx` | 3 × 668 muts | 0 (CI-only line)       | ≈ 11 min          |
| B7.5 | `src/lib/title-count.ts`     | 3 × 668 muts | 1 subset run, 2 reuses | ≈ 10.5 min        |
| B7.6 | one component                | 3 × 668 muts | 0                      | ≈ 11 min          |

At batch 1's load (29–45 on 8 CPUs, 3 runs × 4 Stryker workers each) a whole-layer run is slower by an
unmeasured factor, so the saving per run is ≥ 11 min and plausibly 30–45 min `[unverified]`; with no Stryker in
B7.4/B7.6 the container load should also drop. Batch 2 measures it (Acceptance 4).

**`scripts/CLAUDE.md` is out** (B1.98, Doing, plans it; B1.101 may): no row for the two scripts here. Usage and
the probe range MG1–MG12 are documented in the two scripts' headers; the guide rows go to the next card that holds
`scripts/CLAUDE.md` (Waiting on you). `dev-lead.md`, `agent/run.sh`, `agent/run-smoke.sh` are B1.101's: not touched.

Tier: `scripts/agent/tier.sh` → **high** (`.claude/`); interactive, so the lead's `approve` gate holds. `config-change-approved`
added at draft (card acceptance; `.claude/` is protected). Dev-lead writes `scripts/` and `.claude/` here
(interactive tooling card, as B1.95/B1.98).

## Files

| File                                  | Change                                                                      | Why                |
| ------------------------------------- | --------------------------------------------------------------------------- | ------------------ |
| `scripts/mutation-gate.sh`            | new: the rule above; header = usage, rule, output                           | Acceptance 1, 2, 3 |
| `scripts/mutation-gate-smoke.sh`      | new: MG1–MG12 on a throwaway repo with a `pnpm` shim                        | Test line          |
| `.claude/agents/code-writer.md`       | step 4: `scripts/mutation-gate.sh` instead of `pnpm test:mutation`; Report  | Acceptance 1       |
| `.claude/skills/tdd-loop/SKILL.md`    | step 4 green gate: the script (reuses code-writer's run); Report: its line  | Acceptance 1, 3    |
| `.claude/agents/reviewer.md`          | diff-review gate run: the script (reuses unless `src/` changed); paste line | Acceptance 1       |
| `.claude/skills/review-loop/SKILL.md` | re-verify after a fix: the script instead of "mutation if … changed"        | Acceptance 1       |
| `.claude/skills/work-next/SKILL.md`   | Exit: the `mutation:` line in the PR evidence                               | Acceptance 3       |
| `backlog/work/B1.100/*`               | plan, review, pr-body                                                       | pipeline           |

## Interfaces touched

`scripts/mutation-gate.sh [--base <ref>] [--force]` — exit 0 pass or skip, 1 below the bar (or no score line),
2 usage / no merge-base. Writes only `reports/mutation-gate.txt` (git-ignored `/reports`) and Stryker's own reports.
No env var, no config change; `stryker.config.mjs`, `package.json`, `.github/workflows/ci.yml` unchanged.

## Verification

`mutation-gate-smoke.sh` is in no CI job (CI's `mutation` job runs Stryker itself): run with `/bin/bash` (3.2).

- Red `test(scripts): B1.100 mutation-gate-smoke probes the local mutation rule (red)` on a skeleton commit
  `chore(scripts): B1.100 skeleton` (today's rule): "1 ok, 11 FAIL".
- Green `chore(scripts): B1.100 local mutation runs once, only on a src/lib or src/actions change`: "12 ok, 0 FAIL".
- Live, this worktree: the script → CI-only line, exit 0, < 5 s; `--base be888ff^` → runs on
  `src/lib/complete-all-label.ts` once, then "(reused)" in < 5 s.
- `hook-smoke.sh` "749 probes OK" (RP1–RP10 still read the edited prompts) and `pnpm test` "298 passed (298)" at
  4c7d9e4, the same after; `pnpm lint && pnpm typecheck` 0; `check-plan-scope.sh`, `check-agent-frontmatter.sh` OK;
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
