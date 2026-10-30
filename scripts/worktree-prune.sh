#!/usr/bin/env bash
# Remove worktrees made by scripts/worktree.sh whose branch is merged into the base branch: drop their Postgres
# schema, remove the worktree directory (caches, uploads and .env go with it) and delete the local branch.
#
# Which worktrees: every <checkout>/.worktrees/<slug> under the main checkout, whatever the checkout (the main one,
# a .claude/worktrees/<name> app checkout, …) and wherever this runs from. Never the main checkout, an app
# checkout, or the checkout this runs in. Compose always runs with the main checkout's file: a checkout whose own
# docker-compose.yml predates its `name: level-up-lab` (B1.15) or differs would name another project.
#
# The base is origin/<base> after `git fetch origin <base>` (the local <base> is never pulled in a worktree session);
# without an origin remote, the local <base>. PRs are squash-merged, so a merged branch is rarely an ancestor of the
# base. A branch counts as merged when any of these holds (first match wins, printed as the reason):
#   pr #<n>   a merged PR into the base has this branch as head at exactly the current tip (needs gh; skipped if
#             gh is missing or offline, so commits pushed after the merge keep the worktree)
#   tree      merging the branch into the base changes nothing (its diff is already in the base)
#   cherry    every commit on the branch has a patch-equivalent commit in the base (git cherry)
# A branch with no commits beyond the base is never merged by tree/cherry (it would match both): it is a worktree
# nobody has committed to yet and is kept unless gh shows a merged PR or --all is given. Nor is a branch whose
# commits net to no change (a commit and its revert: tip tree = merge-base tree), which tree would also match: its
# history never reached the base, so it is kept the same way.
#
# A worktree whose directory is already gone (app archive, rm, an outer worktree removed) loses its schema whatever
# its merge state: wt_<directory name>, worktree.sh's rule, since its .worktree.env went with it. `git worktree prune`
# drops its metadata; then its branch is deleted if merged.
#
# Every run then lists [orphan] wt_* schemas that no remaining worktree claims (its .worktree.env, else
# wt_<directory name>); only --schemas --drop drops them.
#
#   scripts/worktree-prune.sh [--dry-run] [--base main] [--all] [--no-fetch]
#   scripts/worktree-prune.sh --schemas [--drop] [--dry-run]
#     --dry-run   print what would happen
#     --base      branch name; origin/main is read as main
#     --all       also offer unmerged worktrees (asks per worktree; no terminal = no)
#     --no-fetch  compare with the last fetched origin/<base>
#     --schemas   list orphan wt_* schemas; touches no worktree or branch
#     --drop      with --schemas: drop the orphans (no prompt); with --dry-run nothing is dropped
#
# The worktree list is read on fd 3, and children that may read stdin (docker compose exec, gh) get </dev/null:
# one reading the loop's stdin would swallow the rest of the list and end the loop after the first prune.
set -euo pipefail

DRY=0; ALL=0; SCHEMAS=0; DROP=0; FETCH=1; BASE="main"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY=1 ;;
    --all) ALL=1 ;;
    --schemas) SCHEMAS=1 ;;
    --drop) DROP=1 ;;
    --no-fetch) FETCH=0 ;;
    --base) BASE="${2:?--base needs a branch}"; shift ;;
    *) echo "unknown argument: $1" >&2; exit 1 ;;
  esac
  shift
done
BASE="${BASE#origin/}"
[[ $DROP -eq 0 || $SCHEMAS -eq 1 ]] || { echo "--drop needs --schemas" >&2; exit 1; }

ROOT="$(git rev-parse --show-toplevel)"
MAIN="$(git worktree list --porcelain | sed -n '1s/^worktree //p')"
run() { if [[ $DRY -eq 1 ]]; then echo "  [dry-run] $*"; else "$@"; fi; }

PG_UP=""; dropped=""
postgres_running() { # checked once per run
  if [[ -z "$PG_UP" ]]; then
    PG_UP=0
    [[ -n "$(docker compose -f "$MAIN/docker-compose.yml" ps -q --status running postgres 2>/dev/null </dev/null)" ]] && PG_UP=1
  fi
  [[ $PG_UP -eq 1 ]]
}
psql_c() { # psql_c <sql>: unaligned, tuples only; NOTICEs (e.g. "drop cascades to …") hidden, errors still shown
  docker compose -f "$MAIN/docker-compose.yml" exec -T -e PGOPTIONS='-c client_min_messages=warning' postgres \
    psql -q -At -U postgres -d level_up_lab -v ON_ERROR_STOP=1 -c "$1" </dev/null
}

