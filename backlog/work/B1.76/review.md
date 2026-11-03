# B1.76 review

## Plan review (round 1)

SCOPE: all (tooling, no §: `.devcontainer/runner/`, `scripts/agent/`, `scripts/`, `backlog/`). Plan at `38e5b93`.
Read: card B1.76 and B1.72 (`backlog/plan/E1-todos.md`), `advice.md`, `scripts/pr-step.sh`, `scripts/pr-step-smoke.sh`,
`scripts/agent/sandbox-probe.sh`, `scripts/agent/tier.sh`, runner `Dockerfile` and `docker-compose.yml`,
`.claude/hooks/guard-bash.sh` (rules 2, 4, 5), `backlog/CLAUDE.md`, B1.69's plan review (precedent), D-19, D-26 to D-28.

Probes run (none on the tree; the lead's `level-up-lab-runner-runner-1` read only, no image built):

- `scripts/next-task.sh --check B1.76` → `[next-task] B1.76: no overlap with any Doing or Review card` (exit 0)
- `scripts/agent/tier.sh backlog/work/B1.76/plan.md` → `high`; `plan-files.sh --any B1.76 HEAD` → 7 tokens, all in the table
- `scripts/ci/check-plan-scope.sh` → `OK: chore/B1.76-wrapper-credential changes only paperwork`; `check-backlog.sh` → OK
- host baselines today: `sandbox-probe.sh` → `10 of 11 probes FAILED` (S2 ok); `pr-step-smoke.sh` →
  `[pr-step-smoke] 14 ok, 0 FAIL`; `run-smoke.sh` → `17 probes OK`; `hook-smoke.sh` → `hook-smoke: 522 probes OK`
- container (read only): git 2.39.5, `/etc/gitconfig` absent, `/etc` `root:root 755`, `/usr/bin/gh` present, uid 1000
  node, `CapEff 0`, `NoNewPrivs 1`, `GIT_CONFIG_GLOBAL` set, `GIT_ASKPASS`/`SSH_ASKPASS`/`GIT_TRACE`/`GH_CONFIG_DIR`/
  `GIT_CONFIG_NOSYSTEM` unset
- token leak (scratch, git 2.39.5, a fake helper answering `password=FAKESEKRET123` for `https://ex.invalid`):
  `git credential fill` with `GIT_TRACE`, `GIT_TRACE2`, `GIT_TRACE2_EVENT`, `GIT_TRACE2_PERF`, `GIT_TRACE_CURL`,
  `GIT_TRACE_PACKET`, `GIT_TRACE_SETUP` all `1` → the password is on stdout only (1 hit), 0 hits in stderr; the trace
  names the helper command, never its answer. `GIT_TRACE=<file>` → 0 hits in the file. S12 sends stdout and stderr to
  `/dev/null`, so nothing it runs prints a token
- `--get-urlmatch` (scratch): system `credential.https://github.com.helper` alone → the gh line; plus a generic
  `credential.helper` in `.git/config` → still the gh line (the specific key wins the lookup, though git would run both
  helpers on a push); plus a `credential.https://github.com.helper` in `.git/config` → the local value (S12 then fails,
  correctly); two values at system scope → the last one
- `guard-bash.sh` fed S12's forms (the probe call, the `-p b176-verify … exec runner scripts/agent/sandbox-probe.sh`
  call, the `printf … | env GIT_TERMINAL_PROMPT=0 git credential fill >/dev/null 2>&1` line, the `compgen` clearing
  subshell with `--get-urlmatch`, `… down -v`, `pr-step-smoke.sh`) → rc 0 for each. It also passes a bare
  `printf … | git credential fill` that would print a token: a pre-existing gap of rule 4, not this card's (see Notes)

Extra checks the lead asked for:

- **B1.23's threat model.** Unchanged for the wrapper's environment: `scripts/pr-step.sh` stays byte-identical, its
  `unset` and `compgen` loop still clear every `GIT_CONFIG_*` (including `GIT_CONFIG_NOSYSTEM`, so a session cannot switch
  the system file off for the wrapper either), and R15 adds the first probe of that clearing. Who can write
  `/etc/gitconfig` in the runner: root only (file created 644 by `git config --system` as root, `/etc` root 755). A run
  is uid node with an empty capability set, `no-new-privileges` and no sudo (S5), so it can neither write nor replace the
  file; only the image build or the lead's own `docker compose exec -u root` can. The `firewall` service runs the same
  image as root but is a separate container filesystem. The node-writable inputs the wrapper's git already reads
  (`.git/config` of the clone, `~/.gitconfig`, `~/.config/git/config`) are unchanged by A: same class as before, named in
  the advice. Net: the helper line moves from a node-writable file to a root-owned one, strictly narrower.
