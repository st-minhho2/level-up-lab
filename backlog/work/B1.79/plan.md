# B1.79 plan — guard-bash's secret rule reads words, not mentions (tooling, no §)

Approach: no `advice.md` (tier quick). Rule 4 keeps today's scope (the whole command) but stops matching inside text
that is not a shell word: a space inside quotes ends no word, and a heredoc body is not shell text. Each quoted string
and heredoc line is then checked on its own, `\`-newline joined; a heredoc line that starts with such a path, or an
`=` before one in a quoted string or heredoc, counts as a read when the command has a reader (review round 1).
Rejected: per-segment scoping (passes `echo .env | xargs cat` and `F=.env; cat "$F"`, both blocked today). Prototype
(scratch copy, not committed): the 4 denied run commands exit 0, the run's `rm -rf` command still exits 2 on rule 1,
the 581 existing probes stay OK on bash 3.2 + BSD awk (macOS) and bash 5.2 + mawk (runner container), and the 11 reads
review round 1 found exit 2. Risk tier **high** (`.claude/`, D-28) → the lead's `approve`;
the PR carries `config-change-approved` (D-19).

## Files

| File                          | Change                                                                                      | Why                |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| `.claude/hooks/guard-bash.sh` | rule 4 rewritten as below; message, exit code, other rules unchanged                        | Acceptance 1, 2, 3 |
| `scripts/hook-smoke.sh`       | section "guard-bash.sh: secret rule reads words, not mentions (B1.79)": SM1–SM9, SR1–SR21   | Acceptance 1, 2    |
| `.claude/docs/hooks.md`       | `guard-bash.sh` row: how rule 4 tells a path from a mention, its blocked/out-of-reach cases | doc drift          |
| `scripts/CLAUDE.md`           | the `hook-smoke.sh` row names SM1–SM9, SR1–SR21                                             | doc drift          |
| `backlog/work/B1.79/*`        | plan, review, pr-body                                                                       | pipeline           |

## Interfaces touched

```
guard-bash.sh rule 4 (exit 2, message unchanged; whole command exempt when it holds .env.example, as today):
  SECRET_NAME  id_rsa|id_ed25519|id_ecdsa|~/.aws|.aws/credentials|~/.ssh|.ssh/|.netrc|.npmrc|.docker/config.json|.kube/config
               + READER anywhere in the command → block (unchanged)
  split (awk, POSIX): O = shell text, heredoc bodies cut out, spaces/tabs inside '…' "…" $'…' turned into \037
                      (quotes and comments kept; `\$` opens no $'…'); C = each quoted string's text, line by line;
                      B = heredoc body lines; C and B each joined at `\`-newline before the line checks
  SECRET_FILE  (^|[space/=<"'])\.env(\.[A-Za-z0-9_-]+)*([space]|$|[;&|)<>"']) | \.(pem|p12|key)([space]|$|[;&|)<>])
  PATH_WORD    ([^space"'<>;&|()=]*/)?\.env(\.x)* | [^space"'<>;&|()=]*\.(pem|p12|key), then a word end as above
  block if  O ~ SECRET_FILE and READER in command  |  O ~ SECRET_REDIRECT (`<` from such a path, no reader needed)
         |  a C/B line ~ SECRET_FILE and READER on that line  |  a C/B line ~ SECRET_REDIRECT
         |  READER in command and a C/B line ~ ENV_LITERAL (["'`](…/)?\.env(\.x)*["'`]) or ASSIGN_PATH (=["']?PATH_WORD)
         |  READER in command and a B line ~ LINE_PATH (^[space]*PATH_WORD)
```

hook-smoke, new section (today's verdict → wanted; `*` = red today):
SM pass 0: SM1* run's python heredoc with `event.key !== 'Escape'` · SM2* run's `cat > e2e/… <<'EOF'` whose comment
names the dotenv file · SM3* run's `mut "event.key !== 'Escape' || pending"` with `python3`/`cp`/`head` · SM4*
`sed -n '/event.key /p' src/components/todo-item.tsx` · SM5* `grep -n 'event.key ' …` · SM6* `node -e "if (event.key
!== 'Escape') {}"` · SM7 `git commit -m "do not read .env"; cat a` · SM8 `grep -n 'event.key' …` · SM9 run's
`rm -rf "$P"` command with `event.key`: 2 with the rm -rf message.
SR block 2: SR1* `cat '.env'` · SR2* `cat ".env.local"` · SR3* `cat .env.local.bak` · SR4* `cat x.pem; ls` · SR5*
`echo "$(< .env)"` · SR6* `cat <.env` · SR7* `python3 -c "print(open('.env').read())"` · SR8* `node -e
"require('fs').readFileSync('.env')"` · SR9* heredoc `open('.env')` · SR10* heredoc `p='.env'` then `open(p)` · SR11*
`bash -c 'cat .env'` · SR12* `sh -c "cat event.key"` · SR13* `cat "my dir/.env"` · SR14* SR9 with the exact rule
message · SR15 `bash -c 'cat .env | head'` · SR16 heredoc `bash <<'SH'` `cat .env` · SR17 heredoc `~/.ssh/id_rsa` ·
SR18 `F=.env; cat "$F"` · SR19 `cat a.txt; ls server.key` · SR20 heredoc, then `python3 a.py < .env` · SR21 `cat a #
don't` newline `cat .env` · review round 1, all 2 today: SR22 `bash <<'SH'` `cat \` newline `.env` · SR23 `xargs cat
<<'EOF'` `.env` · SR24 `bash <<'SH'` `F=.env` newline `cat "$F"` · SR25 `echo \$'\'; cat \` newline `.env #'` · SR26
`while read f; do cat "$f"; done <<EOF` `.env.local` · SR27 `bash <<'SH'` `head -n 99 \` newline `server.key` · SR28
`xargs -I{} cp {} /tmp/x <<'EOF'` `certs/server.pem`. = 37 calls.
Still refused (2 today and after, not probed): a quoted or heredoc line holding both a reader word and such a path,
e.g. `cat > t.ts <<'EOF'` `  if (event.key === 'Escape') open = false` (`open ` is a reader word) and
`git commit -m 'never cat .env in a hook'`.

## Verification

- Red `test(scripts): B1.79 guard-bash secret mention probes (red)` (hook-smoke only, body "Red because …"): 20 FAIL
  lines (SM1–SM6, SR1–SR14), 598 ok.
- Green `chore(hooks): B1.79 guard-bash's secret rule reads words, not mentions` (no probe file): "hook-smoke: 618
  probes OK" on macOS bash 3.2, and in the runner container (bash 5.2, mawk) by `git archive HEAD | docker exec -i
