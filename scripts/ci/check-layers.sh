#!/usr/bin/env bash
# Fail when an import breaks the layering of CLAUDE.md "Architecture in one pass" (B1.46). Two cruises:
# .dependency-cruiser.mjs judges every direct import; .dependency-cruiser-client.mjs, which does not follow src/actions
# (a Server Action is a network call for its caller), judges what a component reaches through src/lib. Both always run,
# so one report names every violation.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
rc=0
pnpm exec depcruise src --config .dependency-cruiser.mjs || rc=1
pnpm exec depcruise src --config .dependency-cruiser-client.mjs || rc=1
exit "$rc"
