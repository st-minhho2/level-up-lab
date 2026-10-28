#!/usr/bin/env bash
# Remove worktrees under .worktrees/ whose branch is merged into the base branch: drop their Postgres schema,
# remove the worktree directory (caches, uploads and .env go with it) and delete the local branch.
#
#   scripts/worktree-prune.sh [--dry-run] [--base main] [--all]
#     --dry-run  print what would happen
#     --all      also offer unmerged worktrees (asks per worktree)
set -euo pipefail

DRY=0; ALL=0; BASE="main"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY=1 ;;
    --all) ALL=1 ;;
    --base) BASE="$2"; shift ;;
    *) echo "unknown argument: $1" >&2; exit 1 ;;
  esac
  shift
done

ROOT="$(git rev-parse --show-toplevel)"
run() { if [[ $DRY -eq 1 ]]; then echo "  [dry-run] $*"; else "$@"; fi; }

drop_schema() {
  local schema="$1"
  if [[ -n "$(docker compose -f "$ROOT/docker-compose.yml" ps -q --status running postgres 2>/dev/null)" ]]; then
    run docker compose -f "$ROOT/docker-compose.yml" exec -T postgres \
      psql -q -U postgres -d level_up_lab -v ON_ERROR_STOP=1 -c "DROP SCHEMA IF EXISTS \"$schema\" CASCADE;" \
      && [[ $DRY -eq 1 ]] || echo "  schema $schema dropped"
  else
    echo "  postgres not running; schema $schema left in place"
  fi
}

pruned=0; wt_path=""; wt_branch=""
while IFS= read -r line; do
  case "$line" in
    worktree\ *) wt_path="${line#worktree }" ;;
    branch\ *) wt_branch="${line#branch refs/heads/}" ;;
    "")
      if [[ -n "$wt_path" && "$wt_path" == "$ROOT/.worktrees/"* && -n "$wt_branch" ]]; then
        merged=0
        git branch --merged "$BASE" --format='%(refname:short)' | grep -qx "$wt_branch" && merged=1
        if [[ $merged -eq 1 || $ALL -eq 1 ]]; then
          if [[ $merged -eq 0 ]]; then
            read -r -p "  $wt_branch is NOT merged into $BASE. Remove anyway? [y/N] " answer </dev/tty
            [[ "$answer" == [yY] ]] || { wt_path=""; wt_branch=""; continue; }
          fi
          echo "[prune] $wt_branch  ($wt_path)"
          schema=""
          [[ -f "$wt_path/.worktree.env" ]] && schema="$(grep '^WORKTREE_SCHEMA=' "$wt_path/.worktree.env" | cut -d= -f2-)"
          [[ -n "$schema" ]] && drop_schema "$schema"
          run git worktree remove --force "$wt_path"
          run git branch -D "$wt_branch"
          pruned=$((pruned + 1))
        else
          echo "[keep]  $wt_branch not merged into $BASE  ($wt_path)"
        fi
      fi
      wt_path=""; wt_branch=""
      ;;
  esac
done < <(git worktree list --porcelain; echo)

run git worktree prune
echo "[prune] done: $pruned worktree(s) removed"
