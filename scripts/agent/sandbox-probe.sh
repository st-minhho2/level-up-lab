#!/usr/bin/env bash
# Probes S1–S7 of the runner container (B1.58): run inside it, as the user the runs use, from the clone
# (`docker compose -f .devcontainer/runner/docker-compose.yml exec runner scripts/agent/sandbox-probe.sh`). On the host
# every network probe and the binary probe fail, which is the red this card starts from.
#   scripts/agent/sandbox-probe.sh      exit 0 all ok · 1 any FAIL
#   S1 refused: example.com, 1.1.1.1:443, IPv6, the host gateway's Postgres port, a DNS server other than Docker's
#   S2 reachable: GitHub, the npm registry, Anthropic          S3 claude --version is the Dockerfile's pin
#   S4 run.sh --mode is bypassPermissions here, dontAsk when the network looks open or dead (curl shims), as root,
#      or on another OS (id, uname shims)
#   S5 uid node, no sudo, an empty capability bounding set, no-new-privileges; iptables and init-firewall.sh change
#      nothing (the firewall lives in the firewall service; the runner container holds no capability at all)
#   S6 the claude and gh config dirs are mounts, no credential file in the clone      S7 no Postgres host to reach
#   S8 the Prisma engines the image points at (PRISMA_*) are the lockfile's commit and version, read-only (B1.62)
#   S9 the image's Playwright is the lockfile's version, its chromium is under PLAYWRIGHT_BROWSERS_PATH and launches
#   S10 .env.example's DATABASE_URL reaches a UTF8 Postgres that listens on loopback only and runs as node
# A lockfile bump the image does not match never reaches the network (the variables stop Prisma's download,
# Playwright downloads only in `install`): S8/S9 FAIL instead, and the fix is the Dockerfile's ARG and a rebuild.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd -P)"
ROOT="$(cd "$HERE/../.." && pwd -P)"
TMP="$(mktemp -d)"; trap 'rm -rf -- "$TMP"' EXIT
oks=0; fails=0
ok() { echo "ok   $1"; oks=$((oks + 1)); }
fail() { echo "FAIL $1"; fails=$((fails + 1)); }
say() { echo "     $*"; }
reach() { curl -sS -o /dev/null --max-time 5 "$@" </dev/null 2>/dev/null; } # 0 = a connection answered
arg() { sed -n "s/^ARG $1=//p" "$ROOT/.devcontainer/runner/Dockerfile" 2>/dev/null; }
PIN="$(arg CLAUDE_CODE_VERSION)"
LOCK="$ROOT/pnpm-lock.yaml"
# lockv <pkg>: the lockfile's version of <pkg>; each package line appears in packages and snapshots, hence sort -u
lockv() { sed -n "s/^  $1@\([0-9][0-9.]*\):\$/\1/p" "$LOCK" 2>/dev/null | sort -u; }
same() { # same <label> <a> <b>: both non-empty and equal, else say why
  [[ -n "$2" && "$2" == "$3" ]] && return 0
  say "$1: '${2:-none}' vs '${3:-none}'"; return 1
}

open_ok() { # open_ok: the allow list still holds (S1's refusals, S2's reaches)
  local r=0 u
  for u in https://example.com https://1.1.1.1; do reach "$u" && { say "$u reachable"; r=1; }; done
  reach -6 https://www.google.com && { say "IPv6 reachable"; r=1; }
  reach telnet://host.docker.internal:5433 && { say "host.docker.internal:5433 reachable"; r=1; }
  if command -v dig >/dev/null; then
    dig @1.1.1.1 example.com +time=3 +tries=1 >/dev/null 2>&1 && { say "dig @1.1.1.1 answered"; r=1; }
  else say "no dig"; r=1; fi
  return $r
}
allowed_ok() {
  local r=0 u
  for u in https://github.com https://api.github.com https://registry.npmjs.org https://api.anthropic.com https://claude.ai; do
    reach "$u" || { say "$u refused"; r=1; }
  done
  return $r
}

