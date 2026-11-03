# B1.66 review

## Plan review (round 1)

| Check                                                                          | Result                                                                                                                                                    |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the card                                     | pass: Files lists only `backlog/work/B1.66/plan.md`, `review.md` (card Acceptance: only `backlog/work/B1.66/*`)                                           |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass: n/a, no `src/`, script or config change                                                                                                             |
| plan follows `advice.md` or states the deviation                               | pass: tier 0, no advice by rule (dev-lead Loop 2), stated in the Approach line                                                                            |
| ≤ 7 criteria, every Then measurable                                            | pass: card Acceptance has one criterion; retention numbers are concrete (30 days, newest triple, named files)                                             |
| verification lists exact commands with expected results                        | pass: `tier.sh` → `low` (ran: `low`); `plan-files.sh --run B1.66` → 0 (ran now: exit 3 = no approval commit yet, expected before step 3); diff-stat scope |
| work breakdown with convention subjects                                        | pass: plan → review → approval as `docs(backlog): B1.66 …`; skeleton/red/green n/a for tier 0 (no code)                                                   |
| `Lead approves spec` box                                                       | pass: n/a, no spec section (D-27); I wrote no approval line                                                                                               |
| no settled D-n contradicted                                                    | pass: D-19 (`config-change-approved` on the follow-up), D-27 approval path; no change to run.sh here                                                      |
| `scripts/next-task.sh --check B1.66`                                           | pass: "[next-task] B1.66: no overlap with any Doing or Review card"                                                                                       |

Card Acceptance against `scripts/agent/run.sh` (cited lines checked):

- `runs/<issue>/` today: `.jsonl/.err/.exit` per attempt (lines 16, 127, 142), `stopped` (249), `lock/pid` (185, 190): matches.
- `runs/check-binary/` (261) and `verified-versions` append-only (279): matches. Probe worktree is
  `.worktrees/check-binary-XXXXXX` (259) removed at 208/276: matches.
- Default root line 23 and compose volume comment at `.devcontainer/runner/docker-compose.yml:78`: matches.
- `grep -nE 'prune|retention|-mtime'` hits only line 207 (probe worktree): matches; the card says line 192, the plan's
  wording is the current truth.
- Retention rule states what is kept, for how long, who removes (lead, by hand, `--prune [--dry-run]`); names B1.73.

Non-blocking notes for B1.73 (cost stated for the lead, not a change request):

1. Rule 1 says a log cited in `work/<card>/` is kept, rule 4 says a cited log is listed in `runs/<issue>/keep`, but no
   step says who writes `keep` (the runner at comment time, line 200, or the lead). If nobody does, a cited log older
   than 30 days that is not the newest triple gets pruned. B1.73's card must name the writer.
2. Rule 2 "30 days after the issue closes" needs a `gh` lookup per issue; offline, `--prune` must keep rather than
   delete (B1.73 probe).
3. B1.73 is not filed yet (closing lane files it); the id was free at review time (`grep -rn B1.73 backlog` → plan only).

Verdict: approved

(approved = ready for the D-27 approval line; not written by the reviewer.)
