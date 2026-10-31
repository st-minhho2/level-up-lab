# E2 · Todos plus: filter, count, mark all, due date, search

Scope ruled by D-20 (2026-10-31). Each card's section and contract file are fixed there; `spec-analyst` lands the
section, the `Spec:` and `Test:` lines when `dev-lead` picks the card. Batch 1 (B2.1–B2.3) keeps each card's logic in its
own modules; `src/app/page.tsx`, `src/lib/todos.ts` and `src/actions/todos.ts` are held by one Doing card at a time.

### B2.1 · Filter the list: All / Active / Completed

_F10 · section 12_
**Status: Done** — 830901d, 7 AC-12.n tests green (unit 119, e2e 16), mutation 89.94

- **Spec:** §12 — unchanged
- **Test:** `src/lib/todo-filter.test.ts::AC-12.1: keeps the todos that match the filter, in input order, and never mutates the input` — red because: `src/lib/todo-filter.ts` and `filterTodos` do not exist yet
- **Acceptance:** AC-12.1 to AC-12.7 (contract `spec/contracts/10-filter.md`)
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B2.1/`

### B2.2 · Show how many todos remain

_F11 · section 13_
**Status: Done** — 0af252c, 7 AC-13.n tests green (unit 130, e2e 21), mutation 90.37

- **Spec:** §13 — unchanged (section written from `work/B2.2/analysis.md`)
- **Test:** `src/lib/todo-count.test.ts::AC-13.1: returns 3 for open, done, open, done, open and leaves the input unchanged` — red because: `src/lib/todo-count.ts` does not exist, `countRemaining` is not exported
- **Acceptance:** AC-13.1 … AC-13.7 (contract `spec/contracts/11-remaining-count.md`)
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B2.2/`

### B2.3 · Mark all todos complete

_F12 · section 14_
**Status: Done** — b3339e0, 6 AC-14.n tests green (unit 138, e2e 24), mutation 90.67

- **Spec:** §14 — unchanged (section written from `work/B2.3/analysis.md`; contract `spec/contracts/12-complete-all.md`)
- **Test:** `src/lib/todo-complete-all.test.ts::AC-14.1: updates exactly the not-completed rows to completed and returns the count` — red because: `completeAllTodos` is not exported from `src/lib/todo-complete-all.ts`
- **Acceptance:** AC-14.1–AC-14.6
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B2.3/`

### B2.4 · An optional due date per todo

_F13 · section 15_
**Status: Open** — `prisma/schema.prisma` `model Todo` has `id`, `title`, `completed`, `createdAt`, `updatedAt`, no due
date; `spec/contracts/01-scope-and-gates.md` §1 lists due dates as not in scope, lifted by D-20

- **Acceptance:** section 15 criteria, set by `spec-analyst` (contract `spec/contracts/13-due-date.md`; needs a migration,
  `/add-migration`)
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** M [estimate]
- **Work:** `work/B2.4/`

### B2.5 · Search todos by title

_F14 · section 16_
**Status: Open** — `git grep -n -i "search" src/app src/components` → no match; `listTodos()` takes no query

- **Acceptance:** section 16 criteria, set by `spec-analyst` (contract `spec/contracts/14-search.md`)
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B2.5/`
