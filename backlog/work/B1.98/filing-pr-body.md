Files cards **B1.98** and **B1.99** through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. The lead approved the E6 follow-up round in the orchestrating session: "đồng ý a–e".

E6 finished 6/6 but missed D-29 in both batches. Batch 2's unattended share reads 3/3 from `scripts/metrics/unattended.sh`, yet two of its runs needed the lead before ready:

- B6.5 (#276) stopped for a ruling (D-34) and was relaunched.
- B6.6 (#277) stopped (D-35) and then needed a lead-session merge-repair commit, 1bb65dd (D-36).

- **B1.98:** `unattended.sh` counts a runner `ended` stop, a relaunch, or a commit without `Agent-Run:` inside the window as not unattended. This is how E5 counted B5.3.
- **B1.99:** `spec-analyst`'s path guard gets `spec/technical-requirements.md`. D-36's option B, so a union-merge repair of the section index no longer needs the lead.

Files:

- `backlog/plan/E1-todos.md`: cards B1.98, B1.99 (quick, no dependency).
- `backlog/README.md`: totals (E1 59/0/38/97, total 82/0/39/121), nodes S120 and S121, Remaining rows 120 and 121.
- `backlog/work/B1.98/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
