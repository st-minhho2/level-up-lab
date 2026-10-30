#!/usr/bin/env bash
# A card branch's changes stay inside its approved plan (B1.17): the CI net for writes .claude/hooks/plan-scope.sh
# cannot see (Bash edits, pnpm db:migrate). Same rule as the hook, without the role check: paperwork (backlog/*,
# spec/*, docs/metrics.md, docs/mistake-log.md) passes; every other changed file must be in the plan's `## Files` as of
# its approval commit (plan-files.sh). Card = `<prefix>/B<e>.<n>[-…]` from GITHUB_HEAD_REF or the current branch;
# other branches are skipped. Changed files = git diff from merge-base(origin/<base>, head) to head, so commits a
# branch got by merging origin/main never count. head = HEAD_SHA (CI: the PR head, not the merge ref) or HEAD.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
HERE="$(cd "$(dirname "$0")" && pwd)"
branch="${GITHUB_HEAD_REF:-$(git symbolic-ref --short -q HEAD || true)}"
if [[ ! "$branch" =~ ^[a-z]+/(B[0-9]+\.[0-9]+)(-|$) ]]; then
  echo "[check-plan-scope] ${branch:-detached HEAD}: no card id: skipped"; exit 0
fi
card="${BASH_REMATCH[1]}"
head="${HEAD_SHA:-HEAD}"
base="origin/${GITHUB_BASE_REF:-main}"
mb="$(git merge-base "$base" "$head")"
rc=0; pats="$("$HERE/plan-files.sh" "$card" "$head")" || rc=$?
fail=0
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  case "$f" in backlog/* | spec/* | docs/metrics.md | docs/mistake-log.md) continue ;; esac
  listed=0
  if [[ $rc -eq 0 ]]; then while IFS= read -r p; do [[ -n "$p" && "$f" == $p ]] && listed=1; done <<< "$pats"; fi
  if [[ $listed -eq 0 ]]; then
    [[ $fail -eq 0 ]] && echo "::error::$branch changes files outside backlog/work/$card/plan.md as approved (plan-files exit $rc):"
    echo "  $f"; fail=1
  fi
done < <(git diff --no-renames --name-only "$mb" "$head") # a rename lists both paths
if [[ $fail -eq 0 && $rc -ne 0 ]]; then echo "[check-plan-scope] OK: $branch changes only paperwork ($card has no approved plan)"
elif [[ $fail -eq 0 ]]; then echo "[check-plan-scope] OK: $branch stays inside the approved plan of $card"; fi
exit $fail
