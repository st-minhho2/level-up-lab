#!/usr/bin/env bash
# Remove worktrees under .worktrees/ whose branch is merged into the base branch: drop their Postgres schema,
# remove the worktree directory (caches, uploads and .env go with it) and delete the local branch.
#
# PRs are squash-merged, so a merged branch is rarely an ancestor of the base. A branch counts as merged when any
# of these holds (first match wins, printed as the reason):
#   ancestor  the branch tip is reachable from the base (fast-forward or merge commit)
#   pr #<n>   a merged PR into the base has this branch as head at exactly the current tip (needs gh; skipped if
#             gh is missing or offline, so commits pushed after the merge keep the worktree)
#   tree      merging the branch into the base changes nothing (its diff is already in the base)
#   cherry    every commit on the branch has a patch-equivalent commit in the base (git cherry)
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

# Prints why <branch> counts as merged into $BASE and returns 0, or returns 1.
merged_reason() {
  local branch="$1" tip pr tree cherry
  tip="$(git rev-parse "refs/heads/$branch")"
  if git merge-base --is-ancestor "$tip" "$BASE"; then echo "ancestor"; return 0; fi
  if command -v gh >/dev/null 2>&1; then
    pr="$(gh pr list --state merged --base "$BASE" --head "$branch" --json number,headRefOid \
      --jq ".[] | select(.headRefOid == \"$tip\") | .number" 2>/dev/null | head -1 || true)"
    if [[ -n "$pr" ]]; then echo "pr #$pr"; return 0; fi
  fi
  # merge-tree --write-tree (git >= 2.38) exits non-zero on conflict or when unsupported: not merged by this test.
  tree="$(git merge-tree --write-tree "$BASE" "$tip" 2>/dev/null | head -1 || true)"
  if [[ -n "$tree" && "$tree" == "$(git rev-parse "$BASE^{tree}")" ]]; then echo "tree"; return 0; fi
  cherry="$(git cherry "$BASE" "$tip" 2>/dev/null || true)"
  if [[ -n "$cherry" ]] && ! printf '%s\n' "$cherry" | grep -q '^+'; then echo "cherry"; return 0; fi
  return 1
}

pruned=0; wt_path=""; wt_branch=""
while IFS= read -r line; do
  case "$line" in
    worktree\ *) wt_path="${line#worktree }" ;;
    branch\ *) wt_branch="${line#branch refs/heads/}" ;;
    "")
      if [[ -n "$wt_path" && "$wt_path" == "$ROOT/.worktrees/"* && -n "$wt_branch" ]]; then
        merged=0; reason=""
        reason="$(merged_reason "$wt_branch")" && merged=1
        if [[ $merged -eq 1 || $ALL -eq 1 ]]; then
          if [[ $merged -eq 0 ]]; then
            read -r -p "  $wt_branch is NOT merged into $BASE. Remove anyway? [y/N] " answer </dev/tty
            [[ "$answer" == [yY] ]] || { wt_path=""; wt_branch=""; continue; }
          fi
          echo "[prune] $wt_branch  (${reason:-not merged}; $wt_path)"
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
