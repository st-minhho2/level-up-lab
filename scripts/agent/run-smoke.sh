#!/usr/bin/env bash
# Probes R1–R16 of scripts/agent/run.sh (B1.44) offline: a `claude` shim that replays fixture stream-json, a `gh` shim
# that applies run.sh's own --jq to fixture JSON (real jq), and fakes for the eligibility, claim and worktree seams.
#   scripts/agent/run-smoke.sh
#   R1 not logged in            R2 unverified version          R3 ineligible issue        R4 three agent branches in flight
#   R5 live and stale lock      R6 exact argv, env, stdin, branch, bypass only in mode()  R7 one log per run
#   R8 tools-mismatch kill      R9 user settings in the run    R10 one retry on error     R11 limits not retried
#   R12 gate comment with tier  R13 --poll order and skips     R14 --check-binary
#   R15 --mode on the host is dontAsk, whatever uname, curl or the environment say (B1.58)
#   R16 the exact prompt: Loop 5's D-27 path at the plan gate, no unconditional gate stop (B1.65)
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
f="$SMOKE_FIX/stream-$n.jsonl"; [[ -f "$f" ]] || f="$SMOKE_FIX/stream.jsonl"
while IFS= read -r l; do
  case "$l" in
    SLEEP) echo $$ > "$SMOKE_FIX/claude.pid"; sleep 30 & wait $! ;;
    WRITE:*) mkdir -p "$(dirname "${l#WRITE:}")"; echo probe > "${l#WRITE:}" ;;
    *) echo "$l" ;;
  esac
done < "$f"
exit 0
SHIM
cat > "$TMP/bin/gh" <<'SHIM'
#!/bin/bash
echo "GH cwd=$(pwd -P) GH_REPO=${GH_REPO:-} $*" >> "$SMOKE_LOG"
jqf=""; prev=""; for a in "$@"; do [[ "$prev" == --jq ]] && jqf="$a"; prev="$a"; done
case "$1 $2" in
  "issue view") file="issue-$3.json" ;;
  "issue list") file=issues.json ;;
  "pr list") file=prs.json ;;
  "issue comment") { echo "=== #$3"; cat; } >> "$SMOKE_FIX/comments"; exit 0 ;;
  *) exit 9 ;;
esac
[[ -f "$SMOKE_FIX/$file" ]] || { echo "gh: Not Found (HTTP 404)" >&2; exit 1; }
jq -r "$jqf" "$SMOKE_FIX/$file"
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
prs() { local h out=""; for h in "$@"; do out="$out${out:+,}{\"headRefName\":\"$h\"}"; done; echo "[$out]" > "$FIX/prs.json"; }
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
    RUNNER_CLAIM="$TMP/bin/fake-claim" RUNNER_WORKTREE="$TMP/bin/fake-worktree" "$SRC" "$@") > "$TMP/out" 2>&1
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
  RUNNER_CLAIM="$TMP/bin/fake-claim" RUNNER_WORKTREE="$TMP/bin/fake-worktree" exec "$SRC" 7) > "$TMP/out" 2>&1 &
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
  RUNNER_CLAIM="$TMP/bin/fake-claim" RUNNER_WORKTREE="$TMP/bin/fake-worktree" exec "$SRC" --poll) > "$TMP/out" 2>&1 &
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
sed -n '2,16p' "$SRC" | grep -q 'Loop 5' || { say "the header names no Loop 5"; r=1; }
[[ $r -eq 0 ]] && ok R16 || fail R16

echo
if [[ $fails -eq 0 ]]; then echo "$oks probes OK"; exit 0; fi
echo "$fails of $((oks + fails)) probes FAILED"; exit 1
