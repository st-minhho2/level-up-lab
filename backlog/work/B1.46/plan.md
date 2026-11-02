# B1.46 plan — Layer rules checked in CI with dependency-cruiser (tooling)

Approach: `dependency-cruiser` 18.6.0 (2026-10-11, 22 days old; 18.7.0 is exactly 14) as an exact dev dependency;
`.dependency-cruiser.mjs` holds 8 rules; `pnpm lint:layers` runs them; a step in the required `lint` job fails the merge
on a violation. Tooling: spec-analyst and advisor skipped. Rules (type-only imports followed too):
`prisma-only-in-lib` (`src/lib/prisma.ts`, `@prisma/client` only from `src/lib/`) · `components-no-server-only`
(`src/lib/prisma.ts`, `server-only`) · `revalidate-only-in-actions` (`next/cache`) · `lib-imports-no-upper-layer` ·
`actions-import-no-ui` · `components-import-no-app` (app → components → actions → lib) · `no-circular` ·
`not-to-unresolvable` (a broken `@/` alias would make every rule vacuous). The config joins `check-config-change.sh`'s
protected list: else an unattended run could loosen a rule with no label and a low tier (D-19, D-28).

Not covered: a component reaching Prisma _through_ a lib module (`reachable` rules take no `viaNot` in 18.6.0, and
every component reaches Prisma through its Server Action). `next build` in the required `e2e` job still fails on that.

Pre-plan runs (7570921, scratch copy): today's tree 0 violations, 80 modules, 191 deps, 0.9 s · red: base + a
`src/components/probe.tsx` importing `@/lib/prisma` → eslint 0, prettier 0, tsc 0 (no static gate catches it) ·
lockfile `--lockfile-only`: +178/−0 lines, 21 packages, no existing entry changed. CI cost ≈ +3 s on `lint`
[unverified until the PR run]; the hotfix lane runs it too (it is lint).

## Files

| File                                | Change                                                               |
| ----------------------------------- | -------------------------------------------------------------------- |
| `package.json`                      | devDependency `"dependency-cruiser": "18.6.0"`; script `lint:layers` |
| `pnpm-lock.yaml`                    | `pnpm add -D --save-exact dependency-cruiser@18.6.0` only            |
| `.dependency-cruiser.mjs`           | the 8 rules above                                                    |
| `.github/workflows/ci.yml`          | `lint`: layer step after `pnpm lint` (block below)                   |
| `scripts/ci/check-config-change.sh` | `PROTECTED` += `\.dependency-cruiser\..*`                            |
| `backlog/work/B1.46/plan.md`        | plan                                                                 |
| `backlog/work/B1.46/probe.sh`       | red evidence: one forbidden import per rule, in a `$TMPDIR` copy     |
| `backlog/work/B1.46/review.md`      | reviews                                                              |
| `backlog/work/B1.46/pr-body.md`     | PR body                                                              |

## Interfaces touched

```yaml
"lint:layers": "depcruise src --config .dependency-cruiser.mjs"     # package.json scripts
- name: Layer rules hold (dependency-cruiser, B1.46)                 # ci.yml, job lint
  # In lint, not a new job: the ruleset requires lint, so a violation blocks the merge.
  if: ${{ !cancelled() }}
  run: pnpm lint:layers
```

No `src/` change. `check-config-change.sh` arguments, output and exit codes unchanged.

## Verification (in the card worktree)

```bash
pnpm install --frozen-lockfile && git diff --stat origin/main -- pnpm-lock.yaml   # OK · +178/−0
pnpm lint:layers                 # "no dependency violations found (80 modules, 191 dependencies cruised)", exit 0
bash backlog/work/B1.46/probe.sh # 11 probes (8 rules, 3 variants) each exit 1 naming its rule; worktree untouched
pnpm lint && pnpm typecheck && pnpm test   # green, unchanged counts
# check-config-change.sh, label false, diff touching .dependency-cruiser.mjs → exit 1; label true → exit 0
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
# PR CI: lint → "Layer rules hold" green, its duration in the PR body
```

## Work breakdown

| Step | Role / skill        | Produces                                      | Commit                                              |
| ---- | ------------------- | --------------------------------------------- | --------------------------------------------------- |
| 1    | lead's main session | dependency (dev-lead's guard refuses)         | `chore(deps): B1.46 add dependency-cruiser 18.6.0`  |
| 2    | lead's main session | config, script, CI step, protected list       | `ci(scripts): B1.46 dependency-cruiser layer rules` |
| 3    | lead's main session | probe.sh + its run (11/11 caught)             | `docs(backlog): B1.46 layer probes`                 |
| 4    | reviewer            | diff review (D-25: widening → follow-up card) | `docs(backlog): B1.46 review …`                     |

No skeleton, no map row, no `test(` commit: no test file (`verify-red.sh` judges test files); the red is the
pre-plan base run above, the green is probe.sh after step 2. PR: `scripts/pr-step.sh`,
`config-change-approved` (D-19: `.github/`, `scripts/ci/`). Guides naming the protected list
(`.claude/docs/git-workflow.md`, `scripts/CLAUDE.md`) are the orchestrator's after the batch.

Plan review: pending · Plan approved by: · Rounds: 1
