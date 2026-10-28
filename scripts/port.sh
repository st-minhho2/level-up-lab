#!/usr/bin/env sh
# Prints the dev/start port: $PORT from the shell, else PORT= from ./.env, else 3000.
# Used by package.json scripts because `next dev -p` is resolved by the shell before Next reads .env.
if [ -n "${PORT:-}" ]; then
  echo "$PORT"
elif [ -f .env ] && grep -q '^PORT=' .env; then
  grep '^PORT=' .env | head -1 | cut -d= -f2 | tr -d '"'"'"' '
else
  echo 3000
fi
