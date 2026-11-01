#!/usr/bin/env bash
# PreToolUse hook for Bash. Exit 2 + reason on stderr blocks the command and shows the agent why.
# Blocks: rm -rf in any flag spelling, force pushes, destructive Prisma commands, Prisma migrations against a
# non-local DATABASE_URL, reads of .env*/keys/credentials, printing secret-looking variables or the whole env.
set -uo pipefail
. "$(dirname "$0")/lib.sh"
CMD="$(json_field tool_input.command)"
[[ -z "$CMD" ]] && exit 0
ME="guard-bash.sh"

# 1. rm with recursive AND force, per command segment (split on ; & | and newlines), flags in any order/spelling.
RM_HEAD='^(sudo[[:space:]]+)?rm([[:space:]]|$)'
while IFS= read -r segment; do
  segment="${segment#"${segment%%[![:space:]]*}"}"
  [[ "$segment" =~ $RM_HEAD ]] || continue
  recursive=0; force=0
  for token in $segment; do
    case "$token" in
      --recursive) recursive=1 ;;
      --force) force=1 ;;
      --*) ;;
      -*) [[ "$token" == *[rR]* ]] && recursive=1; [[ "$token" == *f* ]] && force=1 ;;
    esac
  done
  [[ $recursive -eq 1 && $force -eq 1 ]] && block "$ME" "rm -rf is not allowed. Delete named files, or ask the human to remove the directory."
done < <(printf '%s\n' "$CMD" | tr ';&|' '\n\n\n')

# 2. git push --force / -f / --force-with-lease / +refspec
FORCE_PUSH='git[[:space:]]+push([[:space:]]+[^;&|]*)?([[:space:]]-[a-zA-Z]*f|[[:space:]]--force|[[:space:]]\+[A-Za-z])'
[[ "$CMD" =~ $FORCE_PUSH ]] && block "$ME" "force pushes are not allowed from an agent session."

# 3. Prisma: destructive subcommands never; migrate/db subcommands only against a local host.
PRISMA_DESTRUCTIVE='prisma[[:space:]]+(migrate[[:space:]]+reset|db[[:space:]]+push|db[[:space:]]+execute)'
[[ "$CMD" =~ $PRISMA_DESTRUCTIVE ]] && block "$ME" "prisma migrate reset / db push / db execute are not allowed (data loss, schema drift). Use pnpm db:migrate --name <change> locally."

LOCAL_HOST='^(localhost|127\.0\.0\.1|\[::1\]|postgres)$'
url_host() { local u="${1#*://}"; u="${u#*@}"; u="${u%%/*}"; u="${u%%\?*}"; u="${u%%:*}"; printf '%s' "$u"; }
inline_url() { printf '%s' "$CMD" | sed -nE "s/.*DATABASE_URL=[\"']?([^\"' ;&|]+).*/\1/p" | head -1; }
PRISMA_MIGRATE='prisma[[:space:]]+(migrate|db)[[:space:]]|pnpm[[:space:]]+db:(migrate|deploy|seed)'
if [[ "$CMD" =~ $PRISMA_MIGRATE ]]; then
  url="$(inline_url)"
  [[ -z "$url" ]] && url="${DATABASE_URL:-}"
  if [[ -z "$url" && -f "${CLAUDE_PROJECT_DIR:-$PWD}/.env" ]]; then
    url="$(sed -nE "s/^DATABASE_URL=[\"']?([^\"']*).*/\1/p" "${CLAUDE_PROJECT_DIR:-$PWD}/.env" | head -1)"
  fi
  if [[ -n "$url" ]]; then
    host="$(url_host "$url")"
    [[ "$host" =~ $LOCAL_HOST ]] || block "$ME" "Prisma migration against non-local host '$host' is not allowed (localhost / 127.0.0.1 / postgres only)."
  fi
fi
INLINE_DB="DATABASE_URL=[\"']?[a-z]+://"
if [[ "$CMD" =~ $INLINE_DB ]]; then
  host="$(url_host "$(inline_url)")"
  [[ "$host" =~ $LOCAL_HOST ]] || block "$ME" "non-local DATABASE_URL host '$host' is not allowed in agent commands."
fi

