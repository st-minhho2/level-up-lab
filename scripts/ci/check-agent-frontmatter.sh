#!/usr/bin/env bash
# Every .claude/agents/*.md and .claude/skills/*/SKILL.md opens with frontmatter that parses as YAML and has a
# non-empty `name` and `description`; an agent's `name` equals its file name. Why: Claude Code silently skips an
# agent whose frontmatter does not parse, so its role was never registered and the `path-guard.sh` write scope in
# its hooks never ran (docs/mistake-log.md, 2026-10-30).
#   scripts/ci/check-agent-frontmatter.sh              # check every agent and skill
#   scripts/ci/check-agent-frontmatter.sh --commands   # print "<agent><TAB><hook command>" (hook-smoke.sh probes)
# Parses with the js-yaml that @eslint/eslintrc (a devDependency) already ships; needs `pnpm install`.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
mode="${1:-check}"
node - "$mode" .claude/agents/*.md .claude/skills/*/SKILL.md <<'NODE'
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');
let yaml;
try {
  yaml = createRequire(require.resolve('@eslint/eslintrc/package.json'))('js-yaml');
} catch {
  console.log('::error::js-yaml not found through @eslint/eslintrc; run pnpm install --frozen-lockfile');
  process.exit(1);
}
const [mode, ...files] = process.argv.slice(2);
let fail = 0;
const error = (file, msg) => {
  // stdout carries the command list in --commands mode, so errors go to stderr there
  (mode === '--commands' ? console.error : console.log)(`::error file=${file}::${msg}`);
  fail = 1;
};
for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const end = lines.indexOf('---', 1);
  if (lines[0] !== '---' || end < 0) {
    error(file, 'no frontmatter block (--- … ---) at the top');
    continue;
  }
  let data;
  try {
    data = yaml.load(lines.slice(1, end).join('\n'));
  } catch (e) {
    error(file, `frontmatter is not valid YAML: ${e.message.split('\n')[0]}`);
    continue;
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    error(file, 'frontmatter is not a mapping');
    continue;
  }
  for (const key of ['name', 'description']) {
    if (typeof data[key] !== 'string' || data[key].trim() === '') error(file, `missing or empty \`${key}\``);
  }
  const isAgent = file.startsWith('.claude/agents/');
  if (isAgent && data.name !== path.basename(file, '.md')) error(file, `name '${data.name}' differs from the file name`);
  if (mode === '--commands' && isAgent) {
    for (const entry of data.hooks?.PreToolUse ?? []) {
      for (const hook of entry.hooks ?? []) {
        if (hook.type === 'command') process.stdout.write(`${data.name}\t${hook.command}\n`);
      }
    }
  }
}
if (mode !== '--commands' && fail === 0) console.log(`[check-agent-frontmatter] OK: ${files.length} files`);
process.exit(fail);
NODE
