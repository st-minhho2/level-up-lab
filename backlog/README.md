# Backlog

Work for the whole system, derived from the spec (`spec/technical-requirements.md` §1–§10). Cards live in `plan/`,
rulings in `00-decisions.md`, role artifacts in `work/<card>/`. Rules for picking, writing and closing: `CLAUDE.md`.

## Status summary

| Epic             | File                                                 | Done   | Partial | Open  | Total  |
| ---------------- | ---------------------------------------------------- | ------ | ------- | ----- | ------ |
| E1 Todos         | [plan/E1-todos.md](plan/E1-todos.md)                 | 32     | 0       | 9     | 41     |
| E2 Todos plus    | [plan/E2-todos-plus.md](plan/E2-todos-plus.md)       | 5      | 0       | 0     | 5      |
| E3 Todos polish  | [plan/E3-todos-polish.md](plan/E3-todos-polish.md)   | 3      | 0       | 0     | 3      |
| E4 Todos details | [plan/E4-todos-details.md](plan/E4-todos-details.md) | 3      | 0       | 0     | 3      |
| **Total**        |                                                      | **43** | **0**   | **9** | **52** |

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
  S17["17 · plan-scope hook<br/>~~B1.17~~"]
  S18["18 · WIP limit<br/>~~B1.18~~"]
  S19["19 · git hooks in every worktree<br/>~~B1.19~~"]
  S20["20 · plan-scope literal match<br/>~~B1.20~~"]
  S21["21 · draft PR, ping, current branches<br/>~~B1.21~~"]
  S22["22 · batch review and lane metrics<br/>~~B1.22~~"]
  S21 --> S22
  S19 --> S21
  S17 --> S18
  S16 --> S17
  S23["23 · filter All / Active / Completed<br/>~~B2.1~~"]
  S24["24 · remaining count<br/>~~B2.2~~"]
  S25["25 · mark all complete<br/>~~B2.3~~"]
  S26["26 · due date (migration)<br/>~~B2.4~~"]
  S27["27 · search by title<br/>~~B2.5~~"]
  S28["28 · overdue marker<br/>~~B3.1~~"]
  S29["29 · title counter<br/>~~B3.2~~"]
  S30["30 · delete a todo<br/>~~B3.3~~"]
  S31["31 · sessions run their PR steps<br/>~~B1.23~~"]
  S32["32 · guard-bash every forced push<br/>~~B1.24~~"]
  S33["33 · created date<br/>~~B4.1~~"]
  S34["34 · clear search<br/>~~B4.2~~"]
  S35["35 · all done<br/>~~B4.3~~"]
  S36["36 · verify-red escaped titles<br/>~~B1.25~~"]
  S37["37 · pr-step closing PR<br/>~~B1.26~~"]
  S38["38 · next-task quoted titles<br/>~~B1.27~~"]
  S39["39 · guides name batch 4 modules<br/>~~B1.28~~"]
  S40["40 · verify-red base run<br/>~~B1.29~~"]
  S41["41 · guard-bash shell words<br/>B1.30"]
  S42["42 · root guides cite sections<br/>~~B1.31~~"]
  S43["43 · plan-scope glob per segment<br/>~~B1.32~~"]
  S44["44 · CI runs hook-smoke<br/>~~B1.33~~"]
  S45["45 · guide headings cite sections<br/>B1.34"]
  S46["46 · guard for guide § cells<br/>B1.35"]
  S47["47 · hook-smoke gate probe base<br/>B1.36"]
  S48["48 · hook-smoke ignores HEAD_SHA<br/>B1.37"]
  S49["49 · pr-step ci titles<br/>B1.38"]
  S50["50 · plan-deviations uses plan_lists<br/>B1.39"]
  S51["51 · next-task --check uses plan_lists<br/>B1.40"]
  S52["52 · guides state the token rule<br/>B1.41"]
```

## Remaining

Board state (To do · Doing · Review · Closing) is derived, not typed: `scripts/next-task.sh --list` (BOARD column),
at most 3 cards Doing (B1.18).

| Step | ID    | Title                                                                               | Spec § | Status | Blocked by | Owner | Size         |
| ---- | ----- | ----------------------------------------------------------------------------------- | ------ | ------ | ---------- | ----- | ------------ |
| 41   | B1.30 | guard-bash reads shell words before matching a push                                 | —      | Open   | —          | Lead  | S [estimate] |
| 45   | B1.34 | Package guide headings and the app page header cite the sections their modules name | —      | Open   | —          | Lead  | S [estimate] |
| 46   | B1.35 | A guard checks that the guide tables cite the sections their packages name          | —      | Open   | —          | Lead  | S [estimate] |
| 47   | B1.36 | hook-smoke's review-gate probe judges "clean" from the gate's own base              | —      | Open   | —          | Lead  | S [estimate] |
| 48   | B1.37 | hook-smoke's check-plan-scope probes ignore an exported HEAD_SHA and BASE_SHA       | —      | Open   | —          | Lead  | S [estimate] |
| 49   | B1.38 | pr-step accepts the ci type that commit-msg accepts                                 | —      | Open   | —          | Lead  | S [estimate] |
| 50   | B1.39 | plan-deviations judges a merged PR's files by the guard's plan_lists rule           | —      | Open   | —          | Lead  | S [estimate] |
| 51   | B1.40 | next-task --check reads plan tokens by the plan_lists rule                          | —      | Open   | —          | Lead  | S [estimate] |
| 52   | B1.41 | Guides state the plan-token rule and name hook-smoke's L1–L15                       | —      | Open   | —          | Lead  | S [estimate] |

## Waiting on human

| ID  | What | Blocks |
| --- | ---- | ------ |
