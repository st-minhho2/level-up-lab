## Item

B1.79 — build roles write files with Write/Edit, not Bash text, so guard-bash's secret rule stops refusing their code
edits (tooling, no spec section)

- spec: none — tooling (invariant 7; `guard-bash.sh` unchanged); no `src/` change, no section
- test: `scripts/hook-smoke.sh` RP1–RP6 (new). Red `7ecce3e` (no `(red)` marker, plan): 6 FAIL, 581 ok. Green `6d52d16`: "hook-smoke: 587 probes OK". Review pass 1 `7122241` adds RP7–RP10 (the forbidden forms in each prompt): "hook-smoke: 591 probes OK"; with test-writer's list line deleted, 1 FAIL. `pnpm test` 207, e2e 44, mutation 93.40 (no `src/` change; reviewer); `check-agent-frontmatter`, `check-plan-scope`, `check-backlog` OK; `.claude/hooks/` and `settings.json` unchanged.
- acceptance: 4 of 4 met — the four prompts state the rule with their exceptions (RP1–RP10); guard-bash unchanged and the 581 existing probes keep their verdicts; the measure is set (guard-bash secret-rule denials per runner log: 4 in #207's rerun, 0 in #214, #215; counted again on the next E5 runs) [after merge]; label `config-change-approved`.
- risk tier: high (`.claude/`); label `config-change-approved` (D-19)
- re-scope: the lead stopped a guard-bash redesign after 3 plan reviews (`backlog/work/B1.79/guard-redesign-stopped.md`)

## Plan

### B1.79 plan — build roles write files with Write/Edit, not Bash text (tooling, no §)

Approach: re-scoped by the lead (2026-11-05, option p) after the guard redesign stopped
(`guard-redesign-stopped.md`: 3 plan reviews, 20 bypasses reported). `guard-bash.sh` stays as it is on `main`. The 4 denials
of #207's rerun came from test-writer and code-writer patching files through Bash text; Write and Edit never pass
through guard-bash (and path-guard checks only Write and Edit), so the four roles that change files get one rule in
their prompt, same opening sentence in each, with each role's own exceptions. No advice (tier quick, no section).
Risk tier **high** (`.claude/`, D-28) → the lead's `approve`; the PR carries `config-change-approved` (D-19).

#### Files

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

#### Interfaces touched

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

#### Verification

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

#### Work breakdown

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

## Map delta

None: tooling card, no `spec/features-map.md` row.

## Review

Plan review: the stopped guard redesign took rounds 1–3 (20 bypasses reported; `guard-redesign-stopped.md`); the
re-scoped plan took 2 rounds (r1: a `(red)` subject would fail `verify-red.sh --auto`, RP5–RP6, test count; r2
approved). Lead approved at the gate after 1 round. Diff review: 1 pass, ready for PR (`backlog/work/B1.79/review.md`).

| Pass | #   | Finding                                                                         | Source   | Kind     | Disposition | Justification                                                                 |
| ---- | --- | ------------------------------------------------------------------------------- | -------- | -------- | ----------- | ----------------------------------------------------------------------------- |
| 1    | 1   | RP1–RP4 check only the rule's heading; deleting the forbidden-form list kept OK | reviewer | coverage | fix now     | `7122241`: RP7–RP10 check the list in each prompt; list line deleted → 1 FAIL |

Riskiest unfalsified: nothing enforces the rule, so whether test-writer and code-writer stop patching files through
Bash shows only in the measure on the next E5 runner logs (4 denials before).

## Evidence

- AC met: 4/4 (tooling Acceptance clauses; the measure's "after" count waits for the next E5 runs)
- tier: high
- plan deviations: none (`check-plan-scope` OK; RP7–RP10 are review-pass probes in a planned file)
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the green commit; the green `chore(` commit touches no probe.
- [ ] n/a: no `src/` change, no `AC-§.n`, no mutation target.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change carries `config-change-approved`.
- [ ] n/a: no migration.
- [ ] `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
