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
#   B1.57: G7 RUNNER_CHILD=7 (a run's env) → `Agent-Run: 7`, subject unchanged, on a commit, a clean merge, a conflicted
#   merge finished with `commit --no-edit`, `revert --no-edit` and `cherry-pick` (this checkout's prepare-commit-msg job)
#   G8 no RUNNER_CHILD → no `Agent-Run` trailer
#   review pass 1: G9 an amend under RUNNER_CHILD=9 of a commit carrying `Agent-Run: 7` → one trailer, `9`
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
  awk '/^prepare-commit-msg:/ { f = 1; print; next } f && /^[^ #]/ { exit } f { print }' lefthook.yml
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

# --- B1.57: the run's mark -----------------------------------------------------------------------------------------
mv "$TMP/m-nm" "$M/node_modules"; prepare "$M" > "$TMP/prep" 2>&1
g7() { (export RUNNER_CHILD=7; gc "$M" "$@") > /dev/null 2>&1; }
mark() { gc "$M" log -1 --format='%(trailers:key=Agent-Run,valueonly,separator=%x2C)|%s' "${1:-HEAD}"; } # one line
unset RUNNER_CHILD
g7 commit -q --allow-empty -m "chore: g7 plain"; m1="$(mark)"
gc "$M" checkout -q -b b7 && echo b > "$M/b7.txt" && gc "$M" add b7.txt && gc "$M" commit -q --no-verify -m "chore: b7"
gc "$M" checkout -q main && echo m > "$M/m7.txt" && gc "$M" add m7.txt && gc "$M" commit -q --no-verify -m "chore: m7"
g7 merge --no-edit b7; m2="$(mark)"
gc "$M" checkout -q -b c7 && echo c > "$M/f.txt" && gc "$M" add f.txt && gc "$M" commit -q --no-verify -m "chore: c7"
gc "$M" checkout -q main && echo d > "$M/f.txt" && gc "$M" add f.txt && gc "$M" commit -q --no-verify -m "chore: d7"
g7 merge c7; echo e > "$M/f.txt"; gc "$M" add f.txt; g7 commit --no-edit; m3="$(mark)"
echo r > "$M/r7.txt" && gc "$M" add r7.txt && gc "$M" commit -q --no-verify -m "chore: r7"
g7 revert --no-edit HEAD; m4="$(mark)"
gc "$M" checkout -q -b p7 main~1 && echo p > "$M/p7.txt" && gc "$M" add p7.txt && gc "$M" commit -q --no-verify -m "chore: p7"
gc "$M" checkout -q main; g7 cherry-pick p7; m5="$(mark)"
if [[ "$m1" == '7|chore: g7 plain' && "$m2" == "7|Merge branch 'b7'" && "$m3" == "7|Merge branch 'c7'" \
  && "$m4" == '7|Revert "chore: r7"' && "$m5" == '7|chore: p7' ]]; then ok G7; else fail "G7 $m1 / $m2 / $m3 / $m4 / $m5"; fi
(unset RUNNER_CHILD; gc "$M" commit -q --allow-empty -m "chore: g8 plain") > /dev/null 2>&1
[[ "$(mark)" == '|chore: g8 plain' ]] && ok G8 || fail "G8 $(mark)"
(export RUNNER_CHILD=9; gc "$M" commit -q --amend --no-edit --allow-empty) > /dev/null 2>&1
[[ "$(mark)" == '9|chore: g8 plain' ]] || { fail "G9 setup $(mark)"; }
g7 commit -q --allow-empty -m "chore: g9 plain"; (export RUNNER_CHILD=9; gc "$M" commit -q --amend --no-edit --allow-empty) > /dev/null 2>&1
[[ "$(mark)" == '9|chore: g9 plain' ]] && ok G9 || fail "G9 $(mark)"

echo "[githooks-smoke] $oks ok, $fails FAIL"
[[ $fails -eq 0 ]]
