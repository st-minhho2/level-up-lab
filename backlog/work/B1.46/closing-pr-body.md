Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.46 — Layer rules checked in CI with dependency-cruiser,
feature PR #156 merged as 400f105. The checklist is the plan; no `Plan approved by` line. Per D-25 this PR also files
one out-of-scope follow-up from B1.46's diff review (filing lane, `backlog/CLAUDE.md` "Filing a card"): B1.50.

Files:

- `backlog/plan/E1-todos.md`: B1.46 `**Status: Done** — 400f105 (#156)` with the cruise, probe and CI results; Work
  line with review rounds and the follow-up; `~~B1.46~~` in B1.44 "Depends on"; new card
  - B1.50 (quick): the client layer rule also targets `@prisma/client`; on 400f105 a component importing a lib module
    that imports `@prisma/client` directly passes both cruises (diff review round 1, observation 3, probed)
- `backlog/README.md`: Remaining row 58 out, row 62 in; `~~B1.46~~` in row 56 and node 58, node 62 added; totals
  E1 35 / 0 / 15 of 50, total 46 / 0 / 16 of 62
- `backlog/work/B1.46/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: B1.46 has no section. The guides naming the
protected list (`.claude/docs/git-workflow.md`) and the CI guards (`scripts/CLAUDE.md`, `check-layers.sh`) are the
orchestrator's after the batch. The PR wrapper refusing the `ci` type is already B1.38.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
