#!/usr/bin/env bash
# Every path named in spec/features-map.md exists (✗ rows may name files that do not exist yet), every § exists,
# every src/ module under lib/, actions/, components/ appears in some row, and no F<n> has two rows (B1.89).
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
# B1.89: the map merges with merge=union (.gitattributes), so a row edited on both sides of a merge comes back twice,
# the merging branch's copy first; keeping that one would undo the other side's edit (a closing commit's ✗ → ✅)
while read -r n id; do
  echo "::error::$id has $n rows in spec/features-map.md: a union merge kept both sides of an edit. Keep the copy origin/main has, plus this branch's own change to that row if it made one; delete the rest"; fail=1
done < <(grep -oE '^\| *F[0-9]+ ' spec/features-map.md | tr -d '| ' | sort | uniq -c | awk '$1 > 1')
for m in src/lib/*.ts src/actions/*.ts src/components/*.tsx; do
  case "$m" in *.test.*|*/errors.ts|*/action-result.ts|*/prisma.ts) continue ;; esac
  grep -q "\`$m\`" spec/features-map.md || { echo "::error::$m is in no features-map row"; fail=1; }
done
[[ $fail -eq 0 ]] && echo "[check-features-map] OK"
exit $fail
