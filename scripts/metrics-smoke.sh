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
#   M11 a B9.20 tick on main → not B9.2's approval          M12 sharing only non-.md backlog/, docs/, spec/ files → not
#   M13 one fix PR repairing two cards counts once in the rate (review pass 1)
#   B1.22: M14 throughput line over two UTC+7 days       M15 a day whose cards have no approval that day adds no span
#   M16 gate wait sums two approval rounds              M17 PR wait anchors on the last own commit's first green run,
#       a later merge of main and a chore(ci) commit do not reset it
#   M18 no green run → n/a, out of the median           M19 a file outside B9.1's plan counts; listed files and
#       paperwork do not                                M20 no approval from #60 on → every non-paperwork file
#   review pass 1: M21 a day's span starts at its first approval commit of any card and any round, never at an earlier
#       merge (a second repo, cards B8.1–B8.5 over two days); M22 the PR-wait walk passes a merge of main to the last
#       own commit's green run; M23 (lead's ruling on finding 4) no approval before #60 → n/a, from #60 on → counted
#   review pass 2: M21's day 2 starts at a round-2 approval (06:30), after the day's first merge; M23 PR #60 counts
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
at $((T0 - 500)) "docs(spec): tick B9.20" spec/s.md "- [x] Lead approves spec (lead, d, B9.20)"
for b in b1 b2 b3 b4 b5; do g branch -q "$b"; done
g checkout -q main; at $((T0 + 1000)) "docs: tick B9.4 on main" spec/s.md "- [x] Lead approves spec (lead, d, B9.4)"
g checkout -q b1; mkdir -p "$REPO/backlog/work/B9.1"
printf '## Files\n\n| File | Change |\n| ---- | ------ |\n| `scripts/a.sh` | x |\n\n' > "$REPO/backlog/work/B9.1/plan.md"
at "$T0" "docs(backlog): B9.1 plan approved" backlog/work/B9.1/plan.md "Plan approved by: lead"; pin 101
g checkout -q b2; at "$T0" "docs(backlog): B9.2 plan approved" backlog/work/B9.2/plan.md "Plan approved by: lead"
at $((T0 + 600)) "docs(spec): tick B9.2" spec/s.md "- [x] Lead approves spec (lead, d, B9.2)"; TICK2="$(g rev-parse --short HEAD)"
GIT_AUTHOR_DATE="@$((T0 + 700)) +0000" GIT_COMMITTER_DATE="@$((T0 + 700)) +0000" \
  g -c user.name=s -c user.email=s@x merge -q -s ours --no-edit --no-verify main
