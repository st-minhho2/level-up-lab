# E3 · Todos polish: overdue marker, title counter, delete

Batch 3 of parallel delivery, ruled by D-22 (2026-11-01). Each card's section and contract file are fixed there;
`spec-analyst` lands the section, the `Spec:` and `Test:` lines when `dev-lead` picks the card. Each card mounts its UI in
a component no other card in the batch changes; no card changes `src/app/page.tsx`; package guides (`src/*/CLAUDE.md`)
stay out of card plans.

### B3.1 · Mark overdue todos

_F15 · section 17_
**Status: Open** — `git grep -n -i overdue src/` → no match; `src/components/todo-due-date.tsx` (§15) shows the date the same way whether it has passed or not

- **Acceptance:** section 17 criteria, set by `spec-analyst` (contract `spec/contracts/15-overdue.md`; mounts in `src/components/todo-due-date.tsx` only)
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B3.1/`

### B3.2 · Show a character counter while typing a title

_F16 · section 18_
**Status: Open** — `src/components/todo-form.tsx:36` sets `maxLength={200}` (D-5) with no visible count of characters used or left

- **Spec:** §18 — unchanged (section written from `work/B3.2/analysis.md`; contract `spec/contracts/16-title-counter.md`)
- **Test:** `src/lib/title-count.test.ts::AC-18.1: counts the trimmed value in UTF-16 code units: 0 for '' and '   ', 8 for 'Buy milk', 200 for 5 spaces + 200 x + 5 spaces, 201 for 201 x, 2 for an emoji` — red because: `src/lib/title-count.ts` does not exist, `titleCharacterCount` is not exported
- **Acceptance:** section 18 criteria, set by `spec-analyst` (contract `spec/contracts/16-title-counter.md`; mounts in `src/components/todo-form.tsx` only)
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B3.2/`

### B3.3 · Delete a todo

_F17 · section 19_
**Status: Open** — `git grep -n -i delete src/actions src/components` → only §9's clear completed; `spec/contracts/03-todos.md` "Out of scope" lists deleting a todo, lifted by D-22

- **Acceptance:** section 19 criteria, set by `spec-analyst` (contract `spec/contracts/17-delete.md`; mounts in `src/components/todo-item.tsx` only; action and lib in own modules)
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B3.3/`
