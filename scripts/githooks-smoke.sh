#!/usr/bin/env bash
# Smoke for the shared git hooks (B1.19): every worktree runs Lefthook through the main checkout's binary, and a
# commit that cannot reach Lefthook, or runs in a checkout without node_modules, stops with the reason. Throwaway repo,
# a copy of this checkout's real lefthook binary, PATH pinned (git, node, /usr/bin:/bin). Exit 1 on any FAIL.
#   scripts/githooks-smoke.sh
#
#   G1 prepare in worktree X → the shared hook names M's binary (not X's) and holds the assert exit
#   G2 X's node_modules gone, commit from W (stub node_modules) → the hooks ran (marker written)
#   G3 M's binary gone too → the commit fails and names lefthook
#   G4 binary back, W without node_modules → the commit fails and says to run pnpm install
#   G5 commit from M → the hooks ran
#   G6 no usable binary in M → prepare falls back to X's and warns
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
REPO="$PWD"
EXE="$(node -e 'process.stdout.write(require(require("path").resolve("node_modules/lefthook/get-exe")).getExePath())')" \
  || { echo "[githooks-smoke] no lefthook in node_modules: pnpm install first" >&2; exit 1; }
PLAT_DIR="$(dirname "$(dirname "$EXE")")"   # node_modules/.pnpm/…/lefthook-<os>-<arch>
PLAT="$(basename "$PLAT_DIR")"

TMP="$(cd "$(mktemp -d)" && pwd -P)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT
fails=0; oks=0
ok() { oks=$((oks + 1)); echo "ok   $1"; }
fail() { fails=$((fails + 1)); echo "FAIL $1"; }

mkdir -p "$TMP/bin"
ln -s "$(command -v git)" "$TMP/bin/git"; ln -s "$(command -v node)" "$TMP/bin/node"
export PATH="$TMP/bin:/usr/bin:/bin" GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
unset LEFTHOOK LEFTHOOK_BIN
gc() { local d="$1"; shift; git -C "$d" -c user.name=s -c user.email=s@x -c commit.gpgsign=false "$@"; }
deps() { # deps <dir>: a node_modules with lefthook's get-exe and a copy of the real platform binary
  mkdir -p "$1/node_modules/lefthook" && cp "$REPO/node_modules/lefthook/get-exe.js" "$REPO/node_modules/lefthook/package.json" "$1/node_modules/lefthook/"
  cp -R "$PLAT_DIR" "$1/node_modules/$PLAT"
}

# --- fixture config: this checkout's top-level keys and node-modules job, plus a marker job --------------------------
MARK="$TMP/marker"
{
  grep -E '^(assert_lefthook_installed|no_auto_install):' lefthook.yml || true
  printf 'pre-commit:\n  piped: true\n  jobs:\n'
  awk '/^    - name: node-modules$/ { f = 1; print; next } f && /^    - / { exit } f { print }' lefthook.yml
  printf '    - name: mark\n      run: touch %s\n' "$MARK"
} > "$TMP/lefthook.yml"

M="$TMP/m"; X="$M/.worktrees/x"; W="$M/.claude/worktrees/w"
mkdir -p "$M" && gc "$M" init -q -b main
cp "$TMP/lefthook.yml" "$M/lefthook.yml"; printf 'node_modules\n.worktrees\n.claude\n' > "$M/.gitignore"
mkdir -p "$M/scripts"; [[ -f scripts/install-hooks.sh ]] && cp scripts/install-hooks.sh "$M/scripts/"
gc "$M" add -A && gc "$M" commit -q --no-verify -m init
gc "$M" worktree add -q -b x "$X" && gc "$M" worktree add -q -b w "$W"
deps "$M"; deps "$X"
HOOK="$(git -C "$M" rev-parse --path-format=absolute --git-common-dir)/hooks/pre-commit"
prepare() { # what `pnpm install` runs in <dir>: the repo's prepare, or today's `lefthook install` when it has none
  if [[ -x "$1/scripts/install-hooks.sh" ]]; then (cd "$1" && scripts/install-hooks.sh); else (cd "$1" && "$1/node_modules/$PLAT/bin/lefthook" install); fi
}
commit() { # commit <dir>: one change, output in $TMP/out, exit in $rc
  rm -f "$MARK"; date +%s%N >> "$1/f.txt"; gc "$1" add f.txt
  gc "$1" commit -q -m "x" > "$TMP/out" 2>&1; rc=$?
}

prepare "$X" > "$TMP/prep" 2>&1
grep -q "$M/node_modules/$PLAT/bin/lefthook" "$HOOK" && ! grep -q "$X/node_modules" "$HOOK" && grep -q 'Operation is aborted' "$HOOK" \
  && ok G1 || fail "G1 hook names: $(grep -o '/[^ ]*bin/lefthook' "$HOOK" | sort -u | tr '\n' ' ')"
rm -rf "$X/node_modules"; mkdir -p "$W/node_modules"
commit "$W"; [[ $rc -eq 0 && -f "$MARK" ]] && ok G2 || fail "G2 rc=$rc marker=$([[ -f $MARK ]] && echo yes || echo no) $(tail -1 "$TMP/out")"
mv "$M/node_modules" "$TMP/m-nm"
commit "$W"; [[ $rc -ne 0 ]] && grep -qi 'lefthook' "$TMP/out" && ok G3 || fail "G3 rc=$rc $(tail -1 "$TMP/out")"
mv "$TMP/m-nm" "$M/node_modules"; rm -rf "$W/node_modules"
commit "$W"; [[ $rc -ne 0 ]] && grep -q 'pnpm install' "$TMP/out" && ok G4 || fail "G4 rc=$rc $(tail -1 "$TMP/out")"
commit "$M"; [[ $rc -eq 0 && -f "$MARK" ]] && ok G5 || fail "G5 rc=$rc $(tail -1 "$TMP/out")"
mv "$M/node_modules" "$TMP/m-nm"; deps "$X"
prepare "$X" > "$TMP/prep" 2>&1
grep -qi 'warning' "$TMP/prep" && grep -q "$X/node_modules/$PLAT/bin/lefthook" "$HOOK" && ok G6 \
  || fail "G6 $(head -1 "$TMP/prep")"

echo "[githooks-smoke] $oks ok, $fails FAIL"
[[ $fails -eq 0 ]]
