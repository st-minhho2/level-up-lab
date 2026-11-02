<!-- Title: chore(hooks): B1.32 plan-scope globs stay within one segment -->

## Item

B1.32 — plan-scope reads a Files token as a glob only where the plan says so (tooling, no spec section)

- spec: none — tooling (`.claude/docs/hooks.md` plan-scope row)
- test: `scripts/hook-smoke.sh` L7–L15 x 4 layouts — red before (28 FAIL: L7–L10, L12, L13, L15 per layout), green after (`hook-smoke: 476 probes OK`)
- acceptance: a token without `*` matches only itself; `*` matches within one path segment and `prisma/migrations/*` keeps matching every migration file; every L1–L6, S1–S15 and C1–C8 probe keeps its verdict; label `config-change-approved` (D-19)

## Plan

Approach: one matcher, `plan_lists <path> <token>`, in `scripts/ci/lib.sh` (the guards' source-only lib, owned by no
batch-7 sibling), sourced by `.claude/hooks/plan-scope.sh` and `scripts/ci/check-plan-scope.sh` in place of B1.20's
`"$X" == "$p" || "$X" == $p` (`plan-scope.sh:36`, `check-plan-scope.sh:25`). Rule: only `*` is a wildcard (`[id]`, `?`, `\`
name themselves, so a token without `*` matches only itself); token and path are compared segment by segment, so `*`
never crosses `/`; a last segment `*` covers the directory below it (`prisma/migrations/*`). Each segment becomes a
pattern with every character but `*` backslash-escaped (no `printf %q`: its output turns to `$'…'` in some locales, and
no `${x//}`: bash 5.2 `patsub_replacement`), so bash 3.2 and 5 read it alike and extglob (`@(`) never applies.
Tooling card: spec-analyst and advisor skipped; the card's Acceptance is the contract. Prototype (scratch copy, /bin/bash
3.2.57): HEAD 28 FAIL of the 36 new probes, fixed 476 OK; 37-case table of the function green on bash 3.2 and 5.2.15
(`node:24-bookworm`, already local) in the C, C.UTF-8 and en_US.UTF-8 locales.
Out of scope (follow-up candidate): `scripts/metrics/plan-deviations.sh:35` keeps the old literal-then-glob rule.

## Files

| File                             | Change                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `scripts/ci/lib.sh`              | add `plan_lists` (the one shared rule)                                         |
| `.claude/hooks/plan-scope.sh`    | source `scripts/ci/lib.sh`; line 36 calls `plan_lists "$REL" "$p"`             |
| `scripts/ci/check-plan-scope.sh` | source `lib.sh`; line 25 calls `plan_lists "$f" "$p"`                          |
| `scripts/hook-smoke.sh`          | B1.20 block: rows `[id]/*.css`, `x?.ts`, `prisma/migrations/*`; L7–L15         |
| `.claude/docs/hooks.md`          | plan-scope row: "only `*` is a wildcard, within one segment; last `*` subtree" |
| `backlog/work/B1.32/plan.md`     | plan                                                                           |
| `backlog/work/B1.32/review.md`   | reviews                                                                        |
| `backlog/work/B1.32/pr-body.md`  | PR body                                                                        |

## Interfaces touched

`plan_lists <path> <token>` → exit 0 covered, 1 not (new, source-only). Hook stdin JSON and exits (0 allow, 2 block),
the guard's output and exits (0, 1), `plan-files.sh` unchanged.
Probes, per layout (`.`, `.worktrees/s`, `.claude/worktrees/n`, `.claude/worktrees/n/.worktrees/b`), after L6 in the
same fixture: hook L7 `src/app/i/page.tsx` → 2 · L8 `src/app/a/b/layout.tsx` → 2 · L12 `src/app/i/x.css` → 2 ·
L13 `src/app/[id]/x.css` → 0 · L14 `src/app/layout.tsx` → 2 · L15 `src/app/xy.ts` → 2 (row `src/app/x?.ts`); guard (revert the previous commit, then commit one path)
L9 `src/app/i/page.tsx` → 1 · L10 `src/app/a/b/layout.tsx` → 1 · L11 `prisma/migrations/1_x/migration.sql` +
`migration_lock.toml` → 0 (also proves the reverts). Red at HEAD: L7–L10, L12, L13, L15 × 4 = 28. All 8 mutants of
`plan_lists` killed in the prototype: no subtree line → L11; no escape → L1, L12, L13; `*` escaped too → L3, L13;
end test `-z "$f"` or `true` → L14; escaping only `[ ]` → L15; quoted pattern or a skipped segment → S1, C1, L1 and more.

## Verification (in the card worktree)

```bash
scripts/hook-smoke.sh | grep -c '^FAIL'   # test commit: 28; tail -1 "hook-smoke: FAILURES above"
scripts/hook-smoke.sh | grep '^FAIL' | sed -E 's/.*  (L[0-9]+) .*/\1/' | sort | uniq -c   # 4 each of L7 L8 L9 L10 L12 L13 L15
scripts/hook-smoke.sh | tail -1           # fix: "hook-smoke: 476 probes OK" (440 + 36); every L1–L6, S1–S15, C1–C8 ok
bash -n .claude/hooks/plan-scope.sh scripts/ci/check-plan-scope.sh scripts/ci/lib.sh scripts/hook-smoke.sh   # silent
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # "OK: … inside the approved plan of B1.32"; OK
```

bash 5: the same `hook-smoke.sh` in `node:24-bookworm` (bash 5.2.15) on a copy of the tree → every L/S/C probe ok
(122); its only FAILs are the 3 agent-frontmatter rows that need `node_modules` (absent in that copy).

## Work breakdown

| Step | Role / skill | Produces                               | Commit                                                             |
| ---- | ------------ | -------------------------------------- | ------------------------------------------------------------------ |
| 1    | main session | L7–L15 probes + fixture rows, 28 FAIL  | `test(hooks): B1.32 plan-scope probes for rows with and without *` |
| 2    | main session | `plan_lists`, both callers, `hooks.md` | `fix(hooks): B1.32 plan-scope globs stay within one segment`       |
| 3    | reviewer     | diff review in `review.md`             | `docs(backlog): B1.32 review`                                      |

Steps 1–2 run in the lead's main session acting as dev-lead via `/work-next` (no `agent_type`; the `dev-lead`
subagent's path-guard refuses these files). No skeleton (no § function, no `NotImplementedError` analogue), no map step
(no `features-map.md` row), no `(red)` marker (`verify-red.sh` judges only vitest files). PR via `scripts/pr-step.sh`,
label `config-change-approved` (D-19: `.claude/`, `scripts/ci/`). PR (squash) title from the batch brief:
`chore(hooks): B1.32 plan-scope globs stay within one segment`. Cost the lead accepts: both lines date from B1.17's #60
(merged 2026-10-30); `change-failure-rate.sh` counts only `fix(`/revert titles, so this repair stays out of the CFR,
as B1.20 (#132) did; a `fix(hooks): …` title would count it until 2026-11-15 (#99, #124, #132 share these files, merged 2026-11-01).

Plan review: approved, round 2 (r1: approved, 0 findings, 2 notes taken into r2; r2: 0 findings, 4 out of scope → follow-up) · Plan approved by: lead (session reply "approve"), 2026-11-02 · Rounds: 1

## Map delta

None: tooling, no `spec/features-map.md` row.

## Review

`/review-loop`: pass 1/3, verdict ready for PR, 0 findings. Plan review: approved at round 2 (r1 approved, its 2 notes
taken into r2). Disposition:

| Pass | #   | Finding                                                                                | Source   | Kind          | Disposition          | Justification                                                                             |
| ---- | --- | -------------------------------------------------------------------------------------- | -------- | ------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| 1    | n1  | hooks.md row could say "a last segment exactly `*`"                                    | reviewer | wording       | out of scope → B1.41 | optional wording; row matches the code                                                    |
| 1    | n2  | a `src/**` token now covers one segment, not the subtree                               | reviewer | behavior note | no change needed     | follows "only `*` is a wildcard"; no plan on any origin/* ref uses `**` outside paperwork |
| 1    | o1  | `scripts/metrics/plan-deviations.sh:35` keeps the old rule                             | reviewer | out of scope  | follow-up B1.39      | D-25                                                                                      |
| 1    | o2  | `scripts/next-task.sh:134` two-way glob, false overlaps                                | reviewer | out of scope  | follow-up B1.40      | D-25; fails conservative                                                                  |
| 1    | o3  | `.claude/agents/dev-lead.md:44-45`, `scripts/CLAUDE.md` hook-smoke row ("L1–L6") stale | reviewer | out of scope  | follow-up B1.41      | D-25; not this card's files                                                               |
| 1    | o4  | B1.37's "18 FAIL" count becomes 30                                                     | reviewer | out of scope  | no new card          | whoever starts B1.37 updates it                                                           |

After merging `origin/main` (clean, 10ee54e): `hook-smoke: 476 probes OK`, check-plan-scope OK, `mark-reviewed.sh` cleared.

### Diff review (pass 1)

The diff under review is `084bccb..89ee611`: the red commit `084bccb test(hooks): B1.32 plan-scope probes for rows with
and without *` and the fix `89ee611 fix(hooks): B1.32 plan-scope globs stay within one segment`. This is a tooling card
with no §, so the contract is the card's Acceptance. All probes ran on clones under `$TMPDIR`. Nothing in the tree was
edited.

#### Commands (last line of each)

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

#### Checklist

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

#### Findings

None blocking. There is no regression, no broken Acceptance line and no failing existing probe.

#### Notes (not reasons)

1. `hooks.md`: "a last segment `*`" could say "a last segment that is exactly `*`".
2. A token `src/**` used to match the whole subtree. It now matches one segment (`src/a` → 0, `src/a/b` → 1), which
   follows from "only `*` is a wildcard" and is the stated rule. No Files token on any `origin/*` plan uses `**`, `?`,
   `[`, `\`, or a `*` that crosses `/` outside `backlog/` and `prisma/migrations/*`. So no in-flight plan changes
   verdict.

#### Out of scope → follow-up (D-25)

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

## Checklist

- [x] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [x] Red commit precedes the fix commit; the fix commit touches no probe.
- [ ] n/a: no `AC-§.n`, no `src/` change (mutation unchanged).
- [x] No new suppression; protected config change carries `config-change-approved` (D-19: `.claude/`, `scripts/ci/`).
- [ ] n/a: no migration.
- [ ] n/a: no map row; `docs/metrics.md` per-card row at closing.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
