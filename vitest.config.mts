import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Two projects: `unit` runs *.test.ts in node (actions, lib, route handlers), `component` runs *.test.tsx in
// jsdom (React components). Playwright owns e2e/ and is never picked up here.
const cacheDir = process.env.VITEST_CACHE_DIR ?? 'node_modules/.vitest';
const exclude = ['node_modules/**', '.next/**', '.next-*/**', '.worktrees/**', '.stryker-tmp/**', 'e2e/**'];

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  cacheDir,
  test: {
    globals: true,
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/app/**/layout.tsx'],
    },
    projects: [
      {
        extends: true,
        test: { name: 'unit', environment: 'node', include: ['src/**/*.test.ts'], exclude },
      },
      {
        extends: true,
        test: {
          name: 'component',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          exclude,
          setupFiles: ['./vitest.setup.ts'],
        },
      },
    ],
  },
});
