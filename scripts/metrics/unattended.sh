#!/usr/bin/env bash
# Unattended share (D-29, B1.57): an `agent-ready` issue reaches a ready PR with no lead message in between, an
# expected high-tier gate stop (D-27) excepted. Read-only; bash 3.2; gh only (its --jq). Rulings: work/B1.57/analysis.md.
#   PR       the highest-numbered `<prefix>/<card>-agent` PR (run.sh's branch), card from the issue form's "Card id"
#   window   the latest `agent-ready` label at or before ready → ready: the latest ready_for_review at or before the
#            PR's first `pr-step-ready` label (scripts/pr-step.sh adds it right after its own ready, B1.83: gh acts
#            under the lead's login, so the label is what tells the wrapper's ready from a click); a PR without that
#            pairing (it predates the label) keeps the old rule: its first ready_for_review, else its creation when it
#            is not a draft. A later ready is the run's own BEHIND round trip
#   touches  ready_for_review events before ready: each was undone (a ready event needs a draft), so a person's; never
#            a message, and 0 under the old rule, which cannot see them
#   message  an issue or PR comment or review by a user account (bots out) inside the window, except run.sh's own
#            comments (posted with the lead's login) and one comment starting with the word `approve` after a runner
#            `**gate**` comment with `- tier: high` and before the next runner comment (the expected gate)
#   stops    run.sh's comments inside the window whose outcome (the first word of their `- outcome:` line, `?` with
#            none) is not `ready` and that are not that high-tier gate: the run stopped (`ended` for a ruling, `limit`,
#            `error`, a refused `gate`) and the lead relaunched it (B1.98: #276, #277)
#   human    the PR's commits inside the window without the `Agent-Run:` trailer that a run's commits carry
#            (no-rework.sh's rule, moved before ready; B1.98: #277's merge repair)
#   verdict  yes (0 messages, no stop, no human commit) · no (any, or closed with no ready PR) · pending (open, no
#            ready PR: out of the share)
#   scripts/metrics/unattended.sh [<issue>…]   default: every issue labeled agent-ready now (a batch: give its ids,
#                                              an issue unlabeled after a stopped run is not listed)
#   output: TSV "issue card pr labeled ready messages unattended touches stops human_commits" (UTC ISO times; stops
#           comma-separated outcomes, human_commits comma-separated sha7s; - none), then
#           "unattended <k>/<n> = <x.y> % (pending <m>)", or "unattended n/a (pending <m>)" when n = 0
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
# one TSV row per event that matters: event, time, poster type, label, sha7, class of the body or message, and a
# runner comment's outcome (its `- outcome:` line's first word: the bold word drops `:<subtype>`, run.sh comment())
TL='.[] | select(.event == "labeled" or .event == "commented" or .event == "reviewed" or .event == "ready_for_review"
    or .event == "committed")
  | (.body // .message // "") as $b
  | [.event, (.created_at // .submitted_at // .committer.date // "-"), (.user.type // .actor.type // "-"),
     (.label.name // "-"), ((.sha // "-")[0:7]),
     (if ($b | startswith("Runner (`scripts/agent/run.sh`")) then
        (if ($b | contains("**gate**")) and ($b | test("(\\A|\\n)- tier: high(\\n|\\z)")) then "gate-high" else "runner" end)
      elif ($b | test("\\A\\s*approve([^A-Za-z]|\\z)")) then "approve"
      elif ($b | test("(\\A|\\n)Agent-Run: ")) then "agent-run"
      else "-" end),
     (if ($b | startswith("Runner (`scripts/agent/run.sh`")) then
        ((($b | capture("(\\A|\\n)- outcome: (?<o>[^ \\n]+)")) | .o) // "?")
      else "-" end)]
  | @tsv'
TMPD="$(mktemp -d)"
trap 'rm -rf "$TMPD"' EXIT

prs="$(gh pr list --state all --limit 1000 --json number,headRefName --jq '.[] | [.number, .headRefName] | @tsv' </dev/null)"
if [[ $# -gt 0 ]]; then issues="$*"; else
  issues="$(gh issue list --label agent-ready --state all --limit 1000 --json number --jq '.[].number' </dev/null | sort -n)"
fi
printf 'issue\tcard\tpr\tlabeled\tready\tmessages\tunattended\ttouches\tstops\thuman_commits\n'
k=0; n=0; p=0
for i in $issues; do
  info="$(gh issue view "$i" --json state,body --jq '.state, .body' </dev/null)"
  state="$(head -1 <<< "$info")"
  card="$(tail -n +2 <<< "$info" | awk '/^### / { f = ($0 ~ /^### Card id[[:space:]]*$/); next }
    f && NF { gsub(/[[:space:]]/, ""); print; exit }')"
  esc="${card//./[.]}" # awk -v would read \. as a plain dot
  pr=""; [[ -n "$card" ]] && pr="$(awk -F'\t' -v re="^[a-z]+/$esc-agent\$" '$2 ~ re { print $1 }' <<< "$prs" | sort -n | tail -1)"
  gh api --paginate "repos/{owner}/{repo}/issues/$i/timeline" --jq "$TL" </dev/null > "$TMPD/i"
  : > "$TMPD/p"; ready="-"; touches=0
  if [[ -n "$pr" ]]; then
    gh api --paginate "repos/{owner}/{repo}/issues/$pr/timeline" --jq "$TL" </dev/null > "$TMPD/p"
    tag="$(awk -F'\t' '$1 == "labeled" && $4 == "pr-step-ready" { print $2 }' "$TMPD/p" | sort | head -1)"
    ready=""; [[ -n "$tag" ]] && ready="$(awk -F'\t' -v t="$tag" '$1 == "ready_for_review" && $2 <= t { print $2 }' "$TMPD/p" \
      | sort | tail -1)"
    if [[ -n "$ready" ]]; then
      touches="$(awk -F'\t' -v r="$ready" '$1 == "ready_for_review" && $2 < r { c++ } END { print c + 0 }' "$TMPD/p")"
    else ready="$(awk -F'\t' '$1 == "ready_for_review" { print $2 }' "$TMPD/p" | sort | head -1)"; fi
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
  # the same window, bounds excluded as for messages; the high-tier gate is class gate-high, never "runner"
  stops="$(cat "$TMPD/i" "$TMPD/p" | sort -t "$(printf '\t')" -k2,2 -s | awk -F'\t' -v l="$labeled" -v r="$ready" '
    $1 == "commented" && $6 == "runner" && $7 != "ready" && (l == "-" || $2 > l) && (r == "-" || $2 < r) \
      { s = s (s == "" ? "" : ",") $7 } END { print s }')"
  human="$(awk -F'\t' -v l="$labeled" -v r="$ready" '$1 == "committed" && $6 != "agent-run" \
    && (l == "-" || $2 > l) && (r == "-" || $2 < r) { s = s (s == "" ? "" : ",") $5 } END { print s }' "$TMPD/p")"
  if [[ "$ready" == "-" ]]; then
    if [[ "$state" == OPEN ]]; then verdict=pending; else verdict=no; fi
  elif [[ "$msgs" -eq 0 && -z "$stops" && -z "$human" ]]; then verdict=yes; else verdict=no; fi
  case "$verdict" in pending) p=$((p + 1)) ;; yes) k=$((k + 1)); n=$((n + 1)) ;; *) n=$((n + 1)) ;; esac
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$i" "${card:--}" "${pr:--}" "$labeled" "$ready" "$msgs" "$verdict" \
    "$touches" "${stops:--}" "${human:--}"
done
if [[ $n -eq 0 ]]; then echo "unattended n/a (pending $p)"; else
  awk -v k="$k" -v n="$n" -v p="$p" 'BEGIN { printf "unattended %d/%d = %.1f %% (pending %d)\n", k, n, 100 * k / n, p }'
fi
