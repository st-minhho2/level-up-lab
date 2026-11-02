#!/usr/bin/env bash
# Probes T1–T9 of scripts/agent/tier.sh (B1.44, D-28): fixture plans in a temp folder, no network.
#   scripts/agent/tier-smoke.sh
#   T1 prisma/ high            T2 dependency and environment files high   T3 protected paths high (scripts/agent, .claude)
#   T4 globs judged by what they can cover                                 T5 src/ e2e/ spec/ scripts/ medium
#   T6 docs and backlog low, the highest row wins                          T7 usage, unreadable plan, no Files token
#   T8 the protected regex is read from scripts/ci/lib.sh, not copied      T9 called as feature-map.sh calls it
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd -P)"
SRC="$HERE/tier.sh"
ROOT="$(cd "$HERE/../.." && pwd -P)"
TMP="$(mktemp -d)"; trap 'rm -rf -- "$TMP"' EXIT
oks=0; fails=0
ok() { echo "ok   $1"; oks=$((oks + 1)); }
fail() { echo "FAIL $1"; fails=$((fails + 1)); }

plan() { # plan <file> <token>…: a plan whose Files table lists the tokens
  local f="$1" t; shift
  { printf '# B9.9 plan\n\nApproach: x\n\n## Files\n\n| File | Change |\n| ---- | ------ |\n'
    for t in "$@"; do printf '| `%s` | x |\n' "$t"; done
    printf '\n## Interfaces touched\n\n| `src/not-a-file.ts` | outside Files |\n'; } > "$f"
}
expect() { # expect <word> <token>…: tier.sh prints exactly <word> with exit 0 on a plan of those tokens
  local want="$1" out rc; shift
  plan "$TMP/p.md" "$@"
  out="$("$SRC" "$TMP/p.md" 2>"$TMP/err")"; rc=$?
  [[ $rc -eq 0 && "$out" == "$want" ]] && return 0
  echo "     $*: got '$out' rc=$rc $(head -1 "$TMP/err")"; return 1
}
probe() { # probe <id> <word> <token-list>…: each list (space-separated tokens) must give <word>
  local id="$1" want="$2" r=0 list; shift 2
  for list in "$@"; do
    # shellcheck disable=SC2086 # the list is split into tokens on purpose; set -f keeps globs literal
    set -f; expect "$want" $list || r=1; set +f
  done
  [[ $r -eq 0 ]] && ok "$id" || fail "$id"
}

probe T1 high 'prisma/schema.prisma' 'prisma/migrations/20260101000000_x/migration.sql' 'prisma/seed.ts'
probe T2 high 'package.json' 'pnpm-lock.yaml' '.env.example' 'src/lib/env.ts' 'docs/x.md src/lib/env.ts'
probe T3 high '.github/workflows/ci.yml' 'scripts/ci/check-x.sh' '.claude/agents/dev-lead.md' 'lefthook.yml' \
  'scripts/agent/run.sh' 'scripts/agent/new.sh' '.claude/settings.local.json' '.claude/commands/x.md' '.mcp.json' \
  'scripts/pr-step.sh' 'eslint.config.mjs' 'tsconfig.json'
r=0
set -f
for t in '.claude/*/evil.md' '*/ci/new.sh' 'package*' '.env*' 'scripts/*' 'src/lib/*' 'src/*' 'prisma/migrations/*' \
  '*.md' 'src*' '.github/*'; do
  expect high "$t" || r=1
done
expect medium 'src/components/*' || r=1
expect medium 'e2e/*' || r=1
expect low 'docs/*' || r=1
expect low 'backlog/work/B9.9/*' || r=1
set +f
[[ $r -eq 0 ]] && ok T4 || fail T4
probe T5 medium 'src/lib/todos.ts' 'src/components/todo-form.tsx' 'e2e/05-todos.spec.ts' 'spec/contracts/x.md' \
  'scripts/worktree.sh' 'scripts/new-thing.sh'
