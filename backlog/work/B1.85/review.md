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
