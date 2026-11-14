#!/usr/bin/env bash
# Probes R1–R22 of scripts/agent/run.sh (B1.44) offline: a `claude` shim that replays fixture stream-json, a `gh` shim
# that applies run.sh's own --jq to fixture JSON (real jq), and fakes for the eligibility, claim and worktree seams.
#   scripts/agent/run-smoke.sh
#   R1 not logged in            R2 unverified version          R3 ineligible issue        R4 three agent branches in flight
#   R5 live and stale lock      R6 exact argv, env, stdin, branch, bypass only in mode()  R7 one log per run
#   R8 tools-mismatch kill      R9 user settings in the run    R10 one retry on error     R11 limits not retried
#   R12 gate comment with tier  R13 --poll order and skips     R14 --check-binary
#   R15 --mode on the host is dontAsk, whatever uname, curl or the environment say (B1.58)
#   R16 the exact prompt: Loop 5's D-27 path at the plan gate, no unconditional gate stop (B1.65)
#   R17 a run or --poll without a git identity is refused before any call (B1.69)
#   R18 a merged agent branch is not in flight; an unmerged one or an open PR is; the skip names them (B1.82)
#   R19 each claude -p run has a TMPDIR of its own outside the worktree and the project, removed at its end (B1.88)
#   R20 a checkout behind a fetched origin/main, or a failed fetch, refuses each issue before any call; ahead runs (B1.95)
#   R21 --sync merges origin/main into a ready PR's branch under `merge=union`, runs the guards, pushes with
#       `Agent-Run: sync` and comments, with no claude call; a level branch is left alone (B1.101)
#   R22 every --sync refusal (conflict, guard, no ready PR, unpushed, dirty, no worktree, lock, identity, behind, argv)
#       and a TERM leave local and origin's branch agreeing; a merge the push landed stays (B1.101)
set -uo pipefail
command -v jq >/dev/null || { echo "run-smoke: needs jq" >&2; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd -P)"
SRC="$HERE/run.sh"
ROOT="$(cd "$HERE/../.." && pwd -P)"
TMP="$(cd "$(mktemp -d)" && pwd -P)"; trap 'rm -rf -- "$TMP"' EXIT
FIX="$TMP/fix"; LOG="$TMP/calls.log"; RUNS="$TMP/runs"; WT="$TMP/wt"
mkdir -p "$TMP/bin" "$FIX" "$WT"
# run.sh's own git calls (local agent branches, worktree list, --check-binary's worktree) go to a scratch repository, so
# the probes never depend on the host's branches; only R14's probe folder lands in the checkout's .worktrees/, removed
REPO="$TMP/repo"; git init -q "$REPO"
git -C "$REPO" -c user.name=s -c user.email=s@x commit -q --allow-empty -m s
# its origin (B1.95): a bare repository that borrows the scratch repository's objects, so `at` can point both anywhere;
# run.sh fetches it before each issue
ORIGIN="$TMP/origin.git"; git init -q --bare "$ORIGIN"; echo "$REPO/.git/objects" > "$ORIGIN/objects/info/alternates"
git -C "$REPO" remote add origin "$ORIGIN"
at() { # at <HEAD commit> <origin's main commit>: where the scratch repository's checkout and its origin's main stand
  git -C "$REPO" update-ref HEAD "$1" && git -C "$ORIGIN" update-ref refs/heads/main "$2"
}
b0="$(git -C "$REPO" rev-parse HEAD)"; at "$b0" "$b0"; git -C "$REPO" fetch -q origin
# run.sh's identity check reads git's config (B1.69): every call gets this file instead of the host's own, so no probe
# passes or fails on the host's identity; GITCFG swaps it
printf '[user]\n\tname = smoke runner\n\temail = smoke@runner.invalid\n' > "$TMP/gitconfig"
IDENT=(GIT_CONFIG_GLOBAL="$TMP/gitconfig" GIT_CONFIG_NOSYSTEM=1)
oks=0; fails=0
ok() { echo "ok   $1"; oks=$((oks + 1)); }
fail() { echo "FAIL $1"; fails=$((fails + 1)); }
VERSION='2.1.309 (Claude Code)'

cat > "$TMP/bin/claude" <<'SHIM'
#!/bin/bash
echo "CLAUDE cwd=$(pwd -P) CHILD=${RUNNER_CHILD-unset} CLAUDECODE=${CLAUDECODE-unset} ENTRY=${CLAUDE_CODE_ENTRYPOINT-unset} SID=${CLAUDE_CODE_SESSION_ID-unset} ARGS=$*" >> "$SMOKE_LOG"
case "$1" in
  --version) echo "${SMOKE_VERSION:-2.1.309} (Claude Code)"; exit 0 ;;
  auth) if [[ "${SMOKE_AUTH:-true}" == true ]]; then echo '{"loggedIn":true,"authMethod":"claude.ai"}'; else echo '{"loggedIn":false,"authMethod":"none"}'; fi; exit 0 ;;
