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
