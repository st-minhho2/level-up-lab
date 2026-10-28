# src/components — client components (§7)

`'use client'` only because of state or events. Props are plain data (`Todo`), never a Prisma model. Accessible
names are the contract the tests assert: "New todo" text box, "Add" button, a checkbox named by the todo's title,
`role="alert"` for inline errors. A row (`<li>`) adds no visible text beyond its title (AC-5.1 compares whole-row text).
