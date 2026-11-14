#!/usr/bin/env bash
# The agent runner (B1.44; D-26, D-27): runs dev-lead headless on an `agent-ready` issue's card, on the lead's machine
# with the lead's own Claude login, never on GitHub Actions. On the host the run is held by `--permission-mode
# dontAsk`, the allow list below and the repo's hooks, which is no sandbox. Inside the runner container
# (.devcontainer/runner/, B1.58) its firewall is the boundary and the run gets bypassPermissions; nowhere else (mode()).
# A reviewed low or medium plan of the issue proceeds (D-27, dev-lead Loop 5); a high-tier plan or a refusal stops at
# the gate.
#   scripts/agent/run.sh <issue>          run that issue now (a stopped mark from an earlier run is replaced)
#   scripts/agent/run.sh --poll           every open agent-ready issue, oldest first, skipping stopped and locked ones
#   scripts/agent/run.sh --sync <issue>   bring the issue's ready PR level with origin/main after a sibling's merge:
#                                         merge with this clone's attributes, table guards, push, comment; no claude
#                                         (B1.101: GitHub's merge ignores `merge=union`); refusals name the full run
#   scripts/agent/run.sh --check-binary   prove dev-lead's frontmatter hooks fire under this claude; record its version
#   scripts/agent/run.sh --mode           print the permission mode a run here would get (bypassPermissions | dontAsk)
#   exit 0 ran to an end, or skipped with the reason · 1 refused (stderr "[run] <why>")
# Each run: a git identity (B1.69) → auth status → a verified version → per issue, this checkout's HEAD not behind a
# just-fetched origin/main (B1.95) → eligible.sh → under 3 agent branches in flight → a per-issue lock →
# next-task.sh --claim → worktree.sh <chore|feat>/<card>-agent → claude -p with the outcome read from the stream's last
# line (is_error, then subtype; one retry on an error) → a comment on the issue → runs/<issue>/stopped.
# Logs: $RUNNER_RUNS/<issue>/<UTC timestamp>-<pid>.jsonl, .err (line 1: --version), .exit. Each claude -p gets a TMPDIR
# of its own, a mktemp -d under /tmp removed when it ends (B1.88). bash 3.2-safe; gh, git, jq.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd -P)"
cd "$ROOT" || exit 1
# a run's own Bash calls inherit RUNNER_CHILD (claude_run), so a run can never start another run, whatever the path
[[ -z "${RUNNER_CHILD:-}" ]] || { echo "[run] refused: inside a runner's run; a run never starts another run" >&2; exit 1; }
HOME_CHECKOUT="${ROOT%%/.worktrees/*}" # worktree.sh runs only from the checkout that holds .worktrees/ (live run 4)
RUNS="${RUNNER_RUNS:-$HOME/.level-up-lab/runs}"
MODEL="${RUNNER_MODEL:-claude-opus-5-5}"
TURNS="${RUNNER_MAX_TURNS:-150}"
BUDGET="${RUNNER_BUDGET_USD:-10}"
TURN_USD="${RUNNER_TURN_USD:-0.25}"
INIT_WAIT="${RUNNER_INIT_WAIT:-120}"
ELIGIBLE="${RUNNER_ELIGIBLE:-$ROOT/scripts/agent/eligible.sh}"
CLAIM="${RUNNER_CLAIM:-$ROOT/scripts/next-task.sh}"
WORKTREE="${RUNNER_WORKTREE:-$ROOT/scripts/worktree.sh}"
TIER="$ROOT/scripts/agent/tier.sh"
CAP=3
TOOLS=Read,Grep,Glob,Write,Edit,Bash,Agent,Skill
# Named scripts only: a pattern like scripts/* would also run a file the run wrote itself (review pass 1). This narrows
# what a run does by accident; it is no sandbox (a test the run writes still runs under pnpm test): that is B1.58.
ALLOW=(Read Grep Glob Write Edit Bash Agent Skill 'Bash(git *)' 'Bash(scripts/next-task.sh *)' 'Bash(scripts/worktree.sh *)'
  'Bash(scripts/verify-red.sh *)' 'Bash(scripts/card-status.sh *)' 'Bash(scripts/ci/*)' 'Bash(scripts/agent/tier.sh *)'
  'Bash(scripts/agent/eligible.sh *)' 'Bash(.claude/hooks/mark-reviewed.sh)' 'Bash(pnpm install --frozen-lockfile)'
  'Bash(pnpm lint*)' 'Bash(pnpm typecheck*)' 'Bash(pnpm test*)' 'Bash(pnpm build*)' 'Bash(pnpm exec prettier *)'
  'Bash(docker compose up -d)' 'Bash(gh pr edit *)' 'Bash(gh pr checks *)' 'Bash(gh pr view *)')
