## Item

B1.47 — B1.44's acceptance takes the B1.42 spike findings (tooling, no spec section)

- spec: none — tooling (D-27, D-28, D-29); no `src/` change, no section
- test: 12 `grep -c` patterns over the B1.44 card — red before (0 each on `f9225f5`), green after (≥ 1 each)
- acceptance: B1.44's Acceptance carries the eight spike findings of `backlog/work/B1.42/spike.md`; card text only
- risk tier: low (D-28, `backlog/` only); no protected path, no label

## Plan

### B1.47 plan — B1.44's acceptance takes the B1.42 spike findings (tooling)

Approach: card text only (tier 0; spec-analyst and advisor skipped): append all eight findings of
`work/B1.42/spike.md` ("What the runner (B1.44) must do differently") to B1.44's Acceptance: B1.47's Acceptance list,
plus finding 7 (`--tools`, `dontAsk`, stdin) and finding 8 (frontmatter hooks per version), which its Status line
omits (plan review r1 #1). Each clause says what the runner does when the check fails (r1 #2). Risk tier **low** (D-28: only `backlog/`); no script, CI or `.claude/` change, no label.

#### Files

| File                            | Change                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| `backlog/plan/E1-todos.md`      | B1.44 Acceptance: append the clause below; Depends on `B1.45` → `~~B1.45~~` (merged) |
| `backlog/work/B1.47/plan.md`    | this plan                                                                            |
| `backlog/work/B1.47/review.md`  | plan and diff reviews                                                                |
| `backlog/work/B1.47/pr-body.md` | PR body                                                                              |

#### Interfaces touched

None (no script, no route, no schema). The clause appended to B1.44's `- **Acceptance:**` line, verbatim:

```
; from B1.42's spike (`work/B1.42/spike.md`, "What the runner (B1.44) must do differently"): before a run,
`claude auth status --json` must report `loggedIn true`, else the run stops with a clear message (the desktop
app's login never reaches a child `claude`); one log per run, `~/.level-up-lab/runs/<issue>/<UTC timestamp>-<pid>.jsonl`
(+ `.err`, `.exit`), never shared, and one run per issue at a time (a per-issue lock); `--max-budget-usd` set one turn
below what a run may spend (the limit is checked after a turn); the outcome read from the stream's last line,
`is_error` first, then `subtype` (`error_max_turns`, `error_max_budget_usd`), never the exit code alone; `--model`
pinned (`model: inherit` resolves to the login's default); the tool set given by `--tools` and permissions by
`--permission-mode dontAsk` with narrow allow rules (`--allowedTools` only adds to `settings.json`'s allow list, so
`Bash(scripts/pr-step.sh *)` stays live), the prompt on stdin, and the run stops when the `init` line's `tools` holds a
tool outside the set given plus Grep and Glob (which `--tools` adds); user-level settings, plugins and hooks kept out of the
run (`--setting-sources project,local` or a dedicated config, shown by no user-level hook event in the stream), or the
reason they stay written in the plan; the binary named per host with its `--version` in the log: the macOS app build
or a pinned standalone install on the host, the Linux build (`claude-code-vm`) in the devcontainer, verified there; before a new `claude` version is
trusted, one smoke run shows `dev-lead`'s frontmatter hooks fire under `-p --agent dev-lead`
```

(One line in the file; wrapped here for reading.)

#### Verification

- Red, measured on `f9225f5`: `awk '/^### B1.44 /,/^### B1.45 /' backlog/plan/E1-todos.md | grep -c -- <p>` → 0 for
  each of `auth status`, `is_error`, `<UTC timestamp>-<pid>.jsonl`, `per-issue lock`, `--model`, ``init` line's `tools``,
  `setting-sources`, `claude-code-vm`, `permission-mode`, `allowedTools`, `stdin`, `frontmatter` (12 patterns; red measured 0 each).
- Green: the same 12 greps → ≥ 1 each; `git diff origin/main -- backlog/plan/E1-todos.md` changes only B1.44's
  Acceptance and Depends on lines (2 lines).
- `scripts/ci/check-backlog.sh` OK (totals unchanged: no card added or closed); `scripts/ci/check-plan-scope.sh` OK.

#### Work breakdown

| Step     | Role / skill    | Produces                | Commit                                            |
| -------- | --------------- | ----------------------- | ------------------------------------------------- |
| 1 text   | dev-lead        | B1.44 Acceptance clause | `docs(backlog): B1.47 B1.44 takes spike findings` |
| 2 review | reviewer (diff) | `review.md`             | `docs(backlog): B1.47 review`                     |

Not in scope: B1.44's plan and scripts (B1.44 itself), the closing of B1.47 (closing lane after merge).

Round 3 (plan review r1: 3 reasons, r2: 3 reasons, all addressed; round 3 not re-reviewed, 2-round cap). Not in this card: B1.44's size (S, quick) no longer fits
its Acceptance; B1.44's own plan puts a split to the lead (r1 note).

Plan review: changes requested, round 2 (3 reasons carried into round 3, not re-reviewed: 2-round cap) · Plan approved by: lead, 2026-11-02 · Rounds: 1

## Map delta

None (tooling card text; no feature row).

## Review

`/review-loop`: pass 1 of 3, ready for PR, 0 findings. From `backlog/work/B1.47/review.md`:

### Diff review (pass 1)

The diff reviewed is `origin/main...HEAD` (merge base `f9225f5`). The one change commit is `c25c4fd docs(backlog): B1.47
B1.44 takes spike findings`, which touches only `backlog/plan/E1-todos.md` (2 lines: B1.44's Acceptance and Depends
on). The other commits are this card's paperwork (`plan.md`, `review.md`, `pr-body.md`). The contract is B1.47's
Acceptance and `backlog/work/B1.42/spike.md`, "What the runner (B1.44) must do differently" (findings 1–8).
Plan round 3 was not re-reviewed (2-round cap); the lead approved it on 2026-11-02, and this pass checks the
diff against that approved plan.

#### Command results (last line of each)

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

#### Checklist

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

#### Findings

None blocking.

Not blocking, carried from plan reviews r1 and r2 for the lead: B1.44 now holds about 17 obligations at Tier quick,
Size S [estimate], and its Test line (`run-smoke.sh`, `tier-smoke.sh`) does not yet name a probe for the new clauses.
B1.44's own plan must split or re-size it.

Verdict: ready for PR

Riskiest unfalsified: whether a `--tools` set under `-p --agent dev-lead` also caps the subagents that dev-lead spawns
(test-writer and code-writer need Edit, Write and Bash; dev-lead needs `Agent`). If it does, B1.44 cannot meet "the
tool set given by `--tools`" and the `init.tools` stop rule with a narrow set. I could not run `claude -p` here, and
the spike recorded only `--tools Read,Write` on a single agent.

## Evidence

- AC met: 8/8 (spike findings 1–8 in B1.44's Acceptance; 12/12 grep patterns)
- tier: pending
- plan deviations: none
- trace: n/a

## Checklist

- [x] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [x] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**` (no test, no feat commit).
- [x] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 % (n/a: no section, no `src/`).
- [x] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change.
- [x] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed (n/a).
- [ ] `spec/features-map.md` row moved (n/a); `docs/metrics.md` per-card row filled at closing.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
