# src/app — Server Components and the health route (§7)

`page.tsx` is a Server Component (`dynamic = 'force-dynamic'`) that reads through `src/lib` and renders client
components; it never imports an action's result type into state. `api/health/route.ts` is the only Route Handler and
is read-only (GET). No mutation lives under `app/api`.
