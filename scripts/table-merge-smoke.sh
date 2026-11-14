#!/usr/bin/env bash
# Probes T1–T12 of how card branches merge the shared tables (B1.89): two branches from one base, each one commit on a
# copy of this checkout's tree, merged as dev-lead's Loop 9 merges (`git merge`), then the CI guards on the result.
#   scripts/table-merge-smoke.sh
#   T1 rows appended to spec/features-map.md on both sides merge cleanly, each kept once; check-features-map.sh OK
#   T2 rows appended to docs/metrics.md "Per card" on both sides merge cleanly, each kept once; check-backlog.sh OK
#   T3 one features-map row edited differently on both sides: check-features-map.sh names the row kept twice and
#      says to keep origin/main's copy
#   T4 a card's appended row merged with main's closing edit of the row above it: check-backlog.sh names the row and
#      says to keep origin/main's copy (the card's stale copy comes first)
#   T5 one row of the metrics top table edited differently on both sides: check-backlog.sh names it
#   T6 a re-padded features-map table (Prettier widening a column) against an appended row: check-features-map.sh fails
#   T7 a re-padded metrics "Per card" table against an appended row: check-backlog.sh fails
#   T8 .gitattributes is a CONFIG_PROTECTED path (scripts/ci/lib.sh, D-19)
#   T9 merge=union on spec/features-map.md, docs/metrics.md and spec/technical-requirements.md (B1.96)
#   T10 section rows appended to the index on both sides (each with its own contract) merge cleanly, each kept once;
#       check-spec-sections.sh OK
#   T11 a card's appended section row merged with main's closing flip (✗ → ✅) of the row above it:
#       check-spec-sections.sh names that section and says to keep origin/main's copy
#   T12 a re-padded index table against an appended section row: check-spec-sections.sh fails
#   T13–T15 (B1.97) a row wider than its column, formatted as format-after-edit.sh and Lefthook do (prettier from the
#       top level, so .prettierignore applies), against an appended row, in the map, the metrics "Per card" table and
#       the index: a clean merge, both rows once, the file's guard OK, and the wide row's side changed one line only
# Needs node_modules (prettier) for T13–T15.
# Reads this checkout's tracked files as they are on disk, plus .gitattributes; writes only under its own mktemp -d.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd -P)"
# Each step is checked before the EXIT trap exists: in bash 3.2 `cd ""` succeeds where it stands, so an unchecked
# failed mktemp would make TMP the caller's directory and the trap would remove it (review pass 1)
t="$(mktemp -d "${TMPDIR:-/tmp}/table-merge-smoke.XXXXXX")" && [[ -n "$t" && -d "$t" ]] && t="$(cd "$t" && pwd -P)" \
  && [[ "${t##*/}" == table-merge-smoke.?* ]] || { echo "table-merge-smoke: mktemp -d failed" >&2; exit 2; }
TMP="$t"; trap 'rm -rf -- "$TMP"' EXIT
R="$TMP/repo"; mkdir -p "$R"
oks=0; fails=0
ok() { echo "ok   $1"; oks=$((oks + 1)); }
fail() { echo "FAIL $1"; shift; for l in "$@"; do echo "     $l"; done; fails=$((fails + 1)); }

(cd "$ROOT" && { git ls-files; [[ -f .gitattributes ]] && echo .gitattributes; } | sort -u \
  | while IFS= read -r f; do [[ -f "$f" ]] && echo "$f"; done | tar -cf - -T -) | tar -xf - -C "$R"
# the host's global and system git config stay out, so a merge.* or core.attributesFile there cannot change a verdict
G=(env GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 git -C "$R" -c user.name=smoke -c user.email=smoke@x -c commit.gpgsign=false -c core.hooksPath=/dev/null)
{ "${G[@]}" init -q -b main && "${G[@]}" add -A && "${G[@]}" commit -qm base; } \
  || { echo "table-merge-smoke: could not build the base repository" >&2; exit 2; }

