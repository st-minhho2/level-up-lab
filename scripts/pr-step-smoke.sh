#!/usr/bin/env bash
# Probes R1–R10 of scripts/pr-step.sh (B1.23) on a throwaway repo with a bare origin and a `gh` shim that logs every
# call. A refusal must be the wrapper's own: exit 3, a "pr-step:" message, and no gh call and no push.
#   scripts/pr-step-smoke.sh
#   R1 push runs the exact git line                    R2 main, detached refused       R3 an argument to push refused
#   R4 draft runs the exact gh line, prints the number R5 body file missing, symlink, hard link, symlinked dir refused
#   R6 bad title refused                               R7 ready, ready --undo exact    R8 bad <n>, other head, fork refused
#   R9 unknown subcommand, a subdirectory refused      R10 a caller's GH_REPO never reaches gh
set -uo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)/pr-step.sh"
TMP="$(mktemp -d)"; trap 'rm -f -- "$TMP"/bin/gh; rm -rf -- "$TMP"' EXIT
REPO="$TMP/repo"; ORIGIN="$TMP/origin.git"; LOG="$TMP/gh.log"; mkdir -p "$TMP/bin" "$REPO"
oks=0; fails=0
ok() { echo "ok   $1"; oks=$((oks + 1)); }
fail() { echo "FAIL $1"; fails=$((fails + 1)); }
g() { git -C "$REPO" -c user.name=s -c user.email=s@x -c commit.gpgsign=false "$@" >/dev/null 2>&1; }

git init -q --bare "$ORIGIN"
g init -q -b main && mkdir -p "$REPO/backlog/work/B9.1" && echo x > "$REPO/README.md" && g add -A && g commit -q --no-verify -m base
g remote add origin "$ORIGIN" && g push -q origin main && g checkout -q -b feat/B9.1-x
printf 'body\n' > "$REPO/backlog/work/B9.1/pr-body.md"
cat > "$TMP/bin/gh" <<SHIM
#!/bin/bash
echo "GH_REPO=\${GH_REPO:-} \$*" >> '$LOG'
case "\$1 \$2" in
  "pr create") echo "https://github.com/o/r/pull/41" ;;
  "pr view") case "\$3" in 7) printf 'feat/B9.1-x\tfalse\n' ;; 8) printf 'feat/B9.2-y\tfalse\n' ;; 9) printf 'feat/B9.1-x\ttrue\n' ;; esac ;;
esac
exit 0
SHIM
chmod +x "$TMP/bin/gh"
run() { (cd "${DIR:-$REPO}" && PATH="$TMP/bin:$PATH" "$SRC" "$@") > "$TMP/out" 2> "$TMP/err"; echo $?; }
refused() { # refused <label> <args...>: exit 3, a pr-step message, no gh call
  local label="$1"; shift; : > "$LOG"; local rc; rc="$(run "$@")"
  [[ "$rc" == 3 ]] && grep -q '^pr-step: ' "$TMP/err" && [[ ! -s "$LOG" ]] && return 0
  echo "     $label: rc=$rc err=$(head -1 "$TMP/err") log=$(head -1 "$LOG")"; return 1
}

# R1
rc="$(run push)"
[[ "$rc" == 0 && "$(git -C "$ORIGIN" rev-parse feat/B9.1-x 2>/dev/null)" == "$(git -C "$REPO" rev-parse HEAD)" \
  && "$(git -C "$REPO" rev-parse --abbrev-ref '@{u}' 2>/dev/null)" == origin/feat/B9.1-x ]] && ok R1 || fail "R1 rc=$rc"
# R2
g checkout -q main; r2=0; refused main push || r2=1
g checkout -q --detach; refused detached push || r2=1; g checkout -q feat/B9.1-x
[[ $r2 -eq 0 ]] && ok R2 || fail R2
# R3
refused 'push extra' push origin && ok R3 || fail R3
# R4
: > "$LOG"; rc="$(run draft 'feat(todos): B9.1 add the x')"
[[ "$rc" == 0 && "$(cat "$TMP/out")" == 41 && "$(cat "$LOG")" == "GH_REPO= pr create --draft --base main --head feat/B9.1-x --title feat(todos): B9.1 add the x --body-file backlog/work/B9.1/pr-body.md" ]] \
  && ok R4 || fail "R4 rc=$rc out=$(cat "$TMP/out") log=$(cat "$LOG")"
