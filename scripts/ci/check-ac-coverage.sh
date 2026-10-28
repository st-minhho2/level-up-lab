#!/usr/bin/env bash
# Every AC-§.n of a section whose index status is ✅ or ◐ appears as a test title "AC-§.n:" in src/**/*.test.ts(x)
# or e2e/**. Also enforces the 7-criteria cap per section. Exit 1 on any gap.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
titles="$(grep -rhoE "(it|test)(\.each\([^)]*\))?\((['\"\`])AC-[0-9]+\.[0-9]+:" src e2e 2>/dev/null | grep -oE 'AC-[0-9]+\.[0-9]+' | sort -u || true)"
fail=0
while IFS='|' read -r _ sec _ _ status _; do
  sec="$(echo "$sec" | xargs)"; n="${sec#§}"; [[ "$n" =~ ^[0-9]+$ ]] || continue
  status="$(echo "$status" | xargs)"
  ids="$(grep -hoE "^\| AC-$n\.[0-9]+ " spec/contracts/*.md | grep -oE "AC-$n\.[0-9]+" | sort -u -t. -k2,2n)"
  total=$(echo "$ids" | grep -c . || true)
  [[ $total -gt 7 ]] && { echo "::error::§$n declares $total criteria (max 7)"; fail=1; }
  case "$status" in ✅*|◐*) ;; *) echo "[check-ac-coverage] §$n: $status, no tests expected yet ($total criteria)"; continue ;; esac
  covered=0; missing=""
  for id in $ids; do if echo "$titles" | grep -qx "$id"; then covered=$((covered+1)); else missing="$missing $id"; fi; done
  printf '§%-3s criteria=%d covered=%d%s\n' "$n" "$total" "$covered" "${missing:+  MISSING:$missing}"
  [[ -z "$missing" ]] || fail=1
done < spec/technical-requirements.md
[[ $fail -eq 0 ]] && echo "[check-ac-coverage] OK: every criterion of a shipped section has a test"
exit $fail
