## Item

B1.99 — No role may write the section index, so a union-merge repair needs the lead (tooling, no spec section)

- spec: none — tooling (`.claude/agents/spec-analyst.md`, `dev-lead.md` Loop 9, the hook-smoke probes); no `src/`
  change, no section
- test: `scripts/hook-smoke.sh` probes on `spec-analyst`'s index write. Before (origin/main 8b0358e): "726 probes
  OK". Red `d6b8f1e` (no `(red)` marker: smoke only, as B1.82, B1.88, B1.89): 5 FAIL, 742 ok — the spec-analyst
  pattern list, its frontmatter write of the index, the headless `--role` write, the two prompt lines. Green
  `f7de3de`: "747 probes OK". Review hardening `771ca24`/`3b0b797` and `99d685e`/`67008f4` (each probe red alone
  first): "749 probes OK", also after merging origin/main (`2b2b2fc`). Baseline against green: every pre-existing line
  identical except `ok spec-analyst passes: …`, which now lists the index.
- acceptance: 4 of 4 — the guard allows `spec/technical-requirements.md` and every other path keeps its verdict
  (726 → 749 stated above; `spec/CLAUDE.md` and `spec/features-map.md` stay refused); Loop 9 dispatches `spec-analyst`
  for the repair and names `docs(spec): <card> merge repair -- section index rows once`; D-36's lead-session repair is
  stated as replaced in Loop 9 ("B1.99, replaces D-36's repair by the lead's session"), `00-decisions.md` untouched, no
  new D-n (lead's choice); label `config-change-approved`
- risk tier: high (`.claude/`); label `config-change-approved` (D-19)

## Plan

Copied from `backlog/work/B1.99/plan.md` (approved in `dde53fe`).

Approach: D-36's option B. `spec-analyst`'s path guard gains the one path `spec/technical-requirements.md` (not
`spec/*`: `spec/CLAUDE.md` and the map stay refused), its prompt gains a "Merge repair" mode, and `dev-lead.md` Loop 9
names the dispatch. Headless runs need nothing more: `path-guard.sh --role dev-lead` reads the dispatched role's list
from its frontmatter (B1.78), so the same line covers `claude -p --agent dev-lead`.

The repair, as 1bb65dd did it by hand: write `git show origin/main:spec/technical-requirements.md` plus the card's own
row, through Write (B1.79). The approved plan derives the own row from `git diff origin/main...HEAD^1`; diff review
pass 1 showed that a commit after the merge makes it list the stale duplicates too, so the prompt now reads the card's
own commits, `git log --first-parent --no-merges -p origin/main..HEAD -- spec/technical-requirements.md`, keeping the
newest `+` line (pass 2); none for a tooling card. Then D-36's own check, made layout-proof: `dev-lead` runs
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
except `ok spec-analyst passes: …`. After the two review passes' probes: 749 OK.

Plan review: changes requested, round 2 (its one fix, `tr -s`, accepted by the lead without a round 3) · Plan approved
by: lead, 2026-11-14 · Rounds: 1

## Map delta

None: tooling card, no `spec/features-map.md` row.

## Review

`/review-loop`: 3 passes of 3 (`backlog/work/B1.99/review.md`). Verdict: ready for PR.

| Pass | Finding                                                                                                                                                                                              | Disposition                                                                                                                                                               |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | [1] `spec-analyst.md:49`: the own row from `git diff origin/main...HEAD^1` lists the stale duplicates once any commit follows the merge (reproduced: a sibling's pre-flip §2 row read as the card's) | fix now: probe `771ca24`, fix `3b0b797` (own commits: `git log --first-parent --no-merges -p origin/main..HEAD`; Loop 9 accepts a `<`/`>` pair only for the card's own §) |
| 2    | [1] (plausible) that log prints every version of the row, newest first, and the prompt did not say which to keep                                                                                     | fix now: probe `99d685e`, fix `67008f4` ("keep the first `+` line (the newest)")                                                                                          |
| 3    | none                                                                                                                                                                                                 | —                                                                                                                                                                         |

Plan review: round 1 (3 changes: the diff check, the repair mode and its report line, the changed `passes` line),
round 2 (1 change: `tr -s`, not `tr -d`, so a dash in a link target stays visible), accepted by the lead without a
round 3. Every pass ran vitest 280 passed, playwright 64 passed, mutation 92.74 (no `src/` change).

Riskiest unfalsified: whether a headless spec-analyst copies origin/main's index exactly and picks the right `+` line;
no probe runs an agent or Loop 9's diff check, which is the only gate against a sibling row whose status flips.

The own-row command departs from the approved plan's text (`plan.md` unchanged after approval); the Files table and
interfaces are as planned. `verify-red.sh B1.99` prints "no (red) commit": expected for smoke-only red commits.

## Evidence

- AC met: 4/4
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
