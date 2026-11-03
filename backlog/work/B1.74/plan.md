# B1.74 plan — dev-lead commits a reviewer's review.md that Prettier rejects, formatted and unchanged (tooling, no §)

Approach: **A** (`advice.md`) — one fenced bash block in a new `## Committing a review` section of dev-lead.md, which
Loop 4, Loop 7 and the preamble point to; `hook-smoke.sh` extracts that very block and runs it on scratch files, so the
tested text is the text dev-lead reads. Risk tier **high** (`.claude/` is CONFIG_PROTECTED) → the lead's `approve`;
the PR carries `config-change-approved` (D-19). No `run.sh`, ALLOW or hook change.

**The lead decides at this gate** (defaults proposed):

1. **"Format only" check** (card: `git diff -w`): **replace** it, measured wrong: Prettier turns `|---|` into
   `| ------ |`, `*` into `-`, adds blank lines, so `git diff -w` rejects every real reformat. Instead compare the
   letters and digits in order (`LC_ALL=C tr -cs '[:alnum:]' ' '`) of the staged reviewer copy and the formatted file.
   Cost: blind to a change touching no letter or digit (`<`→`>`, an emoji). This PR amends the card's clause.
2. **Root cause** (`format-after-edit.sh` runs Prettier from the parent checkout, where `.prettierignore` skips
   `.worktrees/`; confirmed interactively, unverified in the container): **not here**, a follow-up card (B1.75).
3. **Run 4**: it reads dev-lead.md from its own container worktree (base 5b30ca2, before B1.74) and resumes at the
   review commit, so after this merges: **merge `origin/main` into `chore/B1.66-agent` in the container** (your step,
   or mine with you present), recorded in `live.md`; then run 4. Not: formatting its `review.md` by hand.
4. **This card's own `review.md`** (written before the step is on main): dev-lead runs the same block by hand.

## Files

| File                         | Change                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| `.claude/agents/dev-lead.md` | new `## Committing a review` (block + stop line); preamble, Loop 4, Loop 7 point to it; frontmatter as is |
| `scripts/hook-smoke.sh`      | section "dev-lead formats a reviewer's review.md (B1.74)", probes FR1–FR6 (red first)                     |
| `scripts/CLAUDE.md`          | the `hook-smoke.sh` row names FR1–FR6                                                                     |
| `backlog/plan/E1-todos.md`   | decision 1: B1.74 Acceptance, the check clause only                                                       |
| `backlog/work/B1.74/*`       | advice, plan, review, pr-body                                                                             |

## Interfaces touched

```
dev-lead.md block (from the worktree top level, before every commit holding a review.md):
  f=backlog/work/<card>/review.md; w() { LC_ALL=C tr -cs '[:alnum:]' ' '; }
  git add "$f" && pnpm exec prettier --write "$f" && [ "$(git show ":$f" | w)" = "$(w < "$f")" ] && git add "$f" \
    || { git restore -- "$f"; git restore --staged -- "$f"; echo "review.md not committed: Prettier failed or changed more than formatting" >&2; false; }
  exit 0 = formatted + staged · else reviewer's text restored, nothing staged → stop: "Review for <card> not committed: …"
hook-smoke FR1 text: section exists, `prettier --write "$f"` and nothing broader; Loop 4, Loop 7, preamble point to it
  FR2 untracked unformatted → formatted, staged · FR3 formatter that also changes a word → rejected, restored, unstaged
  FR4 round 2 appended to a committed round 1 · FR5 already formatted → unchanged · FR6 Prettier fails → restored
  (block extracted from dev-lead.md; empty block → 99, so nothing passes vacuously; pnpm shim → real Prettier)
```

## Verification

- Red `test(scripts): B1.74 review format probes` (no `(red)` marker, B1.62 #185): `hook-smoke.sh` → FR1–FR6 FAIL,
  every other probe ok (today "511 probes OK").
- Green `chore(agents): B1.74 dev-lead formats review.md` (no probe file): `hook-smoke.sh` "517 probes OK";
  `check-agent-frontmatter.sh`, `run-smoke.sh` "17 probes OK" (R16 prompt unchanged), `pnpm lint && pnpm typecheck
&& pnpm test` green; `check-plan-scope.sh`, `check-backlog.sh` OK. Advice's ten hand mutants each turn an FR red.
- Run 4 (after merge, decision 3) is the live proof: the run commits `review.md` and reaches the D-27 line.

Steps: 1 red · 2 green · 3 reviewer (diff) · 4 PR. All dev-lead (no `src/`). Not in scope: `format-after-edit.sh`
(B1.75), `run.sh`/ALLOW, `reviewer.md`, the review-loop skill.

Plan review: · Plan approved by: · Rounds: 1
