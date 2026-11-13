# B1.89 plan — parallel card PRs merge the rows they append to the shared tables (tooling, no §)

Approach: a `.gitattributes` gives `merge=union` to `spec/features-map.md` and `docs/metrics.md`, and the two CI guards
that already read those files name a row a union merge kept twice. Measured on a scratch repo (git 2.39.5):

| Two branches from one base                                   | git's default | `merge=union`               |
| ------------------------------------------------------------ | ------------- | --------------------------- |
| each appends a row at the end of the table                   | conflict      | clean, both rows once       |
| one edits the last row (closing), the other appends after it | conflict      | clean, the edited row twice |
| one row edited differently on both sides                     | conflict      | clean, that row twice       |
| Prettier re-pads the table, the other appends                | conflict      | clean, every row twice      |

So union removes the append-against-append conflict (the E6 case: three runner PRs each appending) and turns the other
three into a named CI failure instead of a conflict marker. Keys: features-map `F<n>`; metrics a row's first cell, and
`Practice | Type | Metric` in the top table (one practice has several rows).

`spec/technical-requirements.md` is **out of scope** (the card's rule): its index rows are not append-only, the closing
commit flips the card's row `✗` → `✅` (`c22e41a`), which is the #230/#232 conflict. `docs/metrics.md`'s "Per card"
rows are edited at closing the same way (`this PR` → sha); the card names it, so it stays, and T4 shows the guard
names that case.

Costs, for the lead to accept:

- **Edit against append still costs a round trip** (#230/#232): a CI red naming the row instead of a conflict, found
  after the push, since Loop 9 runs no guard after a clean merge. Running the two guards there is a `.claude/` change
  (B1.85 holds `dev-lead.md`): a follow-up card.
- **Union covers the whole file**: prose edited on both sides near each other is kept twice and no guard reads it.
- **Prettier re-pads a table** when a new cell is wider than its column (3 of 14 map appends: B2.4, B5.3, B5.6); against
  a sibling's append that doubles every row (T6, caught).
- **GitHub's mergeability check: `[unverified]`.** A bare repo with git 2.39.5 ignores `merge=union` (measured: conflict;
  a worktree: clean), so GitHub may show a BEHIND PR as conflicting. The pipeline's merge is Loop 9's local one. First
  E6 batch measures it: a second runner PR touching the map, before its Loop 9.

No advice (tier quick, no section). Risk tier **high** (`.gitattributes`, `scripts/ci/`) → the lead's `approve`; the
PR carries `config-change-approved` (D-19). Dev-lead writes `scripts/` (interactive, as B1.88).

## Files

| File                               | Change                                                                                | Why        |
| ---------------------------------- | ------------------------------------------------------------------------------------- | ---------- |
| `.gitattributes`                   | new: `spec/features-map.md merge=union`, `docs/metrics.md merge=union`, a why comment | Acceptance |
| `scripts/ci/lib.sh`                | `CONFIG_PROTECTED` adds `\.gitattributes`                                             | Acceptance |
| `scripts/ci/check-features-map.sh` | `::error::F<n> has <k> rows in spec/features-map.md …` for an id in more than one row | Acceptance |
| `scripts/ci/check-backlog.sh`      | `::error::docs/metrics.md: <key> has <k> rows …` per table (keys above)               | Acceptance |
| `scripts/table-merge-smoke.sh`     | new: probes T1–T8 below                                                               | Test line  |
| `scripts/CLAUDE.md`                | row for the smoke; the two guards' rows name the duplicate check                      | index      |
| `backlog/work/B1.89/*`             | plan, review, pr-body                                                                 | pipeline   |

## Interfaces touched

No flag, variable or exit code. Two new error lines (above). `table-merge-smoke.sh`: copies this checkout's tracked files
(on disk) plus `.gitattributes` into a `mktemp -d` repo, two branches per probe, `git merge`, then the guard:
T1/T2 map/metrics appends on both sides → clean, each row once, guard OK · T3 a map row edited on both sides · T4 a
closing edit of the last "Per card" row against an append · T5 a metrics top-table row edited on both sides · T6 a
re-padded map against an append → clean merge, guard exits 1 naming the row · T7 `.gitattributes` =~ `CONFIG_PROTECTED`
· T8 `git check-attr merge`: union, union, unspecified (technical-requirements). A side that changes nothing fails.

## Verification

`table-merge-smoke.sh` joins no CI job (a CI change): run locally with `/bin/bash` (3.2) at each step and in review.

- Red `test(scripts): B1.89 table-merge-smoke probes the shared tables' merge` (body "Red because no .gitattributes:
  T1–T6 conflict, T7 T8 absent"): "8 of 8 probes FAILED". Prototype on 2f1ff88: holds.
- Green `chore(scripts): B1.89 union merge for the append-only tables`: "8 probes OK" (prototype: holds); the guards
  OK on the tree; `tier-smoke.sh`, `hook-smoke.sh` OK; `check-plan-scope.sh`; `pnpm lint && pnpm typecheck`; CI green.

## Work breakdown

| Step | Role     | Produces           | Commit                                                                   |
| ---- | -------- | ------------------ | ------------------------------------------------------------------------ |
| 1    | dev-lead | red smoke          | `test(scripts): B1.89 table-merge-smoke probes the shared tables' merge` |
| 2    | dev-lead | attributes, guards | `chore(scripts): B1.89 union merge for the append-only tables`           |
| 3    | reviewer | diff review        | `docs(backlog): B1.89 review pass N`                                     |
| 4    | dev-lead | draft PR, label    | —                                                                        |

Not in scope: `spec/technical-requirements.md`, `backlog/README.md`, `.claude/` (Loop 9 guard run), a CI job for the smoke.

Plan review: pending · Plan approved by: · Rounds: 1
