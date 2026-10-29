import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { fieldErrorsOf } from './action-result';

describe('fieldErrorsOf', () => {
  it('fieldErrorsOf puts the message of an issue without a path under form', () => {
    const parsed = z.string().min(1, 'Boom').safeParse('');
    if (parsed.success) throw new Error('expected a failed parse');

    const fieldErrors = fieldErrorsOf(parsed.error);

    expect(fieldErrors).toEqual({ form: ['Boom'] });
  });
});
