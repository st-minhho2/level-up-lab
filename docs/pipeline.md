# Agent pipeline: from backlog to pull request

The backlog lives in `docs/specs/`. An agent picks the next task, and the work passes down a chain of roles. A
human is needed exactly once: to approve the plan before any source file changes (`.claude/rules/planning.md`).
Entry point: `/work-next [FEAT-xxx]` (`.claude/skills/work-next/SKILL.md`).

## Roles

| Role (`.claude/agents/`) | Model   | Reads                                                                    | Writes                                                                                                                     | Moves status to            |
| ------------------------ | ------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `spec-analyst`           | sonnet  | `spec.md`, TEMPLATE rules, code the slice names                          | `analysis.md`: completeness table, proposed REQ/AC/unchanged-behavior tables, open questions with proposed decisions, tier | `analyzed`                 |
| `advisor`                | sonnet  | spec + analysis + `src/lib`, `src/actions`, rules, FEAT-001 as reference | `advice.md`: approaches with trade-offs, recommendation, impact table, risks, test strategy, mutation hot spots            | `advised`                  |
| `dev-lead`               | inherit | spec + analysis + advice (+ change requests)                             | `spec.md` §2/§3/§5/§7 applied, `plan.md` (Files / Interfaces / Verification / Work breakdown)                              | `planned` → **human gate** |
| `tech-lead`              | inherit | the whole folder, rules, the diff                                        | `review.md`: plan review (ticks the lead box) and diff review (runs guards, compares diff with plan)                       | `approved`, `review`       |
| `test-writer`            | inherit | spec, skeleton                                                           | `*.test.ts(x)`, one `e2e/*.spec.ts`; `verify-red.sh` exit 0                                                                | (`in-progress`)            |
| `implementer`            | inherit | spec, red tests                                                          | `src/**`, `prisma/**`, metrics row                                                                                         | (`in-progress`)            |

Write scopes are **enforced by a hook in each agent's frontmatter** (`.claude/hooks/path-guard.sh <globs>`), not
by prose: analyst/advisor → the task folder minus `spec.md`; dev-lead → the task folder, metrics, mistake log;
tech-lead → `review.md` and the spec's lead box; test-writer → `*.test.ts(x)`, `e2e/`, spec traceability;
implementer → `src/`, `prisma/`, metrics, never tests or `src/lib/prisma.ts`. A blocked write tells the role to
report back instead. The two reading-heavy roles run on `sonnet`; deciding and writing roles inherit (D-3).

Every role ends with a fixed report shape (`ANALYZED:` / `ADVISED:` / `RED:` / `GREEN:` / `REVIEW:` lines) so the
orchestrator reads results, not prose. `dev-lead` is control plane: it writes only docs and dispatches one role at
a time with the brief template in its agent file.

## State machine

```
backlog ──spec-analyst──▶ analyzed ──advisor──▶ advised ──dev-lead──▶ planned
                                                                          │  human approves plan.md
                                                                          ▼
                                                   tech-lead plan review: approved
                                                                          │  skeleton → red → green
                                                                          ▼
                                                              in-progress ──tech-lead diff review──▶ review ──human merges──▶ done

any state ──needs a human decision──▶ blocked (blocked_reason in the frontmatter) ──▶ back to its previous state
```

`scripts/task-status.sh <id> <status>` is the only way to move: one step forward, one step back, or `blocked`
with a reason. `scripts/next-task.sh` picks the lowest `priority` among `backlog` tasks whose `depends_on` are all
`done`; `--list` prints the board.

## Hand-off artifacts

One folder per task, `docs/specs/FEAT-xxx-<slug>/`:

| File          | Owner                     | Fixed headings the next role relies on                                                                                                   |
| ------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `spec.md`     | human (intent) → dev-lead | TEMPLATE sections; frontmatter `id/title/status/priority/tier/owner/depends_on`                                                          |
| `analysis.md` | spec-analyst              | Completeness · Proposed requirements · Proposed acceptance criteria · Proposed unchanged behavior · Open questions · Tier recommendation |
| `advice.md`   | advisor                   | Approaches · Recommendation · Impact · Risks · Test strategy · Mutation hot spots                                                        |
| `plan.md`     | dev-lead                  | Files · Interfaces touched · Verification · Work breakdown · `Plan approved by:` · `Rounds:`                                             |
| `review.md`   | tech-lead                 | `## Plan review (round N)` · `## Diff review (round N)` · `Verdict:`                                                                     |

Every artifact is a `docs(FEAT-xxx): <artifact>` commit on the task's branch, so the PR shows the reasoning next
to the code.

## Sources of truth and rulings

`advisor` settles "what governs" by authority order: `.claude/rules` and `CLAUDE.md` boundaries (never bent) →
`docs/decisions.md` D-n rulings → the task's `spec.md` and its dependencies → explanatory docs; `src/` and tests
are evidence of what exists, never required behavior. A question only a person can answer becomes a **decision
request** (context, options with cost/risk/reversibility, recommendation, "flips if") in the report; the human
records the ruling as the next D-n and the task is unblocked. Tasks with `owner: human` are never picked.

## The one gate

`/work-next` stops after `plan.md` with "Plan for FEAT-xxx is ready. Reply `approve` or list changes." Changes go
back to `dev-lead` (round counter in the plan). `approve` writes `Plan approved by: <name>, <date>` and only then
does `tech-lead` review the plan and tick the spec's lead box. Nothing under `src/`, `prisma/` or `e2e/` changes
before that line exists; `scripts/ci/check-feat-commits.sh` and the reviewer agent keep the later steps honest.

## Review gate (D-4)

A change under `src/`, `prisma/` or `e2e/` is fingerprinted against the branch base. Ending a turn with a
fingerprint that `mark-reviewed.sh` has not recorded blocks the stop once (`require-review.sh`, also on
`SubagentStop`) with the instruction to run `/review-loop`: tech-lead diff review (adversarial: every finding needs
a concrete trigger and a confidence), a disposition for every finding, narrow fixes, re-verify, at most 3 passes,
then `.claude/hooks/mark-reviewed.sh` (which re-runs lint, typecheck, tests before recording). A deliberate stop
with the review incomplete is stated, never silenced.

## Running it

```bash
scripts/next-task.sh --list       # the board
/work-next                        # next ready task, or /work-next FEAT-003
# ... "Plan for FEAT-003 is ready" → read docs/specs/FEAT-003-edit-title/plan.md → reply approve
# ... PR link reported → review and merge on GitHub
scripts/task-status.sh FEAT-003 done && scripts/worktree-prune.sh
```

Stop a task: `scripts/task-status.sh FEAT-xxx blocked "<why>"` (commit it). Resume: move it back one step and run
`/work-next FEAT-xxx`; the skill skips steps whose artifacts exist.

## Limits and costs

- Rounds: tech-lead may send a plan back twice; `/review-loop` caps at 3 passes; after that the task is `blocked` for a human.
- `scripts/hook-smoke.sh` re-runs every hook probe (guards, role write scopes, review gate); run it after touching a hook.
- A role that writes outside its paths is reverted, logged in `docs/mistake-log.md`, and rerun once.
- Typical token spend per task: two `sonnet` reads (analysis, advice) + four session-model steps (plan, review ×2,
  implementation) + the test-writer. Record the rounds used in `docs/metrics.md` ("tasks without a second plan round").
