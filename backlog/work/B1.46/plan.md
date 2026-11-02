# B1.46 plan — Layer rules checked in CI with dependency-cruiser (tooling)

Round 3 (plan review r1: 4 reasons; r2: 1). `dependency-cruiser` 18.6.0 (2026-10-11, 22 days old; 18.7.0 is exactly 14) as
an exact dev dependency. `scripts/ci/check-layers.sh` runs two cruises and fails if either finds a violation; a step in
the required `lint` job runs it, so a violation blocks the merge. CI calls the protected script, not a `package.json`
script (unprotected), and every `.dependency-cruiser*` file joins `check-config-change.sh`'s list (a known-violations
baseline included): loosening a rule needs the label and makes the tier high (D-19, D-28). Tooling: no analyst/advisor.

- `.dependency-cruiser.mjs`, every direct import, type-only included: `prisma-only-in-lib` (`src/lib/prisma.ts`,
  `@prisma/client`) · `components-no-server-only` (`src/lib/prisma.ts`, `server-only`) · `revalidate-only-in-actions`
  (`next/cache`, and the deep `next/dist/…/revalidate.js`) · `lib-imports-no-upper-layer` · `actions-import-no-ui` ·
  `components-import-no-app` (app → components → actions → lib) · `no-circular` · `not-to-unresolvable` (a broken `@/`
  alias would make every rule vacuous).
- `.dependency-cruiser-client.mjs`: `components-reach-db-only-through-actions`, `reachable` from `src/components/` to
  `src/lib/prisma.ts` / `server-only`, `src/actions/` not followed (a Server Action is a network call), type-only not
  followed (erased). Catches a component importing `listTodos` from `@/lib/todos`, which no direct rule sees.

Costs: all of `next/cache` is banned outside `src/actions` (`unstable_noStore` in `src/lib` would need a plan). Both
component rules apply to the 3 Server Components in `src/components` (`remaining-count`, `todo-search-form`,
`todo-filter-nav`): none reads data today; one that must gets it as props from `page.tsx`. Not covered: a `'use server'`
file outside `src/actions`; a `'use client'` file under `src/app`; a deep `next/dist` path other than `revalidate.js`.
Lockfile +178/−0 lines, 21 packages, no existing entry changed. CI ≈ +3 s on `lint` (two cruises 1.5 s locally)
[unverified until the PR run]; the hotfix lane runs it too (it is a lint).

## Files

| File                                | Change                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `package.json`                      | devDependency `"dependency-cruiser": "18.6.0"`, nothing else             |
| `pnpm-lock.yaml`                    | `pnpm add -D --save-exact dependency-cruiser@18.6.0` only                |
| `.dependency-cruiser.mjs`           | the 8 direct rules                                                       |
| `.dependency-cruiser-client.mjs`    | the reachability rule                                                    |
| `scripts/ci/check-layers.sh`        | runs both cruises from the top level; exit 1 if either fails             |
| `scripts/ci/check-config-change.sh` | `PROTECTED` += `\.dependency-cruiser.*`                                  |
| `.github/workflows/ci.yml`          | `lint`: step after `pnpm lint` (block below)                             |
| `backlog/work/B1.46/probe.sh`       | P1–P15 in a `$TMPDIR` copy of `<ref>`: red at `origin/main`, green after |
| `backlog/work/B1.46/plan.md`        | plan                                                                     |
| `backlog/work/B1.46/review.md`      | reviews                                                                  |
| `backlog/work/B1.46/pr-body.md`     | PR body                                                                  |

## Interfaces touched

```yaml
- name: Layer rules hold (dependency-cruiser, B1.46)
  # In lint, not a new job: the ruleset requires lint, so a violation blocks the merge.
  if: ${{ !cancelled() }}
  run: scripts/ci/check-layers.sh
```

`scripts/ci/check-layers.sh` (no arguments; depcruise's report on stdout; exit 0 clean, 1 any violation).
`check-config-change.sh` arguments, output and exit codes unchanged.

## Verification (in the card worktree)

```bash
pnpm install --frozen-lockfile; git diff --numstat origin/main -- pnpm-lock.yaml   # OK · "178 0 pnpm-lock.yaml"
scripts/ci/check-layers.sh   # "no dependency violations found" (80 modules, 191 deps) and (75, 139); exit 0
bash backlog/work/B1.46/probe.sh            # "probe: 14/14 caught, control pass", exit 0
bash backlog/work/B1.46/probe.sh origin/main  # red: "probe: 1/14 caught, control pass" (P13, tsc), exit 1
pnpm lint && pnpm typecheck && pnpm test    # green; vitest "33 passed (33)", "202 passed (202)"
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
# PR CI: lint → "Layer rules hold" green, its duration in the PR body
```

Probes (each named in `probe.sh`'s header and output): P1–P13 one forbidden import per rule and variant, P14 a
type-only control that must pass, P15 a range touching only one `.dependency-cruiser*` file → `check-config-change.sh`
exit 1 unlabelled, 0 labelled. Measured on 7570921: red 1/14 caught (P13 by tsc), control pass, 2 min 30 s; in a
copy with both configs, 0 violations (80 modules, 191 deps; 75, 139) and P1–P13 caught each naming its rule.

## Work breakdown

| Step | Role / skill        | Produces                                      | Commit                                               |
| ---- | ------------------- | --------------------------------------------- | ---------------------------------------------------- |
| 1    | lead's main session | probe.sh, red run above                       | with this plan (`docs(backlog): B1.46 plan round 2`) |
| 2    | lead's main session | dependency (dev-lead's guard refuses)         | `chore(deps): B1.46 add dependency-cruiser 18.6.0`   |
| 3    | lead's main session | configs, check-layers.sh, protected list, CI  | `ci(scripts): B1.46 dependency-cruiser layer rules`  |
| 4    | reviewer            | diff review (D-25: widening → follow-up card) | `docs(backlog): B1.46 review …`                      |

No skeleton, no map row, no `test(` commit (no test file; `verify-red.sh` judges test files): the red is probe.sh at
`origin/main`, the green probe.sh after step 3. PR: `scripts/pr-step.sh`, `config-change-approved` (D-19: `.github/`,
`scripts/ci/`). Guides naming the protected list or the CI guards (`.claude/docs/git-workflow.md`, `scripts/CLAUDE.md`)
are the orchestrator's after the batch.

Plan review: round 2 changes requested, 1 finding (P14 control could not fail), fixed in round 3 without a third review (dev-lead: ≤ 2 rounds, then the lead) · Plan approved by: lead (session reply "approve"), 2026-11-02 · Rounds: 1
