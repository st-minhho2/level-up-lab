#!/usr/bin/env bash
# Stop hook. If src/, e2e/ or prisma/ changed since the last recorded test run, block the stop once with a
# reminder so the agent runs the suite before ending the task. stop_hook_active prevents a loop.
set -uo pipefail
. "$(dirname "$0")/lib.sh"
[[ "$(json_field stop_hook_active)" == "true" ]] && exit 0
ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$ROOT" || exit 0
changed="$(git status --porcelain -- src e2e prisma 2>/dev/null | head -20)"
[[ -z "$changed" ]] && exit 0
MARK="$ROOT/node_modules/.cache/level-up-lab/last-test-run"
if [[ -f "$MARK" ]]; then
  newer="$(find src e2e prisma -type f -newer "$MARK" 2>/dev/null | head -1)"
  [[ -z "$newer" ]] && exit 0
fi
cat <<JSON
{"decision":"block","reason":"Source files under src/, e2e/ or prisma/ changed since the last test run. Run pnpm lint && pnpm typecheck && pnpm test (and pnpm test:e2e if a page, action or migration changed), fix what fails, then stop."}
JSON
exit 0
