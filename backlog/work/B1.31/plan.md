# B1.31 plan — root and src guides cite the sections their packages implement (no §)

Docs only; contract = card Acceptance. Cite per package = union of the § its guide names (heading, rows) and the §
its module headers name (leading comment of each non-test `.ts(x)`); a heading range counts only the § a row or a
header names, so `lib/` skips §8 (`06-change-requests.md`; `grep -rn '§8' src/` → none) though its heading reads §3–§22.

| Package       | Guide names                             | Module headers name                 | Cite (both tables)             |
| ------------- | --------------------------------------- | ----------------------------------- | ------------------------------ |
| `app/`        | §7                                      | §7, §12, §13, §14, §16 (`page.tsx`) | `§7, §12–§14, §16`             |
| `actions/`    | §5, §6, §7, §9, §10, §11, §14, §15, §19 | §5, §6, §9, §10, §11, §14, §15, §19 | `§5–§7, §9–§11, §14, §15, §19` |
| `lib/`        | §3–§7, §9–§22 (rows)                    | §4–§7, §9–§22                       | `§3–§7, §9–§22`                |
| `components/` | §6, §7, §10, §12–§22                    | §6, §7, §9, §10, §12–§22            | `§6, §7, §9, §10, §12–§22`     |

## Files

| File                            | Change                                                       | Why (Acceptance) |
| ------------------------------- | ------------------------------------------------------------ | ---------------- |
| `CLAUDE.md`                     | Map: Spec § of the 4 `src/` rows = Cite; prettier re-pads    | Map cites        |
| `src/CLAUDE.md`                 | package table: Spec § of the 4 rows = Cite; prettier re-pads | table cites      |
| `backlog/work/B1.31/plan.md`    | plan                                                         | —                |
| `backlog/work/B1.31/review.md`  | plan and diff reviews                                        | —                |
| `backlog/work/B1.31/pr-body.md` | PR body (Loop 5)                                             | —                |

## Interfaces touched

None. No `src/` code, no test file, no section change; spec-analyst and advisor skipped (tier quick, docs).

## Verification (card worktree)

```bash
git grep -n -e '§3–§6' -e '§3, §4, §5, §6' CLAUDE.md src/CLAUDE.md   # before (a733c7b): CLAUDE.md:65, src/CLAUDE.md:7, exit 0; after: no output, exit 1
awk -F' *[|] *' '/^[|] `src\/(app|actions|lib|components)\/`/{print FILENAME": "$2" "$4}' CLAUDE.md; awk -F' *[|] *' '/^[|] `(app|actions|lib|components)\/`/{print FILENAME": "$2" "$3}' src/CLAUDE.md
      # after: 8 lines "<file>: `<pkg>` <Cite>", order app, actions, lib, components (before: §7 · §5, §6, §7 · §3–§6 | §3, §4, §5, §6 · §7)
scripts/ci/check-spec-sections.sh; scripts/ci/check-features-map.sh   # "OK: sections cited: 1 2 … 22"; "[check-features-map] OK"
pnpm lint | tail -1; pnpm typecheck; pnpm test | grep Tests     # "All matched files use Prettier code style!"; exit 0; "Tests  202 passed (202)" (as a733c7b)
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1; scripts/ci/check-config-change.sh   # OK; OK; OK
```

## Work breakdown

| Step | Role / skill                                                    | Produces                            | Commit                                                     |
| ---- | --------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| 0    | dev-lead at the gate (Loop 5)                                   | `pr-body.md`, draft PR              | `docs(backlog): B1.31 plan approved`                       |
| 1    | orchestrating session (dev-lead's guard blocks `src/`, as #130) | both tables edited                  | `docs(src): B1.31 root and src guides cite their sections` |
| 2    | `/review-loop`: reviewer (diff), ≤ 3 passes                     | diff review in `review.md`          | `docs(backlog): B1.31 review`                              |
| 3    | `.claude/hooks/mark-reviewed.sh` (`src/CLAUDE.md` trips gate)   | Stop gate cleared (lint, tsc, test) | —                                                          |

Red/green: Test command "before" is the red; no `test(...)` commit. No protected path → no label. Out of scope (D-25
follow-up): `src/lib/CLAUDE.md` heading `§3–§22` → `§3–§7, §9–§22`; `src/components/CLAUDE.md` heading omits §6,
§9; `src/app/CLAUDE.md` heading cites §7 only; root Map `src/components/` says "client components" though `remaining-count.tsx`, `todo-search-form.tsx` are Server Components.

Plan review: pending · Plan approved by: · Rounds: 1
