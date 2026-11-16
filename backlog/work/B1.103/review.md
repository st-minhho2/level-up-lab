# B1.103 review

## Plan review (round 1)

Plan at `2ffbaf8`. Evidence: the prototype (base, red, green) cloned to `$TMPDIR/b1103probe`; its `guard-bash.sh` run
on 40 extra commands (`$TMPDIR/b1103cases*.txt`); `gh` 2.103.2 on this machine for argument routing (`--help` only,
nothing merged). Base hook-smoke on `2ffbaf8`: `hook-smoke: 749 probes OK` (finished after the report was sent; it matches the
plan's 749); the smoke left no file in the worktree. The prototype's full smoke in the clone had 0 guard-bash FAILs (its other FAILs came from the
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

## Plan review (round 2)

Plan at `86fc824`. Evidence: the prototype's `green-r2` cloned to `$TMPDIR/b1103r2b`. The plan's merge section of
hook-smoke (lines 189–233, 39 probes) was cut out into a small harness and run with `/bin/bash` 3.2:
`probes=39 fail=0` on the green-r2 hook; `25 FAIL`, all on the blocked side, and the 14 reads ok on the base hook
(`bd03a3d`, = `36d0e2e`). Twelve mutants of the green-r2 hook (the plan's list) each fail at least 1 probe. 30 extra
commands were run through the green-r2 hook (`$TMPDIR/b1103r2-cases.txt`). bash 5 is not installed here, so the
plan's bash 5 line is `[unverified]` until CI runs it.

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                         | pass: tooling, no §; `scripts/ci/plan-files.sh --any B1.103 HEAD` lists the 7 rows (6 files + `backlog/work/B1.103/*`), each named by the card or describing the rule                                                                                                                                                                                        |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: n/a, no TypeScript; hook interface (exit 2 + `MERGE_MSG`) and deny count 16 → 21 stated (`settings.json` holds 16 today)                                                                                                                                                                                                                               |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no advice, stated (tier quick, no section)                                                                                                                                                                                                                                                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 6 acceptance lines. Round 1 #1 is fixed: `gh pr -R o/r merge 7`, `gh pr --repo=o/r merge 7`, `gh pr --repo "o/r" merge 7`, `gh pr -R o/r --squash merge 7` exit 2. The reads acceptance covers the runner's allowed `gh pr edit/checks/view *` (`run.sh:46`); the wrapper's and `run.sh`'s own `gh_` calls run inside scripts that the hook never sees |
| verification lists exact commands with expected numbers                                | pass: red 26 FAIL (25 + settings probe) confirmed for the 25; green 788 = 749 + 39 (the 749 was confirmed in round 1, the 39 here); the mutant count is off by one (note 1)                                                                                                                                                                                  |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: red `test(hooks): … (red)` with a "Red because" body, green `chore(hooks): …`, review, PR; no skeleton or map row (no §), as B1.24 and B1.101; `git commit -F` for every message                                                                                                                                                                       |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a, no section; `scripts/agent/tier.sh` on the plan prints `high`, so the lead's `approve` gates the build                                                                                                                                                                                                                                            |
| no settled D-n contradicted                                                            | pass: D-9 ("Agents still never merge (`gh pr merge` denied in settings; … by convention …)") gets a tested layer and is not changed; D-19 label named                                                                                                                                                                                                        |
| `scripts/next-task.sh --check B1.103` on the committed plan says no overlap            | pass: `[next-task] B1.103: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                         |

Round 1 #2 is fixed. The costs now say "naming", list the commit, PR title, card-status evidence and search cases
with workarounds, and put the script-file bypass first under out of reach. No agent, skill or doc command an agent
runs names a merge form today: only `git-workflow.md:26` and `hooks.md:19` mention `gh pr merge`, both as prose.

Costs the lead accepts with this plan (all confirmed on the green-r2 hook; none blocks):

1. **Mutant count.** The plan lists 12 mutants (6 named + `pulls/<n>/merge` + `/merges` + 4 mutation names) but says
   "11 of 11", and round 1's "10 of 10" was off by one the same way. I ran the 12: each fails at least 1 probe.
   The green commit's evidence should say 12 of 12.
2. **`gh pr merge 7 --disable-auto` is blocked** (exit 2), though turning auto-merge off is the safe direction.
   GraphQL `disablePullRequestAutoMerge` and `dequeuePullRequest` pass (exit 0). Worth one word in `hooks.md`'s
   false positives.
3. **The gh binary named through a substitution passes** (exit 0): `$(which gh) pr merge 7`,
   `` `which gh` pr merge 7 ``, and `"$(command -v gh)" api -X PUT repos/o/r/pulls/7/merge`. `${W}gh` must be
   followed by a quote or a space, and here a `)` or backtick follows. This falls inside the stated "a command built
   at run time". Naming `$(which gh)` as the example in `hooks.md` would keep a reader from taking it for a covered
   prefix.
4. **Outside this card, a follow-up card for the lead:** `gh pr -R o/r close 7 --delete-branch` and
   `gh pr --repo=o/r close 7 --delete-branch` exit 0. This is round 1 #1's adjacency in `GH_BRANCH_DELETE`'s
   `close` half (B1.24), and it deletes a remote branch. The plan's sentence claims only the `merge … -d` half,
   which is accurate: the merge rule catches it first.
5. The settings probe's `ok` text in `hook-smoke.sh:198` ("the 16 deny entries unchanged") changes along with its
   21-entry list.

Verdict: approved (ready for the lead's `approve`; tier high)

Riskiest unfalsified: as in round 1, the deny entries' wildcard matching cannot be tried in this session.

Run time, measured after the report was sent. On a 106 KB command of 3000 `gh pr … view` lines, the base hook took
238 s and the green-r2 hook 241 s (one run each, bash 3.2; the time is the base hook's, with one `tr` per segment).
On a single segment with 300 flag pairs between `pr` and `view`, both took under 1 s. So the new regexes add no
measurable time.

## Diff review (round 1)

Head `a573bb4` (red `a9e8c2c`, green `a573bb4`), against `origin/main` `b5d8ca4`. Evidence: the gates below run in
the worktree; probes on copies under `$TMPDIR/b1103d/` (the base hook from `origin/main`, the green hook, 15 mutants
of the green hook), with hook-smoke's own B1.103 section (lines 189–233) cut out into a harness, `/bin/bash` 3.2.
PR #379 (draft, label `config-change-approved`) CI run `43905008482` on `a573bb4` was read with `gh run view`.

### Commands

| Command                                     | Last line                                                                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` / `pnpm typecheck`              | exit 0 / exit 0                                                                                                             |
| `pnpm test`                                 | `Tests  403 passed (403)` (63 files)                                                                                        |
| `pnpm test:e2e`                             | `91 passed (2.2m)`                                                                                                          |
| `scripts/mutation-gate.sh`                  | `mutation: CI only, no src/lib or src/actions change`                                                                       |
| `scripts/hook-smoke.sh` (`/bin/bash` 3.2)   | `hook-smoke: 788 probes OK`; CI's bash 5 (`test` job of run 43905008482): `hook-smoke: 788 probes OK`                       |
| `scripts/ci/check-suppressions.sh`          | `[check-suppressions] OK: no new suppressions`                                                                              |
| `scripts/ci/check-config-change.sh`         | exit 1, lists the 4 protected files: expected locally, the PR carries `config-change-approved` (CI reads it)                |
| `scripts/ci/check-feat-commits.sh`          | `[check-feat-commits] OK: no feat commit touches tests`                                                                     |
| `scripts/ci/check-ac-coverage.sh`           | `[check-ac-coverage] OK: every criterion of a shipped section has a test`                                                   |
| `scripts/ci/check-spec-sections.sh`         | `[check-spec-sections] OK: sections cited: 1 … 53`                                                                          |
| `scripts/ci/check-features-map.sh`          | `[check-features-map] OK`                                                                                                   |
| `scripts/verify-red.sh B1.103` and `--auto` | exit 1, `::error::test(B1.103) commits touch no *.test.ts(x) file`: finding 1                                               |
| `scripts/ci/check-plan-scope.sh`            | `OK: chore/B1.103-merge-guard stays inside the approved plan of B1.103`                                                     |
| `scripts/ci/check-backlog.sh`               | `OK: README matches the cards`                                                                                              |
| `scripts/next-task.sh --check B1.103`       | `[next-task] B1.103: no overlap with any Doing or Review card`                                                              |
| `git diff --stat origin/main...HEAD`        | 9 files, 372 insertions, 17 deletions (the plan's 6 files + `work/B1.103/{plan,pr-body,review}.md`)                         |
| CI run 43905008482 (`a573bb4`)              | `guards` failure at "test(...) commits are red for the right reason"; lint, typecheck, test, e2e, mutation, semgrep success |

Red, measured on the harness: the B1.103 section against the `origin/main` hook gives 25 FAIL, all `want 2`, and the
14 reads plus the wrapper probe pass; against the green hook 0 merge FAIL. (One extra FAIL on both, `pr-step.sh
ready 7`, is the harness's: the hook copy sits outside the checkout, so rule 5's same-wrapper check refuses; in the
real smoke it passes.)

### Checklist

- Acceptance (card, no §): 1 blocked forms, any case, global flags, message: probes 189–215 + heredoc probe; 2 reads:
  probes 218–231 and the wrapper; 3 deny entries: settings probe, 21 entries; 4 count 749 → 788, bash 3.2 here and 5
  in CI; 5 `hooks.md` and `scripts/CLAUDE.md` rows (out of reach: `curl`, built at run time); 6 label on #379. Met.
- No test weakened after the red commit: `git log --first-parent --no-merges a9e8c2c..HEAD -- scripts/hook-smoke.sh
'*.test.*' e2e/` is empty; no merge commit on the branch.
- Every changed file is in `plan.md`'s Files table (`check-plan-scope.sh` agrees); interfaces as planned (exit 2 +
  `MERGE_MSG`; deny 16 → 21, `allow` unchanged).
- No TypeScript, no `src/`, no Prisma, no migration, no suppression, no secret; no features map row (no §).
- `hooks.md` (caller's question 1): `git diff -w` shows 4 lines changed: the table separator, the guard-bash cell
  (merge rule appended) and the deny line (2 lines). Every other row changed in padding only.
- Revert probes (15 mutants of the green hook, merge-section FAIL count): no whole-command check 15, no segment check
  10, no flags between `pr` and `merge` 3, no `pulls/<n>/merge` 8, no `/merges` 1, no `mergePullRequest` 3, no
  `enablePullRequestAutoMerge` 1, no `mergeBranch` 1, no `enqueuePullRequest` 1, no quotes in `GH_PR_MERGE` 1,
  case-sensitive 7, other message 25, whole check on the first line only 7; **no quotes in `GH_ANY_API` 0**
  (finding 2); `merge${E}` → `merge` 0 (it only widens, harmless).
- 50 extra commands through the green hook: `xargs`, `eval`, `bash -c`, `$( )`, `gh alias set pm 'pr merge'`, a
  piped GraphQL query, a full URL, tabs, `--admin`, `--match-head-commit` all exit 2; `merge-upstream`,
  `update-branch`, compare and branch reads, GraphQL `autoMergeRequest` / `mergeQueueEntry` /
  `viewerCanEnableAutoMerge`, branch names holding `merge`, `gh pr edit --title "merge guard"` all exit 0.

### Findings

```
[1] KIND: plan-mismatch
    WHERE: commit a9e8c2c subject (plan.md "Verification" and "Work breakdown" step 1 prescribe it)
    DEFECT: the hook-smoke-only red commit carries the `(red)` marker, so CI's `verify-red.sh --auto` picks B1.103,
            finds no *.test.ts(x) file in it and exits 1.
    TRIGGER: PR #379 at a573bb4: CI run 43905008482, job `guards`, step "test(...) commits are red for the right
             reason": `##[error]test(B1.103) commits touch no *.test.ts(x) file`, exit 1; same locally with
             `scripts/verify-red.sh --auto`.
    WRONG BEHAVIOUR: a required CI check is red on the PR, and pr-body.md's "CI green" is false. The smoke-only
            cards before it (B1.82, B1.88, B1.95, B1.101) dropped the marker and said so in the red body, because
            verify-red judges only vitest. The commit is pushed, so rewording it needs a force push, which an agent
            never does. Ways out, the lead's choice: the lead rewords and force-pushes; or dev-lead re-cuts the
            branch (new name, the same commits with the red subject `test(hooks): B1.103 hook-smoke probes gh merge
            calls` and its "Red because" body kept), opens a new PR and closes #379. My plan reviews (rounds 1 and 2)
            passed this subject and missed it.
    CONFIDENCE: confirmed (CI log read; verify-red run here)
```

```
[2] KIND: coverage
    WHERE: .claude/hooks/guard-bash.sh:66 (`GH_ANY_API`), scripts/hook-smoke.sh:189-215
    DEFECT: the quote tolerance in `GH_ANY_API` (`gh["']?` … `["']?api["']?`) is pinned by no probe; reverting it to
            the `GH_API` form fails 0 of the 39 merge probes.
    TRIGGER: `"gh" api -X PUT repos/o/r/pulls/7/merge` and `gh 'api' graphql -f query='mutation {
             mergePullRequest(…) … }'`: exit 2 on the green hook, exit 0 on that mutant (and on the base hook).
    WRONG BEHAVIOUR: correct today, but a later edit can drop it silently while the hook header and hooks.md still
            claim quotes are covered; the shell strips the quotes, so the command merges. One blocked probe per
            quote position closes it (a `test(hooks): B1.103 review pass 1 -- …` commit, no `(red)` marker).
    CONFIDENCE: confirmed (mutant run)
```

### Notes (no finding)

- Caller's question 2, the deny wildcards: `gh *pulls/*/merge*` lets `*` span spaces, so it is wider than the hook's
  `pulls/[^[:space:]]*/merge`: `gh api repos/o/r/pulls/7/files --jq '… startswith("src/merge")'` passes the hook and
  would be denied. No command in the workflow has that shape: `pr-step.sh`'s and `run.sh`'s own `gh` calls are not
  agent commands, branch names (`<type>/B<e>.<n>-<slug>`) cannot hold `/merges` or `pulls/`, and `gh pr view`,
  `checks`, `edit`, `ready` do not match. Still `[unverified]` live, as the plan says.
- Caller's question 3, `pnpm test` "298": the plan's number is stale (main has 403); the claim that matters, the same
  count before and after with no `src/` change, holds (403 = 403). Not a plan deviation; pr-body.md's Verification
  should say 403 when it is next touched, with "CI green" corrected under finding 1.
- Out of reach, measured and in the stated "built at run time" class: part of the path or name in a variable or
  substitution (`M=merge; gh api -X PUT repos/o/r/pulls/7/$M`, `S=merge; gh pr $S 7`, `gh pr "$(echo merge)" 7`,
  `merge${X}PullRequest`) and `pulls/7%2Fmerge` exit 0. The header's "a path or query held in a variable … counts"
  holds only for a whole path; hooks.md could say "a whole path".
- B1.104's branch (`62a2a4c`, `test(scripts): … (red)`, run-smoke only) has the same subject shape as finding 1.

Verdict: back to test-writer (dev-lead wrote the probes: finding 1 needs the lead's choice before anything else;
finding 2 is one test commit)

Riskiest unfalsified: the five deny entries' wildcard matching in Claude Code (an empty `*` in `gh * pr merge*`,
and whether compound commands are split before a deny matches) cannot be tried in a session.
