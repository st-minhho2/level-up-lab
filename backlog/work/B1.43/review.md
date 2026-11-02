# B1.43 review

## Plan review (round 1)

The plan under review is `3f50c86 docs(backlog): B1.43 plan`. B1.43 is a tooling card with no §. Its contract is the
card's Acceptance (`backlog/plan/E1-todos.md` ### B1.43) together with D-19, D-27 and D-28. I checked the following
read-only:

- The repository has `visibility: PUBLIC`. It has one collaborator, the lead, with role `admin`.
- `gh label list` has no `agent-ready` label.
- `gh api …/collaborators/<lead>/permission` returns `{"permission":"admin","role_name":"admin"}`, so the API has
  two separate fields.
- `gh api --paginate …/issues/150/events` returns events oldest first with `event`, `actor.login` and `label.name`. This
  matches the plan's filter.
- Issue #1 is a closed pull request with no labels.
- `node -e "require('js-yaml')"` from the worktree root fails with `MODULE_NOT_FOUND`. js-yaml is present only under
  `node_modules/.pnpm/`. `ruby -ryaml` is available.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: tooling, no § and no map row. The three new files are the card's Acceptance and Test, and the rest are `work/B1.43/`. The plan touches no file owned by B1.45 (`pull_request_template.md`, `feature-map*.sh`) or B1.46 (`ci.yml`, `package.json`), and not `scripts/CLAUDE.md`  |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no TypeScript, no action, no Prisma. The script interface is given as a signature with exit codes and messages                                                                                                                                                            |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no `advice.md`. The plan says the quick tier skips spec-analyst and advisor                                                                                                                                                                                            |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | fail: E2 and E5 probe permission values that `.permission` never returns (reason 3). The approach also has an unstated cost: content edited after the label still passes (reason 4)                                                                                                   |
