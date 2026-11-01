#!/usr/bin/env bash
# The three PR steps a card session runs itself (B1.23; dev-lead Loop 5 and 9): the only command `.claude/settings.json`
# allows without asking, so every argument is checked here and `guard-bash.sh` lets a call through only as one plain
# segment from the top level. Labels and body edits stay outside (asked). A refusal exits 3 with "pr-step: <why>".
#   scripts/pr-step.sh push                 git push -u origin HEAD:refs/heads/<branch>
#   scripts/pr-step.sh draft "<title>"      gh pr create --draft, body from backlog/work/<card>/pr-body.md; prints the PR number
#   scripts/pr-step.sh ready <n> [--undo]   gh pr ready <n> [--undo], only for this branch's own PR
#   scripts/pr-step.sh open "<title>"       gh pr create (not a draft) on a lane branch only (B1.26): docs/<card>-done or
#                                           -partial (closing) from backlog/work/<card>/closing-pr-body.md, docs/<card>-card
#                                           (filing) from filing-pr-body.md, changed on this branch; prints the PR number
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
lane="" # the closing and filing lanes (backlog/CLAUDE.md): their PRs never use the feature PR's pr-body.md
[[ "$branch" =~ ^docs/B[0-9]+\.[0-9]+-(done|partial|card)$ ]] && lane="${BASH_REMATCH[1]}"

body_file() { # body_file <rel>: a regular file with one link in the card's own work folder, not reached through a symlink
  local rel="$1" body="$top/$1"
  [[ -f "$body" && ! -L "$body" ]] || refuse "$rel must be a regular file, not a symlink"
  [[ -n "$(find "$body" -maxdepth 0 -links 1)" ]] || refuse "$rel must have exactly one link"
  [[ "$(cd -P "$(dirname "$body")" && pwd -P)" == "$top/backlog/work/$card" ]] || refuse "$rel must not sit behind a symlink"
}

case "${1:-}" in
  push)
    [[ $# -eq 1 ]] || refuse "push takes no argument"
    git push -u origin "HEAD:refs/heads/$branch"
    ;;
  draft)
    [[ $# -eq 2 ]] || refuse 'draft takes one argument: "<title>"'
    [[ -z "$lane" ]] || refuse "draft opens a card's feature PR; on the lane branch '$branch' use open"
    title="$2"
    [[ "$title" != *$'\n'* ]] || refuse "title must be one line"
    base="$title" # the PR convention may end the title in " (§<n>)", the only non-ASCII allowed
    case "$title" in *" (§"*")") base="${title% (§*}"; [[ "${title#"$base"}" =~ ^\ \(§[0-9]+\)$ ]] || base="$title" ;; esac
    [[ "$base" =~ ^(feat|fix|chore|test|docs)\([a-z]+\):\ ${card//./\\.}\ [\ -~]+$ ]] \
      || refuse "title must read '<type>(<pkg>): $card <summary>[ (§<n>)]', the summary in printable ASCII"
    suffix="${title#"$base"}"; digits="${suffix//[^0-9]/}" # " (§" and ")" are 4 characters in any locale
    chars=${#base}; [[ -n "$suffix" ]] && chars=$((chars + 4 + ${#digits}))
    [[ $chars -le 80 ]] || refuse "title must be at most 80 characters"
    rel="backlog/work/$card/pr-body.md"; body_file "$rel"
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
  open)
    [[ $# -eq 2 ]] || refuse 'open takes one argument: "<title>"'
    [[ -n "$lane" ]] || refuse "open runs only on a lane branch (docs/$card-done, docs/$card-partial, docs/$card-card), not '$branch'"
    title="$2"; c="${card//./\\.}"
    [[ "$title" != *$'\n'* ]] || refuse "title must be one line"
    case "$lane" in
      done) [[ "$title" == "docs(backlog): $card done" ]] || refuse "title must read 'docs(backlog): $card done'"
        rel=closing ;;
      partial) [[ "$title" =~ ^docs\(backlog\):\ ${c}\ partial\ --\ [\ -~]+$ ]] \
          || refuse "title must read 'docs(backlog): $card partial -- <what is pending>', in printable ASCII"
        rel=closing ;;
      card) [[ "$title" =~ ^docs\(backlog\):\ card\ ${c}\ [\ -~]+$ ]] \
          || refuse "title must read 'docs(backlog): card $card <summary>', in printable ASCII"
        rel=filing ;;
    esac
    [[ ${#title} -le 80 ]] || refuse "title must be at most 80 characters"
    rel="backlog/work/$card/$rel-pr-body.md"; body_file "$rel"
    # The body is the one the lane commit holds (what the reviewer read), and that commit wrote it: a Partial close
    # leaves its body on main, and a later lane commit that does not rewrite it would reuse a stale body.
    git diff --quiet HEAD -- "$rel" 2>/dev/null || refuse "$rel has uncommitted changes: commit it with the lane"
    git rev-parse --verify --quiet origin/main >/dev/null || refuse "no origin/main to compare $rel with: git fetch origin"
    changed=0; git diff --quiet origin/main...HEAD -- "$rel" 2>/dev/null || changed=$?
    [[ $changed -eq 1 ]] || refuse "$rel must be written in this branch's lane commit (unchanged since origin/main)"
    url="$(gh pr create --base main --head "$branch" --title "$title" --body-file "$rel")"
    echo "${url##*/}"
    ;;
  *) refuse "unknown step '${1:-}' (push | draft | ready | open)" ;;
esac
