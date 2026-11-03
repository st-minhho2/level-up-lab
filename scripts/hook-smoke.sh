#!/usr/bin/env bash
# Runs the agent-hook probe table on this machine (bash 3.2 + BSD tools on macOS, bash 5 in CI/devcontainer).
# Exit 1 on any unexpected verdict. Add a row here whenever a hook gains a rule.
#   scripts/hook-smoke.sh
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
export CLAUDE_PROJECT_DIR="$PWD"
H=.claude/hooks; fail=0; n=0
probe() { # probe <expected-exit> <hook> <json> [hook args...]
  local want="$1" hook="$2" json="$3"; shift 3
  local out rc; out="$(printf '%s' "$json" | "$H/$hook" "$@" 2>&1)"; rc=$?; n=$((n+1))
  if [[ $rc -eq $want ]]; then printf 'ok   %s exit %s  %s\n' "$hook" "$rc" "$json"; else printf 'FAIL %s exit %s (want %s)  %s\n     %s\n' "$hook" "$rc" "$want" "$json" "$out"; fail=1; fi
}
probe_msg() { # probe_msg <expected-exit> <text> <hook> <json>: probe, and the hook's output must hold <text>
  local want="$1" text="$2" hook="$3" json="$4"
  local out rc; out="$(printf '%s' "$json" | "$H/$hook" 2>&1)"; rc=$?; n=$((n+1))
  if [[ $rc -eq $want && "$out" == *"$text"* ]]; then printf 'ok   %s exit %s  %s\n' "$hook" "$rc" "$json"; else printf 'FAIL %s exit %s (want %s, "%s")  %s\n     %s\n' "$hook" "$rc" "$want" "$text" "$json" "$out"; fail=1; fi
}
bash_cmd() { printf '{"tool_input":{"command":"%s"}}' "$1"; }
read_path() { printf '{"tool_input":{"file_path":"%s"}}' "$1"; }

echo "== guard-bash.sh"
for c in 'rm -rf .next' 'rm -fr node_modules' 'rm -r -f dist' 'rm --recursive --force dist' 'pnpm build && sudo rm -Rf out' \
         'git push --force origin main' 'git push -f' 'git push origin +main' 'git push --force-with-lease' \
         'pnpm exec prisma migrate reset' 'npx prisma db push' \
         'DATABASE_URL=postgresql://u:p@db.prod.example.com:5432/x pnpm db:migrate' \
         'cat .env' 'cat .env.local' 'grep DATABASE .env' 'cat ~/.ssh/id_rsa' 'cat ~/.aws/credentials' \
         'echo $DATABASE_URL' 'printenv' 'env | grep -i key'; do probe 2 guard-bash.sh "$(bash_cmd "$c")"; done
for c in 'rm -r dist' 'rm -f src/old.ts' 'git push -u origin feat/x' 'pnpm db:migrate --name add-todos' \
         'DATABASE_URL=postgresql://postgres:postgres@localhost:5433/level_up_lab pnpm db:deploy' \
         'cat .env.example' 'cp .env.example .env' 'pnpm test' 'echo $PORT'; do probe 0 guard-bash.sh "$(bash_cmd "$c")"; done

echo "== guard-bash.sh: scripts/pr-step.sh calls (B1.23)"
pr_cmd() { node -e 'process.stdout.write(JSON.stringify({tool_input:{command:process.argv[1]},cwd:process.argv[2]}))' "$1" "$2"; }
for c in 'scripts/pr-step.sh ready 7 > .claude/settings.json' 'scripts/pr-step.sh draft "$(< .env)"' \
         'GH_REPO=x/y scripts/pr-step.sh ready 7' 'cd /tmp && scripts/pr-step.sh push' 'true && scripts/pr-step.sh push' \
         './scripts/pr-step.sh push' 'bash scripts/pr-step.sh push'; do probe 2 guard-bash.sh "$(pr_cmd "$c" "$PWD")"; done
probe 2 guard-bash.sh "$(pr_cmd 'scripts/pr-step.sh push' "$PWD/scripts")"
PRT="$(mktemp -d)"; git -C "$PRT" init -q; mkdir -p "$PRT/scripts"; printf 'echo\n' > "$PRT/scripts/pr-step.sh"
probe 2 guard-bash.sh "$(pr_cmd 'scripts/pr-step.sh push' "$PRT")"   # untracked wrapper
git -C "$PRT" add -A; git -C "$PRT" -c user.name=s -c user.email=s@x commit -q --no-verify -m x; printf 'echo 2\n' >> "$PRT/scripts/pr-step.sh"
probe 2 guard-bash.sh "$(pr_cmd 'scripts/pr-step.sh push' "$PRT")"   # modified wrapper
rm -f "$PRT/scripts/pr-step.sh"; rmdir "$PRT/scripts" 2>/dev/null; rm -rf "$PRT/.git"; rmdir "$PRT" 2>/dev/null
# review pass 1: zsh code in unquoted arguments, a committed wrapper that is not the hook's own, an untracked copy of
# the real wrapper in a repo with a commit, a newline
for c in 'scripts/pr-step.sh push =(touch X)' "scripts/pr-step.sh push *(e:'touch X':)" "$(printf 'scripts/pr-step.sh push\ntouch X')"; do
  probe 2 guard-bash.sh "$(pr_cmd "$c" "$PWD")"
done
PRT="$(mktemp -d)"; git -C "$PRT" init -q; mkdir -p "$PRT/scripts"; printf 'echo other\n' > "$PRT/scripts/pr-step.sh"
git -C "$PRT" add -A; git -C "$PRT" -c user.name=s -c user.email=s@x commit -q --no-verify -m x
probe 2 guard-bash.sh "$(pr_cmd 'scripts/pr-step.sh push' "$PRT")"   # committed, not the hook's wrapper
cp scripts/pr-step.sh "$PRT/scripts/pr-step.sh"; git -C "$PRT" rm -q --cached scripts/pr-step.sh
git -C "$PRT" -c user.name=s -c user.email=s@x commit -q --no-verify -m y
probe 2 guard-bash.sh "$(pr_cmd 'scripts/pr-step.sh push' "$PRT")"   # identical copy, untracked
rm -f "$PRT/scripts/pr-step.sh"; rmdir "$PRT/scripts" 2>/dev/null; rm -rf "$PRT/.git"; rmdir "$PRT" 2>/dev/null
probe 0 guard-bash.sh "$(pr_cmd "scripts/pr-step.sh draft 'feat(todos): B9.1 add the x (§9)'" "$PWD")"
# review pass 2: escapes out of a quoted argument; the real layout (hooks from one checkout, the call in another checkout
# holding the same committed wrapper)
for c in "scripts/pr-step.sh draft \"a\\\" 'b\" \$(touch P) \"' \"\\\"" 'scripts/pr-step.sh draft "a `touch P` b"' \
         "scripts/pr-step.sh draft 'a' \$(touch P) 'b'"; do probe 2 guard-bash.sh "$(pr_cmd "$c" "$PWD")"; done
PRW="$(mktemp -d)/wt"; git worktree add -q --detach "$PRW" HEAD 2>/dev/null
probe 0 guard-bash.sh "$(pr_cmd 'scripts/pr-step.sh ready 7' "$PRW")"
git worktree remove --force "$PRW" 2>/dev/null; rmdir "$(dirname "$PRW")" 2>/dev/null
for c in 'scripts/pr-step.sh ready 7' 'scripts/pr-step.sh draft "feat(todos): B9.1 add the x"' \
         'git add scripts/pr-step.sh' 'cat scripts/pr-step.sh'; do probe 0 guard-bash.sh "$(pr_cmd "$c" "$PWD")"; done

