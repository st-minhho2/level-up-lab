# Source only. Resolves the commit range the guards inspect: BASE_SHA..HEAD_SHA from CI, else merge-base with main.
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
