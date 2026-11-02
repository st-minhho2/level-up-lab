#!/usr/bin/env bash
# Smoke for scripts/agent/feature-map.sh (B1.45): the agent-card table on a throwaway repo whose bare origin holds the
# card branches and their plans. No network, no gh auth: a gh shim answers only the exact read calls the script makes,
# from files in $GH_FIX, and a stub stands in for scripts/agent/tier.sh (B1.44). Exit 1 on any FAIL. bash 3.2-safe.
#   scripts/agent/feature-map-smoke.sh
#
#   F1  order high > unknown > medium > low > queued     F2  same tier → issue number ascending
#   F3  Evidence parsed: AC 3/4, deviations with | escaped F4  no Evidence section → AC ?, deviations ?
#   F5  B9.10 and docs/B9.1-done|-partial|-card|-file-card are not B9.1's PR; docs/B9.8-guides, docs/B9.9-scorecard are
#   F6  card id from the issue body; none anywhere → a "?" row, queued
#   F7  --json exact                                       F8  gh issue list fails → exit 1, no table
#   F9  no agent-ready issue → heading + "No open agent-ready issues.", exit 0
#   F10 unknown flag → exit 2                              F11 the PR template holds the four keys under ## Evidence
#   F12 FEATURE_MAP_DATE in the heading                    F13 an empty deviations value → ?
#   F14 stub tier high + body tier low → "high (body: low)", ranked high
#   F15 no tier.sh → unknown                               F16 a high plan approved, then a .github/ row dropped at the
#       tip → still high (the approval commit's plan); an unapproved plan → "<tier> (unapproved)"
#   review pass 1: F17 a fork's PR on the card's branch name is not the card's PR (isCrossRepository)
#   F18 the latest approval wins (low, then high in round 2 → high); a round-2 approval counts (B9.2 medium)
#   F1 also holds a queued issue numbered below the low row; F7 escapes a backslash and folds a tab; F10 --json extra;
#   F15 a body tier in capitals still compares
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
TOP="$PWD"
SRC="$TOP/scripts/agent/feature-map.sh"

TMP="$(cd "$(mktemp -d)" && pwd -P)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT
fails=0; oks=0
ok() { oks=$((oks + 1)); echo "ok   $1"; }
fail() { fails=$((fails + 1)); echo "FAIL $1"; }

REPO="$TMP/repo"; ORIGIN="$TMP/origin.git"
mkdir -p "$REPO" "$TMP/bin"
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
g() { git -C "$REPO" -c user.name=s -c user.email=s@x "$@"; }
plan() { # plan <card> <file-row> <subject>: commit backlog/work/<card>/plan.md with one Files row
  mkdir -p "$REPO/backlog/work/$1"
  printf '# %s plan\n\n## Files\n\n| File | Change |\n| ---- | ------ |\n| `%s` | x |\n\nPlan approved by: lead\n' \
    "$1" "$2" > "$REPO/backlog/work/$1/plan.md"
  g add -A && g commit -q --no-verify -m "$3"
}
branch() { g checkout -q -b "$1" main; }

# --- repo and origin ----------------------------------------------------------------------------------------------
g init -q -b main
echo base > "$REPO/README.md"; g add -A; g commit -q --no-verify -m "chore: base"
branch chore/B9.1-a; plan B9.1 .github/x.yml "docs(backlog): B9.1 plan approved"
branch feat/B9.2-b; plan B9.2 src/lib/b.ts "docs(backlog): B9.2 plan round 2 approved"
branch chore/B9.3-c; plan B9.3 docs/c.md "docs(backlog): B9.3 plan approved"
branch feat/B9.4-d; echo d > "$REPO/d.txt"; g add -A; g commit -q --no-verify -m "chore: B9.4 no plan"
branch chore/B9.6-f; plan B9.6 .github/f.yml "docs(backlog): B9.6 plan approved"
branch chore/B9.7-g; plan B9.7 .github/g.yml "docs(backlog): B9.7 plan approved"
plan B9.7 docs/g.md "docs(backlog): B9.7 plan tweak" # after approval: the tip's plan alone would read low
branch docs/B9.8-guides; echo h > "$REPO/h.md"; g add -A; g commit -q --no-verify -m "docs: B9.8 guides"
branch docs/B9.9-scorecard; plan B9.9 src/i.ts "docs(backlog): B9.9 plan" # never approved
branch chore/B9.12-l; plan B9.12 docs/l.md "docs(backlog): B9.12 plan approved"
plan B9.12 .github/l.yml "docs(backlog): B9.12 plan round 2 approved"
for b in docs/B9.1-done docs/B9.1-partial docs/B9.1-card docs/B9.1-file-card feat/B9.10-x; do
  branch "$b"; plan B9.1 docs/lane.md "docs(backlog): B9.1 lane"
