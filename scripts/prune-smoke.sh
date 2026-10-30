#!/usr/bin/env bash
# Smoke for scripts/worktree-prune.sh (B1.13, B1.14) on a throwaway git repo and a throwaway database of the local compose
# server. Exit 1 on any FAIL. bash 3.2-safe.
#   scripts/prune-smoke.sh [<prune-script>]      default scripts/worktree-prune.sh; needs the compose Postgres up
#
# Layouts: M = <main>/.worktrees/<slug>, A = <main>/.claude/worktrees/app (an app checkout), N = A/.worktrees/<slug>.
#   P1  M squash-merged on origin, local main stale → removed, schema dropped, branch deleted
#   P2  same in N, run from the main checkout
#   P3  N directory deleted, unmerged → schema dropped, branch kept, worktree metadata gone
#   P4  M with no commits beyond the base → kept with its schema
#   P5  M and N unmerged → kept with their schemas
#   P6  the main checkout and A untouched
#   P7  an orphan wt_* schema is listed by the default run and by --schemas and stays; --schemas --drop --dry-run
#       drops nothing; --schemas --drop from main, then a second orphan from A: each time exactly the orphan is gone
#       and the P4/P5 schemas (M and N) all remain
#   P8  run from A: a merged N worktree is removed with its schema
#   P9  --dry-run changes no worktree, branch or schema
#   P10 Postgres down: exit 0, merged worktree removed, "left in place" and "orphan list skipped" printed, schema stays
#   P11 run from inside a merged M worktree → that worktree kept ("current checkout")
#   P12 a merged worktree whose .worktree.env names a non-wt_* schema (public) → removed, that schema not dropped
#   P13 N directory deleted, merged → schema dropped, branch deleted, exit 0, a later merged worktree still removed
#   P14 M branch = a commit and its revert, never on origin → kept with directory, schema and branch ([keep], net to
#       no change)
#   P15 N branch = a file added then dropped, directory deleted → schema dropped, branch kept (net to no change),
#       metadata gone
#
# Isolation: the throwaway main checkout is named like the real one, so compose resolves the running server's
# project; COMPOSE_* is unset. A docker shim first on PATH forwards only `compose -f <throwaway repo>/…/
# docker-compose.yml ps …` and `compose -f … exec … postgres psql …` with exactly one selector `-d level_up_lab`,
# rewritten to the throwaway database; anything else exits 99 and fails the run. A gh shim is offline. The prune
# script runs without a controlling terminal (no prompt can reach a person). The database is dropped on exit.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

PRUNE_ARG="${1:-scripts/worktree-prune.sh}"
[[ -f "$PRUNE_ARG" ]] || { echo "[prune-smoke] no such script: $PRUNE_ARG" >&2; exit 1; }
PRUNE="$(cd "$(dirname "$PRUNE_ARG")" && pwd -P)/$(basename "$PRUNE_ARG")"
REAL_MAIN="$(git worktree list --porcelain | sed -n '1s/^worktree //p')"
REAL_DOCKER="$(command -v docker)" || { echo "[prune-smoke] docker not found" >&2; exit 1; }
unset COMPOSE_PROJECT_NAME COMPOSE_FILE GH_REPO
pgreal() { "$REAL_DOCKER" compose -f "$REAL_MAIN/docker-compose.yml" exec -T postgres \
  psql -q -At -U postgres -v ON_ERROR_STOP=1 "$@" </dev/null; }
if [[ -z "$("$REAL_DOCKER" compose -f "$REAL_MAIN/docker-compose.yml" ps -q --status running postgres 2>/dev/null </dev/null)" ]]; then
  echo "[prune-smoke] compose postgres not running (docker compose up -d in $REAL_MAIN)" >&2; exit 1
fi