echo "== guard-bash.sh: force-push and remote branch-delete spellings (B1.24)"
# One command per line, read raw so quotes, $ and backslashes reach the hook as typed.
while IFS= read -r c; do probe_msg 2 'force pushes' guard-bash.sh "$(pr_cmd "$c" "$PWD")"; done <<'FORCED'
git push origin '+main'
git push origin "+feat/x"
git push origin +@:feat/x
git push origin +0a1b2c3:refs/heads/feat/x
git push origin +$BR
git push origin \+main
git push origin $'+main'
git push origin $'\x2bmain'
git push origin {main,--force}
git push origin {x,:feat/y}
git push origin --{force,verbose} feat/x
git push origin ${X:-+main}
git push --mirror origin
git push origin --mir
git push origin --delete feat/x
git push origin --del feat/x
git push -d origin feat/x
git push origin :feat/x
git push origin "":feat/x
git push --all --prune
git push '--force' origin feat/x
git -C . push --force origin feat/x
git -C . push -f
git -C "a b" push -f
git -C a\ b push -f
git -C $(git rev-parse --show-toplevel) push -f
git --no-pager push -f
git "push" -f
"git" push origin --delete feat/x
git -c remote.origin.mirror=true push origin
git -c remote.origin.push=+refs/heads/*:refs/heads/* push
git config remote.origin.mirror true
git config remote.origin.MIRROR true
git config remote.origin.push +refs/heads/*:refs/heads/*
git remote add --mirror=push m url
GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=remote.origin.mirror GIT_CONFIG_VALUE_0=true git push origin
git send-pack --force origin refs/heads/main
gh api -X DELETE repos/o/r/git/refs/heads/feat/x
gh api -X delete repos/o/r/git/refs/heads/feat/x
gh repo sync o/r --force
git status && git push -f
git push -u origin feat/x; git push -uf origin feat/x
(git push -f)
URL=$(git remote get-url origin) git push --force origin main
git remote show origin `git push origin +main`
\git push -f origin main
/usr/libexec/git-core/git-push -f origin main
git -C "$(cd ../repo && pwd)" push -f origin main
git config remote.origin.push $'+refs/heads/*:refs/heads/*'
git -c remote.origin.push=$'+refs/heads/*:refs/heads/*' push
GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=remote.origin.push GIT_CONFIG_VALUE_0=+refs/heads/*:refs/heads/* git push
git -c remote.origin.mirror=true push "$(git config --get branch.main.remote)"
git remote add --mirr=push m url
git clone --mirror url m
gh api -X PATCH repos/o/r/git/refs/heads/feat/x -F force=true
gh api repos/o/r/git/refs/heads/feat/x --method patch -f sha=abc
gh api -X POST repos/o/r/branches/feat/x/rename -f new_name=y
gh api graphql -f query='mutation { deleteRef(input: {refId: "x"}) { clientMutationId } }'
gh api graphql -f query='mutation { updateRef(input: {refId: "x", oid: "y", force: true}) { clientMutationId } }'
gh pr close 7 --delete-branch
gh pr close 7 -d
git config remote.origin.mirror true # config --get
true;git push -f origin main
echo x|git push -f origin main
true &git push -f origin main
git config --get x "$(git -c remote.origin.mirror=true push origin)"
git config --get x $(git config remote.origin.mirror true)
V=true git --config-env=remote.origin.mirror=V push origin
GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=remote.origin.push GIT_CONFIG_VALUE_0=$'+refs/heads/*:refs/heads/*' git push
gh api -iX DELETE repos/o/r/git/refs/heads/feat/x
gh pr close 7 -dc bye
gh pr close 7 "-d"
gh -R o/r pr close 7 -d
gh pr close -d 7
gh pr close --delete-branch 7
git config --get x `git config remote.origin.mirror true`
git config --get x =(git config remote.origin.mirror true)
V=+refs/heads/*:refs/heads/* git --config-env=remote.origin.push=V push
gh -R o/r api -X DELETE repos/o/r/git/refs/heads/feat/x
FORCED
# line continuations: the second line belongs to the same command
for c in "$(printf 'git push origin \\\n+main')" "$(printf 'git \\\npush -f')"; do
  probe_msg 2 'force pushes' guard-bash.sh "$(pr_cmd "$c" "$PWD")"
done
# a heredoc inside $( ): its lines are words of the same push
q="'"; nl=$'\n'
for c in "git push origin \"\$(cat <<${q}X${q}${nl}+main${nl}X${nl})\"" "git push origin main \$(cat <<${q}X${q}${nl}-f${nl}X${nl})"; do
  probe_msg 2 'force pushes' guard-bash.sh "$(pr_cmd "$c" "$PWD")"
done
# a plain config read on one line exempts only itself, not the lines after it
for c in "git config --get user.name${nl}git config remote.origin.mirror true${nl}git push origin" \
         "git config --get user.name${nl}git -c remote.origin.mirror=true push origin" \
         "git config --get user.name${nl}git config remote.origin.push +refs/heads/*:refs/heads/*${nl}git push origin"; do
  probe_msg 2 'force pushes' guard-bash.sh "$(pr_cmd "$c" "$PWD")"
done
while IFS= read -r c; do probe 0 guard-bash.sh "$(pr_cmd "$c" "$PWD")"; done <<'PLAIN'
git push
git -C . push -u origin feat/x
git push -u origin feat/B1.24-force-push-spellings
git push --follow-tags origin feat/x
git push --dry-run origin feat/x
git push origin HEAD:refs/heads/feat/x
git push --set-upstream origin feat/fix-delete
git commit -m "guard-bash blocks every forced-push spelling"
git remote add origin git@github.com:o/r.git
git config user.name "a=:b"
git config --get remote.origin.mirror
gh api repos/o/r/git/refs/heads/feat/x
gh api repos/o/r/git/refs/heads/feat/B3.3-delete
gh api repos/o/r/contents/docs/rename.md
gh pr close 7 -c "superseded"
git config -l | grep remote.origin.mirror
git config --unset remote.origin.mirror
git clone --bare url m
git config --global --get remote.origin.mirror
docker push -d registry.example.com/img:1
PLAIN
probe 0 guard-bash.sh "$(pr_cmd 'scripts/pr-step.sh push' "$PWD")"   # the wrapper's push (B1.23) still runs

echo "== settings.json permissions (B1.23)"
n=$((n+1)); if node -e '
  const p = require("./.claude/settings.json").permissions;
  const deny = ["Read(./.env)", "Read(./.env.local)", "Read(./.env.development)", "Read(./.env.test)",
    "Read(./.env.production)", "Read(~/.ssh/**)", "Read(~/.aws/**)", "Read(~/.kube/**)", "Edit(./.env*)",
    "Bash(git commit --no-verify*)", "Bash(git commit * --no-verify*)", "Bash(git commit -n *)",
    "Bash(git -c core.hooksPath=*)", "Bash(LEFTHOOK=0*)", "Bash(gh pr merge*)", "Bash(gh pr review*)"];
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  process.exit(same(p.allow, ["Bash(scripts/pr-step.sh *)"]) && same(p.deny, deny) ? 0 : 1);'; then
  echo "ok   allow is exactly the pr-step.sh wrapper; the 16 deny entries unchanged"
else echo "FAIL allow is not exactly [Bash(scripts/pr-step.sh *)] or deny changed"; fail=1; fi

echo "== guard-read.sh"
for f in /x/level-up-lab/.env /x/.env.production /Users/me/.ssh/id_ed25519; do probe 2 guard-read.sh "$(read_path "$f")"; done
for f in /x/level-up-lab/.env.example /x/level-up-lab/src/lib/env.ts; do probe 0 guard-read.sh "$(read_path "$f")"; done

echo "== path-guard.sh (role write scopes)"
TW=('*.test.ts' '*.test.tsx' 'e2e/*')
IM=('src/*' 'prisma/*' 'spec/features-map.md' 'docs/metrics.md' '!*.test.ts' '!*.test.tsx' '!e2e/*' '!src/lib/prisma.ts')
DOCS=('backlog/work/*')
probe 0 path-guard.sh "$(read_path "$PWD/src/lib/todos.test.ts")" "${TW[@]}"
probe 0 path-guard.sh "$(read_path "$PWD/e2e/x.spec.ts")" "${TW[@]}"
probe 2 path-guard.sh "$(read_path "$PWD/src/lib/todos.ts")" "${TW[@]}"
probe 0 path-guard.sh "$(read_path "$PWD/src/lib/todos.ts")" "${IM[@]}"
probe 2 path-guard.sh "$(read_path "$PWD/src/lib/todos.test.ts")" "${IM[@]}"
probe 2 path-guard.sh "$(read_path "$PWD/src/lib/prisma.ts")" "${IM[@]}"
probe 0 path-guard.sh "$(read_path "$PWD/backlog/work/B1.2/plan.md")" "${DOCS[@]}"
probe 2 path-guard.sh "$(read_path "$PWD/spec/contracts/04-edit-title.md")" "${DOCS[@]}"
probe 2 path-guard.sh "$(read_path "$PWD/backlog/work/../../src/lib/x.ts")" "${DOCS[@]}"
probe 2 path-guard.sh "$(read_path "/etc/hosts")" "${DOCS[@]}"

echo "== agent frontmatter (parses; each role's hook command, as the YAML yields it, reaches path-guard.sh)"
n=$((n+1)); if out="$(scripts/ci/check-agent-frontmatter.sh 2>&1)"; then echo "ok   $out"; else printf 'FAIL %s\n' "$out"; fail=1; fi
role_patterns() { # the patterns each role's path-guard.sh must receive, in order
  case "$1" in
    advisor) echo "backlog/work/*" ;;
    code-writer) echo "src/* prisma/* spec/features-map.md docs/metrics.md !*.test.ts !*.test.tsx !e2e/* !src/lib/prisma.ts" ;;
    dev-lead) echo "backlog/* docs/metrics.md docs/mistake-log.md !backlog/00-decisions.md !backlog/work/*/review.md" ;;
    reviewer) echo "backlog/work/*/review.md" ;;
    spec-analyst) echo "spec/contracts/* backlog/* !spec/features-map.md !backlog/00-decisions.md" ;;
    test-writer) echo "*.test.ts *.test.tsx e2e/*" ;;
  esac
}
role_probes() { # <exit> <path> pairs: one write the role may make, one it may not
  case "$1" in
    advisor) echo "0 backlog/work/B1.2/advice.md 2 src/lib/todos.ts" ;;
    code-writer) echo "0 src/lib/todos.ts 2 src/lib/todos.test.ts 2 e2e/x.spec.ts" ;;
    dev-lead) echo "0 backlog/work/B1.2/plan.md 2 src/lib/todos.ts 2 backlog/00-decisions.md 2 backlog/work/B1.2/review.md" ;;
    reviewer) echo "0 backlog/work/B1.2/review.md 2 backlog/work/B1.2/plan.md" ;;
    spec-analyst) echo "0 spec/contracts/04-edit-title.md 2 src/lib/todos.ts 2 spec/features-map.md" ;;
    test-writer) echo "0 src/lib/todos.test.ts 0 e2e/x.spec.ts 2 src/lib/todos.ts" ;;
  esac
}
FAKE="$(mktemp -d)"; mkdir -p "$FAKE/.claude/hooks"
printf '#!/bin/sh\nprintf "%%s\\n" "$@"\n' > "$FAKE/.claude/hooks/path-guard.sh"; chmod +x "$FAKE/.claude/hooks/path-guard.sh"
roles=0
while IFS="$(printf '\t')" read -r role cmd; do
  roles=$((roles+1)); n=$((n+1)); want="$(role_patterns "$role")"
  got="$(printf '{}' | CLAUDE_PROJECT_DIR="$FAKE" sh -c "$cmd" | tr '\n' ' ')"; got="${got% }"
  if [[ -n "$want" && "$got" == "$want" ]]; then echo "ok   $role passes: $got"; else printf 'FAIL %s passes [%s] (want [%s])\n' "$role" "$got" "$want"; fail=1; fi
  set -- $(role_probes "$role")
  while [[ $# -ge 2 ]]; do
    n=$((n+1)); rc=0; printf '%s' "$(read_path "$PWD/$2")" | sh -c "$cmd" >/dev/null 2>&1 || rc=$?
    if [[ $rc -eq $1 ]]; then echo "ok   $role exit $rc  $2"; else echo "FAIL $role exit $rc (want $1)  $2"; fail=1; fi
    shift 2
  done
done <<EOF
$(scripts/ci/check-agent-frontmatter.sh --commands 2>/dev/null)
EOF
rm -rf "$FAKE"
n=$((n+1)); if [[ $roles -eq 6 ]]; then echo "ok   6 roles declare a path-guard.sh hook"; else echo "FAIL $roles roles declare a path-guard.sh hook (want 6)"; fail=1; fi

echo "== path-guard.sh per layout (main, .worktrees/<slug>, .claude/worktrees/<name>, nested) x role, with and without git"
# CLAUDE_PROJECT_DIR stays the main checkout while the write lands in a worktree: patterns must see the path
# relative to that worktree, and every refused write must stay refused.
ROLES='advisor code-writer dev-lead reviewer spec-analyst test-writer'
LAYOUTS='. .worktrees/s .claude/worktrees/n .claude/worktrees/n/.worktrees/b'
pg() { # pg <expected-exit> <project-dir> <file> <label> <patterns...>
  local want="$1" root="$2" file="$3" label="$4" rc; shift 4; n=$((n+1))
  read_path "$file" | CLAUDE_PROJECT_DIR="$root" "$H/path-guard.sh" "$@" >/dev/null 2>&1; rc=$?
  if [[ $rc -eq $want ]]; then echo "ok   path-guard exit $rc  $label"; else echo "FAIL path-guard exit $rc (want $want)  $label"; fail=1; fi
}
patterns_of() { set -f; pats=($(role_patterns "$1")); set +f; } # into pats, unglobbed
layout_probes() { # layout_probes <mode> <project-dir>: each role's allowed and refused writes in every layout
  local mode="$1" root="$2" lay role
  for lay in $LAYOUTS; do
    for role in $ROLES; do
      patterns_of "$role"; set -- $(role_probes "$role")
      while [[ $# -ge 2 ]]; do pg "$1" "$root" "$root/$lay/$2" "$mode $lay $role $2" "${pats[@]}"; shift 2; done
    done
    patterns_of test-writer
    pg 2 "$root" "$root/$lay/e2e/new/../../src/lib/x.ts" "$mode $lay test-writer climbs out of a new dir" "${pats[@]}"
  done
}
gs() { git -C "$1" -c core.hooksPath=/dev/null -c commit.gpgsign=false -c user.name=smoke -c user.email=smoke@localhost "${@:2}" >/dev/null 2>&1; }
REPO="$(mktemp -d)"; PLAIN="$(mktemp -d)"; OUTSIDE="$(mktemp -d)"
gs "$REPO" init -q && gs "$REPO" commit -q --allow-empty -m init
for lay in $LAYOUTS; do [[ "$lay" == . ]] || gs "$REPO" worktree add -q --detach "$REPO/$lay"; mkdir -p "$PLAIN/$lay"; done
n=$((n+1)); if [[ "$(git -C "$REPO" worktree list | wc -l | tr -d ' ')" == 4 ]]; then echo "ok   fixture repo has 4 worktrees"; else echo "FAIL fixture repo worktrees not created"; fail=1; fi
layout_probes git "$REPO"
layout_probes plain "$PLAIN"
patterns_of code-writer
mkdir -p "$REPO/vendor/other" && gs "$REPO/vendor/other" init -q
pg 2 "$REPO" "$REPO/vendor/other/src/a.ts" "git nested clone (own .git) is not a worktree root" "${pats[@]}"
gs "$REPO" worktree add -q --detach "$REPO/elsewhere/wt"
pg 0 "$REPO" "$REPO/elsewhere/wt/src/lib/todos.ts" "git worktree at a path no prefix rule knows" "${pats[@]}"
pg 2 "$REPO" "$REPO/elsewhere/wt/e2e/x.spec.ts" "git worktree at a path no prefix rule knows, refused" "${pats[@]}"
gs "$REPO" worktree add -q --detach "$OUTSIDE/wt"
pg 2 "$REPO" "$OUTSIDE/wt/src/a.ts" "git worktree of the project outside it" "${pats[@]}"
rm -rf "$REPO" "$PLAIN" "$OUTSIDE"

# A gh shim for plan-files' D-27 check (eligible.sh) and check-plan-scope.sh's agent-ready lookup (B1.55): canned
# answers per endpoint from $SMOKE_GHF, no jq (CI's image has none), no network. On PATH through the plan-scope,
# check-plan-scope and plan-row sections; no open agent-ready issue unless a probe writes one.
GS="$(mktemp -d)"; GHF="$GS/fix"; mkdir -p "$GS/bin" "$GHF"
cat > "$GS/bin/gh" <<'SHIM'
#!/bin/bash
[[ "$1" == api ]] || exit 9
shift; [[ "$1" == --paginate ]] && shift
ep="$1"; q="${3:-}"
case "$ep" in
  graphql) f=none; for a in "$@"; do [[ "$a" == n=* ]] && f="${a#n=}/timeline"; done ;;
  *'issues?labels=agent-ready'*) f=open-bodies ;;
  */issues/*) f="${ep##*/}"; if [[ "$q" == .body* ]]; then f="$f/body"; else f="$f/issue"; fi ;;
  */collaborators/*/permission) f="${ep%/permission}"; f="perm-${f##*/}" ;;
  *) exit 9 ;;
