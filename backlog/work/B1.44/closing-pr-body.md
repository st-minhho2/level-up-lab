Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.44 — Runner: poll agent-ready issues and run dev-lead
headless, feature PR #163 merged as d2c7789. The checklist is the plan; no `Plan approved by` line. Per D-25 this PR
also files two out-of-scope follow-ups from B1.44's diff review (filing lane, `backlog/CLAUDE.md` "Filing a card").

Files:

- `backlog/plan/E1-todos.md`: B1.44 `**Status: Done** — d2c7789 (#163)` with the smoke counts and the live gate run;
  Work line with rounds, live runs and follow-ups; `~~B1.44~~` in the Depends on of B1.51, B1.55–B1.59; new cards
  - B1.60 (quick): CI runs `run-smoke.sh` and `tier-smoke.sh`, under bash 5 (never run: the host has bash 3.2 only)
  - B1.61 (quick): the deny rule `Bash(git * -c *)` also blocks a commit message holding `-c`; whether TERM ends
    the processes a run's tools start is unverified
- `backlog/README.md`: Remaining row 56 out, rows 72–73 in; `~~B1.44~~` in rows 63, 67–71 and node 56; nodes 72–73;
  totals E1 38 / 0 / 23 of 61, total 49 / 0 / 24 of 73
- `backlog/work/B1.44/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: B1.44 has no section. Not filed, for the card
that owns it: B1.59's wrapper should stop the job with TERM (launchd's default) and never start `run.sh` with `&`
from a script (SIGINT then arrives ignored, `review.md` pass 3). B1.44's title still says "in a sandbox"; the sandbox
is B1.58. `scripts/CLAUDE.md` rows for `tier.sh` and `run.sh` are the orchestrator's.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
