'use client';

// §9 ClearCompletedButton (B1.3). Skeleton: throws on render so the red tests fail on behavior.
import type { ReactNode } from 'react';
import { NotImplementedError } from '@/lib/errors';

export function ClearCompletedButton({ disabled }: { readonly disabled: boolean }): ReactNode {
  throw new NotImplementedError(`ClearCompletedButton(disabled=${String(disabled)})`);
}
