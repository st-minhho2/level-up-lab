# B1.84 plan — the reviewer's Bash writes land only under a set TMPDIR (tooling, no §)

Approach: `guard-bash.sh` gains rule 6: when the input's `agent_type` is `reviewer` (B1.78), it pipes the payload to
a new `.claude/hooks/reviewer-writes.mjs`, which lexes the command (quotes, `$TMPDIR`/`${TMPDIR}` expanded from the
hook's env, other expansions marked unknown, heredoc bodies skipped, `$( )`, backticks, `bash -c` and `eval` read
recursively; `[`, `[[`, `]]` are builtins, `<`/`>` inside `[[ ]]` compare), tracks the cwd through `cd X &&` (any
other joiner makes it unknown), and names each write target. Writers: redirections (a `/dev/null|stdout|stderr|tty|
fd/N` target and an fd duplication such as `2>&1` are not writes), `tee cp mv ln install rsync scp ditto rm rmdir
unlink shred touch mkdir mkfifo truncate chmod chown chgrp dd`, `sed -i perl -i ruby -i awk/gawk -i inplace`,
`ex ed vi vim nvim nano emacs`, compressors without `-c`, `zip unzip tar cpio`, `curl -o/-O wget sort -o iconv -o
base64 -o uniq split csplit mktemp patch nohup`, `find -delete/-exec <writer>`. git fails closed (review r1): a
subcommand outside a read list (`log show diff status rev-parse ls-files ls-tree cat-file blame grep merge-base
rev-list for-each-ref describe shortlog name-rev show-ref …`, plus the list forms of `branch tag stash worktree reflog
remote`, `config --get`, `apply --check`) writes its directory and its git dirs; `init`/`clone` write their target. A
command with a write is refused unless TMPDIR is set, an existing absolute directory, disjoint from the project and
not inside the cwd's worktree, and every target resolves (symlinks followed) under it; an unknown target, a relative
one after an unsure `cd`, `xargs` into a writer or a run-time command name is refused. The refusal names the cause.
Commands without a write (reads, gates, `pnpm test`, `[ -n "$TMPDIR" ]`) pass with TMPDIR unset. Other roles: rule 6
is skipped. Assumes the Bash tool's TMPDIR is the hook's (both inherit Claude Code's environment; a profile that
exports another TMPDIR breaks that). Node, not bash, for the lexer. No advice (tier quick, no section). Prototype in
the session scratchpad: 785 lines after prettier; it gives the Want column of the 83 reviewer rows below. Risk tier
**high** (`.claude/`, D-28) → the lead's `approve`; PR carries `config-change-approved` (D-19). Dev-lead writes
`.claude/` and `scripts/` (interactive, as B1.78/B1.86).

## Files

| File                                | Change                                                                                 | Why                   |
| ----------------------------------- | -------------------------------------------------------------------------------------- | --------------------- |
| `.claude/hooks/reviewer-writes.mjs` | new: the write-target check, header comment lists reach and out-of-reach               | Acceptance            |
| `.claude/hooks/guard-bash.sh`       | rule 6 (B1.84): `agent_type` = `reviewer` → run the check, block on a reason           | Acceptance            |
| `.claude/agents/reviewer.md`        | body lines 15, 22: under `$TMPDIR`, not the session scratchpad; unset → "not run"; git | rule text             |
| `scripts/hook-smoke.sh`             | section "reviewer Bash writes (B1.84)": RW1–RW85                                       | Test line             |
| `.claude/docs/hooks.md`             | `guard-bash.sh` row names rule 6 and its out-of-reach list                             | doc drift (see below) |
| `scripts/CLAUDE.md`                 | `hook-smoke.sh` row names RW1–RW85                                                     | doc drift (see below) |
| `backlog/work/B1.84/*`              | plan, review, pr-body                                                                  | pipeline              |

The two doc rows lie outside the lead's list (`.claude/hooks/*`, `reviewer.md`, `hook-smoke.sh`, backlog); both
document what the hook now blocks, as B1.86 did. Say "drop docs" at the gate to leave them for a follow-up.

## Interfaces touched

`guard-bash.sh` input adds a read of `agent_type` and `cwd`; exit codes unchanged (0, 2). `reviewer-writes.mjs`:
stdin the PreToolUse JSON, env `TMPDIR` and `CLAUDE_PROJECT_DIR`, stdout the reason (empty = allowed), non-zero exit
→ guard-bash blocks (fail closed). Probe: `rw <want> <TMPDIR|-unset> <cwd> <command> <cause text>`, `agent_type`
`reviewer`; fixture TMPDIR `mktemp -d` with `probe/`, `probe/.git` pointing at this worktree's git dir, `link` → `src`;
a second `mktemp -d` stands for the session scratchpad.