esac
[[ -f "$SMOKE_GHF/$f" ]] || { echo "gh: Not Found (HTTP 404)" >&2; exit 1; }
cat "$SMOKE_GHF/$f"
SHIM
chmod +x "$GS/bin/gh"; : > "$GHF/open-bodies"; printf 'admin\tadmin\n' > "$GHF/perm-lead"
PATH_SAVED="$PATH"; export SMOKE_GHF="$GHF" PATH="$GS/bin:$PATH"

echo "== plan-scope.sh (B1.17): a card worktree writes only its approved plan's Files, per layout"
# Fixture: a repo whose checkouts sit in every layout, each on a card branch of B9.1 cut after the plan's approval
# commit; extra worktrees hold the other plan states. CLAUDE_PROJECT_DIR stays the repo root, as in a session.
ps() { # ps <expected-exit> <project-dir> <file> <agent_type|-> <label>
  local want="$1" root="$2" file="$3" who="$4" label="$5" json rc; n=$((n+1))
  if [[ "$who" == - ]]; then json="$(read_path "$file")"; else json="$(printf '{"tool_input":{"file_path":"%s"},"agent_type":"%s"}' "$file" "$who")"; fi
  if [[ -n "${PS_RUNNER:-}" ]]; then printf '%s' "$json" | RUNNER_CHILD=1 CLAUDE_PROJECT_DIR="$root" "$H/plan-scope.sh" >/dev/null 2>&1; rc=$?
  else printf '%s' "$json" | env -u RUNNER_CHILD CLAUDE_PROJECT_DIR="$root" "$H/plan-scope.sh" >/dev/null 2>&1; rc=$?; fi
  if [[ $rc -eq $want ]]; then echo "ok   plan-scope exit $rc  $label"; else echo "FAIL plan-scope exit $rc (want $want)  $label"; fail=1; fi
}
plan_md() { # plan_md <dir> <card> <files...>: a plan whose Files table lists the given paths
  local d="$1/backlog/work/$2" f; mkdir -p "$d"; shift 2
  { printf '# plan\n\n## Files\n\n| File | Change |\n| ---- | ------ |\n'; for f in "$@"; do printf '| `%s` | x |\n' "$f"; done
    printf '\n## Interfaces touched\n\n| `src/lib/not-a-file-row.ts` | x |\n'; } > "$d/plan.md"
}
PS="$(mktemp -d)"; PS_OUT="$(mktemp -d)"
gs "$PS" init -q -b main && gs "$PS" commit -q --allow-empty -m init
gs "$PS" checkout -q -b feat/B9.1-main
plan_md "$PS" B9.1 src/lib/a.ts src/lib/a.test.ts "prisma/migrations/*" && gs "$PS" add -A && gs "$PS" commit -q -m "docs(backlog): B9.1 plan"
gs "$PS" commit -q --allow-empty -m "docs(backlog): B9.1 plan approved"
i=0; for lay in $LAYOUTS; do [[ "$lay" == . ]] || { i=$((i+1)); gs "$PS" worktree add -q -b "feat/B9.1-l$i" "$PS/$lay" feat/B9.1-main; }; done
for lay in $LAYOUTS; do
  w="$PS/$lay"
  ps 0 "$PS" "$w/src/lib/a.ts" - "S1 $lay listed file"
  ps 2 "$PS" "$w/src/lib/b.ts" code-writer "S2 $lay unlisted file"
  ps 0 "$PS" "$w/backlog/README.md" - "S3 $lay paperwork backlog/"
  ps 0 "$PS" "$w/spec/contracts/x.md" spec-analyst "S3 $lay paperwork spec/"
  ps 0 "$PS" "$w/docs/metrics.md" - "S3 $lay paperwork docs/metrics.md"
  ps 2 "$PS" "$w/docs/design/x.md" - "S3 $lay docs/ beyond the paperwork list"
  ps 2 "$PS" "$w/src/lib/not-a-file-row.ts" - "S3 $lay a row outside ## Files"
  ps 0 "$PS" "$w/src/lib/a.test.ts" test-writer "S7 $lay listed test as test-writer"
  ps 2 "$PS" "$w/src/lib/a.test.ts" - "S8 $lay listed test from the main thread"
  ps 2 "$PS" "$w/src/lib/a.test.ts" code-writer "S9 $lay listed test as code-writer"
  ps 2 "$PS" "$w/prisma/migrations/1_x/migration.sql" code-writer "S10 $lay migration by Edit/Write, listed in the plan"
