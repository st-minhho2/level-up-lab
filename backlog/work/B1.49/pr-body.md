## Item

B1.49 — Live check of the eligibility rule on a labeled issue (tooling, no §)

- spec: none — tooling (D-27)
- test: `backlog/work/B1.49/live.md` records each command, its exit code and output — red before: no labeled issue had been checked
- acceptance: 6 of 7 clauses met; the read-only-author clause is conditional and was not run (the lead has no second account)

Result on throwaway issue #169 (closed, unlabeled; throwaway label deleted):

- add / remove / re-add `agent-ready` → `eligible.sh` exit 0 / 1 / 0; event order holds across 3 one-event pages
- **label rename: fail-open.** REST issue events and timeline keep the label's name at event time; the issue's labels
  carry the new name; no `unlabeled`/`renamed` event. A label renamed to `agent-ready` lets an older event decide →
  fix card **B1.63** (filing PR #172; matches by GraphQL label node id, stable through rename and delete)
- label delete: 1 `unlabeled` event named as at delete time, actor the deleter; safe (current labels are read first)
- closed issue still labeled → exit 0: known gap (`run.sh <n>`), follow-up B1.64 in the closing PR (B1.55's planned
  `eligible.sh <n> <card>` covers it only when a card id is passed)
- deleted actor: not producible live; `ghost` reads `read` → exit 1

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

### Diff review (pass 1)

Diff `origin/main...HEAD` at `824a819`: 4 files, all `backlog/work/B1.49/*` (`live.md` +339, `plan.md` +63,
`pr-body.md` +99, `review.md` +126). Contract: card `### B1.49` (Acceptance), `scripts/agent/eligible.sh`, the approved
`plan.md` (steps 0-9, pass lines). No GitHub write was run for this review; issue #169 and the recorded GraphQL query
were re-read read-only.

### Command results (last line of each)

| Command                              | Last line                                                                                      |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `pnpm lint`                          | `All matched files use Prettier code style!` (exit 0)                                          |
| `pnpm typecheck`                     | `tsc --noEmit` (exit 0)                                                                        |
| `pnpm test`                          | `Tests  202 passed (202)` (33 files)                                                           |
| `pnpm test:e2e`                      | `43 passed (1.0m)`                                                                             |
| `pnpm test:mutation`                 | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                 |
| `scripts/ci/check-suppressions.sh`   | `[check-suppressions] OK: no new suppressions`                                                 |
| `scripts/ci/check-config-change.sh`  | `[check-config-change] OK: no protected config changed`                                        |
| `scripts/ci/check-feat-commits.sh`   | `[check-feat-commits] OK: no feat commit touches tests`                                        |
| `scripts/ci/check-ac-coverage.sh`    | `[check-ac-coverage] OK: every criterion of a shipped section has a test`                      |
| `scripts/ci/check-spec-sections.sh`  | `[check-spec-sections] OK: sections cited: 1 … 22`                                             |
| `scripts/ci/check-features-map.sh`   | `[check-features-map] OK`                                                                      |
| `scripts/ci/check-backlog.sh`        | `[check-backlog] OK: README matches the cards`                                                 |
| `scripts/ci/check-plan-scope.sh`     | `[check-plan-scope] OK: docs/B1.49-live stays inside the approved plan of B1.49`               |
| `scripts/verify-red.sh B1.49`        | `no 'test(<pkg>): B1.49 … (red)' commit` (n/a: tooling card, the "test" is `live.md`, no code) |
| `scripts/next-task.sh --check B1.49` | `[next-task] B1.49: no overlap with any Doing or Review card`                                  |

### Re-read of the recorded outputs (read-only, login masked as `<lead>`)

- R2/R3 on #169 now: the 5 rows of step 7 verbatim (ids `34912045315`, `…236860`, `…287105`, `…366647`, `…554771`),
  then `closed` (13:15:04Z) and `unlabeled agent-ready` (13:18:00Z): matches steps 7, 9a, 9b. R5 `per_page=1` → same 7
  rows; `Link` now `rel="last"` page 7 (3 events at step 4 → page 3, as recorded).
- Single event `34912366647` → `labeled b149-probe FEF2C0`: the stored name survives the rename and the delete (step 6).
- R1 → exit 1 `not labeled agent-ready`; R4 → `closed`, no labels, author `<lead>` (step 9b). R6 `ghost`, `octocat` →
  `read read` (baseline).
- GraphQL query of `live.md` step 7 → the 5 step-7 rows verbatim (same node ids, stored names) plus the 9b
  `UnlabeledEvent agent-ready`. Node `LA_kwDOVaUkoc8AAAADAqP2eA` → `NOT_FOUND` (label deleted).
- No occurrence of the lead's login in the diff (`grep -ci` → 0).

### Step 6 verdict, probed on a copy

`eligible.sh` copied to the scratchpad with a `gh` shim that applies the real `--jq` filters to the trigger state (issue
labels `x`, `agent-ready`; events: `labeled agent-ready` by an admin, then `labeled y` by a triage user, `y` being the
label now named `agent-ready`, names stored at event time as observed live). Result: exit 0, `agent-ready labeled by
lead (admin)`. The fail-open verdict follows from the live observation and `eligible.sh:29-33`; it is not a misreading.

### Checklist

| Check                                                            | Result                                                                                                                                                                                       |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance item has evidence whose output matches its line | pass: 0/1/0 on add/remove/re-add (steps 2-4); author rule: "no second account" (step 8, optional per the card); rename (6) and delete (7) events recorded; differences → cards               |
| no test weakened after the red commit                            | n/a: no test file; `git log --first-parent --no-merges origin/main..HEAD -- '*.test.*' e2e/` → 0 commits; 0 merge commits                                                                    |
| every changed file is in `plan.md`                               | pass: 4/4 files in the Files table                                                                                                                                                           |
| interfaces match the contracts                                   | pass: none touched; `eligible.sh` unchanged                                                                                                                                                  |
| Zod at action boundaries, Prisma only in `src/lib`, no raw SQL   | n/a: no `src/`, `prisma/`, `e2e/` change                                                                                                                                                     |
| migration reversible and indexed                                 | n/a                                                                                                                                                                                          |
| no secret, no suppression                                        | pass: guard scripts OK; only public event ids and label node ids                                                                                                                             |
| features map row moved                                           | n/a: tooling, no row                                                                                                                                                                         |
| every pass line judged against the plan                          | pass: steps 1-5, 7, 9b pass; 6 fail-open per the plan's own line; 9a the planned known gap; 8 "no second account" as the Verification line allows                                            |
| dispositions                                                     | pass: step 6 → card B1.63 on `docs/B1.63-card` (PR #172, open), outside this diff as Work breakdown row 4 says; step 9a → D-25 follow-up B1.64 in the closing PR (not yet filed, as planned) |

### Extra read-only probes (the caller's question)

Outside R1-R6: single-event GET, `gh label list` (step 6, 9b), the GraphQL `query` (steps 6, 7), the collaborators
list and R6 for `octocat`/the lead (baseline), `gh api … -i` page headers (step 4), `gh issue list --label agent-ready`
(9b), and R4 widened with `.title, .user.login` (step 1). All are GETs or a GraphQL `query` (no `mutation`), add no
file and touch no interface, so `planning.md`'s send-back trigger (a file outside the list, an interface not in the
plan) does not fire. They do break the letter of the Approach line ("runs only the read-only commands below"), and no
pass line depends on them: steps 6 and 7 are decided by R2/R3/R4 alone; the GraphQL rows only inform B1.63's design.
Judgement: a disclosed deviation, not blocking; `pr-body.md` must say so (note 1).

Findings: none blocking.

Notes (not blocking):

1. `pr-body.md` (`13c553a`) reads `plan deviations: none`, `acceptance: pending`, `Review: pending`. The dev-lead's
   pr-body step must list the extra read-only probes above as the deviation, the step 6 and 9a dispositions (B1.63 PR
   #172, B1.64 in the closing PR), and "step 8 not run: no second account".
2. Commit order: the Work breakdown puts `… pr body` after `… review`; `13c553a` landed before `… live check`. Harmless
   (paperwork only), but the PR body commit has to be redone after this review anyway.
3. Step 6 GraphQL row `LabeledEvent b149-probe-renamed` (label resolved to its current name while it existed) can no
   longer be re-observed: the label is deleted, and the same query now returns the stored name `b149-probe`. B1.63's
   design rests on node ids (re-confirmed now), not on that name, so the fix card does not depend on the unreproducible row.
4. `plan.md` footer still reads `Rounds: 1` (round 2 plan review note 1); unchanged.

Verdict: ready for PR

Riskiest unfalsified: the fail-open of step 6 is shown by a live stored-name observation plus a shimmed run of
`eligible.sh`, not end to end on GitHub (that needs a triage account and two label renames); a GitHub path that emits an
`unlabeled`/`renamed` event on a rename for an issue with other activity would change the verdict and was not observed.

## Evidence

- AC met: 6/7 (the read-only-author clause is conditional: no second account)
- tier: low
- plan deviations: none (files); extra read-only probes outside R1–R6 (labels list, single event, GraphQL query, page headers, issue list), disclosed in live.md
- trace: n/a

## Checklist

- [x] **Diff matches the approved plan**: 4 files, all `backlog/work/B1.49/*`.
- [x] Red commit precedes the feat commit (n/a: no code; the test is `live.md`).
- [x] Every `AC-§.n` of the section is a test title (n/a: no section).
- [x] No new `eslint-disable` / `@ts-ignore`; no protected config change.
- [x] Migrations (n/a).
- [ ] `docs/metrics.md` per-card row in the closing PR.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