DENY=('Bash(scripts/agent/run.sh*)' 'Bash(git -c*)' 'Bash(git * -c *)' 'Bash(git config*)') # no nested run, no git alias
EXPECT="$TOOLS" # the init line's tools may hold only these (claude_run's check; --check-binary narrows it)

say() { echo "[run] $*" >&2; }
die() { say "$*"; exit 1; }
gh_() { env -u GH_REPO -u GH_HOST gh "$@" </dev/null; }
child() { env -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT -u CLAUDE_CODE_SESSION_ID "$CLAUDE" "$@"; }
USAGE="usage: scripts/agent/run.sh <issue> | --poll | --sync <issue> | --check-binary | --mode"

sandboxed() { # the runner container (B1.58): Linux, not root, the image's marker, and a network that refuses
  # example.com but reaches GitHub. On the host one of them fails, and no variable or flag can stand in for any of them.
  [[ "$(uname -s)" == Linux && "$(id -u)" != 0 && -e /etc/level-up-lab-runner ]] || return 1
  ! curl -sS -o /dev/null --max-time 5 https://example.com </dev/null 2>/dev/null \
    && curl -sS -o /dev/null --max-time 5 https://api.github.com </dev/null 2>/dev/null
}
mode() { # the permission mode of a run here
  if sandboxed; then echo bypassPermissions; else echo dontAsk; fi
}
if [[ "${1:-}" == --mode ]]; then # needs no claude binary and no login: it only reads where it runs
  [[ $# -eq 1 ]] || die "$USAGE"
  mode; exit 0
fi

default_claude() { # the newest macOS app build on the host, else claude on PATH (the devcontainer, B1.58)
  local base="$HOME/Library/Application Support/Claude/claude-code" bin v
  if [[ "$(uname -s)" == Darwin ]]; then
    for bin in "$base"/*/*/claude.app/Contents/MacOS/claude; do
      [[ -x "$bin" ]] || continue
      v="${bin#"$base"/}"; echo "${v%%/*} $bin"
    done | sort -t. -k1,1n -k2,2n -k3,3n | tail -1 | cut -d' ' -f2-
  else
    command -v claude
  fi
}
CLAUDE=""; VERSION=""
if [[ "${1:-}" != --sync ]]; then # --sync starts no claude, so it needs neither the binary nor the login (B1.101)
  CLAUDE="${RUNNER_CLAUDE:-$(default_claude)}"
  [[ -n "$CLAUDE" && -x "$CLAUDE" ]] || die "no claude binary: set RUNNER_CLAUDE"
  VERSION="$(child --version 2>/dev/null | head -1)"
fi

identity_problem() { # why git could not commit as a named identity, empty when user.name and user.email are both set
  local n e
  n="$(git config --get user.name 2>/dev/null)"; e="$(git config --get user.email 2>/dev/null)"
  [[ -n "${n//[[:space:]]/}" && -n "${e//[[:space:]]/}" ]] \
    || echo "no git identity: user.name or user.email is empty; set them once with the runner setup step 'git config --global user.name …' and 'user.email …' (header of .devcontainer/runner/docker-compose.yml, B1.69)"
}

preflight() { # a git identity, the lead's own login and a version whose hooks were proven (B1.42 spike: neither is given)
  # a run's first commit needs the identity, and the run may not set one (DENY), so check before any turn (B1.65 live
  # run 1); --check-binary commits nothing
  if [[ "${1:-}" != binary ]]; then
    local why
    why="$(identity_problem)"
    [[ -z "$why" ]] || die "$why"
  fi
  child auth status --json 2>/dev/null | jq -e '.loggedIn == true' >/dev/null \
    || die "claude is not logged in: run '$CLAUDE auth login' in a terminal (the desktop app's login never reaches a child claude)"
  [[ "${1:-}" == binary ]] && return 0
  grep -qxF -- "$VERSION" "$RUNS/verified-versions" 2>/dev/null \
    || die "claude '$VERSION' is not verified: run scripts/agent/run.sh --check-binary first"
}

behind_problem() { # why this checkout may not run an issue, empty when its HEAD is not behind a just-fetched
  # origin/main (B1.95): the run.sh running is this checkout's copy, and a stale one runs stale logic on a fresh card
  # worktree without a word (31 commits on 2026-11-13). It never updates itself: it is the script running. Parallel
  # runs share the clone, so a fetch that fails (another's ref lock) is tried 3 times before it refuses.
  # A HEAD that is also ahead (a card branch's own run.sh once main moved) lacks main's commits too: it refuses, and its
  # fix is a merge, since --ff-only cannot move it (plan r1).
  local err try=1 ahead n head main fix
  until err="$(GIT_TERMINAL_PROMPT=0 git fetch -q origin main 2>&1 </dev/null)"; do
    [[ $try -lt 3 ]] || { echo "git fetch origin failed, so origin/main is not known: $(grep -m1 . <<< "$err")"; return; }
    try=$((try + 1)); sleep 2
  done
  head="$(git rev-parse --short HEAD)" && main="$(git rev-parse --short origin/main)" \
    && read -r ahead n < <(git rev-list --left-right --count HEAD...origin/main) && [[ -n "$n" ]] \
    || { echo "no HEAD or origin/main to compare after git fetch"; return; }
  [[ $n -gt 0 ]] || return 0
  fix="merge --ff-only origin/main"
  [[ $ahead -eq 0 ]] || fix="merge origin/main (HEAD also has $ahead commit$([[ $ahead -eq 1 ]] || echo s) of its own)"
  echo "this checkout is behind origin/main by $n commit$([[ $n -eq 1 ]] || echo s) (HEAD $head, origin/main $main)," \
    "so the run.sh running is stale; fix: git -C $ROOT $fix, then rerun"
}

stamp_base() { # stamp_base <dir>: a fresh <UTC timestamp>-<pid> path, never one an earlier run used
  local b
  mkdir -p "$1"
  while :; do
    b="$1/$(date -u +%Y%m%dT%H%M%SZ)-$$"
    [[ -e "$b.jsonl" ]] || { echo "$b"; return; }
    sleep 1
  done
}

init_problem() { # init_problem <jsonl> <worktree>: why the run's init must stop it, empty when it may go on
  local f="$1" extra want got
  # 2.1.309's init names the Agent tool Task and does not list Skill (live run 4)
  extra="$(jq -r 'select(.type == "system" and .subtype == "init") | .tools[] | if . == "Task" then "Agent" else . end' "$f" 2>/dev/null \
    | grep -vxE "$(printf '%s' "$EXPECT,Grep,Glob" | tr ',' '|')" | tr '\n' ' ')"
  [[ -z "$extra" ]] || { echo "tools-mismatch: init tools outside --tools: $extra"; return; }
  # cc-plugin-*@builtin ship inside the binary (path "builtin") and load whatever the setting sources (live run 1)
  got="$(jq -r 'select(.type == "system" and .subtype == "init")
    | [(.plugins // [] | map(select(.path != "builtin")) | map(.name) | join(",")), (.mcp_servers // [] | length)] | @tsv' "$f" 2>/dev/null)"
  [[ "$got" == "	0" ]] || { echo "user-settings: plugins '${got%%	*}', ${got#*	} MCP servers loaded"; return; }
  want="$(jq '[.hooks.SessionStart[]?.hooks[]?] | length' "$2/.claude/settings.json" 2>/dev/null || echo 0)"
  got="$(jq -c 'select(.type == "system" and .subtype == "hook_started" and .hook_event == "SessionStart")' "$f" 2>/dev/null | grep -c .)"
  [[ $got -le $want ]] || echo "user-settings: $got SessionStart hooks, the project defines $want"
}

claude_run() { # claude_run <base> <worktree> <prompt> <args…>: one -p run; sets PROBLEM (init check), logs .err/.exit
  local base="$1" wt="$2" prompt="$3" pid i=0 t
  shift 3
  echo "$VERSION" > "$base.err"
  PROBLEM=""
  # the run's own TMPDIR (B1.88): guard-bash rule 6 lets the reviewer write only under one outside the worktree (B1.84);
  # the host's would be shared by parallel runs and the container has none. No run starts without it. Each step is
  # checked: `cd ""` succeeds where it stands, which would make the checkout the directory drop_tmp removes (plan r1).
  t="$(mktemp -d /tmp/level-up-lab-run.XXXXXX 2>> "$base.err")" && [[ -n "$t" && -d "$t" ]] \
    && t="$(cd "$t" && pwd -P)" && is_run_tmp "$t" \
    || { PROBLEM="no-tmpdir: mktemp -d under /tmp failed"; return; }
  RUN_TMP="$t"
  printf '%s\n' "$prompt" | (cd "$wt" && exec env -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT -u CLAUDE_CODE_SESSION_ID \
    RUNNER_CHILD=1 TMPDIR="$RUN_TMP" "$CLAUDE" "$@") > "$base.jsonl" 2>> "$base.err" &
  pid=$!; CHILD_PID=$pid
  while kill -0 "$pid" 2>/dev/null && ! grep -q '"subtype":"init"' "$base.jsonl" && [[ $i -lt $INIT_WAIT ]]; do
    sleep 1; i=$((i + 1))
  done
  if grep -q '"subtype":"init"' "$base.jsonl"; then
    PROBLEM="$(init_problem "$base.jsonl" "$wt")"
    [[ -z "$PROBLEM" ]] || kill "$pid" 2>/dev/null
  fi
  wait "$pid"; echo $? > "$base.exit"; CHILD_PID=""
  drop_tmp
}
is_run_tmp() { # is_run_tmp <path>: 0 for a name claude_run's mktemp makes, /tmp/level-up-lab-run.* (macOS: /private/tmp)
  [[ "${1##*/}" == level-up-lab-run.?* && ( "${1%/*}" == /tmp || "${1%/*}" == /private/tmp ) ]]
}
drop_tmp() { # remove claude_run's TMPDIR, and nothing that is not one
  ! is_run_tmp "$RUN_TMP" || rm -rf "$RUN_TMP"
  RUN_TMP=""
}

outcome() { # outcome <jsonl> <card>: gate | ready | ended | limit:<subtype> | error:<subtype>, from the last result line
  local last
  last="$(jq -c 'select(.type == "result")' "$1" 2>/dev/null | tail -1)"
  [[ -n "$last" ]] || { echo "error:no-result"; return; }
  if [[ "$(jq -r '.is_error' <<< "$last")" == true ]]; then
    case "$(jq -r '.subtype' <<< "$last")" in
      error_max_turns | error_max_budget_usd) echo "limit:$(jq -r '.subtype' <<< "$last")" ;;
      *) echo "error:$(jq -r '.subtype' <<< "$last")" ;;
    esac
    return
  fi
  case "$(jq -r '.result // ""' <<< "$last")" in
    *"Plan for $2 is ready"*) echo gate ;;
    *"PR for $2 is ready"*) echo ready ;;
    *) echo ended ;;
  esac
}

