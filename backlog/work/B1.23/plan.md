# B1.23 plan — Card sessions run their own PR steps: push, open, label, mark ready (tooling)

Approach: four exact `permissions.allow` rules in `.claude/settings.json`, so auto mode stops refusing the PR steps
B1.21's Loop 9 and D-19 already assign to `dev-lead` (refused in batch 2–3: `gh pr ready 78`, B3.2's `git push` and
`gh pr create`). Nothing else widens: merge, review, hooks and the force-push guard stay as they are. Probes in
`scripts/hook-smoke.sh` pin the exact set. Tooling card: spec-analyst and advisor skipped (no section; the card's
Acceptance is the contract).

- `git push` is safe to allow because `guard-bash.sh` (PreToolUse) blocks every forced-push spelling before
  permissions apply; hook-smoke already probes `--force`, `-f`, `+main`, `--force-with-lease`.
- `gh pr edit` is allowed only with `--add-label config-change-approved` (D-19); `hotfix` stays the lead's.
- `.claude/docs/hooks.md` says `allow` "pre-approves the routine project commands" and `deny` stops `gh api` and
  environment dumps; neither is true today (`allow` is empty; no such deny). The paragraph is corrected to the file.

## Files

| File                           | Change                                                         |
| ------------------------------ | -------------------------------------------------------------- |
| `.claude/settings.json`        | `permissions.allow`: the four rules below                      |
| `scripts/hook-smoke.sh`        | `== permissions (B1.23)` probes P1–P4                          |
| `.claude/docs/hooks.md`        | the permissions paragraph states the real allow and deny lists |
| `backlog/work/B1.23/plan.md`   | plan                                                           |
| `backlog/work/B1.23/review.md` | reviews                                                        |

## Interfaces touched

```json
"allow": [
  "Bash(git push*)",
  "Bash(gh pr create*)",
  "Bash(gh pr ready*)",
  "Bash(gh pr edit * --add-label config-change-approved)"
]
```

Probes: P1 `allow` equals exactly those four strings (order-free); P2 no other `allow` entry starts with `Bash(gh` or
`Bash(git`; P3 `deny` still holds `Bash(gh pr merge*)`, `Bash(gh pr review*)` and the three `--no-verify` / `-n` rules;
P4 `guard-bash.sh` still blocks `git push --force origin main` after the change (existing probe re-asserted by name).

## Verification (in the card worktree)

```bash
scripts/hook-smoke.sh            # test commit: P1, P2 FAIL (allow empty), P3, P4 ok; green: 288 probes OK
scripts/ci/check-config-change.sh  # local ::error:: on the two protected files; PR carries config-change-approved
scripts/ci/check-plan-scope.sh && scripts/ci/check-backlog.sh
```

After merge: the next card session's `git push`, `gh pr create`, label and `gh pr ready` run without a refusal
(checked on the next card PR; reported in the closing PR).

Steps: `test(scripts)` (red) → `chore(config)` (green) → `reviewer` diff → draft PR at the gate, labeled
`config-change-approved` (D-19: `.claude/settings.json`, `.claude/docs/`), ready at Loop 9.
