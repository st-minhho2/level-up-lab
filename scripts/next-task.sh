#!/usr/bin/env bash
# The next eligible card and the board (B1.18). Eligible: a "Remaining" row of backlog/README.md whose Blocked-by holds
# only struck-through ids, whose Owner is Lead or Dev, and whose card carries both contract lines (Spec:, Test:).
# Board state, derived for every checkout from the same source — origin/main's README and cards (after a fetch), the
# branches (local and origin/) and the PRs (one gh call):
#   Doing    a branch `<prefix>/<card>[-…]` (prefix not docs) with no PR, a draft PR or an open PR … not ready
#   Review   that branch's latest PR is open and ready (it waits on the lead; its session is free)
#   Closing  the card is Partial, or that branch's PR is MERGED (the closing lane is due)
#   To do    no such branch, or only branches whose PR was CLOSED unmerged
# WIP counts Doing only, at most WIP_LIMIT. gh fails → warning, every branch counts as Doing; fetch fails → warning,
# the last fetched origin/main is used.
#   scripts/next-task.sh                 lowest eligible To do card: "B2.1 backlog/plan/E2-x.md"; exit 1 at the limit
#   scripts/next-task.sh --claim <card>  may <card> start here: exit 1 at the limit or when another branch holds it
#   scripts/next-task.sh --check <card>  the card's planned Files (at HEAD) against every Doing/Review card's plan
#   scripts/next-task.sh --list          the board rows with eligibility and BOARD
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)" # before the cd: $0 may be relative to the caller's directory
cd "$(git rev-parse --show-toplevel)"
WIP_LIMIT=3
MODE=pick; ARG=""
case "${1:-}" in
  "") ;;
  --list) MODE=list ;;
  --claim | --check) MODE="${1#--}"; ARG="${2:-}"; [[ "$ARG" =~ ^B[0-9]+\.[0-9]+$ ]] || { echo "usage: $0 $1 <card>" >&2; exit 2; } ;;
  *) echo "usage: $0 [--list | --claim <card> | --check <card>]" >&2; exit 2 ;;
