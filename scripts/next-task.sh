#!/usr/bin/env bash
# Pick the next task: lowest priority number among `status: backlog` whose depends_on are all `done`.
#   scripts/next-task.sh          prints "FEAT-003 docs/specs/FEAT-003-edit-title" or exits 1
#   scripts/next-task.sh --list   prints every task: id, status, priority, title, deps
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
LIST=0; [[ "${1:-}" == "--list" ]] && LIST=1

field() { awk -v k="$2" 'NR==1 && $0!="---"{exit} NR>1 && $0=="---"{exit} $0 ~ "^"k":" {sub("^"k":[[:space:]]*",""); sub(/[[:space:]]*#.*$/,""); print; exit}' "$1"; }
status_of() { local f; f="$(ls docs/specs/"$1"-*/spec.md 2>/dev/null | head -1)"; [[ -n "$f" ]] && field "$f" status || echo "missing"; }

best=""; best_prio=999; best_dir=""
[[ $LIST -eq 1 ]] && printf '%-10s %-12s %-4s %-40s %s\n' ID STATUS PRIO TITLE DEPENDS_ON
for f in docs/specs/FEAT-*/spec.md; do
  [[ -f "$f" ]] || continue
  id="$(field "$f" id)"; st="$(field "$f" status)"; pr="$(field "$f" priority)"; title="$(field "$f" title)"
  deps="$(field "$f" depends_on | tr -d '[]' | tr ',' ' ')"
  ready=1; blocked_by=""
  for d in $deps; do
    [[ "$(status_of "$d")" == "done" ]] || { ready=0; blocked_by="$blocked_by $d"; }
  done
  if [[ $LIST -eq 1 ]]; then
    printf '%-10s %-12s %-4s %-40s %s\n' "$id" "$st" "$pr" "$title" "${deps:-"-"}${blocked_by:+ (waiting:$blocked_by)}"
    continue
  fi
  [[ "$st" == "backlog" && $ready -eq 1 ]] || continue
  if [[ "${pr:-999}" -lt "$best_prio" ]]; then best="$id"; best_prio="$pr"; best_dir="$(dirname "$f")"; fi
done
[[ $LIST -eq 1 ]] && exit 0
if [[ -z "$best" ]]; then
  echo "[next-task] nothing ready: no backlog task with all dependencies done (scripts/next-task.sh --list)" >&2
  exit 1
fi
echo "$best $best_dir"
