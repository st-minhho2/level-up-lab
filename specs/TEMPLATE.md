# FEAT-XXX: <feature name>

| Field  | Value                                                                          |
| ------ | ------------------------------------------------------------------------------ |
| Tier   | `0` plan-only · `quick` (≤ 3 criteria, no schema change) · `full` (everything) |
| Status | `draft` → `approved` → `implemented`                                           |
| Owner  | <human>                                                                        |
| Slice  | `src/lib/<slice>.ts`, `src/actions/<slice>.ts`, `src/app/<route>`              |
| PR     | <link once open>                                                               |

- [ ] **Lead approves spec** (name, date). Nothing below section 1 is implemented before this box is ticked.

## 1. Intent (one paragraph)

Who needs this, what they can do after it ships, and how we know it worked. No solution words ("table",
"action", "endpoint", "component") in this paragraph.

## 2. Requirements (EARS)

One behavior per requirement, one EARS pattern each, stable ids. Keep trigger, system and response separate.

| ID    | Pattern           | Requirement                                                  |
| ----- | ----------------- | ------------------------------------------------------------ |
| REQ-1 | Ubiquitous        | THE SYSTEM SHALL <always-true behavior>.                     |
| REQ-2 | Event-driven      | WHEN <trigger> THE SYSTEM SHALL <response>.                  |
| REQ-3 | State-driven      | WHILE <state> THE SYSTEM SHALL <response>.                   |
| REQ-4 | Unwanted behavior | IF <undesired condition> THEN THE SYSTEM SHALL <mitigation>. |
| REQ-5 | Optional feature  | WHERE <feature is present> THE SYSTEM SHALL <response>.      |

Patterns combine: `WHILE <state> WHEN <trigger> THE SYSTEM SHALL <response>`.

## 3. Acceptance criteria (max 7; an eighth means split the feature)

Each criterion is measurable: concrete input, concrete observable output, a number wherever time, size or count
matters. One or more tests carry the id at the start of the title: `it('AC-1: ...')`.

| ID   | Covers | Given   | When     | Then (measurable)                                     |
| ---- | ------ | ------- | -------- | ----------------------------------------------------- |
| AC-1 | REQ-1  | <state> | <action> | <exact value / status / rendered text / row count>    |
| AC-2 | REQ-2  |         |          |                                                       |
| AC-3 | REQ-4  |         |          | <"within 500 ms", "exactly these keys", "equals 'x'"> |

## 4. Out of scope

Adjacent things this feature deliberately does not do. A reviewer asking "what about X?" finds X here.

-

## 5. Unchanged behavior

Existing behavior this change touches but must not alter, with the test that proves it.

| Behavior               | Proof                              |
| ---------------------- | ---------------------------------- |
| <existing page/action> | `<file>.test.ts` :: "<test title>" |

## 6. Traceability (filled as work lands)

| AC   | Test (file :: title) | Red commit | Green commit |
| ---- | -------------------- | ---------- | ------------ |
| AC-1 |                      |            |              |

## 7. Open questions

Resolved before Status becomes `approved`. One line each: question · decision · who · date.

---

### Writing rules

- **Banned unless quantified:** fast, quick, slow, friendly, simple, easy, intuitive, robust, scalable, small,
  large, soon, responsive, clean, reasonable. "Within 300 ms" is allowed; "fast" is not. A reviewer rejects a
  spec that contains one of these words without a number and unit next to it.
- One behavior per SHALL. An "and" in the response usually means two requirements.
- Criteria assert on what a user or client can observe (rendered text, returned `ActionResult`, HTTP status,
  database row), never on internal calls.
- Tier `0` specs stop after section 2 and produce a plan only. Tier `quick` may skip sections 5 and 7 if empty.
- Agents implement from sections 2–5 only. If something needed is missing, the spec changes first, in its own
  `docs(FEAT-xxx):` commit, and the lead re-ticks the box.
