# Backlog

Work for the whole system, derived from the spec (`spec/technical-requirements.md` §1–§10). Cards live in `plan/`,
rulings in `00-decisions.md`, role artifacts in `work/<card>/`. Rules for picking, writing and closing: `CLAUDE.md`.

## Status summary

| Epic      | File                                 | Done   | Partial | Open  | Total  |
| --------- | ------------------------------------ | ------ | ------- | ----- | ------ |
| E1 Todos  | [plan/E1-todos.md](plan/E1-todos.md) | 16     | 0       | 0     | 16     |
| **Total** |                                      | **16** | **0**   | **0** | **16** |

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
  S11["11 · Redact password as written<br/>~~B1.11~~"]
  S9 --> S11
  S12["12 · card-status.sh whole paragraph<br/>~~B1.12~~"]
  S13["13 · worktree-prune.sh every layout<br/>~~B1.13~~"]
  S14["14 · worktree-prune.sh keeps a net-empty branch<br/>~~B1.14~~"]
  S15["15 · compose project from every checkout<br/>~~B1.15~~"]
  S16["16 · lead time and change failure baseline<br/>~~B1.16~~"]
```

## Remaining

| Step | ID  | Title | Spec § | Status | Blocked by | Owner | Size |
| ---- | --- | ----- | ------ | ------ | ---------- | ----- | ---- |

## Waiting on human

| ID  | What | Blocks |
| --- | ---- | ------ |
