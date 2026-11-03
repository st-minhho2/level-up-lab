#!/usr/bin/env bash
# Unattended share (D-29, B1.57): an `agent-ready` issue reaches a ready PR with no lead message in between, an
# expected high-tier gate stop (D-27) excepted. Read-only; bash 3.2; gh only (its --jq). Rulings: work/B1.57/analysis.md.
#   PR       the highest-numbered `<prefix>/<card>-agent` PR (run.sh's branch), card from the issue form's "Card id"
#   window   the latest `agent-ready` label at or before ready → ready (the PR's first ready_for_review, else its
#            creation when it is not a draft; a later ready is the run's own BEHIND round trip)
#   message  an issue or PR comment or review by a user account (bots out) inside the window, except run.sh's own
#            comments (posted with the lead's login) and one comment starting with the word `approve` after a runner
#            `**gate**` comment with `- tier: high` and before the next runner comment (the expected gate)
#   verdict  yes (0 messages) · no (≥ 1, or closed with no ready PR) · pending (open, no ready PR: out of the share)
#   scripts/metrics/unattended.sh [<issue>…]   default: every issue labeled agent-ready now (a batch: give its ids,
#                                              an issue unlabeled after a stopped run is not listed)
#   output: TSV "issue card pr labeled ready messages unattended" (UTC ISO times, - none), then
#           "unattended <k>/<n> = <x.y> % (pending <m>)", or "unattended n/a (pending <m>)" when n = 0
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
# one TSV row per event that matters: event, time, poster type, label, sha7, class of the body or message
TL='.[] | select(.event == "labeled" or .event == "commented" or .event == "reviewed" or .event == "ready_for_review"
    or .event == "committed")
  | (.body // .message // "") as $b
  | [.event, (.created_at // .submitted_at // .committer.date // "-"), (.user.type // .actor.type // "-"),
     (.label.name // "-"), ((.sha // "-")[0:7]),
     (if ($b | startswith("Runner (`scripts/agent/run.sh`")) then
        (if ($b | contains("**gate**")) and ($b | test("(\\A|\\n)- tier: high(\\n|\\z)")) then "gate-high" else "runner" end)
      elif ($b | test("\\A\\s*approve([^A-Za-z]|\\z)")) then "approve"
      elif ($b | test("(\\A|\\n)Agent-Run: ")) then "agent-run"
      else "-" end)]
  | @tsv'
TMPD="$(mktemp -d)"
trap 'rm -rf "$TMPD"' EXIT

prs="$(gh pr list --state all --limit 1000 --json number,headRefName --jq '.[] | [.number, .headRefName] | @tsv' </dev/null)"
if [[ $# -gt 0 ]]; then issues="$*"; else
  issues="$(gh issue list --label agent-ready --state all --limit 1000 --json number --jq '.[].number' </dev/null | sort -n)"
fi
printf 'issue\tcard\tpr\tlabeled\tready\tmessages\tunattended\n'
k=0; n=0; p=0
for i in $issues; do
  info="$(gh issue view "$i" --json state,body --jq '.state, .body' </dev/null)"
  state="$(head -1 <<< "$info")"
  card="$(tail -n +2 <<< "$info" | awk '/^### / { f = ($0 ~ /^### Card id[[:space:]]*$/); next }
    f && NF { gsub(/[[:space:]]/, ""); print; exit }')"
  esc="${card//./[.]}" # awk -v would read \. as a plain dot
  pr=""; [[ -n "$card" ]] && pr="$(awk -F'\t' -v re="^[a-z]+/$esc-agent\$" '$2 ~ re { print $1 }' <<< "$prs" | sort -n | tail -1)"
  gh api --paginate "repos/{owner}/{repo}/issues/$i/timeline" --jq "$TL" </dev/null > "$TMPD/i"
  : > "$TMPD/p"; ready="-"
  if [[ -n "$pr" ]]; then
    gh api --paginate "repos/{owner}/{repo}/issues/$pr/timeline" --jq "$TL" </dev/null > "$TMPD/p"
    ready="$(awk -F'\t' '$1 == "ready_for_review" { print $2 }' "$TMPD/p" | sort | head -1)"
    [[ -n "$ready" ]] || ready="$(gh pr view "$pr" --json state,headRefName,isDraft,createdAt,mergedAt \
      --jq 'if .isDraft then "-" else .createdAt end' </dev/null)"
  fi
  labeled="$(awk -F'\t' -v r="$ready" '$1 == "labeled" && $4 == "agent-ready" && (r == "-" || $2 <= r) { print $2 }' "$TMPD/i" \
    | sort | tail -1)"
  labeled="${labeled:--}"
  msgs="$(cat "$TMPD/i" "$TMPD/p" | sort -t "$(printf '\t')" -k2,2 -s | awk -F'\t' -v l="$labeled" -v r="$ready" '
    ($1 != "commented" && $1 != "reviewed") || $3 != "User" { next }
    $6 == "gate-high" { gate = 1; next }
    $6 == "runner" { gate = 0; next }
    (l != "-" && $2 <= l) || (r != "-" && $2 >= r) { next }
    $6 == "approve" && gate { gate = 0; next }
    { m++ }
    END { print m + 0 }')"
  if [[ "$ready" == "-" ]]; then
    if [[ "$state" == OPEN ]]; then verdict=pending; else verdict=no; fi
  elif [[ "$msgs" -eq 0 ]]; then verdict=yes; else verdict=no; fi
  case "$verdict" in pending) p=$((p + 1)) ;; yes) k=$((k + 1)); n=$((n + 1)) ;; *) n=$((n + 1)) ;; esac
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$i" "${card:--}" "${pr:--}" "$labeled" "$ready" "$msgs" "$verdict"
done
if [[ $n -eq 0 ]]; then echo "unattended n/a (pending $p)"; else
  awk -v k="$k" -v n="$n" -v p="$p" 'BEGIN { printf "unattended %d/%d = %.1f %% (pending %d)\n", k, n, 100 * k / n, p }'
fi
