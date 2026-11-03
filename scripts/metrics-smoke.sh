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
#   review pass 2: M21's day 2 starts at a round-2 approval (06:30), after the day's first merge; M23 PR #60 counts;
#       M24 (lead's ruling (a) on pass-2 finding 1) a selection picks days, each counting every Done card merged on it
#   review pass 3: M25 a picked day's first and last merge come from every Done card, not the picked one
#   B1.55: a D-27 approval (`Plan approved by: reviewer (D-27, …)` on a runner branch `<prefix>/<card>-agent`):
#       M26 lead-time and M28 throughput start at it; M27 wait-time counts no lead wait for it; M29 plan-deviations
#       reads it offline (no gh issue call) and a lead field on a runner branch leaves every non-paperwork file outside
#   B1.57 (D-29), issues #501–#508 and PRs #601–#610 served as timeline JSON, the scripts' own --jq applied (real jq):
#       M30 runner and bot comments only → unattended yes        M31 a user comment between label and ready → no, 1
#       M32 `approve; …` after a high-tier gate → excepted; after a medium one → counted
#       M33 relabel: the latest agent-ready label opens the window; a comment after the first ready is out
#       M34 open without a ready PR → pending, closed → no; the share line
#       M35 no-rework yes: run commits, a trailer-less commit before ready, a bot comment after ready; any head by number
#       M36 no: a trailer-less commit after ready (sha listed), a user comment after ready, closed unmerged; open → pending
#       M37 default sets: every agent-ready issue (--limit 1000), only `<x>/<card>-agent` PRs; ready = the first event
#   review pass 1: M38 no-rework's window: a comment before ready, a comment and a commit after the merge → yes
#       M39 a PR never drafted is ready at its creation (both scripts)   M40 a second `approve` after one gate counts
#       M41 a relabel after ready keeps the window; the highest-numbered of two agent PRs for a card is its PR
#   review pass 2: M42 a runner comment after a high-tier gate closes it: a later `approve` counts
#   review pass 3: M43 `I would approve …` and `approved, …` after a high-tier gate both count (word at the start only)
set -uo pipefail
command -v jq >/dev/null || { echo "metrics-smoke: needs jq (B1.57 probes apply the scripts' --jq)" >&2; exit 2; }
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
for n in 101 102 103 104 105; do echo "feat/B9.$((n - 100))-x" > "$FIX/ref.$n"; done
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
printf '%s' '--json headRefName --jq .headRefName' > "$FIX/ref.args"
printf '%s' '--workflow ci --json conclusion,updatedAt --jq [.[] | select(.conclusion == "success") | .updatedAt | fromdateiso8601] | min // empty' > "$FIX/runs.args"
printf '%s' 'pr list --state merged --limit 1000 --json number,title,mergedAt,files --jq .[] | [.number, (.mergedAt | fromdateiso8601), .title, ([.files[].path] | join(" "))] | @tsv' > "$FIX/list.args"
cat > "$TMP/bin/gh" <<SHIM
#!/bin/bash
fix='$FIX'
deny() { echo "DENIED: \$*" >> "\$fix/denied.log"; echo "gh shim: denied" >&2; exit 99; }
if [ "\$1 \$2" = "pr view" ]; then
  for k in view created files ref; do
    if [ -f "\$fix/\$k.\$3" ] && [ "\${*:4}" = "\$(cat "\$fix/\$k.args")" ]; then cat "\$fix/\$k.\$3"; exit 0; fi
  done
fi
if [ "\$1 \$2 \$3" = "run list --commit" ] && [ "\${*:5}" = "\$(cat "\$fix/runs.args")" ]; then
  [ -f "\$fix/runs.\$4" ] && cat "\$fix/runs.\$4"; exit 0
