# B3.1 decision request — D-22: §17 vs §15's Out of scope

Raised by `spec-analyst` (NEEDS RULING), confirmed by `advisor` (Escalate: human, `advice.md` "Questions settled /
escalated"). Asked at the B3.1 plan gate, so the lead rules in the same reply as the plan approval.

## Context

- `spec/contracts/13-due-date.md:86` (§15, approved 2026-10-31) lists in Out of scope "an overdue or due-soon
  highlight or any comparison with today's date".
- §17 (`spec/contracts/15-overdue.md`, assigned to B3.1 by D-21) is exactly that comparison.
- D-21 lifts an exclusion only for B3.3 (§5's delete); it never mentions §15. `spec/CLAUDE.md` changes an existing
  section only inside an approved D-n and bans history in a section.

## Options

| #   | Behavior                                                                                           | Cost                     | Risk                                                        | Reversible |
| --- | -------------------------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------- | ---------- |
| 1   | One `docs(spec): §15 …` commit rewrites the phrase to "a due-soon highlight" (§17 excludes it too) | 1 line, no AC id changes | none for behavior                                           | yes        |
| 2   | §15 stays; §17 says it lifts §15's line                                                            | 1 sentence               | the collision stays; §17 carries history (`spec/CLAUDE.md`) | yes        |
| 3   | Decline the marker                                                                                 | none to code             | contradicts D-21; B3.1 closes unbuilt                       | yes        |

**Recommended: 1** (flips to 2 only if §15 must stay byte for byte).

Affects: §15 line 86, §17 (approval box and index row only), card B3.1. No AC ids change. After the ruling the
session records D-22 in `backlog/00-decisions.md` with the lead's words, and the §15 line lands as
`docs(spec): §15 …` before any `test(...)` commit.
