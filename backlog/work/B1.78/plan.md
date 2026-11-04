# B1.78 plan — dev-lead's write guard stops at dev-lead in a headless run, so the roles it dispatches can write (tooling, no §)

Approach: **A, variant A2** (`advice.md`) — `path-guard.sh` takes an optional `--role <owner>`; only dev-lead's
frontmatter passes `--role dev-lead`. With it, the hook defers (exit 0) only when the input's `agent_type` is
non-empty, is not the owner, matches `^[a-z][a-z0-9-]*$`, and the frontmatter of `.claude/agents/<agent_type>.md`
runs `hooks/path-guard.sh` itself; every other caller gets dev-lead's list unchanged (fail closed). Risk tier **high**
(`.claude/`, D-28) → the lead's `approve`; the PR carries `config-change-approved` (D-19). No `run.sh` change.

How the guard tells the caller apart (card Acceptance; `probe.md`, real input of 2.1.303 in the runner container):
`agent_type` names the caller in every PreToolUse input: `dev-lead` for the headless `--agent` main session (no
`agent_id` key) and for the interactive dev-lead subagent (with `agent_id`); a dispatched role's own name otherwise.
Under `-p --agent` the lead's frontmatter hook fired for the subagent's write next to the subagent's own hook (bug
reproduced). `CLAUDE_CODE_AGENT` is the same for both, so it is not used.

**The lead decides at this gate** (r1 reason 2): under A2 a headless advisor (`backlog/work/*`) or spec-analyst
(`backlog/*`) could write `backlog/work/<card>/review.md`, which dev-lead's list refuses today and which D-27 trusts.
Proposed: add `'!backlog/work/*/review.md'` to advisor.md and spec-analyst.md, which also closes the same gap in
interactive sessions (today both may write it there). Alternative: accept the cost and leave both files as they are.

## Files

| File                             | Change                                                                                  | Why                       |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------- |
| `.claude/hooks/path-guard.sh`    | optional `--role <owner>`; early `exit 0` under the four conditions; header names B1.78 | Acceptance 1, 2           |
| `.claude/agents/dev-lead.md`     | frontmatter hook command gains `''--role'' ''dev-lead''` first; body unchanged          | Acceptance 1, 2           |
| `.claude/agents/advisor.md`      | frontmatter: `''!backlog/work/*/review.md''` added (decision above)                     | r1 reason 2               |
| `.claude/agents/spec-analyst.md` | frontmatter: `''!backlog/work/*/review.md''` added (decision above)                     | r1 reason 2               |
| `scripts/hook-smoke.sh`          | section "path-guard.sh --role (B1.78)" HG1–HG13; `role_patterns`/`role_probes` rows     | Acceptance 3 (both modes) |
| `.claude/docs/hooks.md`          | `path-guard.sh` row and "Role write scopes": `--role`, deferral conditions, fail closed | doc drift                 |
| `scripts/CLAUDE.md`              | the `hook-smoke.sh` row names HG1–HG13                                                  | doc drift                 |
| `backlog/work/B1.78/*`           | probe, advice, plan, review, pr-body                                                    | pipeline                  |

## Interfaces touched

```
path-guard.sh [--role <owner>] <glob>...      # without --role: exactly today's behaviour
  defers (exit 0) iff agent_type != "" && != <owner> && =~ ^[a-z][a-z0-9-]*$ && the frontmatter (between the first
  two `---` lines) of $CLAUDE_PROJECT_DIR/.claude/agents/<agent_type>.md has a `command:` running hooks/path-guard.sh
  else <owner>'s globs as today · `--role` with no name, or no glob after it → exit 2
dev-lead.md:     path-guard.sh --role dev-lead 'backlog/*' … '!backlog/work/*/review.md'   (rest unchanged)
advisor.md:      path-guard.sh 'backlog/work/*' '!backlog/work/*/review.md'
spec-analyst.md: path-guard.sh 'spec/contracts/*' 'backlog/*' '!spec/features-map.md' '!backlog/00-decisions.md' '!backlog/work/*/review.md'
```

hook-smoke, new section (calls per id; dev-lead's real list with `--role dev-lead`, paths under `$PWD`):
HG1 reviewer review.md → 0 (1) · HG2 test-writer `src/lib/todos.test.ts`, `e2e/x.spec.ts` → 0 (2) · HG3 code-writer
`src/lib/todos.ts` → 0 (1) · HG4 dev-lead, no `agent_id`: review.md, src, `prisma/schema.prisma`, e2e, test → 2 (5) ·
HG5 same, plan.md → 0 (1) · HG6 dev-lead with `agent_id`: review.md 2, src 2, plan.md 0 (3) · HG7 no `agent_type`:
review.md, src → 2 (2) · HG8 general-purpose, Explore, claude on src → 2 (3) · HG9 general-purpose plan.md → 0 (1) ·
HG10 `../hooks/lib`, `Reviewer`, `ns:reviewer` on src → 2 (3) · HG11 fixture project: reviewer file missing; path-guard
only in its body → 2 (2) · HG12 `--role` alone; `--role dev-lead` with no glob → 2 (2) · HG13 the real dev-lead
frontmatter command: reviewer review.md 0, dev-lead review.md 2, none src 2 (3). = 29 calls.
Existing rows: `role_patterns` dev-lead, advisor, spec-analyst updated (0 new calls); `role_probes` advisor and
spec-analyst gain `2 backlog/work/B1.2/review.md` (+2 frontmatter rows, +16 in the 4 layouts × 2 modes loop).

## Verification

- Red `test(scripts): B1.78 path-guard role probes` (hook-smoke only, body "Red because …"): exactly 10 FAIL lines —
  HG1, HG2 ×2, HG3, HG13 reviewer row, `role_patterns` dev-lead/advisor/spec-analyst, `role_probes` advisor and
  spec-analyst review.md in the frontmatter section; the layout loop's new rows pass already (`!` works today).
- Green `chore(hooks): B1.78 dev-lead's guard defers to a guarded role` (no probe file): "hook-smoke: 569 probes OK"
  (522 + 29 + 18); `check-agent-frontmatter.sh`, `run-smoke.sh`, `pnpm lint && pnpm typecheck && pnpm test` green;
  `check-plan-scope.sh`, `check-backlog.sh` OK.
- Live (after merge, Part 2): rerun of #207 passes the reviewer's `review.md` write with 0 permission denials (run 1
  had 4) [unverified until then]; `run.sh --check-binary` still blocks dev-lead's own `spec/` write.

## Work breakdown

| Step | Role     | Produces                | Commit                                                          |
| ---- | -------- | ----------------------- | --------------------------------------------------------------- |
| 1    | dev-lead | red probes              | `test(scripts): B1.78 path-guard role probes`                   |
| 2    | dev-lead | hook, frontmatter, docs | `chore(hooks): B1.78 dev-lead's guard defers to a guarded role` |
| 3    | reviewer | diff review             | `docs(backlog): B1.78 review pass N`                            |
| 4    | dev-lead | draft PR, label         | —                                                               |

Not in scope: `run.sh`/ALLOW, reviewer/test-writer/code-writer frontmatter, the stale `plan-scope.sh:8` comment.

Plan review: changes requested, round 1 (3 reasons: counts, advisor/spec-analyst review.md, HG10 inputs) · Plan approved by: · Rounds: 1
