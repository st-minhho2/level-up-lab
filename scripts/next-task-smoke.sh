#!/usr/bin/env bash
# Smoke for scripts/next-task.sh (B1.18): the derived board (To do · Doing · Review · Closing), the WIP limit on pick
# and --claim, and --check plan overlap, on a throwaway repo with a bare origin and a gh shim. No network, no gh auth.
# Exit 1 on any FAIL. bash 3.2-safe.
#   scripts/next-task-smoke.sh
#
#   W1  nothing in progress → B9.1                  W2  branches for B9.1–B9.3 → pick refused "WIP 3/3"
#   W3  docs/B9.1-done only → B9.1 still To do      W4  B9.3's PR ready → Review, B9.4 picked
#   W5  a draft PR → still Doing                    W6  B9.3's PR MERGED → Closing, B9.4 picked
#   W7  B9.2 Partial on origin/main → Closing       W8  feat/B9.10-x does not make B9.1 Doing
#   W9  a row only in the local README → ignored     W10 --claim at 3 → 1; --claim from the card's own branch → 0
#   W11 --check, same file → 1                      W12 glob against file, either way → 1
#   W13 only paperwork shared → 0 "no overlap"      W14 gh fails → warning, every branch Doing, refused as W2
#   W15 --claim while another checkout holds a branch of the card → 1    W16 B9.3's PR CLOSED unmerged → To do
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
SRC="$PWD/scripts/next-task.sh"

TMP="$(cd "$(mktemp -d)" && pwd -P)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT
fails=0; oks=0
ok() { oks=$((oks + 1)); echo "ok   $1"; }
fail() { fails=$((fails + 1)); echo "FAIL $1"; }
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
R="$TMP/repo"; FIX="$TMP/fix"; mkdir -p "$R" "$FIX" "$TMP/bin"
g() { git -C "$R" -c user.name=s -c user.email=s@x -c commit.gpgsign=false "$@" >/dev/null 2>&1; }
gw() { local d="$1"; shift; git -C "$d" -c user.name=s -c user.email=s@x -c commit.gpgsign=false "$@" >/dev/null 2>&1; }

# --- fixture: five eligible cards on main, pushed to a bare origin ------------------------------------------------
mkdir -p "$R/backlog/plan"
{ printf '# Backlog\n\n## Remaining\n\n| Step | ID | Title | Spec § | Status | Blocked by | Owner | Size |\n'
  printf '| ---- | -- | ----- | ------ | ------ | ---------- | ----- | ---- |\n'
  for i in 1 2 3 4 5; do printf '| %s | B9.%s | card %s | §5 | Open | | Dev | S |\n' "$i" "$i" "$i"; done
  printf '\n## Waiting on human\n'; } > "$R/backlog/README.md"
for i in 1 2 3 4 5; do
  printf '### B9.%s · card %s\n**Status: Open** — fixture\n- **Spec:** §5 — unchanged\n- **Test:** `x.test.ts::AC-5.%s t` — red because: x\n\n' "$i" "$i" "$i"
done > "$R/backlog/plan/E9-fixture.md"
g init -q -b main && g add -A && g commit -q -m init
git init -q --bare "$TMP/origin.git" && g remote add origin "$TMP/origin.git" && g push -q origin main

printf '' > "$FIX/prs.tsv"
cat > "$TMP/bin/gh" <<SHIM
#!/bin/bash
fix='$FIX'
[ -n "\${GH_FAIL:-}" ] && { echo "gh: offline" >&2; exit 1; }
want='pr list --state all --limit 300 --json headRefName,state,isDraft --jq .[] | [.headRefName, .state, (.isDraft | tostring)] | @tsv'
[ "\$*" = "\$want" ] && { cat "\$fix/prs.tsv"; exit 0; }
echo "DENIED: \$*" >> "\$fix/denied.log"; exit 99
SHIM
chmod +x "$TMP/bin/gh"
nt() { # nt <dir> <args...>: runs next-task.sh there; stdout+stderr in $TMP/out, exit in $rc
  local d="$1"; shift
  if [[ -x "$SRC" ]]; then (cd "$d" && PATH="$TMP/bin:$PATH" "$SRC" "$@") > "$TMP/out" 2>&1; rc=$?; else echo "next-task.sh: not found" > "$TMP/out"; rc=127; fi
}
picked() { [[ $rc -eq 0 ]] && head -1 "$TMP/out" | grep -q "^$1 "; }
board() { grep -E "^[^ ]+ +$1 " "$TMP/out" | grep -q "$2"; } # board <id> <state>: a --list row of <id> names <state>
prs() { printf '%b' "$1" > "$FIX/prs.tsv"; }

# --- board and WIP -------------------------------------------------------------------------------------------------
nt "$R"; picked B9.1 && ok W1 || fail "W1 rc=$rc $(head -1 "$TMP/out")"
awk '{print} /^\| ---- \|/{print "| 0 | B9.0 | local only | §5 | Open | | Dev | S |"}' "$R/backlog/README.md" > "$TMP/rd" && mv "$TMP/rd" "$R/backlog/README.md"
printf '### B9.0 · local only\n**Status: Open** — fixture\n- **Spec:** §5 — unchanged\n- **Test:** `x.test.ts::AC-5.9 t` — red because: x\n' >> "$R/backlog/plan/E9-fixture.md"
g commit -qam "local row, never pushed"
nt "$R"; picked B9.1 && ok W9 || fail "W9 rc=$rc $(head -1 "$TMP/out")"
g branch docs/B9.1-done
nt "$R"; picked B9.1 && ok W3 || fail "W3 rc=$rc $(head -1 "$TMP/out")"
g branch feat/B9.10-x
nt "$R"; picked B9.1 && ok W8 || fail "W8 rc=$rc $(head -1 "$TMP/out")"
for i in 1 2 3; do g branch "feat/B9.$i-a" main; done
nt "$R"; [[ $rc -eq 1 ]] && grep -q 'WIP 3/3' "$TMP/out" && ok W2 || fail "W2 rc=$rc $(head -2 "$TMP/out" | tr '\n' ' ')"
GH_FAIL=1 nt "$R"; [[ $rc -eq 1 ]] && grep -q 'WIP 3/3' "$TMP/out" && grep -qi 'warning' "$TMP/out" && ok W14 \
  || fail "W14 rc=$rc $(head -2 "$TMP/out" | tr '\n' ' ')"
