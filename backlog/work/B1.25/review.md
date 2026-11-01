# B1.25 reviews

## Plan review (round 1)

Plan reviewed at 728a89e. How I probed it: I made a detached scratch worktree of HEAD under `$TMPDIR` with node_modules
linked. For each fixture I built a base commit and a `test(todos): B9.9 probe (red)` commit with `git commit-tree`
(plumbing, so no hooks ran), then ran HEAD's `verify-red.sh` and a copy with the planned
`m[2].replace(/\\(.)/g, '$1')`.

| Probe (old title at the base → red commit adds …)                                         | HEAD script                         | planned fix                                     |
| ----------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------- |
| V1 `'… \'\' …'` + new failing                                                             | exit 1, GREEN names the old title   | exit 0, "2 ran (1 new), 1 new failed"           |
| V2 `"… \"quoted\" …"`, `` `… \`tick\` …` `` + new failing                                 | exit 1, GREEN names both old titles | exit 0                                          |
| V3 `'… \'\' …'` + new passing                                                             | exit 1, GREEN names **both** titles | exit 1, GREEN names only the new title          |
| `'a\\b'` + new failing                                                                    | exit 1                              | exit 0                                          |
| `'line\nbreak'`, `'tab\tsep'` + new failing                                               | exit 1                              | exit 1 (old counted new: fails closed)          |
| `` `${'x'} \`y\`` `` + new failing                                                        | exit 1                              | exit 1 (old counted new: fails closed)          |
| `.each` `'… \'%s'` (placeholder last) / `"… \"q\" %s"` + new failing                      | exit 1                              | exit 0                                          |
| `.each` `'it\'s %s here'` (placeholder mid-title) + new failing                           | exit 1                              | exit 1 (fails closed)                           |
| P1 `'AC-0.1: query \'\''` + new **passing** `"AC-0.1: query '' is trimmed"` + new failing | exit 1                              | **exit 0: the new passing test is let through** |
| P2 `'AC-0.1: query'` + new **passing** `'AC-0.1: query is trimmed'` + new failing         | **exit 0** (already open at HEAD)   | exit 0                                          |
| B4.2 `--range 0118ee5..b5fc079`                                                           | exit 1, GREEN: AC-16.5 ×2           | "RESULT: red for the right reason"              |

A `src/lib/probe-b99.test.ts` fixture runs in the `unit` project (`src/**/*.test.ts`), and `vitest.config.ts`'s
`loadDotEnv()` works without a `.env`.

| Check                                                                | Result                                                                                                                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| every file belongs to the card (tooling, no § / map row)             | pass: `scripts/verify-red.sh`, a new smoke, `scripts/CLAUDE.md` row, work files                                                |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | pass: n/a (no `src/`); CLI arguments, output and exit codes unchanged                                                          |
| follows `advice.md` or states the deviation                          | pass: advisor skipped and stated (tooling); the lead chose A for B4.2                                                          |
| ≤ 7 criteria, every Then measurable                                  | fail: the card's "a new passing test still fails the gate" does not hold for P1, and V3 cannot detect the break (reasons 1, 2) |
| verification lists exact commands with expected numbers              | fail: `<B4.2 base>` is a placeholder, "after merge" is not needed, and the smoke's expected final line is not given (reason 5) |
| work breakdown with convention subjects                              | fail: subjects are not exact (`(red)` would break CI `--auto`), and the footer line is missing (reason 6)                      |
| `Lead approves spec` box                                             | pass: n/a (no section); approval is the `Plan approved by:` line, left for the lead                                            |
| no settled D-n contradicted                                          | pass: D-19 label planned; D-13 precedent (no `(red)`) needs stating, see reason 6                                              |
| `scripts/next-task.sh --check B1.25`                                 | pass: "[next-task] B1.25: no overlap with any Doing or Review card"                                                            |

Verdict: changes requested

1. **The fix lets a new passing test through (confirmed, P1).** `isNew` (verify-red.sh:119) treats a reported title
   as old when it _starts with_ any base title. The rule is meant for `.each`, but it applies to every title. Once
   the fix makes `'AC-0.1: query \'\''` readable, a new passing `"AC-0.1: query '' is trimmed"` counts as old, and the
   script exits 0. HEAD exits 1 on the same input. This breaks the card's Acceptance ("a new passing test still fails
   the gate"). It is a realistic shape: B4.2's AC-16.5 titles are long sentences that start with the same words. The
   underlying gap already exists at HEAD for plain titles (P2 exits 0). The plan must pick one option and state its
   cost:
   - (a) Prefix-match only titles that come from an `.each(` call or contain a `%` placeholder, and match every other
     title exactly. Add a probe V4 with the P1 shape that expects exit 1 and names only the new title. If the lead
     wants the plain-title case closed too, add a P2-shaped probe.
   - (b) Keep `startsWith` and record P1/P2 as an accepted gap with a follow-up card id. Then the Acceptance line
     cannot be claimed as met.
