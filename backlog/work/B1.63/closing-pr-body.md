Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.63 and B1.64 — eligibility by label node id; a closed issue
is refused. One plan and one feature PR for both cards (the lead's choice): #179 merged as 58ded5d. The checklist is
the plan; no `Plan approved by` line. Per D-25 this PR also files one out-of-scope follow-up from the plan's costs and
the diff review's riskiest unfalsified spot (filing lane, `backlog/CLAUDE.md` "Filing a card"): B1.67.

Files:

- `backlog/plan/E1-todos.md`: B1.63 and B1.64 `**Status: Done** — 58ded5d (#179 …)` with the probe, live and mutant
  results; Work lines (B1.64 points at `work/B1.63/`); new card
  - B1.67 (quick): CI's token proof step (`ci.yml:155`) runs `eligible.sh`'s GraphQL timeline query under the job
    token and Debian's gh 2.23, and the `scripts/CLAUDE.md` rows for `eligible*.sh` state the closed-issue and
    node-id rules and probes E1–E14 (B1.57 held that file during B1.63)
- `backlog/README.md`: Remaining rows 74 and 75 out, row 79 in; nodes 74 and 75 struck, node 79 added; totals E1
  42 / 1 / 24 of 67, total 53 / 1 / 25 of 79
- `backlog/work/B1.63/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: neither card has a section. `docs/metrics.md`
rows for both cards landed with #179.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