fi
[ "\$*" = "\$(cat "\$fix/list.args")" ] && { cat "\$fix/list.tsv"; exit 0; }
# B1.57: every word but the filter pinned; the call's own --jq runs on the fixture JSON (run-smoke's way)
jqf=""; prev=""; for a in "\$@"; do [ "\$prev" = --jq ] && jqf="\$a"; prev="\$a"; done
f=""
case "\$*" in
  "issue list --label agent-ready --state all --limit 1000 --json number --jq "*) f=issues.json ;;
  "issue view "*" --json state,body --jq "*) [ "\$5" = state,body ] && f="issue.\$3.json" ;;
  "pr list --state all --limit 1000 --json number,headRefName --jq "*) f=prs.json ;;
  "pr view "*" --json state,headRefName,isDraft,createdAt,mergedAt --jq "*) f="pr.\$3.json" ;;
  "api --paginate repos/{owner}/{repo}/issues/"*"/timeline --jq "*)
    n="\${3#repos/\{owner\}/\{repo\}/issues/}"; f="timeline.\${n%/timeline}.json" ;;
esac
[ -n "\$f" ] && [ -f "\$fix/j/\$f" ] && [ "\${@: -2:1}" = --jq ] && { jq -r "\$jqf" < "\$fix/j/\$f"; exit \$?; }
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
  printf '### B8.6 · c\n**Status: Done** — x (#59); fixture\n### B8.7 · c\n**Status: Done** — x (#60); fixture\n'
  printf '### B8.8 · c\n**Status: Done** — x (#308); fixture\n### B8.9 · c\n**Status: Done** — x (#309); fixture\n'; } > "$R2/backlog/plan/E8-fixture.md"
gr init -q -b main && gr add -A && cr $((B - 2 * 86400)) "chore: base"
gr branch c1; gr branch c2; gr branch c3; gr branch c4; gr branch c5; gr branch c6; gr branch c7; gr branch c8; gr branch c9
gr checkout -q c1; cr $((B - 4 * H)) "docs(backlog): B8.1 plan approved"; gr update-ref refs/pull/301/head HEAD
gr checkout -q c2; cr $((B - 3 * H)) "docs(backlog): B8.2 plan approved"; cr $((B + 6 * H + 1800)) "docs(backlog): B8.2 plan round 2 approved"; gr update-ref refs/pull/302/head HEAD
gr checkout -q c3; cr $((B + 10 * H)) "docs(backlog): B8.3 plan approved"; gr update-ref refs/pull/303/head HEAD
gr checkout -q c4; cr $((B + 1 * H)) "docs(backlog): B8.4 plan"; gr update-ref refs/pull/304/head HEAD
gr checkout -q c5; cr $((B + 7 * H)) "docs(backlog): B8.5 plan approved"; cr $((B + 86400 + 11 * H)) "docs(backlog): B8.5 plan round 2 approved"; gr update-ref refs/pull/305/head HEAD
gr checkout -q c6; cr $((B - 5 * H)) "docs(backlog): B8.6 plan"; gr update-ref refs/pull/59/head HEAD
gr checkout -q c7; cr $((B - 5 * H)) "docs(backlog): B8.7 plan"; gr update-ref refs/pull/60/head HEAD
gr checkout -q c8; cr $((B + 2 * 86400)) "docs(backlog): B8.8 plan"; gr update-ref refs/pull/308/head HEAD
gr checkout -q c9; cr $((B + 2 * 86400)) "docs(backlog): B8.9 plan"; gr update-ref refs/pull/309/head HEAD
gr checkout -q main; git clone -q --bare "$R2" "$O2"
for n in 301 302 303 304 305 59 60 308 309; do git -C "$O2" update-ref "refs/pull/$n/head" "$(git -C "$R2" rev-parse "refs/pull/$n/head")"; gr update-ref -d "refs/pull/$n/head"; done
gr remote add origin "$O2"
echo $((B + 12 * H)) > "$FIX/view.301"; echo $((B + 11 * H)) > "$FIX/view.302"; echo $((B + 13 * H)) > "$FIX/view.303"
echo $((B + 6 * H)) > "$FIX/view.304"; echo $((B + 86400 + 10 * H)) > "$FIX/view.305"
echo $((B - 2 * H)) > "$FIX/view.59"; echo $((B - H)) > "$FIX/view.60"             # day 1, which M21 does not pick
echo $((B + 2 * 86400 + 9 * H)) > "$FIX/view.308"; echo $((B + 2 * 86400 + 11 * H)) > "$FIX/view.309"   # day 4, no approval
if [[ -x "$SRC/throughput.sh" ]]; then (cd "$R2" && PATH="$TMP/bin:$PATH" "$SRC/throughput.sh" B8.1 B8.2 B8.3 B8.4 B8.5) > "$TMP/out" 2>&1; rc=$?; else rc=127; echo missing > "$TMP/out"; fi
# day 2: first approval 06:30 (B8.2's round 2), not the 06:00 merge → last merge 13:00 = 6.5 h for 4 cards;
# day 3: 1 card, its only approval (11:00) after the last merge (10:00) starts nothing, 0 h
[[ $rc -eq 0 ]] && tail -1 "$TMP/out" | grep -qx 'throughput 6.2 cards per 8 h (5 cards, 6.5 h, 2 days)' && ok M21 \
  || fail "M21 rc=$rc $(tail -1 "$TMP/out")"
