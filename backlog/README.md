# Backlog

Work for the whole system, derived from the spec (`spec/technical-requirements.md` §1–§10). Cards live in `plan/`,
rulings in `00-decisions.md`, role artifacts in `work/<card>/`. Rules for picking, writing and closing: `CLAUDE.md`.

## Status summary

| Epic      | File                                 | Done   | Partial | Open  | Total  |
| --------- | ------------------------------------ | ------ | ------- | ----- | ------ |
| E1 Todos  | [plan/E1-todos.md](plan/E1-todos.md) | 10     | 0       | 1     | 11     |
| **Total** |                                      | **10** | **0**   | **1** | **11** |

## Execution order

```mermaid
flowchart TD
  S1["1 · List, create, toggle<br/>~~B1.1~~"]
  S2["2 · Edit a title<br/>~~B1.2~~"]
  S3["3 · Clear completed<br/>~~B1.3~~"]
  S1 --> S2
  S4["4 · Mutation failure feedback<br/>~~B1.4~~"]
  S1 --> S3
  S3 --> S4
  S5["5 · Create failure feedback<br/>~~B1.5~~"]
  S4 --> S5
  S6["6 · Log swallowed failures<br/>~~B1.6~~"]
  S5 --> S6
  S7["7 · Kill mutation survivors<br/>~~B1.7~~"]
  S6 --> S7
  S8["8 · Log Prisma errorCode<br/>~~B1.8~~"]
  S6 --> S8
  S9["9 · Redact every password form<br/>~~B1.9~~"]
  S8 --> S9
  S10["10 · E2E failed create keeps title<br/>~~B1.10~~"]
  S5 --> S10
  S11["11 · Redact password as written<br/>B1.11"]
  S9 --> S11
```

## Remaining

| Step | ID    | Title                                                             | Spec § | Status | Blocked by     | Owner | Size         |
| ---- | ----- | ----------------------------------------------------------------- | ------ | ------ | -------------- | ----- | ------------ |
| 11   | B1.11 | Redact the database password exactly as written in `DATABASE_URL` | §11    | Open   | ~~B1.9~~, D-17 | Lead  | S [estimate] |

## Waiting on human

| ID   | What                                                                                                                                                                                                                                            | Blocks |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| D-17 | §11 REQ-11.4 "as written" vs the parser-normalized forms in its Function contracts: A also redact the raw-text forms; B reword REQ-11.4 to the parser forms (Tier 0); C list the gap as out of scope. Request: `work/B1.11/decision-request.md` | B1.11  |
