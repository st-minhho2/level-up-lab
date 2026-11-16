# B1.103 review

## Plan review (round 1)

Plan at `2ffbaf8`. Evidence: the prototype (base, red, green) cloned to `$TMPDIR/b1103probe`; its `guard-bash.sh` run
on 40 extra commands (`$TMPDIR/b1103cases*.txt`); `gh` 2.103.2 on this machine for argument routing (`--help` only,
nothing merged). Base hook-smoke on `2ffbaf8`: started, not finished when this round was written, so the plan's 749 is
`[unverified]` here. The prototype's full smoke in the clone had 0 guard-bash FAILs (its other FAILs came from the
clone having no `node_modules`: js-yaml, Prettier).

| Check                                                                                  | pass / fail: reason                                                                                                                                                          |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: tooling, no §, no `src/`; every file is one the card names or a doc that describes the rule (`git-workflow.md` "Needs a human" already lists `gh pr merge`)            |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: n/a, no TypeScript; the hook interface (exit 2 + message) is pasted                                                                                                    |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice, stated (tier quick, no section), as B1.101                                                                                                                  |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | fail: the card has 6 criteria and each maps to a probe or a doc row, but acceptance 1 ("every merge form … with global `gh` flags") is not met by the planned rule: reason 1 |
| verification lists exact commands with expected numbers                                | pass: red 23 FAIL, green 784 (749 + 35), 22 + 13 probes, bash 3.2 and 5, 10 of 10 mutants, `pnpm test` 298; the 784 will move by the probes reason 1 and 2 add               |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: red `test(hooks): … (red)` with a "Red because" body, green `chore(hooks): …`, review, PR; no skeleton (nothing to stub) and no map row (no §), as B1.24 and B1.101    |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a, no section; the risk tier is high (`scripts/agent/tier.sh` on the plan prints `high`), so the lead's `approve` gates the build                                    |
| no settled D-n contradicted                                                            | pass: D-9 ("agents never merge … by convention") is narrowed, not changed; ruleset approvals and the runner token stay the lead's, as the card says; D-19 label named        |
| `scripts/next-task.sh --check B1.103` on the committed plan says no overlap            | pass: `[next-task] B1.103: no overlap with any Doing or Review card`                                                                                                         |

Costs as stated: false positives, out of reach, `[unverified]` deny matching. Two of them are understated (reason 2).

Verdict: changes requested

1. **A flag between `pr` and `merge` passes both layers.** `GH_PR_MERGE` requires `pr` and `merge` to be adjacent
   (`pr["']?[[:space:]]+["']?merge`), and neither `Bash(gh pr merge*)` nor the new `Bash(gh * pr merge*)` matches
   the form either. TRIGGER: `gh pr -R o/r merge 7` and `gh pr --repo=o/r merge 7` exit 0 from the prototype hook.
   `gh` 2.103.2 routes both to `merge` (`gh pr -R o/r merge --help` prints "Merge a pull request on GitHub."), because
   `-R/--repo` is a persistent flag of `pr`, not a root flag, and so it is accepted after `pr` as well as before it.
   The plan needs this form in `GH_PR_MERGE` (flag words only between `pr` and `merge`, so `gh pr create --title "x
merge"` does not widen the false positives) and in the probe table, with its mutant. A deny entry
   `gh pr * merge*` is not the fix: it would also deny `gh pr view 7 --json mergeable`. The same adjacency sits in the
   existing `GH_BRANCH_DELETE` (`gh pr -R o/r merge 7 -d`); the plan may fix it alongside or state it as out of scope.
   CONFIDENCE: confirmed (ran the hook; `gh` argument routing via `--help`).
2. **"None is on a workflow path" does not hold, and "a command running `gh api`" is "naming".** Both checks read
   text, so a command that only names a merge form is blocked. Confirmed with exit 2 on the prototype:
   `scripts/card-status.sh B1.103 Done "… gh api PUT pulls/N/merge and gh pr merge"` (this card's own Done evidence,
   the closing lane), `scripts/pr-step.sh draft '… gh pr merge …'` and `gh pr create --title "… gh pr merge …"` (PR
   titles), `grep -rn "gh pr merge" .claude/docs`, `rg`, `git log --grep "gh pr merge"` (the docs step of this card
   and every later edit of those rows), and `grep -n "gh api" f | grep -i mergepullrequest` (the whole-command check
   fires on `gh api` as a grep pattern, not only as a call). The plan names the commit-message case and works around
   it with `git commit -F`; it should state the card-status evidence, PR title and search cases in its costs and in
   `hooks.md` (with the workaround: the Grep tool, wording the evidence without the forms), and either word "running"
   as "naming" or narrow the check. Out of reach should also name the plainest bypass, a script file the agent wrote
   and then runs (`bash "$TMPDIR/m.sh"` exits 0), not only "a command built at run time". CONFIDENCE: confirmed.

Riskiest unfalsified: the five deny entries' wildcard matching (`gh * pr merge*` with an empty `*`, and whether
compound commands are split before matching) cannot be tried in a session; the plan marks it `[unverified]`, and the
hook carries the tested layer.
