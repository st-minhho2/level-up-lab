# ADR-004 · In-repo stderr logger for swallowed mutation failures

**Context.** §10 (D-11) turns every unexpected mutation failure into a `form` field error so the person never sees a
rejected action; that also hid the cause from whoever runs the application. §11 needs one entry per swallowed failure
without the typed title or the database credentials in it, and `console` is banned in `src/`.
**Options.** A: in-repo `src/lib/logger.ts` writing one JSON line with `process.stderr.write`, no dependency, no
configuration. B: `console.error` (needs a lint-configuration change, entry shape left open). C: a logging library
(adds a dependency, a level switch and an environment key nothing else needs). Entry content R1 (name only), R2 (name,
message, code, stack, redacted) and R3 (name and code) were also weighed.
**Decision.** A with R2 content (D-12): fields `level`, `time`, `msg`, `action`, `error` in that order, stderr only,
the whole database URL and the secret inside it replaced by `[redacted]`, message cut to 500 and stack to 2000
characters, never the person's input. `console` stays banned; no dependency and no log-level key are added. Replaces
the sentence in D-11 that the swallowed error is not logged.
**Rejected.** B (a config change for no gain); C (a dependency and surface the card does not need); R3 (drops the
message and stack that make an entry useful).
**Consequences.** Logging never changes what the person sees or throws: a failed write or an unreadable environment
still returns the §10 result (an unreadable environment means no redaction). Stdout stays clean for tooling. There is
no level, sink or rotation: the host collects stderr.
**Residual risks** (`backlog/work/B1.6/review.md`, PR #15). Only the whole URL and its userinfo secret are redacted: a
driver message quoting it re-encoded, or in a `?password=` / `sslpassword` query value, is written verbatim (no such
Prisma 6 template found). `name` and `code` are neither redacted nor capped. Any invalid §4 key makes `getEnv()`
throw, so that entry is unredacted. A database that is down raises an error carrying `errorCode`, not `code`, so its
entries have no `code`. An `Error` whose `message` is not a string writes no entry.
**Revisit when.** A second consumer needs levels or other sinks, a secret beyond the URL and its userinfo must be
hidden (a §11 change under a new D-n), or the host wants a collector format other than one JSON line.
