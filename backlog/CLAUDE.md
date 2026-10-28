# backlog/ — what gets built, in what order, by whom

**Eligible** for an agent = a row of README "Remaining" whose "Blocked by" is empty or holds only struck-through
ids (`~~B1.1~~` = done), whose Owner is Lead or Dev, and whose card carries both contract lines below. Owner Human
→ an agent may draft, never decide; those rows live in README "Waiting on human".

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