done
mk() { gs "$PS" worktree add -q -b "$2" "$PS/.claude/worktrees/$1" main; }
mk unapproved feat/B9.2-x; W="$PS/.claude/worktrees/unapproved"
plan_md "$W" B9.2 src/lib/a.ts && gs "$W" add -A && gs "$W" commit -q -m "docs(backlog): B9.2 plan"
ps 2 "$PS" "$W/src/lib/a.ts" - "S4 listed, plan not approved"
ps 0 "$PS" "$W/backlog/work/B9.2/plan.md" - "S4 the card's work folder before approval"
mk noplan feat/B9.3
ps 2 "$PS" "$PS/.claude/worktrees/noplan/src/lib/a.ts" - "S5 no plan (branch without a slug)"
mk later feat/B9.1-later; W="$PS/.claude/worktrees/later"
plan_md "$W" B9.1 src/lib/a.ts && gs "$W" add -A && gs "$W" commit -q -m "docs(backlog): B9.1 plan approved"
plan_md "$W" B9.1 src/lib/a.ts src/lib/c.ts && gs "$W" add -A && gs "$W" commit -q -m "docs(backlog): B9.1 plan adds c.ts"
ps 2 "$PS" "$W/src/lib/c.ts" - "S6 row added after the approval commit"
gs "$W" commit -q --allow-empty -m "docs(backlog): B9.1 plan round 2 approved"
ps 0 "$PS" "$W/src/lib/c.ts" - "S15 the same row after a round-2 approval"
mk lane docs/B9.1-done
ps 2 "$PS" "$PS/.claude/worktrees/lane/src/lib/a.ts" - "S11 docs/ lane branch writing src/ (no plan on main)"
ps 0 "$PS" "$PS/.claude/worktrees/lane/backlog/README.md" - "S11 docs/ lane branch writing paperwork"
mk other claude/x
ps 0 "$PS" "$PS/.claude/worktrees/other/src/lib/z.ts" - "S12 branch without a card id"
ps 0 "$PS" "$PS_OUT/src/lib/a.ts" - "S13 file outside the project"
mk quote feat/B9.4-x; W="$PS/.claude/worktrees/quote"
plan_md "$W" B9.4 src/lib/a.ts && printf '\nPlan approved by: lead (quoted in prose)\n' >> "$W/backlog/work/B9.4/plan.md"
gs "$W" add -A && gs "$W" commit -q -m "docs(backlog): B9.4 plan"
ps 2 "$PS" "$W/src/lib/a.ts" - "S14 plan quoting the approval line, no approval commit"
rm -rf "$PS" "$PS_OUT"

