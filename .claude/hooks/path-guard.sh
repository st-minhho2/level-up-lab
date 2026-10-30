#!/usr/bin/env bash
# PreToolUse hook for Edit|Write|MultiEdit, declared in a subagent's frontmatter with the paths that role may
# touch. Patterns are bash globs matched against the repo-relative path (`*` crosses `/`); a leading `!` denies.
#   path-guard.sh 'backlog/work/*'                    # advisor
#   path-guard.sh '*.test.ts' '*.test.tsx' 'e2e/*'    # test-writer
#   path-guard.sh 'src/*' 'prisma/*' 'spec/features-map.md' '!*.test.ts' '!*.test.tsx' '!e2e/*'   # code-writer
# Resolves `..` and symlinks first, so a role cannot escape through a relative path. "Repo-relative" means relative
# to the worktree that holds the file (`repo_rel` in lib.sh).
set -uo pipefail
. "$(dirname "$0")/lib.sh"
FILE="$(json_field tool_input.file_path)"
[[ -z "$FILE" ]] && exit 0
repo_rel "$FILE"
case $? in
  1) block "path-guard.sh" "'$FILE' climbs with '..' through a directory that does not exist. Report back to the orchestrator instead of editing it." ;;
  2) block "path-guard.sh" "'$FILE' is outside the project. Report back to the orchestrator instead of editing it." ;;
esac

allowed=0
for pattern in "$@"; do
  case "$pattern" in
    !*) [[ "$REL" == ${pattern#!} ]] && block "path-guard.sh" "'$REL' is denied for this role (pattern ${pattern#!}). Report back to the orchestrator instead of editing it." ;;
    *)  [[ "$REL" == $pattern ]] && allowed=1 ;;
  esac
done
[[ $allowed -eq 1 ]] || block "path-guard.sh" "'$REL' is outside this role's paths ($*). Report back to the orchestrator instead of editing it."
exit 0
