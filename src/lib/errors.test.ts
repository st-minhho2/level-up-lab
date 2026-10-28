import { describe, expect, it } from 'vitest';
import { NotImplementedError } from './errors';

describe('NotImplementedError', () => {
  it('names the stub in its message and sets the error name', () => {
    const error = new NotImplementedError('listTodos');

    expect(error.message).toBe('listTodos is not implemented');
    expect(error.name).toBe('NotImplementedError');
    expect(error).toBeInstanceOf(Error);
  });
});
