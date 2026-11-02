// B1.46: what a component reaches through src/lib, checked by scripts/ci/check-layers.sh after .dependency-cruiser.mjs.
// src/actions is not followed: a component calls a Server Action over the network, so the action's imports never
// reach the component's bundle. Type-only imports are erased by the compiler, so they are not followed either.
/** @type {import('dependency-cruiser').IConfiguration} */
const config = {
  forbidden: [
    {
      name: 'components-reach-db-only-through-actions',
      comment:
        'A component never reaches src/lib/prisma.ts or server-only through src/lib: it gets data as props or from a Server Action.',
      severity: 'error',
      from: { path: '^src/components/' },
      to: { path: ['^src/lib/prisma\\.ts$', 'node_modules/server-only/'], reachable: true },
    },
  ],
  options: {
    doNotFollow: { path: ['node_modules', '^src/actions/'] },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: false,
  },
};

export default config;