r=0
expect low 'docs/metrics.md' 'backlog/work/B9.9/plan.md' 'README.md' || r=1
expect medium 'docs/x.md' 'src/app/page.tsx' 'backlog/x.md' || r=1
expect high 'backlog/x.md' 'src/app/page.tsx' 'prisma/schema.prisma' 'docs/y.md' || r=1
[[ $r -eq 0 ]] && ok T6 || fail T6

# T7: usage, an unreadable plan and a plan without a Files token exit 2 with nothing on stdout
r=0
for args in '' 'a b' "$TMP/missing.md"; do
  # shellcheck disable=SC2086 # empty and two-word argument lists on purpose
  out="$("$SRC" $args 2>/dev/null)"; rc=$?
  [[ $rc -eq 2 && -z "$out" ]] || { echo "     args '$args': rc=$rc out='$out'"; r=1; }
done
printf '# B9.9 plan\n\n## Interfaces touched\n\n| `src/x.ts` | x |\n' > "$TMP/nofiles.md"
printf '# B9.9 plan\n\n## Files\n\n| File | Change |\n| ---- | ------ |\n| none | x |\n' > "$TMP/empty.md"
for f in "$TMP/nofiles.md" "$TMP/empty.md"; do
  out="$("$SRC" "$f" 2>/dev/null)"; rc=$?
  [[ $rc -eq 2 && -z "$out" ]] || { echo "     $(basename "$f"): rc=$rc out='$out'"; r=1; }
done
[[ $r -eq 0 ]] && ok T7 || fail T7

# T8: a copy of the scripts whose lib.sh protects one more path rates that path high; tier.sh holds no regex of its own
r=0
C="$TMP/copy"; mkdir -p "$C/scripts/ci" "$C/scripts/agent"
cp "$ROOT/scripts/ci/lib.sh" "$ROOT/scripts/ci/plan-files.sh" "$C/scripts/ci/" 2>/dev/null
cp "$SRC" "$C/scripts/agent/" 2>/dev/null
(cd "$C" && git init -q && git add -A && git -c user.name=s -c user.email=s@x commit -qm s) >/dev/null 2>&1
if [[ -f "$C/scripts/ci/lib.sh" ]] && grep -q '^CONFIG_PROTECTED=' "$C/scripts/ci/lib.sh"; then
  sed -i.bak 's#^CONFIG_PROTECTED=.\^(#CONFIG_PROTECTED='"'"'^(smoke-only/.*|#' "$C/scripts/ci/lib.sh"
  plan "$TMP/p8.md" 'smoke-only/x.txt'
  out="$("$C/scripts/agent/tier.sh" "$TMP/p8.md" 2>&1)"
  [[ "$out" == high ]] || { echo "     copy with smoke-only/ protected: '$out'"; r=1; }
  out="$("$SRC" "$TMP/p8.md" 2>&1)"
  [[ "$out" == low ]] || { echo "     real lib: '$out'"; r=1; }
else
  echo "     scripts/ci/lib.sh defines no CONFIG_PROTECTED"; r=1
fi
grep -q 'eslint' "$SRC" 2>/dev/null && { echo "     tier.sh copies the protected list"; r=1; }
grep -q "^PROTECTED=" "$ROOT/scripts/ci/check-config-change.sh" && { echo "     check-config-change.sh keeps its own copy"; r=1; }
[[ $r -eq 0 ]] && ok T8 || fail T8

# T9: as feature-map.sh calls it: a plan file outside the repo, called from another directory, first line is the word
r=0
mkdir -p "$TMP/elsewhere"
plan "$TMP/elsewhere/plan" 'src/app/page.tsx'
out="$(cd "$TMP/elsewhere" && "$SRC" "$TMP/elsewhere/plan" 2>/dev/null | head -1 | tr -d '[:space:]')"
[[ "$out" == medium ]] || { echo "     got '$out'"; r=1; }
[[ $r -eq 0 ]] && ok T9 || fail T9

echo
if [[ $fails -eq 0 ]]; then echo "$oks probes OK"; exit 0; fi
echo "$fails of $((oks + fails)) probes FAILED"; exit 1
