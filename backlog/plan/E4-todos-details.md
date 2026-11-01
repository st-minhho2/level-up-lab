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
