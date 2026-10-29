# B1.12 review

## Plan review (round 1)

SCOPE: none of lib | actions | ui. The plan touches `scripts/card-status.sh` (tooling, protected) and `backlog/` only;
no `src/`, `prisma/`, `e2e/` path, so no spec section, skeleton or Stryker run applies.

Plan reviewed at `eb52325` (`docs(backlog): B1.12 plan`), card at `24665de`. Probes ran on copies under
`$TMPDIR/b112rev/` (copies of `scripts/card-status.sh` and `backlog/plan/E1-todos.md` taken from `24665de`).

### How the checklist was adapted to a tooling card

| Row in `reviewer.md`                         | Read here as                                                                                         |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| files belong to the section's features (map) | files belong to the card's Acceptance (no § and no map row; `scripts/CLAUDE.md` row is the contract) |
| interfaces follow `ts-style.md`              | the script's CLI (usage, exit codes, message) stays as `scripts/CLAUDE.md` states; bash 3.2-safe     |
| follows `advice.md`                          | no `advice.md` (Tier quick, no `src/lib/todos.ts`): the skip must be stated                          |
| ≤ 7 criteria, measurable Then                | the card's Test and Acceptance lines are measurable                                                  |
| exact commands with expected numbers         | unchanged                                                                                            |
| skeleton → red → green → map → review        | no harness for `scripts/`: red = probe fails on `24665de`, green = probe passes on the fix; no map   |
| `Lead approves spec` box                     | no section: the card's `Spec:`/`Test:` lines exist (merged in #38)                                   |
| no settled D-n contradicted                  | unchanged; also invariant 2 (red first) and the role write scopes                                    |

### Checklist

| Check                                    | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| files belong to the card                 | pass: `scripts/card-status.sh` and `backlog/plan/E1-todos.md` (B1.7–B1.11) are the card's two Acceptance items; `backlog/work/B1.12/` is the card's Work line. The probe the plan relies on is not in the list (reason 3).                                                                                                                                                                                                                                          |
| interface unchanged                      | pass: plan keeps `scripts/card-status.sh <B-id> <Open\|Partial\|Done> "<evidence>"`, usage, exit codes and message.                                                                                                                                                                                                                                                                                                                                                 |
| advice                                   | pass: skip of spec-analyst and advisor stated (Tier quick, no section) in the Approach paragraph.                                                                                                                                                                                                                                                                                                                                                                   |
| criteria measurable                      | pass: card Test ("status paragraph is exactly `**Status: Done** — x`, every other line byte-identical") and Acceptance (probe one-line + multi-line; B1.7–B1.11 cleaned; `check-backlog.sh` OK) are binary. The plan's paragraph end adds `### ` to the card's "blank line or `- **` line": a superset, harmless (a heading ends the card anyway).                                                                                                                  |
| paragraph-end rule vs every card         | pass: all 12 status paragraphs in `E1-todos.md` end at a blank line (B1.1–B1.6 one line, B1.7 +5, B1.8 +3, B1.9 +4, B1.10 +5, B1.11 +6, B1.12 +8 continuation lines); the next non-blank line is `- **Spec:**` in all 12. No card ends its status paragraph at `- **` or `### ` directly (prettier separates blocks with a blank line), so those two branches are never exercised by the real file (reason 1).                                                      |
| cleanup is deletions only                | pass (confirmed): a candidate fix re-run on B1.7–B1.11 with each card's current first-line evidence gives `git diff --numstat` `0 23` (5+3+4+5+6), no added line; none of those five status lines holds a `\` (awk `-v` would rewrite escapes), the only `\` in the file is B1.12's own Open text (line 160).                                                                                                                                                       |
| verification exact with numbers          | fail: the probe has no invocation or path in the plan, the "after" input is not pinned, and "only deletions" has no number (reasons 2, 3, 5).                                                                                                                                                                                                                                                                                                                       |
| work breakdown                           | fail: step 1 is assigned to "dev-lead session", but `dev-lead.md` limits that role to `backlog/*`, `docs/metrics.md`, `docs/mistake-log.md` (frontmatter `path-guard.sh`; "you write only …") (reason 4). Commit subjects pass the `commit-msg` regex (`fix(scripts): …`, `docs(backlog): …`).                                                                                                                                                                      |
| red/green evidence (invariant 2 adapted) | fail as written: red is real (confirmed, below) but recorded only from a script in `$TMPDIR`, and the probe cannot tell the planned rule from a weaker one (reasons 1–3).                                                                                                                                                                                                                                                                                           |
| protected path and label                 | pass: `scripts/card-status\.sh` is in `check-config-change.sh` `PROTECTED`; CI reads the label at `.github/workflows/ci.yml:122` and runs the check at `:144`; `backlog/plan/*.md` and `backlog/work/**` are not protected. Plan step 4 has the lead (human) add `config-change-approved`, never an agent. Expect the `check-config-change` job red on PR open until the label is added; the lead's plan approval is also the CLAUDE.md "ask before a tool change". |
| no settled D-n contradicted              | pass: D-1…D-17 rule §5–§11 and test shapes; none governs `scripts/`. D-13/D-16 (red evidence recorded in `review.md`) is the closest precedent and the plan follows its shape; it should say so (reason 3).                                                                                                                                                                                                                                                         |

