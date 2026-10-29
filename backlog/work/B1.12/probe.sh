#!/usr/bin/env bash
# B1.12 probe: does <card-status.sh> replace a card's whole status paragraph and nothing else?
#   bash backlog/work/B1.12/probe.sh <card-status.sh> <cards.md>
# Copies <cards.md> into a scratch git repo, appends two synthetic cards whose status paragraph is followed directly
# (no blank line) by a `- **` line (B9.1) and by a `### ` heading (B9.2), then rewrites four cards one at a time:
# B1.10 (multi-line status, ends at a blank line), B1.6 (one line), B9.1, B9.2. For each, the expected file is the input
# with that card's status paragraph (the `**Status:` line and every following line up to, not including, the first
# blank line, `- **` line or `### ` heading) replaced by `**Status: Done** — x`. Prints PASS or FAIL with the count of
# lines left over (`>`) and lines lost (`<`); exit 1 on any FAIL. Run it on main's file before the fix (24665de) so
# B1.10 still carries its leftover lines.
set -uo pipefail
SCRIPT="$1"; CARDS="$2"
work="$(mktemp -d)"
mkdir -p "$work/backlog/plan" "$work/scripts"
cp "$CARDS" "$work/backlog/plan/E1-todos.md"
cat >> "$work/backlog/plan/E1-todos.md" <<'FIXTURE'

### B9.1 · Fixture: status followed directly by a list line

_tooling_
**Status: Open** — first line
second line
- **Spec:** none
- **Work:** none

### B9.2 · Fixture: status followed directly by a heading

_tooling_
**Status: Open** — first line
second line
### B9.3 · Fixture: next card

**Status: Open** — untouched
FIXTURE
cp "$SCRIPT" "$work/scripts/card-status.sh"
(cd "$work" && git init -q . && git add -A && git -c user.email=p@p -c user.name=p commit -qm base --no-verify) >/dev/null

expected() { # expected <id> <file>: <file> with the card's status paragraph replaced by one line
  awk -v id="$1" '
    $0 ~ "^### " id " · " { incard = 1; print; next }
    incard && /^### / { incard = 0 }
    incard == 1 && /^\*\*Status: / { print "**Status: Done** — x"; skip = 1; incard = 2; next }
    skip && (/^$/ || /^- \*\*/ || /^### /) { skip = 0 }
    skip { next }
    { print }
  ' "$2"
}

fail=0
for id in B1.10 B1.6 B9.1 B9.2; do
  (cd "$work" && git checkout -q -- backlog/plan/E1-todos.md && cp backlog/plan/E1-todos.md base.md)
  (cd "$work" && bash scripts/card-status.sh "$id" Done "x" >/dev/null 2>&1)
  d="$(diff <(expected "$id" "$work/base.md") "$work/backlog/plan/E1-todos.md")"
  if [[ -z "$d" ]]; then
    echo "PASS $id"
  else
    echo "FAIL $id: $(grep -c '^>' <<<"$d") line(s) left over, $(grep -c '^<' <<<"$d") line(s) lost"
    fail=1
  fi
done
exit $fail
