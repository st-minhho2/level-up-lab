# B1.57 analysis — what D-29 leaves open for the two scripts

Tooling, tier quick: no section, no advisor. The contract is D-29 (verbatim below) and the card's Acceptance. Each
gap carries a proposed decision; the lead settles them at the plan gate (`plan.md` "The lead decides").

> D-29: **unattended** = an `agent-ready` issue reaches a ready PR with no lead message in between, an expected
> high-tier gate stop (D-27) excepted; **no-rework** = after ready, the PR merges with no human-authored commit and
> no lead change request. Targets: unattended > 50 % of agent-ready issues, no-rework > 70 % of agent PRs […].
> Measured per batch of epic E5 (two batches must meet every target), with scripts filed with the runner cards.

## Facts read (2026-11-03)

| #   | Fact                                                                                                                                                                                  | Source                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| F1  | The runner's issue comments are posted with the lead's `gh` login; their body starts ``Runner (`scripts/agent/run.sh`, B1.44): **<outcome>** for <card>.`` and holds `- tier: <t>`    | `run.sh` `comment()`; issue #166: 2 comments by the lead login |
| F2  | The lead's login opens every PR, so GitHub refuses the lead a `CHANGES_REQUESTED` review on it; #1–#41 and #170 hold 0 reviews                                                        | `gh pr view 170`; `docs/metrics.md` Onboarding row             |
| F3  | Run and interactive commits look the same: author the lead, co-author `claude` (trailer); nothing marks a run                                                                         | `gh pr view 170 --json commits`                                |
| F4  | Every Bash call of a run inherits `RUNNER_CHILD=1`; `git commit` and `git merge` run the `commit-msg` hook                                                                            | `run.sh:19`, `run.sh:118`; githooks(5)                         |
| F5  | Ready = the PR's `ready_for_review` timeline event (pr-step.sh always opens drafts); `pr-step.sh ready <n> --undo` + `ready` can repeat it when a sibling's merge makes the PR BEHIND | PR #171 timeline; `dev-lead.md` Loop 9                         |
| F6  | An agent branch is `<chore\|feat>/<card>-agent`; the issue form's `### Card id` names the card                                                                                        | `run.sh` `branch_of`, `card_of`, `in_flight`                   |
| F7  | One `agent-ready` issue so far (#166, B1.41): closed at the gate, no PR; no agent PR exists                                                                                           | `gh issue list --label agent-ready --state all`                |
| F8  | `scripts/agent/run.sh` is held by B1.65, `eligible*.sh` by B1.63/B1.64: the mark cannot be set in `run.sh` here                                                                       | the lead's brief                                               |

## Open questions (each with a proposed decision)

1. **The mark** (card: "a mark the runner adds"). F3, F8 → proposed: a `commit-msg` job `agent-run` in `lefthook.yml`
   adds the trailer `Agent-Run: $RUNNER_CHILD` (`git interpret-trailers --in-place --if-exists doNothing`) when
   `RUNNER_CHILD` is set; nothing otherwise. Cost: `lefthook.yml` is protected (D-19) → tier high, label. A later
   `run.sh` could set `RUNNER_CHILD=<issue>` so the trailer names the issue (follow-up, not here). Honor floor: a
   human who exports `RUNNER_CHILD` forges it, the same floor as B1.55's.
2. **Ready time.** Proposed: the first `ready_for_review` event (later ones are the run's own BEHIND round trip, F5);
   a PR never drafted (no event, not draft) → its `createdAt`; still draft → not ready.
3. **Label time.** Proposed: the latest `agent-ready` `labeled` event at or before ready (eligible.sh trusts the
   latest label); with no ready PR, the latest label.
4. **Lead message.** Single-human repo: proposed = every issue comment, PR comment and PR review (any state; inline
   comments belong to a review) between label and ready, whoever posts it, except bodies starting with the runner's
   fixed prefix (F1).
5. **The expected gate's approve.** Proposed: excepted only when a runner comment with `**gate**` and `- tier: high`
   precedes it and the comment's trimmed body is exactly `approve`; one per gate comment. How a run reads that
   comment is not defined yet (no card): a follow-up, out of scope here.
6. **Unattended denominator.** Proposed: an open issue with no ready agent PR → `pending`, out of the share and
   listed; a closed issue with none (abandoned, or built by hand) → counted, not unattended.
7. **Lead change request.** F2 → proposed: a `CHANGES_REQUESTED` review, or any PR comment or review after ready not
   from the runner (strict: a thank-you counts; the row lists them so the lead can see why).
8. **Human-authored commit.** Proposed: a PR commit whose committer date is after ready and whose message has no
   `Agent-Run:` trailer — a GitHub "Update branch" merge counts (it is the lead's commit, D-29 literal), listed.
9. **Agent PR.** Proposed: no-rework's default set = merged PRs whose head is `^[a-z]+/B[0-9]+\.[0-9]+-agent$` (F6);
   PR numbers given as arguments are measured whatever their head (live read on interactive PRs shows the format).
   A PR not merged → `pending`, out of the share.
10. **Shares.** Proposed: `k/n = x.y %` like `change-failure-rate.sh`; `n/a` when n = 0.
