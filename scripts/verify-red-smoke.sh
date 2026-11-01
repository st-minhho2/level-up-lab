#!/usr/bin/env bash
# Probes V1–V14 of scripts/verify-red.sh (B1.25, B1.29): how it tells an existing test from a new one. Each probe makes a
# base commit holding one probe test file, then a "test(todos): B9.9 probe (red)" commit on top, both with plumbing
# (no hook runs, none is bypassed, the commits stay unreferenced), and runs the working-copy script on that range in a
# detached scratch worktree of HEAD with node_modules linked.
#   scripts/verify-red-smoke.sh
#   V1 old '…\'\'…' + new failing → red            V2 old "…\"…" and `…\`…` + new failing → red
#   V3 old escaped + new passing → GREEN, 1 new     V4 old 'AC-0.1: query' + new passing 'AC-0.1: query is trimmed'
#   V5 old 'a\nb' + new failing → red                  + new failing → GREEN, 2 new
#   V6 old it.each(...)('AC-0.2: %s') + new failing → red (the old rows still match)
#   V7 old it.each(...)('rejects PORT=%s') + new passing 'rejects PORT=-1' + new failing → GREEN, 2 new
#   V8 old describe('A') › 'AC-0.6: same' + new passing describe('B') › 'AC-0.6: same' + new failing → GREEN, 2 new
#   V9 old comment holding \u{110000} + new failing → red     V10 old .each 'AC-0.3: 50%%s done %s' + new passing
#   V11 old 'AC-0.4: literal %s here' + new passing                 'AC-0.3: 50% extra' + new failing → GREEN, 2 new
#       'AC-0.4: literal extra' + new failing → GREEN, 2 new    V12 old 'café \x41 \u{1F600} tab\there' + new failing → red
#   V13 old 'AC-0.7: dup' + a second passing 'AC-0.7: dup' + new failing → GREEN, 3 new (a repeated name is new)
#   V14 old it.todo('AC-0.8: later') replaced by passing 'AC-0.8: later' + new failing → GREEN, 2 new (a todo is not old)
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

probe() { # probe <id> <want exit> <want summary> <base tests> <added tests> [<must not name>] [<base tests kept>]
  local id="$1" want="$2" summary="$3" old="$4" add="$5" hidden="${6:-}" kept="${7-$4}" base red rc
  base="$(commit "$(git -C "$WT" rev-parse HEAD)" "$HEADER
$old
});" "chore: probe base")"
  red="$(commit "$base" "$HEADER
$kept
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

probe V7 1 "5 ran (2 new), 1 new failed, 1 new passed" \
  "  it.each(['abc', '0', '70000'])('rejects PORT=%s', (value) => {
    expect(value).toBeTruthy();
  });" "$(PASS "'rejects PORT=-1 (negative)'")
$(FAILT "'AC-0.9: new'")"
probe V8 1 "3 ran (2 new), 1 new failed, 1 new passed" \
  "  describe('A', () => {
$(PASS "'AC-0.6: same'")
  });" "  describe('B', () => {
$(PASS "'AC-0.6: same'")
  });
$(FAILT "'AC-0.9: new'")"
probe V9 0 "2 ran (1 new), 1 new failed, 0 new passed" "  // it('AC-0.1: x \\u{110000}')
$(PASS "'AC-0.1: kept'")" "$(FAILT "'AC-0.9: new'")"
probe V10 1 "3 ran (2 new), 1 new failed, 1 new passed" \
  "  it.each(['x'])('AC-0.3: 50%%s done %s', (value) => {
    expect(value).toBeTruthy();
  });" "$(PASS "'AC-0.3: 50% extra'")
$(FAILT "'AC-0.9: new'")"
probe V11 1 "3 ran (2 new), 1 new failed, 1 new passed" "$(PASS "'AC-0.4: literal %s here'")" \
  "$(PASS "'AC-0.4: literal extra'")
$(FAILT "'AC-0.9: new'")"
probe V12 0 "2 ran (1 new), 1 new failed, 0 new passed" "$(PASS "'AC-0.5: café \\x41 \\u{1F600} tab\\there'")" \
  "$(FAILT "'AC-0.9: new'")"
probe V13 1 "3 ran (3 new), 1 new failed, 2 new passed" "$(PASS "'AC-0.7: dup'")" "$(PASS "'AC-0.7: dup'")
$(FAILT "'AC-0.9: new'")"
probe V14 1 "2 ran (2 new), 1 new failed, 1 new passed" "  it.todo('AC-0.8: later');" "$(PASS "'AC-0.8: later'")
$(FAILT "'AC-0.9: new'")" "" ""

echo "[verify-red-smoke] $oks ok, $fails FAIL"
[[ $fails -eq 0 ]]
