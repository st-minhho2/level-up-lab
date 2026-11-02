#!/usr/bin/env bash
# A card branch's changes stay inside its approved plan (B1.17): the CI net for writes .claude/hooks/plan-scope.sh
# cannot see (Bash edits, pnpm db:migrate). Same rule as the hook, without the role check: paperwork (backlog/*,
# spec/*, docs/metrics.md, docs/mistake-log.md) passes; every other changed file must be in the plan's `## Files` as of
# its approval commit (plan-files.sh). Card = `<prefix>/B<e>.<n>[-…]` from GITHUB_HEAD_REF or the current branch;
# other branches are skipped. Changed files = git diff from merge-base(origin/<base>, head) to head, so commits a
# branch got by merging origin/main never count. head = HEAD_SHA (CI: the PR head, not the merge ref) or HEAD.
# A runner's path (D-27, B1.55): the branch is <prefix>/<card>-agent, or an open agent-ready issue's "Card id" names
# the card (gh, asked only when a non-paperwork file changed); there plan-files.sh --run checks the D-27 approval.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
HERE="$(cd "$(dirname "$0")" && pwd)"
. "$HERE/lib.sh" # plan_lists
branch="${GITHUB_HEAD_REF:-$(git symbolic-ref --short -q HEAD || true)}"
if [[ ! "$branch" =~ ^[a-z]+/(B[0-9]+\.[0-9]+)(-|$) ]]; then
  echo "[check-plan-scope] ${branch:-detached HEAD}: no card id: skipped"; exit 0
fi
card="${BASH_REMATCH[1]}"
head="${HEAD_SHA:-HEAD}"
base="origin/${GITHUB_BASE_REF:-main}"
mb="$(git merge-base "$base" "$head")"
paperwork() { case "$1" in backlog/* | spec/* | docs/metrics.md | docs/mistake-log.md) return 0 ;; esac; return 1; }
changed=""
while IFS= read -r f; do
  if [[ -n "$f" ]] && ! paperwork "$f"; then changed="$changed$f"$'\n'; fi
done < <(git diff --no-renames --name-only "$mb" "$head") # a rename lists both paths
if [[ -z "$changed" ]]; then echo "[check-plan-scope] OK: $branch changes only paperwork"; exit 0; fi
run=""
if [[ "${branch#*/}" == "$card-agent" ]]; then run=--run
else
  bodies="$(env -u GH_REPO -u GH_HOST gh api --paginate "repos/{owner}/{repo}/issues?labels=agent-ready&state=open&per_page=100" \
    --jq '.[] | select(.pull_request == null) | .body' </dev/null)" \
    || { echo "::error::$branch: gh could not list the open agent-ready issues (a runner's path is decided by them)"; exit 1; }
  printf '%s\n' "$bodies" | awk '/^### / { f = ($0 ~ /^### Card id[[:space:]]*$/); next }
    f && NF { sub(/^[[:space:]]+/, ""); sub(/[[:space:]]+$/, ""); print; f = 0 }' | grep -qxF -- "$card" && run=--run
fi
rc=0; pats="$("$HERE/plan-files.sh" $run "$card" "$head")" || rc=$?
fail=0
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  listed=0
  if [[ $rc -eq 0 ]]; then while IFS= read -r p; do [[ -n "$p" ]] && plan_lists "$f" "$p" && listed=1; done <<< "$pats"; fi
  if [[ $listed -eq 0 ]]; then
    [[ $fail -eq 0 ]] && echo "::error::$branch changes files outside backlog/work/$card/plan.md as approved (plan-files exit $rc${run:+, runner path}):"
    echo "  $f"; fail=1
  fi
done <<< "$changed"
[[ $fail -eq 0 ]] && echo "[check-plan-scope] OK: $branch stays inside the approved plan of $card${run:+ (D-27 approval)}"
exit $fail