drop_schema() {
  local schema="$1"
  [[ "$schema" =~ ^wt_[a-z0-9_]+$ ]] || { echo "  WARNING: '$schema' is not a wt_* schema name; not dropped" >&2; return 0; }
  if ! postgres_running; then echo "  postgres not running; schema $schema left in place"; return 0; fi
  dropped="$dropped $schema"
  if [[ $DRY -eq 1 ]]; then echo "  [dry-run] DROP SCHEMA $schema"; return 0; fi
  if psql_c "DROP SCHEMA IF EXISTS \"$schema\" CASCADE;"; then
    echo "  schema $schema dropped"
  else
    echo "  WARNING: schema $schema not dropped" >&2
  fi
}

schema_of() { # schema_of <worktree dir>: its .worktree.env, else worktree.sh's rule on the directory name
  local s=""
  [[ -f "$1/.worktree.env" ]] && s="$(grep '^WORKTREE_SCHEMA=' "$1/.worktree.env" | cut -d= -f2- || true)"
  [[ -n "$s" ]] || s="wt_$(basename "$1" | tr 'A-Z' 'a-z' | tr -c 'a-z0-9\n' '_')"
  printf '%s' "$s"
}

is_card_worktree() { # <checkout>/.worktrees/<slug> at any depth under the main checkout
  local slug
  case "$1" in "$MAIN"/.worktrees/* | "$MAIN"/*/.worktrees/*) ;; *) return 1 ;; esac
  slug="${1##*/.worktrees/}"
  [[ -n "$slug" && "$slug" != */* ]]
}

# list_orphans <claimed>: prints the wt_* schemas not in the space-separated <claimed> list, one per line
list_orphans() {
  local s
  for s in $(psql_c "SELECT nspname FROM pg_namespace WHERE nspname LIKE 'wt\_%' ORDER BY 1;"); do
    [[ "$s" =~ ^wt_[a-z0-9_]+$ ]] || { echo "[skip]  $s (unexpected name)" >&2; continue; }
    case " $1 " in *" $s "*) ;; *) echo "$s" ;; esac
  done
}

# --schemas: orphan wt_* schemas, claimed by no worktree in any layout.
if [[ $SCHEMAS -eq 1 ]]; then
  postgres_running || { echo "[schemas] postgres not running (docker compose up -d in $MAIN)" >&2; exit 1; }
  claimed=""
  while IFS= read -r line; do
    case "$line" in worktree\ *) d="${line#worktree }"; [[ -d "$d" ]] && claimed="$claimed $(schema_of "$d")" ;; esac
  done < <(git worktree list --porcelain)
  orphans="$(list_orphans "$claimed")"
  set -- $orphans
  for s in "$@"; do echo "[orphan] $s"; done
  if [[ $# -eq 0 ]]; then echo "[schemas] no orphan schema"; exit 0; fi
  if [[ $DROP -eq 0 ]]; then echo "[schemas] $# orphan schema(s); --drop drops them"; exit 0; fi
  for s in "$@"; do drop_schema "$s"; done
  echo "[schemas] done: $# orphan schema(s)$([[ $DRY -eq 1 ]] && echo " would be") dropped"
  exit 0
fi

BASE_REF="$BASE"
if git remote get-url origin >/dev/null 2>&1; then
  if [[ $FETCH -eq 1 ]] && ! git fetch -q origin "$BASE" </dev/null; then
    echo "[prune] WARNING: git fetch origin $BASE failed; comparing with the last fetched origin/$BASE" >&2
  fi
  if git rev-parse -q --verify "refs/remotes/origin/$BASE^{commit}" >/dev/null; then
    BASE_REF="refs/remotes/origin/$BASE"
  else
    echo "[prune] WARNING: no origin/$BASE; comparing with the local $BASE" >&2
  fi
fi
git rev-parse -q --verify "$BASE_REF^{commit}" >/dev/null || { echo "[prune] unknown base: $BASE" >&2; exit 1; }
BASE_SHOW="${BASE_REF#refs/remotes/}"

# Prints why <branch> counts as merged into the base and returns 0; returns 2 when it has no commits beyond the
# base, 3 when its commits net to no change (both without a merged PR), 1 otherwise.
merged_reason() {
  local branch="$1" tip pr mb tree cherry
  tip="$(git rev-parse "refs/heads/$branch")"
  if command -v gh >/dev/null 2>&1; then
    pr="$(gh pr list --state merged --base "$BASE" --head "$branch" --json number,headRefOid \
      --jq ".[] | select(.headRefOid == \"$tip\") | .number" 2>/dev/null </dev/null | head -1 || true)"
    if [[ -n "$pr" ]]; then echo "pr #$pr"; return 0; fi
  fi
  # Checked before tree/cherry: merging an ancestor of the base gives the base's tree, so it would read as merged.
  [[ "$(git rev-list --count "$BASE_REF..$tip")" -gt 0 ]] || return 2
  # Same for a branch that changes nothing since it forked; a squash-merged branch still differs from its fork point.
  mb="$(git merge-base "$BASE_REF" "$tip" 2>/dev/null || true)"
  [[ -n "$mb" && "$(git rev-parse "$mb^{tree}")" == "$(git rev-parse "$tip^{tree}")" ]] && return 3
  # merge-tree --write-tree (git >= 2.38) exits non-zero on conflict or when unsupported: not merged by this test.
  tree="$(git merge-tree --write-tree "$BASE_REF" "$tip" 2>/dev/null | head -1 || true)"
  if [[ -n "$tree" && "$tree" == "$(git rev-parse "$BASE_REF^{tree}")" ]]; then echo "tree"; return 0; fi
  cherry="$(git cherry "$BASE_REF" "$tip" 2>/dev/null || true)"
  if [[ -n "$cherry" ]] && ! printf '%s\n' "$cherry" | grep -q '^+'; then echo "cherry"; return 0; fi
  return 1
}

ask() { # ask <question>: yes only on y/Y from a terminal
  local answer=""
  read -r -p "  $1 [y/N] " answer </dev/tty 2>/dev/null || answer=""
  [[ "$answer" == [yY] ]]
}

# One worktree record: removes it or adds its schema to $claimed.
handle() {
  local path="$1" branch="$2" reason="" rc=0
  if [[ ! -d "$path" ]]; then
    if is_card_worktree "$path"; then
      echo "[gone]  ${branch:-(detached)}  (directory removed; $path)"
      drop_schema "$(schema_of "$path")"
      if [[ -n "$branch" ]]; then
        reason="$(merged_reason "$branch")" && rc=0 || rc=$?
        # git refuses to delete a branch its stale worktree record still holds: deleted after `git worktree prune`
        if [[ $rc -eq 0 ]]; then gone_branches="$gone_branches $branch"; echo "  branch $branch merged ($reason)"
        elif [[ $rc -eq 3 ]]; then echo "  branch $branch kept (commits net to no change vs $BASE_SHOW)"
        else echo "  branch $branch kept (not merged into $BASE_SHOW)"; fi
      fi
      gone=$((gone + 1))
    fi
    return 0
  fi
  if [[ "$path" == "$ROOT" ]] || ! is_card_worktree "$path" || [[ -z "$branch" ]]; then
    claimed="$claimed $(schema_of "$path")"
    is_card_worktree "$path" && echo "[keep]  ${branch:-(detached)}  ($([[ "$path" == "$ROOT" ]] && echo "current checkout" || echo "detached"); $path)"
    return 0
  fi
  reason="$(merged_reason "$branch")" && rc=0 || rc=$?
  if [[ $rc -ne 0 ]]; then
    case $rc in
      2) reason="no commits beyond $BASE_SHOW" ;;
      3) reason="commits net to no change vs $BASE_SHOW" ;;
      *) reason="not merged into $BASE_SHOW" ;;
    esac
    if [[ $ALL -eq 0 ]] || ! ask "$branch: $reason. Remove anyway?"; then
      echo "[keep]  $branch  ($reason; $path)"
      claimed="$claimed $(schema_of "$path")"
      return 0
    fi
  fi
  echo "[prune] $branch  ($reason; $path)"
  drop_schema "$(schema_of "$path")"
  run git worktree remove --force "$path" </dev/null
  run git branch -D "$branch" </dev/null
  pruned=$((pruned + 1))
}

pruned=0; gone=0; gone_branches=""; claimed=""; wt_path=""; wt_branch=""
while IFS= read -r line <&3; do
  case "$line" in
    worktree\ *) wt_path="${line#worktree }" ;;
    branch\ *) wt_branch="${line#branch refs/heads/}" ;;
    "")
      [[ -n "$wt_path" ]] && handle "$wt_path" "$wt_branch"
      wt_path=""; wt_branch=""
      ;;
  esac
done 3< <(git worktree list --porcelain; echo)

run git worktree prune
for b in $gone_branches; do
  run git branch -D "$b" </dev/null || echo "  WARNING: branch $b not deleted (locked worktree? git worktree unlock)" >&2
done
if postgres_running; then
  for s in $(list_orphans "$claimed $dropped"); do echo "[orphan] $s  (no worktree; scripts/worktree-prune.sh --schemas --drop drops it)"; done
else
  echo "[prune] postgres not running; orphan list skipped"
fi
echo "[prune] done: $pruned worktree(s) removed, $gone gone worktree(s) cleaned (base $BASE_SHOW)"
