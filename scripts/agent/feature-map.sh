#!/usr/bin/env bash
# The daily feature map of agent cards (B1.45; D-27, D-28): one row per open `agent-ready` issue, riskiest first, so
# the lead reads the high-tier PRs in full before sampling the rest. Prints only (the lead's ruling A): an attended
# orchestrator session posts it to the agent board. Read-only; bash 3.2; gh + git only (gh's own --jq, no jq).
#   scripts/agent/feature-map.sh [--json]
#   exit 0 the table (also when empty) · 1 a gh call failed · 2 usage
# A card's PR is its open PR from this repository (never a fork's) on <type>/<card>[-…], the closing and filing lanes (docs/<card>-done, -partial, -card,
# -file-card, -B<e>.<n>-cards) excepted. Its Evidence is the PR body's "## Evidence" lines. Its tier is never the body's
# word (an agent writes the body): $FEATURE_MAP_TIER (default scripts/agent/tier.sh, B1.44) on the card's plan.md at
# the branch's approval commit, as scripts/ci/plan-files.sh finds it, else at the tip, marked "(unapproved)"; no tier
# script or no plan → unknown. Order: high, unknown, medium, low, then queued (no PR); ties by issue number.
set -euo pipefail
usage() { echo "usage: $0 [--json]" >&2; exit 2; }
JSON=0
case "${1:-}" in
  "") ;;
  --json) JSON=1 ;;
  *) usage ;;
esac
[[ $# -le 1 ]] || usage
cd "$(git rev-parse --show-toplevel)"
TIER="${FEATURE_MAP_TIER:-$PWD/scripts/agent/tier.sh}"
DAY="${FEATURE_MAP_DATE:-$(date +%F)}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
die() { echo "[feature-map] $*" >&2; exit 1; }
warn() { echo "[feature-map] warning: $*" >&2; }

gh issue list --label agent-ready --state open --limit 100 --json number,title --jq '.[] | [.number, .title] | @tsv' \
  </dev/null > "$TMP/issues" || die "gh issue list failed"

evidence() { # evidence <key> <body file>: the value of "- <key>: …" inside ## Evidence; "?" when missing or empty
  awk -v k="- $1:" '/^## / { e = ($0 ~ /^## Evidence[[:space:]]*$/); next }
    e && index($0, k) == 1 { v = substr($0, length(k) + 1); gsub(/^[[:space:]]+|[[:space:]]+$/, "", v); gsub(/\t/, " ", v); print v; exit }' "$2" \
    | { IFS= read -r v || true; printf '%s' "${v:-?}"; }
}
pr_of() { # pr_of <card>: "<number>\t<branch>\t<isDraft>" of the newest open PR on the card's work branch
  local esc="${1//./\\.}" n b d fork
  while IFS="$(printf '\t')" read -r n b d fork; do
    [[ "$fork" == false ]] || continue # a fork can name its branch after any card
    [[ "$b" =~ ^[a-z]+/$esc(-.*)?$ ]] || continue
    [[ "$b" =~ ^docs/$esc-(done|partial|card|file-card|B[0-9]+\.[0-9]+-cards)$ ]] && continue
    printf '%s\t%s\t%s\n' "$n" "$b" "$d"; return
  done < "$TMP/prs"
}
tier_of() { # tier_of <card> <branch>: the D-28 tier from the plan, never the PR body
  local card="$1" branch="$2" esc="${1//./\\.}" sha="" h subject word note="" re
  [[ -x "$TIER" ]] || { echo unknown; return; }
  GIT_TERMINAL_PROMPT=0 git fetch -q origin "refs/heads/$branch" </dev/null 2>/dev/null \
    || { warn "git fetch $branch failed"; echo unknown; return; }
  re="^docs\(backlog\): $esc plan (round [0-9]+ )?approved"
  while read -r h subject; do # subjects only, as scripts/ci/plan-files.sh
    [[ "$subject" =~ $re ]] && { sha="$h"; break; }
  done < <(git log --first-parent --format='%H %s' FETCH_HEAD)
  [[ -n "$sha" ]] || { sha="$(git rev-parse FETCH_HEAD)"; note=" (unapproved)"; }
  git show "$sha:backlog/work/$card/plan.md" > "$TMP/plan" 2>/dev/null || { echo unknown; return; }
  word="$("$TIER" "$TMP/plan" 2>/dev/null | head -1 | tr -d '[:space:]')" || word=""
  case "$word" in high | medium | low) echo "$word$note" ;; *) echo unknown ;; esac
}
rank() { case "$1" in high*) echo 0 ;; medium*) echo 2 ;; low*) echo 3 ;; *) echo 1 ;; esac; } # unknown ranks next to high