done
g checkout -q main
git init -q --bare "$ORIGIN"
g remote add origin "$ORIGIN"
g push -q origin --all

# --- gh shim: exact read calls only, answered from $GH_FIX ------------------------------------------------------
cat > "$TMP/bin/gh" <<'SHIM'
#!/usr/bin/env bash
deny() { echo "DENIED: $*" >> "$GH_FIX/../denied.log"; echo "gh shim: denied" >&2; exit 99; }
ISSUES="issue list --label agent-ready --state open --limit 100 --json number,title --jq .[] | [.number, .title] | @tsv"
PRS="pr list --state open --limit 100 --json number,headRefName,isDraft,isCrossRepository --jq .[] | [.number, .headRefName, (.isDraft | tostring), (.isCrossRepository | tostring)] | @tsv"
case "$*" in
  "$ISSUES") [[ -f "$GH_FIX/issue-list-fails" ]] && { echo "gh: HTTP 502" >&2; exit 1; }; cat "$GH_FIX/issues.tsv" ;;
  "$PRS") cat "$GH_FIX/prs.tsv" ;;
  "issue view "[0-9]*" --json body --jq .body") n="${3}"; [[ -f "$GH_FIX/issue-$n.md" ]] || deny "$@"; cat "$GH_FIX/issue-$n.md" ;;
  "pr view "[0-9]*" --json body --jq .body") n="${3}"; [[ -f "$GH_FIX/pr-$n.md" ]] || deny "$@"; cat "$GH_FIX/pr-$n.md" ;;
  *) deny "$@" ;;
esac
SHIM
chmod +x "$TMP/bin/gh"
cat > "$TMP/tier-stub" <<'STUB'
#!/usr/bin/env bash
# stand-in for scripts/agent/tier.sh <plan.md> (D-28, B1.44): high on .github/, medium on src/, low otherwise
if grep -q '`\.github/' "$1"; then echo high; elif grep -q '`src/' "$1"; then echo medium; else echo low; fi
STUB
chmod +x "$TMP/tier-stub"

T="$(printf '\t')"
evidence() { # evidence <ac> <tier> <deviations>
  printf '## Item\n\nx\n\n## Evidence\n\n- AC met: %s\n- tier: %s\n- plan deviations: %s\n- trace: n/a\n\n## Checklist\n\n- [ ] x\n' "$1" "$2" "$3"
}
FULL="$TMP/full"; mkdir -p "$FULL"
cat > "$FULL/issues.tsv" <<EOF
21${T}B9.12 twelve
20${T}Something without an id
19${T}B9.9 scorecard
18${T}B9.8 guides
17${T}B9.7 seven
15${T}B9.5 queued
14${T}B9.4 four
13${T}B9.3 three
12${T}B9.2 two
11${T}B9.1 one
6${T}An issue whose id is in the body
5${T}B9.11 queued early
EOF
printf '### Card id\n\nB9.6\n\n### Acceptance\n\nx\n' > "$FULL/issue-6.md"
printf '### Card id\n\n_No response_\n' > "$FULL/issue-20.md"
cat > "$FULL/prs.tsv" <<EOF
130${T}chore/B9.1-a${T}false${T}true
117${T}chore/B9.12-l${T}false${T}false
116${T}feat/B9.10-x${T}false${T}false
115${T}docs/B9.1-file-card${T}false${T}false
114${T}docs/B9.1-card${T}false${T}false
113${T}docs/B9.1-partial${T}false${T}false
112${T}docs/B9.1-done${T}false${T}false
109${T}docs/B9.9-scorecard${T}true${T}false
108${T}docs/B9.8-guides${T}false${T}false
107${T}chore/B9.7-g${T}false${T}false
106${T}chore/B9.6-f${T}true${T}false
104${T}feat/B9.4-d${T}true${T}false
103${T}chore/B9.3-c${T}false${T}false
102${T}feat/B9.2-b${T}true${T}false
101${T}chore/B9.1-a${T}false${T}false
EOF
evidence 3/4 low 'src/x.ts ("needed" | by y)' > "$FULL/pr-101.md"
evidence 2/2 Medium none > "$FULL/pr-102.md"
printf '## Item\n\nno evidence here\n' > "$FULL/pr-103.md"
evidence 1/1 pending '' > "$FULL/pr-104.md"
evidence 4/4 high none > "$FULL/pr-106.md"
evidence 5/5 pending none > "$FULL/pr-107.md"
evidence 1/2 pending none > "$FULL/pr-108.md"
evidence 0/3 pending none > "$FULL/pr-109.md"
for n in 112 113 114 115 116; do evidence 9/9 low lane > "$FULL/pr-$n.md"; done
evidence 7/7 low none > "$FULL/pr-130.md" # a fork's PR claiming B9.1's branch name
evidence 2/2 pending none > "$FULL/pr-117.md"

