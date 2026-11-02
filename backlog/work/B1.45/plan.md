# B1.45 plan — Evidence section in the PR and a daily feature map (tooling)

Tooling, tier quick, no §: spec-analyst and advisor skipped; the card's Acceptance and D-28/D-29 are the contract.
Risk tier **high** (D-28: `.github/` is protected) → the lead's gate stays (D-27); PR carries `config-change-approved`.

**Choice for the lead — "posts it to the agent board".** The board is a claude.ai artifact only an agent tool writes.
(A, recommended) `feature-map.sh` prints the table (markdown, or `--json`); the orchestrator session or the runner
(B1.44) posts it, and B1.44's launchd job runs it once a day. (B) the script itself comments on a pinned GitHub issue
(an external write from a script, a second board). Approving this plan as is = A.

## Files

| File                                 | Change                                                        |
| ------------------------------------ | ------------------------------------------------------------- |
| `.github/pull_request_template.md`   | `## Evidence` after Review: four `- key: value` lines (below) |
| `scripts/agent/feature-map.sh`       | new: open `agent-ready` issues → one row each, riskiest first |
| `scripts/agent/feature-map-smoke.sh` | new: probes F1–F12 below, gh shim on PATH, offline            |
| `backlog/work/B1.45/plan.md`         | plan                                                          |
| `backlog/work/B1.45/review.md`       | plan and diff reviews                                         |
| `backlog/work/B1.45/pr-body.md`      | PR body                                                       |

## Interfaces touched

```text
## Evidence                      (template; feature-map.sh reads these exact keys inside this section)
- AC met: <green>/<total>        AC-§.n criteria; a tooling card counts its Acceptance clauses
- tier: pending                  D-28; the runner writes high | medium | low from scripts/agent/tier.sh (B1.44)
- plan deviations: none          or the files outside plan.md's Files table, each with why
- trace: n/a                     or the CI run's playwright-report artifact URL (trace: on-first-retry)

scripts/agent/feature-map.sh [--json]   exit 0 table (also when empty) · 1 a gh call failed · 2 usage
  gh issue list --label agent-ready --state open --limit 100 --json number,title --jq <TSV>  card: first B<e>.<n> in the
    title, else in `gh issue view <n> --json body --jq .body`
  gh pr list --state open --limit 100 --json number,headRefName,isDraft --jq <TSV>  PR: branch <type>/<card>[-…], not
    docs/; its Evidence from `gh pr view <n> --json body --jq .body` (parsed in bash, so the shim tests the parser)
  stdout: "# Agent feature map — <FEATURE_MAP_DATE or date +%F>" then
  | # | Card | Issue | PR | State | Tier | AC met | Deviations |    State: queued (no PR) · doing (draft) · review (ready)
  order: tier high, unknown (no Evidence / pending / other), medium, low, then queued; ties by issue number
  --json: [{"card","issue","pr","state","tier","ac","deviations"}] same order. Read-only; bash 3.2; gh's --jq, no jq.
```

## Verification (card worktree)

```bash
scripts/agent/feature-map-smoke.sh   # red commit: exit 1, 12 FAIL · after: "feature-map-smoke: 12 probes OK", denied.log empty
#  F1 tier order high>unknown>medium>low>queued  F2 tie → issue asc  F3 Evidence parsed (AC 3/4, deviation text, | escaped)
#  F4 no Evidence → unknown, ?  F5 B9.10 / docs/B9.1-done not B9.1's PR  F6 card from body; none → "?" row kept
#  F7 --json exact  F8 gh fails → exit 1, no table  F9 no issues → heading + "No open agent-ready issues." exit 0
#  F10 bad flag → exit 2  F11 template holds the four keys under ## Evidence  F12 FEATURE_MAP_DATE in the heading
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1; pnpm lint   # OK; OK; 0 errors
scripts/agent/feature-map.sh          # live, read-only: heading + empty-state line (no agent-ready issue today)
```

## Work breakdown

| Step | Role / skill            | Produces                    | Commit                                              |
| ---- | ----------------------- | --------------------------- | --------------------------------------------------- |
| 1    | dev-lead (this session) | smoke, red (script missing) | `test(scripts): B1.45 feature-map smoke (red)`      |
| 2    | dev-lead (this session) | script + template           | `chore(scripts): B1.45 PR evidence and feature map` |
| 3    | reviewer                | diff review (D-25)          | `docs(backlog): B1.45 review …`                     |

No skeleton, map or mutation step (no §, no `src/`). Not here (follow-ups, D-25): smoke in CI (`ci.yml`, B1.46's
file this batch); `dev-lead.md` Loop 9 / `pr-body.md` filling Evidence; `scripts/CLAUDE.md` row (orchestrator).

Plan review: pending · Plan approved by: · Rounds: 1
