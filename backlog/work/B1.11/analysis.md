# B1.11 analysis

Written by `spec-analyst`; filed by `dev-lead` (the harness refused this role's write of this new file; content
unchanged).

Codebase facts (reads and probes of this worktree, HEAD `149bcfb`):

- `src/lib/logger.ts:48-59` `secretsOf`: `value = getEnv().DATABASE_URL`, `url = new URL(value)`; secrets are
  `value`, `url.password`, its decoded and re-encoded forms (`:52`), and `querySecretsOf(url.search)` (`:53`), which
  gives each `password`/`sslpassword` pair's raw and decoded value but no re-encoded value. Nothing is read from the
  text of `value` itself. A throwing `new URL` lands in the same `catch` and returns `[]`.
- WHATWG `URL` probes (`node`, scratch script outside the repo, nothing written):
  - `postgresql://app:pä%40ss@db.internal:5432/lab` → `password` `p%C3%A4%40ss`; written form `pä%40ss`.
  - `…/lab?password=a b%26c` → `search` `?password=a%20b%26c`; written form `a b%26c`.
  - `…/lab?sslpassword=k%2fey` → `search` keeps `k%2fey`; `encodeURIComponent(decodeURIComponent(…))` is `k%2Fey`.
  - `postgresql://app:p@ä%41@db.internal:5432/lab` → `password` `p%40%C3%A4%41`, `username` `app`: the parser splits
    userinfo at the **last** `@`; written password `p@ä%41`. A first-`@` split would give the one-letter secret `p`.
  - `postgresql://app:p:ss@…` → `password` `p%3Ass`: the parser splits user and password at the **first** `:`.
  - An unencoded `/`, `?` or `#` in the password makes `new URL` throw (`ERR_INVALID_URL`), so the written split never
    meets one inside the authority of a value the parser accepts.
  - `…?password=a b%26c&sslpassword=k%2fey#frag` → `search` excludes the fragment.
- §4 (`src/lib/env.ts:7-12`, `z.string().url()`, zod 4.6.7) accepts all four new AC-11.3 URLs (probe: `success: true`)
  and rejects `postgresql://app:p/w@…`. Every new case is reachable in production.
- A reference algorithm of the new Function contracts was run over every AC-11.3 case and the redaction tests
  (scratch script). New rule: (a)–(g) and the six unchanged-behavior redaction tests give exactly today's strings;
  (h)–(k) give the Then strings. Today's code gives (h) `auth pä%40ss`, (i) `pw a b%26c`, (j) `ssl k%2Fey`,
  (k) `auth p@ä%41`: all four red on the message assertion. A first-`@` variant gives (k) `auth [redacted]@ä%41`, so
  (k) pins the last-`@` split.
- `src/lib/logger.test.ts` sets `env.getEnv.mockReturnValue(...)` per test (B1.9 cases do so), so (h)–(k) need no new
  helper. No new export, constant or signature.

