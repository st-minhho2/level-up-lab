# B1.82 review

## Plan review (round 1)

SCOPE: all (tooling, no §: `scripts/agent/`, `backlog/`). Plan at `7af3977`. Read: card B1.82
(`backlog/plan/E1-todos.md`), `plan.md`, `filing-pr-body.md`, `scripts/agent/run.sh` (header, `in_flight`,
`run_issue`), `scripts/agent/run-smoke.sh` (whole), `scripts/worktree.sh` (branch reuse), `scripts/CLAUDE.md`,
D-19/D-26/D-27/D-28 in `00-decisions.md`, and B1.86's plan review (the tooling precedent).

Commands run (nothing on the tree; probes on a `git archive HEAD` copy under `$TMPDIR`):

- `scripts/next-task.sh --check B1.82` gave `[next-task] B1.82: no overlap with any Doing or Review card` (exit 0).
- `scripts/agent/tier.sh backlog/work/B1.82/plan.md` gave `high`, as the plan states.
- `scripts/ci/plan-files.sh --any B1.82 HEAD` gave 3 tokens, the Files table exactly.
- `scripts/ci/check-backlog.sh` gave `[check-backlog] OK: README matches the cards`.
- `scripts/agent/run-smoke.sh` on the copy, `/bin/bash` 3.2.57: R1–R17 `ok`, `17 probes OK`, 47.6 s. This is the
  baseline the plan's "R1–R17 ok" needs.
