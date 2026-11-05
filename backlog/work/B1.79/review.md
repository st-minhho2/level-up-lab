# B1.79 review

## Plan review (round 1)

SCOPE: all (tooling, no §: `.claude/hooks/`, `.claude/docs/`, `scripts/`, `backlog/`). Plan at `cffff72`. Read: card
B1.79 (`backlog/plan/E1-todos.md:999`), `plan.md`, `filing-pr-body.md`, `.claude/hooks/guard-bash.sh`, `lib.sh`, the
prototype rule 4 in the session scratchpad (`proto/.claude/hooks/guard-bash.sh`, diff vs the tree is rule 4 only),
`den.jsonl`, B1.78's plan and plan review (precedent for tooling plans), D-7, D-19, D-25, D-27, D-28.

Commands run (nothing on the tree; probes are JSON payloads piped to the hook, the prototype and a `git archive`
copy in the scratchpad):

- `scripts/next-task.sh --check B1.79` gave `[next-task] B1.79: no overlap with any Doing or Review card`.
- `scripts/agent/tier.sh backlog/work/B1.79/plan.md` gave `high`; `scripts/ci/plan-files.sh --any B1.79 HEAD` gave 5
  tokens, all in the Files table.
- `scripts/hook-smoke.sh` on the tree gave `hook-smoke: 581 probes OK`, the baseline the plan quotes.
- Replay of `den.jsonl` (7 commands): today 2,2,2,2,2,2,0; prototype 2,0,0,2,0,0,0. The 4 rule-4 denials pass,
  `pr-step.sh` and `rm -rf` still exit 2: matches the plan.
- Plan rows spot-checked on the prototype: SM4 0, SR10 2, SR12 2, SR18 2, SR19 2, SR21 2 (as planned).
- `hook-smoke.sh` on a copy with the prototype hook: every guard-bash section `ok`; the 14 FAILs are path-guard
  frontmatter and FR rows that need `node_modules` (js-yaml, prettier), absent from the copy.
- Regression probes (table under reason 1): each exits 2 on today's hook and 0 on the prototype. Run with `bash` in a
  scratch folder holding a fake dotenv file, each printed that file's contents.

| Check                                                                                  | Result                                                                                                                                              |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: no § (tooling); each row traces to Acceptance 1–3 or to doc drift naming `guard-bash.sh`/`hook-smoke.sh`                                      |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: no TypeScript, action or Prisma change; rule 4 interface pasted (regexes, split, block conditions)                                            |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no `advice.md` (tier quick), stated; the rejected alternative (per-segment) is named with its reason                                          |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: card Acceptance has 3 lines; each probe row has a wanted exit code                                                                            |
| verification lists exact commands with expected numbers                                | pass: red 20 FAIL / 591 ok, green `hook-smoke: 611 probes OK` (581 + 30), replay 4 → 0, 2 stay 2. The runner-container run names no command (minor) |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: tooling, no skeleton and no map row (B1.78 precedent); `test(scripts): … (red)` → `chore(hooks): …` → review → PR                             |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a, no spec section; the tier is high, so the lead's `approve` gates the plan (D-27, D-28), and `config-change-approved` is planned (D-19)   |
| no settled D-n contradicted                                                            | **fail**: D-25 makes a regression an in-card fix, and the planned rule regresses (reason 1)                                                         |
| `scripts/next-task.sh --check <card>` on the committed plan says no overlap            | pass: `[next-task] B1.79: no overlap with any Doing or Review card`                                                                                 |

Verdict: changes requested

1. **The planned rule lets through secret reads that today's hook blocks.** This breaks Acceptance 2 ("a reader
   whose argument … names a secret path stays refused in any segment"). It also goes against the plan's own reason
   for rejecting per-segment scoping, which was that it passed `echo .env | xargs cat`, a command blocked today. The
   cause: a heredoc line and a quoted-string line are each checked alone, so a reader on one line and the path on the
   next line are never paired. The awk splitter also gets `\$'` wrong. It reads that as a `$'…'` string (where `\'`
   does not close the quote), while the shell reads `\$` and then a plain `'…'` string. So real shell text after it
   is treated as quoted. Confirmed: each command below exits 2 today, exits 0 on the prototype, and printed the fake
   file under `bash`.

   | Input (newlines as ⏎)                                                                         | today | planned |
   | --------------------------------------------------------------------------------------------- | ----- | ------- |
   | `xargs cat <<'EOF'` ⏎ `.env` ⏎ `EOF`                                                          | 2     | 0       |
   | `while read f; do cat "$f"; done <<EOF` ⏎ `.env.local` ⏎ `EOF`                                | 2     | 0       |
   | `bash <<'SH'` ⏎ `cat \` ⏎ `.env` ⏎ `SH`                                                       | 2     | 0       |
   | `bash <<'SH'` ⏎ `head -n 99 \` ⏎ `server.key` ⏎ `SH`                                          | 2     | 0       |
   | `xargs -I{} cp {} /tmp/x <<'EOF'` ⏎ `certs/server.pem` ⏎ `EOF`                                | 2     | 0       |
   | `echo \$'\'; cat \` ⏎ `.env #'` (shell text, no heredoc)                                      | 2     | 0       |
   | `bash <<'SH'` ⏎ `F=.env` ⏎ `cat "$F"` ⏎ `SH` (also `bash -c '` ⏎ `F=.env` ⏎ `cat "$F"` ⏎ `'`) | 2     | 0       |

   The last row is under "Not in scope" ("a path in a variable set inside a quoted string or heredoc"), but the plan
   does not say that today's hook blocks it. Either make the rule keep these at 2 and add them as SR rows (one
   possible way: a C/B line that holds a SECRET_FILE word and a READER anywhere in the command blocks, unless that
   line is a mention. That is roughly what today's rule does for heredoc text, with the comment/`event.key` carve-out
   kept), or state each one in the plan as "blocked today, passes after" so the lead accepts the loss knowingly.
   Without that, the card ships an invariant-7 regression behind a high-tier gate.

2. **State the false positives that remain.** A heredoc or quoted line that holds `event.key ` and any reader word
   (`open`, `sort`, `cut`, `head`, `node` …) still exits 2. For example, `cat > t.ts <<'EOF'` ⏎
   `  if (event.key === 'Escape') open = false` ⏎ `EOF` gives 2 today and 2 planned. So does
   `git commit -m 'never cat .env in a hook'`. The card says E5 puts `event.key` in most diffs, so the lead should see
   which shapes still lose a call. Add them to "Not in scope", or add a passing row if the rule is changed to cover
   them.
3. (minor) Verification says "in the runner container (bash 5.2, mawk)" but names no command. Paste the invocation
   (or say it is the CI `test` job), and quote its expected last line.

Not a reason: the plan is 72 lines, against planning.md's ≈ 40. B1.78's 82-line plan passed review with the same
layout.
