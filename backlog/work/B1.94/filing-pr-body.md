Filing lane (`backlog/CLAUDE.md` "Filing a card") amending card B1.94, filed in #257. The checklist is the plan; no
`Plan approved by` line.

The lead chose (2026-11-13) to add `/.gitattributes` to `.github/CODEOWNERS` inside B1.94 rather than in a PR of its
own: B1.94 already changes `.github/` (a CI step for `table-merge-smoke.sh`), and `.gitattributes` joined
`CONFIG_PROTECTED` in B1.89 (#253). `require_code_owner_review` is `false` (`.github/rulesets/main.json:27`), so the line
requests a review and blocks nothing; the gate that holds is `CONFIG_PROTECTED` (tier high, `config-change-approved`).

Files:

- `backlog/plan/E1-todos.md`: B1.94's status line names the missing CODEOWNERS line and the lead's choice; its Spec
  line names CODEOWNERS; its Acceptance adds "`.github/CODEOWNERS` has a `/.gitattributes` line"
- `backlog/work/B1.94/filing-pr-body.md`: this body

No `backlog/README.md` change: the card's title, status and Blocked by stay as they are, so totals and rows hold.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
