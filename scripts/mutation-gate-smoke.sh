#!/usr/bin/env bash
# Probes MG1–MG17 of scripts/mutation-gate.sh (B1.100) on a throwaway repo with a `pnpm` shim that logs every
# Stryker call and prints the score line Stryker prints. Not in any CI job: CI's `mutation` job runs Stryker itself.
#   scripts/mutation-gate-smoke.sh
#   MG1 docs-only diff: CI-only line, exit 0, no Stryker     MG2 src/components + src/app only: same
#   MG3 a src/lib change: one call, --mutate that file only    MG4 same tree again: no call, "reused", same exit
#   MG5 an uncommitted edit of src/lib: runs again             MG6 a test-only change mutates its source file
#   MG7 an untracked src/actions file is mutated               MG8 only src/lib/prisma.ts or a deleted file: whole layer
#   MG9 below the bar (Stryker's own "score 50.00 under breaking threshold" line): exit 1, the reuse keeps exit 1
#   MG10 --force runs on an unchanged tree
#   MG11 a change of any keyed file (stryker.config.mjs, vitest.stryker.config.mts, tsconfig.json, package.json,
#        pnpm-lock.yaml) runs again; so does the same tree under another --base (another mutate list)
#   MG12 the base is the merge-base: main's own lib commits are not the card's
#   MG13 only src/lib/CLAUDE.md, src/actions/CLAUDE.md: CI-only line, no Stryker
#   MG14 a subset of 0 mutants: the whole layer once in the same call, exit 0; no score at all: "?", exit 1
#   MG15 a subset with mutants no test reaches: no fallback, "? %, no test reaches it", exit 1
#   MG16 a subset scored NaN (every mutant a compile error, Stryker exits 0): the whole layer once, exit 0; a whole
#        layer scored NaN: "?", exit 1
#   MG17 usage: `--base` without a ref, or an unknown argument → exit 2, the usage on stderr, no Stryker
set -uo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)/mutation-gate.sh"
TMP="$(mktemp -d)"; trap 'rm -rf -- "$TMP"' EXIT
REPO="$TMP/repo"; LOG="$TMP/stryker.log"; mkdir -p "$TMP/bin" "$REPO"
oks=0; fails=0
ok() { echo "ok   $1"; oks=$((oks + 1)); }
fail() { echo "FAIL $1"; fails=$((fails + 1)); }
g() { git -C "$REPO" -c user.name=s -c user.email=s@x -c commit.gpgsign=false "$@" >/dev/null 2>&1; }
put() { mkdir -p "$(dirname "$REPO/$1")" && printf '%s\n' "${2:-x}" > "$REPO/$1"; }

# FAKE_NOSCORE: "mutate" prints no score line for a --mutate call (Stryker's "No tests were executed"), "all" never;
# FAKE_MUTANTS: the mutant count Stryker instrumented before it stopped (default 0, a type-only file)
printf '%s\n' '#!/bin/bash' "echo \"\$*\" >> '$LOG'" \
  'case "${FAKE_NOSCORE:-}:$*" in all:* | mutate:*--mutate*)' \
  '  echo "INFO Instrumenter Instrumented 1 source file(s) with ${FAKE_MUTANTS:-0} mutant(s)"' \
  '  echo "ERROR Stryker No tests were executed. Stryker will exit prematurely."; exit "${FAKE_RC:-1}" ;; esac' \
  's="${FAKE_SCORE:-85.00}"; case "$*" in *--mutate*) s="${FAKE_SUBSCORE:-$s}" ;; esac # FAKE_SUBSCORE: a --mutate call' \
  '[[ -n "${FAKE_UNDER:-}" ]] && { echo "ERROR Final mutation score $s under breaking threshold 70, setting exit code to 1 (failure)."; exit 1; }' \
  'echo "Final mutation score of $s is greater than or equal to break threshold 70"' \
  'exit "${FAKE_RC:-0}"' > "$TMP/bin/pnpm"
chmod +x "$TMP/bin/pnpm"

g init -q -b main
for f in src/lib/a.ts src/lib/a.test.ts src/lib/b.ts src/lib/b.test.ts src/lib/prisma.ts src/lib/c.ts src/actions/t.ts \
  src/components/x.tsx src/app/page.tsx src/lib/CLAUDE.md src/actions/CLAUDE.md src/lib/d-types.ts \
  stryker.config.mjs vitest.stryker.config.mts tsconfig.json package.json pnpm-lock.yaml README.md; do put "$f"; done
