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

pending

## Evidence

pending

🤖 Generated with [Claude Code](https://claude.com/claude-code)
