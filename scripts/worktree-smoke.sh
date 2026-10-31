#!/usr/bin/env bash
# Smoke for the base of a new card branch in scripts/worktree.sh (B1.21): a throwaway main checkout with a bare
# origin, a `pnpm` shim on PATH (the install steps become no-ops) and a one-line .env.example, so worktree.sh runs to
# exit 0 without network or database. Exit 1 on any FAIL. bash 3.2-safe.
#   scripts/worktree-smoke.sh
#
#   K1 local main behind origin/main → the new branch starts at origin/main
#   K2 the new branch has no upstream
#   K3 an explicit [base] still wins
#   K4 origin unreachable after one fetch → a warning, the branch starts at the last fetched origin/main, exit 0
#   K5 no origin/main ref at all → the branch starts at main (review pass 1)
#   K6 an empty [base] means the default (review pass 1)
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
SCRIPT="$PWD/scripts/worktree.sh"

TMP="$(cd "$(mktemp -d)" && pwd -P)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT
fails=0; oks=0
ok() { oks=$((oks + 1)); echo "ok   $1"; }
fail() { fails=$((fails + 1)); echo "FAIL $1"; }
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
mkdir -p "$TMP/bin" && printf '#!/bin/sh\nexit 0\n' > "$TMP/bin/pnpm" && chmod +x "$TMP/bin/pnpm"
g() { local d="$1"; shift; git -C "$d" -c user.name=s -c user.email=s@x -c commit.gpgsign=false "$@" >/dev/null 2>&1; }

M="$TMP/m"; O="$TMP/origin.git"; P="$TMP/peer"
mkdir -p "$M" && g "$M" init -q -b main
printf 'DATABASE_URL=postgresql://u@localhost:5433/x\n' > "$M/.env.example"
printf '.worktrees\n.env\n' > "$M/.gitignore"
g "$M" add -A && g "$M" commit -q --no-verify -m one
git init -q --bare "$O" && g "$M" remote add origin "$O" && g "$M" push -q origin main
git clone -q -b main "$O" "$P" 2>/dev/null
echo two > "$P/two.txt" && g "$P" add -A && g "$P" commit -q --no-verify -m two && g "$P" push -q origin main
TIP="$(git -C "$O" rev-parse main)"; OLD="$(git -C "$M" rev-parse main)"
wt() { # wt <branch> [base]: worktree.sh from M; output in $TMP/out, exit in $rc
  (cd "$M" && env -u CLAUDE_CODE_CHILD_SESSION PATH="$TMP/bin:$PATH" "$SCRIPT" "$@") > "$TMP/out" 2>&1; rc=$?
}
start_of() { git -C "$M" rev-parse "$1" 2>/dev/null; }

wt feat/B9.1-a
[[ $rc -eq 0 && "$(start_of feat/B9.1-a)" == "$TIP" ]] && ok K1 || fail "K1 rc=$rc start=$(start_of feat/B9.1-a) origin=$TIP local=$OLD"
[[ -z "$(git -C "$M" rev-parse --abbrev-ref feat/B9.1-a@{upstream} 2>/dev/null)" ]] && ok K2 \
  || fail "K2 upstream $(git -C "$M" rev-parse --abbrev-ref feat/B9.1-a@{upstream})"
wt feat/B9.2-a "$OLD"
[[ $rc -eq 0 && "$(start_of feat/B9.2-a)" == "$OLD" ]] && ok K3 || fail "K3 rc=$rc start=$(start_of feat/B9.2-a) want=$OLD"
echo three > "$P/three.txt" && g "$P" add -A && g "$P" commit -q --no-verify -m three && g "$P" push -q origin main
git -C "$M" fetch -q origin 2>/dev/null; FETCHED="$(git -C "$M" rev-parse origin/main)"
g "$M" remote set-url origin "$TMP/gone.git"
wt feat/B9.3-a
[[ $rc -eq 0 && "$(start_of feat/B9.3-a)" == "$FETCHED" ]] && grep -qi 'warning' "$TMP/out" && ok K4 \
  || fail "K4 rc=$rc start=$(start_of feat/B9.3-a) want=$FETCHED $(grep -i warn "$TMP/out" | head -1)"

wt feat/B9.6-a ""
[[ $rc -eq 0 && "$(start_of feat/B9.6-a)" == "$FETCHED" ]] && ok K6 || fail "K6 rc=$rc start=$(start_of feat/B9.6-a) want=$FETCHED"
g "$M" remote remove origin
wt feat/B9.5-a
[[ $rc -eq 0 && "$(start_of feat/B9.5-a)" == "$OLD" ]] && ok K5 || fail "K5 rc=$rc start=$(start_of feat/B9.5-a) want=$OLD (main)"

echo "[worktree-smoke] $oks ok, $fails FAIL"
[[ $fails -eq 0 ]]
