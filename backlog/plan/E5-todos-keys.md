# E5 · Todos keys and glance: overdue count, Escape, slash, tab title

Epic E5 is the proof of autonomous delivery (D-29): each card runs from an `agent-ready` issue through the headless
runner (`scripts/agent/run.sh`) in the runner container, measured by `scripts/metrics/unattended.sh` and
`no-rework.sh`. Batch 1 is B5.1–B5.3, batch 2 is B5.4–B5.6. Section numbers, contract files, the component each card
mounts in and the one card per batch that changes `src/app/page.tsx` are fixed by D-30 (`00-decisions.md`);
`spec-analyst` lands each section and the `Spec:` and `Test:` lines when the run picks the card. No card changes
`prisma/`, a dependency or the environment, so every plan is medium tier (D-28).

### B5.1 · Show how many open todos are overdue

_F21 · section 23_
**Status: Open** — the header shows only the remaining count (`src/components/remaining-count.tsx` renders `remainingLabel(count)` and §22's message; `grep -rn 'overdue' src/components/remaining-count.tsx` → 0), so a person must scan every row for §17's `Overdue` marker

- **Acceptance:** a count of open todos past their due day (§17's rule), shown next to §13's count and hidden at 0; mounts in a new component rendered by `src/app/page.tsx` (the batch's one `page.tsx` card); contract `spec/contracts/21-overdue-count.md` (section 23); batch 1
- **Tier:** full · **Depends on:** ~~D-30~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B5.1/`

### B5.2 · Escape cancels a title edit

_F22 · section 24_
**Status: Open** — §6 lists "Cancelling an edit (Escape/blur)" under Out of scope (`spec/contracts/04-edit-title.md:54`): a person who opens an edit by mistake can leave it only by saving

- **Acceptance:** Escape in the title field closes the edit and keeps the stored title, with no Server Action call; mounts in `src/components/todo-item.tsx` only; lifts Escape from §6's Out of scope in its own `docs(spec)` commit; contract `spec/contracts/22-escape-edit-title.md` (section 24); batch 1
- **Tier:** full · **Depends on:** ~~D-30~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B5.2/`

### B5.3 · The slash key focuses the search box

_F23 · section 25_
**Status: Open** — §16 lists keyboard shortcuts under Out of scope (`spec/contracts/14-search.md`, Out of scope): reaching the search box takes a mouse or several Tabs

- **Acceptance:** `/` pressed outside any text field focuses the "Search" box and types nothing; ignored while a field has focus; mounts in `src/components/todo-search-form.tsx` only; lifts keyboard shortcuts from §16's Out of scope in its own `docs(spec)` commit; contract `spec/contracts/23-search-shortcut.md` (section 25); batch 1
- **Tier:** full · **Depends on:** ~~D-30~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B5.3/`

### B5.4 · The browser tab title shows the remaining count

_F24 · section 26_
**Status: Open** — the tab title is fixed (`grep -rn 'generateMetadata' src/app` → 0): a person with the list in a background tab cannot see what is left

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
