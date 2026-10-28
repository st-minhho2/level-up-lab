// Every Server Action returns this shape; errors travel as data, never as thrown exceptions.
export type ActionResult<T> = { ok: true; data: T } | { ok: false; fieldErrors: Record<string, string[]> };
