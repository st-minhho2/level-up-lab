#!/usr/bin/env bash
# Smoke for docker-compose.yml (B1.15): a checkout in any layout reaches the one compose project `level-up-lab`,
# and the advised `docker compose up -d` creates nothing new. Read-only against the live server: only `config`, `ps`
# and `--dry-run up -d` reach docker. Exit 1 on any FAIL. bash 3.2-safe.
#   scripts/compose-smoke.sh [<compose-file>]   default docker-compose.yml; needs level-up-lab-postgres-1 running
#
# The file and .devcontainer/docker-compose.yml are copied into a throwaway tree. The project name depends only on
# the file and its folder, so each copy stands for a checkout in that layout:
#   C1 main level-up-lab/   C2 M level-up-lab/.worktrees/s   C3 A level-up-lab/.claude/worktrees/app   C4 N A/.worktrees/s
#      each: `docker compose ps -q postgres` = the id of level-up-lab-postgres-1, `--dry-run up -d` shows it Running
#      and prints no Creat/Recreat line
#   C5 the devcontainer overlay (base + .devcontainer file) from N: level-up-lab-postgres-1 Running or Healthy, no
#      postgres-1 or pgdata line created or recreated (the overlay's own app-1 and pnpm-store are, by design)
#   C6 `docker volume ls`, `network ls`, `ps -aq` equal before and after; no shim denial
#
# Isolation: no .env in the copies; POSTGRES_PORT, COMPOSE_PROJECT_NAME and COMPOSE_FILE unset. The probed calls go
# through a docker shim that forwards only `compose -f <tmp>/… [-f <tmp>/…]` followed by `ps -q postgres` or
# `--dry-run up -d`; anything else exits 99 and fails the run. The smoke's own reads use the real docker.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

FILE_ARG="${1:-docker-compose.yml}"
[[ -f "$FILE_ARG" ]] || { echo "[compose-smoke] no such file: $FILE_ARG" >&2; exit 1; }
DEVC=".devcontainer/docker-compose.yml"
[[ -f "$DEVC" ]] || { echo "[compose-smoke] no $DEVC" >&2; exit 1; }
REAL_DOCKER="$(command -v docker)" || { echo "[compose-smoke] docker not found" >&2; exit 1; }
unset POSTGRES_PORT COMPOSE_PROJECT_NAME COMPOSE_FILE
LIVE="level-up-lab-postgres-1"
LIVE_ID="$("$REAL_DOCKER" inspect -f '{{if .State.Running}}{{.Id}}{{end}}' "$LIVE" 2>/dev/null </dev/null)"
[[ -n "$LIVE_ID" ]] || { echo "[compose-smoke] $LIVE not running (docker compose up -d in the main checkout)" >&2; exit 1; }

TMP="$(cd "$(mktemp -d)" && pwd -P)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT
snapshot() { "$REAL_DOCKER" volume ls -q; "$REAL_DOCKER" network ls -q; "$REAL_DOCKER" ps -aq; }
BEFORE="$(snapshot </dev/null)"

# --- shim ---------------------------------------------------------------------------------------------------------
mkdir -p "$TMP/bin"
cat > "$TMP/bin/docker" <<SHIM
#!/bin/bash
real='$REAL_DOCKER'; root='$TMP'
deny() { echo "DENIED: \$*" >> "\$root/denied.log"; echo "docker shim: denied" >&2; exit 99; }
orig=("\$@")
[ "\${1:-}" = compose ] || deny "\$@"
shift; n=0
while [ "\${1:-}" = -f ]; do
  case "\${2:-}" in "\$root"/*/docker-compose.yml) ;; *) deny "\${orig[@]}" ;; esac
  n=\$((n + 1)); shift 2
done
[ \$n -ge 1 ] || deny "\${orig[@]}"
case "\$*" in
  "ps -q postgres"|"--dry-run up -d") ;;
  *) deny "\${orig[@]}" ;;
esac
exec "\$real" "\${orig[@]}"
SHIM
chmod +x "$TMP/bin/docker"

# --- layouts ------------------------------------------------------------------------------------------------------
R="$TMP/level-up-lab"; A="$R/.claude/worktrees/app"
lay() { mkdir -p "$1/.devcontainer"; cp "$FILE_ARG" "$1/docker-compose.yml"; cp "$DEVC" "$1/.devcontainer/docker-compose.yml"; }
for d in "$R" "$R/.worktrees/s" "$A" "$A/.worktrees/s"; do lay "$d"; done

probe() { # probe <dir> [overlay]: sets PSQ and DRY
  local f=(-f "$1/docker-compose.yml")
  [[ "${2:-}" == overlay ]] && f+=(-f "$1/.devcontainer/docker-compose.yml")
  PSQ="$("$TMP/bin/docker" compose "${f[@]}" ps -q postgres 2>/dev/null </dev/null)"
  DRY="$("$TMP/bin/docker" compose "${f[@]}" --dry-run up -d 2>&1 </dev/null)"
}
shows() { printf '%s\n' "$DRY" | grep -qE "$1"; }
creates() { printf '%s\n' "$DRY" | grep -E "${1:-.}" | grep -qE 'Creat|Recreat'; }

n=0; ok=0; FAILED=""; ERR=""
check() { "${@:2}" || ERR="$ERR; $1"; }
group() { # group <id> <title>: report the checks since the last group
  n=$((n + 1))
  if [[ -z "$ERR" ]]; then ok=$((ok + 1)); printf 'ok   %s %s\n' "$1" "$2"
  else FAILED="$FAILED $1"; printf 'FAIL %s %s:%s\n' "$1" "$2" "${ERR#;}"; fi
  ERR=""
}
same() { [[ "$1" == "$2" ]]; }
nope() { ! "$@"; }

# --- probes -------------------------------------------------------------------------------------------------------
layout() { # layout <id> <dir> <name>
  probe "$2"
  check "ps -q postgres is not $LIVE" same "$PSQ" "$LIVE_ID"
  check "dry-run does not show $LIVE Running" shows "$LIVE +Running"
  check "dry-run creates or recreates" nope creates
  group "$1" "$3: reaches $LIVE, up -d creates nothing"
}
layout C1 "$R" "main checkout"
layout C2 "$R/.worktrees/s" "M worktree"
layout C3 "$A" "A app checkout"
layout C4 "$A/.worktrees/s" "N worktree"

probe "$A/.worktrees/s" overlay
check "dry-run does not show $LIVE Running or Healthy" shows "$LIVE +(Running|Healthy)"
check "dry-run creates or recreates postgres or pgdata" nope creates 'postgres-1|pgdata'
group C5 "devcontainer overlay from N: shares $LIVE, no postgres or pgdata created"

check "docker volumes, networks or containers changed" same "$BEFORE" "$(snapshot </dev/null)"
check "shim denied a call" nope test -s "$TMP/denied.log"
group C6 "nothing created; no shim denial"

if [[ -n "$FAILED" ]]; then
  if [[ -n "${SMOKE_VERBOSE:-}" && -s "$TMP/denied.log" ]]; then sed 's/^/       | /' "$TMP/denied.log"; fi
  echo "[compose-smoke] $ok of $n ok, FAIL:$FAILED"; exit 1
fi
echo "[compose-smoke] $ok of $n ok, 0 FAIL"
