## Item

B1.105 — guard-bash lets `gh pr` with a flag before `close` delete the branch (tooling, no spec section)

- spec: none — tooling (`.claude/hooks/guard-bash.sh`, `scripts/hook-smoke.sh`, `.claude/docs/hooks.md`); no `src/`
  change, no section
- test: `scripts/hook-smoke.sh` section "branch delete through gh pr flags (B1.105)" — red before (16 blocked probes
  FAIL), green after
- acceptance: all four clauses of the card (flag spellings blocked with the branch-delete message, the plain forms
  still pass, probes red then green with the counts, `config-change-approved`)

## Plan

Copied from `backlog/work/B1.105/plan.md` (plan review approved round 2; `Plan approved by: lead, 2026-11-17`;
Rounds: 1).

Approach: `guard-bash.sh` section 2. `GH_PR_FLAGS` (B1.103) becomes "a flag, then any words" so a value holding spaces
(`-R "$(gh repo view …)"`, `-R $(cat r)`) counts (review r1 #1, option a); its definition moves above
`GH_BRANCH_DELETE`, which uses it between `pr` and `close|merge`, with the quotes `GH_PR_MERGE` allows after `gh` and
around `pr` / the subcommand. `GH_PR_MERGE` keeps using `GH_PR_FLAGS`, so `gh pr -R "$(cat r)" merge 7` (exit 0 before)
is blocked too: **B1.103's merge rule widens through the shared variable** (review r2 cost 3). Messages unchanged.

Costs, accepted by the lead (stated in the hook header and `hooks.md`): the text is matched, not run. Once `pr` is
followed by a flag, any later word `close`/`merge` counts, also on a later line of a multi-line command:
`gh pr -R o/r comment 7 -b "will close 7 -d"`, `gh pr -R o/r list --search "merge"`, and `gh pr -R o/r close 7` with
`git branch -d x` on the next line are blocked (join with `&&` or `;`). A command quoting a newly blocked spelling is
blocked (a `git commit -m`, a grep, a PR title, `card-status.sh` evidence): this card's commits use `git commit -F`.
Out of reach as before: a flag in a variable, an alias, a word quoted in pieces, a command built at run time.

Risk tier **high** (`.claude/`, hooks) → the lead's `approve`; the PR carries `config-change-approved` (D-19).

| File                          | Change                                                                              | Why          |
| ----------------------------- | ----------------------------------------------------------------------------------- | ------------ |
| `.claude/hooks/guard-bash.sh` | `GH_PR_FLAGS` widened and moved up; `GH_BRANCH_DELETE` uses it, quotes; header      | Acceptance 1 |
| `scripts/hook-smoke.sh`       | section "branch delete through gh pr flags (B1.105)": 16 blocked, 7 allowed         | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: flags, values and quotes before `close`/`merge`; the false positive | Acceptance 1 |
| `backlog/work/B1.105/*`       | plan, review, pr-body                                                               | pipeline     |

```bash
GH_PR_FLAGS='([[:space:]]+-.*)?'
GH_BRANCH_DELETE="${W}gh[\"']?[[:space:]](.*[[:space:]])?(repo[[:space:]]+sync.*--force|[\"']?pr[\"']?${GH_PR_FLAGS}[[:space:]]+[\"']?(close|merge)[\"']?([[:space:]].*)?[[:space:]][\"']?(-[a-z]*d|--delete-branch))"
```

Verification: probe commit without the `(red)` marker (no vitest file; mistake-log "B1.62 pushed a scripts-only probe
commit"), red shown by `scripts/hook-smoke.sh` there (16 FAIL, 797 ok); green "hook-smoke: 813 probes OK" (790 + 23);
mutants: `GH_PR_FLAGS` dropped, B1.103's one-word value back, no quote after `gh`, no quotes around `pr`/`close`;
`pnpm test` 403 before and after; mutation: CI only, no src/lib or src/actions change.

## Map delta

None (no `src/`, no section).

## Review

pending

## Evidence

- AC met: pending
- tier: high
- plan deviations: pending
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the green commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 % (n/a: no section, no `src/`).
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change labeled `config-change-approved`.
- [ ] Migrations reviewed as SQL (n/a).
- [ ] `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
