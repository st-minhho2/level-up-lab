# B1.19 review

## Plan review (round 1)

SCOPE: none of lib | actions | ui. The plan touches `scripts/`, `package.json`, `lefthook.yml`, `.claude/docs/` and
`backlog/`. It has no `src/`, `prisma/` or `e2e/` path, so there is no section, no map row and no Stryker run. The
checklist is adapted the same way as for B1.12–B1.18.

I reviewed the plan at `6a25666` (branch at `5beeadf`) and the card at `bc9234a`. All runs were read-only or used a
throwaway repo in the session scratchpad. That repo had a main checkout M, worktrees X and W, and a copy of this
worktree's `lefthook-darwin-arm64@2.2.2` binary:

- **E1.** I ran `X/bin/lefthook install` from X, then `M/bin/lefthook install` from X's cwd. The shared hook embedded
  the path of **the binary invoked** each time: first X's, then M's. A symlink was embedded unresolved (`…/link`). The
  cwd does not choose the path. In the real hook the `.bin` shim spawns the resolved `.pnpm/lefthook-darwin-arm64@2.2.2/…`
  binary, so that is the path that gets embedded.
- **E2.** X's `lefthook.yml` had `assert_lefthook_installed: true` and M's did not. Install from X gave a template whose
  else-branch ends in `exit 1` ("ERROR: Operation is aborted due to lefthook settings."). Install from **M's cwd** with
  M's binary gave the template without it. The template flag comes from the `lefthook.yml` of the directory `install`
  runs in.
- **E3.** The hook was installed from M (no assert). A commit from X (assert config) printed `sync hooks: ✔️(pre-commit)`
  and rewrote the shared hook: `exit 1` is now present and the embedded path is still M's. On every `run`, lefthook
  re-installs the shared hooks whenever the committing worktree's config checksum differs from `.git/info/lefthook.checksum`
  in the common dir.
- **E4.** After `install` from M and from X, `git status --short` was empty in both. No tracked file was written. The
  checksum lives in the common `.git/info/`.
- **E5.** `lefthook install` outside a git repo exits 128 today (`fatal: not a git repository`). So does
  `git worktree list`.
- **E6.** In a copy of `package.json` with no `node_modules`, `pnpm exec tsc --version` and
  `pnpm exec prettier --version` both exit 254 with `Command "tsc" not found` / `Command "prettier" not found`.
- **Live state.** The main checkout is at `25fee24`, behind `origin/main` (`cecf745`). Both `.claude/worktrees/*` have
  `node_modules`. `command -v lefthook` is empty. `scripts/hook-smoke.sh` printed `hook-smoke: 284 probes OK`, and
  `scripts/ci/check-plan-scope.sh` passed (OK, paperwork only).
- **CI and the devcontainer.** `prepare` runs in both: `.github/actions/setup` and `scripts/setup-env.sh` call
  `pnpm install`. In CI there is one worktree, so main = current, and safe.directory is set first. CI never commits, so
  `assert_lefthook_installed` cannot change any CI result. A fresh-clone `pnpm install` is unaffected for the same
  reason: the flag only changes the commit-time branch that runs when no binary is found. In the devcontainer the repo
  root is the main checkout (`/workspace`), so the script embeds `/workspace/node_modules/…` into the host-shared
  `.git/hooks`. The current `lefthook install` does the same today, so this is not a regression and not a reason here.

### Checklist

| Check                                                                | Result                                                                                                                                                      |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the section's features (map)                   | pass: no section. Every file traces to the card's Acceptance (shared hook path, loud failure) or to the docs that describe it.                              |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | pass: n/a (bash, YAML, `package.json`). The interface block gives exits and the warning. The no-git exit is missing ([5]).                                  |
| follows `advice.md` or states the deviation                          | pass: the advisor was skipped (Tier quick, no section), and the plan says so.                                                                               |
| ≤ 7 criteria, every Then measurable                                  | fail: five probes, all measurable, but G2's marker job cannot see [3], and G4's red prediction depends on an unstated fixture layout ([4]).                 |
| verification lists exact commands with expected numbers              | fail: the `grep -c … ≥ 1` check passes while the loud failure is absent from the real hook ([1]). Nothing checks the `exit 1` branch in the installed hook. |
| work breakdown skeleton → red → green → map → review                 | pass, with a note: skeleton and map are n/a for a script card, as in B1.17/B1.18.                                                                           |
| `Lead approves spec` box                                             | pass: n/a, no section.                                                                                                                                      |
| no settled D-n contradicted                                          | pass: no D-n rules on Lefthook or `prepare`. D-7 is untouched.                                                                                              |
| the approach holds in every real layout                              | fail: [1] [2] [3]                                                                                                                                           |

