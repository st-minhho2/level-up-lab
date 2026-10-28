---
id: FEAT-002
title: Clear completed todos
status: backlog
priority: 2
tier: quick
owner: agent
depends_on: [FEAT-001]
---

# FEAT-002: Clear completed todos

| Field | Value                                                          |
| ----- | -------------------------------------------------------------- |
| Slice | `src/lib/todos.ts`, `src/actions/todos.ts`, `src/app/page.tsx` |
| PR    |                                                                |

- [ ] **Lead approves spec**

## 1. Intent

A person whose list has grown wants to remove every item already marked done in one step, so the list shows only
what is still open. We know it worked when, after the step, no done item is listed and every open item is still
there in the same order.

## 2. Requirements (EARS)

_To be proposed by `spec-analyst`._

## 3. Acceptance criteria (max 7)

_To be proposed by `spec-analyst`._

## 4. Out of scope

- Undo.
- Deleting a single todo.

## 5. Unchanged behavior

_To be proposed by `spec-analyst`._

## 6. Traceability (filled as work lands)

## 7. Open questions

- Should the button be hidden when nothing is completed, or disabled?
