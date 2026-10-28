#!/usr/bin/env bash
# Fail when the diff ADDS eslint-disable / @ts-ignore / @ts-expect-error / @ts-nocheck.
# Why: an agent that cannot satisfy a rule fixes the code or opens a config PR; it never silences the rule inline.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
. scripts/ci/lib.sh
resolve_range

PATTERN='eslint-disable|@ts-ignore|@ts-expect-error|@ts-nocheck'
hits="$(git diff -U0 "$BASE_SHA" "$HEAD_SHA" -- '*.ts' '*.tsx' '*.mts' '*.js' '*.mjs' '*.cjs' \
  | awk -v pat="$PATTERN" '
      /^\+\+\+ / { file = substr($2, 3); next }
      /^@@ /     { split($3, a, ","); line = substr(a[1], 2) + 0; next }
      /^\+/      { if ($0 ~ pat) printf "%s:%d: %s\n", file, line, substr($0, 2); line++; next }
      /^-/       { next }
      { line++ }
    ')"
if [[ -n "$hits" ]]; then
  echo "::error::New lint/type suppressions added. Fix the code or open a config PR."
  echo "$hits"
  exit 1
fi
echo "[check-suppressions] OK: no new suppressions"
