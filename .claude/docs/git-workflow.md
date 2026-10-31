# Git workflow

## Lifecycle of a card

1. `scripts/worktree.sh feat/B1.2-edit-title` → `.worktrees/b1-2-edit-title/`, branch `feat/B1.2-edit-title`, own
   port and PostgreSQL schema. The main checkout stays on `main` and is never edited.
2. Spec and card first (`docs(spec)`, `docs(backlog)`), plan approved by the human (`work/<card>/plan.md`).
3. `/tdd-loop`: `chore(<pkg>): B1.2 skeleton` → `test(<pkg>): B1.2 … (red)` → `feat(<pkg>): B1.2 …` →
   `docs(map): F6 … [B1.2]`.
4. `/review-loop` until clean; `.claude/hooks/mark-reviewed.sh`.
5. Commit, `git push -u origin feat/B1.2-edit-title`, `gh pr create` with every template section (Item / Plan /
   Map delta / Review). Never merge; a human does, after CI and review.
6. After the merge: `scripts/card-status.sh B1.2 Done "<sha>, <tests>"` on `main` (one `docs(backlog)` commit) and
   `scripts/worktree-prune.sh`.

## Runs without asking

Routine git (`status`, `diff`, `log`, `add`, `commit`), pushes of your own `feat/*` branch, `gh pr create|view|diff|
checks|comment`. Everything the project scripts do.

## Needs a human (and the hooks say so)

`git push --force` in any spelling, pushes to `main`, `gh pr merge|review`, `gh api`, the `hotfix` label, any change under
`.github/`, `.claude/hooks`, `.claude/settings.json`, `.claude/agents`, `.claude/skills`, `.claude/rules`,
`.claude/docs`, `scripts/ci/`, `lefthook.yml`, `stryker.config.mjs`, `vitest.config.mts`, `playwright.config.ts`,
`tsconfig*.json`, `eslint.config.mjs` (label `config-change-approved` on the PR: the agent adds it when the lead's
approved plan names the change, D-19), dependencies.

Adding or removing a label (`config-change-approved`, `hotfix`) starts a fresh `ci` run that reads the new labels and
cancels the one in flight. "Re-run jobs" replays the old event and never sees a label added after it.

The label check, `check-feat-commits.sh` and `verify-red.sh --auto` run in `guards` on pull requests only. The push
to `main` after a squash merge has no labels and one commit titled after the PR, so they cannot judge it; `guards`
still runs the diff and tree checks there (suppressions, AC coverage, spec sections, features map, backlog).

## Bringing `main` in

`git fetch origin && git merge origin/main` inside the worktree (the commit-msg hook accepts `Merge …`); never rebase
or force push a pushed branch. A card does it before it reports a PR ready (dev-lead Loop 9) and again when a
sibling's merge leaves it BEHIND: the ruleset blocks a branch that is not up to date. A clean merge re-runs
`mark-reviewed.sh`; a conflict goes back through the build and review steps. `scripts/worktree.sh` cuts new branches
from a freshly fetched `origin/main` (B1.21). The PR is a draft from the plan gate until CI is green on the merged
head; only then `gh pr ready` and the report to the lead.

## Hotfix lane

For a production incident only, and never as a silent bypass:

1. Branch `hotfix/<card or incident id>` from `main`, PR labelled `hotfix` (a maintainer adds the label).
2. Minimal gate: `lint`, `typecheck`, `test` (unit + component) and **one human review**. `e2e`, `mutation`, `semgrep`
   and `guards` are skipped by the label (`ci.yml`); the ruleset still requires the review.
3. Squash-merge, deploy.
4. Within **one working day** a follow-up PR without the label restores the full gate: regression test as a
   `test(<pkg>): <card> … (red)` commit, section update if behavior changed, mutation back above 70 %. The follow-up
   links the hotfix PR, and a row in `docs/mistake-log.md` names what let the bug through.

## Headless lane (documented, not wired)

`claude --agent dev-lead --print "/work-next"` runs one card to the human gate and stops; the same hooks apply.