- `git rev-list --merges --count origin/main` gave `0`. `git merge-base --is-ancestor origin/feat/B5.1-agent
origin/main` gave exit 1. Both match the plan's statement that `main` is squash-only.
- `gh pr list --state all` filtered to `-agent` heads: 8 PRs, all MERGED (#160–#235). For each of B5.1, B5.3 and B5.4,
  `headRefOid` equals `origin/<branch>` (befc807, 854df7a, 6325dfe).
- `grep` for `run-smoke` in `.github/`, `lefthook.yml` and `package.json` found nothing, so CI never runs it.
- The plan cites a prototype on 7c4300e. I did not see it, so it is [unverified].

| Check                                                                     | Result                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                            | pass: `run.sh` (the defect), `run-smoke.sh` (the runner's own probe set, which the card's Test line allows), and the work artifacts. There is no section, so there is no features-map row                                         |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib      | pass (n/a): nothing in `src/`. The `in_flight` contract (from a count to sorted lines), the skip line and the new `gh` call are pasted. Exit codes and `CAP=3` are unchanged                                                      |
| follows `advice.md` or states the deviation                               | pass: "No advice (tier quick, no section)", and the card is `Tier: quick`                                                                                                                                                         |
| ≤ 7 criteria, every Then measurable                                       | pass: one Acceptance, measured by R18's six cases (run or skip, and the names in the skip line). The narrowing of (a) is stated for the lead (E6). Reasons 1 and 2 cover two costs the plan leaves out                            |
| verification lists exact commands with expected numbers                   | pass with a minor gap: red "1 of 18 probes FAILED", green "18 probes OK", and the 17 baseline is confirmed. "`pnpm test` unchanged" has no count, and "CI green" says nothing about R18 (reason 3)                                |
| work breakdown skeleton → red → green → map → review, convention subjects | pass: red → green → review is the tooling shape (B1.79, B1.86). There is no skeleton or map because there is no `src/` and no section. The red subject has no `(red)`, as B1.62's mistake-log row requires for smoke-only commits |
| `Lead approves spec` box, ticked only by a human                          | pass (n/a): there is no spec section. `Plan approved by:` is empty and the tier is high, so the lead's `approve` is required (D-28)                                                                                               |
| no settled D-n contradicted                                               | pass: D-19 (`config-change-approved`) and D-27/D-28 (high tier goes to the lead) are followed. The cap of 3 is B1.44's, not a D-n                                                                                                 |
| `next-task.sh --check` says no overlap                                    | pass: `[next-task] B1.82: no overlap with any Doing or Review card`                                                                                                                                                               |

Verdict: changes requested

1. **Rule (b) stops counting a resumed run whose branch has a closed PR, so a 4th run can start (confirmed by
   trace).** The plan stops counting a local branch when `gh pr list --head <b> --state all` "lists a merged or closed
   PR and no open one". It never asks whether the branch has moved since that PR ended. Here is the trigger. The lead
   closes an agent PR without merging it, for example to have the run redo the card. The local branch stays in the
   runner, which is the exact leftover this card is about. The lead then runs `scripts/agent/run.sh <n>` by hand.
   `run_issue` finds the worktree that already exists (`run.sh:222`), and `worktree.sh` reuses an existing branch
   (`worktree.sh:24`), so the run resumes on the same branch name. Until it opens a new PR, every other run's
   `in_flight` drops that branch. Its `gh` call shows CLOSED and nothing OPEN, so two other active branches give a
   count of 2, and a 4th run starts. The card says "the cap of 3 holds", and this state breaks it. One fix is cheap:
   ask for `--json state,headRefOid` and stop counting the branch only when its local tip equals the `headRefOid` of a
   merged or closed PR, which means the branch has not moved since that PR ended. The 2026-11-06 case still passes:
   for B5.1, B5.3 and B5.4, `headRefOid` equals the branch tip. Add an R18 case for it (closed PR, local tip moved,
   want counted). If the lead would rather keep the card's literal rule, the plan must state this gap as a cost.
2. **On this repository the narrowed (a) never fires, so every branch that stops being counted depends on `gh`
   (confirmed).** `origin/main` has 0 merge commits. Every ancestor of a squash-only `main` is on its first-parent
   line, so "an ancestor off its first-parent line" is never true here. Rule (a) and cases 1, 5 (B9.3) and 6 test a
   merge shape that `main` does not produce today. That is fine as a guard for later. The plan should still say it in
   one line: with `gh` failing or logged out, the cap stays safe because every branch counts, but the 2026-11-06 skip
   comes back unchanged. The lead approves the fix knowing that it rests on `gh` alone.
3. **(minor)** Verification: `run-smoke.sh` is not in CI (nothing in `.github/`, `lefthook.yml` or `package.json`
   names it). "CI green" does not cover R18. The plan should say R1–R18 are run locally on bash 3.2 (baseline
   `17 probes OK`, about 48 s) and that the diff review re-runs them. Also give `pnpm test`'s count instead of
   "unchanged".

Riskiest spot I could not falsify: the `gh` shim honoring `--state` and `--head`. If the shim's filter does the
work that `run.sh`'s own `--jq` should do, R18 passes against a `gh` that behaves differently. The diff review must
check that `run.sh` alone decides MERGED, CLOSED and OPEN.

## Plan review (round 2)

SCOPE: all (tooling, no §). Plan at `6896b31`. Read: card B1.82, `plan.md`, the round-1 revision diff, the
prototype `run.sh` and `run-smoke.sh` the plan cites (scratchpad `proto/` and `red2/`, diffed against the tree:
`red2/run.sh` is today's `run.sh`, `red2/run-smoke.sh` is `proto/run-smoke.sh`).

Commands run (nothing on the tree; probes on `git archive HEAD` copies under the scratchpad, `/bin/bash` 3.2):

- `scripts/next-task.sh --check B1.82` gave `[next-task] B1.82: no overlap with any Doing or Review card` (exit 0).
- `scripts/agent/tier.sh backlog/work/B1.82/plan.md` gave `high`. `plan-files.sh --any B1.82 HEAD` gave the 3 Files
  rows. `check-backlog.sh` gave `[check-backlog] OK: README matches the cards`.
- Red (today's `run.sh`, prototype `run-smoke.sh`): R1–R17 `ok`, R18 FAIL on all 7 cases, `1 of 18 probes FAILED`.
- Green (prototype both): `ok R18`, `18 probes OK`. Both match the plan's Verification.
- Real `gh pr list --head chore/B1.66-agent --state all --limit 100 --json state,headRefOid --jq '<MERGED or CLOSED>'`
  returned `db95f93…` (exit 0): the new call works against GitHub as written.
- `gh api …/commits/db95f93`: committer `GitHub`, parents `5e23968`, `821ee1c`. PR #200's last commit is a
  "Merge branch 'main' into chore/B1.66-agent" made with GitHub's Update branch after the run's last push (`5e23968`,
  `Agent-Run:` trailer); the PR merged at `db95f93`.
- Probe on the green copy (an extra R18 case, not kept): `feat/B9.1-agent` at its own tip with a MERGED PR whose
  `headRefOid` is a commit whose parent is that tip (the #200 shape), plus two unmerged branches without a PR. Got
  `[run] skip #7: 3 agent branches in flight (cap 3): chore/B9.2-agent feat/B9.1-agent feat/B9.3-agent`.

Round-1 reasons: 1 fixed (headRefOid = tip; case 4 covers it), 2 fixed (the `gh` cost is stated), 3 fixed (local
R1–R18 run stated, `pnpm test` 241 passed). Round 1's riskiest spot is closed in the plan: case 3 asserts `run.sh`
sent `--state all`, and the shim returns every state for `all`, so `run.sh`'s `--jq` alone picks MERGED or CLOSED.

| Check                                                                     | Result                                                                                                                                                             |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file belongs to the card                                            | pass: `run.sh`, `run-smoke.sh` (the runner's own probe set, as the Test line allows), the work artifacts                                                           |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib      | pass (n/a): no `src/`. `in_flight`'s new output, the skip line and the new `gh` call are pasted; exit codes and `CAP=3` unchanged                                  |
| follows `advice.md` or states the deviation                               | pass: no advice, card `Tier: quick`                                                                                                                                |
| ≤ 7 criteria, every Then measurable                                       | fail: one Acceptance, but "whose PR is merged … is not counted" does not hold when the merged head is not the local tip, and the plan does not state it (reason 1) |
| verification lists exact commands with expected numbers                   | pass: red `1 of 18 probes FAILED`, green `18 probes OK`, both reproduced; `pnpm test` 241 passed (39 files)                                                        |
| work breakdown skeleton → red → green → map → review, convention subjects | pass: the tooling shape red → green → review (B1.79, B1.86); no skeleton or map without `src/` or a section                                                        |
| `Lead approves spec` box, ticked only by a human                          | pass (n/a): no section. `Plan approved by:` empty; tier high → the lead's `approve` (D-28)                                                                         |
| no settled D-n contradicted                                               | pass: D-19, D-27, D-28 followed                                                                                                                                    |
| `next-task.sh --check` says no overlap                                    | pass: `[next-task] B1.82: no overlap with any Doing or Review card`                                                                                                |

Verdict: changes requested

1. **Rule (b) keeps counting a branch whose PR merged at a commit the runner never had, so the 2026-11-06 skip
   comes back (confirmed by probe; the shape happened on PR #200).** (b) stops counting a local branch only when a
   MERGED or CLOSED PR's `headRefOid` equals its tip. When the PR's head moves on GitHub after the run's last push
   (GitHub's Update branch, or a commit the lead pushes to the PR), the local tip is the parent of the merged head.
   `main` squashes, so (a) never fires either, and the branch counts until `worktree-prune.sh` runs. That is the
   card's own defect for a branch "whose PR is merged". Trigger: PR #200 merged at `db95f93`, a GitHub-made merge
   whose parent `5e23968` is the run's last push; a runner that still holds `chore/B1.66-agent` at `5e23968` counts
   it forever. The probe above reproduces it with the prototype: the merged branch is named in the skip line.
   Pick one before the lead's gate and state its cost:
   - (i) MERGED: not counted whatever the tip; CLOSED: only at its tip (round 1's finding 1 is about a closed PR).
     Cost: a run resumed on a merged PR's branch (issue reopened and relabeled, worktree still there) is not counted.
     Add an R18 case with the #200 shape (merged head = a child of the tip, want run).
   - (ii) Keep equality and add to the Costs list: a PR whose head moved on GitHub after the run's last push stays
     counted after merge until `worktree-prune.sh` runs. The lead's recent practice of not updating runner PRs
     narrows it, but a lead commit on the PR still produces it.
     An ancestor test (local tip is an ancestor of the merged head) does not help without a fetch of the PR head:
     `worktree.sh` fetches only `origin/main`, so the runner may not have `db95f93`.
2. **(minor)** `run-smoke.sh`'s header still says "Probes R1–R17" and lists R4 as "three agent branches in flight"
   in the prototype. The round-1 plan's Files row said "header names it"; the revised row dropped it. Name R18 in
   the header (the Files row already covers the file).

Riskiest spot I could not falsify: the runner container's local branch state after a merge. The probe proves what
`in_flight` does for a given tip; whether the runner's leftover branches sit at the pushed tip, or something else
moves them (a pull, a resumed run), I traced from `run.sh` and `worktree.sh` but did not observe in the container.

## Diff review (round 1)

SCOPE: all (tooling, no §: `scripts/agent/`, `backlog/`). Red `a332d16`, green `9b58695`, HEAD `9b58695`. Read: card
B1.82, `plan.md` (approved `be48e01`), the diff `main...HEAD`, `run.sh` (`in_flight`, `run_issue`), `run-smoke.sh`
(shims, `prs`, R4, R18), `worktree.sh` (branch base).

Commands, run by me from the worktree (probes on `git archive` copies under the scratchpad, `/bin/bash` 3.2.57):

| Command                                   | Last line                                                                                                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                               | `All matched files use Prettier code style!`                                                                                                               |
| `pnpm typecheck`                          | `> tsc --noEmit` (exit 0, no errors)                                                                                                                       |
| `pnpm test`                               | `Tests  241 passed (241)` (39 files), as the plan says                                                                                                     |
| `pnpm test:e2e`                           | `52 passed (1.3m)`                                                                                                                                         |
| `pnpm test:mutation`                      | `All files 92.62` (no `src/` change)                                                                                                                       |
| `check-suppressions.sh`                   | `OK: no new suppressions`                                                                                                                                  |
| `check-config-change.sh`                  | exit 1 locally: `run-smoke.sh`, `run.sh` need the label. PR #242 carries `config-change-approved` (`gh pr view 242`), so CI passes it (D-19)               |
| `check-feat-commits.sh`                   | `OK: no feat commit touches tests`                                                                                                                         |
| `check-ac-coverage.sh`                    | `OK: every criterion of a shipped section has a test`                                                                                                      |
| `check-spec-sections.sh`                  | `OK: sections cited: 1 … 28`                                                                                                                               |
| `check-features-map.sh`                   | `OK`                                                                                                                                                       |
| `check-plan-scope.sh`, `check-backlog.sh` | `OK: … stays inside the approved plan of B1.82`, `OK: README matches the cards`                                                                            |
| `verify-red.sh B1.82`                     | `::error::no 'test(<pkg>): B1.82 … (red)' commit`: expected. The red is smoke-only and has no `(red)` marker (B1.62, as B1.86); the run below is the proof |
| `run-smoke.sh` at `a332d16` (red)         | R1–R17 `ok`, `FAIL R18`, `1 of 18 probes FAILED`, all 7 cases fail                                                                                         |
| `run-smoke.sh` at `9b58695` (green)       | `18 probes OK`                                                                                                                                             |
| `git diff --stat main...HEAD`             | 5 files: `run.sh` +22 −5, `run-smoke.sh` +70 −4, `plan.md`, `pr-body.md`, `review.md`                                                                      |
| `next-task.sh --check B1.82`              | `[next-task] B1.82: no overlap with any Doing or Review card`                                                                                              |

Revert probes (one change each to the green `run.sh` on a copy, then `run-smoke.sh`). Every one of them fails R18 with
`1 of 18 probes FAILED`:

1. Dropped the first-parent exclusion from (a). Case "fresh branches" starts a run.
2. Dropped the `MERGED` rule. Cases 4 and 6 skip with 4 branches.
3. Changed CLOSED to match any head. Case 4 starts a run.
4. Changed `--state all` to `--state closed`. Case 3 starts nothing, and the `--state all` call is missing.
5. Dropped the names from the skip line. Cases 2, 4 and 5 fail.

| Check                                                   | Result                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| the card's Acceptance has a probe that asserts its Then | pass. Not counted when merged: cases 1 and 3, plus the #200 shape in case 4. An unmerged branch or an open PR still counts: cases 2, 5 and 6. The skip names the branches: cases 2, 4 and 6. R1–R17 keep their verdicts. The label is on #242. The narrowing of (a) and of CLOSED is a cost the lead approved in the plan |
| no test weakened after the red commit                   | pass. `git log --first-parent --no-merges a332d16..HEAD -- '*.test.*' e2e/ scripts/agent/run-smoke.sh` is empty, and there are no merge commits in the range                                                                                                                                                              |
| every changed file in `plan.md`                         | pass. The files are `run.sh`, `run-smoke.sh` and `backlog/work/B1.82/*`, and `check-plan-scope.sh` reports OK                                                                                                                                                                                                             |
| interfaces match the plan                               | pass. `in_flight` prints sorted lines (`LC_ALL=C sort -u`). The skip line is `skip #<n>: <k> agent branches in flight (cap 3): <names>`. The new `gh pr list --head <b> --state all --limit 100 --json state,headRefOid` call matches the plan word for word. `CAP=3` and the exit codes are unchanged                    |
| Zod at action boundary · Prisma in lib · no raw SQL     | n/a (no `src/`)                                                                                                                                                                                                                                                                                                           |
| migration reversible and indexed                        | n/a (no `prisma/`)                                                                                                                                                                                                                                                                                                        |
| no secret, no suppression                               | pass                                                                                                                                                                                                                                                                                                                      |
| features map row moved                                  | n/a (no section)                                                                                                                                                                                                                                                                                                          |
| would a test fail if one changed line were reverted     | pass. All 5 revert probes above are killed. One mutant survives and is equivalent: dropping the first `grep -vxF -- "$1"` changes nothing, because the pipeline's final filter removes the own branch again                                                                                                               |
| round-1 riskiest spot (shim doing `run.sh`'s filtering) | closed. The shim applies only gh's own `--state` and `--head`, and `run.sh`'s `--jq` alone picks MERGED and CLOSED (revert probes 2 and 3 show this)                                                                                                                                                                      |

Traced, not a finding:

- The per-branch `gh_` reads `</dev/null`, so it does not consume the `while read` loop's stdin.
- `why` is reassigned before `comment` reads it.
- `grep -c . <<< ""` gives 0.
- `in_flight` has only one caller (`run.sh:235`).

Findings: none.

Verdict: ready for PR

Riskiest unfalsified: real `gh pr list --head <b> --state all` in the runner container. The plan review ran it
against GitHub on the host. In the container, offline or logged out, `heads` is empty, so every leftover branch
counts and the 2026-11-06 skip comes back (a stated cost). No probe covers `gh` failing on the per-branch call. The
code needs no change for it, but nothing proves the container's `gh` answers. Also: #242's head on GitHub is still
`89eb92c`, so the red and green commits are not pushed yet.