esac
warn() { echo "[next-task] warning: $*" >&2; }
# pure bash on purpose (B1.27): a trim through a tool that parses quotes and backslashes strips them from a title, or
# exits 1 on a lone ' or "
trim() { local s="$1"; s="${s#"${s%%[![:space:]]*}"}"; printf '%s' "${s%"${s##*[![:space:]]}"}"; }

GIT_TERMINAL_PROMPT=0 git fetch -q origin </dev/null 2>/dev/null || warn "git fetch failed; using the last fetched origin/main"
BASE=origin/main
git rev-parse -q --verify "$BASE^{commit}" >/dev/null || { warn "no origin/main; using HEAD"; BASE=HEAD; }
TMP="$(mktemp -d)"
trap 'rm -f "$TMP"/*; rmdir "$TMP"' EXIT
git show "$BASE:backlog/README.md" > "$TMP/readme"
: > "$TMP/cards"
for f in $(git ls-tree --name-only "$BASE" backlog/plan/ | grep -E '/E[^/]*\.md$'); do
  git show "$BASE:$f" | awk -v f="$f" '{print f "\t" $0}' >> "$TMP/cards"
done
GH_OK=1
gh pr list --state all --limit 300 --json headRefName,state,isDraft \
  --jq '.[] | [.headRefName, .state, (.isDraft | tostring)] | @tsv' </dev/null > "$TMP/prs" 2>/dev/null \
  || { GH_OK=0; : > "$TMP/prs"; warn "gh pr list failed; PR states unknown, every card branch counts as Doing"; }
git for-each-ref --format='%(refname)' refs/heads refs/remotes/origin \
  | sed -e 's#^refs/heads/##' -e 's#^refs/remotes/origin/##' | grep -v '^HEAD$' | sort -u > "$TMP/branches"
CURRENT="$(git symbolic-ref --short -q HEAD || true)"

card_text() { awk -F'\t' -v id="$1" '{ line = $0; sub(/^[^\t]*\t/, "", line) }
  line ~ "^### " id " · " { f = 1; print line; next } f && line ~ /^### / { exit } f { print line }' "$TMP/cards"; }
card_file() { awk -F'\t' -v id="$1" '{ line = $0; sub(/^[^\t]*\t/, "", line) } line ~ "^### " id " · " { print $1; exit }' "$TMP/cards"; }
branches_of() { # <card>: card branches, docs/ lanes excluded; B9.1 never matches B9.10
  local esc="${1//./\\.}"
  grep -E "^[a-z]+/$esc(-.*)?$" "$TMP/branches" | grep -v '^docs/' || true
}
pr_of() { awk -F'\t' -v b="$1" '$1 == b { print $2 "\t" $3; exit }' "$TMP/prs"; } # latest PR first in gh's order
state_of() { # <card> <status> → To do | Doing | Review | Closing; also sets HOLDERS (active branches)
  local card="$1" status="$2" b pr st draft doing=0 review=0 merged=0
  HOLDERS=""
  [[ "$status" == Partial ]] && { echo Closing; return; }
  for b in $(branches_of "$card"); do
    pr="$(pr_of "$b")"; st="${pr%%$'\t'*}"; draft="${pr#*$'\t'}"
    if [[ $GH_OK -eq 1 && "$st" == MERGED ]]; then merged=1; continue; fi
    if [[ $GH_OK -eq 1 && "$st" == CLOSED ]]; then continue; fi
    HOLDERS="$HOLDERS $b"
    if [[ $GH_OK -eq 1 && "$st" == OPEN && "$draft" == false ]]; then review=1; else doing=1; fi
  done
  if [[ $merged -eq 1 ]]; then echo Closing; elif [[ $doing -eq 1 ]]; then echo Doing; elif [[ $review -eq 1 ]]; then echo Review; else echo "To do"; fi
}

# One pass over the Remaining rows of origin/main: eligibility and board state.
rows="$(awk '/^## Remaining/{f=1;next} /^## /{f=0} f && /^\| *[0-9]+ *\|/' "$TMP/readme")"
: > "$TMP/board"
while IFS='|' read -r _ step id title spec status blocked owner size _; do
  id="$(trim "$id")"; [[ "$id" =~ ^B[0-9]+\.[0-9]+$ ]] || continue
  step="$(trim "$step")"; title="$(trim "$title")"; owner="$(trim "$owner")"
  spec="$(trim "$spec")"; blocked="$(trim "$blocked")"
  card="$(card_text "$id")"; file="$(card_file "$id")"
  cstatus="$(echo "$card" | sed -nE 's/^\*\*Status: ([A-Za-z]+)\*\*.*/\1/p' | head -1)"
  why=""
  open_deps="$(echo "$blocked" | tr ' ,' '\n\n' | grep -E '^B[0-9]+\.[0-9]+$' || true)" # ids NOT wrapped in ~~
  [[ -n "$open_deps" ]] && why="blocked by $(echo "$open_deps" | tr '\n' ' ')"
  [[ "$owner" =~ ^(Lead|Dev)$ ]] || why="${why:+$why; }owner $owner"
  if [[ -z "$file" ]]; then why="${why:+$why; }no card"; else
    echo "$card" | grep -qE '^\- \*\*Spec:\*\* §[0-9]+ — unchanged' || why="${why:+$why; }Spec: line missing or says change"
    echo "$card" | grep -qE '^\- \*\*Test:\*\* `[^`]+::[^`]+`' || why="${why:+$why; }Test: line missing"
    [[ "$cstatus" =~ ^(Open|Partial)$ ]] || why="${why:+$why; }status not Open/Partial"
  fi
  state="$(state_of "$id" "${cstatus:-Open}")"
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$step" "$id" "$title" "$owner" "$spec" "${cstatus:-?}" "$state" "${why:-eligible}" >> "$TMP/board"
done <<< "$rows"
doing="$(awk -F'\t' '$7 == "Doing" { printf "%s ", $2 }' "$TMP/board")"; doing="${doing% }"
n_doing="$(awk -F'\t' '$7 == "Doing"' "$TMP/board" | wc -l | tr -d ' ')"
wip_msg="WIP $n_doing/$WIP_LIMIT: Doing $doing"

case "$MODE" in
  list)
    printf '%-5s %-6s %-30s %-6s %-6s %-8s %-8s %s\n' STEP ID TITLE OWNER SPEC STATUS BOARD WHY
    while IFS=$'\t' read -r step id title owner spec cst state why; do
      printf '%-5s %-6s %-30s %-6s %-6s %-8s %-8s %s\n' "$step" "$id" "${title:0:30}" "$owner" "$spec" "$cst" "$state" "$why"
    done < "$TMP/board"
    exit 0 ;;
  pick)
    if [[ "$n_doing" -ge "$WIP_LIMIT" ]]; then echo "[next-task] $wip_msg; finish or hand one to Review first" >&2; exit 1; fi
    best="$(awk -F'\t' '$8 == "eligible" && $7 == "To do"' "$TMP/board" | sort -t$'\t' -k1,1n | head -1)"
    if [[ -z "$best" ]]; then
      echo "[next-task] nothing eligible and To do. Board:" >&2
      awk -F'\t' '{ printf "  %s: %s, %s\n", $2, $7, $8 }' "$TMP/board" >&2; exit 1
    fi
    id="$(echo "$best" | cut -f2)"; echo "$id $(card_file "$id")"; exit 0 ;;
  claim)
    state_of "$ARG" "$(card_text "$ARG" | sed -nE 's/^\*\*Status: ([A-Za-z]+)\*\*.*/\1/p' | head -1)" > /dev/null
    for b in $HOLDERS; do [[ "$b" == "$CURRENT" ]] && { echo "[next-task] $ARG: this checkout holds $b"; exit 0; }; done
    if [[ -n "${HOLDERS# }" ]]; then echo "[next-task] $ARG is already held by${HOLDERS}; work there or ask the lead" >&2; exit 1; fi
    if [[ "$n_doing" -ge "$WIP_LIMIT" ]]; then echo "[next-task] $wip_msg; $ARG waits" >&2; exit 1; fi
    echo "[next-task] $ARG may start ($wip_msg)"; exit 0 ;;
  check)
    paper() { case "$1" in backlog/* | spec/* | docs/metrics.md | docs/mistake-log.md) return 0 ;; esac; return 1; }
    mine="$("$HERE/ci/plan-files.sh" --any "$ARG" HEAD)" || { echo "[next-task] $ARG has no plan at HEAD" >&2; exit 1; }
    hit=0
    while IFS=$'\t' read -r _ other _ _ _ _ state _; do
      [[ "$other" == "$ARG" ]] && continue
      [[ "$state" == Doing || "$state" == Review ]] || continue
      state_of "$other" Open > /dev/null
      for b in $HOLDERS; do
        ref="$b"; git rev-parse -q --verify "refs/heads/$b" >/dev/null || ref="origin/$b"
        theirs="$("$HERE/ci/plan-files.sh" --any "$other" "$ref" 2>/dev/null || true)"
        while IFS= read -r a; do
          [[ -z "$a" ]] && continue; paper "$a" && continue
          while IFS= read -r t; do
            [[ -z "$t" ]] && continue; paper "$t" && continue
            # literal first: a path with [ ] never glob-matches itself
            if [[ "$a" == "$t" || "$a" == $t || "$t" == $a ]]; then echo "[next-task] $a also planned by $other ($state, $t on $b)"; hit=1; fi
          done <<< "$theirs"
        done <<< "$mine"
      done
    done < "$TMP/board"
    [[ $hit -eq 0 ]] && { echo "[next-task] $ARG: no overlap with any Doing or Review card"; exit 0; }
    exit 1 ;;
esac