| verification lists exact commands with expected numbers                           | fail: the YAML check command fails as written, and it would accept an invalid form (reason 2). `pnpm test` has no expected count (reason 6)                                                                                                                                           |
| work breakdown has skeleton → red → green → map → review with convention subjects | fail: no § means no skeleton or map, so the order itself is fine. But the `(red)` marker on a commit with only a smoke file makes CI's `verify-red.sh --auto` fail (reason 1)                                                                                                         |
| `Lead approves spec` box ticked only by a human                                   | pass (n/a): no section. `Plan approved by:` is empty. Tier high (`.github/.*` matches `check-config-change.sh`'s PROTECTED), so the lead's `approve` gate holds, as the plan states                                                                                                   |
| no settled D-n contradicted                                                       | pass: D-27 holds because the form applies no label and only the lead adds `agent-ready`. D-28 holds because the tier the plan states matches the protected regex. D-19 holds because the plan names the label. D-26 holds because the script runs locally and nothing runs on Actions |
| `scripts/next-task.sh --check B1.43` says no overlap                              | pass: `[next-task] B1.43: no overlap with any Doing or Review card` (exit 0). `check-backlog.sh`: `OK: README matches the cards`. `check-plan-scope.sh`: `OK: … changes only paperwork`                                                                                               |

### Reasons (numbered)

1. **The red commit's subject breaks CI.**
   - Where: `scripts/verify-red.sh:45`, `:72-75`; `ci.yml:156-158`.
   - Trigger: the PR range contains `test(scripts): B1.43 eligibility smoke (red)`, which touches only
     `scripts/agent/eligible-smoke.sh`.
   - On pull requests, CI runs `verify-red.sh --auto`. Its `sed` picks B1.43 out of any `test(…): B… (red)` subject.
     `verify_feat` then greps that commit's files for `\.test\.tsx?$`, finds none, prints
     `::error::test(B1.43) commits touch no *.test.ts(x) file` and exits 1. That makes a required check red on a
     correct PR.
   - Precedent: smoke-only cards land the probes without the marker, for example `084bccb test(hooks): B1.32 plan-scope
probes …` and `1ae8fbb test(scripts): B1.29 verify-red base-run probes`.
   - Fix:
     - Drop `(red)` from the subject.
     - Keep the red evidence (the smoke's exit 1 and E1–E8 FAIL output) in the commit body and in `pr-body.md`.
     - Say in the plan that `verify-red.sh B1.43` does not apply to a smoke.
   - Confidence: confirmed (traced). A run on a throwaway clone was denied, so this is traced, not executed.
2. **The issue form check cannot run, and it would pass an invalid form.**
   - The form is missing a required key. GitHub issue forms require the top-level keys `name`, `description` and
     `body`. The plan's form lists `name` and `title` but no `description`. Without it, the form is invalid and does
     not show in the template chooser. GitHub reports this only on the default branch, after the merge.
   - The check command fails. `node -e` with `js-yaml` exits `MODULE_NOT_FOUND`, because pnpm does not hoist js-yaml
     to the root and it is not a direct dependency. Adding it would be a dependency change, which this card rules
     out.
   - Fix:
     - Add `description:` to the form.
     - Run the check with a parser that is present, for example `ruby -ryaml -e …`, which is available here.
     - Assert `name` and `description` are non-empty strings, there is no `labels` key, and the four ids are exactly
       `card, spec, acceptance, out_of_scope`.
     - For each field, assert `validations.required == true`, which is where issue forms keep it, not `required:` at
       field level. Also assert `attributes.label` is non-empty and `type` is in `input|textarea|markdown`.
   - Confidence: the missing module is confirmed (ran). The missing `description` is plausible (from GitHub's
     issue-forms syntax; not run against GitHub).
3. **E2 and E5 test permission values the API never returns from `.permission`.**
   - Trigger: a real maintainer or triager labels an issue.
   - `GET /collaborators/{u}/permission` returns `permission` as the legacy base role (`admin|write|read|none`). There,
     maintain maps to `write` and triage to `read`. The actual role is in a separate `role_name` field, and the live
     call above shows both fields.
   - The smoke's fixtures `{"permission":"maintain"}` and `{"permission":"triage"}` cannot occur. E5 "maintain → 0"
     and E2 "triage → 1" therefore prove nothing about real maintainers or triagers. The stdout `(<permission>)`
     would also print `write` for a maintainer.
   - Fix: choose one field and make the fixtures mirror the real response.
     - `.permission`: maintain → `{"permission":"write","role_name":"maintain"}`. A custom role with write base passes.
     - `.role_name` ∈ `admin|maintain|write`: a custom role fails closed.
     - Either way, state the choice in Interfaces.
   - Confidence: plausible (from GitHub's REST docs; both fields confirmed live, but the maintain and triage mapping
     was not observed, because the repository has a single admin).
4. **Cost not stated: the issue can be edited after the lead's label, and the check still passes.**
   - Trigger:
     1. A non-collaborator opens an agent-task issue on this PUBLIC repository.
     2. The lead reads it and adds `agent-ready`.
     3. The author edits the body's acceptance or out-of-scope, or the title.
   - Wrong behavior: `eligible.sh` still exits 0, because it checks only who labeled. Under D-27 the label is the spec
     approval, so the runner (B1.44) would build a spec the lead never saw.
   - The Acceptance's "exits 0 only when" allows a stricter check. Possible ways to close this:
     - (a) Also require the issue author's permission to be write or higher. A non-writer cannot edit another user's
       issue, so this closes body edits by outsiders.
     - (b) Reject when a `renamed` event or the issue's GraphQL `lastEditedAt` falls after the deciding `labeled`
       event's `created_at`.
   - Either the plan adds one of these with a probe, or it names the cost and the card that closes it, so the lead
     accepts it when approving.
   - Confidence: plausible. Authors can edit their own issues on GitHub, but I did not run an edit.
5. **The `agent-ready` label does not exist, and no role in the plan creates it.**
   - `gh label list` shows no `agent-ready` label. The lead cannot apply a label that does not exist, and an agent
     creating repository labels is not covered by D-19, which covers only adding `config-change-approved` to PRs.
   - Fix: say who creates it (the lead, `gh label create agent-ready`), and when: before B1.44's first real run.
   - The only live probe exercises the negative path. `eligible.sh 1` returns "not labeled agent-ready", but #1 is a
     closed pull request (accepted for now, because skipping PRs is B1.44's).
   - Confidence: confirmed (ran `gh label list`, `gh api …/issues/1`).
6. **Smaller gaps in the verification section.**
   - (a) It is not stated where `{owner}/{repo}` comes from. With `GH_REPO` unset, `gh` takes it from the git remote of
     the caller's directory. If B1.44 calls the script from outside a checkout, for example the runs folder of
     B1.42's spike, every issue gets "gh failed". The check still fails closed, but it would be unusable from there.
     State that the script `cd`s to its own repository root, and add a probe for it.
   - (b) `pnpm test` "green" needs its expected count, as `planning.md` requires.
   - Confidence: (a) plausible, traced from `gh`'s placeholder resolution. (b) confirmed (plan text).

Verdict: changes requested

## Plan review (round 2)

The plan under review is `3dde344 docs(backlog): B1.43 plan round 2 and plan review round 1`. I checked the following
read-only:

- `pnpm test` at 3dde344: `Tests  202 passed (202)`, which matches the plan's expected count.
- `gh api …/collaborators/octocat/permission` (a non-collaborator on this public repository) returns `read	read`.
  The author check therefore rejects an outsider's issue. An unknown login returns HTTP 404, and the plan routes that
  to "gh failed" (exit 1).
- `gh api …/issues/150 --jq '.user.login, .labels[].name'` prints the author first and then one label per line, which
  is the shape the plan parses.
- `jq` 1.7.1 (`/usr/bin/jq`) and `ruby -ryaml` (Psych 3.1.0) are both present, so the shim and the form check add no
  dependency.
- The plan is 72 lines, against `planning.md`'s ≈ 40. The precedent is B1.42's approved plan at 76 lines, and most of
  the length is table rows. Not blocking.

| Check                                                                             | Result                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1. Three new files from the card's Acceptance and Test, plus `work/B1.43/`. Nothing owned by B1.45 or B1.46, and not `scripts/CLAUDE.md`                                                                                              |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no TypeScript. The interface lists exit codes, exact messages, the three `gh api` calls with their `--jq` filters, and which field decides (`.permission`)                                                                                           |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no `advice.md`, and the plan states that the quick tier skips it                                                                                                                                                                                  |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: the card has 4 Acceptance clauses. E1–E9 are probes with exit codes and messages. r1 #3 is fixed (fixtures pair `permission` with `role_name`). r1 #4 is closed by the author check, and its cost is stated for the lead                                   |
| verification lists exact commands with expected numbers                           | pass: "9 probes OK" under both bashes, 202 tests, and the live `eligible.sh 1` → exit 1 with its message. One nit: the `ruby -ryaml` check gives its assertions but not the command line or its expected exit. The diff review will require both in `pr-body.md` |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: no § means no skeleton or map. The red subject no longer carries `(red)` (r1 #1), with B1.29 and B1.32 as precedent, and the plan says why `verify-red.sh` does not apply                                                                                  |
| `Lead approves spec` box ticked only by a human                                   | pass (n/a): no section. `Plan approved by:` is empty. Tier high (`.github/.*` is in PROTECTED), so the lead's `approve` holds and the PR carries `config-change-approved`                                                                                        |
| no settled D-n contradicted                                                       | pass: D-27 holds because the form sets no `labels:`. D-28 holds because the tier is high, from a PROTECTED path. D-19 holds because the label is named. D-26 holds because the script runs locally only                                                          |
| `scripts/next-task.sh --check B1.43` says no overlap                              | pass: `[next-task] B1.43: no overlap with any Doing or Review card` (exit 0). `check-plan-scope.sh`: `OK: … changes only paperwork`. `check-backlog.sh`: `OK: README matches the cards`                                                                          |

Round 1 reasons:

1. Fixed: `(red)` is dropped and the reason is stated.
2. Fixed: the plan adds `description` and switches the check to `ruby -ryaml`. The assertions now include
   `validations.required` and `attributes.label`.
3. Fixed: the plan decides on `.permission`. Fixtures for maintain → `write` and triage → `read` mirror the API.
4. Fixed: the plan adds the author write check, probed by E9. The cost (an outsider's issue is never eligible) is
   stated for the lead.
5. Fixed: the lead creates the label, and it is listed under not in scope. The live probe covers only the first call,
   and the plan says so.
6. Fixed: (a) the script `cd`s to its repository root, probed by E9. (b) The expected count is 202.

Non-blocking notes, for the lead before approving:

- **Bot logins.** A `name[bot]` labeler or author (for example a workflow applying the label) makes the permission
  endpoint return 404. The script then exits 1 with "gh failed" rather than "needs write". It fails closed, but the
  reason is misleading.
- **Other write collaborators are trusted.** Any write collaborator other than the lead can still label, or edit the
  body after the label, and pass the check. The card's Acceptance accepts this ("write, maintain or admin"). Today the
  only collaborator is the lead (round 1).

Verdict: approved (ready for the lead's `approve` gate. Tier high, so this is not approval to build)

Riskiest unfalsified: the claim that only the author and write-or-higher collaborators can edit an issue's body or
title (that triage cannot) was not run. Whether the issue form renders in the template chooser is visible only on the
default branch after the merge.
