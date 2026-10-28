#!/usr/bin/env bash
# PreToolUse hook for Edit|Write|MultiEdit, declared in a subagent's frontmatter with the paths that role may
# touch. Patterns are bash globs matched against the repo-relative path (`*` crosses `/`); a leading `!` denies.
#   path-guard.sh 'backlog/work/*'                    # advisor
#   path-guard.sh '*.test.ts' '*.test.tsx' 'e2e/*'    # test-writer
#   path-guard.sh 'src/*' 'prisma/*' 'spec/features-map.md' '!*.test.ts' '!*.test.tsx' '!e2e/*'   # code-writer
# Resolves `..` and symlinks first, so a role cannot escape through a relative path.
set -uo pipefail
. "$(dirname "$0")/lib.sh"
FILE="$(json_field tool_input.file_path)"
[[ -z "$FILE" ]] && exit 0
ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
case "$FILE" in /*) ABS="$FILE" ;; *) ABS="$ROOT/$FILE" ;; esac
DIR="$(dirname "$ABS")"; BASE="$(basename "$ABS")"
if [[ -d "$DIR" ]]; then ABS="$(cd "$DIR" && pwd -P)/$BASE"; fi
ROOT_REAL="$(cd "$ROOT" && pwd -P)"
REL="${ABS#"$ROOT_REAL"/}"
if [[ "$REL" == .worktrees/*/* ]]; then REL="${REL#.worktrees/*/}"; fi
[[ "$REL" == "$ABS" ]] && block "path-guard.sh" "'$FILE' is outside the project. Report back to the orchestrator instead of editing it."

allowed=0
for pattern in "$@"; do
  case "$pattern" in
    !*) [[ "$REL" == ${pattern#!} ]] && block "path-guard.sh" "'$REL' is denied for this role (pattern ${pattern#!}). Report back to the orchestrator instead of editing it." ;;
    *)  [[ "$REL" == $pattern ]] && allowed=1 ;;
  esac
done
[[ $allowed -eq 1 ]] || block "path-guard.sh" "'$REL' is outside this role's paths ($*). Report back to the orchestrator instead of editing it."
exit 0
