# Source only. The review gate: a fingerprint of src/, e2e/ and prisma/ (tracked diff + untracked files) against
# the branch base, recorded by mark-reviewed.sh after the checks pass, compared by require-review.sh on Stop.
REVIEW_STATE_DIR="${CLAUDE_PROJECT_DIR:-$PWD}/node_modules/.cache/level-up-lab"
review_base() { git merge-base origin/main HEAD 2>/dev/null || git merge-base main HEAD 2>/dev/null || git rev-parse HEAD; }
review_fingerprint() {
  local base; base="$(review_base)"
  {
    git diff "$base" -- src e2e prisma 2>/dev/null
    git ls-files --others --exclude-standard -- src e2e prisma 2>/dev/null | while IFS= read -r f; do printf '%s\n' "$f"; cat "$f"; done
  } | { if command -v shasum >/dev/null 2>&1; then shasum -a 256; else sha256sum; fi; } | cut -c1-16
}
review_change_exists() {
  local base; base="$(review_base)"
  [[ -n "$(git diff --name-only "$base" -- src e2e prisma 2>/dev/null)$(git ls-files --others --exclude-standard -- src e2e prisma 2>/dev/null)" ]]
}
review_recorded() { [[ -f "$REVIEW_STATE_DIR/reviewed" ]] && cat "$REVIEW_STATE_DIR/reviewed"; }
