#!/usr/bin/env bash
# Runs the agent-hook probe table on this machine (bash 3.2 + BSD tools on macOS, bash 5 in CI/devcontainer).
# Exit 1 on any unexpected verdict. Add a row here whenever a hook gains a rule.
#   scripts/hook-smoke.sh
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
export CLAUDE_PROJECT_DIR="$PWD"
H=.claude/hooks; fail=0; n=0
probe() { # probe <expected-exit> <hook> <json> [hook args...]
  local want="$1" hook="$2" json="$3"; shift 3
  local out rc; out="$(printf '%s' "$json" | "$H/$hook" "$@" 2>&1)"; rc=$?; n=$((n+1))
  if [[ $rc -eq $want ]]; then printf 'ok   %s exit %s  %s\n' "$hook" "$rc" "$json"; else printf 'FAIL %s exit %s (want %s)  %s\n     %s\n' "$hook" "$rc" "$want" "$json" "$out"; fail=1; fi
}
bash_cmd() { printf '{"tool_input":{"command":"%s"}}' "$1"; }
read_path() { printf '{"tool_input":{"file_path":"%s"}}' "$1"; }

echo "== guard-bash.sh"
for c in 'rm -rf .next' 'rm -fr node_modules' 'rm -r -f dist' 'rm --recursive --force dist' 'pnpm build && sudo rm -Rf out' \
         'git push --force origin main' 'git push -f' 'git push origin +main' 'git push --force-with-lease' \
         'pnpm exec prisma migrate reset' 'npx prisma db push' \
         'DATABASE_URL=postgresql://u:p@db.prod.example.com:5432/x pnpm db:migrate' \
         'cat .env' 'cat .env.local' 'grep DATABASE .env' 'cat ~/.ssh/id_rsa' 'cat ~/.aws/credentials' \
         'echo $DATABASE_URL' 'printenv' 'env | grep -i key'; do probe 2 guard-bash.sh "$(bash_cmd "$c")"; done
for c in 'rm -r dist' 'rm -f src/old.ts' 'git push -u origin feat/x' 'pnpm db:migrate --name add-todos' \
         'DATABASE_URL=postgresql://postgres:postgres@localhost:5433/level_up_lab pnpm db:deploy' \
         'cat .env.example' 'cp .env.example .env' 'pnpm test' 'echo $PORT'; do probe 0 guard-bash.sh "$(bash_cmd "$c")"; done

echo "== guard-read.sh"
for f in /x/level-up-lab/.env /x/.env.production /Users/me/.ssh/id_ed25519; do probe 2 guard-read.sh "$(read_path "$f")"; done
for f in /x/level-up-lab/.env.example /x/level-up-lab/src/lib/env.ts; do probe 0 guard-read.sh "$(read_path "$f")"; done

echo "== path-guard.sh (role write scopes)"
TW=('*.test.ts' '*.test.tsx' 'e2e/*')
IM=('src/*' 'prisma/*' 'spec/features-map.md' 'docs/metrics.md' '!*.test.ts' '!*.test.tsx' '!e2e/*' '!src/lib/prisma.ts')
DOCS=('backlog/work/*')
probe 0 path-guard.sh "$(read_path "$PWD/src/lib/todos.test.ts")" "${TW[@]}"
probe 0 path-guard.sh "$(read_path "$PWD/e2e/x.spec.ts")" "${TW[@]}"
probe 2 path-guard.sh "$(read_path "$PWD/src/lib/todos.ts")" "${TW[@]}"
probe 0 path-guard.sh "$(read_path "$PWD/src/lib/todos.ts")" "${IM[@]}"
probe 2 path-guard.sh "$(read_path "$PWD/src/lib/todos.test.ts")" "${IM[@]}"
probe 2 path-guard.sh "$(read_path "$PWD/src/lib/prisma.ts")" "${IM[@]}"
probe 0 path-guard.sh "$(read_path "$PWD/backlog/work/B1.2/plan.md")" "${DOCS[@]}"
probe 2 path-guard.sh "$(read_path "$PWD/spec/contracts/04-edit-title.md")" "${DOCS[@]}"
probe 2 path-guard.sh "$(read_path "$PWD/backlog/work/../../src/lib/x.ts")" "${DOCS[@]}"
probe 2 path-guard.sh "$(read_path "/etc/hosts")" "${DOCS[@]}"

