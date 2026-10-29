# B1.8 analysis

Written by `spec-analyst`; filed by `dev-lead` (the role's write of this new file was refused by the harness, content
unchanged).

Codebase facts (reads and probes of this worktree, HEAD `2914a8c`):

- `src/lib/logger.ts` `describeError` reads one property for the code: `const { code } = error as Error & { readonly code?: unknown };`
  then `...(typeof code === 'string' ? { code } : {})`, between `message` and `stack`. `LoggedError` already has
  `readonly code?: string`; no new export, type or constant is needed.
- `@prisma/client` is 6.19.3. `runtime/library.d.ts:2618-2622`: `PrismaClientInitializationError` has
  `errorCode?: string` and no `code`; `:2626-2627`: `PrismaClientKnownRequestError` has `code: string`. Probe
  (`node -e`, nothing written): `new PrismaClientInitializationError(msg, '6.19.3', 'P1001')` has own keys
  `clientVersion, errorCode, retryable, name`, `errorCode` `P1001`, `'code' in e` false, `typeof stack` `string`;
  without the third argument `errorCode` is `undefined`; `PrismaClientKnownRequestError` has `code` `P2002` and no
  `errorCode`. So under today's code a database-down entry is `name, message, stack`, as the card states.
- `src/lib/logger.test.ts` builds coded errors with `Object.assign(new Error(message), { code })` (helper
  `codedError`); it never imports Prisma. Three `AC-11.2:` tests exist (string code, number code, thrown string).
- `grep -rn errorCode src e2e`: 0 hits.
- D-14 is settled (`backlog/00-decisions.md`): `code` = string `code`, else string `errorCode`, else absent; no other
  property read; options B and C declined; §11 stays at 6 criteria.

Section extended: §11 in `spec/contracts/09-logging.md`: REQ-11.3 sentence, AC-11.2 cases (d) to (g) and their
Then, the Function contracts sentence on `code`, three Out-of-scope items, four Unchanged-behavior rows; a new
unticked approval box under the ticked B1.6 one; §11 set to ◐ in `spec/technical-requirements.md` (as B1.5 did for
§10). No REQ or AC id added or renumbered.

## Completeness

| Check                                | Result | Note                                                                                                                                                                                                |
| ------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | Intent unchanged ("find out afterwards which action failed and why"); a code for a database-down failure is part of "why". No property or class named in the Intent.                                |
| Every behavior has a REQ             | pass   | The one new behavior (fall back to a string `errorCode`) is in REQ-11.3; "no `errorCode` key written" and "no other property read" are in Function contracts and Out of scope.                      |
| One EARS pattern each                | pass   | REQ-11.3 stays event-driven (two WHEN clauses, Error and other value); no other REQ touched.                                                                                                        |
| ≤ 7 criteria                         | pass   | 6 (AC-11.1 to AC-11.6); AC-11.2 gains cases, not a new id (D-14: "§11 stays at 6 criteria"). `check-ac-coverage.sh`: §11 criteria=6 covered=6.                                                      |
| Every Then measurable                | pass   | (d) exact key order `name, message, code, stack` and `code` `P1001`; (e) `P2002`; (f) `P1001`; (g) no `code` key; (d)–(g) no `errorCode` key.                                                       |
| No banned adjective without a number | pass   | none in the added text (`Tier:` line untouched).                                                                                                                                                    |
| Out of scope                         | pass   | Added: a separate `errorCode` field or a field naming the source property (option B, declined), any other property (`meta`, `clientVersion`, `retryable`, `cause`), a `code` for a non-Error value. |
| Unchanged behavior with proof titles | pass   | 4 rows added (string `code`, number `code` alone, thrown string, Error with neither property); each title matched by `grep -cF` against `src/lib/logger.test.ts` (4 of 4, 1 each).                  |
| Dependencies done                    | pass   | `Depends on: ~~B1.6~~`; B1.6 Done (`f191c34`).                                                                                                                                                      |
| No settled D-n contradicted          | pass   | D-14 followed literally; D-12 (string code, scrubbing, stderr, no `console`) and D-11 untouched. No D-n cited in §11's text.                                                                        |
| Tier consistent                      | note   | Section `Tier: full` (6 criteria) unchanged; card `quick` (touches 1 criterion, no schema change, no new export). See question 3.                                                                   |
| Function contracts exact             | pass   | `logMutationFailure(action: MutationActionName, error: unknown): void` unchanged; the `code` sentence states both `typeof` checks and their order.                                                  |

Result: 11 pass, 1 note, 0 fail. CI scripts run after the edit: `check-ac-coverage.sh` OK, `check-backlog.sh` OK,
`check-spec-sections.sh` OK; `scripts/next-task.sh` returns B1.8.

## Open questions

1. **AC-11.2 cases (f) and (g) go beyond the decision request's (d) and (e).** Proposed: keep all four. Why: D-14's
   text decides both, and without them the two `typeof` checks are under-pinned for mutation testing: `code ?? errorCode`
   then one `typeof` passes (d) and (e) but logs no code for (f) (D-14 says `P1001`); dropping the `typeof` on
   `errorCode` passes (d) to (f) but writes the number `1001` for (g). Otherwise: drop (f) and (g); the green code is
   the same, the surviving-mutant risk rises.
2. **Test values: plain `Error` or the real Prisma class?** Proposed: plain `Error` with `Object.assign(new Error(m),
{ errorCode })`, a sibling of the existing `codedError` helper (add, do not change it). Why: the logger is typed on
   property names, never on Prisma (§11: "no Prisma import"); the existing AC-11.2 tests already use this shape.
   Otherwise: one additional (non-AC) test with `new PrismaClientInitializationError('…', '6.19.3', 'P1001')` from
   `@prisma/client/runtime/library` would catch a Prisma rename of `errorCode` on upgrade; extra, not a replacement.
3. **Tier and pipeline shape.** Proposed: card stays `quick`, section stays `full`; `advisor` not needed (D-14 settled
   the only design choice); no skeleton commit (no new export, so the red test fails on an assertion), so the order is
   `docs(spec)` → `docs(backlog)` → `test(todos): B1.8 … (red)` → `feat(todos)`.
4. **Approval box.** The extension needs the lead's tick (D-7); a new unticked `- [ ] Lead approves spec (lead, <date>)`
   line sits below the B1.6 one. The plan gate's "approve" may tick it.

Housekeeping for `dev-lead`: (a) `spec/features-map.md` F9 already names `src/lib/logger.ts` and
`src/lib/logger.test.ts`, no map change expected; (b) the closing commit flips §11 back to ✅ and removes the B1.8
README row; (c) the card's Status evidence quotes `src/lib/logger.ts:44`, true until the `feat` commit; (d)
`src/lib/CLAUDE.md` logger row needs no change; (e) the decision request's "(and (e) both)" is AC-11.2 (e).

## Needs a ruling

None. D-14 settles the rule (option A), the key layout (no separate key) and the criteria count.
