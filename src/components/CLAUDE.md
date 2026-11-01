# src/components — UI components, client and server (§7, §10, §12–§22)

`'use client'` only because of state or events. Props are plain data (`Todo`), never a Prisma model. Accessible
names are the contract the tests assert: "New todo" text box, "Add" button, a checkbox named by the todo's title,
`role="alert"` for inline errors.
In its idle state (view mode, no error message) a row (`<li>`) without a due date adds no text content beyond its title (AC-5.1, AC-20.3 compare whole-row text); §15 `Due <date>` and §17 `Overdue` are the only idle additions.
`todo-filter-nav.tsx` (§12) is link-only (`next/link`, no state or events), so it has no `'use client'` and no `<ul>`.
`remaining-count.tsx` (§13) stays a Server Component; §22 adds "All done" (`allDoneMessage`) beside the count `<p>`, in an element that is not a `<p>` and has no role; no state or events, so no `'use client'`.
`complete-all-button.tsx` (§14) is `'use client'` (state, events) like `clear-completed-button.tsx`.
`todo-due-date.tsx` (§15) is `'use client'` (state, events): the due-date text and edit control inside a `TodoItem` row.
`todo-search-form.tsx` (§16) stays a Server Component; §21 adds the "Clear search" link (`next/link`, `src/lib/clear-search.ts`) while a search is in effect; a native GET form, no state or events, so no `'use client'`.
`todo-form.tsx` (§7, §10) also shows the §18 title counter (`src/lib/title-count.ts`) under the box.
`todo-item.tsx` (§7, §6, §10) is the row; it renders `todo-due-date.tsx` and `delete-todo-button.tsx` (§19, `'use client'`,
its failure message right after the button). Keep the completion checkbox the first checkbox of the `<li>`:
`todo-due-date.tsx` (§17) reads the row's completed state from it.
`todo-item.tsx` (§20) renders one empty `<time>` after `todo-due-date.tsx`; `Created YYYY-MM-DD` is its `::after` content (`data-created`, `src/lib/todo-created.ts`), visible but not text content.
