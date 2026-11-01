## Item

B1.27 — next-task reads board titles with quote characters (tooling, no spec section)

- spec: none — tooling (`scripts/next-task.sh`, `scripts/next-task-smoke.sh`)
- test: `scripts/next-task-smoke.sh` W22–W26 — red before (21 ok, 5 FAIL), green after (26 ok, 0 FAIL)
- acceptance: pick, `--claim`, `--check`, `--list` work with a lone `'`, a lone `"`, a paired `"…"` and a backslash in any title; `--list` prints the title as written; W1–W21 stay green; label `config-change-approved` (D-19: `scripts/next-task.sh`)

## Plan

Approach: replace the three `echo "$x" | xargs` trims (`scripts/next-task.sh:73-75`, the only `xargs` in the script)
with a pure-bash `trim` (parameter expansion, bash 3.2-safe), so a cell keeps every character between its first and
last non-blank one. Today `xargs` parses quotes and backslashes: a lone `'` or `"` exits 1 (`xargs: unterminated
quote`) in every mode for every card; a paired `"…"` and a `\` are stripped. Tooling card: spec-analyst and advisor
skipped; the card's Acceptance is the contract. Out of scope: `scripts/CLAUDE.md` still says "W1–W16" for the smoke
(stale since B1.18's review; a package-guide card owns it); `--list` keeps its 30-character title cut.

## Files

| File                           | Change                                                              |
| ------------------------------ | ------------------------------------------------------------------- |
| `scripts/next-task.sh`         | `trim()` replaces the six `xargs` calls on lines 73–75              |
| `scripts/next-task-smoke.sh`   | probes W22–W26 on a second throwaway repo whose titles carry quotes |
| `backlog/work/B1.27/plan.md`   | plan                                                                |
| `backlog/work/B1.27/review.md` | reviews                                                             |

## Interfaces touched

None: `scripts/next-task.sh [--list | --claim <card> | --check <card>]` keeps arguments, output and exit codes.

```bash
trim() { local s="$1"; s="${s#"${s%%[![:space:]]*}"}"; printf '%s' "${s%"${s##*[![:space:]]}"}"; }
```

Smoke mechanics: W1–W21 untouched (their fixture keeps plain titles: one bad title would fail them all). A second repo
`$TMP/q` with bare origin `$TMP/q.git`, the same `gh` shim; cards in `backlog/plan/E8-quotes.md`, all eligible.
W22 rows `B8.1 say "all done"` (step 1) and `B8.2 back\slash path` (step 2) → `--list` exit 0 and prints both titles
as written, matched with `grep -F` (HEAD: exit 0, prints `say all done`, `backslash path`) · then push rows `B8.3 todo's date` and
`B8.4 a lone " quote` · W23 `--list` exit 0, all four titles as written, no `xargs` in the output · W24 pick → exit 0,
`B8.1 backlog/plan/E8-quotes.md` · W25 `--claim B8.3` → exit 0, `B8.3 may start` · W26 worktree on `feat/B8.4-q` with a
plan listing `src/lib/q.ts`, `--check B8.4` → exit 0, `no overlap`. W23–W26 at HEAD: exit 1, `xargs: unterminated quote`.

## Verification (in the card worktree, /bin/bash 3.2 — the only bash here)

```bash
scripts/next-task-smoke.sh | tail -1   # test commit: "[next-task-smoke] 21 ok, 5 FAIL" (W22–W26); fix: "26 ok, 0 FAIL"
bash -n scripts/next-task.sh && grep -c xargs scripts/next-task.sh   # fix: 0
scripts/next-task.sh --list | head -1; scripts/next-task.sh --claim B1.27   # header row; "this checkout holds feat/B1.27-next-task-quotes"
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
```

## Work breakdown

| Step | Role / skill | Produces                   | Commit                                                    |
| ---- | ------------ | -------------------------- | --------------------------------------------------------- |
| 1    | dev-lead     | W22–W26 red (5 FAIL)       | `test(scripts): B1.27 next-task probes for quoted titles` |
| 2    | dev-lead     | `trim()`, 26 ok            | `fix(scripts): B1.27 next-task trims cells without xargs` |
| 3    | reviewer     | diff review in `review.md` | `docs(backlog): B1.27 review`                             |

No `(red)` marker on step 1: CI's `verify-red.sh --auto` judges only vitest files. PR via `scripts/pr-step.sh`, label
`config-change-approved` (D-19: `scripts/next-task.sh`).

Plan review: approved, round 1 (4 costs in review.md: inner spaces kept, `grep -F` titles, W26 crash-only, header W22–W26) · Plan approved by: lead (session reply "approve"), 2026-11-01 · Rounds: 1

## Map delta

None: tooling card, no feature row.

## Review

pending

## Checklist

- [x] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the fix commit.
- [x] Every `AC-§.n` of the section is a test title — n/a, tooling.
- [x] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected path `scripts/next-task.sh` → label `config-change-approved`.
- [x] Migrations — n/a.
- [ ] `docs/metrics.md` per-card row filled at closing.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
