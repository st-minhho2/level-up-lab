#!/usr/bin/env bash
# Every "§n" cited in src/, e2e/, spec/features-map.md and backlog/ has a heading "# §n " in spec/contracts/*.md,
# and every section in the index exists.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
have="$(grep -hoE '^# §[0-9]+' spec/contracts/*.md | grep -oE '[0-9]+' | sort -un)"
fail=0
cited="$(grep -rhoE '§[0-9]+' src e2e spec/features-map.md spec/technical-requirements.md backlog 2>/dev/null | grep -oE '[0-9]+' | sort -un)"
for n in $cited; do echo "$have" | grep -qx "$n" || { echo "::error::§$n is cited but has no heading in spec/contracts/"; fail=1; }; done
[[ $fail -eq 0 ]] && echo "[check-spec-sections] OK: sections cited: $(echo $cited | tr '\n' ' ')"
exit $fail
