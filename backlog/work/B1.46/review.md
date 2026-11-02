# B1.46 review

## Plan review (round 1)

Plan reviewed: `1585274 docs(backlog): B1.46 plan`. This is a tooling card with no §. The contract is the card's
Acceptance (`backlog/plan/E1-todos.md` ### B1.46) plus D-19, D-25, D-27 and D-28. I re-ran the prototype from the plan
(dependency-cruiser 18.6.0, typescript 5.9.3, src copied from 7570921, which is identical to this worktree's `src/`
by `diff -r`) and got the plan's numbers back:

- `no dependency violations found (80 modules, 191 dependencies cruised)`, exit 0, 0.6 s.
- The lockfile delta is +178/−0 with exactly 21 new package entries. No `requiresBuild`. The engines field accepts
  Node 24.
- The ruleset requires `lint, typecheck, test, e2e, mutation, semgrep, guards` (`gh api …/rulesets`), so a step in
  `lint` really does block a merge.
- Baseline at 1585274: `pnpm test` gives 33 files and 202 tests passed.
- `check-plan-scope.sh` gives `OK: … changes only paperwork`, and `check-backlog.sh` gives `OK`.
- The sibling plans (B1.43, B1.45) share no file with this one.

Probes, on a copy at `$TMPDIR/…/scratchpad/rv1`, with the plan's config:

| Probe                                                                                 | Result                                       |
| ------------------------------------------------------------------------------------- | -------------------------------------------- |
| component, `import type { Todo } from '@prisma/client'`                               | error prisma-only-in-lib                     |
| component, `import('@/lib/prisma')` / `require('../lib/prisma')`                      | error prisma-only-in-lib + components-no-…   |
| component, `.prisma/client`                                                           | error not-to-unresolvable                    |
| component, `next/cache.js`                                                            | error revalidate-only-in-actions             |
| `src/lib/p5.ts`, `import { unstable_noStore } from 'next/cache'`                      | error revalidate-only-in-actions (reason 2a) |
| component, `import { listTodos } from '@/lib/todos'` (reaches prisma + server-only)   | **no error** (reason 1)                      |
| component, `next/dist/server/web/spec-extension/revalidate` (`revalidatePath` itself) | **no error** (reason 2c)                     |
| `src/app/p6/client.tsx`, `'use client'; import 'server-only'`                         | **no error** (reason 2c)                     |

| Check                                                                             | Result                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass (n/a): tooling, so no § and no map row. Every row maps to a clause of the Acceptance or to D-19/D-28. Nothing under `src/`                                                                                                            |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no TypeScript in `src/`. The script and the CI step are pasted                                                                                                                                                                 |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no `advice.md`, and the plan states that the quick tier skips the advisor. The Acceptance asks for "a CI job"; the plan uses a step in the required `lint` job and gives the reason (verified: the ruleset requires `lint`) |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: four Acceptance clauses, each with a verification line                                                                                                                                                                               |
| verification lists exact commands with expected numbers                           | fail: the `check-config-change.sh` line is a comment and cannot tell the new pattern apart from the rest of the diff. "unchanged counts" has no number. The red half is not reproducible (reason 4)                                        |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: no §, so no skeleton, red/green or map row, and the plan says so. Every subject matches lefthook's Conventional Commits regex                                                                                                        |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): there is no section. `Plan approved by:` is empty                                                                                                                                                                              |
| no settled D-n contradicted                                                       | pass: D-19 (label), D-25 (widening goes to a follow-up) and D-28 (tier high from `package.json`, lockfile, `.github/`, `scripts/ci/`) are respected. The protected-list rationale has a hole, but that is not a contradiction (reason 3)   |
| `scripts/next-task.sh --check B1.46` says no overlap                              | pass: `[next-task] B1.46: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                               |

### Reasons (numbered)

1. **The "Not covered" paragraph gives the wrong reason and does not mention its own backstop's gaps.**
   - The plan says a component reaching Prisma through a lib module cannot be expressed because `reachable` takes no
     `viaNot`. That is not the limit. I ran a second config: one rule, `from ^src/components/` to
     `^src/lib/prisma\.ts$` / `node_modules/server-only/` with `reachable: true`, plus
     `doNotFollow: ['node_modules', '^src/actions/']` and `tsPreCompilationDeps: false`.
     - On today's tree it reports `no dependency violations found (75 modules, 139 dependencies cruised)` in 0.7 s.
     - It catches `src/components/p4.tsx` importing `{ listTodos } from '@/lib/todos'`, which the plan's 8 rules let
       through.
     - Type-only imports have to stay out of it, because `todo-item.tsx` has `import type { Todo } from '@/lib/todos'`.
       With type-only imports followed, it reports 10 violations.
   - The real cost is somewhere else. `src/components/CLAUDE.md` says the folder holds "client and server" components:
     `remaining-count.tsx`, `todo-search-form.tsx` and `todo-filter-nav.tsx` are Server Components. Under `ts-style.md`
     a Server Component may read through `src/lib`, so a reachable rule would forbid a legitimate future read unless it
     names those files (`pathNot`).
   - The plan should either adopt the rule with that exclusion, or keep the gap and give the true reason.
   - The plan should also say where its backstop stops:
     - The `e2e` job is skipped under the `hotfix` label.
     - `next build` only bundles components that are mounted, so an unmounted `'use client'` file that imports
       `@/lib/todos` builds clean.
2. **Costs the lead approves without seeing them.** Add these to the plan, as costs or under "Not covered":
   - (a) `revalidate-only-in-actions` bans the whole `next/cache` module outside `src/actions`, not only
     `revalidatePath`. `unstable_noStore`, `unstable_cache` and `revalidateTag` in a lib or page read all fail
     (probe p5).
   - (b) `components-no-server-only` also binds the Server Components in `src/components`. None of them may
     `import 'server-only'` to mark itself server-side.
   - (c) Three things are not covered:
     - A `'use server'` action outside `src/actions`. dependency-cruiser cannot read directives, yet the card's Status
       names "mutations only in `src/actions`".
     - A deep import of `next/dist/server/web/spec-extension/revalidate` (probe p2).
     - A `'use client'` file under `src/app/` importing `server-only` (probe p6). `next build` covers this one only if
       the file is mounted.
3. **Protecting the config does not stop a rule being loosened without the label.**
   - The CI step runs `pnpm lint:layers`. That script lives in `package.json`, which is not protected.
     `\.dependency-cruiser\..*` does not match `.dependency-cruiser-known-violations.json` (checked with
     `grep -E`).
   - Trigger: a later PR changes the script to `depcruise src --config .dependency-cruiser.mjs --ignore-known` and
     adds that baseline file. `check-config-change.sh` then exits 0 with no label.
   - D-28 still makes that PR high tier, so the lead's gate holds. But the plan's stated reason ("no label and a low
     tier") is only half true.
   - Fix: either call `pnpm exec depcruise src --config .dependency-cruiser.mjs` directly in `ci.yml`, which is
     protected, and widen the pattern to `\.dependency-cruiser.*`, or state the residual.
4. **The verification cannot fail where it matters.**
   - (a) On this branch's range, `check-config-change.sh` with the label false exits 1 whether or not the new pattern
     exists, because `ci.yml` and `check-config-change.sh` are in the range. Give an exact command over a range that
     touches only `.dependency-cruiser.mjs`. For example, in a `$TMPDIR` clone, a commit on top of step 2 changing only
     that file, then `BASE_SHA=HEAD~1 HEAD_SHA=HEAD CONFIG_CHANGE_APPROVED=false scripts/ci/check-config-change.sh`
     must exit 1, and the base's script on the same range must exit 0.
   - (b) Replace "unchanged counts" with `33 passed (33)` / `202 passed (202)`.
   - (c) Name the 3 probe variants in `probe.sh`.
   - (d) Make the red half reproducible. `probe.sh` should also show the `src/components` → `@/lib/prisma` probe
     passing `pnpm lint`, `pnpm typecheck` and `pnpm test` on the base. Today that evidence exists only as a sentence
     about a scratch copy that will disappear.

Verdict: changes requested

## Plan review (round 2)

Plan reviewed: `4089071 docs(backlog): B1.46 plan round 2`, together with the new `probe.sh`. What happened to each
round 1 reason:

- **r1 #1 (reachability):** addressed. The second config `.dependency-cruiser-client.mjs` adds the reachable rule,
  with `src/actions/` not followed and type-only imports left out.
- **r1 #2 (unstated costs):** addressed. The plan now states:
  - `next/cache` is banned outside `src/actions`;
  - the 3 Server Components in `src/components` fall under both component rules;
  - three things are not covered: a `'use server'` file outside `src/actions`, a `'use client'` file under
    `src/app`, and any deep `next/dist` path other than `revalidate.js`.
- **r1 #3 (unprotected script):** addressed. CI runs the protected `scripts/ci/check-layers.sh`. `package.json` gets
  no script. The pattern widens to `\.dependency-cruiser.*`, which covers both configs and a known-violations
  baseline.
- **r1 #4 (verification):** mostly addressed. P15 isolates the protected-list change on a one-file range. The vitest
  counts are now numbers. The probes are named and are reproducible at `origin/main`. One gap remains: reason 1 below.

What I re-ran:

- The prototype configs on a copy of 7570921's `src`:
  - Clean tree: `main=0 client=0`. The modules and dependencies match the plan (80/191 and 75/139).
  - P6 (`listTodos` from a component): `client=2`, `components-reach-db-only-through-actions`.
  - P8 (deep `revalidate`): `revalidate-only-in-actions`.
  - P14 (type-only `Todo` from `@/lib/todos`): `main=0 client=0`.
  - A lib module importing a component: `lib-imports-no-upper-layer`.
- The red run: `bash backlog/work/B1.46/probe.sh origin/main` → `probe: 1/14 caught, control pass`, exit 1. P13 was caught by tsc, and P15 printed `exit 0 unlabelled` for both files. The run took 5 min 58 s here, against the plan's 2.5 min; three sessions were sharing the machine.

| Check                                                                             | Result                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass (n/a): tooling, so no § and no map row. Each row maps to an Acceptance clause or to D-19/D-28. `scripts/ci/check-layers.sh` is new and already protected by `scripts/ci/.*`                                 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): nothing changes under `src/`. The CI step and the script's contract (no arguments, exit 0/1) are stated                                                                                              |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no `advice.md` (quick tier). "A CI job" became a step in the required `lint` job, and the plan says why                                                                                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: four Acceptance clauses, each with a numbered expectation. Observation: the plan is 84 lines against planning.md's ≈ 40, mostly tables and code blocks. The lead may ask for a split; I do not block on it |
| verification lists exact commands with expected numbers                           | fail: green-mode `probe.sh` reports "control pass" even when `check-layers.sh` flags the control file, so the "14/14 caught, control pass" line cannot catch the regression P14 exists to catch (reason 1)       |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: no § and no test file, so no skeleton, `test(` commit or map row, and the plan says so. Red is `probe.sh origin/main`, green is `probe.sh` after step 3. The subjects pass lefthook's regex                |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): there is no section. `Plan approved by:` is empty                                                                                                                                                    |
| no settled D-n contradicted                                                       | pass: D-19 (label, protected paths), D-25 (follow-ups), D-27/D-28 (high tier from `package.json`, the lockfile, `.github/`, `scripts/ci/`)                                                                       |
| `scripts/next-task.sh --check B1.46` says no overlap                              | pass: `[next-task] B1.46: no overlap with any Doing or Review card` (re-run on 4089071)                                                                                                                          |

### Reasons (numbered)

1. **The P14 control cannot fail in green mode.**
   - In `check()` (`probe.sh:26`), a run is `CAUGHT` only when `check-layers.sh` exits non-zero _and_ its output
     contains the probe's rule name. P14 passes the rule as `none`.
   - `probe()` (`probe.sh:46`) then sets `control=pass` for any verdict starting with `MISSED`, and that includes
     `MISSED (check-layers exit 1)`.
   - Trigger: `.dependency-cruiser-client.mjs` regresses to `tsPreCompilationDeps: true`, which is exactly what P14
     guards against. On today's tree that gives 10 violations (r1). `check-layers.sh` exits 1 on the type-only import
     in `src/components/probe.tsx`, but its output never contains the string `none`.
   - Result: the verdict is `MISSED (check-layers exit 1)`, the output says `P14 control …: pass`, and if P1–P13 and
     P15 are caught, `probe.sh` exits 0.
   - Confirmed: I ran `probe.sh` lines 20–53 and 82–83 against a stub `check-layers.sh` that prints a
     `components-reach-db-only-through-actions` error for `probe.tsx` and exits 1. It printed
     `P14 control (type-only import, as todo-item.tsx does): pass`.
   - Fix: count the control as passing only when the gate itself passes, meaning `check-layers.sh` exits 0 in green
     mode, or eslint and tsc both exit 0 in red mode. For example, have `check()` return a distinct
     `PASSED`/`FLAGGED` verdict and test P14 against `PASSED`. While editing, the plan footer still says
     `Rounds: 1`.

Verdict: changes requested
