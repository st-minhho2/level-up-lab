#!/usr/bin/env bash
# The only way to change a task's state. Edits `status:` in docs/specs/<id>-*/spec.md and checks the transition.
#   scripts/task-status.sh FEAT-003 analyzed
#   scripts/task-status.sh FEAT-003 blocked "waiting for product decision on X"
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
ID="${1:-}"; NEW="${2:-}"; REASON="${3:-}"
[[ -n "$ID" && -n "$NEW" ]] || { echo "usage: scripts/task-status.sh <FEAT-id> <status> [reason]" >&2; exit 1; }

ORDER="backlog analyzed advised planned approved in-progress review done"
FILE="$(ls docs/specs/"$ID"-*/spec.md 2>/dev/null | head -1)"
[[ -n "$FILE" ]] || { echo "no docs/specs/$ID-*/spec.md" >&2; exit 1; }
CUR="$(awk 'NR==1 && $0!="---"{exit} NR>1 && $0=="---"{exit} /^status:/{print $2; exit}' "$FILE")"
[[ -n "$CUR" ]] || { echo "$FILE has no status in its frontmatter" >&2; exit 1; }

index() { local i=0 s; for s in $ORDER; do [[ "$s" == "$1" ]] && { echo $i; return; }; i=$((i+1)); done; echo -1; }
ci="$(index "$CUR")"; ni="$(index "$NEW")"

if [[ "$NEW" == "blocked" ]]; then
  [[ -n "$REASON" ]] || { echo "blocked needs a reason" >&2; exit 1; }
elif [[ "$CUR" == "blocked" ]]; then
  [[ $ni -ge 0 ]] || { echo "unknown status '$NEW'" >&2; exit 1; }
elif [[ $ni -lt 0 ]]; then
  echo "unknown status '$NEW' (one of: $ORDER blocked)" >&2; exit 1
elif [[ $ni -ne $((ci + 1)) && ! ( "$NEW" == "backlog" ) ]]; then
  # forward one step only; sending work back is explicit: planned -> advised etc. is allowed one step back too
  if [[ $ni -ne $((ci - 1)) ]]; then
    echo "illegal transition $CUR -> $NEW (one step forward or back along: $ORDER)" >&2; exit 1
  fi
fi

# rewrite the frontmatter block only (awk: BSD sed cannot do ranged substitutions with labels)
tmp="$(mktemp)"
awk -v new="$NEW" -v reason="$REASON" -v cur="$CUR" '
  NR == 1 { print; infm = ($0 == "---"); next }
  infm && $0 == "---" { if (new == "blocked" && !seen) print "blocked_reason: " reason " (was " cur ")"; infm = 0; print; next }
  infm && /^status:/ { print "status: " new; next }
  infm && /^blocked_reason:/ { if (new == "blocked") { print "blocked_reason: " reason " (was " cur ")"; seen = 1 }; next }
  { print }
' "$FILE" > "$tmp" && mv "$tmp" "$FILE"
echo "[task-status] $ID: $CUR -> $NEW ($FILE)"