nt "$R" --claim B9.5; c1=$rc
gw "$R" worktree add -q "$TMP/wt1" feat/B9.1-a
nt "$TMP/wt1" --claim B9.1; c2=$rc
[[ $c1 -eq 1 && $c2 -eq 0 ]] && ok W10 || fail "W10 claim B9.5 rc=$c1 (want 1), own B9.1 rc=$c2 (want 0)"
prs 'feat/B9.3-a\tOPEN\ttrue\n'
nt "$R"; [[ $rc -eq 1 ]] && grep -q 'WIP 3/3' "$TMP/out" && ok W5 || fail "W5 rc=$rc $(head -1 "$TMP/out")"
prs 'feat/B9.3-a\tOPEN\tfalse\n'
nt "$R"; p=0; picked B9.4 && p=1; nt "$R" --list
[[ $p -eq 1 ]] && board B9.3 Review && ok W4 || fail "W4 picked=$p; $(grep 'B9.3 ' "$TMP/out")"
prs 'feat/B9.3-a\tMERGED\tfalse\n'
nt "$R"; p=0; picked B9.4 && p=1; nt "$R" --list
[[ $p -eq 1 ]] && board B9.3 Closing && ok W6 || fail "W6 picked=$p; $(grep 'B9.3 ' "$TMP/out")"
prs 'feat/B9.3-a\tCLOSED\tfalse\n'
nt "$R"; picked B9.3 && ok W16 || fail "W16 rc=$rc $(head -1 "$TMP/out")"
gw "$TMP/wt1" checkout -q --detach origin/main 2>/dev/null; C="$TMP/push"; git clone -q -b main "$TMP/origin.git" "$C" 2>/dev/null
awk '/^### B9.2 /{f=1} f && /^\*\*Status: Open/{sub(/Open\*\* — fixture/, "Partial** — merged abc, pending metrics"); f=0} {print}' \
  "$C/backlog/plan/E9-fixture.md" > "$C/e9" && mv "$C/e9" "$C/backlog/plan/E9-fixture.md" && rm -f "$C/backlog/plan/E9-fixture.md.bak"
sed -i.bak 's/^| 2 | B9.2 | card 2 | §5 | Open |/| 2 | B9.2 | card 2 | §5 | Partial |/' "$C/backlog/README.md" && rm -f "$C/backlog/README.md.bak"
gw "$C" commit -qam "B9.2 partial" && gw "$C" push -q origin main
nt "$R" --list; board B9.2 Closing && ok W7 || fail "W7 $(grep 'B9.2 ' "$TMP/out")"
g branch feat/B9.4-y main
nt "$R" --claim B9.4; [[ $rc -eq 1 ]] && grep -q 'feat/B9.4-y' "$TMP/out" && ok W15 || fail "W15 rc=$rc $(head -1 "$TMP/out")"

# --- plan overlap --------------------------------------------------------------------------------------------------
plan_on() { # plan_on <worktree> <card> <files...>: commit a plan listing the files on that worktree's branch
  local d="$1" c="$2" f; shift 2; mkdir -p "$d/backlog/work/$c"
  { printf '# plan\n\n## Files\n\n| File | Change |\n| ---- | ------ |\n'; for f in "$@"; do printf '| `%s` | x |\n' "$f"; done; } > "$d/backlog/work/$c/plan.md"
  gw "$d" add -A && gw "$d" commit -q -m "docs(backlog): $c plan"
}
gw "$TMP/wt1" checkout -q feat/B9.1-a
plan_on "$TMP/wt1" B9.1 src/lib/a.ts 'src/components/*' backlog/README.md
gw "$R" worktree add -q "$TMP/wt4" feat/B9.4-y
plan_on "$TMP/wt4" B9.4 src/lib/a.ts
nt "$TMP/wt4" --check B9.4; [[ $rc -eq 1 ]] && grep -q 'src/lib/a.ts' "$TMP/out" && grep -q 'B9.1' "$TMP/out" && ok W11 \
  || fail "W11 rc=$rc $(head -1 "$TMP/out")"
plan_on "$TMP/wt4" B9.4 src/components/x.tsx; nt "$TMP/wt4" --check B9.4; r1=$rc
plan_on "$TMP/wt4" B9.4 'src/lib/*'; nt "$TMP/wt4" --check B9.4; r2=$rc
[[ $r1 -eq 1 && $r2 -eq 1 ]] && ok W12 || fail "W12 file-in-their-glob rc=$r1, our-glob-over-their-file rc=$r2 (want 1, 1)"
plan_on "$TMP/wt4" B9.4 backlog/README.md src/other.ts; nt "$TMP/wt4" --check B9.4
[[ $rc -eq 0 ]] && grep -q 'no overlap' "$TMP/out" && ok W13 || fail "W13 rc=$rc $(head -1 "$TMP/out")"

[[ -s "$FIX/denied.log" ]] && { fail "gh shim denied:"; sed 's/^/  /' "$FIX/denied.log"; }
echo "[next-task-smoke] $oks ok, $fails FAIL"
[[ $fails -eq 0 ]]