echo "== check-plan-scope.sh (B1.17): a card branch's diff stays inside its approved plan"
cps() { # cps <expected-exit> <dir> <label>
  local want="$1" dir="$2" label="$3" rc; n=$((n+1))
  (cd "$dir" && env -u GITHUB_HEAD_REF -u GITHUB_BASE_REF "$ROOT_DIR/scripts/ci/check-plan-scope.sh") >/dev/null 2>&1; rc=$?
  if [[ $rc -eq $want ]]; then echo "ok   check-plan-scope exit $rc  $label"; else echo "FAIL check-plan-scope exit $rc (want $want)  $label"; fail=1; fi
}
ROOT_DIR="$PWD"; CO="$(mktemp -d)"; C="$CO/c"
git init -q --bare "$CO/origin.git" && git clone -q "$CO/origin.git" "$C" 2>/dev/null
gs "$C" checkout -q -b main && gs "$C" commit -q --allow-empty -m init && gs "$C" push -q origin main
gs "$C" checkout -q -b feat/B9.1-x
plan_md "$C" B9.1 src/lib/a.ts && gs "$C" add -A && gs "$C" commit -q -m "docs(backlog): B9.1 plan approved"
mkdir -p "$C/src/lib" && echo a > "$C/src/lib/a.ts" && gs "$C" add -A && gs "$C" commit -q -m "feat(todos): B9.1 a"
cps 0 "$C" "C1 every changed file in the plan"
echo b > "$C/src/lib/b.ts" && gs "$C" add -A && gs "$C" commit -q -m "feat(todos): B9.1 b"
cps 1 "$C" "C2 src/lib/b.ts outside the plan"
gs "$C" checkout -q -b docs/B9.5-done main && mkdir -p "$C/backlog" && echo r > "$C/backlog/README.md"
gs "$C" add -A && gs "$C" commit -q -m "docs(backlog): B9.5 done"
cps 0 "$C" "C3 lane branch with paperwork only"
gs "$C" checkout -q -b sib main && mkdir -p "$C/src/lib" && echo z > "$C/src/lib/z.ts" && gs "$C" add -A && gs "$C" commit -q -m "feat: sibling"
gs "$C" checkout -q -b feat/B9.6-x sib
plan_md "$C" B9.6 src/lib/y.ts && gs "$C" add -A && gs "$C" commit -q -m "docs(backlog): B9.6 plan approved"
echo y > "$C/src/lib/y.ts" && gs "$C" add -A && gs "$C" commit -q -m "feat(todos): B9.6 y"
gs "$C" checkout -q main && mkdir -p "$C/src/lib" && echo z > "$C/src/lib/z.ts" && gs "$C" add -A && gs "$C" commit -q -m "feat: sibling (#1)" && gs "$C" push -q origin main
gs "$C" checkout -q feat/B9.6-x && gs "$C" fetch -q origin && gs "$C" merge -q --no-edit origin/main
cps 0 "$C" "C4 cut before a sibling's squash merge, then origin/main merged"
gs "$C" checkout -q -b claude/x main && mkdir -p "$C/src/lib" && echo q > "$C/src/lib/q.ts" && gs "$C" add -A && gs "$C" commit -q -m "chore: q"
cps 0 "$C" "C5 branch without a card id is skipped"
gs "$C" checkout -q -b feat/B9.7-x main
plan_md "$C" B9.7 src/lib/w.ts && gs "$C" add -A && gs "$C" commit -q -m "docs(backlog): B9.7 plan approved"
echo w > "$C/src/lib/w.ts" && gs "$C" add -A && gs "$C" commit -q -m "feat(todos): B9.7 w"
gs "$C" checkout -q main && echo m > "$C/src/lib/m.ts" && gs "$C" add -A && gs "$C" commit -q -m "feat: m (#2)" && gs "$C" push -q origin main
gs "$C" checkout -q feat/B9.7-x
cps 0 "$C" "C6 main moved on (src/lib/m.ts), branch not merged: only the branch's own changes count (review pass 1)"
gs "$C" checkout -q -b feat/B9.8-x main
plan_md "$C" B9.8 src/lib/a2.ts && gs "$C" add -A && gs "$C" commit -q -m "docs(backlog): B9.8 plan approved"
gs "$C" mv src/lib/z.ts src/lib/a2.ts && gs "$C" commit -q -m "feat(todos): B9.8 rename"
cps 1 "$C" "C7 a rename into a listed path still reports the deleted src/lib/z.ts (review pass 1)"
gs "$C" checkout -q -b feat/B9.9-x main
plan_md "$C" B9.9 src/lib/a.ts && gs "$C" add -A
gs "$C" commit -q -m "docs(backlog): B9.9 plan revised" -m "docs(backlog): B9.9 plan approved comes next"
n=$((n+1)); rc=0; (cd "$C" && "$ROOT_DIR/scripts/ci/plan-files.sh" B9.9 >/dev/null 2>&1) || rc=$?
if [[ $rc -eq 3 ]]; then echo "ok   plan-files exit 3  C8 an approval phrase in a commit body is not an approval (review pass 1)"
else echo "FAIL plan-files exit $rc (want 3)  C8 an approval phrase in a commit body is not an approval (review pass 1)"; fail=1; fi
rm -rf "$CO"

echo "== D-27 approval (B1.55): on a runner's path only a reviewed low or medium plan of an eligible issue passes"
# Runner path: a `<prefix>/<card>-agent` branch, or RUNNER_CHILD in the hook's env, or (CI) an open agent-ready issue
# naming the card. Each probe cuts a branch from main with a plan + review commit, then the approval commit.
gh_issue() { # gh_issue <n> <card id> <state> <labeler permission> [<label>]: issue <n> by lead, labeled by lab<n>
  mkdir -p "$GHF/$1"; printf 'lead\n%s\n' "$3" > "$GHF/$1/issue"
  [[ "${5:-agent-ready}" == agent-ready ]] && echo LA_ready >> "$GHF/$1/issue"
  printf '### Card id\n\n%s\n\n### Spec\n\nx\n' "$2" > "$GHF/$1/body"
  printf 'LabeledEvent\tLA_ready\tlab%s\n' "$1" > "$GHF/$1/timeline"; printf '%s\t%s\n' "$4" "$4" > "$GHF/perm-lab$1"
}
status_plan() { # status_plan <dir> <card> <field> <files...>: plan_md and its status line
  local d="$1" c="$2" f="$3"; shift 3; plan_md "$d" "$c" "$@"
  printf '\nPlan review: approved, round 1 · Plan approved by: %s · Rounds: 1\n' "$f" >> "$d/backlog/work/$c/plan.md"
}
review_md() { # review_md <dir> <card> <verdict | "## …" a whole body, printf %b escapes>
  mkdir -p "$1/backlog/work/$2"
  if [[ "$3" == '## '* ]]; then printf '# review\n\n%b\n' "$3" > "$1/backlog/work/$2/review.md"
  else printf '# review\n\n## Plan review (round 1)\n\nVerdict: %s\n' "$3" > "$1/backlog/work/$2/review.md"; fi
}
approve() { # approve <dir> <branch> <card> <field> <verdict> <files...>: plan + review commit, then the approval commit
  local d="$1" br="$2" c="$3" f="$4" v="$5"; shift 5
  gs "$d" checkout -q -b "$br" main
  status_plan "$d" "$c" "" "$@"; review_md "$d" "$c" "$v"; gs "$d" add backlog && gs "$d" commit -q -m "docs(backlog): $c plan"
  status_plan "$d" "$c" "$f" "$@"; gs "$d" add backlog && gs "$d" commit -q --allow-empty -m "docs(backlog): $c plan approved"
}
d27() { printf 'reviewer (D-27, tier %s, issue #%s)' "$1" "$2"; }
pf() { # pf <expected-exit> <dir> <text> <label> <plan-files args...>: plan-files' exit and its stderr
  local want="$1" dir="$2" text="$3" label="$4" rc out; shift 4; n=$((n+1))
  out="$(cd "$dir" && "$ROOT_DIR/scripts/ci/plan-files.sh" "$@" 2>&1 >/dev/null)"; rc=$?
  if [[ $rc -eq $want && "$out" == *"$text"* ]]; then echo "ok   plan-files exit $rc  $label"
  else echo "FAIL plan-files exit $rc (want $want, \"$text\")  $label: $out"; fail=1; fi
}
DO="$(mktemp -d)"; D="$DO/d"
git init -q --bare "$DO/origin.git" && git clone -q "$DO/origin.git" "$D" 2>/dev/null
gs "$D" checkout -q -b main && gs "$D" commit -q --allow-empty -m init && gs "$D" push -q origin main
gh_issue 11 B9.11 open write; approve "$D" chore/B9.11-agent B9.11 "$(d27 low 11)" approved docs/x.md
ps 0 "$D" "$D/docs/x.md" - "S16 low plan, reviewed, eligible issue, runner branch"
mkdir -p "$D/docs" && echo x > "$D/docs/x.md" && gs "$D" add docs && gs "$D" commit -q -m "chore(docs): B9.11 x"
cps 0 "$D" "C9 check-plan-scope takes the same low approval"
gh_issue 12 B9.12 open write; approve "$D" chore/B9.12-agent B9.12 "$(d27 medium 12)" approved src/lib/a.ts
ps 0 "$D" "$D/src/lib/a.ts" - "S16 medium plan, reviewed, eligible issue, runner branch"
gh_issue 13 B9.13 open write; approve "$D" chore/B9.13-agent B9.13 "$(d27 high 13)" approved .claude/hooks/x.sh
ps 2 "$D" "$D/.claude/hooks/x.sh" - "S17 a high-tier plan approved by the reviewer"
pf 5 "$D" "tier high" "S17 plan-files names the tier" --run B9.13
mkdir -p "$D/.claude/hooks" && echo x > "$D/.claude/hooks/x.sh" && gs "$D" add .claude && gs "$D" commit -q -m "chore(hooks): B9.13 x"
cps 1 "$D" "C9 check-plan-scope refuses the high-tier self-approval"
gh_issue 14 B9.14 open write; approve "$D" chore/B9.14-agent B9.14 "$(d27 low 14)" approved .claude/hooks/x.sh
ps 2 "$D" "$D/.claude/hooks/x.sh" - "S18 the field says low, tier.sh says high"
gh_issue 15 B9.15 open write bug; approve "$D" chore/B9.15-agent B9.15 "$(d27 low 15)" approved docs/x.md
ps 2 "$D" "$D/docs/x.md" - "S19 the issue is not labeled agent-ready"
approve "$D" chore/B9.16-agent B9.16 "$(d27 low 16)" approved docs/x.md
ps 2 "$D" "$D/docs/x.md" - "S19 no such issue"
gh_issue 17 B9.17 closed write; approve "$D" chore/B9.17-agent B9.17 "$(d27 low 17)" approved docs/x.md
ps 2 "$D" "$D/docs/x.md" - "S19 the issue is closed"
gh_issue 18 B9.18 open read; approve "$D" chore/B9.18-agent B9.18 "$(d27 low 18)" approved docs/x.md
ps 2 "$D" "$D/docs/x.md" - "S20 the labeler has read access only"
gh_issue 19 B9.99 open write; approve "$D" chore/B9.19-agent B9.19 "$(d27 low 19)" approved docs/x.md
ps 2 "$D" "$D/docs/x.md" - "S21 the issue names another card"
gh_issue 20 B9.20 open write; approve "$D" chore/B9.20-agent B9.20 "$(d27 low 20)" "changes requested" docs/x.md
ps 2 "$D" "$D/docs/x.md" - "S22 the last plan review requested changes"
gh_issue 26 B9.26 open write; approve "$D" chore/B9.26-agent B9.26 "$(d27 low 26)" \
  '## Plan review (round 1)\n\nVerdict: approved\n\n## Plan review (phase B amendment)\n\nVerdict: changes requested' docs/x.md