| Probes    | TMPDIR / cwd                        | Commands (want)                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RW1–RW5   | unset, empty, `src/`, `/`, relative | #225's `cd "$TMPDIR/probe" && sed -i … src/components/todo-due-date.tsx`, `cp -r . "$TMPDIR/probe"`, … → 2, cause named                                                                                                                                                                                                                                                                                                                                     |
| RW6–RW33  | fixture / worktree                  | `sed -i`, `sed -i.bak -e`, `perl -pi -e`, `>`, `>>`, `tee -a`, `cp`, `mv` source, `rm`, `touch`, `mkdir`, `ln`, `dd of=` into `src/`; `cd "$TMPDIR/probe"; sed -i` (`;`); `cd src &&`; absolute worktree path; `$TMPDIR/link/a.ts`; `"$f"` in a loop; `TMPDIR=src;`; `$(sed -i …)`; `bash -c`; `git checkout --`, `git stash`, `git -C "$TMPDIR/probe" stash` (`.git` points back); `find -delete`; `xargs rm`; heredoc `$(touch …)`; `( cd … ); touch` → 2 |
| RW34–RW52 | fixture / worktree                  | review r1: `git read-tree -u --reset HEAD`, `git checkout-index -a -f`, `git worktree remove --force .`, `git config core.hooksPath /x`, `git update-index`, `git branch -f`, `git fetch`, `gzip`, `sort -o`, `curl -so`, `tar -xf … -C src`, `unzip -o`, `ditto`, `awk -i inplace`, `ex -sc`, `split`, `mktemp src/x.XXX`, `nohup … &`; `echo x > <scratchpad>/x.txt` → 2                                                                                  |
| RW53–RW68 | fixture / worktree, `probe/`, unset | `cp -r . "$TMPDIR/probe"`, `cd "$TMPDIR/probe" && sed -i … && pnpm test`, `sed -i ''` under TMPDIR, `git diff > "$TMPDIR/d"`, heredoc into TMPDIR, `git init`+`add` under TMPDIR, `rsync`, `2>&1 \| tail >/dev/null`; TMPDIR unset: `pnpm lint && … test`, `git log`, `hook-smoke.sh >/dev/null`, `grep`, `sed -n`, `git diff --stat`, `next-task.sh --check` → 0                                                                                           |
| RW69–RW83 | unset; fixture                      | review r1, TMPDIR unset: `[[ -f plan.md ]] && echo y`, `if [ -n "$TMPDIR" ]; then …`, `[[ "$x" > a ]]`, `git branch --show-current`, `git branch -a --contains HEAD`, `git config --get`, `git stash list`, `git worktree list`, `git -C src log -1`, `gzip -c … \| wc -c`, `git diff … \| head`; fixture: `tar -xf a.tar -C "$TMPDIR/probe"`, `mktemp -d`, `curl -so "$TMPDIR/x"`, `[ -n "$TMPDIR" ] && cp -r . "$TMPDIR/probe"` → 0                       |
| RW84–RW85 | unset                               | `sed -i … src/a.ts` as `code-writer`, and with no `agent_type` → 0 (rule 6 is the reviewer's only)                                                                                                                                                                                                                                                                                                                                                          |

## Verification

- Red `test(scripts): B1.84 reviewer Bash-write probes` (hook-smoke only, as B1.86; body "Red because no hook reads
  the reviewer's Bash writes"): 52 FAIL (RW1–RW52), 634 ok (601 + 33 rows that want 0).
- Green `chore(hooks): B1.84 reviewer Bash writes only under TMPDIR`: "hook-smoke: 686 probes OK" (601 existing
  verdicts unchanged); bash 3.2 here, bash 5 in CI; `pnpm lint` (eslint + prettier on the `.mjs`), `pnpm typecheck`,
  `pnpm test` 241 passed (unchanged); `check-agent-frontmatter.sh`, `check-plan-scope.sh`, `check-backlog.sh` OK; CI green.

## Work breakdown

| Step | Role     | Produces                          | Commit                                                       |
| ---- | -------- | --------------------------------- | ------------------------------------------------------------ |
| 1    | dev-lead | red probes RW1–RW85               | `test(scripts): B1.84 reviewer Bash-write probes`            |
| 2    | dev-lead | hook, rule 6, reviewer text, docs | `chore(hooks): B1.84 reviewer Bash writes only under TMPDIR` |
| 3    | reviewer | diff review                       | `docs(backlog): B1.84 review pass N`                         |
| 4    | dev-lead | draft PR, label                   | —                                                            |

Costs: (1) in the runner's container TMPDIR is unset (#225), so the reviewer's probes there are refused and reported
"not run" until the runner exports a TMPDIR: follow-up card (filing lane, not this PR; `run.sh` is B1.82's).
(2) The session scratchpad the harness offers every subagent (`/private/tmp/claude-<uid>/…`) is not under TMPDIR and
no variable names it, so a reviewer scratch write there is refused; `reviewer.md` says "under `$TMPDIR`, not the
scratchpad". (3) Fails closed: a write target in any variable but `$TMPDIR`, a glob, `~`, a `${TMPDIR:-…}` form, a
run-time command name, `git fetch` and every other git subcommand off the read list, `(( ))`. (4) Out of reach
(hook header and hooks.md): writes from inside a program (`node -e`, `python3 -c`, `pnpm install`,
`prettier --write`, `eslint --fix`, `make`, a script, sed's or awk's own write commands, an output option of a program
not in the writer list), an alias or function from an earlier call, a hard link from the copy into the worktree.
Size: S on the card, M in fact (the lexer).

Plan review: · Plan approved by: · Rounds: 1
