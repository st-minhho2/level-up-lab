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
