# D-33 request: the batch rule of epic E6

Epic E6 (`plan/E6-todos-cues.md`) runs each batch's three `agent-ready` issues at the same time. Two runs that pick the
same section number, contract file or component would collide with no one there to choose, so what D-30 fixed for E5
must be fixed before the first issue is labelled.

## Options

**A (recommended).** Fix sections, contract files and mounts now, as D-30 did:

| Card | Section | Contract file                                | Mounts in (only)                                                     | Batch |
| ---- | ------- | -------------------------------------------- | -------------------------------------------------------------------- | ----- |
| B6.1 | 29      | `spec/contracts/27-escape-new-todo.md`       | `src/components/todo-form.tsx`                                       | 1     |
| B6.2 | 30      | `spec/contracts/28-filter-counts.md`         | `src/components/todo-filter-nav.tsx`, counts from `src/app/page.tsx` | 1     |
| B6.3 | 31      | `spec/contracts/29-due-today.md`             | `src/components/todo-due-date.tsx`                                   | 1     |
| B6.4 | 32      | `spec/contracts/30-clear-completed-count.md` | `src/components/clear-completed-button.tsx`, count from `page.tsx`   | 2     |
| B6.5 | 33      | `spec/contracts/31-overdue-announce.md`      | `src/components/overdue-count.tsx`                                   | 2     |
| B6.6 | 34      | `spec/contracts/32-remaining-announce.md`    | `src/components/remaining-count.tsx`                                 | 2     |

- One card per batch changes `src/app/page.tsx` (B6.2 in batch 1, B6.4 in batch 2); no two cards in a batch share a
  component. Feature ids F27–F32 in that order.
- Out of scope lines each card may lift, in its own `docs(spec)` commit before any test: B6.2 "counts on the links"
  (§12, `10-filter.md`); B6.3 the due-today case of "a due-soon highlight" (§17, `15-overdue.md`); B6.4 states that
  its label count is not §9's "message showing the deleted count" (`07-clear-completed.md`); B6.5 "announcing changes
  to assistive technology" (§23, `21-overdue-count.md`); B6.6 "live announcement to assistive technology" (§13,
  `11-remaining-count.md`). B6.1 lifts nothing (§5 is silent on Escape).
- No card changes `prisma/`, a dependency or the environment: every plan is medium tier (D-28), so a reviewer-approved
  plan proceeds without the lead (D-27). A plan the tier script rates high stops at the gate as usual.
- The package guides (`src/*/CLAUDE.md`) stay out of card plans, as in E5.
- Each batch's three runs start together (`run.sh <issue>` three times; `--poll` runs issues one after another).

**B.** No batch rule: each run's `spec-analyst` takes the next free section. Cheaper now, but three parallel runs can
claim the same number, and a collision is found only at merge.

## Recommendation

A. It is what D-30 did for E5, and with three runs at once the risk of a shared number or component is higher than
in E5's batches.
