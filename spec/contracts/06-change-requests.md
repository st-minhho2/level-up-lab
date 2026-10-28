# §8 How a behavior change enters the spec

1. **Card**: a backlog card (`backlog/plan/E<n>-*.md`) states the change, its spec section (existing or new) and
   the first failing test. A card without `spec:` and `test:` lines is not eligible for an agent.
2. **Ruling when needed**: a change that alters an existing section's behavior, a constant, or a rule needs a D-n in
   `backlog/00-decisions.md` written by the human (the `advisor` drafts the decision request).
3. **Spec first**: `docs(spec): §n …` rewrites the section as the current rule (new criteria get the next
   `AC-§.n`). `scripts/ci/check-spec-sections.sh` stays green.
4. **Red, then green**: `test(<pkg>): B<e>.<n> … (red)` commits the failing tests alone (body: "Red because …",
   `scripts/verify-red.sh` proves it); `feat(<pkg>): B<e>.<n> …` makes them green without touching tests.
5. **Map and card**: `spec/features-map.md` and the card's status line move in the same PR. Review (`/review-loop`)
   and the gates of §2 close it.