# R5
B="$REPO/backlog/work/B9.1/pr-body.md"; r5=0
mv "$B" "$TMP/keep.md"; refused missing draft 'feat(todos): B9.1 add the x' || r5=1
printf 'secret\n' > "$TMP/secret.md"; ln -s "$TMP/secret.md" "$B"; refused symlink draft 'feat(todos): B9.1 add the x' || r5=1; rm -f "$B"
ln "$TMP/keep.md" "$B"; refused 'hard link' draft 'feat(todos): B9.1 add the x' || r5=1; rm -f "$B"
mv "$REPO/backlog/work/B9.1" "$TMP/realdir"; mv "$TMP/keep.md" "$TMP/realdir/pr-body.md"; ln -s "$TMP/realdir" "$REPO/backlog/work/B9.1"
refused 'symlinked dir' draft 'feat(todos): B9.1 add the x' || r5=1
rm -f "$REPO/backlog/work/B9.1"; mv "$TMP/realdir" "$REPO/backlog/work/B9.1"
[[ $r5 -eq 0 ]] && ok R5 || fail R5
# R6
r6=0
refused 'two lines' draft "$(printf 'feat(todos): B9.1 a\nb')" || r6=1
refused 'no card' draft 'feat(todos): add the x' || r6=1
refused 'other card' draft 'feat(todos): B9.2 add the x' || r6=1
refused '81 chars' draft "feat(todos): B9.1 $(printf 'x%.0s' $(seq 1 63))" || r6=1
refused 'section mark mid-title' draft 'feat(todos): B9.1 add § x' || r6=1
: > "$LOG"; rc="$(run draft "feat(todos): B9.1 $(printf 'x%.0s' $(seq 1 62))")"; [[ "$rc" == 0 ]] || { echo "     80 chars: rc=$rc"; r6=1; }
: > "$LOG"; rc="$(run draft 'feat(todos): B9.1 add the x (§9)')"
grep -qF -- '--title feat(todos): B9.1 add the x (§9) ' "$LOG" && [[ "$rc" == 0 ]] || { echo "     (§n) suffix: rc=$rc"; r6=1; }
[[ $r6 -eq 0 ]] && ok R6 || fail R6
# R7
: > "$LOG"; a="$(run ready 7)"; b="$(run ready 7 --undo)"
want="$(printf 'GH_REPO= pr view 7 --json headRefName,isCrossRepository --jq [.headRefName, .isCrossRepository] | @tsv\nGH_REPO= pr ready 7\nGH_REPO= pr view 7 --json headRefName,isCrossRepository --jq [.headRefName, .isCrossRepository] | @tsv\nGH_REPO= pr ready 7 --undo')"
[[ "$a" == 0 && "$b" == 0 && "$(cat "$LOG")" == "$want" ]] && ok R7 || fail "R7 $a $b log=$(cat "$LOG")"
# R8
r8=0; refused digits ready 7a || r8=1; refused 'extra word' ready 7 now || r8=1
for n in 8 9; do
  : > "$LOG"; rc="$(run ready "$n")"
  [[ "$rc" == 3 ]] && grep -q '^pr-step: ' "$TMP/err" && ! grep -q 'pr ready' "$LOG" || { echo "     ready $n: rc=$rc"; r8=1; }
done
[[ $r8 -eq 0 ]] && ok R8 || fail R8
# R9
r9=0; refused unknown merge 7 || r9=1; refused none || r9=1
mkdir -p "$REPO/sub"; DIR="$REPO/sub" refused subdirectory ready 7 || r9=1
[[ $r9 -eq 0 ]] && ok R9 || fail R9
# R10
: > "$LOG"; rc="$( (cd "$REPO" && GH_REPO=evil/x GH_HOST=evil.example PATH="$TMP/bin:$PATH" "$SRC" ready 7) >/dev/null 2>&1; echo $?)"
[[ "$rc" == 0 ]] && ! grep -qv '^GH_REPO= ' "$LOG" && ok R10 || fail "R10 rc=$rc log=$(cat "$LOG")"

echo "[pr-step-smoke] $oks ok, $fails FAIL"
[[ $fails -eq 0 ]]
