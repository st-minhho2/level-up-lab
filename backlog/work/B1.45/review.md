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
