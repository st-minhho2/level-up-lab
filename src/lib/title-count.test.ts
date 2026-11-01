// §18 the new-todo title counter (B3.2).
import { describe, expect, it } from 'vitest';
import { titleCharacterCount, titleCounterText } from './title-count';
import { createTodoSchema } from './todo-schema';

function repeat(text: string, times: number): string {
  return text.repeat(times);
}

function spaces(times: number): string {
  return repeat(' ', times);
}

describe('titleCharacterCount', () => {
  it('AC-18.1: counts 0, 8, 0, 3, 1, 200, 195, 200, 201, 2, 1, 2 for the twelve values, never throwing and never clamping', () => {
    // Escapes, not literals, so the code units under test cannot be changed by an editor's normalization:
    // U+1F600 is a surrogate pair (2), U+0130 is one code unit (1), 'e' + U+0301 is a base and a combining mark (2).
    const values: readonly string[] = [
      '',
      'Buy milk',
      '   ',
      '  a b  ',
      '\t\n a  ',
      repeat('x', 200),
      spaces(5) + repeat('x', 195),
      spaces(5) + repeat('x', 200) + spaces(5),
      repeat('x', 201),
      '\u{1F600}',
      'İ',
      'é',
    ];

    const counts = values.map((value) => titleCharacterCount(value));

    expect(counts).toEqual([0, 8, 0, 3, 1, 200, 195, 200, 201, 2, 1, 2]);
  });
});

describe('titleCounterText', () => {
  it("AC-18.2: reads '0 / 200', '8 / 200', '1 / 200', '200 / 200', '201 / 200', and the §5 schema accepts exactly the titles counted 1..200", () => {
    const texts: readonly string[] = ['', 'Buy milk', ' x ', repeat('x', 200), repeat('x', 201)];
    const titles: readonly string[] = ['   ', repeat('x', 200), ' ' + repeat('x', 200) + ' ', repeat('x', 201)];

    const shown = texts.map((value) => titleCounterText(value));
    const judged = titles.map((title) => createTodoSchema.safeParse({ title }).success);
    const counted = titles.map((title) => titleCharacterCount(title) >= 1 && titleCharacterCount(title) <= 200);

    expect(shown).toEqual(['0 / 200', '8 / 200', '1 / 200', '200 / 200', '201 / 200']);
    expect(judged).toEqual([false, true, true, false]);
    expect(counted).toEqual(judged);
  });
});