level-up-lab-runner-runner-1 bash -c 'd=$(mktemp -d) && cd $d && tar -xf - && ln -s
/home/node/level-up-lab/node_modules node_modules && git init -q && git add -A && git -c user.name=x -c
user.email=x@y commit -qm x --no-verify && bash scripts/hook-smoke.sh | tail -1'` → `hook-smoke: 618 probes OK`; CI `test` (ubuntu) green;
  `pnpm lint && pnpm typecheck && pnpm test` green; `check-plan-scope.sh`, `check-backlog.sh` OK.
- Replay of the run's 7 denials (log `20261105T041944Z-185231.jsonl`) through the new hook: the 4 rule-4 commands
  exit 0; `rm -rf`, the `pr-step.sh` pipe exit 2 as before.

## Work breakdown

| Step | Role     | Produces        | Commit                                                                   |
| ---- | -------- | --------------- | ------------------------------------------------------------------------ |
| 1    | dev-lead | red probes      | `test(scripts): B1.79 guard-bash secret mention probes (red)`            |
| 2    | dev-lead | hook, docs      | `chore(hooks): B1.79 guard-bash's secret rule reads words, not mentions` |
| 3    | reviewer | diff review     | `docs(backlog): B1.79 review pass N`                                     |
| 4    | dev-lead | draft PR, label | —                                                                        |

Not in scope (follow-up card): the whole-command `.env.example` exemption (`cat .env.example .env` passes today and
after). Out of reach, as today: a quoted `'x.key'`/`"x.pem"` word, a path read into a variable (`read`, a pipe) or
built at run time.

Plan review: changes requested, round 1 (3 findings, fixed above, unreviewed) · Plan approved by: · Rounds: 1
