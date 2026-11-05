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
| `scripts/hook-smoke.sh`         | section "role prompts: files change through Write or Edit only (B1.79)": RP1–RP6         | Test line    |
| `scripts/CLAUDE.md`             | the `hook-smoke.sh` row names RP1–RP6                                                    | doc drift    |
| `backlog/plan/E1-todos.md`      | card B1.79 re-scoped: title, Status, Spec, Test, Acceptance                              | re-scope     |
| `backlog/README.md`             | row 95 and node S95 carry the new title                                                  | re-scope     |
| `backlog/work/B1.79/*`          | guard-redesign-stopped.md, plan, review, pr-body                                         | pipeline     |

## Interfaces touched

Body text only; no frontmatter, hook or tool list changes. The paragraph (identical in the four files; the role line
after it differs):

```
**Files change through Write or Edit only (B1.79).** Create or change a repository file with the Write or Edit tool,
never through Bash text: no heredoc into a file or an interpreter (`cat > f <<'EOF'`, `python3 - <<'PY'`), no
`python3 -c`, `node -e`, `sed -i`, `perl -i`, `tee` or `>` that writes a repository file. Bash runs commands (tests, git,
formatters, `scripts/`) and reads their output. guard-bash judges a command's whole text, so code in it that mentions
`event.key` or the dotenv file is refused as a secret read; the path hooks check only Write and Edit.
reviewer:  Your probes on the copy under `$TMPDIR` still write with Bash; `review.md` is written with Write or Edit.
dev-lead:  `pnpm exec prettier --write` on `review.md` ("Committing a review") and `scripts/*` are commands, not edits.
```

hook-smoke, `grep -qF` per file, ok or FAIL, counted in `n` like every probe: RP1–RP4 `Files change through Write or
Edit only (B1.79)` in test-writer, code-writer, reviewer, dev-lead · RP5 `still write with Bash` in
reviewer (its `$TMPDIR` exception) · RP6 `are commands, not edits` in dev-lead (its Prettier exception).

## Verification

- Red `test(scripts): B1.79 role prompts state the Write/Edit rule` (no `(red)` marker: `verify-red.sh --auto` judges
  every `(red)` commit and fails one that touches no `*.test.ts(x)`, B1.62's mistake-log row; hook-smoke only, body "Red because no role file
  states the rule"): 6 FAIL lines (RP1–RP6), 581 ok.
- Green `chore(agents): B1.79 build roles write files with Write/Edit, not Bash text` (no probe file): "hook-smoke:
  587 probes OK" (the 581 existing verdicts unchanged); `git diff origin/main -- .claude/hooks/` empty;
  `scripts/ci/check-agent-frontmatter.sh` OK; `pnpm lint && pnpm typecheck` clean, `pnpm test` → 207 passed (33
  files, unchanged); `check-plan-scope.sh`, `check-backlog.sh` OK; CI green.
- Measure for later (not a gate): per runner log, tool results holding `guard-bash.sh: reading secret files` in
  `~/.level-up-lab/runs/*/*.jsonl` (inside the runner container). Before: 4 in `207/20261105T041944Z-185231.jsonl`,
  0 in the #214 and #215 runs. After: counted on the next E5 runs once this merges.

## Work breakdown

| Step | Role     | Produces           | Commit                                                                        |
| ---- | -------- | ------------------ | ----------------------------------------------------------------------------- |
| 1    | dev-lead | red probes RP1–RP6 | `test(scripts): B1.79 role prompts state the Write/Edit rule`                 |
| 2    | dev-lead | four role prompts  | `chore(agents): B1.79 build roles write files with Write/Edit, not Bash text` |
| 3    | reviewer | diff review        | `docs(backlog): B1.79 review pass N`                                          |
| 4    | dev-lead | draft PR, label    | —                                                                             |

Not in scope: `guard-bash.sh` (unchanged), advisor and spec-analyst prompts (they write `backlog/`/`spec/` text, not
code; none was refused), a hook that enforces the rule, the `.env.example` exemption (filed separately).

Costs (review round 4): nothing enforces the rule, only the prompts; the logs do not say why the roles patched through
`python3 -c` rather than Edit, so a cause other than habit would survive this card (the measure above shows it); a
headless dev-lead writes only `backlog/` and two `docs/` files through Write/Edit and now no Bash text either, so a
card that needs `scripts/` or `.claude/` written by dev-lead itself (as this one) runs from an interactive session, as
B1.78 did.

Plan review: approved, re-scoped round 2 (`review.md` round 5) · Plan approved by: lead, 2026-11-05 · Rounds: 1
