#!/usr/bin/env bash
# Smoke for scripts/metrics/ (B1.16): lead time and change failure rate on a throwaway repo with fixed times.
# No network, no gh auth: a bare origin holds refs/pull/N/head, and a gh shim answers only the exact calls the
# scripts make. Exit 1 on any FAIL. bash 3.2-safe.
#   scripts/metrics-smoke.sh
#
#   M1  plan-approved only → exact whole minutes            M2  a later spec tick → the tick wins
#   M3  two plan-approved rounds → the latest wins          M4  a tick merged in from main → ignored
#   M5  no approval → n/a, out of the even-count median     M6  fix PR sharing a script within 14 days → counted
#   M7  the same after 15 days → not                        M8  sharing only *.md/backlog/docs, or a feat title → not
#   M9  a card's own fix PR → not its own repair            M10 a fix merged before the card → not
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
SRC="$PWD/scripts/metrics"

TMP="$(cd "$(mktemp -d)" && pwd -P)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT
fails=0; oks=0
ok() { oks=$((oks + 1)); echo "ok   $1"; }
fail() { fails=$((fails + 1)); echo "FAIL $1"; }

T0=1700000000; DAY=86400
REPO="$TMP/repo"; ORIGIN="$TMP/origin.git"; FIX="$TMP/fix"
mkdir -p "$REPO" "$FIX" "$TMP/bin"
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
g() { git -C "$REPO" "$@"; }
at() { # at <epoch> <subject> <file> <line>: one commit whose author and committer date is <epoch>
  mkdir -p "$REPO/$(dirname "$3")"; echo "$4" >> "$REPO/$3"
  g add -A && GIT_AUTHOR_DATE="@$1 +0000" GIT_COMMITTER_DATE="@$1 +0000" g -c user.name=s -c user.email=s@x \
    commit -q --no-verify -m "$2"
}
pin() { git -C "$REPO" update-ref "refs/pull/$1/head" HEAD; }