# S1
open_ok && ok S1 || fail S1
# S2
allowed_ok && ok S2 || fail S2
# S3
r=0; v="$(claude --version 2>/dev/null | awk '{print $1; exit}')"
[[ -n "$PIN" && "$v" == "$PIN" ]] || { say "claude --version '${v:-not found}', pin '${PIN:-none}'"; r=1; }
[[ $r -eq 0 ]] && ok S3 || fail S3
# S4
r=0; m="$("$HERE/run.sh" --mode 2>&1)"
[[ "$m" == bypassPermissions ]] || { say "--mode here: '$m'"; r=1; }
mkdir -p "$TMP/open" "$TMP/dead"
printf '#!/bin/sh\nexit 0\n' > "$TMP/open/curl"; printf '#!/bin/sh\nexit 7\n' > "$TMP/dead/curl"
chmod +x "$TMP/open/curl" "$TMP/dead/curl"
for d in open dead; do
  m="$(PATH="$TMP/$d:$PATH" "$HERE/run.sh" --mode 2>&1)"
  [[ "$m" == dontAsk ]] || { say "--mode with every host $d: '$m'"; r=1; }
done
mkdir -p "$TMP/root" "$TMP/darwin"
printf '#!/bin/sh\n[ "$1" = -u ] && { echo 0; exit 0; }\nexec /usr/bin/id "$@"\n' > "$TMP/root/id"
printf '#!/bin/sh\necho Darwin\n' > "$TMP/darwin/uname"
chmod +x "$TMP/root/id" "$TMP/darwin/uname"
for d in root darwin; do
  m="$(PATH="$TMP/$d:$PATH" "$HERE/run.sh" --mode 2>&1)"
  [[ "$m" == dontAsk ]] || { say "--mode with the $d shim: '$m'"; r=1; }
done
[[ $r -eq 0 ]] && ok S4 || fail S4
# S5
r=0
[[ "$(id -un)" == node && "$(id -u)" != 0 ]] || { say "user $(id -un) uid $(id -u)"; r=1; }
command -v sudo >/dev/null && { say "sudo is installed"; r=1; }
cap="$(awk '/^CapBnd:/ {print $2}' /proc/self/status 2>/dev/null)"; nnp="$(awk '/^NoNewPrivs:/ {print $2}' /proc/self/status 2>/dev/null)"
[[ "$cap" =~ ^0+$ && "$nnp" == 1 ]] || { say "CapBnd '${cap:-no /proc}', NoNewPrivs '${nnp:-no /proc}'"; r=1; }
iptables -F >/dev/null 2>&1 && { say "iptables -F succeeded"; r=1; }
if [[ -x /usr/local/bin/init-firewall.sh ]]; then
  /usr/local/bin/init-firewall.sh >/dev/null 2>&1 && { say "init-firewall.sh ran again"; r=1; }
else say "no /usr/local/bin/init-firewall.sh"; r=1; fi
open_ok >/dev/null && allowed_ok >/dev/null || { say "the allow list changed after the attempts"; r=1; }
[[ $r -eq 0 ]] && ok S5 || fail S5
# S6
r=0
for d in "${CLAUDE_CONFIG_DIR:-$HOME/.claude}" "$HOME/.config/gh"; do
  awk -v d="$d" '$5 == d { f = 1 } END { exit !f }' /proc/self/mountinfo 2>/dev/null || { say "$d is not a mount"; r=1; }
done
creds="$(find "$ROOT" -name node_modules -prune -o \( -name .credentials.json -o -name hosts.yml \) -print 2>/dev/null)"
[[ -z "$creds" ]] || { say "credential files in the clone: $creds"; r=1; }
[[ $r -eq 0 ]] && ok S6 || fail S6
# S7
r=0
if command -v getent >/dev/null; then
  for h in postgres level-up-lab-postgres-1; do getent hosts "$h" >/dev/null && { say "$h resolves"; r=1; }; done
else say "no getent"; r=1; fi
[[ $r -eq 0 ]] && ok S7 || fail S7
# S8
r=0
hash="$(grep -oE '@prisma/engines-version@[0-9.]+-[0-9]+\.[0-9a-f]{40}' "$LOCK" 2>/dev/null | sed 's/.*\.//' | sort -u)"
[[ "$hash" =~ ^[0-9a-f]{40}$ ]] || { say "lockfile engines hash: '${hash:-none}'"; r=1; }
lib="${PRISMA_QUERY_ENGINE_LIBRARY:-}"; bin="${PRISMA_SCHEMA_ENGINE_BINARY:-}"
for f in "$lib" "$bin"; do
  if [[ -z "$f" || ! -e "$f" ]]; then say "engine '${f:-PRISMA_* unset}' missing"; r=1
  elif [[ -w "$f" ]]; then say "$f is writable by $(id -un)"; r=1; fi
