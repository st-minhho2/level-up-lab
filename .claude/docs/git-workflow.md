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

`git push --force` in any spelling, pushes to `main`, `gh pr merge|review`, `gh api`, labels, any change under
`.github/`, `.claude/hooks`, `.claude/settings.json`, `scripts/ci/`, `lefthook.yml`, `stryker.config.mjs`,
`vitest.config.mts`, `playwright.config.ts`, `tsconfig*.json`, `eslint.config.mjs` (label `config-change-approved`
on the PR), dependencies.

## Bringing `main` in

`git merge main` inside the worktree (the commit-msg hook accepts `Merge …`). Never rebase a pushed branch.

## Headless lane (documented, not wired)

`claude --agent dev-lead --print "/work-next"` runs one card to the human gate and stops; the same hooks apply.
