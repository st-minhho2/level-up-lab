# B1.21 plan — Parallel sessions report status: draft PR, a ping when waiting, branches kept current (tooling)

Approach: keep every card branch current and its PR visible; the ping is the lead's choice. spec-analyst/advisor
skipped (no section). Rounds 1 (8 reasons) and 2 (6 reasons, cap) applied below.

**Decision for the lead ((b) recommended).**
(a) `lead-ping.sh` (Stop on dev-lead's two fixed lines, Notification `idle_prompt`, a wait log): never fires for a
dev-lead run as a subagent; waits stay open when a session is closed; up to 3 notifications per gate; one more script
and its probes. (b) no hook: the desktop app notifies when a session ends a turn (not a CLI session), and dev-lead ends
a card turn only at its fixed lines; the step-1d card measures waits from git/gh — plan gate = `<card> plan approved`
commit − the commit before it (misses the first wait when the lead asks for changes), PR = merge time − completion of
the last green `ci` run on the head (proxy: `gh` gives no ready-for-review time without `gh api`). Under (b) this PR
rewrites the card's Acceptance/Test lines to match.

- **Current base** (`scripts/worktree.sh`): `GIT_TERMINAL_PROMPT=0 git fetch origin </dev/null`; failure → warning,
  the last fetched `origin/main` (else `main`), never aborts; default base `origin/main`, `--no-track`; `[base]` wins.
- **Draft PR** (Loop 5, after `approve`): push; `gh pr create --draft` (template: Item, Plan = plan.md, Map delta and
  Review "pending"); label per D-19. Costs: the draft shows only plan commits until Loop 9; opening it and labeling
  start CI on paperwork (one run survives `cancel-in-progress`, ≈ 4 min).
- **Ready** (Loop 9, replaces "PR."): `git fetch && git merge origin/main` (no rebase, no force push). Clean merge →
  `mark-reviewed.sh` again; a conflict → back to Loop 6 (code-writer / test-writer) and Loop 7 (`/review-loop`). Loop
  6's test check becomes `git log --first-parent --no-merges <red>..HEAD -- '*.test.*' e2e/` (a merged sibling's tests
  are not the card's). Push; fill Map delta and Review; wait until a `ci` run exists for the head SHA and is green
  (desktop: PR monitor; CLI: `gh pr checks <n> --watch`, 600 s); red → back through the loop, the PR stays draft;
  green → `gh pr ready` → "PR for <card> is ready for the lead: <url>". Later BEHIND → merge again before the next report.
- `git-workflow.md` "Bringing `main` in" is replaced by the same rule. Plan > 40 lines: the lead accepts or trims.

**Round 2 of the lead (diff review pass 1 found 3 blocking gaps; the fix needs 2 more files):**
the test check becomes two commands everywhere it appears (dev-lead Loop 6, `/tdd-loop` green gate, reviewer's diff
table): `git log --first-parent --no-merges --stat <red>..HEAD -- '*.test.*' e2e/` (the card's own commits) **and**
`git log --first-parent --merges --remerge-diff <red>..HEAD -- '*.test.*' e2e/` (only what a merge's conflict
resolution changed; the reviewer reads it); both empty or explained. `git-workflow.md` "Lifecycle" step 5 says draft
at the gate, ready at Loop 9. BEHIND after `gh pr ready` → `gh pr ready --undo`, merge, green, ready again.
`worktree.sh`: an empty `[base]` means the default; the warning names the base it falls back to; an existing branch
skips the fetch. Probe K5: no `origin/main` ref → base `main`.

## Files

| File                                | Change                                                     |
| ----------------------------------- | ---------------------------------------------------------- |
| `scripts/worktree.sh`               | fetch, fallback, default base `origin/main`, `--no-track`  |
| `scripts/worktree-smoke.sh`         | new: K1–K5 (bare origin, `pnpm` shim, `.env.example`)      |
| `.claude/agents/dev-lead.md`        | Loop 5 draft; Loop 6 test check; Loop 9 merge, ready, line |
| `.claude/skills/work-next/SKILL.md` | gate and exit lines match                                  |
| `.claude/skills/tdd-loop/SKILL.md`  | green-gate test check: own commits + merge resolutions     |
| `.claude/agents/reviewer.md`        | diff table: the same two commands                          |
| `.claude/docs/git-workflow.md`      | "Bringing `main` in" replaced                              |
| `scripts/CLAUDE.md`                 | `worktree.sh` base; smoke row                              |
| `backlog/plan/E1-todos.md`          | (b) only: B1.21 Acceptance/Test lines                      |
| `backlog/work/B1.21/plan.md`        | plan                                                       |
| `backlog/work/B1.21/review.md`      | reviews                                                    |

## Interfaces touched

```bash
scripts/worktree.sh <branch> [base]   # base: origin/main after fetch; offline → warning, last fetched origin/main, else main
scripts/worktree-smoke.sh             # K1–K4; worktree.sh runs to exit 0 with a pnpm shim on PATH and a one-line .env.example
PR line (dev-lead, verbatim): "PR for <card> is ready for the lead: <url>"
```

Probes: K1 local `main` behind `origin/main` → new branch at `origin/main`; K2 no upstream; K3 explicit `[base]` wins;
K4 origin unreachable after one fetch → warning, branch at the last fetched `origin/main`, exit 0.

## Verification (in the card worktree)

```bash
scripts/worktree-smoke.sh   # test commit: K1 K4 FAIL (base = local main), K2 K3 ok; green 4 of 4
scripts/hook-smoke.sh && scripts/ci/check-agent-frontmatter.sh && scripts/ci/check-plan-scope.sh && bash -n scripts/*.sh
```

Steps: `test(scripts)` → `fix(scripts)` → `reviewer` diff → PR labeled `config-change-approved` (D-19). This card
follows the new Loop 5/9 itself from the gate on.

Plan review: changes requested, round 2 (cap); round-1 and round-2 reasons applied above, not re-reviewed · Plan approved by: lead (session reply "approve (b), chấp nhận độ dài"), 2026-10-31 · Rounds: 2 (lead round 2 pending)