SMALL="$TMP/small"; mkdir -p "$SMALL"
printf '15\tB9.5 queued\n11\tB9.1 one\n' > "$SMALL/issues.tsv"
printf '101\tchore/B9.1-a\tfalse\tfalse\n' > "$SMALL/prs.tsv"
evidence 3/4 low "$(printf 'src\\x.ts ("needed" | by y)\tz.ts')" > "$SMALL/pr-101.md"
EMPTY="$TMP/empty"; mkdir -p "$EMPTY"; : > "$EMPTY/issues.tsv"; : > "$EMPTY/prs.tsv"
FAILS="$TMP/fails"; mkdir -p "$FAILS"; touch "$FAILS/issue-list-fails"; : > "$FAILS/prs.tsv"

run() { # run <fixture dir> [tier] -- args…: stdout → $TMP/out, stderr → $TMP/err, exit code → rc
  local fix="$1" tier="$2"; shift 2
  if [[ ! -x "$SRC" ]]; then rc=127; echo "missing $SRC" > "$TMP/out"; : > "$TMP/err"; return; fi
  if [[ -n "$tier" ]]; then
    (cd "$REPO" && PATH="$TMP/bin:$PATH" GH_FIX="$fix" FEATURE_MAP_DATE=2026-01-02 FEATURE_MAP_TIER="$tier" "$SRC" "$@") \
      > "$TMP/out" 2> "$TMP/err"; rc=$?
  else
    (cd "$REPO" && PATH="$TMP/bin:$PATH" GH_FIX="$fix" FEATURE_MAP_DATE=2026-01-02 "$SRC" "$@") > "$TMP/out" 2> "$TMP/err"; rc=$?
  fi
}
row() { grep -E "^\| [0-9]+ \| $1 \|" "$TMP/out" | head -1; }  # the markdown row of a card ("?" → \?)
cell() { row "$1" | awk -F' \\| ' -v c="$2" '{ print $c }'; } # cell <card-re> <n>: 1 #, 2 card, 3 issue, 4 PR, 5 state, 6 tier, 7 AC, 8 deviations |

# --- probes on the full fixture with the stub tier ----------------------------------------------------------------
run "$FULL" "$TMP/tier-stub"
cards="$(grep -E '^\| [0-9]+ \|' "$TMP/out" | awk -F' \\| ' '{ print $2 }' | tr '\n' ' ')"
[[ $rc -eq 0 && "$cards" == "B9.6 B9.1 B9.7 B9.12 B9.4 B9.8 B9.2 B9.9 B9.3 B9.11 B9.5 ? " ]] && ok "F1 order high>unknown>medium>low>queued" \
  || fail "F1 order (rc $rc): '$cards'"
[[ "$(cell B9.6 3)" == "#6" && "$(cell B9.1 3)" == "#11" && "$(cell B9.7 3)" == "#17" ]] && ok "F2 ties by issue number" \
  || fail "F2 ties: $(cell B9.6 3) $(cell B9.1 3) $(cell B9.7 3)"
[[ "$(cell B9.1 7)" == "3/4" && "$(row B9.1)" == *'| src/x.ts ("needed" \| by y) |' ]] && ok "F3 Evidence parsed, | escaped" \
  || fail "F3 Evidence: $(row B9.1)"
[[ "$(cell B9.3 7)" == "?" && "$(row B9.3)" == *'| ? |' ]] && ok "F4 no Evidence → ?" || fail "F4: $(row B9.3)"
[[ "$(cell B9.1 4)" == "#101" && "$(cell B9.8 4)" == "#108" && "$(cell B9.9 4)" == "#109" ]] \
  && ! grep -q '#11[2-6]' "$TMP/out" && ok "F5 lane branches and B9.10 excluded, docs work branches kept" \
  || fail "F5 PRs: B9.1 $(cell B9.1 4) B9.8 $(cell B9.8 4) B9.9 $(cell B9.9 4)"
