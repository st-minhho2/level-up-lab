#!/usr/bin/env bash
# May the runner take this issue (B1.43, D-27)? The `agent-ready` label is the lead's spec approval, so it counts only
# when its most recent `labeled` event comes from a collaborator with write access, and only on an issue whose author
# has write access too: anyone else could edit the body after the label and change what was approved.
#   scripts/agent/eligible.sh <issue-number> [<card>]
#   exit 0  stdout "eligible: #<n> agent-ready labeled by <login> (<role>), author <login> (<role>)[, card <card>]"
#   exit 1  stderr "eligible: …" with the reason (usage, label missing, permission, a failed gh call)
# With <card> (plan-files.sh's D-27 check, B1.55) the issue must also be open and its form field "Card id" must equal
# <card>: closing the issue withdraws the approval, and an issue approves only the card it names.
# The legacy `.permission` field decides (admin|write|read|none: maintain reads as write, triage as read), so a custom
# role counts by its base. Runs gh from this repository's root with GH_REPO and GH_HOST unset, so {owner}/{repo} is
# always this checkout's origin. bash 3.2-safe.
set -uo pipefail
LABEL=agent-ready
usage() { echo "eligible: usage: scripts/agent/eligible.sh <issue-number> [<card>]" >&2; exit 1; }
[[ ( $# -eq 1 || ( $# -eq 2 && "${2:-}" =~ ^B[0-9]+\.[0-9]+$ ) ) && "$1" =~ ^[1-9][0-9]*$ ]] || usage
n="$1"; card="${2:-}"
cd "$(dirname "$0")/../.." || exit 1
no() { echo "eligible: #$n $*" >&2; exit 1; }
ghq() { # ghq <gh args…>: stdout of the call; a failure stops with gh's first stderr line
  local out
  out="$(env -u GH_REPO -u GH_HOST gh "$@" 2> "$err")" || no "gh failed: $(head -1 "$err")"
  printf '%s\n' "$out"
}
err="$(mktemp)"; trap 'rm -f -- "$err"' EXIT

issue="$(ghq api "repos/{owner}/{repo}/issues/$n" --jq '.user.login, .labels[].name')" || exit 1
author="$(printf '%s\n' "$issue" | head -1)"
printf '%s\n' "$issue" | tail -n +2 | grep -qxF "$LABEL" || no "not labeled $LABEL"
if [[ -n "$card" ]]; then
  form="$(ghq api "repos/{owner}/{repo}/issues/$n" --jq '.state, (.body // "")')" || exit 1
  [[ "$(printf '%s\n' "$form" | head -1)" == open ]] || no "is $(printf '%s\n' "$form" | head -1), needs open"
  named="$(printf '%s\n' "$form" | tail -n +2 | awk '
    /^### / { f = ($0 ~ /^### Card id[[:space:]]*$/); next }
    f && NF { sub(/^[[:space:]]+/, ""); sub(/[[:space:]]+$/, ""); print; exit }')"
  [[ "$named" == "$card" ]] || no "card id ${named:-(none)}, not $card"
fi

events="$(ghq api --paginate "repos/{owner}/{repo}/issues/$n/events" \
  --jq '.[] | select((.event == "labeled" or .event == "unlabeled") and .label.name == "agent-ready") | [.event, (.actor.login // "")] | @tsv')" \
  || exit 1
last="$(printf '%s\n' "$events" | tail -1)"
[[ "${last%%$'\t'*}" == labeled ]] || no "label's last event is not labeled"
labeler="${last#*$'\t'}"
[[ -n "$labeler" ]] || no "label's last event has no actor"

role() { # role <who> <login>: "<role_name>" when the permission is admin or write, else stops with the reason
  local p
  p="$(ghq api "repos/{owner}/{repo}/collaborators/$2/permission" --jq '[.permission, .role_name] | @tsv')" || exit 1
  case "${p%%$'\t'*}" in
    admin | write) printf '%s\n' "${p#*$'\t'}" ;;
    *) no "$1 $2 has ${p%%$'\t'*} (${p#*$'\t'}), needs write" ;;
  esac
}
labeler_role="$(role labeler "$labeler")" || exit 1
author_role="$(role author "$author")" || exit 1
echo "eligible: #$n $LABEL labeled by $labeler ($labeler_role), author $author ($author_role)${card:+, card $card}"