put .gitignore /reports
g add -A && g commit -q --no-verify -m base && g update-ref refs/remotes/origin/main HEAD
g checkout -q -b chore/B9.1-x
run() { : > "$LOG"; (cd "$REPO" && PATH="$TMP/bin:$PATH" "$SRC" "$@") > "$TMP/out" 2>/dev/null; echo $?; }
calls() { wc -l < "$LOG" | tr -d ' '; }
last() { tail -1 "$TMP/out"; }
commit() { g add -A && g commit -q --no-verify -m "$1"; }
CI_ONLY='mutation: CI only, no src/lib or src/actions change'

# MG1
put README.md y; commit docs; rc="$(run)"
[[ "$rc" == 0 && "$(last)" == "$CI_ONLY" && "$(calls)" == 0 ]] && ok MG1 || fail "MG1 rc=$rc out=$(last) calls=$(calls)"
# MG2
put src/components/x.tsx y; put src/app/page.tsx y; commit ui; rc="$(run)"
[[ "$rc" == 0 && "$(last)" == "$CI_ONLY" && "$(calls)" == 0 ]] && ok MG2 || fail "MG2 rc=$rc out=$(last) calls=$(calls)"
# MG3
put src/lib/a.ts y; commit lib; rc="$(run)"
[[ "$rc" == 0 && "$(calls)" == 1 && "$(cat "$LOG")" == "exec stryker run --mutate src/lib/a.ts" \
  && "$(last)" == "mutation: 85.00 % on src/lib/a.ts (ran), src "* ]] && ok MG3 || fail "MG3 rc=$rc out=$(last) log=$(cat "$LOG")"
# MG4
ran="$(last)"; rc="$(run)"
[[ "$rc" == 0 && "$(calls)" == 0 && "$(last)" == "${ran/ (ran), / (reused), }" ]] && ok MG4 || fail "MG4 rc=$rc out=$(last) calls=$(calls)"
# MG5
put src/lib/a.ts z; rc="$(run)"
[[ "$rc" == 0 && "$(calls)" == 1 && "$(last)" == *"(ran)"* && "$(last)" != "$ran" ]] && ok MG5 || fail "MG5 rc=$rc out=$(last) calls=$(calls)"
commit lib2
# MG6
put src/lib/b.test.ts y; rc="$(run)"
[[ "$rc" == 0 && "$(cat "$LOG")" == "exec stryker run --mutate src/lib/a.ts,src/lib/b.ts" ]] && ok MG6 || fail "MG6 log=$(cat "$LOG")"
# MG7
put src/actions/new.ts; rc="$(run)"
[[ "$rc" == 0 && "$(cat "$LOG")" == "exec stryker run --mutate src/actions/new.ts,src/lib/a.ts,src/lib/b.ts" ]] \
  && ok MG7 || fail "MG7 log=$(cat "$LOG")"
# MG8 (a fresh card branch: only prisma.ts, then only a deleted file)
g checkout -q -f -b chore/B9.2-y origin/main && g clean -qfd; m8=0
put src/lib/prisma.ts y; rc="$(run)"
[[ "$rc" == 0 && "$(cat "$LOG")" == "exec stryker run" && "$(last)" == "mutation: 85.00 % on src/lib + src/actions (ran), src "* ]] \
  || { echo "     prisma: log=$(cat "$LOG") out=$(last)"; m8=1; }
g checkout -q -- src/lib/prisma.ts; rm "$REPO/src/lib/c.ts"; rc="$(run)"
[[ "$rc" == 0 && "$(cat "$LOG")" == "exec stryker run" ]] || { echo "     deleted: log=$(cat "$LOG")"; m8=1; }
[[ $m8 -eq 0 ]] && ok MG8 || fail MG8
# MG9
put src/lib/b.ts low; rc="$(FAKE_SCORE=50.00 FAKE_UNDER=1 run)"; out9="$(last)"; rc2="$(run)"
[[ "$rc" == 1 && "$out9" == "mutation: 50.00 % on src/lib/b.ts (ran), src "* && "$rc2" == 1 && "$(calls)" == 0 ]] \
  && ok MG9 || fail "MG9 rc=$rc out=$out9 rc2=$rc2 calls=$(calls)"
# MG10
rc="$(run --force)"
[[ "$rc" == 0 && "$(calls)" == 1 && "$(last)" == *"(ran)"* ]] && ok MG10 || fail "MG10 rc=$rc calls=$(calls)"
# MG11
m11=""
for k in stryker.config.mjs vitest.stryker.config.mts tsconfig.json package.json pnpm-lock.yaml; do
  put "$k" y; rc="$(run)"; [[ "$rc" == 0 && "$(calls)" == 1 ]] || m11="$m11 $k:rc=$rc,calls=$(calls)"
