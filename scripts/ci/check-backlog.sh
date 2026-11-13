#!/usr/bin/env bash
# backlog/README.md stays truthful: the status summary totals equal the card status lines, every Remaining row is an
# Open/Partial card, no Done card is still listed as Remaining, and no docs/metrics.md row is there twice (B1.89).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
fail=0
for f in backlog/plan/E*.md; do
  epic="$(basename "$f" .md | sed -E 's/^(E[0-9]+)-.*/\1/')"
  done_n="$(grep -cE '^\*\*Status: Done\*\*' "$f" || true)"; part_n="$(grep -cE '^\*\*Status: Partial\*\*' "$f" || true)"; open_n="$(grep -cE '^\*\*Status: Open\*\*' "$f" || true)"
  row="$(grep -E "^\| $epic " backlog/README.md | head -1 || true)"
  [[ -n "$row" ]] || { echo "::error::README has no summary row for $epic"; fail=1; continue; }
  read -r r_done r_part r_open r_total < <(echo "$row" | awk -F'|' '{gsub(/ /,"",$4);gsub(/ /,"",$5);gsub(/ /,"",$6);gsub(/ /,"",$7); print $4,$5,$6,$7}')
  if [[ "$r_done" != "$done_n" || "$r_part" != "$part_n" || "$r_open" != "$open_n" || "$r_total" != "$((done_n+part_n+open_n))" ]]; then
    echo "::error::$epic summary row says Done=$r_done Partial=$r_part Open=$r_open Total=$r_total; cards say $done_n/$part_n/$open_n/$((done_n+part_n+open_n))"; fail=1
  fi
done
while IFS='|' read -r _ _ id _; do
  id="$(echo "$id" | xargs)"; [[ "$id" =~ ^B[0-9]+\.[0-9]+$ ]] || continue
  status="$(awk -v id="$id" '$0 ~ "^### " id " · " {f=1; next} f && /^### / {exit} f && /^\*\*Status: /' backlog/plan/*.md | head -1 | sed -E 's/^\*\*Status: ([A-Za-z]+)\*\*.*/\1/')"
  [[ "$status" =~ ^(Open|Partial)$ ]] || { echo "::error::Remaining row $id has card status '${status:-none}'"; fail=1; }
done < <(awk '/^## Remaining/{f=1;next} /^## /{f=0} f && /^\| *[0-9]+ *\|/' backlog/README.md)
# B1.89: docs/metrics.md merges with merge=union (.gitattributes), so a row edited on both sides of a merge comes back
# twice, the merging branch's copy first; keeping that one would undo the other side's edit (a closing commit's sha).
# A row's key is its first cell; in the top table, where one practice has several rows, Practice | Type | Metric.
while IFS= read -r d; do
  echo "::error::docs/metrics.md: $d: a union merge kept both sides of an edit. Keep the copy origin/main has, plus this branch's own change to that row if it made one; delete the rest"; fail=1
done < <(awk -F'|' '
  !/^\|/ { h = 0; next }
  /^\| *-/ { next }
  { for (i = 2; i < NF; i++) { c[i] = $i; gsub(/^ +| +$/, "", c[i]) } }
  !h { h = 1; n = (c[2] == "Practice") ? 3 : 1; t++; next }
  { k = c[2]; for (i = 3; i <= n + 1; i++) k = k " | " c[i]; if (++seen[t, k] == 2) order[++d] = t SUBSEP k }
  END { for (j = 1; j <= d; j++) { split(order[j], p, SUBSEP); print p[2] " has " seen[order[j]] " rows" } }
' docs/metrics.md)
# B1.18: the board state is derived; README "Remaining" must say where it lives.
awk '/^## Remaining/{f=1;next} /^## /{f=0} f' backlog/README.md | grep -q 'scripts/next-task.sh --list' \
  || { echo "::error::README \"Remaining\" must name scripts/next-task.sh --list as the board (B1.18)"; fail=1; }
[[ $fail -eq 0 ]] && echo "[check-backlog] OK: README matches the cards"
exit $fail
