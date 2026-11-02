#!/usr/bin/env bash
# Probes E1–E9 of scripts/agent/eligible.sh (B1.43) with a `gh` shim that logs every call and answers from fixture
# JSON through the script's own --jq filter (real jq), so the filters are tested without network.
#   scripts/agent/eligible-smoke.sh
#   E1 write labeler and author: exit 0, the exact gh lines   E2 read labeler refused     E3 removed and re-added
#   E4 missing, removed, look-alike label; no actor refused   E5 maintain, admin accepted E6 bad argument, gh failure
#   E7 a caller's GH_REPO/GH_HOST never reach gh              E8 another label's events do not count
#   E9 read author refused; gh runs in the repo root
set -uo pipefail
command -v jq >/dev/null || { echo "eligible-smoke: needs jq (the shim applies gh's --jq filters with it)" >&2; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd -P)"
SRC="$HERE/eligible.sh"
ROOT="$(cd "$HERE/../.." && pwd -P)"
TMP="$(mktemp -d)"; trap 'rm -rf -- "$TMP"' EXIT
FIX="$TMP/fix"; LOG="$TMP/gh.log"; mkdir -p "$TMP/bin" "$FIX" "$TMP/elsewhere"
oks=0; fails=0
ok() { echo "ok   $1"; oks=$((oks + 1)); }
fail() { echo "FAIL $1"; fails=$((fails + 1)); }

cat > "$TMP/bin/gh" <<'SHIM'
#!/bin/bash
echo "$(pwd -P) GH_REPO=${GH_REPO:-} GH_HOST=${GH_HOST:-} $*" >> "$SMOKE_LOG"
[[ "$1" == api ]] || exit 9
shift; [[ "$1" == --paginate ]] && shift
ep="$1"; [[ "${2:-}" == --jq ]] || exit 9
[[ -n "${FAIL_ON:-}" && "$ep" == *"$FAIL_ON"* ]] && { echo "HTTP 502: boom" >&2; exit 1; }
case "$ep" in
  'repos/{owner}/{repo}/issues/'*/events) file=events.json ;;
  'repos/{owner}/{repo}/issues/'*) file=issue.json ;;
  'repos/{owner}/{repo}/collaborators/'*/permission)
    login="${ep#repos/\{owner\}/\{repo\}/collaborators/}"; file="perm-${login%/permission}.json" ;;
  *) exit 9 ;;
esac
[[ -f "$SMOKE_FIX/$file" ]] || { echo "gh: Not Found (HTTP 404)" >&2; exit 1; }
jq -r "$3" "$SMOKE_FIX/$file"
SHIM
chmod +x "$TMP/bin/gh"