if [[ -x "$SRC/throughput.sh" ]]; then (cd "$R2" && PATH="$TMP/bin:$PATH" "$SRC/throughput.sh" B8.3) > "$TMP/out" 2>&1; rc=$?; else rc=127; echo missing > "$TMP/out"; fi
# B8.3 picks day 2: B8.1–B8.4 merged on it, from B8.2's 06:30 approval to the 13:00 merge
[[ $rc -eq 0 ]] && tail -1 "$TMP/out" | grep -qx 'throughput 4.9 cards per 8 h (4 cards, 6.5 h, 1 days)' && ok M24 \
  || fail "M24 rc=$rc $(tail -1 "$TMP/out")"
# B8.1 (not day 2's last merge) reads day 2 as M24 does; B8.9 picks day 4: no approval, 09:00 → 11:00 over both cards
m25a="$(cd "$R2" && PATH="$TMP/bin:$PATH" "$SRC/throughput.sh" B8.1 2>&1 | tail -1)"
m25b="$(cd "$R2" && PATH="$TMP/bin:$PATH" "$SRC/throughput.sh" B8.9 2>&1 | tail -1)"
[[ "$m25a" == 'throughput 4.9 cards per 8 h (4 cards, 6.5 h, 1 days)' && "$m25b" == 'throughput 8.0 cards per 8 h (2 cards, 2.0 h, 1 days)' ]] \
  && ok M25 || fail "M25 $m25a | $m25b"
printf 'src/z.ts\nbacklog/work/B8.4/plan.md\n' > "$FIX/files.304"; printf 'src/y.ts\n' > "$FIX/files.59"; printf 'src/x.ts\n' > "$FIX/files.60"
echo feat/B8.4-x > "$FIX/ref.304"; echo feat/B8.6-x > "$FIX/ref.59"; echo feat/B8.7-x > "$FIX/ref.60"
if [[ -x "$SRC/plan-deviations.sh" ]]; then (cd "$R2" && PATH="$TMP/bin:$PATH" "$SRC/plan-deviations.sh" B8.4 B8.6 B8.7) > "$TMP/out" 2>&1; rc=$?; else rc=127; echo missing > "$TMP/out"; fi
[[ $rc -eq 0 ]] && cut -f3 <<< "$(row B8.4)" | grep -qx 'src/z.ts' && cut -f3 <<< "$(row B8.6)" | grep -qx 'n/a' \
  && cut -f3 <<< "$(row B8.7)" | grep -qx 'src/x.ts' && tail -1 "$TMP/out" | grep -qx 'uncaught plan deviations 2/2' && ok M23 \
  || fail "M23 rc=$rc $(row B8.4) | $(row B8.6) | $(row B8.7) | $(tail -1 "$TMP/out")"

