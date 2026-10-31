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

- **Acceptance:** section 13 criteria, set by `spec-analyst` (contract `spec/contracts/11-remaining-count.md`)
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B2.2/`

### B2.3 · Mark all todos complete

_F12 · section 14_
**Status: Open** — `git grep -n "export async function" src/actions/todos.ts` → create, toggle, update title, clear
completed; no action completes every todo

- **Acceptance:** section 14 criteria, set by `spec-analyst` (contract `spec/contracts/12-complete-all.md`)
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B2.3/`
