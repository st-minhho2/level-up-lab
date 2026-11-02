#!/usr/bin/env bash
# Fail when lint / format / type / test / CI / hook configuration or agent instructions (.claude agents, skills,
# rules, docs) changed in a PR without the "config-change-approved" label. Why: weakening a gate is a team decision,
# never a side effect of a feature. The list is CONFIG_PROTECTED in scripts/ci/lib.sh (scripts/agent/tier.sh reads it too).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
. scripts/ci/lib.sh
resolve_range

changed="$(git diff --name-only "$BASE_SHA" "$HEAD_SHA" | grep -E "$CONFIG_PROTECTED" || true)"
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
