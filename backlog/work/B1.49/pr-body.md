## Item

B1.49 — Live check of the eligibility rule on a labeled issue (tooling, no §)

- spec: none — tooling (D-27)
- test: `backlog/work/B1.49/live.md` records each command, its exit code and output — red before: no labeled issue had been checked
- acceptance: pending (live run in progress)

## Plan

# B1.49 plan — Live check of the eligibility rule on a labeled issue (tooling)

Round 2 (plan review r1: 2 reasons, 4 notes addressed). Approach: the lead does every GitHub write (file, label,
unlabel, rename, delete, close); the agent runs only the read-only commands below after each step and records command,
exit code and output in `live.md`. Tier quick (no advisor); risk tier low (`backlog/work/B1.49/*` only). While issue A
carries `agent-ready`, nobody runs `scripts/agent/run.sh` (`--poll` would take it): lead step 0. Issue A stays public.

## Files

| File                            | Change                                                     |
| ------------------------------- | ---------------------------------------------------------- |
| `backlog/work/B1.49/plan.md`    | this plan                                                  |
| `backlog/work/B1.49/review.md`  | plan review, diff review of `live.md`                      |
| `backlog/work/B1.49/live.md`    | per step: lead action, command, exit code, output, verdict |
| `backlog/work/B1.49/pr-body.md` | PR body                                                    |

## Interfaces touched

None. Read-only commands (`<A>` = issue number):

```
R1 scripts/agent/eligible.sh <A>                                                  # exit + stdout/stderr
R2 gh api --paginate 'repos/{owner}/{repo}/issues/<A>/events' --jq '.[] | [.id, .event, (.label.name // ""), (.actor.login // "null"), .created_at] | @tsv'
R3 gh api --paginate 'repos/{owner}/{repo}/issues/<A>/timeline' --jq '.[] | [.event, (.label.name // ""), (.actor.login // "null")] | @tsv'
R4 gh api 'repos/{owner}/{repo}/issues/<A>' --jq '[.state, ([.labels[].name] | join(","))] | @tsv'
R5 R2 with ?per_page=1 (one event per page) and ?per_page=100
R6 gh api 'repos/{owner}/{repo}/collaborators/<login>/permission' --jq '[.permission, .role_name] | @tsv'
```

## Steps (lead acts, then the agent runs; pass line; a failed pass line → fix card)

| #   | Lead                                                                                            | Agent            | Pass line                                                                                                                                                                                                                                                                             |
| --- | ----------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | do not run `scripts/agent/run.sh` until step 9 is done                                          | —                | —                                                                                                                                                                                                                                                                                     |
| 1   | `gh issue create --title "B1.49 probe A (throwaway, do not run)" --body "Throwaway for B1.49."` | R1 R2 R4         | R1 exit 1 `not labeled agent-ready`; R2 0 label rows                                                                                                                                                                                                                                  |
| 2   | `gh issue edit <A> --add-label agent-ready`                                                     | R1 R2 R3         | R1 exit 0, labeled by the lead (admin); R2 1 `labeled`                                                                                                                                                                                                                                |
| 3   | `gh issue edit <A> --remove-label agent-ready`                                                  | R1 R2 R4         | R1 exit 1 `not labeled agent-ready`; R2 adds 1 `unlabeled`                                                                                                                                                                                                                            |
| 4   | `gh issue edit <A> --add-label agent-ready`                                                     | R1 R2 R5         | R1 exit 0; R2 labeled, unlabeled, labeled; R5 per_page=1 rows equal per_page=100 rows, `created_at` ascending, last `agent-ready` row `labeled`                                                                                                                                       |
| 5   | `gh label create b149-probe` then `gh issue edit <A> --add-label b149-probe`                    | R2 R3 R4         | R2 adds 1 `labeled b149-probe`                                                                                                                                                                                                                                                        |
| 6   | `gh label edit b149-probe --name b149-probe-renamed`                                            | R2 R3 R4         | R2's step-5 row reads `b149-probe-renamed` (current name): safe. Reads `b149-probe` (name at event time): fail-open (lead labels K `agent-ready`, writer renames it away, triage labels K `y`, `y` renamed to `agent-ready` → R1 0 on the lead's old event) → fix card or D-n request |
| 7   | `gh label delete b149-probe-renamed --yes`                                                      | R2 R3 R4         | record the count of `unlabeled` rows R2 adds and R4's labels; safe either way (R1 reads current labels first): no card                                                                                                                                                                |
| 8   | optional, only with a second (non-write) account: it files issue B; lead adds `agent-ready`     | R1 R6            | R1 exit 1 `author <login> has read (read), needs write`                                                                                                                                                                                                                               |
| 9   | `gh issue close <A>`, then `gh issue edit <A> --remove-label agent-ready` (and B)               | R1 R4 after each | after close R1 exit 0 is the known gap (`run.sh <n>` would run a closed issue, `run.sh:256-258`): follow-up card (D-25), outside Acceptance; after unlabel R1 exit 1, R4 `closed`                                                                                                     |

Recorded once, no lead step: R6 for `ghost` (a deleted actor's login) → `read`, so R1 exits 1; a null actor cannot be
produced live (the `// ""` branch stays covered by the B1.43 smoke only).

## Work breakdown

| Step | Role / skill                        | Produces                                                                                      | Commit                            |
| ---- | ----------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------- |
| 1    | lead acts, dev-lead runs R1–R6      | `live.md` (written per step, committed once after step 9)                                     | `docs(backlog): B1.49 live check` |
| 2    | reviewer (diff review of `live.md`) | `review.md` "Diff review"                                                                     | `docs(backlog): B1.49 review`     |
| 3    | dev-lead                            | `pr-body.md`, draft PR → ready                                                                | `docs(backlog): B1.49 pr body`    |
| 4    | dev-lead, filing lane               | a fix card per failed pass line, own `docs/B1.<n>-card` branch and PR, not in this PR's Files | `docs(backlog): card B1.<n> …`    |

## Verification

`live.md`: steps 1–7 and 9 each with command, exit code, output and pass/fail against the line above; step 8 run or
"no second account". `scripts/ci/check-backlog.sh` OK; `scripts/ci/check-plan-scope.sh` OK. No `src/`, `prisma/`,
`e2e/` change.

Plan review: approved, round 2 · Plan approved by: lead, 2026-11-02 · Rounds: 1

## Map delta

none (tooling, no feature row)

## Review

pending

## Evidence

- AC met: pending
- tier: low
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [x] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`. (n/a: no code)
- [x] Every `AC-§.n` of the section is a test title; mutation ≥ 70 %. (n/a: no section)
- [x] No new `eslint-disable` / `@ts-ignore`; no protected config change.
- [x] Migrations reviewed (n/a).
- [ ] `spec/features-map.md` row moved (n/a); `docs/metrics.md` per-card row in the closing PR.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
