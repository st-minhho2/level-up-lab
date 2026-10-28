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

echo; [[ $fail -eq 0 ]] && echo "hook-smoke: $n probes OK" || { echo "hook-smoke: FAILURES above"; exit 1; }
