#!/usr/bin/env bash
# Rewrite a backlog card's status line. The only way agents change a card's state.
#   scripts/card-status.sh B1.2 Done "c7153b2, 12 tests green, mutation 80.1"
#   scripts/card-status.sh B1.2 Partial "merged a1b2c3d, pending e2e"
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
ID="${1:-}"; NEW="${2:-}"; EVIDENCE="${3:-}"
[[ -n "$ID" && -n "$NEW" && -n "$EVIDENCE" ]] || { echo "usage: scripts/card-status.sh <B-id> <Open|Partial|Done> \"<evidence>\"" >&2; exit 1; }
case "$NEW" in Open|Partial|Done) ;; *) echo "status must be Open, Partial or Done" >&2; exit 1 ;; esac
FILE="$(grep -lE "^### $ID · " backlog/plan/*.md | head -1 || true)"
[[ -n "$FILE" ]] || { echo "no card '### $ID · …' in backlog/plan/" >&2; exit 1; }
tmp="$(mktemp)"
awk -v id="$ID" -v new="$NEW" -v ev="$EVIDENCE" '
  $0 ~ "^### " id " · " { incard = 1; print; next }
  incard && /^### / { incard = 0 }
  incard && /^\*\*Status: / { print "**Status: " new "** — " ev; incard = 2; next }
  { print }
' "$FILE" > "$tmp" && mv "$tmp" "$FILE"
grep -qE "^\*\*Status: $NEW\*\* — " "$FILE" || { echo "card $ID has no status line to rewrite" >&2; exit 1; }
echo "[card-status] $ID -> $NEW ($FILE). Now fix backlog/README.md (row, totals) and run scripts/ci/check-backlog.sh"