GIT_AUTHOR_DATE="@$((T0 + 800)) +0000" GIT_COMMITTER_DATE="@$((T0 + 800)) +0000" \
  g -c user.name=s -c user.email=s@x commit -q --allow-empty --no-verify -m "chore(ci): B9.2 rerun"; pin 102
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
M1=$((T0 + 1859)); M2=$((T0 + 1800)); M3=$((T0 + 900)); M4=$((T0 + 2400)); M5=$((T0 + DAY + 600))
echo "$M1" > "$FIX/view.101"; echo "$M2" > "$FIX/view.102"; echo "$M3" > "$FIX/view.103"
echo "$M4" > "$FIX/view.104"; echo "$M5" > "$FIX/view.105"
{
  printf '101\t%s\tfeat(scripts): B9.1 one\tscripts/a.sh backlog/work/B9.1/plan.md\n' "$M1"
  printf '102\t%s\tfeat(todos): B9.2 two\tsrc/b.ts\n' "$M2"
  printf '103\t%s\tfix(scripts): B9.3 three\tscripts/c.sh\n' "$M3"
  printf '104\t%s\tfeat: B9.4 four\tsrc/d.ts docs/x.md README.md backlog/work/B9.4/probe.sh docs/d.sh spec/t.txt\n' "$M4"
  printf '105\t%s\tfeat: B9.5 five\tsrc/e.ts\n' "$M5"
  printf '201\t%s\tfix(scripts): repair a\tscripts/a.sh\n' "$((M1 + 5 * DAY))"
  printf '202\t%s\tfix: late b\tsrc/b.ts\n' "$((M2 + 15 * DAY))"
  printf '203\t%s\tfix: docs of d\tdocs/x.md backlog/README.md README.md\n' "$((M4 + DAY))"
  printf '204\t%s\tfeat: more e\tsrc/e.ts\n' "$((M5 + DAY))"
  printf '205\t%s\tfix: early b\tsrc/b.ts\n' "$((M2 - DAY))"
  printf '206\t%s\tRevert "feat: B9.5 five"\tsrc/e.ts\n' "$((M5 + 2 * DAY))"
  printf '207\t%s\tfix: probe of d\tbacklog/work/B9.4/probe.sh\n' "$((M4 + DAY))"
  printf '208\t%s\tfix: doc script of d\tdocs/d.sh\n' "$((M4 + DAY))"
  printf '209\t%s\tfix: spec file of d\tspec/t.txt\n' "$((M4 + DAY))"
  printf '210\t%s\tfix: a and b at once\tscripts/a.sh src/b.ts\n' "$((M1 + DAY))"
} > "$FIX/list.tsv"
for n in 101 102 103 104 105; do echo "$((T0 - 100))" > "$FIX/created.$n"; done
printf 'scripts/a.sh\nscripts/extra.sh\ndocs/metrics.md\nbacklog/work/B9.1/plan.md\n' > "$FIX/files.101"
printf 'backlog/README.md\n' > "$FIX/files.102"; printf 'spec/x.md\n' > "$FIX/files.103"
printf 'docs/mistake-log.md\n' > "$FIX/files.104"; printf 'src/e.ts\n' > "$FIX/files.105"
H101="$(git -C "$ORIGIN" rev-parse refs/pull/101/head)"; H102="$(git -C "$ORIGIN" rev-parse refs/pull/102/head)"
H104="$(git -C "$ORIGIN" rev-parse refs/pull/104/head)"; H105="$(git -C "$ORIGIN" rev-parse refs/pull/105/head)"
echo "$((T0 + 100))" > "$FIX/runs.$H101"
echo "$((T0 + 850))" > "$FIX/runs.$H102"                                     # the chore(ci) commit
echo "$((T0 + 750))" > "$FIX/runs.$(git -C "$ORIGIN" rev-parse "$H102^")"     # the merge of main
echo "$((T0 + 1200))" > "$FIX/runs.$H104"                                    # B9.4's head is its merge of main
echo "$((T0 + 400))" > "$FIX/runs.$(git -C "$ORIGIN" rev-parse "$H104^1")"   # its own commit, green earlier (M22)
echo "$((T0 + 100))" > "$FIX/runs.$H105"

# --- gh shim ------------------------------------------------------------------------------------------------------
# The exact argument strings the scripts must use; "$*" of any other call is denied.
printf '%s' '--json mergedAt --jq .mergedAt | fromdateiso8601' > "$FIX/view.args"
printf '%s' '--json createdAt --jq .createdAt | fromdateiso8601' > "$FIX/created.args"
printf '%s' '--json files --jq .files[].path' > "$FIX/files.args"
printf '%s' '--workflow ci --json conclusion,updatedAt --jq [.[] | select(.conclusion == "success") | .updatedAt | fromdateiso8601] | min // empty' > "$FIX/runs.args"
printf '%s' 'pr list --state merged --limit 1000 --json number,title,mergedAt,files --jq .[] | [.number, (.mergedAt | fromdateiso8601), .title, ([.files[].path] | join(" "))] | @tsv' > "$FIX/list.args"
cat > "$TMP/bin/gh" <<SHIM
#!/bin/bash
fix='$FIX'
deny() { echo "DENIED: \$*" >> "\$fix/denied.log"; echo "gh shim: denied" >&2; exit 99; }
if [ "\$1 \$2" = "pr view" ]; then
  for k in view created files; do
    if [ -f "\$fix/\$k.\$3" ] && [ "\${*:4}" = "\$(cat "\$fix/\$k.args")" ]; then cat "\$fix/\$k.\$3"; exit 0; fi
  done
fi
if [ "\$1 \$2 \$3" = "run list --commit" ] && [ "\${*:5}" = "\$(cat "\$fix/runs.args")" ]; then
  [ -f "\$fix/runs.\$4" ] && cat "\$fix/runs.\$4"; exit 0
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
[[ "$(cut -f3 <<< "$(row B9.2)")" == "$TICK2" ]] && ok M11 || fail "M11 $(row B9.2), tick $TICK2"
cut -f4 <<< "$(row B9.3)" | grep -qx 10 && ok M3 || fail "M3 $(row B9.3)"
cut -f4 <<< "$(row B9.4)" | grep -qx 40 && ok M4 || fail "M4 $(row B9.4)"
if [[ $rc -eq 0 ]] && cut -f3,4 <<< "$(row B9.5)" | grep -qx -- $'-\tn/a' && [[ -z "$(row B9.6)" ]] \
  && tail -1 "$TMP/out" | grep -qx 'median 25 min (0.4 h) over 4 cards; n/a: B9.5'; then ok M5
