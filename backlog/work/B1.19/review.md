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

## Plan review (round 2)

SCOPE: all (no `src/`, `prisma/` or `e2e/` path; checklist adapted as in round 1). Plan at `65391b1`. Probes ran in a
throwaway repo (`scratchpad/b119r2b`: main checkout M, worktrees X, W, Q; copies of `lefthook-darwin-arm64@2.2.2`
in `M/bin` and `X/bin`; PATH pinned to `/usr/bin:/bin`, plus nvm's `bin` (no lefthook there) where pnpm was needed).

- **P1. Install from X with M's binary.** `M/bin/lefthook install` run from X's cwd, with X's config
  (`assert_lefthook_installed` + `no_auto_install`), exit 0. The hook names M's path twice and X's path zero times.
  `Operation is aborted` appears once. `git status` in X is empty. `no_auto_install` does not block an explicit
  `install`. Confirmed.
- **P2. The re-sync trigger.** A commit from W (old config, auto-install on) did **not** re-sync at first. Lefthook
  re-syncs only when the committing checkout's `lefthook.yml` mtime is later than the timestamp in
  `.git/info/lefthook.checksum` **and** the checksum differs. After `touch W/lefthook.yml`, a commit from W rewrote
  the hook: `exit 1` was gone and M's path was kept, because the binary that ran was M's.
- **P3. `no_auto_install` blocks the round-1 riskiest case.** I put `X/bin` first on PATH (as inside `pnpm run`),
  made X's config newer, and committed from X: 0 sync lines, M's path 2, X's 0. Control: the same in W with a config
  without `no_auto_install` re-synced and embedded W's path (M 0, W 2). Confirmed.
- **P4. `no_auto_install` also blocks repair.** After P2 removed `exit 1`, a commit from X (new config, newer mtime)
  did not re-sync, so `Operation is aborted` stayed at 0. Only another `install` restores it. Confirmed.
- **P5. `node-modules` under `parallel: true`.** Q has no `node_modules`. With the planned order (node-modules first)
  and today's `parallel: true`, all jobs ran. The output was `run pnpm install --frozen-lockfile in this checkout`
  (exit 1), then `Command "tsc" not found` (exit 254) and `Command "prettier" not found` (exit 254). The commit was
  refused (exit 1). Under `parallel`, job order has no effect. The alternative, `piped: true` with a first
  `node-modules` job (`fail_text:`) followed by `group: {parallel: true, jobs: [...]}`, passes `lefthook validate`
  ("All good") on 2.2.2. With it, the summary shows only `node-modules: run pnpm install --frozen-lockfile in this
checkout`, the group is skipped, and the commit is refused. With `node_modules` present, the group runs in parallel.
- **P6. G3 shape.** With M's binary removed: `Can't find lefthook in PATH` / `ERROR: Operation is aborted due to
lefthook settings.`, exit 1, nothing committed. Matches G3.
- **P7. CI.** `.github/` never runs `lefthook run` and never commits (only `CODEOWNERS` names lefthook). In CI,
  `prepare` runs once via `.github/actions/setup` (`pnpm install --frozen-lockfile`, safe.directory set first).
  `no_auto_install` only affects `lefthook run`, so it has **no CI effect**. `lefthook` is not in
  `onlyBuiltDependencies`, so its `postinstall.js` does not run and cannot overwrite `prepare`'s install.
- `/usr/bin/node` and `/bin/node` do not exist on this machine. The plan is 58 lines.

### Round-1 reasons

| #   | Status                                                                                                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | resolved: main's binary runs with this checkout as cwd (P1). Verification greps `Operation is aborted` → 1.                                                    |
| 2   | partly: `no_auto_install` and the gap are stated, but the gap text is inaccurate (reason 2 below).                                                             |
| 3   | resolved in intent: the `node-modules` job, with G4. The plan's claim that the reason replaces "Command not found" is wrong under `parallel: true` (reason 1). |
| 4   | resolved: `getExePath()`, PATH pinned, red state via G-probes. The pin breaks the installer (reason 3).                                                        |
| 5   | resolved: no-git exit, `--silent`, `hooks.md` label. Not resolved: length, 58 lines and not stated (reason 4).                                                 |

### Checklist

| Check                                                                | Result                                                                                                               |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the section's features (map)                   | pass: no section. Every file traces to the card's Acceptance or its docs.                                            |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | pass: n/a (bash, YAML, `package.json`). Exits, the warning and the no-git case are stated.                           |
| follows `advice.md` or states the deviation                          | pass: the advisor was skipped (Tier quick), and the plan says so.                                                    |
| ≤ 7 criteria, every Then measurable                                  | pass: G1–G6 are measurable. G3 matches P6.                                                                           |
| verification lists exact commands with expected numbers              | fail: as written, the smoke's PATH pin leaves out `node` (reason 3).                                                 |
| work breakdown skeleton → red → green → map → review                 | pass: skeleton and map are n/a for a script card. Red on the missing script follows the B1.15(b)/B1.16 precedent.    |
| `Lead approves spec` box                                             | pass: n/a, no section.                                                                                               |
| no settled D-n contradicted                                          | pass                                                                                                                 |
| the approach holds in every real layout                              | pass with costs: main binary + cwd (P1), PATH re-embed closed (P3), no CI effect (P7). The costs are in reasons 1–2. |

### Reasons (changes requested)

1. **The `node-modules` job does not replace "Command not found" under `parallel: true`.** Confirmed (P5). The plan
   says the job is "first" and reads as though today's `Command "tsc" not found` goes away. Under `parallel: true`,
   tsc and prettier still run and print it (exit 254) next to the reason. The commit is still refused, so the card's
   "refused with the reason" is met either way. The lead should pick one, and the plan should state it:
   - (a) keep `parallel: true` and say that the reason is printed together with two "Command not found" blocks; or
   - (b) use `piped: true` with `node-modules` first (`fail_text:`), then a `group: {parallel: true}` holding the
     current jobs. This validates on 2.2.2 and prints only the reason. It restructures the whole `pre-commit` block,
     not "two keys and the job", so the Files row must say so.
2. **The gap statement is incomplete, and `no_auto_install` costs are not stated.** Confirmed (P2, P4).
   - (i) An old branch's commit re-syncs only when its `lefthook.yml` is newer than the last install. Its
     `pnpm install` (old `prepare`), however, always re-installs and embeds **that branch's own** binary path. That
     is the card's original bug in full: the hook passes silently once that worktree is pruned.
   - (ii) Because of `no_auto_install`, a commit from an up-to-date checkout **never repairs** this. Only a
     `pnpm install` in an up-to-date checkout does. Every `scripts/worktree.sh` run is one, as is the lead's
     post-merge step.
   - (iii) A hook type added to `lefthook.yml` later (for example `pre-push`) is not installed until someone runs
     `pnpm install`.
   - (iv) After this change, every checkout's hooks run **main's** binary against **its own** config. A branch that
     bumps lefthook runs the old binary until main is updated.

   State (i)–(iv) in the gap paragraph and in `hooks.md`. "It closes as branches merge `origin/main`" holds only
   after that branch, or any up-to-date checkout, runs `pnpm install`.

3. **The smoke's PATH pin leaves out `node`, which `install-hooks.sh` needs.** Plausible: traced, not run, because
   the script does not exist yet. `getExePath()` runs under `node`, and neither `/usr/bin` nor `/bin` holds `node`
   here. G1 and G6 would then fail on `node: command not found`, not on behavior. Adding node's own directory brings
   back the round-1 [4] risk: `/opt/homebrew/bin` holds both `node` and brew's `lefthook`. State the pin as
   git + `/usr/bin:/bin` + a temp directory with only a `node` (and, for G4, a `pnpm`) symlink.
4. **The plan is still 58 lines against ≈ 40** (round-1 [5]). The length is neither reduced nor stated as accepted.
   The lines also run to about 120 characters. Either trim it (the Probes paragraph can go to the smoke's header)
   or state that the lead accepts the length.

Verdict: changes requested (round 2, the cap). These are wording and fixture fixes. No approach change is required.
Under the B1.13/B1.15–B1.18 precedent the lead may accept round-2 fixes without a round 3. Otherwise:
Waiting on human.

Riskiest unfalsified: the devcontainer shares the main checkout's `node_modules`, which then holds linux binaries.
On the host, `require.resolve('lefthook-darwin-arm64/…')` resolved in the main checkout throws. Unless
`install-hooks.sh` treats that throw (not only a missing file) as "no main binary", `pnpm install` fails in every
host worktree. Not probed.