- **The host (macOS).** Not built from this Dockerfile; `pr-step.sh` unchanged; R15 runs on the host (bash 3.2) against a
  local bare origin, no credential involved. One host effect, reason 3.
- **S12 printing a token.** No (measured above): stdout and stderr both go to `/dev/null`; trace variables write the
  helper's command line, not its answer.
- **guard-bash and S12.** Every S12 form passes (rc 0 above). Rule 5 is untouched because the wrapper is.

| Check                                                                | Result                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                       | pass. Seven rows, all the card's: image, two probe files, compose header, guide row, card lines, work folder. `scripts/pr-step.sh` rightly absent                                                                                                       |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | n/a (no `src/`). The Dockerfile `RUN`, S12's three conditions and R15's control and cases are pasted                                                                                                                                                    |
| follows `advice.md` or states the deviation                          | pass on approach A and the S12/R15 split (decision 2). One unstated deviation: the build assertion (reason 4)                                                                                                                                           |
| ≤ 7 criteria, measurable Thens                                       | pass. The card's 4 Acceptance clauses map to run 5 (push/draft/ready), R15, S12, the label. No banned adjective                                                                                                                                         |
| verification: exact commands, expected numbers                       | fail (reason 1): two expected lines do not match what the scripts print or what a fresh throwaway volume holds                                                                                                                                          |
| skeleton → red → green → map → review                                | pass for tooling, as B1.62 and B1.69: red `test(scripts)` without `(red)` (verify-red judges only `(red)`, `backlog/CLAUDE.md`), green `chore(scripts)`, reviewer, PR. No skeleton or map row without a §. The card-lines commit is unplaced (reason 2) |
| `Lead approves spec` box                                             | n/a. No spec section. `Plan approved by:` empty; I write neither                                                                                                                                                                                        |
| no settled D-n contradicted                                          | pass. D-19 label named; D-28 tier `high` matches `tier.sh`; D-27 lead's `approve` kept; D-26 untouched                                                                                                                                                  |
| `next-task.sh --check B1.76`                                         | pass: "B1.76: no overlap with any Doing or Review card"                                                                                                                                                                                                 |

Not a reason: the plan is 61 lines against `planning.md`'s ≈ 40; B1.62 (70) and B1.69 (59, 70) were not blocked on length.

Reasons:

1. **Verification lines the scripts will not print.** (a) `pr-step-smoke.sh` ends in `[pr-step-smoke] N ok, 0 FAIL`
   (today `14 ok, 0 FAIL`), not "15 probes OK": the expected line is `[pr-step-smoke] 15 ok, 0 FAIL`. (b) In the
   throwaway `-p b176-verify` project the `runner-runs` volume is new, so `GIT_CONFIG_GLOBAL`'s file does not exist and
   S11 FAILs ("… does not exist"): "the other 11 ok" holds only if the drill runs the two `git config --global user.*`
   header lines first. Either list them in the drill or expect `2 of 12 probes FAILED` (S11, S12) on the new image. (c)
   Give the old image's expected line the same way (S12 with three `say` lines: helper `none`, `/etc/gitconfig` not
   root-owned, credential fill failed; plus S11 unless the identity step ran). (d) "Hand mutants (advice) each caught"
   contradicts the advice: A is equivalent (survives), C is caught by R10 not R15, I needs a root `chmod` in a scratch
   container, J is a hang check. List the mutants that will be run and the probe expected to catch each.
2. **Decision 2 states the deviation, not the text.** The lead approves new Test and Acceptance lines without seeing
   them. Paste both lines in the plan (one each). Also say whether the card title ("keeps … git credential and identity"),
   the README "Remaining" row and its Execution-order node keep "identity" (the wrapper keeps no identity under A; ids
   are permanent, titles are not), and where `docs(backlog): B1.76 card lines` sits in the commit order (before the
   `test(scripts)` commit, as a `docs(spec)` would).
