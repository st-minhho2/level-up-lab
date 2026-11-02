#!/usr/bin/env bash
# The Files of a card's plan as of its approval commit (B1.17), shared by .claude/hooks/plan-scope.sh and
# check-plan-scope.sh. The approval commit is the latest first-parent commit reachable from <rev> whose subject is
# "docs(backlog): <card> plan [round N ]approved" (subject only), so a row added after approval
# does not count until the lead approves again. Prints each backticked token of column 1 of the `## Files` table.
#   scripts/ci/plan-files.sh [--run] [--offline] <card> [<rev>]
#                         exit 0 printed · 3 no approval commit · 4 no plan at it · 5 approval field refused · 1 usage
#   scripts/ci/plan-files.sh --any <card> [<rev>]   the Files at <rev> itself, approved or not (next-task.sh --check)
#   scripts/ci/plan-files.sh --file <plan.md>       the Files of a plan file (scripts/agent/tier.sh); exit 1 unreadable
# The approval field (B1.55, D-27) is the text after "Plan approved by:" up to " · " or the line end, on the plan's
# last line starting "Plan review:"; prose quoting it is never read. With --run (a runner's path: the caller decides)
# it must read "reviewer (D-27, tier <low|medium>, issue #<n>)" and hold at the approval commit: tier.sh gives <t>,
# review.md's last "## Plan review (round N)" has "Verdict: approved", plan.md is unchanged but for its status line
# since the last commit touching review.md, and scripts/agent/eligible.sh <n> <card> passes (--offline skips only
# that call: metrics on merged PRs). Without --run a field starting "reviewer" is refused; any other is the lead's.
# Exit 5 prints "plan-files: <card> approval at <sha7>: <why>" on stderr. Run inside the card's worktree. bash 3.2-safe.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
files_of() { # the Files tokens of the plan on stdin
  awk '
  /^## / { files = ($0 ~ /^## Files[[:space:]]*$/); next }
  files && /^\|/ {
    split($0, col, "|"); cell = col[2]
    while (match(cell, /`[^`]+`/)) { print substr(cell, RSTART + 1, RLENGTH - 2); cell = substr(cell, RSTART + RLENGTH) }
  }'
}
field_of() { # the approval field of the plan on stdin; nothing when there is no status line or no field
  awk '/^Plan review:/ { line = $0 }
  END {
    i = index(line, "Plan approved by:"); if (!i) exit
    f = substr(line, i + 17); j = index(f, " · "); if (j) f = substr(f, 1, j - 1)
    sub(/^[[:space:]]+/, "", f); sub(/[[:space:]]+$/, "", f); print f
  }'
}
if [[ "${1:-}" == --file ]]; then
  [[ $# -eq 2 && -f "$2" && -r "$2" ]] || { echo "usage: scripts/ci/plan-files.sh --file <plan.md>" >&2; exit 1; }
  files_of < "$2"; exit 0
fi
any=0; run=0; offline=0
while :; do
  case "${1:-}" in
    --any) any=1; shift ;;
    --run) run=1; shift ;;
    --offline) offline=1; shift ;;
    *) break ;;
  esac
done
card="${1:-}"; rev="${2:-HEAD}"
usage() { echo "usage: scripts/ci/plan-files.sh [--any | [--run] [--offline]] <card> [<rev>]" >&2; exit 1; }
[[ "$card" =~ ^B[0-9]+\.[0-9]+$ && $# -le 2 ]] || usage
[[ $any -eq 1 && $((run + offline)) -gt 0 ]] && usage
esc="${card//./\\.}"
re="^docs\(backlog\): $esc plan (round [0-9]+ )?approved"
sha=""
if [[ $any -eq 1 ]]; then sha="$(git rev-parse -q --verify "$rev^{commit}" 2>/dev/null || true)"; fi
# subjects only: --grep would also match a body line that quotes the phrase
while read -r h subject; do
  [[ "$subject" =~ $re ]] && { sha="$h"; break; }
done < <([[ $any -eq 1 ]] || git log --first-parent --format='%H %s' "$rev" 2>/dev/null)
[[ -n "$sha" ]] || exit 3
plan="backlog/work/$card/plan.md"
git cat-file -e "$sha:$plan" 2>/dev/null || exit 4
[[ $any -eq 1 ]] && { git show "$sha:$plan" | files_of; exit 0; }

refuse() { echo "plan-files: $card approval at ${sha:0:7}: $*" >&2; exit 5; }
field="$(git show "$sha:$plan" | field_of)"
if [[ $run -eq 0 ]]; then
  [[ "$field" == reviewer* ]] && refuse "'$field': a reviewer's approval (D-27) counts only on a runner's path (branch <prefix>/$card-agent, or a run)"
else
  d27='^reviewer \(D-27, tier (low|medium|high), issue #([1-9][0-9]*)\)$'
  [[ "$field" =~ $d27 ]] || refuse "'$field' on a runner's path: needs 'reviewer (D-27, tier <low|medium>, issue #<n>)'"
  tier="${BASH_REMATCH[1]}"; issue="${BASH_REMATCH[2]}"
  [[ "$tier" != high ]] || refuse "tier high needs the lead's approve (D-27)"
  tmp="$(mktemp -d)"; trap 'rm -rf -- "$tmp"' EXIT
  git show "$sha:$plan" > "$tmp/plan.md"
  got="$("$HERE/../agent/tier.sh" "$tmp/plan.md" 2>/dev/null)"
  [[ "$got" == "$tier" ]] || refuse "the field says tier $tier, scripts/agent/tier.sh says ${got:-nothing}"
  review="backlog/work/$card/review.md"
  verdict="$(git show "$sha:$review" 2>/dev/null | awk '
    /^## / { in_pr = ($0 ~ /^## Plan review \(round [0-9]+\)/); if (in_pr) v = ""; next }
    in_pr && v == "" && /^Verdict:/ { v = $0 }
    END { print v }')"
  [[ "$verdict" == "Verdict: approved"* ]] || refuse "$review's last plan review is not 'Verdict: approved' (${verdict:-none})"
  at="$(git log -1 --format=%H "$sha" -- "$review")"
  [[ -n "$at" ]] && git cat-file -e "$at:$plan" 2>/dev/null || refuse "no commit holds $review with $plan"
  [[ "$(git show "$at:$plan" | grep -v '^Plan review:')" == "$(grep -v '^Plan review:' "$tmp/plan.md")" ]] \
    || refuse "$plan changed after the review at ${at:0:7} (beyond its status line)"
  if [[ $offline -eq 0 ]]; then
    "$HERE/../agent/eligible.sh" "$issue" "$card" >/dev/null 2> "$tmp/err" || refuse "issue #$issue: $(head -1 "$tmp/err")"
  fi
fi
git show "$sha:$plan" | files_of
