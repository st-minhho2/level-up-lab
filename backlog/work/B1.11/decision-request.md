# B1.11 decision request (D-17) — dev-lead to lead

Context: §11 REQ-11.4 says the `password`/`sslpassword` query values count "as written"; its Function contracts read
them from `url.search`, and the userinfo password from `url.password`. The WHATWG URL parser re-encodes characters
outside its allowed set (non-ASCII, space), so a value written with such a character next to a percent-escape has a
written form that is none of today's secrets (probe, `node -e`):

| `DATABASE_URL` as written                                | Secret forms today (besides the whole URL) | Written form, not a secret |
| -------------------------------------------------------- | ------------------------------------------ | -------------------------- |
| `postgresql://app:pä%40ss@db.internal:5432/lab`          | `p%C3%A4%40ss`, `pä@ss`                    | `pä%40ss`                  |
| `postgresql://app@db.internal:5432/lab?password=a b%26c` | `a%20b%26c`, `a b&c`                       | `a b%26c`                  |

No Prisma 6 or PostgreSQL message quoting either form was found; the whole `DATABASE_URL` value is always redacted.

| Option | Rule                                                                                                                                                                                                                                                        | Spec change                                                                                | Cost                                     | Risk                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| A      | also take the userinfo password and the two query values from the raw `DATABASE_URL` text (password: between `scheme://user:` and the last `@` before the host; pairs: after the first `?`), with their decoded and re-encoded forms; the parser forms stay | REQ-11.4 and Function contracts name both sources; AC-11.3 gains a case (still 6 criteria) | about 15 lines in `logger.ts`, 2–3 tests | a hand-written split of the URL text (`@` or `?` inside the password are the edge cases to pin) |
| B      | keep the code; reword REQ-11.4 to "as the URL parser returns it"                                                                                                                                                                                            | REQ-11.4 prose only (`docs(spec)`); card closes as Tier 0                                  | no code                                  | the written form stays unredacted, as a documented residual                                     |
| C      | no change; list the gap in §11 Out of scope                                                                                                                                                                                                                 | one Out-of-scope line                                                                      | none                                     | REQ-11.4 keeps saying "as written" while the code does not                                      |

Recommended: **A**. §11's Intent ("the database credentials are never written down") is about what the operator typed,
which is the raw text; the cost is small, and the parser forms keep covering what a driver echoes after normalizing.
Flips to **B** if the lead prefers no hand-written URL splitting in `src/lib`.

Proposed D-17 (A): "§11 secrets are taken from both the raw `DATABASE_URL` text and the URL parser: the userinfo
password and each `password`/`sslpassword` query value as written, as the parser returns them, percent-decoded, and
decoded then re-encoded; the existing rules (longest first, empty never, undecodable left out) apply to every form."
