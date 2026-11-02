# B1.47 plan — B1.44's acceptance takes the B1.42 spike findings (tooling)

Approach: card text only (tier 0; spec-analyst and advisor skipped): append all eight findings of
`work/B1.42/spike.md` ("What the runner (B1.44) must do differently") to B1.44's Acceptance: B1.47's Acceptance list,
plus finding 7 (`--tools`, `dontAsk`, stdin) and finding 8 (frontmatter hooks per version), which its Status line
omits (plan review r1 #1). Each clause says what the runner does when the check fails (r1 #2). Risk tier **low** (D-28: only `backlog/`); no script, CI or `.claude/` change, no label.

## Files

| File                            | Change                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| `backlog/plan/E1-todos.md`      | B1.44 Acceptance: append the clause below; Depends on `B1.45` → `~~B1.45~~` (merged) |
| `backlog/work/B1.47/plan.md`    | this plan                                                                            |
| `backlog/work/B1.47/review.md`  | plan and diff reviews                                                                |
| `backlog/work/B1.47/pr-body.md` | PR body                                                                              |

## Interfaces touched

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

## Verification

- Red, measured on `f9225f5`: `awk '/^### B1.44 /,/^### B1.45 /' backlog/plan/E1-todos.md | grep -c -- <p>` → 0 for
  each of `auth status`, `is_error`, `<UTC timestamp>-<pid>.jsonl`, `per-issue lock`, `--model`, ``init` line's `tools``,
  `setting-sources`, `claude-code-vm`, `permission-mode`, `allowedTools`, `stdin`, `frontmatter` (12 patterns; red measured 0 each).
- Green: the same 12 greps → ≥ 1 each; `git diff origin/main -- backlog/plan/E1-todos.md` changes only B1.44's
  Acceptance and Depends on lines (2 lines).
- `scripts/ci/check-backlog.sh` OK (totals unchanged: no card added or closed); `scripts/ci/check-plan-scope.sh` OK.

## Work breakdown

| Step     | Role / skill    | Produces                | Commit                                            |
| -------- | --------------- | ----------------------- | ------------------------------------------------- |
| 1 text   | dev-lead        | B1.44 Acceptance clause | `docs(backlog): B1.47 B1.44 takes spike findings` |
| 2 review | reviewer (diff) | `review.md`             | `docs(backlog): B1.47 review`                     |

Not in scope: B1.44's plan and scripts (B1.44 itself), the closing of B1.47 (closing lane after merge).

Round 3 (plan review r1: 3 reasons, r2: 3 reasons, all addressed; round 3 not re-reviewed, 2-round cap). Not in this card: B1.44's size (S, quick) no longer fits
its Acceptance; B1.44's own plan puts a split to the lead (r1 note).

Plan review: changes requested, round 2 (3 reasons carried into round 3, not re-reviewed: 2-round cap) · Plan approved by: · Rounds: 1
