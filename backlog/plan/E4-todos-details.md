# E4 · Todos details: created date, clear search, all done

Batch 4 of parallel delivery, ruled by D-24 (2026-11-01) under D-22. Each card's section and contract file are fixed
there; `spec-analyst` lands the section, the `Spec:` and `Test:` lines when `dev-lead` picks the card. Each card mounts
its UI in a component no other card in the batch changes; no card changes `src/app/page.tsx`; package guides
(`src/*/CLAUDE.md`) stay out of card plans. Batch 4 is also B1.23's live check (`scripts/pr-step.sh`).

### B4.1 · Show each todo's creation date

_F18 · section 20_
**Status: Open** — `git grep -n -i createdAt src/components` (tests aside) → no match: `src/components/todo-item.tsx` renders the title, checkbox, due date and delete button, not when the todo was created

- **Acceptance:** section 20 criteria, set by `spec-analyst` (contract `spec/contracts/18-created-date.md`; mounts in `src/components/todo-item.tsx` only)
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B4.1/`

### B4.2 · Clear the search with one link

_F19 · section 21_
**Status: Open** — `git grep -n -i clear src/components/todo-search-form.tsx` → no match; `spec/contracts/14-search.md` "Out of scope" lists "a 'clear search' link", lifted by D-24

- **Acceptance:** section 21 criteria, set by `spec-analyst` (contract `spec/contracts/19-clear-search.md`; mounts in `src/components/todo-search-form.tsx` only)
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B4.2/`

### B4.3 · Say "all done" when every todo is completed

_F20 · section 22_
**Status: Open** — `src/lib/todo-count.ts:8` returns only `N item(s) left`; `git grep -n -i "all done" src/` → no match

- **Spec:** §22 — unchanged (section written from `work/B4.3/analysis.md`; contract `spec/contracts/20-all-done.md`)
- **Test:** `src/lib/todo-count.test.ts::AC-22.1: returns "All done" for 0 and undefined for 1, 2 and 11` — red because: `allDoneMessage` is not exported from `src/lib/todo-count.ts`
- **Acceptance:** AC-22.1 to AC-22.7 (contract `spec/contracts/20-all-done.md`; mounts in `src/components/remaining-count.tsx` only)
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B4.3/`
