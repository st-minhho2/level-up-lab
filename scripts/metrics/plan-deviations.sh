#!/usr/bin/env bash
# Plan deviations no hook caught (B1.22): a merged card PR's file outside check-plan-scope.sh's paperwork set and not in
# the card's plan as approved (scripts/ci/plan-files.sh at the PR head). Since B1.17 (#60) the required `guards` job
# applies the same rule, so from B1.18 on this counts only bypasses (a `hotfix` label skips guards, or a ruleset
# bypass). Read-only; bash 3.2; git + gh only.
#   scripts/metrics/plan-deviations.sh [<card>…]
#   output: TSV "card pr outside" (files, comma-separated; - none; n/a no approved plan),
#           then "uncaught plan deviations <k>/<n>" (cards with ≥ 1 outside file ÷ cards measured)
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
HERE="$(cd "$(dirname "$0")" && pwd)"

cards() { # card → PR, as lead-time.sh
  awk '/^### B[0-9]+\.[0-9]+ · / { id = $2; next }
       id != "" && /^\*\*Status: Done\*\*/ { if (match($0, /\(#[0-9]+\)/)) print id, substr($0, RSTART + 2, RLENGTH - 3); id = "" }
       /^\*\*Status: / { id = "" }' backlog/plan/E*.md
}
want() { [[ $# -le 1 ]] && return 0; local c; for c in "${@:2}"; do [[ "$c" == "$1" ]] && return 0; done; return 1; }

printf 'card\tpr\toutside\n'
k=0; n=0
while read -r card pr; do
  want "$card" "$@" || continue
  git fetch -q origin "refs/pull/$pr/head" </dev/null
  rc=0; pats="$("$HERE/../ci/plan-files.sh" "$card" FETCH_HEAD 2>/dev/null)" || rc=$?
  if [[ $rc -ne 0 ]]; then printf '%s\t%s\tn/a\n' "$card" "$pr"; continue; fi
  out=""
  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    case "$f" in backlog/* | spec/* | docs/metrics.md | docs/mistake-log.md) continue ;; esac
    listed=0
    while IFS= read -r p; do [[ -n "$p" && ( "$f" == "$p" || "$f" == $p ) ]] && listed=1; done <<< "$pats"
    [[ $listed -eq 1 ]] || out="${out:+$out,}$f"
  done < <(gh pr view "$pr" --json files --jq '.files[].path' </dev/null)
  n=$((n + 1)); [[ -n "$out" ]] && k=$((k + 1))
  printf '%s\t%s\t%s\n' "$card" "$pr" "${out:--}"
done < <(cards)
echo "uncaught plan deviations $k/$n"
