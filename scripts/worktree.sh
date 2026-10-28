#!/usr/bin/env bash
# Create an isolated git worktree for one task: own directory inside the repo root, own branch, own dev port,
# own Postgres schema on the shared compose server, own build/cache/upload dirs, own cache-key prefix, copied
# gitignored .env files, dependencies from the shared pnpm store.
#
#   scripts/worktree.sh <task-name> [base-ref]      base defaults to main
#   scripts/worktree.sh feat/B1.3-clear-completed
#
#   dir      <repo>/.worktrees/<slug>          slug = task name lowercased, [^a-z0-9] -> '-'
#   branch   <task-name> as given (e.g. feat/B1.3-clear-completed) or created from base
#   PORT     3001..3900, stable hash of the slug
#   schema   DATABASE_URL ...?schema=wt_<slug_with_underscores>
#   dirs     NEXT_DIST_DIR=.next  UPLOAD_DIR=<dir>/storage/uploads  VITEST_CACHE_DIR/STRYKER_TEMP_DIR=<dir>/.cache/*
#   keys     CACHE_PREFIX=wt_<slug_with_underscores>
set -euo pipefail

usage() { sed -n '2,14p' "$0"; exit 1; }
[[ $# -ge 1 ]] || usage

TASK="$1"
BASE="${2:-main}"
ROOT="$(git rev-parse --show-toplevel)"
SLUG="$(printf '%s' "$TASK" | tr 'A-Z' 'a-z' | tr -c 'a-z0-9\n' '-' | sed -E 's/-+/-/g; s/^-//; s/-$//')"
[[ -n "$SLUG" ]] || { echo "[worktree] task name produced an empty slug" >&2; exit 1; }
DIR="$ROOT/.worktrees/$SLUG"
HASH="$(printf '%s' "$SLUG" | cksum | cut -d' ' -f1)"
PORT=$((3001 + HASH % 900))
SCHEMA="wt_$(printf '%s' "$SLUG" | tr '-' '_')"
CACHE_DIR="$DIR/.cache"
START=$(date +%s)

if [[ -e "$DIR" ]]; then
  echo "[worktree] $DIR already exists. Run scripts/worktree-prune.sh or choose another task name." >&2
  exit 1
fi
if [[ "$ROOT" == */.worktrees/* ]]; then
  echo "[worktree] run this from the main checkout, not from inside a worktree." >&2
  exit 1
fi

# 1. worktree: existing branch, or a new one from base
mkdir -p "$ROOT/.worktrees"
if git show-ref --verify --quiet "refs/heads/$TASK"; then
  git worktree add --quiet "$DIR" "$TASK"
else
  git worktree add --quiet -b "$TASK" "$DIR" "$BASE"
fi

# 2. copy every gitignored .env* file from the root (never printing contents), fall back to the example
copied=0
while IFS= read -r f; do
  [[ -n "$f" ]] || continue
  cp "$ROOT/$f" "$DIR/$f"
  copied=$((copied + 1))
done < <(cd "$ROOT" && git ls-files --others --ignored --exclude-standard -- '.env*' 2>/dev/null || true)
[[ -f "$DIR/.env" ]] || cp "$ROOT/.env.example" "$DIR/.env"

# 3. rewrite isolation keys in the worktree .env
ENV_FILE="$DIR/.env"
set_key() { # set_key KEY VALUE (replace or append; '|' never appears in these values)
  if grep -q "^$1=" "$ENV_FILE"; then
    sed -i.bak "s|^$1=.*|$1=$2|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
  else
    printf '%s=%s\n' "$1" "$2" >> "$ENV_FILE"
  fi
}
if grep -q '^DATABASE_URL=.*[?&]schema=' "$ENV_FILE"; then
  sed -i.bak -E "s|^(DATABASE_URL=.*[?&]schema=)[^&[:space:]\"']*|\1$SCHEMA|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
elif grep -q '^DATABASE_URL=.*\?' "$ENV_FILE"; then
  sed -i.bak -E "s|^(DATABASE_URL=[^\"']*)([\"']?)$|\1\&schema=$SCHEMA\2|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
else
  sed -i.bak -E "s|^(DATABASE_URL=[^\"']*)([\"']?)$|\1?schema=$SCHEMA\2|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
fi
set_key PORT "$PORT"
set_key NEXT_DIST_DIR ".next"
set_key UPLOAD_DIR "$DIR/storage/uploads"
set_key CACHE_PREFIX "$SCHEMA"
set_key VITEST_CACHE_DIR "$CACHE_DIR/vitest"
set_key STRYKER_TEMP_DIR "$CACHE_DIR/stryker"
mkdir -p "$CACHE_DIR/vitest" "$CACHE_DIR/stryker" "$DIR/storage/uploads"

# 4. metadata for prune and for humans (no secrets)
cat > "$DIR/.worktree.env" <<META
WORKTREE_TASK=$TASK
WORKTREE_SLUG=$SLUG
WORKTREE_PORT=$PORT
WORKTREE_SCHEMA=$SCHEMA
WORKTREE_CACHE=$CACHE_DIR
META

# 5. dependencies from the shared pnpm store
(cd "$DIR" && pnpm install --frozen-lockfile --prefer-offline --silent)
(cd "$DIR" && pnpm db:generate >/dev/null 2>&1) || true

# 6. migrations into the worktree's own schema (needs the compose Postgres; best effort)
if [[ -d "$ROOT/prisma/migrations" ]]; then
  if (cd "$DIR" && pnpm db:deploy >/dev/null 2>&1); then
    echo "[worktree] migrations applied to schema $SCHEMA"
  else
    echo "[worktree] WARNING: migrations not applied (is Postgres up? docker compose up -d). Later: cd $DIR && pnpm db:deploy"
  fi
fi

cat <<SUMMARY

[worktree] ready in $(( $(date +%s) - START ))s
  dir      $DIR
  branch   $TASK (base $BASE)
  port     $PORT
  schema   $SCHEMA
  env      $copied gitignored .env file(s) copied, keys rewritten
  caches   $CACHE_DIR/{vitest,stryker}, uploads $DIR/storage/uploads

  cd "$DIR" && pnpm dev      # http://localhost:$PORT
SUMMARY
