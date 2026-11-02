// B1.46: the layering of CLAUDE.md "Architecture in one pass" and src/CLAUDE.md, one rule per direct import; run by
// scripts/ci/check-layers.sh with .dependency-cruiser-client.mjs. Protected: changing it needs config-change-approved.
// Type-only imports are followed too (tsPreCompilationDeps: true): a Prisma type outside src/lib breaks the layer.
/** @type {import('dependency-cruiser').IConfiguration} */
const config = {
  forbidden: [
    {
      name: 'prisma-only-in-lib',
      comment: 'The Prisma client (src/lib/prisma.ts, @prisma/client) is imported only under src/lib.',
      severity: 'error',
      from: { pathNot: '^src/lib/' },
      to: { path: ['^src/lib/prisma\\.ts$', 'node_modules/@prisma/client/'] },
    },
    {
      name: 'components-no-server-only',
      comment:
        'A component never imports src/lib/prisma.ts or server-only; it reaches the database only through a Server Action.',
      severity: 'error',
      from: { path: '^src/components/' },
      to: { path: ['^src/lib/prisma\\.ts$', 'node_modules/server-only/'] },
    },
    {
      name: 'revalidate-only-in-actions',
      comment: 'next/cache (revalidatePath) is imported only by the Server Actions in src/actions.',
      severity: 'error',
      from: { pathNot: '^src/actions/' },
      to: {
        path: ['node_modules/next/cache\\.js$', 'node_modules/next/dist/server/web/spec-extension/revalidate\\.js$'],
      },
    },
    {
      name: 'lib-imports-no-upper-layer',
      comment:
        'Imports only point down (app -> components -> actions -> lib): lib imports no action, component or page.',
      severity: 'error',
      from: { path: '^src/lib/' },
      to: { path: '^src/(actions|components|app)/' },
    },
    {
      name: 'actions-import-no-ui',
      comment: 'Imports only point down: an action imports no component or page.',
      severity: 'error',
      from: { path: '^src/actions/' },
      to: { path: '^src/(components|app)/' },
    },
    {
      name: 'components-import-no-app',
      comment: 'Imports only point down: a component imports no page or route.',
      severity: 'error',
      from: { path: '^src/components/' },
      to: { path: '^src/app/' },
    },
    {
      name: 'no-circular',
      comment: 'No module reaches itself through its imports.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'not-to-unresolvable',
      comment: 'An unresolved import slips past every rule above (a broken @/ alias would make them all vacuous).',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
  },
};

export default config;
