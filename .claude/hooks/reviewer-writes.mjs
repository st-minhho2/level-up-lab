// B1.84: the reviewer's Bash writes land only under a set TMPDIR that lies outside the worktree (#225: with TMPDIR
// unset, `cd "$TMPDIR/…"` did nothing and ten `sed -i` edits landed in the worktree). guard-bash.sh pipes the
// PreToolUse payload here when agent_type is `reviewer`; a refusal's reason goes to stdout, nothing means the command
// may run. A text check, like guard-bash.sh: it lexes the command (quotes, `$( )`, backticks, heredocs, `bash -c`,
// `eval`), follows the cwd through `cd X &&`, and names the write targets of the programs in WRITERS and of git (any
// subcommand outside GIT_READS writes its directory and its git dirs). `$TMPDIR` is expanded from this process's
// environment, which Claude Code gives the Bash tool too (a profile that exports another TMPDIR breaks that).
// /dev/null-type targets and fd duplications (`2>&1`) are not writes. Also refused: `git push`, a git subcommand
// outside GIT_READS and GIT_WRITES (an alias), a git write with -c or with GIT_DIR/GIT_WORK_TREE/core.worktree in the
// command, a write to or through a symlink `ln -s` makes in the same command; a launcher in LAUNCHERS (`time`,
// `caffeinate`, `pnpm exec`, …) is looked through.
// Out of reach: a program's own writes from inside (node -e, python3 -c, pnpm install, prettier --write,
// eslint --fix, make, a script file, sed's or awk's own write commands, an output option of a program not in
// WRITERS), a program a git setting runs from a read subcommand (`git -c diff.external=…`, `core.pager`), a launcher
// not in LAUNCHERS, GIT_DIR exported by an earlier call or the profile, a symlink a `cp`/`tar`/`rsync` of the same
// command brings in, an alias or function defined by an earlier call, a hard link from the copy into the worktree,
// any command built on purpose to get past a text check (the threat is a reviewer's mistake, not an attacker).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const KEYWORDS = new Set(['!', 'if', 'then', 'elif', 'else', 'fi', 'do', 'done', 'while', 'until', '{', '}', 'time']);
const TEST_WORDS = new Set(['[', ']', '[[', ']]']);
const OPENERS = new Set(['if', 'for', 'while', 'until', 'case', 'select', '{']);
const CLOSERS = new Set(['fi', 'done', 'esac', '}']);
const DEVICES = /^\/dev\/(null|stdout|stderr|tty|fd\/\d+)$/;
// Programs that run the command after their options: name → the short options that take a value (review pass 1).
const LAUNCHERS = {
  builtin: '',
  bunx: 'p',
  caffeinate: 'tw',
  chronic: '',
  command: '',
  doas: 'uC',
  exec: 'a',
  flock: 'wEn',
  ionice: 'cnp',
  nice: 'n',
  nohup: '',
  npx: 'pc',
  setsid: '',
  stdbuf: 'ioe',
  sudo: 'ugCphrDRT',
  taskset: '',
  time: 'fo',
  timeout: 'ks',
  unbuffer: '',
  watch: 'nd',
};
const GIT_READS = new Set([
  'annotate',
  'blame',
  'cat-file',
  'check-attr',
  'check-ignore',
  'cherry',
  'count-objects',
  'describe',
  'diff',
  'diff-files',
  'diff-index',
  'diff-tree',
  'for-each-ref',
  'grep',
  'help',
  'log',
  'ls-files',
  'ls-remote',
  'ls-tree',
  'merge-base',
  'name-rev',
  'range-diff',
  'rev-list',
  'rev-parse',
  'shortlog',
  'show',
  'show-ref',
  'status',
  'var',
  'verify-commit',
  'whatchanged',
]);

const input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
const command = String(input.tool_input?.command ?? '');
const tmpRaw = process.env.TMPDIR ?? '';
// A command that may set or drop TMPDIR (an assignment, `${TMPDIR:=…}`, a builtin given it as a variable name,
// `env -u TMPDIR` or `env -i`, a sourced file) makes every $TMPDIR in it unknown; the word TMPDIR as data
// (`grep TMPDIR`) does not (review passes 1, 2).
const AT_COMMAND = String.raw`(^|[;&|({\n]|\b(then|do|else)\b)\s*`;
const tmpRebound = new RegExp(
  String.raw`(^|[^\w$])TMPDIR\+?=|\$\{TMPDIR:?=|printf\s+-v\s*TMPDIR\b|` +
    String.raw`\b(export|unset|declare|typeset|local|readonly|read|for|select|getopts|mapfile|readarray)\b[^;&|\n]*\bTMPDIR\b|` +
    String.raw`\benv\b[^;&|\n]*\s(-\w*i\w*|--ignore-environment|-u\s*TMPDIR|--unset=?\s*TMPDIR)\b|` +
    String.raw`${AT_COMMAND}(source|\.)\s`,
).test(command);
// GIT_DIR, GIT_WORK_TREE, core.worktree and kin anywhere in the command move git's writes away from its directory.
const gitEnv = /\bGIT_(DIR|WORK_TREE|INDEX_FILE|COMMON_DIR|OBJECT_DIRECTORY)\b|core\.worktree/i.test(command);

