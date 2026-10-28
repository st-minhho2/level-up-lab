---
name: spec-trace
description: Map src/ against the numbered sections of spec/technical-requirements.md and report drift in both directions - signatures that differ from a section's function contracts, constants or messages that differ, criteria without a test, behavior in code with no section, sections with no code. Use when code and spec seem to disagree, before a /advise question about what governs, or when asked "is the code still what the spec says". Read-only; never edits the spec to match the code.
---

# spec-trace

1. **Function map.** For every "Function contracts" block in `spec/contracts/*.md`, grep the named export in `src/`
   and compare the signature exactly (parameter names, types, return type, thrown errors).
2. **Constants and messages.** Numbers and strings a section fixes (200, 'Title is required', `createdAt desc`,
   `revalidatePath('/')`) appear in code as the section says; grep each.
3. **Criteria.** For each `AC-§.n` of a ✅/◐ section, a test title starts with it (`scripts/ci/check-ac-coverage.sh`
   does the mechanical part; you judge whether the assertion matches the Then).
4. **Orphans.** Exports in `src/lib` and `src/actions` that no section names; sections with status ✅ whose files
   the features map does not name.
5. **Schema.** `prisma/schema.prisma` against §3 field by field.

Report two lists, each row `file:line · §n · what differs · which side should move`:

- "Code diverges from spec"
- "Spec not implemented"
  Then: "Doc drift" (map, README) and "Needs a ruling" (changes that would alter a section: D-n first, §8).
  Do not edit the spec to match the code; that is the human's decision.
