// Shared by the config files (vitest, playwright, stryker). Loads ./.env into process.env when present; values
// already in the shell win, so CI and `PORT=... pnpm dev` behave as expected. Node 24 built-in, no dotenv package.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadDotEnv(cwd: string = process.cwd()): void {
  const file = resolve(cwd, '.env');
  if (existsSync(file)) {
    process.loadEnvFile(file);
  }
}
