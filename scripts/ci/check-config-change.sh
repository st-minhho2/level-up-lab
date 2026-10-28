#!/usr/bin/env bash
# Fail when lint / format / type / test / CI / hook configuration changed in a PR without the
# "config-change-approved" label. Why: weakening a gate is a team decision, never a side effect of a feature.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
. scripts/ci/lib.sh
resolve_range

PROTECTED='^(eslint\.config\.(mjs|js|cjs)|\.eslintrc.*|\.prettierrc.*|\.prettierignore|tsconfig.*\.json|lefthook\.yml|\.gitleaks\.toml|stryker\.config\.(mjs|js|json)|vitest\.config\.(ts|mts)|vitest\.setup\.ts|playwright\.config\.ts|\.github/.*|scripts/ci/.*|scripts/verify-red\.sh|scripts/next-task\.sh|scripts/card-status\.sh|\.claude/settings\.json|\.claude/hooks/.*)$'
changed="$(git diff --name-only "$BASE_SHA" "$HEAD_SHA" | grep -E "$PROTECTED" || true)"
if [[ -n "$changed" ]]; then
  if [[ "${CONFIG_CHANGE_APPROVED:-false}" == "true" ]]; then
    echo "[check-config-change] protected config changed, allowed by label config-change-approved:"
    echo "$changed"
    exit 0
  fi
  echo "::error::Protected configuration changed without the 'config-change-approved' label:"
  echo "$changed"
  exit 1
fi
echo "[check-config-change] OK: no protected config changed"
