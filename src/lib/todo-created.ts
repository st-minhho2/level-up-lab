// §20 created date: a todo's creation day as the UTC 'YYYY-MM-DD' of its createdAt, and its row wording.
// Pure: no Prisma, no server-only, so a client component may import it.

export const CREATED_PREFIX = 'Created ';

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0');
}

// UTC getters only (REQ-20.1): the server render and the browser's first render must agree without a clock or a zone.
export function createdDayOf(createdAt: Date): string {
  return `${pad(createdAt.getUTCFullYear(), 4)}-${pad(createdAt.getUTCMonth() + 1, 2)}-${pad(createdAt.getUTCDate(), 2)}`;
}

export function createdLabel(createdAt: Date): string {
  return `${CREATED_PREFIX}${createdDayOf(createdAt)}`;
}
