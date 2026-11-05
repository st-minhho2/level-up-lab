## Item

B1.78 — dev-lead's write guard stops at dev-lead in a headless run, so the roles it dispatches can write (tooling, no
spec section)

- spec: none — tooling (D-27, D-29); no `src/` change, no section
- test: `scripts/hook-smoke.sh` HG1–HG13 (new) and updated role rows — pending
- acceptance: pending
- risk tier: high (`.claude/`); label `config-change-approved` (D-19)
- live proof: rerun of issue #207 (B5.2) after this merges

## Plan

### B1.78 plan — dev-lead's write guard stops at dev-lead in a headless run, so the roles it dispatches can write (tooling, no §)

Approach: **A, variant A3** (the lead's change at the gate, round 2; `advice.md` A with A2's deferral replaced) —
`path-guard.sh` takes an optional `--role <owner>`; only dev-lead's frontmatter passes `--role dev-lead`. With it,
the hook never defers: a call whose `agent_type` is another name gets **that role's own path list, read from the
frontmatter of `.claude/agents/<agent_type>.md`**, and any failure to read it blocks. So in a headless run each
dispatched role is held by its list twice (its own hook and dev-lead's), and a role whose own hook did not fire is
still held (closes review r2's riskiest unfalsified point). Risk tier **high** (`.claude/`, D-28) → the lead's
`approve`; the PR carries `config-change-approved` (D-19). No `run.sh` change.

How the guard tells the caller apart (`probe.md`, real input of 2.1.303 in the runner container): `agent_type` names
the caller in every PreToolUse input: `dev-lead` for the headless `--agent` main session (no `agent_id` key) and for
the interactive dev-lead subagent (with `agent_id`); a dispatched role's own name otherwise. Under `-p --agent` the
lead's frontmatter hook fired for the subagent's write next to the subagent's own hook (bug reproduced).

#### Files

| File                             | Change                                                                                                                                                                                                     | Why                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `.claude/hooks/path-guard.sh`    | optional `--role <owner>`; another caller's list read from its frontmatter, read failure blocks; B1.78                                                                                                     | Acceptance 1, 2           |
| `.claude/agents/dev-lead.md`     | frontmatter hook command gains `''--role'' ''dev-lead''` first; body unchanged                                                                                                                             | Acceptance 1, 2           |
| `.claude/agents/advisor.md`      | frontmatter: `''!backlog/work/*/review.md''` added (lead, gate round 2)                                                                                                                                    | lead's change             |
| `.claude/agents/spec-analyst.md` | frontmatter: `''!backlog/work/*/review.md''` added (lead, gate round 2)                                                                                                                                    | lead's change             |
| `scripts/hook-smoke.sh`          | section "path-guard.sh --role (B1.78)" HG1–HG13; `role_patterns`/`role_probes` rows                                                                                                                        | Acceptance 3 (both modes) |
| `.claude/docs/hooks.md`          | `path-guard.sh` row and "Role write scopes": `--role`, the role's own list, read failure blocks; only the `''`-quoted form parses (a reformat blocks every dispatched role); advisor and spec-analyst rows | doc drift                 |
| `scripts/CLAUDE.md`              | the `hook-smoke.sh` row names HG1–HG13                                                                                                                                                                     | doc drift                 |
| `backlog/work/B1.78/*`           | probe, advice, plan, review, pr-body                                                                                                                                                                       | pipeline                  |

#### Interfaces touched

```
path-guard.sh [--role <owner>] <glob>...      # without --role: exactly today's behaviour
  with --role, the patterns applied are chosen by the input's agent_type:
    absent or "" or == <owner>  → <owner>'s globs (as today; fail closed for a missing agent_type)
    anything else               → the role's globs, read without eval from the frontmatter (between the first two
      `---` lines) of $CLAUDE_PROJECT_DIR/.claude/agents/<agent_type>.md: exactly one `command:` line of the form
      '"$CLAUDE_PROJECT_DIR/.claude/hooks/path-guard.sh" ''<glob>'' …' (YAML '' → '), each glob a single-quoted token;
      exit 2 if agent_type !~ ^[a-z][a-z0-9-]*$, the file is missing, no or two such lines, any other token, no glob,
      or the role's own command carries --role
  `--role` with no name, or no glob after it → exit 2
dev-lead.md:     path-guard.sh --role dev-lead 'backlog/*' … '!backlog/work/*/review.md'   (rest unchanged)
advisor.md:      path-guard.sh 'backlog/work/*' '!backlog/work/*/review.md'
spec-analyst.md: path-guard.sh 'spec/contracts/*' 'backlog/*' '!spec/features-map.md' '!backlog/00-decisions.md' '!backlog/work/*/review.md'
```

hook-smoke, new section (calls per id; dev-lead's real list with `--role dev-lead`; every input has a `file_path`):
HG1 reviewer: review.md 0, plan.md 2 (2) · HG2 test-writer: `src/lib/todos.test.ts` 0, `e2e/x.spec.ts` 0, `src/lib/todos.ts`
2 (3) · HG3 code-writer: `src/lib/todos.ts` 0, `src/lib/todos.test.ts` 2 (2) · HG4 dev-lead, no `agent_id`: review.md,
src, `prisma/schema.prisma`, e2e, test → 2 (5) · HG5 same, plan.md 0 (1) · HG6 dev-lead with `agent_id`: review.md 2,
src 2, plan.md 0 (3) · HG7 no `agent_type`: review.md 2, src 2, plan.md 0 (3) · HG8 general-purpose, Explore, claude
on plan.md → 2 (3) · HG9 advisor review.md 2, spec-analyst review.md 2 (2) · HG10 `../hooks/lib`, `Reviewer`,
`ns:reviewer` on plan.md → 2 (3) · HG11 fixture project, a role whose own glob is `''backlog/*''`, writing
`backlog/work/B9.1/plan.md` (dev-lead's list allows it, so only the read failure blocks): file missing; path-guard only
in the body; an unquoted `$(touch <marker>)` token, and the marker is not created (no eval); two path-guard lines → 2 (5) · HG12 `--role` alone; `--role dev-lead` with no
glob → 2 (2) · HG13 the real dev-lead frontmatter command: reviewer review.md 0, reviewer plan.md 2, dev-lead
review.md 2, none src 2 (4). = 38 calls.
Existing rows: `role_patterns` dev-lead, advisor, spec-analyst updated (0 new calls); `role_probes` advisor and
spec-analyst gain `2 backlog/work/B1.2/review.md` (+2 frontmatter rows, +16 in the 4 layouts × 2 modes loop).

#### Verification

- Red `test(scripts): B1.78 path-guard role probes` (hook-smoke only, body "Red because …"): 22 FAIL lines — HG1 ×2,
  HG2 ×2, HG3 ×1, HG8 ×3, HG10 ×3, HG11 ×4 (the marker row passes), HG13 reviewer ×2, `role_patterns` ×3, `role_probes` advisor/spec-analyst
  review.md ×2 in the frontmatter section; every other probe ok.
- Green `chore(hooks): B1.78 dev-lead's guard applies the dispatched role's own list` (no probe file): "hook-smoke:
  578 probes OK" (522 + 38 + 18); `check-agent-frontmatter.sh`, `run-smoke.sh`, `pnpm lint && pnpm typecheck && pnpm
test` green; `check-plan-scope.sh`, `check-backlog.sh` OK.
- Live (after merge, Part 2): rerun of #207 passes the reviewer's `review.md` write with 0 permission denials (run 1
  had 4) [unverified until then]; `run.sh --check-binary` still blocks dev-lead's own `spec/` write.

#### Work breakdown

| Step | Role     | Produces                | Commit                                                                        |
| ---- | -------- | ----------------------- | ----------------------------------------------------------------------------- |
| 1    | dev-lead | red probes              | `test(scripts): B1.78 path-guard role probes`                                 |
| 2    | dev-lead | hook, frontmatter, docs | `chore(hooks): B1.78 dev-lead's guard applies the dispatched role's own list` |
| 3    | reviewer | diff review             | `docs(backlog): B1.78 review pass N`                                          |
| 4    | dev-lead | draft PR, label         | —                                                                             |

Not in scope: `run.sh`/ALLOW, reviewer/test-writer/code-writer frontmatter, the stale `plan-scope.sh:8` comment.

Plan review: changes requested, round 3 (1 finding: HG11 could not tell a read failure from dev-lead's list → fixed above, unreviewed; over the 2-round cap) · Plan approved by: lead, 2026-11-05 (HG11 fix from review round 3 accepted unreviewed) · Rounds: 2

## Map delta

None: tooling card, no `spec/features-map.md` row.

## Review

pending

## Evidence

- AC met: pending
- tier: high
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the green commit; the green `chore(` commit touches no probe.
- [ ] n/a: no `src/` change, no `AC-§.n`, no mutation target.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change carries `config-change-approved`.
- [ ] n/a: no migration.
- [ ] `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
