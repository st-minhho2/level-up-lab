# B1.5 plan — Feedback when creating a todo fails (§10, Tier full)

Approach: B-2 from `advice.md` (round 2; round 1 chose A). `createTodoAction` gets the §10 try/catch (Zod parse
outside, `createTodo` + `revalidatePath` inside, bare `catch` → `failure('form', MUTATION_FAILED_MESSAGE)`).
`TodoForm` keeps `useActionState(createTodoAction, null)` literal (§7) and the uncontrolled input; a `draft` state
written by `onChange` feeds `defaultValue` only while the state is a `form` failure, so React 19's post-action reset
lands on the typed title. Why not A: its client wrapper turns the server-rendered form into
`action="javascript:throw …"`, so a submit before hydration or without JS stores nothing (today it posts natively);
plan review round 1, reason 1. B-2's commit-order dependency is pinned by react/react-dom 19.1.0 exact and caught by
AC-10.5. Keeping the typed title after a `form` failure only is what §10 says (box ticked at this gate). No
migration, no dependency, no `ActionResult` change.

## Files

| File                                                                                  | Change                                                                                                                                                                                                                              | Why (AC-10.n) |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `src/actions/todos.ts`                                                                | `createTodoAction`: one try/catch around `createTodo` + `revalidatePath` + success return; header comment gains "create"                                                                                                            | 10.4          |
| `src/components/todo-form.tsx`                                                        | `useState` draft via `onChange`; `defaultValue` = draft only after a `form` failure; alert reads `title?.[0] ?? form?.[0]`; header comment names §10                                                                                | 10.5          |
| `src/actions/CLAUDE.md`                                                               | drop "create still reaches the error boundary until B1.5"; create joins the actions that never reject (`src/components/CLAUDE.md` already true)                                                                                     | docs          |
| `spec/features-map.md`                                                                | F8 row gains `src/components/todo-form.tsx` and `src/components/todo-form.test.tsx` (code-writer, green commit)                                                                                                                     | —             |
| `docs/metrics.md`                                                                     | per-card row B1.5                                                                                                                                                                                                                   | —             |
| tests (test-writer): `src/actions/todos.test.ts`, `src/components/todo-form.test.tsx` | AC-10.4 (card's exact title; blank-title half in the same test); one untitled-criterion test where `revalidatePath` throws after `createTodo` resolves; AC-10.5 (alert first, then value `Buy milk`, recovery inside the same test) | all           |

Skeleton: none (every function exists); red fails on assertions (the action rejects; the form shows no alert and an
empty box). Existing §5 TodoForm and action tests stay untouched. No e2e: no fault-injection hook (§10 out of scope).
§10 index ◐ → ✅ in the closing commit after merge. Branch pushed only after the red commit
(`check-ac-coverage.sh` fails while §10 has untested criteria).

## Interfaces touched

```ts
// src/actions/todos.ts — signature unchanged
export function createTodoAction(previous: ActionResult<Todo> | null, formData: FormData): Promise<ActionResult<Todo>>;
// src/components/todo-form.tsx — TodoForm(): ReactNode unchanged; inside:
const [state, formAction, pending] = useActionState(createTodoAction, null); // line unchanged
const [draft, setDraft] = useState(''); // written by the input's onChange
// <input name="title" … defaultValue={state !== null && !state.ok && state.fieldErrors.form !== undefined ? draft : ''} />
```

## Verification

```bash
scripts/verify-red.sh B1.5   # 3 new tests fail on behavior, 0 new pass
pnpm lint && pnpm typecheck && pnpm test   # 67 + 3 = 70 green
pnpm test:e2e                # 12 unchanged (AC-5.6 creates and reloads in Chromium)
pnpm test:mutation           # ≥ 70 (baseline 82.80 %); catch mutants killed by AC-10.4's toEqual
scripts/ci/check-ac-coverage.sh && scripts/ci/check-features-map.sh && scripts/ci/check-feat-commits.sh
```

## Work breakdown

| Step          | Role / skill                          | Produces                               | Commit                                                        |
| ------------- | ------------------------------------- | -------------------------------------- | ------------------------------------------------------------- |
| 1 Plan review | `reviewer` (plan)                     | `review.md` plan section               | `docs(backlog): B1.5 plan review`                             |
| 2 Red         | `test-writer` → red gate (dev-lead)   | tests; `verify-red.sh B1.5` exit 0     | `test(todos): B1.5 feedback when creating a todo fails (red)` |
| 3 Green       | `code-writer` → green gate (dev-lead) | behavior, guides, F8 map row           | `feat(todos): B1.5 feedback when creating a todo fails`       |
| 4 Review      | `reviewer` (diff), `/review-loop`     | `review.md` diff section, gate cleared | —                                                             |

Plan approved by: · Rounds: 2 (round 1 approved A, plan review round 1 requested changes)
