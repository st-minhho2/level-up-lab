#!/usr/bin/env bash
# Change failure rate (B1.16): repair PRs of already-merged cards ÷ cards. Read-only; bash 3.2-safe; git + gh only.
#   scripts/metrics/change-failure-rate.sh [--days 14] [<card>…]   default: every Done card that names its PR (#N)
#
#   repair PR  a merged PR titled fix/revert ("fix(…):", "fix:", "fix!:", "revert…", 'Revert "…'), other than the
#              card's own feature PR (another card's feature PR may count), merged in (card merge, card merge +
#              days], sharing a changed file with the card's PR outside *.md, backlog/, docs/, spec/.
#              A mechanical upper bound: a false positive is noted in docs/metrics.md, never edited out here.
#   output     TSV "card pr repaired_by" (#N,#M or -), then "change failure rate <k>/<n> = <p> %",
#              k = distinct repair PRs, n = cards
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
DAYS=14
if [[ "${1:-}" == "--days" ]]; then DAYS="${2:?--days needs a number}"; shift 2; fi
[[ "$DAYS" =~ ^[0-9]+$ ]] || { echo "[change-failure-rate] --days must be a whole number" >&2; exit 1; }

# card → PR, as lead-time.sh
cards() {
  awk '/^### B[0-9]+\.[0-9]+ · / { id = $2; next }
       id != "" && /^\*\*Status: Done\*\*/ { if (match($0, /\(#[0-9]+\)/)) print id, substr($0, RSTART + 2, RLENGTH - 3); id = "" }
       /^\*\*Status: / { id = "" }' backlog/plan/E*.md
}
want() { [[ $# -le 1 ]] && return 0; local c; for c in "${@:2}"; do [[ "$c" == "$1" ]] && return 0; done; return 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
gh pr list --state merged --limit 1000 --json number,title,mergedAt,files \
  --jq '.[] | [.number, (.mergedAt | fromdateiso8601), .title, ([.files[].path] | join(" "))] | @tsv' \
  </dev/null > "$TMP/prs.tsv"
[[ -s "$TMP/prs.tsv" ]] || { echo "[change-failure-rate] gh listed no merged PR" >&2; exit 1; }
while read -r card pr; do want "$card" "$@" && printf '%s\t%s\n' "$card" "$pr"; done < <(cards) > "$TMP/cards.tsv"

printf 'card\tpr\trepaired_by\n'
awk -F'\t' -v window=$((DAYS * 86400)) '
  function code(path) { return path !~ /\.md$/ && path !~ /^(backlog|docs|spec)\// }
  NR == FNR { merged[$1] = $2; title[$1] = $3; files[$1] = $4; order[++np] = $1; next }
  {
    card = $1; pr = $2; n++; hit = ""
    if (!(pr in merged)) { printf "%s\t%s\tn/a (PR not merged)\n", card, pr; next }
    split(files[pr], mine, " "); delete own
    for (i in mine) if (code(mine[i])) own[mine[i]] = 1
    for (q = 1; q <= np; q++) {
      r = order[q]
      if (r == pr || title[r] !~ /^((fix|revert)(\(|:|!)|Revert ")/) continue
      if (merged[r] <= merged[pr] || merged[r] > merged[pr] + window) continue
      split(files[r], theirs, " "); shared = 0
      for (j in theirs) if (theirs[j] in own) shared = 1
      if (shared) { hit = hit (hit == "" ? "" : ",") "#" r; repair[r] = 1 }
    }
    printf "%s\t%s\t%s\n", card, pr, (hit == "" ? "-" : hit)
  }
  END {
    k = 0; for (r in repair) k++
    printf "change failure rate %d/%d = %.1f %%\n", k, n, (n ? 100 * k / n : 0)
  }' "$TMP/prs.tsv" "$TMP/cards.tsv"
