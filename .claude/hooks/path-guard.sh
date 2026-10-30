#!/usr/bin/env bash
# PreToolUse hook for Edit|Write|MultiEdit, declared in a subagent's frontmatter with the paths that role may
# touch. Patterns are bash globs matched against the repo-relative path (`*` crosses `/`); a leading `!` denies.
#   path-guard.sh 'backlog/work/*'                    # advisor
#   path-guard.sh '*.test.ts' '*.test.tsx' 'e2e/*'    # test-writer
#   path-guard.sh 'src/*' 'prisma/*' 'spec/features-map.md' '!*.test.ts' '!*.test.tsx' '!e2e/*'   # code-writer
# Resolves `..` and symlinks first, so a role cannot escape through a relative path. "Repo-relative" means relative
# to the worktree that holds the file: CLAUDE_PROJECT_DIR can be the main checkout while the session writes into
# `.worktrees/<slug>/` (scripts/worktree.sh) or `.claude/worktrees/<name>/` (desktop app), nested or not.
set -uo pipefail
. "$(dirname "$0")/lib.sh"
FILE="$(json_field tool_input.file_path)"
[[ -z "$FILE" ]] && exit 0
ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
case "$FILE" in /*) ABS="$FILE" ;; *) ABS="$ROOT/$FILE" ;; esac
# Canonicalize through the nearest directory that exists; the part not created yet must not climb with `..`.
DIR="$(dirname "$ABS")"; TAIL="$(basename "$ABS")"
while [[ ! -d "$DIR" ]]; do TAIL="$(basename "$DIR")/$TAIL"; DIR="$(dirname "$DIR")"; done
case "/$TAIL/" in */../*) block "path-guard.sh" "'$FILE' climbs with '..' through a directory that does not exist. Report back to the orchestrator instead of editing it." ;; esac
DIR="$(cd "$DIR" && pwd -P)"; ABS="$DIR/$TAIL"
ROOT_REAL="$(cd "$ROOT" && pwd -P)"
[[ "$ABS" == "$ROOT_REAL"/* ]] || block "path-guard.sh" "'$FILE' is outside the project. Report back to the orchestrator instead of editing it."

common_dir() { # common_dir <dir>: the repository's shared .git directory, canonical; empty outside git
  local d; d="$(git -C "$1" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" || return 0
  [[ -d "$d" ]] && (cd "$d" && pwd -P)
}
# The worktree holding the file, accepted only when it lies inside the project and belongs to the same repository
# (a nested clone or a package with its own .git would otherwise reset the path to its own root).
TOP=""
if top="$(git -C "$DIR" rev-parse --show-toplevel 2>/dev/null)" && [[ -n "$top" && -d "$top" ]]; then
  top="$(cd "$top" && pwd -P)"; here="$(common_dir "$top")"; root_common="$(common_dir "$ROOT_REAL")"
  if [[ ( "$top" == "$ROOT_REAL" || "$top" == "$ROOT_REAL"/* ) && -n "$here" && "$here" == "$root_common" ]]; then TOP="$top"; fi
fi
if [[ -n "$TOP" ]]; then
  REL="${ABS#"$TOP"/}"
else # no git answer: strip worktree prefixes, any nesting (`.claude/worktrees/<a>/.worktrees/<b>/…`)
  REL="${ABS#"$ROOT_REAL"/}"
  while :; do
    case "$REL" in
      .worktrees/*/*) REL="${REL#.worktrees/*/}" ;;
      .claude/worktrees/*/*) REL="${REL#.claude/worktrees/*/}" ;;
      *) break ;;
    esac
  done
fi

allowed=0
for pattern in "$@"; do
  case "$pattern" in
    !*) [[ "$REL" == ${pattern#!} ]] && block "path-guard.sh" "'$REL' is denied for this role (pattern ${pattern#!}). Report back to the orchestrator instead of editing it." ;;
    *)  [[ "$REL" == $pattern ]] && allowed=1 ;;
  esac
done
[[ $allowed -eq 1 ]] || block "path-guard.sh" "'$REL' is outside this role's paths ($*). Report back to the orchestrator instead of editing it."
exit 0
