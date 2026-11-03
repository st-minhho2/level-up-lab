# B1.76 advice: the PR wrapper keeps the runner container's git credential

Tooling, no section. Read: the card (`backlog/plan/E1-todos.md` "### B1.76"), `scripts/pr-step.sh`, `scripts/pr-step-smoke.sh`, `.claude/hooks/guard-bash.sh` (rule 5), `scripts/agent/sandbox-probe.sh` (S11), `scripts/agent/run.sh`, `.devcontainer/runner/Dockerfile` and `docker-compose.yml`, `scripts/ci/lib.sh` (`CONFIG_PROTECTED`), `scripts/agent/tier.sh`, `backlog/work/B1.65/live.md` (run 4), `backlog/work/B1.23/{plan,review}.md`. Reference implementation: B1.69 (identity) and B1.62 (S8–S10: red on the host and in the old image).

## What I measured

Scratch repos under the session scratchpad, plus the lead's running `level-up-lab-runner-runner-1` container used for reads, `git push --dry-run` and `git credential fill` with stdout discarded. Nothing was pushed. One side effect: a `git fetch origin` in the container clone moved its `origin/main` to adeafe9.

| Fact                                                                                                                                                                                                                                                                             | Evidence                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| In the container the credential helper (`!/usr/bin/gh auth git-credential`, from `gh auth setup-git`) and B1.69's identity both sit in `/home/node/.level-up-lab/gitconfig` (node 644). `~/.gitconfig` and `/etc/gitconfig` do not exist; `/etc` is root-owned.                  | `docker exec` reads                                                                                                |
| Run 4's failure reproduces with a harmless probe: wrapper environment (`GIT_CONFIG_GLOBAL` cleared), `git push --dry-run origin HEAD:refs/heads/zz-probe-dryrun`.                                                                                                                | `fatal: could not read Username for 'https://github.com': terminal prompts disabled`; `git credential fill` rc 128 |
| The same push with the volume file standing in for system scope (`GIT_CONFIG_SYSTEM=<volume file>`) or with `-c credential.https://github.com.helper=!gh auth git-credential` succeeds (`* [new branch] HEAD -> zz-probe-dryrun`); `git credential fill` rc 0.                   | container, three runs                                                                                              |
| `origin` is public: `git ls-remote origin HEAD` succeeds with no credential at all. It proves nothing here; a push (or `push --dry-run`, or `credential fill`) is the only honest probe.                                                                                         | container: anonymous `ls-remote` answered                                                                          |
| `gh` needs `~/.config/gh/hosts.yml` (the `runner-gh` mount). The container sets no `GH_CONFIG_DIR`, `XDG_CONFIG_HOME`, `GH_TOKEN` or `GITHUB_TOKEN`; the wrapper unsets only `GH_REPO`, `GH_HOST` and `GIT_*`. `gh auth status` and `gh issue view` work with all of them unset. | container reads                                                                                                    |
| `git config --global --get user.name` does **not** follow `[include]` (rc 1); `--includes` does, and so does a plain `git config --get` and `git commit`. `git config --global <k> <v>` writes the home file, never the included one.                                            | scratch repo, git 2.39.5 (the container's version)                                                                 |
| With `GIT_CONFIG_GLOBAL` set, `~/.gitconfig` is not read at all (an include in it is invisible to the session).                                                                                                                                                                  | scratch repo                                                                                                       |
| `pr-step.sh:13` and `:14` overlap: the loop on `:14` already unsets `GIT_CONFIG_GLOBAL`, so deleting only the explicit word on `:13` changes nothing (equivalent mutant), and no probe in `pr-step-smoke.sh` mentions `GIT_CONFIG_*` today.                                      | scratch mutants A–D below                                                                                          |
| `pr-step.sh` contains no `git commit`: it runs `git push`, `gh pr create`, `gh pr view`, `gh pr ready`. The wrapper needs no identity.                                                                                                                                           | `grep commit scripts/pr-step.sh` → comments only                                                                   |
| The container worktree `chore/B1.66-agent` merges `origin/main` (adeafe9) with no conflict.                                                                                                                                                                                      | `git merge-tree --write-tree HEAD origin/main` rc 0                                                                |

The threat B1.23 closed. `scripts/pr-step.sh` is the only command `settings.json` allows without asking. Its `unset` of `GIT_CONFIG_*` stops an **environment** that carries `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_COUNT`/`KEY_n`/`VALUE_n`, `GIT_CONFIG_PARAMETERS` or `GIT_CONFIG_NOSYSTEM` from steering the push; B1.23 review calls it "defence in depth behind" `guard-bash.sh` rule 5 (a call is one plain segment, no `VAR=` prefix, so a session cannot set them for it). Files are a different class: `~/.gitconfig`, the XDG config and the repository's `.git/config` are read by the wrapper's git today, on the host and in the container, and a node-writable one is writable by the run (`plan-scope.sh` passes files outside the project). So the **variable** is what the wrapper must keep clearing; the **file** is trusted exactly as far as its owner is. That is the lens for the approaches.

## Approaches

### A (recommended): the credential helper is baked into the image's system config (`/etc/gitconfig`)

- **Change.** One `RUN` in `.devcontainer/runner/Dockerfile`, as root before `USER node`: `git config --system 'credential.https://github.com.helper' '!/usr/bin/gh auth git-credential'`, followed in the same `RUN` by `[ "$(git config --system --get-urlmatch credential.helper https://github.com)" = '!/usr/bin/gh auth git-credential' ] && [ -x /usr/bin/gh ]` so a moved `gh` stops the build. `scripts/pr-step.sh` is **not** touched. The volume file keeps the identity (S11 and `run.sh`'s `identity_problem` unchanged); `GIT_CONFIG_GLOBAL` stays in the compose file.
- **Why it works.** The wrapper clears `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_SYSTEM` and `GIT_CONFIG_NOSYSTEM`, never the system file itself; git reads `/etc/gitconfig` by default. Measured above: wrapper environment plus the helper at system scope pushes.
- **Pros.** Hardening untouched and no new input to an auto-allowed command (the helper line is read from a root-owned file, which a run, uid `node` with no capability and `no-new-privileges`, cannot edit or create: `/etc` is not writable by node). No dependency on the marker or on a test seam. No change on the host. The helper survives `down -v` (no `gh auth setup-git` step needed; today it is lost with the volume). The lead's existing logins and volume file stay valid: `up -d --build --force-recreate --wait` is the whole migration (B1.69 used the same command and "the volume kept it"). The session's own git still reads the volume file (`GIT_CONFIG_GLOBAL`); the file's older `helper =` reset line plus the same helper collapses to one helper, no double prompt.
- **Cons.** Needs an image rebuild and a container recreate by the lead (about a minute with cached layers: put the `RUN` after the existing marker `RUN` so every expensive layer is cached). The helper path `/usr/bin/gh` is coupled to the apt install (the build assertion and S12 catch a move; the absolute path is deliberate, `gh setup-git` writes it too, so a `gh` earlier on a node-writable `PATH` cannot shadow it). The wrapper's git still sees no identity (not needed, see Q2). The card's Test line (a probe in `pr-step-smoke.sh`, red) is not the red here: the red moves to `sandbox-probe.sh` S12; see Impact and Q1.
- **Fits rules.** invariant 5 (nothing stateful in `src/`: not applicable; a stateless helper line, no credential at build time, which the Dockerfile header forbids and this does not break); invariant 6 (no hook bypassed; the wrapper is byte-identical, so `guard-bash.sh` rule 5 needs nothing); D-19 label (see Q4).

### B: image `~/.gitconfig` that includes the volume file (the card's (a), variant that keeps `GIT_CONFIG_GLOBAL`)

- **Change.** The Dockerfile writes `/home/node/.gitconfig` = `[include] path = /home/node/.level-up-lab/gitconfig`, owned by node. Compose keeps `GIT_CONFIG_GLOBAL`. The wrapper (variable cleared) falls back to `~/.gitconfig`, which pulls in the volume file: helper **and** identity visible; the session (variable set) never reads `~/.gitconfig`, so no duplicate.
- **The card's literal (a) does not work as written.** Dropping `GIT_CONFIG_GLOBAL` from compose makes `git config --global user.name …` and `gh auth setup-git` (which uses `git config --global`) write the image's `~/.gitconfig`, lost on every recreate, because includes are followed on read only (measured); `--file` would be needed for every step, and `gh auth setup-git` has no such flag. S11 (`GIT_CONFIG_GLOBAL` is a file on a mount) would also have to be rewritten. Keeping the variable (this variant) avoids all of it.
- **Pros.** The wrapper's git sees helper and identity (the card's wording, literally); the lead's volume works the moment the image is recreated; no change to S11, the header's setup lines or `run.sh`.
- **Cons.** The wrapper's `git push` now reads **every key** of a node-writable volume file (and `~/.gitconfig`, which node can delete or replace): a new node-writable input to the auto-allowed command, of the same class as `.git/config` but a second, persistent one. The credential line stays in the volume (lost on `down -v`, needs the `gh auth setup-git` step). `git config --global --get` blind spot (measured) will mislead the next person who checks it. Same rebuild and recreate as A.
- **Fits rules.** Same as A; weaker on the wrapper's "hardening against an injected git config" (acceptance criterion 2), because the file, not just the variable, is now a trusted input.

### C (rejected): the wrapper passes `-c credential.https://github.com.helper=!gh auth git-credential` to its push

- Works in the container (measured). **Cons.** (1) Changes the permission boundary file, so `guard-bash.sh` rule 5 makes every session whose hooks load another wrapper refuse it: this card's session and run 5's worktree must carry the new wrapper first (B1.23 "Cost"). (2) On the host the line appends a second helper after the user's own (unconditionally) or needs the marker. (3) Gating it on `/etc/level-up-lab-runner` leaves no honest smoke probe: a host cannot create that file, and an override variable for the probe is exactly the kind of environment input the wrapper exists to ignore (`run.sh`'s `sandboxed()` states the same: "no variable or flag can stand in"). (4) It fixes `push` only through a string in the permission-boundary script, while the image is where the credential is configured. Pro: no image rebuild, no lead action.

