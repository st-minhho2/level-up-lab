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

## Plan review (round 2)

SCOPE: all (tooling, no §). Plan at `e1dfa6e`; the only change since round 1 (`02efba1`) is `plan.md`. The prototype
in the session scratchpad (`proto/.claude/hooks/guard-bash.sh`) now holds the round-1 fixes (`\$` opens no `$'…'`,
lines joined at `\`-newline, ASSIGN_PATH, LINE_PATH).

Commands run (nothing on the tree):

- `scripts/next-task.sh --check B1.79` gave `[next-task] B1.79: no overlap with any Doing or Review card`.
- `scripts/agent/tier.sh backlog/work/B1.79/plan.md` gave `high`.
- `hook-smoke.sh` on a `git archive` copy with the prototype hook (node_modules linked) gave `hook-smoke: 581 probes OK`.
- Replay of `den.jsonl`: today 2,2,2,2,2,2,0; prototype 2,0,0,2,0,0,0 (unchanged from round 1, as planned).
- Round-1 probes p1–p4, p6, p7, p10, p11 (the reason-1 rows): 2 on the prototype. Round-1 fixes hold.
- New probes below, through today's hook and the prototype. I ran each regression row with `bash` in a scratch
  folder holding a fake dotenv file, and each printed that file.

| Check                                                                                  | Result                                                                                                                               |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                         | pass: no § (tooling); rows unchanged from round 1                                                                                    |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: no TypeScript, action or Prisma change                                                                                         |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: no `advice.md` (tier quick), stated                                                                                            |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 3 Acceptance lines; each probe row has a wanted exit code                                                                      |
| verification lists exact commands with expected numbers                                | pass: red 20 FAIL / 598 ok, green 618 (581 + 37), the runner-container command and its last line now pasted (round-1 reason 3 fixed) |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: tooling, no skeleton and no map (B1.78 precedent)                                                                              |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: n/a, no spec; tier high → lead's `approve` (D-27, D-28); `config-change-approved` planned (D-19)                               |
| no settled D-n contradicted                                                            | **fail**: there are still regressions, which D-25 makes in-card (reason 1)                                                           |
| `scripts/next-task.sh --check <card>` on the committed plan says no overlap            | pass: `[next-task] B1.79: no overlap with any Doing or Review card`                                                                  |

Verdict: changes requested

1. **Secret reads still pass when the path is not first on its line and has no `=` before it.** The round-1 fix
   added two patterns that each cover one spelling: LINE_PATH (a heredoc line that starts with the path) and
   ASSIGN_PATH (`=` before the path). A bare path word anywhere else on a heredoc line or a quoted-string line, with
   the reader on another line, still passes. Today's hook refuses each of these (Acceptance 2, D-25). Confirmed,
   each read the fake file:

   | Input (newlines as ⏎)                                           | today | planned |
   | --------------------------------------------------------------- | ----- | ------- |
   | `xargs cat <<'EOF'` ⏎ `a.txt .env` ⏎ `EOF` (SR23 plus one word) | 2     | 0       |
   | `xargs cat <<< 'a` ⏎ `.env` ⏎ `b'` (here-string, quoted lines)  | 2     | 0       |
   | `bash <<'SH'` ⏎ `for f in .env` ⏎ `do cat "$f"; done` ⏎ `SH`    | 2     | 0       |
   | `bash -c '` ⏎ `for f in .env` ⏎ `do cat "$f"; done'`            | 2     | 0       |
   | `bash <<'SH'` ⏎ `set -- a .env` ⏎ `cat "$2"` ⏎ `SH`             | 2     | 0       |
   | `bash <<'SH'` ⏎ `F=( .env )` ⏎ `cat "${F[0]}"` ⏎ `SH`           | 2     | 0       |

   The plan's "Out of reach, as today" line does not cover these, because today's hook blocks them. Adding one
   pattern per spelling will not close this; round 1 and round 2 each found new rows. One rule that would close it:
   check a heredoc body against today's rule (a path word anywhere, plus a reader anywhere in the command) whenever
   the heredoc or here-string feeds a shell or a word consumer (`bash`, `sh`, `zsh`, `source`, `xargs`, `while read`,
   `<<<`), and against the per-line rule only when it feeds an interpreter or a file (`python3 -`, `node -`,
   `cat > f`, `git commit -F -`). Apply the same to a multi-line quoted string passed to `bash -c`/`sh -c`. If the
   plan keeps the current design instead, it must list each row above as "2 today, 0 after" so the lead approves the
   loss knowingly.

2. **LINE_PATH and ASSIGN_PATH add new refusals of the card's own target shape, and the plan does not list them.**
   Under the round-1 rule (traced: SECRET_FILE matches but no reader on the line) these passed; under the round-2
   rule they exit 2:
   - `cat > src/components/x.tsx <<'EOF'` ⏎ `  if (` ⏎ `    event.key === 'Escape' &&` ⏎ `    !pending` ⏎ `  ) {}` ⏎
     `EOF`. Prettier wraps a long condition this way, so E5 diffs will produce it. Today 2, planned 2.
   - `cat > notes.md <<'EOF'` ⏎ `  event.key is the property` ⏎ `EOF`, and `python3 - <<'PY'` ⏎ `k=event.key` ⏎
     `PY`. Both 2 today and 2 planned.

   The card says E5 puts `event.key` in most diffs, so the first one is the card's own problem coming back. Either
   make LINE_PATH/ASSIGN_PATH apply only in the shell-fed case from reason 1, or keep `.key`/`.pem`/`.p12` out of
   them. Otherwise list these rows under "Still refused" and add an SM row that pins the verdict either way.

3. (minor) The Files table and the `scripts/CLAUDE.md` row still say "SR1–SR21", but the probe list runs to SR28.
   The footer still says `Rounds: 1`.

Round 1 reasons: 1 partly fixed (all 7 rows now 2; the class is still open, reason 1 above), 2 fixed ("Still
refused" names the two examples), 3 fixed.

Round 3 of this review goes to the human (reviewer.md: third round → "Waiting on human").
