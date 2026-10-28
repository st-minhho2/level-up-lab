#!/usr/bin/env bash
# Stop / SubagentStop hook. If src/, e2e/ or prisma/ changed on this branch and the change's fingerprint is not
# the one mark-reviewed.sh recorded, block the stop once per session with the review instructions.
set -uo pipefail
. "$(dirname "$0")/lib.sh"
. "$(dirname "$0")/review-lib.sh"
[[ "$(json_field stop_hook_active)" == "true" ]] && exit 0
cd "${CLAUDE_PROJECT_DIR:-$PWD}" || exit 0
review_change_exists || exit 0
fp="$(review_fingerprint)"
[[ "$fp" == "$(review_recorded)" ]] && exit 0
SESSION="$(json_field session_id)"
mkdir -p "$REVIEW_STATE_DIR"
WARNED="$REVIEW_STATE_DIR/gate-warned"
if [[ -n "$SESSION" ]] && grep -qx "$SESSION" "$WARNED" 2>/dev/null; then
  exit 0 # blocked once already in this session; the agent chose to stop with the review incomplete
fi
[[ -n "$SESSION" ]] && printf '%s\n' "$SESSION" >> "$WARNED"
cat <<JSON
{"decision":"block","reason":"Unreviewed change under src/, e2e/ or prisma/ (fingerprint $fp). Do not stop here. Run the review-loop skill: re-read every changed file, run the tech-lead agent in diff-review mode, give every finding a disposition (fix now / no change needed with the proving input / out of scope), fix and re-verify (at most 3 passes), then clear the gate with .claude/hooks/mark-reviewed.sh. If you are stopping deliberately with the review incomplete, say so to the user and name what is unreviewed; do not clear the gate to silence it."}
JSON
exit 0
