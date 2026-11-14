#!/usr/bin/env bash
# Local mutation gate of a card (B1.100): runs Stryker only when the card's diff changes a .ts file under src/lib or
# src/actions, only on the files it changes, and at most once per unchanged tree. CI's `mutation` job is not this
# script: it still runs `pnpm test:mutation` on the whole layer for every PR. A D-13 hardening card's before/after
# report runs `pnpm test:mutation` itself (its tree may not change). Probes: scripts/mutation-gate-smoke.sh MG1–MG16.
#
#   scripts/mutation-gate.sh [--base <ref>] [--force]
#
#   base     merge-base of HEAD and <ref> (default origin/main); the diff is base → working tree, untracked included
#   no hit   no changed *.ts under src/lib/ or src/actions/ (a CLAUDE.md there is no hit) → prints "mutation: CI only,
#            no src/lib or src/actions change", exit 0, Stryker never starts
#   mutate   each changed *.ts, a `<x>.test.ts` standing for `<x>.ts`; src/lib/prisma.ts and any path not in the tree
#            (deleted, or a test without a same-named source) dropped; nothing left → the whole layer
#   0 valid  the subset has no valid mutant (type-only: "with 0 mutant(s)", then "No tests were executed"; or every
#            mutant a compile error: score NaN, exit 0) → the whole layer, once, in the same call
#   untested the subset has mutants and no test reaches them ("No tests were executed") → "? %, no test reaches it",
#            exit 1: the layer's score never stands in for code nobody tests
#   bar      Stryker's break threshold (70, stryker.config.mjs) on what ran; exit 1 below it or with no score
#   reuse    key = the working tree's src/, stryker.config.mjs, vitest.stryker.config.mts, tsconfig.json,
#            package.json, pnpm-lock.yaml and the mutate list; a recorded run with the key (reports/mutation-gate.txt)
#            is reused, its line and exit code repeated; --force runs again
#
# Last stdout line, for the PR's evidence: "mutation: <score> % on <what> (ran|reused), src <tree7>" or the CI-only line.
set -euo pipefail

BASE_REF=origin/main FORCE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --base) BASE_REF="${2:?--base needs a ref}"; shift 2 ;;
    --force) FORCE=1; shift ;;
    *) sed -n '2,23p' "$0" >&2; exit 2 ;;
  esac
done

cd "$(git rev-parse --show-toplevel)"
base="$(git merge-base "$BASE_REF" HEAD)" || { echo "[mutation-gate] no merge-base with $BASE_REF" >&2; exit 2; }
KEYED="stryker.config.mjs vitest.stryker.config.mts tsconfig.json package.json pnpm-lock.yaml"

# The working tree as a tree object (tracked and untracked, ignored files left out), without touching the index.
idx="$(mktemp "${TMPDIR:-/tmp}/mutation-gate-index.XXXXXX")"
log="$(mktemp "${TMPDIR:-/tmp}/mutation-gate-log.XXXXXX")"
trap 'rm -f "$idx" "$log"' EXIT
GIT_INDEX_FILE="$idx" git read-tree HEAD
for p in src $KEYED; do
  [[ -e "$p" ]] || git ls-files --error-unmatch -- "$p" >/dev/null 2>&1 || continue
  GIT_INDEX_FILE="$idx" git add -A -- "$p"
done
tree="$(GIT_INDEX_FILE="$idx" git write-tree)"

changed="$(git diff --name-only --no-renames "$base" "$tree" -- 'src/lib/*.ts' 'src/actions/*.ts')"
if [[ -z "$changed" ]]; then
  echo "mutation: CI only, no src/lib or src/actions change"
  exit 0
fi

files=""
for p in $changed; do
  case "$p" in *.test.ts) p="${p%.test.ts}.ts" ;; esac
  [[ "$p" == src/lib/prisma.ts ]] && continue
  git cat-file -e "$tree:$p" 2>/dev/null || continue
  files="$files$p"$'\n'
done
files="$(printf '%s' "$files" | sort -u | paste -sd, -)"

src="$(git rev-parse "$tree:src")"
key="$src"
for p in $KEYED; do key="$key $(git rev-parse -q --verify "$tree:$p" 2>/dev/null || echo -)"; done
key="$key ${files:-all}"
stamp=reports/mutation-gate.txt
if [[ $FORCE -eq 0 && -f "$stamp" ]] && [[ "$(sed -n 1p "$stamp")" == "$key" ]]; then
  rc="$(sed -n 2p "$stamp")"
  sed -n 3p "$stamp" | sed 's/ (ran), / (reused), /'
  exit "$rc"
fi

stryker() { # stryker [--mutate <list>]: sets rc and score
  rc=0
  pnpm exec stryker run "$@" 2>&1 | tee "$log" || rc=$?
  score="$(sed -nE 's/.*Final mutation score (of )?([0-9][0-9.]*|NaN).*/\2/p' "$log" | tail -1)"
}
what="${files:-src/lib + src/actions}"
if [[ -n "$files" ]]; then stryker --mutate "$files"; else stryker; fi
if [[ -n "$files" ]]; then
  if [[ "$score" == NaN ]] || { [[ -z "$score" ]] && grep -q 'with 0 mutant(s)' "$log"; }; then
    # no valid mutant there (type-only, or every mutant a compile error): the whole layer once instead
    what="src/lib + src/actions, no valid mutant in $files"
    stryker
  elif [[ -z "$score" ]] && grep -q 'No tests were executed' "$log"; then
    what="$files, no test reaches it" # mutants nobody tests: 0 %, never the layer's score
  fi
fi
[[ -n "$score" && "$score" != NaN ]] || { score="?"; rc=1; } # no score: never a pass
line="mutation: $score % on $what (ran), src ${src:0:7}"
mkdir -p reports
printf '%s\n%s\n%s\n' "$key" "$rc" "$line" > "$stamp"
echo "$line"
exit "$rc"
