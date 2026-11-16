Files card **B1.103** through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. Filing decides nothing: `dev-lead` plans the card when it is picked.

The gap: agents are kept from merging only by the `Bash(gh pr merge*)` deny rule (`.claude/settings.json:20`). `guard-bash.sh` blocks `gh api` only for ref deletes, renames and force updates, and the `main` ruleset requires 0 approvals (D-9) with no bypass actors. So, in a session and in the runner container (`bypassPermissions`), these pass today:

- `gh api -X PUT repos/{owner}/{repo}/pulls/N/merge` (also `--method PUT`, `-XPUT`);
- `gh api graphql` with `mergePullRequest` or `enablePullRequestAutoMerge`;
- `gh api` against `/merges`;
- `gh -R owner/repo pr merge N` (a global flag before `pr`, which the deny rule's prefix does not match).

No agent has merged so far. The card asks for a `guard-bash.sh` rule with `scripts/hook-smoke.sh` probes (merge forms blocked, ordinary `gh api` reads and `gh pr view` still allowed), deny entries where they add a layer, and the `.claude/docs/hooks.md` / `scripts/CLAUDE.md` rows. Raising the ruleset's approval count (D-9) and narrowing the runner's `gh` token are noted on the card as out of scope, for the lead.

Files:

- `backlog/plan/E1-todos.md`: card B1.103 (quick, no dependency).
- `backlog/README.md`: totals (E1 64/1/36/101, total 106/1/37/144), node S144, Remaining row 144.
- `backlog/work/B1.103/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