# --- B1.55: D-27 approvals ----------------------------------------------------------------------------------------
# B7.1 on chore/B7.1-agent: plan + approved review at 01:00 UTC+7, `reviewer (D-27, tier medium, issue #71)` at 02:00,
# merged 04:00 (day 1). B7.2 the same a day later with a lead field. The shim denies every `gh api` call, so a
# plan-deviations run that asked eligible.sh about issue #71 would show in denied.log.
R3="$TMP/r3"; O3="$TMP/o3.git"; mkdir -p "$R3/backlog/plan"
g3() { git -C "$R3" -c user.name=s -c user.email=s@x -c commit.gpgsign=false "$@" >/dev/null 2>&1; }
c3() { GIT_AUTHOR_DATE="@$1 +0000" GIT_COMMITTER_DATE="@$1 +0000" g3 commit -q --allow-empty --no-verify -m "$2"; }
plan3() { # plan3 <card> <field> <file>: the plan with its status line
  mkdir -p "$R3/backlog/work/$1"
  printf '## Files\n\n| File | Change |\n| ---- | ------ |\n| `%s` | x |\n\nPlan review: approved, round 1 · Plan approved by: %s · Rounds: 1\n' \
    "$3" "$2" > "$R3/backlog/work/$1/plan.md"
}
printf '### B7.1 · c\n**Status: Done** — x (#401); fixture\n### B7.2 · c\n**Status: Done** — x (#402); fixture\n' > "$R3/backlog/plan/E7-fixture.md"
g3 init -q -b main && g3 add -A && c3 $((B - 2 * 86400)) "chore: base"
for c in 1 2; do
  d=$(((c - 1) * 86400)); g3 checkout -q -b "chore/B7.$c-agent" main
  [[ $c -eq 1 ]] && f='reviewer (D-27, tier medium, issue #71)' || f='lead, 2026-11-02'
  plan3 "B7.$c" "" "src/s$c.ts"; printf '## Plan review (round 1)\n\nVerdict: approved\n' > "$R3/backlog/work/B7.$c/review.md"
  g3 add -A && c3 $((B + d + H)) "docs(backlog): B7.$c plan"
  plan3 "B7.$c" "$f" "src/s$c.ts"; g3 add -A && c3 $((B + d + 2 * H)) "docs(backlog): B7.$c plan approved"
  g3 update-ref "refs/pull/40$c/head" HEAD
  echo $((B + d + 4 * H)) > "$FIX/view.40$c"; echo $((B + d + 3 * H)) > "$FIX/created.40$c"
  echo "chore/B7.$c-agent" > "$FIX/ref.40$c"; printf 'src/s%s.ts\nbacklog/work/B7.%s/plan.md\n' "$c" "$c" > "$FIX/files.40$c"
done
g3 checkout -q main; git clone -q --bare "$R3" "$O3"
for n in 401 402; do git -C "$O3" update-ref "refs/pull/$n/head" "$(git -C "$R3" rev-parse "refs/pull/$n/head")"; g3 update-ref -d "refs/pull/$n/head"; done
g3 remote add origin "$O3"
r3() { (cd "$R3" && PATH="$TMP/bin:$PATH" "$SRC/$1" "${@:2}") > "$TMP/out" 2>&1; }
r3 lead-time.sh B7.1
cut -f4 <<< "$(row B7.1)" | grep -qx 120 && ok M26 || fail "M26 $(row B7.1)"
r3 wait-time.sh B7.1
cut -f3 <<< "$(row B7.1)" | grep -qx 'n/a' && ok M27 || fail "M27 $(row B7.1)"
r3 throughput.sh B7.1
tail -1 "$TMP/out" | grep -qx 'throughput 4.0 cards per 8 h (1 cards, 2.0 h, 1 days)' && ok M28 || fail "M28 $(tail -1 "$TMP/out")"
r3 plan-deviations.sh B7.1 B7.2
cut -f3 <<< "$(row B7.1)" | grep -qx -- '-' && cut -f3 <<< "$(row B7.2)" | grep -qx 'src/s2.ts' \
  && tail -1 "$TMP/out" | grep -qx 'uncaught plan deviations 1/2' && ok M29 \
  || fail "M29 $(row B7.1) | $(row B7.2) | $(tail -1 "$TMP/out")"

