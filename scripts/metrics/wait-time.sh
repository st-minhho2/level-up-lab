#!/usr/bin/env bash
# Session wait time for the lead (B1.22, B1.21 option (b)), read from git and gh, whole minutes.
#   plan gate  Σ over the card's approval commits ("docs(backlog): <card> plan [round N ]approved", first-parent) of
#              (approval commit − its first parent), author dates; a commit made while waiting shortens it
#   PR         merge − the first green `ci` run completed on the card's last own commit (first-parent, not a merge, not
#              chore(ci)) or any later commit; no green run → n/a. Bias: a run that was red for a missing label anchors
#              on the next green one. Upper bound: PR created → merge.
#   scripts/metrics/wait-time.sh [<card>…]
#   output: TSV "card pr gate_min pr_min upper_min", then
#           "median plan-gate wait <a> min (<n>), median PR wait <b> min (<m>), PR upper bound <c> min (<k>)"
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

cards() { # card → PR, as lead-time.sh
  awk '/^### B[0-9]+\.[0-9]+ · / { id = $2; next }
       id != "" && /^\*\*Status: Done\*\*/ { if (match($0, /\(#[0-9]+\)/)) print id, substr($0, RSTART + 2, RLENGTH - 3); id = "" }
       /^\*\*Status: / { id = "" }' backlog/plan/E*.md
}
want() { [[ $# -le 1 ]] && return 0; local c; for c in "${@:2}"; do [[ "$c" == "$1" ]] && return 0; done; return 1; }
median() { printf '%s\n' "$@" | awk 'NF { v[++n] = $1 }
  END { if (!n) { print "n/a"; exit }
        for (i = 1; i <= n; i++) for (j = i + 1; j <= n; j++) if (v[j] < v[i]) { t = v[i]; v[i] = v[j]; v[j] = t }
        print (n % 2) ? v[(n + 1) / 2] : int((v[n / 2] + v[n / 2 + 1]) / 2) }'; }
count() { printf '%s\n' "$@" | awk 'NF' | wc -l | tr -d ' '; }

printf 'card\tpr\tgate_min\tpr_min\tupper_min\n'
gates=""; prs=""; uppers=""
while read -r card pr; do
  want "$card" "$@" || continue
  git fetch -q origin "refs/pull/$pr/head" </dev/null
  head="$(git rev-parse FETCH_HEAD)"
  esc="${card//./[.]}" # awk -v would read \. as a plain dot
  gate="$(git log --first-parent --no-merges --format='%H %at %s' "$head" \
    | awk -v re="^docs\\\\(backlog\\\\): $esc plan (round [0-9]+ )?approved" '{ s = $0; sub(/^[0-9a-f]+ [0-9]+ /, "", s) } s ~ re { print $1, $2 }' \
    | while read -r sha at; do echo $((at - $(git log -1 --format=%at "$sha^1"))); done \
    | awk 'NF { t += $1; n++ } END { if (n) print int(t / 60) }')"
  merged="$(gh pr view "$pr" --json mergedAt --jq '.mergedAt | fromdateiso8601' </dev/null)"
  created="$(gh pr view "$pr" --json createdAt --jq '.createdAt | fromdateiso8601' </dev/null)"
  anchor=""
  for sha in $(git rev-list --first-parent "$head"); do # head first, back to the last own commit
    t="$(gh run list --commit "$sha" --workflow ci --json conclusion,updatedAt \
      --jq '[.[] | select(.conclusion == "success") | .updatedAt | fromdateiso8601] | min // empty' </dev/null)"
    [[ -n "$t" && ( -z "$anchor" || "$t" -lt "$anchor" ) ]] && anchor="$t"
    parents="$(git rev-list --parents -n 1 "$sha" | wc -w | tr -d ' ')"
    subject="$(git log -1 --format=%s "$sha")"
    [[ "$parents" -gt 2 || "$subject" =~ ^chore\(ci\) ]] || break
  done
  pr_min="n/a"; [[ -n "$anchor" ]] && pr_min=$(((merged - anchor) / 60))
  upper=$(((merged - created) / 60))
  printf '%s\t%s\t%s\t%s\t%s\n' "$card" "$pr" "${gate:-n/a}" "$pr_min" "$upper"
  [[ -n "$gate" ]] && gates="$gates $gate"
  [[ "$pr_min" != n/a ]] && prs="$prs $pr_min"
  uppers="$uppers $upper"
done < <(cards)
echo "median plan-gate wait $(median $gates) min ($(count $gates)), median PR wait $(median $prs) min ($(count $prs)), PR upper bound $(median $uppers) min ($(count $uppers))"