TMP="$(cd "$(mktemp -d)" && pwd -P)"
TDB="prune_smoke_$$"; P="ps$$"
M="$TMP/$(basename "$REAL_MAIN")"; A="$M/.claude/worktrees/app"; O="$TMP/origin.git"; OTHER="$TMP/other"
LIVE_BEFORE="$(pgreal -d level_up_lab -c "SELECT nspname FROM pg_namespace WHERE nspname LIKE 'wt\_%' ORDER BY 1")"
cleanup() { pgreal -d postgres -c "DROP DATABASE IF EXISTS $TDB" >/dev/null 2>&1; rm -rf "$TMP"; }
trap cleanup EXIT
pgreal -d postgres -c "CREATE DATABASE $TDB" || { echo "[prune-smoke] cannot create $TDB" >&2; exit 1; }
pgt() { pgreal -d "$TDB" "$@"; }

# --- shims --------------------------------------------------------------------------------------------------------
mkdir -p "$TMP/bin" "$TMP/nohooks"
cat > "$TMP/bin/docker" <<SHIM
#!/bin/bash
real='$REAL_DOCKER'; root='$TMP'; tdb='$TDB'
deny() { echo "DENIED: \$*" >> "\$root/denied.log"; echo "docker shim: denied" >&2; exit 99; }
[ "\$1" = compose ] && [ "\$2" = -f ] || deny "\$@"
case "\$3" in "\$root"/*/docker-compose.yml) ;; *) deny "\$@" ;; esac
f="\$3"; shift 3
if [ -n "\${SMOKE_PG_DOWN:-}" ]; then
  [ "\$1" = ps ] && exit 0
  echo 'service "postgres" is not running' >&2; exit 1
fi
case "\$1" in
  ps) exec "\$real" compose -f "\$f" "\$@" ;;
  exec) ;;
  *) deny compose -f "\$f" "\$@" ;;
esac
out=(); sel=0; psql=0; svc=0; prev=""
for a in "\$@"; do
  if [ "\$prev" = -d ]; then
    [ "\$a" = level_up_lab ] || deny "\$@"
    out+=("\$tdb"); sel=\$((sel + 1)); prev=""; continue
  fi
  if [ "\$prev" = -e ]; then
    case "\$a" in PGOPTIONS=*) ;; *) deny "\$@" ;; esac
  fi
  case "\$a" in
    --dbname*|-d?*|*PGDATABASE*|*PGHOST*|*PGSERVICE*|postgres://*|postgresql://*|*dbname=*) deny "\$@" ;;
    psql) psql=1 ;;
    postgres) svc=1 ;;
  esac
  out+=("\$a"); prev="\$a"
done
[ \$sel -eq 1 ] && [ \$psql -eq 1 ] && [ \$svc -eq 1 ] || deny "\$@"
exec "\$real" compose -f "\$f" "\${out[@]}"
SHIM
printf '#!/bin/bash\necho "gh shim: offline" >&2\nexit 1\n' > "$TMP/bin/gh"
chmod +x "$TMP/bin/docker" "$TMP/bin/gh"

# --- fixture repo -------------------------------------------------------------------------------------------------
cfg() { git -C "$1" config user.name smoke; git -C "$1" config user.email smoke@example.invalid
  git -C "$1" config core.hooksPath "$TMP/nohooks"; git -C "$1" config commit.gpgsign false; }
git init -q --bare -b main "$O"
git init -q -b main "$M"; cfg "$M"
cp docker-compose.yml "$M/docker-compose.yml"
printf '.worktrees/\n.claude/worktrees/\n.worktree.env\n' > "$M/.gitignore"
echo base > "$M/base.txt"
git -C "$M" add -A && git -C "$M" commit -q -m base && git -C "$M" remote add origin "$O" && git -C "$M" push -q -u origin main
git clone -q "$O" "$OTHER" 2>/dev/null; cfg "$OTHER"
git -C "$M" worktree add -q -b claude/app "$A" main

schema_of() { printf 'wt_%s' "$(printf '%s' "$1" | tr '-' '_')"; }
mkwt() { # mkwt <checkout> <name>: worktree.sh's layout, .worktree.env and schema; prints the directory
  local slug="feat-$P-$2" dir="$1/.worktrees/feat-$P-$2"
  git -C "$1" worktree add -q -b "feat/$P-$2" "$dir" main
  printf 'WORKTREE_TASK=feat/%s\nWORKTREE_SLUG=%s\nWORKTREE_SCHEMA=%s\n' "$P-$2" "$slug" "$(schema_of "$slug")" > "$dir/.worktree.env"
  pgt -c "CREATE SCHEMA \"$(schema_of "$slug")\"" >/dev/null
  printf '%s' "$dir"
}
commit_wt() { echo "$2" > "$1/$2"; git -C "$1" add "$2"; git -C "$1" commit -q -m "add $2"; }
squash_merge() { # squash_merge <worktree> <file>: the same change lands on origin/main as one new commit
  cp "$1/$2" "$OTHER/$2"; git -C "$OTHER" add "$2"; git -C "$OTHER" commit -q -m "squash $2"; git -C "$OTHER" push -q origin main
}
sch() { schema_of "feat-$P-$1"; }

WA="$(mkwt "$M" merged-a)"; commit_wt "$WA" a.txt; squash_merge "$WA" a.txt
WB="$(mkwt "$A" merged-b)"; commit_wt "$WB" b.txt; squash_merge "$WB" b.txt
WC="$(mkwt "$A" gone-c)"; commit_wt "$WC" c.txt; rm -rf "$WC"
WD="$(mkwt "$M" empty-d)"
WE="$(mkwt "$M" wip-e)"; commit_wt "$WE" e.txt
WG="$(mkwt "$A" live-g)"; commit_wt "$WG" g.txt
ORPH1="wt_${P}_orphan1"; pgt -c "CREATE SCHEMA \"$ORPH1\"" >/dev/null

# --- helpers ------------------------------------------------------------------------------------------------------
RUNS=0
prune() { # prune <cwd> [args…]: sets RC and OUT (file)
  local dir="$1"; shift; RUNS=$((RUNS + 1)); OUT="$TMP/out.$RUNS"
  (cd "$dir" && PATH="$TMP/bin:$PATH" perl -MPOSIX -e 'POSIX::setsid(); exec @ARGV or die "exec: $!"' \
    /bin/bash "$PRUNE" "$@" </dev/null >"$OUT" 2>&1)
  RC=$?
}
schemas() { pgt -c "SELECT nspname FROM pg_namespace WHERE nspname LIKE 'wt\_%' ORDER BY 1"; }
has_schema() { [[ "$(pgt -c "SELECT count(*) FROM pg_namespace WHERE nspname = '$1'")" == 1 ]]; }
no_schema() { ! has_schema "$1"; }
has_dir() { [[ -d "$1" ]]; }
no_dir() { [[ ! -d "$1" ]]; }
has_branch() { git -C "$M" show-ref --verify -q "refs/heads/$1"; }
no_branch() { ! has_branch "$1"; }
listed() { git -C "$M" worktree list --porcelain | grep -qxF "worktree $1"; }
unlisted() { ! listed "$1"; }
said() { grep -qF -- "$1" "$OUT"; }
unsaid() { ! said "$1"; }
rc_is() { [[ "$RC" == "$1" ]]; }
same() { [[ "$1" == "$2" ]]; }
snapshot() { git -C "$M" worktree list --porcelain | grep -E '^(worktree|branch) '; git -C "$M" for-each-ref --format='%(refname)' refs/heads; schemas; }

n=0; ok=0; FAILED=""; ERR=""
check() { "${@:2}" || ERR="$ERR; $1"; }
group() { # group <id> <title>: report the checks since the last group
  n=$((n + 1))
  if [[ -z "$ERR" ]]; then ok=$((ok + 1)); printf 'ok   %s %s\n' "$1" "$2"
  else FAILED="$FAILED $1"; printf 'FAIL %s %s:%s\n' "$1" "$2" "${ERR#;}"; fi
  ERR=""
}
show() { sed 's/^/       | /' "$OUT"; }

# --- probes -------------------------------------------------------------------------------------------------------
BEFORE="$(snapshot)"
prune "$M" --dry-run
check "dry-run exit $RC" rc_is 0
check "dry-run changed state" same "$BEFORE" "$(snapshot)"
group P9 "--dry-run changes nothing"

prune "$M"; RUN1="$OUT"; RC1=$RC
check "exit $RC1" rc_is 0
check "M merged dir left" no_dir "$WA"; check "M merged schema left" no_schema "$(sch merged-a)"; check "M merged branch left" no_branch "feat/$P-merged-a"
group P1 "M squash-merged on origin with a stale local main: removed with schema and branch"
check "N merged dir left" no_dir "$WB"; check "N merged schema left" no_schema "$(sch merged-b)"; check "N merged branch left" no_branch "feat/$P-merged-b"
group P2 "N merged, run from the main checkout: removed with schema and branch"
check "gone schema left" no_schema "$(sch gone-c)"; check "unmerged branch deleted" has_branch "feat/$P-gone-c"; check "metadata kept" unlisted "$WC"
group P3 "N directory deleted, unmerged: schema dropped, branch kept, metadata gone"
check "no-commit dir removed" has_dir "$WD"; check "no-commit schema dropped" has_schema "$(sch empty-d)"; check "no-commit branch deleted" has_branch "feat/$P-empty-d"
group P4 "M with no commits beyond the base: kept"
check "M unmerged removed" has_dir "$WE"; check "M unmerged schema dropped" has_schema "$(sch wip-e)"
check "N unmerged removed" has_dir "$WG"; check "N unmerged schema dropped" has_schema "$(sch live-g)"
group P5 "M and N unmerged: kept"
check "main checkout touched" listed "$M"; check "app checkout removed" has_dir "$A"; check "app checkout unlisted" listed "$A"; check "app branch deleted" has_branch claude/app
group P6 "main and app checkouts untouched"

OUT="$RUN1"
check "default run did not list the orphan" said "[orphan] $ORPH1"
check "orphan dropped by default run" has_schema "$ORPH1"
prune "$M" --schemas
check "--schemas exit $RC" rc_is 0; check "--schemas did not list the orphan" said "[orphan] $ORPH1"
for k in empty-d wip-e live-g; do check "--schemas lists live $k as orphan" unsaid "[orphan] $(sch "$k")"; done
check "orphan dropped by --schemas" has_schema "$ORPH1"
S0="$(schemas)"
prune "$M" --schemas --drop --dry-run
check "--drop --dry-run exit $RC" rc_is 0; check "--drop --dry-run dropped something" same "$S0" "$(schemas)"
prune "$M" --schemas --drop
check "--drop from main exit $RC" rc_is 0
check "--drop from main: not exactly the orphan gone" same "$(printf '%s\n' "$S0" | grep -vxF "$ORPH1")" "$(schemas)"
ORPH2="wt_${P}_orphan2"; pgt -c "CREATE SCHEMA \"$ORPH2\"" >/dev/null; S0="$(schemas)"
prune "$A" --schemas --drop
check "--drop from app exit $RC" rc_is 0
check "--drop from app: not exactly the orphan gone" same "$(printf '%s\n' "$S0" | grep -vxF "$ORPH2")" "$(schemas)"
for k in empty-d wip-e live-g; do check "live $k schema dropped" has_schema "$(sch "$k")"; done
group P7 "orphans listed, dropped only by --schemas --drop, live schemas kept"

WH="$(mkwt "$A" merged-h)"; commit_wt "$WH" h.txt; squash_merge "$WH" h.txt
prune "$A"
check "exit $RC" rc_is 0; check "N merged dir left" no_dir "$WH"; check "N merged schema left" no_schema "$(sch merged-h)"; check "N merged branch left" no_branch "feat/$P-merged-h"
group P8 "run from the app checkout: merged N worktree removed with its schema"

WK="$(mkwt "$M" merged-k)"; commit_wt "$WK" k.txt; squash_merge "$WK" k.txt
SMOKE_PG_DOWN=1 prune "$M"
check "exit $RC" rc_is 0; check "merged dir left" no_dir "$WK"; check "schema dropped while down" has_schema "$(sch merged-k)"
check "no 'left in place'" said "left in place"; check "no 'orphan list skipped'" said "orphan list skipped"
group P10 "Postgres down: worktree removed, schema left, both messages"

WP="$(mkwt "$M" cur-p)"; commit_wt "$WP" p.txt; squash_merge "$WP" p.txt
prune "$WP"
check "exit $RC" rc_is 0; check "current checkout removed" has_dir "$WP"; check "current checkout schema dropped" has_schema "$(sch cur-p)"
check "no '(current checkout' line" said "(current checkout;"
group P11 "run from inside a merged worktree: that worktree is kept"

WQ="$(mkwt "$M" bad-q)"; commit_wt "$WQ" q.txt; squash_merge "$WQ" q.txt
printf 'WORKTREE_SCHEMA=public\n' > "$WQ/.worktree.env"
prune "$M"
check "exit $RC" rc_is 0; check "public dropped" has_schema public; check "no refusal message" said "not a wt_* schema name"; check "bad-name worktree left" no_dir "$WQ"
group P12 "a .worktree.env naming a non-wt_* schema: worktree removed, that schema not dropped"

WM="$(mkwt "$A" gm-m)"; commit_wt "$WM" m.txt; squash_merge "$WM" m.txt; rm -rf "$WM"
WN="$(mkwt "$M" gm-n)"; commit_wt "$WN" n.txt; squash_merge "$WN" n.txt
prune "$M"
check "exit $RC" rc_is 0; check "no 'done' line" said "[prune] done:"
check "gone merged schema left" no_schema "$(sch gm-m)"; check "gone merged branch left" no_branch "feat/$P-gm-m"; check "gone merged metadata kept" unlisted "$WM"
check "later merged worktree left" no_dir "$WN"; check "later merged schema left" no_schema "$(sch gm-n)"
group P13 "N directory deleted, merged: schema dropped, branch deleted, exit 0, later worktrees still handled"

WR="$(mkwt "$M" net-r)"; commit_wt "$WR" r.txt; git -C "$WR" revert --no-edit HEAD >/dev/null
WS="$(mkwt "$A" net-s)"; commit_wt "$WS" s.txt; git -C "$WS" rm -q s.txt; git -C "$WS" commit -q -m "drop s.txt"; rm -rf "$WS"
prune "$M"
check "exit $RC" rc_is 0
check "net-empty dir removed" has_dir "$WR"; check "net-empty schema dropped" has_schema "$(sch net-r)"; check "net-empty branch deleted" has_branch "feat/$P-net-r"
check "no net-empty [keep] line" said "[keep]  feat/$P-net-r  (commits net to no change vs origin/main;"
group P14 "M branch = a commit and its revert, never on origin: kept with directory, schema and branch"
check "gone net-empty schema left" no_schema "$(sch net-s)"; check "gone net-empty branch deleted" has_branch "feat/$P-net-s"; check "gone net-empty metadata kept" unlisted "$WS"
check "no 'kept (commits net to no change' line" said "branch feat/$P-net-s kept (commits net to no change vs origin/main)"
group P15 "N branch = a file added then dropped, directory deleted: schema dropped, branch kept"

# --- isolation ----------------------------------------------------------------------------------------------------
iso=0
if [[ -s "$TMP/denied.log" ]]; then echo "FAIL docker shim denied:"; sed 's/^/       | /' "$TMP/denied.log"; iso=1; fi
LIVE_AFTER="$(pgreal -d level_up_lab -c "SELECT nspname FROM pg_namespace WHERE nspname LIKE 'wt\_%' ORDER BY 1")"
if [[ "$LIVE_BEFORE" != "$LIVE_AFTER" ]]; then echo "FAIL level_up_lab wt_* schemas changed: [$LIVE_BEFORE] → [$LIVE_AFTER]"; iso=1
else echo "ok   level_up_lab wt_* schemas unchanged; no shim denial"; fi

if [[ -n "$FAILED" || $iso -ne 0 ]]; then
  [[ -n "${SMOKE_VERBOSE:-}" ]] && for f in "$TMP"/out.*; do echo "--- $f"; OUT="$f"; show; done
  echo "[prune-smoke] $ok of $n ok, FAIL:${FAILED:- none}$([[ $iso -ne 0 ]] && echo ' + isolation')"; exit 1
fi
echo "[prune-smoke] $ok of $n ok, 0 FAIL"
