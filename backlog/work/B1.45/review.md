# B1.45 review

## Plan review (round 1)

The plan reviewed is `c46fa69 docs(backlog): B1.45 plan`. B1.45 is a tooling card with no §. Its contract is the
card's Acceptance (`backlog/plan/E1-todos.md` ### B1.45) together with D-19 and D-25 to D-29. I checked these facts
without writing anything:

- The label `agent-ready` does not exist on the repository yet. `gh issue list --label agent-ready --state open --json …`
  returns `[]` and exits 0 (gh 2.103.2).
- `playwright.config.ts:17` sets `trace: 'on-first-retry'`. `ci.yml:88-93` uploads `playwright-report` with
  `if: always()`.
- `origin/docs/B1.28-package-guides` and `origin/docs/B1.31-guide-ranges` are branches where card work was done. They
  are not lane branches.
- B1.44's Acceptance does not mention `feature-map.sh`, posting anything, or writing the Evidence section.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: tooling, so there is no § and no map row. The three files that are not paperwork are exactly what the Acceptance names. No file overlaps with B1.43 (`agent-task.yml`, `eligible*.sh`) or B1.46 (`package.json`, lockfile, `.dependency-cruiser.cjs`, `ci.yml`). `scripts/agent/` is a new directory both cards use, but with different files |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no TypeScript, no action, no Prisma. The script is bash 3.2 and uses gh's `--jq` without `jq`, as `scripts/CLAUDE.md` requires                                                                                                                                                                                                          |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no `advice.md`. The plan states that the quick tier skips the advisor (`dev-lead.md:38`)                                                                                                                                                                                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | fail: under option A, nothing in this card or any other card produces "daily" or "posts it to the agent board" (reason 1). "Playwright trace link" can only be met as `n/a` on a green run (reason 5)                                                                                                                                               |
| verification lists exact commands with expected numbers                           | pass: the smoke reports 12 FAIL with exit 1 at the red commit and "12 probes OK" after, with `denied.log` empty. `check-plan-scope`, `check-backlog` and lint each have an expected value. The live run's empty state holds today: the label is missing, so gh returns `[]` and exits 0                                                             |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: no § means no skeleton, map or mutation step, and the plan says so. `test(scripts): … (red)` and `chore(scripts): …` match B1.42 (`6561267`). The approval commit must be titled `docs(backlog): B1.45 plan approved`, because `plan-files.sh` looks for that title                                                                           |
| `Lead approves spec` box ticked only by a human                                   | pass (n/a): there is no section. `Plan approved by:` is empty                                                                                                                                                                                                                                                                                       |
| no settled D-n contradicted                                                       | pass: D-19 is met (the plan's Files include `.github/`, so the PR carries the label). D-27 is met (high tier keeps the lead's gate). D-26 is met (nothing runs on Actions). D-25 is followed for the deferrals. D-28 holds only if the runner is the only writer of `tier:`, which reason 3 questions                                               |
| `scripts/next-task.sh --check B1.45` says no overlap                              | pass: `[next-task] B1.45: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                                                        |

### Reasons (numbered)

1. **Option A leaves part of the Acceptance with no owner.**
   - The plan says "B1.44's launchd job runs it once a day" and "the runner (B1.44) posts it". B1.44's Acceptance
     says only "a launchd job polls every 15 min". It names neither `feature-map.sh` nor a board.
   - If the lead approves A as written, nothing produces "daily" or "posts it to the agent board". B1.45 then cannot
     close Done.
   - The plan must say which of these happens:
     - B1.45 closes Partial, with those two words left open.
     - The clause moves into B1.44's Acceptance through a card-text change, in the filing lane or folded into B1.47.
   - The repository never defines "the agent board". The word "board" appears only in this card. The plan describes
     it as "a claude.ai artifact only an agent tool writes". The runner is `claude -p` on the lead's machine, and a
     headless CLI run has no claude.ai artifact tool. So under A, "the runner posts it" probably cannot happen, and
     the posting would be manual from an attended session. The lead should confirm what the board is before choosing.
   - Confidence: confirmed for the card text. Plausible for the artifact claim.
2. **After this card, nobody fills in the Evidence section, so the map ranks nothing real.**
   - `tier: pending` says "the runner writes …". B1.44's Acceptance has no such line.
   - Filling Evidence through `dev-lead.md` Loop 9 or `pr-body.md` is listed under "Not here", with no card id.
   - Running the smoke in CI is deferred in the same way.
   - Trigger: the first agent-ready issue after merge gets its PR from today's `dev-lead`. Its body carries the
     template defaults, or no Evidence section at all.
   - Wrong behaviour: every row shows tier `unknown` and AC `?`. "Riskiest first" works only on the shim's data, and
     a later edit can break the parser without any check failing.
   - Fix: name the follow-up card ids, or the exact B1.44 or B1.47 Acceptance lines, in the plan. The lead then
     approves knowing the map stays empty until they land.
   - Confidence: confirmed (card texts and the plan's "Not here").
3. **The ranking trusts a PR body line that any agent can edit.**
   - D-28 says a tier is "never chosen by an agent". `feature-map.sh` reads `- tier:` from the PR body and checks it
     against nothing.
   - Trigger: a PR whose diff touches `.github/` has `- tier: low` in its body, either written by an agent or left
     over from a copied body.
   - Wrong behaviour: the PR sorts after every medium PR. Under D-28 the lead "samples" it.
   - Fix (choose one):
     - The plan states this cost and names the follow-up that makes the map call `tier.sh` (B1.44).
     - The map ranks a PR that carries `config-change-approved` as at least `high`. Today it fetches no labels, so
       `labels` would need adding to the `gh pr list` fields.
   - Confidence: plausible (traced the interface; nothing exists to run).
4. **Excluding every `docs/` branch also drops PRs that hold a card's actual work.**
   - The plan's PR rule is "branch `<type>/<card>[-…]`, not docs/". `docs/B1.28-package-guides` and
     `docs/B1.31-guide-ranges` were card work branches, and a tier-0 card such as B1.47 ("card text only") would use
     one too.
   - Trigger: an agent-ready issue for B1.47 with an open, ready PR on `docs/B1.47-b1-44-acceptance`.
   - Wrong behaviour: the row shows `queued` with tier and AC `?`, while a ready PR waits for the lead.
   - Fix: exclude only the lane suffixes (`-done`, `-card`, `-file-card`, `-partial`), with a probe next to F5.
     Alternatively, state the cost: `next-task.sh:55` has the same rule.
   - Confidence: confirmed (the branch names exist; traced the stated rule).
5. **The trace line will read `n/a` on every green PR.**
   - With `trace: 'on-first-retry'`, a run where every test passes on the first try records no trace.
   - The artifact URL exists only after CI finishes, which is after `pr-step.sh draft` has published the body. No
     step in this plan or in its follow-ups edits the body after CI.
   - Trigger: any PR whose e2e passes on the first try.
   - Wrong behaviour: the Acceptance asks for a "Playwright trace link", and the Evidence shows `trace: n/a`.
   - Fix (choose one):
     - State this cost and have the lead accept "n/a on a green run".
     - Define the value as the `playwright-report` artifact of the run, which is uploaded on every run, and name who
       writes it after CI.
     - Changing `trace` itself would edit `playwright.config.ts`, which is protected and not in Files.
   - Confidence: confirmed (`playwright.config.ts:17`, `ci.yml:88-93`).
6. **A multi-line deviation list reads as empty.**
   - The template says "or the files outside plan.md's Files table, each with why". A writer will naturally put those
     as nested bullets under `- plan deviations:`.
   - The parser reads only the key line, so the value is empty.
   - Trigger: `- plan deviations:` followed by `  - src/x.ts — needed for …`.
   - Wrong behaviour: the Deviations cell is blank and reads as "none" for a PR that went outside its plan.
   - Fix: the template comment fixes a one-line format (`; `-separated). An empty value renders as `?`. Add a probe
     next to F3/F4.
   - Confidence: plausible (behaviour of the stated parser, not run).

Not blocking:

- The plan is 65 lines, above the "≈ 40" in `planning.md`. B1.24, B1.29 and B1.42 were 64 to 76 lines.
- The body fallback takes the "first B<e>.<n>". B1.43's form asks for the card id first, and markdown or placeholder
  elements do not render into the body. This holds as long as B1.43 keeps that order.

Verdict: changes requested

## Plan review (round 2)

Reviewed `e55dea1 docs(backlog): B1.45 plan round 2` (73 lines). Contract: the card's Acceptance
(`backlog/plan/E1-todos.md` ### B1.45), D-19, D-25 to D-29. Read-only facts checked for this round:

- `scripts/ci/check-config-change.sh:10` protects `\.github/.*`, so the Files table makes the tier high (D-28) and the
  lead's gate stays (D-27), as the plan says.
- Lane branches on origin end in `-done`, `-partial`, `-card`, `-file-card` and once `-B1.30-cards`
  (`docs/B1.29-B1.30-cards`); card work branches `docs/B1.28-package-guides` and `docs/B1.31-guide-ranges` exist.
- Nothing in `scripts/` or `.claude/` parses the PR template's sections; `dev-lead.md:64` writes Item, Plan, Map delta
  and Review only, so today's PRs carry no Evidence section (the plan's F4 and follow-up (b) cover that).
- `scripts/ci/plan-files.sh` reads a plan's Files "as of its approval commit"; the map reads the PR head's plan.md.

| Check                                                                             | Result                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: tooling, no § and no map row. Three non-paperwork files, exactly what the Acceptance names. No overlap with B1.43 (`agent-task.yml`, `eligible*.sh`) or B1.46 (`package.json`, lockfile, `.dependency-cruiser.cjs`, `ci.yml`); `scripts/agent/` is shared as a directory only |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no TypeScript, action or Prisma. bash 3.2, gh `--jq` without `jq`                                                                                                                                                                                                       |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; quick tier skips the advisor, stated                                                                                                                                                                                                                          |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass with a ruling: "daily" and "posts it to the agent board" are now an explicit gate question (A/B), with "no ruling → Partial" stated; "trace link" is defined as the `playwright-report` artifact URL or `n/a`, and the plan states a trace exists only after a retry           |
| verification lists exact commands with expected numbers                           | pass: red = exit 1 with 15 FAIL; green = "feature-map-smoke: 15 probes OK", `denied.log` empty, same on `/bin/bash`; plan-scope, backlog, lint, and the live empty-state run each have an expected line                                                                             |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: no § means no skeleton, map or mutation step. `test(scripts): … (red)` → `chore(scripts): …` → review, as B1.42. The approval commit must be titled `docs(backlog): B1.45 plan approved` (or `plan round 2 approved`) for `plan-files.sh`                                     |
| `Lead approves spec` box ticked only by a human                                   | pass (n/a): no section; `Plan approved by:` empty                                                                                                                                                                                                                                   |
| no settled D-n contradicted                                                       | pass: D-19 (label), D-25 (follow-ups filed in the closing PR), D-26 (nothing on Actions), D-27 (high tier keeps the gate), D-28 (rank comes from `tier.sh`, never the body's word)                                                                                                  |
| `scripts/next-task.sh --check B1.45` says no overlap                              | pass: `[next-task] B1.45: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                        |

