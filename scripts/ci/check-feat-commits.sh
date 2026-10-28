#!/usr/bin/env bash
# Fail when a commit tagged as implementation (subject starts with "feat(" or "feat:") touches a test file
# (*.test.ts, *.test.tsx, e2e/**). Why (L6): tests are committed red in a test(FEAT-xxx) commit; the feat commit
# turns them green without being able to weaken them. A test change belongs in its own test(...) commit.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
. scripts/ci/lib.sh
resolve_range

TEST_FILE='(\.test\.tsx?$|^e2e/)'
FEAT='^feat(\(|:)'
fail=0
for sha in $(git rev-list --no-merges --reverse "$BASE_SHA..$HEAD_SHA"); do
  subject="$(git log -1 --format=%s "$sha")"
  [[ "$subject" =~ $FEAT ]] || continue
  tests="$(git diff-tree --no-commit-id --name-only -r "$sha" | grep -E "$TEST_FILE" || true)"
  [[ -z "$tests" ]] && continue
  fail=1
  echo "::error::Implementation commit ${sha:0:10} ($subject) edits test files:"
  echo "$tests" | sed 's/^/  /'
  echo "  Move the test change into a 'test(FEAT-xxx): ...' commit."
done
[[ $fail -eq 0 ]] && echo "[check-feat-commits] OK: no feat commit touches tests"
exit $fail
