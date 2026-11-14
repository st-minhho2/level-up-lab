#!/usr/bin/env bash
# Every "§n" cited in src/, e2e/, spec/features-map.md and backlog/ has a heading "# §n " in spec/contracts/*.md,
# and every section in the index exists, and no § has two index rows (B1.96).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
have="$(grep -hoE '^# §[0-9]+' spec/contracts/*.md | grep -oE '[0-9]+' | sort -un)"
fail=0
cited="$(grep -rhoE '§[0-9]+' src e2e spec/features-map.md spec/technical-requirements.md backlog 2>/dev/null | grep -oE '[0-9]+' | sort -un)"
for n in $cited; do echo "$have" | grep -qx "$n" || { echo "::error::§$n is cited but has no heading in spec/contracts/"; fail=1; }; done
# B1.96: the index merges with merge=union (.gitattributes), so a row edited on both sides of a merge (a closing
# commit's ✗ → ✅ against a sibling's appended row) comes back twice, the merging branch's copy first; keeping that one
# would undo the other side's edit
while read -r k id; do
  echo "::error::$id has $k rows in spec/technical-requirements.md: a union merge kept both sides of an edit. Keep the copy origin/main has, plus this branch's own change to that row if it made one; delete the rest"; fail=1
done < <(grep -oE '^\| *§[0-9]+ ' spec/technical-requirements.md | tr -d '| ' | sort | uniq -c | awk '$1 > 1')
[[ $fail -eq 0 ]] && echo "[check-spec-sections] OK: sections cited: $(echo $cited | tr '\n' ' ')"
exit $fail
