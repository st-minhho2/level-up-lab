#!/usr/bin/env bash
# Every AC-n in section 3 of each spec at or past `approved` must appear as a test title "AC-n:" in
# src/**/*.test.ts(x) or e2e/**. Also enforces the 7-criteria cap. Exit 1 on any gap.
# Specs live in docs/specs/<id>-<slug>/spec.md with `status:` in the frontmatter (legacy specs/FEAT-*.md with a
# `| Status |` row are still read until FEAT-001 is moved).
#   scripts/ci/check-ac-coverage.sh [docs/specs/FEAT-xxx-*/spec.md ...]
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

specs=("$@")
if [[ ${#specs[@]} -eq 0 ]]; then
  while IFS= read -r f; do specs+=("$f"); done < <(ls docs/specs/FEAT-*/spec.md specs/FEAT-*.md 2>/dev/null || true)
fi
[[ ${#specs[@]} -eq 0 ]] && { echo "[check-ac-coverage] no specs yet"; exit 0; }

titles="$(grep -rhoE "(it|test)(\.each\([^)]*\))?\((['\"\`])AC-[0-9]+:" src e2e 2>/dev/null | grep -oE 'AC-[0-9]+' | sort -u || true)"

fail=0
for spec in "${specs[@]}"; do
  status="$(awk 'NR==1 && $0!="---"{exit} NR>1 && $0=="---"{exit} /^status:/{print $2; exit}' "$spec")"
  [[ -n "$status" ]] || status="$(grep -E '^\| *Status *\|' "$spec" | head -1 | sed -E 's/^\| *Status *\| *`?([a-z]+).*/\1/')"
  case "$status" in
    backlog|analyzed|advised|planned|draft|blocked)
      echo "[check-ac-coverage] $spec: $status, no tests expected yet"
      continue ;;
  esac
  ids="$(awk '/^## 3\./{f=1;next} /^## /{f=0} f' "$spec" | grep -oE '^\| *AC-[0-9]+' | grep -oE 'AC-[0-9]+' | sort -u -t- -k2,2n)"
  total=$(echo "$ids" | grep -c . || true)
  if [[ $total -gt 7 ]]; then
    echo "::error::$spec declares $total acceptance criteria (max 7). Split the feature."
    fail=1
  fi
  covered=0; missing=""
  for id in $ids; do
    if echo "$titles" | grep -qx "$id"; then covered=$((covered + 1)); else missing="$missing $id"; fi
  done
  pct=$(( total == 0 ? 0 : covered * 100 / total ))
  printf '%-40s criteria=%d covered=%d (%d%%)%s\n' "$spec" "$total" "$covered" "$pct" "${missing:+  MISSING:$missing}"
  [[ -z "$missing" && $total -gt 0 ]] || fail=1
done
[[ $fail -eq 0 ]] && echo "[check-ac-coverage] OK: 100% of criteria have a test"
exit $fail