# --- B1.57: unattended and no-rework (D-29) -------------------------------------------------------------------------
# Issues #501–#508 (cards B6.1–B6.8) and PRs #601–#610 on 2026-11-04 UTC, as the REST timeline returns them. Every PR
# is created at 00:30 and, unless said otherwise, made ready at 03:00 and merged at 06:00.
J="$FIX/j"; mkdir -p "$J"
ts() { printf '2026-11-04T%s:00Z' "$1"; }
runner() { # runner <outcome> <tier>: the body run.sh's comment() posts with the lead's login (F1)
  printf '"Runner (`scripts/agent/run.sh`, B1.44): **%s** for B6.x.\\n\\n- outcome: %s\\n- tier: %s\\n- branch: `x`\\n"' "$1" "$1" "$2"
}
label() { printf '{"event":"labeled","created_at":"%s","actor":{"login":"lead","type":"User"},"label":{"name":"%s"}}' "$(ts "$1")" "${2:-agent-ready}"; }
says() { printf '{"event":"commented","created_at":"%s","user":{"login":"%s","type":"%s"},"body":%s}' "$(ts "$1")" "$2" "$3" "$4"; }
review() { printf '{"event":"reviewed","submitted_at":"%s","state":"commented","user":{"login":"lead","type":"User"},"body":%s}' "$(ts "$1")" "$2"; }
ready() { printf '{"event":"ready_for_review","created_at":"%s","actor":{"login":"lead","type":"User"}}' "$(ts "$1")"; }
draft() { printf '{"event":"convert_to_draft","created_at":"%s","actor":{"login":"lead","type":"User"}}' "$(ts "$1")"; }
commit() { # commit <sha> <time> <message JSON>
  printf '{"event":"committed","sha":"%s","committer":{"date":"%s","name":"lead"},"author":{"date":"%s","name":"lead"},"message":%s}' \
    "$1" "$(ts "$2")" "$(ts "$2")" "$3"
}
sha() { printf '%s%036d' "$1" 0; }
tl() { local n="$1" IFS=,; shift; printf '[%s]\n' "$*" > "$J/timeline.$n.json"; }
issue() { printf '{"state":"%s","body":"### Card id\\n\\nB6.%s\\n\\n### Why\\n\\nfixture\\n"}\n' "$2" "$1" > "$J/issue.50$1.json"; }
pr() { # pr <n> <head> <state> <isDraft> [mergedAt]
  local m=null; [[ -n "${5:-}" ]] && m="\"$(ts "$5")\""
  printf '{"state":"%s","headRefName":"%s","isDraft":%s,"createdAt":"%s","mergedAt":%s}\n' "$3" "$2" "$4" "$(ts 00:30)" "$m" > "$J/pr.$1.json"
}
RUN="$(runner ready medium)"; GATE_HIGH="$(runner gate high)"; GATE_MED="$(runner gate medium)"
AR='"chore(scripts): B6.x step\n\nCo-Authored-By: Claude <noreply@anthropic.com>\nAgent-Run: 1\n"'
HUMAN='"fix: B6.x by hand\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n"'
# issues
for i in 1 2 3 4 5 6 8; do issue "$i" OPEN; done; issue 7 CLOSED
tl 501 "$(label 01:00)" "$(says 02:00 lead User "$RUN")" "$(says 02:30 'github-actions[bot]' Bot '"review queued"')" '{"event":"closed","created_at":"2026-11-04T09:00:00Z"}'
tl 502 "$(label 01:00)" "$(says 01:30 lead User '"please also cover the empty case"')" "$(says 02:00 lead User "$RUN")"
tl 503 "$(label 01:00)" "$(says 01:20 lead User "$GATE_HIGH")" "$(says 01:40 lead User '"  approve; decisions 1-2 as proposed"')" "$(says 02:00 lead User "$RUN")"
tl 504 "$(label 01:00)" "$(says 01:20 lead User "$GATE_MED")" "$(says 01:40 lead User '"approve"')" "$(says 02:00 lead User "$RUN")"
tl 505 "$(label 00:10)" "$(says 01:30 lead User '"wait, rethink"')" "$(label 02:00)" "$(label 02:30 bug)" "$(says 02:40 lead User "$RUN")"
tl 506 "$(label 01:00)"; tl 507 "$(label 01:00)" "$(says 02:00 lead User "$RUN")"; tl 508 "$(label 01:00)"
printf '[%s]\n' '{"number":501},{"number":502},{"number":503},{"number":504},{"number":505},{"number":506},{"number":507},{"number":508}' > "$J/issues.json"
# PRs
printf '[%s]\n' '{"number":601,"headRefName":"chore/B6.1-agent"},{"number":602,"headRefName":"feat/B6.2-agent"},{"number":603,"headRefName":"chore/B6.3-agent"},{"number":604,"headRefName":"chore/B6.4-agent"},{"number":605,"headRefName":"chore/B6.5-agent"},{"number":608,"headRefName":"chore/B6.8-agent"},{"number":609,"headRefName":"chore/B6.9-agent"},{"number":610,"headRefName":"feat/B6.10-by-hand"},{"number":611,"headRefName":"chore/B6.1-agent-old"}' > "$J/prs.json"
pr 601 chore/B6.1-agent MERGED false 06:00; pr 602 feat/B6.2-agent MERGED false 06:00; pr 603 chore/B6.3-agent MERGED false 06:00
pr 604 chore/B6.4-agent CLOSED false; pr 605 chore/B6.5-agent MERGED false 06:00; pr 608 chore/B6.8-agent OPEN true
pr 609 chore/B6.9-agent OPEN false; pr 610 feat/B6.10-by-hand MERGED false 06:00
tl 601 "$(commit "$(sha a1)" 02:00 "$AR")" "$(commit "$(sha a2)" 02:50 "$HUMAN")" "$(ready 03:00)" \
  "$(says 03:10 'github-actions[bot]' Bot '"Claude review: looks fine"')" "$(commit "$(sha a3)" 03:30 "$AR")"
