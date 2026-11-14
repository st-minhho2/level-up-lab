Closing lane (`backlog/CLAUDE.md` "Closing a card", step 4: Partial) for B1.100 — each parallel run mutation-tests
all of src/lib up to three times, whatever the card changed; feature PR #319 merged as db01758. The checklist is the
plan; no `Plan approved by` line.

Pending: acceptance 4, "the next parallel batch's per-run duration and load are reported". E7 batch 2 (B7.4, B7.5,
B7.6) is the first batch run with `scripts/mutation-gate.sh`; its closing lane reports per-run label → ready time and
the runner's load, then flips B1.100 to Done. Expected at load ≈ 2.6: B7.4 and B7.6 skip local mutation (≈ 11 min
saved per run), B7.5 runs once on `src/lib/title-count.ts` (≈ 10.5 min saved) `[unverified]`.

Files:

- `backlog/plan/E1-todos.md`: B1.100 `**Status: Partial** — merged db01758 (#319), pending E7 batch 2 per-run
duration and load`, with mutation-gate-smoke MG1–MG17 (red 4df9203: 1 ok, 15 FAIL on the skeleton; green 14b690b:
  16 ok; review pass 1 b9bed5c: 17 ok, bash 3.2), the live gate (`--base be888ff^` 13 s, then "(reused)" 1 s), the
  CI-only line on this card, hook-smoke 749, vitest 298, e2e 70, mutation 92.84 (no `src/`), plan review 4 rounds,
  diff review 2 passes
- `backlog/README.md`: Remaining row 128 stays, status Partial; totals E1 63/1/35 of 99, total 89/1/42 of 132 (the
  table re-padded by Prettier after the status column widened)
- `backlog/work/B1.100/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: B1.100 has no section. No other row names
B1.100 in Blocked by.

Left for the lead (not in this lane): B1.101's `--sync` row in `scripts/CLAUDE.md` is still unwritten. B1.100's plan
carried it only if #315 merged before #319 was ready; #315 merged after, so the handoff to "the next card that plans
`scripts/CLAUDE.md`" stays open.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
