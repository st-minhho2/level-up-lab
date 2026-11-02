# B1.32 review

## Plan review (round 1)

The plan under review is `07aad8d docs(backlog): B1.32 plan`. B1.32 is a tooling card with no §, so the contract is
the card's Acceptance (`backlog/plan/E1-todos.md` ### B1.32), which has four clauses:

1. A token without `*` matches only itself.
2. `*` matches within one segment, and `prisma/migrations/*` keeps matching every migration file.
3. Every L1–L6, S1–S15 and C1–C8 probe keeps its verdict.
4. The PR carries `config-change-approved`.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: tooling, so no § and no map row. The plan touches the two compare sites the card names (`plan-scope.sh:36` and `check-plan-scope.sh:25`, both re-read at HEAD), their probe file, the `hooks.md` row the card cites, and `scripts/ci/lib.sh`. No sibling in batch 7 owns any of these. B1.31 (merged, #137) owned `CLAUDE.md` and `src/CLAUDE.md`. B1.33 (`origin/chore/B1.33-hook-smoke-ci` plan) owns `.github/workflows/ci.yml` and `scripts/CLAUDE.md` |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no TypeScript. The only new interface is `plan_lists <path> <token>` (exit 0 or 1, source-only). The hook's stdin, exits 0/2 and the guard's output, exits 0/1 are unchanged, and `plan-files.sh` is untouched                                                                                                                                                                                                                                       |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no `advice.md`. The plan states that spec-analyst and advisor were skipped and that the card's Acceptance is the contract                                                                                                                                                                                                                                                                                                                         |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: the 4 Acceptance clauses map to probes. Clause 1 → L7, L9, L12, L13. Clause 2 → L8, L10, L11, L14. Clause 3 → 86 existing L/S/C probes. Clause 4 → the D-19 label step                                                                                                                                                                                                                                                                                     |
| verification lists exact commands with expected numbers                           | pass: 24 FAIL at the test commit (4 each of L7–L10, L12, L13), 472 OK at the fix, 118 L/S/C ok on bash 5. I reproduced these numbers (below)                                                                                                                                                                                                                                                                                                                     |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: red → fix → review. Each omission has a stated reason: no skeleton, no map row, no `(red)` marker (`verify-red.sh` judges only vitest). Steps 1–2 run in the lead's main session, which round 1 of B1.20 showed is required. Both commit subjects match `lefthook.yml` commit-msg. The PR title `chore(hooks): B1.32 plan-scope globs stay within one segment` (60 characters) matches `pr-step.sh:44`                                                     |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): there is no section, and nothing is ticked. `Plan approved by:` is empty                                                                                                                                                                                                                                                                                                                                                                             |
| no settled D-n contradicted                                                       | pass: D-19 is met because the plan adds the label for `.claude/hooks/`, `.claude/docs/` and `scripts/ci/`, all of which are in `check-config-change.sh` PROTECTED. D-25 is met because the out-of-scope items are named, not built. D-7 is n/a                                                                                                                                                                                                                   |
| `scripts/next-task.sh --check B1.32` on the committed plan says no overlap        | pass: `[next-task] B1.32: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                                                                                                                                                                     |

### Prototype I re-ran

I worked on a scratch copy of `07aad8d` with its own repo, not a worktree. I added the planned rows (`src/app/[id]/*.css`,
`prisma/migrations/*`) and probes L7–L14 after L6, as the plan describes them. The guard probes each revert the
previous commit, then commit one path. I then wrote `plan_lists` from the plan's rule:

- segments are cut with `${x%%/*}`;
- every character except `*` is backslash-escaped;
- a last `*` segment covers the subtree.

Both callers source `scripts/ci/lib.sh`.

| Run                           | /bin/bash 3.2.57                                     | `node:24-bookworm` bash 5.2.15       |
| ----------------------------- | ---------------------------------------------------- | ------------------------------------ |
| probes, HEAD code             | 24 FAIL, 4 each of L7 L8 L9 L10 L12 L13; 94 L/S/C ok | the same 24, 94 ok                   |
| probes plus `plan_lists`      | 0 L/S/C FAIL, 118 ok                                 | 0 L/S/C FAIL, 118 ok                 |
| 42-case table of `plan_lists` | identical verdicts in C and en_US.UTF-8              | identical in C, C.UTF-8, en_US.UTF-8 |

In both copies the only other FAILs were the 3 agent-frontmatter rows, because js-yaml is unresolvable in a copied
`node_modules`. Those rows have nothing to do with this card.

The table compared tokens and paths across these inputs, with the same results under both bash versions and all three
locales:

- bracket tokens: `[id]`, `[...slug]`;
- the other glob characters: `?`, `\`, `@(a|b)`;
- `*` in the first, middle and last segment, and `**`;
- `prisma/migrations/*` against migration files nested 1 and 2 levels down;
- a space in a path, `é`, `$(…)`, and empty strings.

Escaping each character on its own reads the same under bash 3.2 and 5.2.

### Choice of `scripts/ci/lib.sh` (the caller asked)

The choice is sound.

- It is the guards' existing source-only library, and `check-plan-scope.sh` already lives next to it.
- The hook already reaches `scripts/ci/` through `$HERE/../../scripts/ci/plan-files.sh`, so the hook and the matcher
  always come from the same checkout.
- The file defines only `resolve_range`, which has no top-level code, so the four sourcers (`verify-red.sh`,
  `check-config-change.sh`, `check-suppressions.sh`, `check-feat-commits.sh`) see no change.
- If sourcing fails, the hook fails closed: `plan_lists` is undefined, `listed=0`, and the hook exits 2.
- The path is covered by PROTECTED, so it gets the same label.
- No batch-7 sibling lists the file.
- `scripts/CLAUDE.md` has no row for `lib.sh`, so B1.33's file does not go stale.

The alternative, `.claude/hooks/lib.sh`, would make the CI guard depend on the hook library. That is no better.

Verdict: approved (ready for the lead's gate, not approved for build)

### Notes (not reasons)

1. **One Acceptance spelling is not probed.** Clause 1 ("a token without `*` matches only itself") is pinned only
   for `[ ]`. I built a mutant that escapes only `[` and `]`. It passes L12 and L13, and with it
   `plan_lists src/app/xy.ts 'src/app/x?.ts'` exits 0. No planned probe contains `?`, so that mutant survives the
   whole block. One plan row such as `src/app/x?.ts` with a hook probe `src/app/xy.ts` → 2 would pin it. That probe
   is red at HEAD on both bash versions, so the red count would rise by 4. This is optional, because the plan's rule
   ("every character but `*` escaped") already covers `?`.
2. **Build notes for step 2.**
   - Cut segments with parameter expansion or `read -r`. Unquoted word splitting would let a `*` segment expand
     against the current directory's files.
   - Make the end-of-token test on the token text. My first draft's `[[ -n "$t" ]]` test let a trailing-slash token
     `src/a.ts/` match `src/a.ts`. That is harmless, but it is outside the stated rule.
   - Update the `scripts/ci/lib.sh` header comment ("Resolves the commit range…") and the B1.20 block header in
     `hook-smoke.sh` ("literally, then as a glob"). Both are in files the plan already lists.
3. **The CFR date is slightly off.** `hook-smoke.sh` and `plan-scope.sh` were also changed by #132 (B1.20), #124
   (B1.24) and #99 (B1.23), all merged on 2026-11-01. A `fix(` title would therefore count within the window until
   2026-11-15, not 11-13. It would still count once, since k counts distinct repair PRs. The `chore(` choice and its
   stated cost stand.
4. **The plan is long.** It runs 69 lines against `planning.md`'s ≈ 40. B1.20 (63 lines) and B1.24 (64 lines) were
   approved at that length.
5. **The branch is 2 commits behind `origin/main`.** `ae9dcf6` (#137) and `96d6d3e` (#139) touch only `CLAUDE.md`,
   `src/CLAUDE.md` and `backlog/`, none of the plan's files.

### Out of scope → follow-up (D-25)

- `scripts/metrics/plan-deviations.sh:35` still uses the old literal-then-glob rule. The plan already names this.
- `scripts/next-task.sh:134` (`--check`) still uses the two-way glob. Input: plan A lists `src/app/[id]/page.tsx` and
  plan B lists `src/app/i/page.tsx`. The test `[[ "$a" == "$t" || "$a" == $t || "$t" == $a ]]` prints `overlap`, so
  it reports a false overlap. This errs on the conservative side and is not a regression.
- `.claude/agents/dev-lead.md:44-45` still says column 1 holds "repo paths or globs" without the new rule. Input: a
  plan row `src/lib/todo-?.ts` will refuse `src/lib/todo-a.ts` after this card. That fails closed, but the guide does
  not say so.
- If B1.32 merges after B1.33, `scripts/CLAUDE.md`'s hook-smoke row ("L1–L6") will miss L7–L14. B1.33's plan already
  routes this case to a follow-up.

## Plan review (round 2)

The plan under review is `e05a85f docs(backlog): B1.32 plan round 2 (review r1 note: ? probe L15, CFR window date)`.
That commit changes only `plan.md`: `git show --stat e05a85f` lists 1 file, 11 lines added and 11 removed. The approach,
the Files list, the interfaces and the work breakdown are the ones round 1 reviewed. Only the probe set, the expected
numbers and the CFR date moved.

Round-1 notes:

1. Resolved. The `?` gap is closed by a fixture row `src/app/x?.ts` and hook probe L15 `src/app/xy.ts` → 2. I re-ran
   it on the scratch copy:
   - With the HEAD matcher plus all planned probes, L15 FAILs 4 times on both bash versions.
   - My escape-only-`[ ]` mutant still matches (`plan_lists src/app/xy.ts 'src/app/x?.ts'` → 0), so L15 kills it.
2. Not adopted, and not required: the build notes on segment splitting, the end-of-token test and the two header
   comments still apply to step 2.
3. Resolved. The CFR date is now 2026-11-15, citing #99, #124 and #132 (all merged 2026-11-01). That matches
   `git log origin/main --since=2026-10-19` on the four code files.

`origin/main` moved by four commits: #137 and #139 (B1.31), and #138 and #140 (B1.33).

- `git diff HEAD origin/main` on the plan's 5 code and doc files is empty.
- `git merge-tree --write-tree HEAD origin/main` merges clean.
- #138 adds `scripts/hook-smoke.sh` as a step in CI's `test` job, which runs bash 5 with a depth-1 checkout. The
  B1.32 PR's probes will therefore also run there. The new guard probes L9–L11 go through `cps`, which unsets
  `GITHUB_HEAD_REF` and `GITHUB_BASE_REF`, the same path that L4–L6 and C1–C8 took to a green `test` run on #138.
- B1.36 and B1.37, filed in #140, will edit `hook-smoke.sh` (the review-gate block, and `cps`). Both are Open, not
  Doing, so `--check` does not count them. Whichever of them starts after B1.32 merges must rebase onto its L7–L15.
  B1.37's `cps` change will cover L9–L11 with no extra work.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: the Files list is unchanged from r1, and only the `hook-smoke.sh` cell gained `x?.ts`. On `origin/main`, nothing changed in the plan's files                                                                                                                                                                          |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): unchanged. The only new interface is `plan_lists <path> <token>`, which exits 0 or 1                                                                                                                                                                                                                            |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no `advice.md`, and the plan states that spec-analyst and advisor were skipped                                                                                                                                                                                                                               |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 4 Acceptance clauses. Clause 1 is now pinned by L7, L9, L12, L13 and L15                                                                                                                                                                                                                                              |
| verification lists exact commands with expected numbers                           | pass: reproduced on the scratch copy. On both /bin/bash 3.2.57 and `node:24-bookworm` bash 5.2.15, the HEAD matcher gives 28 FAIL (4 each of L7, L8, L9, L10, L12, L13, L15, 94 L/S/C ok) and `plan_lists` gives 0 L/S/C FAIL (122 ok). Both copies also had 3 environment-only agent-frontmatter FAILs (js-yaml), as in r1 |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: unchanged from r1. Step 1 now produces L7–L15 with 28 FAIL                                                                                                                                                                                                                                                            |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): there is no section. `Plan approved by:` is empty                                                                                                                                                                                                                                                               |
| no settled D-n contradicted                                                       | pass: D-19 (label), D-25 (out-of-scope items are named, not built). D-7 is n/a                                                                                                                                                                                                                                              |
| `scripts/next-task.sh --check B1.32` on the committed plan says no overlap        | pass: `[next-task] B1.32: no overlap with any Doing or Review card` (exit 0), re-run after `git fetch`                                                                                                                                                                                                                      |

Verdict: approved (ready for the lead's gate, not approved for build)

Notes (not reasons):

- The plan is still 69 lines, which is the r1 length and has precedent.
- The prose line for L13–L15 is long but passed the pre-commit prettier check.

Out of scope → follow-up (D-25), updated:

- Unchanged from r1: `scripts/metrics/plan-deviations.sh:35`, `scripts/next-task.sh:134` and
  `.claude/agents/dev-lead.md:44-45`, with the same inputs as in round 1.
- `scripts/CLAUDE.md`'s hook-smoke row on `origin/main` (#138) now reads "`[ ]` rows L1–L6". After this card that row
  misses L7–L15. Input: `git show origin/main:scripts/CLAUDE.md | grep hook-smoke`.
  - B1.33 is merged, so no batch-7 sibling owns that file any more.
  - The lead may add that one cell to Files at the gate, or leave it to the follow-up that B1.33's plan named.
    Either way it is not a reason to change this plan.

## Diff review (pass 1)

The diff under review is `084bccb..89ee611`: the red commit `084bccb test(hooks): B1.32 plan-scope probes for rows with
and without *` and the fix `89ee611 fix(hooks): B1.32 plan-scope globs stay within one segment`. This is a tooling card
with no §, so the contract is the card's Acceptance. All probes ran on clones under `$TMPDIR`. Nothing in the tree was
edited.

### Commands (last line of each)

| Command                                        | Result                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                    | `All matched files use Prettier code style!`. The 1 warning is pre-existing, in `src/components/todo-form.tsx:23`, which this diff does not touch                                                                                                                                                                           |
| `pnpm typecheck`                               | exit 0                                                                                                                                                                                                                                                                                                                      |
| `pnpm test`                                    | `Tests  202 passed (202)`                                                                                                                                                                                                                                                                                                   |
| `pnpm test:e2e`                                | `43 passed (1.0m)`                                                                                                                                                                                                                                                                                                          |
| `pnpm test:mutation`                           | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                                                                                                                                                                                                                                              |
| `check-suppressions.sh`                        | `OK: no new suppressions`                                                                                                                                                                                                                                                                                                   |
| `check-config-change.sh`                       | exit 1 locally, because there is no label env. With `CONFIG_CHANGE_APPROVED=true` it exits 0 and lists the 4 protected files. PR #141 carries `config-change-approved`                                                                                                                                                      |
| `check-feat-commits.sh`                        | `OK: no feat commit touches tests`                                                                                                                                                                                                                                                                                          |
| `check-ac-coverage.sh`                         | `OK: every criterion of a shipped section has a test`                                                                                                                                                                                                                                                                       |
| `check-spec-sections.sh`                       | `OK: sections cited: 1 … 22`                                                                                                                                                                                                                                                                                                |
| `check-features-map.sh`                        | `OK`                                                                                                                                                                                                                                                                                                                        |
| `check-plan-scope.sh`                          | `OK: chore/B1.32-plan-scope-glob stays inside the approved plan of B1.32`                                                                                                                                                                                                                                                   |
| `check-backlog.sh`                             | `OK: README matches the cards`                                                                                                                                                                                                                                                                                              |
| `verify-red.sh B1.32`                          | `no 'test(<pkg>): B1.32 … (red)' commit`. This is expected and stated in the plan: `verify-red.sh` judges only vitest files. The red is proven by hook-smoke below                                                                                                                                                          |
| `hook-smoke.sh` at `084bccb`, /bin/bash 3.2.57 | `hook-smoke: FAILURES above`. 28 FAIL, 4 each of L7 L8 L9 L10 L12 L13 L15, as the plan predicts                                                                                                                                                                                                                             |
| `hook-smoke.sh` at `89ee611`, /bin/bash 3.2.57 | `hook-smoke: 476 probes OK`, of which 122 are plan-scope, check-plan-scope and plan-files probes                                                                                                                                                                                                                            |
| `hook-smoke.sh` at `89ee611`, bash 5.2.15      | Run in `node:24-bookworm`, on both a full clone and a `--depth 1` clone, with no global git identity. 122 L/S/C ok. The only FAILs are the 3 agent-frontmatter rows that need js-yaml (no `node_modules` in the container). The other probes absent next to bash 3.2 are the role path-guard rows that those same rows feed |
| `git diff --stat main...HEAD`                  | 8 files, +381 −12                                                                                                                                                                                                                                                                                                           |

### Checklist

- **Acceptance 1.** A token without `*` matches only itself: L7, L9, L12, L13 and L15 pass on both bash versions. I also
  ran a 34-case table of `plan_lists` on 3.2 (C, en_US.UTF-8) and 5.2 (C, C.UTF-8). Every case behaves as the rule
  says: `?`, `\`, `@(a|b)`, `[id]`, a space, `'`, `$`, `é` and invalid UTF-8 bytes all name themselves. The only
  surprises were my own `**` guesses (see note 2).
- **Acceptance 2.** `*` stays within one segment (L8, L10, L14). `prisma/migrations/*` covers nested files (L11), and
  `prisma/migrations` and `prisma/migrationsX/a` do not match.
- **Acceptance 3.** Every L1–L6, S1–S15 and C1–C8 probe keeps its verdict on 3.2 and 5.2.
- **Acceptance 4.** PR #141 carries the `config-change-approved` label (`gh pr view 141`).
- **No test weakened.** `git log --first-parent --no-merges 084bccb..HEAD -- '*.test.*' e2e/ scripts/hook-smoke.sh` is
  empty, and there are no merges in `main..HEAD`.
- **Diff matches the plan.** All 8 changed files are in the plan's Files. The only interface is
  `plan_lists <path> <token>`, which exits 0 or 1, as planned.
- **Invariants.** There is no `src/`, `prisma/` or `e2e/` change, no secret and no suppression. The features map is n/a.
- **Would a test fail if one changed line were reverted?** I tried 7 single-line reverts or mutants on copies, and every
  one is killed:

  | Line reverted or mutated                | Probes that fail                                                              |
  | --------------------------------------- | ----------------------------------------------------------------------------- |
  | `plan-scope.sh:37` back to the old rule | L7 L8 L12 L13 L15                                                             |
  | `check-plan-scope.sh` back to `084bccb` | L9 L10                                                                        |
  | `check-plan-scope.sh:26` glob-only      | L5 L11                                                                        |
  | `lib.sh:24` subtree line deleted        | L11                                                                           |
  | `lib.sh:30` end test replaced by `true` | L14 L15                                                                       |
  | escape dropped                          | L1 L5 L7 L11 L12 L13 L15                                                      |
  | `scripts/ci/lib.sh` missing             | the hook fails closed: exit 2 on listed paths, with "line 12: … No such file" |

The caller asked about four spots:

1. **The revert steps in CI.** `gs` passes its own `-c user.name/user.email`, so `revert --no-edit` needs no global
   identity. The bash 5 runs above had none. L11's exit 0 proves all three reverts landed, because a failed revert
   would leave `[slug]`, `i/` or `a/b/` in the diff. A `--depth 1` checkout does not matter, because the fixtures are
   new repos. CI's `test` job, on `origin/main`, exports no `HEAD_SHA` or `BASE_SHA`; only `guards` does.
   - With both SHAs exported, hook-smoke now shows 30 check-plan-scope FAILs (`exit 128`) instead of the 18 that
     B1.37's card cites. The extra 12 are L9–L11 × 4. That is B1.37's existing bug reaching the new probes, not a
     regression in this card. B1.37's Acceptance ("the Test command prints OK") covers them unchanged; only its
     "18 FAIL" count goes stale.
2. **`plan_lists` returning 1 under `set -e`.** Errexit is ignored for every command in an `&&` list except the last,
   and for everything inside a function called there. The while loop's status of 1 inside `if …; fi` did not stop the
   script on either bash: a minimal script printed `survived listed=1` on 3.2 and 5.2. L5 also proves it in place,
   because the last token `prisma/migrations/*` fails for `src/app/[id]/page.tsx` and the guard still exits 0.
3. **The `hooks.md` row.** It matches the code: only `*` is a wildcard, it matches within one segment, a last segment of
   exactly `*` covers the subtree, and a token without `*` names only itself. The wording "a last segment `*`" could
   be read as "a last segment containing `*`". L12 and L13 pin the actual rule (`*.css` is one segment), so this is
   note 1, not a finding.
4. **Sourcing `scripts/ci/lib.sh` from the hook.**
   - The hook and `lib.sh` resolve from the same `$HERE` checkout, as `plan-files.sh` already does. The names do not
     collide with `.claude/hooks/lib.sh` (`json_field`, `block`, `common_dir`, `repo_rel`), and `lib.sh` has no
     top-level code.
   - With the file missing, the hook blocks every card-branch write (exit 2). `check-plan-scope.sh` exits non-zero
     under `set -e`.
   - I found no layout where the hook fails open. Non-card branches already exit 0 before line 37.

The branch merges into `origin/main` with no conflict: `git merge-tree --write-tree HEAD origin/main` exits 0.
`origin/main` (#137–#140) touches none of the 5 code and doc files.

### Findings

None blocking. There is no regression, no broken Acceptance line and no failing existing probe.

### Notes (not reasons)

1. `hooks.md`: "a last segment `*`" could say "a last segment that is exactly `*`".
2. A token `src/**` used to match the whole subtree. It now matches one segment (`src/a` → 0, `src/a/b` → 1), which
   follows from "only `*` is a wildcard" and is the stated rule. No Files token on any `origin/*` plan uses `**`, `?`,
   `[`, `\`, or a `*` that crosses `/` outside `backlog/` and `prisma/migrations/*`. So no in-flight plan changes
   verdict.

### Out of scope → follow-up (D-25)

These are proposed ids for `dev-lead` to file in the closing PR. Each carries over from the plan reviews, with its
proving input.

- **B1.39** — `scripts/metrics/plan-deviations.sh:35` keeps the literal-then-glob rule. Input: a merged PR whose plan
  lists `src/app/[id]/page.tsx` and whose diff has `src/app/i/page.tsx` is not counted as a deviation.
- **B1.40** — `scripts/next-task.sh:134` `--check` uses a two-way glob. Input: plan A lists `src/app/[id]/page.tsx`
  and plan B lists `src/app/i/page.tsx`, and `--check` prints a false overlap. This fails conservative.
- **B1.41** — The docs do not state the new rule:
  - `.claude/agents/dev-lead.md:44-45` says "repo paths or globs". Input: a row `src/lib/todo-?.ts` now refuses
    `src/lib/todo-a.ts`.
  - The `scripts/CLAUDE.md` hook-smoke row on `origin/main` says L1–L6. Input:
    `git show origin/main:scripts/CLAUDE.md | grep hook-smoke`.
  - Note 1's wording can go in the same card.
- No card needed: B1.37's "18 FAIL" becomes 30 once B1.32 merges (input:
  `HEAD_SHA=$(git rev-parse HEAD) BASE_SHA=$(git rev-parse HEAD) scripts/hook-smoke.sh`). Whoever starts B1.37
  updates the count.

Verdict: ready for PR

Riskiest unfalsified: `plan_lists` under a locale I did not run. I ran C, C.UTF-8 and en_US.UTF-8, but not a non-UTF-8
multibyte locale such as a Shift-JIS `LANG`. There, `${ps:0:1}` could split a character differently from how `==`
matches it.
