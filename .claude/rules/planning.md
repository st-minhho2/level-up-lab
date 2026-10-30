---
paths:
  - '**'
---

# Plan first: think before coding

**Mistake this prevents:** an agent that starts editing on the first plausible interpretation, touches six files,
and the reviewer discovers at diff time that the direction was wrong. Re-doing is slower than planning.

## When a plan is required

- Any task that will touch more than one file, or whose scope is unclear after reading the request once.
- A one-sentence diff (rename, typo, a single-line fix with an obvious test) skips the plan; say so in the commit.
- The two fixed lanes in `backlog/CLAUDE.md`, "Filing a card" and "Closing a card", count as planned: the checklist
  is the plan, so their PRs carry no `Plan approved by` line. A PR touching a file outside its lane's checklist is
  not in the lane and needs a plan.

## What a plan is

A read-only step (plan mode: explore, no edits) that ends in a plan that fits on one screen (≈ 40 lines) and names:

1. **Files** to add, change or delete, one line each with the reason (an AC id or a REQ id when a spec exists).
2. **Interfaces touched**: routes, Server Action signatures, Zod schemas, Prisma models, env vars. Paste the
   signature, not prose.
3. **How to verify**: the exact commands and the expected result (`pnpm test` → N tests green, which e2e file,
   mutation score if `src/lib` or `src/actions` change).

A plan that does not fit on one screen is two tasks; split it before asking for approval.

## Approval and changes

- A person approves the plan before any code is written. "Approved" is a reply in the session or a tick in the PR.
- If the direction changes while coding (a file not in the list is needed, an interface changes shape), stop,
  update the plan, get it re-approved, then continue. Never silently extend the Files list.
- The approved plan goes into the PR body (template section "Plan"). Reviewers compare the diff against it: a file
  outside the list, or an interface not in the plan, sends the PR back before any line-level review.

## In the agent pipeline

`backlog/work/<card>/plan.md`, written by the `dev-lead` role, _is_ the plan: same three parts, same one-screen limit,
and the human's `Plan approved by: lead, <date>` line is the approval. The `reviewer`'s plan review runs before the
lead is asked, so the lead approves a reviewed plan, with every cost the review found already stated. `/work-next`
stops at that line and nothing under `src/` changes before it exists. The PR body copies `plan.md` into the
template's Plan section.
