Records **D-37**, E7's batch rule: spec first. The lead chose option A of `backlog/work/B7.1/decision-request.md` in the orchestrating session: "đồng ý spec trước, D-37 theo đề xuất, bỏ B7.6".

Stacked on #289, the E7 card filing. Merge #289 first.

- `backlog/00-decisions.md`: D-37.
  - Each card's section (35–40), contract file (`33-*.md` … `38-*.md`), feature id (F33–F38) and component.
  - One `src/app/page.tsx` card per batch (B7.2, B7.4).
  - The lines each card lifts, edits, or states do not apply, in its own `docs(spec)` commit.
  - **Spec first:** each section lands in an attended `docs(spec)` PR before its issue is labeled.
- `backlog/README.md`: D-37 struck in Blocked by of rows 122–127; the "Waiting on human" row removed.
- `backlog/plan/E7-todos-hints.md`: Depends on reads ~~D-37~~.
- `backlog/work/B7.1/decision-pr-body.md`: this body.

The table in `00-decisions.md` is re-padded by Prettier, because the new row is wider than its column. That file has no union merge.

No spec, src, test or config change. `scripts/ci/check-backlog.sh` → OK, `check-spec-sections.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
