## Item

B1.46 — Layer rules checked in CI with dependency-cruiser (tooling, no spec section)

- spec: none — tooling (D-27, D-28, D-29); no `src/` change
- test: `bash backlog/work/B1.46/probe.sh origin/main` — red, 1/14 forbidden imports caught (P13, by tsc); `bash backlog/work/B1.46/probe.sh` — green, 14/14 caught, control pass; this PR's `lint` job runs "Layer rules hold" green
- acceptance: `dependency-cruiser` 18.6.0 exact dev dependency (lead's approval with the autonomous-delivery plan); rules for the layers of `CLAUDE.md` "Architecture in one pass"; the required `lint` job fails on a violation; today's tree has none; `config-change-approved` (D-19: `.github/`, `scripts/ci/`)

## Plan

### B1.46 plan — Layer rules checked in CI with dependency-cruiser (tooling)

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

#### Files

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

#### Interfaces touched

```yaml
- name: Layer rules hold (dependency-cruiser, B1.46)
  # In lint, not a new job: the ruleset requires lint, so a violation blocks the merge.
  if: ${{ !cancelled() }}
  run: scripts/ci/check-layers.sh
```

`scripts/ci/check-layers.sh` (no arguments; depcruise's report on stdout; exit 0 clean, 1 any violation).
`check-config-change.sh` arguments, output and exit codes unchanged.

#### Verification (in the card worktree)

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

#### Work breakdown

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

## Map delta

None: tooling card, no `spec/features-map.md` row.

## Review

`/review-loop`: 1 pass of 3, verdict ready for PR, 0 findings, so no dispositions. Non-blocking notes: "Rounds: 1" counts the lead's rounds only (dev-lead.md), so it stays; the `# PR CI` line of this body is fixed; the client rule does not watch `@prisma/client` (only `src/lib/prisma.ts` imports it today) → follow-up candidate for the closing PR (D-25).

### Diff review (round 1)

Diff reviewed: `origin/main...df23849` (build commits `30cf86c chore(deps)`, `df23849 ci(scripts)`), draft PR #156,
label `config-change-approved`. Tooling card: the contract is the card's Acceptance plus D-19, D-27, D-28. P14's
round 2 defect is fixed: `probe()` now counts the control only on a `PASSED` verdict, and `check()` returns `FLAGGED`
when the gate fails for another rule.

#### Command results (run by the reviewer in the card worktree, last line each)

| Command                                                   | Result                                                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                          | `Done in 1.4s using pnpm v10.24.0`                                                                                  |
| `pnpm lint`                                               | `All matched files use Prettier code style!`                                                                        |
| `pnpm typecheck`                                          | `tsc --noEmit`, exit 0                                                                                              |
| `pnpm test`                                               | `Test Files 33 passed (33)` · `Tests 202 passed (202)`                                                              |
| `pnpm test:e2e`                                           | `43 passed (1.5m)`                                                                                                  |
| `pnpm test:mutation`                                      | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                                      |
| `check-suppressions.sh`                                   | `OK: no new suppressions`                                                                                           |
| `check-config-change.sh` (range 7570921..df23849)         | exit 1 unlabelled; exit 0 labelled, listing both `.dependency-cruiser*` files, `ci.yml`, both `scripts/ci/` files   |
| `check-feat-commits.sh`                                   | `OK: no feat commit touches tests`                                                                                  |
| `check-ac-coverage.sh`                                    | `OK: every criterion of a shipped section has a test`                                                               |
| `check-spec-sections.sh`                                  | `OK: sections cited: 1 … 22`                                                                                        |
| `check-features-map.sh`                                   | `OK`                                                                                                                |
| `check-plan-scope.sh` · `check-backlog.sh`                | `OK: chore/B1.46-depcruise stays inside the approved plan of B1.46` · `OK: README matches the cards`                |
| `scripts/verify-red.sh B1.46`                             | `no 'test(<pkg>): B1.46 … (red)' commit`: expected, there is no test file (plan: the red is `probe.sh origin/main`) |
| `scripts/ci/check-layers.sh`                              | `no dependency violations found (80 modules, 191 dependencies cruised)` and `(75 modules, 139 …)`, exit 0, 2.5 s    |
| `bash backlog/work/B1.46/probe.sh`                        | `probe: 14/14 caught, control pass`, exit 0, 56 s; P15 `exit 1 unlabelled, 0 labelled` for both files               |
| `git diff --numstat origin/main...HEAD -- pnpm-lock.yaml` | `178 0`; 21 new packages, none `requiresBuild`                                                                      |
| `git diff --stat main...HEAD`                             | 11 files, +761 −1                                                                                                   |
| PR #156 CI at df23849                                     | lint, typecheck, test, e2e, guards, semgrep pass; mutation pending. Step "Layer rules hold" success, 2 s            |

#### Checklist

- AC coverage: n/a (no §). Each Acceptance clause has evidence: the exact dev dependency (`package.json`, lockfile
  +178/−0), the rules (8 direct + 1 reachability), the required `lint` job fails on a violation (P1–P13 each caught
  naming its rule), today's tree clean (above), the label is on the PR.
- No test weakened: `git log origin/main..HEAD -- '*.test.*' e2e/` is empty; there are no merges in the range.
- Every changed file is in `plan.md`'s Files table (11 of 11); `check-plan-scope.sh` agrees.
- Interfaces: the CI step is the plan's block verbatim; `check-layers.sh` takes no arguments and exits 0/1;
  `check-config-change.sh` only gains `\.dependency-cruiser.*`.
- Zod, Prisma placement, raw SQL, migration: n/a (nothing under `src/`, `prisma/`, `e2e/`).
- No secret, no suppression; features map: no row (tooling).
- Revert probe: each config line has a probe that turns red when it is reverted (P1–P13 per rule and target, P14 for
  the client config's `tsPreCompilationDeps: false`, which yields 10 violations when true, P6 for the second
  `|| rc=1`, P15 for the protected-list pattern, red at `origin/main`).
- Extra adversarial imports, on a copy at the scratchpad's `rv/`: `.prisma/client` from a component →
  `not-to-unresolvable`; `@prisma/client/runtime/library` → `prisma-only-in-lib`; `next/cache.js` from `src/app` →
  `revalidate-only-in-actions`; a component's dynamic `import('@/lib/todos')` and `export * from '@/lib/todos'` →
  `components-reach-db-only-through-actions`; `import { type Todo } from '@/lib/todos'` passes (erased under
  `isolatedModules`, correct). `next/dist/esm/…/revalidate` from `src/lib` and a `'use server'` file in
  `src/components` pass, both declared under the plan's "Not covered".

#### Findings

None blocking.

Observations (not findings, no change requested in this PR):

- The plan footer still says `Rounds: 1` after three plan rounds (raised in round 2).
- `pr-body.md`'s copied Verification block shows `### PR CI: …` where the plan has `# PR CI: …` inside the code
  fence; the copy step demoted a comment as if it were a heading.
- The client rule's targets are `src/lib/prisma.ts` and `server-only`, not `@prisma/client`: a component reaching a
  future lib module that imports `@prisma/client` directly (and not `prisma.ts`) passes. No lib module other than
  `prisma.ts` imports `@prisma/client` today, so nothing fires.

Verdict: ready for PR

Riskiest unfalsified: the CI run's own cruise counts (80/191 and 75/139) could not be read, because the run's logs are
unavailable while `mutation` is pending; the step's green is checked only by its 2 s duration and success.

## Checklist

- [x] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [x] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**` (no test file, no `feat(` commit).
- [x] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 % (n/a: no section, no `src/` change).
- [x] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config changed (`.github/workflows/ci.yml`, `scripts/ci/`, `.dependency-cruiser*`) with label `config-change-approved` (D-19, lead-approved plan).
- [x] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed (n/a).
- [x] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated (n/a: no map row; metrics are the batch measurement; no known mistake repeated).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