else fail "M5 rc=$rc $(tail -1 "$TMP/out")"; fi

# --- change failure rate ------------------------------------------------------------------------------------------
if [[ -x "$SRC/change-failure-rate.sh" ]]; then run change-failure-rate.sh > "$TMP/out"; rc=$?; else
  echo "change-failure-rate.sh: not found" > "$TMP/out"; rc=127; fi
cut -f3 <<< "$(row B9.1)" | grep -qx '#201,#210' && ok M6 || fail "M6 $(row B9.1)"
cut -f3 <<< "$(row B9.2)" | grep -qx '#210' && ok "M7 M10" || fail "M7 M10 $(row B9.2)"
[[ "$(cut -f3 <<< "$(row B9.4)")" == "-" ]] && [[ "$(cut -f3 <<< "$(row B9.5)")" == "#206" ]] && ok "M8 M12" \
  || fail "M8 M12 $(row B9.4) | $(row B9.5)"
cut -f3 <<< "$(row B9.3)" | grep -qx -- '-' && ok M9 || fail "M9 $(row B9.3)"
[[ $rc -eq 0 ]] && tail -1 "$TMP/out" | grep -qx 'change failure rate 3/5 = 60.0 %' && ok "M13 rate" \
  || fail "M13 rate rc=$rc $(tail -1 "$TMP/out")"

# --- B1.22: throughput, wait time, plan deviations ---------------------------------------------------------------
script() { # script <name>: runs it into $TMP/out, or records "not found"
  if [[ -x "$SRC/$1" ]]; then run "$1" > "$TMP/out"; rc=$?; else echo "$1: not found" > "$TMP/out"; rc=127; fi
}
script throughput.sh
[[ $rc -eq 0 ]] && tail -1 "$TMP/out" | grep -qx 'throughput 60.0 cards per 8 h (5 cards, 0.7 h, 2 days)' && ok M14 \
  || fail "M14 rc=$rc $(tail -1 "$TMP/out")"
grep -qx $'2023-11-16\t1\t0.00' "$TMP/out" && ok M15 || fail "M15 $(sed -n 3p "$TMP/out")"
script wait-time.sh
cut -f3 <<< "$(row B9.3)" | grep -qx 13 && ok M16 || fail "M16 $(row B9.3)"
cut -f4 <<< "$(row B9.2)" | grep -qx 17 && ok M17 || fail "M17 $(row B9.2)"
[[ $rc -eq 0 ]] && cut -f4 <<< "$(row B9.3)" | grep -qx 'n/a' \
  && tail -1 "$TMP/out" | grep -qx 'median plan-gate wait 8 min (4), median PR wait 31 min (4), PR upper bound 32 min (5)' && ok M18 \
  || fail "M18 rc=$rc $(row B9.3) | $(tail -1 "$TMP/out")"
cut -f4 <<< "$(row B9.4)" | grep -qx 33 && ok M22 || fail "M22 $(row B9.4)"
script plan-deviations.sh
cut -f3 <<< "$(row B9.1)" | grep -qx 'scripts/extra.sh' && cut -f3 <<< "$(row B9.2)" | grep -qx -- '-' && ok M19 \
  || fail "M19 $(row B9.1) | $(row B9.2)"
[[ $rc -eq 0 ]] && cut -f3 <<< "$(row B9.5)" | grep -qx 'src/e.ts' && tail -1 "$TMP/out" | grep -qx 'uncaught plan deviations 2/5' && ok M20 \
  || fail "M20 rc=$rc $(row B9.5) | $(tail -1 "$TMP/out")"

R2="$TMP/r2"; O2="$TMP/o2.git"; mkdir -p "$R2/backlog/plan"
B=$((19700 * 86400 - 25200)); H=3600                                  # 00:00 UTC+7 of the second day
gr() { git -C "$R2" -c user.name=s -c user.email=s@x -c commit.gpgsign=false "$@" >/dev/null 2>&1; }
cr() { GIT_AUTHOR_DATE="@$1 +0000" GIT_COMMITTER_DATE="@$1 +0000" gr commit -q --allow-empty --no-verify -m "$2"; }
{ for i in 1 2 3 4 5; do printf '### B8.%s · c\n**Status: Done** — x (#30%s); fixture\n' "$i" "$i"; done
  printf '### B8.6 · c\n**Status: Done** — x (#59); fixture\n### B8.7 · c\n**Status: Done** — x (#60); fixture\n'; } > "$R2/backlog/plan/E8-fixture.md"
