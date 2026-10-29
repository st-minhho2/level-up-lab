# B1.8 decision request (D-14) — dev-lead to lead

Context: §11 REQ-11.3 records an `Error`'s `code` only when it is a string (D-12: "string code"). Prisma 6 has two
error classes with a code, under two names: `PrismaClientKnownRequestError.code: string` (request errors, `P2xxx`)
and `PrismaClientInitializationError.errorCode?: string` (connection/start-up errors, `P1xxx`, e.g. `P1001` "can't
reach database server"). So the most common operational failure, database down, is logged without a code (B1.6
end-to-end probe: `error` keys `name, message, stack`, name `PrismaClientInitializationError`).

| Option | Rule                                                                                                                       | Spec change                                                                                    | Cost                                    | Risk                                                                                      |
| ------ | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------- |
| A      | `error.code` = `code` when it is a string, else `errorCode` when that is a string, else no `code` key; key order unchanged | REQ-11.3 sentence + AC-11.2 gains case (d) `errorCode` `P1001` → `code` `P1001` (and (e) both) | ~1 line in `logger.ts`, 2 tests         | an entry no longer says which property the code came from (name tells: Prisma class name) |
| B      | a separate `errorCode` key after `code`, string only                                                                       | REQ-11.3, AC-11.1/11.2 key lists (`name, message, code?, errorCode?, stack?`)                  | ~2 lines, 2 tests, one more field shape | two fields for one namespace; consumers must read both                                    |
| C      | no change; close B1.8 as Tier 0 (plan only)                                                                                | none                                                                                           | 0                                       | database-down entries stay without a code; `name` + `message` still identify it           |

Recommended: **A**. One field to filter on; Prisma's `P` codes are one namespace split across two property names;
the value is a short string from Prisma, never user input or a secret, so it needs no redaction or cut. §11 stays at
6 criteria.

Proposed D-14 (A): "A §11 entry's `code` is the thrown `Error`'s `code` when that is a string, otherwise its
`errorCode` when that is a string (Prisma's initialization errors), otherwise absent; no other property is read."
