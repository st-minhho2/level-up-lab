# E6 · Todos cues: Escape in the form, filter counts, due today, clear count, announced counts

Epic E6 runs autonomous delivery in parallel: each batch's three `agent-ready` issues run at the same time, one
`scripts/agent/run.sh <issue>` each in the runner container, measured by `scripts/metrics/unattended.sh` and
`no-rework.sh` against D-29's targets, with throughput and change failure rate held against parallel delivery's
batches 6–7. Batch 1 is B6.1–B6.3, batch 2 is B6.4–B6.6. Every card moves a `spec/features-map.md` row, so each run
also shows whether code-writer authors the `docs(map)` commit (B1.85's pending check). Section numbers, contract
files, the component each card mounts in and the one card per batch that changes `src/app/page.tsx` wait on D-33
(`work/B6.1/decision-request.md`); `spec-analyst` lands each section and the `Spec:` and `Test:` lines when the run
picks the card. No card changes `prisma/`, a dependency or the environment, so every plan is medium tier (D-28).

### B6.1 · Escape clears the new-todo title

_F27 · section 29_
**Status: Open** — the "New todo" field empties only after a successful add or by deleting the text by hand
(`grep -n 'Escape' src/components/todo-form.tsx` → 0)

- **Acceptance:** Escape in the "New todo" field empties it and calls no Server Action; §18's counter follows the
  emptied field; mounts in `src/components/todo-form.tsx` only; contract `spec/contracts/27-escape-new-todo.md`
  (section 29); batch 1
- **Tier:** full · **Depends on:** D-33 · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B6.1/`

### B6.2 · The filter links show how many todos each one lists

_F28 · section 30_
**Status: Open** — §12 lists "counts on the links" under Out of scope (`spec/contracts/10-filter.md:66`): a person
must open a filter to learn whether it lists anything

- **Acceptance:** each filter link reads its name and the number of todos it would list (All, Active, Completed) for
  the current todos, before any search; lifts "counts on the links" from §12's Out of scope in its own `docs(spec)`
  commit; mounts in `src/components/todo-filter-nav.tsx`, with the counts passed from `src/app/page.tsx` (the batch's
  one `page.tsx` card); contract `spec/contracts/28-filter-counts.md` (section 30); batch 1
- **Tier:** full · **Depends on:** D-33 · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B6.2/`

### B6.3 · An open todo due today says so

_F29 · section 31_
**Status: Open** — §17 marks only overdue todos and lists "a due-soon highlight" under Out of scope
(`spec/contracts/15-overdue.md:66`): a todo due today looks like one due next month

- **Acceptance:** an open todo whose due day is today (§17's day rule, the browser's day) shows a `Due today` marker
  after its date; a completed or overdue todo does not; lifts the due-today case from §17's Out of scope in its own
  `docs(spec)` commit; mounts in `src/components/todo-due-date.tsx` only; contract `spec/contracts/29-due-today.md`
  (section 31); batch 1
- **Tier:** full · **Depends on:** D-33 · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B6.3/`

### B6.4 · The clear-completed button says how many it will clear

_F30 · section 32_
**Status: Open** — the button reads "Clear completed" whatever the number (`ClearCompletedButton` takes only
`disabled`, `src/app/page.tsx:46`); §9's Out of scope names "a message showing the deleted count"
(`spec/contracts/07-clear-completed.md:52`), a message after the clear, not the label before it

- **Acceptance:** while n > 0 todos are completed the button reads `Clear completed (n)`, and `Clear completed`
  (disabled) at 0; §9's clear itself is unchanged; the `docs(spec)` commit states that the label count is not §9's
  deleted-count message; mounts in `src/components/clear-completed-button.tsx`, with the count passed from
  `src/app/page.tsx` (the batch's one `page.tsx` card); contract `spec/contracts/30-clear-completed-count.md`
  (section 32); batch 2
- **Tier:** full · **Depends on:** D-33 · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B6.4/`

### B6.5 · The overdue count is announced to assistive technology

_F31 · section 33_
**Status: Open** — §23 lists "announcing changes to assistive technology" under Out of scope
(`spec/contracts/21-overdue-count.md:70`; `grep -n 'role=\|aria-live' src/components/overdue-count.tsx` → 0)

- **Acceptance:** the overdue count sits in a polite live region (`role="status"`), present at 0 so a change is
  announced; its visible text is unchanged (§23, hidden at 0); lifts the line from §23's Out of scope in its own
  `docs(spec)` commit; mounts in `src/components/overdue-count.tsx` only; contract
  `spec/contracts/31-overdue-announce.md` (section 33); batch 2
- **Tier:** full · **Depends on:** D-33 · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B6.5/`

### B6.6 · The remaining count is announced to assistive technology

_F32 · section 34_
**Status: Open** — §13 lists "live announcement to assistive technology (`role="status"`, `aria-live`)" under Out of
scope (`spec/contracts/11-remaining-count.md:53`; `grep -n 'role=\|aria-live' src/components/remaining-count.tsx` → 0)

- **Acceptance:** §13's count and §22's message sit in a polite live region (`role="status"`), so a change is
  announced; their visible text is unchanged; lifts the line from §13's Out of scope in its own `docs(spec)` commit;
  mounts in `src/components/remaining-count.tsx` only; contract `spec/contracts/32-remaining-announce.md`
  (section 34); batch 2
- **Tier:** full · **Depends on:** D-33 · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B6.6/`
