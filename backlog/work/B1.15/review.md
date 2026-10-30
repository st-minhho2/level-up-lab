# B1.15 review

## Plan review (round 1)

SCOPE: none of lib | actions | ui. Both options touch `docker-compose.yml` or `scripts/`, the advice files and
`backlog/work/B1.15/`. No `src/`, `prisma/` or `e2e/` path, so no spec section, skeleton, map row or Stryker run
applies.

I reviewed the plan at `a2dba3a` (`docs(backlog): B1.15 plan`). The card is at `6663614`, and
`git diff --stat 6663614..HEAD` shows `plan.md` only (local `main` is stale at `557797e`). Docker Compose is
v5.6.1. Only read-only Docker commands ran:

- `config`, `ps -q` and `--dry-run up -d`, from throwaway directories under the session scratchpad. Each directory
  held a copy of `docker-compose.yml` with `name: level-up-lab` added.
- `config` on the main checkout's base file plus `.devcontainer/` overlay.

`docker volume ls -q`, `docker network ls -q` and `docker ps -aq` were the same before and after. The worktree was
not edited. For the devcontainer project name I read the devcontainer CLI's `getProjectName`
(`devcontainers/cli` `src/spec-node/dockerCompose.ts`, `main`, read from the network into the scratchpad).

### How the checklist was adapted to a tooling card (as B1.13, B1.14)

| Row in `reviewer.md`                         | Read here as                                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| files belong to the section's features (map) | files belong to the card's Test/Acceptance and the `scripts/CLAUDE.md` contract (no §, no map)                      |
| interfaces follow `ts-style.md`              | CLI arguments, exit codes and probe ids stated; bash 3.2-safe                                                       |
| follows `advice.md`                          | no `advice.md` (Tier quick, no section). Here the choice between options is the lead's, so every cost must be true  |
| ≤ 7 criteria, measurable Then                | the card's Test and Acceptance lines, and the plan's C1–C7                                                          |
| exact commands with expected numbers         | unchanged                                                                                                           |
| skeleton → red → green → map → review        | no skeleton and no map. Red = the smoke fails on `6663614`'s compose file on behavior; green = it passes on the fix |
| `Lead approves spec` box                     | no section. The card's `Spec:`/`Test:` lines exist (`6663614`)                                                      |
| no settled D-n contradicted                  | unchanged; also invariant 2 (red first, never weakened) and invariant 6 (main checkout never edited)                |

### Checklist

