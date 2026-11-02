# The runner's sandbox (B1.58): one image for both services of docker-compose.yml next to this file (its header has
# the lead's commands): `firewall` runs init-firewall.sh as root; `runner`, as node with no capability, runs dev-lead
# headless under bypassPermissions in the namespace that firewall locked down.
# Node 24.22.1 is a security release; the digest pins the image the lead approved (plan decision 2).
FROM node:24.22.1-bookworm@sha256:d862bb5d082c5ae0210ac07e8c0344cb8cf7bef6d78e9b8c50c179da923108ea

# The Linux build: the npm package's linux-arm64 / linux-x64 optional dependency. sandbox-probe.sh S3 reads this line.
ARG CLAUDE_CODE_VERSION=2.1.303

# No sudo: root runs only in the firewall service (plan review r2 #1).
RUN apt-get update \
  && apt-get install -y --no-install-recommends iptables ipset iproute2 dnsutils aggregate jq gh \
  && rm -rf /var/lib/apt/lists/*

# Root-owned in /usr/local, so a run (uid node) can neither replace the binary nor update it (updater off as well).
RUN npm install -g "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}" && npm cache clean --force && corepack enable

COPY init-firewall.sh /usr/local/bin/init-firewall.sh

# /etc/level-up-lab-runner is the marker run.sh's sandboxed() needs; the folders are the volumes' mount points, owned by
# node so a new named volume starts writable for node. No credential is ever written at build time.
RUN chmod 0755 /usr/local/bin/init-firewall.sh \
  && echo "level-up-lab runner (B1.58)" > /etc/level-up-lab-runner \
  && mkdir -p /home/node/level-up-lab /home/node/.claude /home/node/.config/gh /home/node/.level-up-lab \
    /home/node/.local/share/pnpm/store \
  && chown -R node:node /home/node

USER node
CMD ["sleep", "infinity"]
