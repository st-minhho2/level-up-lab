# B1.21 plan — Parallel sessions report status: draft PR, a ping when waiting, branches kept current (tooling)

Approach: one hook script, three wiring lines, one `worktree.sh` default, and the dev-lead Loop. spec-analyst/advisor
skipped (no section). Facts from code.claude.com/docs/en/hooks.md: `Stop` input carries `last_assistant_message`;
`Notification` fires `idle_prompt` about 60 s after a finished turn with no typing (not configurable); a hook's
stdout is not shown, so a ping needs an OS notifier; the desktop app already notifies when a session finishes a turn.

- **Ping + wait log** (`.claude/hooks/lead-ping.sh <stop|idle|resume>`): `stop` → when `last_assistant_message`
  holds one of dev-lead's two fixed lines, "Plan for <card> is ready. Reply `approve`" or the new "PR for <card> is
  ready for the lead:", it notifies (osascript on macOS, notify-send when present, else nothing; `LEAD_PING_NOTIFIER`
  overrides) and appends `<epoch>⇥wait⇥<card>⇥plan|pr⇥<session>` to `<git common dir>/claude-wait.log`; `idle`
  (Notification `idle_prompt`) notifies again if a wait is open; `resume` (UserPromptSubmit) appends `resume` when
  the session has an open wait. Card = the session `cwd`'s branch id, else `-`. Never blocks: always exit 0. The log
  is what step 1d turns into "session wait time for the lead".
- **Draft PR as the status board:** Loop 5, right after `approve`: push, `gh pr create --draft` (body = plan.md),
  label per D-19. Loop 9: `git fetch && git merge origin/main` (no rebase, no force push), push, wait for the
  checks (`gh pr checks <n> --watch`), `gh pr ready`, then print the PR line. A sibling's merge (BEHIND) → merge
  `origin/main` again before reporting.
- **Current base:** `scripts/worktree.sh` fetches and defaults `[base]` to `origin/main` (local `main` if no origin).

## Files

| File                                | Change                                                         |
| ----------------------------------- | -------------------------------------------------------------- |
| `.claude/hooks/lead-ping.sh`        | new                                                            |
| `.claude/settings.json`             | Stop, Notification `idle_prompt`, UserPromptSubmit → lead-ping |
| `scripts/worktree.sh`               | fetch; default base `origin/main`                              |
| `scripts/hook-smoke.sh`             | probes L1–L7 and K1–K2                                         |
| `.claude/agents/dev-lead.md`        | Loop 5 draft PR; Loop 9 merge main, checks, ready, PR line     |
| `.claude/skills/work-next/SKILL.md` | gate and exit lines                                            |
| `.claude/docs/git-workflow.md`      | "Keep the branch current" paragraph                            |
| `.claude/docs/hooks.md`             | lead-ping row                                                  |
| `scripts/CLAUDE.md`                 | `worktree.sh` base                                             |
| `backlog/work/B1.21/plan.md`        | plan                                                           |
| `backlog/work/B1.21/review.md`      | reviews                                                        |

## Interfaces touched

```bash
.claude/hooks/lead-ping.sh stop|idle|resume    # stdin: hook JSON (cwd, session_id, last_assistant_message); exit 0 always
<git common dir>/claude-wait.log               # <epoch>\t(wait|resume)\t<card|->\t(plan|pr|-)\t<session_id>
scripts/worktree.sh <branch> [base]            # base defaults to origin/main after `git fetch origin`
PR line (dev-lead, verbatim): "PR for <card> is ready for the lead: <url>"
```

Probes: L1 stop + plan line on `feat/B9.1-x` → one `wait B9.1 plan` line, notifier called; L2 stop + PR line → `wait
… pr`; L3 stop + other text → no line, no call; L4 resume after L1 → one `resume B9.1` line; L5 resume with no open
wait → nothing; L6 idle with an open wait → notifier called, no line; L7 notifier missing or failing → exit 0.
K1 `worktree.sh feat/B9.1-x` in a repo whose local `main` is behind `origin/main` → the branch starts at
`origin/main`; K2 explicit `[base]` still wins.

## Verification (in the card worktree)

```bash
scripts/hook-smoke.sh   # test commit: L1–L7, K1 FAIL (script missing, base main), K2 ok; green: 284 + 9 OK
scripts/ci/check-agent-frontmatter.sh && scripts/ci/check-plan-scope.sh && bash -n .claude/hooks/*.sh scripts/*.sh
```

Steps: `test(scripts)` → `feat(hooks)` → `reviewer` diff → PR, labeled `config-change-approved` at creation (D-19).
Live check after merge, in a session started afterwards: one plan gate writes the wait line and notifies.

Plan review: <pending> · Plan approved by: <empty until the lead approves> · Rounds: 1