tl 602 "$(commit "$(sha b1)" 02:00 "$AR")" "$(ready 03:00)" "$(commit "$(sha b2)" 03:20 "$HUMAN")"
tl 603 "$(commit "$(sha c1)" 02:00 "$AR")" "$(ready 03:00)" "$(review 03:30 '"rename the helper"')"
tl 604 "$(commit "$(sha d1)" 02:00 "$AR")" "$(ready 03:00)"
tl 605 "$(commit "$(sha e1)" 02:50 "$AR")" "$(ready 03:00)" "$(draft 03:50)" "$(says 04:00 lead User '"one more thing"')" "$(ready 05:00)"
tl 608 "$(commit "$(sha f1)" 02:00 "$AR")"; tl 609 "$(commit "$(sha g1)" 02:00 "$AR")"
tl 610 "$(commit "$(sha h1)" 02:00 "$HUMAN")" "$(ready 03:00)"
R="$(ts 03:00)"; M="$(ts 06:00)"
script unattended.sh; cp "$TMP/out" "$TMP/u-default"
r3=0; [[ -x "$SRC/unattended.sh" ]] && { run unattended.sh 501 502 503 504 505 506 507 508 > "$TMP/u-args"; r3=$?; }
[[ "$(row 501)" == "$(printf '501\tB6.1\t601\t%s\t%s\t0\tyes' "$(ts 01:00)" "$R")" ]] && ok M30 || fail "M30 $(row 501)"
[[ "$(row 502)" == "$(printf '502\tB6.2\t602\t%s\t%s\t1\tno' "$(ts 01:00)" "$R")" ]] && ok M31 || fail "M31 $(row 502)"
[[ "$(cut -f6,7 <<< "$(row 503)")" == $'0\tyes' && "$(cut -f6,7 <<< "$(row 504)")" == $'1\tno' ]] && ok M32 \
  || fail "M32 $(row 503) | $(row 504)"
[[ "$(row 505)" == "$(printf '505\tB6.5\t605\t%s\t%s\t0\tyes' "$(ts 02:00)" "$R")" ]] && ok M33 || fail "M33 $(row 505)"
[[ "$(cut -f3-7 <<< "$(row 506)")" == $'-\t'"$(ts 01:00)"$'\t-\t0\tpending' && "$(cut -f3,5,7 <<< "$(row 507)")" == $'-\t-\tno' \
  && "$(cut -f3,5,7 <<< "$(row 508)")" == $'608\t-\tpending' && $rc -eq 0 ]] \
  && tail -1 "$TMP/out" | grep -qx 'unattended 3/6 = 50.0 % (pending 2)' && ok M34 \
  || fail "M34 rc=$rc $(row 506) | $(row 507) | $(row 508) | $(tail -1 "$TMP/out")"
