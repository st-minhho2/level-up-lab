## Item

B1.45 — Evidence section in the PR and a daily feature map (tooling, no §; D-27, D-28, D-29)

- spec: none — tooling; the card's Acceptance (`backlog/plan/E1-todos.md` ### B1.45) is the contract
- test: `scripts/agent/feature-map-smoke.sh` — red before (script missing), green after
- acceptance: Evidence section in the PR template; `scripts/agent/feature-map.sh` prints the agent cards riskiest
  first (posting: lead's ruling A, follow-up); `config-change-approved` (D-19, `.github/`)

## Plan

# B1.45 plan — Evidence section in the PR and a daily feature map (tooling)

Round 2 (plan review r1: 6 reasons, all addressed). Tooling, tier quick, no §: spec-analyst and advisor skipped; the
card's Acceptance and D-27–D-29 are the contract. Risk tier **high** (D-28: `.github/`) → the lead's gate stays (D-27).

**Ruling asked at the gate — "posts it to the agent board" and "daily" (r1 #1).** The board is a claude.ai artifact;
only an agent tool writes it, a headless runner has none. (A, recommended) the script prints the table (markdown, or
`--json`); posting and the daily schedule go to a follow-up card on the runner/orchestrator side, and B1.45 closes
Done on the lead's ruling "A". (B) the script comments on a pinned GitHub issue (a script writing externally, a second
board). No ruling, or "A without a ruling" → B1.45 closes Partial, pending the post.

## Files

| File                                 | Change                                                                |
| ------------------------------------ | --------------------------------------------------------------------- |
| `.github/pull_request_template.md`   | `## Evidence` after Review: four one-line `- key: value` (below)      |
| `scripts/agent/feature-map.sh`       | new: open `agent-ready` issues → one row each, riskiest first         |
| `scripts/agent/feature-map-smoke.sh` | new: probes F1–F16, gh shim on PATH, fixture repo, stub tier, offline |
| `backlog/work/B1.45/plan.md`         | plan                                                                  |
| `backlog/work/B1.45/review.md`       | plan and diff reviews                                                 |
| `backlog/work/B1.45/pr-body.md`      | PR body                                                               |

## Interfaces touched

```text
## Evidence        (template; one line each, no nested bullets; feature-map.sh reads the keys inside this section)
- AC met: <green>/<total>      AC-§.n criteria; a tooling card counts its Acceptance clauses
- tier: pending                display only; the runner copies scripts/agent/tier.sh's word here (B1.44)
- plan deviations: none        or "<file> (<why>), <file> (<why>)" on this line
- trace: n/a                   or the e2e job's playwright-report artifact URL (a trace exists only after a retry)

scripts/agent/feature-map.sh [--json]  read-only, bash 3.2, gh + git only · exit 0 table (also empty) · 1 gh failed · 2 usage
  gh issue list --label agent-ready --state open --limit 100 --json number,title --jq <TSV>
    card = first B<e>.<n> in the title, else in `gh issue view <n> --json body --jq .body`, else "?"
  gh pr list --state open --limit 100 --json number,headRefName,isDraft --jq <TSV>
    PR = branch <type>/<card>[-…], except exactly docs/<card>-done|-partial|-card|-file-card|-B<e>.<n>-cards (lanes, r1 #4)
    Evidence = `gh pr view <n> --json body --jq .body`, parsed in bash (empty value → "?", r1 #6)
  tier (r1 #3: never the body's word) = ${FEATURE_MAP_TIER:-scripts/agent/tier.sh} on backlog/work/<card>/plan.md at
    the branch's approval commit (plan-files.sh's subject rule; none → the tip, shown "medium (unapproved)"), after
    `git fetch origin <branch>`; no tier.sh or no plan → unknown
    a body tier that differs is shown, not ranked: "high (body: low)"
  "# Agent feature map — ${FEATURE_MAP_DATE:-$(date +%F)}", then
  | # | Card | Issue | PR | State | Tier | AC met | Deviations |   State: queued (no PR) · doing (draft) · review (ready)
  order: high, unknown, medium, low, then queued; ties by issue number. --json: same rows, same order.
```

## Verification (card worktree)

```bash
scripts/agent/feature-map-smoke.sh   # red commit: exit 1, 16 FAIL · after: "feature-map-smoke: 16 probes OK", denied.log empty
#  F1 order high>unknown>medium>low>queued  F2 tie → issue asc  F3 Evidence parsed (AC 3/4, deviations, | escaped)
#  F4 no Evidence → AC ?, deviations ?  F5 B9.10, docs/B9.1-done|-partial|-card|-file-card not B9.1's; docs/B9.1-guides,
#  docs/B9.1-scorecard are  F16 a high plan approved, then a .github/ row dropped at the tip → still high  F6 card from
#  body; none → "?" row  F7 --json exact  F8 gh fails → exit 1, no table  F9 no issues → "No open agent-ready issues."
#  F10 bad flag → exit 2  F11 template: the four keys under ## Evidence  F12 FEATURE_MAP_DATE heading  F13 empty
#  deviations value → ?  F14 stub tier high + body low → "high (body: low)", ranked high  F15 no tier.sh → unknown
/bin/bash scripts/agent/feature-map-smoke.sh | tail -1                                         # same on bash 3.2
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1; pnpm lint   # OK; OK; 0 errors
scripts/agent/feature-map.sh                 # live: heading + "No open agent-ready issues." (none today), exit 0
```

## Work breakdown

| Step | Role / skill            | Produces                    | Commit                                              |
| ---- | ----------------------- | --------------------------- | --------------------------------------------------- |
| 1    | dev-lead (this session) | smoke, red (script missing) | `test(scripts): B1.45 feature-map smoke (red)`      |
| 2    | dev-lead (this session) | script + template           | `chore(scripts): B1.45 PR evidence and feature map` |
| 3    | reviewer                | diff review (D-25)          | `docs(backlog): B1.45 review …`                     |

Until B1.44 runs, no agent PR exists, so no row has a tier or Evidence (r1 #2). Follow-up cards, filed in the closing
PR (ids at filing, D-25): (a) runner fills `tier:`; an attended orchestrator session runs the map daily and publishes it to the board (a
headless run has no artifact tool; r2 cost 1); (b) `dev-lead.md`
Loop 9 + `pr-body.md` fill AC met, deviations and trace after CI green (r1 #5); (c) feature-map smoke in CI
(`ci.yml` is B1.46's file this batch). `scripts/CLAUDE.md` row: the orchestrator after the batch.

Plan review: approved, round 2 (costs 2 and 3 carried into the plan, cost 1 into follow-up (a); not re-reviewed, cap 2)
· Plan approved by: lead (session reply "approve, A": ruling A, the script prints and an attended orchestrator
session posts daily, follow-up (a); B1.45 closes Done), 2026-11-02 · Rounds: 1

## Map delta

None (tooling, no § and no `spec/features-map.md` row).

## Review

pending

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the change commit.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change carries `config-change-approved` (`.github/pull_request_template.md`).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
