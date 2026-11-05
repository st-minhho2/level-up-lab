# D-31 request: B5.3 — the slash key from a focused checkbox, and the §16 / §21 "no 'use client'" notes

B5.3's headless run (issue #215, D-27) stopped at plan review round 1 (`review.md`, changes requested, 2 reasons);
`/advise` escalated reason 1 to the lead (`Escalate: human`). Nothing under `src/`, `e2e/` or tests changed. Both
parts are asked in one ruling so the card needs one reply.

## Part 1 — §25 contradicts itself on a focused checkbox

`spec/contracts/23-search-shortcut.md` (draft, box unticked): the Intent (line 9, "reading or ticking the list") and the
prose at line 24 ("a checkbox with focus is not one, so `/` moves focus to the box") say `/` works from a focused
row checkbox (`<input type="checkbox">`, `src/components/todo-item.tsx`). REQ-25.3, AC-25.1 and the function contract
(line 51, `tagName INPUT → false`, `ShortcutEvent.target` has no `type`) exempt every `input`, so it cannot.

| Option                                                | Behavior                                                | Cost                                                                                                                                   | Reversible    |
| ----------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1. Every `input` is text-entry (drop "or a checkbox") | `/` does nothing while a row checkbox has focus         | one prose edit; contradicts the Intent's "ticking"                                                                                     | yes, by a D-n |
| 2. Only text-like `input` types (recommended)         | `/` focuses the search box from a checkbox or radio too | `ShortcutEvent.target` gains optional `type` (missing → text-entry); REQ-25.3, contract, AC-25.1 change; AC-25.3 gains a checkbox case | yes, by a D-n |

Recommended: 2 (the Intent and prose already promise it; it is the case a person hits right after ticking a row).

## Part 2 — the §16 and §21 notes that §25 makes stale

§25's contract makes `src/components/todo-search-form.tsx` `'use client'`. `14-search.md:55` (§16) says "no 'use client'",
`19-clear-search.md:50` (§21) says "still no 'use client'". D-30 allowed B5.3 one `docs(spec)` on §16 (Out of scope,
landed ce92ec7) and does not name §21.

| Option                                                                                        | Cost                                                    |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| A (recommended). B5.3 may edit those two notes to "§25 adds 'use client'" in its `docs(spec)` | two one-line edits in lead-approved sections            |
| B. Leave them; file a card                                                                    | §16 / §21 contradict §25 on `main` until the card lands |

`src/components/CLAUDE.md:11` goes stale too; D-30 keeps package guides out of card plans, so it is a separate card
either way.

## Reply

`D-31: 2A` (or `1A`, `2B`, `1B`). After the ruling, a run re-plans: `spec-analyst` applies it to §25 in one
`docs(spec)` commit, the plan is revised and re-reviewed.
