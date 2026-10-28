#!/usr/bin/env bash
# PreToolUse hook for Read. Blocks secret files: .env* (except .env.example), key material, credential stores.
set -uo pipefail
. "$(dirname "$0")/lib.sh"
FILE="$(json_field tool_input.file_path)"
[[ -z "$FILE" ]] && exit 0
case "$(basename "$FILE")" in
  .env.example) exit 0 ;;
  .env|.env.*|id_rsa|id_ed25519|id_ecdsa|*.pem|*.p12|*.key|credentials|.netrc|.npmrc|.pypirc)
    block "guard-read.sh" "'$FILE' may contain secrets. Read .env.example instead or ask the human." ;;
esac
case "$FILE" in
  */.ssh/*|*/.aws/*|*/.kube/*|*/.docker/config.json)
    block "guard-read.sh" "'$FILE' is credential storage." ;;
esac
exit 0
