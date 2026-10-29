// §7 ActionResult shape; §10 the message of a failed mutation.
import type { ZodError } from 'zod';

// Every Server Action returns this shape; errors travel as data, never as thrown exceptions.
export type ActionResult<T> = { ok: true; data: T } | { ok: false; fieldErrors: Record<string, string[]> };

// §10: the one text every mutating action reports, on the `form` key, when its lib call fails for a reason other
// than a missing todo id.
export const MUTATION_FAILED_MESSAGE = 'Could not save, try again' as const;

export function failure(field: string, message: string): ActionResult<never> {
  return { ok: false, fieldErrors: { [field]: [message] } };
}

export function fieldErrorsOf(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const field = issue.path.map(String).join('.') || 'form';
    fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
  }
  return fieldErrors;
}