3. **S12 on the host fetches the lead's real GitHub credential.** `clean … git credential fill` runs whatever helper the
   host config names. Measured on this host: with the `GIT_CONFIG_*` variables replaced, Apple git still ran
   `git credential-osxkeychain get` for `github.com` and it answered (a credential came back to a discarded stdout).
   Nothing is printed, but every host run of `sandbox-probe.sh`, where S12 is red anyway (`stat -c` is Linux-only),
   pulls a token out of the keychain and may raise a keychain prompt. State it as a cost, or gate only the third
   assertion on the runner marker (`[[ -f /etc/level-up-lab-runner ]]`, root-owned in the image, the gate `run.sh`'s
   `sandboxed()` already trusts) with a `say` on the host, keeping the first two assertions unconditional so the red
   stays.
4. **The build assertion is weaker than the advice's, unstated.** The plan's `RUN test -x /usr/bin/gh && git config
--system …` asserts the binary before the write; the advice adds a read-back
   (`[ "$(git config --system --get-urlmatch credential.helper https://github.com)" = '!/usr/bin/gh auth git-credential' ]`)
   and its mutant F says "the build assertion fails too", which is no longer true under the plan's line. Restore the
   read-back in the `RUN` or state that S12 alone catches F.

Notes (not reasons):

- `guard-bash.sh` rule 4 lets a session run `printf 'protocol=https\nhost=github.com\n\n' | git credential fill` (rc 0),
  which prints a token; `gh auth token` is likely the same [unverified]. Pre-existing, outside this plan's Files and
  B1.76's scope: a candidate card, not a change here.
- S12's first assertion reports the most specific helper only: a generic `credential.helper` added to the clone's
  `.git/config` would still run on the wrapper's push while S12 passes. Same node-writable class the advice names as out
  of reach; no change asked.

Verdict: changes requested

Riskiest unfalsified: `draft`, `ready` and `open` reaching GitHub inside the container rest on `gh` using the
`runner-gh` mount's token with no git credential (`gh pr create --head` pushing nothing in gh 2.23.0 is from the advice's
memory, not run); run 5 is the first proof.

## Plan review (round 2)

SCOPE: all (tooling, no §). Plan at `cc89338` (diff against round 1: `plan.md` only, +22 −12). Read again: the card,
`advice.md` (Approaches, Impact, Mutation hot spots), `scripts/agent/sandbox-probe.sh`, `scripts/pr-step.sh`, runner
`Dockerfile` and `docker-compose.yml`, `scripts/agent/run.sh` `sandboxed()`, README row 86 and node S86.

Probes run (nothing on the tree; no `git credential fill` anywhere, no container touched):

- `scripts/next-task.sh --check B1.76` → `[next-task] B1.76: no overlap with any Doing or Review card` (exit 0)
- `scripts/agent/tier.sh backlog/work/B1.76/plan.md` → `high`; `plan-files.sh --any B1.76 HEAD` → 7 tokens (exit 0),
  all in the table
- `check-plan-scope.sh` → `OK: chore/B1.76-wrapper-credential changes only paperwork`; `check-backlog.sh` → OK
- the new build read-back (scratch, git 2.39.5, `GIT_CONFIG_SYSTEM` pointed at a scratch file to stand in for
  `/etc/gitconfig`): the plan's write → read-back rc 0; mutant E (`--global`) rc 1, empty; mutant F (`!gh auth …`)
  rc 1; mutant G (`gist.github.com` scope) rc 1, empty. The `RUN` stops the build on E, F and G

Round 1 reasons:

