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
