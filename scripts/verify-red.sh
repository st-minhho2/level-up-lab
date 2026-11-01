#!/usr/bin/env bash
# Prove that a card's test(...) commit is red for the right reason.
#
#   scripts/verify-red.sh B1.2 [--range <base>..<head>] [--keep]
#   scripts/verify-red.sh --auto [--range ...]      every card id named by a test(...) commit in the range
#
# For each card id:
#   1. find commits in the range whose subject is "test(<pkg>): <id> … (red)" — the (red) marker separates the
#      red step from later test-only commits (review hardening), whose tests are green by design
#   2. collect the *.test.ts / *.test.tsx files they touch (e2e/*.spec.ts needs a server: listed, skipped)
#   3. check out the parent of the FIRST test commit into a scratch worktree (that is "the base": the code as it
#      was before the red tests landed, skeleton included, so imports resolve and failures are about behavior)
#   4. run the base's own copy of those files (the ones it has) with vitest's JSON reporter: the tests that ran there
#      (passed or failed; not todo or skipped) are the old ones, each named by its describe path and title (B1.29)
#   5. copy the test files from the LAST test commit on top, run vitest with the JSON reporter again
#   6. PASS only if: every file loaded (no import/compile error), at least one NEW test ran, zero NEW tests passed
#      (new: its describe path and title ran at the base in that file fewer times than the red run reports it), and
#      no failure message looks like an import, syntax or transform error. Pre-existing tests may pass.
# Exit 0 = correctly red. Exit 1 = green, wrong reason, or nothing to verify for an explicit id.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
ROOT="$PWD"

FEATS=(); AUTO=0; KEEP=0; RANGE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --auto) AUTO=1 ;;
    --keep) KEEP=1 ;;
    --range) RANGE="$2"; shift ;;
    -h|--help) sed -n '2,18p' "$0"; exit 0 ;;
    *) FEATS+=("$1") ;;
  esac
  shift
done

if [[ -n "$RANGE" ]]; then
  BASE_SHA="${RANGE%%..*}"; HEAD_SHA="${RANGE##*..}"
  echo "[verify-red] range $BASE_SHA..$HEAD_SHA"
else
  . scripts/ci/lib.sh
  resolve_range
fi

