# B1.14 review

## Plan review (round 1)

SCOPE: none of lib | actions | ui. The plan touches `scripts/worktree-prune.sh`, `scripts/prune-smoke.sh`,
`scripts/CLAUDE.md` and `backlog/work/B1.14/`; no `src/`, `prisma/` or `e2e/` path, so no spec section, skeleton, map
row or Stryker run applies.

Plan reviewed at `e7cc8f4` (`docs(backlog): B1.14 plan`), card at `557797e`, `origin/main` = `557797e`. Probes ran on
copies only: a throwaway repo under the session scratchpad (git 2.39.5, `/bin/bash` 3.2.57), and a copy of
`prune-smoke.sh` with P14/P15 added, run against `557797e`'s `worktree-prune.sh` and a copy patched with the plan's
merge-base check (three lines in `merged_reason`, two messages in `handle`). The worktree was not edited.

### How the checklist was adapted to a tooling card (as B1.12, B1.13)

| Row in `reviewer.md`                         | Read here as                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| files belong to the section's features (map) | files belong to the card's Test/Acceptance and the `scripts/CLAUDE.md` contract row (no §, no map)  |
| interfaces follow `ts-style.md`              | CLI flags, return codes and messages stated; bash 3.2-safe                                          |
| follows `advice.md`                          | no `advice.md` (Tier quick, no section): the skip must be stated                                    |
| ≤ 7 criteria, measurable Then                | the card's Test and Acceptance lines, and the plan's P14–P15                                        |
| exact commands with expected numbers         | unchanged                                                                                           |
| skeleton → red → green → map → review        | no skeleton, no map; red = smoke fails on `557797e`'s script on behavior, green = passes on the fix |
| `Lead approves spec` box                     | no section; the card's `Spec:`/`Test:` lines exist (`557797e`)                                      |
| no settled D-n contradicted                  | unchanged; also invariant 2 (red first, never weakened) and the role write scopes                   |

### Checklist

