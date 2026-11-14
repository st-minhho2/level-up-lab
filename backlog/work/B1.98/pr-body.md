## Item

B1.98 — unattended.sh counts a run the lead stopped, ruled on and relaunched as unattended (tooling, no spec section)

- spec: none — tooling (`scripts/metrics/unattended.sh`, its smoke, `docs/metrics.md`'s definition); no `src/` change
- test: `scripts/metrics-smoke.sh` M50–M53 (new) and M30, M34 (now read the commit inside the window). Red / green:
  pending.
- acceptance: pending
- risk tier: medium (`scripts/agent/tier.sh`; no CI-protected path); label `config-change-approved` per the card (D-19)

## Plan

Copied from `backlog/work/B1.98/plan.md` (approved 7d30cb0).

### B1.98 plan — unattended.sh counts a stopped run and a human commit as attended (tooling, no §)

Approach: the shared timeline filter gets a 7th TSV column, a runner comment's outcome: the first word of its
`- outcome: ` line (run.sh:253 `$out`, so `error:max_turns`, `limit:error_max_turns`, `ended`; not the bold header,
which keeps only `${out%%:*}`), `?` if the line is missing, `-` for any other event (review r1 #3). `unattended.sh`
then derives two lists inside the window it already has (strictly after `labeled`, strictly before `ready`, the bounds
`messages` uses), printed as two new last columns:

```bash
stops="$(… issue + PR rows … | awk -F'\t' -v l="$labeled" -v r="$ready" '
  $1 == "commented" && $6 == "runner" && $7 != "ready" && (l == "-" || $2 > l) && (r == "-" || $2 < r)
    { s = s (s == "" ? "" : ",") $7 } END { print s }')"   # gate-high is class gate-high, never "runner"
human="$(awk … '$1 == "committed" && $6 != "agent-run" && <same window> { s = s "," $5 }' "$TMPD/p")"   # sha7s
verdict: yes only when messages 0, stops empty and human empty (pending and closed-without-ready unchanged)
```

A stop is any run.sh outcome but `ready` (`ended`, `limit`, `error`, a medium/low `gate`, which D-27 would have
passed, so it was refused); a runner `ready` comment is no stop (run.sh posts it seconds after the wrapper's ready).
The commit rule is `no-rework.sh`'s trailer rule moved to the window. `no-rework.sh` takes the identical filter (its
comment says "kept identical"); it never reads column 7, so its output is unchanged (M35–M38 prove it).

Prototype (scratchpad copy of origin/main be888ff, live gh, bash 3.2) — the acceptance re-runs:

| Batch             | Today | After   | What changes                                                                                   |
| ----------------- | ----- | ------- | ---------------------------------------------------------------------------------------------- |
| E6 b2 275–277     | 3/3   | **1/3** | #276 `ended`; #277 `ended,ended` + 1bb65dd (the D-36 merge repair)                             |
| E5 b1 207 214 215 | 3/3   | 1/3     | #207 (B5.2) `ended` + e65ffc9 (a merge of origin/main, no trailer); #215 (B5.3) `ended` (D-31) |
| E5 b2 223–225     | 3/3   | 3/3     | unchanged: no stop, no commit without the trailer                                              |
| E6 b1 261–263     | 3/3   | 3/3     | unchanged                                                                                      |
| E7 292–294        | 3/3   | 3/3     | unchanged (read for the orchestrator, not acceptance)                                          |

Costs, accepted by the lead:

- E5 batch 1 drops to 1/3, so E5's "two batches > 50 %" no longer holds as recorded. #207 is `no` on its `ended`
  stop alone; e65ffc9 (author `level-up-lab runner`, no trailer) is the riskiest reading: the run's own merges on the
  same PR (bad1d8f, 7465491) carry `Agent-Run:`, so it was made outside a run (RUNNER_CHILD unset) `[unverified]`.
- A run whose checkout lacks lefthook's prepare-commit-msg hook (B1.57: needs `pnpm install` there) commits without
  the trailer and reads `no`; `no-rework.sh` already has that dependency.

Overlap with **B1.87** (Open, unclaimed, no plan; review r1 #2): this card rewrites `docs/metrics.md` row 28 and the
`scripts/CLAUDE.md` `metrics/unattended.sh` and `metrics-smoke.sh` rows (M1–M53). B1.87's Acceptance ("M1–M49",
row 28 "names `touches`") can then no longer be met as written, and its Test grep `M1–M43|R1–R15` stays red on
R1–R15 alone. B1.87 keeps the `pr-step.sh` row, R1–R16 and the mistake-log row; the lead re-scopes its card text
(Acceptance to M1–M53 and no row 28 item) in a filing-lane edit, or rules otherwise; this card does not edit B1.87.

Carried from B1.95: the `agent/run.sh` row names its behind check. The closing lane (branch `docs/B1.98-done`, title
`docs(backlog): B1.98 done`) also runs `card-status.sh B1.95 Done "…"` and drops B1.95's README row in its one commit.

Tier: `scripts/agent/tier.sh` → **medium** (no CI-protected path; the brief's "high" does not hold); interactive, so
the lead's `approve` gate holds. The card asks for `config-change-approved` (D-19 needs it only for a protected
path): added. Dev-lead writes `scripts/` and `docs/` here (interactive, as B1.95).

#### Files

| File                            | Change                                                                                                                                                                                                                                                               | Why                   |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `scripts/metrics/unattended.sh` | column 7 in TL; `stops`, `human_commits` columns; verdict; header (definition, output)                                                                                                                                                                               | Acceptance            |
| `scripts/metrics/no-rework.sh`  | TL identical to unattended's (column 7 unused)                                                                                                                                                                                                                       | filter kept identical |
| `scripts/metrics-smoke.sh`      | M50–M53; M30 flips (its 02:50 trailer-less commit is inside the window), M34 share 2/6; full-row probes gain `\t-\t-`; `runner()` bolds `${1%%:*}` as run.sh does; header                                                                                            | Test line             |
| `docs/metrics.md`               | row 28 only, two cells rewritten, the others byte-identical, unaligned (B1.97): cell 3 (metric) appends "no runner stop and no PR commit without `Agent-Run:`"; cell 7 (method) restates `unattended.sh`'s header: B1.83 window, `touches`, `stops`, `human_commits` | Acceptance            |
| `scripts/CLAUDE.md`             | rows: `metrics/unattended.sh`, `metrics-smoke.sh` M1–M53, `agent/run.sh` behind check (B1.95), each within its column width                                                                                                                                          | Acceptance, B1.95     |
| `backlog/work/B1.98/*`          | plan, review, pr-body                                                                                                                                                                                                                                                | pipeline              |

#### Interfaces touched

`unattended.sh` output: TSV `issue card pr labeled ready messages unattended touches stops human_commits` (`stops`:
comma-separated `- outcome:` words, e.g. `ended,error:max_turns`; `human_commits`: comma-separated sha7s; `-` none).
Timeline filter (both scripts): column 7 added, columns 1–6 unchanged. Columns 1–8 keep their meaning; a reader of 8
columns by position still works. `no-rework.sh` output unchanged. No flag, env var or exit code.

#### Verification

`metrics-smoke.sh` is in no CI job: run with `/bin/bash` (3.2) at each step and in the diff review.

- Red `test(scripts): B1.98 metrics-smoke probes a stopped run and a human commit (red)`: "35 ok, 16 FAIL" (M30–M31,
  M33–M34, M39, M41, M44–M53; M50/M51 read `yes`). Prototype: holds.
- Green `chore(scripts): B1.98 unattended counts a runner stop and a commit without Agent-Run`: "51 ok, 0 FAIL".
- Live: `unattended.sh 275 276 277` → `unattended 1/3 = 33.3 % (pending 0)`; the four other batches as the table;
  `no-rework.sh` on the same PRs byte-identical before/after.
- `hook-smoke.sh` "749 probes OK" and `pnpm test` "298 passed (298)" at be888ff, the same after (review r1 #4; neither
  reads these scripts); `pnpm lint && pnpm typecheck` 0; `check-plan-scope.sh`, `check-backlog.sh` OK;
  `next-task.sh --check B1.98` no overlap; CI green.

#### Work breakdown

| Step | Role     | Produces        | Commit                                                                                 |
| ---- | -------- | --------------- | -------------------------------------------------------------------------------------- |
| 1    | dev-lead | red probes      | `test(scripts): B1.98 metrics-smoke probes a stopped run and a human commit (red)`     |
| 2    | dev-lead | scripts, docs   | `chore(scripts): B1.98 unattended counts a runner stop and a commit without Agent-Run` |
| 3    | reviewer | diff review     | `docs(backlog): B1.98 review pass N`                                                   |
| 4    | dev-lead | draft PR, label | —                                                                                      |

Plan review: approved, round 2 · Plan approved by: lead, 2026-11-14 · Rounds: 1

## Map delta

None: tooling card, no `spec/features-map.md` row.

## Review

pending

## Evidence

- AC met: pending
- tier: medium
- plan deviations: pending
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the change commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %. (n/a: no section)
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config changed with label `config-change-approved`.
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed. (n/a)
- [ ] `spec/features-map.md` row moved (n/a); `docs/metrics.md` per-card row (n/a: tooling); mistake-log: no repeat.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
