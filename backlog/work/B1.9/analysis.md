# B1.9 analysis

Written by `spec-analyst`; filed by `dev-lead` (the harness refused this role's write of this new file; content
unchanged).

Codebase facts (reads and probes of this worktree, HEAD `57da80a`):

- `src/lib/logger.ts:25` `secretsOf` returns `[url, new URL(url).password].filter((secret) => secret !== '')` inside a
  `try` whose `catch` returns `[]`. `scrub` (`:32-38`) applies `replaceAll` in array order, then `slice`. The URL comes
  first today only because of its position in the array, not because of its length.
- WHATWG `URL` probes (`node -e`, nothing written):
  - `new URL('postgresql://app:p%40ss%2fw@db.internal:5432/lab').password` is `p%40ss%2fw` (the hex case is kept).
  - `decodeURIComponent` of that gives `p@ss/w`. `encodeURIComponent` of the decoded form gives `p%40ss%2Fw` (upper-case
    hex), a third string.
  - `postgresql://app:p@ss@…` gives `password` `p%40ss` (decoded `p@ss`).
  - `?sslpassword=k%23ey&password=q%26w` stays as written in `url.search`. `url.searchParams` decodes it (`k#ey`,
    `q&w`) and turns `+` into a space (`a+b` → `a b`).
- `decodeURIComponent('p%zz')` throws `URIError`. §4's schema (`zod` 4.6.7, `z.string().url()`) accepts both
  `postgresql://app:p%zz@db.internal:5432/lab` and `…/lab?password=%zz` (probe: `success: true`). A naive
  implementation that decodes inside today's single `try` returns `[]` for such a URL and redacts nothing, not even the
  whole URL. That would redact less than today's code. AC-11.3 (g) pins the safe reading.
- A reference algorithm was run over every AC-11.3 case (scratch script, outside the repo). The new rule gives exactly
  the Then strings. Today's code gives: (c) `auth p@ss/w, p%40ss%2Fw, [redacted]`; (d) the message unchanged;
  (e) `key [redacted]-ssl`; (f) `db down` (already green); (g) `Can't reach [redacted] as [redacted] or q%zz`. A widened
  but unsorted list also gives (e) `key [redacted]-ssl`, so (e) pins "longest first".
- `src/lib/logger.test.ts` mocks `@/lib/env` with `env.getEnv.mockReturnValue({ DATABASE_URL })` for each test. The
  existing "no password" test already overrides it inside the test, so (c) to (g) need no new helper.

Section extended: §11 in `spec/contracts/09-logging.md`: REQ-11.4 rewritten (secret forms, longest first, empty never,
an undecodable form left out); AC-11.3 Given/When/Then gain cases (c) to (g), (a) and (b) untouched; the Intent's
closing paragraph names the query parameters; the Redaction sentence in Function contracts rewritten; Out of scope
gains 8 items; Unchanged behavior gains 7 rows; a new unticked approval box. No REQ or AC id added or renumbered. §11
stays ◐ in `spec/technical-requirements.md`. Card B1.9 gains its `Spec:`, `Test:` and `Acceptance:` lines.

## Completeness

| Check                                | Result | Note                                                                                                                                                                                              |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | The Intent's first paragraph is unchanged; the closing paragraph names what counts as a secret, not how it is found.                                                                              |
| Every behavior has a REQ             | pass   | Each new form, the length order, "empty never" and "undecodable left out" are in REQ-11.4; the exact parsing is in Function contracts.                                                            |
| One EARS pattern each                | pass   | REQ-11.4 stays Unwanted behavior (IF … THEN); no other REQ touched.                                                                                                                               |
| ≤ 7 criteria                         | pass   | 6 (AC-11.1 to AC-11.6); AC-11.3 gains cases, as AC-11.2 did under D-14. `check-ac-coverage.sh` OK.                                                                                                |
| Every Then measurable                | pass   | (c) to (g) each give an exact `error.message` string.                                                                                                                                             |
| No banned adjective without a number | pass   | None in the added text.                                                                                                                                                                           |
| Out of scope                         | pass   | Added: redaction of `name`/`code`, other query parameters, names in another case or percent-encoded, `+` read as a space, decoding more than once, fragments of a secret, other environment keys. |
| Unchanged behavior with proof titles | pass   | 7 rows added; each title matches exactly once by `grep -cF` in `src/lib/logger.test.ts`.                                                                                                          |
| Dependencies done                    | note   | `Depends on: ~~B1.8~~`: B1.8's code is on main (`287c5a4`, #29); its closing commit (#30) is dev-lead housekeeping.                                                                               |
| No settled D-n contradicted          | pass   | D-15 followed; D-12 and D-14 untouched; no D-n cited in §11's text.                                                                                                                               |
| Tier consistent                      | note   | Section stays `Tier: full`; card `quick` (one criterion touched, no schema change, no new export).                                                                                                |
| Function contracts exact             | pass   | `logMutationFailure(action: MutationActionName, error: unknown): void` unchanged; no new export or constant.                                                                                      |

Result: 10 pass, 2 note, 0 fail. After the edit `check-ac-coverage.sh`, `check-spec-sections.sh`, `check-backlog.sh`
and `check-features-map.sh` are OK, `prettier --check` is clean.

## Open questions

1. **A form that cannot be decoded (`%zz`): D-15 is silent.** Proposed: leave that form out and keep every other
   secret (REQ-11.4, Function contracts, AC-11.3 (g)). Why: §4 accepts such a URL; the only other reading reachable
   with today's single `try` (no redaction at all) would redact less than today. Otherwise: drop (g) and the clause;
   the code-writer still has to choose, and a regression stays possible.
2. **"Decoded" query value: `decodeURIComponent`, or `URLSearchParams` (`+` as a space)?** Proposed:
   `decodeURIComponent`, the function D-15 names for the password; `+` as a space is out of scope. Why: one decoding
   rule for every form. Otherwise: add the `searchParams.getAll` value as a third query form, plus one more AC-11.3 case.
3. **Which occurrences of a parameter count, and how its name matches.** Proposed: every `password=` and
   `sslpassword=` pair counts, name compared exactly as written. Why: "each" redacts more; encoded or other-case names
   have no producer in the repo. Otherwise: first occurrence only (one Function-contracts line changes).
4. **B1.8's review deferred "an `errorCode` equal to the password is logged unredacted" to B1.9.** D-15 widens the
   secret forms, not the fields: REQ-11.4 still scrubs only `message` and `stack`. Proposed: keep `name` and `code` out
   of scope (now listed); a separate card and D-n if the lead wants them.
5. **Pipeline shape.** Proposed: no skeleton, no advisor. Order `docs(spec)` → `docs(backlog)` →
   `test(todos): B1.9 … (red)` → `feat(todos)`. In the red commit (c), (d), (e), (g) are red; (f) is green on arrival.
   The approval box needs the lead's tick (D-7).

Notes for `dev-lead`: (a) a secret that is a substring of `[redacted]` (password `red`) is also replaced inside earlier
markers (`[[redacted]acted]`): cosmetic, leaks nothing, already true today; (b) F9 already names both files, no map
change; (c) the card's Status line quotes `src/lib/logger.ts:25`, true until the `feat` commit.

## Needs a ruling

None. D-15 settles the forms, the order and the empty rule. Questions 1 to 3 are readings inside it, for the lead's
approval at the plan gate. Question 4 stays out of scope unless the lead opens a new D-n.
