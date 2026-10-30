# Shared by the hook scripts. Source only. Bash 3.2 compatible (macOS default); JSON parsed with node.
# Reads the hook payload from stdin once into HOOK_JSON and exposes json_field <dotted.path>.
HOOK_JSON="$(cat)"
json_field() {
  printf '%s' "$HOOK_JSON" | node -e '
    const path = process.argv[1].split(".");
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk)).on("end", () => {
      try {
        let value = JSON.parse(data);
        for (const key of path) value = value?.[key];
        process.stdout.write(value === undefined || value === null ? "" : String(value));
      } catch {
        process.stdout.write("");
      }
    });' "$1"
}
block() { # block <script-name> <reason>
  echo "BLOCKED by .claude/hooks/$1: $2" >&2
  exit 2
}
common_dir() { # common_dir <dir>: the repository's shared .git directory, canonical; empty outside git
  local d; d="$(git -C "$1" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" || return 0
  [[ -d "$d" ]] && (cd "$d" && pwd -P)
}
# repo_rel <file>: sets ABS (canonical), TOP (the worktree holding the file, empty when git has no answer) and REL
# (the path relative to that worktree). CLAUDE_PROJECT_DIR can be the main checkout while the write lands in
# `.worktrees/<slug>/` or `.claude/worktrees/<name>/`, nested or not. Returns 1 when a `..` climbs through a directory
# that does not exist yet, 2 when the file is outside the project.
repo_rel() {
  local root dir tail top here root_common
  root="${CLAUDE_PROJECT_DIR:-$PWD}"
  case "$1" in /*) ABS="$1" ;; *) ABS="$root/$1" ;; esac
  # Canonicalize through the nearest directory that exists; the part not created yet must not climb with `..`.
  dir="$(dirname "$ABS")"; tail="$(basename "$ABS")"
  while [[ ! -d "$dir" ]]; do tail="$(basename "$dir")/$tail"; dir="$(dirname "$dir")"; done
  case "/$tail/" in */../*) return 1 ;; esac
  dir="$(cd "$dir" && pwd -P)"; ABS="$dir/$tail"
  ROOT_REAL="$(cd "$root" && pwd -P)"
  [[ "$ABS" == "$ROOT_REAL"/* ]] || return 2
  # Accepted only inside the project and in the same repository (a nested clone or a package with its own .git
  # would otherwise reset the path to its own root).
  TOP=""
  if top="$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null)" && [[ -n "$top" && -d "$top" ]]; then
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
  return 0
}
