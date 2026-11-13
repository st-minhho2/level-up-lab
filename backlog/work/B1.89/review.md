# B1.89 review

## Plan review (round 1)

SCOPE: tooling (`.gitattributes`, `scripts/ci/`, `scripts/`; no `src/`, no section)

| Check                                                                          | Result                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the card                                     | pass: `.gitattributes`, `lib.sh`, both guards (Acceptance), `table-merge-smoke.sh` (the card's Test line, "or a new smoke"), `scripts/CLAUDE.md` (index), `work/B1.89/*`. No features-map row applies (tooling, no §). `docs/metrics.md` per-card row is paperwork (`check-plan-scope.sh:22`) |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass (n/a): bash only. The two new `::error::` lines and "no flag, variable or exit code" are stated                                                                                                                                                                                          |
| plan follows `advice.md` or states the deviation                               | pass: no advice (tier quick, no section), stated                                                                                                                                                                                                                                              |
| ≤ 7 criteria, every Then measurable                                            | pass: the card's Acceptance clauses map to T1–T8, each an exit code, a row count or a named row; "a side that changes nothing fails" guards against a vacuous probe                                                                                                                           |
| verification lists exact commands with expected numbers                        | pass: red "8 of 8 probes FAILED", green "8 probes OK", `/bin/bash` 3.2. Reproduced on clones of `16da276` under `$TMPDIR`: red `8 of 8 probes FAILED`; with the prototype overlay `8 probes OK`, `[check-features-map] OK`, `[check-backlog] OK: README matches the cards`                    |
| work breakdown: skeleton → red → green → map → review, convention subjects     | pass: as B1.88's: `test(scripts)` red, `chore(scripts)` green, `docs(backlog)` review; no skeleton or map step for a tooling card                                                                                                                                                             |
| `Lead approves spec` box, human-ticked only                                    | pass (n/a): no spec change. `scripts/agent/tier.sh backlog/work/B1.89/plan.md` → `high`, so the lead's `approve` is the gate; `config-change-approved` (D-19) named                                                                                                                           |
| no settled D-n contradicted                                                    | pass: D-19, D-27, D-28 followed; `.claude/` (B1.85 holds `dev-lead.md`) left out and the Loop 9 guard run filed as a follow-up                                                                                                                                                                |
| `next-task.sh --check B1.89`                                                   | pass: `[next-task] B1.89: no overlap with any Doing or Review card`                                                                                                                                                                                                                           |

Verdict: changes requested

1. **"Keep one" does not say which one, and in Loop 9's direction the stale copy comes first.** The plan's two new
   errors end "(a union merge kept both sides of an edit; keep one)" (prototype `check-features-map.sh`,
   `check-backlog.sh`), and neither the plan nor any guard says which copy is right. Probed in Loop 9's direction (the
   card branch, which appended `| B5.5 | this PR |`, runs `git merge main`, where a sibling's closing changed
   `| B5.4 | this PR |` to `| B5.4 | abc1234 |`): merge rc 0, and the result reads `B5.4 this PR`, `B5.5 this PR`,
   `B5.4 abc1234`. The stale row comes first (union writes ours, then theirs), and the sibling's row also sits below the
   card's row. If the resolver keeps the first copy, or the one beside its own row, it undoes the sibling's closing
   edit. That passes every guard: no script reads the per-card `Red`/sha cell (`git grep "this PR" -- scripts
.claude/hooks` returns nothing). The same thing happens to a map row's status (✗ against ✅, T3). This is the most
   common case the plan names (#230/#232: every card's closing edits its own last row). It is the round trip the plan
   accepts, plus a way to lose data silently that the plan does not name. Fix it in scope:
   (a) each error names the rule, for example "keep the row as on `origin/main` unless this branch changed that row
   (`git diff origin/main -- <file>`)";
   (b) T4 merges in Loop 9's direction (the appending branch merges the closing one) and asserts the error text
   carries that rule;
   (c) Costs say who fixes a duplicate after a red CI on a runner PR (dev-lead, since only it writes `spec/` and
   `docs/metrics.md`), until the follow-up card runs the guards at Loop 9.
2. **The Prettier cost counts only the map, and gets that count wrong.** "3 of 14 map appends": `git log --numstat --
spec/features-map.md` shows 17 `feat(todos)` row appends since B2.1. Three of them re-padded the table: 315b97e
   B2.4 15+/14−, 9bb37ab B5.3 25+/24−, 8d61eda B5.6 28+/27−. `docs/metrics.md` re-pads too: fee6a51 B1.57 62+/59−
   and 6e6f3d8 B1.74 41+/40−, both tooling cards whose per-card row was wider than the table. Probed on a copy: a
   re-padded "Per card" table merged against an appended row gives merge rc 0, every per-card row twice, and
   `check-backlog.sh` rc 1 (the guard catches it, but T6 covers only the map). State the real counts for both files,
   so the lead knows how often a "fix every row" red can come.

Not reasons, for the lead (one line each if cheap):

- A pure deletion merged against an edit or append next to it brings the deleted row back with no duplicate key
  (union semantics). No card deletes a row today.
- A branch cut before B1.89 merges reads attributes from its own worktree, which has no `.gitattributes`. So its first
  `git merge origin/main` (the one that brings the file in) probably still conflicts `[unverified]`. E6's first batch
  should start from branches cut after the merge.
- `.gitattributes` joins `CONFIG_PROTECTED` but not `.github/CODEOWNERS`, and the agent adds its own label (D-19). A
  later `*.ts -diff` line would make `git diff` print "Binary files differ" and blind `check-suppressions.sh`. Whether
  it gets a human owner is the lead's call (a `.github/` change, so not this card).

Riskiest unfalsified: whether GitHub's mergeability check and its "Update branch" honour `merge=union` from the
tree. Nothing offline answers it (only git 2.39.5 here, whose bare repo ignores the attribute). The plan marks it
`[unverified]` and measures it in the first E6 batch, which is right. The ruleset's up-to-date requirement
(`git-workflow.md:43`) keeps a stale union result from reaching `main` unchecked either way.

## Plan review (round 2)

SCOPE: tooling (`.gitattributes`, `scripts/ci/`, `scripts/`; no `src/`, no section)

Round 1's reasons, checked against `406197a` and the round-2 prototype:

- **1, resolved.**
  - (a) Both errors now end "Keep the copy origin/main has, plus this branch's own change to that row if it made one;
    delete the rest". The prototype guards carry this text verbatim, and a comment says why the merging branch's copy
    comes first.
  - (b) T4 is in Loop 9's direction. `t4a` appends on the card side, `t4b` makes the closing edit, and `merge_sides`
    merges b into a. T4 asserts the text "… has 2 rows: a union merge kept both sides of an edit. Keep the copy
    origin/main has".
  - (c) Costs name who fixes it: a map row goes to `code-writer`, a metrics row to `dev-lead`. The path guards match:
    `code-writer.md:11` lists `spec/features-map.md` and `docs/metrics.md`; `dev-lead.md:11` lists `docs/metrics.md`.
- **2, resolved.** The map count is now "3 of 17 since B2.1 (315b97e, 9bb37ab, 8d61eda)" and the metrics count
  "twice (fee6a51, 6e6f3d8)". T7 is new and probes the re-padded "Per card" table.
- The notes were taken up: deletion resurrection is in the "Union covers the whole file" cost. "A branch cut before
  this merges still conflicts" is stated as measured (rc 1).

| Check                                                                          | Result                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the card                                     | pass: Files unchanged from round 1 except the error text and T1–T9                                                                                                                                     |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass (n/a): bash only; two error lines, no flag, variable or exit code                                                                                                                                 |
| plan follows `advice.md` or states the deviation                               | pass: no advice (tier quick, no section), stated                                                                                                                                                       |
| ≤ 7 criteria, every Then measurable                                            | pass: Acceptance clauses map to T1–T9, each an exit code, a row count or an exact error substring                                                                                                      |
| verification lists exact commands with expected numbers                        | pass: reproduced on clones of `406197a` under `$TMPDIR`: smoke alone `9 of 9 probes FAILED`; with the overlay `9 probes OK`, `[check-features-map] OK`, `[check-backlog] OK: README matches the cards` |
| work breakdown: skeleton → red → green → map → review, convention subjects     | pass: unchanged (`test(scripts)` red, `chore(scripts)` green, `docs(backlog)` review)                                                                                                                  |
| `Lead approves spec` box, human-ticked only                                    | pass (n/a): no spec change; `scripts/agent/tier.sh backlog/work/B1.89/plan.md` → `high`, so the lead's `approve` is the gate; `config-change-approved` (D-19) named                                    |
| no settled D-n contradicted                                                    | pass: D-19, D-27, D-28; `.claude/` still out of scope (B1.85), the Loop 9 guard run filed as a follow-up                                                                                               |
| `next-task.sh --check B1.89`                                                   | pass: `[next-task] B1.89: no overlap with any Doing or Review card`                                                                                                                                    |

Verdict: approved (ready for the lead's gate, not approved for build)

Not reasons:

- `plan.md:86` still reads "Rounds: 1". dev-lead updates it when it records this verdict.
- `.gitattributes` in `.github/CODEOWNERS` remains the lead's call (round 1 note).

Riskiest unfalsified: GitHub's mergeability check and "Update branch" with `merge=union`. It is still
`[unverified]` (git 2.39.5 only here). The plan measures it in the first E6 batch, and the up-to-date ruleset keeps an
unchecked union result off `main`.

## Diff review (round 1)

SCOPE: tooling (`.gitattributes`, `scripts/ci/`, `scripts/`; no `src/`, `prisma/`, `e2e/`). Range `2f1ff88..ac3db84`
(red `0a89057`, green `ac3db84`).

### Command results (last line each)

| Command                                      | Result                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                  | `All matched files use Prettier code style!`                                                                                                                                                                                                                                                                         |
| `pnpm typecheck`                             | `tsc --noEmit`, no error                                                                                                                                                                                                                                                                                             |
| `pnpm test`                                  | `Tests  241 passed (241)`                                                                                                                                                                                                                                                                                            |
| `pnpm test:e2e`                              | `1 passed (34.3s)` then `ELIFECYCLE Command failed with exit code 1`. Every other spec fails in `beforeEach`: "The table `wt_chore_b1_89_union_merge.todos` does not exist". This worktree's schema was never migrated; the diff touches no `src/`, `prisma/` or `e2e/`. Not a finding: CI's e2e job is the evidence |
| `pnpm test:mutation`                         | `Final mutation score of 92.62 is greater than or equal to break threshold 70`                                                                                                                                                                                                                                       |
| `check-suppressions.sh`                      | `[check-suppressions] OK: no new suppressions`                                                                                                                                                                                                                                                                       |
| `check-config-change.sh`                     | unlabeled rc 1 (`.gitattributes`, both guards, `lib.sh`); with `CONFIG_CHANGE_APPROVED=true` rc 0, "allowed by label config-change-approved". PR #253 carries the label                                                                                                                                              |
| `check-feat-commits.sh`                      | `[check-feat-commits] OK: no feat commit touches tests`                                                                                                                                                                                                                                                              |
| `check-ac-coverage.sh`                       | `[check-ac-coverage] OK: every criterion of a shipped section has a test`                                                                                                                                                                                                                                            |
| `check-spec-sections.sh`                     | `[check-spec-sections] OK: sections cited: 1 … 28`                                                                                                                                                                                                                                                                   |
| `check-features-map.sh`                      | `[check-features-map] OK`                                                                                                                                                                                                                                                                                            |
| `check-backlog.sh`                           | `[check-backlog] OK: README matches the cards`                                                                                                                                                                                                                                                                       |
| `check-plan-scope.sh`                        | `[check-plan-scope] OK: chore/B1.89-union-merge stays inside the approved plan of B1.89`                                                                                                                                                                                                                             |
| `verify-red.sh B1.89`                        | `::error::no 'test(<pkg>): B1.89 … (red)' commit`. This is expected: smoke-only red without the marker, as B1.82 and B1.88. `--auto` (CI) prints `nothing to verify`, rc 0                                                                                                                                           |
| `table-merge-smoke.sh` (`/bin/bash`, clones) | at `0a89057`: `9 of 9 probes FAILED`; at `ac3db84`: `9 probes OK`                                                                                                                                                                                                                                                    |
| `tier-smoke.sh`                              | `9 probes OK`                                                                                                                                                                                                                                                                                                        |
| `git diff --stat origin/main...HEAD`         | 9 files, +427 −5: `.gitattributes`, `lib.sh`, both guards, `table-merge-smoke.sh`, `scripts/CLAUDE.md`, `work/B1.89/{plan,pr-body,review}.md`                                                                                                                                                                        |

### Checklist

- Every acceptance clause has a probe whose assertion matches it: pass. T1/T2 cover clean appends, each row kept once.
  T3–T7 cover a named duplicate. T8 checks `CONFIG_PROTECTED` and T9 checks `check-attr`. GitHub mergeability is stated
  `[unverified]` in the plan. The one gap is finding 2.
- No test weakened after red: pass. `git log --first-parent --no-merges 0a89057..HEAD -- '*.test.*' e2e/
scripts/table-merge-smoke.sh` is empty, and the range has no merges.
- Every changed file is in `plan.md`: pass (`check-plan-scope.sh` OK, and the stat above matches the Files table).
- Interfaces match the plan: pass. Both error lines carry the keep rule worded as in plan round 2, with no new flag,
  variable or exit code.
- Zod, Prisma, raw SQL, migration: n/a (no TypeScript).
- No secret, no suppression: pass.
- Features map: n/a (tooling, no §).
- Would a test fail if one changed line were reverted? Mutants on clones:

  | Mutant                                     | Result                      |
  | ------------------------------------------ | --------------------------- |
  | metrics line dropped from `.gitattributes` | 5 FAIL (T2 T4 T5 T7 T9)     |
  | map duplicate threshold `> 1` → `> 9`      | 2 FAIL (T3 T6)              |
  | metrics duplicate `== 2` → `== 3`          | 3 FAIL (T4 T5 T7)           |
  | `\.gitattributes\|` removed from `lib.sh`  | 1 FAIL (T8)                 |
  | keep rule removed from the map's error     | **9 probes OK** (finding 2) |

### Findings

```
[1] KIND: correctness
    WHERE: scripts/table-merge-smoke.sh:18
    DEFECT: when mktemp fails, TMP becomes the directory the smoke runs from, and the EXIT trap `rm -rf -- "$TMP"`
            deletes it.
    TRIGGER: mktemp -d exits 1 with empty output (GNU mktemp in the dev container or runner with TMPDIR pointing at a
             removed or unwritable directory; a full disk). Probed on a throwaway clone with a PATH shim
             `mktemp` that prints to stderr and exits 1, run as `/bin/bash scripts/table-merge-smoke.sh` from the
             clone's root.
    WRONG BEHAVIOUR: `cd ""` succeeds in bash 3.2, so `TMP="$(cd "$(mktemp -d)" && pwd -P)"` is the cwd. The smoke
            builds its repo in `<cwd>/repo`, prints "9 probes OK", and on exit removes the whole checkout it was run
            from: `ls` of the clone afterwards gives "No such file or directory". The header promises "writes only
            under its own mktemp -d". B1.88 round 1 traced the same idiom (`cd /usr; x="$(cd "$(false)" && pwd -P)"`
            → `rc=0 x=[/usr]`) and fixed it in `run.sh`; this file adds a new copy of it.
    FIX (for code-writer): check mktemp's status and a non-empty, existing directory before resolving it; check the
            resolve's own status; exit 2 otherwise, before the trap is set. The other smokes with the same line
            (`run-smoke.sh:19` with the same trap; eight without one) predate this card: a follow-up card (D-25).
    CONFIDENCE: confirmed (I ran it)

[2] KIND: coverage
    WHERE: scripts/ci/check-features-map.sh:17 (error text); scripts/table-merge-smoke.sh T3 asserts only
           "<F> has 2 rows"
    DEFECT: no probe pins the keep rule in the features-map error; only the metrics error's rule is pinned (T4).
    TRIGGER: delete " Keep the copy origin/main has, plus this branch's own change to that row if it made one; delete
             the rest" from check-features-map.sh on a clone, then run the smoke.
    WRONG BEHAVIOUR: "9 probes OK". The map error can lose the rule that stops a fixer from keeping the stale ✗ copy
            (plan "Which copy to keep"), and nothing fails.
    FIX: T3 (or T6) asserts the same substring T4 does. That is an added assertion, so it lands as
         `test(scripts): B1.89 review pass 1 -- …`.
    CONFIDENCE: confirmed (I ran the mutant)
```

Verdict: back to code-writer

Riskiest unfalsified: whether GitHub's mergeability check and "Update branch" honour `merge=union` (git 2.39.5 only
here). The plan marks it `[unverified]` for the first E6 batch. Next after that: the smoke uses the caller's global git
config (only `user.*`, `commit.gpgsign` and `core.hooksPath` are pinned), so a global `merge.*` or
`core.attributesFile` setting could change T1–T9. I did not falsify that.

## Diff review (round 2)

SCOPE: tooling. Range `ac3db84..4cee58f`: one commit, `test(scripts): B1.89 review pass 1 -- checked mktemp, keep rule
in T3`, which touches only `scripts/table-merge-smoke.sh` (+12 −5).

### Command results (last line each)

| Command                                      | Result                                                                                                                                       |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                  | `All matched files use Prettier code style!`                                                                                                 |
| `pnpm typecheck`                             | rc 0                                                                                                                                         |
| `pnpm test`                                  | `Tests  241 passed (241)`                                                                                                                    |
| `pnpm test:e2e`, `pnpm test:mutation`        | not re-run: round 2 changes one smoke script, no `src/`, `prisma/`, `e2e/`. Round 1 gave mutation 92.62; e2e is CI's evidence (round 1 note) |
| `check-suppressions.sh`                      | `[check-suppressions] OK: no new suppressions`                                                                                               |
| `check-feat-commits.sh`                      | `[check-feat-commits] OK: no feat commit touches tests`                                                                                      |
| `check-features-map.sh` / `check-backlog.sh` | `[check-features-map] OK` / `[check-backlog] OK: README matches the cards`                                                                   |
| `check-plan-scope.sh`                        | `[check-plan-scope] OK: chore/B1.89-union-merge stays inside the approved plan of B1.89`                                                     |
| `table-merge-smoke.sh` (clone of `4cee58f`)  | `9 probes OK`                                                                                                                                |

### Round 1 findings, rechecked

- **[1] resolved.** Probed on a clone of `4cee58f` with three PATH shims for `mktemp`. Each run printed
  `table-merge-smoke: mktemp -d failed` and exited 2; the checkout (22 entries) and the named directory (22 entries)
  were both intact, and no `table-merge-smoke.*` directory was left behind.
  - `exit 1`
  - `exit 0` with empty output
  - prints an existing directory: refused by the `table-merge-smoke.?*` basename check
- **[2] resolved.** The round 1 mutant (keep rule removed from the map's error) now gives
  `FAIL T3 a features-map row edited on both sides is named with which copy to keep` and `1 of 9 probes FAILED`.
- The round 1 "riskiest" second item is addressed: the merges and T9's `check-attr` now run with
  `GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1`.

### Checklist

- No test weakened: pass. `git log --first-parent --no-merges 0a89057..HEAD -- '*.test.*' e2e/
scripts/table-merge-smoke.sh` lists only `4cee58f`, a `test(scripts)` review-pass commit that strengthens T3 and
  removes no assertion.
- Every changed file is in the plan: pass.
- No secret, no suppression: pass.

### Findings

None blocking.

Not a finding: `GIT_CONFIG_GLOBAL=/dev/null` does not cover git's default per-user attributes file
(`$XDG_CONFIG_HOME/git/attributes`, else `~/.config/git/attributes`). git reads that file without any config entry
naming it. A host that sets `merge=` there for `*.md` could still change T1–T7 `[unverified]`. One line in the smoke
(`-c core.attributesFile=/dev/null` in `G`) would close it. I leave it to dev-lead whether that is worth a commit.

Verdict: ready for PR

Riskiest unfalsified: whether GitHub's mergeability check and "Update branch" honour `merge=union` (git 2.39.5 only
here). It is `[unverified]` in the plan and measured in the first E6 batch; the up-to-date ruleset keeps an unchecked
union result off `main`.
