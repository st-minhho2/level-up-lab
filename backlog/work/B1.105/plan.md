# B1.105 plan — guard-bash lets `gh pr` with a flag before `close` delete the branch (tooling, no §)

Approach: `guard-bash.sh` section 2. `GH_PR_FLAGS` (B1.103) becomes "a flag, then any words" so a value holding spaces
(`-R "$(gh repo view …)"`, `-R $(cat r)`) counts (review r1 #1, option a); its definition moves above
`GH_BRANCH_DELETE`, which uses it between `pr` and `close|merge`, with the quotes `GH_PR_MERGE` allows after `gh` and
around `pr` / the subcommand. `GH_PR_MERGE` keeps using `GH_PR_FLAGS`, so `gh pr -R "$(cat r)" merge 7` (exit 0 today)
is blocked too. Messages unchanged. The quotes and the merge form are one step past the card's flag forms, on the same
lines; the lead can drop them at the gate. Round 2 (diff review pass 1 #1, lead chose option a): the first flag may sit
behind quotes, `\` or `$` (`gh pr "-R" o/r close 7 -d`, `gh pr '--repo' …`, `gh pr \-R …`, `gh pr $'-R' …`,
`gh pr $"-R" …`, `""-R`; the shell strips them), so `GH_PR_FLAGS` takes `["'\\$]*` before its `-`, as B1.24's
`PUSH_FORCE` does for `$'+main'` (plan review r3, lead chose option a).

Costs, for the lead to accept (stated in the hook header and `hooks.md`): the text is matched, not run. Once `pr` is
followed by a flag, any later word `close`/`merge` counts: `gh pr -R o/r comment 7 -b "will close 7 -d"` and
`… -b "merge it"` are blocked. A command quoting a newly blocked spelling is blocked (a `git commit -m`, a grep, a PR
title, `card-status.sh` evidence): this card's commits use `git commit -F`, its title and evidence describe the forms.
Out of reach as before: a flag in a variable, an alias, a word quoted in pieces, a command built at run time (an empty
unquoted variable before the flag, `gh pr $EMPTY -R o/r close 7 -d`, among them).

Risk tier **high** (`.claude/`, hooks) → the lead's `approve`; the PR carries `config-change-approved` (D-19). No
advice (tier quick, no section). Dev-lead writes the hook and `scripts/` (interactive, as B1.24 and B1.103).

## Files

| File                          | Change                                                                              | Why          |
| ----------------------------- | ----------------------------------------------------------------------------------- | ------------ |
| `.claude/hooks/guard-bash.sh` | `GH_PR_FLAGS` widened and moved up; `GH_BRANCH_DELETE` uses it, quotes; header      | Acceptance 1 |
| `scripts/hook-smoke.sh`       | section "branch delete through gh pr flags (B1.105)": 23 blocked, 7 allowed         | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: flags, values and quotes before `close`/`merge`; the false positive | Acceptance 1 |
| `backlog/work/B1.105/*`       | plan, review, pr-body                                                               | pipeline     |

## Interfaces touched

`guard-bash.sh` (PreToolUse Bash): exit 2 on the forms below; exit 0 otherwise as today.

```bash
GH_PR_FLAGS='([[:space:]]+["'"'"'\\$]*-.*)?'
GH_BRANCH_DELETE="${W}gh[\"']?[[:space:]](.*[[:space:]])?(repo[[:space:]]+sync.*--force|[\"']?pr[\"']?${GH_PR_FLAGS}[[:space:]]+[\"']?(close|merge)[\"']?([[:space:]].*)?[[:space:]][\"']?(-[a-z]*d|--delete-branch))"
```

- Blocked, `force pushes` (15): `gh pr -R o/r close 7 --delete-branch`, `… -d`, `--repo o/r`, `--repo=o/r`,
  `close --delete-branch 7`, `-dc bye`, `"-d"`, `gh -R o/r pr --repo o/r …`, `/opt/homebrew/bin/gh …`, after `&&`,
  `"gh" pr close 7 -d`, `gh "pr" "close" …`, `GH PR -R O/R CLOSE 7 -D`, `-R "$(gh repo view …)" close 7 -d`,
  `-R $(cat r) close 7 --delete-branch`. Blocked, `agents never merge` (1): `gh pr -R "$(cat r)" merge 7`.
- Round 2, blocked (7): `force pushes` for `gh pr "-R" o/r close 7 -d`, `gh pr '--repo' o/r close 7 --delete-branch`,
  `gh pr "--repo=o/r" close 7 -d`, `gh pr \-R o/r close 7 -d`, `gh pr $'-R' o/r close 7 -d`; `agents never merge` for
  `gh pr "-R" o/r merge 7`, `gh pr $"--repo" o/r merge 7`.
- Allowed (7): `gh pr -R o/r close 7`, `gh pr --repo o/r close 7 -c "superseded"`, `gh pr -R o/r view 7`,
  `gh pr -R o/r list`, `gh pr --repo o/r list --state closed`, `gh pr -R o/r checks 7`, `gh pr -R o/r diff 7`.

## Verification

- Probe commit `test(hooks): B1.105 hook-smoke probes gh pr flags before close`, no `(red)` marker (no vitest file, so
  `verify-red.sh` cannot judge it and CI fails a marked one: mistake-log "B1.62 pushed a scripts-only probe commit").
  Red shown by `scripts/hook-smoke.sh` there: exit 1, 16 FAIL, 797 ok (prototype on `9a37786`: 16 FAIL, 7 ok).
- Green `chore(hooks): B1.105 guard-bash blocks gh pr close with flags before it`: "hook-smoke: 813 probes OK"
  (790 + 23), `/bin/bash` 3.2 locally, bash 5 in CI. Mutants (prototype): `GH_PR_FLAGS` dropped; B1.103's one-word
  value back; no quote after `gh`; no quotes around `pr`/`close` — each fails at least one blocked probe.
- Round 2: probe commit (no marker): hook-smoke exit 1, 7 FAIL, 813 ok; then the fix: "hook-smoke: 820 probes OK";
  mutants: the `["'\\$]*` class dropped → those 7 fail; `$` dropped from it → the two `$` probes fail.
- `pnpm lint && pnpm typecheck` exit 0; `pnpm test` 403 before and after (no `src/`); mutation: CI only, no src/lib or
  src/actions change; `next-task.sh --check B1.105` no overlap; `check-plan-scope.sh`, `check-backlog.sh` OK; CI green.

## Work breakdown

| Step | Role     | Produces           | Commit                                                                      |
| ---- | -------- | ------------------ | --------------------------------------------------------------------------- |
| 1    | dev-lead | probes             | `test(hooks): B1.105 hook-smoke probes gh pr flags before close`            |
| 2    | dev-lead | rule, header, docs | `chore(hooks): B1.105 guard-bash blocks gh pr close with flags before it`   |
| 3    | reviewer | diff review        | `docs(backlog): B1.105 review pass N`                                       |
| 4    | dev-lead | round 2 probes     | `test(hooks): B1.105 review pass 1 -- probe a quoted or escaped first flag` |
| 5    | dev-lead | round 2 fix, docs  | `fix(hooks): B1.105 review pass 1 -- a quoted or escaped first flag`        |

Plan review: · Plan approved by: · Rounds: 2
