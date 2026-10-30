#!/usr/bin/env bash
# The Files of a card's plan as of its approval commit (B1.17), shared by .claude/hooks/plan-scope.sh and
# check-plan-scope.sh. The approval commit is the latest first-parent commit reachable from <rev> whose subject is
# "docs(backlog): <card> plan [round N ]approved" (subject only), so a row added after approval
# does not count until the lead approves again. Prints each backticked token of column 1 of the `## Files` table.
#   scripts/ci/plan-files.sh <card> [<rev>]   exit 0 printed · 3 no approval commit · 4 no plan at it · 1 usage
# Run inside the card's worktree. bash 3.2-safe.
set -uo pipefail
card="${1:-}"; rev="${2:-HEAD}"
[[ "$card" =~ ^B[0-9]+\.[0-9]+$ ]] || { echo "usage: scripts/ci/plan-files.sh <card> [<rev>]" >&2; exit 1; }
esc="${card//./\\.}"
re="^docs\(backlog\): $esc plan (round [0-9]+ )?approved"
sha="" # subjects only: --grep would also match a body line that quotes the phrase
while read -r h subject; do
  [[ "$subject" =~ $re ]] && { sha="$h"; break; }
done < <(git log --first-parent --format='%H %s' "$rev" 2>/dev/null)
[[ -n "$sha" ]] || exit 3
plan="backlog/work/$card/plan.md"
git cat-file -e "$sha:$plan" 2>/dev/null || exit 4
git show "$sha:$plan" | awk '
  /^## / { files = ($0 ~ /^## Files[[:space:]]*$/); next }
  files && /^\|/ {
    split($0, col, "|"); cell = col[2]
    while (match(cell, /`[^`]+`/)) { print substr(cell, RSTART + 1, RLENGTH - 2); cell = substr(cell, RSTART + RLENGTH) }
  }'
