#!/usr/bin/env bash
# B1.46 evidence: each layer rule meets one forbidden import, in a throwaway copy of <ref>'s tree under $TMPDIR (the
# worktree is never touched). Where <ref> has scripts/ci/check-layers.sh, a probe is caught when that script exits
# non-zero naming the rule; where it has not (the red run at origin/main), when eslint or tsc fails on it, the static
# gates CI had before. P14 is a control that must pass; P15 asks check-config-change.sh about the rules' own files.
# Usage: bash backlog/work/B1.46/probe.sh [<ref>]   (default HEAD) · exit 0 when every probe is caught and P14 passes.
set -uo pipefail
TOP="$(git rev-parse --show-toplevel)"
REF="${1:-HEAD}"
T="$(mktemp -d)"
git -C "$TOP" archive "$REF" | tar -x -C "$T"
ln -s "$TOP/node_modules" "$T/node_modules"
gs() { git -C "$T" -c core.hooksPath=/dev/null -c commit.gpgsign=false -c user.name=probe -c user.email=probe@localhost "$@" >/dev/null 2>&1; }
gs init -q -b main && gs add -A && gs commit -q -m base
caught=0
total=0
control=fail

# check <rule> <file>…: for the probe files just written, "CAUGHT by …" (the gate failed naming the rule), "PASSED (…)"
# (the gate passed: a miss for a forbidden import, the expected result for the P14 control) or "FLAGGED …" (the gate
# failed for another reason: neither).
check() {
  local rule="$1" out rc
  shift
  if [[ -f "$T/scripts/ci/check-layers.sh" ]]; then
    out="$(cd "$T" && bash scripts/ci/check-layers.sh 2>&1)"
    rc=$?
    if [[ $rc -eq 0 ]]; then echo "PASSED (check-layers exit 0)"
    elif [[ "$out" == *"$rule"* ]]; then echo "CAUGHT by $rule"
    else echo "FLAGGED by another rule (check-layers exit $rc)"; fi
  elif (cd "$T" && pnpm exec eslint --no-warn-ignored "$@" >/dev/null 2>&1 && pnpm exec tsc --noEmit >/dev/null 2>&1); then
    echo "PASSED (eslint 0, tsc 0)"
  else
    echo "CAUGHT by eslint or tsc"
  fi
}

# probe <id> <rule> <file> <source> [<file> <source>]: writes the files, checks them, removes them.
probe() {
  local id="$1" rule="$2" files=() verdict f
  shift 2
  while [[ $# -gt 0 ]]; do
    printf '%s\n' "$2" >"$T/$1"
    files+=("$1")
    shift 2
  done
  verdict="$(check "$rule" "${files[@]}")"
  for f in "${files[@]}"; do rm -f "$T/$f"; done
  if [[ "$id" == P14 ]]; then
    if [[ "$verdict" == PASSED* ]]; then control=pass; else control=fail; fi
    echo "$id control (type-only import, as todo-item.tsx does): $control, $verdict"
    return
  fi
  total=$((total + 1))
  if [[ "$verdict" == CAUGHT* ]]; then caught=$((caught + 1)); else verdict="MISSED, $verdict"; fi
  echo "$id $rule: $verdict"
}

probe P1 prisma-only-in-lib src/actions/probe.ts "import { prisma } from '@/lib/prisma';
export const probe: unknown = prisma;"
probe P2 prisma-only-in-lib src/app/probe.ts "import { PrismaClient } from '@prisma/client';
export const probe: unknown = PrismaClient;"
probe P3 prisma-only-in-lib src/components/probe.tsx "import type { Todo } from '@prisma/client';
export type Probe = Todo;"
probe P4 components-no-server-only src/components/probe.tsx "import { prisma } from '@/lib/prisma';
export const probe: unknown = prisma;"
probe P5 components-no-server-only src/components/probe.tsx "import 'server-only';
export const probe = 1;"
probe P6 components-reach-db-only-through-actions src/components/probe.tsx "import { listTodos } from '@/lib/todos';
export const probe: unknown = listTodos;"
probe P7 revalidate-only-in-actions src/lib/probe.ts "import { revalidatePath } from 'next/cache';
export const probe: unknown = revalidatePath;"
probe P8 revalidate-only-in-actions src/lib/probe.ts "import { revalidatePath } from 'next/dist/server/web/spec-extension/revalidate';
export const probe: unknown = revalidatePath;"
probe P9 lib-imports-no-upper-layer src/lib/probe.ts "import { createTodoAction } from '@/actions/todos';
export const probe: unknown = createTodoAction;"
probe P10 actions-import-no-ui src/actions/probe.ts "import { TodoForm } from '@/components/todo-form';
export const probe: unknown = TodoForm;"
probe P11 components-import-no-app src/components/probe.tsx "import Home from '@/app/page';
export const probe: unknown = Home;"
probe P12 no-circular src/lib/probe-a.ts "import { b } from '@/lib/probe-b';
export const a = (): number => b() + 1;" src/lib/probe-b.ts "import { a } from '@/lib/probe-a';
export const b = (): number => a() - 1;"
probe P13 not-to-unresolvable src/lib/probe.ts "import { missing } from '@/lib/does-not-exist';
export const probe: unknown = missing;"
probe P14 none src/components/probe.tsx "import type { Todo } from '@/lib/todos';
export type Probe = Todo;"

# P15: a commit touching only one rules file, checked alone: exit 1 without the label and 0 with it means caught.
p15=""
for f in .dependency-cruiser.mjs .dependency-cruiser-known-violations.json; do
  printf '\n// probe\n' >>"$T/$f"
  gs add -A && gs commit -q -m "probe $f"
  (cd "$T" && BASE_SHA="$(git rev-parse HEAD~1)" HEAD_SHA="$(git rev-parse HEAD)" CONFIG_CHANGE_APPROVED=false \
    bash scripts/ci/check-config-change.sh >/dev/null 2>&1)
  without=$?
  (cd "$T" && BASE_SHA="$(git rev-parse HEAD~1)" HEAD_SHA="$(git rev-parse HEAD)" CONFIG_CHANGE_APPROVED=true \
    bash scripts/ci/check-config-change.sh >/dev/null 2>&1)
  with=$?
  p15+=" $f: exit $without unlabelled, $with labelled;"
  [[ $without -eq 1 && $with -eq 0 ]] || p15+=" MISSED;"
done
total=$((total + 1))
if [[ "$p15" == *MISSED* ]]; then echo "P15 check-config-change:$p15"; else
  caught=$((caught + 1))
  echo "P15 check-config-change: CAUGHT;$p15"
fi

echo "probe: $caught/$total caught, control $control ($REF in $T)"
[[ $caught -eq $total && $control == pass ]]
