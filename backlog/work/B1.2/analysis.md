# B1.2 analysis

Codebase facts (grep of this worktree, which is `main` plus the pipeline scaffolding): there is no `Todo` model in
`prisma/schema.prisma` (it holds only the generator and datasource), no `src/lib/todos.ts`, `src/actions/todos.ts`
or `src/components/todo-item.tsx`, and no todo test. `src/app/page.tsx` is the placeholder page. Everything the Slice
row names is created by B1.1 (§5), which lives on branch `feat/B1.1 (§5)-todo-list` and is not readable from here
(isolation rule 2). Its REQ-2/REQ-3 wording, list ordering key and error messages are therefore unverified; the
only settled source is D-5 (titles 1-200 characters after trimming, duplicates allowed).

## Completeness

| Check                                                | Result | Note                                                                                                                                       |
| ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Intent has no solution words                         | pass   | No table, action, endpoint or component named; "text", "list", "reload" describe what a person sees.                                       |
| Every behavior in the intent has a REQ               | fail   | §2 is empty. Intent behaviors: edit in place, text persists after reload, completion state kept, position kept.                            |
| Every REQ uses one EARS pattern                      | fail   | No REQ exists yet; proposed below (7 REQ, one pattern each).                                                                               |
| Criteria <= 7                                        | pass   | §3 is empty; the proposal has exactly 7, at the cap. Adding cancel or not-found handling means a split.                                    |
| Every Then is measurable                             | fail   | No criteria exist yet; proposed Thens carry exact strings, counts and lengths.                                                             |
| No banned adjective without a number                 | pass   | None of fast, quick, slow, friendly, simple, easy, intuitive, robust, scalable, small, large, soon, responsive, clean, reasonable appears. |
| Out of scope present                                 | pass   | Two items: non-title edits, concurrent edits from two tabs.                                                                                |
| Unchanged behavior names a proof test                | fail   | §5 empty and no todo test exists in this worktree; proofs must come from B1.1 (§5) (see Proposed unchanged behavior).                      |
| depends_on specs are done or their interfaces stable | fail   | `depends_on: []` but the Slice files and the Todo model do not exist until B1.1 (§5) lands; see open question 1.                           |
| No settled D-n contradicted                          | pass   | D-5 applied (REQ-5, REQ-6, REQ-7, AC-4 to AC-7); §7's only question is answered by D-5.                                                    |

Result: 5 pass, 5 fail.

## Proposed requirements

| ID    | Pattern            | Requirement                                                                                                                                                        |
| ----- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| REQ-1 | Event-driven       | WHEN a person activates editing on a listed todo THE SYSTEM SHALL show that todo's current title in an editable text field.                                        |
| REQ-2 | Event-driven       | WHEN a person submits a changed title for a todo THE SYSTEM SHALL persist the title with leading and trailing whitespace removed.                                  |
| REQ-3 | Event-driven       | WHEN a todo's title is edited THE SYSTEM SHALL keep that todo's completion state unchanged.                                                                        |
| REQ-4 | Event-driven       | WHEN a todo's title is edited THE SYSTEM SHALL keep that todo's position in the list unchanged.                                                                    |
| REQ-5 | Unwanted behavior  | IF the submitted title is empty after trimming THEN THE SYSTEM SHALL reject the edit with a field error on `title` and keep the stored title.                      |
| REQ-6 | Unwanted behavior  | IF the submitted title is longer than 200 characters after trimming THEN THE SYSTEM SHALL reject the edit with a field error on `title` and keep the stored title. |
| REQ-7 | Event-driven (D-5) | WHEN a person submits a title equal to the title of another todo THE SYSTEM SHALL persist it as for any other title.                                               |

Note on REQ-5/REQ-6: "reject ... and keep the stored title" is one outcome (a rejected edit has no effect), not two
behaviors; AC-4 and AC-5 assert both sides of it.

## Proposed acceptance criteria

