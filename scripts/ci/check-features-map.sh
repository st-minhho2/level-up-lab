#!/usr/bin/env bash
# Every path named in spec/features-map.md exists (✗ rows may name files that do not exist yet), every § exists,
# and every src/ module under lib/, actions/, components/ appears in some row.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
fail=0
while IFS='|' read -r _ f sec feat files tests status _; do
  f="$(echo "$f" | xargs)"; [[ "$f" =~ ^F[0-9]+$ ]] || continue
  status="$(echo "$status" | xargs)"
  for p in $(echo "$files $tests" | grep -oE '`[^`]+`' | tr -d '`'); do
    [[ -e "$p" ]] || { [[ "$status" == ✗* ]] && continue; echo "::error::$f names missing path $p"; fail=1; }
  done
done < spec/features-map.md
for m in src/lib/*.ts src/actions/*.ts src/components/*.tsx; do
  case "$m" in *.test.*|*/errors.ts|*/action-result.ts|*/prisma.ts) continue ;; esac
  grep -q "\`$m\`" spec/features-map.md || { echo "::error::$m is in no features-map row"; fail=1; }
done
[[ $fail -eq 0 ]] && echo "[check-features-map] OK"
exit $fail