| #   | Round 1 reason                     | Round 2                                                                                                                                                                                                                                                                                                                                                                        |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | verification lines                 | resolved: (a) `[pr-step-smoke] 15 ok, 0 FAIL`; (b) the two identity lines run first in the throwaway, so S11 is ok and "1 of 12 probes FAILED" holds on both images; (c) the old image's line given (S12 also prints the fill line there: the marker exists in that image, no helper answers, so the fill fails; note 2); (d) mutants listed, one misattribution left (note 1) |
| 2   | card lines not pasted              | resolved: Test and Acceptance pasted; title, README row and node kept as filed, stated; the `docs(backlog): B1.76 card lines` commit placed before the red                                                                                                                                                                                                                     |
| 3   | host S12 pulls the keychain token  | resolved: the fill runs only where `/etc/level-up-lab-runner` exists (the image's root-owned marker, the one `run.sh` `sandboxed()` trusts, line 53); the first two assertions stay unconditional, so the host red holds ("11 of 12 probes FAILED": `--get-urlmatch` reads config and runs no helper, `stat -c` fails on macOS)                                                |
| 4   | build assertion weaker than advice | resolved: the `RUN` reads back `credential.https://github.com.helper` at system scope; measured above, it catches E, F and G                                                                                                                                                                                                                                                   |

| Check                                                                | Result                                                                                                                                                                                                |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the card                           | pass. 7 rows, each tied to the card's Test, Acceptance or a doc line the change makes stale; `scripts/pr-step.sh` out of scope, stated                                                                |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | n/a (no TypeScript, no `src/`). Shell forms pasted (Dockerfile `RUN`, S12, R15)                                                                                                                       |
| follows `advice.md` or states the deviation                          | pass. Approach A; the read-back uses `--get` of the exact key instead of the advice's `--get-urlmatch` (equal or stricter: it catches G as well, measured)                                            |
| ≤ 7 criteria, every Then measurable                                  | pass. The pasted Acceptance is measurable: S12, R15, `scripts/pr-step.sh` byte-identical, the D-19 label                                                                                              |
| verification lists exact commands with expected numbers              | pass, one correction (note 1). Host `11 of 12 probes FAILED`, `[pr-step-smoke] 15 ok, 0 FAIL`, throwaway old and new `1 of 12 probes FAILED`, `run-smoke` 17, `hook-smoke` 522, lead's `12 probes OK` |
| work breakdown skeleton → red → green → map → review                 | pass for a tooling card: card lines → red (S12 red, R15 guard) → green (`chore(scripts)`, no probe file) → reviewer (diff) → PR. No skeleton or map row without a §                                   |
| `Lead approves spec` box                                             | n/a. No spec section. `Plan approved by:` empty; I write neither                                                                                                                                      |
| no settled D-n contradicted                                          | pass. D-19 label named; D-28 tier `high` matches `tier.sh`; D-27 lead's `approve` kept                                                                                                                |
| `next-task.sh --check B1.76`                                         | pass: "[next-task] B1.76: no overlap with any Doing or Review card"                                                                                                                                   |

Costs the lead approves with this plan (each stated in it or in round 1, gathered here):

- one image rebuild and container recreate by the lead; the wrapper stays byte-identical, so run 5's worktree needs no
  merge;
- the wrapper's git sees the credential, never the identity (it makes no commit); the card title and README row 86 keep
  the words "and identity" though the amended Acceptance says none is needed;
- the red is S12 in `sandbox-probe.sh`, not the card's `pr-step-smoke.sh` probe; R15 lands green as a guard;
- S12 proves the login only inside the runner (the fill is skipped on any machine without the marker);
- `draft`, `ready`, `open` in the container rest on `gh`'s own login and on `gh pr create --head` not pushing, which no
  one has run (run 5 is the first proof).

Notes (not reasons):

1. **Mutant attribution.** "B, D–F caught by S12 or the build's read-back" is wrong for B and D: both mutate the
   wrapper (the `compgen` loop; the `GIT_CONFIG_GLOBAL` word plus the loop), which S12 never calls (its `clean()` is its
   own copy of the clearing). The advice's table has them right: B fails R15 case 2, D fails R15 cases 1 and 2. E, F, G
   fail the build's read-back (measured) and S12's first assertion. G to J are missing from the plan's list: G is caught
   as above; H, I, J (S12 self-mutants: no clearing, the root-owned check removed, no `GIT_TERMINAL_PROMPT=0`) are not
   run, which the plan should say rather than leave out. The diff review will expect R15, not S12, to fail under B and D.
2. Old image in the throwaway: S12 prints three `say` lines (helper `none`, `/etc/gitconfig` not root-owned, the
   credential fill failed), because the B1.58 marker is in that image and nothing answers for github.com. The plan names
   two; the count line `1 of 12 probes FAILED` is unaffected.
3. "First commit on the branch" for the card-lines commit: the branch already holds the advice, plan and review
   commits; it means the first commit after approval.
4. The plan is 71 lines (round 1: 61) against `planning.md`'s ≈ 40; not blocked, as in round 1.

Verdict: approved (ready for the lead's gate, not approved for build)

Riskiest unfalsified: `gh pr create --draft --head <branch>` in gh 2.23.0 inside the runner neither pushes nor needs
git's credential; only run 5 tests it.
