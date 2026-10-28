# Spec fidelity

- `spec/contracts/*.md` is the contract and states only the current rule. Read the section before changing a
  function; the module header names it (`// §5`).
- Signatures in a section's "Function contracts" block are exact; tests copy them. Constants (200 characters, the
  error messages, `createdAt desc`) come from the section, not from taste.
- Criteria ids `AC-§.n` are permanent and appear verbatim at the start of test titles.
- A gap (the spec is silent) goes to `work/<card>/analysis.md` open questions or `/spec-trace`, never to a guess
  in code. A conflict (code ≠ spec, spec ≠ spec) → report before choosing a side; `/advise` names what governs.
- Changing a section is a `docs(spec): §n …` commit inside an approved D-n (§8), before any test or code.
