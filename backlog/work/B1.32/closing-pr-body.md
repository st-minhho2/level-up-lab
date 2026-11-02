Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.32 — plan-scope reads a Files token as a glob only where the
plan says so, feature PR #141 merged as 12063db. The checklist is the plan; no `Plan approved by` line. Per D-25 this PR
also files three out-of-scope follow-ups found by B1.32's plan and diff reviews (filing lane, `backlog/CLAUDE.md`
"Filing a card"); ids B1.39–B1.41 (B1.34, B1.35 are B1.31's; B1.36–B1.38 are B1.33's).

Files:

- `backlog/plan/E1-todos.md`: B1.32 `**Status: Done** — 12063db (#141)`, hook-smoke L7–L15 × 4 layouts red at 084bccb
  (28 FAIL), `hook-smoke: 476 probes OK` at 89ee611 and in CI's `test` job (bash 5); Work line with plan and review
  rounds; new cards
  - B1.39: `scripts/metrics/plan-deviations.sh:35` keeps the old literal-then-glob rule, so `src/app/i/page.tsx`
    counts as inside a plan row `src/app/[id]/page.tsx` while the guard refuses it
  - B1.40: `scripts/next-task.sh:134` `--check` reads `[ ]`, `?` and a cross-segment `*` as glob syntax (false
    overlap of `src/app/[id]/page.tsx` and `src/app/i/page.tsx`, on the safe side)
  - B1.41: `.claude/agents/dev-lead.md:44` and the `scripts/CLAUDE.md` hook-smoke row ("L1–L6") do not state the
    token rule or L7–L15; the `.claude/docs/hooks.md` row wording "exactly `*`"
- `backlog/README.md`: Remaining row 43 out, rows 50–52 in; B1.32 struck and nodes 50–52 added in Execution order;
  totals E1 31 / 1 / 9 of 41, total 42 / 1 / 9 of 52
- `backlog/work/B1.32/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: B1.32 has no section.

`check-backlog.sh` OK; `check-spec-sections.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
