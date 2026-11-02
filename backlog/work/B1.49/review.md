# B1.49 review

## Plan review (round 1)

Plan read at `dafa78f` (`docs(backlog): B1.49 plan`). Contract: card `### B1.49` (Acceptance line),
`scripts/agent/eligible.sh`, `work/B1.43/review.md` "Riskiest unfalsified" (lines 256-258, 344-347). No GitHub write
was run for this review.

| Check                                                                             | Result                                                                                                                                                                            |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: 4 rows, all `backlog/work/B1.49/*`; tooling, no § and no map row (card `Spec: none`)                                                                                        |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: no `src/`, `prisma/`, `e2e/` change; R1-R6 are reads (`gh api` GET, `eligible.sh`)                                                                                          |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: quick tier, no advisor, stated in the Approach line                                                                                                                         |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | fail: steps 6 and 7 Expected is "record: …" with no rule deciding fix card or not, and their "R1 still 0" cannot fail (reason 2)                                                  |
| verification lists exact commands with expected numbers                           | pass, weak: `scripts/ci/check-backlog.sh` OK; "steps 1-7 and 9 in `live.md`" is countable (note 3)                                                                                |
| work breakdown has skeleton → red → green → map → review with convention subjects | fail: the plan has no Work breakdown section and names no commit subject (reason 1)                                                                                               |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | n/a: no section (tooling, D-27); nothing ticked by the reviewer                                                                                                                   |
| no settled D-n contradicted                                                       | pass: D-25 (difference → fix card, own PR via the filing lane) and D-27/D-28 (risk tier) followed; `scripts/agent/tier.sh backlog/work/B1.49/plan.md` → `low`, as the plan states |
| `scripts/next-task.sh --check B1.49`                                              | pass: `[next-task] B1.49: no overlap with any Doing or Review card` (exit 0)                                                                                                      |

Also run: `scripts/ci/check-plan-scope.sh` → `OK: docs/B1.49-live changes only paperwork (B1.49 has no approved plan)`;
`scripts/ci/check-backlog.sh` → `OK: README matches the cards`.

Verdict: changes requested

1. **No work breakdown, no commit subjects.** The plan lists files but not the steps that produce them, their role, or
   their commit. B1.47's plan (`work/B1.47/plan.md`, "Work breakdown") is the tooling-card shape: one row per step with
   role and commit. Add the rows: live run (lead acts, dev-lead records) → `docs(backlog): B1.49 live check` (`live.md`),
   diff review (reviewer) → `docs(backlog): B1.49 review`, PR (`pr-body.md`). State whether `live.md` is committed once
   after step 9 or per step. Also state that a fix card from a difference is filed on its own `docs/B1.<n>-card` branch
   through the filing lane and is not in this PR's Files. Otherwise the diff review has no plan to compare commits against.
2. **Steps 6 and 7 cannot fail.** Their Expected is "record", and "R1 still 0" is vacuous: `eligible.sh` filters events
   with `.label.name == "agent-ready"`, and `b149-probe` is never `agent-ready`, so R1 stays 0 whatever GitHub does. The
   card's "any difference from the rule becomes a fix card" then has no rule to differ from for rename and delete. State
   the decision for each outcome before the lead approves:
   - **Step 6, rename.** If the event keeps the old name (`b149-probe`) with no `unlabeled`/`renamed`, an issue can carry
     `agent-ready` while its newest `agent-ready`-named event predates what it carries now. Trigger: lead labels issue K
     `agent-ready`; a write user renames `agent-ready` → `x`; a triage user labels K with `y`; `y` is renamed →
     `agent-ready`. The filtered events then end in the lead's old `labeled`, so R1 exits 0 for a label the triage user
     applied. That outcome means a fix card (or a lead ruling that renames by write users are trusted, recorded as a D-n
     request). If the event shows the new name (`b149-probe-renamed`), the outcome is safe: no card.
   - **Step 7, delete.** Both outcomes are safe: `eligible.sh` checks the present labels before reading events, so a
     deleted label exits 1 "not labeled" whether or not `unlabeled` is emitted. A re-created and re-applied label adds
     a newer `labeled` event, and that event decides. Record the outcome, no card. Say so in Expected.
   - Replace "R1 still 0" in both rows with the measurable part: the label name each R2 row carries after the step, and
     the count of `unlabeled` rows R2 adds.

Notes (not blocking, costs the lead should see before approving):

1. **A closed issue is never observed.** `eligible.sh` does not read the issue's state. `run.sh --poll` filters
   `--state open` (`scripts/agent/run.sh:247`), but `run.sh <n>` (`:256-258`) goes straight to `run_issue`. So
   `run.sh <closed issue still labeled agent-ready>` passes eligibility. Step 9 removes the label before closing, so
   the live run never sees this. A cheap change would record it: close, R1 (expected 0 today), unlabel, R1 (1).
   This is outside the Acceptance, so it can only lead to a D-25 follow-up card, not a fix in this card.
2. **The deleted actor stays unverified live.** The plan says so. Both branches fail closed: `ghost` → `read` (dev-lead's
   baseline probe) → exit 1 for the author or labeler; a null actor → `""` → exit 1 "label's last event has no actor".
   No card is needed.
3. **R5 does not show ascending order on its own.** Both page sizes come from the same API, so a descending list
   would also match. Step 4's "labeled, unlabeled, labeled" order covers it. Write R5's Expected as "per_page=1 rows
   in `created_at` ascending order, last `agent-ready` row `labeled`" so the page-boundary risk from B1.43 has its
   own pass line.
