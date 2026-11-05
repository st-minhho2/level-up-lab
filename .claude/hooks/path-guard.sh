#!/usr/bin/env bash
# PreToolUse hook for Edit|Write|MultiEdit, declared in a subagent's frontmatter with the paths that role may
# touch. Patterns are bash globs matched against the repo-relative path (`*` crosses `/`); a leading `!` denies.
#   path-guard.sh 'backlog/work/*'                    # advisor
#   path-guard.sh '*.test.ts' '*.test.tsx' 'e2e/*'    # test-writer
#   path-guard.sh 'src/*' 'prisma/*' 'spec/features-map.md' '!*.test.ts' '!*.test.tsx' '!e2e/*'   # code-writer
#   path-guard.sh --role dev-lead 'backlog/*' …        # dev-lead (B1.78)
# Resolves `..` and symlinks first, so a role cannot escape through a relative path. "Repo-relative" means relative
# to the worktree that holds the file (`repo_rel` in lib.sh).
# --role <owner>: under `claude -p --agent <owner>` the owner's frontmatter hook also fires for every subagent it
# dispatches (backlog/work/B1.78/probe.md), so a call whose agent_type names another agent gets that agent's own list,
# read from its frontmatter; an agent whose list cannot be read is refused. No agent_type, or the owner's: its globs.
set -uo pipefail
. "$(dirname "$0")/lib.sh"

# role_globs <agent>: ROLE_GLOBS from the one path-guard.sh command in .claude/agents/<agent>.md's frontmatter, read
# without eval: each glob must be a ''quoted'' YAML token. Returns 1 for anything else.
role_globs() {
  local name="$1" file lines line rest q="'" re="^ '([^']*)'(.*)$"
  ROLE_GLOBS=()
  [[ "$name" =~ ^[a-z][a-z0-9-]*$ ]] || return 1
  file="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/agents/$name.md"
  [[ -f "$file" ]] || return 1
  lines="$(awk 'NR == 1 { if ($0 != "---") exit; next } $0 == "---" { exit } { print }' "$file" \
    | grep -E '^[[:space:]]*command:.*hooks/path-guard\.sh')" || return 1
  [[ "$lines" != *$'\n'* ]] || return 1
  line="$(printf '%s' "$lines" | sed -E "s/^[[:space:]]*command: '(.*)'[[:space:]]*\$/\1/")"
  rest="${line//$q$q/$q}" # YAML '' is one ' (a literal \' would keep its backslash in bash 3.2)
  [[ "$line" != "$lines" && "$rest" == '"$CLAUDE_PROJECT_DIR/.claude/hooks/path-guard.sh" '* ]] || return 1
  rest="${rest#'"$CLAUDE_PROJECT_DIR/.claude/hooks/path-guard.sh"'}"
  while [[ -n "$rest" ]]; do
    [[ "$rest" =~ $re ]] || return 1
    [[ "${BASH_REMATCH[1]}" != --role ]] || return 1
    ROLE_GLOBS+=("${BASH_REMATCH[1]}"); rest="${BASH_REMATCH[2]}"
  done
  [[ ${#ROLE_GLOBS[@]} -gt 0 ]]
}

if [[ "${1:-}" == --role ]]; then
  [[ $# -ge 3 ]] || block "path-guard.sh" "--role needs an agent name and at least one pattern."
  OWNER="$2"; shift 2
  WHO="$(json_field agent_type)"
  if [[ -n "$WHO" && "$WHO" != "$OWNER" ]]; then
    role_globs "$WHO" || block "path-guard.sh" "agent '$WHO' has no path-guard.sh list readable from .claude/agents/$WHO.md. Report back to the orchestrator instead of editing it."
    set -- "${ROLE_GLOBS[@]}"
  fi
fi
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