FM=spec/features-map.md; MT=docs/metrics.md; IX=spec/technical-requirements.md
# put_after <file> <regex> <row>: the row goes after the last line matching the regex (the end of that table); the
# regex and the row travel through the environment, as awk -v would turn `\|` into `|` (a regex matching every line)
put_after() { RE="$2" ROW="$3" awk 'NR==FNR { if ($0 ~ ENVIRON["RE"]) n=FNR; next } { print } FNR==n { print ENVIRON["ROW"] }' "$R/$1" "$R/$1" > "$TMP/x" && mv "$TMP/x" "$R/$1"; }
# set_last_cell <file> <key> <text>: the row starting "| <key> " gets <text> in its last cell
set_last_cell() { K="| $2 " T="$3" awk 'index($0, ENVIRON["K"])==1 { sub(/\|[^|]*\|$/, "| " ENVIRON["T"] " |") } { print }' "$R/$1" > "$TMP/x" && mv "$TMP/x" "$R/$1"; }
LAST_F="$(grep -oE '^\| F[0-9]+ ' "$R/$FM" | tail -1 | tr -d '| ')"
LAST_C="$(awk '/^## Per card/{f=1;next} /^## /{f=0} f && /^\| B[0-9]/' "$R/$MT" | tail -1 | cut -d'|' -f2 | tr -d ' ')"
LAST_S="$(grep -oE '^\| §[0-9]+ ' "$R/$IX" | tail -1 | tr -d '| ')"
f_row() { echo "| $1 | §1 | Smoke row $1 | \`src/lib/env.ts\` | \`src/lib/env.test.ts\` | ✅ |"; }
# add_section <n>: a card adds its contract with the index row (check-spec-sections.sh wants a heading for every
# section cited); the contract is a new file, staged here because merge_sides commits with `commit -am`
add_section() {
  printf '# §%s Smoke\n' "$1" > "$R/spec/contracts/smoke-$1.md" && "${G[@]}" add "spec/contracts/smoke-$1.md" \
    && put_after $IX '^\| §[0-9]' "| §$1 | [contracts/smoke-$1.md](contracts/smoke-$1.md) | Smoke | ✗ |"
}
c_row() { echo "| $1 | — (tooling) | 0 | n/a | smoke | 0 | smoke | this PR |"; }
TOP='Parallel delivery   | Speed   | Throughput:'

# merge_sides <fn-a> <fn-b>: branches a and b from main, one commit each, then b merged into a; MERGED = merge's rc,
# or "no-change" when a side changed nothing (a probe whose edit missed its row proves nothing)
merge_sides() {
  "${G[@]}" checkout -q -f main && { "${G[@]}" branch -q -D a b 2>/dev/null; true; }
  "${G[@]}" checkout -q -b a main && "$1" && "${G[@]}" commit -qam a >/dev/null 2>&1 || { MERGED=no-change; return; }
  "${G[@]}" checkout -q -b b main && "$2" && "${G[@]}" commit -qam b >/dev/null 2>&1 || { MERGED=no-change; return; }
  "${G[@]}" checkout -q a
  "${G[@]}" merge -q --no-edit b >/dev/null 2>&1; MERGED=$?
  [[ "$MERGED" == 0 ]] || "${G[@]}" merge --abort 2>/dev/null
}
rows() { grep -cE "^\| $2 " "$R/$1"; }
guard() { OUT="$(cd "$R" && "scripts/ci/$1" 2>&1)"; RC=$?; }
probe() { # probe <name> <condition…>: ok when the condition holds, else FAIL with the merge and guard results
  local n="$1"; shift
  if "$@"; then ok "$n"; else fail "$n" "merge rc $MERGED, guard rc $RC" "$(printf '%s' "$OUT" | tail -5)"; fi
}