### Reasons (changes requested)

1. **Running `install` from the main checkout bakes the main checkout's `lefthook.yml` into the shared hooks, not this
   branch's.** Confirmed (E2). The main checkout is stale in practice (`25fee24`, behind `origin/main`). Until a
   person pulls it to a post-merge commit, every `pnpm install` via `scripts/worktree.sh`, including this plan's own
   verification step, writes a template **without** `exit 1`. Embedding does not need the main checkout's cwd: it
   follows the invoked binary's path (E1). Recommended fix: run `<main>/node_modules/.bin/lefthook install` with
   cwd = the current checkout. Then add a check to Verification, for example
   `grep -c 'Operation is aborted' "$(git rev-parse --git-common-dir)/hooks/pre-commit"` → 1. If the plan keeps
   the main checkout's cwd, it must state the cost, and the post-merge step must say "pull main in the main checkout,
   then `pnpm install`".
2. **The loud failure is last-writer-wins across worktrees.** Confirmed (E3). Any commit from a worktree whose
   `lefthook.yml` lacks the flag re-syncs the shared hook without `exit 1`. That covers every branch cut before this
   merges; today that is both `.claude/worktrees/*` checkouts (`25fee24`, `cecf745`). After that, a missing binary
   exits 0 again, which is the card's red state. The plan claims "a commit with no reachable lefthook stops". It must
   state this residual and say how it closes: merge main into open branches after this lands. `no_auto_install: true`
   is not a free fix, because it stops new hook types from installing themselves.
3. **Worktrees without `node_modules` can no longer commit at all, and the reason given is wrong.** Confirmed by
   tracing E1 and E6. With M's binary embedded, a commit from such a worktree (the card's G2 case, and the app
   sessions under `.claude/worktrees/`) now runs the real jobs. `tsc` always runs, and `prettier` runs for any staged
   `.md`. Both fail with `Command "tsc" not found` (exit 254), so every commit is refused. Previously the commit
   passed silently. Refusing is consistent with the card, but the lead must approve it knowingly. The card asks for
   "refused with the reason", and the reason printed is not "run `pnpm install` in this worktree". G2 uses a marker
   job, so it cannot show this. The plan should state it, and should either add a first job or check that prints that
   reason (a `lefthook.yml` change already in scope) with a probe, or document it in `hooks.md`.
4. **The smoke fixture is not specified enough to be deterministic or portable.** Plausible.
   - `node_modules/.bin/lefthook` is a relative `sh` shim and cannot be copied. The plan should name how the real
     binary is found on darwin-arm64 and linux-x64/arm64, for example
     `node -p "require(require.resolve('lefthook/get-exe', {paths:[root]})).getExePath()"`.
   - A `lefthook` on PATH (brew, mise, `go tool`, or `pnpm lefthook`, all in the template's fallback chain) would
     change G2–G4 per machine. The smoke must pin PATH.
   - The red prediction "G4 ok" holds only if M's copied binary sits at one of the template's `$dir` fallback paths:
     in the red state the hook embeds X's pruned path. State where the fixture puts it.
5. **Smaller gaps; fix them in the same round.**
   - `install-hooks.sh` has no stated behaviour when `git` fails (no repo, or dubious ownership). Today's exit is 128
     and `pnpm install` fails (E5). Keep parity and say so.
   - `scripts/worktree.sh:93` runs `pnpm install --silent`, which hides the fallback "warning: …". Say where it is
     seen.
   - `.claude/docs/hooks.md` is also a CI-protected path. The `config-change-approved` label covers it too; list it.
   - The plan is 57 lines against the ≈ 40-line limit.

Verdict: changes requested

Riskiest unfalsified: auto-sync can re-embed a non-main binary. If `git commit` runs with a worktree's
`node_modules/.bin` on PATH (inside a `pnpm run` script), the template finds `lefthook` on PATH before the embedded
path. A checksum mismatch then re-embeds that worktree's `.pnpm` path, and the path dies with the worktree. I did not
probe this.
