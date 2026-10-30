#!/usr/bin/env bash
# Lead time per card (B1.16): approval → squash-merge of the card's feature PR, in whole minutes, and the median.
# Read-only: fetches each PR head into FETCH_HEAD, asks gh for the merge time. bash 3.2-safe; git + gh only.
#   scripts/metrics/lead-time.sh [<card>…]   default: every Done card whose status line names its PR as (#N)
#
#   approval  on the PR head's first-parent, non-merge commits (author date): the latest commit whose subject is
#             "docs(backlog): <card> plan [round N ]approved", and the oldest commit adding a
#             "Lead approves spec (… <card>)" line; the later of the two. Neither → n/a, out of the median. A tick
#             merged in from main is not on the first-parent chain, so it is ignored.
#   minutes   ⌊(merged − approval) / 60⌋; an even-count median is ⌊mean of the two middle values⌋.
#   output    TSV "card pr approval_sha minutes hours", then "median <m> min (<h> h) over <n> cards; n/a: <ids>"
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

# card → PR: "### B1.2 · …" then "**Status: Done** — … (#5) …"
cards() {
  awk '/^### B[0-9]+\.[0-9]+ · / { id = $2; next }
       id != "" && /^\*\*Status: Done\*\*/ { if (match($0, /\(#[0-9]+\)/)) print id, substr($0, RSTART + 2, RLENGTH - 3); id = "" }
       /^\*\*Status: / { id = "" }' backlog/plan/E*.md
}
want() { [[ $# -le 1 ]] && return 0; local c; for c in "${@:2}"; do [[ "$c" == "$1" ]] && return 0; done; return 1; }

printf 'card\tpr\tapproval_sha\tminutes\thours\n'
mins=""; na=""
while read -r card pr; do
  want "$card" "$@" || continue
  git fetch -q origin "refs/pull/$pr/head" </dev/null
  head="$(git rev-parse FETCH_HEAD)"
  esc="${card//./\\.}" # -G is a basic regex: literal parens, escaped dot
  plan="$(git log --first-parent --no-merges -E --format='%at %h' \
    --grep="^docs\(backlog\): $esc plan (round [0-9]+ )?approved" "$head" | sort -n | tail -1)"
  tick="$(git log --first-parent --no-merges --format='%at %h' \
    -G"Lead approves spec ([^)]*$esc)" "$head" -- spec/ | sort -n | head -1)"
  best="$plan"
  [[ -n "$tick" && ( -z "$best" || "${tick%% *}" -gt "${best%% *}" ) ]] && best="$tick"
  if [[ -z "$best" ]]; then
    printf '%s\t%s\t-\tn/a\tn/a\n' "$card" "$pr"; na="$na $card"; continue
  fi
  merged="$(gh pr view "$pr" --json mergedAt --jq '.mergedAt | fromdateiso8601' </dev/null)"
  m=$(( (merged - ${best%% *}) / 60 ))
  printf '%s\t%s\t%s\t%s\t%s\n' "$card" "$pr" "${best#* }" "$m" "$(awk -v m="$m" 'BEGIN { printf "%.1f", m / 60 }')"
  mins="$mins $m"
done < <(cards)

printf '%s\n' $mins | awk -v na="${na# }" 'NF { v[++n] = $1 }
  END {
    if (n == 0) { printf "median n/a over 0 cards; n/a: %s\n", (na == "" ? "none" : na); exit }
    for (i = 1; i <= n; i++) for (j = i + 1; j <= n; j++) if (v[j] < v[i]) { t = v[i]; v[i] = v[j]; v[j] = t }
    med = (n % 2) ? v[(n + 1) / 2] : int((v[n / 2] + v[n / 2 + 1]) / 2)
    printf "median %d min (%.1f h) over %d cards; n/a: %s\n", med, med / 60, n, (na == "" ? "none" : na)
  }'