esac
n=$(( $(cat "$SMOKE_FIX/count" 2>/dev/null || echo 0) + 1 )); echo "$n" > "$SMOKE_FIX/count"
cat > "$SMOKE_FIX/stdin-$n"
# the run's TMPDIR (B1.88): "START <TMPDIR> <y: an absolute directory>" leaving a file of its own there, and at the end
# "END <TMPDIR> <entries in it>", one line each, appended
t="${TMPDIR-unset}"; d=n
[[ "$t" == /* && -d "$t" ]] && d=y && : > "$t/claude-$$"
echo "START $t $d" >> "$SMOKE_FIX/tmpdirs"
f="$SMOKE_FIX/stream-$n.jsonl"; [[ -f "$f" ]] || f="$SMOKE_FIX/stream.jsonl"
while IFS= read -r l; do
  case "$l" in
    SLEEP) echo $$ > "$SMOKE_FIX/claude.pid"; sleep 30 & wait $! ;;
    NAP) sleep 2 ;;
    WRITE:*) mkdir -p "$(dirname "${l#WRITE:}")"; echo probe > "${l#WRITE:}" ;;
    *) echo "$l" ;;
  esac
done < "$f"
echo "END $t $([[ $d == y ]] && ls -A "$t" | grep -c . || echo -)" >> "$SMOKE_FIX/tmpdirs"
exit 0
SHIM
cat > "$TMP/bin/gh" <<'SHIM'
#!/bin/bash
echo "GH cwd=$(pwd -P) GH_REPO=${GH_REPO:-} $*" >> "$SMOKE_LOG"
jqf=""; st=""; head=""; prev=""
for a in "$@"; do
  case "$prev" in --jq) jqf="$a" ;; --state) st="$a" ;; --head) head="$a" ;; esac
  prev="$a"
done
case "$1 $2" in
  "issue view") file="issue-$3.json" ;;
  "issue list") file=issues.json ;;
  "pr list") file=prs.json ;;
  "issue comment") { echo "=== #$3"; cat; } >> "$SMOKE_FIX/comments"; exit 0 ;;
  *) exit 9 ;;
esac
[[ -f "$SMOKE_FIX/$file" ]] || { echo "gh: Not Found (HTTP 404)" >&2; exit 1; }
[[ "$file" == prs.json ]] || { jq -r "$jqf" "$SMOKE_FIX/$file"; exit; }
# pr list keeps gh's own filters, --state (a fixture PR without one is open) and --head (B1.82)
jq -c --arg s "$st" --arg h "$head" '[.[] | select(($s == "" or $s == "all" or ((.state // "OPEN") | ascii_downcase) == $s)
  and ($h == "" or .headRefName == $h))]' "$SMOKE_FIX/$file" | jq -r "$jqf"
SHIM
cat > "$TMP/bin/fake-eligible" <<'SHIM'
#!/bin/bash
echo "ELIGIBLE $*" >> "$SMOKE_LOG"
[[ " ${SMOKE_INELIGIBLE:-} " == *" $1 "* ]] && { echo "eligible: #$1 not labeled agent-ready" >&2; exit 1; }
exit 0
SHIM
cat > "$TMP/bin/fake-claim" <<'SHIM'
#!/bin/bash
echo "CLAIM $*" >> "$SMOKE_LOG"
SHIM
cat > "$TMP/bin/fake-worktree" <<'SHIM'
#!/bin/bash
echo "WORKTREE $*" >> "$SMOKE_LOG"
echo "WORKTREE-CWD $(pwd -P)" >> "$SMOKE_LOG"
[[ -n "${SMOKE_WT_FAIL:-}" ]] && { echo "[worktree] run this from the main checkout, not from inside a worktree." >&2; exit 1; }
slug="$(printf '%s' "$1" | tr 'A-Z' 'a-z' | tr -c 'a-z0-9\n' '-')"; card="${1#*/}"; card="${card%-agent}"
d="$SMOKE_WT/$slug"; mkdir -p "$d/.claude" "$d/backlog/work/$card"
cp "$SMOKE_ROOT/.claude/settings.json" "$d/.claude/settings.json"
printf '# %s plan\n\n## Files\n\n| File | Change |\n| ---- | ------ |\n| `%s` | x |\n' "$card" "${SMOKE_PLAN_TOKEN:-src/app/page.tsx}" \
  > "$d/backlog/work/$card/plan.md"
echo "  dir      $d"
echo "  branch   $1 (base origin/main)"
SHIM
chmod +x "$TMP/bin/"*

# fixtures
init() { # init [<tools json>] [<plugins json>]: the init line
  printf '{"type":"system","subtype":"init","session_id":"S1","model":"claude-opus-5-5","tools":%s,"plugins":%s,"mcp_servers":[]}\n' \
    "${1:-[\"Read\",\"Grep\",\"Glob\",\"Write\",\"Edit\",\"Bash\",\"Agent\",\"Skill\"]}" "${2:-[]}"
}
start() { printf '{"type":"system","subtype":"hook_started","hook_event":"SessionStart","hook_name":"SessionStart:startup","session_id":"S1"}\n'; }
result() { # result <is_error> <subtype> <text>
  printf '{"type":"result","subtype":"%s","is_error":%s,"result":"%s","session_id":"S1","permission_denials":[{"tool_name":"Bash"},{"tool_name":"Bash"}],"total_cost_usd":0.1}\n' "$2" "$1" "$3"
}
GATE='Plan for B1.44 is ready. Reply `approve` or list changes.'
issue() { printf '{"number":%s,"body":"### Card id\\n\\n%s\\n\\n### Spec section or change\\n\\nnone"}\n' "$1" "$2" > "$FIX/issue-$1.json"; }
prs() { # prs <head>[:<STATE>[:<oid>]]…: the PRs gh lists, OPEN unless a state follows the head; the head's oid is
  # the scratch repository's branch tip unless given
  local h s o out=""
  for h in "$@"; do
    s=OPEN; o=""; [[ "$h" == *:* ]] && { s="${h#*:}"; h="${h%%:*}"; }
    [[ "$s" == *:* ]] && { o="${s#*:}"; s="${s%%:*}"; }
    [[ -n "$o" ]] || o="$(git -C "$REPO" rev-parse -q --verify "refs/heads/$h" || echo 0000000)"
    out="$out${out:+,}{\"headRefName\":\"$h\",\"state\":\"$s\",\"headRefOid\":\"$o\"}"
  done
  echo "[$out]" > "$FIX/prs.json"
}
reset() {
  rm -rf "$FIX" "$RUNS" "$WT"; mkdir -p "$FIX" "$RUNS" "$WT"; : > "$LOG"
  echo "$VERSION" > "$RUNS/verified-versions"
  issue 7 B1.44; prs feat/B9.1-other; echo '[]' > "$FIX/issues.json"
  { start; init; result false success "$GATE"; } > "$FIX/stream.jsonl"
}
run() { # run <args…>: run.sh with the shims; stdout+stderr in $TMP/out, exit code in $RC
  (cd "${DIR:-$ROOT}" && CLAUDECODE=1 CLAUDE_CODE_ENTRYPOINT=desktop CLAUDE_CODE_SESSION_ID=parent GH_REPO=evil/x \
    SMOKE_LOG="$LOG" SMOKE_FIX="$FIX" SMOKE_WT="$WT" SMOKE_ROOT="$ROOT" PATH="$TMP/bin:$PATH" GIT_DIR="$REPO/.git" \
    RUNNER_CLAUDE="$TMP/bin/claude" RUNNER_RUNS="$RUNS" RUNNER_ELIGIBLE="$TMP/bin/fake-eligible" \
    RUNNER_CLAIM="$TMP/bin/fake-claim" RUNNER_WORKTREE="$TMP/bin/fake-worktree" \
    GIT_CONFIG_GLOBAL="${GITCFG:-$TMP/gitconfig}" GIT_CONFIG_NOSYSTEM=1 "$SRC" "$@") > "$TMP/out" 2>&1
  RC=$?
}
calls() { grep -c "^CLAUDE .* ARGS=-p " "$LOG"; }
has() { grep -qF -- "$1" "$2" 2>/dev/null; }
say() { echo "     $*"; }

# R1
reset; SMOKE_AUTH=false run 7
r=0; [[ $RC -eq 1 ]] && has 'not logged in' "$TMP/out" && [[ $(calls) -eq 0 ]] && ! has ELIGIBLE "$LOG" || r=1
[[ $r -eq 0 ]] && ok R1 || { say "rc=$RC $(head -2 "$TMP/out")"; fail R1; }
# R2
reset; SMOKE_VERSION=2.1.400 run 7
r=0; [[ $RC -eq 1 ]] && has 'not verified' "$TMP/out" && has '--check-binary' "$TMP/out" && [[ $(calls) -eq 0 ]] \
  && ! has ELIGIBLE "$LOG" || r=1
[[ $r -eq 0 ]] && ok R2 || { say "rc=$RC $(head -2 "$TMP/out")"; fail R2; }
# R3
reset; SMOKE_INELIGIBLE=7 run 7
r=0; [[ $RC -eq 0 ]] && has 'not labeled agent-ready' "$TMP/out" && ! has CLAIM "$LOG" && [[ $(calls) -eq 0 ]] || r=1
reset; issue 7 'see the card'; run 7
[[ $RC -eq 0 ]] && has 'no card id' "$TMP/out" && ! has CLAIM "$LOG" && [[ $(calls) -eq 0 ]] \
  || { say "no card id: rc=$RC $(head -1 "$TMP/out")"; r=1; }
[[ $r -eq 0 ]] && ok R3 || { say "rc=$RC $(head -2 "$TMP/out")"; fail R3; }
# R4
r=0
reset; prs feat/B9.1-agent chore/B9.2-agent feat/B9.3-agent feat/B9.4-other; run 7
[[ $RC -eq 0 ]] && has 'agent branches in flight' "$TMP/out" && ! has CLAIM "$LOG" && [[ $(calls) -eq 0 ]] \
  || { say "3 in flight: rc=$RC $(head -2 "$TMP/out")"; r=1; }
reset; prs feat/B9.1-agent chore/B9.2-agent chore/B1.44-agent; run 7
[[ $RC -eq 0 && $(calls) -eq 1 ]] || { say "own branch counted: rc=$RC calls=$(calls)"; r=1; }
reset; git -C "$REPO" branch feat/B9.5-agent; prs feat/B9.1-agent chore/B9.2-agent; run 7
[[ $RC -eq 0 && $(calls) -eq 0 ]] && has 'agent branches in flight' "$TMP/out" || { say "local branch not counted: calls=$(calls)"; r=1; }
git -C "$REPO" branch -q -D feat/B9.5-agent
[[ $r -eq 0 ]] && ok R4 || fail R4
# R5
r=0
reset; sleep 30 & live=$!; mkdir -p "$RUNS/7/lock"; echo "$live" > "$RUNS/7/lock/pid"; run 7
[[ $RC -eq 0 && $(calls) -eq 0 ]] && has 'locked' "$TMP/out" && [[ -d "$RUNS/7/lock" ]] \
  || { say "live lock: rc=$RC calls=$(calls)"; r=1; }
kill "$live" 2>/dev/null; wait "$live" 2>/dev/null
sh -c 'exit 0' & dead=$!; wait "$dead"
reset; mkdir -p "$RUNS/7/lock"; echo "$dead" > "$RUNS/7/lock/pid"; run 7
[[ $RC -eq 0 && $(calls) -eq 1 && ! -e "$RUNS/7/lock" ]] || { say "stale lock: rc=$RC calls=$(calls)"; r=1; }
reset; { start; echo SLEEP; } > "$FIX/stream.jsonl"
(cd "$ROOT" && SMOKE_LOG="$LOG" SMOKE_FIX="$FIX" SMOKE_WT="$WT" SMOKE_ROOT="$ROOT" PATH="$TMP/bin:$PATH" GIT_DIR="$REPO/.git" \
  RUNNER_CLAUDE="$TMP/bin/claude" RUNNER_RUNS="$RUNS" RUNNER_ELIGIBLE="$TMP/bin/fake-eligible" \
  RUNNER_CLAIM="$TMP/bin/fake-claim" RUNNER_WORKTREE="$TMP/bin/fake-worktree" exec env "${IDENT[@]}" "$SRC" 7) > "$TMP/out" 2>&1 &
bg=$!; i=0; while [[ ! -d "$RUNS/7/lock" || $(calls) -eq 0 ]] && [[ $i -lt 20 ]]; do sleep 1; i=$((i + 1)); done
kill -TERM "$bg" 2>/dev/null; wait "$bg" 2>/dev/null
[[ ! -e "$RUNS/7/lock" ]] || { say "TERM left the lock"; r=1; }
sleep 1; kill -0 "$(cat "$FIX/claude.pid" 2>/dev/null || echo 0)" 2>/dev/null && { say "TERM left the claude run going"; r=1; }
reset; SMOKE_WT_FAIL=1 run 7
[[ $RC -eq 1 && $(calls) -eq 0 && ! -e "$RUNS/7/lock" ]] && has 'not from inside a worktree' "$TMP/out" && ! has 'unbound' "$TMP/out" \
  || { say "worktree.sh failing: rc=$RC $(tr '\n' '|' < "$TMP/out")"; r=1; }
[[ $r -eq 0 ]] && ok R5 || fail R5
# R6
r=0
reset; run 7
want="-p --agent dev-lead --model claude-opus-5-5 --max-turns 150 --max-budget-usd 9.75 --setting-sources project"
want="$want --strict-mcp-config --permission-mode dontAsk --include-hook-events --output-format stream-json --verbose"
want="$want --tools Read,Grep,Glob,Write,Edit,Bash,Agent,Skill --allowedTools Read Grep Glob Write Edit Bash Agent Skill"
want="$want Bash(git *) Bash(scripts/next-task.sh *) Bash(scripts/worktree.sh *) Bash(scripts/verify-red.sh *)"
want="$want Bash(scripts/card-status.sh *) Bash(scripts/ci/*) Bash(scripts/agent/tier.sh *) Bash(scripts/agent/eligible.sh *)"
want="$want Bash(.claude/hooks/mark-reviewed.sh) Bash(pnpm install --frozen-lockfile)"
want="$want Bash(pnpm lint*) Bash(pnpm typecheck*) Bash(pnpm test*) Bash(pnpm build*) Bash(pnpm exec prettier *)"
want="$want Bash(docker compose up -d) Bash(gh pr edit *) Bash(gh pr checks *) Bash(gh pr view *)"
want="$want --disallowedTools Bash(scripts/agent/run.sh*) Bash(git -c*) Bash(git * -c *) Bash(git config*)"
line="$(grep "^CLAUDE .* ARGS=-p " "$LOG" | head -1)"
[[ "${line#* ARGS=}" == "$want" ]] || { say "argv: ${line#* ARGS=}"; r=1; }
[[ "$line" == "CLAUDE cwd=$WT/chore-b1-44-agent CHILD=1 CLAUDECODE=unset ENTRY=unset SID=unset ARGS="* ]] \
  || { say "cwd/env: ${line%% ARGS=*}"; r=1; }
grep -q "^WORKTREE chore/B1.44-agent$" "$LOG" && grep -q "^CLAIM --claim B1.44$" "$LOG" || { say "claim/worktree: $(grep -E '^(CLAIM|WORKTREE)' "$LOG")"; r=1; }
grep -qxF "WORKTREE-CWD ${ROOT%%/.worktrees/*}" "$LOG" || { say "worktree.sh not run from the checkout that holds .worktrees/: $(grep '^WORKTREE-CWD' "$LOG")"; r=1; }
has '#7' "$FIX/stdin-1" && has 'B1.44' "$FIX/stdin-1" && has '.claude/skills/work-next/SKILL.md' "$FIX/stdin-1" && has "$WT/chore-b1-44-agent" "$FIX/stdin-1" || { say "stdin: $(head -3 "$FIX/stdin-1" 2>/dev/null)"; r=1; }
grep -q 'GH_REPO=evil' "$LOG" && { say "GH_REPO reached gh"; r=1; }
grep -q 'dangerously-skip-permissions' "$SRC" && { say "--dangerously-skip-permissions is named in run.sh"; r=1; }
bp="$(grep -v '^[[:space:]]*#' "$SRC" | grep 'bypassPermissions')"
[[ "$bp" =~ ^[[:space:]]*'if sandboxed; then echo bypassPermissions; else echo dontAsk; fi'$ ]] \
  || { say "bypassPermissions outside mode()'s one gated line: $bp"; r=1; }
reset; RUNNER_CHILD=1 run 7
[[ $RC -eq 1 && $(calls) -eq 0 ]] && has 'inside a runner' "$TMP/out" && ! has ELIGIBLE "$LOG" \
  || { say "nested run: rc=$RC $(head -1 "$TMP/out")"; r=1; }
reset; issue 7 B4.4; run 7
grep -q "^WORKTREE feat/B4.4-agent$" "$LOG" || { say "feature card branch: $(grep '^WORKTREE' "$LOG")"; r=1; }
[[ $r -eq 0 ]] && ok R6 || fail R6
# R7
r=0
reset; run 7
logs="$(cd "$RUNS/7" 2>/dev/null && ls)"
j="$(printf '%s\n' "$logs" | grep -E '^[0-9]{8}T[0-9]{6}Z-[0-9]+\.jsonl$')"
[[ $(printf '%s\n' "$j" | grep -c .) -eq 1 ]] || { say "logs: $logs"; r=1; }
b="$RUNS/7/${j%.jsonl}"
[[ "$(head -1 "$b.err" 2>/dev/null)" == "$VERSION" && "$(cat "$b.exit" 2>/dev/null)" == 0 ]] && has '"subtype":"init"' "$b.jsonl" \
  || { say "err/exit/jsonl: $(head -1 "$b.err" 2>/dev/null) / $(cat "$b.exit" 2>/dev/null)"; r=1; }
[[ $r -eq 0 ]] && ok R7 || fail R7
# R8
r=0
reset; { start; init '["Read","Grep","Glob","Write","Edit","Bash","Agent","Skill","WebFetch"]'; echo SLEEP; result false success x; } > "$FIX/stream.jsonl"
t0=$(date +%s); run 7; t=$(( $(date +%s) - t0 ))
[[ $RC -eq 0 && $t -lt 20 && $(calls) -eq 1 ]] && has 'tools-mismatch' "$FIX/comments" && has 'WebFetch' "$FIX/comments" \
  || { say "rc=$RC t=${t}s calls=$(calls) comments=$(cat "$FIX/comments" 2>/dev/null | head -3)"; r=1; }
reset; { start; init '["Read","Grep","Glob","Write","Edit","Bash","Task"]'; result false success "$GATE"; } > "$FIX/stream.jsonl"; run 7
has 'outcome: gate' "$FIX/comments" || { say "Task (the Agent tool's name in 2.1.309's init) stopped the run: $(sed -n 3p "$FIX/comments" 2>/dev/null)"; r=1; }
[[ $r -eq 0 ]] && ok R8 || fail R8
# R9
r=0
reset; { start; init '' '[{"name":"caveman","source":"caveman@caveman","path":"/u/.claude/plugins/cache/caveman"}]'; echo SLEEP; } > "$FIX/stream.jsonl"; run 7
[[ $(calls) -eq 1 ]] && has 'user-settings' "$FIX/comments" || { say "plugin: $(head -3 "$FIX/comments" 2>/dev/null)"; r=1; }
reset; { start; start; init; echo SLEEP; } > "$FIX/stream.jsonl"; run 7
[[ $(calls) -eq 1 ]] && has 'user-settings' "$FIX/comments" || { say "extra SessionStart: $(head -3 "$FIX/comments" 2>/dev/null)"; r=1; }
BUILTIN='[{"name":"cc-plugin-telemetry","source":"cc-plugin-telemetry@builtin","path":"builtin"}]'
reset; { start; init '' "$BUILTIN"; result false success "$GATE"; } > "$FIX/stream.jsonl"; run 7
has 'outcome: gate' "$FIX/comments" || { say "builtin plugin stopped the run: $(head -3 "$FIX/comments" 2>/dev/null)"; r=1; }
[[ $r -eq 0 ]] && ok R9 || fail R9
# R10
r=0
reset; { start; init; result true success 'API Error: 500'; } > "$FIX/stream-1.jsonl"; cp "$FIX/stream-1.jsonl" "$FIX/stream-2.jsonl"
run 7
[[ $(calls) -eq 2 && $(ls "$RUNS/7"/*.jsonl 2>/dev/null | wc -l | tr -d ' ') -eq 2 && $(grep -c '^=== #7' "$FIX/comments") -eq 1 ]] \
  && has 'error' "$FIX/comments" || { say "twice: calls=$(calls) comments=$(grep -c '^===' "$FIX/comments" 2>/dev/null)"; r=1; }
reset; { start; init; result true success 'API Error: 500'; } > "$FIX/stream-1.jsonl"; run 7
[[ $(calls) -eq 2 ]] && has 'gate' "$FIX/comments" || { say "then gate: calls=$(calls) $(head -2 "$FIX/comments" 2>/dev/null)"; r=1; }
[[ $r -eq 0 ]] && ok R10 || fail R10
# R11
r=0
for st in error_max_turns error_max_budget_usd; do
  reset; { start; init; result true "$st" ''; } > "$FIX/stream.jsonl"; run 7
  [[ $(calls) -eq 1 ]] && has 'limit' "$FIX/comments" && has "$st" "$FIX/comments" || { say "$st: calls=$(calls)"; r=1; }
done
[[ $r -eq 0 ]] && ok R11 || fail R11
# R12
r=0
reset; run 7
c="$FIX/comments"
has 'gate' "$c" && has 'B1.44' "$c" && has 'tier: medium' "$c" && has 'chore/B1.44-agent' "$c" && has 'S1' "$c" \
  && has 'permission denials: 2' "$c" && has 'scripts/agent/run.sh 7' "$c" && grep -Eq '[0-9]{8}T[0-9]{6}Z-[0-9]+\.jsonl' "$c" \
  || { say "comment: $(tr '\n' '|' < "$c" 2>/dev/null)"; r=1; }
has 'Reply' "$c" && { say "agent text in the comment"; r=1; }
[[ -f "$RUNS/7/stopped" && ! -e "$RUNS/7/lock" ]] || { say "stopped/lock"; r=1; }
reset; SMOKE_PLAN_TOKEN=prisma/schema.prisma run 7
has 'tier: high' "$FIX/comments" || { say "high: $(tr '\n' '|' < "$FIX/comments" 2>/dev/null)"; r=1; }
[[ $r -eq 0 ]] && ok R12 || fail R12
# R13
r=0
reset; echo '[{"number":9},{"number":7},{"number":8}]' > "$FIX/issues.json"; issue 9 B4.4; issue 8 B1.30
mkdir -p "$RUNS/8"; echo gate > "$RUNS/8/stopped"; run --poll
[[ "$(grep '^ELIGIBLE' "$LOG" | tr '\n' ' ')" == "ELIGIBLE 7 ELIGIBLE 9 " && $(calls) -eq 2 ]] \
  || { say "order: $(grep '^ELIGIBLE' "$LOG" | tr '\n' ' ') calls=$(calls)"; r=1; }
: > "$LOG"; run --poll
[[ $(calls) -eq 0 ]] || { say "second poll ran $(calls)"; r=1; }
: > "$LOG"; run 7
[[ $(calls) -eq 1 ]] || { say "by hand after stopped: calls=$(calls)"; r=1; }
# a TERM during --poll stops the claude run, writes no stopped mark and leaves no lock (review pass 2, finding 3)
reset; echo '[{"number":7}]' > "$FIX/issues.json"; { start; echo SLEEP; } > "$FIX/stream.jsonl"
(cd "$ROOT" && SMOKE_LOG="$LOG" SMOKE_FIX="$FIX" SMOKE_WT="$WT" SMOKE_ROOT="$ROOT" PATH="$TMP/bin:$PATH" GIT_DIR="$REPO/.git" \
  RUNNER_CLAUDE="$TMP/bin/claude" RUNNER_RUNS="$RUNS" RUNNER_ELIGIBLE="$TMP/bin/fake-eligible" \
  RUNNER_CLAIM="$TMP/bin/fake-claim" RUNNER_WORKTREE="$TMP/bin/fake-worktree" exec env "${IDENT[@]}" "$SRC" --poll) > "$TMP/out" 2>&1 &
bg=$!; i=0; while [[ ! -s "$FIX/claude.pid" ]] && [[ $i -lt 20 ]]; do sleep 1; i=$((i + 1)); done
t0=$(date +%s); kill -TERM "$bg" 2>/dev/null; wait "$bg" 2>/dev/null; t=$(( $(date +%s) - t0 ))
sleep 1
[[ $t -lt 10 ]] || { say "poll took ${t}s to stop"; r=1; }
kill -0 "$(cat "$FIX/claude.pid" 2>/dev/null || echo 0)" 2>/dev/null && { say "TERM left the poll's claude run going"; r=1; }
[[ ! -e "$RUNS/7/lock" && ! -e "$RUNS/7/stopped" && $(calls) -eq 1 ]] || { say "poll TERM: lock/stopped/calls=$(calls)"; r=1; }
[[ $r -eq 0 ]] && ok R13 || fail R13
# R14
r=0
pass='{"type":"system","subtype":"hook_response","hook_event":"PreToolUse","hook_name":"PreToolUse:Write","exit_code":2,"outcome":"error","stderr":"BLOCKED by .claude/hooks/path-guard.sh: spec/agent-probe.md is outside this role'"'"'s paths"}'
reset; : > "$RUNS/verified-versions"; { init '["Write","Grep","Glob"]'; echo "$pass"; result false success done; } > "$FIX/stream.jsonl"
run --check-binary
line="$(grep "^CLAUDE .* ARGS=-p " "$LOG" | head -1)"
[[ $RC -eq 0 && "$(cat "$RUNS/verified-versions")" == "$VERSION" ]] || { say "pass: rc=$RC $(tail -2 "$TMP/out")"; r=1; }
[[ "$line" == *" --agent dev-lead "* && "$line" == *" --tools Write "* && "$line" == *" --max-turns 2 "* \
  && "$line" != *"cwd=$ROOT "* ]] || { say "argv: $line"; r=1; }
# under the checkout's .worktrees/ like run_issue's worktrees, where live check 3 proved the hook (the trust is the main
# checkout's record, review pass 4 finding 1), and removed afterwards
[[ "$line" == *"cwd=${ROOT%%/.worktrees/*}/.worktrees/check-binary-"* ]] || { say "probe worktree: $line"; r=1; }
left="$(ls -d "${ROOT%%/.worktrees/*}"/.worktrees/check-binary-* 2>/dev/null)"
[[ -z "$left" ]] || { say "probe worktree left: $left"; r=1; }
# jq 1.6 (Debian bookworm, the runner image) takes -e's exit status from the last input only, so a block on an
# earlier line must still verify (B1.58 live check 2)
{ printf '#!/bin/bash\nreal=%q\n' "$(command -v jq)"; cat <<'SHIM'
e=0; args=()
for a in "$@"; do if [[ "$a" == -e ]]; then e=1; else args+=("$a"); fi; done
if [[ $e -eq 1 && -f "${@: -1}" ]]; then
  "$real" "${args[@]}"
  tail -n 1 "${@: -1}" | "$real" -e "${args[@]:0:${#args[@]}-1}" >/dev/null
  exit $?
fi
exec "$real" "$@"
SHIM
} > "$TMP/bin/jq"; chmod +x "$TMP/bin/jq"
reset; : > "$RUNS/verified-versions"; { init '["Write"]'; echo "$pass"; result false success done; } > "$FIX/stream.jsonl"
run --check-binary
[[ $RC -eq 0 && "$(cat "$RUNS/verified-versions")" == "$VERSION" ]] || { say "jq 1.6: rc=$RC $(tail -1 "$TMP/out")"; r=1; }
rm -f "$TMP/bin/jq"
# a TERM during the check removes its probe worktree, which worktree-prune.sh never lists (review pass 4, finding 2)
reset; : > "$RUNS/verified-versions"; { init '["Write"]'; echo SLEEP; } > "$FIX/stream.jsonl"
(cd "$ROOT" && SMOKE_LOG="$LOG" SMOKE_FIX="$FIX" SMOKE_WT="$WT" SMOKE_ROOT="$ROOT" PATH="$TMP/bin:$PATH" GIT_DIR="$REPO/.git" \
  RUNNER_CLAUDE="$TMP/bin/claude" RUNNER_RUNS="$RUNS" exec "$SRC" --check-binary) > "$TMP/out" 2>&1 &
bg=$!; i=0; while [[ ! -s "$FIX/claude.pid" ]] && [[ $i -lt 20 ]]; do sleep 1; i=$((i + 1)); done
kill -TERM "$bg" 2>/dev/null; wait "$bg" 2>/dev/null; sleep 1
left="$(ls -d "${ROOT%%/.worktrees/*}"/.worktrees/check-binary-* 2>/dev/null)"
[[ -z "$left" && ! -s "$RUNS/verified-versions" ]] || { say "TERM left the probe worktree: $left"; r=1; }
git --git-dir="$REPO/.git" worktree prune; for d in $left; do rm -rf "$d"; done
has 'call the Write tool' "$FIX/stdin-1" && has 'spec/agent-probe.md' "$FIX/stdin-1" && has 'blocks it' "$FIX/stdin-1" \
  || { say "probe prompt: $(head -2 "$FIX/stdin-1" 2>/dev/null)"; r=1; }
reset; : > "$RUNS/verified-versions"; { init '["Write"]'; result false success done; } > "$FIX/stream.jsonl"; run --check-binary
[[ $RC -eq 1 && ! -s "$RUNS/verified-versions" ]] || { say "no block: rc=$RC"; r=1; }
reset; : > "$RUNS/verified-versions"; { init '["Write"]'; echo "$pass"; echo 'WRITE:spec/agent-probe.md'; result false success done; } > "$FIX/stream.jsonl"
run --check-binary
[[ $RC -eq 1 && ! -s "$RUNS/verified-versions" ]] || { say "file written: rc=$RC"; r=1; }
reset; : > "$RUNS/verified-versions"
{ init '["Write"]' '[{"name":"caveman","source":"caveman@caveman","path":"/u/x"}]'; echo "$pass"; result false success done; } > "$FIX/stream.jsonl"
run --check-binary
[[ $RC -eq 1 && ! -s "$RUNS/verified-versions" ]] && has 'user-settings' "$TMP/out" || { say "user plugin: rc=$RC $(tail -1 "$TMP/out")"; r=1; }
for bad in '"exit_code":0,"outcome":"success","stderr":"BLOCKED by .claude/hooks/path-guard.sh: x"' \
  '"exit_code":2,"outcome":"error","stderr":"BLOCKED by .claude/hooks/plan-scope.sh: x"'; do
  reset; : > "$RUNS/verified-versions"
  { init '["Write"]'; echo '{"type":"system","subtype":"hook_response","hook_event":"PreToolUse","hook_name":"PreToolUse:Write",'"$bad"'}'
    result false success done; } > "$FIX/stream.jsonl"
  run --check-binary
  [[ $RC -eq 1 && ! -s "$RUNS/verified-versions" ]] || { say "accepted $bad: rc=$RC"; r=1; }
done
reset; : > "$RUNS/verified-versions"; { init '["Write","Grep","Glob","Bash"]'; echo "$pass"; result false success done; } > "$FIX/stream.jsonl"
run --check-binary
[[ $RC -eq 1 && ! -s "$RUNS/verified-versions" ]] && has 'tools-mismatch' "$TMP/out" || { say "Bash in a Write-only check: rc=$RC"; r=1; }
[[ $r -eq 0 ]] && ok R14 || fail R14
# R15
r=0
mkdir -p "$TMP/linux"
printf '#!/bin/sh\necho Linux\n' > "$TMP/linux/uname"
printf '#!/bin/sh\necho "CURL $*" >> "$SMOKE_LOG"\ncase "$*" in *example.com*) exit 7 ;; esac\nexit 0\n' > "$TMP/linux/curl"
chmod +x "$TMP/linux/uname" "$TMP/linux/curl"
reset; run --mode
[[ $RC -eq 0 && "$(cat "$TMP/out")" == dontAsk ]] || { say "host: rc=$RC $(head -2 "$TMP/out")"; r=1; }
reset; PATH="$TMP/linux:$PATH" run --mode
[[ $RC -eq 0 && "$(cat "$TMP/out")" == dontAsk ]] || { say "Linux uname, firewall-like curl, no marker: rc=$RC $(head -2 "$TMP/out")"; r=1; }
reset; RUNNER_MODE=bypassPermissions RUNNER_PERMISSION_MODE=bypassPermissions IS_SANDBOX=1 PATH="$TMP/linux:$PATH" run --mode
[[ $RC -eq 0 && "$(cat "$TMP/out")" == dontAsk ]] || { say "env asking for bypass: rc=$RC $(head -2 "$TMP/out")"; r=1; }
reset; run --mode 7
[[ $RC -eq 1 ]] && has usage "$TMP/out" || { say "--mode with an argument: rc=$RC"; r=1; }
[[ $(calls) -eq 0 ]] && ! has ELIGIBLE "$LOG" || { say "--mode started a run"; r=1; }
[[ $r -eq 0 ]] && ok R15 || fail R15
# R16
r=0
reset; run 7
want="Issue #7 is labeled agent-ready (D-27): run card B1.44 as dev-lead: follow .claude/agents/dev-lead.md and .claude/skills/work-next/SKILL.md. The worktree $WT/chore-b1-44-agent
on branch chore/B1.44-agent is claimed and is yours; resume from the first Loop step whose artifact is missing. This run is
headless: nobody answers inside it. At the plan gate take dev-lead Loop 5's D-27 path: once the plan review says
Verdict: approved, a plan that scripts/agent/tier.sh rates low or medium, with scripts/agent/eligible.sh 7 B1.44
exiting 0, gets the reviewer's D-27 approval line and the run goes on; at tier high or on a refusal print the gate
line and stop; a question only the lead can answer goes to backlog/README.md \"Waiting on human\", then stop."
[[ "$(cat "$FIX/stdin-1" 2>/dev/null)" == "$want" ]] || { say "prompt: $(tr '\n' '|' < "$FIX/stdin-1" 2>/dev/null)"; r=1; }
# the opening is how dev-lead knows a run (Loop 5); a rewording would turn the D-27 path off with no other probe failing
has 'Issue #7 is labeled agent-ready (D-27): run card' "$FIX/stdin-1" || { say "prompt lost its D-27 opening"; r=1; }
has 'print the gate line and stop; a question' "$FIX/stdin-1" && { say "the unconditional gate stop is still in the prompt"; r=1; }
grep -q 'Until B1.55' "$SRC" && { say "the header still says every run stops at the gate"; r=1; }
# the header line whole: "names Loop 5" alone let "every plan proceeds (D-27, dev-lead Loop 5)" pass (review pass 1)
hdr='# A reviewed low or medium plan of the issue proceeds (D-27, dev-lead Loop 5); a high-tier plan or a refusal stops at'
[[ "$(grep -A1 -xF -- "$hdr" "$SRC")" == "$hdr"$'\n''# the gate.' ]] || { say "the header does not state the D-27 rule: $(sed -n 6,7p "$SRC" | tr '\n' '|')"; r=1; }
[[ $r -eq 0 ]] && ok R16 || fail R16

# R17
r=0
printf '[user]\n\temail = smoke@runner.invalid\n' > "$TMP/no-name"
printf '[user]\n\tname = smoke runner\n' > "$TMP/no-email"
printf '[user]\n\tname = "  "\n\temail = smoke@runner.invalid\n' > "$TMP/blank-name"
printf '[user]\n\tname = smoke runner\n\temail = "  "\n' > "$TMP/blank-email"
for g in /dev/null "$TMP/no-name" "$TMP/no-email" "$TMP/blank-name" "$TMP/blank-email"; do
  reset; GITCFG="$g" run 7
  [[ $RC -eq 1 && $(calls) -eq 0 && ! -e "$RUNS/7" ]] && has '[run] no git identity' "$TMP/out" \
    && has "git config --global" "$TMP/out" && has 'docker-compose.yml' "$TMP/out" \
    && ! grep -qE '^(ELIGIBLE|CLAIM|WORKTREE) |^CLAUDE .* ARGS=auth ' "$LOG" \
    || { say "$(basename "$g"): rc=$RC calls=$(calls) $(tr '\n' '|' < "$TMP/out")"; r=1; }
done
reset; echo '[{"number":7}]' > "$FIX/issues.json"; GITCFG=/dev/null run --poll
[[ $RC -eq 1 && $(calls) -eq 0 ]] && has '[run] no git identity' "$TMP/out" && ! grep -qE '^GH .* issue list|^ELIGIBLE ' "$LOG" \
  || { say "--poll: rc=$RC calls=$(calls) $(tr '\n' '|' < "$TMP/out")"; r=1; }
# --check-binary commits nothing, so it needs no identity: without a login it still stops at the login (plan)
reset; : > "$RUNS/verified-versions"; SMOKE_AUTH=false GITCFG=/dev/null run --check-binary
[[ $RC -eq 1 ]] && has 'not logged in' "$TMP/out" && ! has 'no git identity' "$TMP/out" \
  || { say "--check-binary: rc=$RC $(tr '\n' '|' < "$TMP/out")"; r=1; }
reset; GITCFG=/dev/null run --mode
[[ $RC -eq 0 && "$(cat "$TMP/out")" == dontAsk ]] || { say "--mode: rc=$RC $(tr '\n' '|' < "$TMP/out")"; r=1; }
[[ $r -eq 0 ]] && ok R17 || fail R17
# R18 (B1.82): a merged agent branch is not in flight; an unmerged one or an open PR is, and the skip names them
r=0
tip() { git -C "$REPO" -c user.name=s -c user.email=s@x commit-tree "$b0^{tree}" -p "$b0" -m "$1"; }
mk() { git -C "$REPO" branch -q -f "$1" "${2:-$(tip "$1")}"; } # mk <branch> [<commit>]: by default a tip no other ref holds
drop() {
  git -C "$REPO" for-each-ref --format='%(refname)' refs/heads/feat/ refs/heads/chore/ \
    | while read -r ref; do git -C "$REPO" update-ref -d "$ref"; done
}
# origin/main merges three branch tips m1–m3 into b0 (merge commits); its first-parent line is om, b0
m1="$(tip m1)"; m2="$(tip m2)"; m3="$(tip m3)"
om="$(git -C "$REPO" -c user.name=s -c user.email=s@x commit-tree "$b0^{tree}" -p "$b0" -p "$m1" -p "$m2" -p "$m3" -m om)"
git -C "$REPO" update-ref refs/remotes/origin/main "$om"
at "$om" "$om" # the checkout stands on its origin's main, which run.sh fetches (B1.95), so every case runs
reset; drop; mk feat/B9.1-agent "$m1"; mk chore/B9.2-agent "$m2"; mk feat/B9.3-agent "$m3"; run 7
[[ $RC -eq 0 && $(calls) -eq 1 ]] && ! has 'in flight' "$TMP/out" \
  || { say "tips merged into origin/main: rc=$RC calls=$(calls) $(tr '\n' '|' < "$TMP/out")"; r=1; }
# a run's branch before its first commit sits on origin/main's first-parent line: started, not merged
reset; drop; mk feat/B9.1-agent "$om"; mk chore/B9.2-agent "$b0"; mk feat/B9.3-agent "$om"; run 7
[[ $RC -eq 0 && $(calls) -eq 0 ]] && has 'chore/B9.2-agent feat/B9.1-agent feat/B9.3-agent' "$TMP/out" \
  || { say "fresh branches: rc=$RC calls=$(calls) $(tr '\n' '|' < "$TMP/out")"; r=1; }
# a squash merge: the tip stays outside origin/main, its PR merged or closed at that very tip
reset; drop; mk feat/B9.1-agent; mk chore/B9.2-agent; mk feat/B9.3-agent
prs feat/B9.1-agent:MERGED chore/B9.2-agent:CLOSED feat/B9.3-agent:MERGED; run 7
[[ $RC -eq 0 && $(calls) -eq 1 ]] && ! has 'in flight' "$TMP/out" \
  && grep -qE '^GH .* pr list --head chore/B9\.2-agent --state all ' "$LOG" \
  || { say "PRs merged or closed: rc=$RC calls=$(calls) $(tr '\n' '|' < "$TMP/out") $(grep -c ' --head ' "$LOG") --head calls"; r=1; }
# a run resumed on a branch after its PR closed: a commit past the PR's head counts again (plan review 1, finding 1)
# a merged PR whose head GitHub moved past the local tip (Update branch, #200) does not count (plan review 2)
reset; drop; mk feat/B9.1-agent; mk chore/B9.2-agent; mk feat/B9.3-agent; mk feat/B9.5-agent; mk feat/B9.6-agent
prs feat/B9.1-agent:CLOSED:"$m1" chore/B9.2-agent:CLOSED feat/B9.3-agent:MERGED:"$m3"; run 7
[[ $RC -eq 0 && $(calls) -eq 0 ]] \
  && has 'skip #7: 3 agent branches in flight (cap 3): feat/B9.1-agent feat/B9.5-agent feat/B9.6-agent' "$TMP/out" \
  || { say "PR closed at an older tip, merged past the tip: rc=$RC calls=$(calls) $(tr '\n' '|' < "$TMP/out")"; r=1; }
reset; drop; mk feat/B9.1-agent; mk chore/B9.2-agent; mk feat/B9.3-agent; run 7
[[ $RC -eq 0 && $(calls) -eq 0 ]] && has 'skip #7: 3 agent branches in flight' "$TMP/out" \
  && has 'chore/B9.2-agent feat/B9.1-agent feat/B9.3-agent' "$TMP/out" \
  || { say "three unmerged: rc=$RC calls=$(calls) $(tr '\n' '|' < "$TMP/out")"; r=1; }
# counted: a branch whose closed PR was followed by an open one, an unmerged branch with no PR, an open PR's head;
# not counted: a tip in origin/main, a branch whose PR merged
reset; drop; mk feat/B9.1-agent; mk chore/B9.2-agent; mk feat/B9.3-agent "$m3"; mk feat/B9.4-agent
prs feat/B9.1-agent:CLOSED feat/B9.1-agent feat/B9.6-agent feat/B9.4-agent:MERGED; run 7
[[ $RC -eq 0 && $(calls) -eq 0 ]] && has 'chore/B9.2-agent feat/B9.1-agent feat/B9.6-agent' "$TMP/out" \
  && ! has 'B9.3' "$TMP/out" && ! has 'B9.4' "$TMP/out" \
  || { say "mixed: rc=$RC calls=$(calls) $(tr '\n' '|' < "$TMP/out")"; r=1; }
reset; drop; mk feat/B9.1-agent; mk chore/B9.2-agent; mk feat/B9.3-agent "$m3"; run 7
[[ $RC -eq 0 && $(calls) -eq 1 ]] || { say "two unmerged, one merged: rc=$RC calls=$(calls) $(tr '\n' '|' < "$TMP/out")"; r=1; }
drop; git -C "$REPO" update-ref refs/remotes/origin/main "$b0"; at "$b0" "$b0"
[[ $r -eq 0 ]] && ok R18 || fail R18
# R19 (B1.88): each claude -p run gets a TMPDIR of its own (guard-bash rule 6 lets the reviewer write only there): set,
# an existing absolute directory, outside the run's worktree and the project, not the host's, not another run's, and
# gone when the run ends, also on TERM; without one no run starts
r=0
HOST_TMP="$TMP/host"
own() { # own <TMPDIR a run saw>: why it is not the run's own, empty when it is
  local d
  case "$1" in /*) ;; *) echo "unset or relative: '$1'"; return ;; esac
  [[ "$1" != "$HOST_TMP" ]] || { echo "the host's TMPDIR"; return; }
  for d in "$WT" "$ROOT" "${ROOT%%/.worktrees/*}"; do
    case "$1/" in "$d"/*) echo "inside $d: $1"; return ;; esac
    case "$d/" in "$1"/*) echo "holds $d: $1"; return ;; esac
  done
  [[ ! -e "$1" ]] || echo "left after the run: $1"
}
seen() { # seen <case> <runs> [term]: the START lines (and, unless term, END lines) of the shim's tmpdirs file
  local l t d k why n=0 all=""
  while read -r l t d; do
    n=$((n + 1)); all="$all$t "
    why="$(own "$t")"; [[ -n "$why" || "$d" == y ]] || why="not an existing directory at the start: $t"
    [[ -z "$why" ]] || { say "$1: $why"; r=1; }
    [[ "${3:-}" == term ]] && continue
    k="$(awk -v t="$t" '$1 == "END" && $2 == t { print $3 }' "$FIX/tmpdirs" | tr '\n' ' ')"
    [[ "$k" == "1 " ]] || { say "$1: $t held '$k' entries at the end, not its run's one"; r=1; }
  done < <(grep '^START ' "$FIX/tmpdirs" 2>/dev/null)
  [[ $n -eq $2 ]] || { say "$1: $n runs seen, want $2"; r=1; }
  [[ $(tr ' ' '\n' <<< "$all" | grep . | sort -u | grep -c .) -eq $n ]] || { say "$1: runs shared a TMPDIR: $all"; r=1; }
}
fresh() { rm -rf "$HOST_TMP"; mkdir -p "$HOST_TMP"; }
reset; fresh; TMPDIR="$HOST_TMP" run 7
[[ $RC -eq 0 && $(calls) -eq 1 ]] || { say "one run: rc=$RC calls=$(calls)"; r=1; }
seen "one run" 1
reset; fresh; { start; init; result true success 'API Error: 500'; } > "$FIX/stream-1.jsonl"; TMPDIR="$HOST_TMP" run 7
seen "retry" 2
reset; fresh; issue 8 B1.45; { start; init; echo NAP; result false success "$GATE"; } > "$FIX/stream.jsonl"
(TMPDIR="$HOST_TMP" run 7) & p7=$!; (TMPDIR="$HOST_TMP" run 8) & p8=$!; wait "$p7"; wait "$p8"
seen "two runs at once" 2
reset; fresh; : > "$RUNS/verified-versions"; { init '["Write"]'; echo "$pass"; result false success done; } > "$FIX/stream.jsonl"
TMPDIR="$HOST_TMP" run --check-binary
[[ $RC -eq 0 ]] || { say "--check-binary: rc=$RC $(tail -1 "$TMP/out")"; r=1; }
seen "--check-binary" 1
reset; fresh; { start; echo SLEEP; } > "$FIX/stream.jsonl"
(cd "$ROOT" && SMOKE_LOG="$LOG" SMOKE_FIX="$FIX" SMOKE_WT="$WT" SMOKE_ROOT="$ROOT" PATH="$TMP/bin:$PATH" GIT_DIR="$REPO/.git" \
  RUNNER_CLAUDE="$TMP/bin/claude" RUNNER_RUNS="$RUNS" RUNNER_ELIGIBLE="$TMP/bin/fake-eligible" \
  RUNNER_CLAIM="$TMP/bin/fake-claim" RUNNER_WORKTREE="$TMP/bin/fake-worktree" TMPDIR="$HOST_TMP" \
  exec env "${IDENT[@]}" "$SRC" 7) > "$TMP/out" 2>&1 &
bg=$!; i=0; while [[ ! -s "$FIX/claude.pid" ]] && [[ $i -lt 20 ]]; do sleep 1; i=$((i + 1)); done
kill -TERM "$bg" 2>/dev/null; wait "$bg" 2>/dev/null; sleep 1
seen "TERM" 1 term
reset; fresh; echo '[{"number":7}]' > "$FIX/issues.json"; { start; echo SLEEP; } > "$FIX/stream.jsonl"
(cd "$ROOT" && SMOKE_LOG="$LOG" SMOKE_FIX="$FIX" SMOKE_WT="$WT" SMOKE_ROOT="$ROOT" PATH="$TMP/bin:$PATH" GIT_DIR="$REPO/.git" \
  RUNNER_CLAUDE="$TMP/bin/claude" RUNNER_RUNS="$RUNS" RUNNER_ELIGIBLE="$TMP/bin/fake-eligible" \
  RUNNER_CLAIM="$TMP/bin/fake-claim" RUNNER_WORKTREE="$TMP/bin/fake-worktree" TMPDIR="$HOST_TMP" \
  exec env "${IDENT[@]}" "$SRC" --poll) > "$TMP/out" 2>&1 &
bg=$!; i=0; while [[ ! -s "$FIX/claude.pid" ]] && [[ $i -lt 20 ]]; do sleep 1; i=$((i + 1)); done
kill -TERM "$bg" 2>/dev/null; wait "$bg" 2>/dev/null; sleep 1
seen "TERM during --poll" 1 term
# a mktemp that fails, prints nothing or prints a directory of its own: no run starts, and nothing is removed. On a
# copy of the scripts, so a run.sh that turned an empty answer into its cwd (`cd ""`) removes only the copy (plan r1)
COPY="$TMP/copy"; mkdir -p "$COPY/backlog" "$TMP/mk" "$TMP/victim"; : > "$TMP/victim/keep"
cp -R "$ROOT/scripts" "$COPY/"; cp -R "$ROOT/backlog/plan" "$COPY/backlog/"
printf '#!/bin/sh\ncase "$SMOKE_MKTEMP" in fail) exit 1 ;; empty) exit 0 ;; *) echo "$SMOKE_MKTEMP" ;; esac\n' > "$TMP/mk/mktemp"
chmod +x "$TMP/mk/mktemp"
for m in fail empty "$TMP/victim"; do
  reset; fresh; SRC="$COPY/scripts/agent/run.sh" DIR="$COPY" SMOKE_MKTEMP="$m" PATH="$TMP/mk:$PATH" TMPDIR="$HOST_TMP" run 7
  [[ $RC -eq 0 && $(calls) -eq 0 && "$(cat "$RUNS/7/stopped" 2>/dev/null)" == no-tmpdir ]] && has 'no-tmpdir' "$FIX/comments" \
    && [[ -f "$COPY/scripts/agent/run.sh" && -f "$TMP/victim/keep" ]] \
    || { say "mktemp $m: rc=$RC calls=$(calls) stopped=$(cat "$RUNS/7/stopped" 2>/dev/null) copy/victim: $(ls "$COPY" "$TMP/victim" 2>&1 | tr '\n' ' ')"; r=1; }
done
[[ $r -eq 0 ]] && ok R19 || fail R19
# R20 (B1.95): before anything of an issue, run.sh fetches origin and refuses a checkout whose HEAD is behind
# origin/main, naming the count, both shas and the fix; a HEAD ahead runs; a failed fetch refuses with git's reason
# rather than trusting the last fetched origin/main. The scratch repository's own origin/main stays at b0 until a fetch
# moves it, so a run.sh that never fetches cannot see the origin move.
r=0
c() { git -C "$REPO" -c user.name=s -c user.email=s@x commit-tree "$b0^{tree}" -p "$1" -m "$2"; } # c <parent> <msg>
c1="$(c "$b0" c1)"; c2="$(c "$c1" c2)"; d1="$(c "$b0" d1)"
none() { # none: no seam was called and no claude -p started (the refusal came first); --poll's own issue list aside
  [[ $(calls) -eq 0 ]] && ! grep -qE '^(ELIGIBLE|CLAIM|WORKTREE) ' "$LOG" && ! grep '^GH ' "$LOG" | grep -vq ' issue list '
}
refused() { # refused <head> <origin main> <count text> [<fix>]: the refusal names the count, both shas and the fix
  has "behind origin/main by $3 (HEAD ${1:0:7}" "$TMP/out" && has "origin/main ${2:0:7})" "$TMP/out" \
    && has "fix: git -C $ROOT ${4:-merge --ff-only origin/main}, then rerun" "$TMP/out"
}
for t in "$b0 $c1 1 commit" "$b0 $c2 2 commits"; do
  set -- $t
  reset; at "$1" "$2"; run 7
  [[ $RC -eq 1 ]] && none && refused "$1" "$2" "$3 $4" \
    || { say "HEAD ${1:0:7}, origin ${2:0:7}: rc=$RC calls=$(calls) $(tr '\n' '|' < "$TMP/out")"; r=1; }
done
# diverged (a card branch's own run.sh after main moved): behind as well, and --ff-only could not fix it (plan r1)
reset; at "$c2" "$d1"; run 7
[[ $RC -eq 1 ]] && none && refused "$c2" "$d1" "1 commit" "merge origin/main (HEAD also has 2 commits of its own)" \
  && ! has 'ff-only' "$TMP/out" || { say "diverged: rc=$RC calls=$(calls) $(tr '\n' '|' < "$TMP/out")"; r=1; }
reset; at "$c1" "$b0"; run 7
[[ $RC -eq 0 && $(calls) -eq 1 ]] && ! has behind "$TMP/out" || { say "ahead: rc=$RC calls=$(calls) $(tr '\n' '|' < "$TMP/out")"; r=1; }
reset; echo '[{"number":7},{"number":8}]' > "$FIX/issues.json"; issue 8 B1.45; at "$b0" "$c1"; run --poll
[[ $(calls) -eq 0 && $(grep -c 'behind origin/main by 1 commit' "$TMP/out") -eq 2 ]] && none \
  || { say "--poll: rc=$RC calls=$(calls) $(tr '\n' '|' < "$TMP/out")"; r=1; }
# the last fetched origin/main says "not behind"; the fetch itself fails
reset; at "$b0" "$c1"; git -C "$REPO" update-ref refs/remotes/origin/main "$b0"
git -C "$REPO" remote set-url origin "$TMP/nowhere"; run 7
[[ $RC -eq 1 ]] && none && has 'git fetch origin failed' "$TMP/out" && has "$TMP/nowhere" "$TMP/out" && ! has behind "$TMP/out" \
  || { say "fetch fails: rc=$RC calls=$(calls) $(tr '\n' '|' < "$TMP/out")"; r=1; }
git -C "$REPO" remote set-url origin "$ORIGIN"
# three parallel runs share one clone: a fetch that meets another's ref lock is tried again
reset; at "$b0" "$c1"; : > "$REPO/.git/refs/remotes/origin/main.lock"
(sleep 1; rm -f "$REPO/.git/refs/remotes/origin/main.lock") & run 7; wait
[[ $RC -eq 1 ]] && none && refused "$b0" "$c1" "1 commit" && ! has 'fetch origin failed' "$TMP/out" \
  || { say "ref lock: rc=$RC $(tr '\n' '|' < "$TMP/out")"; r=1; }
at "$b0" "$b0"; git -C "$REPO" update-ref refs/remotes/origin/main "$b0"
[[ $r -eq 0 ]] && ok R20 || fail R20

# R21, R22 (B1.101): --sync <issue> brings a ready runner PR's branch level with origin/main, with no claude run. The
# card's worktree is a real worktree of the scratch repository, pushed to its bare origin. Its base holds a table under
# `merge=union`, a plain file and stand-ins for the three table guards: each logs its name and fails on a first cell
# kept twice, as check-features-map.sh, check-backlog.sh and check-spec-sections.sh do on a union merge (B1.89, B1.96).
B=chore/B1.44-agent; CW="$TMP/sync-wt" # outside $WT, which reset() empties
g() { (cd "$CW" && env -u GIT_DIR git -c user.name=s -c user.email=s@x "$@"); }
git -C "$REPO" worktree add -q -b "$B" "$CW" "$b0"
mkdir -p "$CW/scripts/ci"; echo 'table.md merge=union' > "$CW/.gitattributes"; printf '| F1 |\n' > "$CW/table.md"
echo x > "$CW/plain.txt"
for gd in check-spec-sections check-features-map check-backlog; do
  printf '#!/bin/bash\necho "GUARD %s $(pwd -P)" >> "$SMOKE_LOG"\n[[ -z "${SMOKE_NAP:-}" ]] || { : > "$SMOKE_NAP"; sleep 3; }\n! awk '"'"'{ print $2 }'"'"' table.md | sort | uniq -d | grep -q .\n' "$gd" \
    > "$CW/scripts/ci/$gd.sh"
done
chmod +x "$CW/scripts/ci/"*; g add -A; g commit -q -m s0; s0="$(g rev-parse HEAD)"
side() { # side <parent> <file> <content> <msg>: a commit on top of <parent> with <file> set to <content>, not checked out
  local t="$TMP/side-idx"; rm -f "$t"
  (cd "$CW" && env -u GIT_DIR GIT_INDEX_FILE="$t" git read-tree "$1" \
    && blob="$(printf '%b' "$3" | env -u GIT_DIR git hash-object -w --stdin)" \
    && env -u GIT_DIR GIT_INDEX_FILE="$t" git update-index --add --cacheinfo "100644,$blob,$2" \
    && env -u GIT_DIR git -c user.name=s -c user.email=s@x commit-tree "$(env -u GIT_DIR GIT_INDEX_FILE="$t" git write-tree)" -p "$1" -m "$4")
}
m1="$(side "$s0" table.md '| F1 |\n| F2 |\n' m1)"      # main appends F2 (a sibling's merge)
k1="$(side "$s0" table.md '| F1 |\n| F3 |\n' k1)"      # the card appends F3: union keeps both, plain git conflicts
m2="$(side "$s0" plain.txt 'z\n' m2)"; k2="$(side "$s0" plain.txt 'y\n' k2)"           # a real conflict
m3="$(side "$s0" table.md '| F1 main |\n' m3)"; k3="$(side "$s0" table.md '| F1 card |\n' k3)" # union keeps F1 twice
sync_at() { # sync_at <card tip> <origin main> [<origin's card branch>]: the worktree clean at the tip, pushed
  at "$2" "$2"; g reset -q --hard "$1"; g update-ref -d MERGE_HEAD 2>/dev/null
  git -C "$ORIGIN" update-ref "refs/heads/$B" "${3:-$1}"; g fetch -q origin
}
spr() { echo "[{\"number\":12,\"headRefName\":\"$B\",\"state\":\"OPEN\",\"isDraft\":${1:-false}}]" > "$FIX/prs.json"; }
same() { # same <tip>: a refusal left the branch as it was: HEAD and origin's branch at <tip>, no merge, nothing staged
  [[ "$(g rev-parse HEAD)" == "$1" && "$(git -C "$ORIGIN" rev-parse "refs/heads/$B")" == "$1" ]] \
    && [[ -z "$(g status --porcelain --untracked-files=no)" ]] && ! g rev-parse -q --verify MERGE_HEAD >/dev/null
}
quiet() { ! grep -q '^CLAUDE ' "$LOG" && ! grep -qE '^(ELIGIBLE|CLAIM|WORKTREE) ' "$LOG" && ! has '=== #' "$FIX/comments" \
  && ! grep -q '^GH .* pr ready' "$LOG"; }
# R21: a ready PR behind origin/main, union-merged clean: one merge commit (parents: the tip, then origin/main) with
# `Agent-Run: sync`, pushed; the three guards ran in the worktree; one runner comment; no claude call at all (not even
# --version or auth status: a sync runs where the login is gone), no claim, no ready --undo, no stopped mark
r=0
reset; spr; sync_at "$k1" "$m1"; SMOKE_AUTH=false run --sync 7
new="$(g rev-parse HEAD)"
[[ $RC -eq 0 && "$(g rev-parse HEAD^1) $(g rev-parse HEAD^2)" == "$k1 $m1" ]] \
  && [[ "$(g log -1 --format='%s')" == "Merge remote-tracking branch 'origin/main' into $B" ]] \
  && [[ "$(g log -1 --format='%(trailers:key=Agent-Run,valueonly)' | grep .)" == sync ]] \
  && [[ "$(git -C "$ORIGIN" rev-parse "refs/heads/$B")" == "$new" ]] \
  && [[ "$(g show HEAD:table.md | tr -d '\n')" == '| F1 || F3 || F2 |' || "$(g show HEAD:table.md | tr -d '\n')" == '| F1 || F2 || F3 |' ]] \
  && [[ $(grep -c "^GUARD .* $CW$" "$LOG") -eq 3 ]] && ! grep -q '^CLAUDE ' "$LOG" && ! grep -qE '^(ELIGIBLE|CLAIM|WORKTREE) ' "$LOG" \
  && ! grep -q '^GH .* pr ready' "$LOG" && [[ $(grep -c '^=== #7' "$FIX/comments") -eq 1 ]] \
  && has 'Runner (`scripts/agent/run.sh`, B1.44): **synced** for B1.44.' "$FIX/comments" && has '- outcome: synced' "$FIX/comments" \
  && has "#12" "$FIX/comments" && has "${new:0:7}" "$FIX/comments" && has "${new:0:7}" "$TMP/out" \
  && [[ ! -e "$RUNS/7/stopped" && ! -e "$RUNS/7/lock" ]] \
  || { say "clean: rc=$RC $(tr '\n' '|' < "$TMP/out") log: $(grep -v '^GH ' "$LOG" | tr '\n' '|')"; r=1; }
# again, now level: nothing to do, nothing pushed or posted
: > "$LOG"; rm -f "$FIX/comments"; run --sync 7
[[ $RC -eq 0 && "$(g rev-parse HEAD)" == "$new" ]] && has 'already contains origin/main' "$TMP/out" && quiet \
  && ! grep -q '^GUARD ' "$LOG" || { say "level: rc=$RC $(tr '\n' '|' < "$TMP/out")"; r=1; }
[[ $r -eq 0 ]] && ok R21 || fail R21
# R22: each refusal exits 1 before or instead of any change, names a way on, and leaves the branch as it was
r=0
refuse() { # refuse <label> <tip> <text>…: rc 1, the branch untouched, each text in the output, no comment, no claude
  local l="$1" tip="$2" t; shift 2
  [[ $RC -eq 1 ]] && same "$tip" && quiet || { say "$l: rc=$RC $(tr '\n' '|' < "$TMP/out")"; r=1; return; }
  for t in "$@"; do has "$t" "$TMP/out" || { say "$l: no '$t' in $(tr '\n' '|' < "$TMP/out")"; r=1; }; done
}
reset; spr; sync_at "$k2" "$m2"; run --sync 7
refuse conflict "$k2" 'conflict' 'plain.txt' 'scripts/agent/run.sh 7'
reset; spr; sync_at "$k3" "$m3"; run --sync 7
refuse guard "$k3" 'check-' 'scripts/agent/run.sh 7'
reset; echo '[]' > "$FIX/prs.json"; sync_at "$k1" "$m1"; run --sync 7
refuse no-pr "$k1" 'no open ready PR'
reset; spr true; sync_at "$k1" "$m1"; run --sync 7
refuse draft "$k1" 'no open ready PR' 'scripts/agent/run.sh 7'
reset; spr; sync_at "$k1" "$m1" "$s0"; run --sync 7
[[ $RC -eq 1 && "$(g rev-parse HEAD)" == "$k1" && "$(git -C "$ORIGIN" rev-parse "refs/heads/$B")" == "$s0" ]] && quiet \
  && has "origin/$B" "$TMP/out" || { say "unpushed: rc=$RC $(tr '\n' '|' < "$TMP/out")"; r=1; }
reset; spr; sync_at "$k1" "$m1"; echo dirty > "$CW/plain.txt"; run --sync 7
[[ $RC -eq 1 && "$(g rev-parse HEAD)" == "$k1" && "$(cat "$CW/plain.txt")" == dirty ]] && quiet && has 'uncommitted' "$TMP/out" \
  || { say "dirty: rc=$RC $(tr '\n' '|' < "$TMP/out")"; r=1; }
g checkout -q -- plain.txt
# a TERM after the merge, while a guard runs: the branch goes back to the pushed tip, nothing pushed, the lock gone
# (plan review r1 #3), so the next --sync starts from the PR's head instead of refusing an unpushed one
reset; spr; sync_at "$k1" "$m1"; nap="$TMP/nap"; rm -f "$nap"
(cd "$ROOT" && SMOKE_LOG="$LOG" SMOKE_FIX="$FIX" SMOKE_NAP="$nap" PATH="$TMP/bin:$PATH" GIT_DIR="$REPO/.git" \
  RUNNER_RUNS="$RUNS" exec env "${IDENT[@]}" "$SRC" --sync 7) > "$TMP/out" 2>&1 &
bg=$!; i=0; while [[ ! -e "$nap" && $i -lt 40 ]]; do sleep 0.5; i=$((i + 1)); done
kill -TERM "$bg" 2>/dev/null; wait "$bg"; RC=$?
[[ -e "$nap" && $RC -eq 143 && ! -e "$RUNS/7/lock" ]] && same "$k1" && quiet \
  || { say "TERM: rc=$RC nap=$([[ -e "$nap" ]] && echo y) HEAD=$(g rev-parse --short HEAD) $(tr '\n' '|' < "$TMP/out")"; r=1; }
# a TERM while the push runs, after origin took it (the bare origin's post-receive naps): the landed merge stays, local
# and origin's branch equal, so the next --sync finds the PR level (plan review r2 #1)
printf '#!/bin/bash\n[[ -z "${SMOKE_PUSHNAP:-}" ]] || { : > "$SMOKE_PUSHNAP"; sleep 3; }\n' > "$ORIGIN/hooks/post-receive"
chmod +x "$ORIGIN/hooks/post-receive"
reset; spr; sync_at "$k1" "$m1"; rm -f "$nap"
(cd "$ROOT" && SMOKE_LOG="$LOG" SMOKE_FIX="$FIX" SMOKE_PUSHNAP="$nap" PATH="$TMP/bin:$PATH" GIT_DIR="$REPO/.git" \
  RUNNER_RUNS="$RUNS" exec env "${IDENT[@]}" "$SRC" --sync 7) > "$TMP/out" 2>&1 &
bg=$!; i=0; while [[ ! -e "$nap" && $i -lt 40 ]]; do sleep 0.5; i=$((i + 1)); done
kill -TERM "$bg" 2>/dev/null; wait "$bg"; RC=$?
new="$(g rev-parse HEAD)"
[[ -e "$nap" && $RC -eq 143 && ! -e "$RUNS/7/lock" && "$(g rev-parse HEAD^1) $(g rev-parse HEAD^2)" == "$k1 $m1" ]] \
  && [[ "$(git -C "$ORIGIN" rev-parse "refs/heads/$B")" == "$new" ]] \
  || { say "TERM in push: rc=$RC nap=$([[ -e "$nap" ]] && echo y) HEAD=$(g rev-parse --short HEAD) origin=$(git -C "$ORIGIN" rev-parse --short "refs/heads/$B")"; r=1; }
rm -f "$ORIGIN/hooks/post-receive"
# a push origin rejects (its pre-receive exits 1): the merge goes, the branch is back at the tip, nothing is posted, and
# the next --sync syncs instead of refusing an unpushed tip (review pass 1 #1)
printf '#!/bin/bash\n[[ -z "${SMOKE_REJECT:-}" ]]\n' > "$ORIGIN/hooks/pre-receive"; chmod +x "$ORIGIN/hooks/pre-receive"
reset; spr; sync_at "$k1" "$m1"; SMOKE_REJECT=1 run --sync 7
refuse push "$k1" 'pr-step.sh push failed'
run --sync 7
[[ $RC -eq 0 && "$(g rev-parse HEAD^1) $(g rev-parse HEAD^2)" == "$k1 $m1" ]] \
  && [[ "$(git -C "$ORIGIN" rev-parse "refs/heads/$B")" == "$(g rev-parse HEAD)" ]] \
  || { say "after the rejected push: rc=$RC $(tr '\n' '|' < "$TMP/out")"; r=1; }
rm -f "$ORIGIN/hooks/pre-receive"
reset; spr; sync_at "$k1" "$m1"; issue 8 B1.45; run --sync 8
[[ $RC -eq 1 ]] && quiet && has 'no worktree' "$TMP/out" && same "$k1" || { say "no worktree: rc=$RC $(tr '\n' '|' < "$TMP/out")"; r=1; }
reset; spr; sync_at "$k1" "$m1"; sleep 30 & live=$!; mkdir -p "$RUNS/7/lock"; echo "$live" > "$RUNS/7/lock/pid"; run --sync 7
refuse lock "$k1" 'locked'
[[ -d "$RUNS/7/lock" ]] || { say "lock: the live lock was removed"; r=1; }
kill "$live" 2>/dev/null; wait "$live" 2>/dev/null
printf '[user]\n\tname = \n' > "$TMP/noident"
reset; spr; sync_at "$k1" "$m1"; GITCFG="$TMP/noident" run --sync 7
refuse identity "$k1" 'no git identity'
reset; spr; sync_at "$k1" "$m1"; at "$s0" "$m1"; run --sync 7
refuse behind "$k1" 'behind origin/main by 1 commit'
for a in "" "7 8" "x"; do
  reset; run --sync $a
  [[ $RC -eq 1 ]] && has 'usage:' "$TMP/out" && has '--sync <issue>' "$TMP/out" && quiet \
    || { say "argv '$a': rc=$RC $(tr '\n' '|' < "$TMP/out")"; r=1; }
done
[[ $r -eq 0 ]] && ok R22 || fail R22
git -C "$REPO" worktree remove --force "$CW"; at "$b0" "$b0"

echo
if [[ $fails -eq 0 ]]; then echo "$oks probes OK"; exit 0; fi
echo "$fails of $((oks + fails)) probes FAILED"; exit 1
