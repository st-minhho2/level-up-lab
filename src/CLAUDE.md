# src/ — layers and where each spec section lives

| Package       | Spec §         | Guide                      | Tests                          |
| ------------- | -------------- | -------------------------- | ------------------------------ |
| `app/`        | §7             | `src/app/CLAUDE.md`        | `src/app/**/*.test.ts`, `e2e/` |
| `actions/`    | §5, §6, §7     | `src/actions/CLAUDE.md`    | `src/actions/*.test.ts`        |
| `lib/`        | §3, §4, §5, §6 | `src/lib/CLAUDE.md`        | `src/lib/*.test.ts`            |
| `components/` | §7             | `src/components/CLAUDE.md` | `src/components/*.test.tsx`    |

Layering (imports only point down): `app` → `components` → `actions` → `lib` → `prisma`. A client component never
imports `lib/prisma.ts` or anything that does (`server-only` makes `next build` fail).

Rules that hold everywhere in `src/`:

- Every module's header comment names the section it implements (`// §5 list/create/toggle`).
- Spec constants are named module-level values taken from the section (`TITLE_MAX_LENGTH = 200`), never literals in logic.
- Data shapes are the `interface`s in `lib/*.ts` (`Todo`, `ActionResult<T>`); never return a Prisma model as-is.
- Errors are classes (`TodoNotFoundError`, `EnvError`); actions turn them into `ActionResult` failures.
- A gap between code and spec goes to the card's `work/<card>/analysis.md` or `/spec-trace`, never silently fixed.
