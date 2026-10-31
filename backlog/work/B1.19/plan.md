# B1.19 plan — Git hooks run in every worktree, or the commit stops (tooling, Tier quick)

Approach: two changes, no new dependency (lefthook 2.2.2 is already a devDependency). spec-analyst/advisor skipped.

- **Stable path.** The shared `.git/hooks/*` embed the absolute path of the lefthook binary that ran `install`.
  `prepare` becomes `scripts/install-hooks.sh`: it runs `install` with the **main checkout's** binary
  (`<first git worktree>/node_modules/.bin/lefthook`, run from the main checkout), so the embedded path survives
  every prune; the main checkout has no lefthook → falls back to this checkout's binary and warns that the path
  dies with it. No tracked file of the main checkout is written (`.git/hooks` is shared git metadata).
- **Loud failure.** `assert_lefthook_installed: true` in `lefthook.yml`: lefthook's own hook template then exits 1
  ("Can't find lefthook in PATH") instead of 0, so a commit with no reachable lefthook stops.
- Reproduced while planning: `scripts/worktree.sh fix/B1.19-…` rewrote the shared hook to this worktree's path; once
  pruned, a worktree without `node_modules` commits with no hook.

## Files

| File                           | Change                                                               |
| ------------------------------ | -------------------------------------------------------------------- |
| `scripts/install-hooks.sh`     | new: `lefthook install` with the main checkout's binary              |
| `package.json`                 | `"prepare": "scripts/install-hooks.sh"`                              |
| `lefthook.yml`                 | `assert_lefthook_installed: true`                                    |
| `scripts/githooks-smoke.sh`    | new: G1–G5 on a throwaway repo with worktrees                        |
| `.claude/docs/hooks.md`        | "Git hooks" paragraph: where the binary comes from, the loud failure |
| `scripts/CLAUDE.md`            | rows for the two scripts                                             |
| `backlog/work/B1.19/plan.md`   | plan                                                                 |
| `backlog/work/B1.19/review.md` | reviews                                                              |

## Interfaces touched

```bash
scripts/install-hooks.sh      # exit 0 (installed with <path>) · prints "warning: …" on the fallback · exit 1 only if no lefthook at all
scripts/githooks-smoke.sh     # G1–G5, exit 1 on any FAIL; copies this repo's lefthook binary into a throwaway repo, no network
```

```yaml
assert_lefthook_installed: true # lefthook.yml, top level
```

Probes (fixture: main checkout M with a copied binary, worktrees X with its own copy and W without
`node_modules`; config = the repo's `assert_lefthook_installed` value + one job that touches a marker): G1 `prepare` run
in X → the shared hook names M's binary, not X's; G2 X's `node_modules` removed, commit from W → the hook ran;
G3 M's binary removed too, commit from W → the commit fails and says "Can't find lefthook"; G4 binary restored, commit
from M → ran; G5 `install-hooks.sh` with no main binary → falls back to X's, prints the warning.

## Verification (in the card worktree)

```bash
scripts/githooks-smoke.sh   # test commit (no install-hooks.sh, no assert): G1 G2 G3 G5 FAIL, G4 ok; green 5 of 5
pnpm install --frozen-lockfile && grep -c "$(git worktree list | head -1 | cut -d' ' -f1)/node_modules" "$(git rev-parse --git-common-dir)/hooks/pre-commit"   # ≥ 1
scripts/hook-smoke.sh && scripts/ci/check-plan-scope.sh && bash -n scripts/*.sh
```

Steps: `test(scripts)` smoke → `fix(scripts)` → `reviewer` diff → PR (`config-change-approved`: `lefthook.yml`;
`package.json` is a configuration change the lead approves here). After merge the lead runs `pnpm install` once in
the main checkout so the shared hooks name its binary. Orchestrating session edits `scripts/`, as B1.12–B1.18.

Plan review: <pending> · Plan approved by: <empty until the lead approves> · Rounds: 1
