# D-34 request: B6.6 and §22's Out of scope line

D-33 lets B6.6 lift "live announcement to assistive technology" from §13's Out of scope
(`spec/contracts/11-remaining-count.md:53`) only. The card's Acceptance puts §22's "All done" message in the same
live region, but §22's Out of scope (`spec/contracts/20-all-done.md:60`) still lists "live announcement to assistive
technology (`role="status"`, `aria-live`, as in §13)". D-33 names lifts card by card and does not name §22, and a
section change needs an approved D-n (`.claude/rules/spec-fidelity.md`), so §22 and §34 would contradict each other.
Raised by `spec-analyst` (`analysis.md` open question 1); `advisor` ruled it P6, needs the lead.

## Options

| Option                                 | Behavior                                                                                                           | Cost                                                                                   | Risk                                                                        | Reversible |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------- |
| **A (recommended)** Extend D-33 to §22 | B6.6's `docs(spec)` lift commit also deletes only that phrase from §22's Out of scope; nothing else of §22 changes | one phrase in one more file                                                            | low: §22 goes silent on announcement, §34 states it                         | yes        |
| B. Narrow the card                     | the region holds §13's count only; "All done" stays outside it; §22 unchanged                                      | card Acceptance, REQ-34.1 and AC-34.1/34.3–34.6 rewritten; "All done" is not announced | medium: contradicts the card's intent (F32) and the markup in `analysis.md` | yes        |
| C. Reword §22's line                   | §22's line becomes "except as stated in §34"                                                                       | one line                                                                               | low, but more drift than A and a cross-reference to keep current            | yes        |

Recommended: **A**. It is the smallest change and matches the card. It flips to B if the lead wants "All done" kept
out of the live region.

Affects: §13 (`11-remaining-count.md:53`), §22 (`20-all-done.md:60`), §34 (`32-remaining-announce.md`), AC-34.1, the
B6.6 card, `src/components/remaining-count.tsx`.

Reply with the option (for example "D-34 chọn A" or "D-34: A"); the next run of B6.6 resumes at the §13 (and, on A,
§22) `docs(spec)` lift commit, then advice and plan.