script no-rework.sh; cp "$TMP/out" "$TMP/n-default"
[[ "$(row 601)" == "$(printf '601\tB6.1\t%s\t%s\t-\t0\tyes' "$R" "$M")" ]] \
  && run no-rework.sh 610 > "$TMP/out" && [[ "$(row 610)" == "$(printf '610\tB6.10\t%s\t%s\t-\t0\tyes' "$R" "$M")" ]] \
  && ok M35 || fail "M35 $(grep -h '^60\{0,1\}1	\|^610	' "$TMP/n-default" "$TMP/out" | tr '\n' '|')"
cp "$TMP/n-default" "$TMP/out"
[[ "$(cut -f5-7 <<< "$(row 602)")" == "$(sha b2 | cut -c1-7)"$'\t0\tno' && "$(cut -f5-7 <<< "$(row 603)")" == $'-\t1\tno' \
  && "$(cut -f4,7 <<< "$(row 604)")" == $'-\tno' && "$(cut -f7 <<< "$(row 609)")" == pending && $rc -eq 0 ]] \
  && tail -1 "$TMP/out" | grep -qx 'no-rework 1/5 = 20.0 % (pending 2)' && ok M36 \
  || fail "M36 rc=$rc $(row 602) | $(row 603) | $(row 604) | $(row 609) | $(tail -1 "$TMP/out")"
[[ $r3 -eq 0 ]] && cmp -s "$TMP/u-default" "$TMP/u-args" && [[ "$(cut -f3 <<< "$(row 605)")" == "$R" ]] \
  && [[ "$(awk -F'\t' '$1 == 505 { print $5 }' "$TMP/u-default")" == "$R" ]] \
  && [[ "$(awk -F'\t' 'NR > 1 && NF > 1 { print $1 }' "$TMP/n-default" | tr '\n' ' ')" == '601 602 603 604 605 608 609 ' ]] && ok M37 \
  || fail "M37 r3=$r3 $(diff "$TMP/u-default" "$TMP/u-args" | head -3 | tr '\n' '|') $(awk -F'\t' 'NR > 1 { print $1 }' "$TMP/n-default" | tr '\n' ' ')"

# review pass 1: issues #513–#515 and PRs #612–#616 join after the default sets are read (M34, M36, M37 unchanged)
jq '. + [{"number":612,"headRefName":"chore/B6.12-agent"},{"number":613,"headRefName":"chore/B6.13-agent"},{"number":614,"headRefName":"chore/B6.14-agent"},{"number":615,"headRefName":"chore/B6.15-agent"},{"number":616,"headRefName":"feat/B6.15-agent"}]' \
  "$J/prs.json" > "$J/prs.next" && mv "$J/prs.next" "$J/prs.json"
for i in 13 14 15; do printf '{"state":"OPEN","body":"### Card id\\n\\nB6.%s\\n"}\n' "$i" > "$J/issue.5$i.json"; done
# M38: a user comment on the draft before ready, and a comment and a trailer-less commit after the merge, are no rework
pr 612 chore/B6.12-agent MERGED false 06:00
tl 612 "$(says 02:30 lead User '"still drafting?"')" "$(commit "$(sha i1)" 02:40 "$AR")" "$(ready 03:00)" \
  "$(says 06:30 lead User '"thanks"')" "$(commit "$(sha i2)" 06:40 "$HUMAN")"
