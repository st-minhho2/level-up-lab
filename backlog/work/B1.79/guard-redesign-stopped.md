# B1.79 — why the guard-bash redesign stopped

The lead's ruling (2026-11-05, option p): stop changing `guard-bash.sh` rule 4 and re-scope B1.79 to the role
prompts. The guard stays exactly as it is on `main`.

## What was tried

Plans at cffff72, e1dfa6e, bd38b51 and fe8c060 rewrote rule 4 so text that only mentions a secret path passes:
an awk pass split a command into shell text (quoted whitespace masked), quoted strings and heredoc bodies; text a
shell runs was checked as before, the rest line by line, plus patterns for `<` redirects, quoted `'.env'` literals,
assignments and lines that are only a path. A scratch prototype (never committed) passed the run's 4 denied
commands and kept the 581 existing hook-smoke probes OK on bash 3.2 and 5.2.

## Why it stopped

| Plan review       | Reads today's rule blocks that the planned rule let through (each run against a fake dotenv file)                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| round 1 (02efba1) | 6 (+1 parser desync): reader and path on different heredoc or quoted lines, `F=.env` in a heredoc                |
| round 2 (dbc845a) | 6: `xargs cat` heredoc with `a.txt .env`, `<<<`, `for f in .env`, `set --`, arrays                               |
| round 3 (7f71e8b) | 8: a heredoc piped to `bash`, a file written then run, `/bin/bash -c`, `$SHELL -c`, `watch`, python `'''` blocks |

20 bypasses reported in 3 rounds (27 probe commands with their variants), and every fix opened new spellings. A text-only exemption cannot be safe: whether
`event.key` is a property or a file depends on who reads the text (`cat event.key` reads a file named so), which the
hook cannot know from the text alone.

## What replaces it

The false positives come only from roles writing code through Bash (`python3 - <<'PY'`, `cat > f <<EOF`, `sed -i`
with code text). Write and Edit never pass through guard-bash, and path-guard checks only Write and Edit. So the
re-scoped card makes the build roles write files with Write/Edit and keep Bash for running commands.

Found on the way, filed separately by the orchestrating session: the whole-command `.env.example` exemption
(`cat .env.example .env` passes today).
