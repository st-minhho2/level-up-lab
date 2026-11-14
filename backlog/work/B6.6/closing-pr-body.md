Closing lane (`backlog/CLAUDE.md` "Closing a card") for B6.6: the remaining count is announced to assistive
technology (section 34). Feature PR #281 merged as 80dcc73. The agent runner opened the PR and made it ready on issue
#277 (D-27). The lead asked for this closing lane in the session. The checklist is the plan, so there is no
`Plan approved by` line. It is the last card of epic E6, batch 2 (D-33, D-35, D-36).

**Stacked on #285 (B6.5 done), itself on #284 (B6.4 done).** The totals count all three cards. Until those merge,
this PR's diff also shows their commits. After each merge, `origin/main` is merged in.

Files:

- `backlog/plan/E6-todos-cues.md`: B6.6 `**Status: Done** — 80dcc73 (#281)`:
  - 6 AC-34.n criteria green: unit 269 → 272; e2e 57 → 60;
  - mutation 92.63 (lib and actions unchanged);
  - D-35 also lifted the line from §22;
  - unattended and no-rework 1/1 (D-29), three runner runs, plus the lead's index repair 1bb65dd (D-36).
- `backlog/README.md`:
  - Remaining row 116 removed; `~~B6.6~~` in node 116.
  - Totals updated: E6 6/0/0, so the epic is complete. Total 82/0/37 of 119.
- `spec/technical-requirements.md`: §34 index row ✗ → ✅.
- `docs/metrics.md`: B6.6 Green column from `this feat commit` to the merged sha 80dcc73.
- `backlog/work/B6.6/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F32 is already ✅ from the card's own `docs(map)` commit (b7d0c92, right after `feat` 0999603,
B1.85).

D-29 for issue #277:

- `unattended.sh 277` → 1/1, 0 messages.
- `no-rework.sh 281` → 1/1: the lead's repair commit landed before `ready`, so it does not count as rework.
- Three runner runs, 113 turns and USD 5.90 in all:
  - the first took 18 turns and USD 0.81, and stopped on D-35 (§22's Out of scope line);
  - the second took 69 turns and USD 4.52. It built and reviewed the card, then met B6.4's re-padded tables at its
    Loop 9 merge (2cb3ff2). `code-writer` repaired the map (4791869). The index, which no role may write, stopped
    the run on D-36;
  - the third took 26 turns and USD 0.57. It read D-36, merged `origin/main` (B6.5, D-36) cleanly and went ready.

E6 is done: B6.1–B6.6 merged. Batch 2 left four follow-ups, all filed or ruled:

- B1.97: shared tables keep their padding.
- B1.92: guards run after a clean Loop 9 merge.
- Owner of the section index:
  - `spec-analyst` may not write `spec/technical-requirements.md`, though its own steps register sections there.
  - D-36 option B was not taken. This needs a card if the lead wants it.
- D-34 and D-35 were id collisions: two runs filed decision requests at the same moment.

All `scripts/ci/check-*.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
