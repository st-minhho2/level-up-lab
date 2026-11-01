#!/usr/bin/env bash
# Probes V1–V6 of scripts/verify-red.sh (B1.25): how it tells an existing test title from a new one. Each probe makes a
# base commit holding one probe test file, then a "test(todos): B9.9 probe (red)" commit on top, both with plumbing
# (no hook runs, none is bypassed, the commits stay unreferenced), and runs the working-copy script on that range in a
# detached scratch worktree of HEAD with node_modules linked.
#   scripts/verify-red-smoke.sh
#   V1 old '…\'\'…' + new failing → red            V2 old "…\"…" and `…\`…` + new failing → red
#   V3 old escaped + new passing → GREEN, 1 new     V4 old 'AC-0.1: query' + new passing 'AC-0.1: query is trimmed'
#   V5 old 'a\nb' + new failing → red                  + new failing → GREEN, 2 new
#   V6 old it.each(...)('AC-0.2: %s') + new failing → red (the placeholder prefix still matches)
set -uo pipefail
ROOT="$(git rev-parse --show-toplevel)"; SCRIPT="$ROOT/scripts/verify-red.sh"
TMP="$(mktemp -d)"; WT="$TMP/wt"; F=src/lib/vr-probe.test.ts
cleanup() { git -C "$ROOT" worktree remove --force "$WT" >/dev/null 2>&1; git -C "$ROOT" worktree prune; rm -rf -- "$TMP"; }
trap cleanup EXIT
git -C "$ROOT" worktree add -q --detach "$WT" HEAD
ln -s "$ROOT/node_modules" "$WT/node_modules"
oks=0; fails=0
ok() { echo "ok   $1"; oks=$((oks + 1)); }
fail() { echo "FAIL $1"; fails=$((fails + 1)); }

commit() { # commit <parent> <file content> <subject>: prints the new commit's sha
  local blob tree
  blob="$(printf '%s\n' "$2" | git -C "$WT" hash-object -w --stdin)"
  GIT_INDEX_FILE="$TMP/index" git -C "$WT" read-tree "$1"
  GIT_INDEX_FILE="$TMP/index" git -C "$WT" update-index --add --cacheinfo "100644,$blob,$F"
  tree="$(GIT_INDEX_FILE="$TMP/index" git -C "$WT" write-tree)"
  git -C "$WT" -c user.name=s -c user.email=s@x commit-tree "$tree" -p "$1" -m "$3"
}
HEADER="import { describe, expect, it } from 'vitest';

describe('verify-red probe', () => {"
PASS() { printf "  it(%s, () => {\n    expect(1).toBe(1);\n  });" "$1"; }
FAILT() { printf "  it(%s, () => {\n    expect(1).toBe(2);\n  });" "$1"; }

probe() { # probe <id> <want exit> <want summary> <base tests> <added tests> [<must not name>]
  local id="$1" want="$2" summary="$3" old="$4" add="$5" hidden="${6:-}" base red rc
  base="$(commit "$(git -C "$WT" rev-parse HEAD)" "$HEADER
$old
});" "chore: probe base")"
  red="$(commit "$base" "$HEADER
$old
$add
});" "test(todos): B9.9 probe (red)")"
  (cd "$WT" && bash "$SCRIPT" B9.9 --range "$base..$red") > "$TMP/out.$id" 2>&1; rc=$?
  if [[ $rc -eq $want ]] && grep -qF -- "$F: $summary" "$TMP/out.$id" \
    && { [[ -z "$hidden" ]] || ! grep -F -- "GREEN before implementation" "$TMP/out.$id" | grep -qF -- "$hidden"; }; then
    ok "$id"
  else
    fail "$id rc=$rc (want $want): $(grep -F -- "$F" "$TMP/out.$id" | head -1)"
  fi
}

probe V1 0 "2 ran (1 new), 1 new failed, 0 new passed" "$(PASS "'AC-0.1: query \\'\\' is kept'")" "$(FAILT "'AC-0.9: new'")"
probe V2 0 "3 ran (1 new), 1 new failed, 0 new passed" \
  "$(PASS '"AC-0.1: says \"hi\""')
$(PASS '`AC-0.2: tick \` ok`')" "$(FAILT "'AC-0.9: new'")"
probe V3 1 "2 ran (1 new), 0 new failed, 1 new passed" "$(PASS "'AC-0.1: query \\'\\' is kept'")" "$(PASS "'AC-0.9: new'")" "AC-0.1"
probe V4 1 "3 ran (2 new), 1 new failed, 1 new passed" "$(PASS "'AC-0.1: query'")" \
  "$(PASS "'AC-0.1: query is trimmed'")
$(FAILT "'AC-0.8: other'")"
probe V5 0 "2 ran (1 new), 1 new failed, 0 new passed" "$(PASS "'AC-0.1: a\\nb'")" "$(FAILT "'AC-0.9: new'")"
probe V6 0 "3 ran (1 new), 1 new failed, 0 new passed" \
  "  it.each(['x', 'y'])('AC-0.2: %s', (value) => {
    expect(value).toBeTruthy();
  });" "$(FAILT "'AC-0.9: new'")"

echo "[verify-red-smoke] $oks ok, $fails FAIL"
[[ $fails -eq 0 ]]