| Check                             | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| files belong to the card          | pass. `docker-compose.yml` (a) or `scripts/compose.sh` plus the five advice sites (b) are the card's Acceptance. `compose-smoke.sh` is its Test. `scripts/CLAUDE.md` is the scripts contract. `git grep` finds no other bare-compose advice site: `worktree-prune.sh:113` and `prune-smoke.sh:44` already name `$MAIN`.                                                                                                                                                            |
| interfaces stated                 | pass. Both scripts' arguments are given, as is the smoke's exit code and its dependency on `level-up-lab-postgres-1`.                                                                                                                                                                                                                                                                                                                                                              |
| advice                            | pass. The skip is implied by Tier quick, and the plan states the recommendation (a).                                                                                                                                                                                                                                                                                                                                                                                               |
| criteria measurable               | pass with gaps. C1–C7 each name an observable (container id, no `Creat`/`Recreat`, unchanged `ls` output). C6's directory and its red expectation are not stated (reason 5).                                                                                                                                                                                                                                                                                                       |
| approach (a) works                | pass (confirmed). The named copy was tried in `level-up-lab/`, `level-up-lab/.worktrees/s`, `level-up-lab/.claude/worktrees/app` and `app/.worktrees/s`. In each, `ps -q postgres` = `f46a948370d7…`, and the dry-run prints only `Container level-up-lab-postgres-1 Running`. From this card worktree today, the dry-run would create `fix-b1-15-compose-one-project_pgdata` and its network.                                                                                     |
| approach (b) works                | pass (traced). `-f "$MAIN/docker-compose.yml"` is the form `worktree-prune.sh:66` and `prune-smoke.sh:43` already use against the live server.                                                                                                                                                                                                                                                                                                                                     |
| costs stated and true             | fail (confirmed). The devcontainer cost of (a) is not true (reason 1). Two costs of (a) are missing (reasons 2 and 3).                                                                                                                                                                                                                                                                                                                                                             |
| no data volume renamed or dropped | pass for this machine. The main checkout's basename is `level-up-lab`, so `level-up-lab_pgdata` stays in use. `feat-b1-4-mutation-feedback_pgdata` is untouched. No volume named `level-up-lab_pnpm-store` exists, so the devcontainer has never run here.                                                                                                                                                                                                                         |
| smoke isolation                   | fail. Nothing stops a real `up` against the live daemon on the red input (reason 4).                                                                                                                                                                                                                                                                                                                                                                                               |
| verification exact with numbers   | fail, partly. `hook-smoke` → `221 probes OK` and `check-backlog` → `OK` match today's output. The red line's `(+C6)` and C5's dependence on where the smoke runs are not exact (reason 5).                                                                                                                                                                                                                                                                                         |
| work breakdown                    | pass. Red `test(scripts): B1.15 compose smoke` comes before green `fix(compose): B1.15 one compose project from every checkout`, then evidence, `reviewer` diff and PR. Both subjects match the `commit-msg` regex (`lefthook.yml:31`, ≤ 72 chars). The deviation (orchestrating session edits, no `(red)`) is stated, as in B1.13/B1.14.                                                                                                                                          |
| protected path and label          | pass (confirmed). (a): `docker-compose.yml` is not in `PROTECTED` (`scripts/ci/check-config-change.sh:10`), so the label is required by `CLAUDE.md` "Ask before … configuration change", not by CI. (b): `.claude/skills/add-migration/SKILL.md` matches `\.claude/(…skills…)/.*`, so CI enforces the label. Not stated in the plan: `.github/CODEOWNERS` lists `/docker-compose.yml` and `/.claude/skills/`, so either option needs the code owner's review (see "Not blocking"). |
| one screen                        | 62 lines, above the ≈ 40 guideline. B1.13's approved plan was 68. Not blocking.                                                                                                                                                                                                                                                                                                                                                                                                    |
| `Lead approves spec` box          | n/a: no section.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| no settled D-n contradicted       | pass. D-1…D-17 do not govern compose or `scripts/`. The `test(scripts)` commit without `(red)` follows D-13's shape, as B1.13/B1.14 did.                                                                                                                                                                                                                                                                                                                                           |

### Probe runs

```
throwaway copies of docker-compose.yml + "name: level-up-lab"; COMPOSE_PROJECT_NAME/COMPOSE_FILE unset
  x/level-up-lab                                  ps -q = f46a9483…  dry-run: level-up-lab-postgres-1 Running
  x/level-up-lab/.worktrees/s                     ps -q = f46a9483…  Running
  x/level-up-lab/.claude/worktrees/app            ps -q = f46a9483…  Running
  x/level-up-lab/.claude/worktrees/app/.worktrees/s ps -q = f46a9483…  Running
  other/myclone   (directory not level-up-lab)    ps -q = f46a9483…  Running          ← reason 2
  x/level-up-lab/.worktrees/s, POSTGRES_PORT=5499 dry-run: level-up-lab-postgres-1 Recreate … Started  ← reason 3
this card worktree, file at a2dba3a (no name)     dry-run: Network/Volume fix-b1-15-compose-one-project_* Creating
main checkout base + .devcontainer overlay, `config` from /private/tmp and from .devcontainer/: name: level-up-lab
volume ls / network ls / ps -aq: identical before and after
```

### Reasons (changes requested)

