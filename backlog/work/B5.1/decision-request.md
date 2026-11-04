# D-30 request: the batch rule of epic E5

Epic E5 (`plan/E5-todos-keys.md`) is the proof run of autonomous delivery (D-29). Its cards run unattended, so what a
person fixed per batch before (D-24 for batch 4) must be fixed before the first issue is labelled: two runs that
pick the same section number or edit the same component would collide with no one there to choose.

## Options

**A (recommended).** Fix sections, contract files and mounts now, as D-24 did:

| Card | Section | Contract file                            | Mounts in (only)                                | Batch |
| ---- | ------- | ---------------------------------------- | ----------------------------------------------- | ----- |
| B5.1 | 23      | `spec/contracts/21-overdue-count.md`     | a new component, rendered by `src/app/page.tsx` | 1     |
| B5.2 | 24      | `spec/contracts/22-escape-edit-title.md` | `src/components/todo-item.tsx`                  | 1     |
| B5.3 | 25      | `spec/contracts/23-search-shortcut.md`   | `src/components/todo-search-form.tsx`           | 1     |
| B5.4 | 26      | `spec/contracts/24-page-title.md`        | `generateMetadata` in `src/app/page.tsx`        | 2     |
| B5.5 | 27      | `spec/contracts/25-escape-search.md`     | `src/components/todo-search-form.tsx`           | 2     |
| B5.6 | 28      | `spec/contracts/26-escape-due-date.md`   | `src/components/todo-due-date.tsx`              | 2     |

- One card per batch changes `src/app/page.tsx` (B5.1 in batch 1, B5.4 in batch 2); no two cards in a batch share
  a component.
- B5.2 lifts "Cancelling an edit (Escape/blur)" from §6's Out of scope, and B5.3 lifts keyboard shortcuts from §16's
  Out of scope, each in its own `docs(spec)` commit (as B4.2 did for §16 under D-24).
- No card changes `prisma/`, a dependency or the environment: every plan is medium tier (D-28), so a reviewer-approved
  plan proceeds without the lead (D-27). A plan the tier script rates high stops at the gate as usual.
- The package guides (`src/*/CLAUDE.md`) stay out of card plans, as in batch 4.

**B.** No batch rule: each run's `spec-analyst` takes the next free section. Cheaper now, but parallel runs can
claim the same number, and a collision is found only at merge.

## Recommendation

A. It is what D-24 did for batch 4, and it keeps each run inside files no other run of its batch touches.
