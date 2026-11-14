#!/usr/bin/env bash
# Local mutation gate of a card (B1.100). Skeleton: today's rule, Stryker on the whole layer on every call.
#
#   scripts/mutation-gate.sh [--base <ref>] [--force]
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
pnpm test:mutation
