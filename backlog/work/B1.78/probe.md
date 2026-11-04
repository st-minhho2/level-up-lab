# B1.78 probe — the real PreToolUse hook input of Claude Code 2.1.303

Run 2026-11-04 in the runner container (`claude --version` → `2.1.303 (Claude Code)`), model claude-haiku-5-5,
`--permission-mode bypassPermissions`, in a throwaway directory under the container checkout's `.worktrees/` (a
directory without the checkout's trust record gets no frontmatter hook at all: a first try under `/tmp` recorded only
the settings hook, as B1.58 live check 1 found). Cost USD 0.011 for both runs. Each hook only recorded its stdin and
the names of `CLAUDE*` variables, then allowed the call.

- `lead-probe` (frontmatter hook tag `lead-fm`, tools Read, Write, Agent) stands in for dev-lead;
  `sub-probe` (frontmatter hook tag `sub-fm`, tool Write) for a dispatched role; `.claude/settings.json` adds a
  third hook tagged `settings`.
- Run 1, headless: `claude -p --agent lead-probe` writes `a.txt`, then dispatches `sub-probe`, which writes `b.txt`.
- Run 2, interactive shape: a main session without `--agent` dispatches `lead-probe` as a subagent, which writes `c.txt`.

## Result

| Run           | Writer                    | Hooks that fired              | `agent_type` | `agent_id`           |
| ------------- | ------------------------- | ----------------------------- | ------------ | -------------------- |
| 1 headless    | lead-probe (main session) | lead-fm, settings             | `lead-probe` | absent (key missing) |
| 1 headless    | sub-probe (subagent)      | **lead-fm**, sub-fm, settings | `sub-probe`  | `a8cc1200e7c13e481`  |
| 2 interactive | lead-probe (subagent)     | lead-fm, settings             | `lead-probe` | `a1a952ae7506180ac`  |

1. The bug, reproduced: in a headless `--agent` session the main agent's frontmatter hook also fires for the
   subagent's write (run 1, `b.txt`, `lead-fm`). The subagent's own hook fires too.
2. The input tells the writer apart: `agent_type` names the agent that made the call in every row, the main
   `--agent` session included; `agent_id` is present only for a subagent. Input keys of the main session:
   `agent_type cwd effort hook_event_name permission_mode prompt_id session_id tool_input tool_name tool_use_id
transcript_path`; a subagent's add `agent_id`.
3. Environment: `CLAUDE_CODE_AGENT` is set in run 1 only (the `--agent` session); it is the same for the main
   agent and its subagents, so it cannot tell them apart.

## Script

```bash
#!/usr/bin/env bash
# B1.78 probe: what PreToolUse hook input does a frontmatter hook get, for the --agent main session and for a
# subagent it dispatches? Runs in a throwaway dir; every hook only records its stdin (no secrets: hook input holds
# session ids, paths, tool input) and the names (not values) of CLAUDE* env vars, then allows the call.
set -uo pipefail
D="$(mktemp -d "$PROBE_PARENT/b178-probe-XXXXXX")"; cd "$D" || exit 1
: no git init: the trusted checkout above holds it
mkdir -p .claude/agents out
cat > rec.sh <<'EOF'
#!/usr/bin/env bash
tag="$1"; n="$(date +%s%N)"
cat > "$CLAUDE_PROJECT_DIR/out/$tag-$n.json"
env | sed -n 's/^\(CLAUDE[A-Z_]*\)=.*/\1/p' | sort | tr '\n' ' ' > "$CLAUDE_PROJECT_DIR/out/$tag-$n.env"
exit 0
EOF
chmod +x rec.sh
hook() { printf "hooks:\n  PreToolUse:\n    - matcher: 'Edit|Write|MultiEdit'\n      hooks:\n        - type: command\n          command: '\"\$CLAUDE_PROJECT_DIR/rec.sh\" %s'\n" "$1"; }
{ printf -- "---\nname: lead-probe\ndescription: probe lead\ntools: Read, Write, Agent\nmodel: inherit\n"; hook lead-fm; printf -- "---\nYou are a probe. Do exactly what the user says.\n"; } > .claude/agents/lead-probe.md
{ printf -- "---\nname: sub-probe\ndescription: probe sub\ntools: Write\nmodel: inherit\n"; hook sub-fm; printf -- "---\nWrite the file you are told to write, then stop.\n"; } > .claude/agents/sub-probe.md
cat > .claude/settings.json <<'EOF'
{"hooks":{"PreToolUse":[{"matcher":"Edit|Write|MultiEdit","hooks":[{"type":"command","command":"\"$CLAUDE_PROJECT_DIR/rec.sh\" settings"}]}]}}
EOF
P='Step 1: call Write with file_path a.txt and content a. Step 2: dispatch the sub-probe agent (Agent tool, subagent_type sub-probe) with the prompt "Write file_path b.txt content b". Then stop.'
claude --version
echo "== headless: claude -p --agent lead-probe"
claude -p --agent lead-probe --model claude-haiku-5-5 --max-turns 8 --permission-mode bypassPermissions \
  --output-format json "$P" > run1.json 2>run1.err </dev/null; echo "exit=$?"
mkdir -p out1; mv out/* out1/ 2>/dev/null
echo "== interactive-like: main session (no --agent) dispatches lead-probe as a subagent"
claude -p --model claude-haiku-5-5 --max-turns 8 --permission-mode bypassPermissions --output-format json \
  'Dispatch the lead-probe agent (Agent tool, subagent_type lead-probe) with the prompt "Call Write with file_path c.txt and content c. Then stop." Then stop.' > run2.json 2>run2.err </dev/null; echo "exit=$?"
mkdir -p out2; mv out/* out2/ 2>/dev/null
for o in out1 out2; do
  echo "== $o"
  for f in "$o"/*.json; do
    printf '%s %s\n' "$(basename "$f" .json | cut -d- -f1-2)" "$(jq -c '{fp:.tool_input.file_path, agent_id, agent_type, keys:(keys)}' "$f")"
  done
  echo "env names: $(cat "$o"/*.env | tr ' ' '\n' | sort -u | tr '\n' ' ')"
done
jq -c '{num_turns,total_cost_usd,is_error}' run1.json run2.json
echo "dir=$D"
```
