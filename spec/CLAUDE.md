# spec/ — the contract src/ implements

- **Read-only unless a ruling says otherwise.** Section numbers §1–§8 are permanent. Never edit a section to match
  the code; code and spec disagree → report the divergence (`/spec-trace`) and let the human decide.
- **Exception (§8, change requests):** within an approved D-n in `backlog/00-decisions.md`, change the spec section
  first (`docs(spec): §n …`), then the red test, then the code, and name the section in the summary.
- **Every behavior section carries a tier and an approval box** right under its heading:
  `Tier: 0 | quick | full` (0 = plan only, no code; quick = ≤ 3 criteria, no schema change, advisor optional;
  full = everything) and `- [ ] Lead approves spec (lead, <date>)`. The box is ticked by a human (the card's
  lead) before any test is written; the plan gate may tick it in the same reply ("approve" = spec + plan, D-7).
- **New behavior = new or extended section**, landed by `spec-analyst` as its own `docs(spec)` commit before any
  card is eligible. A section states the current rule only: no history, no D-n citations in the text.
- Criteria are measurable (exact values, counts, messages); adjectives such as fast, simple, friendly are banned
  unless a number and unit stand next to them. At most 7 criteria per section; an eighth means a new section.
- Function contracts give exact signatures; tests copy them; `scripts/ci/check-features-map.sh` resolves every
  path the map names.

Moves with the code, same commit:

| File                                     | When                                                    | Checked by                          |
| ---------------------------------------- | ------------------------------------------------------- | ----------------------------------- |
| `features-map.md`                        | any `src/` change that adds, moves or removes a feature | `scripts/ci/check-features-map.sh`  |
| the section's "Function contracts" block | a signature changes (only through §8)                   | `scripts/ci/check-spec-sections.sh` |
