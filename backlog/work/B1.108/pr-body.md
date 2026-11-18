## Item

B1.108 — guard-bash lets `gh pr` merge or delete the branch when `pr`, the subcommand or the flag is quoted in pieces
(tooling, no spec section)

- spec: none — tooling (`.claude/hooks/guard-bash.sh`, `scripts/hook-smoke.sh`, `.claude/docs/hooks.md`); no `src/`
  change, no section
- test: `scripts/hook-smoke.sh`, five B1.108 sections (the card's forms, then review passes 1–4): red before each fix,
  green after
- acceptance: all four clauses of the card (each listed form blocked with the existing message or named out of reach;
  the forms blocked before stay blocked and every allow probe passes; probes red then green with the counts and the
  138 KB timing; `config-change-approved`)

## Plan

Copied from `backlog/work/B1.108/plan.md` (plan review approved round 12; `Plan approved by: lead, 2026-11-18`;
Rounds: 5 — the lead approved rounds 3, 6, 7, 11 and 12 and allowed review passes 4 and 5). See that file for the
full text; summary:

Approach B (normalize), one `sed` for the whole command: the gh pr merge and branch-delete rules read an unquoted,
lower-case copy of each segment, as the shell hands gh its words. `UNQUOTE` removes empty variables (`$NAME`,
`${NAME}`, `$1`, `${10}`, `$@`, `$*`), with a subscript or zsh flags only when that span holds no shell
metacharacter, the `$` of `$'…'`/`$"…"`, every `'` `"` `\`, and makes `<` `>` spaces; `BRACE_ONE` (flag `g`) runs a
fixed four times (a list's first five items, with prefix and suffix), then leftover `{` `}` go. Main's own two gh pr
rules (`*_RAW`, verbatim from `4c79bec`) still run on the original text, so the copy only adds blocks: any command
main blocks is blocked here. The git push, config and `gh api` rules are unchanged.

| File                          | Change                                                                                        | Why          |
| ----------------------------- | --------------------------------------------------------------------------------------------- | ------------ |
| `.claude/hooks/guard-bash.sh` | `UNQUOTE`, `BRACE_ONE`, a loop over the copy for the two gh pr rules, main's rules as `*_RAW` | Acceptance 1 |
| `scripts/hook-smoke.sh`       | 5 sections: 40 + 30 + 6 + 18 + 6 probes                                                       | Test line    |
| `.claude/docs/hooks.md`       | guard-bash row: the unquoted copy, the costs, what stays out of reach                         | Acceptance 1 |
| `backlog/work/B1.108/*`       | plan, review, pr-body                                                                         | pipeline     |

Out of reach (header and `hooks.md`): an escape the shell expands (`$'\x2dd'`), operator expansions (`${X:-merge}`),
a brace list's sixth item on, nested lists, a sequence (`-{c..d}`), an item holding `}`, a glob (`gh pr [m]erge 7`),
a zsh subscript flag inside braces or a flag group with a space, a word split by a parameter inside an unexpanded
`${X[ … ]}` and passed on as `$1` (review pass 5; main too; follow-up card to be filed), `${IFS}`, a word in a set
variable, `$(…)`, an alias; for `gh api` and git push, a word quoted in pieces.

## Map delta

None (no `src/`, no section).

## Review

`/review-loop`: 5 diff passes (the lead allowed passes 4 and 5 past the cap of 3) and 12 plan review rounds, all in
`backlog/work/B1.108/review.md`. Every finding:

| Pass | #   | Finding                                                                        | Kind        | Disposition                                                   |
| ---- | --- | ------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------- |
| 1    | 1   | a brace list glued to `;` `&` the pipe `(` `)` or a backtick still got through | correctness | fix now (`2a636039`, `5f9884b2`)                              |
| 1    | 2   | `${10}` not removed                                                            | correctness | fix now (`2a636039`, `5f9884b2`)                              |
| 2    | 1   | `{$X[,-d,-c,]}` — regression from `bd10055` (bare subscript took a comma)      | correctness | fix now (`4c8f20a3`, `2889c4fd`)                              |
| 2    | 2   | `${X[ 1 ]}merge` got through                                                   | correctness | fix now (`4c8f20a3`, `2889c4fd`)                              |
| 2    | 3   | `hooks.md` row cut by a bare pipe                                              | docs        | fix now (`2889c4fd`)                                          |
| 3    | 1   | `${X[` across a quote or after `\` deleted command text — regression from main | correctness | fix now (`14db89e8`, `3c489387`)                              |
| 4    | 1   | `\${X[ -d ]}` passed to gh as `$1` — regression from main                      | correctness | fix now (`2cee1538`, `ca34cab5`)                              |
| 5    | 1   | `\${X[ -$@d ]}` passed as `$1` (main lets it through too)                      | correctness | out of scope: named out of reach (`452cd81d`); follow-up card |

Pass 5 proved the structural property: across 72 commands (BSD and GNU sed) and plan review 12's 296-command corpus
plus a 1,500-command fuzz, nothing main blocks exits 0 here. No untrusted text tried to steer the plan or the review.

## Evidence

Red and green (`/bin/bash` 3.2.57; CI runs bash 5):

| Commit                          | hook-smoke                  |
| ------------------------------- | --------------------------- |
| `f51f28c` probes (base hook)    | exit 1, 30 FAIL, 848 ok     |
| `bd10055` green                 | "hook-smoke: 878 probes OK" |
| `2a636039` review pass 1 probes | exit 1, 26 FAIL, 882 ok     |
| `5f9884b2` review pass 1 fix    | "hook-smoke: 908 probes OK" |
| `4c8f20a3` review pass 2 probes | exit 1, 4 FAIL, 910 ok      |
| `2889c4fd` review pass 2 fix    | "hook-smoke: 914 probes OK" |
| `14db89e8` review pass 3 probes | exit 1, 10 FAIL, 922 ok     |
| `3c489387` review pass 3 fix    | "hook-smoke: 932 probes OK" |
| `2cee1538` review pass 4 probes | exit 1, 6 FAIL, 932 ok      |
| `ca34cab5` review pass 4 fix    | "hook-smoke: 938 probes OK" |

Before the card: "hook-smoke: 838 probes OK" (`4c79bec`). `pnpm lint` and `pnpm typecheck` exit 0; `pnpm test`
"Tests 403 passed (403)" before and after; `pnpm test:e2e` "91 passed" (reviewer, pass 1; no `src/` change since);
mutation: CI only, no src/lib or src/actions change.

Timing, base `4c79bec` side by side (`/bin/bash` 3.2): one 139 KB segment 349.62 / 349.64 s (`2889c4fd`); 300
segments 1.9–2.3 s on both at `ca34cab5`; a 3 KB word with 1000 commas 0.10 / 0.10 s; a heredoc of a 96 KB JSON line
0.43 / 0.49 s.

- AC met: 4/4
- tier: high
- plan deviations: none
- trace: n/a