Section extended: §11 in `spec/contracts/09-logging.md`: REQ-11.4's secret list rewritten (both sources, the four
forms for both kinds); AC-11.3 Given widened to (c)–(k), When/Then gain (h)–(k), (a)–(g) untouched; the Redaction
sentence in Function contracts rewritten (sources, the written split, "new URL throws → no secret" stated); Out of
scope gains 2 items; Unchanged behavior gains 6 rows (B1.9's tests); a new unticked approval box. No REQ or AC id added
or renumbered; still 6 criteria. (dev-lead set §11 to ◐ in `spec/technical-requirements.md` in the same `docs(spec)`
commit, as for B1.8 and B1.9.) Card B1.11 gains its `Spec:`, `Test:` and `Acceptance:` lines.

## Completeness

| Check                                | Result | Note                                                                                                                            |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | Intent unchanged ("the database credentials are never written down" is what the change serves).                                 |
| Every behavior has a REQ             | pass   | Written forms and re-encoded query values: REQ-11.4. The exact split is in Function contracts, where B1.9 put the pair parsing. |
| One EARS pattern each                | pass   | REQ-11.4 stays Unwanted behavior (IF … THEN); no other REQ touched.                                                             |
| ≤ 7 criteria                         | pass   | 6; AC-11.3 gains cases (h)–(k), as it did under D-15.                                                                           |
| Every Then measurable                | pass   | (h)–(k) each give an exact `error.message` string.                                                                              |
| No banned adjective without a number | pass   | None in the added text.                                                                                                         |
| Out of scope                         | pass   | Added: a `password`/`sslpassword` pair after `#`; written forms of a value the parser rejects.                                  |
| Unchanged behavior with proof titles | pass   | 6 rows added (B1.9's tests); each title matches exactly once by `grep -rcF` in `src/`.                                          |
| Dependencies done                    | pass   | `~~B1.9~~`: Done, `5387591` (#31), closed `7a36a1e` (#32).                                                                      |
| No settled D-n contradicted          | pass   | D-17 followed; D-15's rules (longest first, empty never, undecodable left out) kept for every form; no D-n cited in §11's text. |
| Tier consistent                      | note   | Section stays `Tier: full`; card `quick` (one criterion touched, no schema change, no new export).                              |
| Function contracts exact             | pass   | `logMutationFailure(action: MutationActionName, error: unknown): void` unchanged.                                               |

Result: 11 pass, 1 note, 0 fail. After the edit `check-ac-coverage.sh`, `check-spec-sections.sh`, `check-backlog.sh`
and `check-features-map.sh` are OK, `prettier --check` is clean.

## Open questions

1. **Re-encoded query values.** D-17 lists "decoded then re-encoded" for every form; today query values have no
   re-encoded form. Proposed: add it for both query sources (AC-11.3 (j), `k%2fey` → `k%2Fey`). Why: D-17's sentence
   names the four forms for both kinds. Otherwise: drop (j) and the encode step for query sources.
2. **Where the written password ends.** Proposed: authority = after the first `://`, up to the first `/`, `?` or `#`;
   userinfo = before its **last** `@`; password = after its **first** `:` (AC-11.3 (k)). Why: the WHATWG parser splits
   the same way, so the written password and the parsed password are always the same field. Otherwise (first `@`): a
   one-letter piece such as `p` becomes a secret and every `p` in a message is redacted.
3. **Where the written query ends.** Proposed: `value` up to its first `#`, then after its first `?`. Why: the parser
   excludes the fragment from `search`; a pair after `#` is no query parameter (now in Out of scope). Otherwise: a
   `password=` written in the fragment would become a secret (more redaction; no test tells the two readings apart).
4. **A value `new URL` rejects.** Proposed: no secret at all, as today (`catch` returns `[]`; REQ-11.6 "an unreadable
   URL means no redaction"; §4 rejects such a URL, so it is unreachable). Stated in Function contracts; written forms
   of a rejected value are in Out of scope. Otherwise: one more clause and a case for an input §4 never lets through.
5. **Pipeline shape.** Proposed: no skeleton, no advisor (quick). Order `docs(spec)` → `docs(backlog)` →
   `test(todos): B1.11 … (red)` with (h)–(k) → `feat(todos)`. The approval box needs the lead's tick (D-7).

Notes for `dev-lead`: (a) the card's Status line quotes `src/lib/logger.ts:51`, true until the `feat` commit; (b) F9
already names `src/lib/logger.ts` and its test, so no map change is expected; (c) existing behavior, not this card:
`?password=k#ey` gives the secret `k` (the parser and the written split both stop at `#`), so every `k` in a message
is redacted: over-redaction with no leak; a new card if the lead wants a minimum secret length.

## Needs a ruling

None. D-17 settles the sources and forms; questions 1 to 4 are readings inside it, for the lead's approval at the plan
gate.
