# B1.13 review

## Plan review (round 1)

SCOPE: none of lib | actions | ui. The plan touches `scripts/worktree-prune.sh`, a new `scripts/prune-smoke.sh`,
`scripts/CLAUDE.md` and `backlog/work/B1.13/`; no `src/`, `prisma/` or `e2e/` path, so no spec section, skeleton,
map row or Stryker run applies.

Plan reviewed at `8897a21` (`docs(backlog): B1.13 plan`), card at `f034f78`, local `main` = `8572cc2`. Probes ran on
copies under `$TMPDIR/b113rev/`: two throwaway compose-file directories (read-only `docker compose ps`), and a
throwaway git repo whose main checkout is named `level-up-lab`, running `8572cc2`'s `worktree-prune.sh` with a
logging `docker` shim first on `PATH` (the shim answers `ps` and `SELECT` with fixed text and runs nothing). The only
live query was a read-only schema/database listing on `level-up-lab-postgres-1`. The worktree was not edited.

### How the checklist was adapted to a tooling card (as B1.12)

| Row in `reviewer.md`                         | Read here as                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| files belong to the section's features (map) | files belong to the card's Test/Acceptance and the `scripts/CLAUDE.md` contract row (no §, no map)  |
| interfaces follow `ts-style.md`              | CLI flags, env seam and exit codes stated; bash 3.2-safe; `scripts/CLAUDE.md` row updated           |
| follows `advice.md`                          | no `advice.md` (Tier quick, no section): the skip must be stated                                    |
| ≤ 7 criteria, measurable Then                | the card's Test and Acceptance lines, and the plan's P1–P9                                          |
| exact commands with expected numbers         | unchanged                                                                                           |
| skeleton → red → green → map → review        | no skeleton, no map; red = smoke fails on `8572cc2`'s script on behavior, green = passes on the fix |
| `Lead approves spec` box                     | no section; the card's `Spec:`/`Test:` lines exist (`f034f78`)                                      |
| no settled D-n contradicted                  | unchanged; also invariant 2 (red first, never weakened), 7 (secrets) and the role write scopes      |

### Checklist

| Check                            | Result                                                                                                                                                                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| files belong to the card         | pass: both scripts are the card's Acceptance and Test; `scripts/CLAUDE.md` holds the prune row the card cites as its contract; `backlog/work/B1.13/` is the card's Work line.                                                                            |
| interfaces stated                | pass with gaps: `--no-fetch`, `--base origin/main`, `--schemas [--drop]` and `WORKTREE_PRUNE_DB` are pasted. Not stated: what `--schemas --drop --dry-run` does, and what the default run does with the orphan listing when Postgres is down (reason 2). |
| advice                           | pass: spec-analyst/advisor skip stated (no section; the card carries its lines).                                                                                                                                                                         |
| criteria measurable              | pass with one gap: P1–P9 each name an observable end state. The one destructive path, `--schemas --drop`, has no probe asserting that live worktrees' schemas survive it (reason 2).                                                                     |
| smoke isolation and red evidence | fail (confirmed): the plan's red claim and its isolation rule contradict each other (reason 1).                                                                                                                                                          |
| verification exact with numbers  | fail: the red input has no command or sha, the expected results have no counts, `$MAIN` is unset in the shell, and the `psql level_up_lab` check is prose (reason 4).                                                                                    |
| work breakdown                   | pass: red `test(scripts): B1.13 prune smoke` before green `fix(scripts): …`, review, PR; both subjects pass the `commit-msg` regex (`lefthook.yml:31`). The "tests untouched" guard does not cover this smoke (reason 5).                                |
| who edits `scripts/`             | pass: orchestrating session on the lead's approval of this plan, as B1.12; `dev-lead.md:11` limits dev-lead to `backlog/*`, `docs/metrics.md`, `docs/mistake-log.md`.                                                                                    |
| protected path and label         | pass (confirmed): none of the three paths matches `PROTECTED` in `scripts/ci/check-config-change.sh:10` (`scripts/ci/.*`, `verify-red.sh`, `next-task.sh`, `card-status.sh` only); no `config-change-approved` needed.                                   |
| costs stated for the lead        | fail: four behaviors the approach drops or assumes are not stated as costs (reason 3).                                                                                                                                                                   |
| `Lead approves spec` box         | n/a: no section.                                                                                                                                                                                                                                         |
| no settled D-n contradicted      | pass: D-1…D-17 rule roles, gates and §5–§11; none governs `scripts/`. D-13 (test commit without `(red)`) is the shape the plan follows.                                                                                                                  |

