# src/components — client components (§7)

`'use client'` only because of state or events. Props are plain data (`Todo`), never a Prisma model. Accessible
names are the contract the tests assert: "New todo" text box, "Add" button, a checkbox named by the todo's title,
`role="alert"` for inline errors. A row (`<li>`) adds no visible text beyond its title (AC-5.1 compares whole-row text).
`todo-filter-nav.tsx` (§12) is link-only (`next/link`, no state or events), so it has no `'use client'` and no `<ul>`.
`remaining-count.tsx` (§13) is a Server Component (no state, no events), so it has no `'use client'`.
`complete-all-button.tsx` (§14) is `'use client'` (state, events) like `clear-completed-button.tsx`.
`todo-due-date.tsx` (§15) is `'use client'` (state, events): the due-date text and edit control inside a `TodoItem` row.
`todo-search-form.tsx` (§16) is a Server Component, a native GET form (no state, no events), so it has no `'use client'`.
`todo-form.tsx` (§7, §10) also shows the §18 title counter (`src/lib/title-count.ts`) under the box.
`todo-item.tsx` (§7, §6, §10) is the row; it renders `todo-due-date.tsx` and `delete-todo-button.tsx` (§19, `'use client'`,
its failure message right after the button). Keep the completion checkbox the first checkbox of the `<li>`:
`todo-due-date.tsx` (§17) reads the row's completed state from it.
