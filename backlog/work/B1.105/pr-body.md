## Item

B1.105 — guard-bash lets `gh pr` with a flag before `close` delete the branch (tooling, no spec section)

- spec: none — tooling (`.claude/hooks/guard-bash.sh`, `scripts/hook-smoke.sh`, `.claude/docs/hooks.md`); no `src/`
  change, no section
- test: `scripts/hook-smoke.sh` section "branch delete through gh pr flags (B1.105)" — red before (16 probes FAIL at
  7d753df, then 7 more at 18f92e0), green after ("hook-smoke: 820 probes OK")
- acceptance: all four clauses of the card (flag spellings blocked with the branch-delete message, the plain forms
  still pass, probes red then green with the counts, `config-change-approved`)

## Plan

Copied from `backlog/work/B1.105/plan.md` (plan review approved round 4; `Plan approved by: lead, 2026-11-17`;
Rounds: 2 — the lead re-approved after diff review pass 1 #1 and plan review round 3, option a both times).

Approach: `guard-bash.sh` section 2. `GH_PR_FLAGS` (B1.103) becomes "a flag, then any words", the flag possibly behind
quotes, `\` or `$` (`"-R"`, `'--repo'`, `\-R`, `$'-R'`, `$"-R"`, `""-R`; the shell strips them, as B1.24's
`PUSH_FORCE` already handles for `$'+main'`), so a value holding spaces (`-R "$(gh repo view …)"`, `-R $(cat r)`)
counts too. Its definition moves above `GH_BRANCH_DELETE`, which uses it between `pr` and `close|merge`, with the
quotes `GH_PR_MERGE` allows after `gh` and around `pr` / the subcommand. **B1.103's merge rule widens through the
shared variable**: `gh pr -R "$(cat r)" merge 7` and `gh pr "-R" o/r merge 7` (exit 0 before) are blocked too.
Messages unchanged.

Costs, accepted by the lead (stated in the hook header and `hooks.md`): the text is matched, not run. Once `pr` is
followed by a flag, any later word `close`/`merge` counts, also on a later line of a multi-line command:
`gh pr -R o/r comment 7 -b "will close 7 -d"`, `gh pr -R o/r list --search "merge"`, and `gh pr -R o/r close 7` with
`git branch -d x` on the next line are blocked (join with `&&` or `;`). A command quoting a newly blocked spelling is
blocked (a `git commit -m`, a grep, a PR title, `card-status.sh` evidence): this card's commits use `git commit -F`.
Out of reach: a flag in a variable, an alias, a word quoted in pieces, a command built at run time (an empty unquoted
variable before the flag, `gh pr $EMPTY -R o/r close 7 -d`, among them).

Risk tier **high** (`.claude/`, hooks) → the lead's `approve`; the PR carries `config-change-approved` (D-19).

| File                          | Change                                                                              | Why          |
| ----------------------------- | ----------------------------------------------------------------------------------- | ------------ |
| `.claude/hooks/guard-bash.sh` | `GH_PR_FLAGS` widened and moved up; `GH_BRANCH_DELETE` uses it, quotes; header      | Acceptance 1 |
| `scripts/hook-smoke.sh`       | section "branch delete through gh pr flags (B1.105)": 23 blocked, 7 allowed         | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: flags, values and quotes before `close`/`merge`; the false positive | Acceptance 1 |
| `backlog/work/B1.105/*`       | plan, review, pr-body                                                               | pipeline     |

```bash
GH_PR_FLAGS='([[:space:]]+["'"'"'\\$]*-.*)?'
GH_BRANCH_DELETE="${W}gh[\"']?[[:space:]](.*[[:space:]])?(repo[[:space:]]+sync.*--force|[\"']?pr[\"']?${GH_PR_FLAGS}[[:space:]]+[\"']?(close|merge)[\"']?([[:space:]].*)?[[:space:]][\"']?(-[a-z]*d|--delete-branch))"
```

Verification: probe commits carry no `(red)` marker (no vitest file, so `verify-red.sh` cannot judge them; mistake-log
"B1.62 pushed a scripts-only probe commit"). Red shown by `scripts/hook-smoke.sh`: 16 FAIL / 797 ok at 7d753df, 7 FAIL
/ 813 ok at 18f92e0. Green: "hook-smoke: 820 probes OK" (790 + 30), `/bin/bash` 3.2. Mutants: `GH_PR_FLAGS` dropped
from `GH_BRANCH_DELETE` (13 probes pass through), B1.103's one-word value back (the `$(…)` probes), no quote after
`gh` / around `pr` / around `close` (1 each), the `["'\\$]*` class dropped (7), `$` dropped from it (2), `\` dropped (1).
`pnpm test` 403 before and after; mutation: CI only, no src/lib or src/actions change.

## Map delta

None (no `src/`, no section).

## Review

`/review-loop`: 2 passes of 3 (`backlog/work/B1.105/review.md` "Diff review" rounds 1–2; plan review rounds 1–4).

| Pass | #   | Finding                                                                                                    | Kind          | Disposition  | Justification                                                                                                      |
| ---- | --- | ---------------------------------------------------------------------------------------------------------- | ------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| 1    | 1   | `guard-bash.sh:58` `GH_PR_FLAGS` misses a first flag quoted whole or escaped (`gh pr "-R" o/r close 7 -d`) | spec-mismatch | fix now      | lead chose option a; plan rounds 3–4 (plan review r3 added `$'…'`); probes 18f92e0 (7 FAIL), fix 68fae57 (820 OK)  |
| 2    | 2   | `guard-bash.sh:60` the delete flag after `close` is matched bare or behind one quote only (`$'-d'`, `\-d`) | correctness   | out of scope | B1.24's half of the rule, fails on main with no flag before `close`, outside the card's acceptance; follow-up card |

Round 2: ready for PR. Riskiest unfalsified: bash 5 in CI (only `/bin/bash` 3.2.57 ran locally; CI's hook-smoke is
the first bash 5 run of `["'\\$]*`). Suites at 68fae57: vitest "Tests 403 passed (403)", playwright "91 passed",
hook-smoke "820 probes OK", mutation "CI only, no src/lib or src/actions change". No untrusted text tried to steer the
run.

## Evidence

- AC met: 4/4 (Acceptance clauses: flag spellings blocked with the branch-delete message, plain forms pass, red then green with counts and bash 3.2, label)
- tier: high
- plan deviations: none (review pass 1 added a probe commit and a `fix(hooks)` commit, both in plan.md's Work breakdown after re-approval)
- trace: n/a

## Checklist

- [x] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [x] Red commit precedes the green commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [x] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 % (n/a: no section, no `src/`).
- [x] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change labeled `config-change-approved`.
- [x] Migrations reviewed as SQL (n/a).
- [x] `docs/metrics.md` per-card row filled (n/a: tooling card, as B1.103); mistake-log updated if a known mistake repeated (no repeat: the probe commits carry no `(red)`).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