### Probe runs

```
docker compose -f <dir>/docker-compose.yml ps -q --status running postgres     (read-only)
  <dir> = $TMPDIR/b113rev/level-up-lab                    f46a9483…   (the live container: project = dir basename)
  <dir> = $TMPDIR/b113rev/loving-franklin-1d640f          (empty)
  <dir> = .claude/worktrees/loving-franklin-1d640f        (empty)     (card's :40/:43 defect reproduced)
  container labels: project=level-up-lab, working_dir=/Users/…/level-up-lab, config_files=…/level-up-lab/docker-compose.yml

8572cc2 worktree-prune.sh, throwaway repo, main checkout named level-up-lab, docker shim logging calls
  default run, worktree with no commits (.worktrees/prune-smoke-empty)
    [prune] prune-smoke-empty  (ancestor; …)  →  docker compose … psql … -d level_up_lab … -c DROP SCHEMA IF EXISTS "wt_prune_smoke_empty" CASCADE;
  default run, unmerged worktree whose directory was moved away
    [keep] … then `git worktree prune` erased its metadata (card's :136 defect reproduced)
  --schemas --dry-run from the main checkout, live nested .claude/worktrees/app-co/.worktrees/prune-smoke-live-nested
    [orphan] wt_prune_smoke_live_nested   [orphan] wt_prune_smoke_orphan   → 2 would be dropped

docker exec level-up-lab-postgres-1 psql … (read-only)
  level_up_lab schemas: public, wt_fix_b1_13_prune_every_layout   databases: level_up_lab, postgres, template0, template1
```

### Verdict: changes requested