run no-rework.sh 612 > "$TMP/out"
[[ "$(row 612)" == "$(printf '612\tB6.12\t%s\t%s\t-\t0\tyes' "$R" "$M")" ]] && ok M38 || fail "M38 $(row 612)"
# M39: a PR never drafted is ready at its creation (00:30) in both scripts
pr 613 chore/B6.13-agent MERGED false 06:00
tl 613 "$(commit "$(sha j1)" 01:00 "$HUMAN")"
tl 513 "$(label 00:10)" "$(says 00:20 lead User '"note"')" "$(says 01:00 lead User '"after"')"
run no-rework.sh 613 > "$TMP/out"; m39a="$(row 613)"
run unattended.sh 513 > "$TMP/out"; m39b="$(row 513)"
[[ "$m39a" == "$(printf '613\tB6.13\t%s\t%s\t%s\t0\tno' "$(ts 00:30)" "$M" "$(sha j1 | cut -c1-7)")" \
  && "$m39b" == "$(printf '513\tB6.13\t613\t%s\t%s\t1\tno' "$(ts 00:10)" "$(ts 00:30)")" ]] && ok M39 || fail "M39 $m39a | $m39b"
# M40: one high-tier gate comment excepts one approve; a second approve counts
pr 614 chore/B6.14-agent MERGED false 06:00; tl 614 "$(ready 03:00)"
tl 514 "$(label 01:00)" "$(says 01:20 lead User "$GATE_HIGH")" "$(says 01:40 lead User '"approve"')" "$(says 01:50 lead User '"approve, and also X"')"
run unattended.sh 514 > "$TMP/out"
[[ "$(cut -f6,7 <<< "$(row 514)")" == $'1\tno' ]] && ok M40 || fail "M40 $(row 514)"
# M41: a relabel after ready does not move the window; of two agent PRs for one card, the highest number is the PR
pr 615 chore/B6.15-agent CLOSED false; tl 615 "$(ready 01:10)"
pr 616 feat/B6.15-agent MERGED false 06:00; tl 616 "$(ready 03:00)"
tl 515 "$(label 01:00)" "$(says 01:30 lead User '"also handle Y"')" "$(label 04:00)"
run unattended.sh 515 > "$TMP/out"
[[ "$(row 515)" == "$(printf '515\tB6.15\t616\t%s\t%s\t1\tno' "$(ts 01:00)" "$R")" ]] && ok M41 || fail "M41 $(row 515)"

# review pass 2: M42 a runner comment after the high-tier gate closes it: a later `approve` counts
jq '. + [{"number":617,"headRefName":"chore/B6.16-agent"}]' "$J/prs.json" > "$J/prs.next" && mv "$J/prs.next" "$J/prs.json"
printf '{"state":"OPEN","body":"### Card id\\n\\nB6.16\\n"}\n' > "$J/issue.516.json"
pr 617 chore/B6.16-agent MERGED false 06:00; tl 617 "$(ready 03:00)"
tl 516 "$(label 01:00)" "$(says 01:20 lead User "$GATE_HIGH")" "$(says 01:30 lead User "$(runner error:max_turns high)")" \
  "$(says 01:40 lead User '"approve"')"
run unattended.sh 516 > "$TMP/out"
[[ "$(cut -f6,7 <<< "$(row 516)")" == $'1\tno' ]] && ok M42 || fail "M42 $(row 516)"

# review pass 3: M43 only a comment that starts with the word `approve` answers the gate
jq '. + [{"number":618,"headRefName":"chore/B6.17-agent"}]' "$J/prs.json" > "$J/prs.next" && mv "$J/prs.next" "$J/prs.json"
printf '{"state":"OPEN","body":"### Card id\\n\\nB6.17\\n"}\n' > "$J/issue.517.json"
pr 618 chore/B6.17-agent MERGED false 06:00; tl 618 "$(ready 03:00)"
tl 517 "$(label 01:00)" "$(says 01:20 lead User "$GATE_HIGH")" "$(says 01:30 lead User '"I would approve once you split Q3"')" \
  "$(says 01:40 lead User '"approved, but redo Q3"')"
run unattended.sh 517 > "$TMP/out"
[[ "$(cut -f6,7 <<< "$(row 517)")" == $'2\tno' ]] && ok M43 || fail "M43 $(row 517)"

[[ -s "$FIX/denied.log" ]] && { fail "gh shim denied:"; sed 's/^/  /' "$FIX/denied.log"; }
echo "[metrics-smoke] $oks ok, $fails FAIL"
[[ $fails -eq 0 ]]
