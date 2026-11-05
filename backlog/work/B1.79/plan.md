# B1.79 plan — build roles write files with Write/Edit, not Bash text (tooling, no §)

Approach: re-scoped by the lead (2026-11-05, option p) after the guard redesign stopped
(`guard-redesign-stopped.md`: 3 plan reviews, 20 bypasses reported). `guard-bash.sh` stays as it is on `main`. The 4 denials
of #207's rerun came from test-writer and code-writer patching files through Bash text; Write and Edit never pass
through guard-bash (and path-guard checks only Write and Edit), so the four roles that change files get one rule in
their prompt, same opening sentence in each, with each role's own exceptions. No advice (tier quick, no section).
Risk tier **high** (`.claude/`, D-28) → the lead's `approve`; the PR carries `config-change-approved` (D-19).

## Files

| File                            | Change                                                                                   | Why          |
| ------------------------------- | ---------------------------------------------------------------------------------------- | ------------ |
| `.claude/agents/test-writer.md` | the rule paragraph after the opening paragraph                                           | Acceptance 1 |
| `.claude/agents/code-writer.md` | the rule paragraph after the opening paragraph                                           | Acceptance 1 |
| `.claude/agents/reviewer.md`    | the rule paragraph after the opening paragraph; exception: probes on the `$TMPDIR` copy  | Acceptance 1 |
| `.claude/agents/dev-lead.md`    | the rule as a "Control-plane rules" bullet; exception: Prettier in "Committing a review" | Acceptance 1 |
| `scripts/hook-smoke.sh`         | section "role prompts: files change through Write or Edit only (B1.79)": RP1–RP4         | Test line    |
| `scripts/CLAUDE.md`             | the `hook-smoke.sh` row names RP1–RP4                                                    | doc drift    |
| `backlog/plan/E1-todos.md`      | card B1.79 re-scoped: title, Status, Spec, Test, Acceptance                              | re-scope     |
| `backlog/README.md`             | row 95 and node S95 carry the new title                                                  | re-scope     |
| `backlog/work/B1.79/*`          | guard-redesign-stopped.md, plan, review, pr-body                                         | pipeline     |

## Interfaces touched

Body text only; no frontmatter, hook or tool list changes. The paragraph (identical in the four files; the role line
after it differs):

```
**Files change through Write or Edit only (B1.79).** Create or change a repository file with the Write or Edit tool,
never through Bash text: no heredoc into a file or an interpreter (`cat > f <<'EOF'`, `python3 - <<'PY'`), no
`python3 -c`, `node -e`, `sed -i`, `perl -i`, `tee` or `>` that writes a file. Bash runs commands (tests, git,
formatters, `scripts/`) and reads their output. guard-bash judges a command's whole text, so code in it that mentions
`event.key` or the dotenv file is refused as a secret read; the path hooks check only Write and Edit.
reviewer:  Your probes on the copy under `$TMPDIR` still write with Bash; `review.md` is written with Write or Edit.
dev-lead:  `pnpm exec prettier --write` on `review.md` ("Committing a review") and `scripts/*` are commands, not edits.
```

hook-smoke RP1–RP4: `grep -qF 'Files change through Write or Edit only (B1.79)' .claude/agents/<role>.md` for
test-writer, code-writer, reviewer, dev-lead; ok or FAIL, counted in `n` like every probe.

## Verification

- Red `test(scripts): B1.79 role prompts state the Write/Edit rule (red)` (hook-smoke only, body "Red because no role
  file states the rule"): 4 FAIL lines (RP1–RP4), 581 ok.
- Green `chore(agents): B1.79 build roles write files with Write/Edit, not Bash text` (no probe file): "hook-smoke:
  585 probes OK" (the 581 existing verdicts unchanged); `git diff origin/main -- .claude/hooks/` empty;
  `scripts/ci/check-agent-frontmatter.sh` OK; `pnpm lint && pnpm typecheck && pnpm test` green; `check-plan-scope.sh`,
  `check-backlog.sh` OK; CI green.
- Measure for later (not a gate): per runner log, tool results holding `guard-bash.sh: reading secret files` in
  `~/.level-up-lab/runs/*/*.jsonl` (inside the runner container). Before: 4 in `207/20261105T041944Z-185231.jsonl`,
  0 in the #214 and #215 runs. After: counted on the next E5 runs once this merges.

## Work breakdown

| Step | Role     | Produces           | Commit                                                                        |
| ---- | -------- | ------------------ | ----------------------------------------------------------------------------- |
| 1    | dev-lead | red probes RP1–RP4 | `test(scripts): B1.79 role prompts state the Write/Edit rule (red)`           |
| 2    | dev-lead | four role prompts  | `chore(agents): B1.79 build roles write files with Write/Edit, not Bash text` |
| 3    | reviewer | diff review        | `docs(backlog): B1.79 review pass N`                                          |
| 4    | dev-lead | draft PR, label    | —                                                                             |

Not in scope: `guard-bash.sh` (unchanged), advisor and spec-analyst prompts (they write `backlog/`/`spec/` text, not
code; none was refused), a hook that enforces the rule, the `.env.example` exemption (filed separately).

Plan review: pending (re-scoped plan; the old design's rounds 1–3 stay in `review.md`) · Plan approved by: · Rounds: 1
