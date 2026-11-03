#!/bin/bash
# CMD of the `runner` service (B1.62, docker-compose.yml): a fresh Postgres 17 for this container start, as uid node,
# listening on 127.0.0.1:5433 only, database level_up_lab (what .env.example's DATABASE_URL names; sandbox-probe.sh S10
# compares the two), then the command. Any failure exits non-zero, so the container stops instead of running without
# a database. The `firewall` service overrides this CMD and never starts it.
#   runner-postgres.sh <command…>        (compose: runner's command, `sleep infinity`)
# Superuser with trust auth on loopback: COPY … FROM PROGRAM runs as node inside the firewall, the uid a run already
# has a shell as. Data, socket and log live on the tmpfs, so a stop or restart keeps nothing (B1.62 plan, Costs).
set -euo pipefail
BASE=/home/node/pgdata
BIN=/usr/lib/postgresql/17/bin
PORT=5433

die() { echo "[runner-postgres] $*" >&2; exit 1; }
[[ "$(id -u)" != 0 ]] || die "runs as node, never as root"
[[ $# -gt 0 ]] || die "usage: runner-postgres.sh <command…>"
[[ -d "$BASE" && -w "$BASE" ]] || die "$BASE is not a writable directory (compose tmpfs)"

find "$BASE" -mindepth 1 -delete
mkdir -m 0700 "$BASE/run"
# UTF8 as CI's postgres:17-alpine: under SQL_ASCII a varchar(200) counts bytes (plan review r1 #1)
"$BIN/initdb" -D "$BASE/data" -U postgres --auth=trust -E UTF8 --locale=C.UTF-8 >/dev/null ||
  die "initdb failed"
"$BIN/pg_ctl" -D "$BASE/data" -l "$BASE/postgres.log" -w \
  -o "-c listen_addresses=127.0.0.1 -c port=$PORT -c unix_socket_directories=$BASE/run -c fsync=off" start >/dev/null ||
  die "Postgres did not start ($BASE/postgres.log)"
"$BIN/createdb" -h 127.0.0.1 -p "$PORT" -U postgres level_up_lab || die "createdb level_up_lab failed"
echo "[runner-postgres] Postgres on 127.0.0.1:$PORT, database level_up_lab"

exec "$@"
