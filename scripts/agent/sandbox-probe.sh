#!/usr/bin/env bash
# Probes S1–S7 of the runner container (B1.58): run inside it, as the user the runs use, from the clone
# (`docker compose -f .devcontainer/runner/docker-compose.yml exec runner scripts/agent/sandbox-probe.sh`). On the host
# every network probe and the binary probe fail, which is the red this card starts from.
#   scripts/agent/sandbox-probe.sh      exit 0 all ok · 1 any FAIL
#   S1 refused: example.com, 1.1.1.1:443, IPv6, the host gateway's Postgres port, a DNS server other than Docker's
#   S2 reachable: GitHub, the npm registry, Anthropic          S3 claude --version is the Dockerfile's pin
#   S4 run.sh --mode is bypassPermissions here, dontAsk when the network looks open or dead (curl shims)
#   S5 uid node, no sudo, an empty capability bounding set; iptables and init-firewall.sh change nothing
#   S6 the claude and gh config dirs are mounts, no credential file in the clone      S7 no Postgres host to reach
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd -P)"
ROOT="$(cd "$HERE/../.." && pwd -P)"
TMP="$(mktemp -d)"; trap 'rm -rf -- "$TMP"' EXIT
oks=0; fails=0
ok() { echo "ok   $1"; oks=$((oks + 1)); }
fail() { echo "FAIL $1"; fails=$((fails + 1)); }
say() { echo "     $*"; }
reach() { curl -sS -o /dev/null --max-time 5 "$@" </dev/null 2>/dev/null; } # 0 = a connection answered
PIN="$(sed -n 's/^ARG CLAUDE_CODE_VERSION=//p' "$ROOT/.devcontainer/runner/Dockerfile" 2>/dev/null)"

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
[[ $r -eq 0 ]] && ok S4 || fail S4
# S5
r=0
[[ "$(id -un)" == node && "$(id -u)" != 0 ]] || { say "user $(id -un) uid $(id -u)"; r=1; }
command -v sudo >/dev/null && { say "sudo is installed"; r=1; }
cap="$(awk '/^CapBnd:/ {print $2}' /proc/self/status 2>/dev/null)"
[[ "$cap" =~ ^0+$ ]] || { say "CapBnd '${cap:-no /proc}'"; r=1; }
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

echo
if [[ $fails -eq 0 ]]; then echo "$oks probes OK"; exit 0; fi
echo "$fails of $((oks + fails)) probes FAILED"; exit 1
