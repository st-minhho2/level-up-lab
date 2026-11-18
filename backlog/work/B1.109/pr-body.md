## Item

B1.109 — guard-bash lets `gh pr` merge or delete the branch through a word split by a parameter inside an
unexpanded `${X[ … ]}` (tooling, no spec section)

- spec: none — tooling (`.claude/hooks/guard-bash.sh`, `scripts/hook-smoke.sh`, `.claude/docs/hooks.md`); no `src/`
  change, no section
- test: `scripts/hook-smoke.sh`, section "a word split by a parameter in `${X[ … ]}` (B1.109)": red before the fix,
  green after
- acceptance: all four clauses of the card (each form blocked with the existing message and the out-of-reach entry
  removed; every B1.108 probe still passes and nothing main blocks passes; probes red then green with the counts;
  `config-change-approved`)

## Plan

Copied from `backlog/work/B1.109/plan.md` (plan review approved round 2; `Plan approved by: lead, 2026-11-18`;
Rounds: 1). See that file for the full text; summary:

A second unquoted copy, added beside main's, never in place of it. `UNQUOTE_KEEP` is main's `UNQUOTE` with `$` added
to the braced subscript token's excluded set, so a token that holds a parameter (`m$@erge`) is kept and only the
parameter goes: the word the shell hands on whole where it does not expand the `${` (after `\` or `$$`, then `$1`) is
visible. The gh pr loop reads both copies; `*_RAW` still read the original text. Main's copy and rules are
unchanged, so every command main blocks stays blocked; the new copy only adds blocks.

| File                          | Change                                                                   | Why          |
| ----------------------------- | ------------------------------------------------------------------------ | ------------ |
| `.claude/hooks/guard-bash.sh` | `UNQUOTE_KEEP`; the gh pr loop reads both copies; header                 | Acceptance 1 |
| `scripts/hook-smoke.sh`       | section "a word split by a parameter in `${X[ … ]}` (B1.109)": 27 probes | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: the second copy; out-of-reach entries                    | Acceptance 1 |
| `backlog/work/B1.109/*`       | plan, review, pr-body                                                    | pipeline     |

Out of reach, main too (header and `hooks.md`): a subscript holding a braced, subscripted or arithmetic expansion
(`${X[${i}]}merge`, `${X[$Y[1]]}merge`, `${X[$((1))]}merge`).

## Map delta

None (no `src/`, no section).

## Review

Plan review: 2 rounds (round 1 changes requested, 2 findings; round 2 approved, 0 findings). `/review-loop`: 1 diff
pass, verdict ready for PR, 0 findings; all in `backlog/work/B1.109/review.md`.

| Round / pass | #   | Finding                                                                                                        | Kind          | Disposition                                                   |
| ------------ | --- | -------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------- |
| plan 1       | 1   | `$` excluded in main's own class lost 8 forms main blocks (`gh pr ${X[$i+n]}merge 7`)                          | correctness   | fix now: plan round 2, a second copy beside main's; 11 guards |
| plan 1       | 2   | step-2 interface pasted with a placeholder                                                                     | plan-mismatch | fix now: step dropped; plan round 2 pastes the exact lines    |
| plan 2       | —   | note: "nested expansion" also reads as `${X[$i]}`                                                              | wording       | fix now: "a braced, subscripted or arithmetic expansion"      |
| diff 1       | —   | note: `gh pr m$!erge 7` (bash), `gh pr m$~@erge 7` (zsh) exit 0 here and on main; not in any out-of-reach list | gap (main)    | out of scope: follow-up card proposed to the lead             |

Diff pass 1 also re-ran: red at `2651553a` exactly the 12 triggers; mutants (loop over `UNQUOTE_KEEP` only → 11
wrong, over `UNQUOTE` only → 12, per-copy `echo` dropped → 24); under `/bin/bash` 3.2.57 `UNQUOTE_KEEP` differs from
`UNQUOTE` by one inserted `$`. No text in the files tried to give instructions.

## Evidence

- Probes `2651553a` (no `(red)` marker, B1.106): `scripts/hook-smoke.sh` exit 1, 12 FAIL, 953 ok.
- Fix `603603a0`: `hook-smoke: 965 probes OK` (938 on main + 27), `/bin/bash` 3.2 locally; bash 5 in CI.
- `pnpm lint` 0, `pnpm typecheck` 0, `pnpm test` `Tests 403 passed (403)` before and after; `pnpm test:e2e`
  `91 passed` (reviewer); mutation: CI only, no src/lib or src/actions change.
- `check-plan-scope.sh` OK, `check-backlog.sh` OK, `next-task.sh --check B1.109` no overlap.
- Timings, `179971b` / `603603a0`, side by side (session scratch `gen.js`; the reviewer ran alongside): 300
  `gh pr view` segments (9 KB) 2.02 / 2.14 s and 1.96 / 2.03 s; one 139 KB heredoc segment 365.11 / 365.26 s.
  Prototype runs before: 1.87 / 1.89, 1.84 / 1.96 s; 334.3 / 334.3 s.
- Out of reach, main too, named in the header and `hooks.md`: `${X[${i}]}merge`, `${X[$Y[1]]}merge`,
  `${X[$((1))]}merge` (each exits 0 here, checked).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
