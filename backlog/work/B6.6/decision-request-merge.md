# D-36 request: B6.6 cannot repair the section index after merging origin/main

Provisional id D-36 (the next free id on main at 2026-11-14; if a sibling files D-36 first, the lead renumbers, as
with D-34/D-35).

## What happened

Loop 9 merged `origin/main` (ca2a58d, B6.4) into `feat/B6.6-agent` as 2cb3ff2. Both sides had re-padded the shared
tables (B6.4's wider `30-clear-completed-count.md` cell on main; B6.6's `32-remaining-announce.md` row on this branch),
so `merge=union` kept every row twice (known issue B1.97, filed in #280):

- `spec/features-map.md`: repaired by `code-writer` in 4791869 (origin/main's copy plus the F32 row);
  `scripts/ci/check-features-map.sh` OK.
- `spec/technical-requirements.md`: **not repaired**. `scripts/ci/check-spec-sections.sh` fails ("§8 has 2 rows … a
  union merge kept both sides"), `pnpm exec prettier --check` fails, so `.claude/hooks/mark-reviewed.sh` fails and CI
  will be red.

No role may write the file through Write or Edit: `spec-analyst`'s path guard allows `spec/contracts/*` and
`backlog/*` only (`.claude/agents/spec-analyst.md:11`), although its own step 28 says to register a section there;
`code-writer` has `spec/features-map.md` only; dev-lead has `backlog/*`. `spec-analyst` was dispatched and refused by
the guard. Applying a patch through Bash would bypass the role guards (dev-lead B1.79), so the run stopped.

The correct content is known and mechanical: `git show origin/main:spec/technical-requirements.md`, plus one row
after §32:

```
| §34 | [contracts/32-remaining-announce.md](contracts/32-remaining-announce.md) | Todos: the remaining count is announced to assistive technology | ✗ |
```

then `pnpm exec prettier --write spec/technical-requirements.md`; `git diff origin/main -- spec/technical-requirements.md`
shows only that row.

## Options

| Option                                   | What                                                                                                                                                                                      | Cost                                   | Risk                                                   | Reversible |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------ | ---------- |
| **A (recommended)** Lead repairs by hand | the lead (or a session the lead runs) commits the repair above on `feat/B6.6-agent` as `docs(spec): B6.6 merge repair -- section index rows once (B1.97)`; the next run resumes at Loop 9 | one commit, a few minutes              | low: content fully specified, checked by two guards    | yes        |
| B. Widen `spec-analyst`'s guard          | add `'spec/technical-requirements.md'` to the path-guard list in `.claude/agents/spec-analyst.md` (a `.claude/` change: its own card, D-19), then spec-analyst repairs                    | a tooling card before B6.6 can finish  | low; also fixes the mismatch with spec-analyst step 28 | yes        |
| C. Allow dev-lead a git-only repair      | rule that dev-lead may `git checkout origin/main -- <table>` and apply the one-row patch through `git apply` for a union-merge repair                                                     | a standing exception to B1.79's spirit | medium: a precedent for writing spec through Bash      | yes        |

B and A are compatible: A unblocks B6.6 now, B (or B1.97's fix) stops the next card hitting this.

Affects: `spec/technical-requirements.md`, `.claude/agents/spec-analyst.md` (B only), B6.6 Loop 9, B6.5 (it will hit the
same duplicate when it merges main).

Reply with the option (for example "D-36: A").
