# E2 · Todos plus: filter, count, mark all, due date, search

Scope ruled by D-20 (2026-10-31). Each card's section and contract file are fixed there; `spec-analyst` lands the
section, the `Spec:` and `Test:` lines when `dev-lead` picks the card. Batch 1 (B2.1–B2.3) keeps each card's logic in its
own modules; `src/app/page.tsx`, `src/lib/todos.ts` and `src/actions/todos.ts` are held by one Doing card at a time.

### B2.1 · Filter the list: All / Active / Completed

_F10 · section 12_
**Status: Open** — `git grep -n "searchParams" src/app src/lib` → no match; `src/lib/todos.ts:20`
`export async function listTodos(): Promise<Todo[]>` takes no filter; `spec/contracts/03-todos.md` "Out of scope" lists
filtering, lifted by D-20

- **Acceptance:** section 12 criteria, set by `spec-analyst` (contract `spec/contracts/10-filter.md`)
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B2.1/`

### B2.2 · Show how many todos remain

_F11 · section 13_
**Status: Open** — `git grep -n -i "remaining" src/` → no match; `src/app/page.tsx` renders the form, the clear button
and the list, no count

- **Spec:** §13 — unchanged (section written from `work/B2.2/analysis.md`)
- **Test:** `src/lib/todo-count.test.ts::AC-13.1: counts the todos whose completed is false and leaves the input unmodified` — red because: `src/lib/todo-count.ts` does not exist, `countRemaining` is not exported
- **Acceptance:** AC-13.1 … AC-13.7 (contract `spec/contracts/11-remaining-count.md`)
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B2.2/`

### B2.3 · Mark all todos complete

_F12 · section 14_
**Status: Open** — `git grep -n "export async function" src/actions/todos.ts` → create, toggle, update title, clear
completed; no action completes every todo

- **Acceptance:** section 14 criteria, set by `spec-analyst` (contract `spec/contracts/12-complete-all.md`)
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
