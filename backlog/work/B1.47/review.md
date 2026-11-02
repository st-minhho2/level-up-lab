# B1.47 review

## Plan review (round 1)

The plan reviewed is `8bcf371 docs(backlog): B1.47 plan`. B1.47 is a tier-0 tooling card with no §. Its contract is
the card's Acceptance (`backlog/plan/E1-todos.md` ### B1.47) and `backlog/work/B1.42/spike.md`, "What the runner
(B1.44) must do differently" (findings 1–8). I checked these facts without writing to the tree:

- Red on `8bcf371`: `awk '/^### B1.44 /,/^### B1.45 /' backlog/plan/E1-todos.md | grep -c -- <p>` gives 0 for
  `auth status`, `is_error`, `<UTC timestamp>-<pid>.jsonl`, `per-issue lock`, `--model`, `init`, `tools`,
  `setting-sources` and `claude-code-vm`.
- Green, probed on a scratch copy of `E1-todos.md` with the plan's clause appended verbatim and `B1.45` struck: each of
  the eight patterns gives 1 (`init` measured as ``init` line``). The Acceptance line is 1606 bytes. Over the same
  range, `permission-mode`, `allowedTools`, `stdin` and `frontmatter` give 0.
- B1.45 is Done (`a1f7865`, #159), and README row 56 already shows `~~B1.45~~`. Only the card's Depends line is stale.
- B1.44 is Open/To do. No branch or PR exists for it (`next-task.sh --list`, `git ls-remote`), so changing its
  Acceptance does not move a plan that is in flight.

| Check                                                                             | Result                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: tooling, so there is no § and no map row. All four files are under `backlog/`, which `check-plan-scope.sh` treats as paperwork. The Depends edit (`B1.45` → `~~B1.45~~`) is outside B1.47's Acceptance, but the plan lists it and it matches README row 56 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no code, no action, no Prisma. The plan pastes the exact clause, which is the only "interface"                                                                                                                                                       |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no `advice.md`. The plan states that tier 0 skips the spec-analyst and the advisor                                                                                                                                                                |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | fail: the card lists eight items, all of them carried. Two of the eight have no observable outcome: "`tools` checked" and "kept out of the run". The second rests on a flag the spike marks `[unverified]` (reason 2)                                            |
| verification lists exact commands with expected numbers                           | fail (minor): seven of the eight patterns are exact and reproduce (0 → 1). "`init`…`tools`" is not a pattern that can be run (reason 3)                                                                                                                          |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass (n/a for skeleton, map and mutation: tier 0, no code). The red is measured on the base by grep. Text and review commits use `docs(backlog): B1.47 …`                                                                                                        |
| `Lead approves spec` box ticked only by a human                                   | pass (n/a): there is no section. `Plan approved by:` is empty                                                                                                                                                                                                    |
| no settled D-n contradicted                                                       | pass: D-28 gives low (only `backlog/` rows). D-19 does not apply because no protected file is touched. D-27's gate holds: this card runs interactively, so the lead's approval stays                                                                             |
| `scripts/next-task.sh --check B1.47` says no overlap                              | pass: `[next-task] B1.47: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                     |

### Reasons (numbered)

1. **The plan says it carries "the eight findings of `spike.md`", but it carries B1.47's eight items. Spike findings
   7 and 8 are mostly dropped.**
   - The clause covers spike findings 1–6. From finding 7 it keeps only "check `init.tools`".
   - Two things are dropped without saying so:
     - The rest of finding 7. Use `--tools` + `--permission-mode dontAsk` with narrow allow rules, because
       `--allowedTools` only adds to `settings.json`'s allow list (`Bash(scripts/pr-step.sh *)` stays live) and
       `--tools` drops Bash. Send the prompt on stdin.
     - All of finding 8. Frontmatter hooks fired in 2.1.309 `-p`, and that must be asserted again with a smoke run on
       each `claude` version before an upgrade is trusted.
   - Trigger: B1.44 is built from its amended Acceptance. It restricts tools with `--allowedTools` and upgrades
     `claude` with no smoke run. Every Acceptance clause still passes, but the unattended run keeps `settings.json`'s
     Bash allow rule, and nothing checks that `dev-lead.md`'s `path-guard.sh` still fires.
   - Both are the only two spike findings that concern what an unattended agent is allowed to do. Carrying them is
     still card text in B1.44's Acceptance, so it stays within "card text only; no script change".
   - Fix: either add two short clauses (tool restriction by `--tools` + `dontAsk`, not `--allowedTools`; a hook smoke
     run per `claude --version` before it is used), or keep the clause as it is, correct "the eight findings", and
     name findings 7 (rest) and 8 as dropped with the reason. The lead then approves knowing what is dropped.
   - Confidence: confirmed. Probe greps `permission-mode`, `allowedTools`, `stdin` and `frontmatter` give 0 over B1.44
     after the clause is applied.
2. **Two of the clauses can be met by B1.44 without anything being observed.**
   - "the `init` line's `tools` checked against the expected set" does not say what happens on a mismatch. Trigger:
     `init.tools` holds `Bash` while the role's set does not. A runner that logs the difference and continues meets
     the clause as written.
   - "user-level settings and plugins kept out of the run (`--setting-sources project,local`)" presents the flag as
     the mechanism. Spike finding 6 marks that flag `[unverified]` and offers "a dedicated config" as the
     alternative. Trigger: B1.44 adds the flag and calls the clause met. The spike's own evidence (a user plugin's
     SessionStart hook in every run's stream) may still show up.
   - Fix: give each clause an outcome. For example: "a run whose `init.tools` holds a tool outside the role's set
     stops before its first turn"; "no user-level hook appears in the stream's hook events
     (`--setting-sources project,local` or a dedicated config, `[unverified]`)".
   - Confidence: plausible. I cannot run B1.44, but the text admits both triggers.
3. **One verification pattern is not a command.**
   - "`init`…`tools`" cannot be pasted into `grep -c`. Trigger: the diff reviewer reruns the eight greps and has to
     pick a pattern for this one. Bare `init` and bare `tools` already match other wording in a longer Acceptance.
   - Fix: name it, for example ``grep -c -- "init\` line's \`tools"`` → 1 (my probe used ``init` line`` → 1).
   - Confidence: confirmed.

### Cost for the lead, not blocking

- With this change, B1.44's Acceptance holds about 14 separate obligations at **Tier quick, Size S [estimate]**:
  `tier.sh`, `run.sh` (worktree, limits, retry, log, gate comment), devcontainer firewall, launchd, the 3-PR cap, the
  label, and the eight runner rules.
- `backlog/CLAUDE.md` says one card is one mergeable change of at most M. The plan leaves Size and Tier unchanged.
  Expect B1.44's own plan to split it or re-size it, or the lead can re-size it here.

Verdict: changes requested

Riskiest unfalsified: whether the tool-restriction and hook-per-version findings (spike 7 and 8) are left out of
B1.44 on purpose. The card's Status line does not list them either, so the omission may come from the filing.

## Plan review (round 2)

The plan reviewed is `71a832e docs(backlog): B1.47 plan round 2`. I checked these facts without writing to the tree.
The probe ran on a scratch export of `HEAD`: the plan's clause joined to one line (1592 bytes), appended to B1.44's
Acceptance, and `B1.45` struck.

- Red on `f9225f5`: every listed pattern gives 0 over `awk '/^### B1.44 /,/^### B1.45 /'`.
- Green on the probe: every listed pattern gives 1. The listed patterns are `auth status`, `is_error`,
  `<UTC timestamp>-<pid>.jsonl`, `per-issue lock`, `--model`, ``init` line's `tools``, `setting-sources`,
  `claude-code-vm`, `permission-mode`, `stdin` and `frontmatter`. That is 11 patterns, not 12.
- `diff` HEAD vs probe `E1-todos.md`: 2 changed lines (Acceptance, Depends). `check-backlog.sh` on the probe:
  `[check-backlog] OK: README matches the cards`. `check-plan-scope.sh` passes by construction: every file is under
  `backlog/`.
- Round 1 is addressed. Reason 1: findings 7 and 8 are now carried (`permission-mode`, `stdin`, `frontmatter`, the
  `--allowedTools` rationale). Reason 2: each check now has an outcome. Reason 3: the pattern is named.

| Check                                                                             | Result                                                                                                                                 |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: tooling, no § and no map row; all four files are under `backlog/`                                                                |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no code. The clause is pasted verbatim                                                                                     |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md` (tier 0). The plan states that it carries findings 7 and 8 beyond B1.47's Acceptance list                         |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | fail: one stop rule contradicts the spike's own evidence (reason 1). A spike option is dropped without saying so (reason 3)            |
| verification lists exact commands with expected numbers                           | fail (minor): the plan says "12 patterns" and lists 11 (reason 2). Every listed pattern reproduces 0 → 1                               |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass (n/a for skeleton, map and mutation: tier 0, no code). Red is measured by grep on the base; subjects are `docs(backlog): B1.47 …` |
| `Lead approves spec` box ticked only by a human                                   | pass (n/a): no section. `Plan approved by:` is empty                                                                                   |
| no settled D-n contradicted                                                       | pass: D-28 gives low (only `backlog/`); D-19 does not apply; the lead's gate holds (interactive card, D-27)                            |
| `scripts/next-task.sh --check B1.47` says no overlap                              | pass: `[next-task] B1.47: no overlap with any Doing or Review card` (exit 0)                                                           |

### Reasons (numbered)

1. **The `init.tools` stop rule stops runs the spike shows are normal.**
   - The clause reads: "the run stops when the `init` line's `tools` holds a tool outside the set given (`--tools`
     may add Grep and Glob)".
   - `spike.md` lines 43–44 show what `--tools` does: `--tools Read,Write` gave `["Read","Write","Grep","Glob"]`.
   - Trigger: B1.44 passes `--tools Read,Edit,Write,Bash` for `dev-lead`, and `init.tools` adds Grep and Glob.
   - Read literally, the clause stops every such run before its first turn. The only alternative is a runner that
     exempts Grep and Glob, which the Acceptance does not name.
   - The parenthetical names the cause but does not say whether the run tolerates it. The two readings produce
     opposite behaviour in the one check that bounds what an unattended agent may use.
   - Fix: "stops when `init.tools` holds a tool outside the set given, Grep and Glob excepted (`--tools` adds them)".
     Or, if the intent is strict, say that every run whose `--tools` omits Grep and Glob stops.
   - Confidence: confirmed (traced against the spike's recorded `init` lines).
2. **The verification count is wrong.**
   - The plan says "12 patterns; red measured 0 each" and "the same 12 greps → ≥ 1 each", but it lists 11.
   - Trigger: the diff reviewer reruns the list, gets 11 results and cannot tell whether a pattern is missing.
   - Fix: say 11, or name the missing twelfth. `allowedTools` is the obvious candidate: it gives 1 on the probe.
   - Confidence: confirmed.
3. **Spike finding 1's alternative is dropped without saying so.**
   - The spike says "the macOS binary under `claude-code/<version>/…/MacOS/claude` (or a pinned standalone install)".
     The clause allows only "the macOS app build on the host".
   - Trigger: B1.44 wants a pinned standalone install so that the binary does not change between runs. That is the
     natural way to meet the clause's own "before a new `claude` version is trusted, one smoke run". The Acceptance
     as written forbids it.
   - The app build sits in a per-version directory that the desktop app manages. The runner then has to detect a new
     version itself before each run [unverified that the app auto-updates it].
   - B1.47's Acceptance also says "macOS app build", so the plan follows its card. The approach line still claims
     "all eight findings", though, and this narrowing should be visible to the lead.
   - Fix: append "(or a pinned standalone install)", or name the option as dropped with the reason.
   - Confidence: confirmed (text comparison); the auto-update consequence is plausible.

### Cost for the lead, not blocking

- Round 1's size cost stands and is larger now. B1.44's Acceptance grows to about 17 obligations at **Tier quick,
  Size S [estimate]**. The plan defers the split to B1.44's own plan.
- `plan.md`'s footer still reads `Rounds: 1`.

Verdict: changes requested

Riskiest unfalsified: whether `--setting-sources project,local` keeps a user plugin's SessionStart hook out of a `-p`
run. The clause now makes that observable ("no user-level hook event in the stream"), but the spike marks the flag
`[unverified]`. B1.44 may find that only a dedicated config meets it.

## Diff review (pass 1)

The diff reviewed is `origin/main...HEAD` (merge base `f9225f5`). The one change commit is `c25c4fd docs(backlog): B1.47
B1.44 takes spike findings`, which touches only `backlog/plan/E1-todos.md` (2 lines: B1.44's Acceptance and Depends
on). The other commits are this card's paperwork (`plan.md`, `review.md`, `pr-body.md`). The contract is B1.47's
Acceptance and `backlog/work/B1.42/spike.md`, "What the runner (B1.44) must do differently" (findings 1–8).
Plan round 3 was not re-reviewed (2-round cap); the lead approved it on 2026-11-02, and this pass checks the
diff against that approved plan.

### Command results (last line of each)

| Command                              | Result                                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| `pnpm lint`                          | `All matched files use Prettier code style!` (exit 0)                                         |
| `pnpm typecheck`                     | exit 0                                                                                        |
| `pnpm test`                          | `Tests  202 passed (202)`                                                                     |
| `pnpm test:e2e`                      | `43 passed (1.1m)`                                                                            |
| `pnpm test:mutation`                 | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                |
| `scripts/ci/check-suppressions.sh`   | `OK: no new suppressions`                                                                     |
| `scripts/ci/check-config-change.sh`  | `OK: no protected config changed`                                                             |
| `scripts/ci/check-feat-commits.sh`   | `OK: no feat commit touches tests`                                                            |
| `scripts/ci/check-ac-coverage.sh`    | `OK: every criterion of a shipped section has a test`                                         |
| `scripts/ci/check-spec-sections.sh`  | `OK: sections cited: 1 … 22`                                                                  |
| `scripts/ci/check-features-map.sh`   | `OK`                                                                                          |
| `scripts/ci/check-backlog.sh`        | `OK: README matches the cards`                                                                |
| `scripts/ci/check-plan-scope.sh`     | `OK: docs/B1.47-runner-acceptance stays inside the approved plan of B1.47`                    |
| `scripts/verify-red.sh B1.47`        | `no 'test(<pkg>): B1.47 … (red)' commit`: n/a, tier 0 card text, red measured by grep (below) |
| `scripts/next-task.sh --check B1.47` | `B1.47: no overlap with any Doing or Review card`                                             |
| `git diff --stat origin/main...HEAD` | 4 files, 314 insertions, 2 deletions; all under `backlog/`                                    |
| `git merge-tree origin/main HEAD`    | clean (main moved to `de444dd`, #161 added B1.55–B1.57 to the same file; no conflict)         |

The plan's 12 patterns, `awk '/^### B1.44 /,/^### B1.45 /' backlog/plan/E1-todos.md | grep -c -- <p>`: 0 on
`f9225f5` and 1 on `HEAD` for each of `auth status`, `is_error`, `<UTC timestamp>-<pid>.jsonl`, `per-issue lock`,
`--model`, ``init` line's `tools``, `setting-sources`, `claude-code-vm`, `permission-mode`, `allowedTools`, `stdin`,
`frontmatter`. B1.47's own Test (`auth status`, `is_error`, the per-run log name, the per-issue lock) gives 1 each.

### Checklist

| Check                                                  | Result                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance item has a check whose result matches | pass: B1.47's eight items each map to a clause, and spike findings 7 and 8 are carried as well. Each greps to 1 (above). I compared the text clause by clause against spike findings 1–8 and found no narrowing. Finding 1's standalone install, finding 6's dedicated config and finding 7's Grep/Glob are all present |
| clause is the plan's, verbatim                         | pass: the plan's code block joined to one line `diff`s equal to the text after `(D-19)` on B1.44's Acceptance line                                                                                                                                                                                                      |
| no test weakened                                       | pass (n/a): `git diff --name-only origin/main...HEAD -- '*.test.*' e2e/ src prisma .claude scripts` is empty. There is no red commit and no merge commit                                                                                                                                                                |
| every changed file is in `plan.md`                     | pass: the four files are exactly the plan's Files table. `E1-todos.md` changes 2 lines, as the plan says                                                                                                                                                                                                                |
| interfaces / Zod / Prisma / raw SQL / migration        | pass (n/a): no code                                                                                                                                                                                                                                                                                                     |
| no secret, no suppression                              | pass: `check-suppressions.sh` OK. The text names paths and flags only                                                                                                                                                                                                                                                   |
| features map row moved                                 | pass (n/a): tooling, no § and no map row                                                                                                                                                                                                                                                                                |
| would a check fail if one changed line were reverted   | Acceptance line: yes, all 12 greps drop to 0. Depends line: no. On a scratch copy, reverting `~~B1.45~~` → `B1.45` leaves `check-backlog.sh` OK (it does not compare Depends). That is harmless: the line only syncs the card with README row 56 and B1.45's Done state (#159)                                          |
| no settled D-n contradicted                            | pass: D-28 gives low (`backlog/` only); D-19 does not apply (no label needed); B1.55–B1.57 on main (D-27, D-29) build on B1.44 and do not conflict with the added clause                                                                                                                                                |

### Findings

None blocking.

Not blocking, carried from plan reviews r1 and r2 for the lead: B1.44 now holds about 17 obligations at Tier quick,
Size S [estimate], and its Test line (`run-smoke.sh`, `tier-smoke.sh`) does not yet name a probe for the new clauses.
B1.44's own plan must split or re-size it.

Verdict: ready for PR

Riskiest unfalsified: whether a `--tools` set under `-p --agent dev-lead` also caps the subagents that dev-lead spawns
(test-writer and code-writer need Edit, Write and Bash; dev-lead needs `Agent`). If it does, B1.44 cannot meet "the
tool set given by `--tools`" and the `init.tools` stop rule with a narrow set. I could not run `claude -p` here, and
the spike recorded only `--tools Read,Write` on a single agent.
