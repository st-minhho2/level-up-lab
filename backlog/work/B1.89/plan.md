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
- **Which copy to keep (review r1):** in Loop 9's direction the card's stale copy comes first, and keeping it undoes
  the sibling's closing edit (sha, `✗`/`✅`) unseen. Both errors end "Keep the copy origin/main has, plus this branch's
  own change to that row if it made one; delete the rest" (T4 pins it). On a runner PR the run fixes it at Loop 9's
  red CI: a map row → `code-writer` (its write path), a metrics row → `dev-lead`; then review, as for a conflict.
- **Union covers the whole file**: prose edited on both sides near each other is kept twice, and a row deleted on one
  side against an edit or append next to it comes back; no guard reads either.
- **Prettier re-pads a table** when a new cell is wider than its column: 3 of 17 map appends since B2.1 (315b97e,
  9bb37ab, 8d61eda), metrics twice (fee6a51, 6e6f3d8). Against a sibling's append every row comes twice (T6, T7: caught).
- **A branch cut before this merges** still conflicts at its first `git merge origin/main` (measured: git 2.39.5 reads
  the attributes of the checkout doing the merge, not of the tree merged in); its next merge is clean.
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
| `scripts/ci/check-features-map.sh` | `::error::F<n> has <k> rows in spec/features-map.md: …` + keep rule, an id in > 1 row | Acceptance |
| `scripts/ci/check-backlog.sh`      | `::error::docs/metrics.md: <key> has <k> rows: …` + keep rule, per table (keys above) | Acceptance |
| `scripts/table-merge-smoke.sh`     | new: probes T1–T9 below                                                               | Test line  |
| `scripts/CLAUDE.md`                | row for the smoke; the two guards' rows name the duplicate check                      | index      |
| `backlog/work/B1.89/*`             | plan, review, pr-body                                                                 | pipeline   |

## Interfaces touched

No flag, variable or exit code. Two new error lines (above). `table-merge-smoke.sh`: copies this checkout's tracked files
(on disk) plus `.gitattributes` into a `mktemp -d` repo, two branches per probe, `git merge`, then the guard:
T1/T2 map/metrics appends on both sides → clean, each row once, guard OK · T3 a map row edited on both sides · T4 the
card appends, then merges main holding a sibling's closing edit of the row above (Loop 9's direction); the error
carries the keep rule · T5 a metrics top-table row edited on both sides · T6/T7 a re-padded map / "Per card" table
against an append → clean merge, guard exits 1 naming the row · T8 `.gitattributes` =~ `CONFIG_PROTECTED` · T9
`git check-attr merge`: union, union, unspecified (technical-requirements). A side that changes nothing fails.

## Verification

`table-merge-smoke.sh` joins no CI job (a CI change): run locally with `/bin/bash` (3.2) at each step and in review.

- Red `test(scripts): B1.89 table-merge-smoke probes the shared tables' merge` (body "Red because no .gitattributes:
  T1–T7 conflict, T8 T9 absent"): "9 of 9 probes FAILED". Prototype round 2 on 2f1ff88: holds.
- Green `chore(scripts): B1.89 union merge for the append-only tables`: "9 probes OK" (prototype: holds); the guards
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
