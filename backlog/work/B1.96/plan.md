# B1.96 plan — the section index merges by union, a duplicated § is named (tooling, no §)

Approach: B1.89's pattern, applied to the third shared table. `.gitattributes` gives `merge=union` to
`spec/technical-requirements.md`, and `scripts/ci/check-spec-sections.sh` names a § that has more than one index row,
with B1.89's keep rule. B1.89 measured the merge cases on git 2.39.5 (its plan's table), and they hold here:

- an append against an append merges clean, both rows once;
- a closing flip (✗ → ✅) of the last row against an append below it merges clean, but the flipped row comes back
  twice;
- a Prettier re-pad against an append brings every row back twice.

The guard turns the last two into a named CI error instead of a conflict marker. Batch 1 is the case this card is
for: #266's Loop 9 merge (9337123) conflicted on the index alone, while the map and metrics merged by union.

Costs, for the lead to accept:

- **Union covers the whole file**: the index file holds prose above and below the table (the audience line, the
  reading order). Prose edited near each other on both sides is kept twice, and no guard reads it. The prose changes
  rarely: 2 commits since §20.
- **An edit against an append still costs a round trip**: a CI red that names the §, found after the push. Loop 9 runs
  no guard after a clean merge, which is B1.92's gap; this guard joins B1.92's list when that card lands.
- **GitHub's mergeability is still `[unverified]`** (B1.89: a bare repository ignores `merge=union`). A runner PR left
  BEHIND by a sibling may still show as conflicting on GitHub, and still needs Loop 9's local merge (a rerun, as for
  #266). The gain is that this merge is clean: no `code-writer` resolution and no re-review, so a cheaper rerun.
- **A branch cut before this merges** still conflicts at its first `git merge origin/main` (B1.89 measured that git
  reads the attributes of the checkout doing the merge).

No advice (tier quick, no section). Risk tier **high** (`.gitattributes`, `scripts/ci/`), so the lead's `approve` is
needed, and the PR carries `config-change-approved` (D-19). `dev-lead` writes `scripts/` (interactive, as B1.89).

## Files

| File                                | Change                                                                                         | Why        |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- | ---------- |
| `.gitattributes`                    | `spec/technical-requirements.md merge=union`; the header comment names the index and its guard | Acceptance |
| `scripts/ci/check-spec-sections.sh` | `::error::§<n> has <k> rows in the index …` + keep rule, for a `\| §n ` key in > 1 row         | Acceptance |
| `scripts/table-merge-smoke.sh`      | T9 expects `union union union`; new T10–T12 below; header lists them                           | Test line  |
| `scripts/CLAUDE.md`                 | the smoke's row names the index; the guard's row names the duplicate check                     | Acceptance |
| `backlog/work/B1.96/*`              | plan, review, pr-body                                                                          | pipeline   |

## Interfaces touched

No flag, variable or exit code. One new error line:
`::error::§<n> has <k> rows in spec/technical-requirements.md: a union merge kept both sides of an edit. Keep the copy origin/main has, plus this branch's own change to that row if it made one; delete the rest`.
New smoke probes, reusing `merge_sides`, `put_after`, `set_last_cell`, `kept_once`, `named`, with `IX=spec/technical-requirements.md`:

- **T10**: § rows appended after the last on both sides → a clean merge, each kept once, the guard OK. The rows point
  at an existing contract.
- **T11** (Loop 9's direction): the card appends a § row, then merges main, where a sibling flipped the last row
  ✗ → ✅ → the guard names that § with the keep rule.
- **T12**: a re-padded index table against an appended row → the guard fails with "§1 has 2 rows".

## Verification

Run with `/bin/bash` (3.2) at each step and in review. The smoke joins no CI job (B1.94).

- **Red**: `test(scripts): B1.96 table-merge-smoke probes the section index merge`, body "Red because the index keeps
  git's default merge and the guard has no duplicate check". Expected: T9 and T10 fail, since T10 conflicts. T11 and
  T12 also conflict, so they fail too: "4 of 12 probes FAILED". T1–T8 stay ok.
- **Green**: `chore(scripts): B1.96 section index merges by union, duplicate § named` → "12 probes OK".
  - `check-spec-sections.sh` OK on the tree (no § has two rows today).
  - `hook-smoke.sh` and `tier-smoke.sh` OK.
  - `check-plan-scope.sh`, `pnpm lint && pnpm typecheck` clean.
  - CI green.

## Work breakdown

| Step | Role     | Produces              | Commit                                                                   |
| ---- | -------- | --------------------- | ------------------------------------------------------------------------ |
| 1    | dev-lead | red smoke probes      | `test(scripts): B1.96 table-merge-smoke probes the section index merge`  |
| 2    | dev-lead | attribute, guard, doc | `chore(scripts): B1.96 section index merges by union, duplicate § named` |
| 3    | reviewer | diff review           | `docs(backlog): B1.96 review pass N`                                     |
| 4    | dev-lead | draft PR, label       | —                                                                        |

Not in scope: Loop 9's post-merge guard run (B1.92), a CI job for the smoke (B1.94), `backlog/README.md`.

Plan review: pending · Plan approved by: · Rounds: 1
