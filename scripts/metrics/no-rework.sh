#!/usr/bin/env bash
# No-rework share (D-29, B1.57): after ready, an agent PR merges with no human-authored commit and no lead change
# request. Read-only; bash 3.2; gh only (its --jq). Rulings: work/B1.57/analysis.md.
#   ready    the PR's first ready_for_review (a later one is the run's own BEHIND round trip), else its creation
#            when it is not a draft
#   human    a commit after ready, up to the merge, without the `Agent-Run:` trailer that lefthook's prepare-commit-msg
#            job adds inside a run (RUNNER_CHILD); a GitHub "Update branch" merge counts
#   request  a PR comment or review by a user account (bots out) after ready and before the merge, run.sh's own
#            comments excepted (the lead opens every PR, so GitHub refuses a CHANGES_REQUESTED review)
#   verdict  yes (merged, 0 and 0) · no (merged with either, or closed unmerged) · pending (open: out of the share)
#   scripts/metrics/no-rework.sh [<pr>…]   default: every PR whose head is `<prefix>/<card>-agent`; any PR by number
#   output: TSV "pr card ready merged human_commits change_requests no_rework" (UTC ISO times; sha7s, comma-separated,
#           - none), then "no-rework <k>/<n> = <x.y> % (pending <m>)", or "no-rework n/a (pending <m>)" when n = 0
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
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
  | @tsv' # unattended.sh's filter, kept identical
TMPD="$(mktemp -d)"
trap 'rm -rf "$TMPD"' EXIT

if [[ $# -gt 0 ]]; then prs="$*"; else
  prs="$(gh pr list --state all --limit 1000 --json number,headRefName --jq '.[] | [.number, .headRefName] | @tsv' </dev/null \
    | awk -F'\t' '$2 ~ /^[a-z]+\/B[0-9]+\.[0-9]+-agent$/ { print $1 }' | sort -n)"
fi
printf 'pr\tcard\tready\tmerged\thuman_commits\tchange_requests\tno_rework\n'
k=0; n=0; p=0
for pr in $prs; do
  IFS="$(printf '\t')" read -r state head created merged < <(gh pr view "$pr" --json state,headRefName,isDraft,createdAt,mergedAt \
    --jq '[.state, .headRefName, (if .isDraft then "-" else .createdAt end), (.mergedAt // "-")] | @tsv' </dev/null)
  card="$(printf '%s\n' "${head#*/}" | grep -oE '^B[0-9]+\.[0-9]+' || true)"
  gh api --paginate "repos/{owner}/{repo}/issues/$pr/timeline" --jq "$TL" </dev/null > "$TMPD/p"
  ready="$(awk -F'\t' '$1 == "ready_for_review" { print $2 }' "$TMPD/p" | sort | head -1)"
  ready="${ready:-$created}"
  human="$(awk -F'\t' -v r="$ready" -v m="$merged" 'r != "-" && $1 == "committed" && $2 > r && (m == "-" || $2 <= m) \
    && $6 != "agent-run" { s = s (s == "" ? "" : ",") $5 } END { print s }' "$TMPD/p")"
  asks="$(awk -F'\t' -v r="$ready" -v m="$merged" 'r != "-" && ($1 == "commented" || $1 == "reviewed") && $3 == "User" \
    && $6 != "runner" && $6 != "gate-high" && $2 > r && (m == "-" || $2 < m) { c++ } END { print c + 0 }' "$TMPD/p")"
  if [[ "$state" == OPEN ]]; then verdict=pending; p=$((p + 1))
  else
    n=$((n + 1))
    if [[ "$state" == MERGED && -z "$human" && "$asks" -eq 0 ]]; then verdict=yes; k=$((k + 1)); else verdict=no; fi
  fi
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$pr" "${card:--}" "$ready" "$merged" "${human:--}" "$asks" "$verdict"
done
if [[ $n -eq 0 ]]; then echo "no-rework n/a (pending $p)"; else
  awk -v k="$k" -v n="$n" -v p="$p" 'BEGIN { printf "no-rework %d/%d = %.1f %% (pending %d)\n", k, n, 100 * k / n, p }'
fi