1. **The smoke's isolation rule and its red claim contradict each other, and as written the red run either reaches
   `level_up_lab` or proves nothing.** P8 needs the compose project to come from the throwaway main checkout's
   directory name, so the throwaway main must be named `level-up-lab` (confirmed above: any compose file in a
   directory with that basename reaches the live container; any other basename finds nothing, for the fixed script
   too). From that directory, `8572cc2`'s script hard-codes `-d level_up_lab` and, in a default run, prunes P4's
   no-commit worktree as `ancestor` and sends `DROP SCHEMA IF EXISTS "<smoke schema>" CASCADE` to `level_up_lab`
   (confirmed with the shim). The plan's guard, "probes that need `WORKTREE_PRUNE_DB` report FAIL on a script without
   it instead of touching level_up_lab", covers every non-dry-run probe (P1–P4, P7, P8 all drop a schema), so the
   expected red "FAIL P1 P2 P3 P4 P7 P8" would come from the guard, not from the old script's behavior: the red
   proves nothing about the card's five defects. State one mechanism that both protects `level_up_lab` and lets
   `8572cc2`'s script run on behavior, for example: the smoke puts a `docker` wrapper first on `PATH` that forwards to
   the real binary but rewrites `-d level_up_lab` to the throwaway database and aborts the smoke on any other
   database name (with that, `WORKTREE_PRUNE_DB` may not be needed in the production script at all); the smoke
   unsets `COMPOSE_PROJECT_NAME`/`COMPOSE_FILE` (either one would make P8 pass on the old script); and every smoke
   slug is unique to the run (e.g. `prune-smoke-<pid>-…`), so even a bypass is a no-op on `level_up_lab`. Then list
   which probes fail on `8572cc2` on behavior and with which line (e.g. P1 `[keep] … not merged`, P8 `postgres not
running; schema … left in place`).
2. **The destructive path has no keep-assertion, and two flag combinations are unspecified.** Today `--schemas` run
   from the main checkout classifies a live nested worktree's schema as `[orphan]` (confirmed above); in the real
   repo that is `wt_fix_b1_13_prune_every_layout`, this card's own schema. The plan fixes the claim set ("no surviving
   worktree claims") but P7 only checks that the orphan is listed and dropped. Make P7 also assert that after
   `--schemas --drop`, run from both checkouts, the schemas of every kept worktree in all three layouts (a nested
   `.claude/worktrees/<name>/.worktrees/<slug>`, P4's, P5's) still exist and exactly one schema (the orphan) is gone.
   State in Interfaces that `--schemas --drop --dry-run` drops nothing (P9 covers only the default run), and that a
   default run with Postgres down still exits 0 and removes merged worktrees, printing that the orphan list was
   skipped (the old script's "left in place" behavior; an `exit 1` there would stop pruning when Docker is off).
3. **State the costs for the lead before approval.** (a) Branches with no commits beyond `origin/<base>` are now kept
   unless `gh` shows a merged PR at that tip, so the `ancestor` reason is gone whenever `gh` is missing, logged out or
   offline: a branch merged by fast-forward or merge commit then stays forever (low in this repo, which squash-merges,
   `git-workflow.md:46`, but a dropped behavior). (b) The Postgres server is found only if `docker compose up -d` ran in
   the main checkout (true today: container `working_dir` = the main checkout). Started from a worktree, as CLAUDE.md's
   "run from the worktree you were given" invites, its project is that worktree's name and every drop prints "postgres
   not running"; say so, or resolve the container another way. (c) A directory gone from disk loses its schema
   whatever the merge state, so a worktree moved by hand (not `git worktree move`) or on an unmounted volume loses its
   data irreversibly; the card asks for this, the lead should see it. (d) `--schemas --drop` drops with no prompt.
4. **Pin the Verification and give numbers.** Add the red input command, e.g.
   `git show 8572cc2:scripts/worktree-prune.sh > "$TMPDIR/prune-main.sh"`; define `$MAIN` (or write
   `docker compose -f "$(git worktree list --porcelain | sed -n '1s/^worktree //p')/docker-compose.yml" ps postgres`);
   give counts: red → "6 FAIL (P1 P2 P3 P4 P7 P8), 3 ok (P5 P6 P9), exit 1", green → "9 ok, 0 FAIL, exit 0"; replace
   "psql level_up_lab: wt_* schemas before = after" with the command and today's value:
   `docker exec level-up-lab-postgres-1 psql -At -U postgres -d level_up_lab -c "SELECT nspname FROM pg_namespace WHERE nspname LIKE 'wt\_%' ORDER BY 1"`
   → `wt_fix_b1_13_prune_every_layout` before and after both runs, and `SELECT datname FROM pg_database` → the same four
   databases after the smoke (throwaway database gone). Note that `scripts/verify-red.sh B1.13` exits 1 by design (no
   `(red)` commit; `scripts/verify-red.sh:59-61`) while CI's `--auto` exits 0 (`:43-46`), so the diff review records it
   as not applicable.
5. **The "tests untouched" guard does not see this smoke.** `scripts/ci/check-feat-commits.sh` checks only subjects
   matching `^feat(\(|:)` against `\.test\.tsx?$|^e2e/` (confirmed, lines 10-11), so the `fix(scripts): …` green
   commit could edit `scripts/prune-smoke.sh` and no CI job would notice. State that the green commit touches no line
   of `scripts/prune-smoke.sh`, that any later smoke change lands in its own `test(scripts): B1.13 …` commit with the
   reason in its body, and that the diff review checks `git diff <test-sha>..HEAD -- scripts/prune-smoke.sh` is empty.

Notes (no change requested):

- The plan is 61 lines against planning.md's "≈ 40"; B1.12's was similar. Moving P1–P9 into the smoke's header and
  citing it would bring it back to one screen.
- bash 3.2 has no `globstar`: "`$MAIN/**/.worktrees/<slug>`" has to be a `case` pattern (`*` matches `/` there), with
  the slug checked for no further `/`.
- On macOS `$TMPDIR` is `/var/folders/…` while git prints `/private/var/folders/…` (seen in the probe output). The
  smoke's expected paths need `pwd -P`, or path comparisons fail on the fixed script too.
- `test(scripts)` uses a scope outside `backlog/CLAUDE.md`'s `<pkg>` list (`todos`, `health`, `env`, `ui`); it is
  covered by the stated "Deviations, as B1.12".
- The `scripts/CLAUDE.md` `card-status.sh` row splits its columns on the `|` in `<Open|Partial|Done>`; the planned edit
  is in the same table, so escaping it there is a one-character fix if the lead wants it in scope.
- The order the plan states (no-commit check before `pr` / `tree` / `cherry`) matters: `git merge-tree` of the base
  and one of its ancestors returns the base's tree, so a no-commit branch would otherwise match `tree`.

Riskiest unfalsified: the claim set behind `--schemas --drop` (which worktrees count as surviving, in which layout,
from which checkout); a mistake there drops a live worktree's schema with no prompt, and no planned probe asserts it.