done
# same working tree, another merge-base: since a commit of b.ts only the deleted c.ts differs, so the list is empty
g add src/lib/b.ts && g commit -q --no-verify -m b-low; rc="$(run --base HEAD)"
[[ "$rc" == 0 && "$(cat "$LOG")" == "exec stryker run" ]] || m11="$m11 base:log=$(cat "$LOG")"
[[ -z "$m11" ]] && ok MG11 || fail "MG11$m11"
# MG12 (main moves on with its own lib commit; the card changes only a component)
g checkout -q -f main && g clean -qfd && put src/lib/a.ts main && commit main-lib && g update-ref refs/remotes/origin/main HEAD
g checkout -q -b chore/B9.3-z HEAD~1 && put src/components/x.tsx z && commit ui3; rc="$(run)"
[[ "$rc" == 0 && "$(last)" == "$CI_ONLY" && "$(calls)" == 0 ]] && ok MG12 || fail "MG12 rc=$rc out=$(last)"
# MG13
put src/lib/CLAUDE.md y; put src/actions/CLAUDE.md y; rc="$(run)"
[[ "$rc" == 0 && "$(last)" == "$CI_ONLY" && "$(calls)" == 0 ]] && ok MG13 || fail "MG13 rc=$rc out=$(last) log=$(cat "$LOG")"
# MG14
put src/lib/d-types.ts y; rc="$(FAKE_NOSCORE=mutate run)"; log14="$(tr '\n' '|' < "$LOG")"; out14="$(last)"
rc2="$(FAKE_NOSCORE=all FAKE_RC=0 run --force)" # a run with no score line never passes, whatever Stryker exits
[[ "$rc" == 0 && "$log14" == "exec stryker run --mutate src/lib/d-types.ts|exec stryker run|" \
  && "$out14" == "mutation: 85.00 % on src/lib + src/actions, no valid mutant in src/lib/d-types.ts (ran), src "* \
  && "$rc2" == 1 && "$(last)" == "mutation: ? % on src/lib + src/actions, no valid mutant in src/lib/d-types.ts (ran), src "* ]] \
  && ok MG14 || fail "MG14 rc=$rc log=$log14 out=$out14 rc2=$rc2 out2=$(last)"
# MG15
g checkout -q -- src/lib/d-types.ts; put src/lib/e.ts; rc="$(FAKE_NOSCORE=mutate FAKE_MUTANTS=6 FAKE_RC=0 run)"
[[ "$rc" == 1 && "$(cat "$LOG")" == "exec stryker run --mutate src/lib/e.ts" \
  && "$(last)" == "mutation: ? % on src/lib/e.ts, no test reaches it (ran), src "* ]] \
  && ok MG15 || fail "MG15 rc=$rc log=$(tr '\n' '|' < "$LOG") out=$(last)"
# MG16
rm "$REPO/src/lib/e.ts"; put src/lib/f.ts; rc="$(FAKE_SUBSCORE=NaN run)"; log16="$(tr '\n' '|' < "$LOG")"; out16="$(last)"
rc2="$(FAKE_SCORE=NaN run --force)"
[[ "$rc" == 0 && "$log16" == "exec stryker run --mutate src/lib/f.ts|exec stryker run|" \
  && "$out16" == "mutation: 85.00 % on src/lib + src/actions, no valid mutant in src/lib/f.ts (ran), src "* \
  && "$rc2" == 1 && "$(last)" == "mutation: ? % on src/lib + src/actions, no valid mutant in src/lib/f.ts (ran), src "* ]] \
  && ok MG16 || fail "MG16 rc=$rc log=$log16 out=$out16 rc2=$rc2 out2=$(last)"
# MG17
m17=""
for args in "--base" "--nope"; do
  : > "$LOG"; (cd "$REPO" && PATH="$TMP/bin:$PATH" "$SRC" $args) > "$TMP/out" 2> "$TMP/err"; rc=$?
  [[ "$rc" == 2 && "$(calls)" == 0 ]] && grep -q 'scripts/mutation-gate.sh \[--base <ref>\] \[--force\]' "$TMP/err" \
    || m17="$m17 $args:rc=$rc,calls=$(calls),err=$(head -1 "$TMP/err")"
done
[[ -z "$m17" ]] && ok MG17 || fail "MG17$m17"

echo "[mutation-gate-smoke] $oks ok, $fails FAIL"
[[ $fails -eq 0 ]]
