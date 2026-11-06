# E5 · Todos keys and glance: overdue count, Escape, slash, tab title

Epic E5 is the proof of autonomous delivery (D-29): each card runs from an `agent-ready` issue through the headless
runner (`scripts/agent/run.sh`) in the runner container, measured by `scripts/metrics/unattended.sh` and
`no-rework.sh`. Batch 1 is B5.1–B5.3, batch 2 is B5.4–B5.6. Section numbers, contract files, the component each card
mounts in and the one card per batch that changes `src/app/page.tsx` are fixed by D-30 (`00-decisions.md`);
`spec-analyst` lands each section and the `Spec:` and `Test:` lines when the run picks the card. No card changes
`prisma/`, a dependency or the environment, so every plan is medium tier (D-28).

### B5.1 · Show how many open todos are overdue

_F21 · section 23_
**Status: Done** — a03a9ea (#216), 7 AC-23.n tests green (unit 213, e2e 45), mutation 93.52 (overdue-count.ts 100); unattended and no-rework 1/1 (D-29)

- **Spec:** §23 — unchanged (section written from `work/B5.1/analysis.md`; contract `spec/contracts/21-overdue-count.md`)
- **Test:** `src/lib/overdue-count.test.ts::AC-23.1: counts 2 overdue of the six todos for today 2026-11-01, 0 for [], and leaves the input unchanged` — red because: `countOverdue` is not exported yet (`src/lib/overdue-count.ts` does not exist)
- **Acceptance:** a count of open todos past their due day (§17's rule), shown next to §13's count and hidden at 0; mounts in a new component rendered by `src/app/page.tsx` (the batch's one `page.tsx` card); contract `spec/contracts/21-overdue-count.md` (section 23); batch 1
- **Tier:** full · **Depends on:** ~~D-30~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B5.1/`

### B5.2 · Escape cancels a title edit

_F22 · section 24_
**Status: Done** — 6562b3f (#211), 6 AC-24.n tests green (unit 207, e2e 44), mutation 93.40; unattended and no-rework 1/1 (D-29)

- **Spec:** §24 — unchanged (section written from `work/B5.2/analysis.md`; contract `spec/contracts/22-escape-edit-title.md`; Escape lifted from §6's Out of scope in the same lane, D-30)
- **Test:** `src/components/todo-item.test.tsx::AC-24.1: Escape in the title field leaves edit mode, shows the stored title "Buy mik" and makes 0 updateTodoTitleAction calls` — red because: `TodoItem` has no Escape handling, so the text field stays after the key press
- **Acceptance:** Escape in the title field closes the edit and keeps the stored title, with no Server Action call; mounts in `src/components/todo-item.tsx` only; lifts Escape from §6's Out of scope in its own `docs(spec)` commit; contract `spec/contracts/22-escape-edit-title.md` (section 24); batch 1
- **Tier:** full · **Depends on:** ~~D-30~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B5.2/`

### B5.3 · The slash key focuses the search box

_F23 · section 25_
**Status: Done** — 9bb37ab (#221), 6 AC-25.n tests green (unit 218, e2e 46), mutation 92.18 (search-shortcut.ts 82.98); unattended and no-rework 1/1 (D-29), but the run stopped once for the lead's D-31 ruling

- **Spec:** §25 — unchanged (section written from `work/B5.3/analysis.md`; contract `spec/contracts/23-search-shortcut.md`; keyboard shortcuts lifted from §16's Out of scope in the same lane, D-30)
- **Test:** `src/lib/search-shortcut.test.ts::AC-25.1: isSearchShortcut is true for / outside a text-entry element, false inside an input, textarea, select or contenteditable, false with Ctrl, Meta or Alt, and false for any other key` — red because: `isSearchShortcut` is not exported yet (`src/lib/search-shortcut.ts` does not exist)
- **Acceptance:** `/` pressed outside any text field focuses the "Search" box and types nothing; ignored while a field has focus; mounts in `src/components/todo-search-form.tsx` only; lifts keyboard shortcuts from §16's Out of scope in its own `docs(spec)` commit; contract `spec/contracts/23-search-shortcut.md` (section 25); batch 1
- **Tier:** full · **Depends on:** ~~D-30~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B5.3/`

### B5.4 · The browser tab title shows the remaining count

_F24 · section 26_
**Status: Done** — bd99f86 (#229), 7 AC-26.n tests green (unit 222, e2e 50), mutation 92.31 (page-title.ts 100); unattended and no-rework 1/1 (D-29), one runner run

- **Spec:** §26 — unchanged (section written from `work/B5.4/analysis.md`; contract `spec/contracts/24-page-title.md`; "a count in the page title" lifted from §13's Out of scope in the same lane, D-32)
- **Test:** `src/lib/page-title.test.ts::AC-26.1: pageTitle returns Todos for 0 and (N) Todos for 1, 2, 11 and 1000` — red because: `pageTitle` is not exported yet (`src/lib/page-title.ts` does not exist)
- **Acceptance:** the document title reads `(n) Todos` while n > 0 open todos remain (§13's count) and `Todos` at 0; `generateMetadata` in `src/app/page.tsx` (the batch's one `page.tsx` card); contract `spec/contracts/24-page-title.md` (section 26); batch 2
- **Tier:** full · **Depends on:** ~~D-30~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B5.4/`

### B5.5 · Escape clears the search box

_F25 · section 27_
**Status: Open** — clearing a search takes §21's link or deleting the text by hand (`grep -n 'Escape' src/components/todo-search-form.tsx` → 0)

- **Acceptance:** Escape in the "Search" box empties it and shows the list §21's link shows (same address); mounts in `src/components/todo-search-form.tsx` only (B5.3 changed it in batch 1); contract `spec/contracts/25-escape-search.md` (section 27); batch 2
- **Tier:** full · **Depends on:** ~~D-30~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B5.5/`

### B5.6 · Escape closes the due-date editor without saving

_F26 · section 28_
**Status: Open** — §15's editor closes only on save (`grep -n 'Escape' src/components/todo-due-date.tsx` → 0)

- **Acceptance:** Escape in the "Due date" field closes the editor, keeps the stored due date and calls no Server Action; mounts in `src/components/todo-due-date.tsx` only; contract `spec/contracts/26-escape-due-date.md` (section 28); batch 2
- **Tier:** full · **Depends on:** ~~D-30~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B5.6/`