: > "$TMP/rows"
if [[ -s "$TMP/issues" ]]; then
  gh pr list --state open --limit 100 --json number,headRefName,isDraft,isCrossRepository \
    --jq '.[] | [.number, .headRefName, (.isDraft | tostring), (.isCrossRepository | tostring)] | @tsv' </dev/null > "$TMP/prs" || die "gh pr list failed"
  while IFS="$(printf '\t')" read -r issue title; do
    card="?"
    if [[ "$title" =~ (B[0-9]+\.[0-9]+) ]]; then card="${BASH_REMATCH[1]}"; else
      gh issue view "$issue" --json body --jq .body </dev/null > "$TMP/body" || die "gh issue view $issue failed"
      [[ "$(cat "$TMP/body")" =~ (B[0-9]+\.[0-9]+) ]] && card="${BASH_REMATCH[1]}"
    fi
    pr="-"; state=queued; tier="-"; ac="-"; dev="-"
    found=""; [[ "$card" != "?" ]] && found="$(pr_of "$card")"
    if [[ -n "$found" ]]; then
      IFS="$(printf '\t')" read -r pr branch draft <<< "$found"
      [[ "$draft" == true ]] && state=doing || state=review
      gh pr view "$pr" --json body --jq .body </dev/null > "$TMP/body" || die "gh pr view $pr failed"
      ac="$(evidence "AC met" "$TMP/body")"; dev="$(evidence "plan deviations" "$TMP/body")"
      body_tier="$(evidence tier "$TMP/body" | tr '[:upper:]' '[:lower:]')"
      tier="$(tier_of "$card" "$branch")"
      case "$body_tier" in high | medium | low) [[ "${tier%% *}" == "$body_tier" ]] || tier="$tier (body: $body_tier)" ;; esac
    fi
    r=4; [[ "$pr" == - ]] || r="$(rank "$tier")"
    printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$r" "$issue" "$card" "$pr" "$state" "$tier" "$ac" "$dev" >> "$TMP/rows"
  done < "$TMP/issues"
fi
sort -t "$(printf '\t')" -k1,1n -k2,2n "$TMP/rows" > "$TMP/sorted"

json_str() { local s="${1//\\/\\\\}"; printf '"%s"' "${s//\"/\\\"}"; }
if [[ $JSON -eq 1 ]]; then
  sep=""; printf '['
  while IFS="$(printf '\t')" read -r _ issue card pr state tier ac dev; do
    [[ "$pr" == - ]] && pr=null
    printf '%s{"card":%s,"issue":%s,"pr":%s,"state":%s,"tier":%s,"ac":%s,"deviations":%s}' "$sep" "$(json_str "$card")" \
      "$issue" "$pr" "$(json_str "$state")" "$(json_str "$tier")" "$(json_str "$ac")" "$(json_str "$dev")"
    sep=","
  done < "$TMP/sorted"
  printf ']\n'
  exit 0
fi
printf '# Agent feature map — %s\n\n' "$DAY"
[[ -s "$TMP/sorted" ]] || { echo "No open agent-ready issues."; exit 0; }
echo "| # | Card | Issue | PR | State | Tier | AC met | Deviations |"
echo "| - | ---- | ----- | -- | ----- | ---- | ------ | ---------- |"
i=0
while IFS="$(printf '\t')" read -r _ issue card pr state tier ac dev; do
  i=$((i + 1))
  [[ "$pr" == - ]] || pr="#$pr"
  printf '| %s | %s | #%s | %s | %s | %s | %s | %s |\n' "$i" "$card" "$issue" "$pr" "$state" "$tier" "${ac//|/\\|}" "${dev//|/\\|}"
done < "$TMP/sorted"
