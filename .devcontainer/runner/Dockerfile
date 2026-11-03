# The runner's sandbox (B1.58): one image for both services of docker-compose.yml next to this file (its header has
# the lead's commands): `firewall` runs init-firewall.sh as root; `runner`, as node with no capability, runs dev-lead
# headless under bypassPermissions in the namespace that firewall locked down.
# B1.62: the image also carries what a full card run would fetch from hosts the allow list refuses: the Prisma engines,
# Playwright's chromium, and a Postgres for worktree.sh's migrations and pnpm test:e2e. They are fetched here, at build
# time on the host's network; at run time nothing new is allowed.
# Node 24.22.1 is a security release; the digest pins the image the lead approved (plan decision 2).
FROM node:24.22.1-bookworm@sha256:d862bb5d082c5ae0210ac07e8c0344cb8cf7bef6d78e9b8c50c179da923108ea

# The Linux build: the npm package's linux-arm64 / linux-x64 optional dependency. sandbox-probe.sh S3 reads this line.
ARG CLAUDE_CODE_VERSION=2.1.303
# pnpm-lock.yaml's prisma and playwright. sandbox-probe.sh S8/S9 read these lines and FAIL once the lockfile moves on
# without them: a bump never reaches the network, it needs these ARGs and a rebuild.
ARG PRISMA_VERSION=6.19.3
ARG PLAYWRIGHT_VERSION=1.64.1

# No sudo: root runs only in the firewall service (plan review r2 #1).
RUN apt-get update \
  && apt-get install -y --no-install-recommends iptables ipset iproute2 dnsutils aggregate jq gh \
  && rm -rf /var/lib/apt/lists/*

# Postgres 17 (CI's major) from PGDG, trusted only if the key file holds exactly the published PGDG key; no cluster at
# install: runner-postgres.sh makes a fresh one at every start.
RUN install -d /usr/share/postgresql-common/pgdg \
  && key=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
  && curl -fsSL -o "$key" https://www.postgresql.org/media/keys/ACCC4CF8.asc \
  && [ "$(gpg --show-keys --with-colons "$key" | grep -c '^pub:')" = 1 ] \
  && gpg --show-keys --with-colons "$key" | awk -F: '$1 == "fpr" { print $10; exit }' \
    | grep -qx B97B0AFCAA1A47F044F244A07FCC7D46ACCC4CF8 \
  && echo "deb [signed-by=$key] https://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends postgresql-common \
  && sed -i 's/^#* *create_main_cluster *=.*/create_main_cluster = false/' /etc/postgresql-common/createcluster.conf \
  && grep -qx 'create_main_cluster = false' /etc/postgresql-common/createcluster.conf \
  && apt-get install -y --no-install-recommends postgresql-17 \
  && rm -rf /var/lib/apt/lists/*

# Root-owned in /usr/local, so a run (uid node) can neither replace the binary nor update it (updater off as well).
RUN npm install -g "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}" && npm cache clean --force && corepack enable

# The engines of the lockfile's Prisma, from @prisma/engines' own postinstall (before the PRISMA_* variables exist, or
# it would skip the download). Exactly one engine of each kind for this architecture, or the build stops.
RUN npm install --prefix /opt/prisma-engines --no-fund --no-audit "@prisma/engines@${PRISMA_VERSION}" \
  && d=/opt/prisma-engines/node_modules/@prisma/engines \
  && set -- "$d"/libquery_engine-*.so.node && [ $# -eq 1 ] && [ -f "$1" ] \
  && ln -s "$1" /opt/prisma-engines/libquery_engine.so.node \
  && set -- "$d"/schema-engine-* && [ $# -eq 1 ] && [ -f "$1" ] \
  && ln -s "$1" /opt/prisma-engines/schema-engine \
  && npm cache clean --force
# With these set, prisma uses the files and never downloads (S8 checks they are the lockfile's commit).
ENV PRISMA_QUERY_ENGINE_LIBRARY=/opt/prisma-engines/libquery_engine.so.node \
  PRISMA_SCHEMA_ENGINE_BINARY=/opt/prisma-engines/schema-engine \
  CHECKPOINT_DISABLE=1 \
  PRISMA_HIDE_UPDATE_MESSAGE=1 \
  NEXT_TELEMETRY_DISABLED=1

# Chromium and its system libraries as CI installs them (ci.yml); the global playwright lets S9 check without a worktree.
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers
RUN npm install -g "playwright@${PLAYWRIGHT_VERSION}" \
  && playwright install --with-deps chromium \
  && chmod -R a+rX "$PLAYWRIGHT_BROWSERS_PATH" \
  && npm cache clean --force \
  && rm -rf /var/lib/apt/lists/*

COPY init-firewall.sh runner-postgres.sh /usr/local/bin/

# /etc/level-up-lab-runner is the marker run.sh's sandboxed() needs; the folders are the volumes' mount points, owned by
# node so a new named volume starts writable for node (pgdata: runner-postgres.sh's tmpfs). No credential is ever
# written at build time.
RUN chmod 0755 /usr/local/bin/init-firewall.sh /usr/local/bin/runner-postgres.sh \
  && echo "level-up-lab runner (B1.58)" > /etc/level-up-lab-runner \
  && mkdir -p /home/node/level-up-lab /home/node/.claude /home/node/.config/gh /home/node/.level-up-lab \
    /home/node/.local/share/pnpm/store /home/node/pgdata \
  && chown -R node:node /home/node

# GitHub's credential helper at system scope (B1.76): scripts/pr-step.sh clears every GIT_CONFIG_* variable, so the
# runner-runs file GIT_CONFIG_GLOBAL names is invisible to its push; /etc/gitconfig is root's, read-only to a run. The
# helper only asks gh, whose login stays in the runner-gh volume; nothing secret is written here.
RUN test -x /usr/bin/gh \
  && git config --system 'credential.https://github.com.helper' '!/usr/bin/gh auth git-credential' \
  && [ "$(git config --system --get 'credential.https://github.com.helper')" = '!/usr/bin/gh auth git-credential' ]

USER node
# `firewall` overrides this with its own entrypoint and command; only `runner` starts Postgres.
CMD ["/usr/local/bin/runner-postgres.sh", "sleep", "infinity"]
