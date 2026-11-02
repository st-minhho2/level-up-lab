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

## Diff review (pass 1)

Diff `origin/main...HEAD` (7 commits, 6 files, +564). Red is `ba64613 test(scripts): B1.43 eligibility probes` and
green is `804ce7d chore(scripts): B1.43 agent-ready eligibility check`. PR #155's remote head is still `533591b`, so the
red and green commits are not pushed yet.

### Command results (run by the reviewer at 804ce7d)

| Command                                                          | Last line                                                                                                                                 |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                      | `All matched files use Prettier code style!` (0 errors)                                                                                   |
| `pnpm typecheck`                                                 | `tsc --noEmit` clean                                                                                                                      |
| `pnpm test`                                                      | `Tests  202 passed (202)`                                                                                                                 |
| `pnpm test:e2e`, `pnpm test:mutation`                            | not run: no change under `src/`, `prisma/` or `e2e/`, so there is nothing new for either to measure                                       |
| `scripts/agent/eligible-smoke.sh`                                | `9 probes OK`                                                                                                                             |
| `/bin/bash …/eligible-smoke.sh` (GNU bash 3.2.57, the only bash) | `9 probes OK`                                                                                                                             |
| smoke at `ba64613` (no `eligible.sh`)                            | `9 of 9 probes FAILED` (red)                                                                                                              |
| `scripts/verify-red.sh B1.43`                                    | `no 'test(<pkg>): B1.43 … (red)' commit`: expected. The plan drops `(red)` because the probe is a shell smoke (B1.29 and B1.32 precedent) |
| `check-suppressions.sh`                                          | `OK: no new suppressions`                                                                                                                 |
| `check-config-change.sh`                                         | without the label: error on `.github/ISSUE_TEMPLATE/agent-task.yml`. With `CONFIG_CHANGE_APPROVED=true`: allowed. PR #155 has the label   |
| `check-feat-commits.sh`                                          | `OK: no feat commit touches tests`                                                                                                        |
| `check-ac-coverage.sh`                                           | `OK: every criterion of a shipped section has a test`                                                                                     |
| `check-spec-sections.sh`                                         | `OK: sections cited: 1 … 22`                                                                                                              |
| `check-features-map.sh`                                          | `OK`                                                                                                                                      |
| `check-backlog.sh`                                               | `OK: README matches the cards`                                                                                                            |
| `check-plan-scope.sh`                                            | `OK: chore/B1.43-eligible stays inside the approved plan of B1.43`                                                                        |
| `next-task.sh --check B1.43`                                     | `B1.43: no overlap with any Doing or Review card`                                                                                         |
| `ruby -ryaml` form check (reviewer's own)                        | `form OK 4 fields, title="B<e>.<n> "`, exit 0                                                                                             |
| live `scripts/agent/eligible.sh 1`                               | `eligible: #1 not labeled agent-ready`, exit 1                                                                                            |
| live `gh api --paginate …/issues/150/events`                     | ascending `created_at` (labeled 04:46:01, merged 04:51:15, closed 04:51:15), so the script's "last line decides" holds on this sample     |

### Revert probes (copies in the scratchpad, smoke unchanged)

| Mutant of `eligible.sh`                              | Smoke result               |
| ---------------------------------------------------- | -------------------------- |
| author check removed (`author_role=admin`)           | 4 of 9 FAILED              |
| labeler check removed                                | 6 of 9 FAILED              |
| `read` accepted                                      | 3 of 9 FAILED              |
| first event decides (`head -1`)                      | 2 of 9 FAILED              |
| `GH_REPO` kept                                       | 1 of 9 FAILED              |
| `--paginate` dropped                                 | 1 of 9 FAILED              |
| `cd` to the repo root dropped                        | 1 of 9 FAILED              |
| label-present check (l.27) deleted                   | 1 of 9 FAILED              |
| last-event-is-labeled check (l.33) deleted           | 1 of 9 FAILED              |
| `grep -qxF` → `grep -qF` (l.27, exact match dropped) | **9 probes OK** (survives) |
| empty-actor check (l.35) deleted                     | **9 probes OK** (survives) |

### Checklist

| Check                                                       | Result                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance clause has a probe whose assertion matches | pass. Form fields: the reviewer's ruby check. Write, maintain or admin → 0: E1 and E5. Read-only actor: E2. Removed and re-added: E3. Missing: E4. Reason on stderr: exact substrings. `config-change-approved`: on #155                                          |
| no test weakened after red                                  | pass. `git log --first-parent --no-merges ba64613..HEAD -- scripts/agent/eligible-smoke.sh '*.test.*' e2e/` is empty, and the range has no merges                                                                                                                 |
| every changed file is in `plan.md`                          | pass. All 6 files are in the Files table, and `check-plan-scope.sh` says OK                                                                                                                                                                                       |
| interfaces match the plan                                   | pass, with one nit: the three `gh api` calls and `--jq` filters match byte for byte (E1 asserts the log). The stdout line matches. The stderr reasons match, plus one extra reason the plan does not list, "label's last event has no actor" (l.35, fails closed) |
| Zod at actions, Prisma only in lib, no raw SQL, migration   | n/a: no TypeScript, no `prisma/`                                                                                                                                                                                                                                  |
| no secret, no suppression                                   | pass. The smoke's single `# shellcheck disable=SC2086` is a shell comment, deliberately word-splitting `$args`, and `check-suppressions.sh` passes                                                                                                                |
| features map row moved                                      | n/a: tooling with no feature row. The PR body says "Map delta: None"                                                                                                                                                                                              |
| D-27, D-28, D-19                                            | pass. The form has no `labels:` (D-27). The tier is high from `.github/` and the lead's approve is recorded (D-28). The label is on #155 (D-19)                                                                                                                   |

### Findings

```
[1] KIND: plan-mismatch
    WHERE: backlog/work/B1.43/pr-body.md:65
    DEFECT: the `ruby -ryaml` form check still states only its assertions, without the command line or its expected
            exit. Plan review round 2 made adding both a condition of this diff review.
    TRIGGER: the lead, or B1.46's CI wiring, tries to re-run the form check from the PR body.
    WRONG BEHAVIOUR: the verification is not reproducible as written, though `planning.md` requires "the exact
            commands and the expected result".
    CONFIDENCE: confirmed (read pr-body.md at 804ce7d)

[2] KIND: coverage
    WHERE: scripts/agent/eligible.sh:27
    DEFECT: no probe pins the exact-match `-x` on the label-present check. Reverting it to a substring match leaves
            9 of 9 probes OK.
    TRIGGER: the issue carries a label such as `agent-ready-old` but not `agent-ready`, while its last `agent-ready`
            event is still `labeled`. That happens if the lead deletes the `agent-ready` label from the repository,
            assuming GitHub records no `unlabeled` event when it strips a deleted label (not run).
    WRONG BEHAVIOUR: none today, because the code uses `-x`. A future edit could drop it and nothing would catch it,
            so the issue would be accepted without the label.
    CONFIDENCE: confirmed that the mutant survives (ran it). Plausible that the triggering state occurs.
```

Not blocking: l.35 (the empty-actor check) also survives a revert. Without it, an empty login reaches
`collaborators//permission`, which fails closed as "gh failed", so it only guards the reason text. The bot-login 404
note from plan review round 2 still applies.

Verdict: back to code-writer (only [1]: put the command and exit 0 in `pr-body.md`). [2] is a suggested hardening
probe for the test-writer as `test(scripts): B1.43 review pass 1 -- …`. It does not block on its own.

Riskiest unfalsified: GitHub's label event semantics behind the two state checks. Not run: whether deleting or renaming
a label emits `unlabeled` events, whether events stay in ascending order across `--paginate` pages (only a 3-event
issue was checked), and whether triage can edit an issue body.

## Diff review (pass 2)

Head `2c0e39f`, which is not pushed. PR #155's remote head is still `533591b` and the PR carries `config-change-approved`.
Since pass 1 there are two new commits. `6394630 test(scripts): B1.43 review pass 1 -- exact label and no-actor
probes` adds 4 lines to E4 and edits one header comment. `2c0e39f` adds a "Verification run" section to `pr-body.md`.
`eligible.sh` and `agent-task.yml` have not changed since `804ce7d`.

### Command results (run by the reviewer at 2c0e39f)

| Command                                       | Last line                                                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                   | `All matched files use Prettier code style!`, exit 0                                                          |
| `pnpm typecheck`                              | `tsc --noEmit` clean                                                                                          |
| `pnpm test`                                   | `Tests  202 passed (202)`                                                                                     |
| `pnpm test:e2e`, `pnpm test:mutation`         | not run: nothing under `src/`, `prisma/` or `e2e/` changed, same as pass 1                                    |
| `scripts/agent/eligible-smoke.sh`             | `9 probes OK`                                                                                                 |
| `/bin/bash scripts/agent/eligible-smoke.sh`   | `9 probes OK`                                                                                                 |
| `check-suppressions.sh`                       | `OK: no new suppressions`                                                                                     |
| `check-config-change.sh`                      | exit 1 without the label. With `CONFIG_CHANGE_APPROVED=true`: `allowed by label config-change-approved`       |
| `check-feat-commits.sh`                       | `OK: no feat commit touches tests`                                                                            |
| `check-ac-coverage.sh`                        | `OK: every criterion of a shipped section has a test`                                                         |
| `check-spec-sections.sh`                      | `OK: sections cited: 1 … 22`                                                                                  |
| `check-features-map.sh`                       | `OK`                                                                                                          |
| `check-backlog.sh`                            | `OK: README matches the cards`                                                                                |
| `check-plan-scope.sh`                         | `OK: chore/B1.43-eligible stays inside the approved plan of B1.43`                                            |
| `verify-red.sh B1.43`                         | `no 'test(<pkg>): B1.43 … (red)' commit`. This is expected per the plan, as in pass 1 (B1.29/B1.32 precedent) |
| `next-task.sh --check B1.43`                  | `B1.43: no overlap with any Doing or Review card`                                                             |
| PR body's ruby block, extracted verbatim, run | `form OK: 4 required fields, no labels`, exit 0                                                               |

### Pass 1 findings

- [1] is closed. I extracted the fenced `ruby -ryaml` block in `pr-body.md` byte for byte and ran it from the root
  of a copy. On the shipped form it exits 0 with the stated line. I also ran it on three form mutants to show the check
  can fail. Adding `labels: ["agent-ready"]` gives exit 1 with `top`. Setting `required: false` gives exit 1 with
  `field card`. Changing the id `spec` to `spek` gives exit 1 with `ids …`.
- [2] is closed. On a scratch copy, the `grep -qF` mutant now fails 1 of 9 (E4), and so does deleting the no-actor
  line. The look-alike fixture has labels `not-agent-ready` and `agent-ready-later`, and both contain `agent-ready` as
  a substring, so the probe really pins `-x`.

### Revert probes (scratch copy, smoke at 2c0e39f): 16 mutants, 16 killed

| Mutant of `eligible.sh`                            | Smoke         |
| -------------------------------------------------- | ------------- |
| `grep -qxF` → `grep -qF`                           | 1 of 9 FAILED |
| no-actor check deleted                             | 1 of 9 FAILED |
| author check removed                               | 4 of 9 FAILED |
| labeler check removed                              | 6 of 9 FAILED |
| `read` accepted                                    | 3 of 9 FAILED |
| first event decides (`head -1`)                    | 2 of 9 FAILED |
| `GH_REPO` kept / `GH_HOST` kept                    | 1 / 1 FAILED  |
| `--paginate` dropped                               | 1 of 9 FAILED |
| `cd` to the repo root dropped                      | 1 of 9 FAILED |
| label-present check deleted                        | 1 of 9 FAILED |
| last-event-is-labeled check deleted                | 1 of 9 FAILED |
| `unlabeled` dropped from the events filter         | 2 of 9 FAILED |
| `.label.name == "agent-ready"` dropped from filter | 2 of 9 FAILED |
| usage regex loosened to `^[0-9]+$`                 | 1 of 9 FAILED |
| `.role_name` decides instead of `.permission`      | 3 of 9 FAILED |

### Checklist

| Check                                        | Result                                                                                                                                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every Acceptance clause has a matching probe | pass. Same as pass 1, and E4 now also covers the look-alike label and the null actor                                                                                                                                                                         |
| no test weakened after red                   | pass. `git log --first-parent --no-merges ba64613..HEAD -- eligible-smoke.sh '*.test.*' e2e/` lists only `6394630`. That is a `test(...)` commit that adds 4 probe lines and rewords one header comment, and it removes no assertion. The range has 0 merges |
| every changed file is in `plan.md`           | pass. 6 files, all in the Files table, and `check-plan-scope.sh` says OK                                                                                                                                                                                     |
| interfaces match the plan                    | pass. The extra stderr reason ("label's last event has no actor") is now stated in the PR body as beyond the plan                                                                                                                                            |
| Zod / Prisma / raw SQL / migration           | n/a: no TypeScript, no `prisma/`                                                                                                                                                                                                                             |
| no secret, no suppression                    | pass                                                                                                                                                                                                                                                         |
| features map row                             | n/a: tooling. The PR body says "Map delta: None"                                                                                                                                                                                                             |
| D-27, D-28, D-19                             | pass. The form has no `labels:`. The tier is high and the lead approved it. `config-change-approved` is on #155                                                                                                                                              |

### Findings

No blocking finding.

Not blocking, and not a finding because I have no trigger I can run: GitHub usually shows a deleted account as the
`ghost` user rather than `actor: null` (not verified live). If so, the no-actor branch cannot be reached live. A `ghost`
labeler goes to `collaborators/ghost/permission` and gets a 404, which ends as "gh failed", so it still fails closed.
Only the reason text would differ.

Verdict: ready for PR. Push `6394630` and `2c0e39f` first: the remote head is still `533591b`, so CI has not yet seen
the red, green or hardening commits.

Riskiest unfalsified: GitHub's live event semantics behind the "last `agent-ready` event decides" rule. Three things
are not checked. Are events in ascending order across `--paginate` page boundaries? (I checked one 3-event issue.)
Does deleting or renaming a label emit `unlabeled`? How is a deleted actor represented? None of these can be checked
until the `agent-ready` label exists and B1.44's first run.