ps 2 "$D" "$D/docs/x.md" - "S27 a later plan review under another heading requested changes (review pass 1)"
gh_issue 27 B9.27 open write; approve "$D" chore/B9.27-agent B9.27 "$(d27 low 27)" \
  '## Plan review (round 1)\n\nVerdict: changes requested\n\n## Plan review (round 2)\n\nVerdict: approved\n\n## Diff review (pass 1)\n\nVerdict: back to code-writer' docs/x.md
ps 0 "$D" "$D/docs/x.md" - "S28 round 1 changes requested, round 2 approved, a diff review after (review pass 1)"
gh_issue 28 B9.28 open write; approve "$D" chore/B9.28-agent B9.28 "$(d27 low 28)" \
  '## Plan review (round 1)\n\nVerdict: approved\n\n## Plan review (round 2)\n\nVerdict: changes requested' docs/x.md
ps 2 "$D" "$D/docs/x.md" - "S28 round 1 approved, round 2 changes requested (review pass 1)"
gh_issue 21 B9.21 open write; gs "$D" checkout -q -b chore/B9.21-agent main
status_plan "$D" B9.21 "" docs/x.md; review_md "$D" B9.21 approved; gs "$D" add backlog && gs "$D" commit -q -m "docs(backlog): B9.21 plan"
status_plan "$D" B9.21 "" docs/x.md docs/y.md; gs "$D" add backlog && gs "$D" commit -q -m "docs(backlog): B9.21 plan adds y"
status_plan "$D" B9.21 "$(d27 low 21)" docs/x.md docs/y.md; gs "$D" add backlog && gs "$D" commit -q -m "docs(backlog): B9.21 plan approved"
ps 2 "$D" "$D/docs/x.md" - "S23 the plan changed after the review"
gh_issue 22 B9.22 open write; approve "$D" chore/B9.22-agent B9.22 "lead, 2026-11-02" approved docs/x.md
ps 2 "$D" "$D/docs/x.md" - "S24 a lead field on a runner branch"
mkdir -p "$D/docs" && echo x > "$D/docs/x.md" && gs "$D" add docs && gs "$D" commit -q -m "chore(docs): B9.22 x"
cps 1 "$D" "C10 check-plan-scope refuses a lead field on a runner branch"
approve "$D" chore/B9.23-agent B9.23 "" approved docs/x.md
ps 2 "$D" "$D/docs/x.md" - "S24 an empty field on a runner branch"
approve "$D" chore/B9.24-agent B9.24 "reviewer (D-27, tier low)" approved docs/x.md
ps 2 "$D" "$D/docs/x.md" - "S24 a malformed field on a runner branch"
approve "$D" chore/B9.11-x B9.11 "$(d27 low 11)" approved docs/x.md
ps 2 "$D" "$D/docs/x.md" - "S25 a D-27 field off the runner path"
approve "$D" chore/B9.25-x B9.25 "lead, 2026-11-02" approved docs/x.md
printf 'Prose quoting it: Plan approved by: %s\n' "$(d27 low 11)" >> "$D/backlog/work/B9.25/plan.md"
gs "$D" add backlog && gs "$D" commit -q -m "docs(backlog): B9.25 plan round 2 approved"
ps 0 "$D" "$D/docs/x.md" - "S25 a D-27 field quoted in prose only, lead field off the runner path"
PS_RUNNER=1 ps 2 "$D" "$D/docs/x.md" - "S26 the same lead field inside a run (RUNNER_CHILD), plain branch"
mkdir -p "$D/docs" && echo x > "$D/docs/x.md" && gs "$D" add docs && gs "$D" commit -q -m "chore(docs): B9.25 x"
cps 0 "$D" "C11 a lead field on a plain branch, no open agent-ready issue names the card"
printf 'open\n### Card id\n\nB9.25\n\n### Spec\n\nx\n' > "$GHF/open-bodies"
cps 1 "$D" "C11 the same while an open agent-ready issue names the card"
: > "$GHF/open-bodies"
rm -rf "$DO"