1. **The devcontainer cost listed for (a) is not true (confirmed).** The plan says that under (a) the devcontainer
   "joins `level-up-lab`", and it marks this `[unverified]`. In fact the devcontainer already uses project
   `level-up-lab` today:
   - The devcontainer CLI's `getProjectName` checks, in order: `COMPOSE_PROJECT_NAME`, then `.env`, then the merged
     config's `name:`, then `basename(dirname(composeFiles[0]))`. The `_devcontainer` suffix applies only when the
     first file sits in `.devcontainer/`.
   - Here the first file is `../docker-compose.yml`, so the name is the main checkout's directory.
     `devcontainer.json:6` forbids opening a worktree as the workspace.
   - `docker compose -f <main>/docker-compose.yml -f <main>/.devcontainer/docker-compose.yml config` prints
     `name: level-up-lab` both from `/private/tmp` and from `.devcontainer/`.

   So `level-up-lab-app-1`, `level-up-lab_pnpm-store`, the reuse of `level-up-lab_pgdata`, and `stopCompose` stopping
   the Postgres that the worktrees share are all today's behavior. Under either option they stay as they are on this
   machine. (a) changes the devcontainer's project only for a clone whose directory is not `level-up-lab`, which is
   cost (2). Restate cost (1) that way and drop `[unverified]`. Then state `stopCompose` as a cost of both options,
   not of (a) alone. Under (b), "Devcontainer unchanged" is true but leaves out that cost.
   The card's "`.devcontainer/devcontainer.json:4` merges this file, so its project name changes too" is wrong for the
   same reason. That is for the lead to note; the reviewer does not edit cards.

2. **A cost of (a) is missing: every clone on the machine shares one project (confirmed).** A copy under
   `other/myclone` reaches the live server: `ps -q` = `f46a9483…` and the dry-run prints `Running`. With `name:`, any
   second clone of this repository on the same machine, whatever its directory, shares the container, the network
   and `level-up-lab_pgdata`. Its migrations and seed land in the same database, and `docker compose down -v` from
   any clone removes the one volume. Today, and under (b), each clone's project follows its own directory. The plan
   needs to state this next to cost (2).
3. **A cost of (a) is missing: the shared container follows the env of the checkout that runs `up` (shell env
   confirmed, `.env` plausible).** `POSTGRES_PORT=5499 docker compose --dry-run up -d` from a named worktree prints
   `Container level-up-lab-postgres-1 Recreate`. A real run would restart the server that every worktree uses, on a
   port that the other worktrees' `DATABASE_URL` do not name.
   Under (a), compose loads `.env` from the project directory, which is the checkout that runs it. A worktree's
   `.env` with a different `POSTGRES_PORT` therefore does the same; `worktree.sh:50-57` copies the main `.env`, so
   only an edited key triggers it.
   Under (b), `-f "$MAIN/…"` makes the main checkout's `.env` the one read, and only the shell env remains. Today a
   worktree's `up` creates a separate project instead of recreating the shared one. State this cost, and have the
   smoke `unset POSTGRES_PORT COMPOSE_PROJECT_NAME COMPOSE_FILE` so that a developer's shell cannot change a probe's
   result.
4. **The smoke has no isolation guard against a real `up`.** The plan's red run points the smoke at `6663614`'s file,
   which has no `name:`. In the throwaway directories, any probe that runs `up -d` without `--dry-run`, because of a
   typo or because the flag sits after the subcommand, would create real `s_pgdata`/`app_pgdata` volumes and
   networks, plus a container that cannot bind 5433. C7 detects that afterwards; it does not prevent it. State a
   guard in the plan, as `prune-smoke.sh` has: a `docker` shim first on `PATH` that forwards only
   `compose [-f …] config|ps …` and `compose [-f …] --dry-run up …` and exits 99 on anything else, with the denial
   failing the run.
5. **The red expectation is not exact.**
   - "FAIL C2 C3 C4 C5 (+C6)": state whether C6 fails on the red file, and from which directory C6 runs the overlay.
     From a throwaway `level-up-lab/` it resolves `level-up-lab` and passes on red; from the real worktree it fails.
     After reason 1, C6 proves only that the overlay resolves `level-up-lab`; name that as its assertion.
   - C5 ("the real checkout it runs in") passes on red when run from the main checkout. State that the red and green
     runs happen from this card's worktree, and give the expected `FAIL` list and exit code for that run.

### Not blocking

- Both options need the code owner's review on GitHub: `.github/CODEOWNERS` lists `/docker-compose.yml` (a) and
  `/.claude/skills/` (b). The PR body can name this next to the label.
- In favor of (a), unstated: a clone outside `level-up-lab` that opens the devcontainer while another
  `level-up-lab` project holds 5433 fails today on the port bind. Under (a) it joins instead. This is the same fact
  as reason 2, seen from the other side.

Verdict: changes requested