t1a() { put_after $FM '^\| F[0-9]' "$(f_row F901)"; }; t1b() { put_after $FM '^\| F[0-9]' "$(f_row F902)"; }
merge_sides t1a t1b; guard check-features-map.sh
kept_once() { [[ "$MERGED" == 0 && "$RC" == 0 && "$(rows "$1" "$2")" == 1 && "$(rows "$1" "$3")" == 1 ]]; }
probe "T1 features-map rows appended on both sides merge, each kept once" kept_once $FM F901 F902

t2a() { put_after $MT '^\| B[0-9]' "$(c_row B9.901)"; }; t2b() { put_after $MT '^\| B[0-9]' "$(c_row B9.902)"; }
merge_sides t2a t2b; guard check-backlog.sh
probe "T2 metrics rows appended on both sides merge, each kept once" kept_once $MT 'B9\.901' 'B9\.902'

named() { [[ "$MERGED" == 0 && "$RC" != 0 && "$OUT" == *"$1"* ]]; }
t3a() { set_last_cell $FM "$LAST_F" '✗'; }; t3b() { set_last_cell $FM "$LAST_F" '◐'; }
merge_sides t3a t3b; guard check-features-map.sh
probe "T3 a features-map row edited on both sides is named with which copy to keep" \
  named "$LAST_F has 2 rows in spec/features-map.md: a union merge kept both sides of an edit. Keep the copy origin/main has"

# Loop 9's direction: the card branch (a) appends, then merges main (b), where a sibling's closing set the last row's sha
t4a() { put_after $MT '^\| B[0-9]' "$(c_row B9.903)"; }; t4b() { set_last_cell $MT "$LAST_C" 'abc1234'; }
merge_sides t4a t4b; guard check-backlog.sh
probe "T4 a card's append merged with a sibling's closing edit names the row and which copy to keep" \
  named "$LAST_C has 2 rows: a union merge kept both sides of an edit. Keep the copy origin/main has"

t5a() { set_last_cell $MT "$TOP" 'a'; }; t5b() { set_last_cell $MT "$TOP" 'b'; }
merge_sides t5a t5b; guard check-backlog.sh
probe "T5 a metrics top-table row edited on both sides is named" named "Throughput"

t6a() { awk '/^\| (F[0-9]*|---) /{ sub(/ \|$/, "  |") } { print }' "$R/$FM" > "$TMP/x" && mv "$TMP/x" "$R/$FM"; }
t6b() { put_after $FM '^\| F[0-9]' "$(f_row F904)"; }
merge_sides t6a t6b; guard check-features-map.sh
probe "T6 a re-padded map against an appended row is caught" named "F1 has 2 rows"

t7a() { awk '/^## /{ f = ($0 == "## Per card") } f && /^\| /{ sub(/ \|$/, "  |") } { print }' "$R/$MT" > "$TMP/x" && mv "$TMP/x" "$R/$MT"; }
t7b() { put_after $MT '^\| B[0-9]' "$(c_row B9.904)"; }
merge_sides t7a t7b; guard check-backlog.sh
probe "T7 a re-padded Per card table against an appended row is caught" named "B1.1 has 2 rows"

MERGED=-; OUT=""; RC=-
probe "T8 .gitattributes is CONFIG_PROTECTED" bash -c '. "$1/scripts/ci/lib.sh"; [[ .gitattributes =~ $CONFIG_PROTECTED ]]' _ "$ROOT"

OUT="$("${G[@]}" check-attr merge -- $FM $MT $IX)"
probe "T9 merge=union on features-map, metrics and the section index" \
  test "$(printf '%s\n' "$OUT" | sed 's/.*: //' | tr '\n' ' ')" = "union union union "

t10a() { add_section 901; }; t10b() { add_section 902; }
merge_sides t10a t10b; guard check-spec-sections.sh
probe "T10 index rows appended on both sides merge, each kept once" kept_once $IX '§901' '§902'