echo "== plan rows with [ ] and * (B1.20, B1.32): a row names its own path; only * is a wildcard, within one segment, per layout"
# Fixture: the plan lists src/app/[id]/page.tsx (read as a glob, a bracket expression that never matches itself), the
# glob src/app/*/layout.tsx and, for B1.32, src/app/[id]/*.css, src/app/x?.ts and prisma/migrations/*. plan-scope.sh
# runs from every layout (L1–L3, L7, L8, L12–L15); check-plan-scope.sh on a card branch checked out in every layout of a
# clone with an origin (L4–L6, L9–L11). Explicit `git add` paths keep nested worktrees unstaged.
LS="$(mktemp -d)"; LC="$LS/c"
git init -q --bare "$LS/origin.git" && git clone -q "$LS/origin.git" "$LC" 2>/dev/null
gs "$LC" checkout -q -b main && gs "$LC" commit -q --allow-empty -m init && gs "$LC" push -q origin main
gs "$LC" checkout -q -b feat/B9.10-main
plan_md "$LC" B9.10 "src/app/[id]/page.tsx" "src/app/*/layout.tsx" "src/app/[id]/*.css" "src/app/x?.ts" "prisma/migrations/*" && gs "$LC" add backlog
gs "$LC" commit -q -m "docs(backlog): B9.10 plan approved"
i=0; for lay in $LAYOUTS; do [[ "$lay" == . ]] || { i=$((i+1)); gs "$LC" worktree add -q -b "feat/B9.10-l$i" "$LC/$lay" feat/B9.10-main; }; done
for lay in $LAYOUTS; do
  w="$LC/$lay"
  ps 0 "$LC" "$w/src/app/[id]/page.tsx" - "L1 $lay listed path with [ ]"
  ps 2 "$LC" "$w/src/app/[slug]/page.tsx" - "L2 $lay unlisted path with [ ]"
  ps 0 "$LC" "$w/src/app/x/layout.tsx" - "L3 $lay path matched by a glob row"
  mkdir -p "$w/src/app/x" "$w/src/app/[id]" "$w/src/app/[slug]"
  echo x > "$w/src/app/x/layout.tsx" && gs "$w" add src/app/x && gs "$w" commit -q -m "feat(todos): B9.10 layout"
  cps 0 "$w" "L4 $lay glob row covers the diff"
  echo i > "$w/src/app/[id]/page.tsx" && gs "$w" add "src/app/[id]" && gs "$w" commit -q -m "feat(todos): B9.10 page"
  cps 0 "$w" "L5 $lay listed path with [ ] in the diff"
  echo s > "$w/src/app/[slug]/page.tsx" && gs "$w" add "src/app/[slug]" && gs "$w" commit -q -m "feat(todos): B9.10 slug"
  cps 1 "$w" "L6 $lay unlisted path with [ ] in the diff"
  ps 2 "$LC" "$w/src/app/i/page.tsx" - "L7 $lay a row without * names only itself"
  ps 2 "$LC" "$w/src/app/xy.ts" - "L15 $lay a row without * names only itself, ? included"
  ps 2 "$LC" "$w/src/app/a/b/layout.tsx" - "L8 $lay * stays within one path segment"
  ps 2 "$LC" "$w/src/app/i/x.css" - "L12 $lay in a row with *, [id] is literal"
  ps 0 "$LC" "$w/src/app/[id]/x.css" - "L13 $lay in a row with *, [id] names itself"
  ps 2 "$LC" "$w/src/app/layout.tsx" - "L14 $lay * stands for one whole segment, never none"
  gs "$w" revert --no-edit HEAD # each of L9–L11 judges its own commit alone; L11's 0 proves the reverts
  mkdir -p "$w/src/app/i" && echo i > "$w/src/app/i/page.tsx" && gs "$w" add src/app/i && gs "$w" commit -q -m "feat(todos): B9.10 i"
  cps 1 "$w" "L9 $lay a row without * names only itself, in the diff"
  gs "$w" revert --no-edit HEAD
  mkdir -p "$w/src/app/a/b" && echo b > "$w/src/app/a/b/layout.tsx" && gs "$w" add src/app/a && gs "$w" commit -q -m "feat(todos): B9.10 a/b"
  cps 1 "$w" "L10 $lay * stays within one path segment, in the diff"
  gs "$w" revert --no-edit HEAD
  mkdir -p "$w/prisma/migrations/1_x" && echo m > "$w/prisma/migrations/1_x/migration.sql" && echo l > "$w/prisma/migrations/migration_lock.toml"
  gs "$w" add prisma && gs "$w" commit -q -m "feat(todos): B9.10 migration"
  cps 0 "$w" "L11 $lay prisma/migrations/* covers every migration file"
done
rm -rf "$LS" "$GS"; export PATH="$PATH_SAVED"; unset SMOKE_GHF

