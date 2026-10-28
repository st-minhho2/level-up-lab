import { describe, expect, it } from 'vitest';
import { cacheKey, EnvError, parseEnv } from './env';

const valid = { DATABASE_URL: 'postgresql://postgres:postgres@localhost:5433/level_up_lab?schema=public' };

describe('parseEnv', () => {
  it('AC-4.1: applies defaults when only DATABASE_URL is set', () => {
    const env = parseEnv(valid);

    expect(env).toEqual({
      DATABASE_URL: valid.DATABASE_URL,
      PORT: 3000,
      NEXT_DIST_DIR: '.next',
      UPLOAD_DIR: './storage/uploads',
      CACHE_PREFIX: 'main',
      NODE_ENV: 'development',
    });
  });

  it('coerces PORT from a string and keeps the other overrides', () => {
    const env = parseEnv({
      ...valid,
      PORT: '3456',
      NEXT_DIST_DIR: '.next-wt',
      CACHE_PREFIX: 'wt_a1',
      NODE_ENV: 'test',
    });

    expect(env.PORT).toBe(3456);
    expect(env.NEXT_DIST_DIR).toBe('.next-wt');
    expect(env.CACHE_PREFIX).toBe('wt_a1');
    expect(env.NODE_ENV).toBe('test');
  });

  it('throws EnvError naming the missing DATABASE_URL', () => {
    expect(() => parseEnv({})).toThrow(EnvError);
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
  });

  it('rejects a non-postgres DATABASE_URL with the refine message', () => {
    let caught: unknown;
    try {
      parseEnv({ DATABASE_URL: 'mysql://root@localhost:3306/db' });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(EnvError);
    expect((caught as EnvError).issues).toEqual([
      { path: 'DATABASE_URL', message: 'DATABASE_URL must be a postgresql:// URL' },
    ]);
    expect((caught as EnvError).name).toBe('EnvError');
  });

  it.each([
    ['0', 'too small'],
    ['65536', 'too large'],
    ['80.5', 'not an integer'],
  ])('rejects PORT=%s (%s)', (port) => {
    expect(() => parseEnv({ ...valid, PORT: port })).toThrow(/PORT/);
  });

  it('rejects an uppercase or dashed CACHE_PREFIX', () => {
    expect(() => parseEnv({ ...valid, CACHE_PREFIX: 'Main-1' })).toThrow('CACHE_PREFIX must be lowercase [a-z0-9_]');
  });

  it('AC-4.2: reports every issue in one message, joined by "; "', () => {
    expect(() => parseEnv({ ...valid, PORT: '0', CACHE_PREFIX: 'X' })).toThrow(
      /^Invalid environment: PORT: .*; CACHE_PREFIX: /,
    );
  });
});

describe('cacheKey', () => {
  it('prefixes the key with CACHE_PREFIX and a colon', () => {
    expect(cacheKey({ CACHE_PREFIX: 'wt_feat_1' }, 'todos:list')).toBe('wt_feat_1:todos:list');
  });
});
