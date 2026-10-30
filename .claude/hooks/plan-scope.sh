#!/usr/bin/env bash
# PreToolUse hook for Edit|Write|MultiEdit (settings.json, B1.17). In a card worktree — the file's worktree is on a
# branch `<prefix>/B<e>.<n>[-…]`, lanes on `docs/` included — a write stays inside the card's approved plan:
#   paperwork (backlog/*, spec/*, docs/metrics.md, docs/mistake-log.md)  always (role path-guards and lanes own it)
#   prisma/migrations/*                                                  never by Edit/Write (pnpm db:migrate)
#   any other path   only when it is in the plan's `## Files` as approved (scripts/ci/plan-files.sh)
#   test files       also only as test-writer (`agent_type` of the subagent; the main thread carries none)
# Other branches, detached heads and files outside the project pass: path-guard.sh scopes the roles there.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
. "$HERE/lib.sh"
FILE="$(json_field tool_input.file_path)"
[[ -z "$FILE" ]] && exit 0
repo_rel "$FILE"
case $? in
  1) block "plan-scope.sh" "'$FILE' climbs with '..' through a directory that does not exist." ;;
  2) exit 0 ;;
esac
[[ -n "$TOP" ]] || exit 0
branch="$(git -C "$TOP" symbolic-ref --short -q HEAD)" || exit 0
[[ "$branch" =~ ^[a-z]+/(B[0-9]+\.[0-9]+)(-|$) ]] || exit 0
card="${BASH_REMATCH[1]}"
case "$REL" in backlog/* | spec/* | docs/metrics.md | docs/mistake-log.md) exit 0 ;; esac
case "$REL" in prisma/migrations/*)
  block "plan-scope.sh" "'$REL' is a migration: create it with pnpm db:migrate (add-migration skill), never by Edit/Write." ;;
esac
PLAN="backlog/work/$card/plan.md"
pats="$(cd "$TOP" && "$HERE/../../scripts/ci/plan-files.sh" "$card")"
case $? in
  0) ;;
  3) block "plan-scope.sh" "$PLAN is not approved on $branch (no 'docs(backlog): $card plan approved' commit): nothing outside backlog/ and spec/ changes before the lead approves." ;;
  4) block "plan-scope.sh" "$branch has no $PLAN at its approval commit." ;;
  *) block "plan-scope.sh" "could not read the Files of $PLAN on $branch." ;;
esac
listed=0
while IFS= read -r p; do [[ -n "$p" && "$REL" == $p ]] && listed=1; done <<< "$pats"
[[ $listed -eq 1 ]] || block "plan-scope.sh" "'$REL' is not in the Files table of $PLAN as approved. Stop: dev-lead revises the plan and the lead approves it again."
case "$REL" in *.test.ts | *.test.tsx | e2e/*)
  [[ "$(json_field agent_type)" == test-writer ]] \
    || block "plan-scope.sh" "'$REL' is a test file: only the test-writer role writes tests. Dispatch test-writer." ;;
esac
exit 0
