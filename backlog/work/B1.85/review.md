# B1.85 review

## Plan review (round 1)

Plan at 6206187. Scope: tooling (`.claude/agents/`, `.claude/skills/`, `docs/`); no `src/`, no section.

| Check                                                                             | Result                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: no section (tooling card); every file is one the card names (the loop, the plan template, `/tdd-loop`) plus the mistake-log row the card cites. But see reason 1: three files that state the opposite rule are missing                        |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: not applicable, no `src/` change; interfaces are prompt text, the commit shapes are pasted                                                                                                                                                    |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; tier quick with no section, which dev-lead Loop 2 lets skip; the plan says so                                                                                                                                                 |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: card acceptance has 4 items; T1–T6 each give a count (≥ 2, ≥ 1, 0, 726); the headless-run item is marked pending, not a gate                                                                                                                  |
| verification lists exact commands with expected numbers                           | pass: base outputs checked at 6206187: `docs(map)` in dev-lead.md 2 lines (59, 94, neither names code-writer), tdd-loop 0, code-writer.md 0, work-next 0; `same commit` at code-writer.md:38; `scripts/hook-smoke.sh` → `hook-smoke: 726 probes OK` |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass, deviation stated: prompt-only card, the test is the card's `git grep` and the red is the base output above (no `test(...)` commit, as the plan's Costs line says); `chore(agents): B1.85 …` subject is 55 characters, within lefthook's 72    |
| `Lead approves spec` box, ticked only by a human                                  | pass: no section, so no box; `Plan approved by:` is empty                                                                                                                                                                                           |
| no settled D-n contradicted                                                       | pass: D-19 label named; D-28 tier confirmed (`scripts/agent/tier.sh backlog/work/B1.85/plan.md` → `high`), so the lead's `approve` gates it; nothing in `00-decisions.md` rules on the map commit                                                   |
| `scripts/next-task.sh --check B1.85` no overlap                                   | pass: `[next-task] B1.85: no overlap with any Doing or Review card`                                                                                                                                                                                 |

Also run: `check-plan-scope.sh` → `OK: … changes only paperwork`; `check-backlog.sh` → `OK: README matches the cards`;
`check-agent-frontmatter.sh` → `OK: 13 files`.

### Reasons