[[ "$(cell B9.6 2)" == "B9.6" && "$(row '\?')" == '| 12 | ? | #20 | - | queued | - | - | - |' ]] \
  && ok "F6 card from body; none → ? row" || fail "F6: '$(row B9.6)' / '$(row '\?')'"
[[ "$(cell B9.4 8)" == '? |' && "$(cell B9.4 6)" == "unknown" ]] && ok "F13 empty deviations → ?" || fail "F13: $(row B9.4)"
[[ "$(cell B9.1 6)" == "high (body: low)" && "$(cell B9.1 1)" == "| 2" ]] && ok "F14 body tier shown, not ranked" \
  || fail "F14: $(row B9.1)"
[[ "$(cell B9.7 6)" == "high" && "$(cell B9.9 6)" == "medium (unapproved)" ]] && ok "F16 approval commit's plan; unapproved marked" \
  || fail "F16: '$(cell B9.7 6)' '$(cell B9.9 6)'"
[[ "$(head -1 "$TMP/out")" == "# Agent feature map — 2026-01-02" ]] && ok "F12 dated heading" || fail "F12: $(head -1 "$TMP/out")"
[[ "$(cell B9.1 4)" == "#101" && "$(cell B9.1 7)" == "3/4" ]] && ! grep -q '#130' "$TMP/out" && ok "F17 a fork's PR is not the card's" \
  || fail "F17: $(row B9.1)"
[[ "$(cell B9.12 6)" == "high" && "$(cell B9.2 6)" == "medium" ]] && ok "F18 latest approval wins; round-2 approval counts" \
  || fail "F18: '$(cell B9.12 6)' '$(cell B9.2 6)'"

run "$FULL" ""
[[ $rc -eq 0 && "$(cell B9.1 6)" == "unknown (body: low)" && "$(cell B9.2 6)" == "unknown (body: medium)" ]] \
  && ok "F15 no tier.sh → unknown" || fail "F15 (rc $rc): '$(cell B9.1 6)' '$(cell B9.2 6)'"

# --- --json, failures, empty, usage, template ---------------------------------------------------------------------
run "$SMALL" "$TMP/tier-stub" --json
want='[{"card":"B9.1","issue":11,"pr":101,"state":"review","tier":"high (body: low)","ac":"3/4","deviations":"src\\x.ts (\"needed\" | by y) z.ts"},{"card":"B9.5","issue":15,"pr":null,"state":"queued","tier":"-","ac":"-","deviations":"-"}]'
[[ $rc -eq 0 && "$(cat "$TMP/out")" == "$want" ]] && ok "F7 --json exact" || { fail "F7 --json (rc $rc)"; sed 's/^/  /' "$TMP/out"; }
run "$FAILS" "$TMP/tier-stub"
[[ $rc -eq 1 ]] && ! grep -q '|' "$TMP/out" && grep -q 'gh issue list' "$TMP/err" && ok "F8 gh fails → exit 1, no table" \
  || fail "F8 (rc $rc): $(cat "$TMP/err")"
run "$EMPTY" "$TMP/tier-stub"
[[ $rc -eq 0 && "$(cat "$TMP/out")" == "$(printf '# Agent feature map — 2026-01-02\n\nNo open agent-ready issues.')" ]] \
  && ok "F9 empty state" || fail "F9 (rc $rc): $(cat "$TMP/out")"
run "$EMPTY" "$TMP/tier-stub" --bogus; rc1=$rc
run "$EMPTY" "$TMP/tier-stub" --json extra
[[ $rc1 -eq 2 && $rc -eq 2 ]] && ok "F10 unknown flag, extra argument → exit 2" || fail "F10 (rc $rc1, $rc)"
keys="$(awk '/^## / { e = ($0 ~ /^## Evidence[[:space:]]*$/); next } e && /^- (AC met|tier|plan deviations|trace):/' \
  "$TOP/.github/pull_request_template.md" | sed -E 's/^- ([^:]+):.*/\1/' | tr '\n' ',')"
[[ "$keys" == "AC met,tier,plan deviations,trace," ]] && ok "F11 template Evidence keys" || fail "F11 template keys: '$keys'"

[[ -s "$TMP/denied.log" ]] && { fail "gh shim denied:"; sed 's/^/  /' "$TMP/denied.log"; }
if [[ $fails -eq 0 ]]; then echo "feature-map-smoke: $oks probes OK"; exit 0; fi
echo "feature-map-smoke: $fails FAIL, $oks ok"; exit 1
