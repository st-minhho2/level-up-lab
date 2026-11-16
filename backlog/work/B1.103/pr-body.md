## Item

B1.103 — An agent can still merge a pull request through `gh api`, past the `gh pr merge` deny rule (tooling, no
spec section)

- spec: none — tooling (`.claude/hooks/guard-bash.sh`, `.claude/settings.json`, docs); no `src/` change, no section
- test: `scripts/hook-smoke.sh` section "merging a pull request (B1.103)" — red before (25 merge probes and the
  settings probe FAIL), green after
- acceptance: all six clauses of the card (blocked forms, reads still pass, deny entries, count and bash 3.2, doc
  rows, `config-change-approved`)

## Plan

Copied from `backlog/work/B1.103/plan.md` (plan review approved round 2; `Plan approved by: lead, 2026-11-16`;
Rounds: 1).

Approach: a merge rule in `guard-bash.sh` section 2, next to the `gh` ref rules, plus five `settings.json` deny entries
as a second layer. The hook is the tested layer (hook-smoke); a deny entry still holds when the hook cannot read its
input (`CMD` empty → exit 0). Any case, message `agents never merge a pull request (…): merging is the lead's (D-9).`:

- per segment: `gh … pr merge` (gh behind a path, `\`, a `VAR=` prefix or quotes; global flags such as `-R o/r` first;
  flags and their values between `pr` and `merge`, `gh pr -R o/r merge`, review r1 #1, which also closes the same gap
  for `GH_BRANCH_DELETE`'s `gh pr -R o/r merge 7 -d`);
- over the whole command, once it names `gh … api` anywhere (so a path or query in a variable or a heredoc of the same
  command counts): `pulls/<n>/merge` in any method, `/merges`, and the GraphQL mutations `mergePullRequest`,
  `enablePullRequestAutoMerge`, `mergeBranch`, `enqueuePullRequest`.

Costs, for the lead to accept (review r1 #2; stated in the hook header and `hooks.md` with the workarounds):

- The text is matched, not run, so naming a form is enough to be blocked: a GET of `pulls/<n>/merge` (use
  `gh pr view --json merged`); a command holding the words `gh … pr merge` anywhere in one segment, such as
  `grep -rn "gh pr merge"`, `git log --grep`, a `git commit -m`, a `scripts/pr-step.sh draft` title or
  `scripts/card-status.sh` evidence quoting it; a command naming `gh … api` and a merge mutation or `/merges`
  (`grep -n "gh api" f | grep -i mergepullrequest`). Workarounds: `git commit -F <file>`, a search pattern split by a
  class (`grep -rn "pr[ ]merge"`), evidence and titles that describe the rule ("the merge forms") instead of quoting it.
  This card's own commits, PR title and closing evidence follow them.
- Out of reach of a text check: a script file the agent wrote and then runs (`bash "$TMPDIR/m.sh"`), a GraphQL query
  read from a file an earlier command wrote (`-F query=@q.graphql`), a word quoted in pieces, an alias, a command
  built at run time (`$(which gh) pr merge 7`), `curl` with a token. The ruleset's approval count (D-9) and the
  runner's `gh` token scope would close these outside the hook; both stay the lead's ruling (card).
- The deny entries' wildcard matching is `[unverified]` live (Claude Code reads `settings.json` at launch, so this
  session cannot try them); hook-smoke pins their text only.
- Review r2 notes, unchanged by this card: `gh pr merge 7 --disable-auto` is blocked too (turning auto-merge off is
  safe; the lead does it); `gh pr -R o/r close 7 --delete-branch` still passes `GH_BRANCH_DELETE` (B1.24's `close`
  half has the same flag gap), a follow-up card for the lead to file.

No advice (tier quick, no section). Risk tier **high** (`.claude/`, hooks) → the lead's `approve`; the PR carries
`config-change-approved` (D-19).

| File                           | Change                                                                                                                  | Why          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------ |
| `.claude/hooks/guard-bash.sh`  | `GH_ANY_API`, `GH_MERGE_API`, `GH_PR_MERGE`, `MERGE_MSG`; whole-command and segment checks                              | Acceptance 1 |
| `.claude/settings.json`        | deny `gh * pr merge*`, `gh *pulls/*/merge*`, `gh */merges*`, `gh *mergePullRequest*`, `gh *enablePullRequestAutoMerge*` | Acceptance 3 |
| `scripts/hook-smoke.sh`        | section "merging a pull request (B1.103)": 25 blocked, 14 allowed; settings probe 21 entries, its message               | Test line    |
| `.claude/docs/hooks.md`        | guard-bash row: the merge rule, false positives with workarounds, out of reach; deny line                               | Acceptance 5 |
| `.claude/docs/git-workflow.md` | "Needs a human": merging through `gh api` next to `gh pr merge`                                                         | Acceptance 5 |
| `scripts/CLAUDE.md`            | `hook-smoke.sh` row names the merge probes                                                                              | Acceptance 5 |
| `backlog/work/B1.103/*`        | plan, review, pr-body                                                                                                   | pipeline     |

Interfaces: `guard-bash.sh` (PreToolUse Bash) exits 2 with `MERGE_MSG` on a merge form, 0 otherwise as today;
`.claude/settings.json` `permissions.deny` 16 → 21 entries, `allow` unchanged.

Verification: red `test(hooks): B1.103 hook-smoke probes gh merge calls (red)` (26 FAIL); green
`chore(hooks): B1.103 guard-bash blocks merging a pull request through gh` ("hook-smoke: 788 probes OK", bash 3.2 and
5; 12 of 12 prototype mutants fail a merge probe); `pnpm lint && pnpm typecheck` exit 0; `pnpm test` 298 before and
after; mutation: CI only, no src/lib or src/actions change; `check-plan-scope.sh`, `check-backlog.sh` OK; CI green.

Work breakdown: 1 dev-lead red probes → 2 dev-lead rule, deny entries, docs → 3 reviewer diff review → 4 dev-lead
draft PR, label.

## Map delta

None (no `src/`, no section).

## Review

pending

## Evidence

- AC met: pending
- tier: high
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the green commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 % (n/a: no section, no `src/`).
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change labeled `config-change-approved`.
- [ ] Migrations reviewed as SQL (n/a).
- [ ] `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
