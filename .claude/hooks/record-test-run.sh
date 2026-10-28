#!/usr/bin/env bash
# PostToolUse hook for Bash. When the command ran the test suite, record the time so stop-remind-tests.sh can
# tell whether source changed after the last run.
set -uo pipefail
. "$(dirname "$0")/lib.sh"
CMD="$(json_field tool_input.command)"
TEST_CMD='(pnpm|npx|pnpx)[[:space:]]+(run[[:space:]]+)?(test(:e2e|:coverage|:mutation)?|exec[[:space:]]+(vitest|playwright|stryker))|(^|[[:space:];&|])(vitest|playwright[[:space:]]+test|stryker[[:space:]]+run)'
[[ "$CMD" =~ $TEST_CMD ]] || exit 0
ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
mkdir -p "$ROOT/node_modules/.cache/level-up-lab" && touch "$ROOT/node_modules/.cache/level-up-lab/last-test-run"
exit 0
