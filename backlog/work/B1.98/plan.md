# B1.98 plan — unattended.sh counts a stopped run and a human commit as attended (tooling, no §)

Approach: the shared timeline filter gets a 7th TSV column, the runner comment's outcome word (`**ended**` → `ended`,
`?` if absent, `-` for any other event). `unattended.sh` then derives two lists inside the window it already has
(strictly after `labeled`, strictly before `ready`, the bounds `messages` uses), printed as two new last columns:

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

Cost for the lead: E5 batch 1 drops to 1/3, so E5's "two batches > 50 %" no longer holds as recorded.

Overlap with **B1.87** (Open, unclaimed, no plan): this card rewrites `docs/metrics.md` row 28's definition cell to
the script's current rule, B1.83's window and `touches` included, and the `scripts/CLAUDE.md` unattended and
metrics-smoke rows (M1–M53). B1.87 keeps the `pr-step.sh` row, R1–R16 and its mistake-log row; its Test line (`M1–M43`
grep) then passes without it. Carried from B1.95: the `agent/run.sh` row names its behind check; this card's closing
lane also sets B1.95 Done.

Tier: `scripts/agent/tier.sh` → **medium** (no CI-protected path; the brief's "high" does not hold); interactive, so
the lead's `approve` gate holds. The card asks for `config-change-approved` (D-19 needs it only for a protected path): added.
Dev-lead writes `scripts/` and `docs/` here (interactive, as B1.95).

## Files

| File                            | Change                                                                                                                        | Why                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `scripts/metrics/unattended.sh` | column 7 in TL; `stops`, `human_commits` columns; verdict; header (definition, output)                                        | Acceptance            |
| `scripts/metrics/no-rework.sh`  | TL identical to unattended's (column 7 unused)                                                                                | filter kept identical |
| `scripts/metrics-smoke.sh`      | M50–M53; M30 flips (its 02:50 trailer-less commit is inside the window), M34 share 2/6; full-row probes gain `\t-\t-`; header | Test line             |
| `docs/metrics.md`               | row 28 definition cell names the two cases (appended text only, unaligned, B1.97)                                             | Acceptance            |
| `scripts/CLAUDE.md`             | rows: `metrics/unattended.sh`, `metrics-smoke.sh` M1–M53, `agent/run.sh` behind check (B1.95), each within its column width   | Acceptance, B1.95     |
| `backlog/work/B1.98/*`          | plan, review, pr-body                                                                                                         | pipeline              |

## Interfaces touched

`unattended.sh` output: TSV `issue card pr labeled ready messages unattended touches stops human_commits` (`stops`:
comma-separated outcome words; `human_commits`: comma-separated sha7s; `-` none). Columns 1–8 keep their meaning; a
reader of 8 columns by position still works. `no-rework.sh` output unchanged. No flag, env var or exit code.

## Verification

`metrics-smoke.sh` is in no CI job: run with `/bin/bash` (3.2) at each step and in the diff review.

- Red `test(scripts): B1.98 metrics-smoke probes a stopped run and a human commit (red)`: "35 ok, 16 FAIL" (M30–M31,
  M33–M34, M39, M41, M44–M53; M50/M51 read `yes`). Prototype: holds.
- Green `chore(scripts): B1.98 unattended counts a runner stop and a commit without Agent-Run`: "51 ok, 0 FAIL".
- Live: `unattended.sh 275 276 277` → `unattended 1/3 = 33.3 % (pending 0)`; the four other batches as the table;
  `no-rework.sh` on the same PRs byte-identical before/after.
- `hook-smoke.sh` OK (count unchanged), `pnpm lint && pnpm typecheck` 0, `pnpm test` unchanged,
  `check-plan-scope.sh`, `check-backlog.sh` OK; `next-task.sh --check B1.98` no overlap; CI green.

## Work breakdown

| Step | Role     | Produces        | Commit                                                                                 |
| ---- | -------- | --------------- | -------------------------------------------------------------------------------------- |
| 1    | dev-lead | red probes      | `test(scripts): B1.98 metrics-smoke probes a stopped run and a human commit (red)`     |
| 2    | dev-lead | scripts, docs   | `chore(scripts): B1.98 unattended counts a runner stop and a commit without Agent-Run` |
| 3    | reviewer | diff review     | `docs(backlog): B1.98 review pass N`                                                   |
| 4    | dev-lead | draft PR, label | —                                                                                      |

Plan review: · Plan approved by: · Rounds: 1
