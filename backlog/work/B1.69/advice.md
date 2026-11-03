# B1.69 advice: the runner container keeps a git identity, and a probe proves it

Mode: advice. Tooling card, no section, no `src/`. Read: the card (`backlog/plan/E1-todos.md:900`), `backlog/work/B1.65/live.md`,
`.devcontainer/runner/{docker-compose.yml,Dockerfile}`, `scripts/agent/{sandbox-probe,run,run-smoke,tier}.sh`,
`scripts/ci/{lib,check-config-change}.sh`, `lefthook.yml`, `scripts/metrics/{no-rework,unattended}.sh`, D-19, D-26 to D-29.

Facts that decide the approaches:

- `GIT_CONFIG_GLOBAL=/home/node/.level-up-lab/gitconfig` is already in the `runner` service's environment
  (`docker-compose.yml`, `environment:`), and `/home/node/.level-up-lab` is the `runner-runs` volume. So `git config --global`
  inside the container already writes into the volume and survives `up -d --build`. The only gap is that nothing says to run it,
  nothing checks it and `run.sh` does not look.
- The metrics scripts do not read author identity. `no-rework.sh` and `unattended.sh` classify a commit by the `Agent-Run:`
  trailer that `lefthook.yml`'s `prepare-commit-msg` adds (B1.57) and by `committed` timeline events, never by author name or
  email. `lead-time.sh` and `wait-time.sh` use author dates only.
- Nothing in the repo requires a signed or specific author: `.github/rulesets/main.json` has no signature or author rule
  (grep for signature, signed, author, email: no match); `CODEOWNERS` is path-based; the `commit-msg` hook checks the subject only.
- `scripts/agent/*` and `.devcontainer/*` are in `CONFIG_PROTECTED` (`scripts/ci/lib.sh:4`).

## Approaches

### A (recommended): identity in the `runner-runs` volume, one setup step, a probe, a `run.sh` refusal

- **Change.**
  1. `.devcontainer/runner/docker-compose.yml` header: two lines after `up -d --build --wait`, before the first probe run:
     `exec runner git config --global user.name "level-up-lab runner"` and
     `exec runner git config --global user.email "runner@level-up-lab.invalid"`, plus one comment line: the identity is a named bot,
     not the lead's own, stored in the `runner-runs` volume through `GIT_CONFIG_GLOBAL`, survives a rebuild, and is lost only
     by `down -v`; the two `→ "10 probes OK"` lines become `→ "11 probes OK"`. No service, volume or env change.
  2. `scripts/agent/sandbox-probe.sh`: new S11 (below); header line 2 and the S-list gain S11.
  3. `scripts/agent/run.sh`: `preflight` refuses a run or a `--poll` without an identity, before the auth call, `eligible.sh`,
     `--claim` or `worktree.sh`.
  4. `scripts/agent/run-smoke.sh`: R17 for the refusal; `run()` gets a fixed identity file so R1 to R16 are unaffected.
- **Pros.** Matches the card's Acceptance literally ("once, in the `runner-runs` volume"). No image or compose behavior change.
  The same file the lead already used by hand (`live.md`, run 2). The agent cannot change it (`Bash(git config*)` and
  `Bash(git -c*)` are in `DENY`). Runner commits are distinguishable from the lead's in `git log --author`.
- **Cons.** A lead step remains: a fresh volume (`down -v`, new machine) needs two commands, but the probe and `run.sh` now
  say so instead of a run stopping at `Author identity unknown`. The header is the only documentation (there is no runner README).
- **Fits rules.** Yes: invariant 5 (nothing stateful hard-coded: the identity lives in the volume, not the image), invariant 6
  (no hook bypassed), `CLAUDE.md` "Ask before any ... configuration change" (the plan asks; D-19 label follows).

### B (alternative): identity from the compose environment

- **Change.** `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL` in the `runner` service's
  `environment:` (or `ENV` in the Dockerfile); no lead step; the probe reads the environment instead of the file.