# Loop 9's direction: main first holds the last row open (✗, as at filing); the card (a) appends its section, then
# merges main (b), where a sibling's closing flipped that row to ✅. Every row is ✅ today, so the ✗ is set here.
{ "${G[@]}" checkout -q -f main && set_last_cell $IX "$LAST_S" '✗' && "${G[@]}" commit -qam open >/dev/null; } \
  || { echo "table-merge-smoke: could not open $LAST_S on main" >&2; exit 2; }
t11a() { add_section 903; }; t11b() { set_last_cell $IX "$LAST_S" '✅'; }
merge_sides t11a t11b; guard check-spec-sections.sh
probe "T11 a card's index append merged with a sibling's closing flip names the section and which copy to keep" \
  named "$LAST_S has 2 rows in spec/technical-requirements.md: a union merge kept both sides of an edit. Keep the copy origin/main has"

t12a() { awk '/^\| (§[0-9]*|---) /{ sub(/ \|$/, "  |") } { print }' "$R/$IX" > "$TMP/x" && mv "$TMP/x" "$R/$IX"; }
t12b() { add_section 904; }
merge_sides t12a t12b; guard check-spec-sections.sh
probe "T12 a re-padded index against an appended row is caught" named "§1 has 2 rows"

# B1.97: one side appends a row wider than its column and formats the file as the hooks do, the other appends a row
PRETTIER="$ROOT/node_modules/.bin/prettier"
[[ -x "$PRETTIER" ]] || { echo "table-merge-smoke: $PRETTIER missing (pnpm install)" >&2; exit 2; }
fmt() { (cd "$R" && "$PRETTIER" --write --log-level warn "$1" >/dev/null 2>&1); }
W="$(printf 'wide%.0s' $(seq 1 45))" # 180 characters, wider than any column of the three tables
# wide_once <file> <key-a> <key-b>: kept_once, and side a's own commit (a^1 after the clean merge) added one line to
# the file and changed no other, so the formatter re-padded nothing
wide_once() { kept_once "$@" && [[ "$("${G[@]}" diff --numstat main 'a^1' -- "$1" | cut -f1,2 | tr '\t' ' ')" == "1 0" ]]; }

t13a() { put_after $FM '^\| F[0-9]' "| F905 | §1 | Smoke $W | \`src/lib/env.ts\` | \`src/lib/env.test.ts\` | ✅ |" && fmt $FM; }
t13b() { put_after $FM '^\| F[0-9]' "$(f_row F906)"; }
merge_sides t13a t13b; guard check-features-map.sh
probe "T13 a map row wider than its column, formatted, against an appended row: each row once" wide_once $FM F905 F906

t14a() { put_after $MT '^\| B[0-9]' "| B9.905 | — (tooling) $W | 0 | n/a | smoke | 0 | smoke | this PR |" && fmt $MT; }
t14b() { put_after $MT '^\| B[0-9]' "$(c_row B9.906)"; }
merge_sides t14a t14b; guard check-backlog.sh
probe "T14 a metrics row wider than its column, formatted, against an appended row: each row once" \
  wide_once $MT 'B9\.905' 'B9\.906'

t15a() {
  printf '# §905 Smoke\n' > "$R/spec/contracts/smoke-905.md" && "${G[@]}" add spec/contracts/smoke-905.md \
    && put_after $IX '^\| §[0-9]' "| §905 | [contracts/smoke-905.md](contracts/smoke-905.md) | Smoke $W | ✗ |" && fmt $IX
}
t15b() { add_section 906; }
merge_sides t15a t15b; guard check-spec-sections.sh
probe "T15 an index row wider than its column, formatted, against an appended row: each row once" \
  wide_once $IX '§905' '§906'

if [[ $fails -eq 0 ]]; then echo "$oks probes OK"; exit 0; fi
echo "$fails of $((oks + fails)) probes FAILED"; exit 1