### Round 1 reasons

1. Addressed: the posting and "daily" are a lead ruling at the gate (A recommended, B stated), and no ruling closes
   the card Partial.
2. Addressed: follow-ups (a) runner fills `tier:` and posts, (b) `dev-lead.md` Loop 9 / `pr-body.md` fill Evidence after
   CI, (c) smoke in CI are named, filed in the closing PR under D-25. The plan states the map has no real row until
   B1.44 runs.
3. Addressed: rank comes from `tier.sh` on the PR's plan.md; a differing body word is shown, not ranked (F14); no
   `tier.sh` → `unknown`, ranked second (F15). Residual cost below (cost 2).
4. Addressed: only lane suffixes are excluded and `docs/B9.1-guides` counts (F5). Residual cost below (cost 3).
5. Addressed: the value is the `playwright-report` artifact URL (uploaded on every run, `ci.yml:88-93`) or `n/a`, the
   writer after CI is follow-up (b), and the plan says the report holds a trace only after a retry.
6. Addressed: one-line format in the template, empty value → `?` (F13).

### Costs the lead approves with (not blocking)

1. **Option A's follow-up (a) contradicts the plan's own premise.** The ruling text says the board is written only by
   an agent tool and "a headless runner has none", yet follow-up (a) has the runner post the map daily. Trigger: the
   lead rules A; (a) is filed as written; B1.44's `claude -p` run cannot reach a claude.ai artifact. Result: the post
   stays manual from an attended session, or (a) must redefine "the board" (a file, an issue comment, which is option
   B). Filing (a) should say which. Confidence: plausible (the artifact claim is the plan's, not run).
2. **The tier source is the PR head's plan.md, not the approved one.** `check-plan-scope.sh` bounds the diff by the
   Files at the approval commit (`plan-files.sh`); the map reads `git show FETCH_HEAD:backlog/work/<card>/plan.md`.
   Trigger: the approved plan lists `.github/x.yml`; a later `docs(backlog)` commit on the branch drops that row
   (paperwork passes plan-scope); the diff still touches `.github/x.yml`. Result: `tier.sh` prints medium or low and
   the PR ranks below every high PR, while the merged change is high by D-28. A row added after approval errs the safe
   way (higher). Cheap fix the lead can take at approval: feed `tier.sh` the plan.md at the latest
   `docs(backlog): <card> plan [round N ]approved` commit on the fetched head (the `plan-files.sh` regex), head's only
   when none exists. Confidence: plausible (traced; nothing exists to run).
3. **The lane-suffix rule is wider and narrower than the probes.** "`-…card(s)`" as a suffix match also drops a work
   branch whose name happens to end in `card` (`docs/B1.50-scorecard`), and F5 probes `-done` and `-card` but not
   `-file-card` or `-partial`, which exist on origin. Trigger: an open ready PR on `docs/B1.50-scorecard` → row
   `queued`. Fix at build: match the exact suffixes `-done`, `-partial`, `-card`, `-file-card`, `-<card>-cards` and add
   `-file-card`, `-partial` inputs to F5. Confidence: plausible.
4. The plan is 73 lines (> ≈ 40 in `planning.md`; B1.24, B1.29, B1.42 ran 64 to 76). The footer still says
   `Rounds: 1`.

Riskiest unfalsified: cost 2, the map ranking a PR by a head-of-branch plan.md that no longer matches what was approved.

Verdict: approved (ready for the lead's gate; the gate also takes the A/B ruling)

## Diff review (pass 1)

Reviewed 7990853 (red) and 67e6921 (change) against the approved plan, the card's Acceptance and D-19/D-25/D-27/D-28.
Probes ran on a scratch copy (`git archive` of each commit, re-initialised), never on this tree.

### Commands (last line each)

| Command                                                                  | Result                                                                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` · `pnpm typecheck`                                           | `All matched files use Prettier code style!` · `tsc --noEmit` clean                                                 |
| `pnpm test`                                                              | `Tests  202 passed (202)`                                                                                           |
| `pnpm test:e2e`                                                          | `43 passed (2.0m)`                                                                                                  |
| `pnpm test:mutation`                                                     | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                                      |
| `scripts/agent/feature-map-smoke.sh` · same under `/bin/bash` (3.2)      | `feature-map-smoke: 16 probes OK` · `feature-map-smoke: 16 probes OK`                                               |
| smoke at 7990853 (scratch copy)                                          | `feature-map-smoke: 16 FAIL, 0 ok` (red proven by hand)                                                             |
| `scripts/verify-red.sh B1.45`                                            | `::error::test(B1.45) commits touch no *.test.ts(x) file` (exit 1; see finding 1)                                   |
| `scripts/verify-red.sh --auto` (CI's `guards` step, range 7570921..HEAD) | same error, **exit 1**                                                                                              |
| `check-suppressions` · `check-feat-commits`                              | `OK: no new suppressions` · `OK: no feat commit touches tests`                                                      |
| `check-config-change`                                                    | local: `Protected configuration changed without the 'config-change-approved' label` (no PR context); PR #154 has it |
| `check-ac-coverage` · `check-spec-sections` · `check-features-map`       | `OK: every criterion of a shipped section has a test` · `OK: sections cited: 1 … 22` · `OK`                         |
| `check-plan-scope` · `check-backlog`                                     | `OK: chore/B1.45-evidence stays inside the approved plan of B1.45` · `OK: README matches the cards`                 |
| `scripts/agent/feature-map.sh` · `--json` · `--json extra` (live)        | heading + `No open agent-ready issues.` exit 0 · `[]` exit 0 · usage exit 2                                         |
| `git diff --stat main...HEAD`                                            | 6 files, +667: template, 2 scripts, 3 `backlog/work/B1.45/` files                                                   |

### Checklist

| Check                                                       | Result                                                                                                                                   |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance clause has a probe whose assertion matches | template Evidence (F11), table riskiest first (F1, F2, F14–F16), print-only per ruling A, label on #154: yes; but see finding 3          |
| no test weakened after red                                  | `git log --first-parent --no-merges 7990853..HEAD -- '*.test.*' e2e/ scripts/agent/feature-map-smoke.sh`: empty; no merges               |
| every changed file in `plan.md`                             | yes (plan-scope OK)                                                                                                                      |
| interfaces match the plan                                   | yes, except the template default `- AC met: N/N` where the plan's block reads `<green>/<total>` (note, not blocking)                     |
| Zod / Prisma / raw SQL / migration                          | n/a (no `src/`, no `prisma/`)                                                                                                            |
| no secret, no suppression                                   | yes                                                                                                                                      |
| features map row                                            | n/a (tooling, no §); `scripts/CLAUDE.md` row deferred to the orchestrator per plan                                                       |
| would a test fail if one changed line were reverted         | 10 line-reverts on the copy: 3 caught (lane exclusion 4 FAIL, unapproved note 1 FAIL, unknown rank 1 FAIL), 7 survive (finding 3, notes) |

### Findings

```
[1] KIND: correctness
    WHERE: commit 7990853 subject "test(scripts): B1.45 feature-map smoke (red)"; .github/workflows/ci.yml:158
    DEFECT: the "(red)" marker on a commit that touches no *.test.ts makes CI's verify-red step fail.
    TRIGGER: push 7990853 to PR #154 (origin's head is still be98af2); guards runs `scripts/verify-red.sh --auto`
             on 7570921..HEAD, which selects B1.45 by the "(red)" subject and finds no test file.
    WRONG BEHAVIOUR: the guards job exits 1 with "::error::test(B1.45) commits touch no *.test.ts(x) file"; the PR
             cannot go green. Precedent avoids it: B1.29 1ae8fbb, B1.32 084bccb, B1.43 ba64613 omit "(red)" and say
             "Red because" in the body. Both B1.45 commits are unpushed, so rewording the subject is not a force push;
             the plan's work-breakdown subject then becomes a stated deviation.
    CONFIDENCE: confirmed (ran `scripts/verify-red.sh --auto` on this branch: exit 1, same error)

[2] KIND: security
    WHERE: scripts/agent/feature-map.sh:63-64 (pr list fields), :37-43 (pr_of)
    DEFECT: a card's PR is chosen by head branch name only, so a fork PR is indistinguishable from the agent's PR.
    TRIGGER: the repo is PUBLIC (`gh repo view`); any account opens a fork PR whose head is `chore/B9.1-a` (or any
             `<type>/<card>-…`), newer than the agent's PR. On the copy, adding `130<TAB>chore/B9.1-a<TAB>false` with
             body "AC met: 7/7, deviations: none" printed `| 2 | B9.1 | #11 | #130 | review | high (body: low) | 7/7 | none |`.
    WRONG BEHAVIOUR: the row shows the outsider's PR number, state and self-written AC met and deviations; the agent's
             real PR disappears from the map the lead uses to set review depth (D-28). With a branch name origin
             lacks, the fetch fails and the row ranks "unknown", second, above every medium PR. The field to filter
             on exists: live `gh pr list --json isCrossRepository` returned `false` for #154 and #155.
             Inside the Acceptance (identifying the card's PR), so not D-25 widening; the lead may still rule it a
             follow-up.
    CONFIDENCE: plausible (selection mechanism confirmed on the copy; no fork PR was opened)

[3] KIND: coverage
    WHERE: scripts/agent/feature-map-smoke.sh:151 (F1), :166 (F16), fixture :45-56, :89-117
    DEFECT: three planned behaviours can be reverted with the smoke still at "16 probes OK".
    TRIGGER: on the copy, each single edit to feature-map.sh:
             (a) :52 drop `break` (oldest approval commit instead of the latest, unlike plan-files.sh);
             (b) :82 `r=4` → `r=3` (queued ranks with low; F1's low row is issue #13, below queued #15 and #20, so
                 the tie-break hides it);
             (c) :50 drop `(round [0-9]+ )?` (B9.2's "plan round 2 approved" no longer counts; the row printed
                 `| 6 | B9.2 | #12 | #102 | doing | medium (unapproved) | 2/2 | none |`, no probe reads B9.2's tier).
    WRONG BEHAVIOUR: F1 claims "low > queued" and F16 claims "the approval commit's plan" (plan-files.sh's rule,
             round N included), but neither assertion can fail for these inputs. Needed: a queued issue numbered
             below the low row; `cell B9.2 6 == "medium"`; a branch approved low, then re-planned high and approved
             "round 2", expected high.
    CONFIDENCE: confirmed (ran all three mutants on the copy: 16 probes OK each)
```

Notes, not blocking:

- Further surviving reverts: `gsub(/\t/…)` in `evidence`, the body-tier lowercasing, `[[ $# -le 1 ]]` (`--json extra`
  untested), the backslash escape in `json_str`. Cheap to probe alongside finding 3.
- Caller's (1): the first `B<e>.<n>` in the title wins, as planned. B1.43's form prefills `title: "B<e>.<n> "` and
  has a required `card` input; a title "Follow-up to B1.42 runner" filed for B1.47 yields B1.42's row. Out of scope →
  follow-up (prefer the form's card field), plausible.
- Caller's (2): `git fetch origin refs/heads/<b>` writes the caller's per-worktree `FETCH_HEAD` and shared objects,
  no ref, no working-tree change; it clobbers a pending `git merge FETCH_HEAD` in that checkout. Not blocking.
- Caller's (3): `--limit 100` on both lists; 2 open PRs today, B1.44 caps agent PRs at 3. Trigger 101 open PRs →
  older PRs absent, their cards "queued". Out of scope → follow-up, plausible.
- Caller's (4): exit 1 on any gh failure is the plan's interface ("1 gh failed"). Trigger: an issue transferred
  between list and view kills the whole table. Not a finding.
- Caller's (5): the PR `--jq` ran live and printed `155<TAB>chore/B1.43-eligible<TAB>true`, the shim's format. The
  issue expression has the same shape but the repo has no issue and no `agent-ready` label yet, so it is unexercised.
- An unedited template body shows "N/N" (AC met) and "none" (deviations) in the map, not "?". B1.45's own
  `pr-body.md` has no Evidence section of the new template.

Verdict: back to test-writer (finding 1: reword the unpushed red commit; finding 3: the three probes; a fork-PR
probe for finding 2), then code-writer for finding 2.

Riskiest unfalsified: the tier column against the real `scripts/agent/tier.sh` (B1.44, not built): the map assumes
`tier.sh <plan.md>` exits 0 with the word on line 1; only a stub has run.

### Dispositions (pass 1, dev-lead)

| Pass | #   | Finding (file:line)                                        | Source   | Kind        | Disposition              | Justification                                                                                                                               |
| ---- | --- | ---------------------------------------------------------- | -------- | ----------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | red subject `(red)` on a commit touching no `*.test.ts(x)` | reviewer | correctness | fix now                  | unpushed commits replayed on be98af2 (origin's head, no force push): 6df8bb5 `test(scripts): B1.45 feature-map smoke`, same tree as 7990853 |
| 1    | 2   | `feature-map.sh:63` a fork's PR takes a card's row         | reviewer | security    | fix now                  | b11a96b F17 (fork PR #130 on `chore/B9.1-a`) red, 2d6247f skips `isCrossRepository` true; 18 probes OK                                      |
| 1    | 3   | three reverts survive (break, `r=4`, round N)              | reviewer | coverage    | fix now                  | b11a96b F1 queued #5, F18 (B9.12 low → high round 2; B9.2 medium); hand mutants: all 3 now FAIL                                             |
| 1    | n1  | tab gsub, lowercasing, `--json extra`, JSON backslash      | reviewer | coverage    | fix now                  | b11a96b F7 backslash + tab, F15 `Medium`, F10 `--json extra`; hand mutants: all 4 now FAIL (and dropping the fork filter: 3 FAIL)           |
| 1    | n2  | template default `N/N` reads as a value                    | reviewer | correctness | fix now                  | template line is the plan's `- AC met: <green>/<total>`                                                                                     |
| 1    | n3  | `pr-body.md` has no Evidence                               | reviewer | process     | fix now                  | Evidence section added to `pr-body.md`                                                                                                      |
| 1    | c1  | first `B<e>.<n>` in the title wins                         | dev-lead | correctness | out of scope → follow-up | input: title "Follow-up to B1.42 runner" filed for B1.47 → B1.42's row; prefer B1.43's required card field (D-25)                           |
| 1    | c3  | `--limit 100` truncates silently                           | dev-lead | correctness | out of scope → follow-up | input: 101 open PRs → older cards show queued; B1.44 caps agent PRs at 3 (D-25)                                                             |
| 1    | c2  | `git fetch` writes the caller's `FETCH_HEAD`               | dev-lead | side effect | no change needed         | no ref, no working-tree change; only a pending `git merge FETCH_HEAD` in that checkout is affected                                          |
| 1    | c4  | one gh failure ends the table with exit 1                  | dev-lead | interface   | no change needed         | the approved plan's interface ("1 gh failed")                                                                                               |
| 1    | c5  | the issue `--jq` is unexercised                            | dev-lead | coverage    | out of scope → follow-up | no `agent-ready` label or issue exists yet; first live run after B1.43's template lands                                                     |
| 1    | own | `pr_of` comment named 2 fields, prints 3                   | dev-lead | docs        | fix now                  | 2d6247f comment names `<number>\t<branch>\t<isDraft>`                                                                                       |

## Diff review (pass 2)

Reviewed origin/main..43030de (6df8bb5 smoke, 4c62829 change, b11a96b hardening probes, 2d6247f fork fix, 43030de
template placeholder and Evidence in `pr-body.md`) against the approved plan, the card's Acceptance, D-19/D-25/D-27/D-28
and the pass-1 dispositions. I ran the probes on a scratch copy (`git archive HEAD`, re-initialised) and never on this
tree.

### Commands (last line each)

| Command                                                            | Result                                                                                                                                                |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` · `pnpm typecheck`                                     | `All matched files use Prettier code style!` · `tsc --noEmit` clean                                                                                   |
| `pnpm test`                                                        | `Tests  202 passed (202)`                                                                                                                             |
| `pnpm test:e2e`                                                    | `43 passed (1.1m)`                                                                                                                                    |
| `pnpm test:mutation`                                               | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                                                                        |
| `scripts/agent/feature-map-smoke.sh` · `/bin/bash` (3.2.57)        | `feature-map-smoke: 18 probes OK` · same. `bash` on PATH is also 3.2, so bash 5 was not run                                                           |
| smoke at b11a96b (the fix not yet applied, copy)                   | `feature-map-smoke: 15 FAIL, 4 ok`, so the hardening probes were red before 2d6247f                                                                   |
| `scripts/verify-red.sh --auto`, range 7570921..HEAD                | `no test(...): B<e>.<n> … (red) commit in range; nothing to verify`, exit 0                                                                           |
| `BASE_SHA=origin/main scripts/verify-red.sh --auto` (CI's shape)   | same line, exit 0. Pass-1 finding 1 is closed                                                                                                         |
| `scripts/verify-red.sh B1.45`                                      | `::error::no 'test(<pkg>): B1.45 … (red)' commit …`, exit 1. Expected: no `*.test.ts`, CI runs `--auto` only                                          |
| `check-suppressions` · `check-feat-commits`                        | `OK: no new suppressions` · `OK: no feat commit touches tests`                                                                                        |
| `check-config-change`                                              | local exit 1 (`.github/pull_request_template.md`, no label in env); `CONFIG_CHANGE_APPROVED=true` → allowed. PR #154 carries `config-change-approved` |
| `check-ac-coverage` · `check-spec-sections` · `check-features-map` | `OK: every criterion of a shipped section has a test` · `OK: sections cited: 1 … 22` · `OK`                                                           |
| `check-plan-scope` · `check-backlog`                               | `OK: chore/B1.45-evidence stays inside the approved plan of B1.45` · `OK: README matches the cards`                                                   |
| `scripts/agent/feature-map.sh` · `--json` (live)                   | heading + `No open agent-ready issues.`, exit 0 · `[]`, exit 0                                                                                        |
| live `gh pr list --json …,isCrossRepository`                       | `156 chore/B1.46-depcruise true false`, `154 chore/B1.45-evidence true false`: same-repo PRs read `false`                                             |
| `git diff --stat main...HEAD`                                      | 6 files, +819: template, 2 scripts, `plan.md`, `pr-body.md`, `review.md`                                                                              |

The caller asked whether the template change inside a `docs(backlog)` commit (43030de) trips a guard. It does not.
`check-config-change.sh` matches on paths only, and PR #154 has the label. `check-feat-commits.sh` reads only
`feat(` subjects. `plan-files.sh` reads only `plan [round N ]approved` subjects. `check-plan-scope` passes because the
template is in the plan's Files table. The PR is squash-merged, so the commit type does not reach main.

### Pass-1 dispositions checked

| #        | Disposition              | Checked                                                                                                                           |
| -------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 1        | fix now                  | 6df8bb5 has no `(red)` in its subject and its body says "Red because"; `--auto` exits 0 over both ranges (above)                  |
| 2        | fix now                  | 2d6247f:40 `[[ "$fork" == false ]] \|\| continue`. Deleting that line on the copy gives 3 FAIL. Live same-repo PRs read `false`   |
| 3        | fix now                  | on the copy: drop `break` → 2 FAIL; `r=4`→`r=3` → 1 FAIL; drop `(round [0-9]+ )?` → 2 FAIL                                        |
| n1       | fix now                  | drop tab gsub / lowercasing / `[[ $# -le 1 ]]` / the backslash escape in `json_str` → 1 FAIL each                                 |
| n2       | fix now                  | template line reads `- AC met: <green>/<total>`, matching the plan's Interfaces block                                             |
| n3       | fix now                  | `pr-body.md:99-104` holds Evidence `3/3 · high · none · n/a`. The card's Acceptance has 3 clauses; posting is covered by ruling A |
| c1 c3 c5 | out of scope → follow-up | each carries a proving input; agreed (D-25)                                                                                       |
| c2 c4    | no change needed         | agreed                                                                                                                            |
| own      | fix now                  | the `pr_of` comment names 3 fields                                                                                                |

### Checklist

| Check                                                | Result                                                                                                                                                                                                                                                          |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance clause has a matching probe         | template (F11), riskiest-first table (F1, F2, F14–F18), print-only (ruling A), label on #154: yes. See finding 1 for State                                                                                                                                      |
| no test weakened after the smoke commit              | `git log --first-parent --no-merges 6df8bb5..HEAD -- feature-map-smoke.sh '*.test.*' e2e/` lists only b11a96b, a `test(...)` commit. It adds probes. F6's row index 10→12 follows the larger fixture, and F7's exact JSON gets stricter. No merges in the range |
| every changed file in `plan.md`                      | yes (plan-scope OK)                                                                                                                                                                                                                                             |
| interfaces match the plan                            | yes. The fork filter adds a fourth `pr list` field inside the plan's "PR = …" rule, no new flag or output                                                                                                                                                       |
| Zod / Prisma / raw SQL / migration                   | n/a (no `src/`, no `prisma/`)                                                                                                                                                                                                                                   |
| no secret, no suppression                            | yes                                                                                                                                                                                                                                                             |
| features map row                                     | n/a (tooling, no §)                                                                                                                                                                                                                                             |
| would a probe fail if one changed line were reverted | 7 pass-1 reverts and the fork filter: all caught. 4 new reverts survive: two are finding 1, two are notes                                                                                                                                                       |

### Findings

```
[1] KIND: coverage
    WHERE: scripts/agent/feature-map.sh:76 (doing/review), :42 (`B[0-9]+\.[0-9]+-cards` lane); smoke :160-202
    DEFECT: two planned behaviours can be reverted with the smoke still at "18 probes OK".
    TRIGGER: on the copy, single edits to feature-map.sh:
             (a) :76 `[[ "$draft" == true ]] && state=doing || state=review` → `state=review`. No probe reads a
                 draft row's State column (B9.2, B9.4, B9.6, B9.9 are drafts), and F7's only PR row is a ready one.
             (b) :42 drop `|B[0-9]+\.[0-9]+-cards`. The fixture has no `docs/B9.1-B9.3-cards` branch, but the
                 interface names the lane and origin/main has the batch filings (#151 "cards B1.42 to B1.46").
    WRONG BEHAVIOUR: (a) every draft PR shows `review`. The plan's "State: … doing (draft) · review (ready)" is
             lost, so the lead cannot tell finished PRs from in-progress ones. (b) a batch-filing PR on
             `docs/B9.1-B9.3-cards` becomes B9.1's PR. Its body (no Evidence) shows `?`, and its tier comes from a
             plan that does not exist (unknown, ranked second).
             Needed: `cell B9.2 5 == "doing"`, plus a `docs/B9.1-B9.3-cards` PR, newer than #101, absent from the output.
    CONFIDENCE: confirmed (ran both mutants on the copy: 18 probes OK each)

[2] KIND: correctness
    WHERE: scripts/agent/feature-map.sh:34 (`gsub(/\t/, " ", v)`), :89 (`json_str`)
    DEFECT: `--json` escapes only `\` and `"`, and `evidence` folds only tab. Any other C0 control character in an
            Evidence value goes out raw, which makes the JSON invalid.
    TRIGGER: on the copy, a PR body whose Evidence line reads
             `- plan deviations: a.ts ESC[31mred ESC[0m b<FF>c <SOH>d` (ANSI colour pasted from a terminal), body
             in CRLF, `feature-map.sh --json`.
    WRONG BEHAVIOUR: exit 0 with output that `JSON.parse` rejects: "Bad control character in string literal in JSON
             at position 112". One row breaks the parse of the whole map, so the orchestrator that publishes `--json`
             daily (follow-up a) gets nothing. CRLF on its own is safe, because the trailing `\r` is trimmed (AC
             read `3/4`). The plan's interface promises "--json: same rows", and pass 1's tab fold handled one case of
             the same defect. Folding `[[:cntrl:]]` in the awk instead of `\t` closes it.
    CONFIDENCE: confirmed (ran it on the copy; node's JSON.parse rejected the output)
```

Notes (not blocking):

- `git log --first-parent` → `git log` in `tier_of` survives. A merged side branch that carries an approval subject
  for this card is the only input that tells them apart. It matches `plan-files.sh` today.
- `^## Evidence[[:space:]]*$` → `^## Evidence` survives. The exact match matters: `pr-body.md` copies `plan.md`,
  and line 37 of B1.45's own body is `## Evidence        (template; …)` followed by `- AC met: <green>/<total>`. With
  the prefix match, the map would read the plan's placeholder. A probe with that body is cheap.
- `[[ "$fork" == false ]]` → `!= true` is equivalent while gh emits only `true`/`false`, so this is not a gap.
- If an agent leaves `- AC met: <green>/<total>` in the body, the markdown cell becomes `<green>/<total>`, and a
  renderer that strips unknown tags shows `/`. Follow-up (b) fills the line, so this is out of scope → follow-up.

Verdict: back to test-writer (finding 1: a `doing` assertion and a `-cards` lane PR; finding 2: a control
character in F7's body, red), then code-writer for finding 2. This will be pass 3 of 3.

Riskiest unfalsified: the tier column against the real `scripts/agent/tier.sh` (B1.44, not built). The map assumes
`tier.sh <plan.md>` exits 0 and prints the word on line 1. Only the stub has run.

### Dispositions (pass 2, dev-lead)

| Pass | #   | Finding (file:line)                                           | Source   | Kind        | Disposition                  | Justification                                                                                                               |
| ---- | --- | ------------------------------------------------------------- | -------- | ----------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 2    | 1   | `feature-map.sh:76` state and `:42` `-cards` reverts survive  | reviewer | coverage    | fix now                      | 6b3cec9 F19 (draft → doing, ready → review) and F5 `docs/B9.1-B9.3-cards`; hand mutants: state 1 FAIL, `-cards` 5 FAIL      |
| 2    | 2   | `--json` passes C0 controls raw (ESC, SOH) → JSON.parse fails | reviewer | correctness | fix now                      | 6b3cec9 F7 CRLF body with ESC and SOH (pre-fix script: F7 FAIL only); 78009c3 folds `[[:cntrl:]]`; 20 probes OK on bash 3.2 |
| 2    | n1  | dropping `--first-parent` survives                            | reviewer | coverage    | fix now                      | 6b3cec9 + dated fixture: F20 (approval only on a merged side branch); revert → 2 FAIL                                       |
| 2    | n2  | a prefix `## Evidence` match survives                         | reviewer | coverage    | fix now                      | 6b3cec9 F4 body with `## Evidence notes`; revert → 1 FAIL                                                                   |
| 2    | n3  | an unfilled `<green>/<total>` renders badly in markdown       | reviewer | process     | out of scope → follow-up (b) | the runner / dev-lead fills Evidence (follow-up (b)); input: a body left as the template                                    |

## Diff review (pass 3)

Reviewed b5bfaa6..d627413 (6b3cec9 probes F19, F20, F5 `-cards`, F7 CRLF + ESC/SOH, F4 `## Evidence notes`;
78009c3 `[[:cntrl:]]` fold; 7fba040 dated F20 fixture; d627413 dispositions) against the approved plan, the card's
Acceptance, D-19/D-25/D-27/D-28 and the pass-2 dispositions. Probes and mutants ran on a scratch copy (`git archive
HEAD`, re-initialised), never on this tree. Last pass: only a regression, a broken Acceptance line or a failing probe
blocks (D-25).

### Commands (last line each)

| Command                                                            | Result                                                                                                            |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` · `pnpm typecheck`                                     | `All matched files use Prettier code style!` · `tsc --noEmit` exit 0                                              |
| `pnpm test` · `pnpm test:e2e` · `pnpm test:mutation`               | `Tests  202 passed (202)` · `43 passed (57.7s)` · `Final mutation score of 93.40 … threshold 70`                  |
| `scripts/agent/feature-map-smoke.sh` · `/bin/bash` 3.2.57          | `feature-map-smoke: 20 probes OK` · same                                                                          |
| new smoke against b5bfaa6's `feature-map.sh` (copy)                | `feature-map-smoke: 1 FAIL, 19 ok` (F7 only): the fold probe was red before 78009c3                               |
| `check-suppressions` · `check-feat-commits`                        | `OK: no new suppressions` · `OK: no feat commit touches tests`                                                    |
| `check-config-change` (`CONFIG_CHANGE_APPROVED=true`)              | `allowed by label config-change-approved: .github/pull_request_template.md`; #154 has the label                   |
| `check-ac-coverage` · `check-spec-sections` · `check-features-map` | `OK: every criterion …` · `OK: sections cited: 1 … 22` · `OK`                                                     |
| `check-plan-scope` · `check-backlog`                               | `OK: … stays inside the approved plan of B1.45` · `OK: README matches the cards`                                  |
| `BASE_SHA=origin/main scripts/verify-red.sh --auto`                | `no test(...): B<e>.<n> … (red) commit in range; nothing to verify` (no `(red)` subject, as planned since pass 1) |
| `git merge-tree --write-tree origin/main HEAD`                     | clean. origin/main gained B1.43/B1.46 (4 commits); none touches `feature-map*` or the template                    |
| `git diff --stat main...HEAD`                                      | 6 files, +956: template, 2 scripts, `plan.md`, `pr-body.md`, `review.md`                                          |

### Pass-2 dispositions checked

| #   | Disposition                  | Checked (single-line mutant on the copy → smoke)                                                                                                                              |
| --- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | fix now                      | `state=review` only → 1 FAIL (F19); drop `\|B[0-9]+\.[0-9]+-cards` → 5 FAIL                                                                                                   |
| 2   | fix now                      | `[[:cntrl:]]` → `\t` → 1 FAIL (F7). Every C0 byte (001–037 bar LF), DEL, C1 U+0085, `\377` and an em dash in one deviations value: `--json` output passes node's `JSON.parse` |
| n1  | fix now                      | `git log --first-parent` → `git log` → 2 FAIL (F20 dated, so the side approval sorts first)                                                                                   |
| n2  | fix now                      | `^## Evidence[[:space:]]*$` → `^## Evidence` → 1 FAIL (F4)                                                                                                                    |
| n3  | out of scope → follow-up (b) | agreed; input stated                                                                                                                                                          |

Regression sweep: the pass-1 mutants re-run against the new smoke all still FAIL (fork filter 3, `break` 2, `r=4` 2,
round N 2, lowercasing 1, `$# -le 1` 1, JSON backslash 1, `(unapproved)` 1, markdown `|` escape 1). `[[:cntrl:]]`
on macOS awk 20200816 keeps UTF-8 bytes under `C` and `en_US.UTF-8` (em dash, CJK intact); gawk/mawk not run here.

### Checklist

| Check                                                | Result                                                                                                                                                                                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every Acceptance clause has a matching probe         | template Evidence (F11), riskiest-first table (F1, F2, F14–F20), posting by ruling A, label on #154: yes                                                                                                                             |
| no test weakened after the smoke commit              | `--first-parent --no-merges 6df8bb5..HEAD`: b11a96b, 6b3cec9, 7fba040, all `test(...)`, all add probes; F1/F6 row lists grow with the B9.13 row, F7's `want` grows with the folded bytes, F5's grep widens to `#11[2-68]`. No merges |
| every changed file in `plan.md`                      | yes (plan-scope OK)                                                                                                                                                                                                                  |
| interfaces match the plan                            | yes; 78009c3 widens the fold inside `evidence`, no new flag or output                                                                                                                                                                |
| Zod / Prisma / raw SQL / migration                   | n/a                                                                                                                                                                                                                                  |
| no secret, no suppression                            | yes                                                                                                                                                                                                                                  |
| features map row                                     | n/a (tooling, no §)                                                                                                                                                                                                                  |
| would a probe fail if one changed line were reverted | 78009c3's line: yes (F7). Survivors: trim/fold order swap (finding 1), fetch-failure branch (note)                                                                                                                                   |

### Findings

```
[1] KIND: correctness
    WHERE: scripts/agent/feature-map.sh:34 (trim, then fold)
    DEFECT: the fold runs after the trim, so a value made only of control characters becomes spaces, not "?".
    TRIGGER: a PR body whose Evidence line is `- AC met: <SOH><ESC>` (copy, `--json`).
    WRONG BEHAVIOUR: `"ac":"  "` and a blank markdown cell instead of the plan's "empty value → ?" (r1 #6);
             `- plan deviations: none<ESC>` gives `"none "` with a trailing space. Not a regression (b5bfaa6
             printed the raw bytes), no Acceptance line broken, no probe fails; swapping the two gsubs survives the
             smoke. Out of scope → follow-up (D-25, pass 3): fold before trim, probe a control-only value.
    CONFIDENCE: confirmed (ran it on the copy)
```

Notes (not blocking):

- Fetch failure: deleting `|| { warn …; echo unknown; return; }` at :50 survives (no fixture branch is missing on
  origin). Near-equivalent: a stale `FETCH_HEAD` from another card holds no `backlog/work/<card>/plan.md`, so the
  row still reads unknown; only the stderr warning is lost. Fold into follow-up (c) (smoke in CI) if wanted.
- `GH_REPO` / `GH_HOST`: origin/main's `scripts/agent/eligible.sh` (B1.43) runs gh under `env -u GH_REPO -u GH_HOST`;
  `feature-map.sh` does not. Trigger: `GH_REPO=other/repo` in the orchestrator's environment → issues and PRs from
  that repo, tiers fetched from this checkout's origin (unknown, or a same-named branch's plan). Out of scope →
  follow-up (a), plausible.
- `pr-body.md` Evidence prose still says "review pass 1 added a `test` and a `fix` commit"; passes 2–3 added more,
  and "## Review" reads `pending`. The dev-lead fills both before the PR goes ready.
- origin's head of #154 is still be98af2; the 18 commits since are unpushed, so CI has not run them yet.

Verdict: ready for PR

Riskiest unfalsified: the tier column against the real `scripts/agent/tier.sh` (B1.44, not on origin/main). The map
assumes `tier.sh <plan.md>` exits 0 with the word on line 1; only the stub has run.

### Dispositions (pass 3, dev-lead)

| Pass | #   | Finding (file:line)                                         | Source   | Kind        | Disposition              | Justification                                                                                                  |
| ---- | --- | ----------------------------------------------------------- | -------- | ----------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| 3    | 1   | `feature-map.sh:34` trims before folding control characters | reviewer | correctness | out of scope → follow-up | input `- AC met: <SOH><ESC>` → `"ac":"  "` not `?`; no regression, no Acceptance line broken (D-25, last pass) |
| 3    | n1  | the fetch-failure warning is untested                       | reviewer | coverage    | no change needed         | output identical (row reads unknown); only the stderr warning differs                                          |
| 3    | n2  | `GH_REPO` / `GH_HOST` not unset (as `eligible.sh` does)     | reviewer | hardening   | out of scope → follow-up | the runner's environment (follow-up (a)); the orchestrator runs it from a clean session                        |
| 3    | n3  | `pr-body.md` Evidence and Review describe pass 1 only       | reviewer | process     | fix now                  | body rewritten in Loop 9 with passes 1–3                                                                       |

Passes 3/3; ready for PR. Follow-ups for the closing PR (ids from B1.51): (a) runner writes `tier:` and an attended
orchestrator session posts the map daily, unset `GH_REPO`/`GH_HOST`; (b) `dev-lead.md` Loop 9 / `pr-body.md` fill
Evidence after CI green; (c) feature-map smoke in CI; (d) card id from B1.43's form field, not the first id in the
title; (e) `--limit 100` truncation; (f) fold control characters before trimming.
