---
name: advise
description: Get a cited verdict on one blocking question about what governs - code disagrees with a spec, a spec is silent or contradicts itself, two specs collide, a change seems to need a rule bent, or a task waits on a human ruling. Use before choosing a side, before guessing, and before reporting "blocked". Not for tooling, hook, permission or git problems.
---

# advise

Use when you are blocked on _which source of truth governs_, not on tooling. The `advisor` agent resolves the
question by authority order (rules → `docs/decisions.md` D-n → spec → explanatory docs; code is evidence only),
quotes what governs, and names one next action or drafts a decision request.

## 1. Frame one question

One line naming the decision, e.g. "Does FEAT-003 reuse FEAT-001's 200-character title limit or define its own?".
Several questions → the one that blocks you now.

## 2. Pass the context (do not make the advisor rediscover it)

- files and lines involved, the spec §/REQ/AC ids, the task id and any D-n you already saw
- what you were about to do (the advisor checks it against `Must not`)

## 3. Call

`Agent(subagent_type: "advisor", run_in_background: false)` with the question and the context. Foreground: your
next step depends on it.

## 4. Act on the verdict

| Escalate | Next action     | You do                                                                                                   |
| -------- | --------------- | -------------------------------------------------------------------------------------------------------- |
| none     | implement / fix | Do it; cite the governing source in the commit body                                                      |
| none     | record gap      | Add the gap to the spec's §7 as an open question; do not implement                                       |
| none     | update doc      | Update the drifted doc in the same PR                                                                    |
| human    | —               | `scripts/task-status.sh FEAT-xxx blocked "<question>"`; put the decision request verbatim in your report |
| any      | stop (P5)       | Stop. Report the rule. Never work around it                                                              |

Do not argue with the verdict by guessing. If you think it is wrong, re-run with the source you think it missed;
a second contested answer goes to the human.
