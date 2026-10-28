# Backlog and specs

One folder per task: `FEAT-xxx-<slug>/spec.md` (EARS spec from `TEMPLATE.md`) plus the artifacts the roles leave
behind (`analysis.md`, `advice.md`, `plan.md`, `review.md`). The frontmatter of `spec.md` is the state.

- **Add a task**: copy `TEMPLATE.md` to `FEAT-xxx-<slug>/spec.md`, fill the frontmatter and section 1 (intent),
  set `status: backlog` and a `priority`. Sections 2–7 may stay empty; `spec-analyst` proposes them.
- **Owner**: `owner: agent` tasks are pickable; `owner: human` tasks wait for a person (a decision, content, a
  paid run) and never get picked. Rulings live in `docs/decisions.md` as D-n.
- **Pick a task**: `scripts/next-task.sh` (highest priority among `owner: agent`, `status: backlog`, all `depends_on` done). `/work-next [FEAT-xxx]` runs the
  pipeline described in `docs/pipeline.md`.
- **Change state**: `scripts/task-status.sh FEAT-xxx <status>` only. Order: backlog → analyzed → advised → planned →
  approved → in-progress → review → done; `blocked` from anywhere, back to its previous state when unblocked.
- **Ids** are sequential and never reused; `scripts/next-task.sh --list` shows them all.