- **Pros.** Nothing to forget on a fresh volume; works after `down -v`. Fewer words in the header.
- **Cons.** Contradicts the card's Acceptance ("in the `runner-runs` volume"); the card would need a lead edit first. The
  environment overrides every `git config` (a later `--global` change would silently not apply), so a lead who wants a
  different identity must edit compose and recreate the service. `run.sh` cannot tell the file from the environment without
  a second code path (`git config` does not show `GIT_AUTHOR_*`; `git var` would, but auto-detection makes it a false green
  on a host or a container whose hostname has a dot). Identity baked into the image (`ENV`) needs a rebuild to change.
  An env prefix on a run's own `git commit` is not denied by `DENY`, same as for config, so B gains no integrity over A.
- **Fits rules.** Yes, but it is a scope change to the card; only the lead can make it.

## Recommendation

A. Named bot, `level-up-lab runner` / `runner@level-up-lab.invalid`. Reasons:

- The artifacts name roles, never people (`backlog/CLAUDE.md:71`); the header lives in the repo, so the lead's own name or
  GitHub noreply address (which embeds a login and an id) cannot be written there, and a placeholder the lead edits by hand is
  the same manual step this card removes. A role-named bot puts the exact text in the repo with no personal data.
- `.invalid` is reserved (RFC 2606), never resolves and cannot map to a GitHub account, so the commits are never attributed to
  a real user. A `...@users.noreply.github.com` address could collide with a real login.
- The lead still opens every PR and pushes with the gh login in `runner-gh`, so the PR author, the pusher and the merger stay
  the lead; the commit author says "the runner wrote this". No ruleset, CODEOWNERS entry, hook or metric depends on the author.
  If the PR is squash-merged, the bot identity survives only on the branch [unverified: merge method not read].
- The lead's own identity would hide in `git log` which commits a run wrote; `Agent-Run:` already marks them, the author adds a second, independent mark.

## Impact

No client component is touched (no `src/`), so there is no server-rendered markup, no JavaScript-off or pre-hydration submit
to compare; the section is empty by construction.

| File                                                    | Add/Change | Signature                                                                                                                                                          | ACs                             |
| ------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| `scripts/agent/sandbox-probe.sh`                        | Change     | new `# S11` block, same `r=0 … [[ $r -eq 0 ]] && ok S11 \|\| fail S11` shape; header S-list gains `S11`, line 2 says S1 to S11                                     | Acceptance 1 (setup), 2 (probe) |
| `scripts/agent/run-smoke.sh`                            | Change     | new `# R17`; `run()` exports `GIT_CONFIG_GLOBAL="${GITCFG:-$TMP/gitconfig}" GIT_CONFIG_NOSYSTEM=1`; header R-list gains R17                                        | Acceptance 3 (refusal)          |
| `scripts/agent/run.sh`                                  | Change     | `identity_problem()` (empty or blank `user.name` / `user.email`); `preflight` calls it first unless `$1 == binary`; header line for the exit-1 reasons mentions it | Acceptance 3                    |
| `.devcontainer/runner/docker-compose.yml`               | Change     | header comment only: two `exec runner git config --global …` lines, one comment line, `10` → `11 probes OK` twice; no key under `services:` or `volumes:` changes  | Acceptance 1, 4                 |
| `backlog/work/B1.69/{analysis,advice,plan}.md`, PR body | Add        | artifacts of the pipeline; PR body states the identity (Acceptance 4)                                                                                              | Acceptance 4, 5                 |
| `backlog/plan/E1-todos.md`, `backlog/README.md`         | Change     | status line via `scripts/card-status.sh` at closing (closing lane)                                                                                                 | none                            |

