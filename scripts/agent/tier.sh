#!/usr/bin/env bash
# A plan's risk tier (B1.44, D-28), derived from its Files table and never chosen by an agent: the lead's review depth
# and, after B1.55, whether a reviewed agent-ready plan may pass without the lead both follow it.
#   scripts/agent/tier.sh <plan.md>   stdout high | medium | low · exit 2 usage, unreadable plan, no Files token
# Each token (scripts/ci/plan-files.sh --file) is rated and the highest wins. A literal path: high under prisma/, for
# package.json, pnpm-lock.yaml, .env.example, src/lib/env.ts, or a CONFIG_PROTECTED path (scripts/ci/lib.sh, the
# label's own list); medium under src/ e2e/ spec/ scripts/; low otherwise. A glob covers files that do not exist yet,
# so it is high unless the text before its first `*` lies under src/ e2e/ spec/ backlog/ docs/; there it rates as the
# highest of itself (`*` read as a name) and every tracked file it covers by plan_lists (`src/*` covers src/lib/env.ts).
# Reads git and files only; runs from its own repository root wherever it is called from. bash 3.2-safe.
set -uo pipefail
usage() { echo "tier: usage: scripts/agent/tier.sh <plan.md>" >&2; exit 2; }
[[ $# -eq 1 && -n "$1" ]] || usage
[[ -f "$1" && -r "$1" ]] || { echo "tier: cannot read $1" >&2; exit 2; }
plan="$(cd "$(dirname "$1")" && pwd -P)/$(basename "$1")"
cd "$(dirname "$0")/../.." || exit 2
. scripts/ci/lib.sh

rank() { # rank <path>: 2 high, 1 medium, 0 low
  case "$1" in
    prisma/* | package.json | pnpm-lock.yaml | .env.example | src/lib/env.ts) echo 2; return ;;
  esac
  [[ "$1" =~ $CONFIG_PROTECTED ]] && { echo 2; return; }
  case "$1" in src/* | e2e/* | spec/* | scripts/*) echo 1 ;; *) echo 0 ;; esac
}
rank_glob() { # rank_glob <token with *>
  local best f r
  case "${1%%\**}" in src/* | e2e/* | spec/* | backlog/* | docs/*) ;; *) echo 2; return ;; esac
  best="$(rank "${1//\*/x}")"
  while IFS= read -r f; do
    [[ $best -eq 2 ]] && break
    plan_lists "$f" "$1" || continue
    r="$(rank "$f")"; [[ $r -gt $best ]] && best=$r
  done < <(git ls-files)
  echo "$best"
}

tokens="$(scripts/ci/plan-files.sh --file "$plan")" || exit 2
[[ -n "$tokens" ]] || { echo "tier: no Files token in $1" >&2; exit 2; }
top=0
while IFS= read -r t; do
  [[ -n "$t" ]] || continue
  if [[ "$t" == *'*'* ]]; then r="$(rank_glob "$t")"; else r="$(rank "$t")"; fi
  [[ $r -gt $top ]] && top=$r
done <<< "$tokens"
case $top in 2) echo high ;; 1) echo medium ;; *) echo low ;; esac
