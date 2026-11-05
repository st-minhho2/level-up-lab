# B1.79 plan — guard-bash's secret rule reads words, not mentions (tooling, no §)

Approach: no `advice.md` (tier quick). Rule 4 keeps today's scope (the whole command) but stops matching inside text
that no shell runs: a space inside quotes ends no word, and a quoted string or heredoc body counts as shell text only
when a shell runs it. Round 3 (after review rounds 1–2 found reads that per-line patterns let through): text a shell
runs is checked as today, unsplit; the rest line by line. Rejected: per-segment scoping (passes `echo .env | xargs cat`,
`F=.env; cat "$F"`); one pattern per spelling (each review round found new ones). Prototype (scratch copy, not
committed): the run's 4 rule-4 denials exit 0, its `rm -rf` and `pr-step.sh` pipe still exit 2; the 18 reads review
rounds 1–2 found exit 2 (16 of them 2 today; SR35 and a python `open(` newline `'.env')` 0 today); 581 existing probes stay OK
on bash 3.2 + BSD awk and bash 5.2 + mawk. Risk tier **high** (`.claude/`, D-28) → the lead's `approve`; the PR
carries `config-change-approved` (D-19).

## Files

| File                          | Change                                                                                      | Why                |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| `.claude/hooks/guard-bash.sh` | rule 4 rewritten as below; message, exit code, other rules unchanged                        | Acceptance 1, 2, 3 |
| `scripts/hook-smoke.sh`       | section "guard-bash.sh: secret rule reads words, not mentions (B1.79)": SM1–SM13, SR1–SR35  | Acceptance 1, 2    |
| `.claude/docs/hooks.md`       | `guard-bash.sh` row: how rule 4 tells a path from a mention, its blocked/out-of-reach cases | doc drift          |
| `scripts/CLAUDE.md`           | the `hook-smoke.sh` row names SM1–SM13, SR1–SR35                                            | doc drift          |
| `backlog/work/B1.79/*`        | plan, review, pr-body                                                                       | pipeline           |

## Interfaces touched

```
guard-bash.sh rule 4 (exit 2, message unchanged; whole command exempt when it holds .env.example, as today):
  SECRET_NAME  id_rsa|id_ed25519|id_ecdsa|~/.aws|.aws/credentials|~/.ssh|.ssh/|.netrc|.npmrc|.docker/config.json|.kube/config
               + READER anywhere in the command → block (unchanged)
  split (awk, POSIX), each line tagged:
    O    shell text: heredoc bodies cut out, spaces/tabs inside '…' "…" $'…' as \037 (quotes, comments kept; `\$` opens no $'…')
    X/C  a quoted string's text; X when a shell runs it: its segment names bash|sh|zsh|dash|ksh|eval, or it follows <<<
    Y/B  a heredoc body line; B when the heredoc feeds `cat … >`, `tee` or python3?|node|ruby|perl, else Y
  SECRET_FILE  (^|[space/=<"'])\.env(\.[A-Za-z0-9_-]+)*([space]|$|[;&|)<>"']) | \.(pem|p12|key)([space]|$|[;&|)<>])
  block if  O, or all X+Y text (\-newline joined), ~ SECRET_FILE with READER in the command or in that X+Y text
         |  O or X+Y text ~ SECRET_REDIRECT (`<` from such a path, no reader needed)
         |  a C/B line ~ SECRET_FILE and READER on that line  |  a C/B line ~ SECRET_REDIRECT
         |  a C/B line ~ ENV_LITERAL (["'`](…/)?\.env(\.x)*["'`]) and READER in the command
```

hook-smoke, new section (today's verdict → wanted; `*` = red today):
SM pass 0: SM1* run's python heredoc with `event.key !== 'Escape'` · SM2* run's `cat > e2e/… <<'EOF'` whose comment
names the dotenv file · SM3* run's `mut "event.key !== 'Escape' || pending"` with `python3`/`cp`/`head` · SM4*
`sed -n '/event.key /p' src/components/todo-item.tsx` · SM5* `grep -n 'event.key ' …` · SM6* `node -e "if (event.key
!== 'Escape') {}"` · SM7 `git commit -m "do not read .env"; cat a` · SM8 `grep -n 'event.key' …` · SM9 run's `rm -rf
"$P"` command with `event.key`: 2 with the rm -rf message · SM10* `cat > src/components/x.tsx <<'EOF'` with a
Prettier-wrapped `    event.key === 'Escape' &&` line · SM11* python heredoc `k=event.key` · SM12* `cat > notes.md
<<'EOF'` `  event.key is the property` · SM13* python heredoc `# load DATABASE_URL from .env via playwright.config.ts`.
SR block 2: SR1* `cat '.env'` · SR2* `cat ".env.local"` · SR3* `cat .env.local.bak` · SR4* `cat x.pem; ls` · SR5*
`echo "$(< .env)"` · SR6* `cat <.env` · SR7* `python3 -c "print(open('.env').read())"` · SR8* `node -e
"require('fs').readFileSync('.env')"` · SR9* python heredoc `open('.env')` · SR10* python heredoc `p='.env'`, `open(p)`
· SR11* `bash -c 'cat .env'` · SR12* `sh -c "cat event.key"` · SR13* `cat "my dir/.env"` · SR14* SR9 with the exact
rule message · SR15 `bash -c 'cat .env | head'` · SR16 `bash <<'SH'` `cat .env` · SR17 python heredoc `~/.ssh/id_rsa`
· SR18 `F=.env; cat "$F"` · SR19 `cat a.txt; ls server.key` · SR20 heredoc, then `python3 a.py < .env` · SR21 `cat a #
don't` newline `cat .env` · from review rounds 1–2: SR22 `bash <<'SH'` `cat \` newline `.env` · SR23 `xargs cat <<'EOF'`
`.env` · SR24 `bash <<'SH'` `F=.env` newline `cat "$F"` · SR25 `echo \$'\'; cat \` newline `.env #'` · SR26 `while
read f; do cat "$f"; done <<EOF` `.env.local` · SR27 `bash <<'SH'` `head -n 99 \` newline `server.key` · SR28 `xargs
-I{} cp {} /tmp/x <<'EOF'` `certs/server.pem` · SR29 `xargs cat <<'EOF'` `a.txt .env` · SR30 `bash <<'SH'` `for f in
.env` newline `do cat "$f"; done` · SR31 the same loop in `bash -c '…'` · SR32 `xargs cat <<< 'a` newline `.env` newline
`b'` · SR33 `bash <<'SH'` `set -- a .env` newline `cat "$2"` · SR34 `bash <<'SH'` `F=( .env )` newline `cat
"${F[0]}"` · SR35* `bash -c 'cat \` newline `.env '`. = 48 calls.
Still refused (2 today and after, not probed): a C/B line holding a reader word and such a path (`cat > t.ts <<'EOF'`
`  if (event.key === 'Escape') open = false`, `git commit -m 'never cat .env in a hook'`), and any heredoc fed to
another command (`git commit -F - <<'EOF'` with `.env … cat` in its text). Passes today and after: `echo '` newline
`.env` newline `' | xargs cat`.

