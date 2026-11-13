Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.85: card plans gave the `docs(map)` step to dev-lead, whose
hook refuses `spec/features-map.md`. Feature PR #252 merged as 0781145. The partial closing (#254) left the card
pending the next headless run, which is now done. The lead asked for this closing lane in the session. The checklist is
the plan, so there is no `Plan approved by` line.

What held: the first E6 headless run (issue #261, card B6.1, PR #264 merged as 36846c1) is the run the partial closing
waited for.

- `code-writer` committed `feat(todos): B6.1 …` (6a60e13), touching `src/components/todo-form.tsx` and
  `docs/metrics.md`, not the map.
- Its very next commit was its own `docs(map): F27 Escape clears the new-todo title [B6.1]` (7775102). That commit
  touches `spec/features-map.md` only and lands before the review, as `dev-lead`'s green gate now requires.
- `path-guard.sh` refused nothing in the run. The run log only quotes the script's header, and no
  `docs/mistake-log.md` row was added.

Files:

- `backlog/plan/E1-todos.md`: B1.85 `**Status: Partial**` → `**Status: Done** — 0781145 (#252)`, with the B6.1
  evidence and the existing grep T1–T6, hook-smoke, test and review numbers.
- `backlog/README.md`:
  - Remaining row 101 removed; `~~B1.85~~` in node 101. No other row was blocked by B1.85.
  - Totals updated: E1 58/0/34, total 75/0/41 of 116.
  - The blank line that split rows 111–116 from the Remaining table (left by the filing PR #259) is removed and
    Prettier aligned the rows; the pre-commit Prettier gate refused the file otherwise. #267 makes the same fix.
- `docs/mistake-log.md`: the 2026-11-06 row's "Prevented by" cell drops "[unverified until E6]" for the run that
  verified it (#264, `docs(map)` 7775102). The text stays within the column width, so the table is not realigned.
- `backlog/work/B1.85/closing-pr-body.md`: this body (Closing step 6), replacing the partial closing's body.

There is no `spec/` change: B1.85 is tooling with no section and no map row.

Parallel PR: #267 (B6.1 done) also changes the README totals. Whichever merges second needs `origin/main` merged in and
its totals recounted.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