Not touched: `Dockerfile`, `init-firewall.sh` (B1.70), `worktree.sh` (B1.71), `scripts/CLAUDE.md` (B1.72's row; see Questions 5),
`lefthook.yml`, the metrics scripts, `.claude/`.

### Probe S11 (exact)

Runs inside the container, as node, from the clone. Pass only when all hold; each failure `say`s its cause:

1. `GIT_CONFIG_GLOBAL` is set and not empty (`GIT_CONFIG_GLOBAL is unset`).
2. `d="$(dirname "$GIT_CONFIG_GLOBAL")"` is a mount: `awk -v d="$d" '$5 == d { f = 1 } END { exit !f }' /proc/self/mountinfo`,
   S6's own test (`<d> is not a mount`). On the host there is no `/proc/self/mountinfo` on macOS and no such mount on Linux,
   so this is false there even though the host has an identity: no false green.
3. `"$GIT_CONFIG_GLOBAL"` is a regular file (`<file> does not exist`).
4. `git config --file "$GIT_CONFIG_GLOBAL" --get user.name` and `user.email` are each non-blank (`${v//[[:space:]]/}` non-empty);
   the file, not `git config user.name`, so a value in the clone's `.git/config` or in `/etc/gitconfig` cannot stand in.
5. What a commit would carry equals the file: `git var GIT_AUTHOR_IDENT` and `git var GIT_COMMITTER_IDENT` (run in `$ROOT`) each
   start with `"$name <$email> "`. Catches a clone-local or environment override of the volume's identity; `git var` also
   errors with `Author identity unknown` when nothing is set, which is run 1's symptom.

FAIL text, one `say` line that names the step, printed once after the causes when any fail:
`git identity: set it once in the runner-runs volume: docker compose -f .devcontainer/runner/docker-compose.yml exec runner git config --global user.name "level-up-lab runner" (and user.email), see the header of .devcontainer/runner/docker-compose.yml (B1.69)`.
Keep the command text in one place in the probe, and match the header's two lines.

### run.sh refusal (exact)

- Where: top of `preflight()`, before `child auth status`, so before `eligible.sh`, `--claim`, `worktree.sh`, any `claude -p`.
  `preflight` is called by the `--poll` and issue paths and by `--check-binary` (`preflight binary`); the identity check is
  skipped when `$1 == binary`, so only runs and `--poll` refuse. `--mode` returns before `preflight` and is untouched
  (S4 runs it in the container).
- Check: `git config --get user.name` and `user.email` from `$ROOT` (effective config, so the volume's file or a clone-local
  value both count; S11 is the strict one about location). Blank counts as empty. No `git var` (auto-detection makes it
  depend on the hostname).
- stderr line, `die` format, exit 1:
  `[run] no git identity: user.name or user.email is empty; set them once with the runner setup step 'git config --global user.name …' and 'user.email …' (header of .devcontainer/runner/docker-compose.yml, B1.69)`
- Runs on the host as well as in the container (a run commits in both); the host has an identity, so nothing changes there.

### R17 in run-smoke.sh (red first)

Harness: `run()` sets `GIT_CONFIG_GLOBAL` to `$TMP/gitconfig` (a file written once, name and email set) and
`GIT_CONFIG_NOSYSTEM=1`, overridable by `GITCFG`. This is in the test commit, so R1 to R16 stay green at the red commit and
become independent of the host's own identity. R17 asserts, each with `GITCFG=/dev/null` or a file lacking one key or blank:

- `run 7`: exit 1, `has '[run] no git identity'`, `has 'git config --global'`, `has 'docker-compose.yml'`; `calls` = 0 and the
  log holds no `ELIGIBLE`, `CLAIM`, `WORKTREE` line.
- name only, email only, and `user.name = "  "`: each refused.
- `run --poll`: exit 1, same line, no `GH … issue list` line in the log.
- `SMOKE_AUTH=false run --check-binary` with no identity: output has `not logged in` and not `no git identity` (the identity
  is not required there), proving the check is skipped for `binary`.
- `run --mode` with no identity: exit 0, `dontAsk`.

Red on the host today: `run.sh` has no check, so `run 7` proceeds to the claim and `calls`/`CLAIM` assertions fail.

## Risks

- **Migration.** none. No `prisma/`.
- **Security.** The identity is not a credential and not a boundary; a run could still set `GIT_AUTHOR_NAME=x git commit` (not in
  `DENY`; same exposure as before this card; out of scope, authorship carries no trust here). No secret is read or printed.
  The probe reads one non-secret file in the volume. No new dependency.
- **Performance.** two `git config` calls at the start of a run; S11 adds under a second to the probe.
- **Isolation.** Nothing is shared with the dev container; `runner-runs` is already the container's own volume. R17 never reads
  the host's git config (`GIT_CONFIG_GLOBAL`, `NOSYSTEM`), so the host's identity cannot make it green.
- **Existing tests that could turn red.**
  - `run-smoke.sh` R1 to R16 call `run.sh <issue>` / `--poll`: they start refusing unless `run()` supplies an identity; hence the
    `GIT_CONFIG_GLOBAL` line in the same red commit. R15 and `--mode` are unaffected (`--mode` returns first).
  - `sandbox-probe.sh` S4 calls `run.sh --mode` only: unaffected. The count line ("10 probes OK") now reads 11: the compose
    header and any doc quoting it must change together (grep `10 probes` across `.devcontainer`, `backlog`, `docs`).
  - Anything else that runs `run.sh <issue>` without an identity: grep `run.sh` in `scripts/` and `.github/` before the feat commit;
    none found in the files read, `[unverified]` for the rest.
  - `scripts/ci/check-config-change.sh` fails without the label; `check-plan-scope.sh` fails if a file outside the plan changes.
- **Tier (D-28, `scripts/agent/tier.sh`).** `scripts/agent/sandbox-probe.sh`, `run.sh`, `run-smoke.sh` match
  `scripts/agent/.*` and `.devcontainer/runner/docker-compose.yml` matches `\.devcontainer/.*`, both in `CONFIG_PROTECTED`:
  the Files table rates **high**. A high-tier plan stops for the lead's `approve` (D-27); `backlog/*` rows alone would be low.
- **Label.** `config-change-approved` is needed (D-19): the lead-approved plan changes protected paths; the agent adds the label
  right after `gh pr create`, per the card's Acceptance and the memory rule, never for a path outside the plan.
- **Drift between texts.** The setup command appears in the header, the probe's FAIL text and `run.sh`'s stderr. A later rename
  of the step must change all three; R17 and the S11 FAIL text both match `docker-compose.yml`/`git config --global`.
- **Order with B1.72.** See Questions 5.

## Test strategy

`scripts/verify-red.sh` reads `*.test.ts` only, so the red is shown by running the probes (B1.58 and B1.62 precedent). The red
commit is `test(scripts): B1.69 git identity probes (red)` with body "Red because no probe reads the container's git identity
and `run.sh` has no identity check"; the green commit is `chore(scripts): B1.69 runner git identity` and touches neither probe
file (`check-feat-commits.sh` only rejects `feat(`; keep the chore type as B1.62 did).

| Layer                                                           | File                                                                                                                   | ACs             | Mocks                                                                                |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------ |
| Probe R17, red on the host (any machine, no container)          | `scripts/agent/run-smoke.sh`                                                                                           | Acceptance 3    | `claude`, `gh`, eligible, claim, worktree shims (existing); `GIT_CONFIG_GLOBAL` file |
| Probe S11, red on the host and in a container without the step  | `scripts/agent/sandbox-probe.sh`                                                                                       | Acceptance 1, 2 | none; real mountinfo, real git                                                       |
| Container drill, fresh `-p b169-verify` project, then `down -v` | `docker compose -f .devcontainer/runner/docker-compose.yml`                                                            | Acceptance 1, 2 | none: probe fails and names the step; run the header's two lines; "11 probes OK"     |
| Rebuild survives                                                | same compose, `up -d --build --force-recreate`, then probe                                                             | Acceptance 1    | none: S11 still green after the recreate (volume kept); red again after `down -v`    |
| Refusal in the container                                        | `exec -e RUNNER_BUDGET_USD=1 runner scripts/agent/run.sh 184` before the step                                          | Acceptance 3    | none (real refusal, exit 1, the stderr line, no turn spent, no `runs/184` log)       |
| Existing probes stay green                                      | `run-smoke.sh` R1 to R16, `sandbox-probe.sh` S1 to S10, `scripts/hook-smoke.sh`, `pnpm lint` (prettier on the scripts) | none            | none                                                                                 |

The drill and the refusal check are the lead's or the implementer's hands under `-p`; CI cannot run them. PR evidence: the
identity stated ("a named bot, `level-up-lab runner <runner@level-up-lab.invalid>`, not the lead's own"), the red and green
outputs of R17 and S11, the `docker compose` drill transcript (no token, no `.env`).

## Mutation hot spots

Stryker does not cover `scripts/`; mutate by hand and prove each is caught:

- `preflight` order: move the identity check after `child auth status` or after `[[ "${1:-}" == binary ]] && return 0`: R17's
  `--check-binary` and `calls` assertions must fail.
- Blank check: replace `${v//[[:space:]]/}` by `$v`: the `"  "` case in R17 must fail.
- `||` for `&&` between name and email: the name-only and email-only cases must fail.
- S11 file source: read `git config user.name` instead of `--file "$GIT_CONFIG_GLOBAL"`: on a container with the identity only in
  the clone's `.git/config`, S11 must still fail (drill: `git config --local`, expect FAIL).
- S11 mount test: drop step 2: the host (macOS, identity in `~/.gitconfig`, `GIT_CONFIG_GLOBAL` pointed at it) must still FAIL, so keep a drill with that variable set on the host.
- Compose header: change the identity step text in one of the three places: the matching-substring assertions in R17 and the S11 FAIL text fail.

## Questions settled / escalated

```
Question:    Where is the identity set, and should the image or compose set it instead of a lead step?
Class:       P2 spec silent (tooling, no section; the card's Acceptance governs)
Sources:     backlog/plan/E1-todos.md:907 "sets a git identity once, in the `runner-runs` volume, so it survives a rebuild"
             .devcontainer/runner/docker-compose.yml:78 "GIT_CONFIG_GLOBAL: /home/node/.level-up-lab/gitconfig"
             .devcontainer/runner/docker-compose.yml:92 "- runner-runs:/home/node/.level-up-lab"
Conflict:    none (an env-var identity, approach B, would contradict the card's wording, not any rule)
Verdict:     The card governs: volume file, written by a documented setup step (`git config --global`, which GIT_CONFIG_GLOBAL already
             routes into the volume). Approach A. Compose env is a scope change only the lead can make by editing the card.
Next action: put the two header lines in the plan's Files for docker-compose.yml; write S11 and R17 red first.
Must not:    add GIT_AUTHOR_*/GIT_COMMITTER_* to compose or the Dockerfile, or a script that writes the identity at container start.
Doc drift:   none beyond the header lines and "11 probes OK" in docker-compose.yml, same commit as the green change.
Escalate:    none
```

```
Question:    Whose identity: the lead's own or a named bot, and what do metrics, CODEOWNERS, hooks and branch protection imply?
Class:       P2 spec silent (the card allows either and asks that the PR say which)
Sources:     backlog/plan/E1-todos.md:907 "the identity the agent's commits carry is stated (the lead's own or a named bot) and the PR says which"
             backlog/CLAUDE.md:71 "Artifacts name **roles, never people**"
             scripts/metrics/no-rework.sh:6 "without the `Agent-Run:` trailer that lefthook's prepare-commit-msg"
             lefthook.yml:41 "git interpret-trailers --in-place --if-exists replace --trailer \"Agent-Run: $RUNNER_CHILD\" {1}"
Conflict:    none (nothing keys on author: metrics read the trailer, CODEOWNERS is paths, commit-msg checks the subject, the ruleset has no signature or author rule)
Verdict:     Named bot `level-up-lab runner` / `runner@level-up-lab.invalid`: the only choice that puts exact text in the repo without a
             personal name or email, cannot be attributed to a real account, and marks runner commits a second way beside the trailer.
Next action: state the identity in the plan and the PR body; the lead approves it with the plan.
Must not:    write the lead's name, login or noreply address in the header, the probe, the PR or the card; pick `@users.noreply.github.com`
             for the bot (it can collide with a real login).
Doc drift:   none
Escalate:    none
```

```
Question:    What does S11 check, and how does it stay red on a host that has an identity?
Class:       P2 spec silent (card: "the probe fails when `git config user.name` or `user.email` is empty inside the container and names the setup step")
Sources:     backlog/plan/E1-todos.md:907 "the probe fails when `git config user.name` or `user.email` is empty inside the container and names the setup step"
             scripts/agent/sandbox-probe.sh:100 "awk -v d=\"$d\" '$5 == d { f = 1 } END { exit !f }' /proc/self/mountinfo"
Conflict:    none
Verdict:     S11 = GIT_CONFIG_GLOBAL set, its directory a mount (S6's mountinfo test: host-false), the file exists, user.name and user.email
             non-blank in that file, and `git var GIT_AUTHOR_IDENT`/`GIT_COMMITTER_IDENT` carry them. FAIL text names the header's step.
             The card's `git config user.name` wording is satisfied by the effective-ident check; reading the file alone is what
             proves "in the volume".
Next action: write S11 as above in the red commit; run it on the host (expect FAIL on step 1 or 2) and in a fresh container (FAIL, then ok).
Must not:    probe only `git config user.name` (green on the host, and green with an identity in the clone's .git/config); use a
             `git var` check alone (auto-detected hostname identities make it environment-dependent).
Doc drift:   none (sandbox-probe.sh's own header changes in the same red commit)
Escalate:    none
```

```
Question:    Where does run.sh refuse, with what line, which probe proves it, and does --check-binary also refuse?
Class:       P2 spec silent (card: "`run.sh` refuses to start a run without an identity, before any turn is spent")
Sources:     backlog/plan/E1-todos.md:907 "`run.sh` refuses to start a run without an identity, before any turn is spent"
             scripts/agent/run.sh:104 "[[ \"${1:-}\" == binary ]] && return 0"
             scripts/agent/run.sh:12 "exit 0 ran to an end, or skipped with the reason · 1 refused (stderr \"[run] <why>\")"
Conflict:    none
Verdict:     First step of `preflight` for runs and `--poll` (before the auth call, eligible, claim, worktree): exit 1, one `[run] no git identity: …`
             line naming the setup step. `--check-binary` does not refuse: it makes no commit (a detached probe worktree, one blocked Write),
             and the card says "a run". `--mode` is untouched. Proven by R17 (host-independent: GIT_CONFIG_GLOBAL file, NOSYSTEM).
Next action: add R17 and the `run()` identity file in the red commit; add `identity_problem` and the preflight call in the green one.
Must not:    check inside `run_issue` (after eligible/claim a refusal would leave a claimed card with no worktree) or make `--mode` or
             `--check-binary` depend on it (S4 and the header's check-binary step would break).
Doc drift:   none
Escalate:    none
```

```
Question:    What else does the Acceptance need, and what is out of scope? (PR says which identity; B1.70, B1.71, B1.72)
Class:       P4 two sections collide (B1.69 adds S11; B1.72's Acceptance says the guide row "reads S1–S10")
Sources:     backlog/plan/E1-todos.md:907 "the identity the agent's commits carry is stated (the lead's own or a named bot) and the PR says which; the PR carries `config-change-approved` (D-19)"
             backlog/plan/E1-todos.md:942 "the row reads S1–S10 and names engines, browser and Postgres; nothing else changes"
             scripts/CLAUDE.md:28 "probes S1–S7"
Conflict:    B1.72 will fix the guide row to S1–S10; once B1.69 lands the script has S11, so the row is one probe short again.
Verdict:     Each card edits only its own files: B1.69 leaves `scripts/CLAUDE.md` alone (not in its Acceptance, and B1.72's lane is one-row).
             Acceptance items for B1.69: header step, S11 with the step named, run.sh refusal, identity stated in the header comment and the PR
             body, label added after `gh pr create`. Out of scope: `init-firewall.sh` (B1.70), `worktree.sh` (B1.71), the Dockerfile,
             any image or compose behavior, signing, the `Agent-Run:` hook.
Next action: lead sequences B1.72 after B1.69 and edits its Acceptance to S1–S11 (a card edit, no D-n), or accepts a one-line follow-up.
Must not:    edit `scripts/CLAUDE.md` in this PR to dodge the ordering, or add S11 text to a row B1.72 owns.
Doc drift:   scripts/CLAUDE.md:28 (B1.72's commit; its text becomes S1–S11 if it merges after this card)
Escalate:    none (lead's ordering note under "Waiting on human" at most)
```