### Probe runs (on copies, `24665de`)

```
$TMPDIR/b112_probe.sh <script> <E1-todos.md at 24665de>
  unfixed (24665de)                         FAIL B1.10: 5 unexpected line(s) left · PASS B1.6     (red reproduced)
  skip until blank | `- **` | `### `        PASS B1.10 · PASS B1.6                                 (planned rule)
  skip until blank only                     PASS B1.10 · PASS B1.6                                 (weaker rule, also passes)
  skip until `### ` only (eats bullets)     FAIL B1.10: 0 unexpected line(s) left · FAIL B1.6: 0 …
  skip until `- **` only (eats blank line)  FAIL B1.10: 0 unexpected line(s) left · FAIL B1.6: 0 …
$TMPDIR/b112_probe.sh <unfixed 24665de script> <E1-todos.md after the B1.7–B1.11 cleanup>
                                            PASS B1.10 · PASS B1.6                                 (unfixed script passes)
```

### Verdict: changes requested

1. **The probe cannot tell the planned rule from a blank-line-only rule.** A fix that ends the paragraph only at a
   blank line passes both cases (run above), because every card in `E1-todos.md` ends its status paragraph at a blank
   line. The card's Test line names "`- **` line" as an end, and the plan adds `### `; neither branch is exercised.
   With a template-shaped card (`backlog/CLAUDE.md` "Card layout": the status line followed directly by `- **Spec:**`)
   a blank-only fix deletes the Spec/Test/Acceptance lines up to the next blank line. Add two synthetic cases to the
   probe's fixture: status + continuation followed directly by `- **Spec:**`, and followed directly by `### `.
   Also make the FAIL message count both directions (`diff | grep -c '^[<>]'`): today an over-deleting fix prints
   "0 unexpected line(s) left".
2. **Pin the "after" input.** Run on the cleaned `E1-todos.md`, the unfixed script passes (B1.10 is then one line).
   The Verification must name the input for both runs: `git show 24665de:backlog/plan/E1-todos.md`, or add B1.12
   (8 continuation lines, still multi-line after the cleanup) as a probe case.
3. **Commit the probe.** It lives only in `$TMPDIR`, so the diff reviewer, the PR reader and the lead cannot rerun the
   red or the green. Add `backlog/work/B1.12/probe.sh` (writable by `dev-lead`, not protected, not wired into CI) to
   Files, and state the invariant-2 adaptation in the Approach: no `test(...)` commit (no harness for `scripts/`); red
   evidence = the committed probe failing on `24665de`'s script, green = passing on the fix, both recorded in
   `review.md`, in D-13/D-16's shape. The lead then approves that deviation knowingly.
4. **Name who edits `scripts/card-status.sh`.** "dev-lead session (no role owns `scripts/`)" does not fit the role:
   `dev-lead.md` writes only `backlog/*`, `docs/metrics.md`, `docs/mistake-log.md`. State who makes the step 1 edit
   (the orchestrating main session, on the lead's approval of this plan as the CLAUDE.md "ask before any tool change"
   approval; or the lead) so the gate prompt shows the lead the scope they are granting.
5. **Numbers in Verification.** `git diff --numstat origin/main -- backlog/plan/E1-todos.md` → `0	23` (confirmed by
   simulation); the committed probe on the `24665de` fixture → `FAIL` at `24665de`, `PASS` on all cases after the fix;
   `scripts/ci/check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` → the `OK` lines (all three OK at
   `eb52325`); `bash -n scripts/card-status.sh` → exit 0.

Notes (no change requested):

- `scripts/card-status.sh`'s last check (`grep -qE "^\*\*Status: $NEW\*\* — " "$FILE"`) reads the whole file, not the
  card, so "card has no status line" goes unreported whenever another card already has that status; and `awk -v`
  rewrites backslash escapes in the evidence. Both predate B1.12 and are outside its Acceptance; a later card.
- The branch is `fix/B1.12-card-status-paragraph`; `git-workflow.md` "Runs without asking" covers pushes of
  `feat/*` and `dev-lead.md` names `feat/<card>-<slug>`. Not blocked by a hook; the lead may want it noted in the PR.
- B1.12's own closing commit will run the fixed script over its 8-line Open paragraph: a second real multi-line case.

Riskiest unfalsified: a status paragraph that ends at `- **` or `### ` with no blank line (only reachable in a file
prettier has not checked); untested until reason 1's fixture exists.