| Check                           | Result                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| files belong to the card        | pass: `worktree-prune.sh` is the card's Acceptance, `prune-smoke.sh` its Test, `scripts/CLAUDE.md` the smoke row the Acceptance names ("names the new probe range"), `backlog/work/B1.14/` its Work line. `git diff --stat main...HEAD` = `plan.md` only.                                                                                                               |
| interfaces stated               | pass: flags unchanged; `merged_reason` return codes 0/1/2/3 pasted; both new messages quoted (`[keep] … (commits net to no change vs <base>; <path>)`, `branch <b> kept (commits net to no change vs <base>)`); `--all` still asks; no merge-base → check skipped. Only `local` and `[[ ]]`: bash 3.2-safe.                                                             |
| advice                          | pass: spec-analyst/advisor skip stated (no section, Tier quick).                                                                                                                                                                                                                                                                                                        |
| criteria measurable             | pass: P14 and P15 each name exit code, directory, schema, branch, metadata and a quoted message fragment; with the card's Acceptance that is 3 criteria.                                                                                                                                                                                                                |
| approach correct                | pass (confirmed, table below): commit+revert and add+drop are net-empty and kept; squash-merged, and `git merge main` then squash-merged (`git-workflow.md:37`), still reach `tree`; unrelated history has no merge-base and is skipped.                                                                                                                                |
| red on behavior                 | pass (confirmed): the copy with P14/P15 on `557797e`'s script → `13 of 15 ok, FAIL: P14 P15`; P14 fails on dir removed, schema dropped, branch deleted, no `[keep]` line; P15 on branch deleted, no "kept" line. No shim denial, `level_up_lab` unchanged.                                                                                                              |
| green reachable                 | pass (confirmed): the same copy on the patched script → `15 of 15 ok, 0 FAIL`, isolation line ok.                                                                                                                                                                                                                                                                       |
| verification exact with numbers | pass: red input pinned to `557797e` with a command; both smoke lines carry counts and exit codes. `hook-smoke` today prints `hook-smoke: 221 probes OK` (plan says "hook-smoke OK"; fine, the count is not this card's).                                                                                                                                                |
| work breakdown                  | pass: red `test(scripts): B1.14 …` before green `fix(scripts): B1.14 …`, evidence, review, PR; all three subjects match the `commit-msg` regex (`lefthook.yml:31`, ≤ 72 chars). `check-feat-commits.sh` checks only `feat(`, so "the fix commit touches no smoke line" is the plan's own rule: diff review will check `git diff <red>..HEAD -- scripts/prune-smoke.sh`. |
| who edits `scripts/`            | pass: orchestrating session under the lead's approval, as B1.12/B1.13 (stated as a deviation).                                                                                                                                                                                                                                                                          |
| protected path and label        | pass (confirmed): none of the three paths matches `PROTECTED` in `scripts/ci/check-config-change.sh:10`; no `config-change-approved` needed.                                                                                                                                                                                                                            |
| costs stated for the lead       | pass, with one addition below (not blocking).                                                                                                                                                                                                                                                                                                                           |
| one screen                      | 58 lines, above the ≈ 40 guideline; B1.13's approved plan was 68. Not blocking.                                                                                                                                                                                                                                                                                         |
| `Lead approves spec` box        | n/a: no section.                                                                                                                                                                                                                                                                                                                                                        |
| no settled D-n contradicted     | pass: D-1…D-17 govern roles, gates and §5–§11, none `scripts/`; D-13's shape (test commit without `(red)`) is the one the plan follows.                                                                                                                                                                                                                                 |

### Probe runs

```
throwaway repo (bare origin), base = refs/remotes/origin/main; columns: commits beyond base · tip tree vs merge-base tree · merge-tree = base tree
  revert                   (add r, git revert HEAD)                 ahead=2  NETEMPTY  tree   → kept (was pruned as tree)
  adddrop                  (add s, drop s)                          ahead=2  NETEMPTY  tree   → kept (was pruned as tree)
  squashed                 (add t, squash on origin)                ahead=1  change    tree   → pruned as tree, unchanged
  mergemain_then_squash    (add u, git merge main, squash u)        ahead=2  change    tree   → pruned as tree, unchanged
  squash_then_mergemain    (add t, squash t, then git merge main)   ahead=2  NETEMPTY  tree   → kept (cost a, as stated)
  noff_only                (only a --no-ff merge of main)           ahead=1  NETEMPTY  tree   → kept (was pruned as tree)
  unrelated                (orphan history)                         ahead=1  no merge-base  - → not merged, unchanged
  revert_then_mergemain    (add r, revert, git merge main)          ahead=3  NETEMPTY  tree   → kept
real repo, every local and origin branch vs origin/main (557797e): the rule flips none; fix/B1.13-prune-every-layout
  (15 commits, merged #46) stays "change, tree" → still pruned
copy of prune-smoke.sh + P14 (M, add r + revert) + P15 (N, add s + drop s, dir deleted), run from this worktree
  557797e script:  FAIL P14 …: net-empty dir removed; net-empty schema dropped; net-empty branch deleted; no keep line
                   FAIL P15 …: gone net-empty branch deleted; no kept line
                   [prune-smoke] 13 of 15 ok, FAIL: P14 P15
  patched copy:    [prune-smoke] 15 of 15 ok, 0 FAIL      (both: ok level_up_lab wt_* schemas unchanged; no shim denial)
unchanged tree: scripts/prune-smoke.sh → [prune-smoke] 13 of 13 ok, 0 FAIL · hook-smoke: 221 probes OK ·
  [check-backlog] OK: README matches the cards · bash -n both scripts exit 0
```

A tip tree equal to its merge-base tree always merged as `tree` before (a three-way merge with one side unchanged
gives the base), so the set the fix newly keeps is exactly "branches with commits beyond the base whose commits net to
no change". The fix never prunes more than today.

### Costs for the lead (in addition to the plan's (a) and (b))

- (a) is wider than "merged the base after its own squash merge": every branch whose only commits beyond the base
  merge the base in (`git merge --no-ff main`, or `merge.ff=false`) also moves from pruned (`tree`) to `[keep] … net to
no change` (`noff_only` above). Such a branch carries no change of its own; keeping it loses nothing and `--all` or
  `git branch -D` removes it.

### Not blocking

- The smoke guards squash-merged branches only without a merge from main (P1, P2, P8, P13). The documented way to
  bring main in (`git-workflow.md:37`, `git merge main`, then squash) moves the merge-base the new check reads; the
  probe above shows it still prunes, but no smoke line would fail if it stopped. One more probe (merge main into the
  branch, then squash-merge → removed) would pin it; the lead may take it or leave it.

Verdict: approved

Ready for the lead's gate; not approved for build until `Plan approved by:` is written by the lead.

## Red and green evidence

Red at `cdb93f1` (`test(scripts): B1.14 smoke P14-P15 net-empty branch`), smoke run on the unchanged
`scripts/worktree-prune.sh` (= `557797e`), exit 1:

```text
FAIL P14 M branch = a commit and its revert, never on origin: kept with directory, schema and branch: net-empty dir removed; net-empty schema dropped; net-empty branch deleted; no net-empty [keep] line
FAIL P15 N branch = a file added then dropped, directory deleted: schema dropped, branch kept: gone net-empty branch deleted; no 'kept (commits net to no change' line
ok   level_up_lab wt_* schemas unchanged; no shim denial
[prune-smoke] 13 of 15 ok, FAIL: P14 P15
```

Green at `fbbd9dc` (`fix(scripts): B1.14 keep a branch whose commits net to no change`), exit 0:

```text
ok   P14 M branch = a commit and its revert, never on origin: kept with directory, schema and branch
ok   P15 N branch = a file added then dropped, directory deleted: schema dropped, branch kept
ok   level_up_lab wt_* schemas unchanged; no shim denial
[prune-smoke] 15 of 15 ok, 0 FAIL
```

`git diff --stat cdb93f1..fbbd9dc -- scripts/prune-smoke.sh` empty. `bash -n` both scripts exit 0;
`hook-smoke: 221 probes OK`; `[check-backlog] OK: README matches the cards`.