# 4. Secret reads: .env* (except .env.example), key material, cloud/registry credentials.
SECRET_PATH='(^|[[:space:]/=])\.env([.][A-Za-z0-9_-]+)?([[:space:]]|$|[;&|)])|id_rsa|id_ed25519|id_ecdsa|\.pem([[:space:]]|$)|\.p12([[:space:]]|$)|\.key([[:space:]]|$)|~/\.aws|\.aws/credentials|~/\.ssh|\.ssh/|\.netrc|\.npmrc|\.docker/config\.json|\.kube/config'
READER='(^|[[:space:];&|(])(cat|less|more|head|tail|bat|grep|rg|sed|awk|cut|sort|strings|xxd|hexdump|base64|open|code|vim|vi|nano|source|\.|tee|cp|scp|rsync|curl|wget|python3?|node|ruby|perl)[[:space:]]'
ENV_EXAMPLE='\.env\.example'
if [[ "$CMD" =~ $SECRET_PATH && "$CMD" =~ $READER && ! "$CMD" =~ $ENV_EXAMPLE ]]; then
  block "$ME" "reading secret files (.env*, keys, credentials) is not allowed. Read .env.example or ask the human for the one non-secret value you need."
fi
SECRET_VAR='(echo|printf|printenv|env|export[[:space:]]+-p)[^;&|]*(\$\{?|[^A-Z_])(DATABASE_URL|[A-Z_]*(SECRET|TOKEN|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY)[A-Z_]*)'
[[ "$CMD" =~ $SECRET_VAR ]] && block "$ME" "printing secret-looking variables is not allowed."
ENV_DUMP='(^|[[:space:];&|])(printenv|env)([[:space:]]*$|[[:space:]]*[|;&>])'
[[ "$CMD" =~ $ENV_DUMP ]] && block "$ME" "dumping the environment is not allowed (it contains DATABASE_URL and tokens)."

# 5. scripts/pr-step.sh (B1.23): settings.json runs it without asking, so the shell must not change what it does. Any
#    segment that invokes it (after VAR= prefixes, sh/bash/exec/env/command) makes the whole command subject to: one
#    plain call `scripts/pr-step.sh …` with no $, backtick, <, >, ;, &, |, backslash or newline; cwd the top level of
#    its checkout; the wrapper tracked and unmodified there.
PR_STEP_MSG="scripts/pr-step.sh runs only as one plain call from the top level of a checkout whose wrapper is committed and unmodified (no redirects, substitutions, prefixes or other commands)."
invokes_pr_step=0
while IFS= read -r segment; do
  set -f; set -- $segment; set +f
  while [[ $# -gt 0 && ( "$1" =~ ^[A-Za-z_][A-Za-z0-9_]*= || "$1" =~ ^(sh|bash|zsh|dash|exec|env|command|nohup|time|source|\.)$ ) ]]; do shift; done
  [[ $# -gt 0 && "$1" == *pr-step.sh ]] && invokes_pr_step=1
done < <(printf '%s\n' "$CMD" | tr ';&|(`' '\n\n\n\n\n') # `$(` splits at its `(`
if [[ $invokes_pr_step -eq 1 ]]; then
  PR_STEP_PLAIN='^scripts/pr-step\.sh( [^$`<>;&|\\]*)?$'
  [[ "$CMD" != *$'\n'* && "$CMD" =~ $PR_STEP_PLAIN ]] || block "$ME" "$PR_STEP_MSG"
  cwd="$(json_field cwd)"
  [[ -n "$cwd" && -d "$cwd" ]] || block "$ME" "$PR_STEP_MSG"
  top="$(git -C "$cwd" rev-parse --show-toplevel 2>/dev/null)" || block "$ME" "$PR_STEP_MSG"
  [[ "$(cd -P "$cwd" && pwd -P)" == "$(cd -P "$top" && pwd -P)" ]] || block "$ME" "$PR_STEP_MSG"
  git -C "$top" ls-files --error-unmatch scripts/pr-step.sh >/dev/null 2>&1 || block "$ME" "$PR_STEP_MSG"
  git -C "$top" diff --quiet HEAD -- scripts/pr-step.sh 2>/dev/null || block "$ME" "$PR_STEP_MSG"
fi

exit 0
