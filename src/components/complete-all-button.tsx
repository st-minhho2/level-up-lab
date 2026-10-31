'use client';

// §14 CompleteAllButton; §10 the message of a failed mark-all, directly after the button. Skeleton: the body is
// written by the green commit.
import type { ReactNode } from 'react';
import { NotImplementedError } from '@/lib/errors';

export function CompleteAllButton({ disabled }: { readonly disabled: boolean }): ReactNode {
  throw new NotImplementedError(`CompleteAllButton(${String(disabled)})`);
}
