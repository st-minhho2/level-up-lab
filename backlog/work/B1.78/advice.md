# B1.78 advice: dev-lead's write guard stops at dev-lead in a headless run

Card: `backlog/plan/E1-todos.md` B1.78 (tooling, no §; D-27, D-28, D-29). Evidence: `backlog/work/B1.78/probe.md` (real
PreToolUse input of Claude Code 2.1.303, headless and interactive shapes). Reference implementation of the neighbouring
mechanism: `.claude/hooks/plan-scope.sh:44-46` already reads `agent_type` from the same input.

## Approaches

Facts that decide it (probe.md, 2.1.303):

- In `claude -p --agent X` the main agent's frontmatter hook also fires for every subagent's write, next to the
  subagent's own hook (`lead-fm, sub-fm, settings` for `b.txt`). That is the bug.
- `agent_type` is in every PreToolUse input: the main `--agent` session carries its own name, a subagent its own;
  `agent_id` exists only for subagents; `CLAUDE_CODE_AGENT` is the same for both, so it cannot tell them apart.
- A hook cannot know whose frontmatter it sits in (the input names the caller, not the hook's owner), so any
  scoping inside the hook needs the owner passed as an argument.
- Only `dev-lead` has the `Agent` tool (`grep '^tools:' .claude/agents/*.md`), so only its hook can see a
  dispatched role's call.

### A (recommended): `path-guard.sh --role <owner>`, dev-lead's frontmatter passes `--role dev-lead`

Change: `path-guard.sh` accepts an optional first pair `--role <name>` (before the patterns). With it, read
`agent_type` from the input and defer (`exit 0`, the role's own hook judges the call) only when ALL hold:

1. `agent_type` is non-empty and differs from `<name>`;
2. it matches `^[a-z][a-z0-9-]*$` (no path characters);
3. `$CLAUDE_PROJECT_DIR/.claude/agents/<agent_type>.md` exists and its frontmatter declares a hook command that runs
   `hooks/path-guard.sh` (that role is held by its own guard).

Everything else applies the owner's list unchanged: no `agent_type` (fail closed), `agent_type == <name>` (the lead's
own call, headless main session or interactive subagent), an unknown or unguarded type (`general-purpose`, `Explore`,
`claude`, a role whose file is missing or unparsable). A `--role` without a value blocks (misconfiguration, exit 2).
Without `--role` the script behaves exactly as today, so the five other roles' frontmatter does not change.

Variant A1 (defer to every other `agent_type`): simplest, but a headless dev-lead can dispatch `general-purpose`,
`Explore` or `claude`, which carry no guard of their own; today dev-lead's list incidentally binds them, after A1 they
write anywhere `plan-scope.sh` lets them (it still requires the path in the approved plan, but not role scope). That is
a new hole, so rejected.
Variant A2 (the one recommended above, condition 3): defer only to roles that declare their own path-guard, derived
from `.claude/agents/*.md` at run time, so a new role is covered without editing the script. A hard-coded list in the
script (A2b) is the alternative; it drifts when a role is added, so a smoke row would have to pin it. Prefer derivation.

Pros: fixes the bug at its cause in one place; the acceptance's three clauses hold by construction (each role by its
own guard, dev-lead refused review.md, src/, prisma/, e2e/ and tests because its own list is unchanged and its calls
carry `agent_type dev-lead`); interactive behaviour unchanged (dev-lead as a subagent also carries `dev-lead`);
fail-closed on every unknown, so a future Claude Code that drops or renames `agent_type` brings the bug back loudly
(permission denials) and never opens a write; `run.sh --check-binary` keeps proving the lead's own hook on the real
main-agent input without a change; no new dependency; bash 3.2-safe (`[[ =~ ]]`, `json_field` from `lib.sh`).
Cons: the deferral relies on the role's own hook firing (probe.md run 1: it does; an agent whose frontmatter fails to
parse is skipped by Claude Code, which `check-agent-frontmatter.sh` already guards in CI); the hook reads one agent
file per call; unguarded subagent types stay bound by dev-lead's list, which is the status quo, so a `general-purpose`
subagent still cannot write `src/` headless (acceptable: dev-lead dispatches the named roles for src/).
Fits rules: invariants 1-8 untouched (a hook change, no `src/`); `ts-style` n/a; `.claude/` and `scripts/` are CI-protected
so the PR carries `config-change-approved` (D-19) and the plan's tier is high (D-28).

