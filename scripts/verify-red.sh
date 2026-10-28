#!/usr/bin/env bash
# Prove that a card's test(...) commit is red for the right reason.
#
#   scripts/verify-red.sh B1.2 [--range <base>..<head>] [--keep]
#   scripts/verify-red.sh --auto [--range ...]      every card id named by a test(...) commit in the range
#
# For each card id:
#   1. find commits in the range whose subject is "test(<pkg>): <id> …"
#   2. collect the *.test.ts / *.test.tsx files they touch (e2e/*.spec.ts needs a server: listed, skipped)
#   3. check out the parent of the FIRST test commit into a scratch worktree (that is "the base": the code as it
#      was before the red tests landed, skeleton included, so imports resolve and failures are about behavior)
#   4. copy the test files from the LAST test commit on top, run vitest with the JSON reporter
#   5. PASS only if: every file loaded (no import/compile error), at least one NEW test ran, zero NEW tests passed
#      (a test is new when its title is absent from the base's copy of the file), and no failure message looks like
#      an import, syntax or transform error. Pre-existing tests in an extended file may pass.
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
    -h|--help) sed -n '2,16p' "$0"; exit 0 ;;
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
  while IFS= read -r id; do [[ -n "$id" ]] && FEATS+=("$id"); done < <(git log --no-merges --format=%s "$BASE_SHA..$HEAD_SHA" | sed -nE 's/^test\([^)]*\): (B[0-9]+\.[0-9]+).*/\1/p' | sort -u)
  if [[ ${#FEATS[@]} -eq 0 ]]; then
    echo "[verify-red] no test(...): B<e>.<n> commit in range; nothing to verify"
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
  commits="$(git rev-list --reverse --no-merges -E --grep="^test\\([^)]*\\): ${feat//./\\.}( |$)" "$BASE_SHA..$HEAD_SHA")"
  if [[ -z "$commits" ]]; then
    echo "::error::no test($feat) commit in $BASE_SHA..$HEAD_SHA"
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
  local f present=""
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
    node - "$report" "$IMPORT_ERROR" "$scratch" "$base" "$ROOT" <<'NODE' || verdict=1
const [reportPath, pattern, scratchArg, baseSha, repoRoot] = process.argv.slice(2);
const report = require(reportPath);
const scratch = require('fs').realpathSync(scratchArg);
const { execFileSync } = require('child_process');
// titles the base already had in this file: a passing one of those is not "green before implementation"
function baseTitles(rel) {
  let src = '';
  try { src = execFileSync('git', ['-C', repoRoot, 'show', `${baseSha}:${rel}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return new Set(); }
  const titles = new Set();
  const re = /\b(?:it|test)(?:\.each\([^)]*\))?\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g;
  let m; while ((m = re.exec(src))) titles.add(m[2]);
  return titles;
}
const bad = new RegExp(pattern);
const problems = [];
for (const file of report.testResults ?? []) {
  const rel = require('path').relative(scratch, file.name);
  const ran = file.assertionResults ?? [];
  const old = baseTitles(rel);
  const isNew = (t) => ![...old].some((title) => t.title === title || t.title.startsWith(title.replace(/%[sdifjo]/g, '')));
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
