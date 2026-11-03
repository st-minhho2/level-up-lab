## Item

Filing lane (`backlog/CLAUDE.md` "Filing a card"): one tooling card found by B1.69's diff review (pass 1, doubt 3). The
lead asked for it on 2026-11-03 ("File card B1.73"). Filing decides nothing; `dev-lead` plans the card when it is picked.

- **B1.73**: the runner's setup steps in `.devcontainer/runner/docker-compose.yml`'s header still check out
  `chore/B1.62-runner-image-probes`, merged in #186 and gone from origin; a fresh setup stops at that line, before
  B1.69's identity step and the probe.

Files:

- `backlog/plan/E1-todos.md`: the card at the end of E1
- `backlog/README.md`: totals (E1 45/2/25 of 72; total 56/2/26 of 84), node S84, Remaining row 84
- `backlog/work/B1.73/filing-pr-body.md`: this body

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