## Verification

- Red `test(scripts): B1.79 guard-bash secret mention probes (red)` (hook-smoke only, body "Red because …"): 25 FAIL
  lines (SM1–SM6, SM10–SM13, SR1–SR14, SR35), 604 ok.
- Green `chore(hooks): B1.79 guard-bash's secret rule reads words, not mentions` (no probe file): "hook-smoke: 629
  probes OK" on macOS bash 3.2, and in the runner container (bash 5.2, mawk) by the command below → last line
  `hook-smoke: 629 probes OK`; CI `test` (ubuntu) green; `pnpm lint && pnpm typecheck && pnpm test` green;
  `check-plan-scope.sh`, `check-backlog.sh` OK.
- Replay of the run's 7 denials (log `20261105T041944Z-185231.jsonl`) through the new hook: the 4 rule-4 commands
  exit 0; `rm -rf`, the `pr-step.sh` pipe exit 2 as before.

```bash
git archive HEAD | docker exec -i level-up-lab-runner-runner-1 bash -c 'd=$(mktemp -d) && cd $d && tar -xf - && ln -s /home/node/level-up-lab/node_modules node_modules && git init -q && git add -A && git -c user.name=x -c user.email=x@y commit -qm x --no-verify && bash scripts/hook-smoke.sh | tail -1'
```

## Work breakdown

| Step | Role     | Produces        | Commit                                                                   |
| ---- | -------- | --------------- | ------------------------------------------------------------------------ |
| 1    | dev-lead | red probes      | `test(scripts): B1.79 guard-bash secret mention probes (red)`            |
| 2    | dev-lead | hook, docs      | `chore(hooks): B1.79 guard-bash's secret rule reads words, not mentions` |
| 3    | reviewer | diff review     | `docs(backlog): B1.79 review pass N`                                     |
| 4    | dev-lead | draft PR, label | —                                                                        |

Not in scope (follow-up card): the whole-command `.env.example` exemption (`cat .env.example .env` passes today and
after). Out of reach, as today: a quoted `'x.key'`/`"x.pem"` word, a path read into a variable (`read`, a pipe) or
built at run time, a shell function that runs its quoted argument.

Plan review: changes requested, round 2 (3 findings, fixed above by the round-3 design, unreviewed; over the 2-round
cap) · Plan approved by: · Rounds: 1
