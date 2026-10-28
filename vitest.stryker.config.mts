import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Unit project only, used by Stryker: mutants live in src/lib and src/actions, whose tests run in node.
// Component and e2e tests are not part of the mutation run (too slow, and they do not target those files).
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**', '.worktrees/**', '.stryker-tmp/**', 'e2e/**'],
  },
});
