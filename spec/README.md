# Spec

The contract `src/` implements. Two parts:

- `technical-requirements.md`: the index of numbered sections (§1–§8). Section numbers are permanent; code,
  tests, the features map and backlog cards cite them ("§5", "AC-5.3"), and `scripts/ci/check-spec-sections.sh`
  checks that every cited section exists.
- `contracts/`: one file per section group. Each behavior section has: EARS requirements (`REQ-§.n`), measurable
  acceptance criteria (`AC-§.n`, at most 7 per section), function contracts (exact TypeScript signatures), out of
  scope, unchanged behavior.
- `features-map.md`: feature ids `F<n>` → section → files → tests. Moves with the code, same commit.

Status legend used in the index and the map: ✅ implemented · ◐ partial · ✗ open · 🔒 owner-only.

Reading order for a new engineer: `technical-requirements.md` → §1–§2 → the section your card names → `features-map.md`.
