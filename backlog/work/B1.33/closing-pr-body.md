Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.33 — CI runs hook-smoke and its guide row names every
probe group, feature PR #138 merged as 386e867. The checklist is the plan; no `Plan approved by` line. Per D-25 this PR
also files three out-of-scope follow-ups found by B1.33's plan, plan review and PR steps (filing lane,
`backlog/CLAUDE.md` "Filing a card"); ids B1.36–B1.38 (B1.34, B1.35 are B1.31's).

Files:

- `backlog/plan/E1-todos.md`: B1.33 `**Status: Done** — 386e867 (#138)`, card Test `grep -l hook-smoke
.github/workflows/*` → `.github/workflows/ci.yml` (red at a733c7b: no match), the `test` step green on the PR with
  `hook-smoke: 440 probes OK`; Work line with plan and review rounds; new cards
  - B1.36: hook-smoke's review-gate probe tests `git diff HEAD` while `require-review.sh` uses
    `merge-base origin/main`; a full checkout with a committed `src/` change → `FAIL require-review.sh spoke on a clean tree`
  - B1.37: `cps` does not unset `HEAD_SHA`/`BASE_SHA`; with both exported → 18 FAIL (exit 128)
  - B1.38: the PR wrapper refuses a `ci(` title that `lefthook.yml` commit-msg accepts (#138 merged as `chore(scripts)`)
- `backlog/README.md`: Remaining row 44 out, rows 47–49 in; B1.33 struck and nodes 47–49 added in Execution order;
  totals E1 30 / 1 / 7 of 38, total 41 / 1 / 7 of 49
- `backlog/work/B1.33/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: B1.33 has no section.

`check-backlog.sh` OK; `check-spec-sections.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
