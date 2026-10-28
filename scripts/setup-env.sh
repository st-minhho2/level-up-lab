#!/usr/bin/env bash
# One-shot developer setup. Idempotent: safe to rerun. Never prints secret values.
#   scripts/setup-env.sh
set -euo pipefail
cd "$(dirname "$0")/.."

# 1. .env from the example, without overwriting a customised one.
if [[ -f .env ]]; then
  echo "[setup-env] .env exists, left untouched"
else
  cp .env.example .env
  echo "[setup-env] created .env from .env.example"
fi
missing=0
while IFS='=' read -r key _; do
  [[ -z "$key" || "$key" == \#* ]] && continue
  grep -q "^${key}=" .env || { echo "[setup-env] WARNING: ${key} missing from .env"; missing=1; }
done < .env.example
[[ $missing -eq 0 ]] && echo "[setup-env] .env has every key from .env.example"

# 2. Dependencies from the shared pnpm store (offline when possible, so a second worktree costs seconds).
echo "[setup-env] pnpm store: $(pnpm store path)"
pnpm install --frozen-lockfile --prefer-offline

# 3. Prisma client (no database needed).
pnpm db:generate >/dev/null
echo "[setup-env] prisma client generated"

cat <<'NEXT'
[setup-env] next steps:
  docker compose up -d     # Postgres on localhost:5433
  pnpm db:deploy           # apply migrations
  pnpm db:seed             # sample rows
  pnpm dev                 # http://localhost:3000
NEXT