card_of() { # card_of <issue>: the issue form's "Card id" field
  gh_ issue view "$1" --json body --jq .body | awk '
    /^### / { f = ($0 ~ /^### Card id[[:space:]]*$/); next }
    f && NF { gsub(/[[:space:]]/, ""); print; exit }'
}
branch_of() { # chore/<card>-agent for a tooling card, feat/<card>-agent otherwise
  if CARD="$1" awk 'index($0, "### " ENVIRON["CARD"] " ") == 1 { getline; getline; print; exit }' backlog/plan/*.md \
    | grep -q '^_tooling'; then
    echo "chore/$1-agent"
  else
    echo "feat/$1-agent"
  fi
}
in_flight() { # in_flight <own branch>: the agent branches in flight, one per line, the issue's own excepted (B1.82):
  # an open PR's head, or a local branch not merged. Merged: its tip reached origin/main through a merge (an ancestor
  # off the first-parent line, where a run's branch sits before its first commit), or a PR of it merged (main squashes,
  # which leaves the tip outside origin/main; GitHub may have moved the head past the tip, as on #200), or one closed
  # at its tip (a commit after a close counts again). origin/main is as run_issue just fetched it (B1.95); gh failing
  # counts the branch.
  local b heads line
  line="$(git rev-list --first-parent origin/main 2>/dev/null)"
  { gh_ pr list --state open --limit 100 --json headRefName --jq '.[].headRefName'
    git for-each-ref --format='%(refname:short)' refs/heads/ | grep -E '^[a-z]+/B[0-9]+\.[0-9]+-agent$' \
      | grep -vxF -- "$1" | while IFS= read -r b; do
        git merge-base --is-ancestor "$b" origin/main 2>/dev/null \
          && ! grep -qxF -- "$(git rev-parse "$b")" <<< "$line" && continue
        heads="$(gh_ pr list --head "$b" --state all --limit 100 --json state,headRefOid \
          --jq '.[] | select(.state == "MERGED" or .state == "CLOSED") | "\(.state) \(.headRefOid)"')"
        grep -qE '^MERGED ' <<< "$heads" && continue
        grep -qxF -- "CLOSED $(git rev-parse "$b")" <<< "$heads" && continue
        echo "$b"
      done; } \
    | grep -E '^[a-z]+/B[0-9]+\.[0-9]+-agent$' | grep -vxF -- "$1" | LC_ALL=C sort -u
}
lock() { # lock <dir>: 0 when this process holds <dir>/lock; a dead holder's lock is taken over
  local holder
  mkdir -p "$1"
  if ! mkdir "$1/lock" 2>/dev/null; then
    holder="$(cat "$1/lock/pid" 2>/dev/null)"
    if [[ -n "$holder" ]] && kill -0 "$holder" 2>/dev/null; then return 1; fi
    say "removing the stale lock of pid ${holder:-?} in $1"
    rm -rf "$1/lock"; mkdir "$1/lock" 2>/dev/null || return 1
  fi
  echo $$ > "$1/lock/pid"
}

comment() { # comment <issue> <outcome> <card> <branch> <worktree> <base> <detail>: fixed fields only, never agent text
  local n="$1" out="$2" card="$3" branch="$4" wt="$5" base="$6" detail="$7" tier=n/a sid denials
  [[ -f "$wt/backlog/work/$card/plan.md" ]] && tier="$("$TIER" "$wt/backlog/work/$card/plan.md" 2>/dev/null || echo unknown)"
  sid="$(jq -r 'select(.session_id) | .session_id' "$base.jsonl" 2>/dev/null | tail -1)"
  denials="$(jq -r 'select(.type == "result") | (.permission_denials // [] | length)' "$base.jsonl" 2>/dev/null | tail -1)"
  printf '%s\n' "Runner (\`scripts/agent/run.sh\`, B1.44): **${out%%:*}** for $card." "" \
    "- outcome: $out${detail:+ ($detail)}" "- tier: $tier" "- branch: \`$branch\`" "- session: \`${sid:-?}\`" \
    "- log: \`$(basename "$base").jsonl\` (runs/$n/ on the lead's machine)" "- permission denials: ${denials:-?}" \
    "- retry: \`scripts/agent/run.sh $n\`" | env -u GH_REPO -u GH_HOST gh issue comment "$n" --body-file - >/dev/null \
    || say "#$n: gh issue comment failed"
}

on_signal() { # on_signal <exit code>: stop the claude run (or --poll's issue subshell) before this process exits
  [[ -z "$CHILD_PID" ]] || kill -TERM "$CHILD_PID" 2>/dev/null
  drop_tmp # claude_run's TMPDIR (B1.88)
  # --check-binary's probe worktree, which worktree-prune.sh never lists (review pass 4, finding 2)
  [[ -z "$PROBE" ]] || { git worktree remove --force "$PROBE/wt" >/dev/null 2>&1; rm -rf "$PROBE"; }
  # --sync stopped after its merge: a merge the push did not land (git push moves origin/<branch> here only when it
  # did; bash runs this trap after the push returns) goes, so the branch is back at the PR's head and the next --sync
  # runs instead of refusing an unpushed tip; a landed one stays (B1.101 plan review r1 #3, r2 #1)
  [[ -z "${SYNC_PRE:-}" ]] || [[ "$(wgit rev-parse -q --verify "refs/remotes/origin/$SYNC_BRANCH")" == "$(wgit rev-parse HEAD)" ]] \
    || { wgit merge --abort >/dev/null 2>&1; wgit reset -q --keep "$SYNC_PRE"; }
  exit "$1"
}

run_issue() { # run_issue <issue>: 0 ran or skipped, 1 refused
  local n="$1" card branch wt base out attempt=1 prompt dir="$RUNS/$1" perm
  local why
  trap 'on_signal 143' TERM; trap 'on_signal 130' INT # --poll runs this in a subshell, which starts with default traps
  why="$(behind_problem)"
  [[ -z "$why" ]] || { say "refused #$n: $why"; return 1; }
  why="$("$ELIGIBLE" "$n" 2>&1 >/dev/null)" || { say "skip #$n: ${why:-not eligible}"; return 0; }
  card="$(card_of "$n")"
  [[ "$card" =~ ^B[0-9]+\.[0-9]+$ ]] || { say "skip #$n: no card id in the issue form (got '$card')"; return 0; }
  branch="$(branch_of "$card")"
  why="$(in_flight "$branch")"
  [[ $(grep -c . <<< "$why") -lt $CAP ]] \
    || { say "skip #$n: $(grep -c . <<< "$why") agent branches in flight (cap $CAP): $(tr '\n' ' ' <<< "$why" | sed 's/ $//')"; return 0; }
  lock "$dir" || { say "skip #$n: locked by a running pid"; return 0; }
  trap "rm -rf $(printf %q "$dir/lock")" EXIT
  wt="$(git worktree list --porcelain | awk -v b="branch refs/heads/$branch" '/^worktree /{w=substr($0, 10)} $0 == b {print w}')"
  if [[ -z "$wt" ]]; then
    "$CLAIM" --claim "$card" >&2 || { say "skip #$n: next-task.sh --claim $card refused"; rm -rf "$dir/lock"; return 0; }
    why="$(cd "$HOME_CHECKOUT" && "$WORKTREE" "$branch" 2>&1)"
    wt="$(printf '%s\n' "$why" | awk '$1 == "dir" { sub(/^[[:space:]]*dir[[:space:]]+/, ""); print; exit }')"
    [[ -d "$wt" ]] || { say "#$n: worktree.sh $branch made no worktree: $(printf '%s\n' "$why" | tail -2)"; rm -rf "$dir/lock"; return 1; }
  fi
  perm="$(mode)"
  prompt="Issue #$n is labeled agent-ready (D-27): run card $card as dev-lead: follow .claude/agents/dev-lead.md and .claude/skills/work-next/SKILL.md. The worktree $wt
on branch $branch is claimed and is yours; resume from the first Loop step whose artifact is missing. This run is
headless: nobody answers inside it. At the plan gate take dev-lead Loop 5's D-27 path: once the plan review says
Verdict: approved, a plan that scripts/agent/tier.sh rates low or medium, with scripts/agent/eligible.sh $n $card
exiting 0, gets the reviewer's D-27 approval line and the run goes on; at tier high or on a refusal print the gate
line and stop; a question only the lead can answer goes to backlog/README.md \"Waiting on human\", then stop."
  while :; do
    base="$(stamp_base "$dir")"
    claude_run "$base" "$wt" "$prompt" -p --agent dev-lead --model "$MODEL" --max-turns "$TURNS" \
      --max-budget-usd "$(awk -v b="$BUDGET" -v t="$TURN_USD" 'BEGIN { printf "%.2f", b - t }')" \
      --setting-sources project --strict-mcp-config --permission-mode "$perm" --include-hook-events \
      --output-format stream-json --verbose --tools "$TOOLS" --allowedTools "${ALLOW[@]}" --disallowedTools "${DENY[@]}"
    if [[ -n "$PROBLEM" ]]; then out="${PROBLEM%%:*}"; why="${PROBLEM#*: }"; else out="$(outcome "$base.jsonl" "$card")"; why=""; fi
    [[ "$out" == error:* && $attempt -eq 1 ]] || break
    say "#$n: $out, retrying once"; attempt=2
  done
  say "#$n $card: $out (log $base.jsonl)"
  comment "$n" "$out" "$card" "$branch" "$wt" "$base" "$why"
  echo "$out" > "$dir/stopped"
  rm -rf "$dir/lock"; trap - EXIT
}

wgit() { (cd "$SYNC_WT" && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git "$@"); } # git in the card's worktree
sync_issue() { # sync_issue <issue> (B1.101): bring a ready runner PR level with origin/main, without a claude run.
  # GitHub's merge ignores .gitattributes `merge=union`: after a sibling's merge it reported #300 and #302 CONFLICTING
  # where this clone's merge is clean (E7 batch 1), and the ruleset wants every PR up to date anyway. "Update branch" or
  # GitHub's conflict editor would be the lead's commit, which no-rework (D-29) counts; this merge carries
  # `Agent-Run: sync`. A conflict, a failing table guard or a failed push leaves the branch as it was and names the full
  # run, whose Loop 9 resolves and repairs. The PR stays ready: the ruleset holds the merge until CI is green.
  local n="$1" card branch wt pr why pre new main gd out dir="$RUNS/$1"
  why="$(identity_problem)"; [[ -z "$why" ]] || die "refused #$n: $why"
  why="$(behind_problem)"; [[ -z "$why" ]] || die "refused #$n: $why"
  card="$(card_of "$n")"
  [[ "$card" =~ ^B[0-9]+\.[0-9]+$ ]] || die "refused #$n: no card id in the issue form (got '$card')"
  branch="$(branch_of "$card")"
  wt="$(git worktree list --porcelain | awk -v b="branch refs/heads/$branch" '/^worktree /{w=substr($0, 10)} $0 == b {print w}')"
  [[ -n "$wt" && -d "$wt" ]] || die "refused #$n: no worktree holds $branch in this clone; --sync acts on a run's own worktree"
  pr="$(gh_ pr list --head "$branch" --state open --json number,isDraft --jq '.[] | "\(.number) \(.isDraft)"')" \
    || die "refused #$n: gh pr list failed"
  [[ $(grep -c . <<< "$pr") -eq 1 && "${pr#* }" == false ]] \
    || die "refused #$n: $branch has no open ready PR (got: $(tr '\n' ' ' <<< "${pr:-none}" | sed 's/ $//')); a draft goes on with scripts/agent/run.sh $n"
  pr="${pr%% *}"
  lock "$dir" || die "refused #$n: locked by a running pid (a run or a sync of this issue)"
  trap "rm -rf $(printf %q "$dir/lock")" EXIT
  SYNC_WT="$wt"
  [[ "$(wgit symbolic-ref -q --short HEAD)" == "$branch" ]] || die "refused #$n: $wt is not on $branch"
  [[ -z "$(wgit status --porcelain --untracked-files=no)" ]] \
    || die "refused #$n: uncommitted changes in $wt; commit them or run scripts/agent/run.sh $n"
  GIT_TERMINAL_PROMPT=0 wgit fetch -q origin "+refs/heads/$branch:refs/remotes/origin/$branch" </dev/null 2>/dev/null \
    || die "refused #$n: git fetch of $branch from origin failed"
  pre="$(wgit rev-parse HEAD)"; main="$(wgit rev-parse origin/main)"
  [[ "$pre" == "$(wgit rev-parse "origin/$branch")" ]] \
    || die "refused #$n: HEAD ${pre:0:7} is not origin/$branch $(wgit rev-parse --short "origin/$branch"); --sync brings the PR's own head level: run scripts/agent/run.sh $n"
  if wgit merge-base --is-ancestor "$main" "$pre"; then
    say "#$n $card: $branch already contains origin/main ${main:0:7}; nothing to do"
    rm -rf "$dir/lock"; trap - EXIT; return 0
  fi
  # this clone's .gitattributes apply (union on the three tables); RUNNER_CHILD makes lefthook's prepare-commit-msg
  # write the same trailer the message already holds (B1.57), so it is there with or without the hooks
  SYNC_BRANCH="$branch"; SYNC_PRE="$pre"
  if ! out="$(cd "$wt" && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE RUNNER_CHILD=sync git merge -q --no-ff \
    --no-edit -m "Merge remote-tracking branch 'origin/main' into $branch" -m "Agent-Run: sync" origin/main 2>&1 </dev/null)"; then
    why="$(wgit diff --name-only --diff-filter=U | tr '\n' ' ' | sed 's/ $//')"
    wgit merge --abort >/dev/null 2>&1 || wgit reset -q --merge "$pre"
    die "refused #$n: origin/main ${main:0:7} does not merge into $branch cleanly (conflict: ${why:-$(grep -m1 . <<< "$out")}); the branch is back at ${pre:0:7}: run scripts/agent/run.sh $n (Loop 9 resolves it)"
  fi
  for gd in check-spec-sections check-features-map check-backlog; do # the guards that name a union row kept twice
    out="$(cd "$wt" && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE "scripts/ci/$gd.sh" 2>&1 </dev/null)" && continue
    wgit reset -q --keep "$pre"
    die "refused #$n: after the merge scripts/ci/$gd.sh failed: $(grep -m1 . <<< "$out"); the branch is back at ${pre:0:7}: run scripts/agent/run.sh $n (Loop 9 repairs a section index row kept twice)"
  done
  new="$(wgit rev-parse HEAD)"
  out="$(cd "$wt" && "$ROOT/scripts/pr-step.sh" push 2>&1 </dev/null)" \
    || { wgit reset -q --keep "$pre"; die "refused #$n: scripts/pr-step.sh push failed: $(tail -1 <<< "$out"); the branch is back at ${pre:0:7}"; }
  SYNC_PRE=""
  printf '%s\n' "Runner (\`scripts/agent/run.sh\`, B1.44): **synced** for $card." "" "- outcome: synced" \
    "- branch: \`$branch\`" "- merged: origin/main ${main:0:7} into ${pre:0:7}, now ${new:0:7}" \
    "- PR: #$pr, mergeable once CI on ${new:0:7} is green" "- after the next merge: \`scripts/agent/run.sh --sync $n\`" \
    | env -u GH_REPO -u GH_HOST gh issue comment "$n" --body-file - >/dev/null || say "#$n: gh issue comment failed"
  say "#$n $card: synced $branch ${pre:0:7}..${new:0:7} (origin/main ${main:0:7}); PR #$pr is mergeable once CI on ${new:0:7} is green"
  rm -rf "$dir/lock"; trap - EXIT
}

check_binary() { # dev-lead's path-guard must block a write to spec/ under -p --agent dev-lead (B1.42 finding 8)
  local tmp base ok=0 perm
  perm="$(mode)" # the mode the runs here get, so the hook is proven under it
  # beside run_issue's worktrees, where live check 3 proved the hook; the trust itself is the main checkout's record
  # (2.1.303 skipped the frontmatter hook with none, B1.58 live check 1)
  mkdir -p "$HOME_CHECKOUT/.worktrees" || die "cannot create $HOME_CHECKOUT/.worktrees"
  tmp="$(mktemp -d "$HOME_CHECKOUT/.worktrees/check-binary-XXXXXX")" || die "mktemp failed"
  PROBE="$tmp"
  base="$(stamp_base "$RUNS/check-binary")"
  git worktree add -q --detach "$tmp/wt" HEAD >/dev/null 2>&1 || { rm -rf "$tmp"; die "git worktree add failed"; }
  EXPECT=Write
  # dev-lead knows spec/ is outside its paths and declines before any tool call (live run 2), so the prompt asks for
  # the call itself: only a call lets the hook show that it fires
  claude_run "$base" "$tmp/wt" "This is the runner's hook test (scripts/agent/run.sh --check-binary, B1.44), not a task: call the Write tool exactly once, with file_path spec/agent-probe.md and content probe. Your role's path-guard hook is expected to block it: a hook that blocks it is the pass, so make the call even though the path is outside your paths. Then stop without retrying." \
    -p --agent dev-lead --model "$MODEL" --max-turns 2 \
    --max-budget-usd "$(awk -v b="$BUDGET" -v t="$TURN_USD" 'BEGIN { printf "%.2f", b - t }')" \
    --setting-sources project --strict-mcp-config --permission-mode "$perm" --include-hook-events \
    --output-format stream-json --verbose --tools Write --allowedTools Write
  # any matching line, not jq -e: jq 1.6 (the runner image) takes -e's status from the last line (B1.58 live check 2)
  jq -c 'select(.type == "system" and .subtype == "hook_response" and .hook_event == "PreToolUse" and .exit_code == 2
    and ((.stderr // "") | startswith("BLOCKED by .claude/hooks/path-guard.sh")))' "$base.jsonl" 2>/dev/null \
    | grep -q . && ok=1
  [[ -e "$tmp/wt/spec/agent-probe.md" ]] && ok=0
  git worktree remove --force "$tmp/wt" >/dev/null 2>&1; rm -rf "$tmp"; PROBE=""
  [[ -z "$PROBLEM" ]] || die "claude '$VERSION': $PROBLEM (log $base.jsonl); not verified"
  [[ $ok -eq 1 ]] || die "claude '$VERSION': dev-lead's path-guard did not block the probe write (log $base.jsonl); not verified"
  echo "$VERSION" >> "$RUNS/verified-versions"
  say "claude '$VERSION' verified: dev-lead's frontmatter hook blocked the probe (log $base.jsonl)"
}

CHILD_PID=""
PROBE=""
RUN_TMP=""
trap 'on_signal 143' TERM
trap 'on_signal 130' INT
SYNC_WT=""
SYNC_PRE=""
SYNC_BRANCH=""
case "${1:-}" in
  --sync)
    [[ $# -eq 2 && "$2" =~ ^[1-9][0-9]*$ ]] || die "$USAGE"
    sync_issue "$2" ;;
  --check-binary)
    [[ $# -eq 1 ]] || die "$USAGE"
    preflight binary; check_binary ;;
  --poll)
    [[ $# -eq 1 ]] || die "$USAGE"
    preflight
    issues="$(gh_ issue list --label agent-ready --state open --limit 100 --json number --jq '.[].number' | sort -n)" \
      || die "gh issue list failed"
    for n in $issues; do
      [[ -e "$RUNS/$n/stopped" ]] && continue
      (run_issue "$n") & CHILD_PID=$!
      wait "$CHILD_PID" || say "#$n refused"
      CHILD_PID=""
    done ;;
  *)
    [[ $# -eq 1 && "$1" =~ ^[1-9][0-9]*$ ]] || die "$USAGE"
    preflight
    run_issue "$1" ;;
esac
