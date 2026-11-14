## Item

B1.99 — No role may write the section index, so a union-merge repair needs the lead (tooling, no spec section)

- spec: none — tooling (`.claude/agents/spec-analyst.md`, `dev-lead.md` Loop 9, the hook-smoke probes); no `src/`
  change, no section
- test: `scripts/hook-smoke.sh` probes on `spec-analyst`'s index write — pending
- acceptance: pending
- risk tier: high (`.claude/`); label `config-change-approved` (D-19)

## Plan

Copied from `backlog/work/B1.99/plan.md` (approved in `dde53fe`).

Approach: D-36's option B. `spec-analyst`'s path guard gains the one path `spec/technical-requirements.md` (not
`spec/*`: `spec/CLAUDE.md` and the map stay refused), its prompt gains a "Merge repair" mode, and `dev-lead.md` Loop 9
names the dispatch. Headless runs need nothing more: `path-guard.sh --role dev-lead` reads the dispatched role's list
from its frontmatter (B1.78), so the same line covers `claude -p --agent dev-lead`.

The repair, as 1bb65dd did it by hand: write `git show origin/main:spec/technical-requirements.md` plus the card's own
row (the row its branch adds or changes in `git diff origin/main...HEAD^1 -- spec/technical-requirements.md`; none for
a tooling card), through Write (B1.79). Then D-36's own check, made layout-proof: `dev-lead` runs
`diff <(git show origin/main:spec/technical-requirements.md | tr -s ' -') <(tr -s ' -' < spec/technical-requirements.md)`;
it must print only the card's own row (measured: ca2a58d against 1bb65dd prints `39a40` and the one §34 `>` line,
1bb65dd^ against it prints 34 duplicate rows). Anything more → no commit, "Waiting on human", stop. Clean → commit
`docs(spec): <card> merge repair -- section index rows once`, rerun `scripts/ci/check-spec-sections.sh`, go on.

D-36: its standing rule (the lead's session repairs) is superseded for runs after this card merges; Loop 9's sentence
says so. `00-decisions.md` is not rewritten; no new D-n (the lead's choice).

Costs the lead accepted:

- **Trigger without B1.92.** Loop 9 runs no guard after a clean merge today (B1.92, Open): the repair fires when
  `check-spec-sections.sh` fails, possibly only in CI after the push. B1.92's open item "an index row's owner" is
  answered here: `spec-analyst`.
- **No reviewer pass on the repair; the diff check is the gate, and it is prose, not probed.**
  `check-spec-sections.sh` proves each § has one row, not that its cells are origin/main's.
- **Wider write for `spec-analyst`:** one more file, which its own Write step 1 already told it to edit.

| File                             | Change                                                                                                                | Why        |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------- |
| `.claude/agents/spec-analyst.md` | guard + `'spec/technical-requirements.md'`; description names the index; "Merge repair" mode and its report line      | Acceptance |
| `.claude/agents/dev-lead.md`     | Loop 9: duplicate row → `spec-analyst`, diff check, commit title, D-36 superseded; brief template Mode `merge repair` | Acceptance |
| `.claude/docs/hooks.md`          | `spec-analyst` row of the write-scope table names the index                                                           | index      |
| `scripts/hook-smoke.sh`          | probes below                                                                                                          | Test line  |
| `backlog/work/B1.99/*`           | plan, review, pr-body                                                                                                 | pipeline   |

Interfaces: `spec-analyst`'s path-guard list `spec/contracts/* spec/technical-requirements.md backlog/*
!spec/features-map.md !backlog/00-decisions.md !backlog/work/*/review.md`; brief template
`Mode: <analysis | advice | merge repair | plan review | red | green | diff review>`; spec-analyst's repair report
`REPAIR: spec/technical-requirements.md = origin/main + <§n row | no own row>; diff beyond it: <none | k lines>`.
hook-smoke: `role_patterns`/`role_probes` for spec-analyst (`0 spec/technical-requirements.md`, `2 spec/CLAUDE.md`),
`hg 0 spec-analyst spec/technical-requirements.md`, `states dev-lead 'section index rows once'`,
`states spec-analyst 'Merge repair'`.

Verification: before 726 probes OK; red exactly 5 FAIL; green 747 OK (726 + 21), every pre-existing line identical
except `ok spec-analyst passes: …`.

Plan review: changes requested, round 2 (its one fix, `tr -s`, accepted by the lead without a round 3) · Plan approved
by: lead, 2026-11-14 · Rounds: 1

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
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
