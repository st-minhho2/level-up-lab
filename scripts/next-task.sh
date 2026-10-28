#!/usr/bin/env bash
# The next eligible card: a backlog/README.md "Remaining" row whose Blocked-by holds only struck-through ids, whose
# Owner is Lead or Dev, and whose card carries both contract lines (Spec:, Test:) with a real test. Lowest step first.
#   scripts/next-task.sh          prints "B1.2 backlog/plan/E1-todos.md" or exits 1 with the near-misses
#   scripts/next-task.sh --list   prints the board rows with their eligibility
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
LIST=0; [[ "${1:-}" == "--list" ]] && LIST=1
best=""; best_step=999; best_file=""; misses=""
[[ $LIST -eq 1 ]] && printf '%-5s %-6s %-30s %-6s %-6s %-12s %s\n' STEP ID TITLE OWNER SPEC STATUS WHY
while IFS='|' read -r _ step id title spec status blocked owner size _; do
  id="$(echo "$id" | xargs)"; [[ "$id" =~ ^B[0-9]+\.[0-9]+$ ]] || continue
  step="$(echo "$step" | xargs)"; title="$(echo "$title" | xargs)"; owner="$(echo "$owner" | xargs)"; spec="$(echo "$spec" | xargs)"; status="$(echo "$status" | xargs)"
  blocked="$(echo "$blocked" | xargs)"
  why=""
  open_deps="$(echo "$blocked" | tr ' ,' '\n\n' | grep -E '^B[0-9]+\.[0-9]+$' || true)"   # ids NOT wrapped in ~~
  [[ -n "$open_deps" ]] && why="blocked by $(echo "$open_deps" | tr '\n' ' ')"
  [[ "$owner" =~ ^(Lead|Dev)$ ]] || why="${why:+$why; }owner $owner"
  file="$(grep -lE "^### $id · " backlog/plan/*.md | head -1 || true)"
  if [[ -z "$file" ]]; then why="${why:+$why; }no card"; else
    card="$(awk -v id="$id" '$0 ~ "^### " id " · " {f=1; print; next} f && /^### / {exit} f' "$file")"
    echo "$card" | grep -qE '^\- \*\*Spec:\*\* §[0-9]+ — unchanged' || why="${why:+$why; }Spec: line missing or says change"
    echo "$card" | grep -qE '^\- \*\*Test:\*\* `[^`]+::[^`]+`' || why="${why:+$why; }Test: line missing"
    echo "$card" | grep -qE '^\*\*Status: (Open|Partial)\*\*' || why="${why:+$why; }status not Open/Partial"
  fi
  if [[ $LIST -eq 1 ]]; then printf '%-5s %-6s %-30s %-6s %-6s %-12s %s\n' "$step" "$id" "${title:0:30}" "$owner" "$spec" "$status" "${why:-eligible}"; continue; fi
  if [[ -z "$why" ]]; then
    if [[ "${step:-999}" -lt "$best_step" ]]; then best="$id"; best_step="$step"; best_file="$file"; fi
  else misses="$misses  $id: $why\n"; fi
done < <(awk '/^## Remaining/{f=1;next} /^## /{f=0} f && /^\| *[0-9]+ *\|/' backlog/README.md)
[[ $LIST -eq 1 ]] && exit 0
if [[ -z "$best" ]]; then printf '[next-task] nothing eligible. Near-misses:\n%b' "$misses" >&2; exit 1; fi
echo "$best $best_file"
