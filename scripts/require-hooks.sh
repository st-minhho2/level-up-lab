#!/usr/bin/env bash
# Refuses to go on inside a Claude Code session that did not load this repo's .claude/settings.json hooks
# (guard-bash, guard-read, the review gate, the deny list). Such a session was opened from a parent folder: Claude
# Code reads hooks from the launch directory's .claude/ only, with no parent-directory fallback.
# Run by the Lefthook pre-commit job and by scripts/worktree.sh. Outside Claude Code (a person's terminal, CI) it
# always passes; inside, it passes when .claude/hooks/session-mark.sh ran for this session.
#   scripts/require-hooks.sh        exit 0 ok, exit 1 hooks not loaded
set -euo pipefail
[[ "${CLAUDE_CODE_CHILD_SESSION:-}" == "1" ]] || exit 0
[[ -n "${LEVEL_UP_LAB_HOOKS:-}" ]] && exit 0
common="$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null || true)"
sid="${CLAUDE_CODE_SESSION_ID:-}"
[[ -n "$sid" && -n "$common" && -f "$common/claude-hooks/$sid" ]] && exit 0
root="$(cd "${common:-.}/.." 2>/dev/null && pwd || echo '<repo root>')"
cat >&2 <<MSG
[require-hooks] This Claude Code session did not load level-up-lab's hooks (.claude/settings.json): no guard-bash,
guard-read, review gate or deny list is active. It was opened from a folder other than the repo root.
Start a new session in the repo root (or a worktree under .worktrees/) and run this there:
  cd "$root" && claude
MSG
exit 1
