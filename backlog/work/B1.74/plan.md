# B1.74 plan — dev-lead commits a reviewer's review.md that Prettier rejects, formatted and unchanged (tooling, no §)

Approach: **A** (`advice.md`) — one fenced bash block in a new `## Committing a review` section of dev-lead.md, which
Loop 4, Loop 7 and the preamble point to; `hook-smoke.sh` extracts that very block and runs it on scratch files, so the
tested text is the text dev-lead reads. Risk tier **high** (`.claude/` is CONFIG_PROTECTED) → the lead's `approve`;
the PR carries `config-change-approved` (D-19). No `run.sh`, ALLOW or hook change.

Round 2 (plan review r1: 1 reason, "r1" below). **The lead decides at this gate** (defaults proposed):

1. **"Format only" check** (card: `git diff -w`): **replace** it, measured wrong: Prettier turns `|---|` into
   `| ------ |`, `*` into `-`, adds blank lines. Instead compare the letters and digits in order
   (`LC_ALL=C tr -cs '[:alnum:]' ' '`) of the staged reviewer copy and the formatted file, after dropping every `N.` or
   `N)` followed by a space or line end, anywhere in a line, on both sides (r1: Prettier renumbers lists; r2: it joins a
   wrapped line that starts `2)` onto the line above). Lead chose this, option (ii), at the gate. Measured on all 56
   `review.md` files unformatted and re-wrapped at 80–120 columns: 0 rejected, word change still rejected. Costs: blind
   to a change touching no letter or digit (`<`→`>`, an emoji) or only a number written `N.`/`N)` (`(exit 0)`→
   `(exit 1)`); rejects Prettier's number rewrites in a `ts`/`json` code block (`.5`→`0.5`), rare in a review. A
   rejection restores the reviewer's file and stops with "Review for <card> not committed: …" in "Waiting on human"
   (a run: no D-27 line); the lead re-dispatches the reviewer. This PR amends the card's clause (commit
   `docs(backlog): B1.74 Acceptance check clause`).
2. **Root cause** (`format-after-edit.sh` runs Prettier from the parent checkout, where `.prettierignore` skips
   `.worktrees/`; confirmed interactively, unverified in the container): **not here**, a follow-up card (B1.75).
3. **Run 4**: it reads dev-lead.md from its own container worktree (base 5b30ca2, before B1.74) and resumes at the
   review commit, so after this merges: **merge `origin/main` into `chore/B1.66-agent` in the container** (your step,
   or mine with you present), recorded in `live.md`; then run 4. Not: formatting its `review.md` by hand.
4. **This card's own `review.md`** (written before the step is on main): dev-lead runs the same block by hand, as
   the card's Acceptance already allows (used for round 1 before this gate, r1 note 2).

## Files

| File                         | Change                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| `.claude/agents/dev-lead.md` | new `## Committing a review` (block + stop line); preamble, Loop 4, Loop 7 point to it; frontmatter as is |
| `scripts/hook-smoke.sh`      | section "dev-lead formats a reviewer's review.md (B1.74)", probes FR1–FR8 (red first)                     |
| `scripts/CLAUDE.md`          | the `hook-smoke.sh` row names FR1–FR8                                                                     |
| `backlog/plan/E1-todos.md`   | decision 1: B1.74 Acceptance, the check clause only                                                       |
| `backlog/work/B1.74/*`       | advice, plan, review, pr-body                                                                             |

## Interfaces touched

```
dev-lead.md block (from the worktree top level, before every commit holding a review.md):
  f=backlog/work/<card>/review.md
  w() { { cat; echo; } | sed -E 's/[0-9]+[.)]([[:space:]]|$)/ /g' | LC_ALL=C tr -cs '[:alnum:]' ' '; }
  git add "$f" && pnpm exec prettier --write "$f" && [ "$(git show ":$f" | w)" = "$(w < "$f")" ] && git add "$f" \
    || { git restore -- "$f"; git restore --staged -- "$f"; echo "review.md not committed: Prettier failed or changed more than formatting" >&2; false; }
  exit 0 = formatted + staged · else reviewer's text restored, nothing staged → stop: "Review for <card> not committed: …"
hook-smoke FR1 text: section exists, `prettier --write "$f"` and nothing broader; Loop 4, Loop 7, preamble point to it
  FR2 untracked unformatted → formatted, staged · FR3 formatter that also changes a word → rejected, restored, unstaged
  FR4 round 2 appended to a committed round 1 (identity as hook-smoke's gs()) · FR5 already formatted → unchanged
  FR6 Prettier fails → restored · FR7 a misnumbered list (`1. 2. 4.`) → accepted, renumbered, staged (r1)
  FR8 a wrapped line starting `2)` that Prettier joins upward → accepted, staged (r2)
  (block extracted from dev-lead.md; empty block → 99, so nothing passes vacuously; pnpm shim → real Prettier)
```

## Verification

- Red `test(scripts): B1.74 review format probes` (no `(red)` marker, B1.62 #185): `hook-smoke.sh` → FR1–FR8 FAIL (one `probe` each),
  every other probe ok (today "511 probes OK").
- Green `chore(agents): B1.74 dev-lead formats review.md` (no probe file): `hook-smoke.sh` "519 probes OK";
  `check-agent-frontmatter.sh`, `run-smoke.sh` "17 probes OK" (R16 prompt unchanged), `pnpm lint && pnpm typecheck
&& pnpm test` green; `check-plan-scope.sh`, `check-backlog.sh` OK. Advice's ten hand mutants each turn an FR red.
- Run 4 (after merge, decision 3) is the live proof: the run commits `review.md` and reaches the D-27 line.
- Risk not exercised (advice): on a host `run.sh` run (`dontAsk`) the compound block may be denied although bare
  `Bash` is in ALLOW; container runs use bypassPermissions. guard-bash.sh passes it (reviewer r1, bash 3.2 and 5.2).

Steps: 1 red · 2 green · 3 reviewer (diff) · 4 PR. All dev-lead (no `src/`). Not in scope: `format-after-edit.sh`
(B1.75), `run.sh`/ALLOW, `reviewer.md`, the review-loop skill.

Plan review: changes requested, round 2 (cap; r1 list renumbering → fixed; r2 wrapped `N)` lines → option (ii) chosen at the gate) · Plan approved by: lead, 2026-11-03 (option (ii); decisions 2–4 as proposed) · Rounds: 1

Changed after approval (diff review pass 1, 3 findings): `w()` reads `{ cat; echo; }` first, so a review.md with no
final newline (Prettier adds one) is not refused (FR9); FR10 (a changed digit refused) and FR11 (a `1) 2) 4)` list
accepted) pin `[:alnum:]` and `[.)]`; the scratch repositories are removed; hook-smoke 522 probes, `scripts/CLAUDE.md`
names FR1–FR11. Same Files, same block shape; needs the lead's re-approval before ready.
