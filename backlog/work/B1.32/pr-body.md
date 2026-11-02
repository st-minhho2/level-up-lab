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

pending

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the fix commit; the fix commit touches no probe.
- [ ] n/a: no `AC-§.n`, no `src/` change (mutation unchanged).
- [ ] No new suppression; protected config change carries `config-change-approved` (D-19: `.claude/`, `scripts/ci/`).
- [ ] n/a: no migration.
- [ ] n/a: no map row; `docs/metrics.md` per-card row at closing.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
