#!/usr/bin/env bash
# The three PR steps a card session runs itself (B1.23; dev-lead Loop 5 and 9): the only command `.claude/settings.json`
# allows without asking, so every argument is checked here and `guard-bash.sh` lets a call through only as one plain
# segment from the top level. Labels and body edits stay outside (asked). A refusal exits 3 with "pr-step: <why>".
#   scripts/pr-step.sh push                 git push -u origin HEAD:refs/heads/<branch>
#   scripts/pr-step.sh draft "<title>"      gh pr create --draft, body from backlog/work/<card>/pr-body.md; prints the PR number
#   scripts/pr-step.sh ready <n> [--undo]   gh pr ready <n> [--undo], only for this branch's own PR
set -euo pipefail
refuse() { echo "pr-step: $*" >&2; exit 3; }
unset GH_REPO GH_HOST GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY GIT_CONFIG GIT_CONFIG_GLOBAL GIT_CONFIG_SYSTEM
for v in $(compgen -e | grep '^GIT_CONFIG_' || true); do unset "$v"; done

top="$(git rev-parse --show-toplevel 2>/dev/null)" || refuse "not in a git checkout"
top="$(cd -P "$top" && pwd -P)"
[[ "$(pwd -P)" == "$top" ]] || refuse "run from the top level of the worktree ($top)"
branch="$(git symbolic-ref --quiet --short HEAD 2>/dev/null)" || refuse "HEAD is detached"
[[ "$branch" =~ ^(feat|fix|chore|test|docs)/(B[0-9]+\.[0-9]+)(-[a-z0-9-]+)?$ ]] || refuse "branch '$branch' is not a card branch"
card="${BASH_REMATCH[2]}"

case "${1:-}" in
  push)
    [[ $# -eq 1 ]] || refuse "push takes no argument"
    git push -u origin "HEAD:refs/heads/$branch"
    ;;
  draft)
    [[ $# -eq 2 ]] || refuse 'draft takes one argument: "<title>"'
    title="$2"
    [[ "$title" != *$'\n'* && ${#title} -le 80 ]] || refuse "title must be one line of at most 80 characters"
    base="$title" # the PR convention may end the title in " (§<n>)", the only non-ASCII allowed
    case "$title" in *" (§"*")") base="${title% (§*}"; [[ "${title#"$base"}" =~ ^\ \(§[0-9]+\)$ ]] || base="$title" ;; esac
    [[ "$base" =~ ^(feat|fix|chore|test|docs)\([a-z]+\):\ ${card//./\\.}\ [\ -~]+$ ]] \
      || refuse "title must read '<type>(<pkg>): $card <summary>[ (§<n>)]', the summary in printable ASCII"
    rel="backlog/work/$card/pr-body.md"; body="$top/$rel"
    [[ -f "$body" && ! -L "$body" ]] || refuse "$rel must be a regular file, not a symlink"
    [[ -n "$(find "$body" -maxdepth 0 -links 1)" ]] || refuse "$rel must have exactly one link"
    [[ "$(cd -P "$(dirname "$body")" && pwd -P)" == "$top/backlog/work/$card" ]] || refuse "$rel must not sit behind a symlink"
    url="$(gh pr create --draft --base main --head "$branch" --title "$title" --body-file "$rel")"
    echo "${url##*/}"
    ;;
  ready)
    [[ $# -eq 2 || ( $# -eq 3 && "${3:-}" == --undo ) ]] || refuse "ready takes <n> [--undo]"
    n="$2"; [[ "$n" =~ ^[0-9]+$ ]] || refuse "<n> must be digits"
    head="$(gh pr view "$n" --json headRefName,isCrossRepository --jq '[.headRefName, .isCrossRepository] | @tsv')"
    [[ "$head" == "$branch"$'\t'false ]] || refuse "PR $n is not this branch's own PR ($head)"
    if [[ $# -eq 3 ]]; then gh pr ready "$n" --undo; else gh pr ready "$n"; fi
    ;;
  *) refuse "unknown step '${1:-}' (push | draft | ready)" ;;
esac
