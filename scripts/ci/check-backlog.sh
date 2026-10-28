#!/usr/bin/env bash
# backlog/README.md stays truthful: the status summary totals equal the card status lines, every Remaining row is an
# Open/Partial card, and no Done card is still listed as Remaining.
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
[[ $fail -eq 0 ]] && echo "[check-backlog] OK: README matches the cards"
exit $fail
