# B1.49 plan — Live check of the eligibility rule on a labeled issue (tooling)

Approach: the lead does every GitHub write (file, label, unlabel, rename, delete, close); the agent runs only the
read-only commands below after each step and records command, exit code and output in `live.md`. Tier quick (no
advisor); risk tier low (Files are `backlog/work/B1.49/*` only). Any difference from the rule → a fix card (D-25) via
the filing lane, its own PR. While issue A carries `agent-ready`, nobody runs `scripts/agent/run.sh` (`--poll` would
take it): the lead's step 0.

## Files

| File                            | Change                                                     |
| ------------------------------- | ---------------------------------------------------------- |
| `backlog/work/B1.49/plan.md`    | this plan                                                  |
| `backlog/work/B1.49/review.md`  | plan review (and the diff review of `live.md`)             |
| `backlog/work/B1.49/live.md`    | per step: lead action, command, exit code, output, verdict |
| `backlog/work/B1.49/pr-body.md` | PR body                                                    |

## Interfaces touched

None. Read-only commands the agent runs (`<A>` = issue number; `<L>` = `agent-ready` or the throwaway label):

```
R1 scripts/agent/eligible.sh <A>                                                  # exit + stdout/stderr
R2 gh api --paginate 'repos/{owner}/{repo}/issues/<A>/events' --jq '.[] | [.id, .event, (.label.name // ""), (.actor.login // "null"), .created_at] | @tsv'
R3 gh api --paginate 'repos/{owner}/{repo}/issues/<A>/timeline' --jq '.[] | [.event, (.label.name // ""), (.actor.login // "null")] | @tsv'
R4 gh api 'repos/{owner}/{repo}/issues/<A>' --jq '[.state, ([.labels[].name] | join(","))] | @tsv'
R5 R2 with ?per_page=1 vs ?per_page=100: same rows, same order (page boundaries)
R6 gh api 'repos/{owner}/{repo}/collaborators/<login>/permission' --jq '[.permission, .role_name] | @tsv'
```

## Steps (lead acts, then the agent runs; expected result)

| #   | Lead                                                                                            | Agent runs  | Expected                                                                    |
| --- | ----------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| 0   | do not run `scripts/agent/run.sh` until step 9                                                  | —           | —                                                                           |
| 1   | `gh issue create --title "B1.49 probe A (throwaway, do not run)" --body "Throwaway for B1.49."` | R1 R2 R4    | R1 exit 1 `not labeled agent-ready`                                         |
| 2   | `gh issue edit <A> --add-label agent-ready`                                                     | R1 R2 R3    | exit 0, labeled by the lead (admin)                                         |
| 3   | `gh issue edit <A> --remove-label agent-ready`                                                  | R1 R2 R4    | exit 1 `not labeled agent-ready`                                            |
| 4   | `gh issue edit <A> --add-label agent-ready`                                                     | R1 R2 R5    | exit 0; events labeled, unlabeled, labeled                                  |
| 5   | `gh label create b149-probe` then `gh issue edit <A> --add-label b149-probe`                    | R2 R3 R4    | one `labeled b149-probe`                                                    |
| 6   | `gh label edit b149-probe --name b149-probe-renamed`                                            | R1 R2 R3 R4 | record: old or new name on the event, any `unlabeled`/`renamed`; R1 still 0 |
| 7   | `gh label delete b149-probe-renamed --yes`                                                      | R1 R2 R3 R4 | record: `unlabeled` emitted or not; label gone from R4; R1 still 0          |
| 8   | optional, only with a second (non-write) account: it files issue B; lead adds `agent-ready`     | R1 R6       | exit 1 `author <login> has read (read), needs write`                        |
| 9   | `gh issue edit <A> --remove-label agent-ready` and `gh issue close <A>` (and B)                 | R1 R4       | exit 1; state closed                                                        |

Also recorded once, no lead step: R6 for `ghost` (a deleted actor's login) → `read`, so R1 would exit 1; a null actor
cannot be produced live (the script's `// ""` branch stays covered by the B1.43 smoke only).

## Verification

`live.md` has steps 1–7 and 9 with command, exit code, output; each Expected met or a fix card filed. Step 8 run or
"no second account" recorded. `scripts/ci/check-backlog.sh` OK. No `src/`, `prisma/`, `e2e/` change (no tests).

Plan review: <pending> · Plan approved by: · Rounds: 1
