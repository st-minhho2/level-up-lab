#!/usr/bin/env bash
# Throughput (B1.22, D-18): cards whose feature PR merged ÷ Σ daily active spans × 8, one ratio over all days.
# A day is a calendar day in UTC+7, (epoch + 25200) / 86400. A day's span runs from the first plan-approval commit
# (round 1) of the cards merged that day, if any falls on that day, else from the day's first merge, to the day's last
# merge (D-18 as written, the lead's choice X): a card approved the day before adds no span to the day it merges, and a
# merge before the day's first approval adds none either. Read-only; bash 3.2; git + gh only.
#   scripts/metrics/throughput.sh [<card>…]   default: every Done card whose status line names its PR (#N)
#   output: TSV "day cards hours", then "throughput <x> cards per 8 h (<n> cards, <h> h, <d> days)"
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

cards() { # card → PR, as lead-time.sh
  awk '/^### B[0-9]+\.[0-9]+ · / { id = $2; next }
       id != "" && /^\*\*Status: Done\*\*/ { if (match($0, /\(#[0-9]+\)/)) print id, substr($0, RSTART + 2, RLENGTH - 3); id = "" }
       /^\*\*Status: / { id = "" }' backlog/plan/E*.md
}
want() { [[ $# -le 1 ]] && return 0; local c; for c in "${@:2}"; do [[ "$c" == "$1" ]] && return 0; done; return 1; }

: > "${TMPDIR:-/tmp}/throughput.$$"; trap 'rm -f "${TMPDIR:-/tmp}/throughput.$$"' EXIT
while read -r card pr; do
  want "$card" "$@" || continue
  git fetch -q origin "refs/pull/$pr/head" </dev/null
  esc="${card//./[.]}" # awk -v would read \. as a plain dot
  first="$(git log --first-parent --no-merges --format='%at %s' FETCH_HEAD \
    | awk -v re="^docs\\\\(backlog\\\\): $esc plan (round [0-9]+ )?approved" '{ s = $0; sub(/^[0-9]+ /, "", s) } s ~ re { t = $1 } END { print t }')"
  merged="$(gh pr view "$pr" --json mergedAt --jq '.mergedAt | fromdateiso8601' </dev/null)"
  printf '%s\t%s\n' "$merged" "${first:--}" >> "${TMPDIR:-/tmp}/throughput.$$"
done < <(cards)

day_name() { date -u -d "@$1" +%F 2>/dev/null || date -u -r "$1" +%F; }
printf 'day\tcards\thours\n'
awk -F'\t' '{ day = int(($1 + 25200) / 86400); print day "\t" $1 "\t" $2 }' "${TMPDIR:-/tmp}/throughput.$$" \
  | sort -n | awk -F'\t' '
    { d = $1; n[d]++; if (!(d in last) || $2 > last[d]) last[d] = $2; if (!(d in fm) || $2 < fm[d]) fm[d] = $2
      if ($3 != "-" && int(($3 + 25200) / 86400) == d && (!(d in fa) || $3 < fa[d])) fa[d] = $3 }
    END { for (d in n) { s = (d in fa) ? fa[d] : fm[d]; print d "\t" n[d] "\t" (last[d] - s) } }' \
  | sort -n > "${TMPDIR:-/tmp}/throughput.$$.days"
cards_n=0; secs=0; days=0
while IFS=$'\t' read -r d n span; do
  printf '%s\t%s\t%s\n' "$(day_name $((d * 86400)))" "$n" "$(awk -v s="$span" 'BEGIN { printf "%.2f", s / 3600 }')"
  cards_n=$((cards_n + n)); secs=$((secs + span)); days=$((days + 1))
done < "${TMPDIR:-/tmp}/throughput.$$.days"
rm -f "${TMPDIR:-/tmp}/throughput.$$.days"
awk -v n="$cards_n" -v s="$secs" -v d="$days" 'BEGIN {
  if (s == 0) { printf "throughput n/a (%d cards, 0.0 h, %d days)\n", n, d; exit }
  printf "throughput %.1f cards per 8 h (%d cards, %.1f h, %d days)\n", n / (s / 3600) * 8, n, s / 3600, d }'