issue() { # issue <author> [<label>…]
  local author="$1"; shift; local labels="" l
  for l in "$@"; do labels="$labels${labels:+,}{\"name\":\"$l\"}"; done
  printf '{"number":7,"user":{"login":"%s"},"labels":[%s]}\n' "$author" "$labels" > "$FIX/issue.json"
}
events() { # events [<event>:<label>:<actor>…]
  local e items='{"event":"assigned","actor":{"login":"x"}}' ev label actor
  for e in "$@"; do
    ev="${e%%:*}"; label="${e#*:}"; label="${label%%:*}"; actor="${e##*:}"
    items="$items,{\"event\":\"$ev\",\"label\":{\"name\":\"$label\"},\"actor\":{\"login\":\"$actor\"}}"
  done
  printf '[%s]\n' "$items" > "$FIX/events.json"
}
perm() { printf '{"permission":"%s","role_name":"%s","user":{"login":"%s"}}\n' "$2" "$3" "$1" > "$FIX/perm-$1.json"; }
reset() { rm -f "$FIX"/*.json; : > "$LOG"; }
run() { # run <args…>: exit code; stdout in $TMP/out, stderr in $TMP/err
  (cd "${DIR:-$ROOT}" && SMOKE_LOG="$LOG" SMOKE_FIX="$FIX" PATH="$TMP/bin:$PATH" "$SRC" "$@") > "$TMP/out" 2> "$TMP/err"
  echo $?
}
refused() { # refused <label> <reason substring> <args…>: exit 1, nothing on stdout, the reason on stderr
  local label="$1" reason="$2" rc; shift 2; rc="$(run "$@")"
  [[ "$rc" == 1 && ! -s "$TMP/out" ]] && grep -qF -- "$reason" "$TMP/err" && return 0
  echo "     $label: rc=$rc out=$(head -1 "$TMP/out") err=$(head -1 "$TMP/err")"; return 1
}
accepted() { # accepted <label> <exact stdout> <args…>
  local label="$1" want="$2" rc; shift 2; rc="$(run "$@")"
  [[ "$rc" == 0 && "$(cat "$TMP/out")" == "$want" ]] && return 0
  echo "     $label: rc=$rc out=$(head -1 "$TMP/out") err=$(head -1 "$TMP/err")"; return 1
}

EVF='.[] | select((.event == "labeled" or .event == "unlabeled") and .label.name == "agent-ready") | [.event, (.actor.login // "")] | @tsv'
PERMF='[.permission, .role_name] | @tsv'

# E1
reset; issue alice bug agent-ready; events labeled:agent-ready:lead; perm lead write write; perm alice admin admin
want="$(printf '%s\n' \
  "$ROOT GH_REPO= GH_HOST= api repos/{owner}/{repo}/issues/7 --jq .user.login, .labels[].name" \
  "$ROOT GH_REPO= GH_HOST= api --paginate repos/{owner}/{repo}/issues/7/events --jq $EVF" \
  "$ROOT GH_REPO= GH_HOST= api repos/{owner}/{repo}/collaborators/lead/permission --jq $PERMF" \
  "$ROOT GH_REPO= GH_HOST= api repos/{owner}/{repo}/collaborators/alice/permission --jq $PERMF")"
accepted E1 'eligible: #7 agent-ready labeled by lead (write), author alice (admin)' 7 && [[ "$(cat "$LOG")" == "$want" ]] \
  && ok E1 || fail "E1 log=$(cat "$LOG")"
# E2
r=0
for p in 'read triage' 'read read' 'none none'; do
  reset; issue alice agent-ready; events labeled:agent-ready:bob; perm alice admin admin; perm bob ${p% *} ${p#* }
  refused "E2 $p" "eligible: #7 labeler bob has ${p% *} (${p#* }), needs write" 7 || r=1
done
[[ $r -eq 0 ]] && ok E2 || fail E2
# E3
r=0; reset; issue alice agent-ready; perm alice admin admin; perm lead write write; perm bob read read
events labeled:agent-ready:lead unlabeled:agent-ready:lead labeled:agent-ready:bob
refused 'write, removed, read' 'labeler bob has read (read), needs write' 7 || r=1
events labeled:agent-ready:bob unlabeled:agent-ready:lead labeled:agent-ready:lead
accepted 'read, removed, write' 'eligible: #7 agent-ready labeled by lead (write), author alice (admin)' 7 || r=1
[[ $r -eq 0 ]] && ok E3 || fail E3
# E4
r=0; reset; perm alice admin admin; perm lead write write
issue alice bug; events; refused 'never labeled' 'eligible: #7 not labeled agent-ready' 7 || r=1
events labeled:agent-ready:lead unlabeled:agent-ready:lead
refused 'labeled then removed' 'eligible: #7 not labeled agent-ready' 7 || r=1
issue alice agent-ready; refused 'present, last event unlabeled' "eligible: #7 label's last event is not labeled" 7 || r=1
events; refused 'present, no event' "eligible: #7 label's last event is not labeled" 7 || r=1
issue alice not-agent-ready agent-ready-later; events labeled:agent-ready:lead
refused 'only look-alike labels' 'eligible: #7 not labeled agent-ready' 7 || r=1
issue alice agent-ready; printf '[{"event":"labeled","label":{"name":"agent-ready"},"actor":null}]\n' > "$FIX/events.json"
refused 'deleted actor' "eligible: #7 label's last event has no actor" 7 || r=1
[[ $r -eq 0 ]] && ok E4 || fail E4
# E5
r=0; reset; issue alice agent-ready; perm alice admin admin
perm mo write maintain; events labeled:agent-ready:mo
accepted maintain 'eligible: #7 agent-ready labeled by mo (maintain), author alice (admin)' 7 || r=1
events labeled:agent-ready:alice
accepted admin 'eligible: #7 agent-ready labeled by alice (admin), author alice (admin)' 7 || r=1
[[ $r -eq 0 ]] && ok E5 || fail E5
# E6
r=0; reset; issue alice agent-ready; events labeled:agent-ready:lead; perm lead write write; perm alice admin admin
for args in '' '7a' '0' '-1' '7 8'; do
  : > "$LOG"; # shellcheck disable=SC2086
  refused "argument '$args'" 'eligible: usage' $args && [[ ! -s "$LOG" ]] || { echo "     argument '$args': gh called"; r=1; }
done
for f in 'issues/7' 'issues/7/events' 'collaborators/lead' 'collaborators/alice'; do
  FAIL_ON="$f" refused "gh fails on $f" 'gh failed: HTTP 502: boom' 7 || r=1
done
rm -f "$FIX/perm-lead.json"; refused 'permission 404' 'gh failed: gh: Not Found (HTTP 404)' 7 || r=1
[[ $r -eq 0 ]] && ok E6 || fail E6
# E7
reset; issue alice agent-ready; events labeled:agent-ready:lead; perm lead write write; perm alice admin admin
rc="$( (cd "$ROOT" && GH_REPO=evil/x GH_HOST=evil.example SMOKE_LOG="$LOG" SMOKE_FIX="$FIX" PATH="$TMP/bin:$PATH" \
  "$SRC" 7) >/dev/null 2>&1; echo $?)"
[[ "$rc" == 0 && "$(wc -l < "$LOG" | tr -d ' ')" == 4 ]] && ! grep -qv " GH_REPO= GH_HOST= api " "$LOG" \
  && ok E7 || fail "E7 rc=$rc log=$(cat "$LOG")"
# E8
r=0; reset; issue alice agent-ready bug; perm lead write write; perm alice admin admin; perm bob read read
events labeled:agent-ready:lead labeled:bug:bob unlabeled:wontfix:bob
accepted 'other label later' 'eligible: #7 agent-ready labeled by lead (write), author alice (admin)' 7 || r=1
[[ $r -eq 0 ]] && ok E8 || fail E8
# E9
r=0; reset; issue mallory agent-ready; events labeled:agent-ready:lead; perm lead write write; perm mallory read read
refused 'read author' 'eligible: #7 author mallory has read (read), needs write' 7 || r=1
issue alice agent-ready; perm alice admin admin; : > "$LOG"
DIR="$TMP/elsewhere" accepted 'other directory' 'eligible: #7 agent-ready labeled by lead (write), author alice (admin)' 7 \
  && [[ "$(cut -d' ' -f1 "$LOG" | sort -u)" == "$ROOT" ]] || { echo "     other directory: log=$(head -1 "$LOG")"; r=1; }
[[ $r -eq 0 ]] && ok E9 || fail E9

echo
if [[ $fails -eq 0 ]]; then echo "$oks probes OK"; exit 0; fi
echo "$fails of $((oks + fails)) probes FAILED"; exit 1