### B (alternative): scope it from `scripts/agent/run.sh`

B1, run `claude -p` without `--agent dev-lead`: the main session has no frontmatter hook, so the bug disappears, but
dev-lead's guard disappears with it (acceptance: dev-lead still refused review.md, src/, prisma/, e2e/, tests) and so
do dev-lead's tools, model and system prompt; `plan-scope.sh` is not a substitute (it lets any file in the approved
plan through, review.md included). Rejected on the acceptance.
B2, keep `--agent dev-lead` and add a settings-level hook through `--settings`: the frontmatter hook is static and still
fires in the headless run, so the extra hook cannot switch it off; it would need the same `agent_type` switch in a script
anyway, i.e. A plus plumbing in `claude_run`, `check_binary` and `run-smoke.sh` (the shim asserts the exact argv).
B3, dispatch dev-lead as a subagent of a bare main session (probe run 2's shape): its hook stays its own, but a subagent
does not dispatch other subagents [unverified on 2.1.303: probe run 2 did not make `lead-probe` dispatch], the main
session adds a turn and a model cost per run, and `--agent dev-lead` is asserted in `run.sh` (init check, `check_binary`,
`run-smoke.sh`). Rejected: a larger change to the runner that D-27 depends on, for no gain over A.

Neither approach changes a client component (none involved): no server-rendered markup, no JavaScript-off or
pre-hydration submit to compare; no behaviour dropped by A except the incidental one above (general-purpose and
other unguarded subagents were bound by dev-lead's list before; under A2 they still are).

## Recommendation

Approach A, variant A2 with derivation (`--role` flag; defer only to roles whose frontmatter declares path-guard;
everything else, including a missing `agent_type`, applies the owner's list). Only dev-lead's frontmatter gets
`--role dev-lead`.

## Impact

| File                          | Add/Change | Signature                                                                                                                                                    | ACs                                |
| ----------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `.claude/hooks/path-guard.sh` | Change     | `path-guard.sh [--role <owner>] <glob>...`; new early `exit 0` as in A; header comment names why (B1.78)                                                     | card Acceptance 1-4 (no `AC-§` id) |
| `.claude/agents/dev-lead.md`  | Change     | frontmatter hook command gains `''--role'' ''dev-lead''` before `''backlog/*''` (one quoted scalar, prettier form)                                           | Acceptance 1, 3                    |
| `scripts/hook-smoke.sh`       | Change     | new section `== path-guard.sh --role (headless: the main agent's hook fires for a dispatched role, B1.78)`; `role_patterns dev-lead` gains `--role dev-lead` | Acceptance 1-4                     |
| `.claude/docs/hooks.md`       | Change     | `path-guard.sh <globs>` row and the "Role write scopes" note: `--role`, the three deferral conditions, fail closed                                           | Acceptance 4 (doc drift)           |
| `scripts/agent/run.sh`        | none       | `--check-binary` stays: dev-lead's own write is still blocked, on the real main-agent input                                                                  | Acceptance 2                       |

Client components: none. Backlog artifacts (`plan.md`, `review.md`, card status) are outside the table.

Doc drift: `.claude/docs/hooks.md` in the `feat(...)` commit (the doc is not a test file, so it may ride with it).
`docs/design/` and `spec/` do not mention path-guard internals (grep: only `hooks.md`, `dev-lead.md`, `hook-smoke.sh`).

Sketch (shape only, the code-writer owns the final text):

```bash
ROLE=""
if [[ "${1:-}" == --role ]]; then
  [[ $# -ge 3 ]] || block "path-guard.sh" "--role needs a role name and at least one pattern."
  ROLE="$2"; shift 2
fi
if [[ -n "$ROLE" ]]; then
  who="$(json_field agent_type)"
  if [[ -n "$who" && "$who" != "$ROLE" && "$who" =~ ^[a-z][a-z0-9-]*$ ]] \
     && grep -Eq '^[[:space:]]*command:.*hooks/path-guard\.sh' "${CLAUDE_PROJECT_DIR:-$PWD}/.claude/agents/$who.md" 2>/dev/null; then
    exit 0 # that role's own frontmatter hook judges its call (headless --agent: both hooks fire)
  fi
fi
```

## Risks

- Migration: none (no schema).
- Security: the change can only narrow what dev-lead's hook refuses, and only for a caller whose own hook exists.
  Spoofing: `agent_type` is set by the harness, not the model; a dispatched role cannot name another. If the role's own
  hook did not fire (frontmatter skipped as invalid YAML, or a directory without the checkout's trust record: probe.md
  notes both lead's and sub's frontmatter hooks vanish then), the write is unguarded for that role: before, dev-lead's
  hook would have caught it only if it fired too, and it vanishes in the same trust case; invalid YAML is already a CI
  failure (`check-agent-frontmatter.sh`). `plan-scope.sh` (settings-level, fires always) stays the second line.
- Fail-open path to watch: the grep in condition 3 matching prose. It is anchored to a `command:` line that names
  `hooks/path-guard.sh`; the smoke fixture includes an agent file that mentions path-guard only in its body (must still
  apply the list).
- Unverified on the real binary: the `agent_type` value for `general-purpose`, `Explore`, `claude` subagents (probe.md
  covers custom agents only). The design does not depend on it: any value that is not a guarded role applies the list.
- Version drift: if a later Claude Code renames `agent_type` (for example a plugin-qualified name `ns:reviewer`),
  the regex rejects it and the old behaviour (bug) returns visibly, never a wider write. `--check-binary` only proves
  dev-lead's own block; it does not prove the deferral. A live check is cheap and manual: the lead's next headless run
  reaching the reviewer's `review.md` with permission denials 0 (the B5.2 run had 4); [unverified] until that run.
- Performance: one `node` call (`json_field`) more per dev-lead-frontmatter write; negligible.
- Isolation: no state, no port; CLAUDE_PROJECT_DIR is what `lib.sh` already uses.
- Existing tests that could turn red: `hook-smoke.sh` section "agent frontmatter": the `dev-lead` row compares the
  hook command's arguments with `role_patterns` (string equality), so the test commit and the frontmatter change must
  agree; `scripts/ci/check-agent-frontmatter.sh` (the doubled-quote scalar must still parse); the per-layout loop passes
  `role_patterns` straight to `path-guard.sh`, so it will pass `--role dev-lead` first (fine: the input has no
  `agent_type`, the list applies). `run-smoke.sh` does not touch hooks (shim); verify by running it.
- D-28 tier: high (`.claude/` and hooks are protected). A runner `agent-ready` issue would stop for the lead; this card
  runs interactively and keeps the gate anyway. PR needs `config-change-approved` (D-19), added by the agent.
- Process: the `test(...)` commit edits only `scripts/hook-smoke.sh`; the `feat(...)` commit must not touch it
  (`check-feat-commits.sh` lists `*.test.ts(x)`, `e2e/` as test paths; the smoke file is the card's test by the card's
  `Test:` line, so keep it in the red commit by convention and do not edit it in feat).

## Test strategy

| Layer                              | File                                                                  | ACs            | Mocks                                                                     |
| ---------------------------------- | --------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------- |
| hook-smoke (real hook, stdin JSON) | `scripts/hook-smoke.sh`                                               | Acceptance 1-4 | none: the real `path-guard.sh`; a temp project dir for the fixture agents |
| frontmatter parse                  | `scripts/ci/check-agent-frontmatter.sh` (existing, run by hook-smoke) | Acceptance 3   | none                                                                      |
| live (manual)                      | next headless run past the review commit                              | Acceptance 1   | the lead's own claude login; [unverified] until then                      |

Red probe (the one `scripts/verify-red.sh B1.78` must see fail on behaviour): section
`== path-guard.sh --role (B1.78)`, row HG1: `path-guard.sh --role dev-lead 'backlog/*' 'docs/metrics.md'
'docs/mistake-log.md' '!backlog/00-decisions.md' '!backlog/work/*/review.md'` fed
`{"tool_input":{"file_path":"<PWD>/backlog/work/B1.2/review.md"},"agent_type":"reviewer","agent_id":"a8cc1200e7c13e481"}`,
expected exit 0, red today because the script reads `--role` and `dev-lead` as patterns and the `!...review.md`
negation returns exit 2. Same input shape for HG2 (`agent_type test-writer`, `src/lib/todos.test.ts`, want 0) and HG3
(`code-writer`, `src/lib/todos.ts`, want 0): both red today for the same reason (`backlog/*` does not cover them).
Rows (new, bash 3.2-safe, use the existing `probe` helper with a JSON builder `hl_json <path> <agent_type|-> [agent_id]`):

| Id   | Mode                                                                                                             | Input (agent_type / path)                                                                                                                     | Want  | Red today?                                                                        |
| ---- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------- |
| HG1  | headless, dispatched reviewer                                                                                    | reviewer / `backlog/work/B1.2/review.md`                                                                                                      | 0     | yes (exit 2)                                                                      |
| HG2  | headless, dispatched test-writer                                                                                 | test-writer / `src/lib/todos.test.ts`                                                                                                         | 0     | yes                                                                               |
| HG3  | headless, dispatched code-writer                                                                                 | code-writer / `src/lib/todos.ts`                                                                                                              | 0     | yes                                                                               |
| HG4  | headless, dev-lead itself                                                                                        | dev-lead, no `agent_id` / `backlog/work/B1.2/review.md`                                                                                       | 2     | no (fence)                                                                        |
| HG5  | headless, dev-lead itself                                                                                        | dev-lead / `src/lib/todos.ts`, `prisma/schema.prisma`, `e2e/x.spec.ts`, `src/lib/todos.test.ts` (one row each)                                | 2     | no (fence)                                                                        |
| HG6  | headless, dev-lead itself                                                                                        | dev-lead / `backlog/work/B1.2/plan.md`                                                                                                        | 0     | no (fence)                                                                        |
| HG7  | interactive (subagent, has `agent_id`)                                                                           | dev-lead + `agent_id` / review.md, src/ (2), plan.md (0)                                                                                      | 2/0   | no (fence)                                                                        |
| HG8  | missing `agent_type` (fail closed)                                                                               | no key / `backlog/work/B1.2/review.md` and `src/lib/todos.ts`                                                                                 | 2     | no (fence)                                                                        |
| HG9  | unguarded type applies the list                                                                                  | general-purpose, Explore, claude / `src/lib/todos.ts`                                                                                         | 2     | no (fence)                                                                        |
| HG10 | unguarded type, allowed path                                                                                     | general-purpose / `backlog/work/B1.2/plan.md`                                                                                                 | 0     | no (fence)                                                                        |
| HG11 | hostile type name                                                                                                | `../hooks/lib` and `reviewer\n` / `src/lib/todos.ts`                                                                                          | 2     | no (fence)                                                                        |
| HG12 | fixture project without the role's file, or whose file only mentions path-guard in prose                         | reviewer / `src/lib/todos.ts`                                                                                                                 | 2     | no (fence)                                                                        |
| HG13 | `--role` without a name                                                                                          | `path-guard.sh --role` / any path                                                                                                             | 2     | yes (today `--role` is a pattern, path denied: exit 2, so not red; keep as fence) |
| HG14 | end to end through the real frontmatter command (`check-agent-frontmatter.sh --commands`, dev-lead row, `sh -c`) | reviewer / review.md -> 0; dev-lead / review.md -> 2; none / src -> 2                                                                         | 0/2/2 | first yes (red until the frontmatter changes)                                     |
| HG15 | the real frontmatter passes the flag                                                                             | `role_patterns dev-lead` = `--role dev-lead backlog/* docs/metrics.md docs/mistake-log.md !backlog/00-decisions.md !backlog/work/*/review.md` | equal | yes (red until dev-lead.md changes)                                               |
| HG16 | unchanged for the other five                                                                                     | existing `role_patterns` rows and the per-layout loop, no `--role`                                                                            | same  | no (existing rows stay green)                                                     |

Optional fence (cheap): every agent whose `tools:` line holds `Agent` must pass `--role <its name>` (today only
dev-lead); keeps a future orchestrator from reintroducing the bug.

Red proof: `scripts/verify-red.sh B1.78` must show HG1-HG3, HG14 and HG15 FAIL (assertion, not an import or a crash)
and every fence green on the unmodified hook; record the FAIL count in the test commit body ("Red because the guard
judges every caller by dev-lead's list").

## Mutation hot spots

`pnpm test:mutation` covers `src/lib` and `src/actions` only, so nothing here is scored; hand mutants for the review
(each must turn a smoke row red): drop the `!= "$ROLE"` test (HG4 must fail); drop the non-empty `agent_type` test (HG8);
drop the name regex (HG11); drop the agent-file test (HG12); invert the exit to defer on any type (HG9); drop the
`$# -ge 3` check (HG13); delete the dev-lead `--role` from the frontmatter (HG14, HG15); anchor-less grep (HG12 prose
fixture).

## Questions settled / escalated

```
Question:    How does the guard tell a dev-lead call from a dispatched role's call in a headless --agent session?
Class:       P2 spec silent (tooling, no section; resolved by evidence)
Sources:     backlog/work/B1.78/probe.md:35 "`agent_type` names the agent that made the call in every row, the main"
             backlog/work/B1.78/probe.md:37 "`CLAUDE_CODE_AGENT` is set in run 1 only (the `--agent` session); it is the same for the main"
             .claude/hooks/plan-scope.sh:8 "test files       also only as test-writer (`agent_type` of the subagent; the main thread carries none)"
Conflict:    plan-scope.sh's comment says the main thread carries no agent_type / probe.md says the main --agent session carries its own name
Verdict:     probe.md (real 2.1.303 input, newer evidence) governs: use `agent_type`, never `agent_id` presence or the environment
             variable. `agent_id` would be wrong for a headless main dev-lead (absent) versus an interactive dev-lead subagent
             (present), which must behave the same. plan-scope.sh's comment is stale for `--agent` sessions (the known limit
             named in hooks.md already says so); not part of this card.
Next action: use `json_field agent_type` in path-guard.sh as in the sketch.
Must not:    key on `agent_id` presence, on `CLAUDE_CODE_AGENT`, or on `CLAUDE_PROJECT_DIR` to guess who is calling.
Doc drift:   none beyond hooks.md in the feat commit (plan-scope.sh's comment is cosmetic; do not widen this card).
Escalate:    none
```

```
Question:    Which other agent types does dev-lead's hook defer to?
Class:       P2 spec silent (tooling)
Sources:     backlog/plan/E1-todos.md:995 "in a headless `--agent dev-lead` run each dispatched role is held by its own guard only"
             .claude/agents/dev-lead.md:4 "tools: Read, Grep, Glob, Write, Edit, Bash, Agent"
Conflict:    none (the card says "each dispatched role"; general-purpose/Explore/claude have no guard of their own)
Verdict:     the card's acceptance governs: defer only where "its own guard" exists, i.e. the roles whose frontmatter declares
             path-guard.sh (derived at run time). Unguarded types keep dev-lead's list, so no write path opens.
Next action: implement conditions 1-3 of Approach A.
Must not:    defer to every agent_type (a headless general-purpose subagent would write anywhere).
Doc drift:   none
Escalate:    none
```

```
Question:    What happens to a missing or unrecognised agent_type?
Class:       P0 no conflict (invariant 6: guards fail closed)
Sources:     .claude/hooks/path-guard.sh:1 "# PreToolUse hook for Edit|Write|MultiEdit, declared in a subagent's frontmatter with the paths that role may"
             .claude/rules/invariants.md:20 "6. **The main checkout is never edited; a card's branch is never force-pushed by an agent; hooks are never"
Conflict:    none
Verdict:     fail closed: a missing, empty, malformed or unguarded agent_type applies the owner's list (today's behaviour). The
             hook may only get stricter-or-equal than today for every caller except a guarded role, which its own hook binds.
Next action: smoke rows HG8, HG9, HG11, HG12 pin it.
Must not:    exit 0 when agent_type is absent.
Doc drift:   hooks.md in the feat commit.
Escalate:    none
```
