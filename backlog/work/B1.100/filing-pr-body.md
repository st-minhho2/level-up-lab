Files cards **B1.100** and **B1.101** through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. Both cards come from E7 batch 1, measured on 2026-11-14. The lead said "action tiếp đi" after the batch merged.

E7 batch 1 results (D-29):

- unattended 3/3;
- no-rework 3/3;
- **throughput 7.7 cards per 8 h**, against a target of 9.4. Label at 08:23Z, last merge at 11:30Z.

Two causes:

- **B1.100.** Each card ran full Stryker over `src/lib` + `src/actions` in `code-writer`, in the green gate, and again in the `reviewer`, three runs at once. The container load reached 29–45 on 8 CPUs, and each run took about 2 h 25 min to ready, against 37 min alone. B7.1 and B7.3 changed no `src/lib` file at all. Local mutation should run only when the diff touches those layers, and at most once per tree; CI still runs it.
- **B1.101.** After the first merge (#301), GitHub marked #300 and #302 `CONFLICTING`, while a local merge was clean. GitHub ignores `merge=union`, which B1.89 had left `[unverified]`. Each PR needed a re-run of `run.sh` (6 and 9 minutes) to merge `main` in Loop 9. A ready runner PR should become mergeable again without a human-authored commit.

Files:

- `backlog/plan/E1-todos.md`: cards B1.100 and B1.101 (quick, no dependency).
- `backlog/README.md`: totals (E1 61/1/37/99, total 84/1/44/129), nodes S128 and S129, Remaining rows 128 and 129.
- `backlog/work/B1.100/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