const real = (p) => {
  try {
    return fs.realpathSync(p);
  } catch {
    return p;
  }
};
// Resolves component by component, following the symlinks that exist, so `..` climbs the physical tree.
const physical = (base, p) => {
  let cur = p.startsWith('/') ? '/' : real(base);
  for (const c of p.split('/')) {
    if (c === '' || c === '.') continue;
    cur = real(c === '..' ? path.dirname(cur) : path.join(cur, c));
  }
  return cur;
};
const inside = (p, dir) => p === dir || p.startsWith(dir === '/' ? '/' : `${dir}/`);
const literal = (text) => ({ text, raw: text, dyn: false, subs: [], quoted: true, assign: false });

// Words carry their static text, the raw slice, `dyn` (a part only known at run time) and the code of their
// substitutions; operators are `; && || | & ( )`; a redirection is its operator, then its target word.
function lex(src) {
  const toks = [];
  const heredocs = [];
  let i = 0;
  let w = null;
  const start = () => (w ??= { text: '', raw: '', dyn: false, subs: [], quoted: false, assign: false, at: i });
  const end = () => {
    if (!w) return;
    w.raw = src.slice(w.at, i);
    if (TEST_WORDS.has(w.raw)) w.dyn = false;
    toks.push({ t: 'word', ...w });
    w = null;
  };
  const closing = (from) => {
    // from points after an opening `(`; returns the index of its `)`, skipping quotes and escapes
    let depth = 1;
    let j = from;
    while (j < src.length) {
      const c = src[j];
      if (c === '\\') j += 2;
      else if (c === "'") {
        const e = src.indexOf("'", j + 1);
        j = e < 0 ? src.length : e + 1;
      } else if (c === '"') {
        j++;
        while (j < src.length && src[j] !== '"') j += src[j] === '\\' ? 2 : 1;
        j++;
      } else if (c === '(') {
        depth++;
        j++;
      } else if (c === ')') {
        if (--depth === 0) return j;
        j++;
      } else j++;
    }
    return src.length;
  };
  const dollar = () => {
    const n = src[i + 1];
    if (n === '(' && src[i + 2] === '(') {
      w.dyn = true;
      i = closing(closing(i + 3) + 1) + 1;
    } else if (n === '(') {
      const e = closing(i + 2);
      w.subs.push(src.slice(i + 2, e));
      w.dyn = true;
      i = e + 1;
    } else if (n === '{') {
      const e = src.indexOf('}', i + 2);
      const name = src.slice(i + 2, e < 0 ? src.length : e);
      if (name === 'TMPDIR' && !tmpRebound) w.text += tmpRaw;
      else w.dyn = true;
      i = e < 0 ? src.length : e + 1;
    } else if (n !== undefined && /[A-Za-z_]/.test(n)) {
      const name = /^[A-Za-z_]\w*/.exec(src.slice(i + 1))[0];
      if (name === 'TMPDIR' && !tmpRebound) w.text += tmpRaw;
      else w.dyn = true;
      i += 1 + name.length;
    } else if (n !== undefined && /[0-9@*#?$!-]/.test(n)) {
      w.dyn = true;
      i += 2;
    } else {
      w.text += '$';
      i++;
    }
  };
  const backtick = () => {
    let j = i + 1;
    while (j < src.length && src[j] !== '`') j += src[j] === '\\' ? 2 : 1;
    w.subs.push(src.slice(i + 1, j));
    w.dyn = true;
    i = j + 1;
  };
  const heredocBodies = () => {
    for (const h of heredocs.splice(0)) {
      for (;;) {
        const e = src.indexOf('\n', i);
        const line = src.slice(i, e < 0 ? src.length : e);
        i = e < 0 ? src.length : e + 1;
        if ((h.strip ? line.replace(/^\t+/, '') : line) === h.delim || e < 0) break;
        // an unquoted delimiter runs the body's substitutions
        if (h.expand)
          for (const t of lex(`"${line.replace(/"/g, '')}"`))
            if (t.subs?.length) toks.push({ t: 'subs', subs: t.subs });
      }
    }
  };
  while (i < src.length) {
    const c = src[i];
    if (c === '\\' && src[i + 1] === '\n') {
      i += 2;
    } else if (c === ' ' || c === '\t') {
      end();
      i++;
    } else if (c === '\n') {
      end();
      toks.push({ t: 'op', v: ';' });
      i++;
      heredocBodies();
    } else if (c === '#' && !w) {
      while (i < src.length && src[i] !== '\n') i++;
    } else if (c === "'") {
      start().quoted = true;
      const e = src.indexOf("'", i + 1);
      w.text += src.slice(i + 1, e < 0 ? src.length : e);
      i = e < 0 ? src.length : e + 1;
    } else if (c === '$' && src[i + 1] === "'") {
      start().dyn = true;
      let j = i + 2;
      while (j < src.length && src[j] !== "'") j += src[j] === '\\' ? 2 : 1;
      i = j + 1;
    } else if (c === '"') {
      start().quoted = true;
      i++;
      while (i < src.length && src[i] !== '"') {
        if (src[i] === '\\' && '$`"\\\n'.includes(src[i + 1])) {
          if (src[i + 1] !== '\n') w.text += src[i + 1];
          i += 2;
        } else if (src[i] === '$') dollar();
        else if (src[i] === '`') backtick();
        else w.text += src[i++];
      }
      i++;
    } else if (c === '\\') {
      start().text += src[i + 1] ?? '';
      i += 2;
    } else if (c === '$') {
      start();
      dollar();
    } else if (c === '`') {
      start();
      backtick();
    } else if ((c === '<' || c === '>') && src[i + 1] === '(') {
      start();
      const e = closing(i + 2);
      w.subs.push(src.slice(i + 2, e));
      w.dyn = true;
      i = e + 1;
    } else if (c === '<' || c === '>' || (c === '&' && src[i + 1] === '>')) {
      let fd = '';
      if (w && !w.quoted && !w.dyn && /^\d+$/.test(w.text)) {
        fd = w.text;
        w = null;
      } else end();
      const op = /^(&>>|&>|>>|>\||>&|>|<<<|<<-|<<|<>|<&|<)/.exec(src.slice(i))[0];
      i += op.length;
      toks.push({ t: 'redir', op, fd });
      if (op === '<<' || op === '<<-') {
        while (src[i] === ' ' || src[i] === '\t') i++;
        let j = i;
        while (j < src.length && !/[\s;&|<>()]/.test(src[j])) {
          if (src[j] === "'" || src[j] === '"') j = src.indexOf(src[j], j + 1) + 1 || src.length;
          else j++;
        }
        const raw = src.slice(i, j);
        heredocs.push({ delim: raw.replace(/['"\\]/g, ''), strip: op === '<<-', expand: !/['"\\]/.test(raw) });
        i = j;
        toks.push({ t: 'word', ...literal(raw) });
      }
    } else if (c === ';' || c === '&' || c === '|' || c === '(' || c === ')') {
      end();
      const op = /^(&&|\|\||;;&|;;|;&|\|&|[;&|()])/.exec(src.slice(i))[0];
      i += op.length;
      toks.push({ t: 'op', v: op.startsWith(';') && op.length > 1 ? ';;' : op === '|&' ? '|' : op });
    } else {
      start();
      if (c === '=' && !w.quoted && !w.dyn && /^[A-Za-z_]\w*$/.test(w.text)) w.assign = true;
      if ('*?['.includes(c) || (c === '~' && w.text === '') || ((c === '{' || c === '}') && i > w.at)) w.dyn = true;
      w.text += c;
      i++;
    }
  }
  end();
  return toks;
}

// getopt-like: `short` holds the letters that take a value, `long` the long names that do. A word built at run time
// is an operand, so its target is refused rather than skipped.
function parse(args, short = '', long = []) {
  const flags = [];
  const operands = [];
  let more = true;
  for (let k = 0; k < args.length; k++) {
    const a = args[k];
    const t = a.text;
    if (!more || a.dyn || t === '-' || !t.startsWith('-')) operands.push(a);
    else if (t === '--') more = false;
    else if (t.startsWith('--')) {
      const eq = t.indexOf('=');
      const name = eq < 0 ? t.slice(2) : t.slice(2, eq);
      if (eq >= 0) flags.push({ name, value: { ...a, text: t.slice(eq + 1) } });
      else if (long.includes(name) && k + 1 < args.length) flags.push({ name, value: args[++k] });
      else flags.push({ name });
    } else {
      for (let j = 1; j < t.length; j++) {
        if (!short.includes(t[j])) {
          flags.push({ name: t[j] });
          continue;
        }
        if (j + 1 < t.length) flags.push({ name: t[j], value: { ...a, text: t.slice(j + 1) } });
        else if (k + 1 < args.length) flags.push({ name: t[j], value: args[++k] });
        else flags.push({ name: t[j] });
        break;
      }
    }
  }
  const has = (...names) => flags.some((f) => names.includes(f.name));
  const vals = (...names) => flags.filter((f) => names.includes(f.name) && f.value).map((f) => f.value);
  return { flags, operands, has, vals };
}

const last = (list) => (list.length ? [list[list.length - 1]] : []);
const DOT = literal('.');
const local = (list) => list.filter((a) => !/^[^/]*:/.test(a.text)); // scp/rsync host:path is not this machine

// name → write targets of one call (words).
const WRITERS = {
  tee: (a) => parse(a).operands,
  rm: (a) => parse(a).operands,
  rmdir: (a) => parse(a).operands,
  unlink: (a) => parse(a).operands,
  shred: (a) => parse(a, 'ns').operands,
  touch: (a) => parse(a, 'dtr', ['date', 'reference']).operands,
  mkdir: (a) => parse(a, 'm', ['mode']).operands,
  mkfifo: (a) => parse(a, 'm', ['mode']).operands,
  truncate: (a) => parse(a, 'sr', ['size', 'reference']).operands,
  chmod: (a) => parse(a).operands.slice(1),
  chown: (a) => parse(a).operands.slice(1),
  chgrp: (a) => parse(a).operands.slice(1),
  dd: (a) => a.filter((w) => w.text.startsWith('of=')).map((w) => ({ ...w, text: w.text.slice(3) })),
  cp: (a) => copyLike(parse(a, 'tS', ['target-directory', 'suffix'])),
  ln: (a) => {
    const p = parse(a, 'tS', ['target-directory', 'suffix']);
    return p.operands.length === 1 && !p.has('t', 'target-directory') ? [DOT] : copyLike(p);
  },
  install: (a) => {
    const p = parse(a, 'tmogSfT', ['target-directory', 'mode', 'owner', 'group', 'suffix']);
    return p.has('d', 'directory') ? p.operands : copyLike(p);
  },
  rsync: (a) => local(copyLike(parse(a, 'efTBM', ['exclude', 'include', 'filter', 'rsh', 'temp-dir', 'files-from']))),
  scp: (a) => local(last(parse(a, 'cFiJlmoPS').operands)),
  ditto: (a) => last(parse(a).operands),
  mv: (a) => {
    const p = parse(a, 'tS', ['target-directory', 'suffix']);
    return [...p.operands, ...p.vals('t', 'target-directory')];
  },
  sort: (a) =>
    parse(a, 'okSTt', ['output', 'key', 'buffer-size', 'temporary-directory', 'field-separator']).vals('o', 'output'),
  iconv: (a) => parse(a, 'oft', ['output', 'from-code', 'to-code']).vals('o', 'output'),
  base64: (a) => parse(a, 'oib', ['output', 'input', 'break']).vals('o', 'output'),
  uniq: (a) => parse(a, 'fsw', ['skip-fields', 'skip-chars', 'check-chars']).operands.slice(1, 2),
  split: (a) => {
    const p = parse(a, 'lbnapdtC', ['lines', 'bytes', 'number', 'suffix-length', 'additional-suffix', 'line-bytes']);
    return p.operands.length > 1 ? p.operands.slice(1, 2) : [DOT];
  },
  csplit: (a) => {
    const p = parse(a, 'fbn', ['prefix', 'suffix-format', 'digits']);
    return p.vals('f', 'prefix').length ? p.vals('f', 'prefix') : [DOT];
  },
  mktemp: (a) => {
    const p = parse(a, 'p', ['tmpdir', 'suffix']);
    if (p.has('u', 'dry-run')) return [];
    if (p.vals('p', 'tmpdir').length) return p.vals('p', 'tmpdir');
    return p.operands.length && !p.has('t', 'tmpdir') ? p.operands.slice(0, 1) : [literal(tmpRaw || '.')];
  },
  gzip: compressor,
  gunzip: compressor,
  bzip2: compressor,
  bunzip2: compressor,
  xz: compressor,
  unxz: compressor,
  zstd: compressor,
  unzstd: compressor,
  compress: compressor,
  uncompress: compressor,
  zip: (a) => parse(a, 'bnitxP').operands.slice(0, 1),
  unzip: (a) => {
    const p = parse(a, 'dxP');
    return p.has('l', 't', 'p', 'Z', 'v', 'z') ? [] : p.vals('d').length ? p.vals('d') : [DOT];
  },
  tar: (a) => {
    // the old form bundles the mode in the first word (`tar xzf a.tar`)
    const words =
      a[0] && !a[0].dyn && !a[0].text.startsWith('-') ? [{ ...a[0], text: `-${a[0].text}` }, ...a.slice(1)] : a;
    const p = parse(words, 'fCbTXIKL', [
      'file',
      'directory',
      'exclude',
      'files-from',
      'exclude-from',
      'use-compress-program',
    ]);
    const out = [];
    if (p.has('x', 'extract', 'get') && !p.has('O', 'to-stdout'))
      out.push(...(p.vals('C', 'directory').length ? p.vals('C', 'directory') : [DOT]));
    if (p.has('c', 'r', 'u', 'A', 'create', 'append', 'update', 'catenate', 'delete'))
      out.push(...p.vals('f', 'file').filter((f) => f.text !== '-'));
    return out;
  },
  cpio: (a) => {
    const p = parse(a, 'FOEHIRDMC', ['file', 'directory']);
    const out = p.vals('F', 'O', 'file');
    if (p.has('i', 'extract')) out.push(...(p.vals('D', 'directory').length ? p.vals('D', 'directory') : [DOT]));
    if (p.has('p', 'pass-through')) out.push(...last(p.operands));
    return out;
  },
  curl: (a) => {
    const p = parse(a, 'oDcKdHuXAeEbFTwmxrUyYzCQPt', [
      'output',
      'dump-header',
      'cookie-jar',
      'trace',
      'trace-ascii',
      'stderr',
      'output-dir',
      'config',
      'data',
      'header',
      'user',
      'request',
      'user-agent',
      'referer',
      'cookie',
      'form',
      'upload-file',
      'write-out',
      'max-time',
      'proxy',
      'range',
    ]);
    const out = p
      .vals('o', 'output', 'D', 'dump-header', 'c', 'cookie-jar', 'trace', 'trace-ascii', 'stderr')
      .filter((f) => f.text !== '-');
    if (p.has('O', 'remote-name', 'remote-name-all', 'J'))
      out.push(...(p.vals('output-dir').length ? p.vals('output-dir') : [DOT]));
    return out;
  },
  wget: (a) => {
    const p = parse(a, 'OPoaBeiTtwQUlAR', ['output-document', 'directory-prefix', 'output-file', 'append-output']);
    const out = p.vals('o', 'a', 'output-file', 'append-output');
    const doc = p.vals('O', 'output-document');
    if (doc.length) out.push(...doc.filter((f) => f.text !== '-'));
    else out.push(...(p.vals('P', 'directory-prefix').length ? p.vals('P', 'directory-prefix') : [DOT]));
    return out;
  },
  sed: (a) => {
    const p = parse(a, 'efl', ['expression', 'file', 'line-length']);
    if (!p.flags.some((f) => f.name === 'i' || f.name.startsWith('in-place'))) return [];
    // `-i` swallows a GNU suffix (`-i.bak`, parsed as the flags `.`, `b`, …); BSD's suffix is the next word
    let ops = p.operands;
    if (a.some((w) => w.text === '-i') && ops[0] && (ops[0].text === '' || ops[0].text.startsWith('.')))
      ops = ops.slice(1);
    return p.has('e', 'f', 'expression', 'file') ? ops : ops.slice(1);
  },
  perl: (a) => perlLike(a, 'eEMmIxl'),
  ruby: (a) => perlLike(a, 'eErIxCK'),
  awk: awkLike,
  gawk: awkLike,
  patch: (a) => {
    const p = parse(a, 'pdoiFrBYzVDg', ['directory', 'output', 'input', 'reject-file', 'strip', 'prefix', 'suffix']);
    const dir = p.vals('d', 'directory');
    return [...(dir.length ? dir : [DOT]), ...p.vals('o', 'output', 'r', 'reject-file'), ...p.operands.slice(0, 1)];
  },
  ex: editor,
  ed: editor,
  vi: editor,
  vim: editor,
  nvim: editor,
  nano: editor,
  emacs: editor,
  find: (a) => {
    const at = a.findIndex((w) => /^[-(!]/.test(w.text));
    const starts = at < 0 ? a : a.slice(0, at);
    const expr = at < 0 ? [] : a.slice(at);
    const out = [];
    const deletes = expr.some(
      (w, k) =>
        w.text === '-delete' ||
        (/^-(exec|execdir|ok|okdir)$/.test(w.text) &&
          expr[k + 1] &&
          (expr[k + 1].dyn || Object.hasOwn(WRITERS, path.basename(expr[k + 1].text)))),
    );
    if (deletes) out.push(...(starts.length ? starts : [DOT]));
    expr.forEach((w, k) => /^-(fprint|fprint0|fprintf|fls)$/.test(w.text) && expr[k + 1] && out.push(expr[k + 1]));
    return out;
  },
};
function copyLike(p) {
  const dirs = p.vals('t', 'target-directory');
  return dirs.length ? dirs : last(p.operands);
}
function compressor(a) {
  const p = parse(a, 'bSL', ['suffix']);
  return p.has('c', 'stdout', 'to-stdout', 'l', 'list', 't', 'test') ? [] : p.operands;
}
function perlLike(a, short) {
  if (!a.some((w) => !w.dyn && /^-[^-]/.test(w.text) && w.text.includes('i'))) return [];
  return parse(a, short).operands; // without -e the first operand is the script: counted too, which only refuses more
}
function awkLike(a) {
  const p = parse(a, 'fvFiE', ['file', 'assign', 'field-separator', 'include']);
  if (!p.vals('i', 'include').some((v) => v.text === 'inplace')) return [];
  return p.has('f', 'file', 'E') ? p.operands : p.operands.slice(1);
}
function editor(a) {
  return parse(a, 'cSuUTiswW').operands;
}

// git: a subcommand in GIT_WRITES (or a write form of the list commands below) writes its directory, its work tree
// and its git dirs; any other name (an alias, an external git-*) is refused (review pass 2).
const GIT_WRITES = new Set(
  (
    'add am apply bisect branch checkout checkout-index cherry-pick clean clone commit commit-tree config fetch ' +
    'format-patch gc hash-object init maintenance merge mktree mv notes prune pull read-tree rebase reflog remote ' +
    'repack replace reset restore revert rm sparse-checkout stash submodule switch symbolic-ref tag update-index ' +
    'update-ref worktree write-tree'
  ).split(' '),
);
function gitWrite(args) {
  let k = 0;
  let dir = '.';
  let unplaceable = false;
  let configured = false; // -c / --config-env: a setting can move or extend the writes (core.worktree, hooksPath)
  while (k < args.length && args[k].text.startsWith('-') && !args[k].dyn) {
    const t = args[k].text;
    if (t === '-C' && args[k + 1]) {
      if (args[k + 1].dyn) unplaceable = true;
      else dir = args[k + 1].text.startsWith('/') ? args[k + 1].text : path.join(dir, args[k + 1].text);
      k += 2;
    } else if (/^--(git-dir|work-tree)/.test(t)) {
      unplaceable = true;
      k += t.includes('=') ? 1 : 2;
    } else if (/^(-c|--config-env)/.test(t)) {
      configured = true;
      k += t === '-c' || t === '--config-env' ? 2 : 1;
    } else k += /^(--exec-path|--namespace)$/.test(t) ? 2 : 1;
  }
  if (k < args.length && args[k].dyn)
    return { problem: `runs git with a subcommand built at run time ('${args[k].raw}')` };
  const sub = args[k]?.text;
  if (sub === undefined) return null;
  // a push writes the repository it names, which for a clone of the worktree is the worktree's (review pass 1)
  if (sub === 'push' || sub === 'send-pack')
    return { problem: `runs 'git ${sub}', which writes another repository; the reviewer never pushes` };
  if (!GIT_READS.has(sub) && !GIT_WRITES.has(sub))
    return {
      problem: `runs 'git ${sub}', which is not a git subcommand this check knows (an alias, an external git-${sub} or a typo)`,
    };
  const p = parse(args.slice(k + 1), 'mFCcSU', [
    'contains',
    'no-contains',
    'merged',
    'no-merged',
    'points-at',
    'format',
    'sort',
    'message',
    'file',
    'output',
  ]);
  const op0 = p.operands[0]?.text;
  const read = (() => {
    if (GIT_READS.has(sub)) return true;
    switch (sub) {
      case 'branch':
        return (
          !p.has(
            'd',
            'D',
            'm',
            'M',
            'c',
            'C',
            'f',
            'u',
            'delete',
            'move',
            'copy',
            'force',
            'set-upstream-to',
            'unset-upstream',
            'edit-description',
            'track',
            'no-track',
          ) &&
          (!p.operands.length || p.has('l', 'list'))
        );
      case 'tag':
        return (
          !p.has(
            'd',
            'a',
            's',
            'u',
            'f',
            'm',
            'F',
            'e',
            'delete',
            'annotate',
            'sign',
            'force',
            'message',
            'file',
            'edit',
          ) &&
          (!p.operands.length || p.has('l', 'list'))
        );
      case 'stash':
        return op0 === 'list' || op0 === 'show';
      case 'worktree':
        return op0 === 'list';
      case 'reflog':
        return op0 === undefined || op0 === 'show';
      case 'config':
        return (
          p.has('get', 'get-all', 'get-regexp', 'get-urlmatch', 'list', 'l') ||
          op0 === 'get' ||
          op0 === 'list' ||
          (p.operands.length === 1 && !p.flags.length)
        );
      case 'remote':
        return op0 === undefined || op0 === 'show' || op0 === 'get-url';
      case 'apply':
        return p.has('check', 'stat', 'numstat', 'summary') && !p.has('apply', 'index', 'cached', '3way');
      case 'symbolic-ref':
        return p.operands.length <= 1 && !p.has('d', 'delete');
      default:
        return false;
    }
  })();
  if (read) return { words: p.vals('output') };
  if (unplaceable || gitEnv)
    return {
      problem: `runs 'git ${sub}' with -C built at run time, --git-dir/--work-tree, or GIT_DIR/GIT_WORK_TREE/core.worktree in the command`,
    };
  if (configured) return { problem: `runs 'git -c … ${sub}': a setting given with -c can move or extend its writes` };
  if (sub === 'init') return { words: p.operands.length ? p.operands.slice(0, 1) : [literal(dir)] };
  if (sub === 'clone') return { words: [p.operands.length > 1 ? p.operands[p.operands.length - 1] : literal(dir)] };
  return { git: `git ${sub}`, dir };
}

const writes = []; // { word, cmd, cwd } | { git, dir, cwd } | { problem }
function analyze(src, cwd0, depth = 0) {
  if (depth > 8) {
    writes.push({ problem: 'nests command substitutions too deep to read' });
    return;
  }
  let cwd = cwd0;
  let unsure = false; // a cd joined by && set cwd; a later ; || | & means it may not have run
  // A compound (`for`, `while`, `if`, `{ …; }`) opened right after `cd X &&` runs only if the cd did, so its `;`s keep
  // that cwd until its closing word; a cd inside it makes the cwd unknown (a loop repeats it).
  let blocks = 0;
  let kept = 0; // the block depth that keeps the cwd, 0: none
  let prev = ';';
  const stack = [];
  let cmd = { words: [], redirs: [] };
  let pending = null;
  const finish = (op) => {
    if (cmd.words.length === 0 && cmd.redirs.length === 0) return; // `&&` before a newline continues the list
    const first = cmd.words.find((w) => !(w.text === '!' && !w.quoted));
    const word = first && !first.quoted && !first.dyn ? first.text : '';
    if (OPENERS.has(word)) {
      blocks++;
      if (!kept && unsure && prev === '&&' && cwd !== null) kept = blocks;
    }
    const cd = simple(cmd, cwd, depth);
    if (word === 'esac') cases.pop();
    if (CLOSERS.has(word)) {
      if (kept === blocks) kept = 0;
      blocks = Math.max(0, blocks - 1);
    }
    cmd = { words: [], redirs: [] };
    if (cd !== undefined) {
      cwd = op === '&&' && cd !== null && !kept ? cd : null;
      unsure = cwd !== null;
      kept = 0;
    } else if (op !== '&&' && unsure && !kept) cwd = null;
    prev = op;
  };
  // `case`: its header (to `in`) and each pattern (after `in` or `;;`, to its `)`, with any `(` and `|` in it) are
  // dropped, never read as commands, pipes or subshells (review passes 1, 2); the case is a block for the cwd rule.
  const cases = []; // the paren depth of each open case
  let header = false;
  let pattern = false;
  for (const t of lex(src)) {
    if (t.t === 'subs') for (const s of t.subs) analyze(s, cwd, depth + 1);
    else if (t.t === 'redir') pending = { ...t, pos: cmd.words.length };
    else if (t.t === 'word') {
      const bare = !t.quoted && !t.dyn;
      if (header || pattern) {
        for (const s of t.subs) analyze(s, cwd, depth + 1);
        if (header && bare && t.text === 'in') [header, pattern] = [false, true];
        else if (pattern && bare && t.text === 'esac') [pattern, cmd.words] = [false, [t]];
      } else if (bare && t.text === 'case' && cmd.words.length === 0) {
        blocks++;
        if (!kept && unsure && prev === '&&' && cwd !== null) kept = blocks;
        cases.push(stack.length);
        header = true;
      } else if (pending) cmd.redirs.push({ ...pending, word: t });
      else cmd.words.push(t);
      pending = null;
    } else if (pattern) {
      if (t.v === ')') pattern = false;
    } else if (header) {
      // an operator inside the header is a syntax error; nothing runs
    } else if (t.v === ';;') {
      finish(';');
      if (cases.length && cases[cases.length - 1] === stack.length) pattern = true;
    } else if (t.v === '(') stack.push({ cwd, unsure, blocks, kept });
    else if (t.v === ')') {
      finish(')');
      ({ cwd, unsure, blocks, kept } = stack.pop() ?? { cwd, unsure, blocks, kept });
    } else finish(t.v);
  }
  finish(';');
}

// Records the writes of one simple command; returns the new cwd for cd/pushd/popd (null: unknown), else undefined.
function simple(cmd, cwd0, depth) {
  let cwd = cwd0;
  for (const w of [...cmd.words, ...cmd.redirs.map((r) => r.word)]) for (const s of w.subs) analyze(s, cwd, depth + 1);
  const testEnd = cmd.words[0]?.raw === '[[' ? cmd.words.findIndex((w) => w.raw === ']]') : -1;
  let stdout = false;
  for (const r of cmd.redirs) {
    if (r.pos <= testEnd) continue; // `<` and `>` inside [[ ]] compare
    const file = /^(>|>>|>\||&>|&>>|<>)$/.test(r.op) || (r.op === '>&' && !/^(\d+|-)$/.test(r.word.text));
    if (file && (r.fd === '' || r.fd === '1') && r.op !== '<>') stdout = true;
    if (file && !(DEVICES.test(r.word.text) && !r.word.dyn)) writes.push({ word: r.word, cmd: r.op, cwd });
  }
  const ws = cmd.words;
  let i = 0;
  let viaXargs = false;
  for (;;) {
    while (i < ws.length && ((KEYWORDS.has(ws[i].text) && !ws[i].quoted) || ws[i].assign)) i++;
    const n = ws[i] && !ws[i].dyn ? path.basename(ws[i].text) : undefined;
    if (n === 'env') {
      i++;
      while (i < ws.length && (ws[i].text.startsWith('-') || ws[i].assign)) {
        if (/^(-C|--chdir)/.test(ws[i].text)) cwd = null;
        i += /^(-u|-C|--unset|--chdir)$/.test(ws[i].text) ? 2 : 1;
      }
    } else if (n !== undefined && Object.hasOwn(LAUNCHERS, n)) {
      if (n === 'nohup' && !stdout) writes.push({ word: literal('nohup.out'), cmd: 'nohup', cwd });
      i++;
      while (i < ws.length && ws[i].text.startsWith('-')) {
        const t = ws[i].text;
        i += t.length === 2 && LAUNCHERS[n].includes(t[1]) ? 2 : 1;
      }
      if (['timeout', 'flock', 'taskset'].includes(n) && i < ws.length) i++; // the duration, lock file or mask
    } else if (['pnpm', 'npm', 'yarn', 'bun'].includes(n) && ['exec', 'dlx', 'x'].includes(ws[i + 1]?.text)) {
      i += 2;
      while (i < ws.length && ws[i].text.startsWith('-')) i++;
    } else if (n === 'xargs') {
      viaXargs = true;
      i++;
      while (i < ws.length && ws[i].text.startsWith('-')) i += /^-[IdEnLPsa]$/.test(ws[i].text) ? 2 : 1;
    } else break;
  }
  if (i >= ws.length) return undefined;
  const head = ws[i];
  const args = ws.slice(i + 1);
  if (head.dyn) {
    writes.push({ problem: `runs a command whose name is built at run time ('${head.raw}')` });
    return undefined;
  }
  const name = path.basename(head.text);
  if (name === 'cd' || name === 'pushd' || name === 'popd') {
    const target = args.find((a) => !/^-[LPe@]+$/.test(a.text));
    if (name === 'popd' || !target || target.dyn || target.text === '-') return null;
    if (!target.text.startsWith('/') && cwd === null) return null;
    return physical(cwd ?? '/', target.text);
  }
  const shellC = /^(ba|z|da|k)?sh$/.test(name) ? args.findIndex((a) => /^-[a-z]*c[a-z]*$/.test(a.text)) : -1;
  if (name === 'eval' || shellC >= 0) {
    const body = name === 'eval' ? args : args.slice(shellC + 1, shellC + 2);
    if (body.some((a) => a.dyn))
      writes.push({ problem: `runs code built at run time ('${head.raw} ${body.map((a) => a.raw).join(' ')}')` });
    else analyze(body.map((a) => a.text).join(' '), cwd, depth + 1);
    return undefined;
  }
  if (name !== 'git' && !Object.hasOwn(WRITERS, name)) return undefined;
  if (viaXargs) {
    writes.push({
      problem: `hands '${name}' its arguments through xargs, so its targets are not known before it runs`,
    });
    return undefined;
  }
  if (name === 'git') {
    const g = gitWrite(args);
    if (g?.problem) writes.push({ problem: g.problem });
    else if (g?.git) writes.push({ git: g.git, dir: g.dir, cwd });
    else g?.words.forEach((w) => writes.push({ word: w, cmd: 'git', cwd }));
    return undefined;
  }
  const targets = WRITERS[name](args);
  for (const w of targets) if (w.dyn || !DEVICES.test(w.text)) writes.push({ word: w, cmd: name, cwd });
  if (name === 'ln') recordLinks(args, targets, cwd);
  return undefined;
}

// `ln -s` in this command makes paths that do not exist yet, so a later write through one cannot be resolved before
// the command runs (review pass 1); a link from an earlier call exists and is followed.
const links = [];
function recordLinks(args, targets, cwd) {
  const p = parse(args, 'tS', ['target-directory', 'suffix']);
  if (!p.has('s', 'symbolic')) return;
  const intoDir = p.has('t', 'target-directory');
  const sources = intoDir ? p.operands : p.operands.slice(0, -1);
  for (const t of targets) {
    if (t.dyn || (!t.text.startsWith('/') && cwd === null)) continue;
    const abs = physical(cwd ?? '/', t.text);
    if (intoDir || (sources.length && fs.statSync(abs, { throwIfNoEntry: false })?.isDirectory()))
      for (const s of sources) links.push(path.join(abs, path.basename(s.text)));
    else links.push(abs);
  }
}

const RULE =
  'The reviewer writes with Bash only under $TMPDIR, outside the worktree and not in the session scratchpad (B1.84)';
const UNSURE =
  'is relative to a directory a cd may not have reached (join the cd and the write with &&, or name a $TMPDIR/… path)';
function verdict() {
  const cwd = real(String(input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd()));
  analyze(command, cwd);
  if (writes.length === 0) return '';
  const first = writes[0];
  const what = first.problem
    ? `the command ${first.problem}`
    : first.git
      ? `'${first.git}'`
      : `'${first.word.raw}' (${first.cmd})`;
  if (tmpRaw === '')
    return `TMPDIR is unset or empty, so ${what} has no copy to land in. ${RULE}: probe a copy there, or report the probe as not run.`;
  if (!tmpRaw.startsWith('/') || !fs.statSync(tmpRaw, { throwIfNoEntry: false })?.isDirectory())
    return `TMPDIR '${tmpRaw}' is not an existing absolute directory, so ${what} has no copy to land in. ${RULE}.`;
  const tmp = real(tmpRaw);
  let top = cwd;
  try {
    const out = execFileSync('git', ['-C', cwd, 'rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    top = real(out.trim());
  } catch {
    // not in git: the cwd itself is the tree to protect
  }
  // The project (worktrees nest in it) and TMPDIR must be disjoint; the cwd's tree may itself be a copy under TMPDIR.
  const project = real(process.env.CLAUDE_PROJECT_DIR || top);
  for (const tree of [project, top]) {
    if (inside(tmp, tree) || (tree === project && inside(tree, tmp)))
      return `TMPDIR '${tmp}' overlaps the worktree '${tree}', so a copy there is the worktree. ${RULE}: set TMPDIR to a directory outside it, or report the probe as not run.`;
  }
  for (const wr of writes) {
    if (wr.problem) return `the command ${wr.problem}. ${RULE}: name each target as a literal path under $TMPDIR.`;
    if (wr.git) {
      if (!wr.dir.startsWith('/') && wr.cwd === null) return `'${wr.git}' ${UNSURE}. ${RULE}.`;
      const dir = physical(wr.cwd ?? '/', wr.dir);
      const dirs = [dir];
      try {
        const out = execFileSync(
          'git',
          ['-C', dir, 'rev-parse', '--absolute-git-dir', '--path-format=absolute', '--git-common-dir'],
          { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
        );
        dirs.push(...out.trim().split('\n'));
      } catch {
        // not a repository (yet): only its directory
      }
      try {
        // the work tree, which core.worktree set by an earlier call can move out of the directory (review pass 2)
        const out = execFileSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        });
        dirs.push(out.trim());
      } catch {
        // a bare repository or none: no work tree
      }
      const outside = dirs.map((d) => physical('/', d)).find((d) => !inside(d, tmp));
      if (outside)
        return `'${wr.git}' writes '${outside}', outside TMPDIR '${tmp}' (a copy whose .git points back at the repository writes the repository). ${RULE}: restore the copy with cp, sed or patch, or git clone it under $TMPDIR.`;
      continue;
    }
    const w = wr.word;
    if (w.dyn && tmpRebound && w.raw.includes('TMPDIR'))
      return `'${w.raw}' (${wr.cmd}) is built at run time: the command sets TMPDIR (or drops it, or sources a file), so $TMPDIR in it is not known. ${RULE}: use the TMPDIR the session has.`;
    if (w.dyn)
      return `'${w.raw}' (${wr.cmd}) is built at run time (a variable other than $TMPDIR, a substitution, a glob or ~), so its target is not known. ${RULE}: name it as a literal path under $TMPDIR.`;
    if (!w.text.startsWith('/') && wr.cwd === null) return `'${w.raw}' (${wr.cmd}) ${UNSURE}. ${RULE}.`;
    const abs = physical(wr.cwd ?? '/', w.text);
    const via = links.find((l) => inside(abs, l) && !(wr.cmd === 'ln' && abs === l)); // ln's own link is its write
    if (via)
      return `'${w.raw}' (${wr.cmd}) goes through '${via}', a symlink this same command makes, so its target is not known before it runs. ${RULE}: make the link in one call and write through it in the next.`;
    if (!inside(abs, tmp))
      return `'${w.raw}' (${wr.cmd}) resolves to '${abs}', outside TMPDIR '${tmp}'. ${RULE}: probe a copy there (cp -r . "$TMPDIR/probe").`;
  }
  return '';
}

process.stdout.write(verdict());
