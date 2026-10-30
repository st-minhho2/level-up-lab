# backlog/ — what gets built, in what order, by whom

**Eligible** for an agent = a row of README "Remaining" whose "Blocked by" is empty or holds only struck-through
ids (`~~B1.1~~` = done), whose Owner is Lead or Dev, and whose card carries both contract lines below. Owner Human
→ an agent may draft, never decide; those rows live in README "Waiting on human".

**WIP** (B1.18): at most 3 cards Doing, state derived from origin/main, branches and PRs (`scripts/next-task.sh --list`).
Every start goes through `scripts/next-task.sh` (pick) or `scripts/next-task.sh --claim <card>` (by id), then
`scripts/worktree.sh` at once: the branch is the claim. Before a plan review, `scripts/next-task.sh --check <card>`
must report no overlap with a Doing or Review card's plan (paperwork exempt); an overlap waits or re-plans.

## Card layout (`plan/E<epic>-<name>.md`)

```
### B<epic>.<n> · <title>
*F<n> · §<section>*
**Status: Open** — <grep/line evidence of what is missing>        (or Partial — what exists / Done — sha, tests)
- **Spec:** §<n> — unchanged | change: <one sentence>          ← the `spec:` contract line
- **Test:** `<file>::<AC-§.n title>` — red because: <one sentence> ← the `test:` contract line
- **Acceptance:** <the AC ids this card closes>
- **Tier:** 0 | quick | full · **Depends on:** ~~B1.1~~ · **Owner:** Lead | Dev | Human · **Size:** S | M | L [estimate]
- **Work:** `work/B<e>.<n>/` (analysis.md, advice.md, plan.md, review.md as the roles produce them)
```

Tier 0 cards close with `work/<card>/plan.md` and no code. Quick cards skip `advisor` unless `dev-lead` asks.
Missing `Spec:` or `Test:` → not eligible; `dev-lead` first dispatches `spec-analyst` to land them
(`docs(spec): §n …` then `docs(backlog): B<e>.<n> …`). A `Spec:` line saying "change:" needs a D-n before the
section is rewritten (§8).

## Commit order on a card's branch

`docs(spec)` (only if the section changes) → `chore(<pkg>): B<e>.<n> skeleton` → `test(<pkg>): B<e>.<n> … (red)` →
`feat(<pkg>): B<e>.<n> …` → `docs(map): F<n> … [B<e>.<n>]` → `/review-loop` (hardening tests land as
`test(<pkg>): B<e>.<n> review pass N -- …`, without the `(red)` marker: `verify-red.sh` judges only `(red)` commits) → PR (`B<e>.<n>: <summary> (§n) (#PR)`
on squash). `<pkg>` is the `src/` folder: `todos`, `health`, `env`, `ui`.

## Filing a card (one commit, its own PR)

A card found during other work (a spec gap, a tooling bug) is filed alone, before anyone works on it. Filing decides
nothing: the lead rules any D-n later, and `dev-lead` plans the card when it is picked. This checklist is the plan,
so the PR counts as planned (`.claude/rules/planning.md`) and needs no `Plan approved by` line.

1. Add the card at the end of `plan/E<epic>-<name>.md` in the layout above, with the next unused id and
   `**Status: Open** — <grep/line evidence>`. `Spec:` / `Test:` lines only where they need no ruling; without them
   the card is not eligible until `spec-analyst` lands them.
2. `README.md`: fix the status-summary totals, add the "Remaining" row and the card's node in "Execution order"
   (`scripts/ci/check-backlog.sh` fails on wrong totals).
3. Needs a ruling (optional) → `work/<card>/decision-request.md` with the D-n options and the recommended one, a
   "Waiting on human" row `D-<n>`, and `D-<n>` in the card's "Blocked by".
4. Nothing else: no `spec/`, `src/`, test, `00-decisions.md`, `docs/` or `.claude/` change. A PR that touches any
   other file is not this lane and needs a plan line.
5. Commit and PR title `docs(backlog): card B<e>.<n> <summary>`; the PR body names this lane and lists the files.

## Closing a card (one commit, with the PR)

1. Replace the status line: `**Status: Done** — <sha>, <tests that went green>, <mutation %>`.
2. Remove the row from README "Remaining"; strike the id through in other rows' "Blocked by"; fix the totals
   (`scripts/ci/check-backlog.sh` fails otherwise).
3. Flip the feature's status in `spec/features-map.md` and the section's status in `spec/technical-requirements.md`.
4. Merged but not measured → `Partial — merged <sha>, pending <what>`; the row stays.
5. `00-decisions.md` is never rewritten.

## Writing here

Artifacts name **roles, never people**: `lead` approves, `dev-lead` plans, `reviewer` reviews; no personal names
or handles in spec, backlog, work artifacts or decisions (git authorship and CODEOWNERS are the only places a
handle appears). English identifiers; status claims verified by reading code (quote the line). Sizes: S ≤ 1 day · M 2–5 days ·
L > 1 week, always `[estimate]`. One card = one mergeable change (≤ M). Ids `B<epic>.<n>` are permanent, never
reused. Commit prefix `docs(backlog): …`.