# --- history ------------------------------------------------------------------------------------------------------
g init -q -b main
cat > "$REPO/E9.md" <<'EOF'
### B9.1 · one
**Status: Done** — aaaaaaa (#101); fixture
### B9.2 · two
**Status: Done** — bbbbbbb (#102); fixture
### B9.3 · three
**Status: Done** — ccccccc (#103); fixture
### B9.4 · four
**Status: Done** — ddddddd (#104); fixture
### B9.5 · five
**Status: Done** — eeeeeee (#105); fixture
### B9.6 · six
**Status: Open** — not built
EOF
mkdir -p "$REPO/backlog/plan"; mv "$REPO/E9.md" "$REPO/backlog/plan/E9-fixture.md"
at $((T0 - 1000)) "chore: base" README.md base
for b in b1 b2 b3 b4 b5; do g branch -q "$b"; done
g checkout -q main; at $((T0 + 1000)) "docs: tick B9.4 on main" spec/s.md "- [x] Lead approves spec (lead, d, B9.4)"
g checkout -q b1; at "$T0" "docs(backlog): B9.1 plan approved" backlog/work/B9.1/plan.md "Plan approved by: lead"; pin 101
g checkout -q b2; at "$T0" "docs(backlog): B9.2 plan approved" backlog/work/B9.2/plan.md "Plan approved by: lead"
at $((T0 + 600)) "docs(spec): tick B9.2" spec/s.md "- [x] Lead approves spec (lead, d, B9.2)"; pin 102
g checkout -q b3; at "$T0" "docs(backlog): B9.3 plan approved" backlog/work/B9.3/plan.md "Plan approved by: lead"
at $((T0 + 300)) "docs(backlog): B9.3 plan round 2 approved" backlog/work/B9.3/plan.md "round 2"; pin 103
g checkout -q b4; at "$T0" "docs(backlog): B9.4 plan approved" backlog/work/B9.4/plan.md "Plan approved by: lead"
GIT_AUTHOR_DATE="@$((T0 + 1100)) +0000" GIT_COMMITTER_DATE="@$((T0 + 1100)) +0000" \
  g -c user.name=s -c user.email=s@x merge -q --no-edit --no-verify main; pin 104
g checkout -q b5; at "$T0" "docs(backlog): B9.5 plan" backlog/work/B9.5/plan.md "Plan approved by:"; pin 105
g checkout -q main
git clone -q --bare "$REPO" "$ORIGIN"
for n in 101 102 103 104 105; do git -C "$ORIGIN" update-ref "refs/pull/$n/head" "$(g rev-parse "refs/pull/$n/head")"; done
for n in 101 102 103 104 105; do g update-ref -d "refs/pull/$n/head"; done
g remote add origin "$ORIGIN"

# merge times: B9.1 30 min 59 s · B9.2 20 min after the tick · B9.3 10 min after round 2 · B9.4 40 min · B9.5 any
M1=$((T0 + 1859)); M2=$((T0 + 1800)); M3=$((T0 + 900)); M4=$((T0 + 2400)); M5=$((T0 + 3000))
echo "$M1" > "$FIX/view.101"; echo "$M2" > "$FIX/view.102"; echo "$M3" > "$FIX/view.103"
echo "$M4" > "$FIX/view.104"; echo "$M5" > "$FIX/view.105"
{
  printf '101\t%s\tfeat(scripts): B9.1 one\tscripts/a.sh backlog/work/B9.1/plan.md\n' "$M1"
  printf '102\t%s\tfeat(todos): B9.2 two\tsrc/b.ts\n' "$M2"
  printf '103\t%s\tfix(scripts): B9.3 three\tscripts/c.sh\n' "$M3"
  printf '104\t%s\tfeat: B9.4 four\tsrc/d.ts docs/x.md README.md\n' "$M4"
  printf '105\t%s\tfeat: B9.5 five\tsrc/e.ts\n' "$M5"
  printf '201\t%s\tfix(scripts): repair a\tscripts/a.sh\n' "$((M1 + 5 * DAY))"
  printf '202\t%s\tfix: late b\tsrc/b.ts\n' "$((M2 + 15 * DAY))"
  printf '203\t%s\tfix: docs of d\tdocs/x.md backlog/README.md README.md\n' "$((M4 + DAY))"
  printf '204\t%s\tfeat: more e\tsrc/e.ts\n' "$((M5 + DAY))"
  printf '205\t%s\tfix: early b\tsrc/b.ts\n' "$((M2 - DAY))"
  printf '206\t%s\tRevert "feat: B9.5 five"\tsrc/e.ts\n' "$((M5 + 2 * DAY))"
} > "$FIX/list.tsv"

# --- gh shim ------------------------------------------------------------------------------------------------------
# The exact argument strings the scripts must use; "$*" of any other call is denied.
printf '%s' '--json mergedAt --jq .mergedAt | fromdateiso8601' > "$FIX/view.args"
printf '%s' 'pr list --state merged --limit 1000 --json number,title,mergedAt,files --jq .[] | [.number, (.mergedAt | fromdateiso8601), .title, ([.files[].path] | join(" "))] | @tsv' > "$FIX/list.args"
cat > "$TMP/bin/gh" <<SHIM
#!/bin/bash
fix='$FIX'
deny() { echo "DENIED: \$*" >> "\$fix/denied.log"; echo "gh shim: denied" >&2; exit 99; }
if [ "\$1 \$2" = "pr view" ] && [ -f "\$fix/view.\$3" ] && [ "\${*:4}" = "\$(cat "\$fix/view.args")" ]; then
  cat "\$fix/view.\$3"; exit 0
fi
[ "\$*" = "\$(cat "\$fix/list.args")" ] && { cat "\$fix/list.tsv"; exit 0; }
deny "\$@"
SHIM
chmod +x "$TMP/bin/gh"
run() { (cd "$REPO" && PATH="$TMP/bin:$PATH" "$SRC/$1" "${@:2}") 2> "$TMP/err.log"; }
row() { awk -F'\t' -v c="$1" '$1 == c' "$TMP/out"; }

# --- lead time ----------------------------------------------------------------------------------------------------
if [[ -x "$SRC/lead-time.sh" ]]; then run lead-time.sh > "$TMP/out"; rc=$?; else
  echo "lead-time.sh: not found" > "$TMP/out"; rc=127; fi
cut -f1,2,4,5 <<< "$(row B9.1)" | grep -qx $'B9.1\t101\t30\t0.5' && ok M1 || fail "M1 $(row B9.1)"
cut -f4 <<< "$(row B9.2)" | grep -qx 20 && ok M2 || fail "M2 $(row B9.2)"
cut -f4 <<< "$(row B9.3)" | grep -qx 10 && ok M3 || fail "M3 $(row B9.3)"
cut -f4 <<< "$(row B9.4)" | grep -qx 40 && ok M4 || fail "M4 $(row B9.4)"
if [[ $rc -eq 0 ]] && cut -f3,4 <<< "$(row B9.5)" | grep -qx $'-\tn/a' && [[ -z "$(row B9.6)" ]] \
  && tail -1 "$TMP/out" | grep -qx 'median 25 min (0.4 h) over 4 cards; n/a: B9.5'; then ok M5
else fail "M5 rc=$rc $(tail -1 "$TMP/out")"; fi

# --- change failure rate ------------------------------------------------------------------------------------------
if [[ -x "$SRC/change-failure-rate.sh" ]]; then run change-failure-rate.sh > "$TMP/out"; rc=$?; else
  echo "change-failure-rate.sh: not found" > "$TMP/out"; rc=127; fi
cut -f3 <<< "$(row B9.1)" | grep -qx '#201' && ok M6 || fail "M6 $(row B9.1)"
cut -f3 <<< "$(row B9.2)" | grep -qx -- '-' && ok "M7 M10" || fail "M7 M10 $(row B9.2)"
[[ "$(cut -f3 <<< "$(row B9.4)")" == "-" ]] && [[ "$(cut -f3 <<< "$(row B9.5)")" == "#206" ]] && ok M8 \
  || fail "M8 $(row B9.4) | $(row B9.5)"
cut -f3 <<< "$(row B9.3)" | grep -qx -- '-' && ok M9 || fail "M9 $(row B9.3)"
[[ $rc -eq 0 ]] && tail -1 "$TMP/out" | grep -qx 'change failure rate 2/5 = 40.0 %' && ok "rate" \
  || fail "rate rc=$rc $(tail -1 "$TMP/out")"

[[ -s "$FIX/denied.log" ]] && { fail "gh shim denied:"; sed 's/^/  /' "$FIX/denied.log"; }
echo "[metrics-smoke] $oks ok, $fails FAIL"
[[ $fails -eq 0 ]]