2. **V3 cannot detect a broken fix (confirmed).** At HEAD, V3 already exits 1 with "GREEN before implementation",
   because the escaped old title is counted too. A fix that matched no titles at all would also pass V3. V3 must
   assert the file line `2 ran (1 new), 0 new failed, 1 new passed`, and that the GREEN list names only the new
   title, not the old escaped one.
3. **State what the unescape does not decode.** `\(.)` → `$1` turns `\n` into `n`, `\t` into `t` and `é` into
   `u00e9`. Old titles with those escapes still count as new (confirmed for `\n` and `\t`: exit 1 with the fix, same
   as HEAD). That fails closed, so it does not loosen the gate. There is one way it fails open, found by trace and
   not by a run: an old `'a\nb'` would hide a new passing `'anb'`. Template `${…}` titles and `.each` titles with a
   placeholder mid-title also still fail closed (pre-existing). Either decode the JS single-character escapes
   (`\n \t \r \b \f \v \0 \xHH \uHHHH \u{…}`, line continuation) with one probe, or add one line to the plan that
   names these as out of scope. The card's Acceptance only names quotes, so either is acceptable.
4. **The smoke's mechanics are not specified.**
   - **Commits:** `git commit` in a detached worktree of this repo runs the shared Lefthook hooks for every fixture
     commit: pre-commit (prettier, eslint, whole-project `tsc`, `require-hooks.sh`, gitleaks) and commit-msg.
     `--no-verify` or `LEFTHOOK=0` there bypasses the real repo's hooks (invariant 6). The existing smokes use
     `--no-verify` only in `git init` throwaway repos. Name the mechanism: plumbing (a temporary `GIT_INDEX_FILE` with
     `hash-object -w` / `update-index --cacheinfo` / `write-tree` / `commit-tree`, which I used: no hooks, only
     dangling objects), or a `git init` throwaway repo with `package.json`, `vitest.config.ts`, `vitest.setup.ts`,
     `tsconfig.json`, `scripts/load-env.ts` and linked node_modules.
   - **Script under test:** a "worktree of HEAD" holds HEAD's _committed_ `verify-red.sh`. Run the checkout's
     `SCRIPT="$PWD/scripts/verify-red.sh"` with the cwd in the scratch (`worktree-smoke.sh` pattern). verify-red
     `cd`s to the cwd's toplevel, so `ROOT` is the scratch and its node_modules link resolves.
   - **Cleanup:** add `trap` EXIT → `git worktree remove --force` + `git worktree prune`.
   - **Fixture:** keep it `.ts` under `src/` (`.tsx` goes to the jsdom project).
5. **Verification is not concrete.** Replace line 2 with
   `scripts/verify-red.sh B4.2 --range 0118ee5..b5fc079`. b5fc079 is already in the object store, so it runs in the
   card worktree now. Expected: HEAD exits 1 with `GREEN before implementation: AC-16.5 …` ×2; fixed prints
   `todo-search-form.test.tsx: 4 ran (2 new), 2 new failed, 0 new passed` and "RESULT: red for the right reason", exit 0. For the smoke, give the exact final line at each commit (e.g. test commit `… 2 FAIL` naming V1 and V2, with V3
   (and V4) ok; fix commit `N ok, 0 FAIL`), under bash 5 and `/bin/bash` 3.2.
6. **Exact commit subjects and the footer line.** Write the card's own test commit as
   `test(scripts): B1.25 … ` **without** `(red)`, as B1.21–B1.23 did. With `(red)`, CI's `verify-red.sh --auto`
   (ci.yml:154) picks it up and fails with "test(B1.25) commits touch no *.test.ts(x) file". Also add the template
   footer `Plan review: … · Plan approved by: · Rounds: 1` (dev-lead.md:52) so the lead's approval has a line to land
   on.

Riskiest unfalsified: whether a title whose escaped form collides with a different real title occurs in this repo's
existing tests. I traced the `\n` → `n` case but did not scan all `src/**/*.test.ts*` titles.
