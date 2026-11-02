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
