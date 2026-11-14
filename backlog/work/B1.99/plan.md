# B1.99 plan — spec-analyst repairs the section index after a union merge (tooling, no §)

Approach: D-36's option B. `spec-analyst`'s path guard gains the one path `spec/technical-requirements.md` (not
`spec/*`: `spec/CLAUDE.md` and the map stay refused), its prompt gains a "Merge repair" mode, and `dev-lead.md` Loop 9
names the dispatch. Headless runs need nothing more: `path-guard.sh --role dev-lead` reads the dispatched role's list
from its frontmatter (B1.78), so the same line covers `claude -p --agent dev-lead`.

The repair, as 1bb65dd did it by hand: write `git show origin/main:spec/technical-requirements.md` plus the card's own
row (the row its branch adds or changes in `git diff origin/main...HEAD^1 -- spec/technical-requirements.md`; none for
a tooling card), through Write (B1.79); `dev-lead` commits it as
`docs(spec): <card> merge repair -- section index rows once`, reruns `scripts/ci/check-spec-sections.sh`, goes on.

D-36: its standing rule (the lead's session repairs) is superseded for runs after this card merges; Loop 9's sentence
says so ("B1.99, replaces D-36's repair by the lead's session"). `00-decisions.md` is not rewritten; a D-37 only if
the lead wants one (Waiting on you).

Costs, for the lead to accept:

- **Trigger without B1.92.** Loop 9 runs no guard after a clean merge today (B1.92, Open). The repair fires when
  `check-spec-sections.sh` fails, after the merge if run there or in CI after the push: one CI round trip until B1.92
  lands. B1.92's open item "an index row's owner" is answered here: `spec-analyst`. B1.92 edits the same Loop 9
  paragraph later (no branch today, `--check` below).
- **No reviewer pass on the repair.** It is paperwork (`spec/`, `plan-scope.sh` passes it); origin/main's copy keeps
  every sibling's row, and the guard proves each § once. A wrong "own row" shows in the PR diff.
- **Wider write for `spec-analyst`:** one more file, which it already had to edit (its own Write step 1 says to
  register a section there; the guard refused that too).

No advice (tier quick, no section). Risk tier **high** (`.claude/`) → the lead's `approve`; PR carries
`config-change-approved` (D-19). Dev-lead writes `scripts/` and `.claude/` (interactive, as B1.88, B1.89).

## Files

| File                             | Change                                                                                       | Why        |
| -------------------------------- | -------------------------------------------------------------------------------------------- | ---------- |
| `.claude/agents/spec-analyst.md` | guard + `'spec/technical-requirements.md'`; description names the index; "Merge repair" mode | Acceptance |
| `.claude/agents/dev-lead.md`     | Loop 9: the duplicate-row case dispatches `spec-analyst`, commit title, D-36 superseded      | Acceptance |
| `.claude/docs/hooks.md`          | `spec-analyst` row of the write-scope table names the index                                  | index      |
| `scripts/hook-smoke.sh`          | probes below                                                                                 | Test line  |
| `backlog/work/B1.99/*`           | plan, review, pr-body                                                                        | pipeline   |

## Interfaces touched

`spec-analyst`'s path-guard list (in order): `spec/contracts/* spec/technical-requirements.md backlog/*
!spec/features-map.md !backlog/00-decisions.md !backlog/work/*/review.md`. No script flag, exit code or variable.
hook-smoke: `role_patterns spec-analyst` is that list; `role_probes spec-analyst` adds `0 spec/technical-requirements.md`
and `2 spec/CLAUDE.md` (frontmatter loop, and both modes x 4 layouts); `hg 0 spec-analyst spec/technical-requirements.md`
(headless `--role`); `states dev-lead 'section index rows once'`, `states spec-analyst 'Merge repair'`.

## Verification

- Before: `scripts/hook-smoke.sh` on origin/main 8b0358e → `hook-smoke: 726 probes OK` (measured).
- Red `test(hooks): B1.99 hook-smoke probes spec-analyst's index write (red)` (body "Red because spec-analyst's guard
  refuses spec/technical-requirements.md and no prompt names the repair"): exit 1; FAIL lines exactly: the
  spec-analyst "passes" line, its `0 spec/technical-requirements.md` frontmatter probe, the `hg` probe, the two
  `states` probes (5); every other probe ok.
- Green `chore(agents): B1.99 spec-analyst repairs the section index`: `hook-smoke: 747 probes OK` = 726 + 21 (2
  frontmatter probes, 16 = 2 modes x 4 layouts x 2 paths, 1 `hg`, 2 `states`); every pre-existing probe line unchanged; `scripts/ci/check-agent-frontmatter.sh`, `check-spec-sections.sh`, `check-plan-scope.sh`
  OK; `pnpm lint && pnpm typecheck`; CI green.

## Work breakdown

| Step | Role     | Produces            | Commit                                                                  |
| ---- | -------- | ------------------- | ----------------------------------------------------------------------- |
| 1    | dev-lead | red probes          | `test(hooks): B1.99 hook-smoke probes spec-analyst's index write (red)` |
| 2    | dev-lead | guard, prompts, doc | `chore(agents): B1.99 spec-analyst repairs the section index`           |
| 3    | reviewer | diff review         | `docs(backlog): B1.99 review pass N`                                    |
| 4    | dev-lead | draft PR, label     | —                                                                       |

Not in scope: `backlog/00-decisions.md`, `scripts/CLAUDE.md` (B1.95, B1.97), running guards after a clean merge (B1.92).

Plan review: · Plan approved by: · Rounds: 1