4. **Issue A stays public.** It is public with its label history after it is closed, and steps 2-8 depend on step 0
   (nobody runs `run.sh`), which only the lead can enforce. Step 8 is optional, as in the Acceptance.

Riskiest unfalsified: whether issue-event `label.name` is the name at event time or the label's current name. Step 6
decides it, and with reason 2 resolved the outcome becomes a verdict, not just a record.

## Plan review (round 2)

Plan read at `2e4af51` (`docs(backlog): B1.49 plan round 2`). Contract: card `### B1.49` (Acceptance line),
`scripts/agent/eligible.sh`, D-25, D-27, D-28. No GitHub write was run for this review.

Round 1 reasons:

1. **Resolved.** "Work breakdown" has 4 rows with role, product and commit subject (`docs(backlog): B1.49 live check`,
   `… review`, `… pr body`, `docs(backlog): card B1.<n> …`); `live.md` is committed once after step 9; a fix card goes on
   its own `docs/B1.<n>-card` branch, outside this PR's Files.
2. **Resolved.** Step 6 now has a pass line that decides: R2's step-5 row reads `b149-probe-renamed` → safe, reads
   `b149-probe` → fail-open → fix card or D-n request, with the trigger written out. Step 7 says "safe either way: no
   card" and records the count of `unlabeled` rows and R4's labels. The vacuous "R1 still 0" is gone (R1 is not in
   either row's Agent column). I traced `eligible.sh:27` (present labels first) and `:29-33` (filter on
   `.label.name == "agent-ready"`, last row decides): the step-7 verdict holds for both outcomes.

Round 1 notes: note 1 → step 9 now closes before unlabeling and states R1 exit 0 as the known gap (`run.sh:255-258`
calls `run_issue` with no state filter; `--poll` at `:247` filters `--state open`), follow-up per D-25. Note 3 → step 4's
R5 pass line now has `created_at` ascending and last `agent-ready` row `labeled`. Note 4 → step 0 and "Issue A stays
public" are in the Approach. Note 2 → the `ghost`/null actor line states what stays unverified live.

| Check                                                                             | Result                                                                                                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: 4 rows, all `backlog/work/B1.49/*`; tooling, no § and no map row                                                         |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: no `src/`, `prisma/`, `e2e/` change; R1-R6 are GETs or `eligible.sh`; every write is in the Lead column                  |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: quick tier, no advisor, stated                                                                                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 9 steps map to the 1 Acceptance line; every pass line is an exit code, a message or a row count/name                     |
| verification lists exact commands with expected numbers                           | pass: R1-R6 exact; steps 1-7 and 9 (8 rows) in `live.md`; `check-backlog.sh` OK, `check-plan-scope.sh` OK                      |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass (tooling shape, as B1.47): live check → review → PR body → fix cards, each with a `docs(backlog):` subject                |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | n/a: no section (D-27); nothing ticked by the reviewer                                                                         |
| no settled D-n contradicted                                                       | pass: D-25 (step 9 gap → follow-up), D-27/D-28: `scripts/agent/tier.sh backlog/work/B1.49/plan.md` → `low`, as the plan states |
| `scripts/next-task.sh --check B1.49`                                              | pass: `[next-task] B1.49: no overlap with any Doing or Review card` (exit 0)                                                   |

Also run: `scripts/ci/check-plan-scope.sh` → `[check-plan-scope] OK: docs/B1.49-live changes only paperwork (B1.49 has no
approved plan)`; `scripts/ci/check-backlog.sh` → `[check-backlog] OK: README matches the cards`.

Verdict: approved (ready for the lead's gate; the lead does every GitHub write in steps 1-9)

Notes (not blocking, costs the lead should see before approving):

1. **Length.** `plan.md` is 63 lines against the ≈ 40-line one-screen rule (`planning.md`); the growth is the Work
   breakdown and pass lines round 1 asked for, and the content is one task. Footer still reads `Rounds: 1`; it is round 2.
2. **Step 8's pass line pins the role text.** `author <login> has read (read), needs write` assumes a public-repo
   non-collaborator's `role_name` is `read`. If GitHub returns another `role_name` while R1 still exits 1 on the author,
   that is not a difference from the rule, so it should not produce a fix card. Judge step 8 on "exit 1, reason starts
   `author <login> has read`".
3. **The "safe" branch of step 6 still lets a rename approve.** If events carry the label's current name, renaming any
   label to `agent-ready` makes every issue whose last labeling with it was by a write user eligible at once, and
   attributes it to that user. That matches the rule's letter (the last `labeled` event is by a write collaborator), so
   "safe" is correct against the rule; it is not "no exposure". Both branches need a write user to rename.
4. **eligible.sh's own pagination stays offline-only.** Issue A will have fewer than 30 events, so R1 never crosses a
   page; R5 proves the API's page order on the same endpoint with R2, and `eligible-smoke.sh` shims `--paginate`. That is
   the closest a throwaway issue gets; say so in `live.md`.
5. **Where fix cards land.** Work breakdown row 4 (own `docs/B1.<n>-card` branch) fits a fix card the Acceptance demands;
   the step 9 closed-issue gap is a D-25 follow-up, which D-25 files in the card's closing PR. Name the two paths
   separately in `live.md` so the step 9 card is not opened mid-card.

Riskiest unfalsified: whether issue-event `label.name` is the name at event time or the label's current name; step 6
decides it live, and the plan now states what each outcome means.

## Diff review (pass 1)

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