### D (rejected): the wrapper keeps `GIT_CONFIG_GLOBAL` only inside the runner (the card's (b))

- Same objections as C(1) and C(3) (marker gating, no seam, boundary file changes), and it re-admits the one input B1.23 removed: the variable (and the whole volume file it names) for every wrapper call in the container, with the marker (`/etc/level-up-lab-runner`, root-owned in the image) as the only gate. It also leaves `GIT_CONFIG_COUNT`/`PARAMETERS` to be cleared selectively, a new branch in the hardening loop. Pro: smallest diff (about 3 lines) and no rebuild.

## Recommendation

**A**, with B named as the lead's choice if the wrapper's git must see the identity (it need not, Q2). A is the only approach that leaves `scripts/pr-step.sh` byte-identical (so `guard-bash.sh` rule 5, run 5's worktree and every other session are unaffected), adds no node-writable input to the auto-allowed command, survives `down -v` for the credential, and needs the lead to do exactly one thing (rebuild and recreate). The cost is that the card's Test line must change from a red `pr-step-smoke.sh` probe to a red `sandbox-probe.sh` S12, with R15 added as a guard (Q1, Q3).

## Impact

No client component changes: nothing under `src/`, so the server-rendered markup, JavaScript-off submit and pre-hydration submit lines do not apply.

Card Acceptance ids used below (the card has no `AC-§.n`): **Acc-1** push, draft, ready reach GitHub in the container; **Acc-2** the wrapper's hardening stays for every other caller; **Acc-3** `sandbox-probe.sh` proves the wrapper's git sees the helper; **Acc-4** the PR carries `config-change-approved`.

| File                                      | Add/Change                                                                                                                                                                                                        | Signature                                                                                       | ACs   |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----- |
| `.devcontainer/runner/Dockerfile`         | Add one `RUN` after the marker `RUN`, before `USER node`: system-scope helper plus build assertion; header comment line says why                                                                                  | `git config --system 'credential.https://github.com.helper' '!/usr/bin/gh auth git-credential'` | Acc-1 |
| `scripts/agent/sandbox-probe.sh`          | Add probe S12 and its header lines (`S1–S12`)                                                                                                                                                                     | `# S12` block, `ok S12` or `fail S12`                                                           | Acc-3 |
| `scripts/pr-step-smoke.sh`                | Add probe R15 and header line (`R1–R15`)                                                                                                                                                                          | `# R15` block                                                                                   | Acc-2 |
| `.devcontainer/runner/docker-compose.yml` | Header comments only: both `"11 probes OK"` become `"12 probes OK"`; the `gh auth setup-git` line is replaced by a comment that the helper is in the image (B1.76). No service, volume or environment key changes | none                                                                                            | Acc-1 |
| `scripts/CLAUDE.md`                       | The `pr-step-smoke.sh` row says `R1–R14`: `R1–R15`. Leave the `sandbox-probe.sh` row (`S1–S7`) to B1.72, which owns it                                                                                            | none                                                                                            | none  |
| `backlog/work/B1.76/plan.md`              | The plan, stating the Test-line deviation from the card                                                                                                                                                           | none                                                                                            | all   |
| `scripts/pr-step.sh`                      | **no change** under A                                                                                                                                                                                             | none                                                                                            | Acc-2 |

S12 (exact assertions; mirror the wrapper's clearing so a session-level `GIT_CONFIG_GLOBAL` cannot make it pass):

```bash
# S12 the wrapper's git sees GitHub's credential helper (B1.76): system scope, root-owned, with the wrapper's environment
r=0; H='!/usr/bin/gh auth git-credential'
clean() { # runs "$@" the way scripts/pr-step.sh does: every GIT_CONFIG_* variable gone
  ( cd "$ROOT" && for v in $(compgen -e | grep '^GIT_CONFIG_' || true); do unset "$v"; done; "$@" )
}
same "wrapper's helper for https://github.com" "$(clean git config --get-urlmatch credential.helper https://github.com 2>/dev/null)" "$H" || r=1
[[ "$(stat -c %u /etc/gitconfig 2>/dev/null)" == 0 && ! -w /etc/gitconfig ]] || { say "/etc/gitconfig is not a file owned by root and read-only to $(id -un)"; r=1; }
printf 'protocol=https\nhost=github.com\n\n' | clean env GIT_TERMINAL_PROMPT=0 git credential fill >/dev/null 2>&1 \
  || { say "git credential fill (helper's answer) failed: gh auth login in the runner (header of .devcontainer/runner/docker-compose.yml)"; r=1; }
[[ $r -eq 0 ]] && ok S12 || fail S12
```

Notes on S12. The `credential fill` output goes to `/dev/null`, never printed (invariant 7). `env` is called with arguments, not bare (`guard-bash.sh` blocks a bare `env` followed by `;`). Not `ls-remote`: the repository is public. `stat -c` is Linux-only, which is fine: every S probe fails on the host (that is the red). The three assertions are independent on purpose: the first two are deterministic (no network); the third proves the login.

R15 (exact assertions), appended after R14 in `scripts/pr-step-smoke.sh`:

- Fixture: `hooks/` and `hooks2/` directories, each with an executable `pre-push` that appends a word to `$TMP/seen`; a `gitconfig` file holding `[core] hooksPath = $TMP/hooks`. `g checkout -q feat/B9.1-x`. Each case first makes an empty commit with `g commit -q --allow-empty --no-verify -m x`.
- Control (proves the fixture can see a leak): `GIT_CONFIG_GLOBAL=$TMP/gitconfig git -C "$REPO" push -q origin HEAD:refs/heads/feat/B9.1-x` must append `file`; clear `seen`.
- Case 1: `(cd "$REPO" && GIT_CONFIG_GLOBAL="$TMP/gitconfig" PATH="$TMP/bin:$PATH" "$SRC" push)` exits 0, `$TMP/seen` does not exist, and `git -C "$ORIGIN" rev-parse feat/B9.1-x` equals `git -C "$REPO" rev-parse HEAD`.
- Case 2: same with `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0="$TMP/hooks2"`: exit 0, `seen` absent, origin up to date.
- Optional case 3: `GIT_CONFIG_SYSTEM="$TMP/gitconfig"`, same assertions (the wrapper clears it).
- `ok R15` only when control and all cases hold.

## Risks

- **Migration.** None in `prisma/`. The image changes: the lead runs `docker compose -f .devcontainer/runner/docker-compose.yml up -d --build --force-recreate --wait` from the host checkout after the merge (or from the branch to verify early, as the header says). Volumes (`runner-repo`, `runner-claude`, `runner-gh`, `runner-runs`, `runner-pnpm-store`) survive; the Postgres tmpfs restarts as it does on any start.
- **Security.** A moves the credential-helper line from a node-writable file to a root-owned one: strictly narrower. It does not change what the wrapper's push can reach (same helper, same token, same firewall allow list). It does not close `.git/config` or `~/.gitconfig` writes by the run (out of reach of `guard-bash.sh` by its own header). R15 protects the wrapper's environment hardening only. Under B the wrapper reads a node-writable file wholesale: that is the extra risk named above.
- **Performance and isolation.** One more `RUN` layer, cached; `/etc/gitconfig` is read by every git in the image, including the `firewall` service (root, no git use). The compose project stays isolated (no new volume or port). The helper is scoped to `https://github.com`, so it never answers for another host.
- **Existing tests.** Nothing in CI runs `sandbox-probe.sh` or `pr-step-smoke.sh` (`ci.yml` runs `hook-smoke.sh`, `verify-red.sh --auto` for vitest cards). `run-smoke.sh` stubs git config and does not read the Dockerfile. S12 is red on the host and in the pre-change image by design; after the rebuild S1–S12 must be green ("12 probes OK"). B1.72 (open) will say `S1–S10` in `scripts/CLAUDE.md`; whichever card lands second should say `S1–S12`.
- **Unverified.** `gh pr create --head <branch>` pushes nothing in gh 2.23.0 (the image's version): from memory of gh's source, not run (no PR call was made); run 4 never reached it. `gh pr view` and `gh auth status` were run unset and work. Everything about `draft`/`ready`/`open` therefore rests on "gh uses the token in the mount, not git".
- **No new dependency.** `gh` and `git` are already in the image.

## Test strategy

| Layer                       | File                                                    | ACs   | Mocks                                                                                                                                    |
| --------------------------- | ------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Probe in the real container | `scripts/agent/sandbox-probe.sh`                        | Acc-3 | none (real git, real gh login); red on the host, red in the old image ("1 of 12 FAILED", S12 only), green after rebuild ("12 probes OK") |
| Smoke on a throwaway repo   | `scripts/pr-step-smoke.sh` (R15)                        | Acc-2 | bare `origin`, `gh` shim as today; hooks as the observable; run on bash 5 and `/bin/bash` 3.2 (`15 ok, 0 FAIL`)                          |
| Hook probes                 | `scripts/hook-smoke.sh`                                 | none  | unchanged: the wrapper is not edited, so the byte-identity rule and G1–G6 stay as they are; run it once to prove it                      |
| Manual, once, by the lead   | `scripts/pr-step.sh push` inside the container worktree | Acc-1 | the real push of `chore/B1.66-agent` in run 5 is the evidence; `draft`/`ready` the same run                                              |

Red-first handling (the card's Test line). The card demands a red `pr-step-smoke.sh` probe whose reason is "`pr-step.sh push` unsets the variable". Under A that probe cannot be red: the wrapper is correct and stays unchanged; the defect is in the image. The red commit therefore carries **S12 (red)** and **R15 (green on arrival, a guard)**. `scripts/verify-red.sh` is vitest-only, so this is the shell-probe precedent (B1.62: "red on the host 9 of 10 FAILED and in the B1.58 image 3 of 10 FAILED"; B1.69). R15 is not red and `testing.md` says tests land red: state in the commit body "R15 characterizes the hardening that A keeps; it fails under mutants B and D below" so the reviewer does not read it as a missed red. The commit sequence: `test(scripts): B1.76 … (red)` (S12, R15), `chore(scripts): B1.76 …` (Dockerfile, compose header, `scripts/CLAUDE.md`; touches no probe). A change to the card's Test and Acceptance text is the lead's (Q1, Doc drift).

## Mutation hot spots

Hand mutants (no Stryker target; `pnpm test:mutation` does not cover `scripts/`). Prototyped on the real wrapper in a scratch repo:

| #   | Mutant                                                                          | Expected                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | `pr-step.sh:13` loses the word `GIT_CONFIG_GLOBAL`                              | survives: equivalent, the loop on `:14` covers it (measured). Do not count it against R15; note it                                                                  |
| B   | delete the `compgen` loop (`:14`)                                               | R15 case 2 (`GIT_CONFIG_COUNT`) fails: measured, the `core.hooksPath` hook ran (`count`). Case 1 alone would miss it                                                |
| C   | delete the whole `:13` `unset` line                                             | R15 survives (the loop still clears the variable); R10 (`GH_REPO`) fails. State that this mutant is R10's                                                           |
| D   | delete both `:13`'s `GIT_CONFIG_GLOBAL` word and the loop                       | R15 cases 1 and 2 fail                                                                                                                                              |
| E   | Dockerfile: `--system` becomes `--global`                                       | S12 first assertion fails (the helper lands in root's `~/.gitconfig`); in the container S12's second assertion fails on a missing `/etc/gitconfig`                  |
| F   | Dockerfile: helper path `/usr/bin/gh` becomes `gh`                              | S12's first assertion fails (compared to the exact string); the build assertion fails too                                                                           |
| G   | Dockerfile: scope key `https://github.com` becomes `https://gist.github.com`    | S12's first assertion fails (empty urlmatch)                                                                                                                        |
| H   | S12: drop the `GIT_CONFIG_*` clearing in `clean()`                              | in the pre-change container the first and third assertions pass through the session's variable; only the second (root-owned `/etc/gitconfig`) fails. Keep all three |
| I   | S12: `! -w /etc/gitconfig` removed or the uid test changed to `-ne 0`           | passes where `/etc/gitconfig` is node-writable: add a manual check, `chmod 666 /etc/gitconfig` as root in a scratch container, expecting `FAIL S12`                 |
| J   | `sandbox-probe.sh`: S12's `credential fill` run without `GIT_TERMINAL_PROMPT=0` | would hang or prompt on a failure instead of exiting 128; keep the variable                                                                                         |

## Questions settled / escalated

```
Question:    B1.76: which direction fixes the container push, and is the card's red probe still valid?
Class:       P2 spec silent (tooling card; the card lists candidates and chooses none)
Sources:     backlog/plan/E1-todos.md:969 "scripts/pr-step.sh:13 unsets GIT_CONFIG_GLOBAL (B1.23); in the runner container git's global config lives only in the file that variable names"
             backlog/plan/E1-todos.md:973 "Candidate directions for the plan, none chosen"
             scripts/pr-step.sh:13 "unset GH_REPO GH_HOST GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY GIT_CONFIG GIT_CONFIG_GLOBAL GIT_CONFIG_SYSTEM"
Conflict:    none between sources; the card's Test line (a red pr-step-smoke probe) presumes a wrapper change that the recommended approach does not need
Verdict:     the plan chooses (card: "none chosen"); by the authority order the card binds scope and the invariants bind the choice (invariant 6, D-19). A is the only candidate that leaves the permission-boundary file byte-identical. The Test line is satisfied in spirit by S12 (red) plus R15 (guard); the lead approves that at the plan gate
Next action: write plan.md with approach A, naming the Test-line deviation and the one-command rebuild
Must not:    delete the `unset` of GIT_CONFIG_* from the wrapper or make it conditional on a marker, and must not assert in a probe that `ls-remote` proves a credential (the repository is public)
Doc drift:   backlog/plan/E1-todos.md "### B1.76" Test and Acceptance lines (red probe moves to sandbox-probe S12; "commit as B1.69's identity" does not apply to the wrapper): amended by the lead (docs(backlog) lane) or stated in plan.md and fixed in the closing PR
Escalate:    none
```

```
Question:    Does the wrapper need B1.69's identity, and does pr-step.sh draft/ready/open also break in the container?
Class:       P0 no conflict (the acceptance wording is wider than the need)
Sources:     scripts/pr-step.sh:15-19 "git push -u origin HEAD:refs/heads/<branch>"
             backlog/plan/E1-todos.md:973 "reach GitHub with the credential helper and commit as B1.69's identity"
Conflict:    none; the wrapper makes no commit, so "commit as B1.69's identity" belongs to the session (run.sh preflight, S11), not to pr-step.sh
Verdict:     only `push` (git over HTTPS) breaks: gh authenticates from `~/.config/gh/hosts.yml` (the runner-gh mount) and the wrapper clears none of `GH_CONFIG_DIR`, `XDG_CONFIG_HOME`, `GH_TOKEN` (unset in the container anyway); `gh auth status`, `gh issue view` run unset. `draft`/`ready`/`open` are unaffected [gh pr create's own behavior unverified, see Risks]. The identity stays in the volume file for the session's commits; no S12 assertion about it. If the lead wants the wrapper's git to see the identity anyway, that is approach B
Next action: S12 asserts the helper and root ownership only; keep S11 as the identity probe
Must not:    add the identity to `/etc/gitconfig` (it would bake a name the lead set by hand at B1.69 and desynchronize S11) or assert an identity the wrapper never uses
Doc drift:   none beyond the card's Acceptance wording above
Escalate:    none
```

```
Question:    Which file and id carry the red probe, and is an S12 needed?
Class:       P2 spec silent
Sources:     backlog/plan/E1-todos.md:972 "a probe in `scripts/pr-step-smoke.sh` whose throwaway repo's only credential helper and identity sit in a file named by `GIT_CONFIG_GLOBAL`"
             backlog/plan/E1-todos.md:973 "`sandbox-probe.sh` gains or adapts a probe that the wrapper's git sees the helper and the identity"
             scripts/agent/sandbox-probe.sh:162 "r=0; g=\"${GIT_CONFIG_GLOBAL:-}\""
Conflict:    the card's smoke probe, written as asserted, would pass only with a wrapper that honors the variable, the opposite of acceptance criterion 2 under A
Verdict:     S12 in `sandbox-probe.sh` (exact assertions in Impact) is the red; R15 in `pr-step-smoke.sh` is the hardening guard (green on arrival, control plus two cases, a pre-push hook as the observable, no network, no python). Red evidence for S12: the host run (`FAIL S12`) and the lead's pre-change container (`1 of 12 probes FAILED`, S12 only), as B1.62 did
Next action: test commit with S12 and R15; run both on bash 5 and 3.2
Must not:    treat an anonymous `git ls-remote` success as proof of a credential
Doc drift:   scripts/CLAUDE.md `pr-step-smoke.sh` row (R1–R14 to R1–R15) in the chore commit
Escalate:    none
```

```
Question:    Tier, D-19 label, image rebuild, does B1.69's header step change?
Class:       P0 no conflict
Sources:     scripts/ci/lib.sh:4 "scripts/agent/.*|scripts/verify-red\.sh|scripts/next-task\.sh|scripts/card-status\.sh|scripts/pr-step\.sh|\.claude/.*|\.devcontainer/.*)$'"
             scripts/agent/tier.sh:3 "Each token (scripts/ci/plan-files.sh --file) is rated and the highest wins."
Conflict:    none
Verdict:     tier **high** (D-28): the Files table names `.devcontainer/runner/Dockerfile`, `.devcontainer/runner/docker-compose.yml` and `scripts/agent/sandbox-probe.sh`, all in `CONFIG_PROTECTED`; the lead approves the plan (no D-27 path). The PR carries `config-change-approved` (D-19), added by the agent at creation; `check-config-change.sh` fails without it. Image rebuild: yes, once, by the lead (command in Risks); the card session cannot do it. B1.69's header: the `git config --global user.name/email` lines stay (S11 still reads the volume file); the `gh auth setup-git` line is superseded by the image (redundant, harmless if run) and replaced by a comment; both `"11 probes OK"` become `"12 probes OK"`. After the rebuild the lead pulls the clone (`exec runner git pull --ff-only` in `/home/node/level-up-lab`) so S12 exists there, then runs `scripts/agent/sandbox-probe.sh`
Next action: list the three config paths in plan.md Files so tier.sh rates it
Must not:    open the PR without the label or let the agent add `scripts/pr-step.sh` to Files for "consistency" (it would change the boundary file for no reason)
Doc drift:   none
Escalate:    none
```

```
Question:    What does run 5 need after this merges, and does commit 3b09a57 need anything?
Class:       P0 no conflict
Sources:     backlog/work/B1.65/live.md:70 "State left for run 5: worktree `chore/B1.66-agent` at 3b09a57 (not pushed), `backlog/work/B1.66/pr-body.md`"
             scripts/agent/run.sh:232 "resume from the first Loop step whose artifact is missing"
Conflict:    none
Verdict:     under A run 5 needs the lead's rebuild and recreate (then `sandbox-probe.sh` "12 probes OK"), not a new wrapper: the worktree's `scripts/pr-step.sh` is unchanged, so merging `origin/main` into `chore/B1.66-agent` is optional (it merges clean: `git merge-tree` rc 0, README hunks disjoint) and only keeps the PR current; under C or D it would be mandatory. `run.sh 184` replaces `runs/184/stopped` and resumes at Loop 5's push (plan approved at e7e9dd0, `pr-body.md` present untracked); the lead set the turns (more than the 15 that ran out). 3b09a57 added one row to `backlog/README.md` "Waiting on human" ("give the container a git credential … or push by hand, then resume Loop 5"); once the push works that row is stale, and it would ride into B1.66's PR. The run's first step (or the lead before the run) removes the row in a `docs(backlog)` commit; a plain `git revert 3b09a57` is also clean
Next action: lead rebuilds and recreates, pulls the clone, runs S1–S12; then `run.sh 184` with more turns; dev-lead removes the stale row
Must not:    force-push or amend 3b09a57, or run `gh auth setup-git` by hand as the fix for this run
Doc drift:   backlog/work/B1.65/live.md "run 5" record, written when the run ends (the lead's lane)
Escalate:    none
```
