## Item

B1.101 — GitHub reports parallel runner PRs as conflicting on the union tables, and each needs a re-run (tooling, no
spec section)

- spec: none — tooling (`scripts/agent/run.sh`, its smoke, the compose header, git-workflow.md); no `src/` change
- test: `scripts/agent/run-smoke.sh` R21, R22 (new). Red e21f041 (no `(red)` marker: smoke only, which
  `verify-red.sh` cannot judge, as B1.82, B1.88, B1.95): R1–R20 ok, R21, R22 FAIL, "2 of 22 probes FAILED". Green
  803ef8c, review pass 1 case 1dae919: "22 probes OK" (bash 3.2.57; `run-smoke.sh` is in no CI job), again after
  merging `origin/main` (3357890). hook-smoke 749; vitest 298; e2e 70; mutation 92.84 (no `src/` change; reviewer).
  A real-lefthook merge with `RUNNER_CHILD=sync` carries exactly one `Agent-Run: sync`.
- acceptance: 3 of 4 — a ready runner PR becomes up to date without a human-authored commit (`run.sh --sync`); the
  measured GitHub behaviour replaces `[unverified]` in B1.89's and B1.96's status lines; label `config-change-approved`.
  Pending: the time from a sibling's merge to the next PR being mergeable, which E7 batch 2 measures. B1.101 closes
  Partial pending that and the `--sync` mention in `scripts/CLAUDE.md` (plan costs, plan review r1 #1)
- risk tier: high (`scripts/agent/`, `.claude/`, `.devcontainer/`); label `config-change-approved` (D-19)

## Plan

Copied from `backlog/work/B1.101/plan.md` (approved 2b2bc81, lead, 2026-11-14; plan review 2 rounds, round 3 not
re-reviewed).

Approach: a light `scripts/agent/run.sh --sync <issue>`: merge `origin/main` into the run's branch in its own worktree
with this clone's attributes, run the three table guards, push, comment; no `claude` run. Not "union tables left to
the closing lane": the `main` ruleset requires an up-to-date branch, so after every merge each other ready PR is
BEHIND even with no shared line, and only a commit on the branch clears that.

Measured (replaces B1.89's `[unverified]`): GitHub's merge ignores `.gitattributes`. A bare clone merging the parents
of 7eab1a5 (B7.1) and a0da40a (B7.2) with `git merge-tree --write-tree` (git 2.39.5): exit 1, conflicted
`docs/metrics.md` and `spec/features-map.md`; this clone, same parents: exit 0, both `--remerge-diff` empty; GitHub
read #300 and #302 `CONFLICTING`.

Order: identity → behind check → card id → branch → its worktree → one open ready PR → lock → on the branch, no
tracked change → HEAD = `origin/<branch>` → already level: exit 0 → `git merge --no-ff` with `Agent-Run: sync`
(conflict: abort, name `run.sh <n>`) → `check-spec-sections.sh`, `check-features-map.sh`, `check-backlog.sh` (fail:
`reset --keep`, name `run.sh <n>`) → `pr-step.sh push` (fail: reset) → issue comment `**synced**`. TERM/INT after the
merge resets to the PR's head unless the push landed.

Costs, accepted by the lead: the merge counts as the runner's in no-rework (`Agent-Run: sync`) though the lead types
the command; the PR stays ready during CI (the ruleset holds the merge); no local tests; one command per other ready PR
after each merge; `scripts/CLAUDE.md` does not name `--sync` and the time-to-mergeable exists only after E7 batch 2, so
the closing lane is `-partial` pending both.

| File                                      | Change                                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `scripts/agent/run.sh`                    | `sync_issue`, `wgit`, `--sync <issue>` in case, `USAGE`; no claude lookup for it; `on_signal` reset; header   |
| `scripts/agent/run-smoke.sh`              | R21 (clean union sync, then level), R22 (refusals and signals leave local and origin's branch agreeing)       |
| `.devcontainer/runner/docker-compose.yml` | header: after each merge in a batch, `exec runner scripts/agent/run.sh --sync <issue>` per other ready PR     |
| `.claude/docs/git-workflow.md`            | "Batch review": a ready runner PR is brought in line by `run.sh --sync <issue>`, GitHub ignores `merge=union` |
| `backlog/plan/E1-todos.md`                | B1.89 and B1.96 status lines: "GitHub mergeability [unverified]" → the measured behaviour                     |
| `backlog/work/B1.101/*`                   | plan, review, pr-body                                                                                         |

## Map delta

None: tooling card, no `spec/features-map.md` row.

## Review

Plan review: 2 rounds (r1: 3 reasons, r2: 1 reason, fixed in round 3, not re-reviewed; the lead approved round 3).
`/review-loop`: 2 passes of 3, ready for PR (`backlog/work/B1.101/review.md` "Diff review (round 1)", "(round 2)").

| Pass | #   | Finding (file:line)                                                        | Source   | Kind     | Disposition      | Justification                                                                                                                      |
| ---- | --- | -------------------------------------------------------------------------- | -------- | -------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | `run.sh:374` no probe makes `pr-step.sh push` fail                         | reviewer | test gap | fix now          | 1dae919: R22 pre-receive rejects; mutant "no reset after a failed push" → "1 of 22 probes FAILED", code unchanged → "22 probes OK" |
| 1    | 2   | a push that lands but exits non-zero is reset locally                      | dev-lead | edge     | no change needed | only a reply lost after the remote took it; the next `--sync` then refuses visibly; `origin/<branch>` does not move then either    |
| 1    | 3   | "mergeable once CI on <sha> is green" overclaims (a sibling merging first) | dev-lead | wording  | no change needed | the comment's last line says to `--sync` again after the next merge; the ruleset decides mergeability on GitHub                    |
| 1    | 4   | guards run from the card branch's own `scripts/ci`                         | dev-lead | design   | no change needed | the same copy CI runs on the PR; a full run on the host already runs the branch's own tests                                        |

Mutants (prototypes and pass 1): 15 of 15 fail R21 or R22 only (no trailer, no guards, no reset after a guard, no merge
abort, draft accepted, no level check, no HEAD = origin check, no dirty check, no lock, `GIT_DIR` kept, no identity, no
behind check, no reset on TERM, reset after a landed push, no reset after a failed push). Not probed: `merge --abort`
in `on_signal` (timing), `SYNC_PRE=""` after the push (covered by the HEAD = origin check). Riskiest unfalsified:
whether GitHub reports a synced PR mergeable (by construction its merge base is main's tip; E7 batch 2 shows it), and a
Ctrl-C inside `git push` mid-transfer.

## Evidence

- AC met: 3/4
- tier: high
- plan deviations: none (red commit subject without `(red)`, see test line)
- trace: n/a

## Checklist

- [x] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [x] Red commit precedes the change commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [x] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %. (n/a: no section; 92.84)
- [x] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config changed with label `config-change-approved`.
- [x] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed. (n/a)
- [x] `spec/features-map.md` row moved (n/a); `docs/metrics.md` per-card row (n/a: tooling, as B1.95); mistake-log: no repeat.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
