# Source only, shared by the guards (and plan_lists by .claude/hooks/plan-scope.sh). Bash 3.2 and 5 alike.
# resolve_range: the commit range the guards inspect: BASE_SHA..HEAD_SHA from CI, else merge-base with main.
resolve_range() {
  HEAD_SHA="${HEAD_SHA:-HEAD}"
  if [[ -z "${BASE_SHA:-}" || "${BASE_SHA:-}" =~ ^0+$ ]]; then
    if git rev-parse --verify --quiet origin/main >/dev/null; then
      BASE_SHA="$(git merge-base origin/main "$HEAD_SHA")"
    elif git rev-parse --verify --quiet main >/dev/null && [[ "$(git rev-parse main)" != "$(git rev-parse "$HEAD_SHA")" ]]; then
      BASE_SHA="$(git merge-base main "$HEAD_SHA")"
    else
      BASE_SHA="$(git rev-parse "$HEAD_SHA~1" 2>/dev/null || git hash-object -t tree /dev/null)"
    fi
  fi
  export BASE_SHA HEAD_SHA
  echo "[ci] range ${BASE_SHA:0:10}..${HEAD_SHA:0:10}"
}
# plan_lists <path> <token>: 0 when a Files token of a plan covers the path (B1.32), for plan-scope.sh and
# check-plan-scope.sh alike. Only `*` is a wildcard ([id], ? and \ name themselves), and it matches within one path
# segment, except that a last segment `*` covers the whole directory below it (prisma/migrations/*).
plan_lists() {
  local f="$1/" p="$2/" ps q c
  while [[ -n "$f" && -n "$p" ]]; do
    ps="${p%%/*}"; p="${p#*/}"
    [[ "$ps" == '*' && -z "$p" ]] && return 0
    q="" # the segment as a pattern: every character escaped but `*` (printf %q's form depends on the locale)
    while [[ -n "$ps" ]]; do c="${ps:0:1}"; ps="${ps:1}"; if [[ "$c" == '*' ]]; then q+='*'; else q+="\\$c"; fi; done
    [[ "${f%%/*}" == $q ]] || return 1
    f="${f#*/}"
  done
  [[ "$f" == "$p" ]] # both used up: as many segments as the token
}
