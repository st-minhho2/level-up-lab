# B1.19 plan — Git hooks run in every worktree, or the commit stops (tooling, Tier quick)

Approach: no new dependency (lefthook 2.2.2 is a devDependency). spec-analyst/advisor skipped. Round 1 (5 reasons).

- **Stable path, current config.** `prepare` → `scripts/install-hooks.sh`: runs the **main checkout's** lefthook binary
  (`require('lefthook/get-exe').getExePath()` resolved in the first `git worktree list` entry) **with this checkout as
  the working directory**: the shared hooks embed the main binary's path (survives every prune) and this checkout's
  `lefthook.yml`. No main binary, or `getExePath()` throws there (the devcontainer leaves linux binaries in the main
  checkout) → this checkout's binary, warning on stderr (`worktree.sh` runs `pnpm install
--silent`, so it shows only on a plain `pnpm install`). No git → exits non-zero as `lefthook install` does today.
- **Loud failure.** `lefthook.yml`: `assert_lefthook_installed: true` (template exits 1, "Operation is aborted"),
  `no_auto_install: true` (a commit never re-syncs the hooks with whatever `lefthook` is first on PATH; only
  `prepare` installs), and a first job `node-modules` that fails with "run pnpm install --frozen-lockfile in this
  checkout" when the checkout has no `node_modules` (today's jobs would fail with "Command not found").
- **Layout (lead's call, (b) recommended):** (a) keep `parallel: true` and add the job: a checkout without
  `node_modules` also prints `Command "tsc" not found` / `"prettier" not found`; (b) `piped: true`, `node-modules` first
  with `fail_text:`, then a `group: {parallel: true}` with today's jobs (rewrites the pre-commit block; `lefthook
validate` OK in round 2): only the reason prints.
- **Stated costs:** an open branch without these keys, on `pnpm install`, re-embeds its own binary path and drops
  `exit 1`; commits from up-to-date checkouts never repair that (`no_auto_install`), only a `pnpm install` does; a hook
  type added later installs only on the next `pnpm install`; every checkout runs main's binary with its own config.
  Closes as branches merge `origin/main` (step 1c) and the main checkout reinstalls after merge. Plan is 60+ lines
  (one screen ≈ 40): the lead accepts or asks to trim.

## Files

| File                           | Change                                               |
| ------------------------------ | ---------------------------------------------------- |
| `scripts/install-hooks.sh`     | new                                                  |
| `package.json`                 | `"prepare": "scripts/install-hooks.sh"`              |
| `lefthook.yml`                 | two keys, the `node-modules` job ((a) or (b) layout) |
| `scripts/githooks-smoke.sh`    | new: G1–G6                                           |
| `.claude/docs/hooks.md`        | "Git hooks": binary, loud failure, the gap           |
| `scripts/CLAUDE.md`            | rows for the two scripts                             |
| `backlog/work/B1.19/plan.md`   | plan                                                 |
| `backlog/work/B1.19/review.md` | reviews                                              |

## Interfaces touched

```bash
scripts/install-hooks.sh     # exit 0 "installed with <binary> from <dir>" · stderr warning on the fallback · exit ≠ 0 with no git/lefthook
scripts/githooks-smoke.sh    # G1–G6; binary via getExePath() (darwin/linux), PATH pinned to a temp dir holding only git, node, pnpm links + /usr/bin:/bin, exit 1 on FAIL
```

Probes (throwaway repo: main checkout M holding a copy of the real binary, worktree X with its own copy, worktree W
without `node_modules`; config = this checkout's `lefthook.yml` keys + a job that touches a marker): G1 `prepare` in
X → the hook names M's binary and holds "Operation is aborted"; G2 X's copy removed, commit from W with a stub
`node_modules` → marker written; G3 M's binary removed too → commit fails, "Can't find lefthook"; G4 W without
`node_modules` → commit fails with the `pnpm install` message; G5 commit from M → marker; G6 no main binary →
fallback to X's, warning printed.

## Verification (in the card worktree)

```bash
scripts/githooks-smoke.sh    # test commit: FAILs recorded in its body; green 6 of 6 (bash 3.2 and 5)
pnpm install --frozen-lockfile && grep -c 'Operation is aborted' "$(git rev-parse --git-common-dir)/hooks/pre-commit"   # 1
scripts/hook-smoke.sh && scripts/ci/check-plan-scope.sh && bash -n scripts/*.sh
```

Steps: `test(scripts)` → `fix(scripts)` → `reviewer` diff → PR (`config-change-approved`: `lefthook.yml`,
`.claude/docs/hooks.md`; `package.json` approved here). After merge: the lead runs `pnpm install` once in the main
checkout. Orchestrating session edits these files, as B1.12–B1.18.

Plan review: changes requested, round 2 (cap); round-1 and round-2 reasons applied above, not re-reviewed · Plan approved by: lead (session reply "approve (b), chấp nhận độ dài"), 2026-10-31 ·
Rounds: 1