done
if [[ -e "$bin" && -e "$lib" ]]; then
  same "schema-engine commit" "$("$bin" --version 2>/dev/null | awk '{print $2; exit}')" "$hash" || r=1
  q="$(node -e 'const m = { exports: {} }; process.dlopen(m, process.argv[1]); console.log(m.exports.version().commit)' "$lib" 2>/dev/null)"
  same "query-engine commit" "$q" "$hash" || r=1
  pkg="$(dirname "$(readlink -f "$bin")")/package.json"
  same "@prisma/engines in the image" "$(jq -r .version "$pkg" 2>/dev/null)" "$(lockv prisma)" || r=1
fi
same "ARG PRISMA_VERSION" "$(arg PRISMA_VERSION)" "$(lockv prisma)" || r=1
[[ $r -eq 0 ]] && ok S8 || fail S8
# S9
r=0; pw="$(lockv playwright)"
same "ARG PLAYWRIGHT_VERSION" "$(arg PLAYWRIGHT_VERSION)" "$pw" || r=1
same "playwright --version" "$(playwright --version 2>/dev/null | awk '{print $2; exit}')" "$pw" || r=1
pbp="${PLAYWRIGHT_BROWSERS_PATH:-}"
if [[ -n "$pbp" && -d "$pbp" ]]; then
  locs="$(playwright install --dry-run chromium 2>/dev/null | sed -n 's/^ *Install location: *//p')"
  [[ -n "$locs" ]] || { say "playwright install --dry-run named no location"; r=1; }
  while IFS= read -r l; do
    [[ -z "$l" ]] && continue
    [[ "$l" == "$pbp"/* && -d "$l" ]] || { say "browser '$l' missing or outside $pbp"; r=1; }
  done <<< "$locs"
  launch='require("playwright").chromium.launch().then(async (b) => { await (await b.newPage()).goto("about:blank"); await b.close(); })'
  NODE_PATH="$(npm root -g 2>/dev/null)" timeout 20 node -e "$launch" >/dev/null 2>&1 || { say "headless chromium did not launch in 20 s"; r=1; }
else say "PLAYWRIGHT_BROWSERS_PATH '${pbp:-unset}' is not a directory"; r=1; fi
[[ $r -eq 0 ]] && ok S9 || fail S9
# S10
r=0
url="$(sed -n 's/^DATABASE_URL=//p' "$ROOT/.env.example" 2>/dev/null | tr -d "\"'")"; url="${url%%\?*}" # psql refuses ?schema=
if [[ "$url" =~ ^postgres(ql)?://[^:@/]+(:[^@/]*)?@([^:/]+):([0-9]+)/[^/]+$ ]]; then
  host="${BASH_REMATCH[3]}"; port="${BASH_REMATCH[4]}"
  [[ "$host" == localhost || "$host" == 127.0.0.1 ]] || { say ".env.example host '$host' is not loopback"; r=1; }
  l="$(ss -ltnH "sport = :$port" 2>/dev/null | awk '{print $4}')"
  [[ -n "$l" ]] || { say "nothing listens on :$port"; r=1; }
  while IFS= read -r a; do [[ -z "$a" || "$a" == "127.0.0.1:$port" ]] || { say "listens on $a"; r=1; }; done <<< "$l"
  u="$(ps -o user= -C postgres 2>/dev/null | sort -u)"
  [[ "$u" == node ]] || { say "postgres processes run as '${u:-none}'"; r=1; }
  same "select 1" "$(psql "$url" -Atc 'select 1' 2>/dev/null)" 1 || r=1
  same "database encoding" \
    "$(psql "$url" -Atc 'select pg_encoding_to_char(encoding) from pg_database where datname = current_database()' 2>/dev/null)" UTF8 || r=1
else say ".env.example DATABASE_URL '${url:-none}' is not postgresql://user@host:port/db"; r=1; fi
[[ $r -eq 0 ]] && ok S10 || fail S10

echo
if [[ $fails -eq 0 ]]; then echo "$oks probes OK"; exit 0; fi
echo "$fails of $((oks + fails)) probes FAILED"; exit 1
