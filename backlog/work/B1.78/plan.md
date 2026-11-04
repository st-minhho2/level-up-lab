# B1.78 plan — dev-lead's write guard stops at dev-lead in a headless run, so the roles it dispatches can write (tooling, no §)

Approach: **A, variant A2** (`advice.md`) — `path-guard.sh` takes an optional `--role <owner>`; only dev-lead's
frontmatter passes `--role dev-lead`. With it, the hook defers (exit 0) only when the input's `agent_type` is
non-empty, is not the owner, matches `^[a-z][a-z0-9-]*$`, and `.claude/agents/<agent_type>.md` frontmatter runs
`hooks/path-guard.sh` itself; every other caller gets dev-lead's list unchanged (fail closed). Risk tier **high**
(`.claude/`, D-28) → the lead's `approve`; the PR carries `config-change-approved` (D-19). No `run.sh` change.

How the guard tells the caller apart (card Acceptance; `probe.md`, real input of 2.1.303 in the runner container):
`agent_type` names the caller in every PreToolUse input: `dev-lead` for the headless `--agent` main session (no
`agent_id` key) and for the interactive dev-lead subagent (with `agent_id`); a dispatched role's own name otherwise.
Under `-p --agent` the lead's frontmatter hook fired for the subagent's write next to the subagent's own hook (bug
reproduced). `CLAUDE_CODE_AGENT` is the same for both, so it is not used.

## Files

| File                          | Change                                                                                            | Why                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------- |
| `.claude/hooks/path-guard.sh` | optional `--role <owner>`; early `exit 0` under the four conditions; header names B1.78           | Acceptance 1, 2           |
| `.claude/agents/dev-lead.md`  | frontmatter hook command gains `''--role'' ''dev-lead''` first; body unchanged                    | Acceptance 1, 2           |
| `scripts/hook-smoke.sh`       | section "path-guard.sh --role (B1.78)", probes HG1–HG16 (red first); `role_patterns dev-lead` row | Acceptance 3 (both modes) |
| `.claude/docs/hooks.md`       | `path-guard.sh` row and "Role write scopes": `--role`, deferral conditions, fail closed           | doc drift                 |
| `scripts/CLAUDE.md`           | the `hook-smoke.sh` row names HG1–HG16                                                            | doc drift                 |
| `backlog/work/B1.78/*`        | probe, advice, plan, review, pr-body                                                              | pipeline                  |

## Interfaces touched

```
path-guard.sh [--role <owner>] <glob>...           # without --role: exactly today's behaviour (the other five roles)
  --role defers (exit 0) iff  agent_type != "" && agent_type != <owner> && agent_type =~ ^[a-z][a-z0-9-]*$
                              && .claude/agents/<agent_type>.md frontmatter has a command running hooks/path-guard.sh
  else <owner>'s globs as today · `--role` with no name or no glob → exit 2 (misconfiguration)
dev-lead.md: path-guard.sh --role dev-lead 'backlog/*' 'docs/metrics.md' 'docs/mistake-log.md' '!backlog/00-decisions.md' '!backlog/work/*/review.md'
hook-smoke HG1 reviewer/review.md → 0 · HG2 test-writer/*.test.ts → 0 · HG3 code-writer/src → 0 (red today: exit 2)
  HG4–HG7 dev-lead (no agent_id = headless, agent_id = interactive): review.md, src/, prisma/, e2e/, tests → 2; plan.md → 0
  HG8 no agent_type → 2 · HG9 general-purpose/Explore/claude on src → 2 · HG10 general-purpose plan.md → 0
  HG11 hostile type (`../hooks/lib`, newline) → 2 · HG12 role file missing / path-guard only in prose → 2
  HG13 `--role` without name → 2 · HG14 real frontmatter command end to end (reviewer 0, dev-lead 2, none 2; red)
  HG15 role_patterns dev-lead carries `--role dev-lead` (red) · HG16 other five roles' rows unchanged
```

## Verification

- Red `test(scripts): B1.78 path-guard role probes` (hook-smoke only): HG1–HG3, HG14, HG15 FAIL, every other probe ok
  (today "522 probes OK").
- Green `chore(hooks): B1.78 dev-lead's guard defers to a guarded role` (no probe file): hook-smoke "538 probes OK";
  `check-agent-frontmatter.sh`, `run-smoke.sh`, `pnpm lint && pnpm typecheck && pnpm test` green;
  `check-plan-scope.sh`, `check-backlog.sh` OK.
- Live (after merge, Part 2): rerun of #207 passes the reviewer's `review.md` write with 0 permission denials (run 1
  had 4) [unverified until then]; `run.sh --check-binary` still blocks dev-lead's own `spec/` write.

## Work breakdown

| Step | Role     | Produces                | Commit                                                          |
| ---- | -------- | ----------------------- | --------------------------------------------------------------- |
| 1    | dev-lead | red probes HG1–HG16     | `test(scripts): B1.78 path-guard role probes`                   |
| 2    | dev-lead | hook, frontmatter, docs | `chore(hooks): B1.78 dev-lead's guard defers to a guarded role` |
| 3    | reviewer | diff review             | `docs(backlog): B1.78 review pass N`                            |
| 4    | dev-lead | draft PR, label         | —                                                               |

Not in scope: `run.sh`/ALLOW, the other five agents' frontmatter, the stale `plan-scope.sh:8` comment ("the main
thread carries none", advice Q1) — a follow-up only if the lead wants it.

Plan review: pending · Plan approved by: · Rounds: 1
