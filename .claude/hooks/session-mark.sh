#!/usr/bin/env bash
# SessionStart hook (startup, resume, clear, compact). Records that this Claude Code session loaded the repo's
# .claude/settings.json, so scripts/require-hooks.sh can refuse work from a session that did not (one opened from a
# parent folder loads no project hooks at all, so this never runs there). Two records, either one is enough:
#   marker  <git-common-dir>/claude-hooks/<session_id>   shared by every worktree; seen by subagents' Bash too
#   env     export LEVEL_UP_LAB_HOOKS=<project dir> into CLAUDE_ENV_FILE (sourced before each Bash command)
# Markers older than 14 days are removed. Never blocks: exit 0 always.
set -uo pipefail
. "$(dirname "$0")/lib.sh"
dir="${CLAUDE_PROJECT_DIR:-$PWD}"
sid="${CLAUDE_CODE_SESSION_ID:-$(json_field session_id)}"
common="$(git -C "$dir" rev-parse --path-format=absolute --git-common-dir 2>/dev/null || true)"
if [[ -n "$sid" && -n "$common" ]]; then
  mkdir -p "$common/claude-hooks" && : > "$common/claude-hooks/$sid"
  find "$common/claude-hooks" -type f -mtime +14 -delete 2>/dev/null || true
fi
[[ -n "${CLAUDE_ENV_FILE:-}" ]] && printf 'export LEVEL_UP_LAB_HOOKS=%q\n' "$dir" >> "$CLAUDE_ENV_FILE"
exit 0
