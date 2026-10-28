---
paths:
  - 'src/app/**'
  - 'src/actions/**'
  - 'src/components/**'
---

# App Router: server first, mutations through actions

**Mistake this prevents:** data fetched in a client component through a hand-rolled `/api` route, Prisma pulled into
the browser bundle, and a form submitted without validation because "the UI already checks it".

Derived from `../nodejs-typescript-coding-conventions.md` §5 (thin handlers, validation at the boundary, no business
logic in controllers) and §3 (`unknown` + narrowing, explicit return types).

## Rules

1. **Server by default.** A file under `src/app` or `src/components` is a Server Component unless its first line is
   `'use client'`. Add that line only for state, effects, event handlers or browser APIs. Keep client components
   leaf-sized and pass data in as props.
2. **Reads happen in Server Components** (`await` directly in the component or a `src/lib` function). Route Handlers
   under `src/app/api` are for external callers (health, webhooks) and are GET-only.
3. **Mutations only through Server Actions** in `src/actions/<slice>.ts` with `'use server'` at the top. Never POST
   to your own `/api` from a client component; never mutate in a Route Handler.
4. **Prisma never crosses into client code.** Import `@/lib/prisma` only from `src/lib` and `src/actions`. `prisma.ts`
   imports `server-only`, so a wrong import fails `next build`; do not work around that error, move the call.
5. **Every action validates its input with Zod** from `src/lib/<slice>-schema.ts` before touching `src/lib`.
   Signature: `(input: unknown | FormData) => Promise<ActionResult<T>>` where
   `ActionResult<T> = { ok: true; data: T } | { ok: false; fieldErrors: Record<string, string[]> }`. Actions return
   errors, they do not throw them to the client.
6. **Actions are thin.** Parse, call one `src/lib` function, `revalidatePath`, return. Logic lives in `src/lib` so
   it is unit- and mutation-tested without React.
7. Explicit return types on every exported component (`ReactNode`) and action.
