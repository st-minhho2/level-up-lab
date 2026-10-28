---
id: FEAT-003
title: Edit a todo title
status: backlog
priority: 3
tier: full
owner: agent
depends_on: []
---

# FEAT-003: Edit a todo title

| Field | Value                                                                      |
| ----- | -------------------------------------------------------------------------- |
| Slice | `src/lib/todos.ts`, `src/actions/todos.ts`, `src/components/todo-item.tsx` |
| PR    |                                                                            |

- [ ] **Lead approves spec**

## 1. Intent

A person who mistyped an item wants to correct its text in place instead of adding a new item and leaving the wrong
one behind. We know it worked when the corrected text is what the list shows after a reload, with the same
completion state and position as before.

## 2. Requirements (EARS)

_To be proposed by `spec-analyst`._

## 3. Acceptance criteria (max 7)

_To be proposed by `spec-analyst`._

## 4. Out of scope

- Editing anything other than the title.
- Concurrent edits from two tabs.

## 5. Unchanged behavior

_To be proposed by `spec-analyst`._

## 6. Traceability (filled as work lands)

## 7. Open questions

- Same 1–200 character rule as creation (FEAT-001 REQ-2/REQ-3)?
