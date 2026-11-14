# B1.97 plan — a row wider than its column no longer re-pads the shared tables (tooling, no §)

Approach: the card's first way. `.prettierignore` names the three union-merged files, so `format-after-edit.sh`,
Lefthook's `prettier --check` and `pnpm lint` leave them as written; a new row is appended unaligned and no other row
moves. The second way (fixed wide columns + a width guard) needs a new `scripts/ci/` guard and a one-time rewrite of
every row of three tables, itself a re-pad against every open branch. Measured on a scratch copy of `origin/main`
d106fe9 (prettier 3, git 2.39): a wide row formatted as the hook does → union keeps rows twice (map F1…, metrics
B5.6 …, index §5 …); with the three paths ignored → clean merge, each row once, guards OK.

Costs, for the lead to accept:

- **No formatter on these three files.** The existing rows stay aligned (no rewrite now, so no re-pad lands on open
  branches); new rows are unaligned in the raw Markdown, and render the same. A hand re-pad is still possible and
  still caught by T6, T7, T12 (in CI only after the push, B1.92's gap).
- **The smoke now needs `node_modules`** (it runs `node_modules/.bin/prettier` as the hook does). B1.94's CI step
  must run after `pnpm install`; every CI job already does.

No advice (tier quick, no section). Risk tier **high** (`.prettierignore` is CONFIG_PROTECTED), so the lead's
`approve` is needed and the PR carries `config-change-approved` (D-19). `dev-lead` writes `scripts/` (as B1.89, B1.96).

## Files

| File                           | Change                                                                                   | Why        |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ---------- |
| `.prettierignore`              | the three union-merged paths, with a comment naming B1.97 and the append-only rule       | Acceptance |
| `scripts/table-merge-smoke.sh` | T13–T15 below; header lists them                                                         | Test line  |
| `scripts/CLAUDE.md`            | the smoke's row says T1–T15 and needs `node_modules`; one line under the table: the rule | Acceptance |
| `backlog/work/B1.97/*`         | plan, review, pr-body                                                                    | pipeline   |

## Interfaces touched

No flag, variable, exit code or error line. Smoke: `fmt <file>` runs `$ROOT/node_modules/.bin/prettier --write` from
the scratch repo's top level (exit 2 if the binary is missing); `wide_once <file> <key-a> <key-b>` = `kept_once` and
side a's own commit (`a^1`) changes exactly `1 0` lines of the file (`git diff --numstat main a^1`).

- **T13** map: side a appends `F905` with a 180-char Feature cell, then `fmt`; side b appends `f_row F906`.
- **T14** metrics: side a appends `B9.905` with a 180-char § cell, then `fmt`; side b appends `c_row B9.906`.
- **T15** index: side a adds contract 905 with a 180-char Contents cell, then `fmt`; side b `add_section 906`.

Each: clean merge, both rows once, the file's guard OK, side a's diff one added line.

## Verification

All with `/bin/bash` (3.2).

- **Red** `test(scripts): B1.97 table-merge-smoke probes a row wider than its column` — "Red because Prettier
  re-pads the table, so union keeps every row twice": expected "3 of 15 probes FAILED" (T13–T15), T1–T12 ok.
- **Green** `chore(scripts): B1.97 the shared tables leave Prettier` → "15 probes OK".
- `pnpm lint && pnpm typecheck` clean; every `scripts/ci/check-*.sh` OK; `hook-smoke.sh`, `tier-smoke.sh` OK;
  `check-plan-scope.sh` OK; CI green.

## Work breakdown

| Step | Role     | Produces            | Commit                                                                      |
| ---- | -------- | ------------------- | --------------------------------------------------------------------------- |
| 1    | dev-lead | red probes T13–T15  | `test(scripts): B1.97 table-merge-smoke probes a row wider than its column` |
| 2    | dev-lead | ignore entries, doc | `chore(scripts): B1.97 the shared tables leave Prettier`                    |
| 3    | reviewer | diff review         | `docs(backlog): B1.97 review pass N`                                        |

Not in scope: B1.95's files (`scripts/agent/run*.sh`, `.devcontainer/runner/`), `.claude/`, a CI job for the smoke
(B1.94), Loop 9's post-merge guards (B1.92), re-aligning or un-aligning existing rows.

Plan review: pending · Plan approved by: · Rounds: 1