1. The plan names three sources of the "flip the map in the feat commit" rule (dev-lead.md, code-writer.md, the
   order in `backlog/CLAUDE.md`) and says the rest is "already right". Three more files in `spec/` say the opposite,
   and the plan neither changes them nor lists them as a cost:
   - `spec/CLAUDE.md:18` "Moves with the code, same commit:" with the `features-map.md` row "any `src/` change that
     adds, moves or removes a feature";
   - `spec/README.md:12` "`features-map.md`: … Moves with the code, same commit.";
   - `spec/features-map.md:3-4` "Every `src/` change that adds, moves or removes a feature updates its row in the
     same commit (`docs(map): F<n> … [B<e>.<n>]`)".

   Trigger: after this card, code-writer is told to Edit `spec/features-map.md` in a separate step 7. To do it, it
   reads `spec/features-map.md`, which loads `spec/CLAUDE.md` into its context. Both tell it to put the map change in
   the same commit as the code, and code-writer.md now says not to. That is the B5.5 fold the card is meant to stop
   (the plan traces it to code-writer.md's "(same commit)"; the same words remain here). T4 checks only
   `code-writer.md`, so the gate passes with the conflict still there. Fix it one of two ways. (a) Add the three
   lines to Files, worded as `backlog/CLAUDE.md` puts it (the map moves in its own `docs(map)` commit right after
   `feat`, before review). Say who writes `spec/features-map.md`: dev-lead's path list excludes it, so the
   interactive session has to, as it does for `.claude/`. Re-run `next-task.sh --check`, and extend T4 to
   `git grep -n 'same commit' -- spec/CLAUDE.md spec/README.md spec/features-map.md` → 0 lines on the map rule.
   (b) Keep them out of scope, but list them under Costs with a follow-up card id. Then the lead approves knowing
   code-writer still gets two conflicting orders.

Note (not blocking): the green-gate check `git log --format=%s <feat>..HEAD` assumes one `feat` per card. If
mutation hardening re-dispatches code-writer in green mode and it commits a second `feat` after `docs(map)`, which
`<feat>` the check means is ambiguous. A second dispatch also has no row left to move. Consider saying "the card's
first `feat`", and that a dispatch whose row is already ✅ reports `MAP: none`.

Verdict: changes requested

## Plan review (round 2)

Plan at 240d6f3 (round 1 committed b028ee4). Changed since round 1: only `plan.md` and `review.md`.

| Check                                                                             | Result                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: no section; the three `spec/` prose files from reason 1 are now in Files, header lines only ("no row", "no section and no map row changes" in Costs)                                                                                                               |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: not applicable, no `src/` change                                                                                                                                                                                                                                   |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md` (quick, no section), stated                                                                                                                                                                                                                         |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: T1–T6 counts unchanged except T4, now 0 over four files                                                                                                                                                                                                            |
| verification lists exact commands with expected numbers                           | pass: T4 base checked at 240d6f3, 4 lines as the plan says: `code-writer.md:38`, `spec/CLAUDE.md:18`, `spec/README.md:12`, `spec/features-map.md:4`. No other "same commit" in those four files, so 0 after the change is reachable without touching unrelated text      |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass, deviation stated (no red commit, grep is the test); new step 2 `docs(spec): B1.85 the map row moves in its own docs(map) commit` is 51 characters after the scope, within lefthook's 72                                                                            |
| `Lead approves spec` box, ticked only by a human                                  | pass: no section, so no box; `Plan approved by:` empty                                                                                                                                                                                                                   |
| no settled D-n contradicted                                                       | pass: the `spec/` edits are process prose, not a contract section, so §8 / a D-n is not required (spec-fidelity's rule covers sections); the plan says no section or row changes. Tier `scripts/agent/tier.sh` → `high`, the lead's `approve` gates it; D-19 label named |
| `scripts/next-task.sh --check B1.85` no overlap                                   | pass: `[next-task] B1.85: no overlap with any Doing or Review card` (re-run on 240d6f3, with `spec/features-map.md` now in Files)                                                                                                                                        |

Also run: `check-plan-scope.sh` → `OK: … changes only paperwork`; `check-backlog.sh` → `OK: README matches the cards`.

Reason 1 (round 1): resolved by option (a). All three `spec/` lines are in Files, the writer is named (interactive
dev-lead), and T4 now covers them. Round 1 note: resolved. The green gate is anchored on "the card's first `feat`",
and a later dispatch with no row left adds no `docs(map)`.

Costs the lead approves with (all in the plan): no red commit; nothing in CI keeps the prompts from drifting back
until a hook-smoke follow-up; one extra commit per card PR; an interactive session (not a role guard) writes the
`spec/` prose. The plan is 76 lines, longer than the one-screen guide; round 1 passed it at 68 and the extra lines
are the review's own fix, so it is not a new reason.

Verdict: approved

## Diff review (round 1)

Diff `2f1ff88..73f2100` (merge-base with `origin/main` is `2f1ff881c0`). 10 files, +297 / −14. Scope: tooling
(`.claude/agents/`, `.claude/skills/`, `spec/` prose, `docs/`); no `src/`, `prisma/`, `e2e/` or test file.

### Command results (last line of each)

| Command                                                 | Result                                                                                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                             | `All matched files use Prettier code style!` (exit 0)                                                                         |
| `pnpm typecheck`                                        | `tsc --noEmit`, no output, exit 0                                                                                             |
| `pnpm test`                                             | `Tests  241 passed (241)`, 39 files                                                                                           |
| `pnpm test:e2e`                                         | `52 passed (1.1m)`, after `docker compose up -d` and `pnpm db:deploy` (first run: 51 failed, the worktree schema was missing) |
| `pnpm test:mutation`                                    | `Final mutation score of 92.62 is greater than or equal to break threshold 70`                                                |
| `scripts/ci/check-suppressions.sh`                      | `OK: no new suppressions`                                                                                                     |
| `scripts/ci/check-config-change.sh`                     | `::error::` on the 3 `.claude/` files locally (the script cannot see labels); PR #252 carries `config-change-approved`        |
| `scripts/ci/check-feat-commits.sh`                      | `OK: no feat commit touches tests`                                                                                            |
| `scripts/ci/check-ac-coverage.sh`                       | `OK: every criterion of a shipped section has a test`                                                                         |
| `scripts/ci/check-spec-sections.sh`                     | `OK: sections cited: 1 … 28`                                                                                                  |
| `scripts/ci/check-features-map.sh`                      | `OK`                                                                                                                          |
| `scripts/verify-red.sh B1.85`                           | `no 'test(<pkg>): B1.85 … (red)' commit`: expected, the plan's stated deviation (the test is a `git grep`)                    |
| `scripts/ci/check-agent-frontmatter.sh`                 | `OK: 13 files`                                                                                                                |
| `scripts/ci/check-plan-scope.sh`                        | `OK: … stays inside the approved plan of B1.85`                                                                               |
| `scripts/ci/check-backlog.sh`                           | `OK: README matches the cards`                                                                                                |
| `scripts/next-task.sh --check B1.85`                    | `B1.85: no overlap with any Doing or Review card`                                                                             |
| `scripts/hook-smoke.sh`                                 | `hook-smoke: 726 probes OK`                                                                                                   |
| T1 `git grep -n 'docs(map)' .claude/agents/dev-lead.md` | 4 lines (59, 92, 95, 98), each names `code-writer` (plan: ≥ 2)                                                                |
| T2 `… .claude/skills/tdd-loop/SKILL.md`                 | 2 lines (22, 27), each names `code-writer` (plan: ≥ 1)                                                                        |
| T3 `… .claude/agents/code-writer.md`                    | 4 lines (plan: ≥ 1)                                                                                                           |
| T4 `git grep -n 'same commit'` over the 4 files         | 0 lines (plan: 0)                                                                                                             |
| T5 `… .claude/skills/work-next/SKILL.md`                | 0 lines (unchanged)                                                                                                           |
| T6 path-guard lines changed in `dev-lead.md`            | 0; no `tools:`/`hooks:`/`command:` line changed in any agent or skill                                                         |
| `git diff --stat main...HEAD`                           | `10 files changed, 297 insertions(+), 14 deletions(-)`                                                                        |

Probe (a `git clone` under `$TMPDIR`): restoring `.claude/skills/tdd-loop/SKILL.md` and `spec/README.md` to the
base makes T2 report 0 lines and T4 report `spec/README.md:12 … same commit.`, so both greps fail when the lines
they guard are reverted.

### Checklist

- Every AC-§.n has a test: not applicable (no section). The card's acceptance maps onto T1–T6; the headless-run item
  is pending, as the plan says.
- No test weakened: `git log --first-parent --no-merges 2f1ff88..HEAD -- '*.test.*' e2e/` is empty and there are no
  merges on the branch.
- Every changed file is in `plan.md`: yes, 7 files plus `backlog/work/B1.85/*`; `check-plan-scope.sh` OK. Commit
  subjects match the plan's work breakdown (70 and 63 characters, within lefthook's 72).
- Interfaces: prompt text only, as the plan says. Frontmatter, path lists and hooks are unchanged (T6, hook-smoke 726).
- Zod, Prisma, raw SQL, migration: not applicable. No secret and no suppression.
- Features map: no row moved, which is correct (header prose only; tooling card with no feature).
- Other places that still give the map to dev-lead or fold it into `feat`: none. Repo-wide, `docs(map)` now appears
  only in code-writer.md, dev-lead.md, tdd-loop, `git-workflow.md:9` and `backlog/CLAUDE.md:33`. The last two give
  the order (`feat` → `docs(map)`) and name no role. `same commit` survives only in `backlog/CLAUDE.md:53,66`, about
  lane PR bodies, which is unrelated.

### Findings

```
[1] KIND: plan-mismatch
    WHERE: .claude/skills/tdd-loop/SKILL.md:27
    DEFECT: the green gate requires code-writer's docs(map) commit with no condition, but dev-lead.md:92, tdd-loop
            step 3 and code-writer.md step 7 all limit it to "when the plan's Files hold spec/features-map.md", and the
            new "missing → back to code-writer" routes the miss to a role told not to make the commit.
    TRIGGER: a /tdd-loop run on a card whose plan has no map change. Main has src-changing plans of this shape:
             backlog/work/B1.9/plan.md ("No map change (F9 names both files)"), and B1.8 and B1.11.
    WRONG BEHAVIOUR: the orchestrator following /tdd-loop finds no docs(map) commit and sends the card back to
             code-writer. code-writer's step 7 does not apply, so it either reports MAP: none again (the gate never
             passes) or makes an empty or invented docs(map). The plan's interface says "(a plan without that file:
             none)", and dev-lead.md:92 says the same. Prefix the step 4 clause with the same condition as step 3.
    CONFIDENCE: confirmed (traced: the step 4 text at :27 has no condition; B1.9's plan has no map row)
```

```
[2] KIND: correctness (non-blocking)
    WHERE: .claude/agents/code-writer.md:38-43
    DEFECT: step 7 says to "move the feature's row (✗ → ✅ …)", but spec/features-map.md has 0 ✗ rows on main.
            Step 5 creates a ✗ row only when a new module needs one, so a feature that edits only existing modules
            has no row to move.
    TRIGGER: a B5.6-shaped card. F26 names only the existing src/components/todo-due-date.tsx, and B5.6's plan said
             "Add the F26 row: code-writer's feat (✗), ✅ in docs(map)".
    WRONG BEHAVIOUR: step 5 does not cover this case (no new module), and step 7 points at a row that does not
             exist. The likely result is a new ✅ row added in docs(map) under a "✗ → ✅" subject, or a ✗ row in feat
             because the plan said so. Either way the map ends up right and the subject is wrong. Saying "add or
             move the row" would close it.
    CONFIDENCE: plausible (I could not falsify it; no headless run yet)
```

Notes, not findings (the caller's questions):

- Step 5's ✗ row and `check-features-map.sh`: they are compatible. The script lets a ✗ row name missing paths and
  only requires each module to appear in some row. The script runs only in CI (`ci.yml:148`) and in reviewer gates
  at HEAD; it is not in `lefthook.yml`. HEAD always holds the `docs(map)` commit before a push, so nothing needs the
  ✗ row in `feat`. The row is optional and does no harm.
- The closing lane's map flip (`backlog/CLAUDE.md:61`, step 3) was already a no-op before this card. B5.1–B5.6
  closed without touching the map, and the map has 0 ✗ rows. After B1.85 the map is ✅ before merge, so that half of
  step 3 has nothing to flip. That is not introduced here. The plan calls it "section status after merge", which is
  only half accurate: the step also names the map. A follow-up card could drop the map from step 3.
- The green gate can be checked, with one detail. Find `<feat>` by the card id
  (`git log --first-parent --reverse --format=%h --grep '^feat([a-z]*): <card> ' main..HEAD | head -1`), then
  count `docs(map): … [<card>]$` subjects in `<feat>..HEAD` → 1. Once `origin/main` is merged (Loop 9, a re-run of
  step 6), a bare `--grep '^feat('` also matches the squashed `feat(todos): B5.x …` commits from main, so the card
  id matters. The text says "the card's first `feat`", which is enough for a careful reader.

Verdict: back to code-writer (the author of `.claude/` here is the interactive dev-lead, per the plan): finding [1]
needs one clause; [2] is optional.

Riskiest unfalsified: whether a headless code-writer, given B5.6-style plan text ("code-writer's feat (✗)"), adds
the ✗ row in `feat` or folds the ✅ flip into `feat` anyway. Only the pending E6 run shows it.

## Diff review (round 2)

Delta `73f2100..82b7ff3`: `5a02a04` (round 1 review) and `82b7ff3`
`fix(agents): B1.85 review pass 1 -- map gate only when the plan holds the map`. The fix changes 3 files, +6 / −5:
`code-writer.md`, `dev-lead.md`, `tdd-loop/SKILL.md`. Nothing under `src/`, `prisma/`, `e2e/` and no test file.

### Command results (last line of each)

| Command                                                          | Result                                                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `pnpm lint`                                                      | `All matched files use Prettier code style!`                                           |
| `pnpm typecheck`                                                 | exit 0, no output                                                                      |
| `pnpm test`                                                      | `Tests  241 passed (241)`                                                              |
| `pnpm test:e2e`, `pnpm test:mutation`                            | not re-run: no file they load changed since round 1 (`52 passed (1.1m)`, `92.62` ≥ 70) |
| `check-feat-commits`, `check-suppressions`, `check-features-map` | OK, OK, OK                                                                             |
| `check-agent-frontmatter`, `check-plan-scope`                    | `OK: 13 files`; `OK: … stays inside the approved plan of B1.85`                        |
| `scripts/next-task.sh --check B1.85`                             | `no overlap with any Doing or Review card`                                             |
| `scripts/hook-smoke.sh`                                          | `hook-smoke: 726 probes OK`                                                            |
| T1 / T2 / T3 / T4 / T6                                           | 4 lines (all name code-writer) / 2 (all name code-writer) / 4 / 0 / 0                  |

### Dispositions of round 1

- [1] resolved. `tdd-loop/SKILL.md:27` now opens with "when the plan's Files hold `spec/features-map.md`" and ends
  "(… a plan without the map wants none)". Its condition now matches tdd-loop step 3, `dev-lead.md:92` and
  `code-writer.md` step 7. Trigger re-traced: for a B1.9-shaped plan (no map row), the gate asks for nothing, and
  code-writer's step 7 does not apply. The two agree.
- [2] resolved. Step 7 now says "add or move the feature's row", and the subject is `docs(map): F<n> <feature> …
[<card>]`. That matches the dev-lead template's `docs(map): F<n> … [<card>]`. For a B5.6-shaped card the row is
  added in `docs(map)` under a subject that no longer claims "✗ → ✅".
- Round 1's gate-checkability note is applied. `dev-lead.md:93` finds the card's first `feat(<pkg>): <card> ` by
  card id, with `--first-parent`, and says why. The line break leaves `--format=…` at column 0 inside the inline
  code span. Markdown renders that as a space and Prettier accepts it.
- The closing-lane note is out of scope, per the dev-lead's disposition, and a follow-up card is named. Agreed: this
  card did not introduce it.

### Notes (not blocking)

- The plan's Interfaces line `docs(map): F<n> <feature> ✗ → ✅ [<card>]` is now `… [<card>]` in code-writer.md.
  This came from the review's own finding [2] and is a superset of the approved line. `pr-body.md:45` still copies
  the old line, and the PR body has no deviation note yet. Add one before ready (planning.md: the reviewer compares
  the diff against the plan), so the lead sees it at merge.
- No grep guards the new condition. Reverting the step 4 clause leaves T2 at 2 lines. This is the plan's stated
  cost ("nothing in CI keeps the prompts from drifting back until the hook-smoke follow-up").

### Findings

None.

Verdict: ready for PR (after the PR-body deviation note above; that is paperwork, not a code change).

Riskiest unfalsified: as in round 1, whether a headless code-writer moves the map in its own `docs(map)` rather
than folding it into `feat`. Only the pending E6 run shows it.
