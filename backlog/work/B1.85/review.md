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
