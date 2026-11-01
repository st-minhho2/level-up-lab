#!/usr/bin/env bash
# PreToolUse hook for Bash. Exit 2 + reason on stderr blocks the command and shows the agent why.
# Blocks: rm -rf in any flag spelling, force pushes and remote branch deletes, destructive Prisma commands, Prisma
# migrations against a non-local DATABASE_URL, reads of .env*/keys/credentials, printing secret-looking variables or
# the whole env.
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

# 2. Anything that overwrites or deletes a remote branch (B1.24), per command segment after joining `\`-newline
#    continuations. In a command that names git anywhere (quoted, escaped, in $( ) or backticks, as a path, or as the
#    git-push binary; anywhere, because the split ignores quotes and $( )), the words after a segment's first push or
#    send-pack word block on: -f or -d in a short-option cluster, --force*, --mirror, --delete, --prune (and any prefix
#    git accepts for them, `--mir`), a refspec starting with + or : (`+@:x`, `+$BR`, `:feat/x`), each optionally behind
#    quotes, \ or $ (`'+main'`, `$'+main'`), any { (brace lists, ${X:-…}, also "${BRANCH}") and any $'…\…' escape.
#    Git options before push are not parsed, so none hides it. Saved config counts, any case: git config, remote, clone
#    or -c (or a GIT_CONFIG_* variable anywhere in the command) that sets a mirror (`--mirr=push` too) or a +/: push
#    refspec, unless the segment only reads or unsets (--get, --unset, --list, -l) and holds no push word and no -c. So
#    does gh: api with a DELETE/PATCH method or force=true on git/refs, deleteRef, updateRef, a branch rename; repo sync
#    --force; pr close or merge with --delete-branch. Out of reach of a text check: a flag or refspec held in a
#    variable, an alias, a word quoted in pieces, a command built at run time, git config files written directly, other
#    HTTP clients (curl) calling the GitHub API.
W='(^|[[:space:]"'"'"'(`/=\\])'
E='(["'"'"'[:space:]`)]|$)'
GIT_WORD="${W}git(${E}|-push|-send-pack)"
PUSH_TAIL="${W}(git-push|git-send-pack|push|send-pack)(${E}.*)$"
PUSH_FORCE='[[:space:]]["'"'"'\\$]*(-[A-Za-z0-9]*[fd]|--(fo?r?c?e?|mi?r?r?o?r?|de?l?e?t?e?|pr?u?n?e?)([^A-Za-z]|$)|[+:])|\{|\$'"'"'[^'"'"']*\\'
CONFIG_ROUTE="${W}(config|remote|clone|-c)${E}"
CONFIG_READ='[[:space:]]config[[:space:]]+(--get|--unset|--list|-l)'
CONFIG_WRITE_WORD="${W}(push|send-pack|-c)${E}"
CONFIG_FORCE='mirror|--mi?r?r?o?r?([^a-z]|$)|\.push["'"'"']?([[:space:]]+|=)["'"'"'\\$]*[+:]'
GH_API="${W}gh[[:space:]]+api[[:space:]]"
GH_WRITE_METHOD='(-x|--method)[[:space:]=]*["'"'"']?(delete|patch)|force[[:space:]]*[=:][[:space:]]*true'
GH_REF_EDIT='deleteref|updateref|branches/[^[:space:]]+/rename'
GH_BRANCH_DELETE="${W}gh[[:space:]]+(repo[[:space:]]+sync.*--force|pr[[:space:]]+(close|merge)[[:space:]].*[[:space:]](-d|--delete-branch)([[:space:]=]|$))"
FORCE_MSG="force pushes and remote branch deletes are not allowed from an agent session."
joined="${CMD//\\$'\n'/}"
low="$(printf '%s' "$joined" | tr '[:upper:]' '[:lower:]')"
if [[ "$low" =~ git_config_ ]]; then # key and value are separate variables (GIT_CONFIG_KEY_0, GIT_CONFIG_VALUE_0)
  [[ "$low" =~ mirror || ( "$low" =~ \.push && "$low" =~ =[\"\'\\$]*[+:] ) ]] && block "$ME" "$FORCE_MSG"
fi
names_git=0; [[ "$joined" =~ $GIT_WORD ]] && names_git=1
while IFS= read -r segment; do
  low="$(printf '%s' "$segment" | tr '[:upper:]' '[:lower:]')"
  if [[ "$low" =~ $GH_API ]]; then
    [[ ( "$low" =~ git/refs && "$low" =~ $GH_WRITE_METHOD ) || "$low" =~ $GH_REF_EDIT ]] && block "$ME" "$FORCE_MSG"
  fi
  [[ "$low" =~ $GH_BRANCH_DELETE ]] && block "$ME" "$FORCE_MSG"
  [[ $names_git -eq 1 ]] || continue
  [[ "$segment" =~ $PUSH_TAIL && "${BASH_REMATCH[3]}" =~ $PUSH_FORCE ]] && block "$ME" "$FORCE_MSG"
  if [[ "$low" =~ $CONFIG_ROUTE && "$low" =~ $CONFIG_FORCE ]]; then
    [[ "$low" =~ $CONFIG_READ && ! "$low" =~ $CONFIG_WRITE_WORD ]] || block "$ME" "$FORCE_MSG"
  fi
done < <(printf '%s\n' "$joined" | tr ';&|' '\n\n\n')

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
#    call `scripts/pr-step.sh` whose arguments are plain words or quoted strings (no $, backtick, backslash or ! in
#    double quotes, no newline); cwd the top level of its checkout; the wrapper tracked and unmodified there and
#    byte-identical to the one in the checkout these hooks load from.
PR_STEP_MSG="scripts/pr-step.sh runs only as one call with plain-word or quoted arguments (no redirects, substitutions, prefixes or other commands), from the top level of a checkout whose wrapper is committed, unmodified and the same as the hooks' own."
invokes_pr_step=0
while IFS= read -r segment; do
  set -f; set -- $segment; set +f
  while [[ $# -gt 0 && ( "$1" =~ ^[A-Za-z_][A-Za-z0-9_]*= || "$1" =~ ^(sh|bash|zsh|dash|exec|env|command|nohup|time|source|\.)$ ) ]]; do shift; done
  [[ $# -gt 0 && "$1" == *pr-step.sh ]] && invokes_pr_step=1
done < <(printf '%s\n' "$CMD" | tr ';&|(`' '\n\n\n\n\n') # `$(` splits at its `(`
if [[ $invokes_pr_step -eq 1 ]]; then
  # Each argument a plain word or a quoted string: the session's shell may be zsh, where unquoted =( ), *(e:…:) and
  # similar run code before the wrapper starts.
  PR_STEP_PLAIN='^scripts/pr-step\.sh( ([A-Za-z0-9._-]+|'"'"'[^'"'"']*'"'"'|"[^"$`\\!]*"))*$'
  [[ "$CMD" != *$'\n'* && "$CMD" =~ $PR_STEP_PLAIN ]] || block "$ME" "$PR_STEP_MSG"
  cwd="$(json_field cwd)"
  [[ -n "$cwd" && -d "$cwd" ]] || block "$ME" "$PR_STEP_MSG"
  top="$(git -C "$cwd" rev-parse --show-toplevel 2>/dev/null)" || block "$ME" "$PR_STEP_MSG"
  [[ "$(cd -P "$cwd" && pwd -P)" == "$(cd -P "$top" && pwd -P)" ]] || block "$ME" "$PR_STEP_MSG"
  git -C "$top" ls-files --error-unmatch scripts/pr-step.sh >/dev/null 2>&1 || block "$ME" "$PR_STEP_MSG"
  git -C "$top" diff --quiet HEAD -- scripts/pr-step.sh 2>/dev/null || block "$ME" "$PR_STEP_MSG"
  # The wrapper that runs must be byte-identical to the one in the checkout the hooks load from, so a wrapper committed
  # in another repository never passes. Limit: a session opened in the card worktree compares the file with itself.
  own="$(cd "$(dirname "$0")/../.." && pwd -P)/scripts/pr-step.sh"
  [[ -f "$own" ]] && cmp -s "$top/scripts/pr-step.sh" "$own" \
    || block "$ME" "scripts/pr-step.sh in $top differs from the hooks' own copy ($own): open the session from a checkout with the same wrapper."
fi

exit 0
