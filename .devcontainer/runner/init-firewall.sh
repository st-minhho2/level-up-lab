#!/bin/bash
# Entrypoint of the `firewall` service (B1.58, docker-compose.yml): as root with NET_ADMIN and NET_RAW only, allow
# outbound traffic of the shared network namespace only to GitHub, the npm registry and Anthropic, prove it both ways,
# mark the service ready, then run the command. Any failure exits non-zero, so `runner` (which joins this namespace with
# no capability) never starts without the firewall. Run by node inside `runner` it fails at the first check.
#   init-firewall.sh <command…>        (compose: entrypoint, command `sleep infinity`)
# Allowed: GitHub's web, api and git ranges (api.github.com/meta), the A records of DOMAINS at start, loopback (Docker's
# DNS is 127.0.0.11 on lo, so no other name server is reachable). Everything else is REJECTed; IPv6 is off and DROPped.
# Limits: IPs are resolved once, so a rotated CDN address is refused until a restart; a CDN address also serves other
# sites behind the same edge.
set -euo pipefail
DOMAINS=(registry.npmjs.org api.anthropic.com claude.ai platform.claude.com console.anthropic.com)
SET=runner-allowed

die() { echo "[init-firewall] $*" >&2; exit 1; }
[[ "$(id -u)" == 0 ]] || die "needs root: only the container's entrypoint runs it"
READY=/run/level-up-lab-firewall-ready
rm -f "$READY" # a restart reuses the container but not its network namespace: not ready until checked again
[[ $# -gt 0 ]] || die "usage: init-firewall.sh <command…>"
[[ "$(cat /proc/sys/net/ipv6/conf/all/disable_ipv6 2>/dev/null)" == 1 ]] || die "IPv6 is not disabled (compose sysctls)"

# Resolve everything first, while the network is still open; runner waits for the ready mark, so nothing else runs
# in this namespace yet.
meta="$(curl -fsS --max-time 20 https://api.github.com/meta)" || die "cannot read api.github.com/meta"
github="$(jq -r '(.web + .api + .git)[]' <<< "$meta" | grep -E '^[0-9.]+/[0-9]+$' | aggregate -q)"
[[ -n "$github" ]] || die "no IPv4 ranges in api.github.com/meta"
addrs=""
for d in "${DOMAINS[@]}"; do
  a="$(dig +short A "$d" | grep -E '^[0-9]+(\.[0-9]+){3}$')" || die "no A record for $d"
  addrs="$addrs $a"
done

ipset destroy "$SET" 2>/dev/null || true
ipset create "$SET" hash:net
for n in $github $addrs; do ipset add "$SET" "$n" -exist; done

# Only the filter table: Docker's DNS NAT rules for 127.0.0.11 live in the nat table and stay.
iptables -F
iptables -X
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m set --match-set "$SET" dst -j ACCEPT
iptables -A OUTPUT -j REJECT --reject-with icmp-admin-prohibited
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP
ip6tables -P INPUT DROP 2>/dev/null || true # IPv6 is already off (checked above); DROP where ip6tables works
ip6tables -P FORWARD DROP 2>/dev/null || true
ip6tables -P OUTPUT DROP 2>/dev/null || true

# Both ways, or no container.
if curl -sS -o /dev/null --max-time 5 https://example.com 2>/dev/null; then die "example.com is reachable"; fi
curl -sS -o /dev/null --max-time 10 https://api.github.com || die "api.github.com is refused"
echo "[init-firewall] allow list applied: $(ipset list "$SET" | grep -cE '^[0-9]') entries"

touch "$READY" # the healthcheck runner waits for
exec "$@"