echo "== agent frontmatter (parses; each role's hook command, as the YAML yields it, reaches path-guard.sh)"
n=$((n+1)); if out="$(scripts/ci/check-agent-frontmatter.sh 2>&1)"; then echo "ok   $out"; else printf 'FAIL %s\n' "$out"; fail=1; fi
role_patterns() { # the patterns each role's path-guard.sh must receive, in order
  case "$1" in
    advisor) echo "backlog/work/*" ;;
    code-writer) echo "src/* prisma/* spec/features-map.md docs/metrics.md !*.test.ts !*.test.tsx !e2e/* !src/lib/prisma.ts" ;;
    dev-lead) echo "backlog/* docs/metrics.md docs/mistake-log.md !backlog/00-decisions.md" ;;
    reviewer) echo "backlog/work/*/review.md" ;;
    spec-analyst) echo "spec/contracts/* backlog/* !spec/features-map.md !backlog/00-decisions.md" ;;
    test-writer) echo "*.test.ts *.test.tsx e2e/*" ;;
  esac
}
role_probes() { # <exit> <path> pairs: one write the role may make, one it may not
  case "$1" in
    advisor) echo "0 backlog/work/B1.2/advice.md 2 src/lib/todos.ts" ;;
    code-writer) echo "0 src/lib/todos.ts 2 src/lib/todos.test.ts 2 e2e/x.spec.ts" ;;
    dev-lead) echo "0 backlog/work/B1.2/plan.md 2 src/lib/todos.ts 2 backlog/00-decisions.md" ;;
    reviewer) echo "0 backlog/work/B1.2/review.md 2 backlog/work/B1.2/plan.md" ;;
    spec-analyst) echo "0 spec/contracts/04-edit-title.md 2 src/lib/todos.ts 2 spec/features-map.md" ;;
    test-writer) echo "0 src/lib/todos.test.ts 0 e2e/x.spec.ts 2 src/lib/todos.ts" ;;
  esac
}
FAKE="$(mktemp -d)"; mkdir -p "$FAKE/.claude/hooks"
printf '#!/bin/sh\nprintf "%%s\\n" "$@"\n' > "$FAKE/.claude/hooks/path-guard.sh"; chmod +x "$FAKE/.claude/hooks/path-guard.sh"
roles=0
while IFS="$(printf '\t')" read -r role cmd; do
  roles=$((roles+1)); n=$((n+1)); want="$(role_patterns "$role")"
  got="$(printf '{}' | CLAUDE_PROJECT_DIR="$FAKE" sh -c "$cmd" | tr '\n' ' ')"; got="${got% }"
  if [[ -n "$want" && "$got" == "$want" ]]; then echo "ok   $role passes: $got"; else printf 'FAIL %s passes [%s] (want [%s])\n' "$role" "$got" "$want"; fail=1; fi
  set -- $(role_probes "$role")
  while [[ $# -ge 2 ]]; do
    n=$((n+1)); rc=0; printf '%s' "$(read_path "$PWD/$2")" | sh -c "$cmd" >/dev/null 2>&1 || rc=$?
    if [[ $rc -eq $1 ]]; then echo "ok   $role exit $rc  $2"; else echo "FAIL $role exit $rc (want $1)  $2"; fail=1; fi
    shift 2
  done
done <<EOF
$(scripts/ci/check-agent-frontmatter.sh --commands 2>/dev/null)
EOF
rm -rf "$FAKE"
n=$((n+1)); if [[ $roles -eq 6 ]]; then echo "ok   6 roles declare a path-guard.sh hook"; else echo "FAIL $roles roles declare a path-guard.sh hook (want 6)"; fail=1; fi

echo "== path-guard.sh per layout (main, .worktrees/<slug>, .claude/worktrees/<name>, nested) x role, with and without git"
# CLAUDE_PROJECT_DIR stays the main checkout while the write lands in a worktree: patterns must see the path
# relative to that worktree, and every refused write must stay refused.
ROLES='advisor code-writer dev-lead reviewer spec-analyst test-writer'
LAYOUTS='. .worktrees/s .claude/worktrees/n .claude/worktrees/n/.worktrees/b'
pg() { # pg <expected-exit> <project-dir> <file> <label> <patterns...>
  local want="$1" root="$2" file="$3" label="$4" rc; shift 4; n=$((n+1))
  read_path "$file" | CLAUDE_PROJECT_DIR="$root" "$H/path-guard.sh" "$@" >/dev/null 2>&1; rc=$?
  if [[ $rc -eq $want ]]; then echo "ok   path-guard exit $rc  $label"; else echo "FAIL path-guard exit $rc (want $want)  $label"; fail=1; fi
}
patterns_of() { set -f; pats=($(role_patterns "$1")); set +f; } # into pats, unglobbed
layout_probes() { # layout_probes <mode> <project-dir>: each role's allowed and refused writes in every layout
  local mode="$1" root="$2" lay role
  for lay in $LAYOUTS; do
    for role in $ROLES; do
      patterns_of "$role"; set -- $(role_probes "$role")
      while [[ $# -ge 2 ]]; do pg "$1" "$root" "$root/$lay/$2" "$mode $lay $role $2" "${pats[@]}"; shift 2; done
    done
    patterns_of test-writer
    pg 2 "$root" "$root/$lay/e2e/new/../../src/lib/x.ts" "$mode $lay test-writer climbs out of a new dir" "${pats[@]}"
  done
}
gs() { git -C "$1" -c core.hooksPath=/dev/null -c commit.gpgsign=false -c user.name=smoke -c user.email=smoke@localhost "${@:2}" >/dev/null 2>&1; }
REPO="$(mktemp -d)"; PLAIN="$(mktemp -d)"; OUTSIDE="$(mktemp -d)"
gs "$REPO" init -q && gs "$REPO" commit -q --allow-empty -m init
for lay in $LAYOUTS; do [[ "$lay" == . ]] || gs "$REPO" worktree add -q --detach "$REPO/$lay"; mkdir -p "$PLAIN/$lay"; done
n=$((n+1)); if [[ "$(git -C "$REPO" worktree list | wc -l | tr -d ' ')" == 4 ]]; then echo "ok   fixture repo has 4 worktrees"; else echo "FAIL fixture repo worktrees not created"; fail=1; fi
layout_probes git "$REPO"
layout_probes plain "$PLAIN"
patterns_of code-writer
mkdir -p "$REPO/vendor/other" && gs "$REPO/vendor/other" init -q
pg 2 "$REPO" "$REPO/vendor/other/src/a.ts" "git nested clone (own .git) is not a worktree root" "${pats[@]}"
gs "$REPO" worktree add -q --detach "$REPO/elsewhere/wt"
pg 0 "$REPO" "$REPO/elsewhere/wt/src/lib/todos.ts" "git worktree at a path no prefix rule knows" "${pats[@]}"
pg 2 "$REPO" "$REPO/elsewhere/wt/e2e/x.spec.ts" "git worktree at a path no prefix rule knows, refused" "${pats[@]}"
gs "$REPO" worktree add -q --detach "$OUTSIDE/wt"
pg 2 "$REPO" "$OUTSIDE/wt/src/a.ts" "git worktree of the project outside it" "${pats[@]}"
rm -rf "$REPO" "$PLAIN" "$OUTSIDE"

echo "== review gate (require-review.sh / mark-reviewed.sh)"
STATE="node_modules/.cache/level-up-lab"; saved=""; [[ -f "$STATE/reviewed" ]] && saved="$(cat "$STATE/reviewed")"
rm -f "$STATE/gate-warned"
out="$(printf '{"session_id":"smoke"}' | "$H/require-review.sh")"; n=$((n+1))
if git diff --quiet HEAD -- src e2e prisma && [[ -z "$(git ls-files --others --exclude-standard -- src e2e prisma)" ]]; then
  [[ -z "$out" ]] && echo "ok   require-review.sh silent on a clean tree" || { echo "FAIL require-review.sh spoke on a clean tree"; fail=1; }
else
  echo "skip require-review.sh (tree already has changes under src/e2e/prisma)"
fi
rm -f "$STATE/gate-warned"; [[ -n "$saved" ]] && printf '%s\n' "$saved" > "$STATE/reviewed"

echo "== wiring (every hook named in settings.json exists and is executable)"
for h in $(grep -o '\.claude/hooks/[a-z-]*\.sh' .claude/settings.json | sort -u); do
  n=$((n+1)); if [[ -x "$h" ]]; then echo "ok   wired $h"; else echo "FAIL wired $h missing or not executable"; fail=1; fi
done
n=$((n+1)); if grep -q 'SessionStart' .claude/settings.json && grep -q 'session-mark\.sh' .claude/settings.json; then
  echo "ok   SessionStart runs session-mark.sh"; else echo "FAIL SessionStart does not run session-mark.sh"; fail=1; fi

echo "== session-mark.sh / scripts/require-hooks.sh"
COMMON="$(git rev-parse --path-format=absolute --git-common-dir)"; SID="smoke-$$"; ENVF="$(mktemp)"
printf '{"session_id":"%s"}' "$SID" | env -u CLAUDE_CODE_SESSION_ID CLAUDE_ENV_FILE="$ENVF" CLAUDE_PROJECT_DIR="$PWD" "$H/session-mark.sh"; n=$((n+1))
if [[ -f "$COMMON/claude-hooks/$SID" ]] && grep -q '^export LEVEL_UP_LAB_HOOKS=' "$ENVF"; then
  echo "ok   session-mark.sh wrote the marker and the env export"; else echo "FAIL session-mark.sh wrote no marker or env export"; fail=1; fi
req() { # req <expected-exit> <label> <env assignments...>
  local want="$1" label="$2" rc; shift 2; n=$((n+1))
  env -u CLAUDE_CODE_CHILD_SESSION -u CLAUDE_CODE_SESSION_ID -u LEVEL_UP_LAB_HOOKS "$@" scripts/require-hooks.sh >/dev/null 2>&1; rc=$?
  if [[ $rc -eq $want ]]; then echo "ok   require-hooks exit $rc  $label"; else echo "FAIL require-hooks exit $rc (want $want)  $label"; fail=1; fi
}
req 0 'outside Claude Code'
req 1 'Claude Code, no marker, no env' CLAUDE_CODE_CHILD_SESSION=1 CLAUDE_CODE_SESSION_ID="none-$$"
req 0 'Claude Code, marker for this session' CLAUDE_CODE_CHILD_SESSION=1 CLAUDE_CODE_SESSION_ID="$SID"
req 0 'Claude Code, env from CLAUDE_ENV_FILE' CLAUDE_CODE_CHILD_SESSION=1 LEVEL_UP_LAB_HOOKS="$PWD"
rm -f "$COMMON/claude-hooks/$SID" "$ENVF"

echo; [[ $fail -eq 0 ]] && echo "hook-smoke: $n probes OK" || { echo "hook-smoke: FAILURES above"; exit 1; }
