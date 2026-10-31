#!/usr/bin/env bash
# `prepare` (B1.19): install the shared git hooks with the MAIN checkout's lefthook binary and THIS checkout's
# lefthook.yml. Every worktree shares .git/hooks, and lefthook embeds the absolute path of the binary that ran
# `install`; a worktree's own binary disappears when the worktree is pruned, the main checkout's does not.
#   scripts/install-hooks.sh   exit 0 installed · warning on stderr when it falls back to this checkout's binary ·
#                              exit ≠ 0 outside git or with no lefthook anywhere
# The main checkout's node_modules may hold another platform's binary (the devcontainer installs linux ones): a binary
# that does not run counts as missing. bash 3.2-safe.
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
MAIN="$(git worktree list --porcelain | awk '/^worktree / { print substr($0, 10); exit }')"
exe_in() { # exe_in <checkout>: its lefthook binary if one resolves and runs here
  local bin
  bin="$(cd "$1" && node -e 'process.stdout.write(require(require("path").resolve("node_modules/lefthook/get-exe")).getExePath())' 2>/dev/null)" || return 0
  "$bin" version >/dev/null 2>&1 && printf '%s' "$bin"
  return 0
}
BIN="$(exe_in "$MAIN")"
if [[ -z "$BIN" ]]; then
  BIN="$(exe_in "$ROOT")"
  [[ -n "$BIN" ]] || { echo "[install-hooks] no runnable lefthook in $MAIN or $ROOT: run pnpm install" >&2; exit 1; }
  [[ "$ROOT" == "$MAIN" ]] \
    || echo "[install-hooks] warning: the main checkout ($MAIN) has no runnable lefthook; the hooks name $BIN, which goes away with this checkout" >&2
fi
cd "$ROOT"
"$BIN" install
echo "[install-hooks] installed with $BIN, config $ROOT/lefthook.yml"