Exact error wording is not asserted (it belongs to B1.1 (§5)'s title schema, see open question 3); the tests assert
that `fieldErrors.title` is a non-empty array of strings.

| ID   | Covers       | Given                                                               | When                                                                                                                | Then (measurable)                                                                                                                                                          |
| ---- | ------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | REQ-1        | The list shows one todo titled `Buy mik`                            | The person activates editing on that todo                                                                           | Exactly 1 text field is visible and its value equals `Buy mik`; no other todo shows a text field.                                                                          |
| AC-2 | REQ-2        | One stored todo titled `Buy mik`                                    | The person submits `  Buy milk  `                                                                                   | The action returns `ok: true` with `data.title` equal to `Buy milk`; after a page reload the list shows `Buy milk`, does not show `Buy mik`, and the row count is still 1. |
| AC-3 | REQ-3, REQ-4 | Three stored todos in list order `A` (open), `B` (done), `C` (open) | The person submits `B2` as the new title of `B`                                                                     | After a reload the list order is `A`, `B2`, `C`; `B2` is still done and `A`, `C` are still open; the row count is 3.                                                       |
| AC-4 | REQ-5        | One stored todo titled `Buy mik`                                    | The person submits `   ` (3 spaces)                                                                                 | The action returns `ok: false` with `fieldErrors.title` a non-empty array; the stored title still equals `Buy mik`.                                                        |
| AC-5 | REQ-6        | One stored todo titled `Buy mik`                                    | The person submits a title of 201 non-space characters                                                              | The action returns `ok: false` with `fieldErrors.title` a non-empty array; the stored title still equals `Buy mik`.                                                        |
| AC-6 | REQ-2, REQ-6 | One stored todo titled `Buy mik`                                    | The person submits 200 non-space characters padded with 5 leading spaces and 5 trailing spaces (210 characters raw) | The action returns `ok: true`; the stored title has length exactly 200 and no leading or trailing whitespace.                                                              |
| AC-7 | REQ-7        | Two stored todos titled `A` and `B`                                 | The person submits `A` as the new title of `B`                                                                      | The action returns `ok: true`; after a reload the list shows two todos both titled `A`; the row count is 2.                                                                |

## Proposed unchanged behavior

Nothing todo-related exists in this worktree, so no existing test title can be quoted verbatim from grep. The
existing tests (`src/lib/env.test.ts`, `src/lib/health.test.ts`, `src/app/api/health/route.test.ts`,
`e2e/smoke.spec.ts`) cover nothing this change touches, and `e2e/smoke.spec.ts` :: "home page renders the lab title"
will be superseded by B1.1 (§5) rather than guarded by B1.2. The rows below name the behavior; the proof column
must be filled by `dev-lead` with titles quoted verbatim from B1.1 (§5)'s merged tests (not invented here).

| Behavior                                                  | Proof                                                                                   |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Creating a todo still trims and enforces 1-200 characters | B1.1 (§5) create-action test titles (`src/actions/todos.test.ts`), to quote after merge |
| Toggling completion still works on an edited todo         | B1.1 (§5) toggle test titles (`src/lib/todos.test.ts`), to quote after merge            |
| The list still renders in the same order after a create   | B1.1 (§5) list-order test or e2e title, to quote after merge                            |

## Open questions

1. Should `depends_on` be `[B1.1 (§5)]`? (frontmatter currently `[]`) · Yes · every Slice file and the Todo model are created by B1.1 (§5), so B1.2 cannot be planned or built before it is done (B1.3 already declares it) · if the lead keeps `[]`, the plan cannot name existing files to change and `scripts/next-task.sh` may pick it too early. `dev-lead` edits the frontmatter; the analyst may not.
2. Does §7's question (same 1-200 rule as creation) stay open? · No, close it: D-5 settles 1-200 characters after trimming, duplicates allowed · settled ruling, never re-asked · if a later D-n changes the limit, REQ-5/REQ-6, AC-4 to AC-6 change with it. The B1.1 (§5) REQ numbers quoted in §7 could not be checked from this worktree.
3. Which error wording and shape does the edit use? · Reuse B1.1 (§5)'s title Zod schema from `src/lib/` unchanged, so create and edit return identical `fieldErrors.title` messages; the ACs assert only a non-empty array · avoids a second copy of the 1-200 rule · if B1.1 (§5)'s schema is not exported or reusable, the plan adds a shared schema file and B1.1 (§5)'s tests must still pass (§5).
4. Is the list ordered by a key that an edit does not change? · Assume `createdAt` (the Prisma rule indexes `createdAt` for list queries; an edit only moves `updatedAt`) · AC-3 and REQ-4 depend on it and it could not be verified from this worktree · if B1.1 (§5) orders by `updatedAt` or any edited column, REQ-4 needs an explicit order key and the plan changes the list query.
5. How does a person leave edit mode without saving (Escape, blur, a cancel control)? · Out of scope for this spec: add "Cancelling an edit in progress" to §4; the edit field is left by submitting · an eighth criterion would exceed the cap · if the lead wants it, split into `B1.2-a` (persist and validate: AC-2, AC-4 to AC-7) and `B1.2-b` (in-place field, cancel, AC-1, AC-3).
6. What happens when a person submits a title identical to the current one? · Treated as an ordinary edit: `ok: true`, row unchanged, no error · avoids a special case and is consistent with REQ-7 · if the lead wants "no change" reported, that is an extra REQ and an eighth AC.
7. What does the action return for a todo id that no longer exists (possible after B1.3 clears completed items)? · `ok: false` with a field error keyed `id`, no row created; not given an AC because concurrent edits from two tabs are out of scope · keeps the `ActionResult` shape from `.claude/rules/app-router.md` · if the lead wants it specified, it needs an AC (split as in question 5).

## Tier recommendation

`full`: 7 criteria (more than the 3 allowed for `quick`) and a UI change (in-place field in `todo-item.tsx`); no schema change, since the `title` column comes from B1.1 (§5).