gr init -q -b main && gr add -A && cr $((B - 2 * 86400)) "chore: base"
gr branch c1; gr branch c2; gr branch c3; gr branch c4; gr branch c5; gr branch c6; gr branch c7
gr checkout -q c1; cr $((B - 4 * H)) "docs(backlog): B8.1 plan approved"; gr update-ref refs/pull/301/head HEAD
gr checkout -q c2; cr $((B - 3 * H)) "docs(backlog): B8.2 plan approved"; cr $((B + 6 * H + 1800)) "docs(backlog): B8.2 plan round 2 approved"; gr update-ref refs/pull/302/head HEAD
gr checkout -q c3; cr $((B + 10 * H)) "docs(backlog): B8.3 plan approved"; gr update-ref refs/pull/303/head HEAD
gr checkout -q c4; cr $((B + 1 * H)) "docs(backlog): B8.4 plan"; gr update-ref refs/pull/304/head HEAD
gr checkout -q c5; cr $((B + 7 * H)) "docs(backlog): B8.5 plan approved"; cr $((B + 86400 + 11 * H)) "docs(backlog): B8.5 plan round 2 approved"; gr update-ref refs/pull/305/head HEAD
gr checkout -q c6; cr $((B - 5 * H)) "docs(backlog): B8.6 plan"; gr update-ref refs/pull/59/head HEAD
gr checkout -q c7; cr $((B - 5 * H)) "docs(backlog): B8.7 plan"; gr update-ref refs/pull/60/head HEAD
gr checkout -q main; git clone -q --bare "$R2" "$O2"
for n in 301 302 303 304 305 59 60; do git -C "$O2" update-ref "refs/pull/$n/head" "$(git -C "$R2" rev-parse "refs/pull/$n/head")"; gr update-ref -d "refs/pull/$n/head"; done
gr remote add origin "$O2"
echo $((B + 12 * H)) > "$FIX/view.301"; echo $((B + 11 * H)) > "$FIX/view.302"; echo $((B + 13 * H)) > "$FIX/view.303"
echo $((B + 6 * H)) > "$FIX/view.304"; echo $((B + 86400 + 10 * H)) > "$FIX/view.305"
if [[ -x "$SRC/throughput.sh" ]]; then (cd "$R2" && PATH="$TMP/bin:$PATH" "$SRC/throughput.sh" B8.1 B8.2 B8.3 B8.4 B8.5) > "$TMP/out" 2>&1; rc=$?; else rc=127; echo missing > "$TMP/out"; fi
# day 2: first approval 06:30 (B8.2's round 2), not the 06:00 merge → last merge 13:00 = 6.5 h for 4 cards;
# day 3: 1 card, its only approval (11:00) after the last merge (10:00) starts nothing, 0 h
[[ $rc -eq 0 ]] && tail -1 "$TMP/out" | grep -qx 'throughput 6.2 cards per 8 h (5 cards, 6.5 h, 2 days)' && ok M21 \
  || fail "M21 rc=$rc $(tail -1 "$TMP/out")"
printf 'src/z.ts\nbacklog/work/B8.4/plan.md\n' > "$FIX/files.304"; printf 'src/y.ts\n' > "$FIX/files.59"; printf 'src/x.ts\n' > "$FIX/files.60"
if [[ -x "$SRC/plan-deviations.sh" ]]; then (cd "$R2" && PATH="$TMP/bin:$PATH" "$SRC/plan-deviations.sh" B8.4 B8.6 B8.7) > "$TMP/out" 2>&1; rc=$?; else rc=127; echo missing > "$TMP/out"; fi
[[ $rc -eq 0 ]] && cut -f3 <<< "$(row B8.4)" | grep -qx 'src/z.ts' && cut -f3 <<< "$(row B8.6)" | grep -qx 'n/a' \
  && cut -f3 <<< "$(row B8.7)" | grep -qx 'src/x.ts' && tail -1 "$TMP/out" | grep -qx 'uncaught plan deviations 2/2' && ok M23 \
  || fail "M23 rc=$rc $(row B8.4) | $(row B8.6) | $(row B8.7) | $(tail -1 "$TMP/out")"

[[ -s "$FIX/denied.log" ]] && { fail "gh shim denied:"; sed 's/^/  /' "$FIX/denied.log"; }
echo "[metrics-smoke] $oks ok, $fails FAIL"
[[ $fails -eq 0 ]]