echo "== dev-lead formats a reviewer's review.md (B1.74)"
DL=.claude/agents/dev-lead.md
# the block dev-lead runs: the first bash fence under "## Committing a review", run here exactly as written
BLOCK="$(awk '/^## Committing a review/ { s = 1; next } s && /^## / { exit } s && /^```bash$/ { b = 1; next }
  b && /^```$/ { exit } b' "$DL" | sed 's/<card>/B9.9/g')"
para() { # para <first-line regex>: dev-lead.md from that line to the next numbered Loop item or heading
  awk -v re="$1" '$0 ~ re { p = 1; print; next } p && (/^[0-9]\. \*\*/ || /^## /) { exit } p' "$DL"
}
FRR="$(mktemp -d)"; mkdir -p "$FRR/bin" "$FRR/word"
printf '#!/bin/sh\n[ "$1" = exec ] && shift\n[ "$1" = prettier ] && shift\nexec %q "$@"\n' "$PWD/node_modules/.bin/prettier" > "$FRR/bin/pnpm"
# a formatter that formats and also changes one word: the change the block must refuse
printf '#!/bin/sh\n"%s/bin/pnpm" "$@" || exit $?\nfor a; do case $a in -*|exec|prettier) ;; *) sed "s/approved/rejected/" "$a" > "$a.t" && mv "$a.t" "$a" ;; esac; done\n' "$FRR" > "$FRR/word/pnpm"
mkdir -p "$FRR/digit"
printf '#!/bin/sh\n"%s/bin/pnpm" "$@" || exit $?\nfor a; do case $a in -*|exec|prettier) ;; *) sed "s/519/518/" "$a" > "$a.t" && mv "$a.t" "$a" ;; esac; done\n' "$FRR" > "$FRR/digit/pnpm"
printf '#!/bin/sh\nexit 2\n' > "$FRR/fails"; mkdir -p "$FRR/fail"; cp "$FRR/fails" "$FRR/fail/pnpm"
chmod +x "$FRR/bin/pnpm" "$FRR/word/pnpm" "$FRR/digit/pnpm" "$FRR/fail/pnpm"
fr_repo() { # fr_repo: a scratch repository with the project's Prettier config; prints its path
  local r; r="$(mktemp -d "$FRR/repo.XXXXXX")"
  git -C "$r" init -q; cp .prettierrc .prettierignore "$r/"; mkdir -p "$r/backlog/work/B9.9"
  gs "$r" add -A; gs "$r" commit -q -m init; echo "$r"
}
run_block() { # run_block <repo> <pnpm dir>: the extracted block in <repo>; 99 when there is no block
  [[ -n "$BLOCK" ]] || return 99
  (cd "$1" && PATH="$2:$PATH" bash -c "$BLOCK") >/dev/null 2>"$FRR/err"
}
fr() { # fr <id> <ok?> <label>
  n=$((n+1)); if [[ "$2" == 0 ]]; then echo "ok   $1 $3"; else echo "FAIL $1 $3"; fail=1; fi
}
staged() { [[ -z "$(git -C "$1" diff --name-only -- "$2")" && -n "$(git -C "$1" diff --cached --name-only -- "$2")" ]]; }
nothing_staged() { [[ -z "$(git -C "$1" diff --cached --name-only -- "$2")" ]]; }
pretty() { "$PWD/node_modules/.bin/prettier" --stdin-filepath x.md < "$1"; }
F=backlog/work/B9.9/review.md
UNF='## Plan review (round 1)

|Check|Result|
|---|---|
|Files|ok|

* Verdict: approved
* two  spaces   here
'
# FR1
r=0
[[ -n "$BLOCK" ]] || r=1
[[ "$(printf '%s\n' "$BLOCK" | grep -c 'prettier')" == 1 ]] && printf '%s\n' "$BLOCK" | grep -qF 'prettier --write "$f"' || r=1
para '^4[.] [*][*]Review the plan' | grep -q 'Committing a review' || r=1
para '^7[.] [*][*]Review the diff' | grep -q 'Committing a review' || r=1
sed -n '1,/^## Control-plane rules/p' "$DL" | grep -q 'Committing a review' || r=1
fr FR1 "$r" "dev-lead.md: the section and its block, Prettier on that one file; Loop 4, Loop 7 and the preamble point to it"
# FR2
R="$(fr_repo)"; printf '%s' "$UNF" > "$R/$F"
run_block "$R" "$FRR/bin"; rc=$?
[[ $rc -eq 0 ]] && staged "$R" "$F" && [[ "$(cat "$R/$F")" == "$(printf '%s' "$UNF" | pretty /dev/stdin)" ]]; fr FR2 $? "an untracked unformatted review.md is formatted as Prettier does and staged (rc $rc)"
# FR3
R="$(fr_repo)"; printf '%s' "$UNF" > "$R/$F"
run_block "$R" "$FRR/word"; rc=$?
[[ $rc -ne 0 && $rc -ne 99 ]] && nothing_staged "$R" "$F" && printf '%s' "$UNF" | cmp -s - "$R/$F" && grep -q 'not committed' "$FRR/err"
fr FR3 $? "a formatter that also changes a word is refused: the reviewer's text restored, nothing staged (rc $rc)"
# FR4
R="$(fr_repo)"; printf '%s' "$UNF" | pretty /dev/stdin > "$R/$F"; gs "$R" add -A; gs "$R" commit -q -m r1
printf '\n## Plan review (round 2)\n\n|Check|Result|\n|---|---|\n|Files|ok|\n' >> "$R/$F"
run_block "$R" "$FRR/bin"; rc=$?
[[ $rc -eq 0 ]] && staged "$R" "$F" && grep -q '^| Check | Result |$' "$R/$F" && [[ "$(grep -c '^## Plan review' "$R/$F")" == 2 ]]
fr FR4 $? "round 2 appended to a committed round 1 is formatted and staged (rc $rc)"
# FR5
R="$(fr_repo)"; printf '%s' "$UNF" | pretty /dev/stdin > "$R/$F"; cp "$R/$F" "$FRR/before"
run_block "$R" "$FRR/bin"; rc=$?
[[ $rc -eq 0 ]] && cmp -s "$R/$F" "$FRR/before" && staged "$R" "$F"; fr FR5 $? "an already formatted review.md is staged unchanged (rc $rc)"
# FR6
R="$(fr_repo)"; printf '%s' "$UNF" > "$R/$F"
run_block "$R" "$FRR/fail"; rc=$?
[[ $rc -ne 0 && $rc -ne 99 ]] && nothing_staged "$R" "$F" && printf '%s' "$UNF" | cmp -s - "$R/$F"; fr FR6 $? "Prettier failing leaves the reviewer's text and stages nothing (rc $rc)"
# FR7
R="$(fr_repo)"; printf '## Diff review (pass 1)\n\n1. first\n2. second\n4. fourth\n' > "$R/$F"
run_block "$R" "$FRR/bin"; rc=$?
[[ $rc -eq 0 ]] && staged "$R" "$F" && grep -q '^3\. fourth$' "$R/$F"; fr FR7 $? "a misnumbered list Prettier renumbers is accepted and staged (rc $rc)"
# FR8
R="$(fr_repo)"; printf '## Diff review (pass 1)\n\nThe probe ran in round\n2) as well, with exit\n0) both times.\n' > "$R/$F"
run_block "$R" "$FRR/bin"; rc=$?
[[ $rc -eq 0 ]] && staged "$R" "$F" && grep -q 'round 2) as well' "$R/$F"
fr FR8 $? "a wrapped line starting 2) that Prettier joins upward is accepted and staged (rc $rc)"
# FR9 (review pass 1): a plan review ends on "Verdict: approved" with no final newline; Prettier adds only that
R="$(fr_repo)"; printf '## Plan review (round 1)\n\nVerdict: approved' > "$R/$F"
run_block "$R" "$FRR/bin"; rc=$?
[[ $rc -eq 0 ]] && staged "$R" "$F" && [[ "$(tail -c 1 "$R/$F" | od -An -c | tr -d ' ')" == '\n' ]]
fr FR9 $? "a review.md with no final newline is accepted, given one and staged (rc $rc)"
# FR10 (review pass 1): digits count, not only letters
R="$(fr_repo)"; printf '%s\nhook-smoke: 519 probes OK\n' "$UNF" > "$R/$F"
run_block "$R" "$FRR/digit"; rc=$?
[[ $rc -ne 0 && $rc -ne 99 ]] && nothing_staged "$R" "$F" && grep -q '519 probes' "$R/$F"
fr FR10 $? "a formatter that also changes a digit is refused, the reviewer's text restored (rc $rc)"
# FR11 (review pass 1): a misnumbered list written with ")" is renumbered and accepted
R="$(fr_repo)"; printf '## Diff review (pass 1)\n\n1) first\n2) second\n4) fourth\n' > "$R/$F"
run_block "$R" "$FRR/bin"; rc=$?
[[ $rc -eq 0 ]] && staged "$R" "$F" && grep -q '^3\. fourth$' "$R/$F"; fr FR11 $? "a misnumbered 1) 2) 4) list is accepted and staged (rc $rc)"
rm -rf "$FRR"

echo "== review gate (require-review.sh / mark-reviewed.sh)"
STATE="node_modules/.cache/level-up-lab"; saved=""; [[ -f "$STATE/reviewed" ]] && saved="$(cat "$STATE/reviewed")"
rm -f "$STATE/gate-warned"
out="$(printf '{"session_id":"smoke"}' | "$H/require-review.sh")"; n=$((n+1))
if git diff --quiet HEAD -- src e2e prisma && [[ -z "$(git ls-files --others --exclude-standard -- src e2e prisma)" ]]; then
  [[ -z "$out" ]] && echo "ok   require-review.sh silent on a clean tree" || { echo "FAIL require-review.sh spoke on a clean tree"; fail=1; }
else
  echo "skip require-review.sh (tree already has changes under src/e2e/prisma)"
fi
rm -f "$STATE/gate-warned"; [[ -n "$saved" ]] && printf '%s\n' "$saved" > "$STATE/reviewed"

echo "== wiring (every hook named in settings.json exists and is executable)"
for h in $(grep -o '\.claude/hooks/[a-z-]*\.sh' .claude/settings.json | sort -u); do
  n=$((n+1)); if [[ -x "$h" ]]; then echo "ok   wired $h"; else echo "FAIL wired $h missing or not executable"; fail=1; fi
done
n=$((n+1)); if grep -q 'SessionStart' .claude/settings.json && grep -q 'session-mark\.sh' .claude/settings.json; then
  echo "ok   SessionStart runs session-mark.sh"; else echo "FAIL SessionStart does not run session-mark.sh"; fail=1; fi

echo "== session-mark.sh / scripts/require-hooks.sh"
COMMON="$(git rev-parse --path-format=absolute --git-common-dir)"; SID="smoke-$$"; ENVF="$(mktemp)"
printf '{"session_id":"%s"}' "$SID" | env -u CLAUDE_CODE_SESSION_ID CLAUDE_ENV_FILE="$ENVF" CLAUDE_PROJECT_DIR="$PWD" "$H/session-mark.sh"; n=$((n+1))
if [[ -f "$COMMON/claude-hooks/$SID" ]] && grep -q '^export LEVEL_UP_LAB_HOOKS=' "$ENVF"; then
  echo "ok   session-mark.sh wrote the marker and the env export"; else echo "FAIL session-mark.sh wrote no marker or env export"; fail=1; fi
req() { # req <expected-exit> <label> <env assignments...>
  local want="$1" label="$2" rc; shift 2; n=$((n+1))
  env -u CLAUDE_CODE_CHILD_SESSION -u CLAUDE_CODE_SESSION_ID -u LEVEL_UP_LAB_HOOKS "$@" scripts/require-hooks.sh >/dev/null 2>&1; rc=$?
  if [[ $rc -eq $want ]]; then echo "ok   require-hooks exit $rc  $label"; else echo "FAIL require-hooks exit $rc (want $want)  $label"; fail=1; fi
}
req 0 'outside Claude Code'
req 1 'Claude Code, no marker, no env' CLAUDE_CODE_CHILD_SESSION=1 CLAUDE_CODE_SESSION_ID="none-$$"
req 0 'Claude Code, marker for this session' CLAUDE_CODE_CHILD_SESSION=1 CLAUDE_CODE_SESSION_ID="$SID"
req 0 'Claude Code, env from CLAUDE_ENV_FILE' CLAUDE_CODE_CHILD_SESSION=1 LEVEL_UP_LAB_HOOKS="$PWD"
rm -f "$COMMON/claude-hooks/$SID" "$ENVF"

echo; [[ $fail -eq 0 ]] && echo "hook-smoke: $n probes OK" || { echo "hook-smoke: FAILURES above"; exit 1; }
