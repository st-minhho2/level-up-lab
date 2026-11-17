# B1.105 plan — guard-bash lets `gh pr` with a flag before `close` delete the branch (tooling, no §)

Approach: in `guard-bash.sh` section 2, `GH_BRANCH_DELETE` takes B1.103's `GH_PR_FLAGS` between `pr` and
`close|merge` (the definition moves up beside it, `GH_PR_MERGE` keeps using it) and the same optional quotes
`GH_PR_MERGE` allows after `gh` and around `pr` / the subcommand. Message unchanged (`FORCE_MSG`). The quotes are one
step past the card's flag forms: `"gh" pr close 7 -d` and `gh "pr" "close" 7 --delete-branch` also exit 0 on
`9a37786`, on the same regex line; the lead can drop them (two probes, one `[\"']?` each) at the gate.

Costs, unchanged in kind (stated in `hooks.md` today): the text is matched, not run, so a `gh pr … close` segment whose
later words hold ` -d` (a comment) is blocked; a flag value may be any word, so a contrived
`gh pr create -t pr -b close -d` is blocked too. Out of reach as before: a flag in a variable, an alias, a word quoted
in pieces, a command built at run time.

No advice (tier quick, no section). Risk tier **high** (`.claude/`, hooks) → the lead's `approve`; the PR carries
`config-change-approved` (D-19). Dev-lead writes the hook and `scripts/` (interactive, as B1.24 and B1.103).

## Files

| File                          | Change                                                                               | Why          |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------ |
| `.claude/hooks/guard-bash.sh` | `GH_PR_FLAGS` moved above `GH_BRANCH_DELETE`, which uses it and quotes; header words | Acceptance 1 |
| `scripts/hook-smoke.sh`       | section "branch delete through gh pr flags (B1.105)": 13 blocked, 7 allowed          | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: flags and quotes between `gh`, `pr` and `close`/`merge`              | Acceptance 1 |
| `backlog/work/B1.105/*`       | plan, review, pr-body                                                                | pipeline     |

## Interfaces touched

`guard-bash.sh` (PreToolUse Bash): exit 2 + `FORCE_MSG` on the forms below; exit 0 otherwise as today.

```bash
GH_PR_FLAGS='([[:space:]]+-[^[:space:]]*([[:space:]]+[^-[:space:]][^[:space:]]*)?)*'   # unchanged, moved up
GH_BRANCH_DELETE="${W}gh[\"']?[[:space:]](.*[[:space:]])?(repo[[:space:]]+sync.*--force|[\"']?pr[\"']?${GH_PR_FLAGS}[[:space:]]+[\"']?(close|merge)[\"']?([[:space:]].*)?[[:space:]][\"']?(-[a-z]*d|--delete-branch))"
```

| Probe set (hook-smoke, `pr_cmd` JSON)                                                                                                                                                                                                                                                                                                           | Want                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `gh pr -R o/r close 7 --delete-branch`, `… close 7 -d`, `gh pr --repo o/r close 7 --delete-branch`, `--repo=o/r … -d`, `close --delete-branch 7`, `-dc bye`, `"-d"`, `gh -R o/r pr --repo o/r close 7 -d`, `/opt/homebrew/bin/gh pr -R o/r …`, after `&&`, `"gh" pr close 7 -d`, `gh "pr" "close" 7 --delete-branch`, `GH PR -R O/R CLOSE 7 -D` | exit 2, `force pushes` |
| `gh pr -R o/r close 7`, `gh pr --repo o/r close 7 -c "superseded"`, `gh pr -R o/r view 7`, `gh pr -R o/r list`, `gh pr --repo o/r list --state closed`, `gh pr -R o/r checks 7`, `gh pr -R o/r diff 7`                                                                                                                                          | exit 0                 |

## Verification

- Probe commit `test(hooks): B1.105 hook-smoke probes gh pr flags before close`, no `(red)` marker (a hook-smoke-only
  commit has no vitest file, so `verify-red.sh` cannot run on it and CI fails a marked one: mistake-log row "B1.62
  pushed a scripts-only probe commit", B1.103 #379). Red shown by `scripts/hook-smoke.sh` at that commit: exit 1,
  13 FAIL (the blocked set), 797 ok (prototype on `9a37786`: 13 FAIL, 7 ok).
- Green `chore(hooks): B1.105 guard-bash blocks gh pr close with flags before it`: "hook-smoke: 810 probes OK"
  (790 + 20), `/bin/bash` 3.2 locally, bash 5 in CI. Mutants (prototype): `GH_PR_FLAGS` dropped; its value part
  dropped; no quote after `gh`; no quotes around `pr`/`close` — each fails at least one blocked probe.
- `pnpm lint && pnpm typecheck` exit 0; `pnpm test` unchanged (no `src/`); mutation: CI only, no src/lib or
  src/actions change; `next-task.sh --check B1.105` no overlap; `check-plan-scope.sh`, `check-backlog.sh` OK; CI green.

## Work breakdown

| Step | Role     | Produces           | Commit                                                                    |
| ---- | -------- | ------------------ | ------------------------------------------------------------------------- |
| 1    | dev-lead | probes             | `test(hooks): B1.105 hook-smoke probes gh pr flags before close`          |
| 2    | dev-lead | rule, header, docs | `chore(hooks): B1.105 guard-bash blocks gh pr close with flags before it` |
| 3    | reviewer | diff review        | `docs(backlog): B1.105 review pass N`                                     |
| 4    | dev-lead | draft PR, label    | —                                                                         |

Plan review: · Plan approved by: · Rounds: 1
