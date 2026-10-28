#!/usr/bin/env bash
# Clears the review gate for the current change: re-runs lint, typecheck and unit tests, then records the
# fingerprint require-review.sh compares against. Run from the tree you changed, after /review-loop is clean.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
export CLAUDE_PROJECT_DIR="$PWD"
. "$(dirname "$0")/review-lib.sh"
echo "[mark-reviewed] lint" && pnpm lint >/dev/null
echo "[mark-reviewed] typecheck" && pnpm typecheck >/dev/null
echo "[mark-reviewed] test" && pnpm test >/dev/null
mkdir -p "$REVIEW_STATE_DIR"
fp="$(review_fingerprint)"
printf '%s\n' "$fp" > "$REVIEW_STATE_DIR/reviewed"
rm -f "$REVIEW_STATE_DIR/gate-warned"
echo "[mark-reviewed] gate cleared for fingerprint $fp. Report the review disposition table in your summary."
