import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

// Order matters: Next presets, then type-aware TS rules, then prettier (disables formatting rules) last.
const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.next-*/**',
      'out/**',
      'build/**',
      'coverage/**',
      'reports/**',
      '.stryker-tmp/**',
      '.cache/**',
      '.worktrees/**',
      'storage/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    rules: {
      // Conventions §3: any is forbidden, floating promises are bugs, console is not a logger.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'interface', format: ['PascalCase'], custom: { regex: '^I[A-Z]', match: false } },
      ],
      'no-console': 'error',
    },
  },
  {
    // Config, scripts and seeds run outside the app: console is the logger there.
    files: ['*.config.{ts,mts,mjs}', 'prisma/seed.ts', 'e2e/**', 'vitest.setup.ts'],
    rules: { 'no-console': 'off', '@typescript-eslint/explicit-module-boundary-types': 'off' },
  },
  {
    files: ['**/*.{mjs,js}'],
    ...tseslint.configs.disableTypeChecked,
  },
  prettier,
];

export default eslintConfig;