if [[ $AUTO -eq 1 ]]; then
  while IFS= read -r id; do [[ -n "$id" ]] && FEATS+=("$id"); done < <(git log --no-merges --format=%s "$BASE_SHA..$HEAD_SHA" | sed -nE 's/^test\([^)]*\): (B[0-9]+\.[0-9]+).*\(red\)$/\1/p' | sort -u)
  if [[ ${#FEATS[@]} -eq 0 ]]; then
    echo "[verify-red] no test(...): B<e>.<n> … (red) commit in range; nothing to verify"
    exit 0
  fi
fi
[[ ${#FEATS[@]} -gt 0 ]] || { echo "usage: scripts/verify-red.sh B1.2 | --auto" >&2; exit 1; }

IMPORT_ERROR='Failed to resolve import|Cannot find module|Cannot find package|SyntaxError|Transform failed|Unexpected token|is not defined|Failed to load|No test suite found|No test files found'
overall=0

verify_feat() {
  local feat="$1"
  echo "=== $feat"
  local commits
  commits="$(git rev-list --reverse --no-merges -E --grep="^test\\([^)]*\\): ${feat//./\\.} .*\\(red\\)$" "$BASE_SHA..$HEAD_SHA")"
  if [[ -z "$commits" ]]; then
    echo "::error::no 'test(<pkg>): $feat … (red)' commit in $BASE_SHA..$HEAD_SHA (red commits carry the (red) marker; hardening commits do not)"
    return 1
  fi
  local first last; first="$(echo "$commits" | head -1)"; last="$(echo "$commits" | tail -1)"
  local base; base="$(git rev-parse "$first^")"
  local files e2e
  files="$(for c in $commits; do git diff-tree --no-commit-id --name-only -r "$c"; done | grep -E '\.test\.tsx?$' | sort -u || true)"
  e2e="$(for c in $commits; do git diff-tree --no-commit-id --name-only -r "$c"; done | grep -E '^e2e/.*\.spec\.ts$' | sort -u || true)"
  echo "  test commits : $(echo "$commits" | cut -c1-10 | tr '\n' ' ')"
  echo "  base         : ${base:0:10} ($(git log -1 --format=%s "$base"))"
  [[ -n "$e2e" ]] && echo "  e2e (skipped, needs a server): $(echo "$e2e" | tr '\n' ' ')"
  if [[ -z "$files" ]]; then
    echo "::error::test($feat) commits touch no *.test.ts(x) file"
    return 1
  fi

  local scratch; scratch="$(mktemp -d "${TMPDIR:-/tmp}/verify-red-$feat-XXXXXX")"
  rmdir "$scratch"
  git worktree add --quiet --detach "$scratch" "$base"
  ln -s "$ROOT/node_modules" "$scratch/node_modules"
  local f present="" atbase=""
  for f in $files; do
    if [[ -f "$scratch/$f" ]]; then atbase="$atbase $f"; fi
  done
  local basereport="$scratch/.verify-red-base.json"
  if [[ -n "$atbase" ]]; then
    # shellcheck disable=SC2086
    (cd "$scratch" && VITEST_CACHE_DIR="$scratch/.cache" pnpm exec vitest run --reporter=json --outputFile="$basereport" $atbase >/dev/null 2>&1) || true
  fi
  for f in $files; do
    if git cat-file -e "$last:$f" 2>/dev/null; then
      mkdir -p "$scratch/$(dirname "$f")"
      git show "$last:$f" > "$scratch/$f"
      present="$present $f"
    elif [[ -f "$scratch/$f" ]]; then
      unlink "$scratch/$f" # the test commit deleted this file; mirror that in the scratch tree
    fi
  done
  local report="$scratch/.verify-red.json"
  # shellcheck disable=SC2086
  (cd "$scratch" && VITEST_CACHE_DIR="$scratch/.cache" pnpm exec vitest run --reporter=json --outputFile="$report" $present >/dev/null 2>&1) || true

  local verdict=0
  if [[ ! -s "$report" ]]; then
    echo "::error::vitest produced no report (config or install problem)"
    verdict=1
  else
    node - "$report" "$IMPORT_ERROR" "$scratch" "$basereport" <<'NODE' || verdict=1
const [reportPath, pattern, scratchArg, basePath] = process.argv.slice(2);
const fs = require('fs');
const path = require('path');
const report = require(reportPath);
const scratch = fs.realpathSync(scratchArg);
// A test is named by its describe path and title, as vitest reports it.
const key = (t) => JSON.stringify([...(t.ancestorTitles ?? []), t.title]);
// How often the base's run ran each name (passed or failed), per file: a skeleton's `it.todo` or a skipped test is
// not old. No base report (new files only, or the base run failed): nothing is old, so every test counts as new.
const oldNames = new Map();
const baseReport = fs.existsSync(basePath) ? require(basePath) : {};
for (const file of baseReport.testResults ?? []) {
  const names = new Map();
  for (const t of file.assertionResults ?? []) {
    if (t.status === 'passed' || t.status === 'failed') names.set(key(t), (names.get(key(t)) ?? 0) + 1);
  }
  oldNames.set(path.relative(scratch, file.name), names);
}
const bad = new RegExp(pattern);
const problems = [];
for (const file of report.testResults ?? []) {
  const rel = path.relative(scratch, file.name);
  const ran = file.assertionResults ?? [];
  const old = oldNames.get(rel) ?? new Map();
  const seen = new Map();
  for (const t of ran) seen.set(key(t), (seen.get(key(t)) ?? 0) + 1);
  // a name reported more often than at the base is new in every occurrence (strict)
  const isNew = (t) => (old.get(key(t)) ?? 0) < seen.get(key(t));
  const fresh = ran.filter(isNew);
  const passed = fresh.filter((t) => t.status === 'passed');
  const failed = fresh.filter((t) => t.status === 'failed');
  const suiteMsg = file.message ?? '';
  const loadFailure = ran.length === 0 || bad.test(suiteMsg);
  const wrongReason = failed.filter((t) => (t.failureMessages ?? []).some((m) => bad.test(m)));
  const line = `  ${rel}: ${ran.length} ran (${fresh.length} new), ${failed.length} new failed, ${passed.length} new passed`;
  if (loadFailure) problems.push(`${line}  -> did not load: ${suiteMsg.split('\n')[0] || 'no tests collected'}`);
  else if (wrongReason.length) problems.push(`${line}  -> import/compile failure in: ${wrongReason.map((t) => t.title).join(', ')}`);
  else if (passed.length) problems.push(`${line}  -> GREEN before implementation: ${passed.map((t) => t.title).join(', ')}`);
  else if (failed.length === 0) problems.push(`${line}  -> no new test executed (todo/skip only, or every test already existed at the base)`);
  else console.log(`${line}  OK (red on behavior)`);
}
if ((report.numTotalTests ?? 0) === 0) problems.push('  no test executed at all');
if (problems.length) { console.log(problems.join('\n')); process.exit(1); }
NODE
  fi

  if [[ $KEEP -eq 1 ]]; then
    echo "  scratch kept : $scratch"
  else
    git worktree remove --force "$scratch" >/dev/null 2>&1 || true
  fi
  if [[ $verdict -eq 0 ]]; then
    echo "  RESULT: red for the right reason"
  else
    echo "::error::$feat tests are not red for the right reason (see above)"
  fi
  return $verdict
}

for feat in "${FEATS[@]}"; do
  verify_feat "$feat" || overall=1
done
git worktree prune
exit $overall
