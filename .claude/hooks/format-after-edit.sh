#!/usr/bin/env bash
# PostToolUse hook for Edit|Write|MultiEdit. Prettier, then eslint --fix on TS/JS, so the agent never commits
# something lefthook would reject. Never fails the tool call.
set -uo pipefail
. "$(dirname "$0")/lib.sh"
FILE="$(json_field tool_input.file_path)"
[[ -z "$FILE" || ! -f "$FILE" ]] && exit 0
ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
case "$FILE" in "$ROOT"/*) ;; *) exit 0 ;; esac
cd "$ROOT" || exit 0
case "$FILE" in
  *.ts|*.tsx|*.mts|*.mjs|*.js|*.cjs)
    pnpm exec prettier --write --log-level warn "$FILE" >/dev/null 2>&1 || true
    pnpm exec eslint --fix --no-warn-ignored "$FILE" >/dev/null 2>&1 || true ;;
  *.json|*.md|*.yml|*.yaml|*.css)
    pnpm exec prettier --write --log-level warn "$FILE" >/dev/null 2>&1 || true ;;
esac
exit 0
