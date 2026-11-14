# E8 · Todos polish: select the title on edit, hide empty filters, hide an idle "Mark all complete"

Epic E8 is the third parallel batch of autonomous delivery, after E7's two. Its three `agent-ready` issues run at the
same time, one `scripts/agent/run.sh <issue>` each in the runner container. They are measured by
`scripts/metrics/unattended.sh` and `no-rework.sh` against D-29's targets, with throughput and change failure rate held
against parallel delivery's batches 6–7.

The batch rule is D-39 (`00-decisions.md`; options and file:line evidence in `work/B8.1/decision-request.md`), which
extends D-37's **spec first**:

1. `spec-analyst`, in an attended session, writes each section and the lifts or edits D-39 names, in a `docs(spec)`
   PR. The same PR adds the card's `Spec:` and `Test:` lines.
2. The lead labels the issues only after that PR merges and E7 batch 2 has merged.

The cards were chosen by a read-only pre-check of eight candidates, which looked for spec lines each would contradict
and tests each would break. They have these properties:

- No card changes `src/app/page.tsx`, `src/lib/` or `src/actions/`, so every run skips local mutation testing
  (B1.100).
- The three touch disjoint components.
- No card changes `prisma/`, a dependency or the environment, so every plan is medium tier (D-28).

### B8.1 · Opening the title editor selects the whole title

_F39 · section 41_
**Status: Open** — §6 (`spec/contracts/04-edit-title.md`) and §24 say nothing about focus or selection when "Edit
title" opens the editor. REQ-6.1 (line 16) only says the field shows the current title. Every existing test clears the
field before typing (`src/components/todo-item.test.tsx`) or uses Playwright's `fill()`, so none depends on the caret.

- **Acceptance:**
  - Activating "Edit title" focuses the text field with the whole current title selected (`selectionStart` 0,
    `selectionEnd` = title length).
  - This happens only on the switch into edit mode. It does not happen again after a rejected or failed save, which
    keeps the draft (AC-6.4, REQ-10.3), or on other re-renders.
  - §24's Out of scope "restoring focus to the 'Edit title' button" still holds.
  - The card's `docs(spec)` commit states once that the sibling sections' "`todo-item.tsx` unchanged" notes do not
    apply (D-39).
  - Mounts in `src/components/todo-item.tsx`; contract `spec/contracts/39-edit-title-select.md` (section 41).
- **Tier:** full · **Depends on:** ~~D-39~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B8.1/`

### B8.2 · The filter nav hides a link whose count is 0, except the current filter

_F40 · section 42_
**Status: Open** — `spec/contracts/10-filter.md:17` (REQ-12.1) shows all three links "in every state (empty list
included)". §30 (`28-filter-counts.md`) puts a count next to each one, lists "hiding a zero count" in its Out of scope
(line 64), and expects "(0), (0), (0)" in AC-30.3, AC-30.6 and AC-30.7.

- **Acceptance:**
  - When `counts` is given, a filter link and its count are not rendered when that filter's count is 0 and it is not
    the current filter. Without `counts`, the nav behaves as §12 (REQ-30.6, AC-12.4 unchanged).
  - These edits are in the card's `docs(spec)` commit (D-39):
    - REQ-12.1, AC-12.7, REQ-30.1, REQ-30.5, AC-30.3, AC-30.6 and AC-30.7 are edited;
    - "hiding a zero count" is lifted;
    - §16's and §21's "`todo-filter-nav.tsx` unchanged" notes are stated not to apply.
  - The red commit rewrites `todo-filter-nav-counts.test.tsx` (AC-30.3), `e2e/12-filter.spec.ts` (AC-12.7) and
    `e2e/30-filter-counts.spec.ts` (AC-30.6, AC-30.7) to the edited text.
  - Mounts in `src/components/todo-filter-nav.tsx` only.
- **Tier:** full · **Depends on:** ~~D-39~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B8.2/`

### B8.3 · "Mark all complete" is hidden when there is nothing to mark

_F41 · section 43_
**Status: Open** — `spec/contracts/12-complete-all.md:21` (REQ-14.5) shows the button disabled when no todo is open
and says "it is never hidden". §36 (`34-complete-all-count.md`) keeps it disabled (REQ-36.2) and lists "hiding the
button at 0" in its Out of scope (line 64).

- **Acceptance:**
  - With no open todo, `CompleteAllButton` renders nothing. While a mark-all is pending, it stays disabled as today.
  - Focus after a successful mark-all, when the button unmounts while focused, is stated in section 43.
  - These edits are in the card's `docs(spec)` commit (D-39):
    - REQ-14.5, AC-14.4 (a), AC-14.6, §14's page contract (line 59), REQ-36.2, AC-36.3, AC-36.6 and AC-36.7 are
      edited;
    - "hiding the button at 0" is lifted;
    - the unchanged-behavior rows of §36 that assert "disabled" are re-pointed.
  - The red commit rewrites `complete-all-button.test.tsx` (AC-14.4 a), `complete-all-button-count.test.tsx`
    (AC-36.3), `e2e/14-complete-all.spec.ts` (AC-14.6) and `e2e/36-complete-all-count.spec.ts` (AC-36.6, AC-36.7).
  - Mounts in `src/components/complete-all-button.tsx` only.
- **Tier:** full · **Depends on:** ~~D-39~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B8.3/`
