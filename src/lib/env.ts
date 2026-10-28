import { z } from 'zod';

// Validated at first use; the app fails fast on a missing or malformed variable instead of at the first query.
// Every knob that scripts/worktree.sh overrides per worktree lives here so isolation is visible in one place.
const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine((value) => value.startsWith('postgresql://') || value.startsWith('postgres://'), {
      message: 'DATABASE_URL must be a postgresql:// URL',
    }),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NEXT_DIST_DIR: z.string().min(1).default('.next'),
  UPLOAD_DIR: z.string().min(1).default('./storage/uploads'),
  CACHE_PREFIX: z
    .string()
    .regex(/^[a-z0-9_]+$/, 'CACHE_PREFIX must be lowercase [a-z0-9_]')
    .default('main'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

export class EnvError extends Error {
  constructor(public readonly issues: ReadonlyArray<{ path: string; message: string }>) {
    super(`Invalid environment: ${issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')}`);
    this.name = 'EnvError';
  }
}

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new EnvError(
      result.error.issues.map((issue) => ({ path: issue.path.join('.') || '(root)', message: issue.message })),
    );
  }
  return result.data;
}

export function cacheKey(env: Pick<Env, 'CACHE_PREFIX'>, key: string): string {
  return `${env.CACHE_PREFIX}:${key}`;
}

let cached: Env | undefined;

export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
