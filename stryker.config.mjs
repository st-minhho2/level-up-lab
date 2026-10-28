// Mutation testing for the layers that hold logic. CI fails below 70% (spec §2).
// Report: reports/mutation/index.html (git-ignored, uploaded as a CI artifact).
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  // pnpm keeps plugins unhoisted; name them so Stryker does not depend on node_modules scanning.
  plugins: ['@stryker-mutator/vitest-runner', '@stryker-mutator/typescript-checker'],
  testRunner: 'vitest',
  vitest: { configFile: 'vitest.stryker.config.mts' },
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  mutate: ['src/lib/**/*.ts', 'src/actions/**/*.ts', '!src/**/*.test.ts', '!src/lib/prisma.ts'],
  coverageAnalysis: 'perTest',
  reporters: ['clear-text', 'progress', 'html', 'json'],
  htmlReporter: { fileName: 'reports/mutation/index.html' },
  jsonReporter: { fileName: 'reports/mutation/mutation.json' },
  thresholds: { high: 90, low: 80, break: 70 },
  // Per-worktree temp dir (scripts/worktree.sh sets STRYKER_TEMP_DIR) so parallel runs never collide.
  tempDirName: process.env.STRYKER_TEMP_DIR ?? '.stryker-tmp',
  cleanTempDir: true,
  concurrency: 4,
  timeoutMS: 15000,
};
export default config;
